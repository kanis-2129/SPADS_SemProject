import React, { useMemo } from "react";
import { Sparkles, TrendingUp, AlertCircle, Target, Users } from "lucide-react";

const AIInsights = ({ allData, filters }) => {
  
  const insights = useMemo(() => {
    if (!allData || allData.length === 0) return null;

    // 1. FILTER DATA
    let filtered = [...allData];
    if (filters.studentName !== "All") {
      filtered = filtered.filter(d => (d.Name || d["Student Name"]) === filters.studentName);
    }
    if (filters.examName !== "All") {
      filtered = filtered.filter(d => d.examName === filters.examName);
    }

    // 2. ANALYZE SUBJECT OR CLASS
    const subject = filters.subject;
    const isAllSubjects = subject === "All";

    const getAnalysis = () => {
      const marks = filtered.map(d => parseFloat(d[subject] || 0)).filter(m => !isNaN(m));
      const avg = marks.reduce((a, b) => a + b, 0) / (marks.length || 1);
      const passCount = marks.filter(m => m >= 35).length;
      const failCount = marks.length - passCount;
      const passPercentage = (passCount / (marks.length || 1)) * 100;

      // AI Logic for Comments
      let status = "NORMAL";
      let comment = "";
      let action = "";

      if (passPercentage > 90) {
        status = "EXCELLENT";
        comment = `The class is performing exceptionally well in ${subject}.`;
        action = "Focus on sustaining this momentum with advanced practice sets.";
      } else if (passPercentage < 50) {
        status = "CRITICAL";
        comment = `Immediate attention required in ${subject}. More than 50% students are below pass mark.`;
        action = "Plan remedial classes and simplify core concepts for better understanding.";
      } else {
        status = "STABLE";
        comment = `Performance in ${subject} is steady but has room for improvement.`;
        action = "Identify middle-performing students and provide targeted support.";
      }

      return { avg: avg.toFixed(1), passPercentage: passPercentage.toFixed(1), status, comment, action, failCount };
    };

    return getAnalysis();
  }, [allData, filters]);

  if (!insights) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {/* 🌟 AI SUMMARY CARD */}
      <div className="col-span-1 lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-cyan-500/20 p-2 rounded-xl">
              <Sparkles className="text-cyan-400" size={20} />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">AI Assistant Insights</span>
          </div>
          
          <h2 className="text-3xl font-black mb-4 leading-tight italic uppercase">
            {filters.subject !== "All" ? `${filters.subject} Performance Report` : "General Class Overview"}
          </h2>
          
          <p className="text-slate-300 font-medium leading-relaxed mb-8 max-w-xl">
            {insights.comment} Based on current trends, <span className="text-white font-bold">{insights.action}</span>
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
              <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Average Score</p>
              <p className="text-2xl font-black text-cyan-400">{insights.avg}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
              <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Pass Ratio</p>
              <p className="text-2xl font-black text-green-400">{insights.passPercentage}%</p>
            </div>
            {insights.failCount > 0 && (
              <div className="bg-red-500/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-red-500/20">
                <p className="text-[10px] uppercase font-black text-red-400 mb-1">At Risk</p>
                <p className="text-2xl font-black text-red-500">{insights.failCount} Students</p>
              </div>
            )}
          </div>
        </div>

        {/* Decorator */}
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px]" />
      </div>

      {/* 🚀 QUICK ACTION CARD */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Target className="text-slate-400" size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next Priority</span>
          </div>
          <h3 className="text-xl font-black text-slate-800 uppercase italic">Improvement Strategy</h3>
          <p className="text-slate-500 text-sm mt-4 font-medium leading-relaxed">
            AI recommends focusing on the <strong>bottom 20%</strong> of the class to push the overall average to 85% before the next exam.
          </p>
        </div>
        
        <button className="mt-8 w-full py-4 bg-cyan-50 text-cyan-600 font-black rounded-2xl hover:bg-cyan-600 hover:text-white transition-all uppercase tracking-tighter text-sm">
          Generate Study Plan
        </button>
      </div>
    </div>
  );
};

export default AIInsights;