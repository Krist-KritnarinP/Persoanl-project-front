import { create } from "zustand";
import { mainApi } from "@/api/mainApi";

let fetchSequence = 0;
export const useTripActivityStore = create((set, get) => ({
  // State หลักสำหรับ Trip, Days และ Activities
  trip: null,
  loading: false,
  error: null,

  // State สำหรับ Weather Forecast (Gemini)
  weatherPrediction: null,
  weatherLoading: false,
  weatherError: null,
  weatherHistory: [],
  historyLoading: false,

  // 1. Fetch รายละเอียด Trip พร้อม Days และ Activities
  fetchTripDetails: async (tripId) => {
    const sequence = ++fetchSequence;
    set({
      loading: true,
      error: null,
      ...(get().trip?.id !== Number(tripId)
        ? { trip: null, weatherHistory: [], weatherPrediction: null }
        : {}),
    });
    try {
      const response = await mainApi.get(`/trips/${tripId}`);
      if (sequence !== fetchSequence) return;
      set({
        trip: response.data.data || response.data,
        loading: false,
      });
    } catch (error) {
      if (sequence !== fetchSequence) return;
      console.error("Fetch trip details error:", error);
      set({
        error: error.response?.data?.message || "ไม่สามารถดึงข้อมูลทริปได้",
        loading: false,
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
        loading: false,
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
        loading: false,
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
        loading: false,
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
        loading: false,
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
        loading: false,
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
        loading: false,
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
      const activitiesData =
        trip?.days?.flatMap(
          (day) =>
            day.activities?.map((act) => ({
              date: day.dayDate,
              time: act.activityTime,
              location: act.locationName,
              type: act.activityType,
            })) || [],
        ) || [];

      const payload = {
        tripId: Number(tripId),
        location: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        activities: activitiesData,
      };

      // AI ใช้เวลาตอบ ~20 วินาที: ขยาย timeout เฉพาะเส้นนี้ (default 15s ไม่พอ)
      // Log payload ที่ส่งออก (ดูใน console ของ browser)
      console.log(
        "[AI weather] request payload:",
        JSON.stringify({
          tripId: payload.tripId,
          location: payload.location,
          startDate: payload.startDate,
          endDate: payload.endDate,
          activities: Array.isArray(payload.activities)
            ? payload.activities.length
            : 0,
        }),
      );
      const res = await mainApi.post("/weather/predict-weather", payload, {
        timeout: 120000,
      });
      set({
        weatherPrediction: res.data.prediction,
        weatherLoading: false,
      });
      // โหลดประวัติใหม่เพื่อโชว์วันเวลาที่กด
      get().fetchWeatherHistory(tripId);
    } catch (error) {
      console.error("Get weather forecast error:", error);
      const isTimeout = error?.code === "ECONNABORTED";
      const status = error?.response?.status;
      // "__QUOTA__" เป็น marker ให้ component แปลเป็นภาษาปัจจุบันเอง (store เรียก useLang ไม่ได้)
      const msg = isTimeout
        ? "AI ตอบช้าเกินกำหนด กรุณากดใหม่อีกครั้ง"
        : status === 429
          ? "__QUOTA__"
          : error.response?.data?.message ||
            error.message ||
            "ไม่สามารถดึงข้อมูลสภาพอากาศได้";
      set({ weatherError: msg, weatherLoading: false });
    }
  },

  // ประวัติการทำนายของทริป (มี createdAt = วันที่ user กด)
  fetchWeatherHistory: async (tripId) => {
    set({ historyLoading: true });
    try {
      const res = await mainApi.get(`/weather/history/${tripId}`);
      set({ weatherHistory: res.data?.data || [], historyLoading: false });
    } catch (error) {
      console.error("Fetch weather history error:", error);
      set({ weatherHistory: [], historyLoading: false });
    }
  },

  // ลบประวัติ 1 รายการ
  deleteWeatherHistory: async (tripId, messageId) => {
    try {
      await mainApi.delete(`/weather/history/${messageId}`);
      set((state) => ({
        weatherHistory: state.weatherHistory.filter((m) => m.id !== messageId),
      }));
    } catch (error) {
      console.error("Delete weather history error:", error);
      throw error;
    }
  },

  // เปิดแชร์ลิงก์ดูได้อย่างเดียว (คืน token เดิมถ้ามี)
  createShareLink: async (tripId) => {
    const res = await mainApi.post(`/trips/${tripId}/share`);
    const token = res.data?.data?.shareToken;
    set((state) =>
      state.trip ? { trip: { ...state.trip, shareToken: token } } : state,
    );
    return token;
  },

  // ปิดแชร์ลิงก์
  revokeShareLink: async (tripId) => {
    await mainApi.delete(`/trips/${tripId}/share`);
    set((state) =>
      state.trip ? { trip: { ...state.trip, shareToken: null } } : state,
    );
  },

  clearError: () => set({ error: null, weatherError: null }),
}));
