// import { create } from "zustand";
// import { mainApi } from "@/api/mainApi";
// import useUserStore from "./userStore";

// const useTripStore = create((set, get) => ({
//   trips: [],
//   currentTrip: null, // เก็บข้อมูลทริปปัจจุบัน (สำหรับหน้า Timeline)
//   loading: false,
//   error: null,

//   // 🔑 Helper: ดึง Bearer Header จาก Zustand userStore
//   getAuthHeader: () => {
//     const token = useUserStore.getState().token;
//     return token ? { Authorization: `Bearer ${token}` } : {};
//   },

//   // 1. GET /trips - ดึงทริปทั้งหมดของผู้ใช้
//   fetchTrips: async () => {
//     set({ loading: true, error: null });
//     try {
//       const response = await mainApi.get("/trips", {
//         headers: get().getAuthHeader(),
//       });

//       // Backend คืนค่า { message, data: [...] }
//       const tripsData = response.data?.data || [];
      
//       set({ 
//         trips: Array.isArray(tripsData) ? tripsData : [], 
//         loading: false 
//       });
//     } catch (err) {
//       console.error("Error fetching trips:", err);
//       set({ 
//         error: err.response?.data?.message || "Failed to fetch trips", 
//         loading: false,
//         trips: [] 
//       });
//     }
//   },

//   // 2. POST /trips - สร้างทริปใหม่
//   createTrip: async (tripData) => {
//     set({ loading: true, error: null });
//     try {
//       const response = await mainApi.post("/trips", tripData, {
//         headers: get().getAuthHeader(),
//       });

//       const newTrip = response.data?.data;

//       // อัปเดต state trips ทันทีโดยไม่ต้องโหลดใหม่
//       set((state) => ({
//         trips: [newTrip, ...state.trips],
//         loading: false,
//       }));

//       return { success: true, data: newTrip };
//     } catch (err) {
//       console.error("Error creating trip:", err);
//       set({ loading: false });
//       return { 
//         success: false, 
//         error: err.response?.data?.message || "Failed to create trip" 
//       };
//     }
//   },

//   // 3. GET /trips/:tripId - ดึงข้อมูลทริปเฉพาะ ID (หน้า Timeline)
//   getTripById: async (tripId) => {
//     set({ loading: true, error: null });
//     try {
//       const response = await mainApi.get(`/trips/${tripId}`, {
//         headers: get().getAuthHeader(),
//       });

//       const trip = response.data?.data;
//       set({ currentTrip: trip, loading: false });
//       return { success: true, data: trip };
//     } catch (err) {
//       console.error("Error getting trip by id:", err);
//       set({ loading: false });
//       return { 
//         success: false, 
//         error: err.response?.data?.message || "Trip not found" 
//       };
//     }
//   },

//   // 4. PUT /trips/:tripId - แก้ไขทริป
//   updateTrip: async (tripId, updateData) => {
//     set({ loading: true, error: null });
//     try {
//       const response = await mainApi.put(`/trips/${tripId}`, updateData, {
//         headers: get().getAuthHeader(),
//       });

//       const updatedTrip = response.data?.data;

//       // อัปเดตทริปใน state trips
//       set((state) => ({
//         trips: state.trips.map((t) => (t.id === Number(tripId) ? updatedTrip : t)),
//         currentTrip: state.currentTrip?.id === Number(tripId) ? updatedTrip : state.currentTrip,
//         loading: false,
//       }));

//       return { success: true, data: updatedTrip };
//     } catch (err) {
//       console.error("Error updating trip:", err);
//       set({ loading: false });
//       return { 
//         success: false, 
//         error: err.response?.data?.message || "Failed to update trip" 
//       };
//     }
//   },

//   // 5. DELETE /trips/:tripId - ลบทริป
//   deleteTrip: async (tripId) => {
//     set({ loading: true, error: null });
//     try {
//       await mainApi.delete(`/trips/${tripId}`, {
//         headers: get().getAuthHeader(),
//       });

