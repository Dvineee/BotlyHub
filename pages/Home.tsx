
import React, { useState } from 'react';
import { Search, Sparkles, TrendingUp, BarChart3, ChevronRight, LayoutGrid, Store, User, Bot as BotIcon, Megaphone, DollarSign, X, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ExtendedBot } from '../types';
import { mockBots, categories } from '../data';
import { useTranslation } from '../TranslationContext';

// Helper component for rendering a single bot card
const BotCard: React.FC<{ bot: ExtendedBot }> = ({ bot }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  return (
    <div 
        onClick={() => navigate(`/bot/${bot.id}`)}
        className="flex items-center py-3 px-2 cursor-pointer group relative hover:bg-slate-900/50 rounded-xl transition-colors"
    >
        <div className="relative flex-shrink-0">
            <img src={bot.icon} alt={bot.name} className="w-20 h-20 rounded-xl object-cover bg-slate-900" />
        </div>
        <div className="flex-1 ml-4 min-w-0 mr-2">
            <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg truncate text-slate-200">
                    {bot.name}
                </h3>
                {bot.isPremium && (
                    <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-indigo-500/20">
                        {t('premium')}
                    </span>
                )}
            </div>
            <p className="text-sm text-slate-500 truncate">{bot.description}</p>
        </div>
        <button className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold py-2 px-4 rounded-full min-w-[60px] transition-colors hover:border-slate-600 hover:text-white">
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
  const [activeSearchCategory, setActiveSearchCategory] = useState('all');
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const isSearchActive = searchQuery.trim().length > 0 || isOverlayOpen;
  const topCategories = categories.slice(0, 4);
  const bottomCategories = categories.slice(4, 7);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleMenuClick = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleDashboardCategoryClick = (categoryId: string) => {
    navigate(`/search?category=${categoryId}`);
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length > 0) setIsOverlayOpen(true);
    else {
        setIsOverlayOpen(false);
        setActiveSearchCategory('all');
    }
  };

  const clearSearch = () => {
      setSearchQuery('');
      setActiveSearchCategory('all');
      setIsOverlayOpen(false);
  };

  const filteredBots = mockBots.filter(bot => {
      const matchesText = bot.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          bot.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeSearchCategory === 'all' || bot.category === activeSearchCategory;
      return matchesText && matchesCategory;
  });

  const CategorySection = ({ title, categoryId }: { title: string, categoryId: string }) => {
    const bots = mockBots.filter(b => b.category === categoryId).slice(0, 3);
    if (bots.length === 0) return null;
    return (
      <div className="mb-6">
         <div className="flex justify-between items-center mb-1 px-1">
            <h2 className="text-lg font-semibold text-slate-200">{title}</h2>
            <button onClick={() => handleDashboardCategoryClick(categoryId)} className="flex items-center gap-1 text-slate-500 hover:text-blue-400 transition-colors">
                <span className="text-xs font-medium">{t('all')}</span>
                <ChevronRight size={16} />
            </button>
         </div>
         <div className="flex flex-col gap-2">
            {bots.map((bot) => <BotCard key={bot.id} bot={bot} />)}
         </div>
      </div>
    );
  };

  return (
    <div className="p-4 pt-8 min-h-screen relative" onClick={() => isMenuOpen && setIsMenuOpen(false)}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6 relative z-50">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Package className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">BotlyHub <span className="text-blue-500">V3</span></h1>
        </div>

        <div className="flex items-center gap-3">
            <button onClick={(e) => { e.stopPropagation(); navigate('/earnings'); }} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition text-emerald-400 border border-slate-700 shadow-sm">
                <DollarSign className="w-5 h-5" />
            </button>

            <div className="relative">
                <button onClick={(e) => { e.stopPropagation(); toggleMenu(); }} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition group border border-slate-700 shadow-sm">
                    <LayoutGrid className="text-white w-5 h-5 group-hover:text-blue-400 transition-colors" />
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50">
                        <button onClick={() => handleMenuClick('/')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition-colors text-left border-b border-slate-800/50">
                            <Store size={18} className="text-blue-400" />
                            <span className="text-sm font-medium text-slate-200">{t('market')}</span>
                        </button>
                        <button onClick={() => handleMenuClick('/settings')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition-colors text-left border-b border-slate-800/50">
                            <User size={18} className="text-purple-400" />
                            <span className="text-sm font-medium text-slate-200">{t('profile')}</span>
                        </button>
                        <button onClick={() => handleMenuClick('/my-bots')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition-colors text-left border-b border-slate-800/50">
                            <BotIcon size={18} className="text-emerald-400" />
                            <span className="text-sm font-medium text-slate-200">{t('my_bots')}</span>
                        </button>
                        <button onClick={() => handleMenuClick('/channels')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition-colors text-left">
                            <Megaphone size={18} className="text-orange-400" />
                            <span className="text-sm font-medium text-slate-200">{t('my_channels')}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-6 sticky top-2 z-40">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text" 
          value={searchQuery}
          placeholder={t('search_placeholder')}
          onChange={handleSearchInput}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-10 text-sm focus:outline-none focus:border-blue-500 transition-colors cursor-text shadow-lg shadow-slate-950/50 text-white"
        />
        {isSearchActive && <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white bg-slate-800 rounded-full p-0.5"><X size={16} /></button>}
      </div>

      {/* Conditional Rendering */}
      {!isSearchActive ? (
        <div className="animate-in fade-in duration-300">
           {/* Promo Slider */}
           <div className="mb-6">
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 snap-x snap-mandatory">
                    <div className="min-w-[280px] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between h-36 shadow-lg flex-shrink-0 snap-center">
                       <div className="z-10">
                         <h3 className="font-bold text-lg text-white">V3 Premium</h3>
                         <p className="text-xs text-indigo-100 mt-1 max-w-[80%]">Tüm limitleri kaldırın ve elit rozetine sahip olun.</p>
                       </div>
                       <button onClick={() => navigate('/premium')} className="z-10 bg-white text-indigo-600 text-xs font-bold py-2 px-4 rounded-lg self-start mt-2 hover:bg-indigo-50 transition-colors shadow-sm">İncele</button>
                       <div className="absolute -right-4 -bottom-4 opacity-20 text-white"><Sparkles size={100} /></div>
                    </div>
                    <div className="min-w-[280px] bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between h-36 shadow-lg flex-shrink-0 snap-center">
                       <div className="z-10">
                         <h3 className="font-bold text-lg text-white">Hızlı Kazanç</h3>
                         <p className="text-xs text-emerald-100 mt-1 max-w-[80%]">Botlarınızı sisteme bağlayarak TON kazanın.</p>
                       </div>
                       <button onClick={() => navigate('/earnings')} className="z-10 bg-white text-emerald-700 text-xs font-bold py-2 px-4 rounded-lg self-start mt-2 hover:bg-emerald-50 transition-colors shadow-sm">Panele Git</button>
                       <div className="absolute -right-4 -bottom-4 opacity-20 text-white"><TrendingUp size={100} /></div>
                    </div>
                </div>
           </div>

           {/* Categories */}
           <div className="grid grid-cols-4 gap-2 mb-2">
             {topCategories.map((cat) => (
               <button key={cat.id} onClick={() => handleDashboardCategoryClick(cat.id)} className="flex flex-col items-center justify-center gap-1 py-3 px-1 rounded-xl transition-all border bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300 active:scale-95 shadow-sm">
                 <cat.icon size={20} />
                 <span className="text-[10px] font-medium truncate w-full text-center">{t(cat.label)}</span>
               </button>
             ))}
           </div>

           <div className="grid grid-cols-3 gap-2 mb-8">
             {bottomCategories.map((cat) => (
               <button key={cat.id} onClick={() => handleDashboardCategoryClick(cat.id)} className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl transition-all border bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300 active:scale-95 shadow-sm">
                 <cat.icon size={18} />
                 <span className="text-[10px] font-bold truncate">{t(cat.label)}</span>
               </button>
             ))}
           </div>

           <CategorySection title={t('sec_productivity')} categoryId="productivity" />
           <CategorySection title={t('sec_games')} categoryId="games" />
           <CategorySection title={t('sec_finance')} categoryId="finance" />
        </div>
      ) : (
        <div className="animate-in fade-in zoom-in-95 duration-200 min-h-[50vh]">
            <div className="flex flex-col gap-2">
                {filteredBots.length > 0 ? filteredBots.map(bot => <BotCard key={bot.id} bot={bot} />) : <div className="flex flex-col items-center justify-center py-12 text-slate-500"><p>{t('no_results')}</p></div>}
            </div>
        </div>
      )}
    </div>
  );
};

export default Home;
