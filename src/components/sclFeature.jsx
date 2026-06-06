import React from "react";
import { BookOpen, Users, Trophy, Heart } from "lucide-react";

const SclFeatures = () => {
  // 4 points-aiyum structured data-va mathi vachuruken
  const coreValues = [
    {
      icon: <BookOpen className="text-blue-600" size={24} />,
      title: "Academic Excellence",
      desc: "We follow the Tamil Nadu State Board curriculum with a strong focus on core concepts and board exam preparation.",
      bgColor: "bg-blue-50/50",
      borderColor: "hover:border-blue-200",
    },
    {
      icon: <Users className="text-purple-600" size={24} />,
      title: "Experienced Faculty",
      desc: "Our team of dedicated and qualified teachers is committed to mentoring students and guiding them toward success.",
      bgColor: "bg-purple-50/50",
      borderColor: "hover:border-purple-200",
    },
    {
      icon: <Trophy className="text-amber-600" size={24} />,
      title: "Holistic Development",
      desc: "Beyond textbooks, we encourage active participation in physical education, sports, cultural activities, and community service.",
      bgColor: "bg-amber-50/50",
      borderColor: "hover:border-amber-200",
    },
    {
      icon: <Heart className="text-emerald-600" size={24} />,
      title: "Inclusive Environment",
      desc: "As a proud government institution, we ensure that every child—regardless of their background—gets equal opportunities to learn, grow, and thrive.",
      bgColor: "bg-emerald-50/50",
      borderColor: "hover:border-emerald-200",
    },
  ];

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          Why Choose Our Institution?
        </h2>
      </div>

      {/* 4 Boxes Grid Layout */}
      {/* --- SclFeatures Card Mapping Line Replacement --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {coreValues.map((value, index) => (
          <div
            key={index}
            className={`p-6 md:p-8 bg-white rounded-3xl border border-pink-800 border-b-2 shadow-xl 
      transition-all duration-500 ease-out 
      hover:-translate-y-2 hover:shadow-2xl ${value.borderColor}
      transform translate-y-0 opacity-100 hover:bg-pink-200 hover:border-l-2 hover:border-pink-900 hover:border-b-0`} // Direct load visual assurance setup
        >
            {/* Icon and content goes here exactly as same before */}
            <div
              className={`w-12 h-12 ${value.bgColor} rounded-2xl flex items-center justify-center mb-5`}
            >
              {value.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3 tracking-tight">
              {value.title}
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              {value.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SclFeatures;
