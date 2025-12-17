
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Star, Wallet, CheckCircle2, Loader2, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { subscriptionPlans } from '../data';
import { UserBot, Bot } from '../types';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { DatabaseService } from '../services/DatabaseService';
import { useTelegram } from '../hooks/useTelegram';

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
      // Simulate Telegram Stars Payment
      if (tg) {
          // Real TG Stars flow would use tg.openInvoice()
          // We simulate the popup for V3 demo
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

  if (!item) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="min-h-screen bg-slate-950 p-6 pt-10">
        <button onClick={() => navigate(-1)} className="mb-8 p-3 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400"><ChevronLeft size={24} /></button>

        <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-8 border border-slate-800 mb-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500"></div>
            <img src={item.icon} className="w-24 h-24 rounded-2xl mx-auto mb-6 border border-slate-800 shadow-2xl" />
            <h2 className="text-2xl font-bold text-white mb-2">{item.name}</h2>
            <p className="text-slate-500 text-sm mb-6">Telegram Stars ile Güvenli Ödeme</p>
            <div className="flex items-center justify-center gap-2 text-4xl font-black text-yellow-500">
                <Star size={32} fill="currentColor" />
                <span>{item.price}</span>
            </div>
        </div>

        <div className="space-y-4">
            <button 
                onClick={payWithStars}
                disabled={isLoading}
                className="w-full bg-yellow-500 hover:bg-yellow-400 py-5 rounded-2xl text-slate-950 font-black shadow-xl shadow-yellow-500/10 flex items-center justify-center gap-3 transition-all active:scale-95"
            >
                {isLoading ? <Loader2 className="animate-spin" /> : <Star size={24} fill="currentColor" />}
                Stars ile Öde
            </button>
            <button 
                onClick={() => alert("TON ödemesi şu an bakımda.")}
                className="w-full bg-slate-900 py-4 rounded-2xl text-slate-400 font-bold border border-slate-800 text-sm"
            >
                Cüzdan ile Öde (Yakında)
            </button>
        </div>
        <p className="mt-8 text-[10px] text-slate-600 text-center uppercase tracking-widest leading-relaxed">Telegram Stars politikaları gereği tüm satışlar iade edilemezdir.</p>
    </div>
  );
};

export default Payment;
