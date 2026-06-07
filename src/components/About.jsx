import { School,  } from "lucide-react";
import sclImage from "../images/sclImage1.png";


const About = (props) => {
  return (
    <div>
 
      {/* About Section */}
      <section
        ref={props.addToRefs}
        className="py-24 px-6 max-w-7xl mx-auto opacity-0 translate-y-16 transition-all duration-1000 ease-out"
      >
        <h1 className="text-4xl md:text-4xl font-black text-pink-950 tracking-tight text-center mb-12">
          About Us
        </h1>
        {/* Grid: Desktop la half content, half image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* --- LEFT SIDE: CONTENT --- */}
          <div className="space-y-8">
            {/* Card 1: Organization Profile */}
            <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200/60 shadow-sm space-y-5">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-[#1A5276] text-xs font-bold px-3 py-1.5 rounded-xl border border-blue-100">
                <School size={14} /> Organization Profile
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                Government Higher Secondary School, Vellapallam
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                Government Higher Secondary School (GHSS), Vellapallam. Located
                in the heart of Nagapattinam district, Tamil Nadu, our
                institution has been a cornerstone of quality education and
                community empowerment for years. We cater to students from
                Grades 6 to 12, offering a comprehensive and holistic learning
                environment.
              </p>
            </div>
          </div>

          {/* --- RIGHT SIDE: IMAGE --- */}
          <div className="w-full h-full min-h-[200px] md:min-h-[250px] rounded-3xl overflow-hidden border border-slate-200/60 shadow-sm relative group">
            <img
              src={sclImage}
              alt="School Campus"
              className="w-full  h-[350px] object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
            />
            {/* Card ku mela light black overlay gradient (Optional - Nalla erukum) */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent pointer-events-none"></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
