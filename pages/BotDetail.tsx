
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Share2, Send, Loader2, Star, ShieldCheck, Bot as BotIcon, Lock, CheckCircle2 } from 'lucide-react';
import * as Router from 'react-router-dom';
import { Bot, UserBot } from '../types';
import { useTelegram } from '../hooks/useTelegram';
import { DatabaseService } from '../services/DatabaseService';
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

  useEffect(() => {
    fetchBotData();
  }, [id, user]);

  const fetchBotData = async () => {
    if (!id) return;
    setIsLoading(true);
    
    try {
        // 1. Bot verisini getir
        let data = await DatabaseService.getBotById(id);
        if (!data) {
            const { mockBots } = await import('../data');
            data = mockBots.find(b => b.id === id) || null;
        }
        setBot(data);

        // 2. Mülkiyet kontrolü (Kullanıcıda bot var mı?)
        if (user?.id) {
            const dbBots = await DatabaseService.getUserBots(user.id.toString());
            const owned = dbBots.some(b => b.id === id);
            setIsOwned(owned);
            
            // LocalStorage sync (opsiyonel ama tutarlılık için iyi)
            const localOwned = JSON.parse(localStorage.getItem('ownedBots') || '[]');
            if (owned && !localOwned.some((b: any) => b.id === id)) {
                localStorage.setItem('ownedBots', JSON.stringify([...localOwned, data]));
            } else if (!owned && localOwned.some((b: any) => b.id === id)) {
                localStorage.setItem('ownedBots', JSON.stringify(localOwned.filter((b: any) => b.id !== id)));
            }
        } else {
            const localOwned = JSON.parse(localStorage.getItem('ownedBots') || '[]');
            setIsOwned(localOwned.some((b: UserBot) => b.id === id));
        }
    } catch (e) {
        console.error("Bot detayı çekilemedi", e);
    } finally {
        setIsLoading(false);
    }
  };

  const handleAction = async () => {
      if (isProcessing || !bot) return;
      haptic('medium');
      
      // Eğer kullanıcı botu kaldırmışsa (isOwned = false), bu butona basıldığında satın almaya veya eklemeye gider.
      if (isOwned) {
          const username = bot.bot_link.replace('@', '').trim();
          const finalUrl = `https://t.me/${username}`;
          
          if (tg && tg.openTelegramLink) {
              tg.openTelegramLink(finalUrl);
          } else {
              window.open(finalUrl, '_blank');
          }
          return;
      }
      
      // Ücretsiz botları kütüphaneye ekle
      if (bot.price === 0) {
          setIsProcessing(true);
          try {
              const userData = user || { id: 'test_user', first_name: 'Misafir', username: 'guest' };
              await DatabaseService.addUserBot(userData, bot, false);
              
              setIsOwned(true);
              notification('success');
              haptic('heavy');
          } catch (e: any) {
              notification('error');
              alert("Hata: " + e.message);
          } finally {
              setIsProcessing(false);
          }
      } else {
          // Ücretli bot ise ödeme sayfasına
          navigate(`/payment/${id}`);
      }
  };

  if (isLoading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;
  if (!bot) return <div className="min-h-screen bg-[#020617] text-white p-20 text-center font-bold italic uppercase tracking-widest opacity-20">Bot Not Found</div>;

  return (
    <div className="min-h-screen bg-[#020617] pb-40 animate-in fade-in">
      <div className="p-4 flex items-center justify-between sticky top-0 z-20 bg-[#020617]/90 backdrop-blur-xl border-b border-slate-900/50">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-slate-900/50 rounded-full border border-slate-800 text-slate-400 active:scale-90 transition-transform"><ChevronLeft size={22} /></button>
        <h1 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] truncate px-4">{isOwned ? 'Kütüphanenizde' : 'Bot Detayı'}</h1>
        <button onClick={() => { haptic('light'); alert("Link paylaşıma hazır!"); }} className="p-2.5 bg-slate-900/50 rounded-full border border-slate-800 text-slate-400 active:scale-90 transition-transform"><Share2 size={22} /></button>
      </div>

      <div className="px-6 flex flex-col items-center mt-12">
          <div className="relative group">
              <div className={`absolute inset-0 blur-3xl opacity-20 rounded-full transition-all ${isOwned ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
              <img src={bot.icon} className={`w-40 h-40 rounded-[48px] shadow-2xl border-4 relative z-10 object-cover transition-all ${isOwned ? 'border-blue-500/50 scale-105' : 'border-slate-800 grayscale-[0.5]'}`} />
              {isOwned && (
                <div className="absolute -bottom-2 -right-2 z-20 bg-blue-600 text-white p-2.5 rounded-2xl shadow-xl border-4 border-[#020617] animate-in zoom-in">
                    <CheckCircle2 size={24} />
                </div>
              )}
          </div>
          
          <h2 className="text-3xl font-black mt-10 text-white text-center italic tracking-tighter uppercase">{bot.name}</h2>
          
          <div className="flex gap-2 mt-5">
              <span className="text-[9px] font-black px-3 py-1.5 rounded-xl bg-slate-900 text-slate-500 border border-slate-800 uppercase tracking-widest italic">
                {bot.category}
              </span>
              <span className="text-[9px] font-black px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck size={12}/> Verified
              </span>
          </div>
          
          {!isOwned && (
              <div className="mt-8 p-6 bg-slate-900/50 border border-slate-800 rounded-[32px] flex items-start gap-4 max-w-sm">
                  <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shrink-0 text-slate-500"><Lock size={20}/></div>
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                      Bu bot kütüphanenizde bulunmuyor. Kullanmak için önce eklemeli veya satın almalısınız.
                  </p>
              </div>
          )}

          <p className="text-center text-slate-500 mt-10 text-sm leading-relaxed max-w-sm font-medium">
              {bot.description}
          </p>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#020617] via-[#020617] to-transparent z-30">
          <div className="max-w-md mx-auto">
              <button 
                onClick={handleAction}
                disabled={isProcessing}
                className={`w-full py-6 rounded-[32px] text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${isOwned ? 'bg-blue-600 shadow-blue-900/40' : 'bg-[#7c3aed] shadow-purple-900/40'} disabled:opacity-50`}
              >
                  {isProcessing ? <Loader2 className="animate-spin"/> : (
                      isOwned ? <><Send size={18} /> Botu Şimdi Başlat</> : (
                          bot.price === 0 ? <><BotIcon size={18} /> Kütüphaneye Ücretsiz Ekle</> : <><Star size={18} fill="currentColor"/> Stars {bot.price} - Satın Al</>
                      )
                  )}
              </button>
              {isOwned ? (
                  <p className="text-center text-[9px] text-slate-600 font-black uppercase tracking-widest mt-4 animate-pulse italic">
                      Bot kütüphanenizde aktif. İstediğiniz zaman kaldırabilirsiniz.
                  </p>
              ) : (
                <p className="text-center text-[9px] text-slate-700 font-black uppercase tracking-widest mt-4 italic">
                    Kullanmak için mülkiyet doğrulaması gereklidir.
                </p>
              )}
          </div>
      </div>
    </div>
  );
};

export default BotDetail;
