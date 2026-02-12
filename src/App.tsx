import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "@/config/urls";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import StaffLayout from "./layouts/StaffLayout";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminExpenses from "./pages/admin/Expenses";
import AdminReports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/Settings";

// Staff Pages
import StaffPOS from "./pages/staff/POS";
import StaffOrders from "./pages/staff/Orders";
import StaffFood from "./pages/staff/Food";
import StaffSeating from "./pages/staff/Seating";
import StaffKitchen from "./pages/staff/Kitchen";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to={ROUTES.ADMIN.DASHBOARD} replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="expenses" element={<AdminExpenses />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Staff Routes */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to={ROUTES.STAFF.POS} replace />} />
            <Route path="pos" element={<StaffPOS />} />
            <Route path="orders" element={<StaffOrders />} />
            <Route path="food" element={<StaffFood />} />
            <Route path="seating" element={<StaffSeating />} />
            <Route path="kitchen" element={<StaffKitchen />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
