import { useState, useMemo, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { FiMapPin, FiCalendar, FiCreditCard, FiCompass } from "react-icons/fi";
import { useLang } from "@/i18n";
import TravelCalendar from "@/components/travel/TravelCalendar";
import useTravelOverview from "@/hooks/useTravelOverview";
import { dateKey, travelStatus, tripsOnDate } from "@/utils/travelOverview";
const TravelMap = lazy(() => import("@/components/travel/TravelMap"));
const statuses = ["all", "past", "ongoing", "upcoming", "undated"];
export default function TravelOverview() {
  const { t, locale } = useLang();
  const { trips, loading, error, retry } = useTravelOverview();
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const filtered = useMemo(
    () =>
      trips.filter(
        (trip) =>
          filter === "all" ||
          travelStatus(trip.startDate, trip.endDate) === filter,
      ),
    [trips, filter],
  );
  const visible = useMemo(
    () => (selected ? tripsOnDate(filtered, selected) : filtered),
    [filtered, selected],
  );
  const money = (value) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "THB",
      maximumFractionDigits: 2,
    }).format(value);
  const formatDate = (value) =>
    dateKey(value)
      ? new Date(`${dateKey(value)}T12:00:00`).toLocaleDateString(locale, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : t("dash.noDate");
  const points = visible.reduce((sum, trip) => sum + trip.points.length, 0);
  const total =
    visible.reduce((sum, trip) => sum + Math.round(trip.totalCost * 100), 0) /
    100;
  const stats = [
    [FiCompass, t("dash.totalTrips"), visible.length],
    [FiMapPin, t("travel.pins"), points],
    [
      FiCalendar,
      t("travel.past"),
      visible.filter(
        (trip) => travelStatus(trip.startDate, trip.endDate) === "past",
      ).length,
    ],
    [FiCreditCard, t("travel.cost"), money(total)],
  ];
  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <section className="space-y-2">
        <p className="text-sm font-semibold text-primary">AI LHOUNG</p>
        <h1 className="text-3xl md:text-4xl font-bold">{t("travel.title")}</h1>
        <p className="text-base-content/70">{t("travel.subtitle")}</p>
      </section>
      {loading ? (
        <div role="status" className="p-16 text-center">
          <span className="loading loading-spinner" />
          <p>{t("dash.loadingTrips")}</p>
        </div>
      ) : error ? (
        <div role="alert" className="alert">
          <p>{t("travel.error")}</p>
          <button className="btn" onClick={retry}>
            {t("travel.retry")}
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2" aria-label={t("travel.filter")}>
            {statuses.map((status) => (
              <button
                key={status}
                className={`btn btn-sm ${filter === status ? "btn-primary" : "btn-outline"}`}
                aria-pressed={filter === status}
                onClick={() => {
                  setFilter(status);
                  setSelected(null);
                }}
              >
                {t(`travel.${status}`)}
              </button>
            ))}
          </div>
          {selected && (
            <button
              className="btn btn-sm btn-outline"
              onClick={() => setSelected(null)}
            >
              {selected} · {t("travel.clear")}
            </button>
          )}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map(([Icon, label, value]) => (
              <div
                key={label}
                className="bg-base-100 border border-base-content/10 rounded-2xl p-4 sm:p-5 min-w-0"
              >
                <Icon className="text-primary text-xl mb-3" />
                <p className="text-sm text-base-content/70">{label}</p>
                <p className="text-xl sm:text-2xl font-bold break-words mt-1">
                  {value}
                </p>
              </div>
            ))}
          </section>
          <p className="text-sm text-base-content/70">{t("travel.note")}</p>
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5 items-start">
            <section className="bg-base-100 rounded-2xl border border-base-content/10 p-4 sm:p-5 space-y-3 min-w-0">
              <h2 className="text-lg font-bold">{t("travel.map")}</h2>
              <div className="flex flex-wrap gap-3 text-sm">
                <span>🔵 {t("travel.past")}</span>
                <span>🟠 {t("travel.ongoing")}</span>
                <span>🟣 {t("travel.upcoming")}</span>
                <span>⚪ {t("travel.undated")}</span>
              </div>
              <Suspense
                fallback={
                  <div className="h-90 grid place-items-center">
                    <span className="loading loading-spinner" />
                  </div>
                }
              >
                <TravelMap trips={visible} />
              </Suspense>
              <p className="text-xs text-base-content/60">
                {t("travel.mapNote")}
              </p>
            </section>
            <TravelCalendar
              trips={filtered}
              selected={selected}
              onSelect={setSelected}
            />
          </div>
          <section className="space-y-3">
            <h2 className="text-xl font-bold">{t("travel.trips")}</h2>
            {!visible.length && (
              <div className="bg-base-100 rounded-2xl p-8 text-center">
                <p>{t("travel.empty")}</p>
                <Link to="/dashboard" className="btn btn-primary mt-4">
                  {t("planner.back")}
                </Link>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-3">
              {visible.map((trip) => (
                <Link
                  key={trip.id}
                  to={`/trips/${trip.id}`}
                  className="bg-base-100 hover:border-primary border border-base-content/15 rounded-2xl p-5 space-y-2 min-w-0"
                  data-testid="travel-trip"
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <h3 className="font-bold break-words">{trip.tripName}</h3>
                    <span className="badge badge-outline text-xs">
                      {t(
                        `travel.${travelStatus(trip.startDate, trip.endDate)}`,
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-base-content/70 break-words">
                    {trip.destination}
                  </p>
                  <p className="text-sm">
                    {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                  </p>
                  <div className="border-t border-base-content/10 pt-3 flex flex-wrap justify-between gap-2">
                    <span className="text-sm">{t("travel.cost")}</span>
                    <strong>{money(trip.totalCost)}</strong>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
