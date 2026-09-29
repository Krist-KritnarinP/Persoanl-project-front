import { useLang } from "@/i18n";
import React from "react";
import { FiClock, FiEdit2, FiTrash2 } from "react-icons/fi";

export default function ActivityItem({
  activity,
  typeConfig,
  formatZonedTime,
  onEdit,
  onDelete,
  onView,
}) {
  const { t } = useLang();
  const Icon = typeConfig?.icon || FiClock;

  return (
    <div
      onClick={() => onView && onView(activity)}
      className={`flex items-center justify-between p-4 rounded-2xl glass bg-white/5 hover:bg-white/10 transition-all border border-white/10 gap-3 ${onView ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Type Icon */}
        <div
          className={`p-3 rounded-xl shrink-0 ${typeConfig?.color || "badge-primary"}`}
        >
          <Icon className="text-xl" />
        </div>

        {/* Content Details */}
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-base sm:text-lg truncate">
              {activity.locationName}
            </span>
            <span className={`badge badge-sm ${typeConfig?.color}`}>
              {typeConfig?.label}
            </span>
          </div>

          {/* Time Display */}
          {activity.activityTime && formatZonedTime && (
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1 bg-base-200/60 px-2 py-0.5 rounded-md text-base-content/80 font-medium">
                <FiClock className="text-sm" />
                <span>{formatZonedTime(activity.activityTime)}</span>
              </span>
              {activity.price > 0 && (
                <span className="bg-base-200/60 px-2 py-0.5 rounded-md font-medium">
                  {Number(activity.price).toLocaleString()}
                </span>
              )}
            </div>
          )}

          {activity.description && (
            <p className="text-sm opacity-70 leading-relaxed line-clamp-2">
              {activity.description}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex sm:flex-col md:flex-row items-center gap-1 shrink-0">
        {onEdit && <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(activity);
          }}
          className="btn btn-ghost btn-sm text-info hover:bg-white/20"
          aria-label={t("common.edit")}
        >
          <FiEdit2 />
        </button>}
        {onDelete && <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(activity.id);
          }}
          className="btn btn-ghost btn-sm text-error hover:bg-white/20"
          aria-label={t("common.delete")}
        >
          <FiTrash2 />
        </button>}
      </div>
    </div>
  );
}
