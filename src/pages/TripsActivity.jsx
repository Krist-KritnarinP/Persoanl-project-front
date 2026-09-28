import { useOutletContext } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiPlus,
  FiCalendar,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiDollarSign,
  FiList,
  FiFlag,
  FiShare2,
  FiChevronRight,
  FiEye,
} from "react-icons/fi";
import { useTripActivityStore } from "@/stores/tripActivityStore";
import { toast } from "react-toastify";
import { useLang } from "@/i18n";
import { formatTripDate } from "@/utils/datetime";
import { getActivityTypeMeta } from "@/constants/activityTypes";
import TripOverviewStats from "@/components/trips/TripOverviewStats";
import TripShareModal from "@/components/trips/TripShareModal";
import LoadingScreen from "@/components/LoadingScreen";
import DayModal from "@/components/DayModal";
import ActivityModal from "@/components/ActivityModal";
import ActivityDetailModal, { DayDetailModal } from "@/components/DetailModals";
import GeminiWeatherCard from "@/components/GeminiWeatherCard";
import TripInfoCard from "@/components/TripInfoCard";
import ActivityItem from "@/components/ActivityItem";
import TripMap from "@/components/TripMap";
import TripNavCard from "@/components/TripNavCard";
import { useTripCoordinates } from "@/hooks/useTripCoordinates";

