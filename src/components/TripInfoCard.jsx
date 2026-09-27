import React from "react";
import { FiMapPin, FiCalendar } from "react-icons/fi";
import { useLang } from "@/i18n";

export default function TripInfoCard({ trip, formatDate }) {
  const { t } = useLang();
  return (
    <div className="glass glass-card p-5 md:p-6 rounded-3xl space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-extrabold text-base-content break-words">
            {trip?.tripName || t("dash.myPlans")}
          </h1>
          <p className="text-sm sm:text-base opacity-80 flex items-center gap-2 mt-1">
            <FiMapPin className="text-primary shrink-0" />
            {trip?.destination || t("day.noDest")}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-base-100/60 px-4 py-2 rounded-full border border-base-content/10 text-sm sm:text-base shrink-0 self-start md:self-auto">
          <FiCalendar className="text-primary shrink-0" />
          <span className="whitespace-nowrap">
            {formatDate(trip?.startDate)} - {formatDate(trip?.endDate)}
          </span>
        </div>
      </div>
      {trip?.tripDescription && (
        <p className="text-sm sm:text-base opacity-75 pt-2 border-t border-base-content/10 leading-relaxed">
          {trip.tripDescription}
        </p>
      )}
    </div>
  );
}
