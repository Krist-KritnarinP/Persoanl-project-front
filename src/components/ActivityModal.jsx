import React, { useState } from "react";
import { FiHome, FiTruck, FiCoffee, FiNavigation, FiChevronDown, FiCheck } from "react-icons/fi";
import { useLang } from "@/i18n";

const TYPE_OPTIONS = [
  { value: "ATTRACTION", icon: FiNavigation, color: "badge-accent" },
  { value: "RESTAURANT", icon: FiCoffee, color: "badge-warning" },
  { value: "ACCOMMODATION", icon: FiHome, color: "badge-primary" },
  { value: "TRANSPORT", icon: FiTruck, color: "badge-info" },
];

export default function ActivityModal({
  isOpen,
  onClose,
  onSubmit,
  editingActivity,
  activityFormData,
  setActivityFormData,
}) {
  const { t } = useLang();
  const [typeOpen, setTypeOpen] = useState(false);
  if (!isOpen) return null;

  const TYPE_LABELS = {
    ATTRACTION: t("act.attr"),
    RESTAURANT: t("act.rest"),
    ACCOMMODATION: t("act.accom"),
    TRANSPORT: t("act.transp"),
  };
  const current = TYPE_OPTIONS.find((o) => o.value === (activityFormData.activityType || "ATTRACTION")) || TYPE_OPTIONS[0];
  const CurrentIcon = current.icon;

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

          {/* ประเภทกิจกรรม (custom dropdown มี icon) */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-sm text-slate-700">{t("act.attr")} / {t("act.rest")}</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setTypeOpen((v) => !v)}
                className="input input-bordered rounded-xl w-full bg-white text-slate-900 border-slate-300 text-base flex items-center gap-2.5 justify-between"
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <span className={`p-1.5 rounded-lg shrink-0 ${current.color}`}>
                    <CurrentIcon className="text-base" />
                  </span>
                  <span className="truncate">{TYPE_LABELS[current.value]}</span>
                </span>
                <FiChevronDown className={`shrink-0 transition-transform ${typeOpen ? "rotate-180" : ""}`} />
              </button>
              {typeOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setTypeOpen(false)} />
                  <ul className="absolute z-20 mt-1 w-full rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden py-1">
                    {TYPE_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const selected = opt.value === current.value;
                      return (
                        <li key={opt.value}>
                          <button
                            type="button"
                            onClick={() => {
                              setActivityFormData({ ...activityFormData, activityType: opt.value });
                              setTypeOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-base hover:bg-slate-100 ${selected ? "bg-slate-50 font-bold" : ""}`}
                          >
                            <span className={`p-1.5 rounded-lg shrink-0 ${opt.color}`}>
                              <Icon className="text-base" />
                            </span>
                            <span className="flex-1 text-left truncate">{TYPE_LABELS[opt.value]}</span>
                            {selected && <FiCheck className="text-primary shrink-0" />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>
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
