import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, Clock, Calendar, Trophy, Bookmark, MessageSquare, 
  Triangle, Send, Share2, Plus, X, Search, Check, Sparkles, AlertCircle,
  Store, User, Bot as BotIcon, Megaphone, Bell, LogOut, Menu, ChevronDown,
  LayoutGrid, Briefcase, ExternalLink, ArrowLeft, Sun, Moon, Wallet, Compass, Coins, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTelegram } from '../hooks/useTelegram';
import { useTranslation } from '../TranslationContext';
import { DatabaseService } from '../services/DatabaseService';
import { SEO } from '../components/SEO';
import { useTheme } from '../ThemeContext';
import Logo from '../components/Logo';
import { categories, appsSubCategories } from '../data';
import { API_BASE_URL } from '../constants';
import LoginModal from '../components/LoginModal';

interface QTag {
  type: 'bot' | 'channel' | 'general';
  id: string;
  name: string;
}

interface QComment {
  id: string;
  topic_id: string;
  author_id: string;
  author_name: string;
  author_avatar: string;
  author_bio?: string;
  content: string;
  created_at: string;
  likes_count: number;
  parent_id?: string | null;
}

interface QTopic {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  author_avatar: string;
  author_bio?: string;
  created_at: string;
  tags: QTag[];
  upvotes_count: number;
  upvoted_users: string[];
  comments_count: number;
  comments: QComment[];
}

