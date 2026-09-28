import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCompass,
  FiMapPin,
  FiCalendar,
  FiPlus,
  FiSearch,
  FiChevronRight,
  FiGrid,
  FiList,
  FiLoader,
  FiTrash2,
} from "react-icons/fi";
import CreateTrip from "@/components/UserTrip";
import { useLang } from "@/i18n";
import useTripStore from "@/stores/tripStore";

function Dashboard() {
  const { t, locale } = useLang();
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");

  const modalRef = useRef(null);
  const navigate = useNavigate();

  // ดึง state & actions จาก Zustand Stores
  const { trips, loading, fetchTrips, deleteTrip } = useTripStore();

  // โหลดข้อมูลทริปเมื่อเปิดหน้าครั้งแรก
  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

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
    <div className="min-h-dvh w-full flex flex-col p-4 md:p-6 font-sans box-border">
      {/* ================= SCROLLABLE CONTENT CONTAINER ================= */}
      <div className="flex-1 space-y-6">
        {/* HERO BANNER */}
        <section className="glass rounded-4xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
          <div className="space-y-2 z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">
              <FiCompass />
              {t("dash.ready")}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">
              {t("side.trips")}
            </h1>
            <p className="text-base md:text-lg text-base-content/70 leading-relaxed">
              {t("dash.sub")}
            </p>
          </div>

          <div className="z-10 flex flex-wrap gap-3 w-full md:w-auto">
            <button
              type="button"
              className="btn btn-outline rounded-full px-6 flex-1 md:flex-none"
              onClick={() => navigate("/trips/ai")}
            >
              {t("planner.create")}
            </button>
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

        <label className="input flex items-center gap-2 w-full max-w-lg">
          <FiSearch aria-hidden="true" />
          <input
            type="search"
            aria-label={t("nav.searchPh")}
            placeholder={t("nav.searchPh")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="grow min-w-0"
          />
        </label>
        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 gap-6">
          {/* TRIPS LIST SECTION */}
          <section className="space-y-4 min-w-0">
            <div className="flex justify-between items-center px-1 gap-2">
              <div className="min-w-0">
                <h2 className="text-xl md:text-2xl font-extrabold">
                  {t("dash.myPlans")}
                </h2>
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
                              <span className="truncate">
                                {trip.destination}
                              </span>
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
                          {trip.totalDays > 0 &&
                            ` (${trip.totalDays} ${t("dash.daysUnit")})`}
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
