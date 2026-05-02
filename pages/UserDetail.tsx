
import React, { useState } from 'react';
import { Bell, Bot, BarChart2, ShieldAlert, Ban, X, ChevronLeft } from 'lucide-react';
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
      <div className="p-4 flex items-center justify-between sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl z-50 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 rounded-2xl text-slate-500 dark:text-slate-400 active:scale-90 transition-transform ">
                <ChevronLeft size={20} />
            </button>
            <h1 className="text-[14px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Kullanıcı Detayları</h1>
        </div>
        <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                 <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest leading-none">Çevrimiçi</span>
            </div>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="px-6 mt-8 mb-10">
        <div className="relative p-8 bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 rounded-[44px] overflow-hidden fancy-glass-card">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 dark:bg-brand-light/5 blur-3xl -mr-16 -mt-16 rounded-full" />
            
            <div className="relative z-10 flex flex-col items-center">
                <div className="relative mb-6">
                    <div className="w-28 h-28 rounded-[36px] p-1 bg-gradient-to-tr from-brand/20 to-brand-light/20 backdrop-blur-md">
                        <img 
                            src={`https://picsum.photos/seed/${id || 'user'}/300`} 
                            alt="Profile" 
                            className="w-full h-full rounded-[32px] object-cover border-4 border-white dark:border-slate-950" 
                        />
                    </div>
                </div>
                
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">{id === '1' ? 'Cem Yılmaz' : 'Kullanıcı Adı'}</h2>
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-brand dark:text-brand-light text-[10px] font-black uppercase tracking-[0.2em]">@{id === '1' ? 'cemyilmaz' : 'username'}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest">PRO ÜYE</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 w-full mt-10">
                    <div className="p-4 bg-slate-50/50 dark:bg-slate-950/40 rounded-[24px] border border-black/5 dark:border-white/5 text-center stats-card-bg">
                        <p className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">ID NUMARASI</p>
                        <p className="text-xs font-black text-slate-600 dark:text-slate-300 tabular-nums">#{id || '882103'}</p>
                    </div>
                    <div className="p-4 bg-slate-50/50 dark:bg-slate-950/40 rounded-[24px] border border-black/5 dark:border-white/5 text-center stats-card-bg">
                        <p className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">KATILIM TARİHİ</p>
                        <p className="text-xs font-black text-slate-600 dark:text-slate-300 tabular-nums">24.05.2023</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Main Settings Section */}
      <div className="px-6 space-y-10 max-w-lg mx-auto">
        
        {/* Action Button */}
        <button className="w-full bg-brand dark:bg-brand-light hover:shadow-lg hover:shadow-brand/20 active:scale-95 transition-all text-white font-black py-6 rounded-[28px] sm:rounded-[22px] flex items-center justify-center gap-4 uppercase text-[11px] tracking-[0.3em] border-b-8 border-brand-dark dark:border-brand-light/20 relative group overflow-hidden">
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <Bell size={20} className="relative z-10" />
            <span className="relative z-10">Bildirim Gönder</span>
        </button>

        {/* Tab Switcher */}
        <div>
            <div className="bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-[28px] sm:rounded-[22px] flex border border-black/5 dark:border-white/5 mb-6">
                <button className="flex-1 py-4 text-[11px] font-black bg-white dark:bg-slate-800 rounded-[22px] text-slate-900 dark:text-white uppercase tracking-widest shadow-sm">Botlar</button>
                <button className="flex-1 py-4 text-[11px] font-black text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 uppercase tracking-widest transition-colors">Kanallar</button>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between px-2 mb-2">
                    <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">AKTİF BOT LİSTESİ</h3>
                    <div className="w-8 h-px bg-slate-200 dark:bg-slate-900" />
                </div>

                {/* Bot List with Toggles */}
                <div className="flex flex-col bg-white dark:bg-slate-900/40 rounded-[32px] border border-black/5 dark:border-white/5 backdrop-blur-xl overflow-hidden fancy-glass-card">
                    <div className="p-2 space-y-1">
                        <div className="p-6 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 rounded-[24px] transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-slate-50 dark:bg-slate-950 rounded-[20px] flex items-center justify-center border border-black/5 dark:border-white/5 text-blue-500">
                                    <Bot size={24} />
                                </div>
                                <div>
                                    <h3 className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Moderasyon Botu</h3>
                                    <p className="text-[9px] text-brand dark:text-brand-light font-black uppercase mt-1 tracking-widest">@modbot_pro</p>
                                </div>
                            </div>
                            <div 
                                onClick={() => toggle('modBot')}
                                className={`w-14 h-8 rounded-[14px] p-1.5 cursor-pointer transition-all duration-500 ${restrictions.modBot ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-lg transition-all shadow-md  ${restrictions.modBot ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                        </div>

                        <div className="p-6 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 rounded-[24px] transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-slate-50 dark:bg-slate-950 rounded-[20px] flex items-center justify-center border border-black/5 dark:border-white/5 text-purple-500">
                                    <BarChart2 size={24} />
                                </div>
                                <div>
                                    <h3 className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Analiz Botu</h3>
                                    <p className="text-[9px] text-brand dark:text-brand-light font-black uppercase mt-1 tracking-widest">@stats_helper_bot</p>
                                </div>
                            </div>
                            <div 
                                onClick={() => toggle('analysisBot')}
                                className={`w-14 h-8 rounded-[14px] p-1.5 cursor-pointer transition-all duration-500 ${restrictions.analysisBot ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-lg transition-all shadow-md  ${restrictions.analysisBot ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Admin Controls Section */}
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">ERİŞİM YÖNETİMİ</h3>
                <ShieldAlert size={14} className="text-red-500/50" />
            </div>

            <div className="flex flex-col bg-white dark:bg-slate-900/40 rounded-[32px] border border-red-500/5 dark:border-red-500/10 overflow-hidden fancy-glass-card">
                <div className="p-2 space-y-1">
                    <div className="p-6 flex items-center justify-between bg-red-500/5 dark:bg-red-500/5 rounded-[24px]">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-red-500/10 rounded-[20px] flex items-center justify-center border border-red-500/10 text-red-500">
                                <Ban size={24} />
                            </div>
                            <div>
                                <h3 className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Sistemi Kilitle</h3>
                                <p className="text-[9px] text-red-500/70 font-black uppercase mt-1 tracking-widest">TÜM ERİŞİMİ KESER</p>
                            </div>
                        </div>
                        <div 
                            onClick={() => toggle('restrictPlatform')}
                            className={`w-14 h-8 rounded-[14px] p-1.5 cursor-pointer transition-all duration-500 ${restrictions.restrictPlatform ? 'bg-red-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-lg transition-all shadow-md  ${restrictions.restrictPlatform ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                    </div>

                    <div className="p-6 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 rounded-[24px] transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-slate-50 dark:bg-slate-950 rounded-[20px] flex items-center justify-center border border-black/5 dark:border-white/5 text-orange-500">
                                <ShieldAlert size={24} />
                            </div>
                            <div>
                                <h3 className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Reklam Engeli</h3>
                                <p className="text-[9px] text-slate-500/70 font-black uppercase mt-1 tracking-widest">REKLAM YETKİSİNİ ALIR</p>
                            </div>
                        </div>
                        <div 
                            onClick={() => toggle('restrictAds')}
                            className={`w-14 h-8 rounded-[14px] p-1.5 cursor-pointer transition-all duration-500 ${restrictions.restrictAds ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-lg transition-all shadow-md  ${restrictions.restrictAds ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default UserDetail;
