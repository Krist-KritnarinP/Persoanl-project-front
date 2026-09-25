import React from "react";
import { useLang } from "@/i18n";

export default function DayModal({
  isOpen,
  onClose,
  onSubmit,
  editingDay,
  dayFormData,
  setDayFormData,
  hasDays,
}) {
  const { t } = useLang();
  if (!isOpen) return null;

  return (
    <div className="modal modal-open px-4">
      <div className="modal-box glass rounded-3xl border border-white/30 w-full max-w-lg max-h-[85vh] overflow-y-auto custom-scrollbar">
        <h3 className="font-bold text-xl mb-4">
          {editingDay ? `${t("day.editDay")} ${editingDay.dayCount}` : t("day.newDay")}
        </h3>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* แสดงช่องใส่วันเฉพาะเมื่อยังไม่มีวันเลย หรือเป็นการแก้ไขวัน */}
          {(!hasDays || editingDay) && (
            <div className="form-control">
              <label className="label text-sm font-semibold">{t("day.date")}</label>
              <input
                type="date"
                className="input input-bordered glass w-full text-base"
                value={dayFormData.dayDate}
                onChange={(e) =>
                  setDayFormData({ ...dayFormData, dayDate: e.target.value })
                }
                required={!hasDays}
              />
            </div>
          )}

          <div className="form-control">
            <label className="label text-sm font-semibold">{t("day.dayDesc")}</label>
            <textarea
              className="textarea textarea-bordered glass w-full text-base"
              placeholder={t("day.dayDescPh")}
              value={dayFormData.description}
              onChange={(e) =>
                setDayFormData({ ...dayFormData, description: e.target.value })
              }
            ></textarea>
          </div>

          <div className="modal-action">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost glass"
            >
              {t("common.cancel")}
            </button>
            <button type="submit" className="btn btn-primary">
              {t("common.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
