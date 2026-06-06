import React, { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  TrendingUp,
  LayoutDashboard,
  AlertTriangle,
} from "lucide-react";

import StatCard from "../../components/dashboard/StatCard";
import AnalyticsCharts from "../../components/dashboard/AnalyticsCharts";
import AnalyticsSidebar from "../../components/dashboard/AnalyticsSidebar";

const EXCLUDE_KEYS = new Set([
  "id",
  "Name",
  "name",
  "RegNo",
  "regNo",
  "className",
  "classId",
  "summaryId",
  "examName",
  "fileName",
  "teacherUid",
  "createdAt",
  "timestamp",
  "year",
  "Total",
  "total",
  "allSubjects",
  "S.no",
  "S.No",
  "Rank",
  "rank",
  "Result",
  "result",
  "section",
  "Percent (%)",
  "Grade",
  "grade",
  "Grand Total",
  "Student Name",
]);

const normalizeName = (raw) =>
  String(raw || "")
    .trim()
    .toUpperCase()
    .replace(/\./g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getStudentKey = (row) => {
  const reg = row.RegNo || row.regNo;
  if (reg && String(reg).trim())
    return "REG_" + String(reg).trim().toUpperCase();
  const nm = row.Name || row.name || row["Student Name"];
  if (nm && String(nm).trim()) return "NAME_" + normalizeName(nm);
  return "UNKNOWN_" + (row.id || Math.random());
};

const getDisplayName = (row) =>
  row.Name ||
  row.name ||
  row["Student Name"] ||
  row.RegNo ||
  row.regNo ||
  "Unknown";

const getSubjectKeys = (row) =>
  Object.keys(row || {}).filter(
    (k) => !EXCLUDE_KEYS.has(k) && row[k] !== "" && !isNaN(Number(row[k])),
  );

const baseSubject = (key) => {
  let normalized = key
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .trim();

  // Spelling mistakes-ah inga handle pannalam
  const corrections = {
    sceince: "science",
    scince: "science",
    socialscience: "social",
    maths: "maths",
    math: "maths",
  };

  return corrections[normalized] || normalized;
};

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    examName: "All",
    studentName: "All",
    subject: "All",
    className: "All",
    section: "All",
  });
  const [stats, setStats] = useState({
    totalStudents: 0,
    avgMarks: 0,
    passPercentage: 0,
    focusNeeded: 0,
    topPerformers: [],
    lowPerformers: [],
  });
  const [charts, setCharts] = useState({ pie: [], bar: [] });

  const processStudentData = (rows, activeSubjects) => {
    const studentMap = new Map();

    rows.forEach((row) => {
      const key = getStudentKey(row);

      if (!studentMap.has(key)) {
        studentMap.set(key, {
          name: getDisplayName(row),
          totalMarks: 0,
          totalCount: 0,
          hasFail: false,
          subjects: {},
        });
      }

      const student = studentMap.get(key);

      activeSubjects.forEach((sub) => {
        Object.keys(row)
          .filter(
            (k) => baseSubject(k) === baseSubject(sub) && !EXCLUDE_KEYS.has(k),
          )
          .forEach((k) => {
            const val = Number(row[k]);

            if (!isNaN(val) && row[k] !== "" && row[k] !== null) {
              student.totalMarks += val;
              student.totalCount += 1;

              if (!student.subjects[sub]) {
                student.subjects[sub] = [];
              }

              student.subjects[sub].push(val);

              if (val < 35) {
                student.hasFail = true;
              }
            }
          });
      });
    });

    return [...studentMap.values()];
  };

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setLoading(false);
        return;
      }
      const q = query(
        collection(db, "students_marks"),
        where("teacherUid", "==", user.uid),
      );
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            setAllData([]);
            setLoading(false);
            return;
          }
          setAllData(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
          setLoading(false);
        },
        (err) => {
          console.error(err);
          setLoading(false);
        },
      );
      return () => unsubscribe();
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!allData.length) return;
    let rows = [...allData];
    if (filters.examName !== "All")
      rows = rows.filter((d) => d.examName === filters.examName);
    if (filters.className !== "All")
      rows = rows.filter(
        (d) => String(d.className || "") === filters.className,
      );
    if (filters.section !== "All")
      rows = rows.filter(
        (d) =>
          String(d.section || "").toUpperCase() ===
          filters.section.toUpperCase(),
      );
    if (filters.studentName !== "All")
      rows = rows.filter(
        (d) =>
          normalizeName(getDisplayName(d)) ===
          normalizeName(filters.studentName),
      );

    let allBaseSubjects = [
      ...new Set(rows.flatMap((d) => getSubjectKeys(d).map(baseSubject))),
    ];
    const activeSubjects =
      filters.subject !== "All"
        ? allBaseSubjects.filter((s) => s === filters.subject)
        : allBaseSubjects;
    const processedStudents = processStudentData(rows, activeSubjects);

    // --- Pass Ratio Calculation Start ---
    let totalSubjectAttempts = 0;
    let totalSubjectPasses = 0;
    let totalFailStudents = 0;

    const studentAverages = processedStudents.map((e) => {
      const avg =
        e.totalCount > 0 ? Math.round(e.totalMarks / e.totalCount) : 0;

      // Student-ku oru subject-la fail aanaalum, avan focusNeeded list-ku povan
      if (e.hasFail) totalFailStudents++;

      // Ovvoru mark-aiyum individual-ah check panni ratio edukkanum
      Object.values(e.subjects)
        .flat()
        .forEach((mark) => {
          totalSubjectAttempts++;
          if (mark >= 35) {
            totalSubjectPasses++;
          }
        });

      return {
        name: e.name,
        avg,
        isFail: e.hasFail,
        failedSubjects: Object.entries(e.subjects)
          .filter(([_, marks]) => marks.some((m) => Number(m) < 35))
          .map(([sub]) => sub),
      };
    });

    // Final Percent Calculation (NaN check-oda)
    const overallPassPercentage =
      totalSubjectAttempts > 0
        ? Math.round((totalSubjectPasses / totalSubjectAttempts) * 100)
        : 0;

    const totalStudentsInView = studentAverages.length;
    const passCount = studentAverages.filter((s) => !s.isFail).length;
    const failCount = studentAverages.filter((s) => s.isFail).length;

    const barData = activeSubjects.map((sub) => {
      let total = 0;
      let count = 0;

      processedStudents.forEach((student) => {
        const marks = student.subjects[sub] || [];

        marks.forEach((m) => {
          total += m;
          count++;
        });
      });

      return {
        name: sub,
        score: count > 0 ? Math.round(total / count) : 0,
      };
    });

    const examGroups = {};
    rows.forEach((d) => {
      const exam = d.examName || "Unknown";
      if (!examGroups[exam]) examGroups[exam] = { total: 0, count: 0 };

      activeSubjects.forEach((sub) => {
        Object.keys(d)
          .filter((k) => baseSubject(k) === sub && !EXCLUDE_KEYS.has(k))
          .forEach((k) => {
            const val = Number(d[k]);
            if (!isNaN(val) && d[k] !== "") {
              examGroups[exam].total += val;
              examGroups[exam].count += 1;
            }
          });
      });
    });

    const trendData = Object.keys(examGroups).map((name) => ({
      name,
      avg:
        examGroups[name].count > 0
          ? Math.round(examGroups[name].total / examGroups[name].count)
          : 0,
    }));

    const atRiskData = activeSubjects
      .map((sub) => {
        const failedCount = processedStudents.filter((student) => {
          const marks = student.subjects[sub] || [];

          return marks.some((m) => Number(m) < 35);
        }).length;

        return {
          name: sub,
          failedCount,
        };
      })
      .filter((d) => d.failedCount > 0);

    setStats({
      totalStudents: totalStudentsInView,
      avgMarks:
        totalStudentsInView > 0
          ? Math.round(
              studentAverages.reduce((a, b) => a + b.avg, 0) /
                totalStudentsInView,
            )
          : 0,
      passPercentage:
        totalStudentsInView > 0
          ? Math.round((passCount / totalStudentsInView) * 100)
          : 0,
      focusNeeded: failCount,
      topPerformers: studentAverages
        .filter((s) => s.avg >= 85)
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 5),
      lowPerformers: studentAverages
        .filter((s) => s.isFail)
        .sort((a, b) => a.avg - b.avg),
      passPercentage: overallPassPercentage,
      focusNeeded: totalFailStudents,
    });

    setCharts({
      pie: [
        { name: "Pass", value: overallPassPercentage },
        { name: "Fail", value: 100 - overallPassPercentage },
      ],
      bar: barData,
      trend: trendData,
      atRisk: atRiskData,
    });
  }, [filters, allData]);

  if (loading)
    return (
      <div className="p-10 font-bold text-center text-slate-500 italic">
        Analyzing Academic Data...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 text-left">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-200 rounded-full transition-all"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="text-3xl font-black text-slate-800">
                Workspace <span className="text-cyan-600">Insights</span>
              </h2>
              <p className="text-slate-500 font-medium text-sm italic">
                {allData.length > 0
                  ? `Monitoring ${stats.totalStudents} Students`
                  : "No data available"}
              </p>
            </div>
          </div>
          <AnalyticsSidebar
            allData={allData}
            filters={filters}
            setFilters={setFilters}
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            icon={<Users size={22} />}
            label="Total Strength"
            value={stats.totalStudents}
            color="text-blue-600"
          />
          <StatCard
            icon={<TrendingUp size={22} />}
            label="Avg Score"
            value={stats.avgMarks + "%"}
            color="text-emerald-600"
          />
          <StatCard
            icon={<LayoutDashboard size={22} />}
            label="Pass Ratio"
            value={stats.passPercentage + "%"}
            color="text-indigo-600"
          />
          <StatCard
            icon={<AlertTriangle size={22} />}
            label="Focus Needed"
            value={stats.focusNeeded}
            color="text-red-600"
          />
        </div>

        {allData.length > 0 ? (
          <>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-10">
              <AnalyticsCharts
                barData={charts.bar}
                pieData={charts.pie}
                trendData={charts.trend}
                atRiskData={charts.atRisk}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 italic">
                  🏆 Top Performers
                </p>
                {stats.topPerformers.map((s, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-4 bg-white shadow-sm border border-slate-100 rounded-2xl"
                  >
                    <span className="font-bold text-slate-700">{s.name}</span>
                    <span className="text-emerald-600 font-black">
                      {s.avg}%
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 italic">
                  ⚠️ Needs Attention (Failures)
                </p>
                {stats.lowPerformers.length === 0 ? (
                  <p className="p-4 text-emerald-500 font-bold text-sm">
                    Everyone is clear! 🎉
                  </p>
                ) : (
                  stats.lowPerformers.map((s, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-4 bg-white shadow-sm border border-slate-100 rounded-2xl"
                    >
                      <span className="font-bold text-slate-700">{s.name}</span>
                      <span className="text-rose-600 font-black">{s.avg}%</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 font-bold">
            No records found.
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
