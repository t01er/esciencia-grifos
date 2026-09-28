import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../features/auth/pages/Login";

import Dashboard from "../features/dashboard/pages/Dashboard";
// import Tanks from "../features/tanks/pages/Tanks";
// import TankDetail from "../features/tanks/pages/TankDetail";
// import Sales from "../features/sales/pages/Sales";
// import Environmental from "../features/environmental/pages/Environmental";
// import Reports from "../features/reports/pages/Reports";

// import Commands from "../features/commands/pages/Commands";
// import Alerts from "../features/alerts/pages/Alerts";

import Devices from "../features/devices/pages/Devices";
// import Users from "../features/users/pages/Users";
// import Roles from "../features/roles/pages/Roles";
// import Permissions from "../features/permissions/pages/Permissions";
// import Companies from "../features/companies/pages/Companies";
// import Settings from "../features/settings/pages/Settings";

import NotFound from "../features/notFound/pages/NotFound";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/" element={<Login />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
{/* 
            <Route path="/tanks" element={<Tanks />} />
            <Route path="/tanks/:id" element={<TankDetail />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/environmental" element={<Environmental />} />
            <Route path="/reports" element={<Reports />} />

            <Route path="/commands" element={<Commands />} />
            <Route path="/alerts" element={<Alerts />} />
 */}
            <Route path="/devices" element={<Devices />} />
            {/* <Route path="/users" element={<Users />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/permissions" element={<Permissions />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/settings" element={<Settings />} /> */}

            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}