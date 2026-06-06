import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../teachers/firebase"; // Unga firebase path-ai check pannikonga
import { collection, query, where, getDocs } from "firebase/firestore";
import { ArrowLeft, Mail, KeyRound } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Login page-la irundhu pass panna email-ah load panni lock panrom
  useEffect(() => {
    if (location.state && location.state.userEmail) {
      setEmail(location.state.userEmail);
    } else {
      // Oruvelai direct-ah intha URL-ku vantha alert panni back panni vitruduvom
      alert("No email detected! Redirecting to login page... 🔄");
      navigate("/teacher-login");
    }
  }, [location, navigate]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // 1. First, database-la intha email true-ah genuine-ah irukanu cross-check panrom
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("This email is not registered in our Faculty database! 🚫");
        setLoading(false);
        return;
      }

      // 2. Teacher resignation status check
      let userData = querySnapshot.docs[0].data();
      if (userData.status === "Resigned") {
        setError("This account has been deactivated. Cannot reset password! 🚫");
        setLoading(false);
        return;
      }

      // 3. Database validation success-na mattum Firebase reset link send aagum
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset link has been sent to your verified email! Please check your inbox. 📨");
    } catch (err) {
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-xl shadow-slate-100 border border-slate-100">
        
        {/* Back to Login */}
        <button 
          onClick={() => navigate("/teacher-login")} 
          className="flex items-center gap-2 text-slate-400 hover:text-[#5B2C6F] mb-8 font-bold transition-all uppercase text-[10px] tracking-[0.2em]"
        >
          <ArrowLeft size={14} /> Back to Login
        </button>

        <div className="mb-8 text-center md:text-left">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 text-[#5B2C6F] mx-auto md:mx-0">
            <KeyRound size={24} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Reset Password</h2>
          <p className="text-slate-500 mt-2 font-medium text-sm">
            Verifying your institutional account details.
          </p>
        </div>

        {/* Success Alert */}
        {message && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-xl">
            {message}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold rounded-xl">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleResetPassword}>
          {/* Email Field (LOCKED FOR SECURITY) */}
          <div>
            <label className="text-xs font-black text-[#1A5276] uppercase tracking-widest mb-2 block">
              Verified Email (Locked)
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="email" 
                value={email}
                disabled={true} // 🔒 Romba mukkiyam! User-ala field-ah edit panna mudiyathu
                className="w-full bg-slate-100 p-2 pl-12 border border-slate-200 rounded-xl outline-none text-slate-500 font-medium cursor-not-allowed opacity-75"
              />
            </div>
          </div>

          {/* Action Button */}
          <button 
            type="submit" 
            disabled={loading || message} 
            className="w-full bg-[#5B2C6F] hover:bg-[#1A5276] text-white py-4 rounded-xl font-black text-md transition-all shadow-lg shadow-indigo-100 hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Verifying Account..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;