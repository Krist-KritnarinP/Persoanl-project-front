import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  LayersControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  FiMaximize2,
  FiNavigation,
  FiMapPin,
  FiArrowLeft,
} from "react-icons/fi";
import { useLang } from "@/i18n";
import { gmapsSearchUrl } from "@/utils/gmaps";

export const TYPE_COLORS = {
  ATTRACTION: "#7c3aed",
  RESTAURANT: "#b45309",
  ACCOMMODATION: "#2563eb",
  TRANSPORT: "#0369a1",
};

const iconCache = new Map();
function numberedIcon(n, type, dimmed = false) {
  const key = `${n}/${type}/${dimmed}`;
  if (iconCache.has(key)) return iconCache.get(key);
  const color = TYPE_COLORS[type] || "#0b7a52";
  const icon = L.divIcon({
    className: "trip-pin",
    html: `<div style="background:${color};color:#fff;width:28px;height:28px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35);${dimmed ? "opacity:.35;filter:grayscale(1);" : ""}">${n}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
  if (iconCache.size > 1000) iconCache.clear();
  iconCache.set(key, icon);
  return icon;
}

function FitBounds({ points }) {
  const map = useMap();
  const interacted = useRef(false);
  useEffect(() => {
    const stop = () => {
      interacted.current = true;
    };
    const container = map.getContainer();
    container.addEventListener("pointerdown", stop);
    container.addEventListener("wheel", stop, { passive: true });
    return () => {
      container.removeEventListener("pointerdown", stop);
      container.removeEventListener("wheel", stop);
    };
  }, [map]);
  const key = JSON.stringify((points || []).map((p) => [p.lat, p.lng]));
  useEffect(() => {
    const fit = () => {
      map.invalidateSize({ animate: false, pan: false });
      if (!points?.length || interacted.current) return;
      if (points.length === 1) {
        map.setView([points[0].lat, points[0].lng], 13, { animate: false });
      } else {
        map.fitBounds(
          points.map((p) => [p.lat, p.lng]),
          { padding: [32, 32], animate: false },
        );
      }
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(map.getContainer());
    return () => observer.disconnect();
    // Coordinate key intentionally ignores unrelated activity metadata.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);
  return null;
}

export function MapBody({ points, typeLabel, height, dimmedIds, route }) {
  const line = (route || points).map((p) => [p.lat, p.lng]);
  return (
    <MapContainer
      center={
        points.length > 0 ? [points[0].lat, points[0].lng] : [13.7563, 100.5018]
      }
      zoom={points.length > 0 ? 11 : 5}
      style={{ height, width: "100%", borderRadius: "1rem", zIndex: 0 }}
      zoomAnimation={false}
      fadeAnimation={false}
      markerZoomAnimation={false}
      scrollWheelZoom
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="2D · OpenStreetMap">
          <TileLayer
            updateWhenIdle
            updateWhenZooming={false}
            keepBuffer={1}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Satellite · Esri">
          <TileLayer
            updateWhenIdle
            updateWhenZooming={false}
            keepBuffer={1}
            attribution="Imagery &copy; Esri, Maxar, Earthstar Geographics"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        </LayersControl.BaseLayer>
      </LayersControl>
      <FitBounds points={points} />
      {line.length > 1 && (
        <Polyline positions={line} pathOptions={{ weight: 3, opacity: 0.7 }} />
      )}
      {points.map((p, i) => (
        <Marker
          key={p.id ?? `${p.lat}-${p.lng}-${i}`}
          position={[p.lat, p.lng]}
          icon={numberedIcon(i + 1, p.activityType, dimmedIds?.has(p.id))}
        >
          <Popup>
            <div style={{ minWidth: 180 }}>
              <b>
                {i + 1}. {p.locationName}
              </b>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                {typeLabel(p.activityType)}
                {p.dayCount != null ? ` · Day ${p.dayCount}` : ""}
              </div>
              {p.description && (
                <div
                  style={{ fontSize: 12, marginTop: 4 }}
                  className="line-clamp-3"
                >
                  {p.description}
                </div>
              )}
              <a
                href={gmapsSearchUrl(`${p.lat},${p.lng} (${p.locationName})`)}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#2563eb",
                }}
              >
                Open in Google Maps →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

// การ์ดแผนที่กล่องเล็ก (เช่น ใต้สภาพอากาศ) — ปุ่มขยายลิงก์ไปหน้าแผนที่เต็มแทน modal
export default function TripMap({
  points = [],
  title,
  subtitle,
  loading = false,
  height = 320,
  compact = false,
  expandHref = null,
}) {
  const { t } = useLang();
  const [full, setFull] = useState(false);

  // ปุ่ม Esc ปิด overlay (มือถือ/คีย์บอร์ด)
  useEffect(() => {
    if (!full) return;
    const onKey = (e) => {
      if (e.key === "Escape") setFull(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [full]);

  const typeLabel = (type) =>
    ({
      ATTRACTION: t("act.attr"),
      RESTAURANT: t("act.rest"),
      ACCOMMODATION: t("act.accom"),
      TRANSPORT: t("act.transp"),
    })[type] ||
    type ||
    "-";

  const pinned = useMemo(
    () => (points || []).filter((p) => p.lat != null && p.lng != null),
    [points],
  );

  const expandBtnClass =
    "btn btn-sm btn-ghost glass h-auto min-h-8 max-w-[45%] whitespace-normal rounded-lg px-2 py-1 leading-tight gap-1 shrink-0";

  return (
    <section className="glass glass-card trip-layout-card box-border w-full min-w-0 p-3 md:p-4 rounded-2xl space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
            <FiMapPin className="text-primary shrink-0" />
            <span className="truncate">{title || t("map.title")}</span>
          </h3>
          {subtitle && (
            <p className="text-sm text-base-content/60 mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
        {pinned.length > 0 &&
          (expandHref ? (
            <Link to={expandHref} className={expandBtnClass}>
              <FiMaximize2 /> {t("map.full")}
            </Link>
          ) : (
            <button onClick={() => setFull(true)} className={expandBtnClass}>
              <FiMaximize2 /> {t("map.full")}
            </button>
          ))}
      </div>

      {pinned.length === 0 && loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-base-content/60">
          <span className="loading loading-spinner loading-sm text-primary"></span>
          {t("map.locating")}
        </div>
      ) : pinned.length === 0 ? (
        <div className="text-center py-8 text-sm text-base-content/60 glass rounded-2xl">
          <FiNavigation className="mx-auto text-2xl mb-2 opacity-50" />
          {t("map.empty")}
        </div>
      ) : (
        <>
          <MapBody points={pinned} typeLabel={typeLabel} height={height} />
          {loading && (
            <p className="text-xs text-base-content/50 flex items-center gap-1.5">
              <span className="loading loading-spinner loading-xs text-primary"></span>
              {t("map.locating")} ({pinned.length})
            </p>
          )}
          {!compact && (
            <ol className="grid sm:grid-cols-2 gap-1.5 text-sm max-h-36 overflow-y-auto custom-scrollbar pr-1">
              {pinned.map((p, i) => (
                <li
                  key={p.id ?? i}
                  className="flex items-center gap-2 truncate bg-white/5 rounded-xl px-2.5 py-1.5"
                >
                  <span
                    className="w-5 h-5 rounded-full text-[11px] font-extrabold text-white flex items-center justify-center shrink-0"
                    style={{
                      background: TYPE_COLORS[p.activityType] || "#10b981",
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className="truncate">{p.locationName}</span>
                </li>
              ))}
            </ol>
          )}
          <p className="text-[11px] text-base-content/40">
            © OpenStreetMap contributors · Esri World Imagery · {t("map.note")}
          </p>
        </>
      )}

      {!loading && points.length > pinned.length && (
        <p role="status" className="text-sm text-base-content/70">
          {t("map.unresolved")}
        </p>
      )}

      {full &&
        !expandHref &&
        pinned.length > 0 &&
        createPortal(
          <div
            className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm p-3 md:p-6"
            onClick={() => setFull(false)}
          >
            <div
              className="bg-base-100 rounded-3xl p-3 md:p-4 h-full flex flex-col gap-2 max-w-6xl mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-2 px-1">
                <b className="truncate">{title || t("map.title")}</b>
                <button
                  onClick={() => setFull(false)}
                  className="btn btn-primary rounded-full gap-1.5 shrink-0"
                >
                  <FiArrowLeft /> {t("common.back")}
                </button>
              </div>
              <div className="flex-1 min-h-0">
                <MapBody points={pinned} typeLabel={typeLabel} height="100%" />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
