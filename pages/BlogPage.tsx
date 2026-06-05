
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
  LogOut,
  Users
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../TranslationContext';
import { useTheme } from '../ThemeContext';
import { useTelegram } from '../hooks/useTelegram';
import { SEO } from '../components/SEO';
import { Logo } from '../components/Logo';
import { DatabaseService } from '../services/DatabaseService';
import { BlogPost } from '../types';
import { AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { BlogSkeleton, LazyImage } from '../components/Preload';

const categories = [
  { id: 'all', translationKey: 'cat_all', icon: Layout, color: 'text-slate-600' },
  { id: 'trends', translationKey: 'cat_trends', icon: TrendingUp, color: 'text-orange-500' },
  { id: 'bots', translationKey: 'cat_bots', icon: BotIcon, color: 'text-blue-500' },
  { id: 'ton', translationKey: 'cat_ton', icon: Network, color: 'text-sky-400' },
  { id: 'analysis', translationKey: 'cat_analysis', icon: BarChart3, color: 'text-purple-500' },
  { id: 'explore', translationKey: 'cat_explore', icon: Search, color: 'text-green-500' },
  { id: 'earn', translationKey: 'cat_earn', icon: DollarSign, color: 'text-emerald-500' },
  { id: 'ai', translationKey: 'cat_ai_tools', icon: Cpu, color: 'text-indigo-500' },
  { id: 'guides', translationKey: 'cat_guides', icon: BookOpen, color: 'text-rose-500' },
];

const BlogPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [trendHashtags, setTrendHashtags] = useState<string[]>([]);

  useEffect(() => {
    if (location.state && (location.state as any).categoryId) {
      setActiveCategory((location.state as any).categoryId);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      const startTime = Date.now();
      try {
        // Fetch limited blogs for faster initial load
        const [data, trendingTags] = await Promise.all([
          DatabaseService.getBlogs(20),
          DatabaseService.getTrendingHashtags()
        ]);
        setBlogs(data);
        setTrendHashtags(trendingTags);
      } catch (err) {
        console.error("Fetch Blogs Error:", err);
      } finally {
        const elapsedTime = Date.now() - startTime;
        const minDelay = 500;
        if (elapsedTime < minDelay) {
            await new Promise(resolve => setTimeout(resolve, minDelay - elapsedTime));
        }
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

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.height = "100vh";
    } else {
      document.body.style.overflow = "";
      document.body.style.height = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.height = "";
    };
  }, [isMobileMenuOpen]);

  const filteredPosts = blogs.filter(post => {
    const activeCatObj = categories.find(c => c.id === activeCategory);
    const matchesCategory = activeCategory === 'all' || post.category === t(activeCatObj?.translationKey || '');
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogs.find(b => b.isFeatured) || blogs[0];
  const regularPosts = featuredPost ? filteredPosts.filter(p => p.id !== featuredPost.id) : filteredPosts;

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 font-sans blog-page-scope transition-colors duration-300">
      <SEO 
          title={`${t('blog_title')} - ${t('blog_subtitle')}`} 
          description={t('blog_community_desc')} 
          breadcrumbs={[
              { name: t('blog_home'), item: 'https://botlyhub.com/' },
              { name: t('blog_title'), item: 'https://botlyhub.com/blog' }
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
                  placeholder={t('blog_search_placeholder')} 
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
                          onClick={() => { navigate('/blog/' + (post.slug || post.id)); setIsSearchModalOpen(false); }}
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
                        <p className="text-slate-400 font-bold uppercase tracking-widest">{t('blog_search_empty')}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Search size={48} className="mx-auto text-slate-100 dark:text-white/5 mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{t('blog_search_hint')}</p>
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-slate-50 dark:bg-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded">ESC</kbd> {t('cancel')}</span>
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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[1000] w-screen h-[100dvh] bg-white dark:bg-slate-950 lg:hidden flex flex-col overflow-hidden"
          >
            {/* Top Header of Menu Modal */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-black/[0.04] dark:border-white/[0.04] shrink-0">
              <Logo
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate("/");
                }}
                className="cursor-pointer scale-95"
              />

              <div className="flex items-center gap-2">
                {user ? (
                  <button
                    onClick={() => {
                      haptic("light");
                      navigate("/earnings");
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-3.5 py-1.5 bg-slate-50 dark:bg-white/5 border border-black/[0.04] dark:border-white/5 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 active:scale-95 transition-all"
                  >
                    @{user.username || user.first_name || "Profil"}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      haptic("light");
                      navigate("/login");
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-3.5 py-1.5 bg-blue-500 text-white rounded-full text-xs font-bold transition-all active:scale-95 text-center flex items-center"
                  >
                    {t("login") || "Giriş Yap"}
                  </button>
                )}

                <button
                  onClick={() => {
                    haptic("light");
                    setIsSearchModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 active:scale-95 transition-all shrink-0"
                  title="Ara"
                >
                  <Search size={21} />
                </button>

                <button
                  onClick={() => {
                    haptic("light");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 active:scale-95 transition-all shrink-0"
                >
                  <X size={26} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Menu Core Content Area */}
            <div className="flex-1 overflow-y-auto py-6">
              <div className="flex flex-col justify-center px-8 sm:px-12 py-4 gap-6 sm:gap-8">
                <button
                  onClick={() => {
                    haptic("light");
                    navigate("/");
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left text-3xl sm:text-4xl font-[900] tracking-tight text-slate-900 dark:text-white hover:text-blue-500 transition-colors uppercase leading-none"
                >
                  {t("nav_explore") || "Keşfet"}
                </button>

                <button
                  onClick={() => {
                    haptic("light");
                    navigate("/search?mode=bots");
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left text-3xl sm:text-4xl font-[900] tracking-tight text-slate-900 dark:text-white hover:text-blue-500 transition-colors uppercase flex items-center gap-3 leading-none"
                >
                  <span>{t("bots") || "Bot Market"}</span>
                  <span className="text-[10px] font-black tracking-widest bg-blue-500 text-white px-2 py-0.5 rounded-md uppercase">
                    BOTS
                  </span>
                </button>

                <button
                  onClick={() => {
                    haptic("light");
                    navigate("/search?mode=apps");
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left text-3xl sm:text-4xl font-[900] tracking-tight text-slate-900 dark:text-white hover:text-emerald-500 transition-colors uppercase flex items-center gap-3 leading-none"
                >
                  <span>{t("apps") || "Uygulamalar"}</span>
                  <span className="text-[10px] font-black tracking-widest bg-emerald-500 text-white px-2 py-0.5 rounded-md uppercase">
                    APPS
                  </span>
                </button>

                <button
                  onClick={() => {
                    haptic("light");
                    navigate("/qa");
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left text-3xl sm:text-4xl font-[900] tracking-tight text-slate-900 dark:text-white hover:text-blue-500 transition-colors uppercase leading-none"
                >
                  {t("qa_forum") || "Soru & Cevap"}
                </button>

                <button
                  onClick={() => {
                    haptic("light");
                    navigate("/blog");
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left text-3xl sm:text-4xl font-[900] tracking-tight text-slate-900 dark:text-white hover:text-blue-500 transition-colors uppercase flex items-center gap-3 leading-none"
                >
                  <span>{t("blog") || "Günlük"}</span>
                  <span className="text-[10px] font-black tracking-widest bg-blue-500 text-white px-2 py-0.5 rounded-md uppercase leading-none animate-pulse">
                    NEW
                  </span>
                </button>

                <button
                  onClick={() => {
                    haptic("light");
                    navigate("/settings");
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left text-3xl sm:text-4xl font-[900] tracking-tight text-slate-900 dark:text-white hover:text-blue-500 transition-colors uppercase leading-none"
                >
                  Uygulama Ekle
                </button>

                {/* Blog Categories Section inside Mobile Menu */}
                <div className="mt-4 pt-6 border-t border-black/[0.04] dark:border-white/[0.04]">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 px-1">{t('blog_categories')}</div>
                  <div className="grid grid-cols-2 gap-3.5 pr-1">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          haptic('light');
                          setActiveCategory(cat.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`flex flex-col items-start gap-4 p-5 transition-all rounded-[24px] border text-left group w-full ${
                          activeCategory === cat.id
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10'
                            : 'bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 border-black/5 dark:border-white/5'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                            activeCategory === cat.id
                              ? 'bg-white/20 text-white'
                              : 'text-blue-500 bg-blue-500/10'
                          }`}
                        >
                          <cat.icon size={18} />
                        </div>
                        <span className={`text-xs font-[900] uppercase tracking-tight leading-snug ${
                          activeCategory === cat.id ? 'text-white' : 'text-slate-800 dark:text-slate-200'
                        }`}>
                          {t(cat.translationKey)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Footer Row - Always pinned to the bottom safely */}
            <div className="border-t border-slate-100 dark:border-white/5 px-8 py-5 flex items-center gap-3 shrink-0 bg-white/95 dark:bg-slate-950/95 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
              {/* Language Selector Pill */}
              <button
                onClick={() => {
                  haptic("light");
                  setLanguage(language === 'tr' ? 'en' : language === 'en' ? 'ru' : 'tr');
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-50 dark:bg-white/5 border border-black/[0.04] dark:border-white/[0.04] text-xs font-bold text-slate-700 dark:text-slate-300 transition-all active:scale-95"
              >
                <Globe size={15} />
                <span>{language.toUpperCase()}</span>
              </button>

              {/* Theme Toggle Pill */}
              <button
                onClick={() => {
                  haptic("light");
                  toggleTheme();
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-50 dark:bg-white/5 border border-black/[0.04] dark:border-white/[0.04] text-xs font-bold text-slate-700 dark:text-slate-300 transition-all active:scale-95"
              >
                {theme === "dark" ? (
                  <>
                    <Moon size={15} className="text-blue-400" />
                    <span>Gece Modu</span>
                  </>
                ) : (
                  <>
                    <Sun size={15} className="text-amber-500" />
                    <span>Gündüz Modu</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1400px] mx-auto flex">
        
        {/* Left Sidebar - Hashnode Style */}
        <aside className={`hidden lg:flex flex-col ${isSidebarCollapsed ? 'w-20 overflow-visible' : 'w-64'} h-screen sticky top-0 z-[100] border-r border-slate-100 dark:border-white/5 py-8 transition-all duration-300 bg-slate-50 dark:bg-slate-950`}>
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
               title={t('blog_home')}
               className={`w-full relative flex items-center gap-3 p-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-sm font-semibold group ${isSidebarCollapsed ? 'justify-center' : ''} blog-sidebar-cat`}
            >
              <Home size={20} className="group-hover:scale-110 transition-transform" />
              {!isSidebarCollapsed && <span>{t('blog_home')}</span>}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
                  {t('blog_home')}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                </div>
              )}
            </button>

            {!isSidebarCollapsed && (
              <div className="pt-6 pb-2">
                <span className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
                  {t('blog_categories')}
                </span>
              </div>
            )}

            <div className="flex flex-col space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { haptic('light'); setActiveCategory(cat.id); }}
                  title={t(cat.translationKey)}
                  className={`w-full relative flex items-center gap-3 p-2.5 rounded-lg transition-all text-sm font-semibold group blog-sidebar-cat ${
                    activeCategory === cat.id 
                    ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                  } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                >
                  <cat.icon size={20} className={`group-hover:scale-110 transition-transform ${activeCategory === cat.id ? 'text-blue-500' : 'text-slate-400'}`} />
                  {!isSidebarCollapsed && <span>{t(cat.translationKey)}</span>}
                  
                  {/* Tooltip for collapsed state */}
                  {isSidebarCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity backdrop-blur-md whitespace-nowrap z-[110] shadow-2xl border border-white/10">
                      {cat.id === 'all' ? t('cat_all') : t(cat.translationKey)}
                      <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45 border-l border-b border-white/10"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {!isSidebarCollapsed && (
              <div className="pt-6 pb-2">
                <span className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
                  {t('blog_community_analysis')}
                </span>
              </div>
            )}

            <div className="flex flex-col space-y-1">
              <div 
                className={`w-full relative flex items-center gap-3 p-2.5 rounded-lg text-slate-600 dark:text-slate-400 font-semibold group ${isSidebarCollapsed ? 'justify-center' : ''}`}
              >
                <Trophy size={18} className="text-amber-500" />
                {!isSidebarCollapsed && (
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase italic">{t('blog_most_read')}</span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Bot Geliştirme #1</span>
                  </div>
                )}
              </div>
              <div 
                className={`w-full relative flex items-center gap-3 p-2.5 rounded-lg text-slate-600 dark:text-slate-400 font-semibold group ${isSidebarCollapsed ? 'justify-center' : ''}`}
              >
                <Zap size={18} className="text-blue-500" />
                {!isSidebarCollapsed && (
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase italic">{t('blog_total_reading')}</span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{blogs.reduce((acc, b) => acc + (b.views_count || 0), 0)} {t('blog_views')}</span>
                  </div>
                )}
              </div>
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
                          title={t('logout')}
                        >
                          <LogOut size={14} />
                        </button>
                      </>
                    )}
                 </div>
            ) : (
               !isSidebarCollapsed ? (
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-500/10 dark:to-blue-500/10 rounded-2xl border border-blue-100/50 dark:border-blue-500/20">
                   <p className="text-[10px] text-blue-700/70 dark:text-blue-400/70 mb-3 leading-tight">{t('blog_login_desc')}</p>
                   <button onClick={() => navigate('/login')} className="w-full mobile-login-btn bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                     <User size={14} />
                     {t('login')}
                   </button>
                </div>
               ) : (
                 <button 
                  onClick={() => navigate('/login')}
                  title={t('login')}
                  className="w-full h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center transition-all hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                 >
                   <User size={20} />
                 </button>
               )
            )}

            <div className={`flex items-center gap-2 ${isSidebarCollapsed ? 'flex-col' : ''}`}>
              <button
                onClick={() => toggleTheme()}
                title={theme === 'dark' ? t('blog_day_mode') : t('blog_night_mode')}
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
            <div className="flex items-center gap-2 text-blue-500 font-extrabold uppercase text-[10px] tracking-[0.2em] mb-4">
              <span className="w-8 h-[2px] bg-blue-500"></span>
              BOTLYHUB BLOG | KNOWLEDGE HUB
            </div>
            <h1 className="text-4xl md:text-6xl text-slate-900 dark:text-white mb-4 italic hero-title">
              {t('blog_hero_title')}
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl opacity-80">
              {t('blog_subtitle')}
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
                {t(cat.translationKey)}
              </button>
            ))}
          </div>

          <div className="space-y-12">
            {isLoading ? (
              <BlogSkeleton />
            ) : filteredPosts.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-slate-400 font-bold uppercase tracking-widest">{t('blog_no_posts_cat')}</p>
              </div>
            ) : (
              <>
                {/* Featured Post - First post of filtered list */}
                {activeCategory === 'all' && featuredPost && (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => { haptic('light'); navigate('/blog/' + (featuredPost.slug || featuredPost.id)); }}
                    className="group cursor-pointer blog-featured-card custom-cursor-on-hover fancy-glass-card hover:border-blue-500/30 transition-all"
                  >
                    <div className="aspect-[16/9] md:aspect-[2.4/1] rounded-2xl overflow-hidden mb-6 bg-slate-100 dark:bg-slate-900/40 relative">
                      {featuredPost.image ? (
                        <img 
                          src={featuredPost.image} 
                          alt={featuredPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                          referrerPolicy="no-referrer"
                          loading="eager"
                        />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center bg-slate-950">
                            <BookOpen size={64} className="text-slate-800" />
                         </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                      
                      {/* Mobile Date Overlay */}
                      <div className="absolute bottom-4 right-4 md:hidden z-10">
                         <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white">
                            <Calendar size={12} />
                            <span className="text-[10px] font-bold uppercase">{new Date(featuredPost.created_at).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long' })}</span>
                         </div>
                      </div>

                      <div className="absolute bottom-10 left-10 hidden md:block">
                         <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
                            <Star size={16} className="text-amber-400 fill-amber-400" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{t('blog_featured_post')}</span>
                         </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <span className="px-4 py-1.5 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full">{featuredPost.category}</span>
                        <div className="hidden md:flex items-center gap-2 text-slate-400">
                          <Calendar size={14} />
                          <span className="text-[10px] font-bold uppercase">{new Date(featuredPost.created_at).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
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
                          <span className="text-[10px] font-bold uppercase">{featuredPost.readTime || `5 ${t('blog_read_time')}`}</span>
                        </div>
                      </div>
                      <h2 className="text-3xl md:text-4xl text-slate-900 dark:text-white tracking-tighter leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors card-title italic">
                        {featuredPost.title}
                      </h2>
                      <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 italic font-medium card-desc">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex flex-wrap gap-2 py-4">
                        {featuredPost.hashtags?.map((tag, i) => (
                           <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-white/5 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-100 dark:border-white/10 group-hover:border-blue-500/30 transition-all">#{tag}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100/50 dark:border-slate-800/10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
                            <Logo isIcon className="scale-50 fill-white" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">{featuredPost.author}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('blog_editor')}</span>
                          </div>
                        </div>
                        <button className="flex items-center gap-2 text-blue-600 font-black text-[11px] uppercase tracking-widest group/btn hover:mr-2 transition-all">
                           {t('blog_read_more')} <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${activeCategory === 'all' ? 'py-16 border-t' : ''} border-slate-100/50 dark:border-white/5`}>
                  {regularPosts.map((post, idx) => (
                    <motion.div 
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => { haptic('light'); navigate('/blog/' + (post.slug || post.id)); }}
                      className="group cursor-pointer flex flex-col h-full fancy-glass-card hover:border-blue-500/30 transition-all"
                    >
                      <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-6 bg-slate-100 dark:bg-slate-900/40 relative">
                        {post.image ? (
                          <img 
                            src={post.image} 
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center bg-slate-950">
                              <BookOpen size={32} className="text-slate-800" />
                           </div>
                        )}
                        <div className="absolute top-4 left-4">
                           <span className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-[8px] font-black text-white uppercase tracking-widest border border-white/10">{post.category}</span>
                        </div>
                      </div>
                      <div className="space-y-4 flex-1 flex flex-col">
                        <div className="flex items-center gap-4 blog-meta-text text-[9px] font-black uppercase tracking-widest text-slate-400 italic">
                          <span>{new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-800"></span>
                          <span className="flex items-center gap-1.5"><TrendingUp size={12} className="text-blue-500" /> {post.views_count || 0}</span>
                          <span className="flex items-center gap-1.5"><Heart size={12} className="text-red-500" /> {post.likes_count || 0}</span>
                          <span className="flex items-center gap-1.5"><Clock size={12} className="text-blue-500" /> {post.readTime || '5 dk'}</span>
                        </div>
                        <h3 className="text-xl md:text-2xl text-slate-900 dark:text-white tracking-tighter group-hover:text-blue-600 transition-colors line-clamp-2 italic leading-tight card-title">
                          {post.title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed flex-1 font-medium italic card-desc">
                          {post.excerpt}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {post.hashtags?.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-[9px] font-black text-blue-500/50 uppercase tracking-widest group-hover:text-blue-500 transition-colors">#{tag}</span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100/50 dark:border-slate-800/10">
                          <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white p-1.5 shadow-sm">
                                <Logo isIcon className="fill-white" />
                             </div>
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

          {/* BotlyHub Team Banner - Requested by user */}
          <div className="mt-20 bg-blue-600 rounded-[44px] p-8 md:p-12 text-white relative overflow-hidden group shadow-2xl shadow-blue-500/30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white flex items-center justify-center p-6 shadow-2xl shrink-0">
                <Logo isIcon className="fill-blue-600 w-full h-full" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                  <span className="px-3 py-1 bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/20">TEAM</span>
                  <span className="w-12 h-[1px] bg-white/40"></span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 uppercase">{t('blog_team_label')}</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-4 leading-tight">{t('blog_team_title')}</h2>
                <p className="text-blue-100/80 text-sm md:text-lg font-medium leading-relaxed max-w-2xl italic">
                  {t('blog_team_desc')}
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Search & Floating newsletter */}
        <aside className="hidden xl:flex flex-col w-80 h-screen sticky top-0 py-12 px-6 overflow-y-auto no-scrollbar space-y-10">
          <button
             onClick={() => { haptic('light'); setIsSearchModalOpen(true); }}
             className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#f2f4f7] dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10 border border-slate-100 dark:border-white/5 hover:border-blue-500/50 transition-all text-sm font-semibold group"
          >
            <Search size={18} className="group-hover:scale-110 group-hover:text-blue-500 transition-all" />
            <span>{t('blog_search_action')}</span>
            <div className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 opacity-50 bg-white dark:bg-slate-800">⌘K</div>
          </button>

          <div className="space-y-6">
            <h4 className="px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">{t('blog_trend_tags')}</h4>
            <div className="flex flex-wrap gap-2">
              {trendHashtags.map(tag => (
                <button 
                  key={tag} 
                  onClick={() => { haptic('light'); setSearchQuery(tag); setIsSearchModalOpen(true); }}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all font-black uppercase tracking-widest"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic font-sans">{t('blog_popular_content')}</h4>
            <div className="space-y-4">
              {[...blogs].sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, 4).map((post, i) => (
                <button 
                  key={post.id}
                  onClick={() => { haptic('light'); navigate('/blog/' + (post.slug || post.id)); }}
                  className="w-full flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-white/2 hover:bg-blue-500/5 border border-slate-100 dark:border-white/5 transition-all text-left group similar-post-card"
                >
                  <span className="text-xl font-black text-slate-200 dark:text-white/10 group-hover:text-blue-500/30 transition-colors italic">0{i+1}</span>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-[11px] font-black text-slate-900 dark:text-white line-clamp-2 leading-tight uppercase tracking-tight italic group-hover:text-blue-600 transition-colors">{post.title}</h5>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">{post.category}</span>
                       <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-white/10" />
                       <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{post.views_count || 0} {t('blog_views')}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="fancy-glass-card relative group shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-6 overflow-hidden p-2.5">
              <Logo isIcon className="fill-blue-600 dark:fill-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 uppercase text-slate-900 dark:text-white card-title">{t('blog_join_community')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed card-desc">{t('blog_community_desc')}</p>
            <button 
              onClick={() => { haptic('medium'); window.open('https://t.me/BotlyHub', '_blank'); }}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-3 group/btn"
            >
              {t('blog_telegram_channel')} 
              <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default BlogPage;

