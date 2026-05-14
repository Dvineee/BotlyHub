
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
            <div className="flex items-center mb-4">
                <Logo />
            </div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed max-w-xs">
                BotlyHub, Telegram botları, TON ekosistemi ve modern Web3 uygulamaları için en gelişmiş keşif, tanıtım ve yönetim platformudur.
            </p>
        </div>

        <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em]">HIZLI LİNKLER</h4>
            <div className="flex flex-col gap-3">
                <button onClick={() => navigate('/')} className="text-[11px] font-bold text-slate-400 hover:text-blue-500 text-left uppercase tracking-widest transition-colors">Ana Sayfa</button>
                <button onClick={() => navigate('/blog')} className="text-[11px] font-bold text-slate-400 hover:text-blue-500 text-left uppercase tracking-widest transition-colors">Trend Blog</button>
                <button onClick={() => navigate('/premium')} className="text-[11px] font-bold text-slate-400 hover:text-blue-500 text-left uppercase tracking-widest transition-colors">Premium Üyelik</button>
                <button onClick={() => navigate('/search?mode=apps')} className="text-[11px] font-bold text-slate-400 hover:text-blue-500 text-left uppercase tracking-widest transition-colors">Uygulamalar</button>
            </div>
        </div>

        <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em]">KATEGORİLER</h4>
            <div className="flex flex-col gap-3">
                <button onClick={() => navigate('/search?category=bots')} className="text-[11px] font-bold text-slate-400 hover:text-blue-500 text-left uppercase tracking-widest transition-colors">Telegram Botları</button>
                <button onClick={() => navigate('/search?category=apps')} className="text-[11px] font-bold text-slate-400 hover:text-blue-500 text-left uppercase tracking-widest transition-colors">Mini Apps</button>
                <button onClick={() => navigate('/search?category=channels')} className="text-[11px] font-bold text-slate-400 hover:text-blue-500 text-left uppercase tracking-widest transition-colors">Kanallar</button>
                <button onClick={() => navigate('/search?category=groups')} className="text-[11px] font-bold text-slate-400 hover:text-blue-500 text-left uppercase tracking-widest transition-colors">Gruplar</button>
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
