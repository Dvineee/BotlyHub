
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Star, Wallet, CheckCircle2, Loader2, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { subscriptionPlans } from '../data';
import { UserBot, Bot } from '../types';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { DatabaseService } from '../services/DatabaseService';
import { useTelegram } from '../hooks/useTelegram';
import { WalletService } from '../services/WalletService';

const Payment = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { tg, haptic, notification } = useTelegram();
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
              message: `${item?.price} Yıldız (Stars) karşılığında bu botu almak istiyor musunuz?`,
              buttons: [{id: 'pay', type: 'default', text: 'Öde'}, {id: 'cancel', type: 'cancel', text: 'Vazgeç'}]
          }, (id: string) => {
              if (id === 'pay') handleSuccess();
              else setIsLoading(false);
          });
      } else {
          setTimeout(handleSuccess, 2000);
      }
  };

  const payWithTON = async () => {
      if (!tonConnectUI.connected) {
          await tonConnectUI.openModal();
          return;
      }
      setIsLoading(true);
      try {
          const priceInTON = parseFloat(((item?.price || 0) / 150).toFixed(2)); // Örnek kur
          const transaction = WalletService.createTonTransaction(priceInTON);
          await tonConnectUI.sendTransaction(transaction);
          handleSuccess();
      } catch (e) {
          notification('error');
      } finally {
          setIsLoading(false);
      }
  };

  if (!item) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="min-h-screen bg-[#020617] p-6 pt-10">
        <button onClick={() => navigate(-1)} className="mb-8 p-3 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400"><ChevronLeft size={24} /></button>

        <div className="bg-gradient-to-br from-slate-900 to-[#020617] rounded-3xl p-8 border border-slate-800 mb-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-blue-500"></div>
            <img src={item.icon} className="w-24 h-24 rounded-2xl mx-auto mb-6 border border-slate-800 shadow-2xl" />
            <h2 className="text-2xl font-bold text-white mb-2">{item.name}</h2>
            <p className="text-slate-500 text-sm mb-6">Ödeme Yöntemini Seçin</p>
            <div className="text-3xl font-black text-white">₺{item.price}</div>
        </div>

        <div className="space-y-4">
            <button 
                onClick={payWithStars}
                disabled={isLoading}
                className="w-full bg-yellow-500 hover:bg-yellow-400 py-5 rounded-2xl text-slate-950 font-black shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95"
            >
                {isLoading ? <Loader2 className="animate-spin" /> : <Star size={24} fill="currentColor" />}
                Stars ile Öde
            </button>
            
            <button 
                onClick={payWithTON}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl text-white font-black shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95"
            >
                {isLoading ? <Loader2 className="animate-spin" /> : <Wallet size={24} />}
                TON ile Öde
            </button>
        </div>
        <p className="mt-8 text-[10px] text-slate-600 text-center uppercase tracking-widest leading-relaxed">Güvenli ödeme altyapısı ile işlemleriniz korunmaktadır.</p>
    </div>
  );
};

export default Payment;
