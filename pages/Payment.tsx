
import React, { useState, useEffect } from 'react';
import { Wallet, CheckCircle2, Loader2, ShieldCheck, Zap, AlertTriangle, ShieldAlert, Star, ChevronLeft, CreditCard, Lock, ArrowRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { subscriptionPlans } from '../data';
import { Bot } from '../types';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Cell } from 'ton-core';
import { DatabaseService } from '../services/DatabaseService';
import { useTelegram } from '../hooks/useTelegram';
import { WalletService } from '../services/WalletService';
import PriceService from '../services/PriceService';
import { API_BASE_URL } from '../constants';

const getLiveBotIcon = (bot: Bot) => {
    if (bot.bot_link) {
        const username = bot.bot_link.replace('@', '').replace('https://t.me/', '').split('/').pop()?.trim();
        if (username) return `https://t.me/i/userpic/320/${username}.jpg`;
    }
    return bot.icon || `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=1e293b&color=fff&bold=true`;
};

const Payment = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { haptic, user, notification, tg } = useTelegram();
  const [isLoading, setIsLoading] = useState(false);
  const [targetBot, setTargetBot] = useState<Bot | null>(null);
  const [tonPrice, setTonPrice] = useState(250);
  const [tonConnectUI] = useTonConnectUI();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
        if (slug.startsWith('plan_')) {
            // It's a plan, no need to fetch bot
        } else {
            DatabaseService.getBotBySlug(slug).then(data => setTargetBot(data));
        }
        PriceService.getTonPrice().then(p => setTonPrice(p.tonTry));
    }
    
    if (tg) {
        tg.setHeaderColor('#12172c');
    }

    const testBackend = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/health`, { mode: 'cors' });
            if (!res.ok) console.warn("[PAYMENT] Backend health check failed:", res.status);
        } catch (e) {
            console.error("[PAYMENT] Backend is unreachable:", e);
        }
    };
    testBackend();
  }, [slug, tg]);

  const plan = subscriptionPlans.find(p => p.id === slug);
  const item = targetBot || plan;

  const handleSuccess = async (currentOrderId: string, txHash?: string) => {
      if (!item || !currentOrderId) return;
      
      haptic('heavy');
      notification('success');
      
      try {
          const userData = user || { id: 'guest', first_name: 'User' };
          await DatabaseService.updateTransactionStatus(currentOrderId, 'completed', txHash);

          if (targetBot) {
              await DatabaseService.addUserBot(userData, targetBot, false);
              await DatabaseService.logActivity(userData.id.toString(), 'payment', 'bot_purchase', 'Bot Satın Alımı', `${targetBot.name} botu başarıyla satın alındı.`);
              await DatabaseService.sendUserNotification(userData.id.toString(), 'Lisans Aktif Edildi', `'${targetBot.name}' lisans ödemeniz onaylandı.`, 'payment');
          } else if (plan) {
              localStorage.setItem('userPlan', plan.id);
              await DatabaseService.logActivity(userData.id.toString(), 'payment', 'plan_purchase', 'Abonelik Satın Alımı', `${plan.name} aboneliği aktif edildi.`);
              await DatabaseService.sendUserNotification(userData.id.toString(), 'Abonelik Aktif Edildi', `'${plan.name}' üyeliğiniz aktif edildi.`, 'payment');
          }
          
          navigate(targetBot ? '/my-bots' : '/settings');
      } catch (e) {
          console.error("Post-Payment Error:", e);
      }
  };

  const prices = item ? PriceService.convert(item.price, tonPrice) : { ton: 0 };

  const createOrder = async (currency: string, senderAddress?: string) => {
      const effectiveUser = user || { id: 'guest', first_name: 'User' };
      if (!item) return null;
      
      const url = `${API_BASE_URL}/api/payments/create-order`;

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
              throw new Error(`Sunucu hatası: ${response.status}`);
          }
          
          const data = await response.json();
          setOrderId(data.orderId);
          return data;
      } catch (e: any) {
          console.error("[PAYMENT] Order Creation Error:", e);
          alert("Sipariş oluşturma hatası: " + (e.message || "Lütfen tekrar deneyin."));
          return null;
      }
  };

  const payWithTON = async () => {
      if (!tonConnectUI.connected || !tonConnectUI.account) {
          notification('warning');
          await tonConnectUI.openModal();
          return;
      }

      setIsLoading(true);
      haptic('medium');
      
      try {
          const effectiveUser = user || { id: 'guest', first_name: 'User' };
          const walletAddress = tonConnectUI.account.address;
          const order = await createOrder('TON', walletAddress);
          if (!order || !order.signedPayload) {
              setIsLoading(false);
              return;
          }

          const transactionPayload = WalletService.createTonTransaction(prices.ton, order.signedPayload);
          const result = await tonConnectUI.sendTransaction(transactionPayload);
          
          if (result && result.boc) {
              const hash = Cell.fromBase64(result.boc).hash().toString('hex');
              const verifyRes = await fetch(`${API_BASE_URL}/api/payments/verify-ton`, {
                  method: 'POST',
                  mode: 'cors',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      transactionHash: hash,
                      orderId: order.orderId,
                      userId: effectiveUser.id.toString()
                  })
              });
              
              if (!verifyRes.ok) throw new Error("Doğrulama başarısız.");
              const verifyData = await verifyRes.json();
              
              if (verifyData.success) {
                  await handleSuccess(order.orderId, hash);
              } else {
                  throw new Error(verifyData.error || "İşlem doğrulanamadı.");
              }
          }
      } catch (e: any) {
          console.error("TON Payment Error:", e);
          notification('error');
          setIsLoading(false);
      }
  };

  const payWithStars = async () => {
      setIsLoading(true);
      haptic('medium');
      
      try {
          const order = await createOrder('STARS');
          if (!order) {
              setIsLoading(false);
              return;
          }

          if (tg && tg.openInvoice) {
              tg.openInvoice(order.invoiceUrl, async (status: string) => {
                  if (status === 'paid') {
                      await handleSuccess(order.orderId);
                  } else {
                      setIsLoading(false);
                  }
              });
          } else {
              alert("Bu ödeme yöntemi sadece Telegram içinde kullanılabilir.");
              setIsLoading(false);
          }
      } catch (e: any) {
          console.error("Stars Payment Error:", e);
          setIsLoading(false);
      }
  };

  if (!item) return <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-brand" size={40} /></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 transition-colors duration-300">
        {/* Header Navigation */}
        <header className="fixed top-0 inset-x-0 h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl z-50 border-b border-black/5 dark:border-white/5 px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Lock size={14} className="text-emerald-500" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] italic text-slate-400">Güvenli Ödeme</span>
            </div>
            <div className="w-10" />
        </header>

        <main className="pt-24 pb-20 px-6 max-w-2xl mx-auto">
            {/* Order Summary Card */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900/60 rounded-xl border border-black/5 dark:border-white/10 overflow-hidden  relative mb-8"
            >
                <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-br from-brand via-brand/50 to-indigo-600 opacity-20 dark:opacity-40"></div>
                <div className="relative pt-12 pb-10 px-8 text-center flex flex-col items-center">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-brand/20 dark:bg-brand-light/20 blur-[30px] rounded-full scale-125"></div>
                        <img 
                            src={targetBot ? getLiveBotIcon(targetBot) : `https://ui-avatars.com/api/?name=${encodeURIComponent(plan?.name || 'P')}&background=1e293b&color=fff&bold=true`} 
                            className="w-24 h-24 rounded-xl border-4 border-white dark:border-slate-800  relative z-10 bg-slate-100 dark:bg-slate-900 object-cover" 
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                                if (targetBot) {
                                    (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(targetBot.name)}&background=1e293b&color=fff&bold=true`;
                                }
                            }}
                        />
                    </div>
                    
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic leading-tight mb-1">
                        {item.name}
                    </h2>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-8">Sipariş Özeti</p>
                    
                    <div className="w-full bg-slate-50 dark:bg-black/20 rounded-xl p-6 border border-black/5 dark:border-white/5 flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap size={14} className="text-brand dark:text-brand-light" />
                            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest italic">Toplam Tutar</span>
                        </div>
                        <div className="text-4xl font-black text-slate-900 dark:text-white italic tracking-tighter flex items-baseline gap-2">
                            {prices.ton} <span className="text-lg uppercase text-brand">TON</span>
                        </div>
                        <div className="mt-2 text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-2">
                            <span>veya</span>
                            <span className="flex items-center gap-1 font-black text-amber-500">
                                <Star size={10} className="fill-amber-500" />
                                {item.price} Yıldız
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Payment Methods Section */}
            <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-700 uppercase tracking-[0.4em] px-4 mb-4">ÖDEME YÖNTEMLERİ</h3>
                
                <motion.button 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={payWithTON} 
                    disabled={isLoading}
                    className="w-full group relative overflow-hidden bg-brand dark:bg-brand-light p-6 rounded-xl flex items-center justify-between active:scale-[0.98] transition-all disabled:opacity-50  "
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Wallet size={20} />}
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-black text-white italic tracking-wide">TON Wallet</p>
                            <p className="text-[10px] text-white/60 font-medium uppercase tracking-widest">Merkeziyetsiz Ödeme</p>
                        </div>
                    </div>
                    <ArrowRight size={18} className="text-white/60 relative z-10 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <motion.button 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={payWithStars} 
                    disabled={isLoading}
                    className="w-full group relative overflow-hidden bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 p-6 rounded-xl flex items-center justify-between active:scale-[0.98] transition-all disabled:opacity-50 "
                >
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Star size={20} />}
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-black text-slate-900 dark:text-white italic tracking-wide uppercase">Telegram Stars</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest">Kolay ve Hızlı</p>
                        </div>
                    </div>
                    <ArrowRight size={18} className="text-slate-200 dark:text-white/10 relative z-10 group-hover:translate-x-1 transition-transform" />
                </motion.button>
            </div>

            {/* Support/Footer */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 0.4 }}
                className="mt-12 flex flex-col items-center gap-6 text-center"
            >
                <div className="flex items-center justify-center flex-wrap gap-x-8 gap-y-4">
                    <div className="flex items-center gap-2 opacity-60">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">AES-256 Şifreleme</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-60">
                        <ShieldAlert size={14} className="text-brand" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Güvenli Katman</span>
                    </div>
                </div>
                <p className="max-w-[240px] text-[10px] text-slate-400 leading-relaxed font-medium uppercase tracking-tighter">
                    Ödeme işlemleriniz uçtan uca şifrelenir ve asla sunucularımızda saklanmaz.
                </p>
            </motion.div>
        </main>
    </div>
  );
};

export default Payment;
