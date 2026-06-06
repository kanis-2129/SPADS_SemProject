import React from 'react';
import { School, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* LEFT: School Brand Title */}
        <div className="flex items-center gap-2 text-white font-bold text-lg">
          <div className="w-8 h-8 bg-blue-600/10 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/20">
            <School size={16} />
          </div>
          <span className="tracking-tight text-sm md:text-base">GHSS Vellapallam</span>
        </div>

        {/* CENTER: Quick Nav Links */}
        <div className="flex flex-wrap justify-center gap-6 text-xs md:text-sm font-medium">
          <a href="#hero" className="hover:text-white transition-colors">Home</a>
          <a href="#about" className="hover:text-white transition-colors">About Us</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
        </div>

        {/* RIGHT: Copyright Info */}
        <div className="text-xs text-center md:text-right space-y-1">
          <p>&copy; {new Date().getFullYear()} All Rights Reserved.</p>
          <p className="flex items-center justify-center md:justify-end gap-1 text-[11px] text-slate-500">
            Made with <Heart size={10} className="text-red-500 fill-red-500" /> for Academic Excellence
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;