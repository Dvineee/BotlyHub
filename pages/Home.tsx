
import React, { useState, useEffect } from 'react';
import { Search, Sparkles, TrendingUp, ChevronRight, LayoutGrid, Store, User, Bot as BotIcon, Megaphone, DollarSign, X, Package, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Bot } from '../types';
import { categories } from '../data';
import { useTranslation } from '../TranslationContext';
import { DatabaseService } from '../services/DatabaseService';

const BotCard: React.FC<{ bot: Bot }> = ({ bot }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  return (
    <div 
        onClick={() => navigate(`/bot/${bot.id}`)}
        className="flex items-center py-4 px-3 cursor-pointer group hover:bg-slate-900/40 rounded-2xl transition-all border border-transparent hover:border-slate-800"
    >
        <div className="relative flex-shrink-0">
            <img src={bot.icon} alt={bot.name} className="w-16 h-16 rounded-2xl object-cover bg-slate-900 shadow-lg" />
        </div>
        <div className="flex-1 ml-4 min-w-0 mr-2">
            <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-bold text-base truncate text-slate-100">{bot.name}</h3>
                {bot.price > 0 && <span className="text-[10px] font-bold text-emerald-400">₺{bot.price}</span>}
            </div>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{bot.description}</p>
        </div>
        <button className="bg-slate-800 border border-slate-700 text-slate-200 text-[10px] font-bold py-2 px-4 rounded-full transition-all hover:bg-blue-600 hover:border-blue-500">
            {t('open')}
        </button>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bots, setBots] = useState<Bot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBots();
  }, []);

  const fetchBots = async () => {
    setIsLoading(true);
    const data = await DatabaseService.getBots();
    setBots(data);
    setIsLoading(false);
  };

  const filteredBots = bots.filter(bot => 
    bot.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    bot.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const CategorySection = ({ title, categoryId }: { title: string, categoryId: string }) => {
    const sectionBots = bots.filter(b => b.category === categoryId).slice(0, 3);
    if (sectionBots.length === 0) return null;
    return (
      <div className="mb-8">
         <div className="flex justify-between items-center mb-3 px-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">{title}</h2>
            <button onClick={() => navigate(`/search?category=${categoryId}`)} className="flex items-center gap-1 text-blue-500 hover:text-blue-400 transition-colors">
                <span className="text-xs font-bold">{t('all')}</span>
                <ChevronRight size={14} />
            </button>
         </div>
         <div className="space-y-1 bg-slate-900/20 rounded-3xl p-2 border border-slate-800/50">
            {sectionBots.map((bot) => <BotCard key={bot.id} bot={bot} />)}
         </div>
      </div>
    );
  };

  return (
    <div className="p-4 pt-8 min-h-screen bg-slate-950">
      <div className="flex justify-between items-center mb-8 relative z-50">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Package className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">BotlyHub <span className="text-blue-500">V3</span></h1>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={() => navigate('/earnings')} className="p-2.5 bg-slate-900 border border-slate-800 rounded-full text-emerald-400">
                <DollarSign size={20} />
            </button>
            <div className="relative">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2.5 bg-slate-900 border border-slate-800 rounded-full text-white">
                    <LayoutGrid size={20} />
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-3 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                        <button onClick={() => {navigate('/'); setIsMenuOpen(false);}} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-left border-b border-slate-800/50">
                            <Store size={18} className="text-blue-400" /> <span className="text-sm font-bold text-slate-200">Market</span>
                        </button>
                        <button onClick={() => {navigate('/settings'); setIsMenuOpen(false);}} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-left border-b border-slate-800/50">
                            <User size={18} className="text-purple-400" /> <span className="text-sm font-bold text-slate-200">Profil</span>
                        </button>
                        <button onClick={() => {navigate('/my-bots'); setIsMenuOpen(false);}} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-left border-b border-slate-800/50">
                            <BotIcon size={18} className="text-emerald-400" /> <span className="text-sm font-bold text-slate-200">Botlarım</span>
                        </button>
                        <button onClick={() => {navigate('/channels'); setIsMenuOpen(false);}} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-left">
                            <Megaphone size={18} className="text-orange-400" /> <span className="text-sm font-bold text-slate-200">Kanallarım</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className="relative mb-8 sticky top-4 z-40">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
        <input 
          type="text" 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('search_placeholder')}
          className="w-full bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-blue-500 outline-none shadow-2xl"
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
          <span className="text-slate-500 text-sm font-medium">Market Yükleniyor...</span>
        </div>
      ) : searchQuery ? (
        <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
           {filteredBots.length > 0 ? filteredBots.map(bot => <BotCard key={bot.id} bot={bot} />) : <p className="text-center text-slate-500 py-10">Sonuç bulunamadı.</p>}
        </div>
      ) : (
        <div className="animate-in fade-in duration-500">
           <div className="grid grid-cols-4 gap-3 mb-10">
             {categories.slice(0, 4).map((cat) => (
               <button key={cat.id} onClick={() => navigate(`/search?category=${cat.id}`)} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all">
                 <cat.icon size={20} className="text-blue-500" />
                 <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">{t(cat.label)}</span>
               </button>
             ))}
           </div>

           <CategorySection title={t('sec_productivity')} categoryId="productivity" />
           <CategorySection title={t('sec_games')} categoryId="games" />
           <CategorySection title={t('sec_finance')} categoryId="finance" />
           
           <div className="mt-8 px-1">
             <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Popüler Botlar</h2>
             <div className="space-y-1">
                {bots.slice(0, 5).map((bot) => <BotCard key={bot.id} bot={bot} />)}
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Home;
