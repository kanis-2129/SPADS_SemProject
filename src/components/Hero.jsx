import React, { useEffect, useRef } from "react";
import heroImage from "../images/HeroSection.png";
import About from "./About";
import Feature from "./Feature";
import SclFeatures from "./sclFeature";
import Footer from "../Common/footer";

const AcademicPortal = () => {
  const sectionsRef = useRef([]);

  // Intersection Observer for Smooth Scroll-based Animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("opacity-0", "translate-y-16");
            entry.target.classList.add("opacity-100", "translate-y-0");
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const addToRefs = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  return (
    <div className="w-full bg-slate-50/50 min-h-screen">
      
      {/* 1. HERO SECTION (NO ABSOLUTE LAYERS) */}
      <div className="w-full flex flex-col">
        
        {/* TOP: Normal Hero Image Banner */}
        <div className="w-full px-4 md:px-6 pt-6">
          <div
            className="w-full h-[350px] md:h-[450px] rounded-3xl bg-center bg-cover bg-no-repeat relative overflow-hidden shadow-md"
            style={{ backgroundImage: `url(${heroImage})` }}
          >
            {/* Image mela title theriyarathukaaga light shading overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-slate-950/20"></div>
            
            {/* Hero Core Title - Center-la text neat-ah kootitu vanthuruken */}
            
          </div>
        </div>

        {/* BOTTOM: Exactly under the image frame section */}
        <div className="w-full mt-4">
          <SclFeatures />
        </div>
        
      </div>
     
      {/* 2. SUBSECTIONS WITH ACTIVE SCROLL REFS */}
      <About addToRefs={addToRefs} />
      <Feature addToRefs={addToRefs} />

      <Footer/>
    </div>
  );
};

export default AcademicPortal;