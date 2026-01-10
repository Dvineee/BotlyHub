
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, Share2, Send, Loader2, ShieldCheck, 
  Bot as BotIcon, Zap, Shield, PlusCircle, X, 
  Maximize2, ChevronRight, Eye, Lock, Unlock, AlertTriangle, Sparkles, CheckCircle, Globe, History
} from 'lucide-react';
import * as Router from 'react-router-dom';
import { Bot, Channel } from '../types';
import { useTelegram } from '../hooks/useTelegram';
import { DatabaseService } from '../services/DatabaseService';
import PriceService from '../services/PriceService';
import { useTranslation } from '../TranslationContext';

const { useNavigate, useParams } = Router as any;

const BotDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { haptic, user, notification, tg } = useTelegram();
  const { t } = useTranslation();
  
  const [bot, setBot] = useState<Bot | null>(null);
  const [isOwned, setIsOwned] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tonRate, setTonRate] = useState(250);
  
  useEffect(() => {
    fetchBotData();
    PriceService.getTonPrice().then(p => setTonRate(p.tonTry));
  }, [id, user]);

  const fetchBotData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
        const data = await DatabaseService.getBotById(id);
        setBot(data);
        if (user?.id) {
            const owned = await DatabaseService.isBotOwnedByUser(user.id.toString(), id);
            setIsOwned(owned);
        }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-12 space-y-6">
        <div className="w-32 h-32 rounded-[40px] skeleton"></div>
        <div className="h-8 w-48 skeleton rounded-full"></div>
        <div className="h-24 w-full skeleton rounded-[32px]"></div>
    </div>
  );

  if (!bot) return null;
  const prices = PriceService.convert(bot.price, tonRate);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pb-40 animate-in">
      <nav className="fixed top-0 inset-x-0 h-16 z-[60] flex items-center justify-between px-6 bg-[#020617]/60 backdrop-blur-xl border-b border-white/5">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-400"><ChevronLeft size={24} /></button>
        <div className="flex items-center gap-1.5 bg-blue-600/10 px-3 py-1 rounded-full border border-blue-500/20">
            <ShieldCheck size={12} className="text-blue-500" />
            <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Audit Passed</span>
        </div>
        <button className="p-2 text-slate-400"><Share2 size={20} /></button>
      </nav>

      <div className="pt-24 px-6 mb-10 flex flex-col items-center text-center">
        <div className="relative mb-8 group">
            <div className={`absolute inset-0 blur-[60px] rounded-full transition-all duration-1000 ${isOwned ? 'bg-emerald-600/20' : 'bg-blue-600/10'}`}></div>
            <img src={bot.icon || `https://ui-avatars.com/api/?name=${bot.name}`} className="w-32 h-32 rounded-[40px] border border-white/10 shadow-2xl relative z-10 object-cover bg-slate-900" />
            <div className="absolute -bottom-3 -right-3 p-3 bg-blue-600 rounded-2xl border-4 border-[#020617] shadow-2xl z-20"><CheckCircle size={20} /></div>
        </div>
        
        <h1 className="text-3xl font-black text-white tracking-tight mb-2 italic uppercase">{bot.name}</h1>
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-8">Official Verified Application</p>

        <div className="grid grid-cols-3 gap-3 w-full mb-10">
            {[
                { icon: Globe, label: 'Stable', val: 'v3.5' },
                { icon: Shield, label: 'Secure', val: 'SSL' },
                { icon: History, label: 'Uptime', val: '99.9%' }
            ].map((stat, i) => (
                <div key={i} className="bg-slate-900/40 border border-white/5 p-4 rounded-3xl flex flex-col items-center">
                    <stat.icon size={14} className="text-slate-600 mb-2" />
                    <p className="text-[8px] font-black text-slate-700 uppercase mb-0.5">{stat.label}</p>
                    <p className="text-[10px] font-black text-white italic">{stat.val}</p>
                </div>
            ))}
        </div>

        <div className="w-full p-8 bg-slate-900/40 rounded-[44px] border border-white/5 relative overflow-hidden text-left mb-10">
            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">Functional Description</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-bold uppercase italic opacity-80">{bot.description}</p>
        </div>

        <div className="w-full flex flex-col gap-4">
            {isOwned ? (
                <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[32px] flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><ShieldCheck size={24} /></div>
                    <div className="text-left"><p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">LICENSED</p><p className="text-[10px] text-slate-600 font-bold uppercase italic">Full access granted to your account.</p></div>
                </div>
            ) : (
                <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-[32px] flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500"><Zap size={24} /></div>
                    <div className="text-left"><p className="text-[11px] font-black text-blue-500 uppercase tracking-widest">READY FOR DEPLOY</p><p className="text-[10px] text-slate-600 font-bold uppercase italic">Available for immediate activation.</p></div>
                </div>
            )}
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 p-6 z-[70] bg-gradient-to-t from-[#020617] via-[#020617]/95 to-transparent pb-12">
          <button 
            onClick={() => isOwned ? window.open(bot.bot_link, '_blank') : navigate(`/payment/${bot.id}`)}
            className={`w-full h-20 rounded-[32px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl border-b-8 ${isOwned ? 'bg-emerald-600 text-white border-emerald-800' : 'bg-white text-slate-950 border-slate-300'}`}
          >
            {isOwned ? <><Send size={20} /> RUN INSTANCE</> : <div className="flex items-center gap-8"><div className="text-left"><p className="text-[8px] font-black text-slate-500 mb-0.5 uppercase">LIFETIME ACCESS</p><p className="text-lg font-black italic tracking-tighter">{prices.ton} TON</p></div><div className="h-10 w-px bg-slate-200/20"></div><span className="text-[11px]">ACTIVATE NOW</span></div>}
          </button>
      </div>
    </div>
  );
};

export default BotDetail;
