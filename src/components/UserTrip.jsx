import React, { useState } from "react";
import useTripStore from "@/stores/tripStore";

function UserTrip({ onClose }) {
  const { createTrip, loading } = useTripStore();

  const [formData, setFormData] = useState({
    tripName: "",
    destination: "",
    startDate: "",
    endDate: "",
    tripDescription: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      // 1. เรียกใช้งาน createTrip จาก Zustand Store
      const res = await createTrip(formData);

      // 2. Debug Log เพื่อตรวจสอบโครงสร้าง Response ใน Console
      console.log("Create Trip API Response:", res);

      // 3. ตรวจสอบการสร้างสำเร็จ (รองรับทั้ง res.data, res.id, หรือ res.message)
      if (res) {
        // Reset Form
        setFormData({
          tripName: "",
          destination: "",
          startDate: "",
          endDate: "",
          tripDescription: "",
        });

        // ปิด Modal เมื่อสำเร็จ
        if (onClose) {
          onClose();
        }
      } else {
        setErrorMessage("เกิดข้อผิดพลาด ไม่สามารถสร้างทริปได้");
      }
    } catch (err) {
      console.error("Submit Create Trip Error:", err);
      // แสดงข้อความ Error ที่มาจาก Backend (ถ้ามี)
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "สร้างทริปไม่สำเร็จ: เกิดข้อผิดพลาด";
      setErrorMessage(msg);
    }
  };

  return (
    <div className="w-full">
      <h3 className="font-bold text-lg mb-4 text-primary">สร้างทริปใหม่</h3>

      {errorMessage && (
        <div className="alert alert-error text-xs mb-4 p-2 rounded-lg text-white">
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text text-xs font-semibold">ชื่อทริป *</span>
          </label>
          <input
            type="text"
            name="tripName"
            value={formData.tripName}
            onChange={handleChange}
            placeholder="เช่น ทริปเที่ยวเชียงใหม่ 3 วัน 2 คืน"
            className="input input-bordered input-sm w-full rounded-xl"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text text-xs font-semibold">จุดหมายปลายทาง</span>
          </label>
          <input
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            placeholder="เช่น เชียงใหม่, ญี่ปุ่น"
            className="input input-bordered input-sm w-full rounded-xl"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-xs font-semibold">วันเริ่มต้น</span>
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="input input-bordered input-sm w-full rounded-xl"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-xs font-semibold">วันสิ้นสุด</span>
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="input input-bordered input-sm w-full rounded-xl"
            />
          </div>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text text-xs font-semibold">รายละเอียดเพิ่มเติม</span>
          </label>
          <textarea
            name="tripDescription"
            value={formData.tripDescription}
            onChange={handleChange}
            placeholder="คำอธิบาย หรือบันทึกเพิ่มเติมเกี่ยวกับทริป..."
            className="textarea textarea-bordered textarea-sm w-full rounded-xl h-20 resize-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost rounded-full text-xs"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-sm btn-primary rounded-full text-xs px-6"
          >
            {loading ? "กำลังบันทึก..." : "สร้างทริป"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserTrip;
// import { useForm } from "react-hook-form";
// import { toast } from "react-toastify";
// import { mainApi } from "@/api/mainApi";

// function CreateTrip() {
//   const { register, handleSubmit, reset } = useForm({
//     mode: "onSubmit",
//     defaultValues: {
//       tripName: "",
//       destination: "",
//       startDate: "",
//       endDate: "",
//       tripDescription: "",
//     }
//   });

//   const onSubmit = async (data) => {
//     try {
//       const resp = await mainApi.post('/trips', data);
//       toast.success(resp.data?.message || "สร้างทริปสำเร็จ!");
//       reset();
//     } catch (err) {
//       console.log(err, err.response?.data);
//       toast.error(err.response?.data?.message || err.response?.data?.error || "เกิดข้อผิดพลาดในการสร้างทริป");
//     }
//   };

//   return (
//     <>
//       <div className="text-3xl text-center opacity-70">
//         Create New Trip
//       </div>
//       <div className="divider opacity-60"></div>

//       <form
//         onSubmit={handleSubmit(onSubmit)}
//         className="flex flex-col gap-5 p-4 pt-3"
//       >
//         {/* Trip Name */}
//         <div className="w-full">
//           <input
//             type="text"
//             {...register('tripName')}
//             placeholder="ชื่อทริป (Trip Name)"
//             className="input input-bordered w-full"  
//           />
//         </div>

//         {/* Destination */}
//         <div className="w-full">
//           <input
//             type="text"
//             {...register('destination')}
//             placeholder="จุดหมายปลายทาง (Destination)"
//             className="input input-bordered w-full"
//           />
//         </div>

//         {/* Start Date */}
//         <div className="w-full">
//           <label className="label text-xs opacity-70 pb-1">วันเริ่มทริป</label>
//           <input
//             type="date"
//             {...register('startDate')}
//             className="input input-bordered w-full"
//           />
//         </div>

//         {/* End Date */}
//         <div className="w-full">
//           <label className="label text-xs opacity-70 pb-1">วันสิ้นสุดทริป</label>
//           <input
//             type="date"
//             {...register('endDate')}
//             className="input input-bordered w-full"
//           />
//         </div>

//         {/* Trip Description */}
//         <div className="w-full">
//           <textarea
//             {...register('tripDescription')}
//             placeholder="รายละเอียดทริปเพิ่มเติม (Trip Description)"
//             className="textarea textarea-bordered w-full h-24"
//           />
//         </div>

//         <button className="btn btn-primary text-xl text-white" type="submit">
//           Create Plan
//         </button>
//         <button 
//           className="btn btn-warning text-xl text-white"
//           type="button" 
//           onClick={() => reset()}
//         >
//           Reset
//         </button>
//       </form>
//     </>
//   );
// }

// export default CreateTrip;

