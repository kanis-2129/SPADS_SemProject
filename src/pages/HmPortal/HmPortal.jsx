import React, { useState, useEffect, useMemo } from "react";
import { db, auth } from "../teachers/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardFilter from "../HmPortal/hmPortalFilter";
import HMSidebar from "./components/hmSideBar";
import {
  ExamTrendChart,
  PassFailDonut,
  SchoolYearlyTrendChart,
} from "./components/HmCharts";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  GraduationCap,
  ArrowLeft,
  UserCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// --- NEW COMPONENT FOR YEARLY TREND ---

const HMDashboard = () => {
  console.log("HM Dashboard Rendered")
  const navigate = useNavigate();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [filters, setFilters] = useState({
    academicYear: "All",
    className: "All",
    examName: "All",
    section: "All",
  });

  const standardizeValue = (val) => {
    if (!val) return "";
    return String(val)
      .toLowerCase()
      .replace(/th/g, "")
      .replace(/\s+/g, "")
      .trim()
      .toUpperCase();
  };

  useEffect(() => {
    const unsubMarks = onSnapshot(
      collection(db, "students_marks"),
      (snapshot) => {
        setAllStudents(
          snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() })),
        );
      },
    );

    const unsubTeacherClasses = onSnapshot(
      collection(db, "teacher_classes"),
      (snapshot) => {
        setTeacherClasses(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
        );
      },
    );

    const q = query(collection(db, "users"), where("role", "==", "teacher"));
    const unsubStaff = onSnapshot(q, (snapshot) => {
      setAllStaff(snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() })));
    });

    return () => {
      unsubMarks();
      unsubStaff();
      unsubTeacherClasses();
    };
  }, []);

  const extractSectionFromData = (d) => {
    if (d.section) return d.section;
    const regNo =
      d["Reg.no"] ||
      d.RegNo ||
      d.regNo ||
      d.uid ||
      d["Reg No"] ||
      d["Reg.No"] ||
      d["Reg.no"];
    const m = String(regNo || "").match(/10([A-Z])/);
    return m ? m[1] : null;
  };

  const staffStats = useMemo(() => {
    let teachersOnly = allStaff.filter((s) => s.role === "teacher");
    if (filters.className !== "All") {
      teachersOnly = teachersOnly.filter((s) => {
        const tClass = s.class || s.assignedClass || s.className || "";
        return standardizeValue(tClass) === standardizeValue(filters.className);
      });
    }
    if (filters.section !== "All") {
      teachersOnly = teachersOnly.filter((s) => {
        const tSection = s.section || s.assignedSection || "";
        return standardizeValue(tSection) === standardizeValue(filters.section);
      });
    }
    return {
      total: teachersOnly.length,
      men: teachersOnly.filter((s) => s.gender?.toLowerCase() === "male")
        .length,
      women: teachersOnly.filter((s) => s.gender?.toLowerCase() === "female")
        .length,
    };
  }, [allStaff, filters.className, filters.section]);

  const filteredData = useMemo(() => {
    return allStudents.filter((d) => {
      const studentYear = String(d.year || d.academicYear || "").trim();
      const matchesYear =
        filters.academicYear === "All" ||
        studentYear === String(filters.academicYear).trim();
      const matchesClass =
        filters.className === "All" ||
        standardizeValue(d.className) === standardizeValue(filters.className);
      const matchesSection =
        filters.section === "All" ||
        standardizeValue(extractSectionFromData(d)) ===
          standardizeValue(filters.section);
      const matchesExam =
        filters.examName === "All" || d.examName === filters.examName;
      return matchesYear && matchesClass && matchesSection && matchesExam;
    });
  }, [allStudents, filters]);

  const leaderboardData = useMemo(() => {
    const examFilteredStudents = allStudents.filter((s) => {
      const matchesExam =
        filters.examName === "All" || s.examName === filters.examName;
      const matchesYear =
        filters.academicYear === "All" ||
        String(s.year || s.academicYear || "")
          .trim()
          .toLowerCase() === String(filters.academicYear).trim().toLowerCase();
      const matchesClass =
        filters.className === "All" ||
        standardizeValue(s.className) === standardizeValue(filters.className);
      const matchesSection =
        filters.section === "All" ||
        standardizeValue(s.section || extractSectionFromData(s)) ===
          standardizeValue(filters.section);
      return matchesExam && matchesYear && matchesClass && matchesSection;
    });

    const studentTotals = examFilteredStudents.map((s) => {
      const totalMarks =
        s.Total ||
        Number(s.Tamil || 0) +
          Number(s.English || 0) +
          Number(s.Maths || 0) +
          (Number(s.Science) ||
            Number(s.Science_Theory || 0) + Number(s.Science_Practical || 0)) +
          Number(s.Social || 0);
      return {
        ...s,
        calculatedTotal: totalMarks,
        displayName: s.Name || s.name || s.StudentName || "No Name",
        section: s.section || extractSectionFromData(s) || "-",
      };
    });

    const groups = {};
    studentTotals.forEach((s) => {
      let groupKey = "";
      if (filters.className === "All") groupKey = standardizeValue(s.className);
      else if (filters.section === "All") {
        if (
          standardizeValue(s.className) === standardizeValue(filters.className)
        )
          groupKey = standardizeValue(s.section);
      } else {
        if (
          standardizeValue(s.className) ===
            standardizeValue(filters.className) &&
          standardizeValue(s.section) === standardizeValue(filters.section)
        )
          groupKey = "SINGLE_TOPPER";
      }

      if (groupKey) {
        if (
          !groups[groupKey] ||
          s.calculatedTotal > groups[groupKey].topScore
        ) {
          groups[groupKey] = {
            groupName:
              groupKey === "SINGLE_TOPPER"
                ? `${s.className} - ${s.section} Topper`
                : filters.className === "All"
                  ? `Class ${groupKey}`
                  : `Section ${groupKey}`,
            topperName: s.displayName,
            finalTotal: s.calculatedTotal,
            fullClass: s.className,
            fullSection: s.section,
            topScore: s.calculatedTotal,
          };
        }
      }
    });
    return Object.values(groups).sort((a, b) => b.finalTotal - a.finalTotal);
  }, [allStudents, filters]);

  const analytics = useMemo(() => {
    const subjects = ["Tamil", "English", "Maths", "Science", "Social Science"];
    const studentMap = new Map();
    const yearlyGroups = {};

    teacherClasses.forEach((cls) => {
      const year = String(cls.year || "").trim();

      if (!year) return;

      if (!yearlyGroups[year]) {
        yearlyGroups[year] = {
          year,
          totalPoints: 0,
          count: 0,
        };
      }

      // Match corresponding student marks
      const relatedStudents = allStudents.filter(
        (s) =>
          standardizeValue(s.className) === standardizeValue(cls.className) &&
          standardizeValue(s.section || extractSectionFromData(s)) ===
            standardizeValue(cls.section),
      );

      relatedStudents.forEach((row) => {
        subjects.forEach((sub) => {
          let mark =
            sub === "Science"
              ? Number(row.Science) ||
                Number(row.Science_Theory || 0) +
                  Number(row.Science_Practical || 0)
              : Number(row[sub] || 0);

          if (!isNaN(mark) && mark > 0) {
            yearlyGroups[year].totalPoints += mark;
            yearlyGroups[year].count++;
          }
        });
      });
    });

    const schoolYearTrend = Object.values(yearlyGroups)
      .map((item) => ({
        year: item.year,
        Average: item.count > 0 ? Math.round(item.totalPoints / item.count) : 0,
      }))
      .sort((a, b) => a.year.localeCompare(b.year));

    // 2. Process Filtered Data
    filteredData.forEach((row) => {
      const key =
  row.RegNo ||
  row.regNo ||
  row["Reg.no"] ||
  row["Reg No"] ||
  row["Reg.No"] ||
  `${row.Name || row.name || row.StudentName}-${row.className}-${row.section || extractSectionFromData(row)}`;
      if (!studentMap.has(key)) {
        studentMap.set(key, {
          totalMarks: 0,
          totalCount: 0,
          hasFail: false,
          subjects: {},
        });
      }
      const student = studentMap.get(key);
      subjects.forEach((sub) => {
        let mark =
          sub === "Science"
            ? Number(row.Science) ||
              Number(row.Science_Theory || 0) +
                Number(row.Science_Practical || 0)
            : Number(row[sub] || 0);
        if (!isNaN(mark) && mark > 0) {
          student.totalMarks += mark;
          student.totalCount++;
          if (!student.subjects[sub]) student.subjects[sub] = [];
          student.subjects[sub].push(mark);
          if (mark < 35) student.hasFail = true;
        }
      });
    });

    const processedStudents = [...studentMap.values()];
    const totalStudents = processedStudents.length;
    const failCount = processedStudents.filter((s) => s.hasFail).length;

    const subjectData = subjects.map((sub) => {
      let t = 0,
        a = 0,
        b = 0;
      processedStudents.forEach((student) => {
        const marks = student.subjects[sub] || [];
        const avg =
          marks.length > 0
            ? marks.reduce((x, y) => x + y, 0) / marks.length
            : 0;
        if (avg >= 80) t++;
        else if (avg >= 35) a++;
        else if (avg > 0) b++;
      });
      return { subject: sub, Toppers: t, Average: a, Bottom: b };
    });

    // Exam Trend Logic
    const examGroups = {};
    filteredData.forEach((row) => {
      const exam = row.examName || "Exam";
      const category =
        filters.className === "All"
          ? row.className || "Unknown"
          : row.section || "-";
      const key = `${exam}-${category}`;
      if (!examGroups[key])
        examGroups[key] = { exam, category, total: 0, count: 0 };
      subjects.forEach((sub) => {
        let mark =
          sub === "Science"
            ? Number(row.Science) ||
              Number(row.Science_Theory || 0) +
                Number(row.Science_Practical || 0)
            : Number(row[sub] || 0);
        if (!isNaN(mark) && mark > 0) {
          examGroups[key].total += mark;
          examGroups[key].count++;
        }
      });
      console.log(
        "Students:",
        filteredData.map(
          (s) =>
            `${s.Name} | ${s.className} | ${
              s.section || extractSectionFromData(s)
            } | ${s.examName}`,
        ),
      );
    });

    const chartMap = {};
    Object.values(examGroups).forEach((item) => {
      if (!chartMap[item.exam]) chartMap[item.exam] = { exam: item.exam };
      chartMap[item.exam][item.category] =
        item.count > 0 ? Math.round(item.total / item.count) : 0;
    });

    return {
      schoolYearTrend,
      subjectData,
      schoolStats: {
        totalStudents,
        overallPassPercent:
          totalStudents > 0
            ? Math.round(((totalStudents - failCount) / totalStudents) * 100)
            : 0,
        criticalCount: failCount,
      },
      examTrend: Object.values(chartMap),
    };
  }, [filteredData, allStudents, teacherClasses, filters.className]);

  const handleLogout = () =>
    signOut(auth).then(() => navigate("/teacher-login"));

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans relative overflow-hidden">
      <HMSidebar
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        navigate={navigate}
        staffCount={staffStats.total}
        handleLogout={handleLogout}
        activePath={location.pathname}
      />

      <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <header className="flex flex-wrap justify-between items-center gap-4 mb-10 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg"
            >
              <GraduationCap size={28} />
            </button>
            <div>
              <h2 className="text-2xl font-black text-slate-800 italic uppercase">
                HM Command Center
              </h2>
              <p className="text-slate-400 font-bold text-[10px] tracking-widest uppercase">
                Academic Excellence Dashboard
              </p>
            </div>
          </div>
          <DashboardFilter
            allData={allStudents}
            filters={filters}
            setFilters={setFilters}
          />
        </header>

        <div className="flex flex-wrap gap-4 mb-10">
          <StatCard
            icon={<Users size={20} />}
            title="Total Students"
            value={analytics.schoolStats.totalStudents}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard
            icon={<Users size={20} />}
            title="Total Staffs"
            value={staffStats.total}
            color="text-indigo-600"
            bg="bg-indigo-50"
          />
          <StatCard
            icon={<UserCircle size={20} />}
            title="Men / Women"
            value={`${staffStats.men} / ${staffStats.women}`}
            color="text-purple-600"
            bg="bg-purple-50"
          />
          <StatCard
            icon={<TrendingUp size={20} />}
            title="Pass Rate"
            value={`${analytics.schoolStats.overallPassPercent}%`}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <StatCard
            icon={<AlertTriangle size={20} />}
            title="At Risk"
            value={analytics.schoolStats.criticalCount}
            color="text-rose-600"
            bg="bg-rose-50"
          />
        </div>

        {/* 1. Subject Chart */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 mb-10">
          <h3 className="text-xl font-black mb-8 border-l-4 border-indigo-500 pl-4 uppercase italic text-slate-800">
            Subject Wise Performance
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={analytics.subjectData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis dataKey="subject" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "#f8fafc" }} />
              <Bar
                name="Toppers"
                dataKey="Toppers"
                fill="#4f46e5"
                radius={[6, 6, 0, 0]}
                barSize={20}
              />
              <Bar
                name="Average"
                dataKey="Average"
                fill="#38bdf8"
                radius={[6, 6, 0, 0]}
                barSize={20}
              />
              <Bar
                name="Bottom"
                dataKey="Bottom"
                fill="#fbbf24"
                radius={[6, 6, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
          {/* 2. Leaderboard */}
          <div className="overflow-x-auto">
            <h3 className="text-xl font-black mb-8 border-l-4 border-indigo-500 pl-4 uppercase italic text-slate-800">
              {filters.examName !== "All" ? `${filters.examName} - ` : ""}
              {filters.className === "All"
                ? "Grade Toppers"
                : "Section Wise Leaders"}
            </h3>
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase tracking-widest font-black">
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Topper Name</th>
                  <th className="px-6 py-4 text-right">Total Marks</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((item, idx) => (
                  <tr
                    key={idx}
                    className="bg-slate-50/50 hover:bg-white hover:shadow-md transition-all"
                  >
                    <td className="px-6 py-4">
                      <span className="bg-indigo-600 text-white px-3 py-1 rounded-lg font-black text-xs">
                        {filters.className === "All"
                          ? `Grade ${item.groupName}`
                          : `Grade ${item.fullClass}-Sec ${item.fullSection}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-700 text-base uppercase">
                      {item.topperName}
                    </td>
                    <td className="px-6 py-4 text-right text-indigo-600 font-black text-xl">
                      {item.finalTotal}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 3. Pass/Fail Donut */}
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center">
            <PassFailDonut
              passCount={
                analytics.schoolStats.totalStudents -
                analytics.schoolStats.criticalCount
              }
              failCount={analytics.schoolStats.criticalCount}
            />
          </div>
        </div>

        {/* 4. Exam Trend */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 min-h-[350px] mb-10">
          <h3 className="text-lg font-black text-slate-800 mb-6 uppercase italic">
            Exam Trend
          </h3>
          <ExamTrendChart data={analytics.examTrend} />
        </div>

        {/* 5. Yearly Trend (New Added) */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 min-h-[350px]">
          <SchoolYearlyTrendChart data={analytics.schoolYearTrend} />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color, bg }) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex-1 min-w-[180px]">
    <div
      className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center mb-4 shadow-sm`}
    >
      {icon}
    </div>
    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
      {title}
    </p>
    <p className="text-2xl font-black text-slate-800 tracking-tight">{value}</p>
  </div>
);

export default HMDashboard;
