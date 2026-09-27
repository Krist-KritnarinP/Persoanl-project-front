import axios from "axios";
import { createSessionRefresher } from "../utils/refreshSession";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8899/api";

export const mainApi = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
  withCredentials: true,
});

const getStoredToken = () => {
  try {
    const raw = localStorage.getItem("authState");
    if (!raw) return null;
    return JSON.parse(raw)?.state?.token || null;
  } catch {
    return null;
  }
};

const getStoredUserId = () => {
  try {
    return (
      JSON.parse(localStorage.getItem("authState"))?.state?.user?.id ?? null
    );
  } catch {
    return null;
  }
};

// 🔑 Interceptor ดึง Token จาก authState (Zustand Persist) แนบไปกับทุก Request
mainApi.interceptors.request.use(
  (config) => {
    if (config._sessionUserId === undefined)
      config._sessionUserId = getStoredUserId();
    const token = getStoredToken();
    if (token) {
      if (config._sessionUserId !== getStoredUserId())
        throw new Error("Account changed");
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

const refreshApi = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true,
});
const refreshSession = createSessionRefresher({
  read: getStoredToken,
  renew: async () => (await refreshApi.post("/auth/refresh", {})).data,
  save: (session) => {
    const stored = JSON.parse(localStorage.getItem("authState"));
    localStorage.setItem(
      "authState",
      JSON.stringify({ ...stored, state: { ...stored.state, ...session } }),
    );
    window.dispatchEvent(new CustomEvent("auth:renewed", { detail: session }));
  },
  lock: globalThis.navigator?.locks
    ? (work) => navigator.locks.request("ailhoung-refresh", work)
    : undefined,
});
mainApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const config = error.config;
    if (
      error.response?.status !== 401 ||
      !config ||
      config.url?.startsWith("/auth/")
    )
      throw error;
    if (config._sessionUserId !== getStoredUserId()) throw error;
    if (!config._renewed && getStoredToken()) {
      config._renewed = true;
      const failedToken = String(config.headers.Authorization || "").replace(
        /^Bearer /,
        "",
      );
      try {
        const token = await refreshSession(failedToken);
        if (config._sessionUserId !== getStoredUserId())
          throw new Error("Account changed");
        config.headers.Authorization = `Bearer ${token}`;
        return mainApi(config);
      } catch (refreshError) {
        // A temporary outage should not erase a recoverable session.
        if (
          refreshError.response?.status !== 401 &&
          refreshError.response?.status !== 403
        )
          throw refreshError;
      }
    }
    localStorage.removeItem("token");
    localStorage.removeItem("authState");
    if (window.location.pathname !== "/login")
      window.location.replace("/login");
    throw error;
  },
);

export const apiRegister = async (body) => {
  const { confirmPassword: _omit, ...payload } = body ?? {};
  return await mainApi.post("/auth/register", payload);
};

export const apiLogin = async (body) => {
  return await mainApi.post("/auth/login", body);
};

export default mainApi;
