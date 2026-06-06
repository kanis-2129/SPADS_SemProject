import React, { useState } from "react";
import { useLocation, Outlet, useNavigate } from "react-router-dom";
import HMSidebar from "./hmSideBar";

const MainLayout = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Dashboard path check (Correct-ah unga URL path-ah inga kodunga)
  const isDashboard = location.pathname === "/hm-dashboard";

  return (
    // 'flex' kudutha thaan side-by-side varum
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Sidebar Area */}
      <div
        className={`
    /* Dashboard-la mattum mela slide aagi varanum (Fixed) */
    /* Matha page-la permanent-ah left-la space eduthu nikkanum (Relative) */
    ${
      isDashboard
        ? `fixed inset-y-0 left-0 z-[100] transform transition-transform duration-500 ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"}`
        : "relative w-80 shrink-0 h-full border-r border-slate-200 block bg-white"
    } 
  `}
      >
        <HMSidebar
          isDrawerOpen={isDashboard ? isDrawerOpen : true}
          setIsDrawerOpen={setIsDrawerOpen}
          navigate={navigate}
          activePath={location.pathname}
          isDashboard={isDashboard}
        />
      </div>

      {/* CONTENT AREA */}
      <main className="flex-1 overflow-y-auto bg-slate-50">
        {/* Dashboard-la mattum menu trigger button venum na inga add pannunga */}
        <div className="min-h-full">
          <Outlet /> {/* Unga Staff, Student, Profile pages inga load aagum */}
        </div>
      </main>

      {/* Dashboard-la drawer open-la irundha mattum overlay */}
      {isDashboard && isDrawerOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40  z-[90]"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;
