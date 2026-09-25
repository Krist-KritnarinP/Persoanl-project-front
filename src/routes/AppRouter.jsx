import React from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  Outlet,
} from "react-router-dom";

import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Trips from "@/pages/TripsActivity";
import Userprofile from "@/pages/userprofile";
import useUserStore from "@/stores/userStore";

// เช็กสิทธิ์คนที่ Login แล้ว
const ProtectRoute = () => {
  const user = useUserStore((state) => state.user);
  return user ? <Outlet /> : <Navigate to="/" replace />;
};

// เช็กสิทธิ์คนที่ยังไม่ได้ Login
const GuestRoute = () => {
  const user = useUserStore((state) => state.user);
  return !user ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      { path: "/", element: <Login /> },
    ],
  },
  {
    element: <ProtectRoute />,
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/userprofile", element: <Userprofile /> },
      { path: "/trips", element: <Trips /> },
      { path: "/trips/:tripId", element: <Trips /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);

function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;
