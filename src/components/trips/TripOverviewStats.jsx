import React from "react";
import { FiCalendar, FiList, FiDollarSign, FiFlag } from "react-icons/fi";

/** Displays totals calculated by the trip page. It does not fetch or change trip data. */
export default function TripOverviewStats({
  trip,
  totalDays,
  totalActs,
  totalBudget,
  formatDate,
  locale,
  t,
}) {
  return (
    <section className="flex gap-3 md:gap-4 overflow-x-auto pb-2 snap-x snap-mandatory custom-scrollbar">
      <div className="glass glass-card p-4 md:p-5 flex items-center gap-3 min-w-[220px] sm:min-w-[240px] xl:min-w-0 xl:flex-1 snap-start">
        <div className="w-11 h-11 rounded-2xl bg-primary/15 text-primary flex items-center justify-center text-xl shrink-0">
          <FiCalendar />
        </div>
        <div className="min-w-0">
          <div className="text-sm sm:text-base text-base-content/60">
            {t("day.ovDays")}
          </div>
          <div className="text-xl md:text-2xl font-black">{totalDays}</div>
        </div>
      </div>
      <div className="glass glass-card p-4 md:p-5 flex items-center gap-3 min-w-[220px] sm:min-w-[240px] xl:min-w-0 xl:flex-1 snap-start">
        <div className="w-11 h-11 rounded-2xl bg-accent/15 text-accent flex items-center justify-center text-xl shrink-0">
          <FiList />
        </div>
        <div className="min-w-0">
          <div className="text-sm sm:text-base text-base-content/60">
            {t("day.ovActs")}
          </div>
          <div className="text-xl md:text-2xl font-black">{totalActs}</div>
        </div>
      </div>
      <div className="glass glass-card p-4 md:p-5 flex items-center gap-3 min-w-[220px] sm:min-w-[240px] xl:min-w-0 xl:flex-1 snap-start">
        <div className="w-11 h-11 rounded-2xl bg-warning/15 text-warning flex items-center justify-center text-xl shrink-0">
          <FiDollarSign />
        </div>
        <div className="min-w-0">
          <div className="text-sm sm:text-base text-base-content/60">
            {t("day.ovBudget")}
          </div>
          <div className="text-xl md:text-2xl font-black truncate">
            {totalBudget.toLocaleString(locale)}{" "}
            <span className="text-sm font-normal text-base-content/50">
              {t("day.baht")}
            </span>
          </div>
        </div>
      </div>
      <div className="glass glass-card p-4 md:p-5 flex items-center gap-3 min-w-[220px] sm:min-w-[240px] xl:min-w-0 xl:flex-1 snap-start">
        <div className="w-11 h-11 rounded-2xl bg-info/15 text-info flex items-center justify-center text-xl shrink-0">
          <FiFlag />
        </div>
        <div className="min-w-0">
          <div className="text-sm sm:text-base text-base-content/60">
            {t("day.ovDuration")}
          </div>
          <div className="text-base md:text-lg font-black truncate">
            {formatDate(trip?.startDate)} – {formatDate(trip?.endDate)}
          </div>
        </div>
      </div>
    </section>
  );
}
