import React, { useState, useMemo } from "react";
import { Filter, X, Search } from "lucide-react";

// ─── HELPERS ────────────────────────────────
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
  "Section",
  "Percent (%)",
  "Grade",
  "grade",
  "Class",
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

const baseSubject = (key) => {
  let normalized = String(key || "")
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .trim();

  // If the parsed key is exactly "empty", discard it
  if (normalized === "empty") return null;

  const corrections = {
    sceince: "science",
    scince: "science",
    socialscience: "social",
    maths: "maths",
    math: "maths",
  };

  return corrections[normalized] || normalized;
};
const getSubjectKeys = (row) =>
  Object.keys(row || {}).filter(
    (k) => !EXCLUDE_KEYS.has(k) && row[k] !== "" && !isNaN(Number(row[k])),
  );

const getDisplayName = (row) =>
  row?.Name ||
  row?.name ||
  row?.["Student Name"] ||
  row?.RegNo ||
  row?.regNo ||
  "Unknown";

// ─────────────────────────────────────────────
const AnalyticsSidebar = ({ allData = [], filters, setFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const safeData = useMemo(
    () => (Array.isArray(allData) ? allData : []),
    [allData],
  );

  // 1. Dynamic Unique Classes
  // Fix 1: Full class name (10B, 10C etc.) extract பண்ண
  const allClasses = useMemo(() => {
    const classes = safeData
      .map((d) => (d.className ? String(d.className) : null))
      .filter(Boolean);
    return [...new Set(classes)].sort();
  }, [safeData]);

  const allSections = useMemo(() => {
    const sections = safeData
      .map((d) => d.section || d.Section || null)
      .filter(Boolean);
    return [...new Set(sections)].sort();
  }, [safeData]);
  // 3. Dynamic Unique Exams
  const allExams = useMemo(() => {
    return [...new Set(safeData.map((d) => d.examName).filter(Boolean))].sort();
  }, [safeData]);

  // 4. Dynamic Unique Subjects
 // 4. Dynamic Unique Subjects
  const allSubjects = useMemo(() => {
    const parsedSubjects = safeData
      .flatMap((d) => getSubjectKeys(d).map(baseSubject))
      .filter(Boolean); // Removes null, undefined, or empty strings

    return [...new Set(parsedSubjects)].sort();
  }, [safeData]);
  // 5. Unique Students
  const allStudents = useMemo(() => {
    const seen = new Map();
    safeData.forEach((d) => {
      const nm = getDisplayName(d);
      const key = normalizeName(nm);
      if (!seen.has(key)) seen.set(key, nm);
    });
    return [...seen.values()].sort();
  }, [safeData]);

  if (!filters) return null;

  const filteredStudents = allStudents.filter((s) =>
    s.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const resetFilters = () => {
    setFilters({
      examName: "All",
      studentName: "All",
      subject: "All",
      className: "All",
      section: "All",
    });
    setIsOpen(false);
  };

  const activeFilterCount = [
    filters?.examName !== "All",
    filters?.studentName !== "All",
    filters?.subject !== "All",
    filters?.className !== "All",
    filters?.section !== "All",
  ].filter(Boolean).length;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-slate-700 hover:border-cyan-500 shadow-sm transition-all"
      >
        <Filter size={18} className="text-cyan-600" />
        Filter Insights
        {activeFilterCount > 0 && (
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-cyan-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
            {activeFilterCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white z-[101] shadow-2xl transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800">
              Filter Insights
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-8 pr-1 custom-scrollbar text-left">
            <FilterSection label="Academic Grade">
              <ChipGroup
                options={allClasses}
                value={filters?.className || "All"}
                onChange={(val) => setFilters({ ...filters, className: val })}
              />
            </FilterSection>

            <FilterSection label="Section">
              <ChipGroup
                options={allSections}
                value={filters?.section || "All"}
                onChange={(val) => setFilters({ ...filters, section: val })}
              />
            </FilterSection>

            <FilterSection label="Exam Type">
              <ChipGroup
                options={allExams}
                value={filters?.examName || "All"}
                onChange={(val) => setFilters({ ...filters, examName: val })}
              />
            </FilterSection>

            <FilterSection label="Subject">
              <ChipGroup
                options={allSubjects}
                value={filters?.subject || "All"}
                onChange={(val) => setFilters({ ...filters, subject: val })}
              />
            </FilterSection>

            <FilterSection label="Student Name">
              <div className="relative mb-3">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search name..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm outline-none border border-transparent focus:border-cyan-500 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1 pr-2">
                <button
                  onClick={() => setFilters({ ...filters, studentName: "All" })}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${filters?.studentName === "All" ? "bg-cyan-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
                >
                  All Students
                </button>
                {filteredStudents.map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilters({ ...filters, studentName: s })}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${normalizeName(filters?.studentName) === normalizeName(s) ? "bg-cyan-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </FilterSection>
          </div>

          <button
            onClick={resetFilters}
            className="mt-6 w-full py-4 bg-red-50 text-red-500 font-bold rounded-2xl hover:bg-red-500 hover:text-white transition-all duration-300"
          >
            Clear All Filters
          </button>
        </div>
      </div>
    </>
  );
};

const FilterSection = ({ label, children }) => (
  <div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
      {label}
    </p>
    {children}
  </div>
);

const ChipGroup = ({ options, value, onChange }) => (
  <div className="flex flex-wrap gap-2">
    <Chip
      label="All"
      active={value === "All"}
      onClick={() => onChange("All")}
    />
    {options.map((opt) => (
      <Chip
        key={opt}
        label={opt}
        active={value === opt}
        onClick={() => onChange(opt)}
      />
    ))}
  </div>
);

const Chip = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
      active
        ? "bg-cyan-600 border-cyan-600 text-white shadow-sm"
        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
    }`}
  >
    {label}
  </button>
);

export default AnalyticsSidebar;
