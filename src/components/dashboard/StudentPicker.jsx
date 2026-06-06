import React, { useState, useEffect, useRef } from 'react';
import { Users, Search, X, CheckCircle2 } from 'lucide-react';

const StudentPicker = ({ allStudents, selectedStudent, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef(null);

  // Filter logic
  const filteredStudents = allStudents.filter(name => 
    name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Click outside panna list close aagum
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  return (
    <div className="relative mb-8 text-left" ref={wrapperRef}>
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 transition-all hover:shadow-md">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center">
               <Users size={20} className="text-cyan-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">Student Analysis</h3>
              {selectedStudent !== "All" ? (
                <div className="flex items-center gap-1 text-cyan-600 text-xs font-bold">
                  <CheckCircle2 size={12} /> Currently Tracking: {selectedStudent}
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Overall Class View</p>
              )}
            </div>
          </div>

          {/* Search Input Box */}
          <div className="relative w-full md:w-80">
            <div className="relative">
              <input 
                type="text"
                placeholder="Type student name..."
                value={searchTerm}
                onFocus={() => setShowResults(true)}
                className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-cyan-500 focus:bg-white outline-none transition-all shadow-inner"
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowResults(true);
                }}
              />
              <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
              
              {/* Clear Selection / Search */}
              {(searchTerm || selectedStudent !== "All") && (
                <button 
                  onClick={() => {
                    setSearchTerm("");
                    onSelect("All");
                    setShowResults(false);
                  }}
                  className="absolute right-3 top-3 p-1 hover:bg-slate-200 rounded-full transition-all"
                >
                  <X size={16} className="text-slate-500" />
                </button>
              )}
            </div>

            {/* AUTO-SUGGESTION LIST */}
            {showResults && searchTerm.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((name) => (
                    <button
                      key={name}
                      onClick={() => {
                        onSelect(name);
                        setSearchTerm(""); // Select pannathum search-ah clear panniduvom
                        setShowResults(false);
                      }}
                      className="w-full text-left px-5 py-3 hover:bg-cyan-50 flex items-center justify-between transition-all group"
                    >
                      <span className={`text-sm font-bold ${selectedStudent === name ? "text-cyan-600" : "text-slate-600"}`}>
                        {name}
                      </span>
                      <Users size={14} className="text-slate-300 group-hover:text-cyan-400" />
                    </button>
                  ))
                ) : (
                  <div className="px-5 py-4 text-xs text-slate-400 italic">No students found...</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Back to Overall */}
        {selectedStudent !== "All" && (
          <button 
            onClick={() => onSelect("All")}
            className="mt-4 text-[10px] font-black uppercase tracking-tighter text-cyan-600 hover:text-cyan-700 bg-cyan-50 px-3 py-1 rounded-lg"
          >
            ← Back to Overall Stats
          </button>
        )}
      </div>
    </div>
  );
};

export default StudentPicker;