export default function QAForum() {
  const navigate = useNavigate();
  const location = useLocation();
  const { haptic, user, setWebAuthUser } = useTelegram();
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  // Helper to format names to starting with @ and telegram-style
  const formatDisplayAuthor = (name: string) => {
    if (!name) return '@anon';
    const trimmed = name.trim();
    if (trimmed.startsWith('@')) return trimmed;
    return `@${trimmed.toLowerCase().replace(/\s+/g, '')}`;
  };

  // Active current user session details
  const currentUser = {
    id: user?.id?.toString() || 'user-active-session',
    name: user?.username ? `@${user.username}` : `@${(user?.first_name || user?.name || 'Kenan').toLowerCase().replace(/\s+/g, '')}`,
    avatar: user?.photo_url || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.first_name || user?.name || 'Kenan')}&background=0f172a&color=fff`,
    bio: ''
  };

  // State Management
  const [topics, setTopics] = useState<QTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'son' | 'week' | 'month'>('all');
  const [activeTopic, setActiveTopic] = useState<QTopic | null>(null);

  // Layout Dynamic Navigation Menu States (replicated from Home.tsx)
  const [openMenu, setOpenMenu] = useState<'kesfet' | 'investors' | null>(null);
  const [navState, setNavState] = useState<'main' | 'bots' | 'apps'>('main');
  const [mobileModal, setMobileModal] = useState<'kesfet' | 'investors' | null>(null);
  const internalMenuRef = useRef<HTMLDivElement>(null);

  // Profile Dropdown state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Modals & Panels
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isDetailView, setIsDetailView] = useState(false);

  // New Question Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<QTag[]>([]);
  const [availableBots, setAvailableBots] = useState<any[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<QTag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // New Comment State
  const [commentText, setCommentText] = useState('');
  const [commentSort, setCommentSort] = useState<'son' | 'populer'>('son');
  const [activeReplyCommentId, setActiveReplyCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Dynamic Popular Tags from topics with safe fallbacks
  const popularTags = React.useMemo(() => {
    const counts: { [key: string]: { tag: QTag; count: number } } = {};
    
    // Add default popular tags as base seed
    const defaultSeeds = ['yardım', 'hata', 'güncelleme', 'ödeme', 'gpt', 'ton', 'api', 'reklam'];
    defaultSeeds.forEach(term => {
      counts[term] = { tag: { type: 'general', id: term, name: term }, count: 1 };
    });

    topics.forEach(t => {
      t.tags?.forEach(tag => {
        const cleanId = tag.id?.toLowerCase() || tag.name?.toLowerCase();
        if (cleanId) {
          if (!counts[cleanId]) {
            counts[cleanId] = { tag, count: 0 };
          }
          counts[cleanId].count += 3; // Give higher weight to actual topics tags
        }
      });
    });

    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(x => x.tag);
  }, [topics]);

  // Dynamic Most Discussed topics
  const mostDiscussedTopics = React.useMemo(() => {
    return [...topics]
      .filter(t => t.comments_count > 0)
      .sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0))
      .slice(0, 5);
  }, [topics]);

  // Fetch discussions list
  const fetchTopics = async (filter = selectedFilter, selectTag?: string) => {
    setLoading(true);
    try {
      const data = await DatabaseService.getQADiscussions(filter, selectTag);
      setTopics(data);
    } catch (err) {
      console.error('Failed to fetch topics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch list of bots for tagging
  const fetchAvailableBots = async () => {
    try {
      const bots = await DatabaseService.getBots();
      setAvailableBots(bots || []);
    } catch (err) {
      console.error('Failed to fetch bots for tags:', err);
    }
  };

  useEffect(() => {
    fetchTopics();
    fetchAvailableBots();
  }, []);

  useEffect(() => {
    if (currentUser?.id) {
      DatabaseService.getNotifications(currentUser.id.toString()).then(notes => {
        const unread = notes?.filter((n: any) => !n.isRead).length || 0;
        setUnreadCount(unread);
      }).catch(() => {});
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (internalMenuRef.current && !internalMenuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
        setNavState('main');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [currentUser?.id]);

  // Filter change handler
  const handleFilterChange = (filter: 'all' | 'son' | 'week' | 'month') => {
    haptic('light');
    setSelectedFilter(filter);
    fetchTopics(filter);
  };

  // Upvote Handler
  const handleUpvote = async (topicId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (!user || !user.id || user.id === 'guest_user') {
      haptic('heavy');
      alert("Beğenmek için lütfen giriş yapın.");
      setIsLoginModalOpen(true);
      return;
    }
    
    haptic('light');

    try {
      const data = await DatabaseService.toggleQAUpvote(topicId, currentUser.id.toString());

      // Update topics list state
      setTopics(prev => prev.map(topic => {
        if (topic.id === topicId) {
          const hasUpvoted = topic.upvoted_users?.includes(currentUser.id);
          const updatedUsers = hasUpvoted 
            ? topic.upvoted_users.filter(id => id !== currentUser.id)
            : [...(topic.upvoted_users || []), currentUser.id];
          
          return {
            ...topic,
            upvotes_count: data.upvotes_count,
            upvoted_users: updatedUsers
          };
        }
        return topic;
      }));

      // Update active topic if in detail view
      if (activeTopic && activeTopic.id === topicId) {
        setActiveTopic(prev => {
          if (!prev) return null;
          const hasUpvoted = prev.upvoted_users?.includes(currentUser.id);
          const updatedUsers = hasUpvoted
            ? prev.upvoted_users.filter(id => id !== currentUser.id)
            : [...(prev.upvoted_users || []), currentUser.id];
          
          return {
            ...prev,
            upvotes_count: data.upvotes_count,
            upvoted_users: updatedUsers
          };
        });
      }
    } catch (err) {
      console.error('Upvote failed:', err);
    }
  };

  // Comment Submit
  const handleAddComment = async (parentId: string | null = null, inlineText: string = '') => {
    const textToSubmit = parentId ? inlineText : commentText;
    if (!textToSubmit.trim() || !activeTopic) return;
    
    if (!user || !user.id || user.id === 'guest_user') {
      haptic('heavy');
      alert("Yorum yazmak veya cevap vermek için lütfen giriş yapın.");
      setIsLoginModalOpen(true);
      return;
    }
    
    haptic('medium');

    try {
      const newComment = await DatabaseService.submitQAComment(activeTopic.id, {
        author_id: currentUser.id,
        author_name: currentUser.name,
        author_avatar: currentUser.avatar,
        author_bio: currentUser.bio,
        content: textToSubmit,
        parent_id: parentId
      });

      setActiveTopic(prev => {
        if (!prev) return null;
        return {
          ...prev,
          comments_count: prev.comments_count + 1,
          comments: [...(prev.comments || []), newComment]
        };
      });
      if (parentId) {
        setReplyText('');
        setActiveReplyCommentId(null);
      } else {
        setCommentText('');
      }
      // Refresh feed list in background
      fetchTopics(selectedFilter);
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  // Create New Topic Submit
  const handleCreateTopic = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    
    if (!user || !user.id || user.id === 'guest_user') {
      haptic('heavy');
      alert("Soru sormak veya tartışma başlatmak için lütfen giriş yapın.");
      setIsLoginModalOpen(true);
      return;
    }
    
    haptic('medium');

    try {
      await DatabaseService.createQADiscussion({
        title: newTitle,
        content: newContent,
        author_id: currentUser.id,
        author_name: currentUser.name,
        author_avatar: currentUser.avatar,
        author_bio: currentUser.bio,
        tags: selectedTags
      });

      setShowCreateModal(false);
      setNewTitle('');
      setNewContent('');
      setSelectedTags([]);
      fetchTopics('son'); // Switch sorting to Show latest first
    } catch (err) {
      console.error('Creating topic failed:', err);
    }
  };

  // Open active view detail details
  const handleViewDetails = (topic: QTopic) => {
    haptic('light');
    setActiveTopic(topic);
    setIsDetailView(true);
  };

  // Handle Tags Input Suggestions logic
  const handleTagInputChange = (val: string) => {
    setTagInput(val);
    if (!val) {
      setSuggestedTags([]);
      setShowSuggestions(false);
      return;
    }

    const searchStr = val.replace('#', '').toLowerCase();
    
    // Suggest general tags or based on bots name
    const matches: QTag[] = [];
    
    // General terms suggestions
    const generalTerms = ['giriş', 'yardım', 'hata', 'güncelleme', 'gelir', 'ödeme', 'ton', 'reklam', 'ekosistem'];
    generalTerms.forEach(term => {
      if (term.includes(searchStr)) {
        matches.push({ type: 'general', id: term, name: term });
      }
    });

    // Bot suggestions
    availableBots.forEach(bot => {
      if (bot.name.toLowerCase().includes(searchStr)) {
        matches.push({ type: 'bot', id: bot.slug || bot.id, name: bot.name });
      }
    });

    setSuggestedTags(matches.slice(0, 6));
    setShowSuggestions(matches.length > 0);
  };

  const addTag = (tag: QTag) => {
    haptic('light');
    if (!selectedTags.some(t => t.id === tag.id)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setTagInput('');
    setSuggestedTags([]);
    setShowSuggestions(false);
  };

  const removeTag = (tagId: string) => {
    haptic('light');
    setSelectedTags(selectedTags.filter(t => t.id !== tagId));
  };

  const handleCustomTagAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const cleanName = tagInput.replace('#', '').trim();
      if (cleanName) {
        addTag({ type: 'general', id: cleanName.toLowerCase(), name: cleanName });
      }
    }
  };

  // Format creation times elegantly into relative dates
  // Replicated navigation menu items and functions from Home.tsx
  const botsCategories = categories.filter(c => c.id !== 'apps' && c.id !== 'all');
  const appsCategories = appsSubCategories;

  const handleCategoryClick = (catId: string, mode: 'bots' | 'apps') => {
    haptic('light');
    navigate(`/search?mode=${mode}&category=${catId}`);
    setOpenMenu(null);
    setMobileModal(null);
    setNavState('main');
  };

  interface MenuItem {
    id: string;
    label: string;
    desc: string;
    icon: any;
    action?: () => void;
    path?: string;
  }

  const discoverItems: MenuItem[] = [
    { id: 'bots', label: 'Botlar', desc: 'Telegram Bot Marketi', icon: BotIcon, action: () => setNavState('bots') },
    { id: 'apps', label: 'Uygulamalar', desc: 'Web3 & TMA Uygulamaları', icon: LayoutGrid, action: () => setNavState('apps') },
    { id: 'channels', label: 'Kanallar', desc: 'Popüler Telegram Kanalları', icon: Megaphone, path: '/channels' },
    { id: 'ads', label: 'Reklam', desc: 'Projenizi Öne Çıkarın', icon: Share2, path: '/settings' },
  ];

  const investorItems: MenuItem[] = [
    { id: 'exchanges', label: 'Borsalar ve Takas', desc: 'CEX & DEX Platformları', icon: BarChart3 },
    { id: 'earn', label: 'Kazanç Uygulamaları', desc: 'Pasif Gelir Fırsatları', icon: Coins },
    { id: 'tools', label: 'Yatırım Araçları', desc: 'Analiz ve Takip Araçları', icon: Briefcase },
    { id: 'new', label: 'Yeni Keşifler', desc: 'Gelecek Vaadeden Projeler', icon: Compass },
  ];

  const simpleLinks = [
    { label: 'Hızlı Link 1', path: '#' },
    { label: 'Hızlı Link 2', path: '#' },
    { label: 'Hızlı Link 3', path: '#' },
  ];

  const renderMegaMenuContent = () => {
    if (openMenu === 'kesfet') {
      return (
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-12 gap-8">
          <div className="col-span-8">
            <AnimatePresence mode="wait">
              {navState === 'main' ? (
                <motion.div 
                  key="main"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-2 gap-4"
                >
                  {discoverItems.map(item => (
                    <button 
                      key={item.id}
                      onClick={() => {
                        if (item.action) item.action();
                        else if (item.path) { navigate(item.path); setOpenMenu(null); }
                      }}
                      className="flex items-center gap-4 p-4 hover:bg-black/[0.02] dark:hover:bg-white/5 rounded-2xl transition-all group border border-transparent hover:border-black/5 dark:hover:border-white/10 text-left w-full"
                    >
                      <div className="menu-icon-container shrink-0 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                        <item.icon size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-semibold menu-item-text">{item.label}</span>
                        <span className="text-[12px] text-slate-500 dark:text-slate-400 font-normal">{item.desc}</span>
                      </div>
                    </button>
                  ))}
                </motion.div>
              ) : navState === 'bots' ? (
                <motion.div 
                  key="bots"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <button 
                      onClick={() => setNavState('main')}
                      className="p-2 hover:bg-white/10 rounded-full text-slate-500 transition-colors"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">Bot Kategorileri</h3>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {botsCategories.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.id, 'bots')}
                        className="flex items-center gap-3 p-3 hover:bg-black/[0.02] dark:hover:bg-white/5 rounded-xl transition-all group text-left border border-transparent hover:border-black/5 dark:hover:border-white/10 w-full"
                      >
                        <div className="menu-icon-container !w-8 !h-8 px-0 shrink-0 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                          <cat.icon size={16} />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-tight menu-item-text">{t(cat.label)}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="apps"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <button 
                      onClick={() => setNavState('main')}
                      className="p-2 hover:bg-white/10 rounded-full text-slate-500 transition-colors"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">Uygulama Kategorileri</h3>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {appsCategories.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.id, 'apps')}
                        className="flex items-center gap-3 p-3 hover:bg-black/[0.02] dark:hover:bg-white/5 rounded-xl transition-all group text-left border border-transparent hover:border-black/5 dark:hover:border-white/10 w-full"
                      >
                        <div className="menu-icon-container !w-8 !h-8 px-0 shrink-0 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                          <cat.icon size={16} />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-tight menu-item-text">{t(cat.label)}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="col-span-4 border-l border-black/5 dark:border-white/5 pl-8 flex flex-col justify-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 mb-2">Hızlı Bağlantılar</span>
            {simpleLinks.map((link, i) => (
              <a 
                key={i}
                href={link.path}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-all font-bold text-xs uppercase group"
              >
                {link.label}
                <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
              </a>
            ))}
          </div>
        </div>
      );
    }

    if (openMenu === 'investors') {
      return (
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-12 gap-8">
          <div className="col-span-8">
            <div className="grid grid-cols-2 gap-4">
              {investorItems.map(item => (
                <button 
                  key={item.id}
                  onClick={() => {
                    if (item.path) { navigate(item.path); setOpenMenu(null); }
                  }}
                  className="flex items-center gap-4 p-4 hover:bg-black/[0.02] dark:hover:bg-white/5 rounded-2xl transition-all group border border-transparent hover:border-black/5 dark:hover:border-white/10 text-left w-full"
                >
                  <div className="menu-icon-container shrink-0 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                    <item.icon size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-semibold menu-item-text">{item.label}</span>
                    <span className="text-[12px] text-slate-500 dark:text-slate-400 font-normal">{item.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="col-span-4 border-l border-black/5 dark:border-white/5 pl-8 flex flex-col justify-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 mb-2">Yatırım Linkleri</span>
            {simpleLinks.map((link, i) => (
              <a 
                key={i}
                href={link.path}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-all font-bold text-xs uppercase group"
              >
                {link.label}
                <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
              </a>
            ))}
          </div>
        </div>
      );
    }
  };

  const formatTimeRelative = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 60) return `${Math.max(1, mins)} dk. önce`;
    if (hours < 24) return `${hours} saat önce`;
    return `${days} gün önce`;
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 pb-20">
      <style>{`
        @media (max-width: 767px) {
          .gap-8 {
            gap: 0.5rem !important;
          }
        }
      `}</style>
      <SEO 
        title="Soru Cevap & Tartışmalar | BotlyHub" 
        description="Kanalları ve botları etiketleyerek soru sorun, toplulukla fikir alışverişinde bulunun." 
      />

      {/* Header Sticky Navigation Panel */}
      <header ref={internalMenuRef} className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-[#f7f7f7] dark:border-white/5 w-full py-2.5 transition-colors">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
          
           {/* Section 1: Center Navigation links (Takes top row on mobile via flex/order, center on desktop) */}
           <div className="flex items-center justify-center gap-4 md:gap-14 order-1 md:order-2 w-full md:w-auto pb-1.5 md:pb-0 border-b md:border-b-0 border-slate-100 dark:border-white/5 md:border-transparent">
             {/* Discover / Keşfet */}
             <button 
                 onClick={() => { haptic('light'); navigate('/'); }}
                 className="nav-menu-item text-slate-600 dark:text-slate-400 hover:bg-blue-500/5 grow-0 whitespace-nowrap"
             >
                 {t('nav_explore')}
             </button>

             {/* Categories / Kategoriler */}
             <div 
               className="relative md:static"
               onMouseEnter={() => { if (window.innerWidth >= 768) setOpenMenu('kesfet'); }}
             >
               <button 
                 onClick={() => {
                   if (window.innerWidth < 768) {
                     haptic('light');
                     setMobileModal('kesfet');
                   } else {
                     setOpenMenu(openMenu === 'kesfet' ? null : 'kesfet');
                   }
                 }}
                 className={`nav-menu-item grow-0 ${openMenu === 'kesfet' ? 'text-slate-900 dark:text-white bg-blue-500/5' : 'text-slate-600 dark:text-slate-400 hover:bg-blue-500/5'}`}
               >
                 Kategoriler <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${openMenu === 'kesfet' ? 'rotate-180' : ''}`} />
               </button>
             </div>

             {/* My Bots / Botlarım */}
             <button 
               onClick={() => { haptic('light'); navigate('/my-bots'); }}
               className="nav-menu-item text-slate-600 dark:text-slate-400 hover:bg-blue-500/5"
             >
               {t('my_bots')}
             </button>
           </div>

          {/* Section 2 & 3 Mobile-Row Container */}
          <div className="flex md:contents items-center justify-between order-2 md:order-none w-full md:w-auto">
            {/* Section 2: Geri / return button (Takes bottom-left on mobile, left block on desktop) */}
            <div className="flex items-center justify-start md:order-1 md:w-48 shrink-0">
              <button 
                onClick={() => {
                  haptic('light');
                  if (isDetailView) {
                    setIsDetailView(false);
                    setActiveTopic(null);
                    fetchTopics(selectedFilter);
                  } else {
                    navigate(-1);
                  }
                }}
                className="group flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <span className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                  <ChevronLeft size={14} />
                </span>
                <span>{isDetailView ? 'Geri Dön' : 'Geri'}</span>
              </button>
            </div>

            {/* Section 3: Right Side: Theme toggle + Profile (Takes bottom-right on mobile, right block on desktop) */}
            <div className="flex items-center justify-end md:order-3 md:w-48 gap-3 shrink-0">
              <button 
                onClick={() => { haptic('light'); toggleTheme(); }} 
                className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-black/5 dark:border-white/5 rounded-xl text-slate-900 dark:text-white active:scale-95 transition-all outline-none shrink-0"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {!user || !user.id || user.id === 'guest_user' ? (
                <button 
                  onClick={() => { haptic('light'); setIsLoginModalOpen(true); }}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white border-none text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all whitespace-nowrap"
                >
                  {t('home_login')}
                </button>
              ) : (
                <div className="relative" ref={menuRef}>
                  <button 
                    onClick={() => { haptic('light'); setIsMenuOpen(!isMenuOpen); }}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/20 rounded-xl transition-all active:scale-95 duration-150 shadow-xs"
                  >
                    <img 
                      src={currentUser.avatar} 
                      className="w-5 h-5 rounded-full object-cover"
                      alt=""
                      referrerPolicy="no-referrer"
                    />
                    <span className="max-w-[70px] sm:max-w-[100px] truncate">{currentUser.name}</span>
                    <ChevronDown size={12} className={`text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-2xl p-2 z-[100] animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-4 border-b border-slate-100 dark:border-white/5 mb-2">
                        <div className="flex items-center gap-3">
                          <img 
                            src={currentUser.avatar} 
                            alt={currentUser.name}
                            className="w-10 h-10 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[13px] font-bold text-slate-900 dark:text-white truncate">
                              {currentUser.name}
                            </span>
                            <span className="text-[10px] text-slate-500 truncate">@{user?.username || currentUser.id}</span>
                          </div>
                        </div>
                      </div>

                      <button onClick={() => { haptic('light'); navigate('/'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left">
                        <Store size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                        <span className="text-xs font-bold uppercase tracking-tight">{t('market')}</span>
                      </button>

                      <button onClick={() => { haptic('light'); navigate('/profile'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left">
                        <User size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                        <span className="text-xs font-bold uppercase tracking-tight">{t('profile')}</span>
                      </button>

                      <button onClick={() => { haptic('light'); navigate('/my-bots'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left">
                        <BotIcon size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                        <span className="text-xs font-bold uppercase tracking-tight">{t('my_bots')}</span>
                      </button>

                      <button onClick={() => { haptic('light'); navigate('/channels'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left">
                        <Megaphone size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                        <span className="text-xs font-bold uppercase tracking-tight">{t('my_channels')}</span>
                      </button>

                      <button onClick={() => { haptic('light'); navigate('/notifications'); setIsMenuOpen(false); }} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left">
                        <div className="flex items-center gap-3">
                          <Bell size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                          <span className="text-xs font-bold uppercase tracking-tight">{t('notifications')}</span>
                        </div>
                        {unreadCount > 0 && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                      </button>

                      <button onClick={() => { haptic('light'); navigate('/qa'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left">
                        <MessageSquare size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                        <span className="text-xs font-bold uppercase tracking-tight">{t('qa_forum') || 'Soru Cevap Forumu'}</span>
                      </button>

                      <div className="h-px bg-slate-100 dark:border-white/5 my-2" />
                      
                      <button 
                        onClick={() => { 
                          const confirmed = window.confirm("Çıkış yapmak istediğinize emin misiniz?");
                          if (confirmed) {
                            haptic('medium'); 
                            setWebAuthUser(null);
                            setIsMenuOpen(false); 
                            navigate('/');
                          }
                        }} 
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-all font-bold text-xs uppercase text-left"
                      >
                        <LogOut size={18} /> 
                        <span className="text-xs font-bold uppercase tracking-tight">{t('home_logout')}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
          </div>
          </div>
        </div>

        {/* Desktop Mega Menu Dropdown */}
        <AnimatePresence>
          {openMenu && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="hidden md:block absolute left-0 right-0 top-full bg-white dark:bg-slate-900/95 backdrop-blur-xl border-b border-black/5 dark:border-white/10 shadow-2xl z-[100] mega-menu-container"
              onMouseLeave={() => { setOpenMenu(null); setNavState('main'); }}
            >
              {renderMegaMenuContent()}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Layout Container */}
      <main className="max-w-3xl lg:max-w-[1100px] mx-auto px-4 sm:px-6 py-6 transition-all">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Topics List or Topic Detail */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {!isDetailView ? (
                <motion.div
                  key="list-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Image 1 Pattern: "K Tartışma Başlat..." Input Box */}
                  <div 
                    onClick={() => { haptic('medium'); setShowCreateModal(true); }}
                    className="cursor-pointer fancy-glass-card flex items-center justify-between transition-all duration-300 group hover:border-indigo-500/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-550/10 dark:bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-650 dark:text-indigo-400">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-slate-500 dark:text-slate-400 font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        Tartışma başlat...
                      </span>
                    </div>
                    <div className="text-slate-450 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      <MessageSquare size={18} strokeWidth={2} />
                    </div>
                  </div>

                  {/* Sorting Filter Sorters - Matches exact aesthetics from image 1 */}
                  <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200/20 dark:border-slate-800/20 overflow-x-auto select-none no-scrollbar">
                    <button
                      onClick={() => handleFilterChange('all')}
                      className={`flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold tracking-tight transition-all shrink-0 ${
                        selectedFilter === 'all'
                          ? 'bg-indigo-600/10 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-xs'
                          : 'text-slate-500 dark:text-slate-400 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-900/60 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <Trophy size={13} className="text-amber-500" />
                      <span>En İyiler</span>
                    </button>
                    <button
                      onClick={() => handleFilterChange('son')}
                      className={`flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold tracking-tight transition-all shrink-0 ${
                        selectedFilter === 'son'
                          ? 'bg-indigo-600/10 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-xs'
                          : 'text-slate-500 dark:text-slate-400 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-900/60 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <Clock size={13} />
                      <span>Son</span>
                    </button>
                    <button
                      onClick={() => handleFilterChange('week')}
                      className={`flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold tracking-tight transition-all shrink-0 ${
                        selectedFilter === 'week'
                          ? 'bg-indigo-600/10 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-xs'
                          : 'text-slate-500 dark:text-slate-400 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-900/60 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <Calendar size={13} />
                      <span>Bu hafta</span>
                    </button>
                    <button
                      onClick={() => handleFilterChange('month')}
                      className={`flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold tracking-tight transition-all shrink-0 ${
                        selectedFilter === 'month'
                          ? 'bg-indigo-600/10 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-xs'
                          : 'text-slate-500 dark:text-slate-400 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-900/60 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <Calendar size={13} />
                      <span>Bu Ay</span>
                    </button>
                  </div>

                  {/* Discussions List Loading State */}
                  {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
                      <p className="text-xs text-slate-400 italic">Yükleniyor...</p>
                    </div>
                  ) : topics.length > 0 ? (
                    <div className="space-y-4">
                      {topics.map(topic => {
                        const hasUpvoted = topic.upvoted_users?.includes(currentUser.id);
                        return (
                          <article 
                            key={topic.id}
                            onClick={() => handleViewDetails(topic)}
                            className="cursor-pointer group fancy-glass-card transition-all relative flex items-start gap-4"
                          >
                            {/* Upvote Pill Indicator on Left Side */}
                            <div 
                              onClick={(e) => handleUpvote(topic.id, e)}
                              className={`hidden sm:flex flex-col items-center p-2 rounded-xl border transition-all shrink-0 w-11 h-14 justify-center ${
                                hasUpvoted 
                                  ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/80 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400' 
                                  : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 border-slate-200/60 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 text-slate-400 hover:text-slate-600'
                              }`}
                            >
                              <Triangle size={12} className={`mb-1 fill-current stroke-current transition-transform duration-300 ${hasUpvoted ? 'scale-110' : ''}`} />
                              <span className="text-[11px] font-bold mt-0.5">{topic.upvotes_count || 0}</span>
                            </div>

                            {/* Middle Text Area fields */}
                            <div className="flex-1 min-w-0">
                              {/* Card Top Information */}
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  {/* Small simple avatar with link */}
                                  <div 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      haptic('light');
                                      navigate(`/user/${topic.author_id}`);
                                    }}
                                    className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer group/author"
                                  >
                                    <img 
                                      src={topic.author_avatar} 
                                      className="w-5 h-5 rounded-full object-cover bg-slate-100 border border-slate-200/45 dark:border-slate-800"
                                      alt=""
                                      referrerPolicy="no-referrer"
                                    />
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 group-hover/author:text-indigo-500 transition-colors">
                                      {formatDisplayAuthor(topic.author_name)}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-300 dark:text-slate-600">•</span>
                                  <span className="text-xs text-slate-400">
                                    {formatTimeRelative(topic.created_at)}
                                  </span>
                                </div>

                                {/* Section soft badge tags on right corner matching Image 1 */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {topic.tags && topic.tags.length > 0 && (
                                    <span className="bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-300 font-extrabold px-2.5 py-0.5 rounded-lg text-[10px] uppercase tracking-wide">
                                      #{topic.tags[0].name}
                                    </span>
                                  )}
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); haptic('light'); }}
                                    className="text-slate-300 hover:text-indigo-500 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900"
                                  >
                                    <Bookmark size={14} />
                                  </button>
                                </div>
                              </div>

                              {/* Post Title */}
                              <h2 className="text-base font-semibold text-slate-950 dark:text-white leading-snug tracking-tight mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors card-title">
                                {topic.title}
                              </h2>

                              {/* Text Excerpt Body */}
                              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal card-desc">
                                {topic.content}
                              </p>

                              {/* Footer engagement tags row */}
                              <div className="flex items-center justify-between flex-wrap gap-2 text-xs mt-3 pt-3 border-t border-slate-100/50 dark:border-slate-800/10">
                                {/* Comments/Engagement Avatar overlapping list */}
                                <div className="flex items-center gap-2">
                                  <div className="flex -space-x-1.5 overflow-hidden">
                                    {topic.comments && topic.comments.slice(0, 3).map((c, i) => (
                                      <img 
                                        key={i}
                                        src={c.author_avatar} 
                                        className="inline-block h-4 w-4 rounded-full ring-2 ring-white dark:ring-slate-950 object-cover bg-slate-50"
                                        alt=""
                                      />
                                    ))}
                                    {topic.comments_count > 3 && (
                                      <div className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 ring-2 ring-white dark:ring-slate-950 text-[7px] font-bold text-slate-500">
                                        +{topic.comments_count - 3}
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-xs text-slate-400 font-medium opacity-75">
                                    {topic.comments_count > 0 
                                      ? `${formatDisplayAuthor(topic.comments?.[0]?.author_name || 'Birisi')} ve ${topic.comments_count} kişi daha yorum yaptı.`
                                      : 'Henüz cevap yazılmamış.'
                                    }
                                  </span>
                                </div>

                                {/* Mobile only vote button indicator */}
                                <div className="flex sm:hidden items-center gap-3 text-slate-400 font-bold">
                                  <span className="flex items-center gap-1">
                                    <Triangle size={11} className="fill-current" /> {topic.upvotes_count || 0}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MessageSquare size={11} /> {topic.comments_count || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 p-12 rounded-3xl text-center">
                      <AlertCircle size={36} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white tracking-tight mb-2">
                        TARTIŞMA BULUNAMADI
                      </h4>
                      <p className="text-xs text-slate-400 italic max-w-sm mx-auto mb-6">
                        Bu filtrelere uygun aktif bir soru veya konu bulunamadı. İlk tartışmayı siz başlatın!
                      </p>
                      <button 
                        onClick={() => { haptic('medium'); setShowCreateModal(true); }}
                        className="inline-flex items-center gap-1.5 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all"
                      >
                        <Plus size={14} />
                        Soru Sor
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                /* 💬 DISCUSSION DETAIL PAGE VIEW - Image 3 Layout Pattern */
                <motion.div
                  key="detail-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Main discussion card detailed */}
                  {activeTopic && (
                    <div className="fancy-glass-card mb-6">
                      {/* Detailed Card Top author information matching top part of Image 3 */}
                      <div className="flex items-start justify-between gap-4 border-b border-slate-200/40 dark:border-slate-800/20 pb-4.5 mb-5 select-none">
                        <div 
                          onClick={() => {
                            haptic('light');
                            navigate(`/user/${activeTopic.author_id}`);
                          }}
                          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity group/author-detail"
                        >
                          <img 
                            src={activeTopic.author_avatar} 
                            className="w-10 h-10 rounded-full object-cover bg-slate-50 border border-slate-200/60 dark:border-slate-800"
                            alt=""
                          />
                          <div>
                            <h3 className="text-sm font-black text-slate-800 dark:text-white leading-tight group-hover/author-detail:text-indigo-500 transition-colors">
                              {formatDisplayAuthor(activeTopic.author_name)}
                            </h3>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400 font-medium shrink-0">
                          {formatTimeRelative(activeTopic.created_at)}
                        </span>
                      </div>

                      {/* Question Title */}
                      <h1 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight mb-4 leading-tight">
                        {activeTopic.title}
                      </h1>

                      {/* Centered Interaction metrics row matched to image 3 layout */}
                      <div className="flex items-center gap-3 mb-6">
                        <button 
                           onClick={() => handleUpvote(activeTopic.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            activeTopic.upvoted_users?.includes(currentUser.id)
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/80 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 shadow-inner'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200/50 dark:border-slate-800 text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <Triangle size={11} className="fill-current" />
                          <span>{activeTopic.upvotes_count || 0}</span>
                        </button>
                        
                        <span className="text-slate-300 dark:text-slate-700 font-mono">/</span>

                        <span className="text-slate-400 text-xs font-semibold flex items-center gap-1">
                          <MessageSquare size={13} /> {activeTopic.comments_count || 0} Cevap yazıldı
                        </span>
                      </div>

                      {/* Discussion Body Content Markdown support */}
                      <div className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-wrap mb-6 px-1">
                        {activeTopic.content}
                      </div>

                      {/* Tag badging group */}
                      {activeTopic.tags && activeTopic.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                          {activeTopic.tags.map(tag => (
                            <span 
                              key={tag.id}
                              className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold px-3 py-1 rounded-lg text-xs hover:text-indigo-500 transition-colors"
                            >
                              # {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 💬 Reply Comments container box */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200/30 dark:border-slate-800/30 pb-3">
                      <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1 font-mono">
                        <MessageSquare size={14} className="text-indigo-500" />
                        Yanıtlar <span className="text-slate-400">({activeTopic?.comments_count || 0})</span>
                      </h3>

                      {/* Comments sorting control matched image 3 */}
                      <div className="flex bg-slate-100 dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-800/20 p-0.5 rounded-lg select-none">
                        <button 
                          onClick={() => { haptic('light'); setCommentSort('son'); }}
                          className={`text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded transition-all ${
                            commentSort === 'son' 
                              ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm' 
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          Son
                        </button>
                        <button 
                          onClick={() => { haptic('light'); setCommentSort('populer'); }}
                          className={`text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded transition-all ${
                            commentSort === 'populer' 
                              ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm' 
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          Popüler
                        </button>
                      </div>
                    </div>

                    {/* Submit Comment Field Matched exactly to Image 3 */}
                    <div 
                      className="bg-white/5 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/60 rounded-2xl p-4 flex flex-col gap-3"
                    >
                      <div className="relative">
                        <textarea 
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Düşüncelerinizi paylaşın..." 
                          className="w-full text-sm text-slate-800 dark:text-slate-200 bg-transparent py-2 resize-none outline-none min-h-[90px] placeholder:italic placeholder:text-slate-400"
                        />
                        <span className="absolute bottom-2 right-2 text-[10px] text-slate-300 dark:text-slate-600 font-bold font-mono">
                          M↓
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
                        <span className="text-[10px] text-slate-400 italic">Desteklenen format: Markdown</span>
                        <button 
                          onClick={() => handleAddComment()}
                          disabled={!commentText.trim()}
                          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-[11px] uppercase tracking-widest transition-all shadow-md shadow-indigo-500/10"
                        >
                          Yorum Gönder
                        </button>
                      </div>
                    </div>

                    {/* Comments List rendering */}
                    {activeTopic && activeTopic.comments && activeTopic.comments.length > 0 ? (
                      <div className="space-y-4 pt-2">
                        {(() => {
                          const rootComments = activeTopic.comments.filter(c => !c.parent_id);
                          const allReplies = activeTopic.comments.filter(c => c.parent_id);
                          
                          return [...rootComments]
                            .sort((a, b) => commentSort === 'populer' ? b.likes_count - a.likes_count : new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                            .map(comment => {
                              const replies = allReplies.filter(r => r.parent_id === comment.id)
                                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                              
                              return (
                                <div key={comment.id} className="p-4 mb-4 rounded-2xl bg-white/5 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700/60 transition-all">
                                  {/* Main Root Comment */}
                                  <div className="flex items-start gap-3">
                                    <img 
                                      onClick={() => {
                                        haptic('light');
                                        navigate(`/user/${comment.author_id}`);
                                      }}
                                      src={comment.author_avatar} 
                                      className="w-8 h-8 rounded-full object-cover bg-slate-50 border border-slate-200/50 dark:border-slate-800 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                      alt=""
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1 justify-between sm:justify-start">
                                        <span 
                                          onClick={() => {
                                            haptic('light');
                                            navigate(`/user/${comment.author_id}`);
                                          }}
                                          className="text-xs font-black text-slate-800 dark:text-white cursor-pointer hover:text-indigo-500 transition-colors"
                                        >
                                          {formatDisplayAuthor(comment.author_name)}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-medium font-mono">
                                          {formatTimeRelative(comment.created_at)}
                                        </span>
                                      </div>
                                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-full overflow-hidden whitespace-pre-wrap">
                                        {comment.content}
                                      </p>
                                      
                                      {/* Action buttons: Reply */}
                                      <div className="flex items-center gap-4 mt-2">
                                        <button 
                                          onClick={() => {
                                            haptic('light');
                                            setActiveReplyCommentId(activeReplyCommentId === comment.id ? null : comment.id);
                                            setReplyText('');
                                          }}
                                          className="text-[10px] font-black uppercase tracking-wider text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors flex items-center gap-1.5"
                                        >
                                          <MessageSquare size={11} />
                                          Yanıtla
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Inline Reply Form under root comment */}
                                  {activeReplyCommentId === comment.id && (
                                    <div className="mt-3 ml-11 bg-slate-50/60 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200/20 dark:border-slate-800/30 flex flex-col gap-2 shadow-xs">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-450 uppercase tracking-widest font-mono">
                                          {formatDisplayAuthor(comment.author_name)} kullanıcısına yanıt veriyorsunuz
                                        </span>
                                      </div>
                                      <textarea 
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Yanıtınızı yazın..." 
                                        className="w-full text-xs text-slate-800 dark:text-slate-200 bg-transparent py-2 resize-none outline-none min-h-[70px] placeholder:italic placeholder:text-slate-400"
                                      />
                                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/40">
                                        <span className="text-[9px] text-slate-400 italic">Desteklenen: Markdown</span>
                                        <div className="flex gap-2">
                                          <button 
                                            onClick={() => {
                                              haptic('light');
                                              setActiveReplyCommentId(null);
                                              setReplyText('');
                                            }}
                                            className="px-3 py-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] uppercase font-black tracking-widest transition-all"
                                          >
                                            İptal
                                          </button>
                                          <button 
                                            onClick={() => handleAddComment(comment.id, replyText)}
                                            disabled={!replyText.trim()}
                                            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[10px] uppercase font-black tracking-widest transition-all shadow-md shadow-indigo-500/10"
                                          >
                                            Yanıtla
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Rendered replies container */}
                                  {replies.length > 0 && (
                                    <div className="mt-3 ml-8 sm:ml-11 pl-4 border-l-2 border-slate-100 dark:border-slate-800/40 space-y-3 pt-1">
                                      {replies.map(reply => (
                                        <div key={reply.id} className="flex items-start gap-2.5 py-1.5">
                                          <img 
                                            onClick={() => {
                                              haptic('light');
                                              navigate(`/user/${reply.author_id}`);
                                            }}
                                            src={reply.author_avatar} 
                                            className="w-6 h-6 rounded-full object-cover bg-slate-50 border border-slate-200/50 dark:border-slate-800 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                            alt=""
                                          />
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5 justify-between sm:justify-start">
                                              <span 
                                                onClick={() => {
                                                  haptic('light');
                                                  navigate(`/user/${reply.author_id}`);
                                                }}
                                                className="text-[11px] font-black text-slate-800 dark:text-slate-200 cursor-pointer hover:text-indigo-500 transition-colors"
                                              >
                                                {formatDisplayAuthor(reply.author_name)}
                                              </span>
                                              <span className="text-[9px] text-slate-400 font-medium font-mono">
                                                {formatTimeRelative(reply.created_at)}
                                              </span>
                                            </div>
                                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-full overflow-hidden whitespace-pre-wrap">
                                              {reply.content}
                                            </p>
                                            
                                            {/* Let them reply inside the sub-thread easily too */}
                                            <div className="flex items-center gap-3 mt-1.5">
                                              <button 
                                                onClick={() => {
                                                  haptic('light');
                                                  setActiveReplyCommentId(comment.id);
                                                  setReplyText(`${formatDisplayAuthor(reply.author_name)} `);
                                                }}
                                                className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors flex items-center gap-1"
                                              >
                                                <MessageSquare size={10} />
                                                Yanıtla
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            });
                        })()}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-slate-400 italic text-xs">
                        İlk yorumu yazarak tartışmaya can katın!
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Sidebar featuring Popüler Etiketler & En Çok Tartışılanlar */}
          <div className="lg:col-span-4 space-y-6 hidden lg:block select-none sticky top-24 h-fit">
            {/* 🏷️ Popüler Etiketler Widget */}
            <div className="fancy-glass-card">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/30">
                <Sparkles size={16} className="text-indigo-500 fill-indigo-500/10" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">
                  Popüler Etiketler
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {popularTags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => {
                      haptic('light');
                      if (isDetailView) {
                        setIsDetailView(false);
                        setActiveTopic(null);
                      }
                      fetchTopics(selectedFilter, tag.name);
                    }}
                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/30 dark:border-slate-800 rounded-xl text-xs font-bold transition-all"
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 💬 En Çok Tartışılanlar (Most Discussed) Widget */}
            <div className="fancy-glass-card">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/30">
                <MessageSquare size={16} className="text-indigo-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">
                  En Çok Tartışılanlar
                </h3>
              </div>

              {mostDiscussedTopics.length > 0 ? (
                <div className="space-y-3.5">
                  {mostDiscussedTopics.map(topic => (
                    <div 
                      key={topic.id}
                      onClick={() => handleViewDetails(topic)}
                      className="cursor-pointer group flex flex-col gap-1 pb-3 last:pb-0 last:border-none border-b border-slate-100/60 dark:border-slate-800/20"
                    >
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                        {topic.title}
                      </h4>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mt-0.5">
                        <span className="flex items-center gap-1">
                          <MessageSquare size={11} className="text-indigo-505 shrink-0" />
                          {topic.comments_count} Cevap
                        </span>
                        <span>{formatTimeRelative(topic.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                  Henüz tartışılan konu bulunmuyor.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 🚀 FORM FOR ASKING A NEW QUESTION MODAL - Image 2 Layout Design */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-[28px] max-w-lg w-full p-6 sm:p-8 relative shadow-2xl overflow-hidden"
            >
              {/* Cover Gradient details */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-2xl -mr-8 -mt-8 rounded-full pointer-events-none" />
              
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800/60 pb-3">
                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                  Yeni Konu
                </h3>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-bold font-mono">
                  Markdown <kbd className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">M↓</kbd>
                </span>
              </div>

              {/* Title Section aligned to Image 2 */}
              <div className="mb-4">
                <input 
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Başlık: Aklınızdan ne geçiyor?" 
                  className="w-full text-lg sm:text-xl font-bold bg-transparent text-slate-900 dark:text-white outline-none placeholder:text-slate-400 border-none px-0"
                />
              </div>

              {/* Content text area aligned to Image 2 */}
              <div className="relative mb-5">
                <textarea 
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Açıklama: Type '/' for commands..." 
                  className="w-full text-sm bg-transparent text-slate-600 dark:text-slate-300 outline-none border-none py-2 px-0 resize-none min-h-[140px] placeholder:text-slate-400/80"
                />
              </div>

              {/* Tags badging input exactly mirroring bottom segment of Image 2 */}
              <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 mb-6">
                <div className="flex flex-wrap items-center gap-2 mb-2 min-h-[36px]">
                  {/* Selected badges */}
                  {selectedTags.map(tag => (
                    <span 
                      key={tag.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold ring-1 ring-slate-200/50 dark:ring-slate-800"
                    >
                      <span>#{tag.name}</span>
                      <button 
                        onClick={() => removeTag(tag.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}

                  {/* Dynamic Add Tags field */}
                  <div className="relative flex-1 min-w-[120px]">
                    <input 
                      type="text"
                      value={tagInput}
                      onChange={(e) => handleTagInputChange(e.target.value)}
                      onKeyDown={handleCustomTagAdd}
                      placeholder={selectedTags.length > 0 || tagInput.length > 0 ? "Add more..." : "Etiketle..."} 
                      className="w-full bg-transparent text-xs font-bold text-slate-500 dark:text-slate-400 outline-none border-none py-1.5"
                    />

                    {/* Auto-suggest tags dropdown matching live bots/general keywords */}
                    {showSuggestions && (
                      <div className="absolute top-full left-0 mt-1.5 max-h-[150px] w-52 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-lg overflow-y-auto z-50 p-1 no-scrollbar animate-in fade-in slide-in-from-top-1.5 duration-100">
                        {suggestedTags.map(tag => (
                          <button
                            type="button"
                            key={tag.id}
                            onClick={() => addTag(tag)}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors flex items-center justify-between gap-2"
                          >
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                              #{tag.name}
                            </span>
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 shrink-0">
                              {tag.type === 'bot' ? 'BOT' : 'GENEL'}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Soru ile ilgili botun adını veya `giriş`, `yardım` gibi etiketleri yazıp tıklayarak ekleyebilirsiniz.
                </p>
              </div>

              {/* Bottom footer button bar - mirror cancelling vs creating of Image 2 */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                <button 
                  onClick={() => { haptic('light'); setShowCreateModal(false); }}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:text-slate-500 transition-colors shrink-0 px-3 py-2"
                >
                  İptal etmek
                </button>
                <button 
                  onClick={handleCreateTopic}
                  disabled={!newTitle.trim() || !newContent.trim()}
                  className="px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-500/15"
                >
                  Soru Başlat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Mobile Modal for Categories */}
      <AnimatePresence>
        {mobileModal && (
          <div className="fixed inset-0 z-[200] flex items-end justify-center p-0 md:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setMobileModal(null); setNavState('main'); }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full bg-white dark:bg-slate-900 rounded-t-[32px] overflow-hidden pt-4 pb-12 border-t border-black/10 dark:border-white/10"
            >
              {/* Drag Handle */}
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-8" />
              
              <div className="flex justify-between items-center mb-6 px-8">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-widest uppercase italic font-sans">
                  {mobileModal === 'kesfet' ? 'KEŞFET' : 'YATIRIMCILAR'}
                </h3>
                <button onClick={() => { setMobileModal(null); setNavState('main'); }} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 active:scale-90 transition-all">
                  <X size={20} />
                </button>
              </div>
              
              <div className="max-h-[70vh] overflow-y-auto px-6 pb-4">
                <AnimatePresence mode="wait">
                  {navState === 'main' ? (
                    <motion.div 
                      key="mobile-main"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="grid grid-cols-1 gap-3"
                    >
                      {(mobileModal === 'kesfet' ? discoverItems : investorItems).map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (item.action) item.action();
                            else if (item.path) { navigate(item.path); setMobileModal(null); }
                          }}
                          className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/5 active:bg-slate-100 dark:active:bg-white/10 transition-all rounded-2xl border border-black/5 dark:border-white/5 group mobile-menu-item"
                        >
                          <div className={`mobile-menu-icon-container flex items-center justify-center rounded-xl shrink-0 ${mobileModal === 'kesfet' ? 'text-blue-500' : 'text-emerald-500'}`}>
                            <item.icon size={22} className="menu-item-icon" />
                          </div>
                          <div className="flex flex-col items-start min-w-0">
                            <span className="text-[13px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider truncate w-full text-left">
                              {item.label}
                            </span>
                          </div>
                          {item.action && <ChevronRight size={16} className="ml-auto text-slate-300 dark:text-slate-700" />}
                        </button>
                      ))}
                    </motion.div>
                  ) : navState === 'bots' ? (
                    <motion.div 
                      key="mobile-bots"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex flex-col gap-4"
                    >
                      <button 
                        onClick={() => setNavState('main')}
                        className="flex items-center gap-2 text-blue-500 font-black uppercase tracking-widest text-[11px] mb-2"
                      >
                        <ArrowLeft size={16} /> Geri
                      </button>
                      <div className="grid grid-cols-2 gap-3">
                        {botsCategories.map(cat => (
                          <button 
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat.id, 'bots')}
                            className="flex flex-col items-start gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 mobile-menu-item text-left w-full"
                          >
                            <div className="mobile-menu-icon-container flex items-center justify-center text-blue-500">
                              <cat.icon size={20} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-300">{t(cat.label)}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="mobile-apps"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex flex-col gap-4"
                    >
                      <button 
                        onClick={() => setNavState('main')}
                        className="flex items-center gap-2 text-blue-500 font-black uppercase tracking-widest text-[11px] mb-2"
                      >
                        <ArrowLeft size={16} /> Geri
                      </button>
                      <div className="grid grid-cols-2 gap-3">
                        {appsCategories.map(cat => (
                          <button 
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat.id, 'apps')}
                            className="flex flex-col items-start gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 mobile-menu-item text-left w-full"
                          >
                            <div className="mobile-menu-icon-container flex items-center justify-center text-emerald-500">
                              <cat.icon size={20} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-300">{t(cat.label)}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {navState === 'main' && (
                  <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 block mb-4">Hızlı Bağlantılar</span>
                    <div className="grid grid-cols-1 gap-2">
                      {simpleLinks.map((link, i) => (
                        <a 
                          key={i}
                          href={link.path}
                          className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase"
                        >
                          {link.label}
                          <ExternalLink size={14} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onAuth={(webUser) => setWebAuthUser(webUser)}
      />
    </div>
  );
}
