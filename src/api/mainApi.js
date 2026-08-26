// import axios from "axios";

// export const mainApi = axios.create({
//   baseURL: "http://localhost:8899/api",
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // 🔑 Interceptor ดึง Token จาก LocalStorage แนบไปกับทุกๆ Request
// mainApi.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token"); 

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// export const apiRegister = async (body) => {
//   return await mainApi.post("/auth/register", body);
// };

// export const apiLogin = async (body) => {
//   return await mainApi.post("/auth/login", body);
// };

// // 👈 เพิ่มบรรทัดนี้ไว้ล่างสุด เพื่อให้ไฟล์อื่นนำ mainApi ไปเรียกใช้ได้สะดวก
// export default mainApi;

import axios from "axios";

export const mainApi = axios.create({
  baseURL: "http://localhost:8899/api",
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔑 Interceptor ดึง Token จาก authState (Zustand Persist) หรือ LocalStorage แนบไปกับทุก Request
mainApi.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem("token");

    // ถ้าไม่มี key "token" ตรงๆ ให้ไปแกะจาก "authState" ของ Zustand Persist
    if (!token) {
      const authStateStr = localStorage.getItem("authState");
      if (authStateStr) {
        try {
          const parsed = JSON.parse(authStateStr);
          token = parsed?.state?.token;
        } catch (e) {
          console.error("Error parsing authState from localStorage:", e);
        }
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const apiRegister = async (body) => {
  return await mainApi.post("/auth/register", body);
};

export const apiLogin = async (body) => {
  return await mainApi.post("/auth/login", body);
};

export default mainApi;