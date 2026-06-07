import React from "react";
import {
  X,
  LayoutDashboard,
  
  Users,
  User,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

// Sidebar Item Component
const DrawerItem = ({ icon, label, onClick, active, badge }) => (
  <div
    onClick={onClick}
    className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${
      active
        ? "bg-indigo-50 text-indigo-600"
        : "hover:bg-slate-50 text-slate-600"
    }`}
  >
    <div className="flex items-center gap-4">
      <span className={active ? "text-indigo-600" : "text-slate-400"}>
        {icon}
      </span>
      <span className="font-bold text-sm">{label}</span>
    </div>
    {badge ? (
      <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-lg text-[10px] font-black">
        {badge}
      </span>
    ) : (
      <ChevronRight size={14} className="text-slate-300" />
    )}
  </div>
);

const HMSidebar = ({
  isDrawerOpen,
  setIsDrawerOpen,
  navigate,
  staffCount,
  handleLogout,
  activePath,
  setActivePath,
}) => {
  return (
    <>
      {/* --- OVERLAY --- */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] transition-opacity duration-300"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* --- SIDEBAR DRAWER --- */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-[100] transform transition-transform duration-500 ease-out ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-8 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-xl text-white">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase italic leading-none text-slate-800">
                  HM PORTAL V2.0
                </h3>
              </div>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          {/* Menu Items */}
          <div className="space-y-5 overflow-y-auto flex-1 pr-2 custom-scrollbar text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-4">
              Main Analytics
            </p>

            <DrawerItem
              active={activePath === "/hm-dashboard"}
              icon={<LayoutDashboard size={18} />}
              label="Overview Dashboard"
              onClick={() => {
                navigate("/hm-dashboard");
                setIsDrawerOpen(false);
              }}
            />

            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 mt-8 ml-4">
              Management
            </p>

            <DrawerItem
              active={activePath === "/hm/staff-list"}
              icon={<Users size={18} />}
              label="Staff Directory"
              onClick={() => {
                navigate("/hm/staff-list");
                setIsDrawerOpen(false);
              }}
              badge={staffCount}
            />

            {/* <DrawerItem
              active={activePath === "/hm/students"}
              icon={<GraduationCap size={18} />}
              label="Student Database"
              onClick={() => { navigate("/hm/students"); setIsDrawerOpen(false); }}
            /> */}

            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 mt-8 ml-4">
              Personal
            </p>

            <DrawerItem
              active={activePath === "/hm/profile"}
              icon={<User size={18} />}
              label="My Profile"
              onClick={() => {
                navigate("/hm/profile");
                setIsDrawerOpen(false);
              }}
            />

            <DrawerItem
              active={activePath === "/hm/settings"}
              icon={<Settings size={18} />}
              label="Portal Settings"
              onClick={() => {
                navigate("/hm/settings");
                setIsDrawerOpen(false);
              }}
            />
          </div>

          {/* Logout Section */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full p-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              <LogOut size={18} />
              Logout System
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HMSidebar;
