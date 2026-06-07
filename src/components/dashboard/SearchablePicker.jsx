import React, { useState } from "react";
import { Search, Check } from "lucide-react";

const SearchablePicker = ({ options, value, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          placeholder="Type student name..."
          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-cyan-500 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-50 p-1 space-y-1">
        <button 
          onClick={() => onSelect("All")}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${value === "All" ? "bg-cyan-600 text-white" : "hover:bg-slate-50 text-slate-500"}`}
        >
          All Students {value === "All" && <Check size={14} />}
        </button>
        
        {filteredOptions.map(student => (
          <button 
            key={student}
            onClick={() => onSelect(student)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${value === student ? "bg-cyan-600 text-white" : "hover:bg-slate-50 text-slate-600"}`}
          >
            {student} {value === student && <Check size={14} />}
          </button>
        ))}
        {filteredOptions.length === 0 && <p className="text-center py-4 text-[10px] text-slate-400 font-bold uppercase">No matching student</p>}
      </div>
    </div>
  );
};

export default SearchablePicker;