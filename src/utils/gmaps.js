// Helper สร้างลิงก์ Google Maps (เปิดบน PC / สแกน QR บนมือถือ)

export function gmapsSearchUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function gmapsDirUrl(points) {
  // points: array ของ string (ชื่อสถานที่) หรือ {lat,lng}
  const parts = (points || [])
    .map((p) => {
      if (p == null) return null;
      if (typeof p === "string") return encodeURIComponent(p);
      if (typeof p.lat === "number" && typeof p.lng === "number")
        return `${p.lat},${p.lng}`;
      return null;
    })
    .filter(Boolean);
  if (parts.length === 0) return null;
  if (parts.length === 1)
    return `https://www.google.com/maps/dir/?api=1&destination=${parts[0]}`;
  return `https://www.google.com/maps/dir/${parts.join("/")}`;
}

// เลือกจุดหมายของ QR: ใช้พิกัดถ้ามี (แม่นสุด) ไม่งั้นใช้ชื่อสถานที่
export function pointOf(act) {
  if (act?.lat != null && act?.lng != null)
    return { lat: act.lat, lng: act.lng };
  if (act?.latitude != null && act?.longitude != null)
    return { lat: Number(act.latitude), lng: Number(act.longitude) };
  return act?.locationName || "";
}

// ลิงก์ Google Maps สำหรับกิจกรรมเดี่ยว: พิกัดพินแม่นยำ หรือค้นหาด้วยชื่อสถานที่
export function gmapsActivityUrl(act, destination = "") {
  if (!act) return "https://www.google.com/maps";
  const lat =
    act.latitude != null
      ? Number(act.latitude)
      : act.lat != null
        ? Number(act.lat)
        : null;
  const lng =
    act.longitude != null
      ? Number(act.longitude)
      : act.lng != null
        ? Number(act.lng)
        : null;

  if (
    lat != null &&
    lng != null &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    (lat !== 0 || lng !== 0)
  ) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }

  const loc = act.locationName?.trim();
  const dest = destination?.trim();
  const query = [loc, dest].filter(Boolean).join(" ");
  return gmapsSearchUrl(query || "Google Maps");
}
