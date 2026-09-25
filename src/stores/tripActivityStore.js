import { create } from "zustand";
import { mainApi } from "@/api/mainApi";

export const useTripActivityStore = create((set, get) => ({
  // State หลักสำหรับ Trip, Days และ Activities
  trip: null,
  loading: false,
  error: null,

  // State สำหรับ Weather Forecast (Gemini)
  weatherPrediction: null,
  weatherLoading: false,
  weatherError: null,

  // 1. Fetch รายละเอียด Trip พร้อม Days และ Activities
  fetchTripDetails: async (tripId) => {
    set({ loading: true, error: null });
    try {
      const response = await mainApi.get(`/trips/${tripId}`);
      set({ 
        trip: response.data.data || response.data, 
        loading: false 
      });
    } catch (error) {
      console.error("Fetch trip details error:", error);
      set({ 
        error: error.response?.data?.message || "ไม่สามารถดึงข้อมูลทริปได้", 
        loading: false 
      });
    }
  },

  // 2. จัดการ Day (เพิ่ม/แก้ไข/ลบ)
  createDay: async (tripId, dayData) => {
    set({ loading: true, error: null });
    try {
      await mainApi.post(`/trips/${tripId}/days`, dayData);
      await get().fetchTripDetails(tripId);
    } catch (error) {
      console.error("Create day error:", error);
      set({ 
        error: error.response?.data?.message || "ไม่สามารถเพิ่มวันเดินทางได้", 
        loading: false 
      });
      throw error;
    }
  },

  updateDay: async (dayId, tripId, dayData) => {
    set({ loading: true, error: null });
    try {
      await mainApi.put(`/days/${dayId}`, dayData);
      await get().fetchTripDetails(tripId);
    } catch (error) {
      console.error("Update day error:", error);
      set({ 
        error: error.response?.data?.message || "ไม่สามารถแก้ไขวันได้", 
        loading: false 
      });
      throw error;
    }
  },

  deleteDay: async (dayId, tripId) => {
    set({ loading: true, error: null });
    try {
      await mainApi.delete(`/days/${dayId}`);
      await get().fetchTripDetails(tripId);
    } catch (error) {
      console.error("Delete day error:", error);
      set({ 
        error: error.response?.data?.message || "ไม่สามารถลบวันได้", 
        loading: false 
      });
      throw error;
    }
  },

  // 3. จัดการ Activity (เพิ่ม/แก้ไข/ลบ)
  createActivity: async (tripId, activityData) => {
    set({ loading: true, error: null });
    try {
      await mainApi.post(`/activities`, activityData);
      await get().fetchTripDetails(tripId);
    } catch (error) {
      console.error("Create activity error:", error);
      set({ 
        error: error.response?.data?.message || "ไม่สามารถเพิ่มกิจกรรมได้", 
        loading: false 
      });
      throw error;
    }
  },

  updateActivity: async (tripId, activityId, activityData) => {
    set({ loading: true, error: null });
    try {
      await mainApi.put(`/activities/${activityId}`, activityData);
      await get().fetchTripDetails(tripId);
    } catch (error) {
      console.error("Update activity error:", error);
      set({ 
        error: error.response?.data?.message || "ไม่สามารถแก้ไขกิจกรรมได้", 
        loading: false 
      });
      throw error;
    }
  },

  deleteActivity: async (tripId, activityId) => {
    set({ loading: true, error: null });
    try {
      await mainApi.delete(`/activities/${activityId}`);
      await get().fetchTripDetails(tripId);
    } catch (error) {
      console.error("Delete activity error:", error);
      set({ 
        error: error.response?.data?.message || "ไม่สามารถลบกิจกรรมได้", 
        loading: false 
      });
      throw error;
    }
  },

  // 4. ดึงข้อมูลพยากรณ์อากาศจาก Gemini
  getWeatherForecast: async (tripId) => {
    set({ weatherLoading: true, weatherError: null });
    try {
      let trip = get().trip;
      
      // ถ้าย้อนกลับมาใช้หรือไม่มี trip ใน state ให้ดึงข้อมูล trip ใหม่ก่อน
      if (!trip || trip.id !== Number(tripId)) {
        const response = await mainApi.get(`/trips/${tripId}`);
        trip = response.data.data || response.data;
      }

      if (!trip) {
        throw new Error("ไม่พบข้อมูลทริปสำหรับประเมินสภาพอากาศ");
      }

      // ดึงรายการสถานที่ เวลา และวันที่จาก days & activities
      const activitiesData = trip?.days?.flatMap((day) =>
        day.activities?.map((act) => ({
          date: day.dayDate,
          time: act.activityTime,
          location: act.locationName,
          type: act.activityType,
        })) || []
      ) || [];

      const payload = {
        location: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        activities: activitiesData,
      };

      const res = await mainApi.post("/weather/predict-weather", payload);
      set({ 
        weatherPrediction: res.data.prediction, 
        weatherLoading: false 
      });
    } catch (error) {
      console.error("Get weather forecast error:", error);
      set({ 
        weatherError: error.response?.data?.message || error.message || "ไม่สามารถดึงข้อมูลสภาพอากาศได้", 
        weatherLoading: false 
      });
    }
  },

  clearError: () => set({ error: null, weatherError: null }),
}));