import React, { useState, useMemo } from "react";
import { Filter, X, RotateCcw } from "lucide-react";

// Standardize values (Remove 'th', spaces, etc.)
const standardizeValue = (val) => {
  if (!val) return "";
  return String(val).toLowerCase().replace(/th/g, "").replace(/\s+/g, "").trim().toUpperCase();
};

const HMFilters = ({ allData = [], filters, setFilters }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Helper to get section
  const extractSection = (d) => {
    if (d.section) return d.section;
    const regNo = d["Reg.no"] || d.RegNo || d.regNo || d["Reg No"] || d["Reg.No"] || d["Reg.no"];
    const m = String(regNo || "").match(/10([A-Z])/);
    return m ? m[1] : null;
  };

  // 1. Available Classes (Eppovum ella classes-um kaatum)
  const classes = useMemo(() => {
    return [...new Set(allData.map(d => standardizeValue(d.className)).filter(Boolean))].sort();
  }, [allData]);

  // 2. DEPENDENT SECTIONS: Select panna class-la enna sections iruko adhu mattum dhaan varum
  const sections = useMemo(() => {
    let filteredForSections = allData;
    if (filters.className !== "All") {
      filteredForSections = allData.filter(d => standardizeValue(d.className) === standardizeValue(filters.className));
    }
    return [...new Set(filteredForSections.map(d => standardizeValue(extractSection(d))).filter(Boolean))].sort();
  }, [allData, filters.className]);

  // 3. DEPENDENT EXAMS: Selected Class & Section-ku ulla exams mattum
  const exams = useMemo(() => {
    let dataForExams = allData;

    if (filters.className !== "All") {
      dataForExams = dataForExams.filter(d => standardizeValue(d.className) === standardizeValue(filters.className));
    }
    if (filters.section !== "All") {
      dataForExams = dataForExams.filter(d => standardizeValue(extractSection(d)) === standardizeValue(filters.section));
    }

    return [...new Set(dataForExams.map(d => d.examName).filter(Boolean))].sort();
  }, [allData, filters.className, filters.section]);

  const resetAll = () => {
    setFilters({ academicYear: "All", className: "All", section: "All", examName: "All" });
  };

  return (
    <>
      {/* Filter Button */}
      <button 
        onClick={() => setIsOpen(true)} 
        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-slate-700 shadow-sm hover:shadow-md transition-all active:scale-95"
      >
        <Filter size={18} className="text-indigo-600" /> Filter Insights
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-opacity" onClick={() => setIsOpen(false)} />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-85 bg-white z-[101] shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-8 flex flex-col h-full">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase italic leading-none">Filters</h3>
              <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-1 uppercase">Refine your view</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
               <X size={24} className="text-slate-400" />
            </button>
          </div>

          <div className="space-y-8 overflow-y-auto flex-1 pr-2 custom-scrollbar">
            {/* Class Filter */}
            <FilterGroup 
              label="Grade / Class" 
              options={classes} 
              value={filters.className} 
              onChange={(v) => setFilters({...filters, className: v, section: "All", examName: "All"})} 
            />
            
            {/* Section Filter (Dependent on Class) */}
            <FilterGroup 
              label="Section" 
              options={sections} 
              value={filters.section} 
              onChange={(v) => setFilters({...filters, section: v, examName: "All"})} 
              isDisabled={filters.className === "All"}
            />
            
            {/* Exam Filter (Dependent on Class & Section) */}
            <FilterGroup 
              label="Exam Type" 
              options={exams} 
              value={filters.examName} 
              onChange={(v) => setFilters({...filters, examName: v})} 
            />
          </div>

          {/* Reset Button */}
          <button 
            onClick={resetAll} 
            className="mt-8 py-4 bg-rose-50 hover:bg-rose-100 text-rose-500 font-black rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <RotateCcw size={16} /> Reset All Filters
          </button>
        </div>
      </div>
    </>
  );
};

const FilterGroup = ({ label, options, value, onChange, isDisabled = false }) => (
  <div className={isDisabled ? "opacity-40 pointer-events-none" : ""}>
    <label className="text-[10px] font-black text-slate-400 uppercase mb-4 block tracking-[0.2em]">{label}</label>
    <div className="flex flex-wrap gap-2">
      <button 
        onClick={() => onChange("All")} 
        className={`px-4 py-2.5 rounded-xl text-xs font-black border transition-all ${value === "All" ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-white border-slate-200 text-slate-500 hover:border-indigo-300"}`}
      >
        ALL
      </button>
      {options.map(opt => (
        <button 
          key={opt} 
          onClick={() => onChange(opt)} 
          className={`px-4 py-2.5 rounded-xl text-xs font-black border transition-all ${value === opt ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"}`}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

export default HMFilters;