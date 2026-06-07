import React, { useState, useEffect ,useCallback} from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../hmFirebse";
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronLeft,
  ChevronRight,
  User,
  Filter,
  Search,
  RefreshCw,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const subjects = ["Tamil", "English", "Maths", "Science", "Social"];

const HMStudentRiskTracker = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState("10");
  const [selectedSection, setSelectedSection] = useState("A");
  const [selectedExam, setSelectedExam] = useState("");
  const [availableExams, setAvailableExams] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const fetchRiskData = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "students_marks"),
        where("className", "==", selectedClass),
        where("section", "==", selectedSection.toUpperCase()),
      );

      const snap = await getDocs(q);
      const allRecords = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const exams = [...new Set(allRecords.map((r) => r.examName))].filter(
        Boolean,
      );
      setAvailableExams(exams);
      if (!selectedExam && exams.length > 0)
        setSelectedExam(exams[exams.length - 1]);

      const studentMap = {};
      allRecords.forEach((record) => {
        const key = record.RegNo || record.regNo || record.Name;
        if (!studentMap[key]) studentMap[key] = [];
        studentMap[key].push(record);
      });

      const getSubjectMark = (record, subject) => {
        if (!record) return 0;

        const normalize = (txt) =>
          String(txt || "")
            .toLowerCase()
            .replace(/[^a-z]/g, "");

        const target = normalize(subject);

        const key = Object.keys(record).find((k) => {
          const current = normalize(k);

          const corrections = {
            math: "maths",
            maths: "maths",
            scince: "science",
            sceince: "science",
            socialscience: "social",
          };

          return (
            (corrections[current] || current) ===
            (corrections[target] || target)
          );
        });

        return Number(record[key] || 0);
      };

      const riskList = [];

      Object.values(studentMap).forEach((records) => {
        if (!records.length) return;

        records.sort(
          (a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0),
        );

        const currentIdx = records.findIndex(
          (r) => r.examName === selectedExam,
        );

        if (currentIdx === -1) return;

        const current = records[currentIdx];
        const previous = currentIdx > 0 ? records[currentIdx - 1] : null;

        let analysis = [];
        let hasRiskNow = false;
        let hadRiskBefore = false;

        subjects.forEach((sub) => {
          const currMark = getSubjectMark(current, sub);

          // previous exam irundha dha mark edukum
          const prevMark = previous ? getSubjectMark(previous, sub) : null;

          // CURRENT EXAM RISK
          if (currMark < 35) {
            hasRiskNow = true;

            let status = "No Previous Exam";

            if (prevMark !== null) {
              status =
                currMark > prevMark
                  ? "Improved"
                  : currMark < prevMark
                    ? "Declining"
                    : "No Change";
            }

            analysis.push({
              name: sub,
              prev: prevMark,
              curr: currMark,
              status,
              riskLevel: "Critical",
            });
          }

          // PREVIOUS EXAM RISK CHECK
          if (previous) {
            const oldMark = getSubjectMark(previous, sub);

            if (oldMark < 35) {
              hadRiskBefore = true;
            }
          }
        });

        if (hasRiskNow) {
          riskList.push({
            ...current,
            analysis,
            isNewRisk: !hadRiskBefore,
          });
        }
      });

      setStudents(riskList);
      setSelectedStudent(null);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
    setLoading(false);
  }, [selectedClass, selectedSection, selectedExam]);

  useEffect(() => {
    fetchRiskData();
  }, [fetchRiskData]);

  const filteredStudents = students.filter(
    (s) =>
      s.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.RegNo || s.regNo)?.toString().includes(searchQuery),
  );

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white rounded-xl shadow-sm border border-slate-200"
            >
              <ChevronLeft size={20} className="text-slate-600" />
            </button>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">
              Risk <span className="text-red-600">Watchlist</span>
            </h1>
          </div>

          <div className="relative w-full md:w-80">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none font-bold text-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100 items-center">
          <div className="flex items-center gap-2 px-4 border-r border-slate-100">
            <Filter size={16} className="text-indigo-500" />
            <span className="text-[10px] font-black uppercase text-slate-400">
              Filters
            </span>
          </div>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-slate-50 px-4 py-2 rounded-xl font-bold text-slate-700 outline-none"
          >
            {["6", "7", "8", "9", "10", "11", "12"].map((cls) => (
              <option key={cls} value={cls}>
                Grade {cls}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value.toUpperCase())}
            placeholder="SEC"
            className="w-16 bg-slate-50 px-2 py-2 rounded-xl font-bold text-center outline-none uppercase"
          />

          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="bg-indigo-50 px-4 py-2 rounded-xl font-bold text-indigo-700 outline-none border border-indigo-100"
          >
            {availableExams.map((ex) => (
              <option key={ex} value={ex}>
                {ex}
              </option>
            ))}
          </select>

          <button
            onClick={fetchRiskData}
            className="ml-auto flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white text-[10px] font-black rounded-xl hover:bg-indigo-700 uppercase tracking-widest"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Sync
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-4">
          <div className="flex justify-between items-center px-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {filteredStudents.length} Students at Risk
            </p>
            {/* New Student notification */}
            {filteredStudents.some((s) => s.isNewRisk) && (
              <span className="text-[9px] bg-amber-100 text-amber-600 px-2 py-1 rounded-lg font-black animate-pulse">
                NEW RISKS DETECTED
              </span>
            )}
          </div>

          {loading ? (
            <div className="p-10 text-center bg-white rounded-3xl animate-pulse text-slate-400 font-bold uppercase text-xs">
              Scanning...
            </div>
          ) : filteredStudents.length > 0 ? (
            filteredStudents.map((student, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedStudent(student)}
                className={`group p-5 rounded-[2rem] cursor-pointer transition-all border-2 flex items-center justify-between shadow-sm ${
                  selectedStudent?.id === student.id
                    ? "bg-indigo-50 border-indigo-200"
                    : student.isNewRisk
                      ? "bg-white border-amber-300" // New risk student ku amber border
                      : "bg-white border-transparent"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`relative h-12 w-12 rounded-2xl flex items-center justify-center font-black text-white shadow-lg ${
                      student.analysis.some((a) => a.riskLevel === "Critical")
                        ? "bg-red-500"
                        : "bg-orange-400"
                    }`}
                  >
                    {student.Name?.charAt(0)}
                    {student.isNewRisk && (
                      <div className="absolute -top-1 -right-1 bg-amber-500 text-white p-1 rounded-full border-2 border-white">
                        <Zap size={8} fill="currentColor" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-slate-800 uppercase tracking-tight">
                        {student.Name}
                      </h3>
                      {student.isNewRisk && (
                        <span className="bg-amber-500 text-[8px] text-white px-1.5 py-0.5 rounded-md font-black">
                          NEW
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                      {student.analysis.length} RISK SUBJECTS
                    </span>
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className={`${selectedStudent?.id === student.id ? "text-indigo-500" : "text-slate-300"}`}
                />
              </div>
            ))
          ) : (
            <div className="p-10 text-center bg-white rounded-3xl text-slate-400 font-bold uppercase text-xs">
              No entries found
            </div>
          )}
        </div>

        <div className="lg:col-span-7">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 sticky top-8">
            {selectedStudent ? (
              <div>
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-black text-slate-900 uppercase italic leading-none">
                        {selectedStudent.Name}
                      </h2>
                      {selectedStudent.isNewRisk && (
                        <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                          <AlertTriangle size={12} /> New entry to Watchlist
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">
                      Exam: {selectedStudent.examName} | Reg:{" "}
                      {selectedStudent.RegNo || selectedStudent.regNo}
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-slate-50 rounded-2xl text-[10px] font-black text-slate-500 uppercase">
                    Grade {selectedClass}-{selectedSection}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {selectedStudent.analysis.map((sub, i) => (
                    <div
                      key={i}
                      className="p-5 bg-slate-50/50 rounded-3xl border border-slate-100 flex flex-col gap-4"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-black text-sm uppercase text-slate-700 tracking-tighter">
                          {sub.name}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase ${sub.riskLevel === "Critical" ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}
                        >
                          {sub.riskLevel}
                        </span>
                      </div>

                      <div className="flex items-end justify-between">
                        <div className="flex gap-10">
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                              Previous Exam
                            </p>
                            <p className="text-xl font-black text-slate-400 tracking-tighter line-through">
                              {sub.prev}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-indigo-400 uppercase mb-1">
                              Current Exam
                            </p>
                            <p className="text-2xl font-black text-indigo-600 tracking-tighter">
                              {sub.curr}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl font-black text-[10px] uppercase shadow-sm bg-white ${
                            sub.status === "Improved"
                              ? "text-emerald-500"
                              : sub.status === "Declining"
                                ? "text-red-500"
                                : "text-slate-400"
                          }`}
                        >
                          {sub.status === "Improved" ? (
                            <ArrowUpRight size={14} />
                          ) : sub.status === "Declining" ? (
                            <ArrowDownRight size={14} />
                          ) : (
                            <Minus size={14} />
                          )}
                          {sub.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-center">
                <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <User size={32} className="text-slate-200" />
                </div>
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest text-center">
                  Select a student from the list
                  <br />
                  to see deep analysis
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HMStudentRiskTracker;
