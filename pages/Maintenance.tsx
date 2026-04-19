
import React from 'react';
import { Settings, ShieldAlert, Cpu, Sparkles } from 'lucide-react';
import Logo from '../components/Logo';

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center p-8 relative overflow-hidden animate-in fade-in transition-colors duration-300">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <div className="max-w-md w-full text-center relative z-10">
        <div className="relative inline-block mb-12">
            <div className="w-32 h-32 bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 rounded-[48px] flex items-center justify-center  backdrop-blur-xl">
                <Logo 
                    style={{ width: '4.5rem', height: 'auto', display: 'block' }} 
                    className=" animate-pulse" 
                />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-brand p-4 rounded-[20px]  border-4 border-slate-50 dark:border-[#020617]">
                <ShieldAlert size={24} className="text-white" />
            </div>
        </div>

        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">Sistem <span className="text-brand">Bakımda</span></h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-12 px-6 font-medium">
            Sizlere daha hızlı ve stabil bir deneyim sunmak için sistemimizi kısa süreliğine bakıma aldık. Çok yakında buradayız!
        </p>

        <div className="space-y-4 max-w-sm mx-auto">
            <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-black/5 dark:border-white/5 p-6 rounded-[32px] flex items-center gap-5 text-left ">
                <div className="w-14 h-14 bg-purple-600/10 dark:bg-purple-500/10 rounded-[20px] flex items-center justify-center text-purple-600 dark:text-purple-500  border border-purple-500/10">
                    <Cpu size={28} />
                </div>
                <div>
                    <p className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">Altyapı V3.5</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-wider">Yük dengeleme iyileştiriliyor</p>
                </div>
            </div>
        </div>

        <div className="mt-20 text-[10px] font-bold text-slate-200 dark:text-slate-800 uppercase tracking-[0.8em]">
            BOTLYHUB INFRASTRUCTURE
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
