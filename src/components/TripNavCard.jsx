import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { FiSmartphone, FiExternalLink, FiNavigation, FiMaximize2 } from "react-icons/fi";
import { useLang } from "@/i18n";
import { gmapsDirUrl, pointOf } from "@/utils/gmaps";

// การ์ดนำทางกล่องเล็กใต้สภาพอากาศ: QR เส้นทางทั้งวัน (default) + ปุ่มไปหน้าแผนที่ใหญ่เพื่อเลือกจุด
export default function TripNavCard({ points = [], label, mapHref = null }) {
  const { t } = useLang();

  const pinned = useMemo(() => (points || []).filter((p) => p.locationName), [points]);

  const dirUrl = useMemo(() => {
    if (pinned.length === 0) return null;
    // จำกัดไม่เกิน 10 จุด (โควตา Google Maps Directions URL)
    return gmapsDirUrl(pinned.slice(0, 10).map(pointOf));
  }, [pinned]);

  if (pinned.length === 0) return null;

  return (
    <div className="glass glass-card p-4 md:p-5 rounded-3xl space-y-3">
      <h3 className="font-bold flex items-center gap-2">
        <FiNavigation className="text-primary" /> {t("map.navTitle")}
      </h3>
      {label && <p className="text-sm text-base-content/60 -mt-2 truncate">{label}</p>}

      {dirUrl ? (
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-2xl shrink-0">
            <QRCodeSVG value={dirUrl} size={88} />
          </div>
          <div className="min-w-0 space-y-1.5">
            <p className="text-xs text-base-content/70 flex items-start gap-1.5 leading-relaxed">
              <FiSmartphone className="mt-0.5 shrink-0 text-primary" />
              {t("map.qrHint")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              <a href={dirUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-xs rounded-full gap-1">
                <FiExternalLink /> {t("map.openGmaps")}
              </a>
              {mapHref && (
                <Link to={mapHref} className="btn btn-ghost glass btn-xs rounded-full gap-1">
                  <FiMaximize2 /> {t("map.customRoute")}
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
