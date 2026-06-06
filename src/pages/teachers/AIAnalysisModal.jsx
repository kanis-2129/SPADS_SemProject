import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  AlertCircle,
  Target,
  Loader2,
  BrainCircuit,
  TrendingDown,
  Zap,
  ChevronDown,
  ChevronRight,
  Trophy,
  Database,
  Target as TargetIcon,
  Award,
} from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";

// Reuseable Subject Accordion Component
const SubjectAccordion = ({
  title,
  data,
  icon: Icon,
  colorClass,
  type,
  expanded,
  setExpanded,
}) => (
  <div className="space-y-3">
    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
      <Icon size={14} className={colorClass} /> {title}
    </h4>
    <div className="space-y-2">
      {Object.keys(data).map(
        (sub) =>
          data[sub] &&
          data[sub].length > 0 && (
            <motion.div
              key={sub}
              layout
              className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:border-slate-200 transition-colors"
            >
              <button
                onClick={() =>
                  setExpanded(expanded === sub + type ? null : sub + type)
                }
                className="w-full flex justify-between items-center p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-700 text-sm">
                    {sub}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-black ${colorClass.replace("text", "bg")}/10 ${colorClass}`}
                  >
                    {data[sub].length} Students
                  </span>
                </div>
                {expanded === sub + type ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
              <AnimatePresence>
                {expanded === sub + type && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-wrap gap-2 overflow-hidden"
                  >
                    {data[sub].map((s, idx) => (
                      <span
                        key={idx}
                        className="bg-white px-3 py-1 rounded-lg text-[11px] font-medium border border-slate-200 shadow-sm transition-transform hover:scale-105 hover:border-cyan-200"
                      >
                        {s.name}{" "}
                        {s.mark !== undefined
                          ? `(${s.mark})`
                          : s.drop
                            ? `(Drop: -${s.drop})`
                            : ""}
                      </span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ),
      )}
    </div>
  </div>
);

const AIAnalysisModal = ({ isOpen, onClose, recordId, examName }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [expandedSection, setExpandedSection] = useState(null);

  // Steps array moved to top scope to prevent no-undef errors during JSX compilation
  const loadingSteps = [
    "Accessing Firebase Records...",
    "Normalizing Subject Parameters...",
    "Analyzing Student Databases...",
    "Verifying Science Target Key Fields...",
    "Computing Topper Lag Structures...",
    "Preparing Insights Panel...",
  ];

  useEffect(() => {
    if (!loading) return;
    const timer = setInterval(() => {
      setLoadingStep((s) => (s < loadingSteps.length - 1 ? s + 1 : s));
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, loadingSteps.length]);

  useEffect(() => {
    if (!isOpen || !recordId) return;

    const fetchAndAnalyze = async () => {
      setLoading(true);
      try {
        const currentQ = query(
          collection(db, "students_marks"),
          where("summaryId", "==", recordId),
        );
        const currentSnap = await getDocs(currentQ);
        const currentMarks = currentSnap.docs.map((d) => d.data());

        const allSnap = await getDocs(collection(db, "students_marks"));
        const historyData = allSnap.docs.map((d) => d.data());

        if (currentMarks.length === 0) {
          setAnalysis(null);
          return;
        }

        const subjects = ["Tamil", "English", "Maths", "Science", "Social"];

        let borderlineGroup = {},
          criticalGroup = {},
          blindSpotGroup = {};
        let subjectStats = {};

        subjects.forEach((sub) => {
          borderlineGroup[sub] = [];
          criticalGroup[sub] = [];
          blindSpotGroup[sub] = [];
          subjectStats[sub] = { failCount: 0 };
        });

        let computedProfiles = [];

        // STRONGEST DATA NORMALIZER KEY-PARSER FOR FIRESTORE REORGS
        const getStudentMark = (studentObj, subName) => {
          const aliases = {
            Tamil: ["tamil"],
            English: ["english"],
            Maths: ["maths", "math"],
            Science: ["science", "sceince"], // typo support
            Social: ["social"],
          };

          const keys = Object.keys(studentObj);

          for (const key of keys) {
            const cleanKey = key.toLowerCase().replace(/[\s\-_.]+/g, "");

            const matched = aliases[subName]?.some(
              (alias) => cleanKey === alias || cleanKey.includes(alias),
            );

            if (matched) {
              return Number(studentObj[key]) || 0;
            }
          }

          return 0;
        };
        currentMarks.forEach((student) => {
          console.log("Current Student Record");
          console.log(currentMarks[0]);
          let studentTotal = 0;
          let marksMap = {};

          subjects.forEach((sub) => {
            const m = getStudentMark(student, sub);
            marksMap[sub] = m;
            studentTotal += m;

            if (m <= 35) {
              criticalGroup[sub].push({
                name: student.Name || student.name,
                mark: m,
              });
              subjectStats[sub].failCount++;
            } else if (m >= 36 && m <= 45) {
              borderlineGroup[sub].push({
                name: student.Name || student.name,
                mark: m,
              });
            }
          });

          const overallAvg = parseFloat(
            (studentTotal / subjects.length).toFixed(1),
          );

          computedProfiles.push({
            name: student.Name || student.name,
            avg: overallAvg,
            marks: marksMap,
            raw: student,
          });
        });

        // 1. Golden Batch Calculation
        const goldenBatch = [...computedProfiles]
          .sort((a, b) => b.avg - a.avg)
          .slice(0, 3);

        const pastRecords = historyData.filter((h) => h.summaryId !== recordId);

        // 2. Toppers Performance Slippage Matrix Analysis Logic
        let rankSlips = [];
        if (pastRecords.length > 0) {
          let historicalAvgs = [];
          const uniquePastNames = [
            ...new Set(pastRecords.map((p) => p.Name || p.name)),
          ].filter(Boolean);

          uniquePastNames.forEach((name) => {
            const matches = pastRecords.filter(
              (p) => (p.Name || p.name) === name,
            );
            let totalHistSum = 0;
            matches.forEach((m) => {
              subjects.forEach((sub) => {
                totalHistSum += getStudentMark(m, sub);
              });
            });
            const avgHist = totalHistSum / (matches.length * subjects.length);
            historicalAvgs.push({ name, avgHist });
          });

          const top5HistoricalNames = historicalAvgs
            .sort((a, b) => b.avgHist - a.avgHist)
            .slice(0, 5)
            .map((x) => x.name);

          computedProfiles.forEach((currStudent) => {
            if (top5HistoricalNames.includes(currStudent.name)) {
              const histMatches = pastRecords.filter(
                (p) => (p.Name || p.name) === currStudent.name,
              );

              let pastSubAvgs = {};
              subjects.forEach((sub) => {
                const totalSubScore = histMatches.reduce(
                  (sum, h) => sum + getStudentMark(h, sub),
                  0,
                );
                pastSubAvgs[sub] = totalSubScore / histMatches.length;
              });

              let maxDrop = 0;
              let laggingSubject = "None";

              subjects.forEach((sub) => {
                const diff = pastSubAvgs[sub] - currStudent.marks[sub];
                if (diff > maxDrop) {
                  maxDrop = diff;
                  laggingSubject = sub;
                }
              });

              if (maxDrop >= 4) {
                rankSlips.push({
                  name: currStudent.name,
                  laggingSubject: laggingSubject,
                  dropAmount: Math.round(maxDrop),
                  currentMark: currStudent.marks[laggingSubject],
                });
              }
            }
          });
        }

        // 3. Phoenix Stars Recovery Array Parser
        let phoenixStars = [];
        computedProfiles.forEach((currStudent) => {
          const studentPast = pastRecords.filter(
            (p) => (p.Name || p.name) === currStudent.name,
          );
          if (studentPast.length > 0) {
            let wasFailingInPast = false;
            let recoveredSubjects = [];

            subjects.forEach((sub) => {
              const pastFailsCount = studentPast.filter(
                (p) => getStudentMark(p, sub) <= 35,
              ).length;
              if (pastFailsCount > 0 && currStudent.marks[sub] > 45) {
                wasFailingInPast = true;
                recoveredSubjects.push(
                  `${sub} (${currStudent.marks[sub]} Marks)`,
                );
              }
            });

            if (wasFailingInPast && recoveredSubjects.length > 0) {
              phoenixStars.push({
                name: currStudent.name,
                details: recoveredSubjects.join(", "),
              });
            }
          }
        });

        // Compute Structural Blind Spots Context
        computedProfiles.forEach((student) => {
          const past = pastRecords.filter(
            (h) => (h.Name || h.name) === student.name,
          );
          if (past.length > 0) {
            subjects.forEach((sub) => {
              const subPastAvg =
                past.reduce((acc, curr) => acc + getStudentMark(curr, sub), 0) /
                past.length;
              const currentSubMark = student.marks[sub];
              if (subPastAvg - currentSubMark > 15) {
                blindSpotGroup[sub].push({
                  name: student.name,
                  drop: (subPastAvg - currentSubMark).toFixed(0),
                });
              }
            });
          }
        });

        const focusSubjects = subjects.filter(
          (sub) => subjectStats[sub].failCount >= 3,
        );

        setAnalysis({
          borderlineGroup,
          criticalGroup,
          blindSpotGroup,
          goldenBatch,
          focusSubjects,
          rankSlips,
          phoenixStars,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAndAnalyze();
  }, [isOpen, recordId]);

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="bg-white border-4 border-cyan-100 rounded-[2.5rem] p-10 flex flex-col items-center gap-8 shadow-2xl relative overflow-hidden group">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="bg-cyan-600 p-6 rounded-full shadow-lg relative z-10"
          >
            <BrainCircuit className="text-white animate-pulse" size={48} />
          </motion.div>

          <div className="text-center relative z-10">
            <p className="text-[11px] font-black text-cyan-600 uppercase tracking-[0.4em]">
              Teacher AI Assistant
            </p>
            <p className="text-2xl font-black italic uppercase text-slate-800 mt-2">
              Re-Analyzing Metrics Layers...
            </p>
          </div>

          <div className="space-y-3 text-center w-full max-w-sm relative z-10">
            <p className="text-sm font-bold text-slate-500 italic">
              {loadingSteps[loadingStep] || "Processing Data Maps..."}
            </p>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-600 rounded-full transition-all duration-300"
                style={{
                  width: `${(loadingStep / (loadingSteps.length - 1)) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const rankShadows = [
    "shadow-amber-100",
    "shadow-slate-100",
    "shadow-amber-100/50",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <div className="bg-[#fcfcfd] w-full max-w-[1300px] max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col border border-white">
        {/* Header Section */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="bg-cyan-600 p-3 rounded-2xl text-white shadow-lg">
              <BrainCircuit size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase italic">
                Teacher AI Intelligence
              </h3>
              <p className="text-cyan-600 font-bold text-[10px] uppercase tracking-widest">
                Flow Analysis Modal: {examName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-50 rounded-full transition-all text-slate-300 hover:text-red-500"
          >
            <X size={24} />
          </button>
        </div>

        {analysis ? (
          <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
            {/* Golden Batch Header Segment Grid block */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.8fr,1.2fr] gap-10">
              <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                  <Trophy size={14} className="text-amber-500" /> Current Exam
                  Golden Batch (Top 3 Toppers)
                </p>

                <div className="grid grid-cols-3 gap-5 mt-6 relative z-10">
                  {analysis.goldenBatch.length > 0 ? (
                    analysis.goldenBatch.map((s, i) => (
                      <div
                        key={i}
                        className={`bg-gradient-to-br from-white via-amber-50/30 to-white border border-amber-100 p-5 rounded-[2rem] flex flex-col items-center gap-4 ${rankShadows[i]} shadow-lg`}
                      >
                        <div className="relative">
                          <div className="h-14 w-14 bg-white border-2 border-amber-200 rounded-full flex items-center justify-center font-black text-amber-600 text-xl shadow-inner">
                            {s.name ? s.name.charAt(0) : "S"}
                          </div>
                          <div className="absolute -left-1 -bottom-1 bg-white px-2 py-0.5 rounded-full font-black text-[9px] text-amber-600 border border-amber-100">
                            Rank {i + 1}
                          </div>
                        </div>
                        <div className="text-center w-full truncate">
                          <p className="text-xs font-black text-slate-800 truncate">
                            {s.name}
                          </p>
                          <span className="block text-[10px] bg-white text-amber-600 px-2 py-0.5 rounded-lg font-black mt-2 border border-amber-100">
                            {s.avg}% Avg
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="col-span-3 text-center text-slate-400 italic py-10">
                      No records calculated.
                    </p>
                  )}
                </div>
              </div>

              {/* Priority Panel Context display layout box */}
              <div className="space-y-6">
                <div className="bg-red-50 border border-red-100 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden">
                  <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em]">
                    Priority Attention Required
                  </p>
                  <div className="flex flex-wrap gap-2 mt-5">
                    {analysis.focusSubjects.length > 0 ? (
                      analysis.focusSubjects.map((sub, i) => (
                        <span
                          key={i}
                          className="bg-red-500 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-inner"
                        >
                          {sub}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-green-600 font-bold italic mt-4">
                        All subjects normalized nicely! 🎉
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Module Segment */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Performance Slips Tracking element card */}
              <div className="bg-white border-2 border-slate-100 p-6 rounded-[2.5rem] shadow-sm">
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <TrendingDown size={14} /> Toppers Performance Slippage (Lag
                  Tracker)
                </p>
                <div className="space-y-3">
                  {analysis.rankSlips.length > 0 ? (
                    analysis.rankSlips.map((st, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-3.5 bg-rose-50/40 rounded-xl border border-rose-100/70"
                      >
                        <div>
                          <p className="text-xs font-black text-slate-800">
                            {st.name}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Lagging Subject field:{" "}
                            <span className="text-rose-600 font-bold uppercase text-[10px] bg-rose-100/50 px-1.5 py-0.5 rounded">
                              {st.laggingSubject}
                            </span>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black text-white bg-rose-500 px-2 py-0.5 rounded-md">
                            -{st.dropAmount} Marks Drop
                          </span>
                          <p className="text-[10px] text-slate-400 mt-1 font-bold">
                            Current Mark: {st.currentMark}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic py-6 text-center">
                      Top 5 benchmark performers are maintaining high consistent
                      grades! ⚡
                    </p>
                  )}
                </div>
              </div>

              {/* Phoenix stars tracking cluster block layout view */}
              <div className="bg-white border-2 border-slate-100 p-6 rounded-[2.5rem] shadow-sm">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Award size={14} className="text-emerald-500" /> Phoenix
                  Rising Stars (Fails to Pass Appreciations)
                </p>
                <div className="space-y-3">
                  {analysis.phoenixStars.length > 0 ? (
                    analysis.phoenixStars.map((st, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-3.5 bg-emerald-50/40 rounded-xl border border-emerald-100/70"
                      >
                        <div className="h-8 w-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-black text-xs shadow">
                          🎉
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-black text-slate-800">
                            {st.name}
                          </p>
                          <p className="text-[11px] text-emerald-700 font-bold italic mt-0.5">
                            Incredible jump in: {st.details}
                          </p>
                        </div>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded uppercase">
                          Bounce Back!
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic py-6 text-center">
                      No baseline failure jumps tracked inside this test cycle
                      execution.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Standard Metrics Subject Accordions layer wrapper view template */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <SubjectAccordion
                title="Priority Support (Fails)"
                data={analysis.criticalGroup}
                icon={AlertCircle}
                colorClass="text-red-500"
                type="crit"
                expanded={expandedSection}
                setExpanded={setExpandedSection}
              />
              <SubjectAccordion
                title="High Potential (Borderline)"
                data={analysis.borderlineGroup}
                icon={Zap}
                colorClass="text-cyan-500"
                type="bord"
                expanded={expandedSection}
                setExpanded={setExpandedSection}
              />
              <SubjectAccordion
                title="Sudden Drops (Blind Spots)"
                data={analysis.blindSpotGroup}
                icon={TrendingDown}
                colorClass="text-amber-500"
                type="blind"
                expanded={expandedSection}
                setExpanded={setExpandedSection}
              />
            </div>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
};

export default AIAnalysisModal;
