import React, { useState } from "react";
import {
  User,
  Mail,
  Building2,
  Lock,
  ArrowLeft,
  Users2,
  EyeOff,
  Eye,
  Phone,
  Briefcase,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../teachers/firebase";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

const HMSignUp = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [role] = useState("hm");
  const [gender, setGender] = useState("Male");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // New: Phone state
  const [schoolName, setSchoolName] = useState(""); // New: School Name
  const [employeeId, setEmployeeId] = useState(""); // New: Official ID
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmShowPassword, setConfirmShowPassword] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return alert("Passwords mismatch!");
    if (phone.length < 10) return alert("Please enter a valid phone number!");

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const user = res.user;

      // Adding more official details to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: email,
        fullName: fullName,
        phone: phone,
        schoolName: schoolName,
        employeeId: employeeId,
        status: "pending",
        role: role,
        gender: gender,
        createdAt: new Date(),
      });

      alert(`HM Account Created Successfully ✅`);
      navigate("/hm-login");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-10">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-2xl border-t-8 border-indigo-600">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-slate-400 hover:text-indigo-600 mb-6 transition-colors text-sm font-bold"
        >
          <ArrowLeft size={18} /> BACK TO HOME
        </button>

        <div className="text-center mb-10">
          <div className="bg-indigo-600 w-20 h-20 rounded-2xl rotate-3 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-200">
            <Building2 size={40} className="text-white -rotate-3" />
          </div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight italic uppercase">
            Management Portal
          </h2>
          <p className="text-slate-400 mt-2 font-medium tracking-widest uppercase text-[10px]">
            Official Headmaster Digital Registration
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSignup}>
          {/* Section 1: Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <User size={14} /> Full Name
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                placeholder="Dr. Arun Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Phone size={14} /> Mobile Number
              </label>
              <input
                type="tel"
                required
                maxLength="10"
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              />
            </div>
          </div>

          {/* Section 2: Professional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Building2 size={14} /> School Name
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                placeholder="Govt Higher Secondary School"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Briefcase size={14} /> Employee ID
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                placeholder="HM-SEC-2024"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Users2 size={14} /> Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold appearance-none cursor-pointer"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Mail size={14} /> Account Type
              </label>
              <div className="w-full px-4 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-indigo-600 font-black text-xs flex items-center">
                HEADMASTER (HM)
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Mail size={14} /> Official Email
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
              placeholder="hm@school.edu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Lock size={14} /> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Lock size={14} /> Confirm
              </label>
              <div className="relative">
                <input
                  type={confirmShowPassword ? "text" : "password"}
                  required
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setConfirmShowPassword(!confirmShowPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600"
                >
                  {confirmShowPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-[20px] font-black text-sm transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] uppercase tracking-widest mt-4"
          >
            Finalize Registration
          </button>
        </form>
      </div>
    </div>
  );
};

export default HMSignUp;