//       // ลบทริปออกจาก state trips
//       set((state) => ({
//         trips: state.trips.filter((t) => t.id !== Number(tripId)),
//         loading: false,
//       }));

//       return { success: true };
//     } catch (err) {
//       console.error("Error deleting trip:", err);
//       set({ loading: false });
//       return { 
//         success: false, 
//         error: err.response?.data?.message || "Failed to delete trip" 
//       };
//     }
//   },
// }));

// export default useTripStore;

// import { create } from "zustand";
// import { mainApi } from "@/api/mainApi";

// const useTripStore = create((set) => ({
//   trips: [],
//   currentTrip: null, // เก็บข้อมูลทริปปัจจุบัน
//   loading: false,
//   error: null,

//   // 1. GET /trips - ดึงทริปทั้งหมดของผู้ใช้
//   fetchTrips: async () => {
//     set({ loading: true, error: null });
//     try {
//       const response = await mainApi.get("/trips");
//       const tripsData = response.data?.data || [];
      
//       set({ 
//         trips: Array.isArray(tripsData) ? tripsData : [], 
//         loading: false 
//       });
//     } catch (err) {
//       console.error("Error fetching trips:", err);
//       set({ 
//         error: err.response?.data?.message || "Failed to fetch trips", 
//         loading: false,
//         trips: [] 
//       });
//     }
//   },

//   // 2. POST /trips - สร้างทริปใหม่
//   createTrip: async (tripData) => {
//     set({ loading: true, error: null });
//     try {
//       const response = await mainApi.post("/trips", tripData);
//       const newTrip = response.data?.data;

//       set((state) => ({
//         trips: [newTrip, ...state.trips],
//         loading: false,
//       }));

//       return { success: true, data: newTrip };
//     } catch (err) {
//       console.error("Error creating trip:", err);
//       set({ loading: false });
//       return { 
//         success: false, 
//         error: err.response?.data?.message || "Failed to create trip" 
//       };
//     }
//   },

//   // 3. GET /trips/:tripId - ดึงข้อมูลทริปเฉพาะ ID
//   getTripById: async (tripId) => {
//     set({ loading: true, error: null });
//     try {
//       const response = await mainApi.get(`/trips/${tripId}`);
//       const trip = response.data?.data;
//       set({ currentTrip: trip, loading: false });
//       return { success: true, data: trip };
//     } catch (err) {
//       console.error("Error getting trip by id:", err);
//       set({ loading: false });
//       return { 
//         success: false, 
//         error: err.response?.data?.message || "Trip not found" 
//       };
//     }
//   },

//   // 4. PUT /trips/:tripId - แก้ไขทริป
//   updateTrip: async (tripId, updateData) => {
//     set({ loading: true, error: null });
//     try {
//       const response = await mainApi.put(`/trips/${tripId}`, updateData);
//       const updatedTrip = response.data?.data;

//       set((state) => ({
//         trips: state.trips.map((t) => (t.id === Number(tripId) ? updatedTrip : t)),
//         currentTrip: state.currentTrip?.id === Number(tripId) ? updatedTrip : state.currentTrip,
//         loading: false,
//       }));

//       return { success: true, data: updatedTrip };
//     } catch (err) {
//       console.error("Error updating trip:", err);
//       set({ loading: false });
//       return { 
//         success: false, 
//         error: err.response?.data?.message || "Failed to update trip" 
//       };
//     }
//   },

//   // 5. DELETE /trips/:tripId - ลบทริป
//   deleteTrip: async (tripId) => {
//     set({ loading: true, error: null });
//     try {
//       await mainApi.delete(`/trips/${tripId}`);

//       set((state) => ({
//         trips: state.trips.filter((t) => t.id !== Number(tripId)),
//         loading: false,
//       }));

