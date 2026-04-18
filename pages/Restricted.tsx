
import React from 'react';
import { ShieldAlert, LogOut, MessageCircle } from 'lucide-react';
import { useTelegram } from '../hooks/useTelegram';

const Restricted = () => {
    const { user } = useTelegram();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col items-center justify-center p-10 text-center animate-in fade-in transition-colors duration-300">
            <div className="w-28 h-28 bg-red-600/10 dark:bg-red-500/10 rounded-[44px] flex items-center justify-center text-red-600 dark:text-red-500 mb-10 animate-pulse border border-red-500/20  ">
                <ShieldAlert size={56} />
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Erişim Kısıtlandı</h1>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-widest leading-relaxed max-w-xs mb-14 opacity-80">
                Hesabınız platform kurallarını ihlal ettiği gerekçesiyle kısıtlanmıştır.
            </p>

            <div className="w-full max-w-sm space-y-5">
                <a 
                    href="https://t.me/botlyhub_support" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-4 w-full py-6 bg-brand dark:bg-brand-light rounded-[28px] text-white text-[11px] font-bold uppercase tracking-widest   active:scale-95 transition-all"
                >
                    <MessageCircle size={20} />
                    Destekle İletişime Geç
                </a>
                
                <button 
                    onClick={() => window.location.reload()}
                    className="flex items-center justify-center gap-4 w-full py-6 bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 rounded-[28px] text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest active:scale-95 transition-all "
                >
                    Tekrar Dene
                </button>
            </div>

            <p className="mt-20 text-[10px] font-bold text-slate-200 dark:text-slate-800 uppercase tracking-[0.6em]">
                BotlyHub Security v3.1
            </p>
        </div>
    );
};

export default Restricted;
