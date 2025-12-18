
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Star, Wallet, CheckCircle2, Loader2, ShieldCheck, Zap } from 'lucide-react';
// Fixed: Use namespace import for react-router-dom to resolve "no exported member" errors
import * as Router from 'react-router-dom';
import { subscriptionPlans } from '../data';
import { UserBot, Bot } from '../types';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { DatabaseService } from '../services/DatabaseService';
import { useTelegram } from '../hooks/useTelegram';
import { WalletService } from '../services/WalletService';

const { useNavigate, useParams } = Router as any;

const Payment = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { haptic, notification, tg } = useTelegram();
  const [isLoading, setIsLoading] = useState(false);
  const [targetBot, setTargetBot] = useState<Bot | null>(null);
  const [tonConnectUI] = useTonConnectUI();

  useEffect(() => {
    if (id) DatabaseService.getBotById(id).then(data => setTargetBot(data));
  }, [id]);

  const plan = subscriptionPlans.find(p => p.id === id);
  const item = targetBot || plan;

  const handleSuccess = () => {
      haptic('heavy');
      notification('success');
      if (targetBot) {
          const ownedBots = JSON.parse(localStorage.getItem('ownedBots') || '[]');
          localStorage.setItem('ownedBots', JSON.stringify([...ownedBots, { ...targetBot, isAdEnabled: false, isActive: true }]));
      }
      navigate(targetBot ? '/my-bots' : '/settings');
  };

  const payWithStars = async () => {
      setIsLoading(true);
      haptic('medium');
      if (tg) {
          tg.showPopup({
              title: 'Telegram Stars Ödemesi',
              message: `${item?.price} Yıldız (Stars) karşılığında bu işlem yapılsın mı?`,
              buttons: [{id: 'pay', type: 'default', text: 'Onayla'}, {id: 'cancel', type: 'cancel', text: 'Vazgeç'}]
          }, (id: string) => {
              if (id === 'pay') handleSuccess();
              else setIsLoading(false);
          });
      } else {
          setTimeout(handleSuccess, 1500);
      }
  };

  const payWithTON = async () => {
      if (!tonConnectUI.connected) {
          await tonConnectUI.openModal();
          return;
      }
      setIsLoading(true);
      try {
          const priceInTON = parseFloat(((item?.price || 0) / 100).toFixed(2));
          const transaction = WalletService.createTonTransaction(priceInTON);
          await tonConnectUI.sendTransaction(transaction);
          handleSuccess();
      } catch (e) {
          notification('error');
          alert("Ödeme iptal edildi veya bir hata oluştu.");
      } finally {
          setIsLoading(false);
      }
  };

  if (!item) return <div className="min-h-screen bg-[#020617] flex items-center justify-center"><Loader2 className="animate-spin text-purple-500" /></div>;

  return (
    <div className="min-h-screen bg-[#020617] p-6 pt-10">
        <button onClick={() => navigate(-1)} className="mb-8 p-3.5 bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400 active:scale-90 transition-transform"><ChevronLeft size={24} /></button>

        <div className="bg-gradient-to-br from-[#0f172a] to-[#020617] rounded-[40px] p-10 border border-slate-800 mb-10 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>
            <img src={item.icon} className="w-28 h-28 rounded-[32px] mx-auto mb-8 border-4 border-slate-800 shadow-2xl object-cover" />
            <h2 className="text-3xl font-black text-white mb-2">{item.name}</h2>
            <p className="text-slate-500 text-sm mb-8 font-medium">Güvenli Ödeme Seçenekleri</p>
            <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] mb-1">Toplam Tutar</span>
                <div className="text-4xl font-black text-white flex items-center gap-2">
                    <Star size={30} className="text-yellow-500" fill="currentColor" />
                    <span>{item.price}</span>
                </div>
            </div>
        </div>

        <div className="space-y-5">
            <button 
                onClick={payWithStars}
                disabled={isLoading}
                className="w-full bg-yellow-500 hover:bg-yellow-400 py-5 rounded-[24px] text-slate-950 font-black shadow-xl shadow-yellow-500/10 flex items-center justify-center gap-3 transition-all active:scale-95"
            >
                {isLoading ? <Loader2 className="animate-spin" /> : <Star size={24} fill="currentColor" />}
                Telegram Stars ile Öde
            </button>
            
            <button 
                onClick={payWithTON}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-[24px] text-white font-black shadow-xl shadow-blue-500/10 flex items-center justify-center gap-3 transition-all active:scale-95"
            >
                {isLoading ? <Loader2 className="animate-spin" /> : <Wallet size={24} />}
                TON Wallet ile Öde
            </button>
        </div>
        
        <div className="mt-12 flex items-center justify-center gap-2 text-slate-700">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Güvenli ve Şifreli İşlem</span>
        </div>
    </div>
  );
};

export default Payment;
