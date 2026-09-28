import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { FiArrowUpRight } from "react-icons/fi";
import { useLang } from "@/i18n";
import useTravelOverview from "@/hooks/useTravelOverview";
const TravelMap = lazy(() => import("./TravelMap"));
export default function TravelOverviewCard() {
  const { t } = useLang();
  const { trips, loading, error, retry } = useTravelOverview();
  return (
    <section className="glass glass-card p-5 space-y-3">
      <h3 className="text-lg font-bold">{t("travel.title")}</h3>
      <p className="text-sm text-base-content/70">{t("travel.subtitle")}</p>
      {loading ? (
        <div className="h-44 grid place-items-center" role="status">
          <span className="loading loading-spinner" />
        </div>
      ) : error ? (
        <button className="btn btn-outline w-full" onClick={retry}>
          {t("travel.retry")}
        </button>
      ) : (
        <Suspense fallback={<div className="h-44" />}>
          <TravelMap trips={trips} preview />
        </Suspense>
      )}
      <Link to="/travel-overview" className="btn btn-primary w-full">
        {t("travel.open")} <FiArrowUpRight />
      </Link>
    </section>
  );
}
