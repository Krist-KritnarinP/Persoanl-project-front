import React from "react";
import { FiClock, FiEdit2, FiTrash2 } from "react-icons/fi";

export default function ActivityItem({
  activity,
  typeConfig,
  formatZonedTime,
  onEdit,
  onDelete,
}) {
  const Icon = typeConfig?.icon || FiClock;

  return (
    <div className="flex items-center justify-between p-4 rounded-2xl glass bg-white/5 hover:bg-white/10 transition-all border border-white/10 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {/* Type Icon */}
        <div className={`p-3 rounded-xl shrink-0 ${typeConfig?.color || "badge-primary"}`}>
          <Icon className="text-xl" />
        </div>

        {/* Content Details */}
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base truncate">{activity.locationName}</span>
            <span className={`badge badge-sm ${typeConfig?.color}`}>{typeConfig?.label}</span>
          </div>

          {/* Time Display */}
          {activity.activityTime && formatZonedTime && (
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 bg-base-200/60 px-2 py-0.5 rounded-md text-base-content/80 font-medium">
                <FiClock className="text-xs" />
                <span>{formatZonedTime(activity.activityTime)} น.</span>
              </span>
            </div>
          )}

          {activity.description && (
            <p className="text-xs opacity-70 truncate">{activity.description}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onEdit(activity)}
          className="btn btn-ghost btn-xs text-info hover:bg-white/20"
        >
          <FiEdit2 />
        </button>
        <button
          onClick={() => onDelete(activity.id)}
          className="btn btn-ghost btn-xs text-error hover:bg-white/20"
        >
          <FiTrash2 />
        </button>
      </div>
    </div>
  );
}
