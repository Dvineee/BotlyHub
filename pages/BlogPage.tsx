
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Bot as BotIcon, 
  Network, 
  BarChart3, 
  Search, 
  DollarSign, 
  Cpu, 
  BookOpen,
  Calendar,
  Clock,
  ChevronRight,
  ArrowRight,
  Zap,
  Home,
  Bookmark,
  MessageSquare,
  Trophy,
  Layout,
  User,
  PenTool,
  FileText,
  X,
  Menu,
  PanelLeftClose,
  PanelLeft,
  Sun,
  Moon,
  Globe,
  Star,
  Heart,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../TranslationContext';
import { useTheme } from '../ThemeContext';
import { useTelegram } from '../hooks/useTelegram';
import { SEO } from '../components/SEO';
import { Logo } from '../components/Logo';
import { DatabaseService } from '../services/DatabaseService';
import { BlogPost } from '../types';
import { AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';

const categories = [
  { id: 'all', label: 'Tümü', icon: Layout, color: 'text-slate-600' },
  { id: 'trends', label: 'Trendler', icon: TrendingUp, color: 'text-orange-500' },
  { id: 'bots', label: 'Botlar', icon: BotIcon, color: 'text-blue-500' },
  { id: 'ton', label: 'TON Ekosistemi', icon: Network, color: 'text-sky-400' },
  { id: 'analysis', label: 'Analizler', icon: BarChart3, color: 'text-purple-500' },
  { id: 'explore', label: 'Keşfet', icon: Search, color: 'text-green-500' },
  { id: 'earn', label: 'Para Kazanma', icon: DollarSign, color: 'text-emerald-500' },
  { id: 'ai', label: 'Yapay Zeka Araçları', icon: Cpu, color: 'text-indigo-500' },
  { id: 'guides', label: 'Rehberler', icon: BookOpen, color: 'text-rose-500' },
];

const BlogPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { haptic, user, setWebAuthUser } = useTelegram();
  const [activeCategory, setActiveCategory] = useState('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isLangPickerOpen, setIsLangPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      try {
        const data = await DatabaseService.getBlogs();
        setBlogs(data);
      } catch (err) {
        console.error("Fetch Blogs Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredPosts = blogs.filter(post => {
    const matchesCategory = activeCategory === 'all' || post.category === categories.find(c => c.id === activeCategory)?.label;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogs.find(b => b.isFeatured) || blogs[0];
  const regularPosts = featuredPost ? filteredPosts.filter(p => p.id !== featuredPost.id) : filteredPosts;

  return (
    <div className="bg-[#fcfcfc] dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 font-sans">
      <SEO 
          title="Blog - En Son Bot Trendleri ve TON Ekosistemi" 
          description="Telegram ekosistemindeki en son gelişmeleri, bot trendlerini, TON ağı haberlerini ve derinlemesine teknik analizleri BotlyHub Blog üzerinden takip edin." 
          breadcrumbs={[
              { name: 'Anasayfa', item: 'https://botlyhub.com/' },
              { name: 'Blog', item: 'https://botlyhub.com/blog' }
          ]}
      />
      
      {/* Search Modal */}
      <AnimatePresence>
        {isSearchModalOpen && (
          <div className="fixed inset-0 z-[2000] flex items-start justify-center pt-[10vh] px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchModalOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center gap-4">
                <Search size={24} className="text-blue-500" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Blogda ara..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-xl font-bold placeholder:text-slate-400"
                />
                <button 
                  onClick={() => setIsSearchModalOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="max-h-[60vh] overflow-y-auto p-4 no-scrollbar">
                {searchQuery.length > 0 ? (
                  <div className="space-y-2">
                    {blogs.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                      blogs.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())).map(post => (
                        <button 
                          key={post.id}
                          onClick={() => { navigate('/blog/' + post.id); setIsSearchModalOpen(false); }}
                          className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all text-left group"
                        >
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                            {post.image ? <img src={post.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-800"><BookOpen size={20}/></div>}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">{post.title}</h4>
                            <div className="text-xs text-slate-400 mt-1 uppercase font-black tracking-widest">{post.category}</div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="py-12 text-center">
                        <p className="text-slate-400 font-bold uppercase tracking-widest">Sonuç bulunamadı.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Search size={48} className="mx-auto text-slate-100 dark:text-white/5 mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aramak için yazmaya başlayın</p>
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-slate-50 dark:bg-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded">ESC</kbd> Kapat</span>
                </div>
                <span>BotlyHub Search v1.0</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-white dark:bg-slate-950 lg:hidden flex flex-col p-6"
          >
            <div className="flex items-center justify-between mb-10">
              <Logo />
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 bg-slate-100 dark:bg-white/10 rounded-2xl text-slate-900 dark:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="flex-1 space-y-4 overflow-y-auto no-scrollbar">
              <button
                 onClick={() => { haptic('light'); navigate('/'); }}
                 className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 text-base font-bold"
              >
                <Home size={22} className="text-blue-500" />
                Anasayfa
              </button>

              <div className="pt-4 pb-2 px-2 text-xs font-black uppercase tracking-widest text-slate-400">Kategoriler</div>
              
              <div className="grid grid-cols-1 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { haptic('light'); setActiveCategory(cat.id); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all text-sm font-bold ${
                      activeCategory === cat.id 
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30' 
                      : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <cat.icon size={20} className={activeCategory === cat.id ? 'text-white' : 'text-slate-400'} />
                      {cat.label}
                    </div>
                    {activeCategory === cat.id && <ChevronRight size={18} />}
                  </button>
                ))}
              </div>
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-100 dark:border-white/5 space-y-4">
               {user ? (
                 <div className="flex items-center gap-3 mobile-menu-profile rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 pr-4">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border-2 border-white dark:border-slate-800 shadow-xl">
                      {user.photo_url ? (
                        <img src={user.photo_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl uppercase">
                          {user.first_name?.[0] || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-widest">{user.first_name} {user.last_name || ''}</p>
                      <p className="text-[10px] font-bold text-slate-400">@{user.username || 'kullanici'}</p>
                    </div>
                    <button 
                      onClick={() => { haptic('medium'); setWebAuthUser(null); setIsMobileMenuOpen(false); }}
                      className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all shrink-0"
                      title="Çıkış Yap"
                    >
                      <LogOut size={18} />
                    </button>
                 </div>
               ) : (
                 <div className="mobile-menu-profile bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-500/10 dark:to-blue-500/10 rounded-2xl border border-blue-100/50 dark:border-blue-500/20">
                    <p className="text-[11px] text-blue-700/70 dark:text-blue-400/70 mb-3 leading-relaxed">Tüm özelliklere erişmek için giriş yap.</p>
                    <button onClick={() => { haptic('light'); navigate('/login'); }} className="w-full mobile-login-btn bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                      <User size={16} />
                      Giriş Yap
                    </button>
                 </div>
               )}

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => { haptic('light'); toggleTheme(); }}
                  className="flex flex-col items-center justify-center gap-1.5 mobile-menu-actions-btn rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white"
                >
                  {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-blue-500" />}
                  <span className="text-[10px] font-bold uppercase tracking-widest">{theme === 'dark' ? 'Gündüz' : 'Gece'}</span>
                </button>

                <button
                  onClick={() => { haptic('light'); setIsSearchModalOpen(true); setIsMobileMenuOpen(false); }}
                  className="flex flex-col items-center justify-center gap-1.5 mobile-menu-actions-btn rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white"
                >
                  <Search size={20} className="text-blue-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ara</span>
                </button>

                <button
                  onClick={() => { haptic('light'); setIsLangPickerOpen(true); }}
                  className="flex flex-col items-center justify-center gap-1.5 mobile-menu-actions-btn rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white"
                >
                  <Globe size={20} className="text-slate-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Dil</span>
                </button>
              </div>
            </div>

            {/* Language Picker Bottom Sheet */}
            <AnimatePresence>
              {isLangPickerOpen && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsLangPickerOpen(false)}
                    className="fixed inset-0 z-[1100] bg-black/40 backdrop-blur-sm"
                  />
                  <motion.div 
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed bottom-0 left-0 right-0 z-[1101] bg-white dark:bg-slate-900 rounded-t-[40px] border-t border-slate-100 dark:border-white/10 p-8 pb-12 shadow-2xl"
                  >
                    <div className="w-12 h-1 bg-slate-200 dark:bg-white/10 rounded-full mx-auto mb-8"></div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-6 text-center">Dil Seçimi</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {(['tr', 'en', 'ru'] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => { haptic('medium'); setLanguage(lang); setIsLangPickerOpen(false); }}
                          className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all ${
                            language === lang 
                              ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30' 
                              : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span className="text-sm font-bold uppercase tracking-widest">
                            {lang === 'tr' ? 'Türkçe' : lang === 'en' ? 'English' : 'Русский'}
                          </span>
                          {language === lang && <Globe size={20} />}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => setIsLangPickerOpen(false)}
                      className="w-full mt-6 py-4 text-slate-400 text-[10px] font-black uppercase tracking-widest"
                    >
                      İptal
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1400px] mx-auto flex">
        
        {/* Left Sidebar - Hashnode Style */}
        <aside className={`hidden lg:flex flex-col ${isSidebarCollapsed ? 'w-20 overflow-visible' : 'w-64'} h-screen sticky top-0 z-[100] border-r border-slate-100 dark:border-white/5 py-8 transition-all duration-300 bg-[#fcfcfc] dark:bg-slate-950`}>
          <div className="px-6 flex items-center justify-between mb-10 shrink-0">
            {!isSidebarCollapsed && <Logo />}
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 transition-colors ${isSidebarCollapsed ? 'mx-auto' : ''}`}
            >
              {isSidebarCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
            </button>
          </div>

          <nav className={`flex-1 px-4 ${isSidebarCollapsed ? 'overflow-visible' : 'overflow-y-auto'} no-scrollbar space-y-1`}>
            <button
               onClick={() => { haptic('light'); navigate('/'); }}
               title="Anasayfa"
               className={`w-full relative flex items-center gap-3 p-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-sm font-semibold group ${isSidebarCollapsed ? 'justify-center' : ''}`}
            >
              <Home size={20} className="group-hover:scale-110 transition-transform" />
              {!isSidebarCollapsed && <span>Anasayfa</span>}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
                  Anasayfa
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                </div>
              )}
            </button>

            {!isSidebarCollapsed && (
              <div className="pt-6 pb-2">
                <span className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
                  Kategoriler
                </span>
              </div>
            )}

            <div className="flex flex-col space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { haptic('light'); setActiveCategory(cat.id); }}
                  title={cat.label}
                  className={`w-full relative flex items-center gap-3 p-2.5 rounded-lg transition-all text-sm font-semibold group ${
                    activeCategory === cat.id 
                    ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                  } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                >
                  <cat.icon size={20} className={`group-hover:scale-110 transition-transform ${activeCategory === cat.id ? 'text-blue-500' : 'text-slate-400'}`} />
                  {!isSidebarCollapsed && <span>{cat.label}</span>}
                  
                  {/* Tooltip for collapsed state */}
                  {isSidebarCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity backdrop-blur-md whitespace-nowrap z-[110] shadow-2xl border border-white/10">
                      {cat.label}
                      <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45 border-l border-b border-white/10"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {!isSidebarCollapsed && (
              <div className="pt-6 pb-2">
                <span className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
                  Yazar Araçları
                </span>
              </div>
            )}

            <div className="flex flex-col space-y-1">
              <button 
                title="Yazı Yaz"
                className={`w-full relative flex items-center gap-3 p-2.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/5 transition-all text-sm font-semibold group ${isSidebarCollapsed ? 'justify-center' : ''}`}
              >
                <PenTool size={20} className="group-hover:rotate-12 transition-transform" />
                {!isSidebarCollapsed && <span>Yazı Yaz</span>}
                {isSidebarCollapsed && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-[1001] shadow-xl">
                    Yazı Yaz
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                  </div>
                )}
              </button>
              <button 
                title="Taslaklar"
                className={`w-full relative flex items-center gap-3 p-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-sm font-semibold group ${isSidebarCollapsed ? 'justify-center' : ''}`}
              >
                <FileText size={20} />
                {!isSidebarCollapsed && <span>Taslaklar</span>}
                {isSidebarCollapsed && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-[1001] shadow-xl">
                    Taslaklar
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                  </div>
                )}
              </button>
            </div>
          </nav>

          <div className="mt-auto px-6 pt-6 shrink-0 border-t border-slate-100 dark:border-white/5 space-y-4">
            {user ? (
                 <div className={`flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 shadow-sm ${isSidebarCollapsed ? 'justify-center p-2' : ''}`}>
                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-white/10">
                      {user.photo_url ? (
                        <img src={user.photo_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg uppercase">
                          {user.first_name?.[0] || 'U'}
                        </div>
                      )}
                    </div>
                    {!isSidebarCollapsed && (
                      <>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-[11px] font-black text-slate-900 dark:text-white truncate uppercase tracking-widest">
                            {user.first_name} {user.last_name || ''}
                          </p>
                          <p className="text-[9px] font-bold text-slate-400 truncate">@{user.username || 'user'}</p>
                        </div>
                        <button 
                          onClick={() => { haptic('medium'); setWebAuthUser(null); }}
                          className="p-2 bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-red-500 hover:bg-red-500/5 transition-all rounded-lg shrink-0"
                          title="Çıkış Yap"
                        >
                          <LogOut size={14} />
                        </button>
                      </>
                    )}
                 </div>
            ) : (
               !isSidebarCollapsed ? (
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-500/10 dark:to-blue-500/10 rounded-2xl border border-blue-100/50 dark:border-blue-500/20">
                   <p className="text-[10px] text-blue-700/70 dark:text-blue-400/70 mb-3 leading-tight">Tüm özelliklere erişmek için giriş yap.</p>
                   <button onClick={() => navigate('/login')} className="w-full mobile-login-btn bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                     <User size={14} />
                     Giriş Yap
                   </button>
                </div>
               ) : (
                 <button 
                  onClick={() => navigate('/login')}
                  title="Giriş Yap"
                  className="w-full h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center transition-all hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                 >
                   <User size={20} />
                 </button>
               )
            )}

            <div className={`flex items-center gap-2 ${isSidebarCollapsed ? 'flex-col' : ''}`}>
              <button
                onClick={() => toggleTheme()}
                title={theme === 'dark' ? 'Gündüz Modu' : 'Gece Modu'}
                className="h-[38px] rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-all flex-1 flex items-center justify-center"
              >
                {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-blue-500" />}
              </button>
              
              {!isSidebarCollapsed ? (
                <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl flex-[2] h-[38px]">
                  {(['tr', 'en', 'ru'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`flex-1 flex items-center justify-center rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                        language === lang 
                          ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-sm' 
                          : 'text-slate-400'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => setLanguage(language === 'tr' ? 'en' : language === 'en' ? 'ru' : 'tr')}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-all flex justify-center"
                >
                  <Globe size={18} />
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 lg:max-w-4xl px-4 sm:px-8 py-8 md:py-12 w-full overflow-hidden">
          
          {/* Top Bar for Mobile */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <Logo className="scale-90 origin-left" />
            <button 
              onClick={() => { haptic('light'); setIsMobileMenuOpen(true); }}
              className="p-2.5 bg-slate-100 dark:bg-white/10 rounded-xl"
            >
              <Menu size={22} className="text-slate-900 dark:text-white" />
            </button>
          </div>

          <header className="mb-12">
            <div className="flex items-center gap-2 text-blue-500 font-black uppercase text-[10px] tracking-[0.2em] mb-4">
              <span className="w-8 h-[2px] bg-blue-500"></span>
              BOTLYHUB BLOG
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white mb-4 italic">
              Teknoloji, <span className="text-blue-600">TON</span> ve Ötesi.
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
              Telegram dünyasindeki en son gelişmeleri, bot trendlerini ve TON ekosistemini yakından takip edin.
            </p>
          </header>

          {/* Feed Filter (Mobile/Tablet) */}
          <div className="lg:hidden overflow-x-auto no-scrollbar flex gap-2 mb-8 pb-3 -mx-4 px-4 border-b border-slate-100 dark:border-white/5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { haptic('light'); setActiveCategory(cat.id); }}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeCategory === cat.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-transparent'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="space-y-12">
            {isLoading ? (
              <div className="py-32 flex flex-col items-center justify-center space-y-6">
                 <Loader2 className="animate-spin text-blue-500" size={48} />
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 animate-pulse">İçerikler Yükleniyor...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-slate-400 font-bold uppercase tracking-widest">Bu kategoride henüz yazı bulunmuyor.</p>
              </div>
            ) : (
              <>
                {/* Featured Post - First post of filtered list */}
                {activeCategory === 'all' && featuredPost && (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => { haptic('light'); navigate('/blog/' + featuredPost.id); }}
                    className="group cursor-pointer blog-featured-card custom-cursor-on-hover bg-white dark:bg-slate-900/40 p-6 md:p-8 rounded-[44px] border border-slate-100 dark:border-white/5 hover:border-blue-500/30 transition-all shadow-xl shadow-slate-200/20 dark:shadow-none"
                  >
                    <div className="aspect-[16/9] md:aspect-[2.4/1] rounded-[32px] overflow-hidden mb-8 bg-slate-100 dark:bg-slate-900 shadow-2xl relative">
                      {featuredPost.image ? (
                        <img 
                          src={featuredPost.image} 
                          alt={featuredPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center bg-slate-950">
                            <BookOpen size={64} className="text-slate-800" />
                         </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                      <div className="absolute bottom-10 left-10 hidden md:block">
                         <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
                            <Star size={16} className="text-amber-400 fill-amber-400" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Haftanın Öne Çıkanı</span>
                         </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <span className="px-4 py-1.5 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full">{featuredPost.category}</span>
                        <div className="flex items-center gap-2 text-slate-400">
                           <Calendar size={14} />
                           <span className="text-[10px] font-bold uppercase">{new Date(featuredPost.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                           <TrendingUp size={14} className="text-blue-500" />
                           <span className="text-[10px] font-bold uppercase">{featuredPost.views_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                           <Heart size={14} className="text-red-500" />
                           <span className="text-[10px] font-bold uppercase">{featuredPost.likes_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                           <Clock size={14} />
                           <span className="text-[10px] font-bold uppercase">{featuredPost.readTime || '5 dk'}</span>
                        </div>
                      </div>
                      <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight group-hover:text-blue-600 transition-colors italic">
                        {featuredPost.title}
                      </h2>
                      <p className="text-base md:text-xl text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 italic font-medium">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-[10px] shadow-lg shadow-blue-500/20">BH</div>
                          <div>
                            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">{featuredPost.author}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">BotlyHub Editörü</span>
                          </div>
                        </div>
                        <button className="flex items-center gap-2 text-blue-600 font-black text-[11px] uppercase tracking-widest group/btn hover:mr-2 transition-all">
                           OKUMAYA BAŞLA <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-16 ${activeCategory === 'all' ? 'py-20 border-t' : ''} border-slate-100 dark:border-white/5`}>
                  {regularPosts.map((post, idx) => (
                    <motion.div 
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => { haptic('light'); navigate('/blog/' + post.id); }}
                      className="group cursor-pointer flex flex-col h-full"
                    >
                      <div className="aspect-[16/10] rounded-[32px] overflow-hidden mb-8 bg-slate-100 dark:bg-slate-900 shadow-lg relative">
                        {post.image ? (
                          <img 
                            src={post.image} 
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center bg-slate-950">
                              <BookOpen size={32} className="text-slate-800" />
                           </div>
                        )}
                        <div className="absolute top-6 left-6">
                           <span className="bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-xl text-[8px] font-black text-white uppercase tracking-widest border border-white/10">{post.category}</span>
                        </div>
                      </div>
                      <div className="space-y-4 flex-1 flex flex-col">
                        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400 italic">
                          <span>{new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-800"></span>
                          <span className="flex items-center gap-1.5"><TrendingUp size={12} className="text-blue-500" /> {post.views_count || 0}</span>
                          <span className="flex items-center gap-1.5"><Heart size={12} className="text-red-500" /> {post.likes_count || 0}</span>
                          <span className="flex items-center gap-1.5"><Clock size={12} className="text-blue-500" /> {post.readTime || '5 dk'}</span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-blue-600 transition-colors line-clamp-2 italic leading-tight">
                          {post.title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-500 line-clamp-3 leading-relaxed flex-1 font-medium italic">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between pt-6 group-hover:translate-y-[-4px] transition-transform">
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 font-black text-[8px]">BH</div>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">BotlyHub Team</span>
                          </div>
                          <div className="w-10 h-10 rounded-full border border-slate-100 dark:border-white/5 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all">
                             <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>

        {/* Right Sidebar - Search & Floating newsletter */}
        <aside className="hidden xl:flex flex-col w-80 h-screen sticky top-0 py-12 px-6 overflow-y-auto no-scrollbar space-y-10">
          <button
             onClick={() => { haptic('light'); setIsSearchModalOpen(true); }}
             className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10 border border-slate-100 dark:border-white/5 hover:border-blue-500/50 transition-all text-sm font-semibold group"
          >
            <Search size={18} className="group-hover:scale-110 group-hover:text-blue-500 transition-all" />
            <span>Arama Yap</span>
            <div className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 opacity-50 bg-white dark:bg-slate-800">⌘K</div>
          </button>

          <div className="space-y-6">
            <h4 className="px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">TREND ETİKETLER</h4>
            <div className="flex flex-wrap gap-2">
              {['#TON', '#PassiveIncome', '#AIBots', '#MiniApps', '#Web3'].map(tag => (
                <button key={tag} className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all">
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <Zap size={32} className="text-yellow-400 mb-6" />
            <h3 className="text-xl font-bold tracking-tight mb-3">Hiçbir şeyi kaçırmayın.</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">Haftalık en iyi botları ve ekosistem haberlerini direkt gelen kutunuza gönderelim.</p>
            <div className="space-y-3">
              <input type="email" placeholder="E-posta" className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 ring-blue-500" />
              <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-colors">Abone Ol</button>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default BlogPage;