/** Own-trip workspace: state and event handlers here; reusable display blocks live in components/trips. */
export default function TripActivity() {
  const { sidebarEnabled } = useOutletContext();
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { t, locale } = useLang();

  // Activity-type icons/colors/labels live in @/constants/activityTypes
  // so every page renders the 4 types identically.
  const ACTIVITY_TYPES = getActivityTypeMeta(t);

  const trip = useTripActivityStore((state) => state.trip);
  const loading = useTripActivityStore((state) => state.loading);
  const fetchTripDetails = useTripActivityStore(
    (state) => state.fetchTripDetails,
  );

  const createDay = useTripActivityStore((state) => state.createDay);
  const updateDay = useTripActivityStore((state) => state.updateDay);
  const deleteDay = useTripActivityStore((state) => state.deleteDay);

  const createActivity = useTripActivityStore((state) => state.createActivity);
  const updateActivity = useTripActivityStore((state) => state.updateActivity);
  const deleteActivity = useTripActivityStore((state) => state.deleteActivity);

  const weatherPrediction = useTripActivityStore(
    (state) => state.weatherPrediction,
  );
  const weatherLoading = useTripActivityStore((state) => state.weatherLoading);
  const weatherError = useTripActivityStore((state) => state.weatherError);
  const getWeatherForecast = useTripActivityStore(
    (state) => state.getWeatherForecast,
  );
  const weatherHistory = useTripActivityStore((state) => state.weatherHistory);
  const fetchWeatherHistory = useTripActivityStore(
    (state) => state.fetchWeatherHistory,
  );
  const deleteWeatherHistory = useTripActivityStore(
    (state) => state.deleteWeatherHistory,
  );
  const createShareLink = useTripActivityStore(
    (state) => state.createShareLink,
  );
  const revokeShareLink = useTripActivityStore(
    (state) => state.revokeShareLink,
  );

  const [shareOpen, setShareOpen] = useState(false);
  const [shareToken, setShareToken] = useState(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Modals ดูข้อมูล (read-only)
  const [viewingActivity, setViewingActivity] = useState(null);
  const [viewingDay, setViewingDay] = useState(null);

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
  const [dayFormData, setDayFormData] = useState({
    dayDate: "",
    description: "",
  });
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
    latitude: "",
    longitude: "",
  });

  // ---- MAP: แปลงชื่อสถานที่/โรงแรม/ร้านอาหาร -> พิกัด (DB ก่อน, ไม่เจอค่อย geocode ฟรี) ----
  const { geoPoints, geoLoading } = useTripCoordinates(
    trip?.id === Number(tripId) ? trip : null,
  );

  useEffect(() => {
    if (tripId) fetchTripDetails(tripId);
  }, [tripId, fetchTripDetails]);

  // ไม่ auto-select วันแรก — เริ่มที่แท็บภาพรวม (selectedDayId === null)
  const activeDay = trip?.days?.find((d) => d.id === selectedDayId) || null;

  // Shared formatter (see @/utils/datetime) — same output, one implementation.
  const formatDate = (dateString) => formatTripDate(dateString, locale);

  // สถิติภาพรวมทริป
  const totalDays = trip?.days?.length || 0;
  const totalActs =
    trip?.days?.reduce((s, d) => s + (d.activities?.length || 0), 0) || 0;
  const totalBudget =
    trip?.days?.reduce(
      (s, d) =>
        s +
        (d.activities?.reduce((a, x) => a + (Number(x.price) || 0), 0) || 0),
      0,
    ) || 0;

  // ---- MAP: จุดที่แสดงเปลี่ยนตามแท็บ "แผนการเดินทางรายวัน" ----
  const mapPoints = activeDay
    ? geoPoints.filter((p) => p.dayId === activeDay.id)
    : geoPoints;
  const mapSubtitle = activeDay
    ? `${t("planner.day", { count: activeDay.dayCount })}${activeDay.dayDate ? ` · ${formatDate(activeDay.dayDate)}` : ""}`
    : t("day.overview");

  // Helper ดึงข้อความเวลามาแสดงผลโดยตรง (เก็บ wall-time แบบ UTC เพื่อกันเพี้ยน +7)
  // NOTE: looks like ShareTripView's formatTime but is NOT identical —
  // this one uses an anchored regex, fixed "th-TH" locale and echoes invalid
  // input back. Keep separate on purpose.
  const formatZonedTime = (timeString) => {
    if (!timeString) return "";
    if (
      typeof timeString === "string" &&
      /^\d{2}:\d{2}(:\d{2})?$/.test(timeString)
    ) {
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
      dayDate: day.dayDate
        ? new Date(day.dayDate).toISOString().split("T")[0]
        : "",
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
      latitude: "",
      longitude: "",
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
      activityTime: act.activityTime ? formatZonedTime(act.activityTime) : "",
      price: act.price || 0,
      description: act.description || "",
      status: act.status || "planned",
      latitude: act.latitude ?? "",
      longitude: act.longitude ?? "",
    });
    setIsActivityModalOpen(true);
  };

  // Save Activity: เก็บ wall-time เป็น UTC (1970-01-01T<HH:mm>:00Z) กันเพี้ยน timezone
  const handleSaveActivity = async (e) => {
    e.preventDefault();
    try {
      let formattedTime = null;

      if (activityFormData.activityTime) {
        const m = String(activityFormData.activityTime).match(
          /^(\d{2}):(\d{2})/,
        );
        formattedTime = m ? `1970-01-01T${m[1]}:${m[2]}:00Z` : null;
      }

      const payload = {
        ...activityFormData,
        price: Number(activityFormData.price) || 0,
        activityTime: formattedTime,
        latitude:
          activityFormData.latitude === "" || activityFormData.latitude == null
            ? null
            : Number(activityFormData.latitude),
        longitude:
          activityFormData.longitude === "" ||
          activityFormData.longitude == null
            ? null
            : Number(activityFormData.longitude),
      };

      if (editingActivity) {
        delete payload.dayId;
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
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen w-full px-4 md:px-8 py-4 space-y-6">
      {!sidebarEnabled && (
        <header className="navbar glass rounded-3xl md:rounded-full justify-between px-4 md:px-6 py-3 shadow-lg shrink-0 mb-4 w-full gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            title={t("nav.dashboard")}
            className="flex items-center gap-2 md:gap-3 min-w-0 cursor-pointer rounded-2xl"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold overflow-hidden shrink-0">
              <img
                src="/image/MiniDog.PNG"
                alt="Minidog"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 text-left">
              <span className="font-display text-2xl md:text-3xl tracking-wider bg-linear-to-r from-primary to-accent bg-clip-text text-transparent whitespace-nowrap">
                AI LHOUNG
              </span>
              <span className="hidden sm:block text-xs text-base-content/60 font-medium -mt-1">
                {t("nav.tagline")}
              </span>
            </div>
          </button>
          <div className="flex items-center gap-1 shrink-0">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </header>
      )}
      {/* NAVBAR */}

      {/* HEADER / NAVIGATION — ย้อนกลับทีละสเตป: map → trip → dashboard */}
      <div className="flex items-center justify-between w-full gap-2">
        <button
          onClick={() => navigate("/dashboard")}
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
          <span className="hidden sm:inline-flex items-center rounded-full border border-base-content/20 bg-white/20 px-3 py-1.5 text-sm font-semibold leading-none whitespace-nowrap">
            Trip #{tripId}
          </span>
        </div>
      </div>

      {/* TRIP INFO CARD */}
      <TripInfoCard trip={trip} formatDate={formatDate} />

      {/* TRIP OVERVIEW STATS — horizontal scroll strip on all screens */}
      <TripOverviewStats
        trip={trip}
        totalDays={totalDays}
        totalActs={totalActs}
        totalBudget={totalBudget}
        formatDate={formatDate}
        locale={locale}
        t={t}
      />

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
                        <span className="font-bold text-sm sm:text-base text-primary">
                          {t("planner.day", { count: d.dayCount })}
                        </span>
                        <span className="text-xs opacity-70 whitespace-nowrap">
                          {formatDate(d.dayDate)}
                        </span>
                      </div>

                      {d.activities && d.activities.length > 0 ? (
                        <ul className="mt-2 space-y-2 border-t border-white/10 pt-2 text-sm">
                          {d.activities.map((act) => (
                            <li key={act.id} className="space-y-1">
                              <div className="flex items-center gap-1.5 text-base-content/90 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent/70 shrink-0" />
                                <span className="truncate">
                                  {act.locationName}
                                </span>
                              </div>

                              {act.activityTime && (
                                <div className="flex items-center gap-1.5 pl-3 text-xs">
                                  <span className="bg-base-200/60 px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <span>⏰</span>
                                    <span>
                                      {formatZonedTime(act.activityTime)}
                                    </span>
                                  </span>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs opacity-50 mt-1 italic">
                          {t("dash.noActivity")}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-base-content/60 text-center py-4">
              {t("day.noDays")}
            </p>
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

            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
              <button
                onClick={() => setSelectedDayId(null)}
                className={`btn btn-sm rounded-2xl whitespace-nowrap transition-all shrink-0 ${
                  !activeDay
                    ? "btn-primary shadow-lg scale-105"
                    : "btn-ghost glass text-base-content hover:bg-white/30"
                }`}
              >
                <FiFlag /> {t("day.overview")}
              </button>
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
                    {t("planner.day", { count: day.dayCount })}
                    {day.dayDate && ` (${formatDate(day.dayDate)})`}
                  </button>
                );
              })}
            </div>
          </div>

          {activeDay ? (
            <div className="glass glass-card p-4 md:p-6 rounded-3xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/20 pb-4 gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-2xl font-bold">
                      {t("planner.day", { count: activeDay.dayCount })}
                    </h3>
                    <span className="text-sm opacity-70">
                      {formatDate(activeDay.dayDate)}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base opacity-80 mt-1">
                    {activeDay.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setViewingDay(activeDay)}
                    title={t("common.view")}
                    className="btn btn-ghost btn-sm text-base-content/70 hover:bg-white/20"
                  >
                    <FiEye />{" "}
                    <span className="hidden sm:inline">{t("common.view")}</span>
                  </button>
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
                    <FiList /> {activeDay.activities?.length || 0}{" "}
                    {t("day.ovActs")}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning/10 text-warning font-semibold">
                    <FiDollarSign />{" "}
                    {(
                      activeDay.activities?.reduce(
                        (s, a) => s + (Number(a.price) || 0),
                        0,
                      ) || 0
                    ).toLocaleString(locale)}{" "}
                    {t("day.baht")}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 font-medium text-base-content/70">
                    {formatDate(activeDay.dayDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-semibold text-lg sm:text-xl">
                    {t("day.actList")}
                  </h4>
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
                          ACTIVITY_TYPES[act.activityType] ||
                          ACTIVITY_TYPES.ATTRACTION
                        }
                        formatZonedTime={formatZonedTime}
                        onEdit={handleOpenEditActivityModal}
                        onDelete={handleDeleteActivity}
                        onView={setViewingActivity}
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
          ) : (
            /* OVERVIEW PANEL: สรุปรายวัน กดเพื่อเข้าแต่ละวัน */
            <div className="glass glass-card p-4 md:p-6 rounded-3xl space-y-4">
              <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <FiFlag className="text-primary" /> {t("day.overview")}
              </h3>
              {trip?.days?.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {trip.days.map((d) => {
                    const n = d.activities?.length || 0;
                    const budget =
                      d.activities?.reduce(
                        (s, a) => s + (Number(a.price) || 0),
                        0,
                      ) || 0;
                    return (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDayId(d.id)}
                        className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 transition-all text-left"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-base sm:text-lg">
                            {t("planner.day", { count: d.dayCount })}
                            <span className="ml-2 text-sm font-normal opacity-70">
                              {formatDate(d.dayDate)}
                            </span>
                          </div>
                          <div className="text-sm text-base-content/70 mt-0.5">
                            {n} {t("day.ovActs")} •{" "}
                            {budget.toLocaleString(locale)} {t("day.baht")}
                          </div>
                          {d.description && (
                            <div className="text-sm opacity-60 truncate mt-0.5">
                              {d.description}
                            </div>
                          )}
                        </div>
                        <FiChevronRight className="text-primary text-xl shrink-0" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm sm:text-base text-base-content/60 text-center py-6">
                  {t("day.noDays")}
                </p>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: สภาพอากาศ + แผนที่เล็ก + นำทาง/QR */}
        <div className="order-3 lg:col-span-3 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto custom-scrollbar flex flex-col gap-6 min-w-0">
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
          <TripMap
            points={mapPoints}
            subtitle={mapSubtitle}
            loading={geoLoading}
            height={220}
            compact
            expandHref={`/trips/${tripId}/map`}
          />
          <TripNavCard
            points={mapPoints}
            label={mapSubtitle}
            mapHref={`/trips/${tripId}/map`}
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
        <TripShareModal
          shareLoading={shareLoading}
          shareToken={shareToken}
          copied={copied}
          copyShareLink={copyShareLink}
          handleRevokeShare={handleRevokeShare}
          onClose={() => setShareOpen(false)}
          t={t}
        />
      )}

      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        onSubmit={handleSaveActivity}
        editingActivity={editingActivity}
        activityFormData={activityFormData}
        setActivityFormData={setActivityFormData}
      />

      {/* VIEW MODALS (read-only) */}
      <ActivityDetailModal
        activity={viewingActivity}
        typeConfig={
          viewingActivity
            ? ACTIVITY_TYPES[viewingActivity.activityType] ||
              ACTIVITY_TYPES.ATTRACTION
            : null
        }
        formatZonedTime={formatZonedTime}
        onClose={() => setViewingActivity(null)}
        onEdit={handleOpenEditActivityModal}
      />
      <DayDetailModal
        day={viewingDay}
        formatDate={formatDate}
        formatZonedTime={formatZonedTime}
        typeLabel={(type) =>
          (ACTIVITY_TYPES[type] || ACTIVITY_TYPES.ATTRACTION).label
        }
        onClose={() => setViewingDay(null)}
      />
    </div>
  );
}
