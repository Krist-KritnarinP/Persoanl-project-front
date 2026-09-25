import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiPlus,
  FiCalendar,
  FiEdit2,
  FiTrash2,
  FiHome,
  FiTruck,
  FiCoffee,
  FiNavigation,
  FiCheckCircle,
  FiDollarSign,
  FiList,
  FiFlag,
  FiShare2,
  FiCopy,
  FiLink,
} from "react-icons/fi";
import { useTripActivityStore } from "@/stores/tripActivityStore";
import { toast } from "react-toastify";
import { useLang } from "@/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import DayModal from "@/components/DayModal";
import ActivityModal from "@/components/ActivityModal";
import GeminiWeatherCard from "@/components/GeminiWeatherCard";
import TripInfoCard from "@/components/TripInfoCard";
import ActivityItem from "@/components/ActivityItem";

export default function TripActivity() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { t, locale } = useLang();

  const ACTIVITY_TYPES = {
    ACCOMMODATION: { label: t("act.accom"), icon: FiHome, color: "badge-primary" },
    TRANSPORT: { label: t("act.transp"), icon: FiTruck, color: "badge-info" },
    RESTAURANT: { label: t("act.rest"), icon: FiCoffee, color: "badge-warning" },
    ATTRACTION: { label: t("act.attr"), icon: FiNavigation, color: "badge-accent" },
  };

  const trip = useTripActivityStore((state) => state.trip);
  const loading = useTripActivityStore((state) => state.loading);
  const error = useTripActivityStore((state) => state.error);
  const fetchTripDetails = useTripActivityStore((state) => state.fetchTripDetails);

  const createDay = useTripActivityStore((state) => state.createDay);
  const updateDay = useTripActivityStore((state) => state.updateDay);
  const deleteDay = useTripActivityStore((state) => state.deleteDay);

  const createActivity = useTripActivityStore((state) => state.createActivity);
  const updateActivity = useTripActivityStore((state) => state.updateActivity);
  const deleteActivity = useTripActivityStore((state) => state.deleteActivity);

  const weatherPrediction = useTripActivityStore((state) => state.weatherPrediction);
  const weatherLoading = useTripActivityStore((state) => state.weatherLoading);
  const weatherError = useTripActivityStore((state) => state.weatherError);
  const getWeatherForecast = useTripActivityStore((state) => state.getWeatherForecast);
  const weatherHistory = useTripActivityStore((state) => state.weatherHistory);
  const fetchWeatherHistory = useTripActivityStore((state) => state.fetchWeatherHistory);
  const deleteWeatherHistory = useTripActivityStore((state) => state.deleteWeatherHistory);
  const createShareLink = useTripActivityStore((state) => state.createShareLink);
  const revokeShareLink = useTripActivityStore((state) => state.revokeShareLink);

  const [shareOpen, setShareOpen] = useState(false);
  const [shareToken, setShareToken] = useState(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const openShare = async () => {
    setShareOpen(true);
    setCopied(false);
    if (trip?.shareToken) {
      setShareToken(trip.shareToken);
      return;
    }
    setShareLoading(true);
    try {
      const token = await createShareLink(tripId);
      setShareToken(token);
    } catch (err) {
      console.error("Create share link error:", err);
      setShareOpen(false);
    } finally {
      setShareLoading(false);
    }
  };

  const copyShareLink = async () => {
    const url = `${window.location.origin}/share/${shareToken}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevokeShare = async () => {
    if (!window.confirm(t("share.revoke") + "?")) return;
    try {
      await revokeShareLink(tripId);
      setShareToken(null);
      setShareOpen(false);
    } catch (err) {
      console.error("Revoke share error:", err);
    }
  };

  const [selectedDayId, setSelectedDayId] = useState(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [dayFormData, setDayFormData] = useState({ dayDate: "", description: "" });
  const [editingDay, setEditingDay] = useState(null);

  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [activityFormData, setActivityFormData] = useState({
    dayId: "",
    activityType: "ATTRACTION",
    locationName: "",
    activityDate: "",
    activityTime: "",
    price: 0,
    description: "",
    status: "planned",
  });

  useEffect(() => {
    if (tripId) fetchTripDetails(tripId);
  }, [tripId]);

  useEffect(() => {
    if (trip?.days && trip.days.length > 0 && !selectedDayId) {
      setSelectedDayId(trip.days[0].id);
    }
  }, [trip]);

  const activeDay = trip?.days?.find((d) => d.id === selectedDayId) || trip?.days?.[0];

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // สถิติภาพรวมทริป
  const totalDays = trip?.days?.length || 0;
  const totalActs = trip?.days?.reduce((s, d) => s + (d.activities?.length || 0), 0) || 0;
  const totalBudget = trip?.days?.reduce(
    (s, d) => s + (d.activities?.reduce((a, x) => a + (Number(x.price) || 0), 0) || 0), 0
  ) || 0;

  // Helper ดึงข้อความเวลามาแสดงผลโดยตรง (เก็บ wall-time แบบ UTC เพื่อกันเพี้ยน +7)
  const formatZonedTime = (timeString) => {
    if (!timeString) return "";
    if (typeof timeString === "string" && /^\d{2}:\d{2}(:\d{2})?$/.test(timeString)) {
      return timeString.slice(0, 5);
    }
    if (timeString.includes("T")) {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) return timeString;
      return date.toLocaleTimeString("th-TH", {
        timeZone: "UTC",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
    return timeString;
  };

  // Day Handlers (เพิ่มกลับมา: UI เดิมมีแค่เพิ่มวัน)
  const handleOpenAddDayModal = () => {
    setEditingDay(null);
    setDayFormData({ dayDate: "", description: "" });
    setIsDayModalOpen(true);
  };

  const handleOpenEditDayModal = (day) => {
    setEditingDay(day);
    setDayFormData({
      dayDate: day.dayDate ? new Date(day.dayDate).toISOString().split("T")[0] : "",
      description: day.description || "",
    });
    setIsDayModalOpen(true);
  };

  const handleSaveDay = async (e) => {
    e.preventDefault();
    try {
      if (editingDay) {
        await updateDay(editingDay.id, tripId, dayFormData);
      } else {
        await createDay(tripId, dayFormData);
      }
      setIsDayModalOpen(false);
    } catch (err) {
      console.error("Save day error:", err);
    }
  };

  const handleDeleteDay = async (dayId) => {
    if (window.confirm(t("day.confirmDelDay"))) {
      try {
        await deleteDay(dayId, tripId);
        if (selectedDayId === dayId) setSelectedDayId(null);
      } catch (err) {
        console.error("Delete day error:", err);
      }
    }
  };

  // Activity Handlers
  const handleOpenAddActivityModal = () => {
    if (!activeDay) {
      toast.warn(t("day.needDayFirst"));
      return;
    }
    setEditingActivity(null);
    setActivityFormData({
      dayId: activeDay.id,
      activityType: "ATTRACTION",
      locationName: "",
      activityDate: activeDay.dayDate
        ? new Date(activeDay.dayDate).toISOString().split("T")[0]
        : "",
      activityTime: "",
      price: 0,
      description: "",
      status: "planned",
    });
    setIsActivityModalOpen(true);
  };

  const handleOpenEditActivityModal = (act) => {
    setEditingActivity(act);
    setActivityFormData({
      dayId: act.dayId,
      activityType: act.activityType || "ATTRACTION",
      locationName: act.locationName || "",
      activityDate: act.activityDate
        ? new Date(act.activityDate).toISOString().split("T")[0]
        : "",
      activityTime: act.activityTime
        ? formatZonedTime(act.activityTime)
        : "",
      price: act.price || 0,
      description: act.description || "",
      status: act.status || "planned",
    });
    setIsActivityModalOpen(true);
  };

  // Save Activity: เก็บ wall-time เป็น UTC (1970-01-01T<HH:mm>:00Z) กันเพี้ยน timezone
  const handleSaveActivity = async (e) => {
    e.preventDefault();
    try {
      let formattedTime = null;

      if (activityFormData.activityTime) {
        const m = String(activityFormData.activityTime).match(/^(\d{2}):(\d{2})/);
        formattedTime = m ? `1970-01-01T${m[1]}:${m[2]}:00Z` : null;
      }

      const payload = {
        ...activityFormData,
        price: Number(activityFormData.price) || 0,
        activityTime: formattedTime,
      };

      if (editingActivity) {
        await updateActivity(tripId, editingActivity.id, payload);
      } else {
        await createActivity(tripId, payload);
      }
      setIsActivityModalOpen(false);
    } catch (err) {
      console.error("Save activity error:", err);
    }
  };

  const handleDeleteActivity = async (actId) => {
    if (window.confirm(t("act.confirmDel"))) {
      await deleteActivity(tripId, actId);
    }
  };

  const handleDeleteHistory = async (messageId) => {
    if (window.confirm(t("weather.delHist"))) {
      try {
        await deleteWeatherHistory(tripId, messageId);
      } catch {
        toast.error(t("weather.noHistory"));
      }
    }
  };

  if (loading && !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-4 md:px-8 py-4 space-y-6">
      {/* NAVBAR */}
      <header className="navbar glass rounded-3xl md:rounded-full justify-between px-4 md:px-6 py-3 shadow-lg shrink-0 mb-4 w-full gap-2">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold overflow-hidden shrink-0">
            <img src="/image/MiniDog.PNG" alt="Minidog" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <span className="font-display text-2xl md:text-3xl tracking-wider bg-linear-to-r from-primary to-accent bg-clip-text text-transparent whitespace-nowrap">
              AI LHOUNG
            </span>
            <span className="hidden sm:block text-xs text-base-content/60 font-medium -mt-1">
              {t("nav.tagline")}
            </span>
          </div>
        </div>
        <LanguageSwitcher />
      </header>

      {/* HEADER / NAVIGATION */}
      <div className="flex items-center justify-between w-full gap-2">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost glass gap-2 text-base-content hover:bg-white/20"
        >
          <FiArrowLeft /> {t("common.back")}
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={openShare}
            className="btn btn-primary btn-sm rounded-full gap-1.5 shadow-md"
          >
            <FiShare2 /> {t("share.btn")}
          </button>
          <span className="hidden sm:inline text-sm badge badge-outline glass px-3 py-2">Trip #{tripId}</span>
        </div>
      </div>

      {/* TRIP INFO CARD */}
      <TripInfoCard trip={trip} formatDate={formatDate} />

      {/* TRIP OVERVIEW STATS — horizontal scroll strip on all screens */}
      <section className="flex gap-3 md:gap-4 overflow-x-auto pb-2 snap-x snap-mandatory custom-scrollbar">
        <div className="glass glass-card p-4 md:p-5 flex items-center gap-3 min-w-[220px] sm:min-w-[240px] xl:min-w-0 xl:flex-1 snap-start">
          <div className="w-11 h-11 rounded-2xl bg-primary/15 text-primary flex items-center justify-center text-xl shrink-0">
            <FiCalendar />
          </div>
          <div className="min-w-0">
            <div className="text-sm sm:text-base text-base-content/60">{t("day.ovDays")}</div>
            <div className="text-xl md:text-2xl font-black">{totalDays}</div>
          </div>
        </div>
        <div className="glass glass-card p-4 md:p-5 flex items-center gap-3 min-w-[220px] sm:min-w-[240px] xl:min-w-0 xl:flex-1 snap-start">
          <div className="w-11 h-11 rounded-2xl bg-accent/15 text-accent flex items-center justify-center text-xl shrink-0">
            <FiList />
          </div>
          <div className="min-w-0">
            <div className="text-sm sm:text-base text-base-content/60">{t("day.ovActs")}</div>
            <div className="text-xl md:text-2xl font-black">{totalActs}</div>
          </div>
        </div>
        <div className="glass glass-card p-4 md:p-5 flex items-center gap-3 min-w-[220px] sm:min-w-[240px] xl:min-w-0 xl:flex-1 snap-start">
          <div className="w-11 h-11 rounded-2xl bg-warning/15 text-warning flex items-center justify-center text-xl shrink-0">
            <FiDollarSign />
          </div>
          <div className="min-w-0">
            <div className="text-sm sm:text-base text-base-content/60">{t("day.ovBudget")}</div>
            <div className="text-xl md:text-2xl font-black truncate">
              {totalBudget.toLocaleString(locale)} <span className="text-sm font-normal text-base-content/50">{t("day.baht")}</span>
            </div>
          </div>
        </div>
        <div className="glass glass-card p-4 md:p-5 flex items-center gap-3 min-w-[220px] sm:min-w-[240px] xl:min-w-0 xl:flex-1 snap-start">
          <div className="w-11 h-11 rounded-2xl bg-info/15 text-info flex items-center justify-center text-xl shrink-0">
            <FiFlag />
          </div>
          <div className="min-w-0">
            <div className="text-sm sm:text-base text-base-content/60">{t("day.ovDuration")}</div>
            <div className="text-base md:text-lg font-black truncate">
              {formatDate(trip?.startDate)} – {formatDate(trip?.endDate)}
            </div>
          </div>
        </div>
      </section>

      {/* 3-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* LEFT COLUMN: Overview Waterfall Timeline (กรอบสูงคงที่ + scroll ทุกจอ) */}
        <div className="order-2 lg:order-1 lg:col-span-3 glass glass-card p-5 rounded-3xl space-y-4 lg:sticky lg:top-4 max-h-[62vh] md:max-h-[70vh] lg:max-h-[calc(100vh-2rem)] overflow-y-auto custom-scrollbar">
          <h3 className="text-lg font-bold flex items-center gap-2 border-b border-white/20 pb-3">
            <FiCheckCircle className="text-primary" /> {t("day.overview")}
          </h3>

          {trip?.days && trip.days.length > 0 ? (
            <div className="relative border-l-2 border-primary/30 ml-3 space-y-6 pl-4 py-2">
              {trip.days.map((d) => {
                const isSelected = activeDay?.id === d.id;
                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDayId(d.id)}
                    className={`cursor-pointer group relative transition-all ${
                      isSelected ? "scale-102" : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div
                      className={`absolute -left-6.25 top-0 w-4 h-4 rounded-full border-2 transition-all ${
                        isSelected
                          ? "bg-primary border-white scale-125 shadow-md"
                          : "bg-base-100 border-primary/50 group-hover:bg-primary/50"
                      }`}
                    />

                    <div
                      className={`p-3 rounded-2xl transition-all ${
                        isSelected
                          ? "bg-primary/10 border border-primary/30 shadow-sm"
                          : "bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm sm:text-base text-primary">Day {d.dayCount}</span>
                        <span className="text-xs opacity-70 whitespace-nowrap">{formatDate(d.dayDate)}</span>
                      </div>

                      {d.activities && d.activities.length > 0 ? (
                        <ul className="mt-2 space-y-2 border-t border-white/10 pt-2 text-sm">
                          {d.activities.map((act) => (
                            <li key={act.id} className="space-y-1">
                              <div className="flex items-center gap-1.5 text-base-content/90 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent/70 shrink-0" />
                                <span className="truncate">{act.locationName}</span>
                              </div>

                              {act.activityTime && (
                                <div className="flex items-center gap-1.5 pl-3 text-xs">
                                  <span className="bg-base-200/60 px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <span>⏰</span>
                                    <span>{formatZonedTime(act.activityTime)}</span>
                                  </span>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs opacity-50 mt-1 italic">{t("dash.noActivity")}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-base-content/60 text-center py-4">{t("day.noDays")}</p>
          )}
        </div>

        {/* CENTER COLUMN: Main Days & Activities */}
        <div className="order-1 lg:order-2 lg:col-span-6 space-y-6 min-w-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FiCalendar /> {t("day.plan")}
              </h2>
              <button
                onClick={handleOpenAddDayModal}
                className="btn btn-primary btn-sm rounded-full gap-1 shrink-0"
              >
                <FiPlus /> {t("day.addDay")}
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {trip?.days?.map((day) => {
                const isActive = activeDay?.id === day.id;
                return (
                  <button
                    key={day.id}
                    onClick={() => setSelectedDayId(day.id)}
                    className={`btn btn-sm rounded-2xl whitespace-nowrap transition-all ${
                      isActive
                        ? "btn-primary shadow-lg scale-105"
                        : "btn-ghost glass text-base-content hover:bg-white/30"
                    }`}
                  >
                    Day {day.dayCount}
                    {day.dayDate && ` (${formatDate(day.dayDate)})`}
                  </button>
                );
              })}
            </div>
          </div>

          {activeDay && (
            <div className="glass glass-card p-4 md:p-6 rounded-3xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/20 pb-4 gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-2xl font-bold">Day {activeDay.dayCount}</h3>
                    <span className="text-sm opacity-70">{formatDate(activeDay.dayDate)}</span>
                  </div>
                  <p className="text-sm sm:text-base opacity-80 mt-1">{activeDay.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenEditDayModal(activeDay)}
                    className="btn btn-ghost btn-sm text-info hover:bg-white/20"
                  >
                    <FiEdit2 /> {t("day.editDay")}
                  </button>
                  <button
                    onClick={() => handleDeleteDay(activeDay.id)}
                    className="btn btn-ghost btn-sm text-error hover:bg-white/20"
                  >
                    <FiTrash2 /> {t("day.delDay")}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {/* Day overview: สรุปของวันนี้ */}
                <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-semibold">
                    <FiList /> {activeDay.activities?.length || 0} {t("day.ovActs")}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning/10 text-warning font-semibold">
                    <FiDollarSign /> {(activeDay.activities?.reduce((s, a) => s + (Number(a.price) || 0), 0) || 0).toLocaleString(locale)} {t("day.baht")}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 font-medium text-base-content/70">
                    {formatDate(activeDay.dayDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-semibold text-lg sm:text-xl">{t("day.actList")}</h4>
                  <button
                    onClick={handleOpenAddActivityModal}
                    className="btn btn-primary btn-sm glass rounded-full gap-1 shrink-0"
                  >
                    <FiPlus /> {t("act.addAct")}
                  </button>
                </div>

                {activeDay.activities && activeDay.activities.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {activeDay.activities.map((act) => (
                      <ActivityItem
                        key={act.id}
                        activity={act}
                        typeConfig={
                          ACTIVITY_TYPES[act.activityType] || ACTIVITY_TYPES.ATTRACTION
                        }
                        formatZonedTime={formatZonedTime}
                        onEdit={handleOpenEditActivityModal}
                        onDelete={handleDeleteActivity}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 glass rounded-2xl opacity-60">
                    <p className="text-sm sm:text-base">{t("day.noActs")}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Gemini Weather Card */}
        <div className="order-3 lg:col-span-3 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] flex flex-col min-w-0">
          <GeminiWeatherCard
            tripId={tripId}
            weatherPrediction={weatherPrediction}
            weatherLoading={weatherLoading}
            weatherError={weatherError}
            onGetForecast={getWeatherForecast}
            weatherHistory={weatherHistory}
            onFetchHistory={fetchWeatherHistory}
            onDeleteHistory={handleDeleteHistory}
          />
        </div>
      </div>

      <DayModal
        isOpen={isDayModalOpen}
        onClose={() => setIsDayModalOpen(false)}
        onSubmit={handleSaveDay}
        editingDay={editingDay}
        dayFormData={dayFormData}
        setDayFormData={setDayFormData}
      />

      {/* SHARE MODAL */}
      {shareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={() => setShareOpen(false)}>
          <div className="glass rounded-3xl border border-white/30 p-5 md:p-6 w-full max-w-md max-h-[85vh] overflow-y-auto custom-scrollbar space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-xl flex items-center gap-2">
              <FiShare2 className="text-primary" /> {t("share.title")}
            </h3>
            <p className="text-sm sm:text-base text-base-content/70 leading-relaxed">
              {t("share.desc")}
            </p>
            {shareLoading ? (
              <div className="flex justify-center py-4">
                <span className="loading loading-spinner text-primary"></span>
              </div>
            ) : shareToken ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-2xl bg-white/20 border border-white/20 px-3 py-2.5 text-sm break-all">
                  <FiLink className="shrink-0 text-primary" />
                  <span className="truncate">{`${window.location.origin}/share/${shareToken}`}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button onClick={copyShareLink} className="btn btn-primary rounded-full gap-2 flex-1">
                    <FiCopy /> {copied ? t("share.copied") : t("share.copy")}
                  </button>
                  <button onClick={handleRevokeShare} className="btn btn-ghost glass rounded-full text-error">
                    <FiTrash2 /> {t("share.revoke")}
                  </button>
                </div>
              </div>
            ) : null}
            <button onClick={() => setShareOpen(false)} className="btn btn-ghost w-full rounded-full">
              {t("common.close")}
            </button>
          </div>
        </div>
      )}

      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        onSubmit={handleSaveActivity}
        editingActivity={editingActivity}
        activityFormData={activityFormData}
        setActivityFormData={setActivityFormData}
      />
    </div>
  );
}