//       return { success: true };
//     } catch (err) {
//       console.error("Error deleting trip:", err);
//       set({ loading: false });
//       return { 
//         success: false, 
//         error: err.response?.data?.message || "Failed to delete trip" 
//       };
//     }
//   },
// }));

// export default useTripStore;




// import { create } from "zustand";
// import { mainApi } from "@/api/mainApi";

// export const useTripActivityStore = create((set, get) => ({
//   trip: null,
//   loading: false,
//   error: null,
//   weatherPrediction: null,
//   weatherLoading: false,
//   weatherError: null,

//   // 1. GET /trips/:tripId - ดึงข้อมูลทริป วันเดินทาง และกิจกรรมทั้งหมด
//   fetchTripDetails: async (tripId) => {
//     set({ loading: true, error: null });
//     try {
//       const response = await mainApi.get(`/trips/${tripId}`);
//       const tripData = response.data?.data || response.data;
//       set({ trip: tripData, loading: false });
//       return tripData;
//     } catch (err) {
//       console.error("Error fetching trip details:", err);
//       set({
//         error: err.response?.data?.message || "Failed to fetch trip details",
//         loading: false,
//       });
//     }
//   },

//   // 2. POST /trips/:tripId/days - เพิ่มวันเดินทางใหม่
//   createDay: async (tripId, dayData) => {
//     set({ loading: true });
//     try {
//       const response = await mainApi.post(`/trips/${tripId}/days`, dayData);
//       const newDay = response.data?.data || response.data;

//       set((state) => ({
//         trip: state.trip
//           ? { ...state.trip, days: [...(state.trip.days || []), newDay] }
//           : null,
//         loading: false,
//       }));

//       return newDay;
//     } catch (err) {
//       console.error("Create day error:", err);
//       set({ loading: false });
//       throw err;
//     }
//   },

//   // 3. PUT /trips/:tripId/days/:dayId - แก้ไขวันเดินทาง
//   updateDay: async (dayId, tripId, dayData) => {
//     set({ loading: true });
//     try {
//       const response = await mainApi.put(`/trips/${tripId}/days/${dayId}`, dayData);
//       const updatedDay = response.data?.data || response.data;

//       set((state) => ({
//         trip: state.trip
//           ? {
//               ...state.trip,
//               days: (state.trip.days || []).map((d) =>
//                 d.id === dayId ? { ...d, ...updatedDay } : d
//               ),
//             }
//           : null,
//         loading: false,
//       }));

//       return updatedDay;
//     } catch (err) {
//       console.error("Update day error:", err);
//       set({ loading: false });
//       throw err;
//     }
//   },

//   // 4. DELETE /trips/:tripId/days/:dayId - ลบวันเดินทาง (แก้ไขให้ส่ง tripId และยิง Endpoint ที่ถูกต้อง)
//   deleteDay: async (dayId, tripId) => {
//     set({ loading: true });
//     try {
//       // ใช้ tripId เพื่อยิงไปยัง Endpoint /trips/:tripId/days/:dayId ตาม Routing ของ Backend
//       // หาก Backend รองรับ /days/:dayId โดยตรง mainApi จะจัดการ fallback ให้
//       const targetTripId = tripId || get().trip?.id;
      
//       if (targetTripId) {
//         await mainApi.delete(`/trips/${targetTripId}/days/${dayId}`);
//       } else {
//         await mainApi.delete(`/days/${dayId}`);
//       }

//       // อัปเดต State ลบวันนั้นออกจาก Array ทันที
//       set((state) => ({
//         trip: state.trip
//           ? {
//               ...state.trip,
//               days: (state.trip.days || []).filter((d) => d.id !== dayId),
//             }
//           : null,
//         loading: false,
//       }));
//     } catch (err) {
//       console.error("Delete day error:", err);
//       set({ loading: false });
//       throw err;
//     }
//   },

//   // ================= ACTIVITIES HANDLERS =================

