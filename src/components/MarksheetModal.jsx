import React, {  useMemo } from "react";
import { X, GraduationCap } from "lucide-react";

const MarksheetModal = ({ data = [], onClose, title = "" }) => {
  
  const getCleanVal = (val) => {
    const s = String(val || "");
    if (s.length > 20 || s.includes("x23nZ") || s === "undefined" || s === "null") return "0";
    return s.trim();
  };

  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...data].sort((a, b) => {
      const getVal = (obj) => {
        const k = Object.keys(obj).find(key => key.toLowerCase().replace(/\s|\./g, '') === 'sno');
        return parseInt(obj[k] || 0);
      };
      return getVal(a) - getVal(b);
    });
  }, [data]);

  // 🔥 SCIENCE SPLIT LOGIC: Identifying TH, PR, and TOT
  const finalHeaders = useMemo(() => {
    if (!sortedData.length) return [];

    const dbKeys = Object.keys(sortedData[0]);
    const systemFields = ["id", "classId", "summaryId", "examName", "fileName", "teacherUid", "createdAt", "year", "allSubjects", "timestamp"];
    
    const findKey = (target) => {
      return dbKeys.find(k => {
        const cleanK = k.toLowerCase().replace(/\s|\./g, '');
        const cleanT = target.toLowerCase().replace(/\s|\./g, '');
        return cleanK === cleanT;
      });
    };

    const orderTemplate = ["S.No", "Reg.No", "Name", "Tamil", "English", "Maths", "Science", "Social Science", "Total"];
    const result = [];
    const usedKeys = new Set();

    orderTemplate.forEach(t => {
      let match = findKey(t);
      
      if (t === "Science" && match) {
        const idx = dbKeys.indexOf(match);
        // Checking for split columns (Excel format)
        const isSplit = dbKeys[idx + 1]?.includes("__EMPTY") && dbKeys[idx + 2]?.includes("__EMPTY");
        
        if (isSplit) {
          result.push({ 
            label: "Science", 
            isScience: true,
            th: dbKeys[idx], 
            pr: dbKeys[idx + 1], 
            tot: dbKeys[idx + 2] 
          });
          usedKeys.add(dbKeys[idx]);
          usedKeys.add(dbKeys[idx + 1]);
          usedKeys.add(dbKeys[idx + 2]);
        } else {
          result.push({ label: match, dataKey: match });
          usedKeys.add(match);
        }
      } else if (match) {
        result.push({ label: match, dataKey: match });
        usedKeys.add(match);
      }
    });

    // Leftover keys (Result, Grade etc)
    dbKeys.forEach(k => {
      if (!usedKeys.has(k) && !systemFields.includes(k) && !k.includes("__EMPTY")) {
        result.push({ label: k, dataKey: k });
      }
    });

    return result;
  }, [sortedData]);

  if (!data || data.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
      <div className="bg-white w-full max-w-[96vw] p-6 rounded-[2.5rem] max-h-[95vh] flex flex-col shadow-2xl overflow-hidden border border-white/20">
        
        <div className="flex justify-between items-center mb-6 px-4">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-600 p-2.5 rounded-2xl shadow-lg shadow-cyan-100">
              <GraduationCap className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">{title}</h3>
              <p className="text-[10px] text-cyan-600 font-black uppercase mt-1 tracking-widest">9th & 10th Standard View</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 text-slate-400 hover:text-red-500 rounded-full transition-all">
            <X size={28} />
          </button>
        </div>

        <div className="overflow-auto border border-slate-200 rounded-[3rem] bg-white shadow-inner custom-scrollbar">
          <table className="w-full text-[12px] border-collapse">
            <thead className="bg-slate-900 text-white sticky top-0 z-20">
              <tr className="uppercase font-black italic">
                {finalHeaders.map((h) => (
                  <th key={h.label} 
                      colSpan={h.isScience ? 3 : 1}
                      rowSpan={h.isScience ? 1 : 2}
                      className={`p-4 border-r border-slate-800 text-center whitespace-nowrap
                        ${h.label.includes("Name") || h.label.includes("S.No") ? "sticky left-0 bg-slate-900 z-30" : ""}
                      `}
                  >
                    {h.label.replace("\r\n", " ")}
                  </th>
                ))}
              </tr>
              <tr className="bg-slate-800 text-[10px]">
                {finalHeaders.map(h => h.isScience ? (
                  <React.Fragment key="sci-sub">
                    <th className="p-2 border-r border-slate-700 text-slate-400">TH</th>
                    <th className="p-2 border-r border-slate-700 text-slate-400">PR</th>
                    <th className="p-2 text-cyan-400 font-black">TOT</th>
                  </React.Fragment>
                ) : null)}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {sortedData.map((row, idx) => (
                <tr key={idx} className="hover:bg-cyan-50/50 group transition-colors">
                  {finalHeaders.map((header) => {
                    if (header.isScience) {
                      return (
                        <React.Fragment key={'sci-data'+idx}>
                          <td className="p-3 text-center border-r border-slate-100">{getCleanVal(row[header.th])}</td>
                          <td className="p-3 text-center border-r border-slate-100">{getCleanVal(row[header.pr])}</td>
                          <td className="p-3 text-center font-bold text-cyan-700 bg-cyan-50/30 border-r border-slate-100">{getCleanVal(row[header.tot])}</td>
                        </React.Fragment>
                      )
                    }

                    const isName = header.label.toLowerCase().includes("name");
                    const isSno = header.label.toLowerCase().replace(/\s|\./g, '') === 'sno';
                    const isTotal = header.label.toLowerCase().includes("total");

                    return (
                      <td key={header.label + idx}
                        className={`p-4 border-r border-slate-100 text-center whitespace-nowrap
                          ${isSno ? "sticky left-0 bg-white group-hover:bg-cyan-50 font-bold text-slate-400 w-16" : ""}
                          ${isName ? "sticky left-[64px] bg-white group-hover:bg-cyan-50 text-left font-black text-slate-800 min-w-[220px] uppercase px-6" : ""}
                          ${isTotal ? "bg-cyan-50/50 font-black text-cyan-700" : "text-slate-600"}
                        `}
                      >
                        {getCleanVal(row[header.dataKey])}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MarksheetModal;