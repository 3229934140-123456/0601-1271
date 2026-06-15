import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Login/Login";
import TVPlayer from "@/pages/TVPlayer/TVPlayer";
import AdminLayout from "@/components/Layout/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "@/pages/admin/Dashboard";
import ProgramManage from "@/pages/admin/ProgramManage";
import MaterialManage from "@/pages/admin/MaterialManage";
import ReviewCenter from "@/pages/admin/ReviewCenter";
import PlaybackControl from "@/pages/admin/PlaybackControl";
import InteractionManage from "@/pages/admin/InteractionManage";
import DataStatistics from "@/pages/admin/DataStatistics";
import ReportCenter from "@/pages/admin/ReportCenter";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TVPlayer />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/program"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <ProgramManage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/materials"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <MaterialManage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/review"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <ReviewCenter />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/playback"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <PlaybackControl />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/interaction"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <InteractionManage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/statistics"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <DataStatistics />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <ReportCenter />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
