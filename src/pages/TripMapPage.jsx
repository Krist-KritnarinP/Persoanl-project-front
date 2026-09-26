import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  FiArrowLeft,
  FiFlag,
  FiCheck,
  FiPlus,
  FiSmartphone,
  FiExternalLink,
  FiMapPin,
} from "react-icons/fi";
import { useTripActivityStore } from "@/stores/tripActivityStore";
import { useLang } from "@/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { MapBody, TYPE_COLORS } from "@/components/TripMap";
import { useTripCoordinates } from "@/hooks/useTripCoordinates";
import { gmapsDirUrl, gmapsSearchUrl, pointOf } from "@/utils/gmaps";

// หน้าแผนที่เต็ม: เลือกจุดด้วย + ได้ (ไม่เลือก = default เส้นทางทั้งวัน) + QR/ปุ่มนำทางตามจุดที่เลือก
export default function TripMapPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { t, locale } = useLang();

  const trip = useTripActivityStore((s) => s.trip);
  const loading = useTripActivityStore((s) => s.loading);
  const fetchTripDetails = useTripActivityStore((s) => s.fetchTripDetails);

  const [selectedDayId, setSelectedDayId] = useState(null);
  const { geoPoints, geoLoading } = useTripCoordinates(trip?.id === Number(tripId) ? trip : null);
  const [picked, setPicked] = useState({}); // {activityId: true} — ติ๊กออก = ไม่รวมในเส้นทาง

  useEffect(() => {
    if (tripId) fetchTripDetails(tripId);
  }, [tripId, fetchTripDetails]);

  const activeDay = trip?.days?.find((d) => d.id === selectedDayId) || null;
  const dayPoints = useMemo(
    () => (activeDay ? geoPoints.filter((p) => p.dayId === activeDay.id) : geoPoints),
    [geoPoints, activeDay]
  );
  const pinned = useMemo(() => dayPoints.filter((p) => p.lat != null && p.lng != null), [dayPoints]);
  // จุดที่รวมในเส้นทาง = ที่ติ๊กไว้ (default ติ๊กทุกจุด)
  const routed = useMemo(() => pinned.filter((p) => picked[p.id] !== false), [pinned, picked]);
  const dimmedIds = useMemo(
    () => new Set(pinned.filter((p) => picked[p.id] === false).map((p) => p.id)),
    [pinned, picked]
  );

  const dirUrl = useMemo(
    () => (routed.length === 0 ? null : gmapsDirUrl(routed.slice(0, 10).map(pointOf))),
    [routed]
  );

  const formatDate = (s) => {
    if (!s) return "-";
    return new Date(s).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
  };

  const typeLabel = (type) =>
    ({ ATTRACTION: t("act.attr"), RESTAURANT: t("act.rest"), ACCOMMODATION: t("act.accom"), TRANSPORT: t("act.transp") }[type] ||
      type ||
      "-");

  const toggle = (id) => setPicked((prev) => ({ ...prev, [id]: prev[id] === false ? true : false }));
  const selectAll = () => {
    const next = {};
    pinned.forEach((p) => (next[p.id] = true));
    setPicked((prev) => ({ ...prev, ...next }));
  };
  const clearAll = () => {
    const next = {};
    pinned.forEach((p) => (next[p.id] = false));
    setPicked((prev) => ({ ...prev, ...next }));
  };

  const subtitle = activeDay ? `Day ${activeDay.dayCount} · ${formatDate(activeDay.dayDate)}` : t("day.overview");

  return (
    <div className="min-h-screen w-full px-4 md:px-8 py-4 space-y-4">
      <header className="navbar glass rounded-3xl md:rounded-full justify-between px-4 md:px-6 py-3 shadow-lg gap-2">
        <button
          onClick={() => navigate("/dashboard")}
          title="AI LHOUNG — กลับหน้า dashboard"
          className="flex items-center gap-2 min-w-0 cursor-pointer rounded-2xl"
        >
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden shrink-0">
            <img src="/image/MiniDog.PNG" alt="Minidog" className="w-full h-full object-cover" />
          </div>
          <span className="font-display text-2xl md:text-3xl tracking-wider bg-linear-to-r from-primary to-accent bg-clip-text text-transparent whitespace-nowrap">
            AI LHOUNG
          </span>
        </button>
        <LanguageSwitcher />
      </header>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={() => navigate(`/trips/${tripId}`)} className="btn btn-ghost glass gap-2 shrink-0">
            <FiArrowLeft /> {t("common.back")}
          </button>
        </div>
        <span className="text-sm font-semibold truncate">
          {trip?.tripName} · {t("map.title")}
        </span>
      </div>

      {/* แท็บวัน */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        <button
          onClick={() => setSelectedDayId(null)}
          className={`btn btn-sm rounded-2xl whitespace-nowrap shrink-0 ${!activeDay ? "btn-primary shadow-lg" : "btn-ghost glass"}`}
        >
          <FiFlag /> {t("day.overview")}
        </button>
        {trip?.days?.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelectedDayId(d.id)}
            className={`btn btn-sm rounded-2xl whitespace-nowrap shrink-0 ${activeDay?.id === d.id ? "btn-primary shadow-lg" : "btn-ghost glass"}`}
          >
            Day {d.dayCount}{d.dayDate && ` (${formatDate(d.dayDate)})`}
          </button>
        ))}
      </div>

      {loading && !trip ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* แผนที่ใหญ่ */}
          <div className="lg:col-span-8 glass glass-card p-3 md:p-4 rounded-3xl space-y-2">
            <p className="text-sm font-bold px-1 truncate">
              <FiMapPin className="inline text-primary mr-1" />
              {subtitle} · {routed.length}/{pinned.length} {t("map.stops")}
            </p>
            {geoLoading && pinned.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-base-content/60">
                <span className="loading loading-spinner text-primary"></span>
                {t("map.locating")}
              </div>
            ) : pinned.length === 0 ? (
              <p className="text-sm text-base-content/60 text-center py-16">{t("map.empty")}</p>
            ) : (
              <MapBody points={pinned} route={routed} dimmedIds={dimmedIds} typeLabel={typeLabel} height="62vh" />
            )}
            {!geoLoading && dayPoints.length > pinned.length && <p role="status" className="text-sm text-base-content/70">{t("map.unresolved")}</p>}
            <p className="text-[11px] text-base-content/40 px-1">
              © OpenStreetMap contributors · Esri World Imagery
            </p>
          </div>

          {/* เลือกจุด + QR */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-4">
            <div className="glass glass-card p-4 rounded-3xl space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold">{t("map.pickStops")}</h3>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={selectAll} className="btn btn-xs btn-ghost glass rounded-full">
                    {t("map.selectAll")}
                  </button>
                  <button onClick={clearAll} className="btn btn-xs btn-ghost glass rounded-full">
                    {t("map.clearAll")}
                  </button>
                </div>
              </div>
              <ul className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                {pinned.map((p, i) => {
                  const on = picked[p.id] !== false;
                  return (
                    <li key={p.id ?? i}>
                      <button
                        onClick={() => toggle(p.id)}
                        className={`w-full flex items-center gap-2 p-2 rounded-2xl border text-left transition-all ${
                          on ? "bg-primary/10 border-primary/30" : "bg-white/5 border-white/10 opacity-60"
                        }`}
                      >
                        <span
                          className="w-6 h-6 rounded-full text-xs font-extrabold text-white flex items-center justify-center shrink-0"
                          style={{ background: TYPE_COLORS[p.activityType] || "#10b981" }}
                        >
                          {i + 1}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-semibold truncate">{p.locationName}</span>
                          <span className="block text-xs opacity-60">{typeLabel(p.activityType)}</span>
                        </span>
                        <span className={`btn btn-xs btn-circle shrink-0 ${on ? "btn-primary" : "btn-ghost glass"}`}>
                          {on ? <FiCheck /> : <FiPlus />}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {pinned.length === 0 && (
                <p className="text-sm text-base-content/50 text-center py-2">{t("map.empty")}</p>
              )}
            </div>

            {dirUrl && (
              <div className="glass glass-card p-4 rounded-3xl space-y-2">
                <h3 className="font-bold text-sm">
                  {t("map.routeOf")} ({routed.length} {t("map.stops")})
                </h3>
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-2xl shrink-0">
                    <QRCodeSVG value={dirUrl} size={120} />
                  </div>
                  <div className="space-y-2 min-w-0">
                    <p className="text-xs text-base-content/70 flex items-start gap-1.5">
                      <FiSmartphone className="mt-0.5 shrink-0 text-primary" />
                      {t("map.qrHint")}
                    </p>
                    <a href={dirUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm rounded-full gap-1">
                      <FiExternalLink /> {t("map.openGmaps")}
                    </a>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {routed.slice(0, 10).map((p, i) => (
                    <a
                      key={p.id ?? i}
                      href={gmapsSearchUrl(p.lat != null ? `${p.lat},${p.lng}` : p.locationName)}
                      target="_blank"
                      rel="noreferrer"
                      className="badge badge-outline gap-1 py-2.5 max-w-full"
                      title={p.locationName}
                    >
                      <b>{i + 1}</b>
                      <span className="truncate max-w-[120px]">{p.locationName}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <Link to={`/trips/${tripId}`} className="btn btn-ghost glass w-full rounded-full gap-2">
              <FiArrowLeft /> {t("map.backToTrip")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
