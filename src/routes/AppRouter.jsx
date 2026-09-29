import LoadingScreen from "@/components/LoadingScreen";
import React, { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  Outlet,
} from "react-router-dom";

import Landing from "@/pages/Landing";
import AppLayout from "@/layouts/AppLayout";
import RouteSeo from "@/components/RouteSeo";

const TripBilling = lazy(() => import("@/pages/TripBilling"));
const AiPlanner = lazy(() => import("@/pages/AiPlanner"));
const TravelOverview = lazy(() => import("@/pages/TravelOverview"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Login = lazy(() => import("@/pages/Login"));
const Trips = lazy(() => import("@/pages/TripsActivity"));
const TripMapPage = lazy(() => import("@/pages/TripMapPage"));
const ShareTripView = lazy(() => import("@/pages/ShareTripView"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Userprofile = lazy(() => import("@/pages/Userprofile"));
const Chat = lazy(() => import("@/pages/Chat"));
const Notifications = lazy(() => import("@/pages/Notifications"));
import useUserStore from "@/stores/userStore";

// เช็กสิทธิ์คนที่ Login แล้ว
const ProtectRoute = () => {
  const user = useUserStore((state) => state.user);
  return user ? <AppLayout /> : <Navigate to="/login" replace />;
};

// เช็กสิทธิ์คนที่ยังไม่ได้ Login
const GuestRoute = () => {
  const user = useUserStore((state) => state.user);
  return !user ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

const router = createBrowserRouter([
  {
    element: <RouteSeo />,
    children: [
      { path: "/", element: <Landing /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/reset-password", element: <ResetPassword /> },
      // Public: ลิงก์แชร์ดูได้อย่างเดียว (ไม่ต้อง login, เข้าได้ทั้งคนนอกและคนมีบัญชี)
      { path: "/share/:token", element: <ShareTripView /> },
      {
        element: <GuestRoute />,
        children: [{ path: "/login", element: <Login /> }],
      },
      {
        element: <ProtectRoute />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/travel-overview", element: <TravelOverview /> },
          { path: "/trips/ai", element: <AiPlanner /> },
          { path: "/userprofile", element: <Userprofile /> },
          { path: "/chat", element: <Chat /> },
          { path: "/notifications", element: <Notifications /> },
          { path: "/trips", element: <Trips /> },
          { path: "/trips/:tripId", element: <Trips /> },
          { path: "/trips/:tripId/map", element: <TripMapPage /> },
          { path: "/trips/:tripId/billing", element: <TripBilling /> },
        ],
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

function AppRouter() {
  return (
    <Suspense
      fallback={<LoadingScreen />}
    >
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default AppRouter;
