
import React from 'react';
import { ShieldAlert, LogOut, MessageCircle } from 'lucide-react';
import { useTelegram } from '../hooks/useTelegram';

const Restricted = () => {
    const { user } = useTelegram();

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 bg-red-500/10 rounded-[40px] flex items-center justify-center text-red-500 mb-8 animate-pulse">
                <ShieldAlert size={48} />
            </div>
            
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Erişim Kısıtlandı</h1>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest leading-relaxed max-w-xs mb-12 italic">
                Hesabınız platform kurallarını ihlal ettiği gerekçesiyle kısıtlanmıştır.
            </p>

            <div className="w-full max-w-xs space-y-4">
                <a 
                    href="https://t.me/botlyhub_support" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full py-5 bg-blue-600 rounded-[28px] text-white text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/40 active:scale-95 transition-all italic"
                >
                    <MessageCircle size={18} />
                    Destekle İletişime Geç
                </a>
                
                <button 
                    onClick={() => window.location.reload()}
                    className="flex items-center justify-center gap-3 w-full py-5 bg-slate-900 border border-white/5 rounded-[28px] text-slate-400 text-xs font-black uppercase tracking-[0.2em] active:scale-95 transition-all italic"
                >
                    Tekrar Dene
                </button>
            </div>

            <p className="mt-12 text-[9px] font-black text-slate-800 uppercase tracking-[0.4em] italic">
                BotlyHub Security v3.1
            </p>
        </div>
    );
};

export default Restricted;
