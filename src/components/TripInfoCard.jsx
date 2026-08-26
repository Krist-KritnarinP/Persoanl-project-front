import React from "react";
import { FiMapPin, FiCalendar } from "react-icons/fi";

export default function TripInfoCard({ trip, formatDate }) {
  return (
    <div className="glass glass-card p-6 rounded-3xl space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-base-content">
            {trip?.tripName || "รายละเอียดทริป"}
          </h1>
          <p className="text-sm opacity-80 flex items-center gap-2 mt-1">
            <FiMapPin className="text-primary" />
            {trip?.destination || "ไม่ระบุจุดหมายปลายทาง"}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/30 text-sm">
          <FiCalendar className="text-primary" />
          <span>
            {formatDate(trip?.startDate)} - {formatDate(trip?.endDate)}
          </span>
        </div>
      </div>
      {trip?.tripDescription && (
        <p className="text-sm opacity-75 pt-2 border-t border-white/20">
          {trip.tripDescription}
        </p>
      )}
    </div>
  );
}