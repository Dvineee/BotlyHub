
import React from 'react';
import { Settings, ShieldAlert, Cpu, Sparkles } from 'lucide-react';

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <div className="max-w-md w-full text-center relative z-10">
        <div className="relative inline-block mb-10">
            <div className="w-28 h-28 bg-slate-900 border border-slate-800 rounded-[40px] flex items-center justify-center shadow-2xl">
                <Settings size={56} className="text-blue-500 animate-[spin_6s_linear_infinite]" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-purple-600 p-3 rounded-2xl shadow-lg border-4 border-[#020617]">
                <ShieldAlert size={24} className="text-white" />
            </div>
        </div>

        <h1 className="text-4xl font-black text-white mb-6 tracking-tight uppercase italic">Sistem <span className="text-blue-500">Güncellemesi</span></h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-12 px-8 font-medium">
            Sizlere daha hızlı ve stabil bir deneyim sunmak için sistemimizi kısa süreliğine bakıma aldık. Çok yakında buradayız!
        </p>

        <div className="space-y-4 max-w-sm mx-auto">
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-3xl flex items-center gap-5 text-left border-b-4 border-b-blue-500">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500"><Cpu size={24} /></div>
                <div>
                    <p className="text-xs font-black text-white uppercase tracking-widest">Altyapı V3.5</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Yük dengeleme iyileştiriliyor</p>
                </div>
            </div>
        </div>

        <div className="mt-16 text-[10px] font-black text-slate-800 uppercase tracking-[0.6em]">
            BOTLYHUB INFRASTRUCTURE
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
