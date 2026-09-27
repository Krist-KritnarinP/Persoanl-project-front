import { mainApi, apiRegister } from "@/api/mainApi";
import { toast } from "react-toastify";
import { useTripActivityStore } from "./tripActivityStore";
import { useTripStore } from "./tripStore";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: "",
      login: async (data) => {
        const resp = await mainApi.post("/auth/login", data);
        set({ token: resp.data.token, user: resp.data.user });
        return resp;
      },
      loginWithGoogle: async (credential, currentPassword) => {
        const resp = await mainApi.post("/auth/google", {
          credential,
          ...(currentPassword ? { currentPassword } : {}),
        });
        set({ token: resp.data.token, user: resp.data.user });
        return resp;
      },
      register: async (data) => {
        const resp = await apiRegister(data);
        return resp;
      },
      clearSession: () => {
        localStorage.removeItem("token");
        useTripActivityStore.setState({
          trip: null,
          weatherHistory: [],
          weatherPrediction: null,
        });
        useTripStore.setState({ trips: [] });
        set({ token: "", user: null });
      },
      logout: async () => {
        try {
          await mainApi.post("/users/logout");
        } catch (error) {
          if (error.response?.status !== 401) {
            toast.error(
              "Could not revoke server sessions. Please reconnect and sign out again.",
            );
            return;
          }
        }
        get().clearSession();
      },
    }),
    {
      name: "authState",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
);

window.addEventListener("auth:renewed", (event) => {
  useUserStore.setState({ token: event.detail.token, user: event.detail.user });
});
window.addEventListener("storage", (event) => {
  if (event.key === "authState") useUserStore.persist.rehydrate();
});

export default useUserStore;
