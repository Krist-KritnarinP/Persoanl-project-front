import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiEye,
  FiHome,
  FiTruck,
  FiCoffee,
  FiNavigation,
  FiUser,
} from "react-icons/fi";
import axios from "axios";
import { useLang } from "@/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import TripInfoCard from "@/components/TripInfoCard";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8899/api";

export default function ShareTripView() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { t, locale } = useLang();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState(null);

  const TYPE_META = {
    ACCOMMODATION: { label: t("act.accom"), icon: FiHome, color: "badge-primary" },
    TRANSPORT: { label: t("act.transp"), icon: FiTruck, color: "badge-info" },
    RESTAURANT: { label: t("act.rest"), icon: FiCoffee, color: "badge-warning" },
    ATTRACTION: { label: t("act.attr"), icon: FiNavigation, color: "badge-accent" },
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${baseURL}/shared/${token}`, { timeout: 15000 });
        setTrip(res.data?.data || null);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const formatDate = (s) => {
    if (!s) return "-";
    const d = new Date(s);
    return isNaN(d.getTime()) ? "-" : d.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
  };
  const formatTime = (s) => {
    if (!s) return "";
    if (typeof s === "string" && /^\d{2}:\d{2}/.test(s)) return s.slice(0, 5);
    if (s.includes("T")) {
      const d = new Date(s);
      return isNaN(d.getTime()) ? "" : d.toLocaleTimeString(locale, { timeZone: "UTC", hour: "2-digit", minute: "2-digit", hour12: false });
    }
    return s;
  };

  const activeDay = trip?.days?.find((d) => d.id === selectedDayId) || trip?.days?.[0];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (notFound || !trip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="absolute top-4 right-4"><LanguageSwitcher /></div>
        <FiEye className="text-5xl text-base-content/30" />
        <p className="text-lg sm:text-xl font-bold">{t("share.notFound")}</p>
        <button onClick={() => navigate("/")} className="btn btn-primary rounded-full">
          {t("share.openApp")}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-4 md:px-8 py-4 space-y-6 max-w-6xl mx-auto">
      <header className="navbar glass rounded-3xl md:rounded-full justify-between px-4 md:px-6 py-2 shadow-lg gap-2">
        <span className="font-display text-2xl md:text-3xl tracking-wider bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent whitespace-nowrap">
          AI LHOUNG
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="badge badge-accent badge-outline text-xs sm:text-sm">👁 {t("share.viewOnly")}</span>
          <LanguageSwitcher />
        </div>
      </header>

      <TripInfoCard trip={trip} formatDate={formatDate} />
      {trip.sharedBy && (
        <p className="text-sm sm:text-base text-base-content/60 flex items-center gap-1.5 -mt-3">
          <FiUser className="text-primary" /> {t("share.by")}: <b>{trip.sharedBy}</b>
        </p>
      )}

      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {trip.days?.map((day) => (
          <button
            key={day.id}
            onClick={() => setSelectedDayId(day.id)}
            className={`btn btn-sm rounded-2xl whitespace-nowrap ${
              activeDay?.id === day.id ? "btn-primary shadow-lg" : "btn-ghost glass"
            }`}
          >
            Day {day.dayCount}{day.dayDate && ` (${formatDate(day.dayDate)})`}
          </button>
        ))}
      </div>

      {activeDay && (
        <div className="glass glass-card p-4 md:p-6 rounded-3xl space-y-4">
          <div className="border-b border-white/20 pb-3">
            <h2 className="text-xl sm:text-2xl font-bold">Day {activeDay.dayCount}</h2>
            <p className="text-sm sm:text-base opacity-70">{formatDate(activeDay.dayDate)}</p>
            {activeDay.description && (
              <p className="text-sm sm:text-base opacity-80 mt-1 leading-relaxed">{activeDay.description}</p>
            )}
          </div>
          {activeDay.activities?.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {activeDay.activities.map((act) => {
                const meta = TYPE_META[act.activityType] || TYPE_META.ATTRACTION;
                const Icon = meta.icon;
                return (
                  <div key={act.id} className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className={`p-3 rounded-xl shrink-0 ${meta.color}`}><Icon className="text-xl" /></div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base sm:text-lg truncate">{act.locationName}</span>
                        <span className={`badge badge-sm ${meta.color}`}>{meta.label}</span>
                      </div>
                      {act.activityTime && (
                        <p className="text-sm text-base-content/70 flex items-center gap-1 mt-0.5">
                          <FiClock /> {formatTime(act.activityTime)}
                        </p>
                      )}
                      {act.description && (
                        <p className="text-sm opacity-70 mt-0.5 leading-relaxed line-clamp-2">{act.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm sm:text-base text-base-content/60 text-center py-6">{t("day.noActs")}</p>
          )}
        </div>
      )}

      <div className="text-center pb-6">
        <button onClick={() => navigate("/")} className="btn btn-ghost glass rounded-full gap-2">
          <FiArrowLeft /> {t("share.openApp")}
        </button>
      </div>
    </div>
  );
}
