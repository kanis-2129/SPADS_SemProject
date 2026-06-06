import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "./firebase";
import AccountSettings from "../teachers/teacherAccountSetting";
import {
  ArrowLeft, Plus, X, GraduationCap, LayoutGrid, Trash2, 
  Settings, LogOut, Mail, Edit3, BookOpen, UserCheck, Calendar,
} from "lucide-react";
import {
  collection, addDoc, serverTimestamp, query, where, 
  onSnapshot, orderBy, deleteDoc, doc, updateDoc, getDocs,
} from "firebase/firestore";
import { signOut, deleteUser } from "firebase/auth";
import { Link } from "react-router-dom";

const TeacherWorkspace = () => {
  const [classes, setClasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingClassId, setEditingClassId] = useState(null);
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [newClass, setNewClass] = useState({
    className: "",
    section: "",
    year: "",
    subject: "", 
  });

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, "teacher_classes"),
      where("teacherUid", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc"),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setClasses(data);
    });
    return () => unsubscribe();
  }, [auth.currentUser]);

  const handleTeacherExit = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const confirmExit = window.confirm("Warning: Logout panna data PERMANENT-ah delete aagidum. Are you sure?");
    if (confirmExit) {
      try {
        const q = query(collection(db, "teacher_classes"), where("teacherUid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const deletePromises = querySnapshot.docs.map((docSnapshot) => deleteDoc(doc(db, "teacher_classes", docSnapshot.id)));
        await Promise.all(deletePromises);
        await deleteDoc(doc(db, "users", user.uid));
        await deleteUser(user);
        navigate("/teacher-register");
      } catch (error) {
        if (error.code === "auth/requires-recent-login") {
          alert("Security-kaga: Logout panni login pannittu vandhu try pannunga!");
          await signOut(auth);
          navigate("/teacher-login");
        }
      }
    }
  };

  const handleSaveClass = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await updateDoc(doc(db, "teacher_classes", editingClassId), {
          ...newClass,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "teacher_classes"), {
          ...newClass,
          teacherUid: auth.currentUser.uid,
          createdAt: serverTimestamp(),
        });
      }

      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        class: newClass.className,
        section: newClass.section,
        assignedClass: newClass.className,
        assignedSection: newClass.section,
        assignedSubject: newClass.subject,
      });

      alert("Workspace Updated! 🚀");
      closeModal();
    } catch (err) {
      alert("Sync Failed: " + err.message);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingClassId(null);
    setNewClass({ className: "", section: "", year: "", subject: "" });
  };

  const openEditModal = (cls) => {
    setNewClass({ 
        className: cls.className, 
        section: cls.section, 
        year: cls.year || "", 
        subject: cls.subject || "" 
    });
    setEditingClassId(cls.id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDeleteClass = async (classId) => {
    if (window.confirm("Delete this workspace?")) {
      await deleteDoc(doc(db, "teacher_classes", classId));
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* --- SIDEBAR --- */}
      <aside className="w-80 bg-white border-r border-slate-200 p-8 hidden lg:flex flex-col shadow-sm">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all text-[11px] font-black uppercase mb-6 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>

        <div className="mb-10">
          <div className="w-20 h-20 bg-indigo-700 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black mb-4 shadow-xl shadow-indigo-100">
            {auth.currentUser?.email?.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-slate-900 truncate">{auth.currentUser?.displayName || "Professor"}</h2>
          <p className="text-sm text-slate-500 font-medium flex items-center gap-2 mt-1"><Mail size={14} className="text-slate-400" /> {auth.currentUser?.email}</p>
        </div>

        <nav className="space-y-2 flex-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Profession</p>
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 mb-6">
            <div className="flex items-center gap-3 text-emerald-800 font-bold text-sm"><UserCheck size={18} /> Class Teacher</div>
            <p className="text-[11px] text-emerald-700/70 mt-1 font-medium italic">Authorized to monitor student performance.</p>
          </div>

          <button onClick={() => setIsSettingsOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-indigo-700 rounded-xl transition-all">
            <Settings size={18} /> Account Settings
          </button>
          <AccountSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
          
          <button onClick={() => navigate("/teacher-dashboard")} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-indigo-700 rounded-xl transition-all">
            <LayoutGrid size={18} /> Performance Analytics
          </button>
        </nav>

        <button onClick={handleTeacherExit} className="mt-auto flex items-center gap-3 px-4 py-4 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-2xl transition-all">
          <LogOut size={18} /> Logout & Wipe Data
        </button>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div className="text-left">
              <p className="text-indigo-600 font-black text-xs uppercase tracking-[0.2em] mb-2">Workspace Overview</p>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Academic <span className="text-slate-400">Portal</span></h1>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {classes.length > 0 ? (
              classes.map((cls) => (
                <div key={cls.id} className="relative group bg-white p-8 rounded-[2.5rem] shadow-lg shadow-slate-200 border border-slate-100 transition-all hover:shadow-2xl hover:border-indigo-100 hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-10">
                    <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl"><GraduationCap size={32} /></div>
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(cls)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all"><Edit3 size={18} /></button>
                      <button onClick={() => handleDeleteClass(cls.id)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all"><Trash2 size={18} /></button>
                    </div>
                  </div>
                  <Link to={`/class-details/${cls.id}`} state={{ activeClass: cls }}>
                    <h3 className="text-4xl font-black text-slate-800 tracking-tight group-hover:text-indigo-900 transition-colors">{cls.className} <span className="text-indigo-600">Grade</span></h3>
                    <p className="text-lg font-bold text-slate-400 mt-1 uppercase tracking-widest">Section {cls.section}</p>
                    <p className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-black uppercase">
                        <BookOpen size={14} className="text-indigo-600"/> {cls.subject || "No Subject Set"}
                    </p>
                  </Link>
                </div>
              ))
            ) : (
              <div onClick={() => setIsModalOpen(true)} className="group cursor-pointer min-h-[320px] bg-white border-4 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center transition-all hover:border-indigo-400 hover:bg-indigo-50/30">
                <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-all duration-500"><Plus className="text-slate-400 group-hover:text-white" size={40} /></div>
                <h3 className="text-xl font-bold text-slate-800">Activate Workspace</h3>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- MODAL (Add/Edit) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black tracking-tight">{isEditMode ? "Edit Details" : "New Workspace"}</h3>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
            </div>

            <form className="p-10 space-y-6" onSubmit={handleSaveClass}>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Grade</label>
                  <input required placeholder="e.g. 10th" value={newClass.className} className="w-full p-4 mt-2 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all font-bold"
                    onChange={(e) => setNewClass({ ...newClass, className: e.target.value })} />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Section</label>
                  <input required placeholder="e.g. A" value={newClass.section} className="w-full p-4 mt-2 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all font-bold"
                    onChange={(e) => setNewClass({ ...newClass, section: e.target.value.toUpperCase() })} />
                </div>

                <div>
                  <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1">Subject Handling</label>
                  <input 
                    required 
                    placeholder="e.g. Science / Tamil" 
                    value={newClass.subject} 
                    className="w-full p-4 mt-2 bg-indigo-50/50 border border-indigo-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-500 font-bold transition-all"
                    onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })} 
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Year</label>
                  <input required placeholder="e.g. 2024-25" value={newClass.year} className="w-full p-4 mt-2 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all font-bold"
                    onChange={(e) => setNewClass({ ...newClass, year: e.target.value })} />
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-700 text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-indigo-800 transition-all shadow-xl shadow-indigo-100 mt-4 active:scale-[0.98]">
                {isEditMode ? "Update Workspace" : "Activate Workspace"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherWorkspace;