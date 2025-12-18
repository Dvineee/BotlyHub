
import React from 'react';
import { Settings, ShieldAlert, Cpu, Sparkles } from 'lucide-react';

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <div className="max-w-md w-full text-center relative z-10">
        <div className="relative inline-block mb-10">
            <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-[32px] flex items-center justify-center shadow-2xl">
                <Settings size={44} className="text-blue-500 animate-[spin_4s_linear_infinite]" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-xl shadow-lg border-4 border-[#020617]">
                <ShieldAlert size={20} className="text-white" />
            </div>
        </div>

        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Sistem <span className="text-blue-500">Güncelleniyor</span></h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-10 px-4">
            Size daha iyi bir deneyim sunmak için altyapımızı optimize ediyoruz. Kısa bir süre sonra tekrar görüşmek üzere.
        </p>

        <div className="space-y-4">
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 text-left group hover:border-blue-500/30 transition-colors">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500"><Cpu size={20} /></div>
                <div>
                    <p className="text-xs font-black text-white uppercase tracking-widest">Çekirdek Güncelleme</p>
                    <p className="text-[10px] text-slate-500">V3.5 Veritabanı optimizasyonu süratle devam ediyor.</p>
                </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 text-left group hover:border-purple-500/30 transition-colors">
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500"><Sparkles size={20} /></div>
                <div>
                    <p className="text-xs font-black text-white uppercase tracking-widest">Arayüz İyileştirme</p>
                    <p className="text-[10px] text-slate-500">Görsel performans ve akıcılık artırılıyor.</p>
                </div>
            </div>
        </div>

        <div className="mt-12 text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">
            BOTLYHUB INFRASTRUCTURE V3
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
