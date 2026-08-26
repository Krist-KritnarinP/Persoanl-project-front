import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiPlus,
  FiCalendar,
  FiEdit2,
  FiTrash2,
  FiHome,
  FiTruck,
  FiCoffee,
  FiNavigation,
  FiCheckCircle,
} from "react-icons/fi";
import { useTripActivityStore } from "@/stores/tripActivityStore";
import DayModal from "@/components/DayModal";
import ActivityModal from "@/components/ActivityModal";
import GeminiWeatherCard from "@/components/GeminiWeatherCard";
import TripInfoCard from "@/components/TripInfoCard";
import ActivityItem from "@/components/ActivityItem";

const ACTIVITY_TYPES = {
  ACCOMMODATION: { label: "ที่พัก", icon: FiHome, color: "badge-primary" },
  TRANSPORT: { label: "การเดินทาง", icon: FiTruck, color: "badge-info" },
  RESTAURANT: { label: "อาหาร/ร้านค้า", icon: FiCoffee, color: "badge-warning" },
  ATTRACTION: { label: "สถานที่ท่องเที่ยว", icon: FiNavigation, color: "badge-accent" },
};

export default function TripActivity() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const trip = useTripActivityStore((state) => state.trip);
  const loading = useTripActivityStore((state) => state.loading);
  const error = useTripActivityStore((state) => state.error);
  const fetchTripDetails = useTripActivityStore((state) => state.fetchTripDetails);

  const createDay = useTripActivityStore((state) => state.createDay);
  const updateDay = useTripActivityStore((state) => state.updateDay);
  const deleteDay = useTripActivityStore((state) => state.deleteDay);

  const createActivity = useTripActivityStore((state) => state.createActivity);
  const updateActivity = useTripActivityStore((state) => state.updateActivity);
  const deleteActivity = useTripActivityStore((state) => state.deleteActivity);

  const weatherPrediction = useTripActivityStore((state) => state.weatherPrediction);
  const weatherLoading = useTripActivityStore((state) => state.weatherLoading);
  const weatherError = useTripActivityStore((state) => state.weatherError);
  const getWeatherForecast = useTripActivityStore((state) => state.getWeatherForecast);

  const [selectedDayId, setSelectedDayId] = useState(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [dayFormData, setDayFormData] = useState({ dayDate: "", description: "" });
  const [editingDay, setEditingDay] = useState(null);

  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [activityFormData, setActivityFormData] = useState({
    dayId: "",
    activityType: "ATTRACTION",
    locationName: "",
    activityDate: "",
    activityTime: "",
    price: 0,
    description: "",
    status: "planned",
  });

  useEffect(() => {
    if (tripId) fetchTripDetails(tripId);
  }, [tripId]);

  useEffect(() => {
    if (trip?.days && trip.days.length > 0 && !selectedDayId) {
      setSelectedDayId(trip.days[0].id);
    }
  }, [trip]);

  const activeDay = trip?.days?.find((d) => d.id === selectedDayId) || trip?.days?.[0];

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper ดึงข้อความเวลามาแสดงผลโดยตรง
  const formatZonedTime = (timeString) => {
    if (!timeString) return "";
    if (timeString.includes("T")) {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) return timeString;
      return date.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
    return timeString;
  };

  // Activity Handlers
  const handleOpenAddActivityModal = () => {
    if (!activeDay) return alert("กรุณาสร้างวันเดินทางก่อนเพิ่มกิจกรรม");
    setEditingActivity(null);
    setActivityFormData({
      dayId: activeDay.id,
      activityType: "ATTRACTION",
      locationName: "",
      activityDate: activeDay.dayDate
        ? new Date(activeDay.dayDate).toISOString().split("T")[0]
        : "",
      activityTime: "",
      price: 0,
      description: "",
      status: "planned",
    });
    setIsActivityModalOpen(true);
  };

  const handleOpenEditActivityModal = (act) => {
    setEditingActivity(act);
    setActivityFormData({
      dayId: act.dayId,
      activityType: act.activityType || "ATTRACTION",
      locationName: act.locationName || "",
      activityDate: act.activityDate
        ? new Date(act.activityDate).toISOString().split("T")[0]
        : "",
      activityTime: act.activityTime
        ? formatZonedTime(act.activityTime)
        : "",
      price: act.price || 0,
      description: act.description || "",
      status: act.status || "planned",
    });
    setIsActivityModalOpen(true);
  };

  // Save Activity บันทึกค่าเวลาตรงๆ โดยแปลงเป็น ISO String
  const handleSaveActivity = async (e) => {
    e.preventDefault();
    try {
      let formattedTime = null;

      if (activityFormData.activityTime) {
        const dateStr =
          activityFormData.activityDate || new Date().toISOString().split("T")[0];
        const dateObj = new Date(`${dateStr}T${activityFormData.activityTime}:00`);
        formattedTime = !isNaN(dateObj.getTime()) ? dateObj.toISOString() : null;
      }

      const payload = {
        ...activityFormData,
        price: Number(activityFormData.price) || 0,
        activityTime: formattedTime,
      };

      if (editingActivity) {
        await updateActivity(tripId, editingActivity.id, payload);
      } else {
        await createActivity(tripId, payload);
      }
      setIsActivityModalOpen(false);
    } catch (err) {
      console.error("Save activity error:", err);
    }
  };

  const handleDeleteActivity = async (actId) => {
    if (window.confirm("คุณต้องการลบกิจกรรมนี้ใช่หรือไม่?")) {
      await deleteActivity(tripId, actId);
    }
  };

  if (loading && !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-4 md:px-8 py-4 space-y-6">
      {/* NAVBAR */}
      <header className="navbar glass rounded-full justify-between px-6 shadow-lg shrink-0 mb-4 w-full">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold overflow-hidden">
            <img src="/image/MiniDog.PNG" alt="Minidog" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-wider bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
              AI LHOUNG
            </span>
            <span className="text-[10px] block text-base-content/60 font-medium -mt-1">
              Travel Planner Dashboard
            </span>
          </div>
        </div>
      </header>

      {/* HEADER / NAVIGATION */}
      <div className="flex items-center justify-between w-full">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost glass gap-2 text-base-content hover:bg-white/20"
        >
          <FiArrowLeft /> ย้อนกลับ
        </button>
        <span className="text-xs badge badge-outline glass px-3 py-2">Trip ID: #{tripId}</span>
      </div>

      {/* TRIP INFO CARD */}
      <TripInfoCard trip={trip} formatDate={formatDate} />

      {/* 3-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* LEFT COLUMN: Overview Waterfall Timeline */}
        <div className="lg:col-span-3 glass glass-card p-5 rounded-3xl space-y-4 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
          <h3 className="text-lg font-bold flex items-center gap-2 border-b border-white/20 pb-3">
            <FiCheckCircle className="text-primary" /> Overview
          </h3>

          {trip?.days && trip.days.length > 0 ? (
            <div className="relative border-l-2 border-primary/30 ml-3 space-y-6 pl-4 py-2">
              {trip.days.map((d) => {
                const isSelected = activeDay?.id === d.id;
                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDayId(d.id)}
                    className={`cursor-pointer group relative transition-all ${
                      isSelected ? "scale-102" : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div
                      className={`absolute -left-6.25 top-0 w-4 h-4 rounded-full border-2 transition-all ${
                        isSelected
                          ? "bg-primary border-white scale-125 shadow-md"
                          : "bg-base-100 border-primary/50 group-hover:bg-primary/50"
                      }`}
                    />

                    <div
                      className={`p-3 rounded-2xl transition-all ${
                        isSelected
                          ? "bg-primary/10 border border-primary/30 shadow-sm"
                          : "bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-primary">Day {d.dayCount}</span>
                        <span className="text-[10px] opacity-70">{formatDate(d.dayDate)}</span>
                      </div>

                      {d.activities && d.activities.length > 0 ? (
                        <ul className="mt-2 space-y-2 border-t border-white/10 pt-2 text-xs">
                          {d.activities.map((act) => (
                            <li key={act.id} className="space-y-1">
                              <div className="flex items-center gap-1.5 text-base-content/90 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent/70 shrink-0" />
                                <span className="truncate">{act.locationName}</span>
                              </div>

                              {act.activityTime && (
                                <div className="flex items-center gap-1.5 pl-3 text-[10px]">
                                  <span className="bg-base-200/60 px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <span>⏰</span>
                                    <span>{formatZonedTime(act.activityTime)}</span>
                                  </span>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[11px] opacity-50 mt-1 italic">ไม่มีกิจกรรม</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-base-content/60 text-center py-4">ยังไม่มีข้อมูลวันเดินทาง</p>
          )}
        </div>

        {/* CENTER COLUMN: Main Days & Activities */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FiCalendar /> แผนการเดินทางรายวัน
              </h2>
              <button
                onClick={() => {
                  setEditingDay(null);
                  setDayFormData({ dayDate: "", description: "" });
                  setIsDayModalOpen(true);
                }}
                className="btn btn-primary btn-sm rounded-full gap-1"
              >
                <FiPlus /> เพิ่มวัน
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {trip?.days?.map((day) => {
                const isActive = activeDay?.id === day.id;
                return (
                  <button
                    key={day.id}
                    onClick={() => setSelectedDayId(day.id)}
                    className={`btn btn-sm rounded-2xl whitespace-nowrap transition-all ${
                      isActive
                        ? "btn-primary shadow-lg scale-105"
                        : "btn-ghost glass text-base-content hover:bg-white/30"
                    }`}
                  >
                    Day {day.dayCount}
                    {day.dayDate && ` (${formatDate(day.dayDate)})`}
                  </button>
                );
              })}
            </div>
          </div>

          {activeDay && (
            <div className="glass glass-card p-6 rounded-3xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/20 pb-4 gap-2">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold">Day {activeDay.dayCount}</h3>
                    <span className="text-sm opacity-70">{formatDate(activeDay.dayDate)}</span>
                  </div>
                  <p className="text-sm opacity-80 mt-1">{activeDay.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-lg">รายการกิจกรรม</h4>
                  <button
                    onClick={handleOpenAddActivityModal}
                    className="btn btn-primary btn-sm glass rounded-full gap-1"
                  >
                    <FiPlus /> เพิ่มกิจกรรม
                  </button>
                </div>

                {activeDay.activities && activeDay.activities.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {activeDay.activities.map((act) => (
                      <ActivityItem
                        key={act.id}
                        activity={act}
                        typeConfig={
                          ACTIVITY_TYPES[act.activityType] || ACTIVITY_TYPES.ATTRACTION
                        }
                        formatZonedTime={formatZonedTime}
                        onEdit={handleOpenEditActivityModal}
                        onDelete={handleDeleteActivity}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 glass rounded-2xl opacity-60">
                    <p>ยังไม่มีกิจกรรมในวันนี้</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Gemini Weather Card */}
        <div className="lg:col-span-3 sticky top-4 max-h-[calc(100vh-2rem)] flex flex-col">
          <GeminiWeatherCard
            tripId={tripId}
            weatherPrediction={weatherPrediction}
            weatherLoading={weatherLoading}
            weatherError={weatherError}
            onGetForecast={getWeatherForecast}
          />
        </div>
      </div>

      <DayModal
        isOpen={isDayModalOpen}
        onClose={() => setIsDayModalOpen(false)}
        onSubmit={async (e) => {
          e.preventDefault();
          if (editingDay) {
            await updateDay(editingDay.id, tripId, dayFormData);
          } else {
            await createDay(tripId, dayFormData);
          }
          setIsDayModalOpen(false);
        }}
        editingDay={editingDay}
        dayFormData={dayFormData}
        setDayFormData={setDayFormData}
      />

      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        onSubmit={handleSaveActivity}
        editingActivity={editingActivity}
        activityFormData={activityFormData}
        setActivityFormData={setActivityFormData}
      />
    </div>
  );
}
// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   FiArrowLeft,
//   FiPlus,
//   FiCalendar,
//   FiEdit2,
//   FiTrash2,
//   FiHome,
//   FiTruck,
//   FiCoffee,
//   FiNavigation,
//   FiLogOut,
// } from "react-icons/fi";
// import { useTripActivityStore } from "@/stores/tripActivityStore";
// import DayModal from "@/components/DayModal";
// import ActivityModal from "@/components/ActivityModal";
// import GeminiWeatherCard from "@/components/GeminiWeatherCard";
// import TripInfoCard from "@/components/TripInfoCard";
// import ActivityItem from "@/components/ActivityItem";


// const ACTIVITY_TYPES = {
//   ACCOMMODATION: { label: "ที่พัก", icon: FiHome, color: "badge-primary" },
//   TRANSPORT: { label: "การเดินทาง", icon: FiTruck, color: "badge-info" },
//   RESTAURANT: { label: "อาหาร/ร้านค้า", icon: FiCoffee, color: "badge-warning" },
//   ATTRACTION: { label: "สถานที่ท่องเที่ยว", icon: FiNavigation, color: "badge-accent" },
// };



// export default function TripActivity() {
//   const { tripId } = useParams();
//   const navigate = useNavigate();

//   // Zustand Selectors
//   const trip = useTripActivityStore((state) => state.trip);
//   const loading = useTripActivityStore((state) => state.loading);
//   const error = useTripActivityStore((state) => state.error);
//   const fetchTripDetails = useTripActivityStore((state) => state.fetchTripDetails);
  
//   const createDay = useTripActivityStore((state) => state.createDay);
//   const updateDay = useTripActivityStore((state) => state.updateDay);
//   const deleteDay = useTripActivityStore((state) => state.deleteDay);

//   const createActivity = useTripActivityStore((state) => state.createActivity);
//   const updateActivity = useTripActivityStore((state) => state.updateActivity);
//   const deleteActivity = useTripActivityStore((state) => state.deleteActivity);

//   // Gemini Weather Selectors
//   const weatherPrediction = useTripActivityStore((state) => state.weatherPrediction);
//   const weatherLoading = useTripActivityStore((state) => state.weatherLoading);
//   const weatherError = useTripActivityStore((state) => state.weatherError);
//   const getWeatherForecast = useTripActivityStore((state) => state.getWeatherForecast);

//   const [selectedDayId, setSelectedDayId] = useState(null);

//   // Modal States
//   const [isDayModalOpen, setIsDayModalOpen] = useState(false);
//   const [dayFormData, setDayFormData] = useState({ dayDate: "", description: "" });
//   const [editingDay, setEditingDay] = useState(null);

//   const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
//   const [editingActivity, setEditingActivity] = useState(null);
//   const [activityFormData, setActivityFormData] = useState({
//     dayId: "",
//     activityType: "ATTRACTION",
//     locationName: "",
//     activityDate: "",
//     activityTime: "",
//     price: 0,
//     description: "",
//     status: "planned",
//   });

//   useEffect(() => {
//     if (tripId) fetchTripDetails(tripId);
//   }, [tripId]);

//   useEffect(() => {
//     if (trip?.days && trip.days.length > 0 && !selectedDayId) {
//       setSelectedDayId(trip.days[0].id);
//     }
//   }, [trip]);

//   const activeDay = trip?.days?.find((d) => d.id === selectedDayId) || trip?.days?.[0];

//   const formatDate = (dateString) => {
//     if (!dateString) return "-";
//     return new Date(dateString).toLocaleDateString("th-TH", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   const formatTime = (timeString) => {
//     if (!timeString) return "";
//     const date = new Date(timeString);
//     if (isNaN(date.getTime())) return timeString;
//     return date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
//   };

//   // Day Handlers
//   const handleOpenAddDayModal = () => {
//     setEditingDay(null);
//     setDayFormData({ dayDate: "", description: "" });
//     setIsDayModalOpen(true);
//   };

//   const handleOpenEditDayModal = (day) => {
//     setEditingDay(day);
//     setDayFormData({
//       dayDate: day.dayDate ? new Date(day.dayDate).toISOString().split("T")[0] : "",
//       description: day.description || "",
//     });
//     setIsDayModalOpen(true);
//   };

//   const handleSaveDay = async (e) => {
//     e.preventDefault();
//     try {
//       if (editingDay) {
//         await updateDay(editingDay.id, tripId, dayFormData);
//       } else {
//         const isFirstDay = !trip?.days || trip.days.length === 0;
//         await createDay(tripId, {
//           ...(isFirstDay && { dayDate: dayFormData.dayDate }),
//           description: dayFormData.description,
//         });
//       }
//       setIsDayModalOpen(false);
//     } catch (err) {}
//   };

//   const handleDeleteDay = async (dayId) => {
//     if (window.confirm("คุณต้องการลบวันนี้และกิจกรรมทั้งหมดในวันนี้หรือไม่?")) {
//       await deleteDay(dayId, tripId);
//       if (selectedDayId === dayId) setSelectedDayId(null);
//     }
//   };

//   // Activity Handlers
//   const handleOpenAddActivityModal = () => {
//     if (!activeDay) return alert("กรุณาสร้างวันเดินทางก่อนเพิ่มกิจกรรม");
//     setEditingActivity(null);
//     setActivityFormData({
//       dayId: activeDay.id,
//       activityType: "ATTRACTION",
//       locationName: "",
//       activityDate: activeDay.dayDate
//         ? new Date(activeDay.dayDate).toISOString().split("T")[0]
//         : "",
//       activityTime: "",
//       price: 0,
//       description: "",
//       status: "planned",
//     });
//     setIsActivityModalOpen(true);
//   };

//   const handleOpenEditActivityModal = (act) => {
//     setEditingActivity(act);
//     setActivityFormData({
//       dayId: act.dayId,
//       activityType: act.activityType || "ATTRACTION",
//       locationName: act.locationName || "",
//       activityDate: act.activityDate
//         ? new Date(act.activityDate).toISOString().split("T")[0]
//         : "",
//       activityTime: act.activityTime
//         ? new Date(act.activityTime).toISOString().substring(11, 16)
//         : "",
//       price: act.price || 0,
//       description: act.description || "",
//       status: act.status || "planned",
//     });
//     setIsActivityModalOpen(true);
//   };

//   const handleSaveActivity = async (e) => {
//     e.preventDefault();
//     try {
//       let formattedTime = null;
//       if (activityFormData.activityTime) {
//         const dateStr = activityFormData.activityDate || new Date().toISOString().split("T")[0];
//         formattedTime = new Date(`${dateStr}T${activityFormData.activityTime}:00Z`).toISOString();
//       }

//       const payload = {
//         ...activityFormData,
//         price: Number(activityFormData.price),
//         activityTime: formattedTime,
//       };

//       if (editingActivity) {
//         await updateActivity(tripId, editingActivity.id, payload);
//       } else {
//         await createActivity(tripId, payload);
//       }
//       setIsActivityModalOpen(false);
//     } catch (err) {}
//   };

//   const handleDeleteActivity = async (actId) => {
//     if (window.confirm("คุณต้องการลบกิจกรรมนี้ใช่หรือไม่?")) {
//       await deleteActivity(tripId, actId);
//     }
//   };

//   if (loading && !trip) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <span className="loading loading-spinner loading-lg text-primary"></span>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto space-y-6">
//       {/* ================= NAVBAR / HEADER ================= */}
//             <header className="navbar glass rounded-full justify-between px-6 shadow-lg shrink-0 mb-4 ">
//               <div className="flex items-center gap-3">
//                 <div className="w-20 h-20 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-xl font-bold overflow-hidden">
//                   <img
//                     src="/image/MiniDog.PNG"
//                     alt="Minidog"
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//                 <div>
//                   <span className="text-3xl font-black tracking-wider bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
//                     AI LHOUNG
//                   </span>
//                   <span className="text-[10px] block text-base-content/60 font-medium -mt-1">
//                     Travel Planner Dashboard
//                   </span>
//                 </div>
//               </div>
//               {/* Profile */}
                      
      
              
//             </header>
//       {/* Navigation & Header Status */}
//       <div className="flex items-center justify-between">
//         <button
//           onClick={() => navigate(-1)}
//           className="btn btn-ghost glass gap-2 text-base-content hover:bg-white/20"
//         >
//           <FiArrowLeft /> ย้อนกลับ
//         </button>
//         <span className="text-xs badge badge-outline glass px-3 py-2">
//           Trip ID: #{tripId}
//         </span>
//       </div>

//       {error && (
//         <div className="alert alert-error glass text-white shadow-lg">
//           <span>{error}</span>
//         </div>
//       )}

//       {/* Trip Info Card Component */}
//       <TripInfoCard trip={trip} formatDate={formatDate} />

//       {/* Gemini Weather Forecast Component */}
//       <GeminiWeatherCard
//         tripId={tripId}
//         weatherPrediction={weatherPrediction}
//         weatherLoading={weatherLoading}
//         weatherError={weatherError}
//         onGetForecast={getWeatherForecast}
//       />

//       {/* Days Tabs Section */}
//       <div className="space-y-4">
//         <div className="flex items-center justify-between">
//           <h2 className="text-xl font-bold flex items-center gap-2">
//             <FiCalendar /> แผนการเดินทางรายวัน
//           </h2>
//           <button
//             onClick={handleOpenAddDayModal}
//             className="btn btn-primary btn-sm rounded-full gap-1"
//           >
//             <FiPlus /> เพิ่มวันเดินทาง
//           </button>
//         </div>

//         <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
//           {trip?.days && trip.days.length > 0 ? (
//             trip.days.map((day) => {
//               const isActive = activeDay?.id === day.id;
//               return (
//                 <button
//                   key={day.id}
//                   onClick={() => setSelectedDayId(day.id)}
//                   className={`btn btn-sm rounded-2xl whitespace-nowrap transition-all ${
//                     isActive
//                       ? "btn-primary shadow-lg scale-105"
//                       : "btn-ghost glass text-base-content hover:bg-white/30"
//                   }`}
//                 >
//                   Day {day.dayCount}
//                   {day.dayDate && ` (${formatDate(day.dayDate)})`}
//                 </button>
//               );
//             })
//           ) : (
//             <div className="text-sm text-base-content/60 py-2">
//               ยังไม่มีวันเดินทาง กดปุ่ม "เพิ่มวันเดินทาง" ด้านบนเพื่อเริ่มต้น
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Selected Day Content */}
//       {activeDay && (
//         <div className="glass glass-card p-6 rounded-3xl space-y-6">
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/20 pb-4 gap-2">
//             <div>
//               <div className="flex items-center gap-3">
//                 <h3 className="text-2xl font-bold">Day {activeDay.dayCount}</h3>
//                 <span className="text-sm opacity-70">
//                   {formatDate(activeDay.dayDate)}
//                 </span>
//               </div>
//               <p className="text-sm opacity-80 mt-1">{activeDay.description}</p>
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => handleOpenEditDayModal(activeDay)}
//                 className="btn btn-ghost btn-xs text-info hover:bg-white/20"
//               >
//                 <FiEdit2 /> แก้ไขวัน
//               </button>
//               <button
//                 onClick={() => handleDeleteDay(activeDay.id)}
//                 className="btn btn-ghost btn-xs text-error hover:bg-white/20"
//               >
//                 <FiTrash2 /> ลบวัน
//               </button>
//             </div>
//           </div>

//           <div className="space-y-4">
//             <div className="flex items-center justify-between">
//               <h4 className="font-semibold text-lg">รายการกิจกรรม</h4>
//               <button
//                 onClick={handleOpenAddActivityModal}
//                 className="btn btn-primary btn-sm glass rounded-full gap-1"
//               >
//                 <FiPlus /> เพิ่มกิจกรรม
//               </button>
//             </div>

//             {activeDay.activities && activeDay.activities.length > 0 ? (
//               <div className="grid grid-cols-1 gap-4">
//                 {activeDay.activities.map((act) => (
//                   <ActivityItem
//                     key={act.id}
//                     activity={act}
//                     typeConfig={
//                       ACTIVITY_TYPES[act.activityType] || ACTIVITY_TYPES.ATTRACTION
//                     }
//                     formatTime={formatTime}
//                     onEdit={handleOpenEditActivityModal}
//                     onDelete={handleDeleteActivity}
//                   />
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-10 glass rounded-2xl opacity-60">
//                 <p>ยังไม่มีกิจกรรมในวันนี้</p>
//                 <button
//                   onClick={handleOpenAddActivityModal}
//                   className="btn btn-link text-primary btn-sm mt-2"
//                 >
//                   + เพิ่มกิจกรรมแรกของคุณ
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Render Modals */}
//       <DayModal
//         isOpen={isDayModalOpen}
//         onClose={() => setIsDayModalOpen(false)}
//         onSubmit={handleSaveDay}
//         editingDay={editingDay}
//         dayFormData={dayFormData}
//         setDayFormData={setDayFormData}
//         hasDays={Boolean(trip?.days && trip.days.length > 0)}
//       />

//       <ActivityModal
//         isOpen={isActivityModalOpen}
//         onClose={() => setIsActivityModalOpen(false)}
//         onSubmit={handleSaveActivity}
//         editingActivity={editingActivity}
//         activityFormData={activityFormData}
//         setActivityFormData={setActivityFormData}
//       />
//     </div>
//   );
// }

// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   FiArrowLeft,
//   FiPlus,
//   FiCalendar,
//   FiMapPin,
//   FiClock,
//   FiDollarSign,
//   FiEdit2,
//   FiTrash2,
//   FiHome,
//   FiTruck,
//   FiCoffee,
//   FiNavigation,
// } from "react-icons/fi";
// import { useTripActivityStore } from "@/stores/tripActivityStore";
// import DayModal from "@/components/DayModal";
// import ActivityModal from "@/components/ActivityModal";

// const ACTIVITY_TYPES = {
//   ACCOMMODATION: { label: "ที่พัก", icon: FiHome, color: "badge-primary" },
//   TRANSPORT: { label: "การเดินทาง", icon: FiTruck, color: "badge-info" },
//   RESTAURANT: { label: "อาหาร/ร้านค้า", icon: FiCoffee, color: "badge-warning" },
//   ATTRACTION: { label: "สถานที่ท่องเที่ยว", icon: FiNavigation, color: "badge-accent" },
// };

// export default function TripActivity() {
//   const { tripId } = useParams();
//   const navigate = useNavigate();

//   const {
//     trip,
//     loading,
//     error,
//     fetchTripDetails,
//     createDay,
//     updateDay,
//     deleteDay,
//     createActivity,
//     updateActivity,
//     deleteActivity,
//   } = useTripActivityStore();

//   const [selectedDayId, setSelectedDayId] = useState(null);

//   // Modal States
//   const [isDayModalOpen, setIsDayModalOpen] = useState(false);
//   const [dayFormData, setDayFormData] = useState({ dayDate: "", description: "" });
//   const [editingDay, setEditingDay] = useState(null);

//   const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
//   const [editingActivity, setEditingActivity] = useState(null);
//   const [activityFormData, setActivityFormData] = useState({
//     dayId: "",
//     activityType: "ATTRACTION",
//     locationName: "",
//     activityDate: "",
//     activityTime: "",
//     price: 0,
//     description: "",
//     status: "planned",
//   });

//   useEffect(() => {
//     if (tripId) fetchTripDetails(tripId);
//   }, [tripId]);

//   useEffect(() => {
//     if (trip?.days && trip.days.length > 0 && !selectedDayId) {
//       setSelectedDayId(trip.days[0].id);
//     }
//   }, [trip]);

//   const activeDay = trip?.days?.find((d) => d.id === selectedDayId) || trip?.days?.[0];

//   const formatDate = (dateString) => {
//     if (!dateString) return "-";
//     return new Date(dateString).toLocaleDateString("th-TH", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   const formatTime = (timeString) => {
//     if (!timeString) return "";
//     const date = new Date(timeString);
//     if (isNaN(date.getTime())) return timeString;
//     return date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
//   };

//   // Day Handlers
//   const handleOpenAddDayModal = () => {
//     setEditingDay(null);
//     setDayFormData({ dayDate: "", description: "" });
//     setIsDayModalOpen(true);
//   };

//   const handleOpenEditDayModal = (day) => {
//     setEditingDay(day);
//     setDayFormData({
//       dayDate: day.dayDate ? new Date(day.dayDate).toISOString().split("T")[0] : "",
//       description: day.description || "",
//     });
//     setIsDayModalOpen(true);
//   };

//   const handleSaveDay = async (e) => {
//     e.preventDefault();
//     try {
//       if (editingDay) {
//         await updateDay(editingDay.id, tripId, dayFormData);
//       } else {
//         const isFirstDay = !trip?.days || trip.days.length === 0;
//         await createDay(tripId, {
//           ...(isFirstDay && { dayDate: dayFormData.dayDate }),
//           description: dayFormData.description,
//         });
//       }
//       setIsDayModalOpen(false);
//     } catch (err) {}
//   };

//   const handleDeleteDay = async (dayId) => {
//     if (window.confirm("คุณต้องการลบวันนี้และกิจกรรมทั้งหมดในวันนี้หรือไม่?")) {
//       await deleteDay(dayId, tripId);
//       if (selectedDayId === dayId) setSelectedDayId(null);
//     }
//   };

//   // Activity Handlers
//   const handleOpenAddActivityModal = () => {
//     if (!activeDay) return alert("กรุณาสร้างวันเดินทางก่อนเพิ่มกิจกรรม");
//     setEditingActivity(null);
//     setActivityFormData({
//       dayId: activeDay.id,
//       activityType: "ATTRACTION",
//       locationName: "",
//       activityDate: activeDay.dayDate
//         ? new Date(activeDay.dayDate).toISOString().split("T")[0]
//         : "",
//       activityTime: "",
//       price: 0,
//       description: "",
//       status: "planned",
//     });
//     setIsActivityModalOpen(true);
//   };

//   const handleOpenEditActivityModal = (act) => {
//     setEditingActivity(act);
//     setActivityFormData({
//       dayId: act.dayId,
//       activityType: act.activityType || "ATTRACTION",
//       locationName: act.locationName || "",
//       activityDate: act.activityDate
//         ? new Date(act.activityDate).toISOString().split("T")[0]
//         : "",
//       activityTime: act.activityTime
//         ? new Date(act.activityTime).toISOString().substring(11, 16)
//         : "",
//       price: act.price || 0,
//       description: act.description || "",
//       status: act.status || "planned",
//     });
//     setIsActivityModalOpen(true);
//   };

//   const handleSaveActivity = async (e) => {
//     e.preventDefault();
//     try {
//       let formattedTime = null;
//       if (activityFormData.activityTime) {
//         const dateStr = activityFormData.activityDate || new Date().toISOString().split("T")[0];
//         formattedTime = new Date(`${dateStr}T${activityFormData.activityTime}:00Z`).toISOString();
//       }

//       const payload = {
//         ...activityFormData,
//         price: Number(activityFormData.price),
//         activityTime: formattedTime,
//       };

//       if (editingActivity) {
//         await updateActivity(tripId, editingActivity.id, payload);
//       } else {
//         await createActivity(tripId, payload);
//       }
//       setIsActivityModalOpen(false);
//     } catch (err) {}
//   };

//   const handleDeleteActivity = async (actId) => {
//     if (window.confirm("คุณต้องการลบกิจกรรมนี้ใช่หรือไม่?")) {
//       await deleteActivity(tripId, actId);
//     }
//   };

//   if (loading && !trip) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <span className="loading loading-spinner loading-lg text-primary"></span>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <button
//           onClick={() => navigate(-1)}
//           className="btn btn-ghost glass gap-2 text-base-content hover:bg-white/20"
//         >
//           <FiArrowLeft /> ย้อนกลับ
//         </button>
//         <span className="text-xs badge badge-outline glass px-3 py-2">
//           Trip ID: #{tripId}
//         </span>
//       </div>

//       {error && (
//         <div className="alert alert-error glass text-white shadow-lg">
//           <span>{error}</span>
//         </div>
//       )}

//       {/* Trip Info Card */}
//       <div className="glass glass-card p-6 rounded-3xl space-y-3">
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//           <div>
//             <h1 className="text-3xl font-extrabold text-base-content">
//               {trip?.tripName || "รายละเอียดทริป"}
//             </h1>
//             <p className="text-sm opacity-80 flex items-center gap-2 mt-1">
//               <FiMapPin className="text-primary" />
//               {trip?.destination || "ไม่ระบุจุดหมายปลายทาง"}
//             </p>
//           </div>
//           <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/30 text-sm">
//             <FiCalendar className="text-primary" />
//             <span>
//               {formatDate(trip?.startDate)} - {formatDate(trip?.endDate)}
//             </span>
//           </div>
//         </div>
//         {trip?.tripDescription && (
//           <p className="text-sm opacity-75 pt-2 border-t border-white/20">
//             {trip.tripDescription}
//           </p>
//         )}
//       </div>

//       {/* Days Tabs */}
//       <div className="space-y-4">
//         <div className="flex items-center justify-between">
//           <h2 className="text-xl font-bold flex items-center gap-2">
//             <FiCalendar /> แผนการเดินทางรายวัน
//           </h2>
//           <button
//             onClick={handleOpenAddDayModal}
//             className="btn btn-primary btn-sm rounded-full gap-1"
//           >
//             <FiPlus /> เพิ่มวันเดินทาง
//           </button>
//         </div>

//         <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
//           {trip?.days && trip.days.length > 0 ? (
//             trip.days.map((day) => {
//               const isActive = activeDay?.id === day.id;
//               return (
//                 <button
//                   key={day.id}
//                   onClick={() => setSelectedDayId(day.id)}
//                   className={`btn btn-sm rounded-2xl whitespace-nowrap transition-all ${
//                     isActive
//                       ? "btn-primary shadow-lg scale-105"
//                       : "btn-ghost glass text-base-content hover:bg-white/30"
//                   }`}
//                 >
//                   Day {day.dayCount}
//                   {day.dayDate && ` (${formatDate(day.dayDate)})`}
//                 </button>
//               );
//             })
//           ) : (
//             <div className="text-sm text-base-content/60 py-2">
//               ยังไม่มีวันเดินทาง กดปุ่ม "เพิ่มวันเดินทาง" ด้านบนเพื่อเริ่มต้น
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Selected Day Content */}
//       {activeDay && (
//         <div className="glass glass-card p-6 rounded-3xl space-y-6">
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/20 pb-4 gap-2">
//             <div>
//               <div className="flex items-center gap-3">
//                 <h3 className="text-2xl font-bold">Day {activeDay.dayCount}</h3>
//                 <span className="text-sm opacity-70">
//                   {formatDate(activeDay.dayDate)}
//                 </span>
//               </div>
//               <p className="text-sm opacity-80 mt-1">{activeDay.description}</p>
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => handleOpenEditDayModal(activeDay)}
//                 className="btn btn-ghost btn-xs text-info hover:bg-white/20"
//               >
//                 <FiEdit2 /> แก้ไขวัน
//               </button>
//               <button
//                 onClick={() => handleDeleteDay(activeDay.id)}
//                 className="btn btn-ghost btn-xs text-error hover:bg-white/20"
//               >
//                 <FiTrash2 /> ลบวัน
//               </button>
//             </div>
//           </div>

//           <div className="space-y-4">
//             <div className="flex items-center justify-between">
//               <h4 className="font-semibold text-lg">รายการกิจกรรม</h4>
//               <button
//                 onClick={handleOpenAddActivityModal}
//                 className="btn btn-primary btn-sm glass rounded-full gap-1"
//               >
//                 <FiPlus /> เพิ่มกิจกรรม
//               </button>
//             </div>

//             {activeDay.activities && activeDay.activities.length > 0 ? (
//               <div className="grid grid-cols-1 gap-4">
//                 {activeDay.activities.map((act) => {
//                   const typeConfig =
//                     ACTIVITY_TYPES[act.activityType] || ACTIVITY_TYPES.ATTRACTION;
//                   const IconComponent = typeConfig.icon;

//                   return (
//                     <div
//                       key={act.id}
//                       className="glass p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-xl transition-all"
//                     >
//                       <div className="flex items-start gap-4">
//                         <div className="p-3 rounded-2xl bg-white/30 backdrop-blur-md text-primary text-xl shadow-inner">
//                           <IconComponent />
//                         </div>
//                         <div className="space-y-1">
//                           <div className="flex items-center gap-2 flex-wrap">
//                             <span className={`badge ${typeConfig.color} badge-sm`}>
//                               {typeConfig.label}
//                             </span>
//                             <h5 className="font-bold text-base">{act.locationName}</h5>
//                           </div>
//                           {act.description && (
//                             <p className="text-xs opacity-75">{act.description}</p>
//                           )}
//                           <div className="flex items-center gap-4 text-xs opacity-70 pt-1 flex-wrap">
//                             {act.activityTime && (
//                               <span className="flex items-center gap-1">
//                                 <FiClock /> {formatTime(act.activityTime)}
//                               </span>
//                             )}
//                             <span className="flex items-center gap-1">
//                               <FiDollarSign />
//                               {Number(act.price).toLocaleString()} THB
//                             </span>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="flex items-center justify-end gap-2 border-t md:border-t-0 border-white/10 pt-2 md:pt-0">
//                         <button
//                           onClick={() => handleOpenEditActivityModal(act)}
//                           className="btn btn-circle btn-ghost btn-sm hover:bg-white/20"
//                         >
//                           <FiEdit2 className="text-info" />
//                         </button>
//                         <button
//                           onClick={() => handleDeleteActivity(act.id)}
//                           className="btn btn-circle btn-ghost btn-sm hover:bg-white/20"
//                         >
//                           <FiTrash2 className="text-error" />
//                         </button>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             ) : (
//               <div className="text-center py-10 glass rounded-2xl opacity-60">
//                 <p>ยังไม่มีกิจกรรมในวันนี้</p>
//                 <button
//                   onClick={handleOpenAddActivityModal}
//                   className="btn btn-link text-primary btn-sm mt-2"
//                 >
//                   + เพิ่มกิจกรรมแรกของคุณ
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Render Modals */}
//       <DayModal
//         isOpen={isDayModalOpen}
//         onClose={() => setIsDayModalOpen(false)}
//         onSubmit={handleSaveDay}
//         editingDay={editingDay}
//         dayFormData={dayFormData}
//         setDayFormData={setDayFormData}
//         hasDays={Boolean(trip?.days && trip.days.length > 0)}
//       />

//       <ActivityModal
//         isOpen={isActivityModalOpen}
//         onClose={() => setIsActivityModalOpen(false)}
//         onSubmit={handleSaveActivity}
//         editingActivity={editingActivity}
//         activityFormData={activityFormData}
//         setActivityFormData={setActivityFormData}
//       />
//     </div>
//   );
// }