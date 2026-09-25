import React from "react";
import { useLang } from "@/i18n";

export default function ActivityModal({
  isOpen,
  onClose,
  onSubmit,
  editingActivity,
  activityFormData,
  setActivityFormData,
}) {
  const { t } = useLang();
  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open px-4">
      <div className="modal-box bg-white text-slate-800 w-full max-w-lg shadow-2xl rounded-3xl space-y-4 border border-slate-200">
        <h3 className="font-bold text-xl border-b border-slate-200 pb-3 text-slate-900">
          {editingActivity ? t("act.editAct") : t("act.addAct")}
        </h3>

        <form onSubmit={(e) => onSubmit(e)} className="space-y-4">
          {/* ชื่อสถานที่ */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-sm text-slate-700">{t("act.location")}</span>
            </label>
            <input
              type="text"
              required
              placeholder={t("act.location")}
              className="input input-bordered rounded-xl bg-white text-slate-900 border-slate-300 text-base"
              value={activityFormData.locationName || ""}
              onChange={(e) =>
                setActivityFormData({ ...activityFormData, locationName: e.target.value })
              }
            />
          </div>

          {/* ประเภทกิจกรรม */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-sm text-slate-700">{t("act.attr")} / {t("act.rest")}</span>
            </label>
            <select
              className="select select-bordered w-full rounded-xl bg-white text-slate-900 border-slate-300 text-base"
              value={activityFormData.activityType || "ATTRACTION"}
              onChange={(e) =>
                setActivityFormData({ ...activityFormData, activityType: e.target.value })
              }
            >
              <option value="ATTRACTION" className="bg-white text-slate-900">{t("act.attr")}</option>
              <option value="RESTAURANT" className="bg-white text-slate-900">{t("act.rest")}</option>
              <option value="ACCOMMODATION" className="bg-white text-slate-900">{t("act.accom")}</option>
              <option value="TRANSPORT" className="bg-white text-slate-900">{t("act.transp")}</option>
            </select>
          </div>

          {/* ช่องกรอกเวลา */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-sm text-slate-700">⏰ {t("act.time")}</span>
              </label>
              <input
                type="time"
                required
                className="input input-bordered rounded-xl w-full bg-white text-slate-900 border-slate-300 text-base"
                value={activityFormData.activityTime || ""}
                onChange={(e) =>
                  setActivityFormData({ ...activityFormData, activityTime: e.target.value })
                }
              />
            </div>
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-sm text-slate-700">{t("act.price")}</span>
              </label>
              <input
                type="number"
                min="0"
                className="input input-bordered rounded-xl w-full bg-white text-slate-900 border-slate-300 text-base"
                value={activityFormData.price ?? 0}
                onChange={(e) =>
                  setActivityFormData({ ...activityFormData, price: e.target.value })
                }
              />
            </div>
          </div>

          {/* รายละเอียดเพิ่มเติม */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-sm text-slate-700">{t("act.desc")}</span>
            </label>
            <textarea
              className="textarea textarea-bordered rounded-xl text-base bg-white text-slate-900 border-slate-300"
              rows={2}
              value={activityFormData.description || ""}
              onChange={(e) =>
                setActivityFormData({ ...activityFormData, description: e.target.value })
              }
            />
          </div>

          <div className="modal-action pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost rounded-full text-slate-600 hover:bg-slate-100"
            >
              {t("common.cancel")}
            </button>
            <button type="submit" className="btn btn-primary rounded-full px-6">
              {t("common.save")}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
