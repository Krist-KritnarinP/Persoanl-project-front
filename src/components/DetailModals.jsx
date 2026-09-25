import React from "react";
import { FiClock, FiEdit2, FiTag, FiDollarSign, FiAlignLeft, FiFlag } from "react-icons/fi";
import { useLang } from "@/i18n";

export default function ActivityDetailModal({ activity, typeConfig, formatZonedTime, onClose, onEdit }) {
  const { t, locale } = useLang();
  if (!activity) return null;
  const Icon = typeConfig?.icon || FiClock;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={onClose}>
      <div
        className="glass rounded-3xl border border-white/30 p-5 md:p-6 w-full max-w-md max-h-[85vh] overflow-y-auto custom-scrollbar space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className={`p-3 rounded-2xl shrink-0 ${typeConfig?.color || "badge-primary"}`}>
            <Icon className="text-2xl" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-xl sm:text-2xl break-words leading-snug">{activity.locationName}</h3>
            <span className={`badge mt-1.5 ${typeConfig?.color || ""}`}>{typeConfig?.label}</span>
          </div>
        </div>

        <dl className="space-y-2.5 text-sm sm:text-base">
          {activity.activityDate && (
            <div className="flex items-center gap-2.5">
              <FiClock className="text-primary shrink-0" />
              <dt className="opacity-60 shrink-0">{t("act.date")}</dt>
              <dd className="font-semibold">
                {new Date(activity.activityDate).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" })}
                {activity.activityTime && formatZonedTime ? ` • ${formatZonedTime(activity.activityTime)}` : ""}
              </dd>
            </div>
          )}
          <div className="flex items-center gap-2.5">
            <FiTag className="text-primary shrink-0" />
            <dt className="opacity-60 shrink-0">{t("act.desc")}</dt>
            <dd className="font-medium">{activity.status || "planned"}</dd>
          </div>
          <div className="flex items-center gap-2.5">
            <FiDollarSign className="text-primary shrink-0" />
            <dt className="opacity-60 shrink-0">{t("act.price")}</dt>
            <dd className="font-bold">{Number(activity.price || 0).toLocaleString(locale)}</dd>
          </div>
          {activity.description && (
            <div className="flex items-start gap-2.5">
              <FiAlignLeft className="text-primary shrink-0 mt-1" />
              <dd className="leading-relaxed whitespace-pre-line">{activity.description}</dd>
            </div>
          )}
        </dl>

        <div className="flex gap-2 pt-1">
          {onEdit && (
            <button onClick={() => { onClose(); onEdit(activity); }} className="btn btn-primary rounded-full gap-2 flex-1">
              <FiEdit2 /> {t("common.edit")}
            </button>
          )}
          <button onClick={onClose} className="btn btn-ghost glass rounded-full flex-1">
            {t("common.close")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function DayDetailModal({ day, formatDate, formatZonedTime, onClose, typeLabel }) {
  const { t } = useLang();
  if (!day) return null;
  const budget = day.activities?.reduce((s, a) => s + (Number(a.price) || 0), 0) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={onClose}>
      <div
        className="glass rounded-3xl border border-white/30 p-5 md:p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto custom-scrollbar space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h3 className="font-bold text-xl sm:text-2xl flex items-center gap-2">
            <FiFlag className="text-primary" /> Day {day.dayCount}
          </h3>
          <p className="text-sm sm:text-base opacity-70 mt-0.5">{formatDate(day.dayDate)}</p>
          {day.description && (
            <p className="text-sm sm:text-base opacity-80 mt-1.5 leading-relaxed whitespace-pre-line">{day.description}</p>
          )}
          <p className="text-sm sm:text-base font-semibold mt-2 text-primary">
            {day.activities?.length || 0} {t("day.ovActs")} • {budget.toLocaleString()} {t("day.baht")}
          </p>
        </div>

        <div className="space-y-2">
          {(day.activities || []).map((act) => (
            <div key={act.id} className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 text-sm sm:text-base">
              <span className="w-1.5 h-1.5 rounded-full bg-accent/70 shrink-0" />
              <span className="font-medium truncate flex-1">{act.locationName}</span>
              {typeLabel && <span className="text-xs opacity-60 shrink-0">{typeLabel(act.activityType)}</span>}
              {act.activityTime && formatZonedTime && (
                <span className="text-xs sm:text-sm bg-base-200/60 px-2 py-0.5 rounded-md shrink-0">
                  {formatZonedTime(act.activityTime)}
                </span>
              )}
            </div>
          ))}
          {(!day.activities || day.activities.length === 0) && (
            <p className="text-sm text-base-content/60 text-center py-4">{t("day.noActs")}</p>
          )}
        </div>

        <button onClick={onClose} className="btn btn-ghost glass w-full rounded-full">
          {t("common.close")}
        </button>
      </div>
    </div>
  );
}
