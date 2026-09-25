import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8899/api";

export const mainApi = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

const getStoredToken = () => {
  const direct = localStorage.getItem("token");
  if (direct) return direct;
  try {
    const raw = localStorage.getItem("authState");
    if (!raw) return null;
    return JSON.parse(raw)?.state?.token || null;
  } catch {
    return null;
  }
};

// 🔑 Interceptor ดึง Token จาก authState (Zustand Persist) แนบไปกับทุก Request
mainApi.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 401 -> token หมดอายุ/ไม่ถูกต้อง: ล้าง session แล้วกลับหน้า login
mainApi.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401 && window.location.pathname !== "/") {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("authState");
      } catch {
        // ignore
      }
      window.location.replace("/");
    }
    return Promise.reject(error);
  }
);

export const apiRegister = async (body) => {
  const { confirmPassword: _omit, ...payload } = body ?? {};
  return await mainApi.post("/auth/register", payload);
};

export const apiLogin = async (body) => {
  return await mainApi.post("/auth/login", body);
};

export default mainApi;
