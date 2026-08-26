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
// import React from "react";

// export default function ActivityModal({
//   isOpen,
//   onClose,
//   onSubmit,
//   editingActivity,
//   activityFormData,
//   setActivityFormData,
// }) {
//   if (!isOpen) return null;

//   return (
//     <div className="modal modal-open">
//       <div className="modal-box glass rounded-3xl border border-white/30 max-w-lg">
//         <h3 className="font-bold text-lg mb-4">
//           {editingActivity ? "แก้ไขกิจกรรม" : "เพิ่มกิจกรรมใหม่"}
//         </h3>
//         <form onSubmit={onSubmit} className="space-y-4">
//           <div className="form-control">
//             <label className="label text-xs font-semibold">ประเภทกิจกรรม</label>
//             {/* 🔑 แก้ไขจุดนี้: ถอด glass ออก ใช้ bg-white (หรือ bg-base-100) และทึบแสง */}
//             <select
//               className="select select-bordered w-full bg-white text-gray-800 focus:bg-white"
//               value={activityFormData.activityType}
//               onChange={(e) =>
//                 setActivityFormData({
//                   ...activityFormData,
//                   activityType: e.target.value,
//                 })
//               }
//             >
//               <option value="ATTRACTION" className="bg-white text-gray-800">
//                 สถานที่ท่องเที่ยว (ATTRACTION)
//               </option>
//               <option value="RESTAURANT" className="bg-white text-gray-800">
//                 อาหาร / ร้านค้า (RESTAURANT)
//               </option>
//               <option value="ACCOMMODATION" className="bg-white text-gray-800">
//                 ที่พัก (ACCOMMODATION)
//               </option>
//               <option value="TRANSPORT" className="bg-white text-gray-800">
//                 การเดินทาง (TRANSPORT)
//               </option>
//             </select>
//           </div>

//           <div className="form-control">
//             <label className="label text-xs font-semibold">
//               ชื่อสถานที่ / กิจกรรม *
//             </label>
//             <input
//               type="text"
//               placeholder="เช่น วัดเซ็นโซจิ (อาซากุสะ)"
//               className="input input-bordered glass w-full"
//               value={activityFormData.locationName}
//               onChange={(e) =>
//                 setActivityFormData({
//                   ...activityFormData,
//                   locationName: e.target.value,
//                 })
//               }
//               required
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="form-control">
//               <label className="label text-xs font-semibold">วันที่</label>
//               <input
//                 type="date"
//                 className="input input-bordered glass w-full"
//                 value={activityFormData.activityDate}
//                 onChange={(e) =>
//                   setActivityFormData({
//                     ...activityFormData,
//                     activityDate: e.target.value,
//                   })
//                 }
//               />
//             </div>

//             <div className="form-control">
//               <label className="label text-xs font-semibold">เวลา</label>
//               <input
//                 type="time"
//                 className="input input-bordered glass w-full"
//                 value={activityFormData.activityTime}
//                 onChange={(e) =>
//                   setActivityFormData({
//                     ...activityFormData,
//                     activityTime: e.target.value,
//                   })
//                 }
//               />
//             </div>
//           </div>

//           <div className="form-control">
//             <label className="label text-xs font-semibold">ค่าใช้จ่าย (บาท)</label>
//             <input
//               type="number"
//               step="0.01"
//               placeholder="0.00"
//               className="input input-bordered glass w-full"
//               value={activityFormData.price}
//               onChange={(e) =>
//                 setActivityFormData({
//                   ...activityFormData,
//                   price: e.target.value,
//                 })
//               }
//             />
//           </div>

//           <div className="form-control">
//             <label className="label text-xs font-semibold">รายละเอียดเพิ่มเติม</label>
//             <textarea
//               className="textarea textarea-bordered glass w-full"
//               placeholder="เช่น เดินเล่นถนนนากามิเซะ ซื้อของฝาก"
//               value={activityFormData.description}
//               onChange={(e) =>
//                 setActivityFormData({
//                   ...activityFormData,
//                   description: e.target.value,
//                 })
//               }
//             ></textarea>
//           </div>

//           <div className="modal-action">
//             <button
//               type="button"
//               onClick={onClose}
//               className="btn btn-ghost glass"
//             >
//               ยกเลิก
//             </button>
//             <button type="submit" className="btn btn-primary">
//               บันทึก
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }