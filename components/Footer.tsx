
import React from 'react';
import { Send, Instagram, Youtube, Link } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-12 pt-8 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 px-4 pb-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="shrink-0 text-slate-400 dark:text-slate-500">
            <img src="/logo.svg" alt="Logo" style={{ width: '2.5rem', height: 'auto', display: 'block' }} />
          </div>
        </div>
        <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
          <a href="https://t.me/botlyhub" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors"><Send size={18} /></a>
          <a href="#" className="hover:text-pink-500 transition-colors"><Instagram size={18} /></a>
          <a href="#" className="hover:text-red-500 transition-colors"><Youtube size={18} /></a>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <a href="#" className="flex items-center gap-2 text-[#0098ea] text-[11px] font-black uppercase tracking-widest hover:opacity-80 transition-opacity">
          <Link size={14} />
          Hakkımızda
        </a>
        <a href="#" className="flex items-center gap-2 text-[#0098ea] text-[11px] font-black uppercase tracking-widest hover:opacity-80 transition-opacity">
          <Link size={14} />
          İletişim
        </a>
      </div>
    </footer>
  );
};

export default Footer;
