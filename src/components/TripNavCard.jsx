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
        <p className="text-sm leading-relaxed text-base-content/60 break-words">{label}</p>
      )}

      {dirUrl ? (
        <div className="space-y-3 min-w-0">
          <div className="flex min-w-0 flex-col items-center gap-3 rounded-xl border border-base-content/10 bg-base-100/60 p-3">
            <div className="rounded-xl bg-white p-3 shadow-sm">
              <NavigationQr value={dirUrl} size={112} />
            </div>
            <p className="min-w-0 text-center text-xs leading-relaxed text-base-content/70">
              <FiSmartphone className="mr-1 inline text-primary" />{t("map.qrHint")}
            </p>
          </div>
          <div className="grid min-w-0 gap-2">
            <a href={dirUrl} target="_blank" rel="noreferrer"
              className="btn btn-primary h-auto min-h-11 w-full gap-2 px-3 py-2 text-sm leading-relaxed">
              <FiExternalLink className="shrink-0" /><span className="min-w-0">{t("map.openGmaps")}</span>
            </a>
            {mapHref && (
              <Link to={mapHref} className="btn btn-ghost h-auto min-h-11 w-full gap-2 border border-base-content/10 px-3 py-2 text-sm leading-relaxed">
                <FiMaximize2 className="shrink-0" /><span className="min-w-0">{t("map.customRoute")}</span>
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
