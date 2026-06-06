import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../HmPortal/hmFirebse";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  where,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import {
  ShieldCheck,
  Users,
  Activity,
  UserX,
  RefreshCw,
  Search,
  ShieldAlert,
  CheckCircle2,
  Clock,
  X,
  ArrowLeft,
  ArrowUpRight,
  Fingerprint,
  Inbox,
  Trash2
} from "lucide-react";

const AdminDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [stats, setStats] = useState({ totalTeachers: 0, pendingRequests: 0 });
  const [loading, setLoading] = useState(true);
  const [urgentAlert, setUrgentAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Fetch Activity Logs
    const qLogs = query(collection(db, "activity_logs"), orderBy("timestamp", "desc"), limit(15));
    const unsubLogs = onSnapshot(qLogs, (snap) => {
      const fetchedLogs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setLogs(fetchedLogs);
      
      // Urgent Alert Logic
      if (fetchedLogs.length > 0) {
        const latest = fetchedLogs[0];
        const logTime = latest.timestamp?.toDate();
        if (logTime && new Date() - logTime < 15000) {
          if (latest.type === "ALERT") {
            setUrgentAlert({ msg: `🚨 SECURITY: Unauthorized Access Attempt by ${latest.target}`, type: "DANGER" });
          }
        }
      }
    });

    // 2. Fetch Users (Active, Resigned/Blocked & Pending) in Real-time
    const qStaff = query(collection(db, "users"), where("role", "in", ["teacher", "hm"]));
    const unsubStaff = onSnapshot(qStaff, (snap) => {
      const allStaff = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      
      // Filter status carefully
      const activeOrBlocked = allStaff.filter((s) => s.status === "Active" || s.status === "Resigned");
      const pending = allStaff.filter((s) => s.status === "pending");
      
      setTeachers(activeOrBlocked);
      setPendingTeachers(pending);
      setStats({
        totalTeachers: allStaff.filter((s) => s.status === "Active").length,
        pendingRequests: pending.length,
      });
      setLoading(false);
    });

    return () => { unsubLogs(); unsubStaff(); };
  }, []);

  // --- ACTIONS ---
  const createLog = async (action, target, type = "INFO") => {
    await addDoc(collection(db, "activity_logs"), {
      user: "Admin", action: action, target: target, timestamp: serverTimestamp(), type: type,
    });
  };

  // Admin approves first-time signup request
  const handleApproveUser = async (user) => {
    try {
      await updateDoc(doc(db, "users", user.id), { 
        status: "Active" 
      });
      await createLog(`Approved Access for ${user.role}`, user.fullName, "INFO");
      setUrgentAlert(null);
    } catch (e) { console.error("Approval Error:", e); }
  };

  // Admin rejects/clears illegal signups
  const handleRejectUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete the request from ${user.fullName}? Incorrect credentials will be cleared.`)) {
      try {
        await deleteDoc(doc(db, "users", user.id));
        await createLog(`Deleted Invalid/Rejected Request for ${user.role}`, user.fullName, "ALERT");
      } catch (e) { console.error("Deletion Error:", e); }
    }
  };

  // Admin Instant Block / Unblock Action (Forces live user out)
  const handleToggleStatus = async (teacherId, currentStatus, name) => {
    const isResigned = currentStatus === "Resigned";
    const newStatus = isResigned ? "Active" : "Resigned"; // 'Resigned' acts as Blocked status
    const confirmMsg = isResigned 
      ? `Restore system access for ${name}?` 
      : `⚠️ KILL SESSION: Revoke access for ${name}? This will instantly kick them out if they are logged in!`;
    
    if (window.confirm(confirmMsg)) {
      try {
        await updateDoc(doc(db, "users", teacherId), { 
          status: newStatus 
        });
        await createLog(isResigned ? "Restored Access" : "Deactivated & Blocked Access", name, isResigned ? "INFO" : "ALERT");
      } catch (e) { console.error("Status Toggle Error:", e); }
    }
  };

  // --- UX FILTER LOGIC ---
  const filteredTeachers = teachers.filter(t => 
    t.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Syncing Systems...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-8 font-sans selection:bg-indigo-100">
      
      {/* 1. FLOATING URGENT NOTIFICATION */}
      {urgentAlert && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-lg animate-in slide-in-from-top-10">
          <div className={`p-1 rounded-3xl shadow-2xl ${urgentAlert.type === "DANGER" ? "bg-rose-500" : "bg-indigo-500"}`}>
            <div className="bg-black/10 backdrop-blur-md rounded-[1.4rem] p-4 flex items-center justify-between text-white border border-white/10">
              <div className="flex items-center gap-3">
                <ShieldAlert size={20} className="animate-pulse" />
                <p className="text-[11px] font-black uppercase tracking-wide">{urgentAlert.msg}</p>
              </div>
              <button onClick={() => setUrgentAlert(null)} className="hover:bg-white/20 p-1.5 rounded-full"><X size={16} /></button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        
        {/* 2. ENHANCED HEADER & SEARCH */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <button onClick={() => navigate(-1)} className="p-3.5 bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all group">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                Admin <span className="text-indigo-600">Portal</span>
              </h1>
              <p className="text-[9px] font-bold text-slate-400 tracking-[0.3em] uppercase mt-1.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Security Status: Active
              </p>
            </div>
          </div>

          <div className="relative group max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search personnel or roles..." 
              className="w-full bg-white border border-slate-200 py-4 pl-12 pr-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all text-sm font-bold shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8">
          
          {/* 3. SIDEBAR (STATS & LOGS) */}
          <aside className="col-span-12 lg:col-span-4 space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-6">
              <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform"><Users size={120} /></div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-indigo-200">Active Staff</p>
                <h2 className="text-5xl font-black italic">{stats.totalTeachers}</h2>
              </div>
              <div className={`p-8 rounded-[2.5rem] shadow-xl transition-all border ${stats.pendingRequests > 0 ? 'bg-amber-500 border-amber-400 text-white shadow-amber-100 animate-pulse-subtle' : 'bg-white border-slate-100 text-slate-300'}`}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Requests</p>
                <h2 className="text-5xl font-black italic">{stats.pendingRequests}</h2>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm h-[500px] flex flex-col">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-8 flex items-center gap-2">
                <Activity size={14} className="text-indigo-600" /> Audit Log Stream
              </h3>
              <div className="overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                {logs.map((log) => (
                  <div key={log.id} className="flex gap-4 group">
                    <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${log.type === "ALERT" ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" : "bg-indigo-400"}`}></div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-700 leading-tight">
                        <span className="text-slate-900 font-black">{log.user}</span> {log.action} <span className="text-indigo-600 italic">@{log.target}</span>
                      </p>
                      <p className="text-[8px] text-slate-400 font-black mt-1 uppercase tracking-tighter">
                        {log.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* 4. MAIN ACTION CENTER */}
          <main className="col-span-12 lg:col-span-8 space-y-8">
            
            {/* PENDING APPROVALS UX */}
            {pendingTeachers.length > 0 ? (
              <section className="bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-100 rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Fingerprint className="text-indigo-600" size={24} />
                  <h3 className="text-sm font-black uppercase italic text-indigo-900">Awaiting Clearance</h3>
                </div>
                <div className="space-y-3">
                  {pendingTeachers.map((u) => (
                    <div key={u.id} className="bg-white p-5 rounded-2xl flex items-center justify-between border border-white shadow-sm hover:border-indigo-200 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black uppercase">
                          {u.fullName ? u.fullName.charAt(0) : "?"}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm uppercase leading-none">{u.fullName || "Unknown User"}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase italic">{u.role}</p>
                        </div>
                      </div>
                      
                      {/* Action Triggers */}
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleRejectUser(u)}
                          className="bg-rose-50 text-rose-600 p-3 rounded-xl hover:bg-rose-600 hover:text-white transition-all"
                          title="Delete / Reject Request"
                        >
                          <Trash2 size={16} />
                        </button>
                        
                        <button 
                          onClick={() => handleApproveUser(u)}
                          className="bg-slate-900 text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2 group"
                        >
                          Approve <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <div className="bg-white border border-dashed border-slate-200 rounded-[2.5rem] p-10 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <CheckCircle2 size={32} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Systems Normal</p>
                <p className="text-xs font-bold text-slate-500 mt-1">No pending personnel requests found.</p>
              </div>
            )}

            {/* DIRECTORY TABLE */}
            <section className="bg-white rounded-[3rem] p-8 border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black uppercase text-slate-800 italic tracking-widest">Personnel Directory</h3>
                <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase">
                  Total Found: {filteredTeachers.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-50">
                      <th className="pb-5 text-left pl-2">Name & ID</th>
                      <th className="pb-5 text-left">Status</th>
                      <th className="pb-5 text-right pr-2">Security Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredTeachers.map((t) => (
                      <tr key={t.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-5 pl-2">
                          <p className="font-black text-slate-800 text-sm uppercase leading-none">{t.fullName}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">{t.role} • ID: {t.id.slice(0, 8)}</p>
                        </td>
                        <td className="py-5">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider ${t.status === "Resigned" ? "bg-rose-100 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
                            <span className={`w-1 h-1 rounded-full ${t.status === "Resigned" ? "bg-rose-600" : "bg-emerald-500 animate-pulse"}`}></span>
                            {t.status === "Resigned" ? "Blocked / Resigned" : "Active"}
                          </div>
                        </td>
                        <td className="py-5 text-right pr-2">
                          <button
                            onClick={() => handleToggleStatus(t.id, t.status, t.fullName)}
                            className={`p-3 rounded-xl transition-all active:scale-90 ${t.status === "Resigned" ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white" : "bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white"}`}
                            title={t.status === "Resigned" ? "Restore Access" : "Revoke Access (Instant Kick)"}
                          >
                            {t.status === "Resigned" ? <RefreshCw size={16} /> : <UserX size={16} />}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredTeachers.length === 0 && (
                      <tr>
                        <td colSpan="3" className="py-16 text-center">
                          <Inbox className="mx-auto text-slate-200 mb-3" size={40} />
                          <p className="text-slate-400 font-bold italic text-sm">No personnel matches your search.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </main>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(0.98); }
        }
        .animate-pulse-subtle { animation: pulse-subtle 4s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;