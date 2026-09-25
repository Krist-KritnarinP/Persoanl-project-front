// Geocoding ฟรี ไม่ต้องใช้ API key — เร็วด้วย 3 ชั้น:
// 1. พิกัดใน DB (เร็วสุด — เปิดครั้งต่อไปแทบจะทันที)
// 2. cache ใน localStorage
// 3. Photon (komoot, ขนานได้) -> Nominatim (OSM, 1 req/s) เป็น fallback
// Attribution: © OpenStreetMap contributors

import { mainApi } from "@/api/mainApi";

const CACHE_KEY = "geocode-cache-v1";
const NOMINATIM_DELAY = 1100;
const PHOTON_CONCURRENCY = 5;

function loadCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveCache(cache) {
  try {
    const keys = Object.keys(cache).slice(-500); // กันบวม เก็บ 500 ล่าสุด
    const trimmed = {};
    keys.forEach((k) => (trimmed[k] = cache[k]));
    localStorage.setItem(CACHE_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore quota errors
  }
}

const normKey = (name, hint) => `${String(name || "").trim()}||${String(hint || "").trim()}`.toLowerCase();

// --- Photon: เร็ว + ยิงขนานได้ (CORS เปิด, ไม่ต้องใช้ key) ---
async function photonLookup(text) {
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(text)}&limit=1&lang=en`;
  const r = await fetch(url, { headers: { Accept: "application/json" } });
  if (!r.ok) throw new Error(`Photon failed: ${r.status}`);
  const j = await r.json();
  const f = j?.features?.[0];
  if (!f?.geometry?.coordinates) return null;
  const [lng, lat] = f.geometry.coordinates;
  const p = f.properties || {};
  return {
    lat: Number(lat),
    lng: Number(lng),
    label: [p.name, p.city, p.state, p.country].filter(Boolean).join(", "),
  };
}

// --- Nominatim: แม่น แต่ต้องต่อคิว 1 req/s (fallback อย่างเดียว) ---
let queue = Promise.resolve();
function nominatimFetch(url) {
  const run = queue.then(
    () =>
      new Promise((resolve) => setTimeout(resolve, NOMINATIM_DELAY)).then(() =>
        fetch(url, { headers: { Accept: "application/json" } }).then((r) => {
          if (!r.ok) throw new Error(`Nominatim failed: ${r.status}`);
          return r.json();
        })
      )
  );
  queue = run.catch(() => {});
  return run;
}

async function nominatimLookup(text) {
  const url =
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=th,en` +
    `&q=${encodeURIComponent(text)}`;
  const res = await nominatimFetch(url);
  if (!res?.length) return null;
  return { lat: Number(res[0].lat), lng: Number(res[0].lon), label: res[0].display_name };
}

// ค้นหาที่เดียว (ใช้ใน ActivityModal): cache -> Photon -> Nominatim
export async function geocodePlace(name, hint = "") {
  const q = String(name || "").trim();
  if (!q) return null;
  const cache = loadCache();
  const key = normKey(q, hint);
  if (cache[key]) return cache[key];

  const queries = hint ? [`${q}, ${hint}`, q] : [q];
  for (const text of queries) {
    try {
      const hit = await photonLookup(text);
      if (hit) {
        cache[key] = hit;
        saveCache(cache);
        return hit;
      }
    } catch {
      // ตกไปลองตัวถัดไป
    }
  }
  // Photon หาไม่เจอ -> Nominatim (ยิงตรง ไม่ต้องรอคิว เพราะเป็นการกด manual ครั้งเดียว)
  for (const text of queries) {
    try {
      const url =
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=th,en` +
        `&q=${encodeURIComponent(text)}`;
      const r = await fetch(url, { headers: { Accept: "application/json" } });
      if (!r.ok) continue;
      const res = await r.json();
      if (res?.length) {
        const hit = { lat: Number(res[0].lat), lng: Number(res[0].lon), label: res[0].display_name };
        cache[key] = hit;
        saveCache(cache);
        return hit;
      }
    } catch {
      // ignore
    }
  }
  return null;
}

// รันงานแบบขนานจำกัดจำนวน (worker pool)
async function mapPool(items, concurrency, fn) {
  const results = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      try {
        results[idx] = await fn(items[idx], idx);
      } catch {
        results[idx] = null;
      }
    }
  });
  await Promise.all(workers);
  return results;
}

const hasDbCoords = (act) =>
  act.latitude != null && act.longitude != null && !isNaN(Number(act.latitude)) && !isNaN(Number(act.longitude));

// Resolve activities -> [{...activity, lat, lng, geoLabel}]
// - onProgress(snapshot) ถูกเรียกทุกครั้งที่มีจุด resolve เพิ่ม (เอาไป setState ได้เลย หมุดค่อยๆ ขึ้น)
// - dedupe ชื่อซ้ำ (เช่น โรงแรมเดิมนอน 2 คืน) ให้เหลือ 1 request
export async function resolveActivityCoords(activities, destination = "", onProgress) {
  const list = activities || [];
  const cache = loadCache();
  const out = list.map((act) => {
    if (hasDbCoords(act)) {
      return { ...act, lat: Number(act.latitude), lng: Number(act.longitude), geoLabel: null };
    }
    return { ...act, lat: null, lng: null, geoLabel: null };
  });

  const emit = () => {
    if (onProgress) onProgress(out.map((o) => ({ ...o })));
  };

  // รวมคิวงานที่ไม่ซ้ำ (key เดียวกันยิงครั้งเดียว)
  const jobByKey = new Map();
  out.forEach((item, idx) => {
    if (item.lat != null || !item.locationName) return;
    const key = normKey(item.locationName, destination);
    const cached = cache[key];
    if (cached) {
      item.lat = cached.lat;
      item.lng = cached.lng;
      item.geoLabel = cached.label;
      return;
    }
    if (!jobByKey.has(key)) jobByKey.set(key, { key, name: item.locationName.trim(), idxs: [] });
    jobByKey.get(key).idxs.push(idx);
  });
  emit(); // วาดจุดที่ได้จาก DB/cache ก่อนทันที ไม่ต้องรอ network

  const jobs = [...jobByKey.values()];
  if (jobs.length === 0) return out;

  const applyHit = (job, hit) => {
    if (!hit) return false;
    cache[job.key] = hit;
    job.idxs.forEach((idx) => {
      out[idx].lat = hit.lat;
      out[idx].lng = hit.lng;
      out[idx].geoLabel = hit.label;
    });
    return true;
  };

  // ด่าน 1: Photon ขนาน 5 ตัว (เร็ว — ปกติจบใน 1-3 วิ)
  const photonHits = await mapPool(jobs, PHOTON_CONCURRENCY, async (job) => {
    const queries = destination ? [`${job.name}, ${destination}`, job.name] : [job.name];
    for (const text of queries) {
      try {
        const hit = await photonLookup(text);
        if (hit) return hit;
      } catch {
        // ลอง query ถัดไป
      }
    }
    return null;
  });
  let needSave = false;
  photonHits.forEach((hit, i) => {
    if (applyHit(jobs[i], hit)) {
      needSave = true;
      emit();
    }
  });
  if (needSave) saveCache(cache);

  // ด่าน 2: ตัวที่ Photon หาไม่เจอ -> Nominatim ต่อคิว 1 req/s (มักเหลือ 0-2 จุด)
  const leftovers = jobs.filter((job, i) => !photonHits[i]);
  for (const job of leftovers) {
    const queries = destination ? [`${job.name}, ${destination}`, job.name] : [job.name];
    for (const text of queries) {
      try {
        const hit = await nominatimLookup(text);
        if (hit && applyHit(job, hit)) {
          saveCache(cache);
          emit();
          break;
        }
      } catch {
        // ลอง query ถัดไป
      }
    }
  }
  return out;
}

// เซฟพิกัดที่หาได้กลับลง DB (fire-and-forget) — เปิดครั้งต่อไปใช้พิกัด DB ทันที ไม่ต้อง geocode ใหม่
// เรียกเฉพาะหน้าของเจ้าของทริป (ห้ามเรียกในหน้า share)
export function persistCoords(resolved) {
  try {
    const targets = (resolved || []).filter(
      (p) => p.lat != null && p.lng != null && !hasDbCoords(p) && p.id != null
    );
    targets.forEach((p) => {
      mainApi.put(`/activities/${p.id}`, { latitude: p.lat, longitude: p.lng }).catch(() => {});
    });
  } catch {
    // ignore
  }
}
