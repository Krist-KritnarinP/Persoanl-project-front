import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCompass,
  FiMapPin,
  FiCalendar,
  FiPlus,
  FiTrendingUp,
  FiCheckCircle,
  FiSearch,
  FiChevronRight,
  FiGrid,
  FiList,
  FiLogOut,
  FiLoader,
  FiTrash2,
} from "react-icons/fi";
import CreateTrip from "@/components/UserTrip";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLang } from "@/i18n";
import useTripStore from "@/stores/tripStore";
import useUserStore from "@/stores/userStore";

function Dashboard() {
  const { t, locale } = useLang();
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");

  const modalRef = useRef(null);
  const navigate = useNavigate();

  // ดึง state & actions จาก Zustand Stores
  const { trips, loading, fetchTrips, deleteTrip } = useTripStore();
  const logout = useUserStore((state) => state.logout);
  const user = useUserStore((state) => state.user);

  // โหลดข้อมูลทริปเมื่อเปิดหน้าครั้งแรก
  useEffect(() => {
    fetchTrips();
  }, []);

  // ดักจับเหตุการณ์เมื่อ Modal ปิดลง เพื่อสั่ง re-fetch ข้อมูลใหม่
  useEffect(() => {
    const modalElement = modalRef.current;
    if (!modalElement) return;

    const handleModalClose = () => {
      fetchTrips();
    };

    modalElement.addEventListener("close", handleModalClose);
    return () => {
      modalElement.removeEventListener("close", handleModalClose);
    };
  }, [fetchTrips]);

  // Helper: แปลงวันที่
  const formatDate = (dateString) => {
    if (!dateString) return t("dash.noDate");
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return t("dash.noDate");

    return date.toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Helper: คำนวณสถานะทริป
  const getTripStatus = (startDate, endDate) => {
    if (!startDate)
      return {
        label: t("dash.stDraft"),
        color: "bg-base-content/10 text-base-content/70",
      };

    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;

    if (now > end) {
      return { label: t("dash.stDone"), color: "bg-info/20 text-info" };
    } else if (now >= start && now <= end) {
      return { label: t("dash.stOngoing"), color: "bg-success text-white" };
    } else {
      return { label: t("dash.stUpcoming"), color: "bg-primary text-white" };
    }
  };

  // Handler: ลบทริป
  const handleDeleteTrip = async (e, tripId) => {
    e.stopPropagation(); // ป้องกันการคลิกซ้อนทับการ์ด
    if (window.confirm(t("dash.confirmDelTrip"))) {
      try {
        await deleteTrip(tripId);
      } catch (err) {
        console.error("Error deleting trip:", err);
      }
    }
  };

  // Filter ค้นหา
  const safeTrips = Array.isArray(trips) ? trips : [];
  const filteredTrips = safeTrips.filter((trip) => {
    const nameMatch = (trip.tripName || trip.title || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const destMatch = (trip.destination || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return nameMatch || destMatch;
  });

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col p-4 md:p-6 font-sans box-border">
      {/* ================= NAVBAR / HEADER ================= */}
      <header className="navbar glass rounded-3xl md:rounded-full justify-between px-4 md:px-6 py-2 shadow-lg shrink-0 mb-4 gap-2">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 cursor-pointer" onClick={() => navigate("/dashboard")}>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-xl font-bold overflow-hidden shrink-0">
            <img
              src="/image/MiniDog.PNG"
              alt="Minidog"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <span className="font-display text-2xl md:text-3xl tracking-wider bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent whitespace-nowrap">
              AI LHOUNG
            </span>
            <span className="hidden sm:block text-xs text-base-content/60 font-medium -mt-1">
              {t("nav.tagline")}
            </span>
          </div>
        </div>

        {/* Search Input */}
        <div className="hidden lg:flex items-center gap-2 min-w-0">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/50" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("nav.searchPh")}
              className="input pl-10 pr-4 text-sm w-64 xl:w-80 rounded-full border-none focus:outline-none bg-base-100/50"
            />
          </div>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <LanguageSwitcher />
          <button
            onClick={() => navigate("/userprofile")}
            className="flex items-center gap-2 pr-1 sm:pr-2 sm:border-r border-base-content/10"
            title={t("profile.title")}
          >
            <div className="avatar placeholder">
              <div className="bg-primary/20 text-primary ring-2 ring-primary/30 rounded-full w-9 flex items-center justify-center">
                <span className="text-xs font-bold">
                  {(user?.username || user?.email || "AL").slice(0, 2).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="hidden md:block text-left">
              <div className="text-base font-bold leading-tight max-w-32 truncate">
                {user?.username || user?.name}
              </div>
              <div className="text-xs text-base-content/50 leading-none mt-0.5 max-w-32 truncate">
                {user?.email}
              </div>
            </div>
          </button>

          <button
            onClick={logout}
            title={t("nav.logout")}
            className="btn btn-ghost btn-circle text-error/80 hover:bg-error/10"
          >
            <FiLogOut className="text-lg" />
          </button>
        </div>
      </header>

      {/* ================= SCROLLABLE CONTENT CONTAINER ================= */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-6 custom-scrollbar">
        {/* HERO BANNER */}
        <section className="glass rounded-4xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
          <div className="space-y-2 z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">
              <FiCompass
                className="animate-spin"
                style={{ animationDuration: "10000s" }}
              />
              {t("dash.ready")}
            </div>
            <h1 className="font-display text-3xl md:text-4xl tracking-tight">
              {t("dash.hello")} <span className="text-primary">{t("dash.welcomeBack")}</span>
            </h1>
            <p className="text-base md:text-lg text-base-content/70 leading-relaxed">
              {t("dash.sub")}
            </p>
          </div>

          <div className="z-10 flex gap-3 w-full md:w-auto">
            <button
              className="btn btn-primary rounded-full px-6 flex-1 md:flex-none gap-2 shadow-md hover:shadow-lg"
              type="button"
              onClick={() => modalRef.current?.showModal()}
            >
              <FiPlus className="text-lg" /> {t("dash.newTrip")}
            </button>
          </div>

          <div className="absolute -right-12 -bottom-12 w-60 h-60 bg-gradient-to-br from-primary/20 via-accent/20 to-transparent rounded-full blur-2xl pointer-events-none" />
        </section>

        {/* STATS OVERVIEW */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 shrink-0">
          <div className="glass glass-card p-4 md:p-5 flex items-center gap-3 md:gap-4">
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center text-xl shrink-0">
              <FiMapPin />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-base-content/60 truncate">
                {t("dash.totalTrips")}
              </div>
              <div className="text-xl font-black">
                {safeTrips.length}{" "}
                <span className="text-sm font-normal text-base-content/50">
                  {t("dash.tripsUnit")}
                </span>
              </div>
            </div>
          </div>

          <div className="glass glass-card p-4 md:p-5 flex items-center gap-3 md:gap-4">
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-accent/15 text-accent flex items-center justify-center text-xl shrink-0">
              <FiCalendar />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-base-content/60 truncate">
                {t("dash.upcoming")}
              </div>
              <div className="text-xl font-black">
                {
                  safeTrips.filter(
                    (t) => t.startDate && new Date(t.startDate) > new Date()
                  ).length
                }
                <span className="text-sm font-normal text-base-content/50">
                  {" "}
                  {t("dash.tripsUnit")}
                </span>
              </div>
            </div>
          </div>

          <div className="glass glass-card p-4 md:p-5 flex items-center gap-3 md:gap-4">
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-info/15 text-info flex items-center justify-center text-xl shrink-0">
              <FiCheckCircle />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-base-content/60 truncate">
                {t("dash.finished")}
              </div>
              <div className="text-xl font-black">
                {
                  safeTrips.filter(
                    (t) => t.endDate && new Date(t.endDate) < new Date()
                  ).length
                }
                <span className="text-sm font-normal text-base-content/50">
                  {" "}
                  {t("dash.tripsUnit")}
                </span>
              </div>
            </div>
          </div>

          <div className="glass glass-card p-4 md:p-5 flex items-center gap-3 md:gap-4">
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-warning/15 text-warning flex items-center justify-center text-xl shrink-0">
              <FiTrendingUp />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-base-content/60 truncate">
                {t("dash.totalDays")}
              </div>
              <div className="text-xl font-black">
                {safeTrips.reduce((sum, t) => sum + (t.totalDays || t.days?.length || 0), 0)}{" "}
                <span className="text-sm font-normal text-base-content/50">
                  {t("dash.daysUnit")}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* TRIPS LIST SECTION */}
          <section className="lg:col-span-2 space-y-4 min-w-0">
            <div className="flex justify-between items-center px-1 gap-2">
              <div className="min-w-0">
                <h2 className="text-xl md:text-2xl font-extrabold">{t("dash.myPlans")}</h2>
                <p className="text-sm text-base-content/60">
                  {t("dash.myPlansSub")}
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-2 bg-base-100/40 p-1 rounded-full border border-base-content/10 shrink-0">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`btn btn-sm btn-circle border-none ${
                    viewMode === "grid"
                      ? "btn-primary"
                      : "btn-ghost text-base-content/60"
                  }`}
                >
                  <FiGrid />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`btn btn-sm btn-circle border-none ${
                    viewMode === "list"
                      ? "btn-primary"
                      : "btn-ghost text-base-content/60"
                  }`}
                >
                  <FiList />
                </button>
              </div>
            </div>

            {/* Loading vs Cards */}
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 space-y-3 glass rounded-2xl">
                <FiLoader className="animate-spin text-primary text-3xl" />
                <p className="text-sm text-base-content/60">
                  {t("dash.loadingTrips")}
                </p>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
                    : "space-y-3"
                }
              >
                {/* Cards List */}
                {filteredTrips.map((trip) => {
                  const status = getTripStatus(trip.startDate, trip.endDate);

                  return (
                    <div
                      key={trip.id}
                      onClick={() => navigate(`/trips/${trip.id}`)}
                      className="glass glass-card p-5 space-y-4 relative cursor-pointer"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${status.color}`}
                        >
                          {status.label}
                        </span>
                        <div className="flex items-center gap-2 min-w-0">
                          {trip.destination && (
                            <span className="text-sm font-bold text-primary hidden sm:flex items-center gap-1 truncate">
                              <FiMapPin className="text-base shrink-0" />{" "}
                              <span className="truncate">{trip.destination}</span>
                            </span>
                          )}
                          <button
                            onClick={(e) => handleDeleteTrip(e, trip.id)}
                            title={t("common.delete")}
                            className="btn btn-ghost btn-sm btn-circle text-error/60 hover:text-error hover:bg-error/10 shrink-0"
                          >
                            <FiTrash2 className="text-lg hover:text-red-400" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold line-clamp-1">
                          {trip.tripName || trip.title}
                        </h3>
                        <p className="text-sm text-base-content/60 mt-1 flex items-center gap-1 flex-wrap">
                          <FiCalendar className="text-primary shrink-0" />
                          {formatDate(trip.startDate)} -{" "}
                          {formatDate(trip.endDate)}
                          {trip.totalDays > 0 && ` (${trip.totalDays} ${t("dash.daysUnit")})`}
                        </p>
                        {(trip.tripDescription || trip.description) && (
                          <p className="text-sm text-base-content/50 mt-1 line-clamp-2 leading-relaxed">
                            {trip.tripDescription || trip.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-base-content/10 flex justify-between items-center text-sm gap-2">
                        <span className="text-base-content/60 flex items-center gap-1 min-w-0">
                          <FiCompass className="shrink-0" />{" "}
                          <span className="truncate">
                          {trip.totalDays !== undefined
                            ? `${trip.totalDays} ${t("dash.daysActivity")}`
                            : trip.days?.length
                            ? `${trip.days.length} ${t("dash.daysActivity")}`
                            : t("dash.noActivity")}
                          </span>
                        </span>
                        <button className="btn btn-sm btn-ghost text-primary hover:bg-primary/10 rounded-full gap-1 text-sm shrink-0">
                          {t("dash.viewTrip")} <FiChevronRight />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Quick Add Card */}
                <div
                  onClick={() => modalRef.current?.showModal()}
                  className="glass glass-card p-5 border-dashed border-2 border-primary/30 flex flex-col justify-center items-center text-center space-y-2 min-h-40 cursor-pointer"
                >
                  <button
                    className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center text-lg pointer-events-none"
                    type="button"
                  >
                    <FiPlus />
                  </button>
                  <div className="text-sm font-bold text-primary">
                    {t("dash.quickAdd")}
                  </div>
                  <div className="text-xs text-base-content/50">
                    {t("dash.quickAddSub")}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-6 min-w-0">
            <div className="glass glass-card p-5 space-y-4 bg-gradient-to-b from-primary/10 to-transparent">
              <div className="flex items-center gap-2 text-sm font-bold text-primary">
                <span>✨</span> {t("dash.aiTitle")}
              </div>
              <h3 className="text-base font-bold">{t("dash.aiQ")}</h3>
              <p className="text-sm text-base-content/70 leading-relaxed">
                {t("dash.aiSub")}
              </p>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder={t("dash.aiPh")}
                  className="input w-full text-sm rounded-full bg-base-100/50"
                  disabled
                />
                <button
                  className="btn btn-primary btn-sm w-full rounded-full text-sm"
                  disabled
                  title={t("dash.aiSoonNote")}
                >
                  {t("dash.aiSoon")}
                </button>
                <p className="text-xs text-base-content/50 text-center leading-relaxed">
                  {t("dash.aiSoonNote")}
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* Modal Create Trip */}
        <dialog ref={modalRef} id="createtrip" className="modal px-4">
          <div className="modal-box relative max-w-lg w-full p-5 md:p-6">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3">
                ✕
              </button>
            </form>
            <CreateTrip onClose={() => modalRef.current?.close()} />
          </div>
        </dialog>
      </div>
    </div>
  );
}

export default Dashboard;
