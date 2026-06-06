import React, { useState, useEffect } from "react";
import { 
  X, User, ShieldCheck, Trash2, Info, LogOut, Save, Mail, Edit2, AtSign 
} from "lucide-react";
import { auth, db } from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile, updateEmail, sendPasswordResetEmail, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const AccountSettingsModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [settingsTab, setSettingsTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  
  const [profileInfo, setProfileInfo] = useState({
    displayName: auth.currentUser?.displayName || "",
    email: auth.currentUser?.email || "",
  });

  // Modal open aagumpothu current user details-ah sync pannum
  useEffect(() => {
    if (isOpen && auth.currentUser) {
      setProfileInfo({
        displayName: auth.currentUser.displayName || "",
        email: auth.currentUser.email || "",
      });
    }
  }, [isOpen]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Name Update (Auth & Firestore)
      if (profileInfo.displayName !== auth.currentUser.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: profileInfo.displayName,
        });
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, { displayName: profileInfo.displayName });
      }

      // 2. Email Update (Sensitive action)
      if (profileInfo.email !== auth.currentUser.email) {
        // Firebase require-before-verify method (Modern way)
        await updateEmail(auth.currentUser, profileInfo.email);
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, { email: profileInfo.email });
      }

      alert("Settings updated successfully! ✨");
      onClose();
    } catch (err) {
      if (err.code === "auth/requires-recent-login") {
        alert("Security Alert: Email mathuradhuku munnadi oruvaati logout panni login pannunga!");
      } else {
        alert("Error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-[100] p-4 text-left font-sans">
      <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[550px] animate-in zoom-in duration-300 relative">
        
        {/* TOP RIGHT CLOSE BUTTON */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-full transition-all z-10 text-slate-400"
        >
          <X size={20} />
        </button>

        {/* SIDEBAR */}
        <div className="w-full md:w-60 bg-slate-50 p-8 border-r border-slate-200 flex flex-col">
          <div className="mb-10">
            <h3 className="text-xl font-black text-slate-900 tracking-tight italic">Settings</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Control Panel</p>
          </div>
          
          <div className="space-y-2 flex-1">
            <TabButton active={settingsTab === "profile"} onClick={() => setSettingsTab("profile")} icon={<User size={18} />} label="Profile" />
            <TabButton active={settingsTab === "security"} onClick={() => setSettingsTab("security")} icon={<ShieldCheck size={18} />} label="Security" />
            <TabButton active={settingsTab === "danger"} onClick={() => setSettingsTab("danger")} icon={<Trash2 size={18} />} label="Danger Zone" danger />
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 p-10 overflow-y-auto bg-white pt-16">
          
          {/* PROFILE TAB */}
          {settingsTab === "profile" && (
            <form onSubmit={handleUpdateProfile} className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg">
                  {profileInfo.displayName?.charAt(0).toUpperCase() || "T"}
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900 leading-tight">Account Details</h4>
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">Update your name & email</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <Edit2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input 
                      required 
                      value={profileInfo.displayName} 
                      onChange={(e) => setProfileInfo({...profileInfo, displayName: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input 
                      required 
                      type="email"
                      value={profileInfo.email} 
                      onChange={(e) => setProfileInfo({...profileInfo, email: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <button disabled={loading} type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-cyan-600 transition-all shadow-xl flex items-center justify-center gap-2">
                {loading ? "Updating..." : <><Save size={18} /> Update Changes</>}
              </button>
            </form>
          )}

          {/* SECURITY TAB */}
          {settingsTab === "security" && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="mb-4">
                  <h4 className="text-2xl font-black text-slate-900 leading-tight">Security Settings</h4>
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">Manage access & password</p>
                </div>
                <SecurityCard 
                  title="Password Reset" 
                  desc={`Reset link will be sent to: ${auth.currentUser.email}`}
                  icon={<Mail size={20}/>}
                  btnText={loading ? "Sending..." : "Send Link"}
                  onClick={async () => {
                    setLoading(true);
                    try {
                      await sendPasswordResetEmail(auth, auth.currentUser.email);
                      alert("Success! 📧 Reset link unga email-ku anuppiyaachu. Check pannunga!");
                    } catch (err) {
                      alert("Error: " + err.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                />
                <SecurityCard 
                  title="Session" 
                  desc="Safely logout from your teacher account."
                  icon={<LogOut size={20}/>}
                  btnText="Logout"
                  onClick={() => {
                    if(window.confirm("Confirm-ah logout panna poringala?")) {
                      signOut(auth).then(() => navigate("/teacher-login"));
                    }
                  }}
                />
             </div>
          )}

          {/* DANGER ZONE */}
          {settingsTab === "danger" && (
            <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-4 border border-red-100 shadow-sm">
                <Info size={40} />
              </div>
              <h4 className="text-2xl font-black text-slate-900">Danger Zone</h4>
              <p className="text-sm text-slate-500 font-medium mt-2 max-w-xs leading-relaxed">
                Account-ai delete seithal, unga workspaces matrum class data-kkal permanent-ah azhikka padum.
              </p>
              <button className="mt-8 px-10 py-4 bg-red-600 text-white rounded-2xl font-black text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center gap-2">
                <Trash2 size={18} /> Wipe All My Data
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// HELPER COMPONENTS
const TabButton = ({ active, onClick, icon, label, danger }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${active ? (danger ? "bg-red-500 text-white shadow-lg" : "bg-cyan-600 text-white shadow-lg shadow-cyan-100") : "text-slate-500 hover:bg-slate-100"}`}>
    {icon} {label}
  </button>
);

const SecurityCard = ({ title, desc, icon, btnText, onClick }) => (
  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between gap-4">
    <div className="flex items-center gap-4 text-left">
      <div className="p-3 bg-white rounded-xl text-cyan-600 shadow-sm border border-slate-100">{icon}</div>
      <div>
        <p className="font-black text-slate-800 text-sm leading-none">{title}</p>
        <p className="text-[11px] text-slate-400 mt-1.5 font-medium">{desc}</p>
      </div>
    </div>
    <button onClick={onClick} className="shrink-0 bg-white border border-slate-200 px-5 py-2.5 rounded-xl text-xs font-black hover:border-cyan-500 hover:text-cyan-600 transition-all shadow-sm">
      {btnText}
    </button>
  </div>
);

export default AccountSettingsModal;