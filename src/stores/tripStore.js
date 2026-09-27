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
      const tripsData = [];
      let page = 1;
      while (page) {
        const response = await mainApi.get("/trips", { params: { page } });
        tripsData.push(...(response.data?.data || []));
        page = response.data?.nextPage;
      }
      set({
        trips: Array.isArray(tripsData) ? tripsData : [],
        loading: false,
      });
    } catch (error) {
      console.error("Fetch trips error:", error);
      set({
        error: error.response?.data?.message || "ไม่สามารถดึงข้อมูลทริปได้",
        loading: false,
        trips: [],
      });
    }
  },

  // 2. สร้างทริปใหม่
  createTrip: async (tripData) => {
    set({ loading: true, error: null });
    try {
      const response = await mainApi.post("/trips", tripData);

      get().fetchTrips();

      return response.data;
    } catch (error) {
      console.error("Create trip error:", error);
      set({
        error: error.response?.data?.message || "ไม่สามารถสร้างทริปได้",
        loading: false,
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
        loading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useTripStore;
