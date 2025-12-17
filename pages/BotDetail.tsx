
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Share2, Bookmark, Send, Loader2, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Bot, UserBot } from '../types';
import { useTelegram } from '../hooks/useTelegram';
import { DatabaseService } from '../services/DatabaseService';

const BotDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { haptic, openLink, notification } = useTelegram();
  
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
      const owned = ownedBots.find((b: UserBot) => b.id === id);
      if (owned) setIsOwned(true);
      
      setIsLoading(false);
    };
    fetchBotData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="animate-spin text-blue-500 mb-2" size={32} />
        <span>Yükleniyor...</span>
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-center text-slate-500 flex flex-col items-center justify-center">
        <p className="text-lg font-bold text-white mb-2">Bot bulunamadı.</p>
        <button onClick={() => navigate('/')} className="bg-slate-800 text-white px-6 py-2 rounded-xl text-sm font-bold">Market'e Dön</button>
      </div>
    );
  }

  const handleAction = () => {
      haptic('medium');
      if (isOwned) {
          openLink(bot.bot_link);
          return;
      }
      if (bot.price === 0) {
          const newBot: UserBot = {
              ...bot,
              isAdEnabled: false,
              isActive: true
          };
          const currentBots = JSON.parse(localStorage.getItem('ownedBots') || '[]');
          localStorage.setItem('ownedBots', JSON.stringify([...currentBots, newBot]));
          setIsOwned(true);
          notification('success');
      } else {
          navigate(`/payment/${id}`);
      }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-24">
      <div className="p-4 flex items-center justify-between sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-900/50">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-800 rounded-full"><ChevronLeft className="w-6 h-6 text-slate-200" /></button>
        <h1 className="text-lg font-bold text-white truncate">{bot.name}</h1>
        <button onClick={() => haptic('light')} className="p-2 hover:bg-slate-800 rounded-full"><Share2 className="w-6 h-6 text-slate-400" /></button>
      </div>

      <div className="px-6">
          <div className="flex flex-col items-center mt-6 mb-8">
              <div className="w-32 h-32 rounded-3xl bg-slate-800 border-4 border-slate-800 shadow-2xl overflow-hidden">
                   <img src={bot.icon} alt={bot.name} className="w-full h-full object-cover" />
              </div>
              <h2 className="text-2xl font-bold mt-5 text-center text-white">{bot.name}</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 uppercase mt-2">{bot.category}</span>
              <p className="text-center text-slate-400 mt-4 text-sm leading-relaxed">{bot.description}</p>
          </div>

          <div className="mt-8">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Önizleme</h3>
               <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-6 px-6">
                   {bot.screenshots && bot.screenshots.length > 0 ? (
                       bot.screenshots.map((url, i) => (
                           <div key={i} className="min-w-[200px] aspect-[9/16] bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
                                <img src={url} className="w-full h-full object-cover" alt={`Screenshot ${i}`} />
                           </div>
                       ))
                   ) : (
                       <div className="w-full p-10 text-center border border-dashed border-slate-800 rounded-xl text-slate-600 italic text-sm">Görsel eklenmemiş.</div>
                   )}
               </div>
          </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800 p-4 pb-8 z-50">
          <button 
             className={`w-full text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 ${isOwned ? 'bg-blue-600' : 'bg-emerald-600'}`}
             onClick={handleAction}
          >
              {isOwned ? <><Send size={18} /><span>Botu Telegram'da Başlat</span></> : (bot.price === 0 ? 'Hemen Ekle - Ücretsiz' : `Satın Al - ₺${bot.price}`)}
          </button>
      </div>
    </div>
  );
};

export default BotDetail;
