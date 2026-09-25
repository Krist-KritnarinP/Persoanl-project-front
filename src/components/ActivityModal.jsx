import React from "react";

export default function ActivityModal({
  isOpen,
  onClose,
  onSubmit,
  editingActivity,
  activityFormData,
  setActivityFormData,
}) {
  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box bg-white text-slate-800 max-w-lg shadow-2xl rounded-3xl space-y-4 border border-slate-200">
        <h3 className="font-bold text-lg border-b border-slate-200 pb-3 text-slate-900">
          {editingActivity ? "แก้ไขกิจกรรม" : "เพิ่มกิจกรรมใหม่"}
        </h3>

        <form onSubmit={(e) => onSubmit(e)} className="space-y-4">
          {/* ชื่อสถานที่ */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-xs text-slate-700">ชื่อสถานที่/กิจกรรม</span>
            </label>
            <input
              type="text"
              required
              placeholder="ระบุสถานที่..."
              className="input input-bordered input-sm rounded-xl bg-white text-slate-900 border-slate-300"
              value={activityFormData.locationName || ""}
              onChange={(e) =>
                setActivityFormData({ ...activityFormData, locationName: e.target.value })
              }
            />
          </div>

          {/* ประเภทกิจกรรม */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-xs text-slate-700">ประเภทกิจกรรม</span>
            </label>
            <select
              className="select select-bordered select-sm w-full rounded-xl bg-white text-slate-900 border-slate-300"
              value={activityFormData.activityType || "ATTRACTION"}
              onChange={(e) =>
                setActivityFormData({ ...activityFormData, activityType: e.target.value })
              }
            >
              <option value="ATTRACTION" className="bg-white text-slate-900">สถานที่ท่องเที่ยว</option>
              <option value="RESTAURANT" className="bg-white text-slate-900">อาหาร/ร้านค้า</option>
              <option value="ACCOMMODATION" className="bg-white text-slate-900">ที่พัก</option>
              <option value="TRANSPORT" className="bg-white text-slate-900">การเดินทาง</option>
            </select>
          </div>

          {/* ช่องกรอกเวลา */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-xs text-slate-700">⏰ เวลา</span>
            </label>
            <input
              type="time"
              required
              className="input input-bordered input-sm rounded-xl w-full bg-white text-slate-900 border-slate-300"
              value={activityFormData.activityTime || ""}
              onChange={(e) =>
                setActivityFormData({ ...activityFormData, activityTime: e.target.value })
              }
            />
          </div>

          {/* รายละเอียดเพิ่มเติม */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-xs text-slate-700">รายละเอียดเพิ่มเติม</span>
            </label>
            <textarea
              className="textarea textarea-bordered rounded-xl text-xs bg-white text-slate-900 border-slate-300"
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
              className="btn btn-ghost btn-sm rounded-full text-slate-600 hover:bg-slate-100"
            >
              ยกเลิก
            </button>
            <button type="submit" className="btn btn-primary btn-sm rounded-full px-6">
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
