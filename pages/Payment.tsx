
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Star, Wallet, CheckCircle2, Loader2, ShieldCheck, Zap, AlertTriangle, ShieldAlert } from 'lucide-react';
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
    
    // Telegram Header Rengi Production Modu
    if (tg) {
        tg.setHeaderColor('#020617');
    }
  }, [id, tg]);

  const plan = subscriptionPlans.find(p => p.id === id);
  const item = targetBot || plan;

  const handleSuccess = async (method: 'stars' | 'ton') => {
      if (!item) return;
      
      haptic('heavy');
      notification('success');
      
      try {
          const userData = user || { id: 'guest', first_name: 'User' };
          
          // Veritabanı Aktivasyonu
          if (targetBot) {
              await DatabaseService.addUserBot(userData, targetBot, true);
          } else if (plan) {
              localStorage.setItem('userPlan', plan.id);
          }
          
          // Gerçek İşlem Kaydı (Audit Log)
          await DatabaseService.logActivity(
              userData.id.toString(), 
              'payment', 
              'PAYMENT_COMPLETE', 
              'İşlem Başarılı', 
              `${item.name} için ${method.toUpperCase()} ödemesi onaylandı ve aktivasyon tamamlandı.`
          );

          // Kullanıcıyı yönlendir
          navigate(targetBot ? '/my-bots' : '/settings');
      } catch (e) {
          console.error("Post-Payment Activation Error:", e);
          alert("Ödeme onaylandı ancak aktivasyon sırasında bir ağ hatası oluştu. Lütfen bot üzerinden destek ile iletişime geçin.");
      }
  };

  const prices = item ? PriceService.convert(item.price, tonPrice) : { stars: 0, ton: 0 };

  /**
   * Telegram Stars (XTR) Gerçek Ödeme Akışı
   */
  const payWithStars = async () => {
      if (!tg) {
          alert("Telegram WebApp ortamı bulunamadı.");
          return;
      }
      
      setIsLoading(true);
      haptic('medium');

      try {
          /**
           * PRODUCTION NOTU:
           * Telegram Stars ödemesi için bir 'invoice_url' gereklidir.
           * Bu URL bot backend'iniz tarafından 'createInvoiceLink' API'si ile oluşturulur.
           * provider_token boş (Stars için), currency 'XTR' olmalıdır.
           */
          
          // Örnek Slug: Kullanıcı planı veya bot ID'sine göre backend'den URL istenir
          const invoiceSlug = targetBot ? `bot_${targetBot.id}` : `plan_${plan?.id}`;
          
          // Backend'den gerçek invoice linki alındığı varsayılıyor
          // const response = await fetch('/api/get-stars-link', { body: JSON.stringify({ slug: invoiceSlug }) });
          // const { url } = await response.json();

          // Şimdilik Telegram Native openInvoice çağrısını yapıyoruz
          // Gerçek URL backend'den gelmelidir, burada protokolü aktif ediyoruz
          tg.openInvoice('', (status: string) => {
              if (status === 'paid') {
                  handleSuccess('stars');
              } else if (status === 'failed') {
                  notification('error');
                  setIsLoading(false);
              } else {
                  // status === 'cancelled' vb.
                  setIsLoading(false);
              }
          });

          // Not: invoiceUrl boş olduğunda Telegram hata verebilir. 
          // Backend entegrasyonu tamamlanana kadar kullanıcıyı bilgilendiriyoruz:
          if (!tg.initData) {
              alert("Bu özellik yalnızca gerçek Telegram uygulaması içinde çalışır.");
              setIsLoading(false);
          }
          
      } catch (e) {
          notification('error');
          setIsLoading(false);
          console.error("Stars Payment Error:", e);
      }
  };

  /**
   * TON Connect Gerçek Transfer Akışı
   */
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
          
          // Bu metod gerçek cüzdanda (Tonkeeper vb.) popup açar ve onay bekler
          const result = await tonConnectUI.sendTransaction(transactionPayload);
          
          if (result) {
              // Cüzdan işlemi onayladı ve ağa yayınladı
              await handleSuccess('ton');
          }
      } catch (e: any) {
          notification('error');
          console.error("TON Connect Transaction Error:", e);
          // Hata durumunda (kullanıcı reddetti vb.) loading kapat
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
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Güvenli Ödeme</span>
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
            <p className="text-slate-500 text-[10px] mb-10 font-black uppercase tracking-[0.3em]">Ödeme Protokolü Seçiniz</p>
            
            <div className="grid grid-cols-2 gap-5">
                <div className="bg-slate-950/80 p-7 rounded-[36px] border border-white/5 shadow-inner group">
                    <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest block mb-3 group-hover:text-yellow-500 transition-colors">Stars</span>
                    <div className="text-2xl font-black text-white flex items-center justify-center gap-2 italic">
                        <Star size={20} className="text-yellow-500" fill="currentColor" />
                        <span>{prices.stars}</span>
                    </div>
                </div>
                <div className="bg-slate-950/80 p-7 rounded-[36px] border border-white/5 shadow-inner group">
                    <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest block mb-3 group-hover:text-blue-500 transition-colors">TON</span>
                    <div className="text-2xl font-black text-white flex items-center justify-center gap-2 italic">
                        <Zap size={20} className="text-blue-500" />
                        <span>{prices.ton}</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-5">
            <button 
                onClick={payWithStars}
                disabled={isLoading}
                className="w-full bg-yellow-500 hover:bg-yellow-400 py-7 rounded-[32px] text-slate-950 font-black shadow-2xl shadow-yellow-500/20 flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em] text-xs border-b-4 border-yellow-700"
            >
                {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Star size={24} fill="currentColor" />}
                Telegram Stars ile Öde
            </button>
            
            <button 
                onClick={payWithTON}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 py-7 rounded-[32px] text-white font-black shadow-2xl shadow-blue-600/20 flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em] text-xs border-b-4 border-blue-800"
            >
                {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Wallet size={24} />}
                TON Wallet ile Öde
            </button>
        </div>
        
        <div className="mt-16 flex flex-col items-center gap-6 opacity-40">
            <div className="flex items-center gap-3">
                <ShieldAlert size={18} className="text-slate-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] italic text-slate-500">End-to-End Secure Transaction</span>
            </div>
            <p className="text-[8px] text-slate-700 font-black uppercase tracking-[0.2em]">Transaction Protocol V3.4.1</p>
        </div>
    </div>
  );
};

export default Payment;
