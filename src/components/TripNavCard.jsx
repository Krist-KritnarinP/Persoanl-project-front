import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import NavigationQr from "@/components/NavigationQr";
import {
  FiSmartphone,
  FiExternalLink,
  FiNavigation,
  FiMaximize2,
} from "react-icons/fi";
import { useLang } from "@/i18n";
import { gmapsDirUrl, pointOf } from "@/utils/gmaps";

// การ์ดนำทางกล่องเล็กใต้สภาพอากาศ: QR เส้นทางทั้งวัน (default) + ปุ่มไปหน้าแผนที่ใหญ่เพื่อเลือกจุด
export default function TripNavCard({ points = [], label, mapHref = null }) {
  const { t } = useLang();

  const pinned = useMemo(
    () => (points || []).filter((p) => p.locationName),
    [points],
  );

  const dirUrl = useMemo(() => {
    if (pinned.length === 0) return null;
    // จำกัดไม่เกิน 10 จุด (โควตา Google Maps Directions URL)
    return gmapsDirUrl(pinned.slice(0, 10).map(pointOf));
  }, [pinned]);

  if (pinned.length === 0) return null;

  return (
    <div className="glass glass-card trip-layout-card box-border w-full min-w-0 p-3 md:p-4 rounded-2xl space-y-3">
      <h3 className="font-bold flex items-center gap-2 min-w-0">
        <FiNavigation className="text-primary shrink-0" /> <span className="min-w-0 break-words">{t("map.navTitle")}</span>
      </h3>
      {label && (
        <p className="text-sm text-base-content/60 -mt-2 truncate">{label}</p>
      )}

      {dirUrl ? (
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="bg-white p-2 rounded-xl shrink-0">
            <NavigationQr value={dirUrl} size={88} />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="min-w-0 text-xs text-base-content/70 flex items-start gap-1.5 leading-relaxed">
              <FiSmartphone className="mt-0.5 shrink-0 text-primary" />
              <span className="min-w-0 break-words">{t("map.qrHint")}</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              <a
                href={dirUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary btn-xs h-auto min-h-7 min-w-0 max-w-full whitespace-normal rounded-lg px-2 py-1 text-left leading-tight gap-1"
              >
                <FiExternalLink className="shrink-0" /> <span className="min-w-0 break-words">{t("map.openGmaps")}</span>
              </a>
              {mapHref && (
                <Link
                  to={mapHref}
                  className="btn btn-ghost glass btn-xs h-auto min-h-7 min-w-0 max-w-full whitespace-normal rounded-lg px-2 py-1 text-left leading-tight gap-1"
                >
                  <FiMaximize2 className="shrink-0" /> <span className="min-w-0 break-words">{t("map.customRoute")}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
