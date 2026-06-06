import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../teachers/firebase";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import teacherLoginPic from "../../images/photo.jpg";

const TeacherLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const userSnap = await getDoc(doc(db, "users", res.user.uid));

      if (userSnap.exists()) {
        const userData = userSnap.data();

        if (userData.status === "pending") {
          alert("Access Denied! Account pending Admin approval. ⏳");
          await signOut(auth);
          return;
        }

        if (userData.status === "Resigned") {
          alert("This account has been deactivated. 🚫");
          await signOut(auth);
          return;
        }

        // Role based navigation
        if (userData.role === "admin") navigate("/admin-dashboard");
        else if (userData.role === "hm") navigate("/hm-dashboard");
        else navigate("/teacher-workspace");
      }
    } catch (error) {
      alert("Login Failed: " + error.message);
    }
  };

  // 🛠️ Option 2 Logic: Check panni state oda navigate pannum
  const handleForgotPasswordClick = () => {
    if (!email.trim()) {
      alert("Please enter your Institutional Email in the field first! ⚠️");
      return;
    }
    // Route state vazhiya typed email-ah pass panrom
    navigate("/forget-password", { state: { userEmail: email.trim() } });
  };

  const inputStyle =
    "w-full bg-slate-50 p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B2C6F] focus:bg-white outline-none transition-all text-slate-700 font-medium";

  return (
    <div className=" flex flex-col md:flex-row bg-white">
      {/* LEFT SIDE: Visual Content (Same as Signup Style) */}
      <div className="hidden md:flex md:w-1/2 bg-[#5B2C6F] relative items-center justify-center  overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img
            src={teacherLoginPic}
            alt="Students Learning"
            className="w-full h-full object-cover"
          />
          {/* Subtle Purple Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#5B2C6F] to-transparent"></div>
        </div>

        <div className="relative z-10 text-white max-w-md">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 inline-block mb-6">
            <ShieldCheck size={48} className="text-[#F0B27A]" />
          </div>
          <h2 className="text-5xl font-black mb-6 leading-tight tracking-tighter">
            Welcome Back to Faculty Portal.
          </h2>
          <p className="text-indigo-100 text-lg mb-8 font-medium">
            Log in to manage your digital classroom and student progress
            effectively.
          </p>

          <div className="space-y-3">
            {[
              "Secure Data Access",
              "Real-time Analytics",
              "Easy Management",
            ].map((text) => (
              <div
                key={text}
                className="flex items-center gap-3 text-sm font-bold"
              >
                <CheckCircle2 className="text-[#F0B27A]" size={18} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-10 bg-slate-50/30">
        <div className="w-full max-w-md">
          {/* Home Link */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-slate-400 hover:text-[#5B2C6F] mb-12 font-bold transition-all uppercase text-[10px] tracking-[0.2em]"
          >
            <ArrowLeft size={14} /> Back to Website
          </button>

          <div className="mb-10">
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">
              Faculty Login
            </h2>
            <p className="text-slate-500 mt-2 font-medium italic text-sm">
              Sign in with your institutional credentials.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Email Field */}
            <div>
              <label className="text-xs font-black text-[#1A5276] uppercase tracking-widest mb-2 block">
                Institutional Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  type="email"
                  required
                  className={`${inputStyle} pl-12`}
                  placeholder="name@school.com"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="text-xs font-black text-[#1A5276] uppercase tracking-widest mb-2 block">
                Secure Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className={`${inputStyle} pl-12`}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#5B2C6F]"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link - Updated with Option 2 click handler */}
            {/* Forgot Password Link - Dynamic Alert and Visibility */}
            <div className="flex justify-end">
              {email.trim() ? (
                // 🔓 Email type pannirundha mattum intha click-able link varum
                <button
                  type="button"
                  onClick={handleForgotPasswordClick}
                  className="text-xs font-bold text-[#5B2C6F] hover:underline transition-all"
                >
                  Forgot Password?
                </button>
              ) : (
                // 🔒 Email field kalia irundha, clickable illatha oru light warning text kaatum
                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Please enter your Institutional Email in the field first! ✉️",
                    )
                  }
                  className="text-xs font-semibold text-slate-400 hover:text-rose-500 transition-all italic"
                >
                  Forgot Password
                </button>
              )}
            </div>

            {/* Action Button */}
            <button
              type="submit"
              className="w-full bg-[#5B2C6F] hover:bg-[#1A5276] text-white py-4 rounded-xl font-black text-lg transition-all shadow-lg shadow-indigo-100 hover:shadow-xl active:scale-[0.98] mt-2"
            >
              Access Dashboard
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm font-medium">
              Don't have a faculty account?{" "}
              <button
                onClick={() => navigate("/teacher-signup")}
                className="text-[#5B2C6F] font-black hover:underline underline-offset-4 decoration-2"
              >
                Register Here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherLogin;
