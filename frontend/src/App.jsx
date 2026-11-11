import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import SweetyLandingPage from "./pages/SweetyLandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import DashboardLayout from "./components/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import MyReadings from "./pages/MyReadings";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";

import "./index.css";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SweetyLandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="readings" element={<MyReadings />} />
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;