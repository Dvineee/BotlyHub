
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Share2, Send, Loader2, Star, ShieldCheck, Bot as BotIcon } from 'lucide-react';
import * as Router from 'react-router-dom';
import { Bot, UserBot } from '../types';
import { useTelegram } from '../hooks/useTelegram';
import { DatabaseService } from '../services/DatabaseService';
import { useTranslation } from '../TranslationContext';

const { useNavigate, useParams } = Router as any;

const BotDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { haptic, openLink, notification, tg } = useTelegram();
  const { t } = useTranslation();
  
  const [bot, setBot] = useState<Bot | null>(null);
  const [isOwned, setIsOwned] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBotData = async () => {
      if (!id) return;
      setIsLoading(true);
      const data = await DatabaseService.getBotById(id);
      setBot(data);
      const ownedBots = JSON.parse(localStorage.getItem('ownedBots') || '[]');
      if (ownedBots.find((b: UserBot) => b.id === id)) setIsOwned(true);
      setIsLoading(false);
    };
    fetchBotData();
  }, [id]);

  const handleAction = () => {
      haptic('medium');
      if (isOwned) {
          if (tg && bot?.bot_link) {
              tg.openTelegramLink(bot.bot_link);
          } else if (bot?.bot_link) {
              window.open(bot.bot_link, '_blank');
          }
          return;
      }
      
      if (bot?.price === 0) {
          const ownedBots = JSON.parse(localStorage.getItem('ownedBots') || '[]');
          localStorage.setItem('ownedBots', JSON.stringify([...ownedBots, { ...bot, isAdEnabled: false, isActive: true }]));
          setIsOwned(true);
          notification('success');
      } else {
          navigate(`/payment/${id}`);
      }
  };

  if (isLoading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center"><Loader2 className="animate-spin text-purple-500" /></div>;
  if (!bot) return <div className="min-h-screen bg-[#020617] text-white p-20 text-center font-bold">Bot bulunamadı.</div>;

  return (
    <div className="min-h-screen bg-[#020617] pb-32 animate-in fade-in">
      <div className="p-4 flex items-center justify-between sticky top-0 z-20 bg-[#020617]/90 backdrop-blur-xl border-b border-slate-900/50">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-slate-900/50 rounded-full border border-slate-800 text-slate-400 active:scale-90 transition-transform"><ChevronLeft size={22} /></button>
        <h1 className="text-sm font-black text-white uppercase tracking-[0.2em] truncate px-4">{bot.name}</h1>
        <button onClick={() => { haptic('light'); alert(t('share_copied')); }} className="p-2.5 bg-slate-900/50 rounded-full border border-slate-800 text-slate-400 active:scale-90 transition-transform"><Share2 size={22} /></button>
      </div>

      <div className="px-6 flex flex-col items-center mt-12">
          <div className="relative">
              <img src={bot.icon} className="w-36 h-36 rounded-[44px] shadow-2xl border-4 border-slate-900 object-cover" />
              {bot.price > 0 && <div className="absolute -top-2 -right-2 bg-yellow-500 text-slate-950 p-2 rounded-2xl shadow-lg border-2 border-slate-900"><Star size={20} fill="currentColor"/></div>}
          </div>
          
          <h2 className="text-3xl font-black mt-8 text-white text-center leading-tight">{bot.name}</h2>
          
          <div className="flex gap-2 mt-4">
              {/* Kategori Veritabanından gelen değeri (örn: Productivity) küçültüp sözlükten buluyoruz */}
              <span className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-widest">
                {t('cat_' + (bot.category || '').toLowerCase())}
              </span>
              <span className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck size={12}/> {t('verified')}
              </span>
          </div>
          
          <p className="text-center text-slate-400 mt-8 text-sm leading-relaxed max-w-sm font-medium">
              {bot.description}
          </p>
          
          <div className="mt-14 w-full">
              <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-8 text-center">{t('preview_screens')}</h3>
              <div className="flex gap-5 overflow-x-auto no-scrollbar -mx-6 px-6 pb-4">
                  {bot.screenshots && bot.screenshots.length > 0 ? bot.screenshots.map((url, i) => (
                      <img key={i} src={url} className="min-w-[240px] aspect-[9/16] rounded-[32px] object-cover bg-slate-900 shadow-2xl border border-slate-800 transition-transform hover:scale-[1.02]" />
                  )) : (
                      <div className="w-full h-48 bg-slate-900/50 rounded-[32px] border border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-700 italic gap-3">
                          <BotIcon size={32} />
                          <p className="text-xs font-bold uppercase tracking-widest">{t('no_images')}</p>
                      </div>
                  )}
              </div>
          </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#020617] via-[#020617]/90 to-transparent z-30 pb-10">
          <button 
             onClick={handleAction}
             className={`w-full py-5 rounded-[28px] text-white font-black shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${isOwned ? 'bg-blue-600 shadow-blue-500/20' : 'bg-[#7c3aed] shadow-purple-500/20'}`}
          >
              {isOwned ? <><Send size={20} /> {t('start_bot')}</> : (bot.price === 0 ? t('add_to_library') : `Stars ${bot.price} - ${t('buy_now')}`)}
          </button>
      </div>
    </div>
  );
};

export default BotDetail;
