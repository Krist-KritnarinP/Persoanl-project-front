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
      if (typeof p.lat === "number" && typeof p.lng === "number") return `${p.lat},${p.lng}`;
      return null;
    })
    .filter(Boolean);
  if (parts.length === 0) return null;
  if (parts.length === 1) return `https://www.google.com/maps/dir/?api=1&destination=${parts[0]}`;
  return `https://www.google.com/maps/dir/${parts.join("/")}`;
}

// เลือกจุดหมายของ QR: ใช้พิกัดถ้ามี (แม่นสุด) ไม่งั้นใช้ชื่อสถานที่
export function pointOf(act) {
  if (act?.lat != null && act?.lng != null) return { lat: act.lat, lng: act.lng };
  if (act?.latitude != null && act?.longitude != null) return { lat: Number(act.latitude), lng: Number(act.longitude) };
  return act?.locationName || "";
}
