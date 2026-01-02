
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Wallet, CheckCircle2, Loader2, ShieldCheck, Zap, AlertTriangle, ShieldAlert } from 'lucide-react';
import * as Router from 'react-router-dom';
import { subscriptionPlans } from '../data';
import { Bot } from '../types';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { DatabaseService } from '../services/DatabaseService';
import { useTelegram } from '../hooks/useTelegram';
import { WalletService } from '../services/WalletService';
import PriceService from '../services/PriceService';

const { useNavigate, useParams } = Router as any;

const Payment = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { haptic, user, notification, tg } = useTelegram();
  const [isLoading, setIsLoading] = useState(false);
  const [targetBot, setTargetBot] = useState<Bot | null>(null);
  const [tonPrice, setTonPrice] = useState(250);
  const [tonConnectUI] = useTonConnectUI();

  useEffect(() => {
    if (id) {
        DatabaseService.getBotById(id).then(data => setTargetBot(data));
        PriceService.getTonPrice().then(p => setTonPrice(p.tonTry));
    }
    
    if (tg) {
        tg.setHeaderColor('#020617');
    }
  }, [id, tg]);

  const plan = subscriptionPlans.find(p => p.id === id);
  const item = targetBot || plan;

  const handleSuccess = async () => {
      if (!item) return;
      
      haptic('heavy');
      notification('success');
      
      try {
          const userData = user || { id: 'guest', first_name: 'User' };
          
          if (targetBot) {
              await DatabaseService.addUserBot(userData, targetBot, false);
          } else if (plan) {
              localStorage.setItem('userPlan', plan.id);
          }
          
          await DatabaseService.logActivity(
              userData.id.toString(), 
              'payment', 
              'PAYMENT_COMPLETE', 
              'TON İşlemi Başarılı', 
              `${item.name} için TON ödemesi onaylandı.`
          );

          navigate(targetBot ? '/my-bots' : '/settings');
      } catch (e) {
          console.error("Post-Payment Error:", e);
          alert("Ödeme onaylandı ancak aktivasyon hatası oluştu.");
      }
  };

  const prices = item ? PriceService.convert(item.price, tonPrice) : { ton: 0 };

  const payWithTON = async () => {
      if (!tonConnectUI.connected) {
          notification('warning');
          await tonConnectUI.openModal();
          return;
      }
      
      setIsLoading(true);
      haptic('medium');
      
      try {
          const transactionPayload = WalletService.createTonTransaction(prices.ton);
          const result = await tonConnectUI.sendTransaction(transactionPayload);
          
          if (result) {
              await handleSuccess();
          }
      } catch (e: any) {
          notification('error');
          setIsLoading(false);
      }
  };

  if (!item) return <div className="min-h-screen bg-[#020617] flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="min-h-screen bg-[#020617] p-6 pt-10 animate-in fade-in">
        <div className="flex items-center justify-between mb-8">
            <button onClick={() => navigate(-1)} className="p-3.5 bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400 active:scale-90 transition-transform">
                <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full">
                <ShieldCheck size={14} className="text-blue-500" />
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Güvenli TON Ödemesi</span>
            </div>
        </div>

        <div className="bg-gradient-to-br from-[#0f172a] to-[#020617] rounded-[56px] p-12 border border-slate-800 mb-10 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600"></div>
            
            <div className="relative inline-block mb-10">
                <div className="absolute inset-0 bg-blue-600/20 blur-[40px] rounded-full"></div>
                <img 
                    src={targetBot ? (targetBot.icon || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetBot.name)}&background=334155&color=fff`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(plan?.name || 'P')}&background=1e293b&color=fff`} 
                    className="w-32 h-32 rounded-[44px] border-4 border-slate-800 shadow-2xl object-cover relative z-10 bg-slate-900" 
                />
            </div>

            <h2 className="text-4xl font-black text-white mb-3 italic tracking-tighter uppercase">{item.name}</h2>
            <p className="text-slate-500 text-[10px] mb-10 font-black uppercase tracking-[0.3em]">Satın Alma Onayı</p>
            
            <div className="bg-slate-950/80 p-8 rounded-[36px] border border-white/5 shadow-inner">
                <div className="flex flex-col items-center">
                    <Zap size={32} className="text-blue-500 mb-3" />
                    <span className="text-[11px] text-slate-600 font-black uppercase tracking-widest mb-1">Toplam Tutar</span>
                    <p className="text-3xl font-black text-white italic tracking-tighter">{prices.ton} TON</p>
                    <p className="text-[9px] text-slate-700 font-bold uppercase mt-2">≈ {item.price} TL</p>
                </div>
            </div>
        </div>

        <div className="space-y-5">
            <button 
                onClick={payWithTON} 
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 py-7 rounded-[32px] text-white font-black shadow-2xl shadow-blue-600/20 flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em] text-xs border-b-4 border-blue-800"
            >
                {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Wallet size={24} />}
                Cüzdanı Bağla ve Öde
            </button>
        </div>
        
        <div className="mt-16 flex flex-col items-center gap-6 opacity-40">
            <div className="flex items-center gap-3">
                <ShieldAlert size={18} className="text-slate-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] italic text-slate-500">Blokzincir Güvenceli İşlem</span>
            </div>
        </div>
    </div>
  );
};

export default Payment;
