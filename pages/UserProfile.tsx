import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
    User, 
    Bot as BotIcon, 
    MessageSquare, 
    Calendar, 
    ChevronLeft, 
    Edit3, 
    Check, 
    Plus, 
    Globe, 
    Send, 
    Mail, 
    Sparkles, 
    ExternalLink, 
    Heart, 
    Activity, 
    ShieldCheck, 
    Bookmark,
    Trash2,
    Settings,
    Triangle
} from 'lucide-react';
import { useTranslation } from '../TranslationContext';
import { useTelegram } from '../hooks/useTelegram';
import { useTheme } from '../ThemeContext';
import { DatabaseService } from '../services/DatabaseService';
import { SEO } from '../components/SEO';
import { Bot, BlogComment, BlogPost } from '../types';
import { API_BASE_URL } from '../constants';

function formatRelativeTime(dateString: string): string {
    try {
        const now = new Date();
        const past = new Date(dateString);
        const diffMs = now.getTime() - past.getTime();
        
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'şimdi';
        if (diffMins < 60) return `${diffMins} dakika önce`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} saat önce`;
        
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) return '1 gün önce';
        if (diffDays < 30) return `${diffDays} gün önce`;
        
        const diffMonths = Math.floor(diffDays / 30);
        if (diffMonths < 12) return `${diffMonths} ay önce`;
        
        return past.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
        return 'yakın zamanda';
    }
}

interface ExtendedUserProfile {
    id: string;
    name: string;
    username: string;
    avatar: string;
    bio?: string;
    telegram_handle?: string;
    twitter_handle?: string;
    role: string;
    joinDate: string;
    is_premium: boolean;
}

export default function UserProfile() {
    const { id: paramUserId } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user: currentUser, haptic, notification } = useTelegram();
    const { theme } = useTheme();

    const [activeTab, setActiveTab] = useState<'library' | 'channels' | 'qa' | 'comments' | 'about'>('library');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // User profile state
    const [profile, setProfile] = useState<ExtendedUserProfile | null>(null);
    const [libraryBots, setLibraryBots] = useState<any[]>([]);
    const [userChannels, setUserChannels] = useState<any[]>([]);
    const [userComments, setUserComments] = useState<BlogComment[]>([]);
    const [userQaTopics, setUserQaTopics] = useState<any[]>([]);
    const [userQaComments, setUserQaComments] = useState<any[]>([]);
    const [commentsSubTab, setCommentsSubTab] = useState<'blog' | 'qa'>('blog');
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);

    // Form states for editing
    const [editName, setEditName] = useState('');
    const [editBio, setEditBio] = useState('');
    const [editTelegram, setEditTelegram] = useState('');
    const [editTwitter, setEditTwitter] = useState('');
    const [editAvatar, setEditAvatar] = useState('');

    // Determine if viewing own profile
    const isOwnProfile = useMemo(() => {
        if (!currentUser) return false;
        if (!paramUserId) return true; // Default /profile route
        return paramUserId.toString() === currentUser.id.toString() || paramUserId === currentUser.username;
    }, [currentUser, paramUserId]);

    // Target user ID for fetching
    const targetUserIdOrUsername = useMemo(() => {
        if (paramUserId) return paramUserId;
        if (currentUser) return currentUser.id.toString();
        return 'guest';
    }, [paramUserId, currentUser]);

    // Fetch profile data
    useEffect(() => {
        async function loadProfile() {
            try {
                setIsLoading(true);
                
                // 1. Get User details
                let uData: any = null;
                
                if (isOwnProfile && currentUser) {
                    uData = currentUser;
                } else if (targetUserIdOrUsername !== 'guest') {
                    // Try fetching by ID or Username
                    const fetchedUser = await DatabaseService.getUser(targetUserIdOrUsername).catch(() => null);
                    if (fetchedUser) {
                        uData = fetchedUser;
                    } else {
                        // Let's mock a beautiful user if none found in Supabase
                        uData = {
                            id: targetUserIdOrUsername,
                            name: targetUserIdOrUsername.charAt(0).toUpperCase() + targetUserIdOrUsername.slice(1),
                            username: targetUserIdOrUsername,
                            avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${targetUserIdOrUsername}`,
                            role: 'User',
                            joinDate: new Date('2024-02-15').toISOString(),
                            is_premium: false
                        };
                    }
                }

                if (!uData) {
                    // Final fallback guest
                    uData = {
                        id: 'guest',
                        name: 'Misafir Kullanıcı',
                        username: 'guest',
                        avatar: 'https://ui-avatars.com/api/?name=Guest+User&background=64748b&color=fff',
                        role: 'User',
                        joinDate: new Date().toISOString(),
                        is_premium: false
                    };
                }

                // Load custom profile metadata stored in localStorage
                const localProfileData = localStorage.getItem(`profile_meta_${uData.id}`);
                let parsedMeta = localProfileData ? JSON.parse(localProfileData) : {};

                const finalProfile: ExtendedUserProfile = {
                    id: uData.id.toString(),
                    name: parsedMeta.name || uData.name || uData.first_name || 'Kullanıcı Seyircisi',
                    username: uData.username || 'user',
                    avatar: parsedMeta.avatar || uData.avatar || uData.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(uData.name || 'User')}&background=4f46e5&color=fff`,
                    bio: parsedMeta.bio || 'BotlyHub ekosisteminde yeni bir kaşif. Henüz biyografi eklenmemiş.',
                    telegram_handle: parsedMeta.telegram_handle || uData.username || '',
                    twitter_handle: parsedMeta.twitter_handle || '',
                    role: uData.role || 'User',
                    joinDate: uData.joinDate || uData.joindate || new Date().toISOString(),
                    is_premium: uData.is_premium || false
                };

                setProfile(finalProfile);
                
                // Seed edit form values
                setEditName(finalProfile.name);
                setEditBio(finalProfile.bio || '');
                setEditTelegram(finalProfile.telegram_handle || '');
                setEditTwitter(finalProfile.twitter_handle || '');
                setEditAvatar(finalProfile.avatar);

                // 2. Load bots listed in user configuration/library
                const [botsInLib, channelsList, commentsList, blogsList] = await Promise.all([
                    DatabaseService.getUserBots(uData.id.toString()).catch(() => []),
                    DatabaseService.getChannels(uData.id.toString()).catch(() => []),
                    DatabaseService.getUserBlogComments(uData.id.toString()).catch(() => []),
                    DatabaseService.getBlogs().catch(() => [])
                ]);

                setLibraryBots(botsInLib);
                setUserChannels(channelsList || []);
                setUserComments(commentsList || []);
                setBlogPosts(blogsList || []);

                // Fetch Q&A Discussions to extract user's created topics or comments
                try {
                    const qaRes = await fetch(`${API_BASE_URL}/api/qa/discussions`);
                    if (qaRes && qaRes.ok) {
                        const qaTopicsList = await qaRes.json();
                        
                        // User's own Q&A questions (topics)
                        const ownTopics = qaTopicsList.filter((t: any) => t.author_id === uData.id.toString());
                        setUserQaTopics(ownTopics);
                        
                        // Extract comments made by this user in any discussion
                        const ownComments: any[] = [];
                        qaTopicsList.forEach((topic: any) => {
                            if (topic.comments && Array.isArray(topic.comments)) {
                                topic.comments.forEach((c: any) => {
                                    if (c.author_id === uData.id.toString()) {
                                        ownComments.push({
                                            ...c,
                                            topic_title: topic.title,
                                            topic_id: topic.id
                                        });
                                    }
                                });
                            }
                        });
                        setUserQaComments(ownComments);
                    }
                } catch (qaErr) {
                    console.error("Failed to load user Q&A contributions:", qaErr);
                }

            } catch (err) {
                console.error("Failed to load user profile:", err);
            } finally {
                setIsLoading(false);
            }
        }
        
        loadProfile();
    }, [targetUserIdOrUsername, isOwnProfile, currentUser]);

    // Save profile metadata edits
    const handleSaveProfile = async () => {
        if (!profile) return;
        try {
            haptic('medium');
            setIsSaving(true);

            const updatedMeta = {
                name: editName.trim() || profile.name,
                bio: editBio.trim(),
                telegram_handle: editTelegram.trim(),
                twitter_handle: editTwitter.trim(),
                avatar: editAvatar.trim() || profile.avatar
            };

            // Local save
            localStorage.setItem(`profile_meta_${profile.id}`, JSON.stringify(updatedMeta));

            // Merge back into state
            setProfile(prev => prev ? { ...prev, ...updatedMeta } : null);
            setIsEditMode(false);
            notification('success');
        } catch (err) {
            console.error("Failed to update profile", err);
            notification('error');
        } finally {
            setIsSaving(false);
        }
    };

    // Helper to resolve comment blog titles
    const commentBlogTitlesMap = useMemo(() => {
        const mapping: Record<string, { title: string; slug: string }> = {};
        blogPosts.forEach(blog => {
            mapping[blog.id] = { title: blog.title, slug: blog.slug || '' };
        });
        return mapping;
    }, [blogPosts]);

    // Toggle Favorite Action (removing / toggling from library if it's their own library)
    const handleRemoveFromLibrary = async (botId: string) => {
        if (!isOwnProfile || !profile) return;
        try {
            haptic('heavy');
            // Assuming we have a delete mapping in our database or simple filter
            // Let's filter out of current state for responsiveness
            setLibraryBots(prev => prev.filter(b => b.id !== botId));
            
            // Try actual supabase deletion of ownership index if allowed
            const { error } = await (DatabaseService as any).supabase
                .from('user_bots')
                .delete()
                .eq('user_id', profile.id)
                .eq('bot_id', botId);
            
            if (error) console.error("Database deletion error user_bots:", error);
            notification('success');
        } catch (e) {
            console.error("Failed to remove bot from library:", e);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#ffffff] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
                <Activity className="animate-spin text-purple-600 mb-4" size={32} />
                <p className="text-[10px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest animate-pulse">
                    PROFİL YÜKLENİYOR...
                </p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-xl font-bold uppercase text-slate-400">Profil Bulunamadı</h1>
                <button onClick={() => navigate('/')} className="mt-4 px-6 py-2.5 bg-purple-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest">
                    ANASAYFAYA DÖN
                </button>
            </div>
        );
    }

    // Format joindate nicely
    const formattedJoinDate = (() => {
        try {
            const date = new Date(profile.joinDate);
            return date.toLocaleDateString(t('lang_code') || 'tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch {
            return 'Şubat 2024';
        }
    })();

    return (
        <div id="user-profile-layout" className="bg-[#f8fafc] dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 pb-24 font-sans transition-colors duration-300">
            <SEO 
                title={`${profile.name} (@${profile.username}) | BotlyHub`} 
                description={`${profile.name} kullanıcısının kütüphanesi, kullandığı Telegram botları ve blog yorumları.`} 
            />

            {/* Premium Sticky Navigation Header */}
            <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/40 dark:border-slate-800/20 px-4 py-3.5 transition-all">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button 
                        onClick={() => { haptic('light'); navigate(-1); }}
                        className="group flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                        <span className="p-1 rounded-lg bg-slate-100 dark:bg-slate-900 group-hover:bg-slate-200 dark:group-hover:bg-slate-800 transition-colors">
                            <ChevronLeft size={16} />
                        </span>
                        {t('back') || 'Geri'}
                    </button>
                    
                    <span className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100/60 dark:bg-slate-900/40 px-3 py-1 rounded-full">
                        {t('user_profile') || 'KULLANICI PROFİLİ'}
                    </span>
                    
                    {isOwnProfile ? (
                        <button 
                            onClick={() => { haptic('light'); navigate('/settings'); }}
                            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:rotate-45 transition-all duration-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900"
                            title={t('settings_title') || 'Settings'}
                        >
                            <Settings size={18} />
                        </button>
                    ) : (
                        <div className="w-9" />
                    )}
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-2 sm:px-4 md:px-6 py-8">
                
                {/* 1. Hero Cover Profile Card with Premium Ambient Glow */}
                <section className="relative px-2 py-4 bg-transparent border-b border-slate-200/50 dark:border-slate-800/50 overflow-hidden mb-8">
                    {/* Ambient Glows */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl -mr-24 -mt-24 rounded-full pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 dark:bg-purple-500/5 blur-2xl -ml-20 -mb-20 rounded-full pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
                        {/* Huge Premium Styled Avatar with Glass Ring */}
                        <div className="relative group shrink-0">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[30px] overflow-hidden bg-slate-100 dark:bg-slate-800 p-1.5 border border-slate-200/80 dark:border-slate-700/60 shadow-md group-hover:border-indigo-500/50 dark:group-hover:border-indigo-400/50 transition-all duration-300">
                                <img 
                                    src={profile.avatar} 
                                    className="w-full h-full object-cover rounded-[24px] bg-slate-50 dark:bg-slate-900" 
                                    alt={profile.name}
                                    referrerPolicy="no-referrer"
                                />
                            </div>
                            
                            {/* Premium Status Ring Tag */}
                            {profile.is_premium && (
                                <span className="absolute -bottom-2 -right-1 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black px-2.5 py-0.5 rounded-xl text-[8px] uppercase tracking-widest border border-white dark:border-slate-900 shadow-md animate-pulse">
                                    PRO
                                </span>
                            )}
                        </div>

                        {/* Text Fields */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-2 sm:gap-4 mb-3">
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                                    {profile.name}
                                </h1>
                                
                                {isOwnProfile && (
                                    <button 
                                        onClick={() => { haptic('light'); setIsEditMode(true); }}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all shadow-sm"
                                    >
                                        <Edit3 size={11} />
                                        {t('edit_profile') || 'Profili Düzenle'}
                                    </button>
                                )}
                            </div>

                            {/* Aligned Badge Metadata */}
                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
                                <span className="font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg">
                                    @{profile.username}
                                </span>
                                
                                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                
                                <span className="font-medium flex items-center gap-1">
                                    <Calendar size={13} className="text-slate-400" />
                                    {formattedJoinDate}
                                </span>

                                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />

                                <div className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                    <ShieldCheck size={11} className="text-blue-500" />
                                    {profile.role === 'Admin' ? 'LOG ADMIN' : 'KAŞİF'}
                                </div>
                            </div>

                            {/* Bio / Description Panel */}
                            <p className="text-sm text-slate-500 dark:text-slate-400 italic leading-relaxed max-w-2xl mx-auto md:mx-0">
                                {profile.bio}
                            </p>

                            {/* Integrated Social Handles */}
                            <div className="flex flex-wrap justify-center md:justify-start gap-2.5 mt-5">
                                {profile.telegram_handle && (
                                    <a 
                                        href={`https://t.me/${profile.telegram_handle.replace('@', '')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 text-[10px] font-black text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 uppercase tracking-widest border border-slate-200/50 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3.5 py-1.5 rounded-2xl transition-all hover:scale-[1.03] shadow-sm hover:border-blue-500/20"
                                    >
                                        <Send size={11} className="text-blue-500" />
                                        <span>Telegram</span>
                                    </a>
                                )}
                                {profile.twitter_handle && (
                                    <a 
                                        href={`https://twitter.com/${profile.twitter_handle.replace('@', '')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 text-[10px] font-black text-slate-500 dark:text-slate-400 hover:text-sky-400 dark:hover:text-sky-450 uppercase tracking-widest border border-slate-200/50 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3.5 py-1.5 rounded-2xl transition-all hover:scale-[1.03] shadow-sm hover:border-sky-500/20"
                                    >
                                        <Globe size={11} className="text-sky-500" />
                                        <span>Twitter</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Left/Right Column Layout Centering Multi-Views */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column / Sidebar (Always visible persistent "Hakkında" on desktop and tablet) */}
                    <div className="md:col-span-4 hidden md:block">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800/60">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100/10 shadow-sm">
                                    <User size={18} />
                                </div>
                                <h3 className="text-base font-bold text-slate-950 dark:text-white">
                                    {t('profile_about') || 'Hakkında'}
                                </h3>
                            </div>
                            
                            {/* Profile Bio Description */}
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic mb-6">
                                {profile.bio || 'BotlyHub ekosisteminde yeni bir kaşif. Henüz biyografi eklenmemiş.'}
                            </p>

                            {/* Extra structured details */}
                            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/65">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400 font-medium uppercase tracking-wide">Katılım</span>
                                    <span className="text-slate-700 dark:text-slate-300 font-bold">{formattedJoinDate}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400 font-medium uppercase tracking-wide">Hesap Türü</span>
                                    <span className={`font-extrabold uppercase px-2 py-0.5 rounded-lg text-[9px] ${profile.is_premium ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-450'}`}>
                                        {profile.is_premium ? 'Premium Kaşif' : 'Standart Kaşif'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400 font-medium uppercase tracking-wide font-mono">ID</span>
                                    <span className="text-slate-500 font-medium font-mono bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800">#{profile.id}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400 font-medium uppercase tracking-wide">Durum</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                        <span className="text-emerald-500 font-bold uppercase text-[10px] tracking-wider">Çevrimiçi</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column / Tabs & Active view state */}
                    <div className="md:col-span-8 space-y-6">
                        
                        {/* Profile Tabs precisely aligned (matches design language of screenshot) */}
                        <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200/50 dark:border-slate-850 mb-6 flex-wrap">
                            <button 
                                onClick={() => { haptic('light'); setActiveTab('library'); }}
                                className={`py-1.5 px-4 text-xs font-bold tracking-tight rounded-full transition-all flex items-center gap-1.5 ${
                                    activeTab === 'library' 
                                        ? 'bg-slate-200/70 dark:bg-slate-800 text-slate-950 dark:text-white font-black' 
                                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-350'
                                }`}
                            >
                                <span>{t('profile_bots') || 'Botlar'}</span>
                                {libraryBots.length > 0 && (
                                    <span className="ml-0.5 bg-slate-300/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                        {libraryBots.length}
                                    </span>
                                )}
                            </button>
                            
                            <button 
                                onClick={() => { haptic('light'); setActiveTab('channels'); }}
                                className={`py-1.5 px-4 text-xs font-bold tracking-tight rounded-full transition-all flex items-center gap-1.5 ${
                                    activeTab === 'channels' 
                                        ? 'bg-slate-200/70 dark:bg-slate-800 text-slate-950 dark:text-white font-black' 
                                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-350'
                                }`}
                            >
                                <span>{t('my_channels') || 'Kanallar'}</span>
                                {userChannels.length > 0 && (
                                    <span className="ml-0.5 bg-slate-300/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                        {userChannels.length}
                                    </span>
                                )}
                            </button>

                            <button 
                                onClick={() => { haptic('light'); setActiveTab('qa'); }}
                                className={`py-1.5 px-4 text-xs font-bold tracking-tight rounded-full transition-all flex items-center gap-1.5 ${
                                    activeTab === 'qa' 
                                        ? 'bg-slate-200/70 dark:bg-slate-800 text-slate-950 dark:text-white font-black' 
                                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-350'
                                }`}
                            >
                                <span>Soru-Cevap</span>
                                {userQaTopics.length > 0 && (
                                    <span className="ml-0.5 bg-slate-300/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                        {userQaTopics.length}
                                    </span>
                                )}
                            </button>
                            
                            <button 
                                onClick={() => { haptic('light'); setActiveTab('comments'); }}
                                className={`py-1.5 px-4 text-xs font-bold tracking-tight rounded-full transition-all flex items-center gap-1.5 ${
                                    activeTab === 'comments' 
                                        ? 'bg-slate-200/70 dark:bg-slate-800 text-slate-950 dark:text-white font-black' 
                                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-350'
                                }`}
                            >
                                <span>{t('profile_comments') || 'Yorumlar'}</span>
                                {(userComments.length + userQaComments.length) > 0 && (
                                    <span className="ml-0.5 bg-slate-300/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                        {userComments.length + userQaComments.length}
                                    </span>
                                )}
                            </button>

                            {/* Mobile only About tab */}
                            <button 
                                onClick={() => { haptic('light'); setActiveTab('about'); }}
                                className={`py-1.5 px-4 text-xs font-bold tracking-tight rounded-full md:hidden flex items-center gap-1.5 ${
                                    activeTab === 'about' 
                                        ? 'bg-slate-200/70 dark:bg-slate-800 text-slate-950 dark:text-white font-black' 
                                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-350'
                                }`}
                            >
                                <span>{t('profile_about') || 'Hakkında'}</span>
                            </button>
                        </div>

                        {/* Staggered lists content wrapper */}
                        <div className="space-y-4">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -12 }}
                                    transition={{ duration: 0.22, ease: "easeInOut" }}
                                >
                                    {/* 📂 Library Content */}
                                    {activeTab === 'library' && (
                                        <div className="space-y-4">
                                            {libraryBots.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {libraryBots.map(bot => (
                                                        <div 
                                                            key={bot.id} 
                                                            className="flex items-center justify-between p-4 bg-white dark:bg-slate-900/60 border border-slate-200/55 dark:border-slate-800/40 rounded-3xl hover:border-indigo-500/20 hover:bg-slate-50 dark:hover:bg-slate-900/40 hover:shadow-sm transition-all group relative overflow-hidden"
                                                        >
                                                            {/* Clicking the bot takes user to the description detail view */}
                                                            <div 
                                                                className="flex-1 flex items-center gap-3 cursor-pointer min-w-0"
                                                                onClick={() => navigate(`/bot/${bot.slug}`)}
                                                            >
                                                                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 shrink-0">
                                                                    <img 
                                                                        src={bot.icon || bot.photo_url || bot.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(bot.name || '')}`} 
                                                                        className="w-full h-full object-cover" 
                                                                        alt={bot.name}
                                                                        referrerPolicy="no-referrer"
                                                                    />
                                                                </div>
                                                                <div className="min-w-0 pr-2">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                                                                            {bot.name}
                                                                        </h4>
                                                                        {bot.is_official && (
                                                                            <Sparkles size={11} className="text-indigo-550 shrink-0" />
                                                                        )}
                                                                    </div>
                                                                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5 truncate max-w-[170px]">
                                                                        {Array.isArray(bot.category) ? bot.category[0] : (bot.category || 'Bot')}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <a 
                                                                    href={bot.bot_link} 
                                                                    target="_blank" 
                                                                    rel="noreferrer"
                                                                    className="p-2 text-slate-400 hover:text-indigo-500 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 rounded-xl hover:scale-105 transition-all text-xs"
                                                                    title="Launch Bot / Webapp"
                                                                >
                                                                    <ExternalLink size={14} />
                                                                </a>

                                                                {isOwnProfile && (
                                                                    <button 
                                                                        onClick={() => handleRemoveFromLibrary(bot.id)}
                                                                        className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 rounded-xl hover:scale-105 transition-all"
                                                                        title="Remove from Library"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 p-12 rounded-3xl text-center">
                                                    <BotIcon size={32} className="mx-auto text-slate-300 dark:text-slate-650 mb-3 animate-bounce" />
                                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white tracking-tight mb-2">
                                                        KÜTÜPHANENİZ BOMBOŞ
                                                    </h4>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 italic max-w-sm mx-auto mb-6">
                                                        BotlyHub'ta beğendiğiniz botları ve mini uygulamaları kütüphanenize kaydederek kolayca erişebilirsiniz.
                                                    </p>
                                                    <Link 
                                                        to="/" 
                                                        className="inline-flex items-center gap-1.5 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-md shadow-indigo-500/10"
                                                    >
                                                        <Plus size={14} />
                                                        PROJELERI KEŞFET
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 📡 Channels Content */}
                                    {activeTab === 'channels' && (
                                        <div className="space-y-4">
                                            {userChannels.length > 0 ? (
                                                <div className="grid grid-cols-1 gap-4">
                                                    {userChannels.map(channel => (
                                                        <div 
                                                            key={channel.id}
                                                            className="flex items-center justify-between p-4 bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl hover:border-indigo-500/20 hover:bg-slate-50 dark:hover:bg-slate-900/40 hover:shadow-sm transition-all"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs border border-slate-200/40 dark:border-slate-800/65 overflow-hidden">
                                                                    {(channel.icon || channel.photo_url || channel.avatar) ? (
                                                                        <img src={channel.icon || channel.photo_url || channel.avatar} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                                                                    ) : (
                                                                        channel.name.charAt(0).toUpperCase()
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                                                                        {channel.name}
                                                                    </h4>
                                                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
                                                                        {channel.memberCount} Üye · ID: {channel.telegram_id}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                                                    {t('channel_active') || 'Aktif'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 p-12 rounded-3xl text-center">
                                                    <Send size={32} className="mx-auto text-slate-300 dark:text-slate-650 mb-3" />
                                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white tracking-tight mb-2">
                                                        KANAL BULUNMADI
                                                    </h4>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 italic max-w-sm mx-auto mb-6">
                                                        Kullanıcıya ait doğrulanmış veya tescilli bir Telegram kanalı bulunmuyor.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* ❔ User Q&A Questions (Soru-Cevap) */}
                                    {activeTab === 'qa' && (
                                        <div className="space-y-4">
                                            {userQaTopics.length > 0 ? (
                                                <div className="space-y-4">
                                                    {userQaTopics.map(topic => (
                                                        <div 
                                                            key={topic.id}
                                                            onClick={() => { haptic('light'); navigate('/qa', { state: { autoOpenTopicId: topic.id } }); }}
                                                            className="p-5 bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl hover:border-indigo-550 dark:hover:border-indigo-505 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-all shadow-sm cursor-pointer group"
                                                        >
                                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                                    {topic.title}
                                                                </h3>
                                                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 text-xs font-mono border border-slate-200/50 dark:border-slate-800">
                                                                    <Triangle size={11} className="fill-slate-400 text-slate-400 shrink-0 rotate-180" />
                                                                    <span>{topic.upvotes_count || 0}</span>
                                                                </div>
                                                            </div>
                                                            
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4 font-normal">
                                                                {topic.content}
                                                            </p>
                                                            
                                                            <div className="flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/50 text-[10px] text-slate-400 font-bold">
                                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                                    {topic.tags && topic.tags.map((tag: any) => (
                                                                        <span 
                                                                            key={tag.id}
                                                                            className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 rounded-lg font-bold border border-slate-250/20"
                                                                        >
                                                                            #{tag.name}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="flex items-center gap-1.5">
                                                                        <MessageSquare size={12} className="text-slate-400" />
                                                                        {topic.comments_count || 0} Cevap
                                                                    </span>
                                                                    <span>·</span>
                                                                    <span>{formatRelativeTime(topic.created_at)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 p-12 rounded-3xl text-center">
                                                    <MessageSquare size={32} className="mx-auto text-slate-300 dark:text-slate-650 mb-3" />
                                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white tracking-tight mb-2">
                                                        HENÜZ SORU SORULMADI
                                                    </h4>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 italic max-w-sm mx-auto mb-6">
                                                        Kullanıcının Soru-Cevap forumunda başlattığı herhangi bir tartışma veya yardım talebi bulunmuyor.
                                                    </p>
                                                    {isOwnProfile && (
                                                        <Link 
                                                            to="/qa" 
                                                            className="inline-flex items-center gap-1.5 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-md shadow-indigo-500/10"
                                                        >
                                                            <Plus size={14} />
                                                            SORU SOR
                                                        </Link>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 💬 Blog Comments & Forum responses separated directly matching request */}
                                    {activeTab === 'comments' && (
                                        <div className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm">
                                            {/* Header indicator row */}
                                            <div className="flex items-center justify-between gap-2.5 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/40 border-slate-200/40">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100/10">
                                                        <MessageSquare size={14} />
                                                    </div>
                                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('profile_comments') || 'Yorumlar'}</h2>
                                                </div>

                                                {/* Separator filter pills segment */}
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => { haptic('light'); setCommentsSubTab('blog'); }}
                                                        className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${commentsSubTab === 'blog' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800'}`}
                                                    >
                                                        Blog ({userComments.length})
                                                    </button>
                                                    <button 
                                                        onClick={() => { haptic('light'); setCommentsSubTab('qa'); }}
                                                        className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${commentsSubTab === 'qa' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800'}`}
                                                    >
                                                        Soru-Cevap ({userQaComments.length})
                                                    </button>
                                                </div>
                                            </div>

                                            {commentsSubTab === 'blog' ? (
                                                userComments.length > 0 ? (
                                                    <div className="space-y-6">
                                                        {userComments.map(comment => {
                                                            const relatedBlog = commentBlogTitlesMap[comment.blog_id];
                                                            return (
                                                                <div key={comment.id} className="flex gap-3">
                                                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 shrink-0 mt-0.5 shadow-sm">
                                                                        <img 
                                                                            src={profile.avatar} 
                                                                            className="w-full h-full object-cover" 
                                                                            alt={profile.name}
                                                                            referrerPolicy="no-referrer"
                                                                        />
                                                                    </div>

                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/10 dark:border-slate-700/10 px-4 py-3 rounded-2xl rounded-tl-[4px] inline-block max-w-full shadow-inner">
                                                                            <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">
                                                                                {comment.content}
                                                                            </p>
                                                                        </div>

                                                                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-2 px-1 tracking-wide">
                                                                            <span className="flex items-center gap-1">
                                                                                <MessageSquare size={11} className="text-slate-400" />
                                                                                Blog Yorumu
                                                                            </span>

                                                                            <span>·</span>

                                                                            <span className="font-normal">{formatRelativeTime(comment.created_at)}</span>

                                                                            {relatedBlog && (
                                                                                <>
                                                                                    <span>·</span>
                                                                                    <Link 
                                                                                        to={`/blog/${relatedBlog.slug}`}
                                                                                        className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase text-slate-450 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors max-w-[200px] truncate"
                                                                                    >
                                                                                        <ExternalLink size={9} />
                                                                                        <span className="truncate">{relatedBlog.title}</span>
                                                                                    </Link>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-10">
                                                        <MessageSquare size={24} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                                                        <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                                                            Herhangi bir blog yorumu bulunmuyor.
                                                        </p>
                                                    </div>
                                                )
                                            ) : (
                                                userQaComments.length > 0 ? (
                                                    <div className="space-y-6">
                                                        {userQaComments.map(comment => (
                                                            <div key={comment.id} className="flex gap-3">
                                                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 shrink-0 mt-0.5 shadow-sm">
                                                                        <img 
                                                                            src={profile.avatar} 
                                                                            className="w-full h-full object-cover" 
                                                                            alt={profile.name}
                                                                            referrerPolicy="no-referrer"
                                                                        />
                                                                    </div>

                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="bg-indigo-50/10 dark:bg-slate-800/40 border border-slate-200/10 dark:border-slate-700/10 px-4 py-3 rounded-2xl rounded-tl-[4px] inline-block max-w-full shadow-inner">
                                                                            <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">
                                                                                {comment.content}
                                                                            </p>
                                                                        </div>

                                                                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-2 px-1 tracking-wide">
                                                                            <span className="flex items-center gap-1">
                                                                                <MessageSquare size={11} className="text-slate-400" />
                                                                                Forum Soru Cevabı
                                                                            </span>

                                                                            <span>·</span>

                                                                            <span className="font-normal">{formatRelativeTime(comment.created_at)}</span>

                                                                            {comment.topic_id && (
                                                                                <>
                                                                                    <span>·</span>
                                                                                    <div 
                                                                                        onClick={() => navigate('/qa', { state: { autoOpenTopicId: comment.topic_id } })}
                                                                                        className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase text-slate-450 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors max-w-[200px] truncate cursor-pointer"
                                                                                    >
                                                                                        <ExternalLink size={9} />
                                                                                        <span className="truncate">{comment.topic_title || "Konuyu Görüntüle"}</span>
                                                                                    </div>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-10">
                                                        <MessageSquare size={24} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                                                        <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                                                            Soru-Cevap forumunda herhangi bir cevabınız bulunmuyor.
                                                        </p>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}

                                    {/* 👤 About Context (Active on Mobile screen sizes) */}
                                    {activeTab === 'about' && (
                                        <div className="space-y-6">
                                            <div className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl">
                                                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                                    <User size={14} className="text-indigo-550" />
                                                    KULLANICI HAKKINDA
                                                </h3>
                                                
                                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6 italic">
                                                    {profile.bio || 'Bu kullanıcı hakkında henüz ekstra bir açıklama kaydı bulunmuyor.'}
                                                </p>

                                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                                                    <div>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Katılım Tarihi</span>
                                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{formattedJoinDate}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Kullanıcı Grubu</span>
                                                        <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase">{profile.role}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Kayıt No</span>
                                                        <span className="text-xs font-mono font-bold text-slate-500">#{profile.id}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Statü</span>
                                                        <span className="text-xs font-bold text-emerald-500 uppercase">● ÇEVRİMİÇİ</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                </div>
            </main>

            {/* Profile Editing Modal Overlay */}
            <AnimatePresence>
                {isEditMode && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-950/80 p-0 sm:p-4 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-[32px] sm:rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-2xl"
                        >
                            {/* Header */}
                            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                                    PROFİLİ DÜZENLE
                                </h3>
                                <button 
                                    onClick={() => { haptic('light'); setIsEditMode(false); }}
                                    className="p-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-black text-slate-500 dark:text-slate-400 rounded-full transition-all"
                                >
                                    KAPAT
                                </button>
                            </div>

                            {/* Content Form Scrollable */}
                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                
                                {/* Display Name */}
                                <div>
                                    <label className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block mb-1.5">
                                        GÖRÜNEN ADINIZ <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="Görünen Ad"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/50 rounded-2xl text-xs font-medium text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 transition-all"
                                    />
                                </div>

                                {/* Bio Paragraph */}
                                <div>
                                    <label className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block mb-1.5">
                                        BİYOGRAFİ / HAKKINDA
                                    </label>
                                    <textarea 
                                        rows={3}
                                        maxLength={180}
                                        placeholder="Kendiniz hakkında bir şeyler yazın..."
                                        value={editBio}
                                        onChange={(e) => setEditBio(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/50 rounded-2xl text-xs font-medium text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 resize-none transition-all"
                                    />
                                    <span className="text-[8px] text-slate-400 block text-right mt-1 font-mono uppercase">
                                        Max 180 Karakter
                                    </span>
                                </div>

							</div>

                            {/* Footer actions */}
                            <div className="p-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
                                <button 
                                    type="button"
                                    onClick={() => { haptic('light'); setIsEditMode(false); }}
                                    className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 border border-slate-200/40 dark:border-slate-800 rounded-xl block text-center transition-all bg-slate-50 dark:bg-slate-850"
                                >
                                    İPTAL
                                </button>
                                <button 
                                    type="button"
                                    disabled={isSaving}
                                    onClick={handleSaveProfile}
                                    className="flex-1 py-3 bg-indigo-600 text-white hover:bg-indigo-750 hover:shadow-lg hover:shadow-indigo-500/10 text-[10px] font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all"
                                >
                                    {isSaving ? (
                                        <span className="animate-spin text-white">●</span>
                                    ) : (
                                        <Check size={14} />
                                    )}
                                    KAYDET
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
