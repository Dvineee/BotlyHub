import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Share2, 
  Bookmark, 
  MessageCircle, 
  Heart,
  Clock,
  Calendar,
  User,
  ExternalLink,
  Bot as BotIcon,
  Search,
  Layout,
  Home,
  PenTool,
  FileText,
  TrendingUp,
  Network,
  BarChart3,
  DollarSign,
  Cpu,
  BookOpen,
  Zap,
  Menu,
  X,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Sun,
  Moon,
  Globe,
  MessageSquare,
  Send,
  Loader2,
  ThumbsUp,
  Users
} from 'lucide-react';
import { useTelegram } from '../hooks/useTelegram';
import { useTranslation } from '../TranslationContext';
import { useTheme } from '../ThemeContext';
import { SEO } from '../components/SEO';
import { Logo } from '../components/Logo';
import { DatabaseService } from '../services/DatabaseService';
import { BlogPost, BlogComment } from '../types';

const UserIcon = User;

// Mock data (sharing with BlogPage)
const mockPosts = [
  {
    id: '1',
    title: 'Telegram Botları ile Pasif Gelir Elde Etme Yöntemleri',
    content: `
      <p>Son yıllarda kripto para dünyası ve Telegram ekosistemi, kullanıcılarına sunduğu Mini Apps (TMA) ve botlar aracılığıyla devasa bir ekonomik alan yarattı. Özellikle TON (The Open Network) ağının Telegram ile kusursuz entegrasyonu, geliştiricilerin ve kullanıcıların "Tap-to-Earn" veya "Play-to-Earn" modelleriyle tanışmasını sağladı.</p>
      
      <h2>Neden Telegram Botları?</h2>
      <p>Telegram, aylık 900 milyondan fazla aktif kullanıcısı olan bir platform. Bu devasa kitle, botlar için hazır bir pazar anlamına geliyor. Uygulama indirme zorunluluğu olmadan, direkt mesajlaşma ekranından erişilebilen botlar, kullanıcı deneyimini en üst seviyeye taşıyor.</p>
      
      <h3>1. Farming ve Madencilik Botları</h3>
      <p>Son dönemde Notcoin, Hamster Kombat ve benzeri projelerle hayatımıza giren farming mekanikleri, kullanıcıların sadece uygulamaya girip butona basarak veya belirli görevleri tamamlayarak token biriktirmesine olanak tanıyor.</p>
      
      <h3>2. Trading ve Arbitraj Robotları</h3>
      <p>Otomatik alım-satım yapan botlar, borsalardaki fiyat farklarını takip ederek sizin yerinize işlem yapar. Ancak bu alanda dikkatli olmak ve sadece güvenilir, açık kaynak kodlu veya ekibini tanıdığınız botları kullanmak kritik önem taşır.</p>

      <blockquote>
        "Telegram ekosistemi, Web3 dünyasının kitlesel benimsenmesi için en güçlü köprü olmaya aday."
      </blockquote>

      <h2>TON Ekosisteminin Rolü</h2>
      <p>TON ağı, saniyede milyonlarca işlemi gerçekleştirebilme kapasitesiyle Telegram üzerindeki ekonomik faaliyetlerin temel taşıdır. USDT'nin TON ağına gelişiyle birlikte, botlar üzerinden yapılan ödemeler ve çekimler hiç olmadığı kadar kolaylaşmıştır.</p>
      
      <h2>Sonuç ve Uyarılar</h2>
      <p>Pasif gelir elde etme vaadiyle ortaya çıkan binlerce bot arasından doğru olanı seçmek zordur. BotlyHub olarak biz, sizin için bu projeleri inceliyor ve en güvenilir olanları listeliyoruz. Unutmayın, hiçbir sistem %100 kazanç garantisi vermez; yatırım yapmadan önce kendi araştırmanızı (DYOR) mutlaka yapmalısınız.</p>
    `,
    category: 'Para Kazanma',
    date: '12 Mayıs 2024',
    readTime: '6 dk okuma',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1074&auto=format&fit=crop',
    author: 'BotlyHub Ekibi',
    authorAvatar: 'BH'
  }
];

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

const BlogPostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { haptic, user } = useTelegram();
  const { language, setLanguage, t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [similarPosts, setSimilarPosts] = useState<BlogPost[]>([]);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [popularCategories, setPopularCategories] = useState<{id: string, label: string, engagement: number}[]>([]);
  const [currentRankIndex, setCurrentRankIndex] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await DatabaseService.getBlogById(id);
        setPost(data);
        
        if (data) {
            // Log view
            DatabaseService.incrementBlogView(id);
            
            // Similar posts
            const blogs = await DatabaseService.getBlogs();
            setAllPosts(blogs);
            setSimilarPosts(blogs.filter(b => b.id !== id).slice(0, 3));
            
            // Comments
            const comms = await DatabaseService.getBlogComments(id);
            setComments(comms);

            // Calculate category popularity for the leaderboard
            const categoryStats: { [key: string]: { views: number, comments: number } } = {};
            
            // Get all categories engagement (we need a broad view)
            blogs.forEach(b => {
              const catLabel = b.category;
              if (!categoryStats[catLabel]) categoryStats[catLabel] = { views: 0, comments: 0 };
              categoryStats[catLabel].views += (b.views_count || 0);
            });

            // Rank categories
            const sortedCats = Object.entries(categoryStats)
              .map(([label, stats]) => {
                const cat = categories.find(c => c.label === label);
                return {
                  id: cat?.id || label,
                  label,
                  engagement: Math.floor(stats.views / 2 + 10) // Simulating comment count logic
                };
              })
              .sort((a, b) => b.engagement - a.engagement);

            setPopularCategories(sortedCats);
            
            // Set currentRankIndex to the category of the POST being read
            const currentCatIndex = sortedCats.findIndex(c => c.label === data.category);
            if (currentCatIndex !== -1) {
              setCurrentRankIndex(currentCatIndex);
            }
            
            // Check if liked
            if (user?.id) {
                const liked = await DatabaseService.isBlogLikedByUser(id, user.id.toString());
                setIsLiked(liked);
            }
        }
      } catch (err) {
        console.error("Fetch Blog Detail Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
    window.scrollTo(0, 0);
  }, [id, user?.id]);

  const handleLike = async () => {
    if (!id || !user?.id) {
        alert('Beğenmek için giriş yapmalısınız.');
        return;
    }

    // Optimistic update
    const previousLiked = isLiked;
    const previousCount = post?.likes_count || 0;
    
    setIsLiked(!previousLiked);
    if (post) {
        setPost({
            ...post,
            likes_count: !previousLiked ? previousCount + 1 : Math.max(0, previousCount - 1)
        });
    }
    haptic('medium');

    try {
        const liked = await DatabaseService.toggleBlogLike(id, user.id.toString());
        // Sync if server differs
        if (liked !== !previousLiked) {
            setIsLiked(liked);
        }
    } catch (e: any) {
        console.error("Like Error:", e);
        // Rollback on error
        setIsLiked(previousLiked);
        if (post) {
            setPost({
                ...post,
                likes_count: previousCount
            });
        }
        if (e?.code === '42501') {
            console.warn("RLS policy blocking like.");
        }
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id || !user) return;
    
    setIsSubmittingComment(true);
        try {
            const commentData = {
                blog_id: id,
                user_id: user.id.toString(),
                user_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Kullanıcı',
                user_avatar: user.photo_url || '',
                content: newComment.trim(),
                created_at: new Date().toISOString()
            };
            
            // Optimistic update: add to UI immediately
            setComments([commentData as any, ...comments]);
            setNewComment('');
            haptic('medium');

            try {
                await DatabaseService.addBlogComment(commentData);
            } catch (error: any) {
                console.error("Database Comment Error:", error);
                if (error?.code === '42501') {
                    // Specific RLS error help (only in console for now as we did optimistic update)
                    console.warn("RLS policy is blocking comment insertion. Please check Supabase policies.");
                }
                // Optional: rollback if we really want to be strict, but optimistic is better for engagement
                // setComments(comments); 
            }
        } catch (e) {
            console.error("Comment Error:", e);
            alert(t('blog_comment_error'));
        } finally {
            setIsSubmittingComment(false);
        }
  };

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

  if (isLoading) {
    return (
      <div className="bg-[#fcfcfc] dark:bg-slate-950 min-h-screen flex flex-col items-center justify-center space-y-6">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 animate-pulse">{t('blog_loading')}</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="bg-[#fcfcfc] dark:bg-slate-950 min-h-screen flex flex-col items-center justify-center space-y-6 p-8 text-center">
        <BotIcon size={64} className="text-slate-800" />
        <h2 className="text-2xl font-black uppercase italic tracking-tighter">{t('blog_not_found')}</h2>
        <p className="text-slate-500 max-w-xs text-sm font-medium">{t('blog_not_found_desc')}</p>
        <button onClick={() => navigate('/blog')} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20">{t('blog_back_to_blog')}</button>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfcfc] dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 font-sans blog-page-scope">
      <SEO 
        title={`${post.title}`} 
        description={post.title} 
        ogType="article"
        ogImage={post.image}
        articleData={{
          publishedTime: '2024-05-12T00:00:00Z', // ISO format for SEO
          author: post.author,
          category: post.category,
          image: post.image
        }}
        breadcrumbs={[
          { name: t('blog_home'), item: 'https://botlyhub.com/' },
          { name: t('blog_title'), item: 'https://botlyhub.com/blog' },
          { name: post.title, item: `https://botlyhub.com/blog/${post.id}` }
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
                    {allPosts.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                      allPosts.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())).map(post => (
                        <button 
                          key={post.id}
                          onClick={() => { navigate('/blog/' + post.id); setIsSearchModalOpen(false); }}
                          className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all text-left group"
                        >
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                            {post.image ? <img src={post.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-800"><BookOpen size={20}/></div>}
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
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded">ESC</kbd> {language === 'tr' ? 'Kapat' : 'Close'}</span>
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
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
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
                 className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-lg font-bold"
              >
                <Home size={24} className="text-blue-500" />
                {t('blog_home')}
              </button>
              <button
                 onClick={() => { haptic('light'); navigate('/blog'); }}
                 className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-lg font-bold"
              >
                <FileText size={24} className="text-blue-500" />
                {t('blog_all_articles')}
              </button>

              <div className="pt-4 pb-2 px-2 text-xs font-black uppercase tracking-widest text-slate-400">{t('blog_categories')}</div>
              
              <div className="grid grid-cols-1 gap-2">
                {categories.slice(1, 6).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { haptic('light'); navigate('/blog'); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 transition-all font-bold"
                  >
                    <div className="flex items-center gap-4">
                      <cat.icon size={22} className="text-slate-400" />
                      {cat.label}
                    </div>
                    <ChevronRight size={18} />
                  </button>
                ))}
              </div>
            </nav>

            <div className="mt-6 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { haptic('light'); toggleTheme(); }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white font-bold"
                >
                  {theme === 'dark' ? <Sun size={24} className="text-yellow-400" /> : <Moon size={24} className="text-blue-500" />}
                  {theme === 'dark' ? (language === 'tr' ? 'Gündüz' : 'Light') : (language === 'tr' ? 'Gece' : 'Dark')}
                </button>

                <button
                  onClick={() => { haptic('light'); setIsSearchModalOpen(true); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white font-bold"
                >
                  <Search size={24} className="text-blue-500" />
                  {t('blog_explore')}
                </button>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 overflow-x-auto no-scrollbar">
                <Globe size={24} className="text-slate-400 shrink-0" />
                <div className="flex gap-2">
                  {(['tr', 'en', 'ru'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => { haptic('light'); setLanguage(lang); }}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        language === lang 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                          : 'bg-white dark:bg-white/5 text-slate-400'
                      }`}
                    >
                      {lang === 'tr' ? 'Türkçe' : lang === 'en' ? 'English' : 'Русский'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1400px] mx-auto flex">
        
        {/* Left Sidebar - Consistent with BlogPage */}
        <aside className={`hidden lg:flex flex-col ${isSidebarCollapsed ? 'w-20 overflow-visible' : 'w-64'} h-screen sticky top-0 z-[100] border-r border-slate-100 dark:border-white/5 py-8 transition-all duration-300 bg-[#fcfcfc] dark:bg-slate-950`}>
          <div className="px-6 flex items-center justify-between mb-10 shrink-0">
            {!isSidebarCollapsed && <Logo onClick={() => navigate('/blog')} className="cursor-pointer" />}
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
               className={`w-full relative flex items-center gap-3 p-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-sm font-semibold group ${isSidebarCollapsed ? 'justify-center' : ''}`}
            >
              <Home size={20} className="group-hover:scale-110 transition-transform" />
              {!isSidebarCollapsed && <span>{t('blog_home')}</span>}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity backdrop-blur-md whitespace-nowrap z-[110] shadow-2xl border border-white/10">
                  {t('blog_home')}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45 border-l border-b border-white/10"></div>
                </div>
              )}
            </button>
            <button
               onClick={() => { haptic('light'); navigate('/blog'); }}
               title={t('blog_all_articles')}
               className={`w-full relative flex items-center gap-3 p-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-sm font-semibold group ${isSidebarCollapsed ? 'justify-center' : ''}`}
            >
              <FileText size={20} className="group-hover:scale-110 transition-transform" />
              {!isSidebarCollapsed && <span>{t('blog_all_articles')}</span>}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity backdrop-blur-md whitespace-nowrap z-[110] shadow-2xl border border-white/10">
                  {t('blog_all_articles')}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45 border-l border-b border-white/10"></div>
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
              {categories.slice(1, 6).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { haptic('light'); navigate('/blog'); }}
                  title={cat.label}
                  className={`w-full relative flex items-center gap-3 p-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-sm font-semibold group ${isSidebarCollapsed ? 'justify-center' : ''}`}
                >
                  <cat.icon size={20} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                  {!isSidebarCollapsed && <span>{cat.label}</span>}
                  {isSidebarCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity backdrop-blur-md whitespace-nowrap z-[110] shadow-2xl border border-white/10">
                      {cat.label}
                      <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45 border-l border-b border-white/10"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </nav>

          <div className="mt-auto px-6 pt-6 shrink-0 border-t border-slate-100 dark:border-white/5 space-y-4">
            <div className={`flex items-center gap-2 ${isSidebarCollapsed ? 'flex-col' : ''}`}>
              <button
                onClick={() => toggleTheme()}
                title={theme === 'dark' ? 'Gündüz Modu' : 'Gece Modu'}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-all flex-1 flex justify-center"
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

        {/* Main Content Area - Reading Focus */}
        <main className="flex-1 px-4 sm:px-8 py-8 md:py-12 w-full overflow-hidden max-w-4xl mx-auto xl:max-w-none">
          
          {/* Mobile Back Header */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate(-1)}
              className="p-2.5 bg-slate-100 dark:bg-white/10 rounded-xl"
            >
              <ChevronLeft size={20} />
            </button>
            <Logo className="scale-75" />
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2.5 bg-slate-100 dark:bg-white/10 rounded-xl"
            >
              <Menu size={22} className="text-slate-900 dark:text-white" />
            </button>
          </div>

          {/* Article Header */}
          <header className="mb-10 lg:mb-16">
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-md">
                {post.category}
              </span>
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <Clock size={14} />
                {post.readTime}
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider ml-auto">
                <TrendingUp size={14} className="text-blue-500" />
                {post.views_count || 0} {t('blog_views')}
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white mb-8 leading-[1.1]">
              {post.title}
            </h1>

            <div className="flex items-center justify-between py-6 border-y border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white p-2 shrink-0 shadow-lg shadow-blue-500/20">
                    <Logo isIcon className="fill-white" />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{post.author}</div>
                  <div className="text-xs font-bold text-slate-400">{new Date(post.created_at).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${isLiked ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-red-500'}`}
                >
                  <Heart size={18} className={isLiked ? 'fill-white' : ''} />
                  <span className="text-xs font-black">{post.likes_count || 0}</span>
                </button>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-blue-500">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </header>

          {/* Feature Image */}
          <div className="aspect-[2/1] rounded-3xl overflow-hidden mb-12 shadow-sm bg-slate-100 dark:bg-slate-900">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>

          {/* Article Body */}
          <article className="prose prose-slate dark:prose-invert max-w-none 
            prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-slate-900 dark:prose-headings:text-white
            prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed prose-p:text-lg
            prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50/50 dark:prose-blockquote:bg-blue-900/10 prose-blockquote:p-6 prose-blockquote:rounded-r-xl prose-blockquote:font-bold prose-blockquote:italic
            prose-strong:text-slate-900 dark:prose-strong:text-white
            prose-img:rounded-3xl prose-img:shadow-lg
            prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:font-black prose-a:no-underline hover:prose-a:underline
          ">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>

          {/* Article Footer Area */}
          <footer className="mt-16 pt-10 border-t border-slate-100 dark:border-white/5">
              <div className="flex flex-wrap items-center justify-between gap-6 pb-12">
                <div className="flex items-center gap-6">
                  <button 
                    onClick={handleLike}
                    className="flex items-center gap-2 group"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isLiked ? 'bg-red-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:text-red-500 group-hover:bg-red-50 dark:group-hover:bg-red-500/10'}`}>
                      <Heart size={20} className={isLiked ? 'fill-white' : ''} />
                    </div>
                    <span className={`text-sm font-black italic ${isLiked ? 'text-red-500' : 'text-slate-500'}`}>{post.likes_count || 0} {t('blog_likes')}</span>
                  </button>
                  <button className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-all">
                      <MessageCircle size={20} />
                    </div>
                    <span className="text-sm font-black text-slate-500 italic">{comments.length} {t('blog_comments')}</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {post.hashtags && post.hashtags.length > 0 ? (
                    post.hashtags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-50 dark:bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-100 dark:border-white/10 hover:border-blue-500/50 hover:text-blue-500 transition-all cursor-default">#{tag}</span>
                    ))
                  ) : (
                    <span className="px-3 py-1 bg-slate-50 dark:bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg">#BotlyHub</span>
                  )}
                </div>
              </div>

            {/* Comments Section */}
            <section id="comments-section" className="mb-20">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 italic uppercase tracking-tighter flex items-center gap-3">
                <MessageSquare size={20} className="text-blue-500" />
                {t('blog_comments')} <span className="text-slate-300 dark:text-slate-800">/</span> {comments.length}
              </h3>
              
              <div className="bg-white dark:bg-slate-900/40 p-6 rounded-[32px] border border-slate-100 dark:border-white/5 mb-12">
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 overflow-hidden">
                      {user?.photo_url ? (
                        <img src={user.photo_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <UserIcon size={20} />
                      )}
                    </div>
                    <div className="flex-1">
                      <textarea 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={t('blog_comment_placeholder')}
                        className="comment-textarea w-full bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400 resize-none h-24 font-medium italic"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-slate-50 dark:border-white/5">
                    <button 
                      type="submit"
                      disabled={isSubmittingComment || !newComment.trim()}
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
                    >
                      {isSubmittingComment ? t('blog_sending_comment') : t('blog_submit_comment')}
                      <Send size={14} />
                    </button>
                  </div>
                </form>
              </div>

              <div className="space-y-6">
                {comments.map((comment, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={comment.id || idx} 
                    className="flex gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 overflow-hidden shadow-sm">
                      {comment.user_avatar ? (
                        <img src={comment.user_avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <UserIcon size={20} />
                      )}
                    </div>
                    <div className="flex-1 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl rounded-tl-none border border-transparent group-hover:border-blue-500/20 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{comment.user_name}</span>
                        <span className="text-[10px] font-bold text-slate-400">{new Date(comment.created_at).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        {comment.content}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {comments.length === 0 && (
                  <div className="py-12 text-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[32px]">
                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] italic">{t('blog_no_comments')}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Author Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 p-4">
                <Logo isIcon className="fill-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">{post.author}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">
                  {t('blog_author_desc')}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <button className="text-xs font-black text-blue-500 uppercase tracking-widest hover:underline">{t('blog_follow')}</button>
                  <button className="text-xs font-black text-blue-500 uppercase tracking-widest hover:underline">{t('blog_all_posts')}</button>
                </div>
              </div>
            </div>
          </footer>
        </main>

        {/* Right Sidebar - Sticky Tools */}
        <aside className="hidden xl:flex flex-col w-80 h-screen sticky top-0 py-12 px-6 space-y-10">
          <button
             onClick={() => { haptic('light'); setIsSearchModalOpen(true); }}
             className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10 border border-slate-100 dark:border-white/5 hover:border-blue-500/50 transition-all text-sm font-semibold group"
          >
            <Search size={18} className="group-hover:scale-110 group-hover:text-blue-500 transition-all" />
            <span>{t('blog_search_action')}</span>
            <div className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 opacity-50 bg-white dark:bg-slate-800">⌘K</div>
          </button>

          {/* Popular Category Leaderboard - Matching requested design */}
          {popularCategories.length > 0 && (
            <div className="bg-[#ddeaf8] dark:bg-slate-900/60 rounded-[40px] p-8 border border-slate-100 dark:border-white/5 relative group shadow-sm popular-content-card">
                <div className="flex items-start justify-between mb-8">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white italic tracking-tighter"># {currentRankIndex + 1}</h2>
                    <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1 italic">{t('blog_most_popular')}</p>
                </div>
                <div className="flex items-center bg-white/50 dark:bg-black/20 rounded-full p-1 border border-slate-200/50 dark:border-white/5 translate-y-1">
                    <button 
                    onClick={() => { haptic('light'); setCurrentRankIndex(prev => (prev === 0 ? popularCategories.length - 1 : prev - 1)); }}
                    className="p-3 hover:bg-white dark:hover:bg-white/10 rounded-full text-slate-400 hover:text-blue-500 transition-all"
                    >
                    <ChevronLeft size={16} />
                    </button>
                    <div className="w-[1px] h-4 bg-slate-200 dark:bg-white/10" />
                    <button 
                    onClick={() => { haptic('light'); setCurrentRankIndex(prev => (prev === popularCategories.length - 1 ? 0 : prev + 1)); }}
                    className="p-3 hover:bg-white dark:hover:bg-white/10 rounded-full text-slate-400 hover:text-blue-500 transition-all"
                    >
                    <ChevronRight size={16} />
                    </button>
                </div>
                </div>
                
                <button 
                onClick={() => { 
                    haptic('medium'); 
                    const commentsSection = document.getElementById('comments-section');
                    if (commentsSection) {
                        commentsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }}
                className="w-full bg-[#ff5c5c] hover:bg-[#ff4d4d] text-white rounded-full py-2 px-5 flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-red-500/20 group/btn"
                >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Users size={20} className="text-white" />
                </div>
                <div className="flex-1 text-left min-w-0">
                    <p className="text-[12px] font-black uppercase tracking-tight truncate italic">
                    {popularCategories[currentRankIndex]?.label || (language === 'tr' ? 'Yükleniyor...' : 'Loading...')} • {popularCategories[currentRankIndex]?.engagement || 0} {t('blog_comments').toLowerCase()}
                    </p>
                </div>
                </button>
            </div>
          )}

          <div className="space-y-6">
            <h4 className="px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">{t('blog_similar_posts')}</h4>
            <div className="space-y-4">
              {similarPosts.map((p, i) => (
                <button 
                  key={p.id} 
                  onClick={() => { haptic('light'); navigate('/blog/' + p.id); }} 
                  className="w-full flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-white/2 hover:bg-blue-500/5 border border-slate-100 dark:border-white/5 transition-all text-left group similar-post-card"
                >
                  <span className="text-xl font-black text-slate-200 dark:text-white/5 group-hover:text-blue-500/30 transition-colors italic">0{i+1}</span>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-[11px] font-black text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors mb-1 line-clamp-2 italic leading-tight uppercase">
                      {p.title}
                    </h5>
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{p.readTime || `5 ${t('blog_read_time')}`}</div>
                  </div>
                </button>
              ))}
              {similarPosts.length === 0 && (
                 <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest italic px-2">{t('blog_search_empty')}</p>
              )}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default BlogPostDetail;
