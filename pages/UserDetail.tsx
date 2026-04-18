
import React, { useState } from 'react';
import { Bell, Bot, BarChart2, ShieldAlert, Ban, X } from 'lucide-react';
// Fixed: Use namespace import for react-router-dom to resolve "no exported member" errors
import * as Router from 'react-router-dom';

const { useNavigate, useParams } = Router as any;

const UserDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock initial state
  const [restrictions, setRestrictions] = useState({
    restrictPlatform: false,
    restrictAds: true,
    modBot: true,
    analysisBot: false
  });

  const toggle = (key: keyof typeof restrictions) => {
    setRestrictions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-200 animate-in fade-in pb-32 transition-colors duration-300">
      {/* Header */}
      <div className="p-6 flex items-center justify-between sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl z-50 border-b border-black/5 dark:border-white/5">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Kullanıcı Detayları</h1>
        <button onClick={() => navigate(-1)} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-900/80 border border-black/5 dark:border-white/5 rounded-full text-slate-500 dark:text-slate-400 active:scale-90 transition-transform ">
            <X size={22} />
        </button>
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center mt-12 mb-12">
        <div className="relative">
             <div className="w-32 h-32 rounded-[40px] p-1 bg-gradient-to-tr from-brand to-brand-light  ">
                <img 
                    src={`https://picsum.photos/seed/${id || 'user'}/300`} 
                    alt="Profile" 
                    className="w-full h-full rounded-[36px] object-cover border-4 border-slate-50 dark:border-slate-950" 
                />
             </div>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-6 tracking-tight">Cem Yılmaz</h2>
        <p className="text-brand dark:text-brand-light text-sm font-bold uppercase tracking-widest mt-1">@cemyilmaz</p>
        <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-3 opacity-60">ID: 12345678 | Üyelik: 24.05.2023</p>
      </div>

      {/* Main Settings Section */}
      <div className="px-6 space-y-8 max-w-lg mx-auto">
        
        {/* Admin Controls */}
        <div className="bg-white dark:bg-slate-900/40 rounded-[32px] overflow-hidden border border-black/5 dark:border-white/5 ">
            <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center border border-black/5 dark:border-white/5  text-slate-400 dark:text-slate-400">
                        <Ban size={22} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Kullanıcıyı Kısıtla</h3>
                        <p className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">Platform genelindeki erişimini kısıtlar.</p>
                    </div>
                </div>
                <div 
                    onClick={() => toggle('restrictPlatform')}
                    className={`w-12 h-7 rounded-full relative cursor-pointer transition-all duration-300 ${restrictions.restrictPlatform ? 'bg-brand dark:bg-brand-light' : 'bg-slate-200 dark:bg-slate-800'}`}
                >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all  ${restrictions.restrictPlatform ? 'left-6' : 'left-1'}`}></div>
                </div>
            </div>

            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center border border-black/5 dark:border-white/5  text-slate-400 dark:text-slate-400">
                        <ShieldAlert size={22} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Reklam Yayınını Kısıtla</h3>
                        <p className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">Reklam yayınlama yetkisini kaldırır.</p>
                    </div>
                </div>
                <div 
                    onClick={() => toggle('restrictAds')}
                    className={`w-12 h-7 rounded-full relative cursor-pointer transition-all duration-300 ${restrictions.restrictAds ? 'bg-brand dark:bg-brand-light' : 'bg-slate-200 dark:bg-slate-800'}`}
                >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all  ${restrictions.restrictAds ? 'left-6' : 'left-1'}`}></div>
                </div>
            </div>
        </div>

        {/* Action Button */}
        <button className="w-full bg-brand dark:bg-brand-light hover:opacity-90 active:scale-95 transition-all text-white font-bold py-5 rounded-[24px] flex items-center justify-center gap-3   uppercase text-[11px] tracking-widest">
            <Bell size={20} />
            <span>Kullanıcıya Bildirim Gönder</span>
        </button>

        {/* Tab Switcher */}
        <div className="bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-[24px] flex border border-black/5 dark:border-white/5 ">
            <button className="flex-1 py-3 text-[11px] font-bold bg-white dark:bg-slate-800 rounded-[18px] text-slate-900 dark:text-white  uppercase tracking-widest">Kullandığı Botlar</button>
            <button className="flex-1 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 uppercase tracking-widest">Kanallar</button>
        </div>

        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-2">Bot Listesi</h3>

        {/* Bot List with Toggles */}
        <div className="bg-white dark:bg-slate-900/40 rounded-[32px] overflow-hidden border border-black/5 dark:border-white/5 ">
            <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center border border-black/5 dark:border-white/5  text-slate-400 dark:text-slate-400">
                        <Bot size={22} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Moderasyon Botu</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">@modbot</p>
                    </div>
                </div>
                <div 
                    onClick={() => toggle('modBot')}
                    className={`w-12 h-7 rounded-full relative cursor-pointer transition-all duration-300 ${restrictions.modBot ? 'bg-brand dark:bg-brand-light' : 'bg-slate-200 dark:bg-slate-800'}`}
                >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all  ${restrictions.modBot ? 'left-6' : 'left-1'}`}></div>
                </div>
            </div>

            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center border border-black/5 dark:border-white/5  text-slate-400 dark:text-slate-400">
                        <BarChart2 size={22} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Analiz Botu</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">@analysisbot</p>
                    </div>
                </div>
                <div 
                    onClick={() => toggle('analysisBot')}
                    className={`w-12 h-7 rounded-full relative cursor-pointer transition-all duration-300 ${restrictions.analysisBot ? 'bg-brand dark:bg-brand-light' : 'bg-slate-200 dark:bg-slate-800'}`}
                >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all  ${restrictions.analysisBot ? 'left-6' : 'left-1'}`}></div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default UserDetail;
