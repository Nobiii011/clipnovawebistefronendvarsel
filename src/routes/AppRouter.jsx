// src/routes/AppRouter.jsx
import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";

import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import CreatorLayout from "../layouts/creator/CreatorLayout";
import AdminLayout from "../layouts/admin/AdminLayout";

function PageLoader() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );
}

// Public — eager
import Landing from "../pages/public/Landing";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Watch from "../pages/watch/Watch";

// Creator — lazy
const Dashboard      = lazy(() => import("../pages/creator/Dashboard"));
const UploadVideo    = lazy(() => import("../pages/creator/UploadVideo"));
const UploadedVideos = lazy(() => import("../pages/creator/UploadedVideos"));
const VideoView      = lazy(() => import("../pages/creator/VideoView"));
const Telegram       = lazy(() => import("../pages/creator/Telegram"));
const Referrals      = lazy(() => import("../pages/creator/Referrals"));
const Payments       = lazy(() => import("../pages/creator/Payments"));
const Withdrawals    = lazy(() => import("../pages/creator/Withdrawals"));
const Support        = lazy(() => import("../pages/creator/Support"));
const Settings       = lazy(() => import("../pages/creator/Settings"));

// Admin — lazy
const AdminDashboard   = lazy(() => import("../pages/admin/AdminDashboard"));
const AdminUsers       = lazy(() => import("../pages/admin/AdminUsers"));
const AdminWithdrawals = lazy(() => import("../pages/admin/AdminWithdrawals"));
const AdminFraud       = lazy(() => import("../pages/admin/AdminFraud"));
const AdminAnalytics   = lazy(() => import("../pages/admin/AdminAnalytics"));
const AdminAuditLogs   = lazy(() => import("../pages/admin/AdminAuditLogs"));
const AdminSettings    = lazy(() => import("../pages/admin/AdminSettings"));

export default function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* PUBLIC */}
        <Route path={ROUTES.LANDING} element={<Landing />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
        <Route path="/watch/:shortCode" element={<Watch />} />

        {/* CREATOR */}
        <Route element={<ProtectedRoute><CreatorLayout /></ProtectedRoute>}>
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.UPLOAD} element={<UploadVideo />} />
          <Route path={ROUTES.UPLOADED_VIDEOS} element={<UploadedVideos />} />
          <Route path="/videos/:id" element={<VideoView />} />
          <Route path={ROUTES.TELEGRAM} element={<Telegram />} />
          <Route path={ROUTES.REFERRALS} element={<Referrals />} />
          <Route path={ROUTES.PAYMENTS} element={<Payments />} />
          <Route path={ROUTES.WITHDRAWALS} element={<Withdrawals />} />
          <Route path={ROUTES.SUPPORT} element={<Support />} />
          <Route path={ROUTES.SETTINGS} element={<Settings />} />
        </Route>

        {/* ADMIN */}
        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path={ROUTES.ADMIN} element={<AdminDashboard />} />
          <Route path={ROUTES.ADMIN_USERS} element={<AdminUsers />} />
          <Route path={ROUTES.ADMIN_WITHDRAWALS} element={<AdminWithdrawals />} />
          <Route path={ROUTES.ADMIN_FRAUD} element={<AdminFraud />} />
          <Route path={ROUTES.ADMIN_ANALYTICS} element={<AdminAnalytics />} />
          <Route path={ROUTES.ADMIN_AUDIT_LOGS} element={<AdminAuditLogs />} />
          <Route path={ROUTES.ADMIN_SETTINGS} element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.LANDING} replace />} />
      </Routes>
    </Suspense>
  );
}
