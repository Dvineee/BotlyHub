
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Share2, Send, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Bot, UserBot } from '../types';
import { useTelegram } from '../hooks/useTelegram';
import { DatabaseService } from '../services/DatabaseService';

const BotDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { haptic, openLink, notification, tg } = useTelegram();
  
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
          // Telegram içinde açmak için openTelegramLink kullanılır
          if (tg && bot?.bot_link) {
              tg.openTelegramLink(bot.bot_link);
          } else {
              openLink(bot?.bot_link || '');
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
  if (!bot) return <div className="text-white p-20 text-center">Bot bulunamadı.</div>;

  return (
    <div className="min-h-screen bg-[#020617] pb-32">
      <div className="p-4 flex items-center justify-between sticky top-0 z-20 bg-[#020617]/80 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 bg-slate-900 rounded-full"><ChevronLeft size={24} /></button>
        <h1 className="text-lg font-bold text-white truncate">{bot.name}</h1>
        <button onClick={() => haptic('light')} className="p-2 bg-slate-900 rounded-full"><Share2 size={24} /></button>
      </div>

      <div className="px-6 flex flex-col items-center mt-10">
          <img src={bot.icon} className="w-32 h-32 rounded-[40px] shadow-2xl border-4 border-slate-900" />
          <h2 className="text-3xl font-black mt-6 text-white text-center">{bot.name}</h2>
          <span className="text-xs font-black px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase mt-3">{bot.category}</span>
          <p className="text-center text-slate-500 mt-6 text-sm leading-relaxed max-w-xs">{bot.description}</p>
          
          <div className="mt-12 w-full">
              <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6">Önizleme Galerisi</h3>
              <div className="flex gap-4 overflow-x-auto no-scrollbar">
                  {bot.screenshots?.map((url, i) => (
                      <img key={i} src={url} className="min-w-[200px] aspect-[9/16] rounded-3xl object-cover bg-slate-900 shadow-xl" />
                  )) || <div className="w-full h-40 bg-slate-900 rounded-3xl flex items-center justify-center text-slate-700 italic text-xs">Görsel bulunmuyor.</div>}
              </div>
          </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#020617] to-transparent z-30">
          <button 
             onClick={handleAction}
             className={`w-full py-5 rounded-[24px] text-white font-black shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${isOwned ? 'bg-blue-600' : 'bg-[#7c3aed]'}`}
          >
              {isOwned ? <><Send size={20} /> Botu Telegram'da Başlat</> : (bot.price === 0 ? 'Ücretsiz Ekle' : `₺${bot.price} - Hemen Al`)}
          </button>
      </div>
    </div>
  );
};

export default BotDetail;
