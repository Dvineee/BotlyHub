
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Megaphone, Users, Loader2 } from 'lucide-react';
// Fixed: Use namespace import for react-router-dom to resolve "no exported member" errors
import * as Router from 'react-router-dom';
import { Channel } from '../types';
import { DatabaseService } from '../services/DatabaseService';
import { useTelegram } from '../hooks/useTelegram';

const { useNavigate } = Router as any;

const MyChannels = () => {
  const navigate = useNavigate();
  const { user } = useTelegram();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) loadChannels();
    else setIsLoading(false);
  }, [user]);

  const loadChannels = async () => {
    setIsLoading(true);
    // Fixed: getChannels method is now implemented in DatabaseService
    const data = await DatabaseService.getChannels(user.id.toString());
    setChannels(data);
    setIsLoading(false);
  };

  const addChannel = async () => {
      if(!user) return;
      const newChan: Partial<Channel> = {
          user_id: user.id.toString(),
          name: "Yeni Telegram Kanalı",
          memberCount: 0,
          icon: "https://picsum.photos/seed/chan/200",
          isAdEnabled: true,
          connectedBotIds: [],
          revenue: 0
      };
      // Fixed: saveChannel method is now implemented in DatabaseService
      await DatabaseService.saveChannel(newChan);
      loadChannels();
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 pt-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-900 rounded-full text-white"><ChevronLeft /></button>
            <h1 className="text-xl font-bold text-white">Kanallarım</h1>
        </div>
        <button onClick={addChannel} className="p-2 bg-blue-600 rounded-xl"> <Plus size={20} /> </button>
      </div>

      {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>
      ) : channels.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
              <Megaphone size={48} className="mx-auto mb-4 text-slate-700" />
              <p className="text-slate-500 text-sm">Bağlı kanal bulunamadı.</p>
              <button onClick={addChannel} className="mt-4 text-blue-500 font-bold text-sm">Hemen Kanal Ekle</button>
          </div>
      ) : (
          <div className="space-y-4">
              {channels.map(c => (
                  <div key={c.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <img src={c.icon} className="w-12 h-12 rounded-full border border-slate-800" />
                          <div>
                              <p className="font-bold text-white">{c.name}</p>
                              <p className="text-xs text-slate-500">{c.memberCount} Üye</p>
                          </div>
                      </div>
                      <div className="text-right">
                          <p className="text-[10px] text-slate-500 font-bold">Gelir</p>
                          <p className="text-emerald-400 font-bold">₺{c.revenue}</p>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default MyChannels;
