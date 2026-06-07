import React, { useState } from "react";
import {  User, Mail,   ArrowLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

const TeacherSignUp = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("teacher");
  const [gender, setGender] = useState("Male");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmShowPassword, setConfirmShowPassword] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return alert("Passwords mismatch!");
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid, email, fullName, role, status: "pending", gender, createdAt: new Date(),
      });
      alert(`Account Created! ✅`);
      navigate("/teacher-login");
    } catch (error) {
      alert(error.message);
    }
  };

  const inputStyle = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1A5276] focus:bg-white outline-none transition-all text-slate-700";

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* LEFT SIDE: Visual Content */}
      <div className="hidden md:flex md:w-1/2 bg-[#1A5276] relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
            alt="School Class" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A5276] to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-white max-w-md">
          <h2 className="text-4xl font-black mb-6 leading-tight">Empowering the next generation of leaders.</h2>
          <div className="space-y-4">
            {['Digital Attendance', 'Performance Tracking', 'Resource Sharing'].map((text) => (
              <div key={text} className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
                <CheckCircle2 className="text-[#F0B27A]" size={20} />
                <span className="font-semibold">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 bg-slate-50/50">
        <div className="w-full max-w-md">
          <button onClick={() => navigate("/teacher-login")} className="flex items-center gap-2 text-slate-400 hover:text-[#1A5276] mb-8 font-bold transition-all uppercase text-xs tracking-widest">
            <ArrowLeft size={16} /> Back to Login
          </button>

          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-800">Create Faculty Account</h2>
            <p className="text-slate-500 mt-2 font-medium">Please fill in the details to register your profile.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSignup}>
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" required className={`${inputStyle} pl-10`} placeholder="Rahul Kumar" onChange={(e) => setFullName(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Role</label>
                <select className={inputStyle} value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="teacher">Teacher</option>
                  <option value="hm">Headmaster</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Gender</label>
                <select className={inputStyle} value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="email" required className={`${inputStyle} pl-10`} placeholder="name@school.com" onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required className={inputStyle} placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Confirm</label>
                <div className="relative">
                  <input type={confirmShowPassword ? "text" : "password"} required className={inputStyle} placeholder="••••••••" onChange={(e) => setConfirmPassword(e.target.value)} />
                  <button type="button" onClick={() => setConfirmShowPassword(!confirmShowPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {confirmShowPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-[#1A5276] hover:bg-[#5B2C6F] text-white py-4 rounded-xl font-black text-lg transition-all shadow-lg hover:shadow-[#1A5276]/30 mt-4 active:scale-[0.98]">
              Register Now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherSignUp;