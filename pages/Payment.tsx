
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Star, Wallet, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { subscriptionPlans } from '../data';
import { UserBot, Bot } from '../types';
import { WalletService } from '../services/WalletService';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { DatabaseService } from '../services/DatabaseService';

const Payment = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [targetBot, setTargetBot] = useState<Bot | null>(null);
  const [tonConnectUI] = useTonConnectUI();

  useEffect(() => {
    if (id) {
        DatabaseService.getBotById(id).then(data => setTargetBot(data));
    }
  }, [id]);

  const plan = subscriptionPlans.find(p => p.id === id);
  const item = targetBot || plan;

  const handleSuccess = () => {
      if (targetBot) {
          const ownedBots = JSON.parse(localStorage.getItem('ownedBots') || '[]');
          const newBot: UserBot = { ...targetBot, isAdEnabled: false, isActive: true };
          localStorage.setItem('ownedBots', JSON.stringify([...ownedBots, newBot]));
      }
      setToastMessage("Ödeme Başarılı! İşleminiz onaylandı.");
      setTimeout(() => navigate(targetBot ? '/my-bots' : '/settings'), 2000);
  };

  const payWithCrypto = async () => {
      if (!tonConnectUI.connected) {
          alert("Lütfen önce bir TON cüzdanı bağlayın.");
          await tonConnectUI.openModal();
          return;
      }
      setIsLoading(true);
      try {
          const priceTON = parseFloat(((item?.price || 0) / 185).toFixed(2));
          const transaction = WalletService.createTonTransaction(priceTON);
          await tonConnectUI.sendTransaction(transaction);
          handleSuccess();
      } catch (error) {
          alert("İşlem reddedildi veya başarısız oldu.");
      } finally {
          setIsLoading(false);
      }
  };

  if (!item) return <div className="text-white p-20 text-center">Ürün yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-slate-950 p-6 pt-10">
        {toastMessage && (
            <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                <CheckCircle2 size={24} />
                <span className="font-bold">{toastMessage}</span>
            </div>
        )}

        <button onClick={() => navigate(-1)} className="mb-8 p-3 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400">
            <ChevronLeft size={24} />
        </button>

        <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-6 border border-slate-800 mb-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
            <img src={targetBot?.icon || "https://picsum.photos/seed/star/100"} className="w-20 h-20 rounded-2xl mx-auto mb-4 border border-slate-800 shadow-xl" />
            <h2 className="text-2xl font-bold text-white mb-2">{item.name}</h2>
            <p className="text-slate-500 text-sm mb-4">Ömür Boyu Lisans</p>
            <div className="text-3xl font-black text-white">₺{item.price}</div>
        </div>

        <div className="space-y-4">
            <button 
                onClick={payWithCrypto}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl text-white font-bold shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 transition-all active:scale-95"
            >
                {isLoading ? <Loader2 className="animate-spin" /> : <Wallet size={24} />}
                Cüzdan ile Öde (TON)
            </button>
            <p className="text-[10px] text-slate-600 text-center uppercase tracking-widest px-4">Ödemeler TonConnect aracılığıyla güvenli şekilde gerçekleşir.</p>
        </div>
    </div>
  );
};

export default Payment;
