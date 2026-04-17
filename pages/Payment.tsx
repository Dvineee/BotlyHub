
import React, { useState, useEffect } from 'react';
import { Wallet, CheckCircle2, Loader2, ShieldCheck, Zap, AlertTriangle, ShieldAlert, Star } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { subscriptionPlans } from '../data';
import { Bot } from '../types';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Cell } from 'ton-core';
import { DatabaseService } from '../services/DatabaseService';
import { useTelegram } from '../hooks/useTelegram';
import { WalletService } from '../services/WalletService';
import PriceService from '../services/PriceService';
import { API_BASE_URL } from '../constants';

const Payment = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { haptic, user, notification, tg } = useTelegram();
  const [isLoading, setIsLoading] = useState(false);
  const [targetBot, setTargetBot] = useState<Bot | null>(null);
  const [tonPrice, setTonPrice] = useState(250);
  const [tonConnectUI] = useTonConnectUI();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
        DatabaseService.getBotById(id).then(data => setTargetBot(data));
        PriceService.getTonPrice().then(p => setTonPrice(p.tonTry));
    }
    
    if (tg) {
        tg.setHeaderColor('#020617');
    }

    // Test backend connectivity
    const testBackend = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/health`, { mode: 'cors' });
            if (res.ok) {
                console.log("[PAYMENT] Backend is reachable");
            } else {
                console.warn("[PAYMENT] Backend health check failed:", res.status);
            }
        } catch (e) {
            console.error("[PAYMENT] Backend is unreachable:", e);
        }
    };
    testBackend();
  }, [id, tg]);

  const plan = subscriptionPlans.find(p => p.id === id);
  const item = targetBot || plan;

  const handleSuccess = async (currentOrderId: string, txHash?: string) => {
      if (!item || !currentOrderId) return;
      
      haptic('heavy');
      notification('success');
      
      try {
          const userData = user || { id: 'guest', first_name: 'User' };
          
          // Update transaction in DB
          await DatabaseService.updateTransactionStatus(currentOrderId, 'completed', txHash);

          if (targetBot) {
              await DatabaseService.addUserBot(userData, targetBot, false);
              await DatabaseService.logActivity(userData.id.toString(), 'payment', 'bot_purchase', 'Bot Satın Alımı', `${targetBot.name} botu başarıyla satın alındı ve kütüphaneye eklendi.`);
              await DatabaseService.sendUserNotification(
                  userData.id.toString(),
                  'Lisans Aktif Edildi',
                  `'${targetBot.name}' lisans ödemeniz onaylandı.`,
                  'payment'
              );
          } else if (plan) {
              localStorage.setItem('userPlan', plan.id);
              await DatabaseService.logActivity(userData.id.toString(), 'payment', 'plan_purchase', 'Abonelik Satın Alımı', `${plan.name} aboneliği başarıyla aktif edildi.`);
              await DatabaseService.sendUserNotification(
                  userData.id.toString(),
                  'Abonelik Aktif Edildi',
                  `'${plan.name}' üyeliğiniz başarıyla aktif edildi.`,
                  'payment'
              );
          }
          
          navigate(targetBot ? '/my-bots' : '/settings');
      } catch (e) {
          console.error("Post-Payment Error:", e);
          alert("Ödeme sonrası işlem başarısız: " + (e instanceof Error ? e.message : String(e)));
      }
  };

  const prices = item ? PriceService.convert(item.price, tonPrice) : { ton: 0 };

  const createOrder = async (currency: string, senderAddress?: string) => {
      const effectiveUser = user || { id: 'guest', first_name: 'User' };
      if (!item) return null;
      
      const url = `${API_BASE_URL}/api/payments/create-order`;
      console.log(`[PAYMENT] Creating order at: ${url}`);

      try {
          const response = await fetch(url, {
              method: 'POST',
              mode: 'cors',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  userId: effectiveUser.id.toString(),
                  itemId: item.id,
                  itemType: targetBot ? 'bot' : 'plan',
                  amount: currency === 'TON' ? prices.ton : item.price,
                  currency,
                  senderAddress
              })
          });
          
          if (!response.ok) {
              const text = await response.text();
              console.error(`[PAYMENT] Order creation failed (${response.status}):`, text);
              try {
                  const data = JSON.parse(text);
                  const errorDetail = typeof data.error === 'object' ? JSON.stringify(data.error) : data.error;
                  throw new Error(errorDetail || `Sunucu hatası: ${response.status}`);
              } catch (parseError) {
                  throw new Error(`Sunucu hatası (${response.status}): ${text.substring(0, 100)}`);
              }
          }
          
          const data = await response.json();
          setOrderId(data.orderId);
          return data;
      } catch (e: any) {
          console.error("[PAYMENT] Order Creation Error:", e);
          // Check if it's a fetch error
          if (e.message === 'Failed to fetch' || e.name === 'TypeError') {
              alert(`Bağlantı Hatası: Sunucuya ulaşılamıyor.\n\nDetaylar:\n- Hedef: ${url}\n- Mevcut Origin: ${window.location.origin}\n- Hata: ${e.message}\n\nLütfen internet bağlantınızı kontrol edin veya tarayıcı ayarlarınızdan bu siteye izin verildiğinden emin olun.`);
          } else {
              alert("Sipariş oluşturma hatası: " + (e.message || "Bilinmeyen hata"));
          }
          return null;
      }
  };

  const payWithTON = async () => {
      if (!tonConnectUI.connected || !tonConnectUI.account) {
          notification('warning');
          await tonConnectUI.openModal();
          return;
      }

      if (!item) {
          alert("Ürün bulunamadı. Lütfen tekrar deneyin.");
          return;
      }

      setIsLoading(true);
      haptic('medium');
      
      try {
          const effectiveUser = user || { id: 'guest', first_name: 'User' };
          const walletAddress = tonConnectUI.account.address;
          const order = await createOrder('TON', walletAddress);
          if (!order || !order.signedPayload) {
              if (order && !order.signedPayload) {
                  alert("Sunucudan imzalı veri alınamadı. Lütfen tekrar deneyin.");
              }
              setIsLoading(false);
              return;
          }

          const transactionPayload = WalletService.createTonTransaction(prices.ton, order.signedPayload);
          const result = await tonConnectUI.sendTransaction(transactionPayload);
          
          if (result && result.boc) {
              try {
                  // Calculate transaction hash from BOC
                  const hash = Cell.fromBase64(result.boc).hash().toString('hex');
                  console.log("Calculated Transaction Hash:", hash);

                  // Verify on backend
                  const verifyUrl = `${API_BASE_URL}/api/payments/verify-ton`;
                  console.log(`[PAYMENT] Verifying transaction at: ${verifyUrl}`);

                  const verifyRes = await fetch(verifyUrl, {
                      method: 'POST',
                      mode: 'cors',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                          transactionHash: hash,
                          orderId: order.orderId,
                          userId: effectiveUser.id.toString()
                      })
                  });
                  
                  if (!verifyRes.ok) {
                      const text = await verifyRes.text();
                      console.error(`[PAYMENT] Verification failed (${verifyRes.status}):`, text);
                      throw new Error(`Doğrulama hatası (${verifyRes.status}): ${text.substring(0, 100)}`);
                  }

                  const verifyData = await verifyRes.json();
                  
                  if (verifyData.success) {
                      await handleSuccess(order.orderId, hash);
                  } else {
                      throw new Error(verifyData.error || "İşlem doğrulanamadı.");
                  }
              } catch (cellError: any) {
                  console.error("BOC Parsing Error:", cellError);
                  alert("İşlem verisi okunamadı, ancak ödeme gönderilmiş olabilir. Lütfen destek ile iletişime geçin.");
                  setIsLoading(false);
              }
          }
      } catch (e: any) {
          console.error("TON Payment Error:", e);
          notification('error');
          alert("Ödeme hatası: " + (e.message || "Lütfen tekrar deneyin."));
          setIsLoading(false);
      }
  };

  const payWithStars = async () => {
      setIsLoading(true);
      haptic('medium');
      
      try {
          const effectiveUser = user || { id: 'guest', first_name: 'User' };
          const order = await createOrder('STARS');
          if (!order) return; // createOrder already alerted the user

          // Telegram Stars Invoice
          if (tg && tg.openInvoice) {
              tg.openInvoice(order.invoiceUrl, async (status: string) => {
                  if (status === 'paid') {
                      await handleSuccess(order.orderId);
                  } else {
                      setIsLoading(false);
                  }
              });
          } else {
              // Fallback for non-telegram environments
              alert("Bu ödeme yöntemi sadece Telegram içinde kullanılabilir.");
              setIsLoading(false);
          }
      } catch (e: any) {
          console.error("Stars Payment Error:", e);
          alert("Yıldız ödeme hatası: " + (e.message || "Lütfen tekrar deneyin."));
          setIsLoading(false);
      }
  };

  if (!item) return <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] p-6 pt-10 pb-32 animate-in fade-in transition-colors duration-300">
        <div className="flex items-center justify-end mb-10 px-1">
            <div className="flex items-center gap-2 px-4 py-2 bg-brand/10 dark:bg-brand-light/10 border border-brand/20 dark:border-brand-light/20 rounded-full shadow-lg">
                <ShieldCheck size={14} className="text-brand dark:text-brand-light" />
                <span className="text-[10px] font-bold text-brand dark:text-brand-light uppercase tracking-widest">Güvenli Ödeme</span>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-900/40 rounded-[48px] p-10 border border-black/5 dark:border-white/5 mb-10 text-center relative overflow-hidden shadow-2xl backdrop-blur-xl">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand via-indigo-600 to-blue-600"></div>
            
            <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-brand/20 dark:bg-brand-light/20 blur-[40px] rounded-full"></div>
                <img 
                    src={targetBot ? (targetBot.icon || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetBot.name)}&background=334155&color=fff`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(plan?.name || 'P')}&background=1e293b&color=fff`} 
                    className="w-32 h-32 rounded-[32px] border-4 border-slate-100 dark:border-slate-800 shadow-2xl object-cover relative z-10 bg-slate-200 dark:bg-slate-900" 
                    referrerPolicy="no-referrer"
                />
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{item.name}</h2>
            <p className="text-slate-500 text-[10px] mb-10 font-bold uppercase tracking-widest">Satın Alma Onayı</p>
            
            <div className="bg-slate-50 dark:bg-slate-950/50 p-8 rounded-[32px] border border-black/5 dark:border-white/5 shadow-inner">
                <div className="flex flex-col items-center">
                    <Zap size={32} className="text-brand dark:text-brand-light mb-3" />
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-1">Toplam Tutar</span>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{prices.ton} TON</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase mt-2">veya {item.price} Yıldız</p>
                </div>
            </div>
        </div>

        <div className="space-y-4">
            <button 
                onClick={payWithTON} 
                disabled={isLoading}
                className="w-full bg-brand dark:bg-brand-light hover:opacity-90 py-6 rounded-[28px] text-white font-bold shadow-2xl shadow-blue-900/30 flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest text-xs"
            >
                {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Wallet size={24} />}
                TON ile Öde
            </button>

            <button 
                onClick={payWithStars} 
                disabled={isLoading}
                className="w-full bg-amber-500 hover:bg-amber-400 py-6 rounded-[28px] text-white font-bold shadow-2xl shadow-amber-900/30 flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest text-xs"
            >
                {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Star size={24} />}
                Yıldız ile Öde
            </button>
        </div>
        
        <div className="mt-12 flex flex-col items-center gap-6 opacity-40">
            <div className="flex items-center gap-3">
                <ShieldAlert size={18} className="text-slate-400 dark:text-slate-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] italic text-slate-400 dark:text-slate-500">Güvenli ve Şeffaf Ödeme</span>
            </div>
        </div>
    </div>
  );
};

export default Payment;
