import React, { useState, useEffect } from "react";
import { auth, db } from "../hmFirebse";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import {
  sendPasswordResetEmail,
  signOut,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import {
  ShieldCheck,
  KeyRound,
  Fingerprint,
  X,
  Mail,
  CheckCircle,
  ShieldAlert,
  ChevronLeft,
  Loader2,
  ArrowRight,
  Smartphone,
  LogOut,
  History,
  Globe,
  ShieldQuestion,
  UserCog,
  ShieldEllipsis,
} from "lucide-react";
import { verifyBeforeUpdateEmail } from "firebase/auth";

const HMSettings = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState("init"); // init, auth, loading, success
  const [requestType, setRequestType] = useState("");
  const [loading, setLoading] = useState(false);

  // Real-time Data States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [securityLogs, setSecurityLogs] = useState([]);
  const [isTFAEnabled, setIsTFAEnabled] = useState(false);
  const [profile, setProfile] = useState(null);

  // 1. Fetch Real-time Security Logs from Firestore
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "security_logs"),
      where("adminId", "==", auth.currentUser.uid),
      orderBy("timestamp", "desc"),
      limit(5),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSecurityLogs(logs);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;

    const userRef = doc(db, "users", auth.currentUser.uid);

    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();

        setProfile(data);

        setIsTFAEnabled(data.is2FAEnabled);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Handle Password Reset (Existing)
  const handleSecureReset = async () => {
    setLoading(true);
    setModalStep("loading");
    try {
      await sendPasswordResetEmail(auth, auth.currentUser.email);
      await logSecurityActivity("Password Reset Link Sent");
      setTimeout(() => {
        setModalStep("success");
        setLoading(false);
      }, 1500);
    } catch (error) {
      alert(error.message);
      setShowModal(false);
      setLoading(false);
    }
  };


  // 3. Handle Real-time Email Update (Corrected with Re-authentication)
  const handleEmailUpdate = async () => {
    if (!newEmail || !currentPassword) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);
    setModalStep("loading");

    try {
      const user = auth.currentUser;

      // 1. Current password vachu credential create panrom
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );

      // 2. MUKKIYAMANADHU: Modhalla user-ah re-authenticate pannanum!
      await reauthenticateWithCredential(user, credential);

      // 3. Verification mail anuprom (User link-ah click panna dhan Firebase-la mail maarum)
      await verifyBeforeUpdateEmail(user, newEmail);

      // 4. Security log mattum firestore-la ethrom
      await logSecurityActivity(`Verification mail initiated for ${newEmail}`);

      setModalStep("success");

      alert(
        "Verification email sent to " +
          newEmail +
          ". Please click the link in your inbox to complete the update, then login again.",
      );
    } catch (error) {
      console.error(error);

      // Invalid credential vandha user-ku puriyra madhiri alert
      if (error.code === "auth/invalid-credential") {
        alert("Wrong Password! Neenga kudutha Current Password thappu.");
      } else {
        alert("Error: " + error.message);
      }
      setModalStep("init");
    }

    setLoading(false);
  };
  const toggle2FA = async () => {
    if (!auth.currentUser) return;

    setLoading(true);

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);

      const newState = !isTFAEnabled;

      // Enable pannumbodhu
      if (newState) {
        // ENABLE 2FA
        await updateDoc(userRef, {
          is2FAEnabled: true,
          is2FAVerified: true,
        });

        setIsTFAEnabled(true);

        await addDoc(collection(db, "security_logs"), {
          adminId: auth.currentUser.uid,
          action: "2FA Enabled",
          timestamp: new Date(),
        });

        alert("2FA Enabled 🔐");
      } else {
        // DISABLE 2FA
        await updateDoc(userRef, {
          is2FAEnabled: false,
          is2FAVerified: false,
        });

        setIsTFAEnabled(false);

        await addDoc(collection(db, "security_logs"), {
          adminId: auth.currentUser.uid,
          action: "2FA Disabled",
          timestamp: new Date(),
        });

        alert("2FA Disabled ❌");
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    }

    setLoading(false);
  };

  // Helper: Log Security Activity to Firestore
  const logSecurityActivity = async (action) => {
    try {
      await addDoc(collection(db, "security_logs"), {
        adminId: auth.currentUser.uid,
        action: action,
        timestamp: new Date(),
        device: navigator.userAgent.slice(0, 50),
      });
    } catch (e) {
      console.error("Error logging activity: ", e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-10">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="mb-4 p-2 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-1 w-8 bg-indigo-600 rounded-full" />
            <p className="text-indigo-600 font-black text-[10px] tracking-[0.3em] uppercase">
              Security Management
            </p>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">
            Control <span className="text-indigo-600">Center</span>
          </h2>
        </div>
        <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
            Current Session
          </p>
          <p className="text-sm font-bold text-slate-700">
            {auth.currentUser?.email}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Security Actions */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
            <h3 className="text-xl font-black text-slate-800 uppercase flex items-center gap-4 mb-10">
              <div className="p-3 bg-slate-900 text-white rounded-2xl">
                <ShieldCheck size={24} />
              </div>
              Core Credentials
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SecurityActionCard
                icon={<KeyRound />}
                title="Access Key"
                desc="Send reset link to current email"
                buttonText="Reset Now"
                onClick={() => {
                  setRequestType("Password");
                  setShowModal(true);
                  setModalStep("init");
                }}
              />
              <SecurityActionCard
                icon={<Mail />}
                title="Email Sync"
                desc="Securely change admin email"
                buttonText="Modify"
                onClick={() => {
                  setRequestType("Email");
                  setShowModal(true);
                  setModalStep("init");
                }}
              />
            </div>
          </section>

          {/* Real-time Session Display */}
          <section className="bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden">
            <div className="absolute bottom-0 right-0 opacity-10">
              <Globe size={200} />
            </div>
            <h3 className="text-xl font-black uppercase mb-6 flex items-center gap-4">
              <History className="text-indigo-400" /> Active Session Details
            </h3>
            <div className="space-y-4">
              <SessionRow
                device="Current Browser / Local IP"
                status="Active Now"
                active
              />
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-4">
                Browser Info: {navigator.userAgent.slice(0, 80)}...
              </p>
            </div>
          </section>
        </div>

        {/* Sidebar: TFA & Logs */}
        <div className="space-y-8">
          {/* TFA Card */}
          <div
            className={`p-8 rounded-[3rem] text-white shadow-lg transition-all duration-500 ${isTFAEnabled ? "bg-emerald-600" : "bg-indigo-600"}`}
          >
            <Fingerprint className="mb-4 opacity-50" size={32} />
            <h4 className="text-lg font-black uppercase mb-2">
              Two-Factor Auth
            </h4>
            <p className="text-indigo-100 text-xs font-medium leading-relaxed mb-6">
              {isTFAEnabled
                ? "Your account is protected by an extra layer of security."
                : "Add an extra layer of protection to your school's data."}
            </p>
            <button
              onClick={toggle2FA}
              disabled={loading}
              className={`w-full py-4 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all ${isTFAEnabled ? "bg-emerald-800 text-white" : "bg-white text-indigo-600"}`}
            >
              {loading ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : isTFAEnabled ? (
                "Disable 2FA"
              ) : (
                "Enable 2FA"
              )}
            </button>
          </div>

          {/* Real-time Security Logs */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <h4 className="text-sm font-black text-slate-800 uppercase mb-4 flex items-center gap-2">
              <ShieldQuestion size={18} className="text-slate-400" /> Security
              Logs
            </h4>
            <div className="space-y-3">
              {securityLogs.length > 0 ? (
                securityLogs.map((log) => (
                  <LogItem
                    key={log.id}
                    text={log.action}
                    date={log.timestamp?.toDate().toLocaleDateString()}
                  />
                ))
              ) : (
                <p className="text-[10px] text-slate-400 uppercase font-bold italic">
                  No recent activity
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => signOut(auth)}
            className="w-full p-6 bg-red-50 text-red-600 rounded-[2.5rem] font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-red-600 hover:text-white transition-all duration-300"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>

      {/* --- REAL-TIME MODAL FOR EMAIL/PASSWORD --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl"
            onClick={() => !loading && setShowModal(false)}
          />

          <div className="bg-white w-full max-w-md rounded-[4rem] p-10 relative z-10 shadow-2xl">
            {modalStep === "init" && (
              <div className="space-y-6">
                <div className="text-center">
                  <ShieldEllipsis
                    size={48}
                    className="mx-auto text-indigo-600 mb-4"
                  />
                  <h3 className="text-2xl font-black text-slate-900 uppercase">
                    Verify Identity
                  </h3>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                    placeholder="••••••••"
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />

                  {requestType === "Email" && (
                    <>
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mt-4 block">
                        New Admin Email
                      </label>
                      <input
                        type="email"
                        className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                        placeholder="newadmin@school.com"
                        onChange={(e) => setNewEmail(e.target.value)}
                      />
                    </>
                  )}
                </div>

                <button
                  onClick={
                    requestType === "Email"
                      ? handleEmailUpdate
                      : handleSecureReset
                  }
                  className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                >
                  Confirm & Update <ArrowRight size={16} />
                </button>
              </div>
            )}

            {modalStep === "loading" && (
              <div className="text-center py-10">
                <Loader2
                  size={64}
                  className="text-indigo-600 animate-spin mx-auto mb-8"
                />
                <p className="font-black text-slate-800 uppercase italic tracking-widest">
                  Processing Request...
                </p>
              </div>
            )}

            {modalStep === "success" && (
              <div className="text-center">
                <CheckCircle
                  size={64}
                  className="text-emerald-500 mx-auto mb-6"
                />
                <h3 className="text-xl font-black text-slate-900 uppercase">
                  Action Completed
                </h3>
                <p className="text-xs text-slate-400 font-bold mt-2 uppercase">
                  Your security settings have been updated and logged.
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full mt-8 py-5 bg-emerald-600 text-white font-black rounded-2xl uppercase text-[10px]"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SecurityActionCard = ({ icon, title, desc, buttonText, onClick }) => (
  <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col items-start justify-between">
    <div className="p-4 bg-white text-indigo-600 rounded-2xl shadow-sm mb-4">
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <div>
      <h4 className="text-sm font-black text-slate-800 uppercase mb-1">
        {title}
      </h4>
      <p className="text-[10px] text-slate-400 font-bold uppercase mb-6">
        {desc}
      </p>
      <button
        onClick={onClick}
        className="px-6 py-3 bg-white border border-slate-200 text-slate-700 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
      >
        {buttonText}
      </button>
    </div>
  </div>
);

const SessionRow = ({ device, status, active }) => (
  <div className="flex items-center gap-4 py-3 border-b border-white/10">
    <Smartphone
      size={16}
      className={active ? "text-indigo-400" : "text-white/40"}
    />
    <div>
      <p className="text-[11px] font-black uppercase">{device}</p>
      <p
        className={`text-[9px] font-bold uppercase ${active ? "text-indigo-400" : "text-white/40"}`}
      >
        {status}
      </p>
    </div>
  </div>
);

const LogItem = ({ text, date }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
    <p className="text-[10px] font-bold text-slate-600 uppercase">{text}</p>
    <p className="text-[9px] font-black text-slate-300 uppercase">{date}</p>
  </div>
);

export default HMSettings;
