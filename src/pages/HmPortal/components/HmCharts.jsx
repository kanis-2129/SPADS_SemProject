import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Line,
  LineChart,
} from "recharts";

// 1. Stacked Bar — Subject Pass/Fail
export const SubjectPassFailChart = ({ data }) => (
  <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
    <h3 className="text-xl font-black mb-6 text-slate-800 border-l-4 border-emerald-500 pl-4">
      Subject-wise Pass / Fail
    </h3>
    <ResponsiveContainer width="100%" height={340}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#f1f5f9"
        />
        <XAxis
          dataKey="subject"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#64748b", fontWeight: "bold" }}
        />
        <YAxis axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: "16px", border: "none" }} />
        <Legend verticalAlign="top" align="right" iconType="circle" />
        <Bar
          name="Pass"
          dataKey="Pass"
          fill="#10b981"
          stackId="a"
          barSize={32}
          radius={[0, 0, 0, 0]}
        />
        <Bar
          name="Fail"
          dataKey="Fail"
          fill="#f43f5e"
          stackId="a"
          barSize={32}
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// 2. Area Chart — Exam Trend
export const ExamTrendChart = ({ data }) => {
  const dynamicKeys =
    data.length > 0 ? Object.keys(data[0]).filter((key) => key !== "exam") : [];

  const colors = [
    "#4f46e5",
    "#06b6d4",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
  ];

  return (
    <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
      <h3 className="text-xl font-black mb-6 text-slate-800 border-l-4 border-indigo-500 pl-4">
        Exam-wise Performance Trend
      </h3>

      <ResponsiveContainer width="100%" height={340}>
        <LineChart
          data={data}
          /* Bottom margin-ai konjam ethunga */
          margin={{ top: 20, right: 30, left: 10, bottom: 25 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f1f5f9"
          />

          <XAxis
            dataKey="exam"
            axisLine={false}
            tickLine={false}
            /* dy={15} nu kudutha labels konjam keela irangum, zero line-oda ottathu */
            tick={{
              fill: "#64748b",
              fontWeight: "bold",
              fontSize: 12,
            }}
            dy={15}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
            /* dx={-10} kudutha labels left side konjam thalli nirkum */
            tick={{ fill: "#64748b" }}
            dx={-10}
          />

          <Tooltip
            contentStyle={{
              borderRadius: "16px",
              border: "none",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
            }}
          />

          <Legend
            verticalAlign="bottom"
            wrapperStyle={{ paddingTop: "20px" }} // Legend labels mela ottama irukka
          />

          {dynamicKeys.map((key, idx) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[idx % colors.length]}
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} // Points innum clear-ah theriyum
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// 3. Donut — Overall Pass/Fail
const COLORS = ["#10b981", "#f43f5e"];

export const PassFailDonut = ({ passCount, failCount }) => {
  const data = [
    { name: "Pass", value: passCount },
    { name: "Fail", value: failCount },
  ];
  const total = passCount + failCount;

  return (
    <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
      <h3 className="text-xl font-black mb-6 text-slate-800 border-l-4 border-rose-500 pl-4">
        Overall Pass / Fail Ratio
      </h3>
      <div className="relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: "16px", border: "none" }} />
            <Legend iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute text-center pointer-events-none">
          <p className="text-3xl font-black text-slate-800">
            {total > 0 ? Math.round((passCount / total) * 100) : 0}%
          </p>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
            Pass Rate
          </p>
        </div>
      </div>
    </div>
  );
};



export const SchoolYearlyTrendChart = ({ data }) => {
  return (
    <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-slate-800 border-l-4 border-indigo-500 pl-4 uppercase italic">
            School Academic Trend
          </h3>

          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.25em] ml-5 mt-2">
            YEAR OVER YEAR PERFORMANCE ANALYTICS
          </p>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-2xl">
          <div className="w-3 h-3 rounded-full bg-indigo-600 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider">
            Live Trend
          </span>
        </div>
      </div>

      {/* CHART */}
      <ResponsiveContainer width="100%" height={360}>
        <AreaChart
          data={data}
          margin={{ top: 20, right: 20, left: -10, bottom: 10 }}
        >
          {/* GRADIENT */}
          <defs>
            <linearGradient
              id="schoolTrendGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.35} />
              <stop offset="70%" stopColor="#6366f1" stopOpacity={0.08} />
              <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* GRID */}
          <CartesianGrid
            strokeDasharray="4 4"
            vertical={false}
            stroke="#e2e8f0"
          />

          {/* X AXIS */}
          <XAxis
            dataKey="year"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#64748b",
              fontWeight: 800,
              fontSize: 12,
            }}
            dy={12}
          />

          {/* Y AXIS */}
          <YAxis
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
            tick={{
              fill: "#94a3b8",
              fontWeight: 700,
              fontSize: 11,
            }}
            dx={-8}
          />

          {/* TOOLTIP */}
          <Tooltip
            cursor={{
              stroke: "#6366f1",
              strokeWidth: 1,
              strokeDasharray: "5 5",
            }}
            contentStyle={{
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.08)",
              padding: "14px",
            }}
            labelStyle={{
              fontWeight: 900,
              color: "#0f172a",
              marginBottom: "6px",
            }}
          />

          {/* AREA */}
          <Area
            type="monotone"
            dataKey="Average"
            stroke="none"
            fill="url(#schoolTrendGradient)"
            fillOpacity={1}
          />

          {/* MAIN TREND LINE */}
          <Line
            type="monotone"
            dataKey="Average"
            stroke="#4f46e5"
            strokeWidth={3}
            dot={{
              r: 6,
              fill: "#4f46e5",
              stroke: "#ffffff",
              strokeWidth: 3,
            }}
            activeDot={{
              r: 9,
              fill: "#4338ca",
              stroke: "#ffffff",
              strokeWidth: 4,
            }}
            name="School Avg %"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
