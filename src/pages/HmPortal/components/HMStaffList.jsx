import React, { useState, useEffect } from "react";
import { db } from "../hmFirebse"; 
import { useNavigate } from "react-router-dom";
import { 
  collection, onSnapshot, query, where 
} from "firebase/firestore";
import { 
  Search, Loader2, ArrowLeft, CheckCircle2, UserMinus 
} from "lucide-react";

const HMStaffList = () => {
  const navigate = useNavigate();
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    // HM mattum illama Teachers list-ah fetch pannudhu
    const q = query(collection(db, "users"), where("role", "==", "teacher"));
    const unsub = onSnapshot(q, (snapshot) => {
      const staff = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStaffData(staff);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Filter logic: Search and Tab based filtering
  const filteredStaff = staffData.filter(s => {
    const nameMatch = s.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === "active") return nameMatch && s.status !== "Resigned";
    return nameMatch && s.status === "Resigned";
  });

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
      <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
      <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Fetching Directory...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white border border-slate-100 text-slate-600 hover:text-indigo-600 hover:shadow-md rounded-2xl transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div>
            <h2 className="text-3xl font-black text-slate-800 uppercase italic leading-none">Staff Directory</h2>
            <p className="text-slate-400 font-bold text-[10px] tracking-[0.2em] uppercase mt-2">View & Manage Personnel</p>
          </div>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button 
            onClick={() => setActiveTab("active")}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "active" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"}`}
          >
            <CheckCircle2 size={14}/> Active
          </button>
          <button 
            onClick={() => setActiveTab("resigned")}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "resigned" ? "bg-white text-rose-600 shadow-sm" : "text-slate-400"}`}
          >
            <UserMinus size={14}/> Resigned
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search by teacher name..."
            className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl border-none font-bold text-sm outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <th className="px-8 py-6">Staff Profile</th>
              <th className="px-6 py-6">Status</th>
              <th className="px-8 py-6 text-right">Class & Subject Mapping</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredStaff.length > 0 ? (
              filteredStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-lg ${activeTab === 'active' ? 'bg-indigo-600' : 'bg-slate-400'}`}>
                        {staff.fullName?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm uppercase">{staff.fullName}</p>
                        <p className="text-[10px] font-bold text-slate-400">{staff.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-[9px] font-black uppercase tracking-widest">
                    <span className={activeTab === 'active' ? 'bg-green-100 text-green-600 px-3 py-1 rounded-full' : 'bg-rose-100 text-rose-500 px-3 py-1 rounded-full'}>
                      {activeTab === 'active' ? 'On Duty' : 'Resigned'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right italic text-[11px] font-black text-slate-600 uppercase">
                    {staff.assignedClass || staff.class ? (
                      `${staff.assignedClass || staff.class}-${staff.assignedSection || staff.section} | ${staff.assignedSubject || "General"}`
                    ) : (
                      "No Allocation Yet"
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-8 py-10 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HMStaffList;