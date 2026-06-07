import React, { useEffect, useState } from "react";
import Navbar from "./Common/nav";
import HeroSection from "./components/Hero";
import { Route, Routes, Navigate } from "react-router-dom";

import TeacherLogin from "./pages/teachers/teacherlogin";
import TeacherSignUp from "./pages/teachers/teacherSignUp";
import TeacherWorkspace from "./pages/teachers/teacherWorkSpace";
import ExamUpload from "./pages/teachers/ExamUpload";
import TeacherDashboard from "./pages/teachers/teacherDashboard";
import ForgetPassword from "./pages/teachers/forgetPassword";
import HMDashboard from "./pages/HmPortal/HmPortal";
import { useLocation } from "react-router-dom";

// Firebase connection
import { auth } from "./pages/teachers/firebase";
import { onAuthStateChanged } from "firebase/auth";
import HMSignUp from "./pages/HmPortal/hmAuth/signUp";
import HMLogin from "./pages/HmPortal/hmAuth/login";

// HM portal features
import HMPersonal from "./pages/HmPortal/components/hmPersonal";
import HMSettings from "./pages/HmPortal/components/hmSettings";
import HMStaffList from "./pages/HmPortal/components/HMStaffList";
import HMStudentAtRiskDatabase from "./pages/HmPortal/components/studentAtRisk";

// Admin Dashboard
import AdminDashboard from "./pages/Admin/Admin";
import AdminSignup from "./pages/Admin/adminAuth/adminSignup";
import { getDoc, doc } from "firebase/firestore";
import { db } from "./pages/HmPortal/hmFirebse";
import 'regenerator-runtime/runtime';

const App = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // NAVBAR logic...
  const hideNavbarPaths = [
    "/hm-dashboard",
    "/teacher-dashboard",
    "/teacher-workspace",
    "/teacher-login",
    "/teacher-signup",
    "/hm-login",
    "/hm-signup",
    "/hm/profile",
    "/hm/settings",
    "/hm/staff-list",
    "/hm/students",
    "/admin",
    "/admin/signup",
    "/forget-password"
  ];
  const shouldHideNavbar =
    hideNavbarPaths.includes(location.pathname) ||
    location.pathname.startsWith("/class-details/");

    // Simple Protected Route Component
const ProtectedAdmin = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (u) {
        const d = await getDoc(doc(db, "users", u.uid));
        if (d.exists() && d.data().role === "admin") setUser(u);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return <p>Verifying Security...</p>;
  return user ? children : <Navigate to="/admin-login" />;
};

// Route Implementation
<Route path="/admin-dashboard" element={
  <ProtectedAdmin>
    <AdminDashboard />
  </ProtectedAdmin>
} />

  // Loading function (Protected pages-ku mattum use pannuvom)
  const ProtectedRoute = ({ children }) => {
    if (loading)
      return (
        <div className="h-screen flex items-center justify-center bg-slate-900 text-cyan-500 font-bold text-2xl">
          Loading...
        </div>
      );
    return user ? children : <Navigate to="/teacher-login" />;
  };

  return (
    <div>
      {!shouldHideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<HeroSection />} />
       
        {/* PUBLIC ROUTES: Loading bypass panniduvom */}
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/teacher-signup" element={<TeacherSignUp />} />
        <Route path="/hm-signup" element={<HMSignUp />} />
        <Route path="/hm-login" element={<HMLogin />} />

        {/* PROTECTED ROUTES: Loading inga mattum thaan theriyaanum */}
        <Route
          path="/teacher-workspace"
          element={
            <ProtectedRoute>
              <TeacherWorkspace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher-dashboard"
          element={
            <ProtectedRoute>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route
          path="/hm-dashboard"
          element={
            <ProtectedRoute>
              <HMDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/class-details/:classId" element={<ExamUpload />} />

        {/* HM Portal Features */}
        {/* <Route path="/" element={<HMLayout />}> */}
          {/* Index Route - Idhu thaan first load aagum (Optional) */}
          <Route
            path="hm-dashboard"
            element={
              <ProtectedRoute>
                <HMDashboard />
              </ProtectedRoute>
            }
          />

          {/* Other Features - Idhukellam Sidebar automatic-ah fixed-ah vandhurum */}
          <Route
            path="hm/profile"
            element={
              <ProtectedRoute>
                <HMPersonal />
              </ProtectedRoute>
            }
          />
          <Route
            path="hm/settings"
            element={
              <ProtectedRoute>
                <HMSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="hm/staff-list"
            element={
              <ProtectedRoute>
                <HMStaffList />
              </ProtectedRoute>
            }
          />
        {/* </Route> */}
         <Route
            path="/hm/students"
            element={
              <ProtectedRoute>
                <HMStudentAtRiskDatabase />
              </ProtectedRoute>
            }
          />
        {/* Admin page */}
        <Route
          path="/admin"
          element={
            <ProtectedAdmin>
              <AdminDashboard />
            </ProtectedAdmin>
          }
        /> 
        <Route path="/admin/signup" element={<AdminSignup />} />


      </Routes>
    </div>
  );
};

export default App;
