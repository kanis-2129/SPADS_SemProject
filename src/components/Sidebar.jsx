import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  Users, 
  GraduationCap, 
  UserCircle, 
  Settings, 
  ChevronLeft, 
  Menu,
  Bell,
  LogOut,
  PlusCircle,
  BarChart2,
  Calendar
} from "lucide-react";

const Sidebar = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Menu items with icons and optional badges
  const menuItems = [
    { name: "Home", path: "/dashboard", icon: Home },
    { name: "Teachers", path: "/dashboard/teachers", icon: Users },
    { name: "Students", path: "/dashboard/students", icon: GraduationCap, badge: 3 },
    { name: "Parents", path: "/dashboard/parents", icon: UserCircle },
    { name: "Settings", path: "/dashboard/settings", icon: Settings },
  ];

  return (
    <motion.div
      initial={false}
      animate={{ width: open ? 260 : 80 }}
      className="relative bg-[#0f172a] text-slate-300 h-screen overflow-hidden flex flex-col shadow-2xl transition-all duration-300 ease-in-out border-r border-slate-800 z-50"
    >
      {/* 🔹 Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="absolute -right-3 top-10 bg-indigo-600 text-white p-1 rounded-full border-2 border-[#0f172a] z-50 hover:bg-indigo-500 transition-transform active:scale-90 shadow-lg"
      >
        {open ? <ChevronLeft size={16} /> : <Menu size={16} />}
      </button>

      {/* 🔹 Brand Header */}
      <div className="h-20 flex items-center px-6 gap-3 overflow-hidden">
        <div className="bg-indigo-600 p-2 rounded-lg shrink-0 shadow-lg shadow-indigo-500/20">
          <GraduationCap size={24} className="text-white" />
        </div>
        <AnimatePresence>
          {open && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="font-bold text-xl text-white whitespace-nowrap tracking-tight"
            >
              School<span className="text-indigo-400">Sync</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* 🔹 Navigation Links */}
      <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <div
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`
                relative flex items-center p-3 rounded-xl cursor-pointer group transition-all duration-200
                ${isActive ? "bg-indigo-600/10 text-indigo-400 shadow-sm" : "hover:bg-slate-800/50 hover:text-white"}
              `}
            >
              {/* Active Indicator Bar (Left Side) */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full"
                />
              )}

              <item.icon size={22} className={`${isActive ? "text-indigo-500" : "group-hover:text-white"}`} />
              
              <AnimatePresence mode="wait">
                {open && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="ml-4 font-medium whitespace-nowrap overflow-hidden"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Notification Badge */}
              {item.badge && (
                <div className={`
                  ml-auto bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full 
                  ${!open ? "absolute top-2 right-2 border-2 border-[#0f172a]" : ""}
                `}>
                  {item.badge}
                </div>
              )}

              {/* 🔹 Tooltip for Icon-only mode */}
              {!open && (
                <div className="absolute left-16 scale-0 group-hover:scale-100 transition-all origin-left bg-slate-800 text-white text-xs py-2 px-3 rounded shadow-xl border border-slate-700 pointer-events-none z-50">
                  {item.name}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* 🔹 Quick Action Section (Bottom) */}
      <div className="p-4 space-y-2 border-t border-slate-800 bg-slate-900/30">
        <AnimatePresence>
          {open && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <button className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20">
                <PlusCircle size={18} />
                <span>New Action</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shrink-0 border-2 border-slate-700">
            TR
          </div>
          {open && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">Teacher Name</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Grade 10-A</p>
            </motion.div>
          )}
          <LogOut size={18} className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer shrink-0" />
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;