
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Megaphone, Users, DollarSign, AlertCircle, Radio, Info, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Channel, UserBot } from '../types';

const MyChannels = () => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [bots, setBots] = useState<UserBot[]>([]);
  const [showInfo, setShowInfo] = useState(false);

  // Load channels and bots from local storage
  useEffect(() => {
    const ownedBots = JSON.parse(localStorage.getItem('ownedBots') || '[]');
    const userChannels = JSON.parse(localStorage.getItem('userChannels') || '[]');
    setBots(ownedBots);
    setChannels(userChannels);
  }, []);

  const simulateConnectChannel = () => {
      if (bots.length === 0) {
          alert("Kanal bağlamak için önce en az bir bota sahip olmalısınız.");
          return;
      }

      // Random mock channel generator
      const randomId = Math.random().toString(36).substr(2, 9);
      const names = ["Sohbet Grubu", "Duyurular", "Oyun Odası", "Müzik Paylaşım", "Kripto Analiz"];
      const randomName = names[Math.floor(Math.random() * names.length)] + " " + Math.floor(Math.random() * 100);
      
      // Assign random 1-2 bots to this channel
      const shuffledBots = [...bots].sort(() => 0.5 - Math.random());
      const selectedBots = shuffledBots.slice(0, Math.floor(Math.random() * 2) + 1).map(b => b.id);

      const newChannel: Channel = {
          id: randomId,
          name: randomName,
          memberCount: Math.floor(Math.random() * 4500) + 100,
          icon: `https://picsum.photos/seed/${randomId}/100`,
          isAdEnabled: true,
          connectedBotIds: selectedBots,
          revenue: parseFloat((Math.random() * 500).toFixed(2))
      };

      const updatedChannels = [...channels, newChannel];
      setChannels(updatedChannels);
      localStorage.setItem('userChannels', JSON.stringify(updatedChannels));
  };

  const toggleChannelAdGlobal = (channelId: string) => {
      const updatedChannels = channels.map(ch => 
          ch.id === channelId ? { ...ch, isAdEnabled: !ch.isAdEnabled } : ch
      );
      setChannels(updatedChannels);
      localStorage.setItem('userChannels', JSON.stringify(updatedChannels));
  };

  // Helper to determine which bot is effectively publishing ads
  const getActiveAdBot = (channel: Channel): UserBot | null => {
      if (!channel.isAdEnabled) return null;

      // Filter connected bots
      const channelBots = bots.filter(b => channel.connectedBotIds.includes(b.id));
      
      // Find the first one that has ads enabled
      const adBot = channelBots.find(b => b.isAdEnabled);
      
      return adBot || null;
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 pt-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-900 rounded-full">
                <ChevronLeft className="w-6 h-6 text-slate-200" />
            </button>
            <h1 className="text-xl font-bold text-white">Kanallarım</h1>
        </div>
        <button 
            onClick={() => setShowInfo(true)}
            className="p-2 hover:bg-slate-800 rounded-full text-blue-400 transition-colors"
        >
            <Info size={22} />
        </button>
      </div>

      {/* Info Modal */}
      {showInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowInfo(false)}></div>
              <div className="bg-slate-900 w-full max-w-sm rounded-2xl border border-slate-800 p-6 relative z-10 animate-in zoom-in-95">
                  <button onClick={() => setShowInfo(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Megaphone size={20} className="text-blue-500" />
                      Nasıl Çalışır?
                  </h3>
                  <ol className="space-y-4 text-sm text-slate-300 list-decimal pl-4">
                      <li>Satın aldığınız botu <span className="text-white font-bold">Botu Başlat</span> diyerek Telegram'da açın.</li>
                      <li>Botu yönetmek istediğiniz Kanal veya Gruba <span className="text-white font-bold">Yönetici</span> olarak ekleyin.</li>
                      <li>Uygulamaya dönüp <span className="text-white font-bold">Kanal Bağla</span> butonuna basın.</li>
                      <li>Kanalınız otomatik olarak burada görünecektir.</li>
                      <li><span className="text-emerald-400 font-bold">Gelir Modu</span>'nu açarak reklam yayınlamaya başlayın.</li>
                  </ol>
                  <button onClick={() => setShowInfo(false)} className="w-full mt-6 bg-slate-800 text-white py-3 rounded-xl font-bold text-sm">Anlaşıldı</button>
              </div>
          </div>
      )}

      {/* Channel List */}
      <div className="space-y-4">
        {channels.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-12 text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800/50 border-dashed">
                <Megaphone size={48} className="mb-4 opacity-20" />
                <p>Henüz bağlı bir kanalınız yok.</p>
                <p className="text-xs text-slate-600 mt-2 text-center max-w-[200px]">Sağ üstteki bilgi butonuna tıklayarak nasıl bağlayacağınızı öğrenin.</p>
                <button 
                    onClick={simulateConnectChannel}
                    className="mt-6 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-blue-900/30"
                >
                    <Plus size={16} className="inline mr-2" />
                    Kanalı Otomatik Bul (Sim)
                </button>
            </div>
        ) : (
            <>
                <div className="flex justify-end mb-2">
                    <button 
                        onClick={simulateConnectChannel}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                        <Plus size={14} /> Yeni Kanal Tara
                    </button>
                </div>
                {channels.map((channel) => {
                    const activeAdBot = getActiveAdBot(channel);
                    const channelBots = bots.filter(b => channel.connectedBotIds.includes(b.id));

                    return (
                        <div key={channel.id} className="bg-slate-900 rounded-2xl p-4 border border-slate-800 relative overflow-hidden shadow-sm">
                            {/* Channel Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <img src={channel.icon} alt={channel.name} className="w-14 h-14 rounded-full object-cover border-2 border-slate-800 bg-slate-800" />
                                    <div>
                                        <h3 className="font-bold text-lg text-white">{channel.name}</h3>
                                        <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                                            <Users size={12} />
                                            <span>{channel.memberCount.toLocaleString()} Üye</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Top. Gelir</p>
                                    <p className="text-lg font-bold text-emerald-400">₺{channel.revenue}</p>
                                </div>
                            </div>

                            {/* Master Ad Toggle */}
                            <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/50 flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${channel.isAdEnabled ? 'bg-orange-500/10 text-orange-400' : 'bg-slate-800 text-slate-500'}`}>
                                        <Megaphone size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-200">Kanal Reklam İzni</p>
                                        <p className="text-xs text-slate-500 leading-tight">
                                            {channel.isAdEnabled ? 'Reklam yayını aktif.' : 'Kanal genelinde reklam kapalı.'}
                                        </p>
                                    </div>
                                </div>
                                <div 
                                    onClick={() => toggleChannelAdGlobal(channel.id)}
                                    className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors flex-shrink-0 ${channel.isAdEnabled ? 'bg-orange-600' : 'bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${channel.isAdEnabled ? 'left-6' : 'left-1'}`}></div>
                                </div>
                            </div>

                            {/* Connected Bots Section */}
                            <div className="pt-2">
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-2 pl-1">Bağlı Botlar ve Durum</p>
                                <div className="space-y-2">
                                    {channelBots.map(bot => {
                                        const isPublishing = activeAdBot?.id === bot.id;
                                        
                                        return (
                                            <div 
                                                key={bot.id} 
                                                onClick={() => navigate(`/bot/${bot.id}`)}
                                                className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer hover:bg-slate-950/80 transition-colors ${isPublishing ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-950 border-slate-800'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <img src={bot.icon} className="w-8 h-8 rounded-lg opacity-80" alt={bot.name} />
                                                    <div>
                                                        <p className={`text-xs font-bold ${isPublishing ? 'text-emerald-400' : 'text-slate-400 group-hover:text-blue-400'}`}>{bot.name}</p>
                                                        <p className="text-[9px] text-slate-600">
                                                            {bot.isAdEnabled ? 'Reklam Modu Açık' : 'Reklam Modu Kapalı'}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                {channel.isAdEnabled && isPublishing ? (
                                                    <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-2 py-1 rounded">
                                                        <Radio size={10} className="animate-pulse" />
                                                        <span>Yayında</span>
                                                    </div>
                                                ) : (
                                                    channel.isAdEnabled && bot.isAdEnabled && !isPublishing ? (
                                                        <span className="text-[9px] text-orange-400 font-medium">Beklemede</span>
                                                    ) : (
                                                        <span className="text-[9px] text-slate-600 font-medium">Pasif</span>
                                                    )
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                {channel.isAdEnabled && !activeAdBot && channelBots.some(b => b.isAdEnabled) === false && (
                                    <div className="mt-3 flex items-center gap-2 text-slate-500 text-[10px] bg-slate-950/50 p-2 rounded">
                                        <AlertCircle size={12} />
                                        <span>Hiçbir botun reklam özelliği açık değil.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </>
        )}
      </div>
    </div>
  );
};

export default MyChannels;
