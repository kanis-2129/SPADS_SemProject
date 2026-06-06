import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AIAnalysisModal from "../teachers/AIAnalysisModal";
import {
  Search,
  Plus,
  ArrowLeft,
  Trash2,
  FileText,
  Calendar,
  Clock,
  LayoutGrid,
  ChevronRight
} from "lucide-react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import MarksheetModal from "../../components/MarksheetModal";
import UploadModal from "../../components/fileUpload";

const ClassDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [examName, setExamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false);
  const [examRecords, setExamRecords] = useState([]);
  const [selectedExamData, setSelectedExamData] = useState([]);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [selectedExamName, setSelectedExamName] = useState("");

  const activeClass = location.state?.activeClass;
  const displayYear = activeClass?.year ? activeClass.year : "N/A";

  useEffect(() => {
    if (!activeClass || !auth.currentUser) return;

    const q = query(
      collection(db, "exam_summaries"),
      where("classId", "==", activeClass.id),
      where("teacherUid", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const sortedRecords = records.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      );
      setExamRecords(sortedRecords);
    });

    return unsubscribe;
  }, [activeClass]);

  // --- UPDATED DELETE LOGIC ---
  const handleDelete = async (recordId, sName) => {
    if (window.confirm(`Are you sure you want to delete ${sName}? This will permanently remove all marks associated with this exam.`)) {
      setLoading(true);
      try {
        const batch = writeBatch(db);

        // 1. Delete the summary record
        const summaryRef = doc(db, "exam_summaries", recordId);
        batch.delete(summaryRef);

        // 2. Find and delete all marks records linked to this summary
        // Note: Make sure your field name in 'students_marks' is exactly 'summaryId'
        const marksQuery = query(
          collection(db, "students_marks"),
          where("summaryId", "==", recordId)
        );
        
        const marksSnapshot = await getDocs(marksQuery);
        
        // Add each mark document to the delete batch
        marksSnapshot.docs.forEach((d) => {
          batch.delete(d.ref);
        });

        // 3. Execute everything in one go
        await batch.commit();
        
        alert("Exam and all associated marks deleted successfully!");
      } catch (err) {
        console.error("Delete error:", err);
        alert("Error deleting record: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleShowMarksheet = async (recordId, eName) => {
    setLoading(true);
    try {
      const q = query(collection(db, "students_marks"), where("summaryId", "==", recordId));
      const querySnapshot = await getDocs(q);
      const marks = querySnapshot.docs.map((doc) => doc.data());

      if (marks.length > 0) {
        setSelectedExamData(marks);
        setExamName(eName);
        setIsMarksModalOpen(true);
      } else {
        alert("No marks found!");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = examRecords.filter(
    (record) =>
      record.examName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.sheetName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!activeClass) return <div className="h-screen flex items-center justify-center font-bold text-slate-500 italic">Initializing class details...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-left">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-all group"
          >
            <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
              <ArrowLeft size={18} />
            </div>
            <span>Back to Workspace</span>
          </button>
          
          <div className="flex items-center gap-3">
             <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Academic Year</span>
                <span className="text-sm font-bold text-indigo-600">{displayYear}</span>
             </div>
             <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden md:block"></div>
             <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-black">
                {activeClass.className.charAt(0)}
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <LayoutGrid size={16} className="text-indigo-500" />
                <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">Class Analytics</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight flex items-center gap-4">
              {activeClass.className}
              <span className="px-4 py-1 bg-white border-2 border-slate-200 rounded-2xl text-2xl text-slate-400 font-bold">{activeClass.section}</span>
            </h1>
            <p className="mt-3 text-slate-500 font-medium max-w-md italic">Manage exams, analyze performance, and generate AI insights for your students.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Find an exam..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl w-full lg:w-72 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold shadow-sm placeholder:text-slate-300"
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-3 active:scale-95"
            >
              <Plus size={20} /> Create New Analysis
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden relative transition-all">
          {loading && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 border-r-4 border-r-transparent"></div>
                <span className="text-indigo-600 font-black text-xs uppercase tracking-tighter">Processing...</span>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Exam Category</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Record Source</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="p-4 bg-slate-50 rounded-full text-slate-300"><FileText size={40} /></div>
                            <p className="text-slate-400 font-bold italic">No exam records found for this class.</p>
                        </div>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                <GraduationCap size={20} />
                            </div>
                            <span className="font-black text-slate-800 text-lg tracking-tight group-hover:text-indigo-700 transition-colors cursor-default">
                                {record.examName}
                            </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <button
                          onClick={() => handleShowMarksheet(record.id, record.examName)}
                          className="flex items-center gap-3 text-indigo-600 bg-indigo-50/50 px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-600 hover:text-white transition-all group/btn"
                        >
                          <FileText size={16} className="group-hover/btn:rotate-12 transition-transform" />
                          <span className="truncate max-w-[150px]">{record.fileName || record.sheetName}</span>
                        </button>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-slate-700 text-sm font-bold">
                                <Calendar size={14} className="text-slate-400" /> {record.date}
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-tighter">
                                <Clock size={12} /> {record.time}
                            </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => {
                                    setSelectedRecordId(record.id);
                                    setSelectedExamName(record.examName);
                                    setIsAIModalOpen(true);
                                }}
                                className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-black hover:bg-indigo-600 transition-all flex items-center gap-2"
                            >
                                AI Report <ChevronRight size={14} />
                            </button>
                            <button
                                onClick={() => handleDelete(record.id, record.sheetName || record.examName)}
                                className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isAIModalOpen && (
          <AIAnalysisModal
            isOpen={isAIModalOpen}
            onClose={() => setIsAIModalOpen(false)}
            recordId={selectedRecordId}
            examName={selectedExamName}
          />
        )}

        {isMarksModalOpen && (
          <MarksheetModal
            data={selectedExamData}
            title={examName}
            onClose={() => setIsMarksModalOpen(false)}
          />
        )}

        {isModalOpen && (
          <UploadModal
            activeClass={activeClass}
            displayYear={displayYear}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

const GraduationCap = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
    </svg>
);

export default ClassDetails;