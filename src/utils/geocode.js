// DB/cache first. Requests are shared across views, bounded and cancellable.
// Public Nominatim is intentionally not used for automatic bulk lookup.
const CACHE_KEY = "geocode-cache-v2";
const inflight = new Map();
let cache;
let saveTimer;
const MAX_CACHE = 500;
const POSITIVE_TTL = 30 * 86400000;
const NEGATIVE_TTL = 5 * 60000;
export const validCoords = (lat, lng) =>
  lat !== null &&
  lat !== undefined &&
  lat !== "" &&
  lng !== null &&
  lng !== undefined &&
  lng !== "" &&
  Number.isFinite(Number(lat)) &&
  Number.isFinite(Number(lng)) &&
  Math.abs(Number(lat)) <= 90 &&
  Math.abs(Number(lng)) <= 180;
const keyOf = (name, hint) =>
  JSON.stringify([
    String(name || "")
      .trim()
      .toLowerCase(),
    String(hint || "")
      .trim()
      .toLowerCase(),
  ]);
function getCache() {
  if (!cache) {
    try {
      cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    } catch {
      cache = {};
    }
    if (!cache || typeof cache !== "object" || Array.isArray(cache)) cache = {};
  }
  return cache;
}
function cached(key) {
  const entry = getCache()[key];
  if (!entry || entry.expires <= Date.now()) return undefined;
  return entry.hit === null || validCoords(entry.hit?.lat, entry.hit?.lng)
    ? entry.hit
    : undefined;
}
function remember(key, hit) {
  getCache()[key] = {
    hit,
    expires: Date.now() + (hit ? POSITIVE_TTL : NEGATIVE_TTL),
  };
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const entries = Object.entries(getCache())
      .filter(([, v]) => v.expires > Date.now())
      .slice(-MAX_CACHE);
    cache = Object.fromEntries(entries);
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch {
      /* storage unavailable */
    }
  }, 200);
}
async function lookup(text, signal) {
  const endpoint =
    import.meta.env?.VITE_GEOCODE_URL || "https://photon.komoot.io/api/";
  const url = new URL(endpoint);
  url.search = new URLSearchParams({ q: text, limit: "1", lang: "en" });
  const response = await fetch(url, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Geocoder unavailable");
  const feature = (await response.json())?.features?.[0];
  const [lng, lat] = feature?.geometry?.coordinates || [];
  if (!validCoords(lat, lng)) return null;
  const props = feature.properties || {};
  return {
    lat: Number(lat),
    lng: Number(lng),
    label: [props.name, props.city, props.country].filter(Boolean).join(", "),
  };
}
// A shared request survives while another mounted view still needs it.
export function geocodePlace(name, hint = "", { signal } = {}) {
  if (signal?.aborted) return Promise.reject(signal.reason);
  const q = String(name || "").trim();
  if (!q) return Promise.resolve(null);
  const key = keyOf(q, hint);
  const hit = cached(key);
  if (hit !== undefined) return Promise.resolve(hit);
  let job = inflight.get(key);
  if (!job || job.controller.signal.aborted) {
    const controller = new AbortController();
    job = { controller, users: 0 };
    const timeout = setTimeout(() => controller.abort(), 6000);
    job.promise = (async () => {
      try {
        let result = await lookup(
          hint ? `${q}, ${hint}` : q,
          controller.signal,
        );
        if (!result && hint) result = await lookup(q, controller.signal);
        remember(key, result);
        return result;
      } catch {
        if (!controller.signal.aborted) remember(key, null);
        return null;
      } finally {
        clearTimeout(timeout);
        if (inflight.get(key) === job) inflight.delete(key);
      }
    })();
    inflight.set(key, job);
  }
  job.users++;
  return new Promise((resolve, reject) => {
    let finished = false;
    const finish = (fn, value) => {
      if (finished) return;
      finished = true;
      signal?.removeEventListener("abort", abort);
      if (--job.users === 0) job.controller.abort();
      fn(value);
    };
    const abort = () =>
      finish(
        reject,
        signal.reason || new DOMException("Aborted", "AbortError"),
      );
    signal?.addEventListener("abort", abort, { once: true });
    job.promise.then(
      (value) => finish(resolve, value),
      (error) => finish(reject, error),
    );
  });
}
export async function resolveActivityCoords(
  activities,
  destination = "",
  onProgress,
  { signal } = {},
) {
  signal = AbortSignal.any([
    ...(signal ? [signal] : []),
    AbortSignal.timeout(15000),
  ]);
  const out = (activities || []).map((a) => {
    const hit = validCoords(a.latitude, a.longitude)
      ? { lat: Number(a.latitude), lng: Number(a.longitude) }
      : cached(keyOf(a.locationName, destination));
    return {
      ...a,
      lat: hit?.lat ?? null,
      lng: hit?.lng ?? null,
      geoLabel: hit?.label ?? null,
    };
  });
  const emit = () => {
    if (!signal?.aborted) onProgress?.(out.slice());
  };
  emit();
  const jobs = new Map();
  out.forEach((a, i) => {
    if (a.lat !== null || !a.locationName) return;
    const key = keyOf(a.locationName, destination);
    if (!jobs.has(key)) jobs.set(key, []);
    jobs.get(key).push(i);
  });
  const pending = [...jobs.values()];
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(2, pending.length) }, async () => {
      while (!signal?.aborted && next < pending.length) {
        const indices = pending[next++];
        try {
          const hit = await geocodePlace(
            out[indices[0]].locationName,
            destination,
            { signal },
          );
          if (hit && !signal?.aborted) {
            indices.forEach((i) => {
              out[i] = {
                ...out[i],
                lat: hit.lat,
                lng: hit.lng,
                geoLabel: hit.label,
              };
            });
            emit(); // Emit inside the worker, never wait for the slowest place.
          }
        } catch {
          /* cancellation */
        }
      }
    }),
  );
  return out;
}
