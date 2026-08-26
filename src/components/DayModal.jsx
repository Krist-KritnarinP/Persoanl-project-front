import React from "react";

export default function DayModal({
  isOpen,
  onClose,
  onSubmit,
  editingDay,
  dayFormData,
  setDayFormData,
  hasDays,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box glass rounded-3xl border border-white/30">
        <h3 className="font-bold text-lg mb-4">
          {editingDay ? `แก้ไข Day ${editingDay.dayCount}` : "เพิ่มวันเดินทางใหม่"}
        </h3>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* แสดงช่องใส่วันเฉพาะเมื่อยังไม่มีวันเลย หรือเป็นการแก้ไขวัน */}
          {(!hasDays || editingDay) && (
            <div className="form-control">
              <label className="label text-xs font-semibold">วันที่</label>
              <input
                type="date"
                className="input input-bordered glass w-full"
                value={dayFormData.dayDate}
                onChange={(e) =>
                  setDayFormData({ ...dayFormData, dayDate: e.target.value })
                }
                required={!hasDays}
              />
            </div>
          )}

          <div className="form-control">
            <label className="label text-xs font-semibold">คำอธิบายวัน</label>
            <textarea
              className="textarea textarea-bordered glass w-full"
              placeholder="เช่น Day 1: เดินทางถึงสนามบินนาริตะ"
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
              ยกเลิก
            </button>
            <button type="submit" className="btn btn-primary">
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}