//   // POST /trips/:tripId/activities - สร้างกิจกรรม
//   createActivity: async (tripId, activityData) => {
//     set({ loading: true });
//     try {
//       await mainApi.post(`/trips/${tripId}/activities`, activityData);
//       await get().fetchTripDetails(tripId);
//     } catch (err) {
//       console.error("Create activity error:", err);
//       set({ loading: false });
//       throw err;
//     }
//   },

//   // PUT /trips/:tripId/activities/:activityId - แก้ไขกิจกรรม
//   updateActivity: async (tripId, activityId, activityData) => {
//     set({ loading: true });
//     try {
//       await mainApi.put(`/trips/${tripId}/activities/${activityId}`, activityData);
//       await get().fetchTripDetails(tripId);
//     } catch (err) {
//       console.error("Update activity error:", err);
//       set({ loading: false });
//       throw err;
//     }
//   },

//   // DELETE /trips/:tripId/activities/:activityId - ลบกิจกรรม
//   deleteActivity: async (tripId, activityId) => {
//     set({ loading: true });
//     try {
//       await mainApi.delete(`/trips/${tripId}/activities/${activityId}`);
//       await get().fetchTripDetails(tripId);
//     } catch (err) {
//       console.error("Delete activity error:", err);
//       set({ loading: false });
//       throw err;
//     }
//   },

//   // GET Weather Forecast
//   getWeatherForecast: async (tripId) => {
//     set({ weatherLoading: true, weatherError: null });
//     try {
//       const response = await mainApi.get(`/trips/${tripId}/weather`);
//       set({
//         weatherPrediction: response.data?.data || response.data,
//         weatherLoading: false,
//       });
//     } catch (err) {
//       console.error("Get weather error:", err);
//       set({
//         weatherError: err.response?.data?.message || "Failed to fetch weather",
//         weatherLoading: false,
//       });
//     }
//   },
// }));

import { create } from "zustand";
import { mainApi } from "@/api/mainApi";

export const useTripStore = create((set, get) => ({
  trips: [],
  loading: false,
  error: null,

  // 1. ดึงข้อมูลทริปทั้งหมดของผู้ใช้
  fetchTrips: async () => {
    set({ loading: true, error: null });
    try {
      const response = await mainApi.get("/trips");
      const tripsData = response.data?.data || response.data;
      set({ 
        trips: Array.isArray(tripsData) ? tripsData : [], 
        loading: false 
      });
    } catch (error) {
      console.error("Fetch trips error:", error);
      set({ 
        error: error.response?.data?.message || "ไม่สามารถดึงข้อมูลทริปได้", 
        loading: false,
        trips: []
      });
    }
  },

  // 2. สร้างทริปใหม่ (แก้ไขการ Return Response)
  createTrip: async (tripData) => {
    set({ loading: true, error: null });
    try {
      // ยิง API สร้างทริป และเก็บค่า response ไว้ก่อน
      const response = await mainApi.post("/trips", tripData);
      
      // อัปเดตรายการทริปใน Store ใหม่ (ไม่กระทบกับ response ตัวเดิม)
      get().fetchTrips();

      // คืนค่า response ของ API กลับไปให้ UserTrip.jsx
      return response.data;
    } catch (error) {
      console.error("Create trip error:", error);
      set({ 
        error: error.response?.data?.message || "ไม่สามารถสร้างทริปได้", 
        loading: false 
      });
      throw error;
    }
  },

  // 3. ลบทริปตาม ID
  deleteTrip: async (tripId) => {
    set({ loading: true, error: null });
    try {
      await mainApi.delete(`/trips/${tripId}`);
      await get().fetchTrips();
    } catch (error) {
      console.error("Delete trip error:", error);
      set({ 
        error: error.response?.data?.message || "ไม่สามารถลบทริปได้", 
        loading: false 
      });
      throw error;
    }
  },
}));

export default useTripStore;