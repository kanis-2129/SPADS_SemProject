import React, { useState, useEffect } from "react";
import { auth, db } from "../hmFirebse"; 
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; 
import { 
  Mail, Phone, BadgeCheck, Shield, User, 
  Hash, School,  ArrowLeft, X, Save
} from "lucide-react";

const HMProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchHMData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfile(data);
            setFormData(data); 
          }
        }
      } catch (error) {
        console.error("Error fetching HM data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHMData();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const user = auth.currentUser;
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        fullName: formData.fullName,
        phone: formData.phone,
        schoolName: formData.schoolName
      });
      setProfile({ ...profile, ...formData });
      setIsEditOpen(false);
      alert("Profile Updated Successfully! ✅");
    } catch (error) {
      alert("Update Failed! ❌");
    } finally {
      setIsUpdating(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "HM";
    const cleanName = name.replace("Dr.", "").trim();
    return cleanName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse">Loading Profile...</div>;

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 relative animate-in fade-in duration-700">
      
      {/* Back Arrow */}
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-4 left-6 flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-[11px] transition-all group z-20"
      >
        <div className="p-2 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-all">
          <ArrowLeft size={16} />
        </div>
        Back
      </button>

      <div className="bg-white rounded-[3.5rem] p-10 shadow-sm border border-slate-100 overflow-hidden relative mt-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50 rounded-full -mr-40 -mt-40 opacity-40" />

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center gap-10 mb-12 relative z-10">
          <div className="w-44 h-44 bg-gradient-to-br from-indigo-600 to-indigo-400 rounded-[3.5rem] flex items-center justify-center text-white border-[10px] border-indigo-50 shadow-2xl">
             <span className="text-6xl font-black">{getInitials(profile.fullName)}</span>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <h2 className="text-4xl font-extrabold text-slate-800 leading-none">
                {profile.fullName}
              </h2>
              <BadgeCheck className="text-indigo-500" size={32} />
            </div>
            <p className="text-indigo-500 font-bold tracking-wide text-xs mt-4 flex items-center justify-center md:justify-start gap-2">
              <Shield size={14} fill="currentColor" /> Official HM Administrator
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center md:justify-start">
               <div className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[11px] font-bold flex items-center gap-2 shadow-lg">
                 <Hash size={14} className="text-indigo-400" /> ID: {profile.employeeId}
               </div>
            </div>
          </div>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
          <ProfileField icon={<School size={20}/>} label="Assigned Institution" value={profile.schoolName} />
          <ProfileField icon={<Mail size={20}/>} label="Official Email" value={auth.currentUser?.email} />
          <ProfileField icon={<Phone size={20}/>} label="Direct Contact" value={profile.phone} />
          <ProfileField icon={<User size={20}/>} label="Identity & Gender" value={profile.gender} />
        </div>

        {/* Actions */}
        <div className="mt-12 pt-10 border-t border-slate-50 flex flex-wrap gap-4 relative z-10">
          <button 
            onClick={() => setIsEditOpen(true)}
            className="flex-1 min-w-[200px] py-5 bg-indigo-600 text-white font-bold rounded-[2rem] shadow-xl hover:bg-indigo-700 transition-all text-sm tracking-wide"
          >
            Edit Administration Details
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsEditOpen(false)} />
          
          <form 
            onSubmit={handleUpdate}
            className="bg-white w-full max-w-xl rounded-[3rem] p-10 relative z-10 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-extrabold text-slate-800">Edit Profile</h3>
              <button type="button" onClick={() => setIsEditOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-6">
              <EditInput label="Full Name" value={formData.fullName} onChange={(val) => setFormData({...formData, fullName: val})} />
              <EditInput label="Mobile Number" value={formData.phone} onChange={(val) => setFormData({...formData, phone: val})} />
              <EditInput label="School Name" value={formData.schoolName} onChange={(val) => setFormData({...formData, schoolName: val})} />
            </div>

            <button 
              disabled={isUpdating}
              className="w-full mt-10 py-5 bg-indigo-600 text-white font-bold rounded-[2rem] shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isUpdating ? "Updating..." : <><Save size={18}/> Save Changes</>}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

const ProfileField = ({ icon, label, value }) => (
  <div className="p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100/50 group hover:bg-white transition-all">
    <div className="flex items-center gap-3 mb-3 text-indigo-400">
      <div className="p-2 bg-white rounded-xl shadow-sm">{icon}</div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-lg font-bold text-slate-700">{value || "N/A"}</p>
  </div>
);

const EditInput = ({ label, value, onChange }) => (
  <div>
    <label className="text-[11px] font-bold text-slate-400 ml-4 mb-2 block">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-5 bg-slate-50 rounded-[2rem] border-none focus:ring-4 focus:ring-indigo-100 font-bold text-slate-700 transition-all outline-none shadow-inner"
    />
  </div>
);

export default HMProfile;