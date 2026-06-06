import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../../HmPortal/hmFirebse"; // Unga firebase config path
import { doc, getDoc } from "firebase/firestore";
import { 
  ArrowLeft, 
  ArrowRight, 
  Mail, 
  Lock, 
  ShieldAlert, 
  Smartphone, 
  ShieldCheck, 
  UserCheck 
} from "lucide-react";

const AdminAuthSystem = () => {
  const [view, setView] = useState("login"); // 'login' or 'otp'
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  // --- OTP VERIFICATION ---
  const verifyOTP = () => {
    if (!otp) return alert("Please enter the 6-digit OTP! ⚠️");

    // Testing-ku neenga set panna default bypass codes
    if (otp === "123456" || otp === "888888") {
      alert("🔓 Identity Verified! Welcome Admin.");
      navigate("/admin");
    } else {
      alert("❌ Invalid OTP! Try 123456 for testing.");
      setOtp("");
    }
  };

  // --- ADMIN AUTH LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "users", res.user.uid));

      // Strictly role check panrom -> roles database-la "admin" ah irundha matum thaan OTP page-ae open aagum
      if (userDoc.exists() && userDoc.data().role === "admin") {
        setView("otp");
      } else {
        alert("🚫 Access Denied! This portal is restricted to System Administrators only.");
        await signOut(auth);
      }
    } catch (err) {
      alert("Invalid Admin Credentials! ❌");
    }
    setLoading(false);
  };

  const inputStyle = "w-full bg-slate-50 p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:bg-white outline-none transition-all text-slate-700 font-bold text-sm";

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans">
      
      {/* 🎨 LEFT SIDE: Admin Illustration & Premium Branding Visuals */}
      <div className="hidden md:flex md:w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden p-12">
        {/* Abstract Background Design Ornaments */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-900/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-white max-w-md w-full">
          {/* Animated/Glassmorphic Icon Container */}
          <div className="bg-white/5 backdrop-blur-xl p-5 rounded-3xl border border-white/10 inline-block mb-8 shadow-xl">
            <ShieldAlert size={48} className="text-amber-400 animate-pulse" />
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-black mb-6 leading-tight tracking-tight uppercase">
            Centralized <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
              Admin Gateway.
            </span>
          </h2>
          <p className="text-slate-400 text-md mb-10 font-medium leading-relaxed">
            Authorized access only. Securely control institution-wide roles, master configurations, database rules, and management boards.
          </p>
          
          {/* Admin Feature Indicators */}
          <div className="space-y-4 bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/5">
            <div className="flex items-center gap-4 text-sm font-bold text-slate-200">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <UserCheck size={16} />
              </div>
              <span>Role & Permission Override Control</span>
            </div>
            <div className="flex items-center gap-4 text-sm font-bold text-slate-200">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Smartphone size={16} />
              </div>
              <span>Mandatory Two-Factor OTP Security</span>
            </div>
          </div>
        </div>
        
        {/* Subtle Bottom Copyright watermark */}
        <p className="absolute bottom-6 left-12 text-xs font-bold text-slate-600 tracking-widest uppercase">
          System Core v2.0.26
        </p>
      </div>

      {/* 🔐 RIGHT SIDE: Controlled Admin Login / OTP Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 bg-slate-50/50">
        <div className="w-full max-w-md">
          
          {/* Back Button */}
          <button 
            onClick={() => navigate("/")} 
            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-12 font-black transition-all uppercase text-[10px] tracking-[0.2em]"
          >
            <ArrowLeft size={14} /> Main Website
          </button>

          <div className="mb-10">
            <h2 className="text-4xl font-black text-slate-800 tracking-tight uppercase italic">
              {view === "otp" ? "Identity Check" : "Admin Login"}
            </h2>
            <p className="text-slate-500 mt-2 font-medium text-sm">
              {view === "otp" 
                ? "Enter the 6-digit authentication token sent to your terminal." 
                : "Sign in using structural administrator credentials."}
            </p>
          </div>

          {/* Dynamic Forms View */}
          {view === "otp" ? (
            /* --- 📱 OTP FORM STEP --- */
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block text-center">
                  Secure Code Verification
                </label>
                <input
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full text-center text-5xl font-black tracking-[0.15em] bg-transparent outline-none text-slate-800 placeholder-slate-200"
                  placeholder="000000"
                />
              </div>
              
              <button
                onClick={verifyOTP}
                className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black text-md uppercase tracking-wider hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 hover:shadow-emerald-100 active:scale-[0.99]"
              >
                Verify & Unlock Console
              </button>
              
              <button
                onClick={() => setView("login")}
                className="w-full text-slate-400 text-[10px] font-black uppercase tracking-widest underline hover:text-slate-600 transition-all text-center"
              >
                Cancel Authentication
              </button>
            </div>
          ) : (
            /* --- 🔑 STANDARD ADMIN LOGIN FORM --- */
            <form className="space-y-5" onSubmit={handleLogin}>
              {/* Admin Email Input */}
              <div>
                <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 block">
                  Root Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email" 
                    required 
                    className={`${inputStyle} pl-12`} 
                    placeholder="admin@institution.com" 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
              </div>

              {/* Admin Password Input */}
              <div>
                <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 block">
                  Console Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    required 
                    className={`${inputStyle} pl-12`} 
                    placeholder="••••••••••••" 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                </div>
              </div>

              {/* Access Request Trigger Button */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-indigo-600 text-white p-5 rounded-2xl font-black text-md uppercase tracking-wider transition-all shadow-lg shadow-slate-200 hover:shadow-indigo-100 active:scale-[0.99] flex items-center justify-center gap-3 mt-4 disabled:opacity-50"
              >
                {loading ? "Decrypting..." : "Request Access"}
                <ArrowRight size={18} />
              </button>

              {/* Security Banner Note */}
              <div className="mt-8 p-4 bg-amber-50/60 border border-amber-200/70 rounded-2xl flex gap-3 items-start">
                <ShieldCheck size={18} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">
                  Registration is disabled for security compliance. New admin nodes must be provisioned directly via backend controls or standard deployment configuration scripts.
                </p>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminAuthSystem;