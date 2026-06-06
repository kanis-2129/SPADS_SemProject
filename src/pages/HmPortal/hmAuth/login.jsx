import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../../teachers/firebase";
import { ArrowLeft, ShieldCheck, Mail, Lock, EyeOff, Eye, KeyRound, Loader2 } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";

const HMLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 2FA States
  const [showOTPField, setShowOTPField] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [userOTP, setUserOTP] = useState("");

  // Step 1: Initial Login, Role Check & Admin Approval Check
  const handleHMLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Authenticate user credentials
      const res = await signInWithEmailAndPassword(auth, email, password);
      // 2. Fetch User Metadata from Firestore
      const userSnap = await getDoc(doc(db, "users", res.user.uid));

      if (userSnap.exists()) {
        const userData = userSnap.data();
        
        // --- 1. ROLE CHECK ---
        if (userData.role === "hm" || userData.role === "admin") {
          
          // --- 2. CRUCIAL ADMIN APPROVAL STATUS CHECK ---
          if (userData.status === "pending") {
            // Document status pending-la irundha instant-ah signout panni block பண்ணனும்
            await signOut(auth);
            alert("🔒 Access Denied: Your HM account registration is awaiting Admin Approval! Please contact the administrator.");
            setLoading(false);
            return; // Code-ah idhoda break பண்றோம்
          } 
          
          if (userData.status === "Resigned") {
            // Suspended / Blocked status validation
            await signOut(auth);
            alert("❌ Access Suspended: Your administrative privileges have been revoked or blocked.");
            setLoading(false);
            return;
          }

          // --- 3. 2FA LOGIC (Runs only if status is "Active") ---
          if (userData.is2FAEnabled) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOTP(otp);
            
            // For Demo/Testing purpose
            console.log("SECURITY ALERT: Your OTP is", otp);
            alert("Two-Factor Authentication Enabled! Check console for OTP.");
            
            setShowOTPField(true); // Switch to OTP input layout
          } else {
            navigate("/hm-dashboard"); // Direct route if 2FA disabled
          }

        } else {
          alert("Access Denied: Neenga HM illa. Please use Teacher Portal.");
          await signOut(auth);
        }
      } else {
        alert("Authentication failed: Account record not found in database.");
        await signOut(auth);
      }
    } catch (error) {
      alert("Login Failed: " + error.message);
    }
    setLoading(false);
  };

  // Step 2: Verify OTP
  const verifyOTP = () => {
    if (userOTP === generatedOTP) {
      navigate("/hm-dashboard");
    } else {
      alert("Invalid OTP! Security check failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md border-b-8 border-indigo-600 transition-all duration-500">
        
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-slate-400 font-bold mb-6 hover:text-indigo-600 transition-all text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> 
        </button>

        {!showOTPField ? (
          /* --- LOGIN FORM --- */
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Management Login</h2>
              <p className="text-slate-500 text-sm italic">Headmaster Portal Access</p>
            </div>

            <form onSubmit={handleHMLogin} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1 flex items-center gap-2">
                  <Mail size={14} /> Official Email
                </label>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  className="w-full px-5 py-4 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 font-bold"
                  placeholder="hm@school.com"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1 flex items-center gap-2">
                  <Lock size={14} /> Password
                </label>
                <div className="relative">
                  <input
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    className="w-full px-5 py-4 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 font-bold"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Access HM Dashboard"}
              </button>
            </form>
          </>
        ) : (
          /* --- OTP VERIFICATION SCREEN --- */
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <KeyRound size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight uppercase">Verify Identity</h2>
              <p className="text-slate-500 text-xs font-bold uppercase mt-2">6-Digit Code Sent to Email</p>
            </div>

            <div className="space-y-6">
              <input
                type="text"
                maxLength="6"
                placeholder="000000"
                onChange={(e) => setUserOTP(e.target.value)}
                className="w-full px-5 py-6 border-none rounded-2xl bg-slate-50 text-center text-3xl font-black tracking-[0.5em] focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              
              <button
                onClick={verifyOTP}
                className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-emerald-700 transition-all shadow-lg"
              >
                Verify & Continue
              </button>

              <button 
                onClick={() => setShowOTPField(false)}
                className="w-full text-slate-400 text-[10px] font-bold uppercase hover:text-slate-600 transition-all"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}

        {!showOTPField && (
          <p className="text-center text-slate-400 text-[10px] font-bold uppercase mt-8 tracking-widest">
            New Administrator?{" "}
            <button
              type="button"
              onClick={() => navigate("/hm-signup")}
              className="text-indigo-600 hover:underline"
            >
              Register here
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default HMLogin;