import { BarChart3, Cpu, AlertTriangle, ShieldAlert } from "lucide-react";
const Features = (props) => {
  return (
    <section
      ref={props.addToRefs}
      className="py-20 px-6 bg-slate-950 text-white rounded-t-[3rem] opacity-0 translate-y-16 transition-all duration-1000 ease-out"
    >
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">
            Key Architecture Framework
          </h2>
          <p className="text-slate-400 text-base md:text-lg">
            Designed specifically to meet the evaluation guidelines of secondary
            board parameters.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 hover:border-blue-500/40 transition-colors group">
            <div className="w-12 h-12 bg-blue-500/10 text-[#A9CCE3] rounded-xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all">
              <BarChart3 size={22} />
            </div>
            <h3 className="text-lg font-bold mb-2 text-slate-100">
              Analytical Dashboard
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Processes complex examination records into crisp visual reports.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 hover:border-orange-500/40 transition-colors group">
            <div className="w-12 h-12 bg-orange-500/10 text-[#F0B27A] rounded-xl flex items-center justify-center mb-6 border border-orange-500/20 group-hover:bg-orange-500 group-hover:text-white transition-all">
              <AlertTriangle size={22} />
            </div>
            <h3 className="text-lg font-bold mb-2 text-slate-100">
              At-Risk Evaluation
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Automatically tags students requiring focused review parameters.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 hover:border-purple-500/40 transition-colors group">
            <div className="w-12 h-12 bg-purple-500/10 text-purple-300 rounded-xl flex items-center justify-center mb-6 border border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white transition-all">
              <Cpu size={22} />
            </div>
            <h3 className="text-lg font-bold mb-2 text-slate-100">
              AI Intelligent Insights
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Leverages analytical algorithms to map cumulative student records.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 hover:border-emerald-500/40 transition-colors group">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-300 rounded-xl flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <ShieldAlert size={22} />
            </div>
            <h3 className="text-lg font-bold mb-2 text-slate-100">
              Role-Based Gateways
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Strict administrative security architecture dividing discrete
              accessibility.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Features;
