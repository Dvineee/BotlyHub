
import React from 'react';
import { Send, Twitter, Github, ChevronRight } from 'lucide-react';
import Logo from './Logo';
import { useTelegram } from '../hooks/useTelegram';
import { useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
    const navigate = useNavigate();
    const { haptic } = useTelegram();

  return (
    <footer className="mt-12 px-4 pb-32 max-w-7xl mx-auto w-full border-t border-black/5 dark:border-white/5 pt-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
                <Logo style={{ width: '2rem', height: 'auto' }} />
                <span className="text-xl font-bold text-slate-900 dark:text-white uppercase italic tracking-tighter">BotlyHub</span>
            </div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed max-w-xs">
                Telegram otomasyon ve keşif platformu. Tüm botlarınız tek bir çatıda.
            </p>
        </div>

        <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em]">HIZLI LİNKLER</h4>
            <div className="flex flex-col gap-3">
                <button onClick={() => navigate('/')} className="text-[11px] font-bold text-slate-400 hover:text-blue-500 text-left uppercase tracking-widest transition-colors tracking-widest">Keşfet</button>
                <button onClick={() => navigate('/premium')} className="text-[11px] font-bold text-slate-400 hover:text-blue-500 text-left uppercase tracking-widest transition-colors tracking-widest">Lisanslar</button>
                <button onClick={() => navigate('/settings')} className="text-[11px] font-bold text-slate-400 hover:text-blue-500 text-left uppercase tracking-widest transition-colors tracking-widest">Hesabım</button>
            </div>
        </div>

        <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em]">BİZE ULAŞIN</h4>
            <div className="flex flex-col gap-3">
                <a href="https://t.me/botlyhub" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-blue-500 uppercase tracking-widest transition-colors"><Send size={14} /> Telegram Duyuru</a>
                <a href="#" className="flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-blue-500 uppercase tracking-widest transition-colors"><Twitter size={14} /> Twitter</a>
            </div>
        </div>
      </div>

      <div className="pt-8 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 opacity-40">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">© 2024 BOTLYHUB. TÜM HAKLARI SAKLIDIR.</p>
        <div className="flex items-center gap-6">
            <button className="text-[9px] font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-widest transition-all">GİZLİLİK</button>
            <button className="text-[9px] font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-widest transition-all">ŞARTLAR</button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
