import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { School, Home, UserRound, Users, Menu, X, LogIn } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Active Style: Blue text with a very subtle purple tint background
  const activeStyle = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-xl text-[14px] font-bold transition-all duration-300 ${
      isActive 
        ? "text-[#4A3AFF] bg-[#F4F2FF] shadow-sm" 
        : "text-slate-600 hover:text-[#4A3AFF] hover:bg-[#F4F2FF]/50"
    }`;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#1A5276] to-[#5B2C6F] p-2.5 rounded-xl shadow-lg shadow-indigo-200">
              <School className="text-white" size={24} />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[18px] font-black tracking-tight bg-gradient-to-r from-[#1A5276] to-[#5B2C6F] bg-clip-text text-transparent">
                GHSS Vellapallam
              </span>
              
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/" className={activeStyle}>
              <Home size={17} /> Home
            </NavLink>
            <NavLink to="/hm-login" className={activeStyle}>
              <UserRound size={17} /> HM Portal
            </NavLink>
            <NavLink to="/teacher-login" className={activeStyle}>
              <Users size={17} /> Faculty
            </NavLink>

            <div className="h-6 w-[1px] bg-slate-200 mx-4"></div>

            <NavLink to="/admin/signup">
              <button className="bg-gradient-to-r from-[#1A5276] to-[#5B2C6F] hover:shadow-indigo-200 hover:shadow-xl text-white px-7 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 active:scale-95">
                <LogIn size={16} /> Admin Login
              </button>
            </NavLink>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-600">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white px-4 pt-2 pb-6 space-y-2 border-t border-slate-50 animate-in slide-in-from-top-5">
          <NavLink to="/" onClick={() => setIsOpen(false)} className={activeStyle}>Home</NavLink>
          <NavLink to="/hm-login" onClick={() => setIsOpen(false)} className={activeStyle}>HM Login</NavLink>
          <NavLink to="/teachers" onClick={() => setIsOpen(false)} className={activeStyle}>Teachers</NavLink>
          <NavLink to="/admin/signup" onClick={() => setIsOpen(false)} className="block w-full bg-gradient-to-r from-[#1A5276] to-[#5B2C6F] text-white text-center p-4 rounded-xl font-bold mt-4 shadow-lg">
            Admin Portal
          </NavLink>
        </div>
      )}
    </nav>
  );
};

export default Navbar;