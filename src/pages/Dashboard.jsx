import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCompass,
  FiMapPin,
  FiCalendar,
  FiPlus,
  FiTrendingUp,
  FiCheckCircle,
  FiSearch,
  FiChevronRight,
  FiGrid,
  FiList,
  FiLogOut,
  FiLoader,
  FiTrash2,
} from "react-icons/fi";
import CreateTrip from "@/components/UserTrip";
import useTripStore from "@/stores/tripStore";
import useUserStore from "@/stores/userStore";

function Dashboard() {
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");

  const modalRef = useRef(null);
  const navigate = useNavigate();

  // ดึง state & actions จาก Zustand Stores
  const { trips, loading, fetchTrips, deleteTrip } = useTripStore();
  const logout = useUserStore((state) => state.logout);
  const user = useUserStore((state) => state.user);

  // โหลดข้อมูลทริปเมื่อเปิดหน้าครั้งแรก
  useEffect(() => {
    fetchTrips();
  }, []);

  // ดักจับเหตุการณ์เมื่อ Modal ปิดลง เพื่อสั่ง re-fetch ข้อมูลใหม่
  useEffect(() => {
    const modalElement = modalRef.current;
    if (!modalElement) return;

    const handleModalClose = () => {
      fetchTrips();
    };

    modalElement.addEventListener("close", handleModalClose);
    return () => {
      modalElement.removeEventListener("close", handleModalClose);
    };
  }, [fetchTrips]);

  // Helper: แปลงวันที่
  const formatDate = (dateString) => {
    if (!dateString) return "ยังไม่ระบุวัน";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "ยังไม่ระบุวัน";

    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Helper: คำนวณสถานะทริป
  const getTripStatus = (startDate, endDate) => {
    if (!startDate)
      return {
        label: "ร่างแผนทริป",
        color: "bg-base-content/10 text-base-content/70",
      };

    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;

    if (now > end) {
      return { label: "เดินทางเสร็จสิ้น", color: "bg-info/20 text-info" };
    } else if (now >= start && now <= end) {
      return { label: "กำลังเดินทางอยู่", color: "bg-success text-white" };
    } else {
      return { label: "กำลังจะเดินทาง", color: "bg-primary text-white" };
    }
  };

  // Handler: ลบทริป
  const handleDeleteTrip = async (e, tripId) => {
    e.stopPropagation(); // ป้องกันการคลิกซ้อนทับการ์ด
    if (window.confirm("คุณต้องการลบทริปนี้ใช่หรือไม่?")) {
      try {
        await deleteTrip(tripId);
      } catch (err) {
        console.error("Error deleting trip:", err);
      }
    }
  };

  // Filter ค้นหา
  const safeTrips = Array.isArray(trips) ? trips : [];
  const filteredTrips = safeTrips.filter((trip) => {
    const nameMatch = (trip.tripName || trip.title || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const destMatch = (trip.destination || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return nameMatch || destMatch;
  });

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col p-4 md:p-6 font-sans box-border">
      {/* ================= NAVBAR / HEADER ================= */}
      <header className="navbar glass rounded-full justify-between px-6 shadow-lg shrink-0 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-xl font-bold overflow-hidden">
            <img
              src="image/Minidog.PNG"
              alt="Minidog"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-3xl font-black tracking-wider bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI LHOUNG
            </span>
            <span className="text-[10px] block text-base-content/60 font-medium -mt-1">
              Travel Planner Dashboard
            </span>
          </div>
        </div>

        {/* Search Input */}
        <div className="hidden md:flex items-center gap-2">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/50" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาทริป, จุดหมาย..."
              className="input input-sm pl-10 pr-4 py-4 text-xs w-110 rounded-full border-none focus:outline-none bg-base-100/50"
            />
          </div>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 pr-2 border-r border-base-content/10">
            <div className="avatar placeholder">
              <div className="bg-primary/20 text-primary ring-2 ring-primary/30 rounded-full w-9 flex items-center justify-center">
                <span className="text-xs font-bold">AL</span>
              </div>
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xl font-bold leading-tight">
                {user?.username || user?.name}
              </div>
              <div className="text-[10px] text-base-content/50 leading-none mt-0.5">
                {user?.email}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            title="ออกจากระบบ"
            className="btn btn-ghost btn-circle btn-lg text-error/80 hover:bg-error/10 mx-3"
          >
            <FiLogOut className="text-base" />
          </button>
        </div>
      </header>

      {/* ================= SCROLLABLE CONTENT CONTAINER ================= */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-6 custom-scrollbar">
        {/* HERO BANNER */}
        <section className="glass rounded-4xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
          <div className="space-y-2 z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-s font-semibold">
              <FiCompass
                className="animate-spin"
                style={{ animationDuration: "10000s" }}
              />
              พร้อมออกเดินทางแล้วหรือยัง?
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              สวัสดี, <span className="text-primary">ยินดีต้อนรับกลับ!</span>
            </h1>
            <p className="text-xs md:text-sm text-base-content/70 leading-relaxed">
              "นี่ไม่ใช่เครื่องมือกันหลงเธอ แต่ไว้กันหลงทาง"
              วางแผนทริปใหม่หรือจัดการตารางเดินทางของคุณได้เลยที่นี่
            </p>
          </div>

          <div className="z-10 flex gap-3 w-full md:w-auto">
            <button
              className="btn btn-primary rounded-full px-6 flex-1 md:flex-none text-s gap-2 shadow-md hover:shadow-lg"
              type="button"
              onClick={() => modalRef.current?.showModal()}
            >
              <FiPlus className="text-base" /> สร้างทริปใหม่
            </button>
          </div>

          <div className="absolute -right-12 -bottom-12 w-60 h-60 bg-gradient-to-br from-primary/20 via-accent/20 to-transparent rounded-full blur-2xl pointer-events-none" />
        </section>

        {/* STATS OVERVIEW */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
          <div className="glass glass-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center text-xl shrink-0">
              <FiMapPin />
            </div>
            <div>
              <div className="text-s font-medium text-base-content/60">
                ทริปทั้งหมด
              </div>
              <div className="text-xl font-black">
                {safeTrips.length}{" "}
                <span className="text-s font-normal text-base-content/50">
                  ทริป
                </span>
              </div>
            </div>
          </div>

          <div className="glass glass-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent flex items-center justify-center text-xl shrink-0">
              <FiCalendar />
            </div>
            <div>
              <div className="text-s font-medium text-base-content/60">
                กำลังจะถึง
              </div>
              <div className="text-xl font-black">
                {
                  safeTrips.filter(
                    (t) => t.startDate && new Date(t.startDate) > new Date()
                  ).length
                }
                <span className="text-s font-normal text-base-content/50">
                  {" "}
                  ทริป
                </span>
              </div>
            </div>
          </div>

          <div className="glass glass-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-info/15 text-info flex items-center justify-center text-xl shrink-0">
              <FiCheckCircle />
            </div>
            <div>
              <div className="text-s font-medium text-base-content/60">
                เดินทางเสร็จสิ้น
              </div>
              <div className="text-xl font-black">
                {
                  safeTrips.filter(
                    (t) => t.endDate && new Date(t.endDate) < new Date()
                  ).length
                }
                <span className="text-s font-normal text-base-content/50">
                  {" "}
                  ทริป
                </span>
              </div>
            </div>
          </div>

          <div className="glass glass-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-warning/15 text-warning flex items-center justify-center text-xl shrink-0">
              <FiTrendingUp />
            </div>
            <div>
              <div className="text-s font-medium text-base-content/60">
                งบประมาณรวม
              </div>
              <div className="text-xl font-black">จ่ายเงินเพื่อปลด</div>
            </div>
          </div>
        </section>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* TRIPS LIST SECTION */}
          <section className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center px-1">
              <div>
                <h2 className="text-xl font-extrabold">แผนการเดินทางของคุณ</h2>
                <p className="text-s text-base-content/60">
                  รายการทริปทั้งหมดที่คุณวางแผนไว้
                </p>
              </div>

              <div className="flex items-center gap-2 bg-base-100/40 p-1 rounded-full border border-base-content/10">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`btn btn-s btn-circle border-none ${
                    viewMode === "grid"
                      ? "btn-primary"
                      : "btn-ghost text-base-content/60"
                  }`}
                >
                  <FiGrid />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`btn btn-s btn-circle border-none ${
                    viewMode === "list"
                      ? "btn-primary"
                      : "btn-ghost text-base-content/60"
                  }`}
                >
                  <FiList />
                </button>
              </div>
            </div>

            {/* Loading vs Cards */}
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 space-y-3 glass rounded-2xl">
                <FiLoader className="animate-spin text-primary text-3xl" />
                <p className="text-xs text-base-content/60">
                  กำลังโหลดแผนการเดินทาง...
                </p>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
                    : "space-y-3"
                }
              >
                {/* Cards List */}
                {filteredTrips.map((trip) => {
                  const status = getTripStatus(trip.startDate, trip.endDate);

                  return (
                    <div
                      key={trip.id}
                      onClick={() => navigate(`/trips/${trip.id}`)}
                      className="glass glass-card p-5 space-y-4 relative cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold ${status.color}`}
                        >
                          {status.label}
                        </span>
                        <div className="flex items-center gap-2">
                          {trip.destination && (
                            <span className="text-xs font-bold text-primary flex items-center gap-1">
                              <FiMapPin className="text-[13px]" />{" "}
                              {trip.destination}
                            </span>
                          )}
                          <button
                            onClick={(e) => handleDeleteTrip(e, trip.id)}
                            title="ลบทริป"
                            className="btn btn-ghost btn-xs btn-circle text-error/60 hover:text-error hover:bg-error/10"
                          >
                            <FiTrash2 className="text-lg hover:text-red-400" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-base font-bold line-clamp-1">
                          {trip.tripName || trip.title}
                        </h3>
                        <p className="text-xs text-base-content/60 mt-1 flex items-center gap-1">
                          <FiCalendar className="text-primary shrink-0" />
                          {formatDate(trip.startDate)} -{" "}
                          {formatDate(trip.endDate)}
                          {trip.totalDays > 0 && ` (${trip.totalDays} วัน)`}
                        </p>
                        {(trip.tripDescription || trip.description) && (
                          <p className="text-[11px] text-base-content/50 mt-1 line-clamp-2">
                            {trip.tripDescription || trip.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-base-content/10 flex justify-between items-center text-xs">
                        <span className="text-base-content/60 flex items-center gap-1">
                          <FiCompass />{" "}
                          {trip.totalDays !== undefined
                            ? `${trip.totalDays} วันกิจกรรม`
                            : trip.days?.length
                            ? `${trip.days.length} วันกิจกรรม`
                            : "ไม่มีกิจกรรม"}
                        </span>
                        <button className="btn btn-sm btn-ghost text-primary hover:bg-primary/10 rounded-full gap-1 text-xs">
                          ดูแผนทริป <FiChevronRight />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Quick Add Card */}
                <div
                  onClick={() => modalRef.current?.showModal()}
                  className="glass glass-card p-5 border-dashed border-2 border-primary/30 flex flex-col justify-center items-center text-center space-y-2 min-h-40 cursor-pointer"
                >
                  <button
                    className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center text-lg pointer-events-none"
                    type="button"
                  >
                    <FiPlus />
                  </button>
                  <div className="text-xs font-bold text-primary">
                    เพิ่มทริปใหม่
                  </div>
                  <div className="text-[10px] text-base-content/50">
                    ให้ AI ช่วยวางแผนให้ในไม่กี่วินาที
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-6">
            <div className="glass glass-card p-5 space-y-4 bg-gradient-to-b from-primary/10 to-transparent">
              <div className="flex items-center gap-2 text-xs font-bold text-primary">
                <span>✨</span> AI Trip Assistant
              </div>
              <h3 className="text-sm font-bold">คิดไม่ออกว่าจะไปไหนดี?</h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                พิมพ์บอกงบ วันเดินทาง หรือสไตล์ที่ชอบ แล้วให้ AI LHOUNG
                ออกแบบทริปให้ทันที!
              </p>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="เช่น 'อยากไปทะเล 3 วัน งบ 5,000'"
                  className="input input-sm w-full text-xs rounded-full bg-base-100/50"
                />
                <button className="btn btn-primary btn-sm w-full rounded-full text-xs">
                  จ่ายเงินเพื่อให้ AI สร้างทริปทันที
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* Modal Create Trip */}
        <dialog ref={modalRef} id="createtrip" className="modal">
          <div className="modal-box relative max-w-lg p-6">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3">
                ✕
              </button>
            </form>
            <CreateTrip onClose={() => modalRef.current?.close()} />
          </div>
        </dialog>
      </div>
    </div>
  );
}

export default Dashboard;



























// import React, { useEffect, useState, useRef } from "react";
// import {
//   FiCompass,
//   FiMapPin,
//   FiCalendar,
//   FiPlus,
//   FiTrendingUp,
//   FiClock,
//   FiCheckCircle,
//   FiSearch,
//   FiChevronRight,
//   FiGrid,
//   FiList,
//   FiLogOut,
//   FiLoader,
//   FiTrash2,
// } from "react-icons/fi";
// import CreateTrip from "@/components/UserTrip";
// import useTripStore from "@/stores/tripStore";
// import useUserStore from "@/stores/userStore";

// function Dashboard() {
//   const [viewMode, setViewMode] = useState("grid");
//   const [searchTerm, setSearchTerm] = useState("");

//   const modalRef = useRef(null);

//   // ดึง state & actions จาก Zustand Stores
//   const { trips, loading, fetchTrips, deleteTrip } = useTripStore();
//   const logout = useUserStore((state) => state.logout);
//   const user = useUserStore((state) => state.user);

//   // โหลดข้อมูลทริปเมื่อเปิดหน้า
//   useEffect(() => {
//     fetchTrips();
//   }, [fetchTrips]);

//   // ดักจับเหตุการณ์เมื่อ Modal ปิดลง เพื่อสั่ง re-fetch ข้อมูลใหม่
//   useEffect(() => {
//     const modalElement = modalRef.current;
//     if (!modalElement) return;

//     const handleModalClose = () => {
//       fetchTrips();
//     };

//     modalElement.addEventListener("close", handleModalClose);
//     return () => {
//       modalElement.removeEventListener("close", handleModalClose);
//     };
//   }, [fetchTrips]);

//   // Helper: แปลงวันที่
//   const formatDate = (dateString) => {
//     if (!dateString) return "ยังไม่ระบุวัน";
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) return "ยังไม่ระบุวัน";

//     return date.toLocaleDateString("th-TH", {
//       day: "numeric",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   // Helper: คำนวณสถานะทริป
//   const getTripStatus = (startDate, endDate) => {
//     if (!startDate)
//       return {
//         label: "ร่างแผนทริป",
//         color: "bg-base-content/10 text-base-content/70",
//       };

//     const now = new Date();
//     const start = new Date(startDate);
//     const end = endDate ? new Date(endDate) : start;

//     if (now > end) {
//       return { label: "เดินทางเสร็จสิ้น", color: "bg-info/20 text-info" };
//     } else if (now >= start && now <= end) {
//       return { label: "กำลังเดินทางอยู่", color: "bg-success text-white" };
//     } else {
//       return { label: "กำลังจะเดินทาง", color: "bg-primary text-white" };
//     }
//   };

//   // Handler: ลบทริป
//   const handleDeleteTrip = async (e, tripId) => {
//     e.stopPropagation(); // ป้องกันการคลิกซ้อนทับ
//     if (window.confirm("คุณต้องการลบทริปนี้ใช่หรือไม่?")) {
//       await deleteTrip(tripId);
//     }
//   };

//   // Filter ค้นหา
//   const safeTrips = Array.isArray(trips) ? trips : [];
//   const filteredTrips = safeTrips.filter((trip) => {
//     const nameMatch = trip.tripName
//       ?.toLowerCase()
//       .includes(searchTerm.toLowerCase());
//     const destMatch = trip.destination
//       ?.toLowerCase()
//       .includes(searchTerm.toLowerCase());
//     return nameMatch || destMatch;
//   });

//   return (
//     <div className="h-screen w-screen overflow-hidden flex flex-col p-4 md:p-6 font-sans box-border">
//       {/* ================= NAVBAR / HEADER ================= */}
//       <header className="navbar glass rounded-full justify-between px-6 shadow-lg shrink-0 mb-4 ">
//         <div className="flex items-center gap-3">
//           <div class="w-20 h-20 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-xl font-bold overflow-hidden">
//             <img
//               src="image/Minidog.PNG"
//               alt="Minidog"
//               class="w-full h-full object-cover"
//             />
//           </div>
//           <div>
//             <span className="text-3xl font-black tracking-wider bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
//               AI LHOUNG
//             </span>
//             <span className="text-[10px] block text-base-content/60 font-medium -mt-1">
//               Travel Planner Dashboard
//             </span>
//           </div>
//         </div>

//         {/* Search Input */}
//         <div className="hidden md:flex items-center gap-2">
//           <div className="relative">
//             <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/50 " />
//             <input
//               type="text"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               placeholder="ค้นหาทริป, จุดหมาย..."
//               className="input input-sm pl-10 pr-4 py-4 text-xs w-110 rounded-full border-none focus:outline-none bg-base-100/50"
//             />
//           </div>
//         </div>

//         {/* Profile */}
//         <div className="flex items-center gap-3">
//           <div className="flex items-center gap-2 pr-2 border-r border-base-content/10">
//             <div className="avatar placeholder">
//               <div className="bg-primary/20 text-primary ring-2 ring-primary/30 rounded-full w-9 flex items-center justify-center">
//                 <span className="text-xs font-bold">AL</span>
//               </div>
//             </div>
//             <div className="hidden sm:block text-left">
//               <div className="text-xl font-bold leading-tight">
//                 {user?.username || user?.name}
//               </div>
//               <div className="text-[10px] text-base-content/50 leading-none mt-0.5">
//                 {user.email}
//               </div>
//             </div>
//           </div>

//           <button
//             onClick={logout}
//             title="ออกจากระบบ"
//             className="btn btn-ghost btn-circle btn-lg text-error/80 hover:bg-error/10 mx-3 "
//           >
//             <FiLogOut className="text-base" />
//           </button>
//         </div>
//       </header>

//       {/* ================= SCROLLABLE CONTENT CONTAINER ================= */}
//       <div className="flex-1 overflow-y-auto pr-1 space-y-6 custom-scrollbar">
//         {/* HERO BANNER */}
//         <section className="glass rounded-[2rem] p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
//           <div className="space-y-2 z-10 max-w-xl">
//             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-s font-semibold">
//               <FiCompass
//                 className="animate-spin"
//                 style={{ animationDuration: "10000s" }}
//               />
//               พร้อมออกเดินทางแล้วหรือยัง?
//             </div>
//             <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
//               สวัสดี, <span className="text-primary">ยินดีต้อนรับกลับ!</span> 🌟
//             </h1>
//             <p className="text-xs md:text-sm text-base-content/70 leading-relaxed">
//               "นี่ไม่ใช่เครื่องมือกันหลงเธอ แต่ไว้กันหลงทาง"
//               วางแผนทริปใหม่หรือจัดการตารางเดินทางของคุณได้เลยที่นี่
//             </p>
//           </div>

//           <div className="z-10 flex gap-3 w-full md:w-auto">
//             <button
//               className="btn btn-primary rounded-full px-6 flex-1 md:flex-none text-s gap-2 shadow-md hover:shadow-lg transition-all"
//               type="button"
//               onClick={() => modalRef.current?.showModal()}
//             >
//               <FiPlus className="text-base" /> สร้างทริปใหม่
//             </button>
//           </div>

//           <div className="absolute -right-12 -bottom-12 w-60 h-60 bg-gradient-to-br from-primary/20 via-accent/20 to-transparent rounded-full blur-2xl pointer-events-none" />
//         </section>

//         {/* STATS OVERVIEW */}
//         <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
//           <div className="glass glass-card p-5 flex items-center gap-4">
//             <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center text-xl shrink-0">
//               <FiMapPin />
//             </div>
//             <div>
//               <div className="text-s font-medium text-base-content/60">
//                 ทริปทั้งหมด
//               </div>
//               <div className="text-xl font-black">
//                 {safeTrips.length}{" "}
//                 <span className="text-s font-normal text-base-content/50">
//                   ทริป
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="glass glass-card p-5 flex items-center gap-4">
//             <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent flex items-center justify-center text-xl shrink-0">
//               <FiCalendar />
//             </div>
//             <div>
//               <div className="text-s font-medium text-base-content/60">
//                 กำลังจะถึง
//               </div>
//               <div className="text-xl font-black">
//                 {
//                   safeTrips.filter(
//                     (t) => t.startDate && new Date(t.startDate) > new Date(),
//                   ).length
//                 }
//                 <span className="text-s font-normal text-base-content/50">
//                   {" "}
//                   ทริป
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="glass glass-card p-5 flex items-center gap-4">
//             <div className="w-12 h-12 rounded-2xl bg-info/15 text-info flex items-center justify-center text-xl shrink-0">
//               <FiCheckCircle />
//             </div>
//             <div>
//               <div className="text-s font-medium text-base-content/60">
//                 เดินทางเสร็จสิ้น
//               </div>
//               <div className="text-xl font-black">
//                 {
//                   safeTrips.filter(
//                     (t) => t.endDate && new Date(t.endDate) < new Date(),
//                   ).length
//                 }
//                 <span className="text-s font-normal text-base-content/50">
//                   {" "}
//                   ทริป
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="glass glass-card p-5 flex items-center gap-4">
//             <div className="w-12 h-12 rounded-2xl bg-warning/15 text-warning flex items-center justify-center text-xl shrink-0">
//               <FiTrendingUp />
//             </div>
//             <div>
//               <div className="text-s font-medium text-base-content/60">
//                 งบประมาณรวม
//               </div>
//               <div className="text-xl font-black">จ่ายเงินเพื่อปลด</div>
//             </div>
//           </div>
//         </section>

//         {/* MAIN CONTENT GRID */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* TRIPS LIST SECTION */}
//           <section className="lg:col-span-2 space-y-4">
//             <div className="flex justify-between items-center px-1">
//               <div>
//                 <h2 className="text-xl font-extrabold">แผนการเดินทางของคุณ</h2>
//                 <p className="text-s text-base-content/60">
//                   รายการทริปทั้งหมดที่คุณวางแผนไว้
//                 </p>
//               </div>

//               <div className="flex items-center gap-2 bg-base-100/40 p-1 rounded-full border border-base-content/10">
//                 <button
//                   onClick={() => setViewMode("grid")}
//                   className={`btn btn-s btn-circle border-none ${viewMode === "grid" ? "btn-primary" : "btn-ghost text-base-content/60"}`}
//                 >
//                   <FiGrid />
//                 </button>
//                 <button
//                   onClick={() => setViewMode("list")}
//                   className={`btn btn-s btn-circle border-none ${viewMode === "list" ? "btn-primary" : "btn-ghost text-base-content/60"}`}
//                 >
//                   <FiList />
//                 </button>
//               </div>
//             </div>

//             {/* Loading vs Cards */}
//             {loading ? (
//               <div className="flex flex-col items-center justify-center p-12 space-y-3 glass rounded-2xl">
//                 <FiLoader className="animate-spin text-primary text-3xl" />
//                 <p className="text-xs text-base-content/60">
//                   กำลังโหลดแผนการเดินทาง...
//                 </p>
//               </div>
//             ) : (
//               <div
//                 className={
//                   viewMode === "grid"
//                     ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
//                     : "space-y-3"
//                 }
//               >
//                 {/* Cards List */}
//                 {filteredTrips.map((trip) => {
//                   const status = getTripStatus(trip.startDate, trip.endDate);

//                   return (
//                     <div
//                       key={trip.id}
//                       onClick={() =>
//                         (window.location.href = `/trips/${trip.id}`)
//                       }
//                       className="glass glass-card p-5 space-y-4 relative group hover:border-primary/40 transition-all cursor-pointer"
//                     >
//                       <div className="flex justify-between items-start">
//                         <span
//                           className={`px-3 py-1 rounded-full text-[10px] font-bold ${status.color}`}
//                         >
//                           {status.label}
//                         </span>
//                         <div className="flex items-center gap-2">
//                           {trip.destination && (
//                             <span className="text-xs font-bold text-primary flex items-center gap-1">
//                               <FiMapPin className="text-[13px]" />{" "}
//                               {trip.destination}
//                             </span>
//                           )}
//                           <button
//                             onClick={(e) => handleDeleteTrip(e, trip.id)}
//                             title="ลบทริป"
//                             className="btn btn-ghost btn-xs btn-circle text-error/60 hover:text-error hover:bg-error/10 opacity-0 group-hover:opacity-100 transition-opacity"
//                           >
//                             <FiTrash2 className="text-lg hover:text-red-400" />
//                           </button>
//                         </div>
//                       </div>

//                       <div>
//                         <h3 className="text-base font-bold group-hover:text-primary transition-colors line-clamp-1">
//                           {trip.tripName}
//                         </h3>
//                         <p className="text-xs text-base-content/60 mt-1 flex items-center gap-1">
//                           <FiCalendar className="text-primary shrink-0" />
//                           {formatDate(trip.startDate)} -{" "}
//                           {formatDate(trip.endDate)}
//                           {trip.totalDays > 0 && ` (${trip.totalDays} วัน)`}
//                         </p>
//                         {trip.tripDescription && (
//                           <p className="text-[11px] text-base-content/50 mt-1 line-clamp-2">
//                             {trip.tripDescription}
//                           </p>
//                         )}
//                       </div>

//                       <div className="pt-3 border-t border-base-content/10 flex justify-between items-center text-xs">
//                         <span className="text-base-content/60 flex items-center gap-1">
//                           <FiCompass />{" "}
//                           {trip.totalDays !== undefined
//                             ? `${trip.totalDays} วันกิจกรรม`
//                             : trip.days?.length
//                               ? `${trip.days.length} วันกิจกรรม`
//                               : "ไม่มีกิจกรรม"}
//                         </span>
//                         <button className="btn btn-sm btn-ghost text-primary hover:bg-primary/10 rounded-full gap-1 text-xs">
//                           ดูแผนทริป <FiChevronRight />
//                         </button>
//                       </div>
//                     </div>
//                   );
//                 })}

//                 {/* Quick Add Card */}
//                 <div
//                   onClick={() => modalRef.current?.showModal()}
//                   className="glass glass-card p-5 border-dashed border-2 border-primary/30 flex flex-col justify-center items-center text-center space-y-2 min-h-[160px] cursor-pointer hover:bg-primary/5 transition-all"
//                 >
//                   <button
//                     className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center text-lg pointer-events-none"
//                     type="button"
//                   >
//                     <FiPlus />
//                   </button>
//                   <div className="text-xs font-bold text-primary">
//                     เพิ่มทริปใหม่
//                   </div>
//                   <div className="text-[10px] text-base-content/50">
//                     ให้ AI ช่วยวางแผนให้ในไม่กี่วินาที
//                   </div>
//                 </div>
//               </div>
//             )}
//           </section>

//           {/* RIGHT SIDEBAR */}
//           <aside className="space-y-6">
//             <div className="glass glass-card p-5 space-y-4 bg-gradient-to-b from-primary/10 to-transparent">
//               <div className="flex items-center gap-2 text-xs font-bold text-primary">
//                 <span>✨</span> AI Trip Assistant
//               </div>
//               <h3 className="text-sm font-bold">คิดไม่ออกว่าจะไปไหนดี?</h3>
//               <p className="text-xs text-base-content/70 leading-relaxed">
//                 พิมพ์บอกงบ วันเดินทาง หรือสไตล์ที่ชอบ แล้วให้ AI LHOUNG
//                 ออกแบบทริปให้ทันที!
//               </p>

//               <div className="space-y-2">
//                 <input
//                   type="text"
//                   placeholder="เช่น 'อยากไปทะเล 3 วัน งบ 5,000'"
//                   className="input input-sm w-full text-xs rounded-full bg-base-100/50"
//                 />
//                 <button className="btn btn-primary btn-sm w-full rounded-full text-xs">
//                   จ่ายเงินเพื่อให้ AI สร้างทริปทันที
//                 </button>
//               </div>
//             </div>

//             <div className="glass glass-card p-5 space-y-4">
//               <div className="flex justify-between items-center">
//                 <h3 className="text-sm font-bold flex items-center gap-2">
//                   <FiClock className="text-primary" /> กิจกรรมถัดไป
//                 </h3>
//               </div>

//               <ul className="space-y-3 text-xs">
//                 <li className="flex gap-3 items-start relative pl-4 border-l-2 border-primary">
//                   <div className="w-2 h-2 rounded-full bg-primary absolute -left-[5px] top-1" />
//                   <div>
//                     <div className="font-bold">เช็กอินโรงแรม Shinjuku</div>
//                     <div className="text-[10px] text-base-content/50">
//                       15 พ.ย. • 14:00 น.
//                     </div>
//                   </div>
//                 </li>
//                 <li className="flex gap-3 items-start relative pl-4 border-l-2 border-base-content/20">
//                   <div className="w-2 h-2 rounded-full bg-base-content/30 absolute -left-[5px] top-1" />
//                   <div>
//                     <div className="font-bold">ชมวิวที่ Shibuya Sky</div>
//                     <div className="text-[10px] text-base-content/50">
//                       15 พ.ย. • 17:30 น.
//                     </div>
//                   </div>
//                 </li>
//               </ul>
//             </div>
//           </aside>
//         </div>

//         {/* Modal Create Trip */}
//         <dialog ref={modalRef} id="createtrip" className="modal">
//           <div className="modal-box relative max-w-lg p-6">
//             <form method="dialog">
//               <button className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3">
//                 ✕
//               </button>
//             </form>
//             <CreateTrip onClose={() => modalRef.current?.close()} />
//           </div>
//         </dialog>
//       </div>
//     </div>
//   );
// }

// export default Dashboard;
