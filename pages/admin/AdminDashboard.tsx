
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, Routes, Route, Link, useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, Users, LogOut, Menu, X, 
  Loader2, Plus, Trash2, Megaphone, Send, Activity, 
  Wallet, Search, Database, Radio, Bell, Edit3, Image as ImageIcon,
  CheckCircle2, AlertTriangle, TrendingUp, BarChart3, RadioIcon, Sparkles, UserPlus,
  ShieldCheck, ShieldAlert, Globe, Zap, Clock, ExternalLink, Filter, PieChart, Layers, 
  Settings as SettingsIcon, History, Copy, Check, Eye, ChevronRight, Monitor, Smartphone, Cpu, Save, Key,
  Info, Star, MousePointer2, Link2, AlertCircle, Shield, Calendar, Hash, Heart, Gift, Bot as BotIcon, BookOpen, FileText
} from 'lucide-react';
import { DatabaseService } from '../../services/DatabaseService';
import { GeminiService } from '../../services/GeminiService';
import { GoogleGenAI, Type } from "@google/genai";
import { User, Bot as BotType, Announcement, Promotion, ActivityLog, Notification, Referral, ReferralSettings } from '../../types';
import { categories, appsSubCategories } from '../../data';
import Logo from '../../components/Logo';

const getLiveBotIcon = (botLink: string) => {
    if (!botLink || botLink === '@') return "https://ui-avatars.com/api/?name=Bot&background=1e293b&color=fff";
    const username = botLink.replace('@', '').replace('https://t.me/', '').split('/').pop()?.trim();
    if (username && username.length > 2) {
        return `https://t.me/i/userpic/320/${username}.jpg`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username || 'Bot')}&background=1e293b&color=fff&bold=true`;
};

const generateUniqueId = () => `BOT-${Math.floor(10000 + Math.random() * 90000)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

const translateType = (type: string) => {
    const translations: any = {
        all: 'HEPSİ',
        payment: 'ÖDEME',
        bot_manage: 'BOT YÖNETİMİ',
        security: 'GÜVENLİK',
        system: 'SİSTEM',
        auth: 'YETKİLENDİRME',
        channel_sync: 'KANAL SENKRONİZASYONU',
        referral: 'REFERANS',
        referral_processing: 'REFERANS İŞLEME',
        referral_error: 'REFERANS HATASI'
    };
    return translations[type] || type.replace('_', ' ').toUpperCase();
};

const NavItem = ({ to, icon: Icon, label, active, onClick }: any) => {
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
        active 
          ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_2px_10px_rgba(37,99,235,0.05)]' 
          : 'text-slate-400 hover:bg-slate-900/60 hover:text-white border border-transparent'
      }`}
    >
      <Icon size={18} className={active ? 'text-blue-400' : 'text-slate-400 transition-colors'} />
      <span>{label}</span>
    </Link>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!DatabaseService.isAdminLoggedIn()) navigate('/a/admin');
  }, [navigate]);

  return (
    <div className="dark min-h-screen bg-[#090d16] flex text-slate-100 overflow-hidden font-sans">
      {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[65] lg:hidden animate-in fade-in" onClick={() => setSidebarOpen(false)}></div>
      )}

      <aside className={`fixed inset-y-0 left-0 z-[70] w-64 bg-[#090d16] border-r border-slate-800/40 transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="shrink-0 bg-blue-600/10 p-2.5 rounded-xl border border-blue-500/15">
                <Logo 
                    style={{ width: '1.75rem', height: 'auto', display: 'block' }} 
                    className="" 
                />
            </div>
            <div>
                <h2 className="text-base font-bold text-white tracking-tight leading-none">Botly<span className="text-blue-500">Hub</span></h2>
                <span className="text-[10px] font-medium text-slate-500 tracking-wider mt-1.5 block">Yönetici Paneli</span>
            </div>
          </div>
          
          <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar px-1">
            <NavItem to="/a/dashboard" icon={LayoutDashboard} label="Genel Bakış" active={location.pathname === '/a/dashboard'} onClick={() => setSidebarOpen(false)} />
            
            <div className="pt-6 pb-2 px-3">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">İzleme</span>
            </div>
            <NavItem to="/a/dashboard/users" icon={Users} label="Kullanıcılar" active={location.pathname.startsWith('/a/dashboard/users')} onClick={() => setSidebarOpen(false)} />
            <NavItem to="/a/dashboard/admin-logs" icon={ShieldCheck} label="Yönetici Logları" active={location.pathname.startsWith('/a/dashboard/admin-logs')} onClick={() => setSidebarOpen(false)} />
            <NavItem to="/a/dashboard/user-logs" icon={History} label="Üye Hareketleri" active={location.pathname.startsWith('/a/dashboard/user-logs')} onClick={() => setSidebarOpen(false)} />
            <NavItem to="/a/dashboard/sales" icon={Wallet} label="Finansövel" active={location.pathname.startsWith('/a/dashboard/sales')} onClick={() => setSidebarOpen(false)} />
            <NavItem to="/a/dashboard/referrals" icon={UserPlus} label="Referanslar" active={location.pathname.startsWith('/a/dashboard/referrals')} onClick={() => setSidebarOpen(false)} />
            
            <div className="pt-6 pb-2 px-3">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">İçerik</span>
            </div>
            <NavItem to="/a/dashboard/bots" icon={BotIcon} label="Market Botları" active={location.pathname.startsWith('/a/dashboard/bots')} onClick={() => setSidebarOpen(false)} />
            <NavItem to="/a/dashboard/promotions" icon={RadioIcon} label="Tanıtım Motoru" active={location.pathname.startsWith('/a/dashboard/promotions')} onClick={() => setSidebarOpen(false)} />
            <NavItem to="/a/dashboard/announcements" icon={Megaphone} label="Duyuru Merkezi" active={location.pathname.startsWith('/a/dashboard/announcements')} onClick={() => setSidebarOpen(false)} />
            <NavItem to="/a/dashboard/notifications" icon={Bell} label="Bildirim Gönder" active={location.pathname.startsWith('/a/dashboard/notifications')} onClick={() => setSidebarOpen(false)} />
            <NavItem to="/a/dashboard/blogs" icon={BookOpen} label="Blog Yönetimi" active={location.pathname.startsWith('/a/dashboard/blogs')} onClick={() => setSidebarOpen(false)} />
            
            <div className="pt-6 pb-2 px-3">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Sistem</span>
            </div>
            <NavItem to="/a/dashboard/settings" icon={SettingsIcon} label="Sistem Ayarları" active={location.pathname.startsWith('/a/dashboard/settings')} onClick={() => setSidebarOpen(false)} />
          </nav>

          <button 
            onClick={() => { DatabaseService.logoutAdmin(); navigate('/a/admin'); }} 
            className="mt-6 flex items-center justify-center gap-3 w-full px-4 py-3 bg-red-500/10 text-red-400 font-medium text-sm rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/10 hover:border-transparent"
          >
            <LogOut size={16} /> <span>Oturumu Kapat</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative bg-[#060913]">
        <header className="h-16 border-b border-slate-800/40 flex items-center justify-between px-6 lg:px-8 bg-[#090d16]/70 backdrop-blur-md z-50">
           <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 bg-slate-900 border border-slate-800/60 rounded-xl text-slate-400 active:scale-95 transition-all">
              <Menu size={18}/>
           </button>
           
           <div className="flex items-center gap-3 ml-auto">
              <div className="hidden sm:flex items-center gap-2 bg-[#121c30] px-3 py-1 rounded-full border border-blue-500/15">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[10px] font-semibold text-blue-300 uppercase tracking-wider">Canlı Operasyonel Durum</span>
              </div>
              <div className="flex items-center gap-2 px-1.5 py-1.5 bg-slate-900 border border-slate-800/60 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-[0_2px_10px_rgba(37,99,235,0.15)]">
                  A
                </div>
                <div className="hidden md:block text-left px-2 leading-tight">
                  <p className="text-xs font-semibold text-white">Yönetici</p>
                  <p className="text-[9px] text-slate-500">Root Seviyesi</p>
                </div>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8 no-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8 pb-16">
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="admin-logs" element={<ActivityCenter filterType="admin" />} />
              <Route path="user-logs" element={<ActivityCenter filterType="user" />} />
              <Route path="bots" element={<BotManagement />} />
              <Route path="sales" element={<SalesManagement />} />
              <Route path="referrals" element={<ReferralManagement />} />
              <Route path="promotions" element={<PromotionManagement />} />
              <Route path="announcements" element={<AnnouncementCenter />} />
              <Route path="notifications" element={<NotificationCenter />} />
              <Route path="blogs" element={<BlogManagement />} />
              <Route path="settings" element={<SettingsManager />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }: any) => {
    const colors: any = {
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20'
    };
    return (
        <div className="bg-[#101626]/40 border border-slate-800/60 p-6 rounded-2xl hover:border-slate-700/80 hover:translate-y-[-2px] transition-all duration-300 group shadow-sm flex items-center justify-between">
            <div className="space-y-1 leading-none">
              <p className="text-xs font-semibold text-slate-400 tracking-tight">{label}</p>
              <h3 className="text-2xl font-bold text-white tracking-tight pt-1">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
            </div>
            <div className={`w-12 h-12 ${colors[color]} rounded-xl border flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}><Icon size={20} /></div>
        </div>
    );
};

const AdminInput = ({ label, value, onChange, type = "text", placeholder = "", icon: Icon }: any) => (
    <div className="space-y-1.5 text-white group w-full">
        <label className="text-xs font-semibold text-slate-400 tracking-tight ml-1 group-focus-within:text-blue-400 transition-colors">{label}</label>
        <div className="relative">
            {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={16} />}
            <input 
                type={type} 
                value={value} 
                onChange={e => onChange(e.target.value)} 
                placeholder={placeholder}
                className={`w-full h-11 bg-slate-950/70 border border-slate-800/80 rounded-xl ${Icon ? 'pl-11' : 'px-4'} pr-4 text-sm font-normal text-white placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-150`} 
            />
        </div>
    </div>
);

const HomeView = () => {
    const [stats, setStats] = useState({ userCount: 0, botCount: 0, logCount: 0, salesCount: 0, totalRevenue: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { 
        DatabaseService.getAdminStats().then(s => { setStats(s); setIsLoading(false); }); 
    }, []);

    if (isLoading) return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;

    return (
        <div className="animate-in fade-in duration-300 space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight leading-none">Sistem Genel Bakış</h1>
                <p className="text-sm font-normal text-slate-400 leading-normal">Büyüme ve operasyonel performans metrikleri</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Toplam Üye" value={stats.userCount} color="blue" />
                <StatCard icon={BotIcon} label="Aktif Botlar" value={stats.botCount} color="purple" />
                <StatCard icon={BarChart3} label="Satış Adedi" value={stats.salesCount} color="orange" />
                <StatCard icon={TrendingUp} label="Toplam Ciro" value={`₺${stats.totalRevenue.toLocaleString()}`} color="emerald" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#101626]/40 border border-slate-800/60 p-6 rounded-2xl relative overflow-hidden group">
                    <h3 className="text-sm font-semibold text-slate-300 tracking-tight mb-6">Haftalık Büyüme Oranı</h3>
                    <div className="h-40 flex items-end gap-3 px-2">
                        {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                            <div key={i} className="flex-1 bg-gradient-to-t from-blue-600/80 to-blue-500/30 rounded-t-lg transition-all duration-500 hover:opacity-100 opacity-90 cursor-pointer h-full" style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/15 p-6 rounded-2xl flex flex-col justify-center relative overflow-hidden">
                    <Sparkles className="absolute -top-4 -right-4 text-blue-500/10 w-24 h-24" />
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2">Günlük Rapor</p>
                    <p className="text-white text-lg font-bold leading-none mb-2">Sistem Stabil durumda</p>
                    <p className="text-slate-400 text-xs font-normal leading-relaxed opacity-90">Operasyonel verimlilik %99.9 seviyesinde. Kayıt hızlarında %14 oranında istikrarlı büyüme gözlenmiştir.</p>
                </div>
            </div>
        </div>
    );
};

const BotManagement = () => {
    const [bots, setBots] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBot, setEditingBot] = useState<any>(null);
    const [listFilter, setListFilter] = useState<'apps' | 'bots'>('apps');
    const [copiedId, setCopiedId] = useState(false);
    const [activeTab, setActiveTab] = useState<'info' | 'media' | 'pricing'>('info');
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
    const [selectedBotIds, setSelectedBotIds] = useState<string[]>([]);

    const load = useCallback(async () => {
        setIsLoading(true);
        setBots(await DatabaseService.getBotsWithStats());
        setIsLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        const editId = searchParams.get('edit');
        if (editId && bots.length > 0) {
            const bot = bots.find(b => b.id === editId);
            if (bot) {
                const cats = Array.isArray(bot.category) ? bot.category : (bot.category ? (typeof bot.category === 'string' && bot.category.startsWith('[') ? JSON.parse(bot.category) : [bot.category]) : ['utilities']);
                setEditingBot({
                    ...bot,
                    product_type: cats.includes('apps') ? 'app' : 'bot',
                    promoted_type: bot.promoted_type || 'none',
                    languages: bot.languages || [],
                    category: cats
                });
                setIsModalOpen(true);
                setSearchParams({}, { replace: true });
            }
        }
    }, [searchParams, bots, setSearchParams]);

    const openCreateModal = () => {
        setEditingBot({
            id: generateUniqueId(),
            name: '',
            description: '',
            price: 0,
            category: listFilter === 'apps' ? ['apps'] : ['utilities'],
            product_type: listFilter === 'apps' ? 'app' : 'bot', // Set based on current filter
            bot_link: '@',
            icon: '',
            screenshots: [],
            is_official: false,
            telegram_group: '',
            website_url: '',
            app_url: '',
            social_url: '',
            github_url: '',
            youtube_url: '',
            x_url: '',
            android_url: '',
            ios_url: '',
            promoted_type: 'none',
            languages: ['🇹🇷']
        });
        setIsModalOpen(true);
        setActiveTab('info');
    };

    const copyId = () => {
        if (!editingBot) return;
        navigator.clipboard.writeText(editingBot.id);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    const handleScreenshotAdd = (url: string) => {
        if (!url) return;
        setEditingBot({ ...editingBot, screenshots: [...(editingBot.screenshots || []), url] });
    };

    const removeScreenshot = (index: number) => {
        const next = [...editingBot.screenshots];
        next.splice(index, 1);
        setEditingBot({ ...editingBot, screenshots: next });
    };

    const filteredBotsList = (bots || []).filter(b => {
        const matchesSearch = (b.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (b.bot_link || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (b.id || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const cats = Array.isArray(b.category) ? b.category : (b.category ? (typeof b.category === 'string' && b.category.startsWith('[') ? JSON.parse(b.category) : [b.category]) : []);
        const typeMatches = listFilter === 'apps' ? cats.includes('apps') : !cats.includes('apps');
        
        return matchesSearch && typeMatches;
    });

    const toggleSelectBot = (botId: string) => {
        setSelectedBotIds(prev => 
            prev.includes(botId) 
            ? prev.filter(id => id !== botId) 
            : [...prev, botId]
        );
    };

    const toggleSelectAll = () => {
        const allFilteredIds = filteredBotsList.map(b => b.id);
        const isAllSelected = allFilteredIds.every(id => selectedBotIds.includes(id));
        if (isAllSelected) {
            setSelectedBotIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
        } else {
            const uniqueSet = new Set([...selectedBotIds, ...allFilteredIds]);
            setSelectedBotIds(Array.from(uniqueSet));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedBotIds.length === 0) return;
        if (confirm(`Seçtiğiniz ${selectedBotIds.length} botu sistemden silmek istediğinize emin misiniz?`)) {
            setIsLoading(true);
            try {
                for (const id of selectedBotIds) {
                    const b = bots.find(bot => bot.id === id);
                    const botName = b ? b.name : id;
                    await DatabaseService.deleteBot(id);
                    await DatabaseService.logActivity(
                        'admin', 
                        'bot_manage', 
                        'bot_deleted', 
                        'Bot Silindi (Toplu)', 
                        `${botName} isimli bot toplu silme işlemiyle silindi.`
                    );
                }
                setSelectedBotIds([]);
                setIsMultiSelectMode(false);
                await load();
            } catch (err) {
                console.error("Bulk delete error:", err);
                alert("Silme işlemi sırasında hata oluştu!");
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight leading-none">Market Envanteri</h2>
                    <p className="text-xs text-slate-400 mt-1 leading-normal">Platformda yer alan Telegram botlarını ve web uygulamalarını profesyonelce yönetin</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative group w-full sm:w-64">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="Ürün arayın..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-11 bg-slate-950/70 border border-slate-800/80 rounded-xl pl-10 pr-4 text-xs font-normal text-white placeholder-slate-600 outline-none focus:border-blue-500 transition-all"
                        />
                    </div>
                    <button 
                        onClick={() => {
                            setIsMultiSelectMode(!isMultiSelectMode);
                            setSelectedBotIds([]);
                        }}
                        className={`px-4 h-11 border rounded-xl text-xs font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm ${
                            isMultiSelectMode 
                            ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500' 
                            : 'bg-slate-900/60 hover:bg-slate-850 text-slate-400 border-slate-800 hover:text-rose-400'
                        }`}
                        title="Toplu Silme özelliğini aç/kapat"
                    >
                        <Trash2 size={15} /> {isMultiSelectMode ? 'Seçimi Kapat' : 'Toplu Silme'}
                    </button>
                    <button 
                        onClick={openCreateModal}
                        className="bg-blue-600 hover:bg-blue-500 hover:scale-[1.01] px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Plus size={16} /> Yeni Ürün Tanımla
                    </button>
                    <button 
                        onClick={load}
                        className="px-3 h-11 bg-slate-900/60 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-400 transition-all active:scale-95 flex items-center justify-center"
                        title="Yenile"
                    >
                        <History size={16} />
                    </button>
                </div>
            </div>

            {isMultiSelectMode && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                            <Trash2 size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white leading-none mb-1">Toplu Silme Paneli</p>
                            <p className="text-xs text-rose-300/80">
                                {selectedBotIds.length > 0 
                                    ? `Seçilen ${selectedBotIds.length} ürünü silmek için 'Tamamla' butonuna tıklayın.` 
                                    : "Silmek istediğiniz ürünleri kartların üzerindeki kutulardan seçin."
                                }
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                        <button
                            onClick={toggleSelectAll}
                            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-850 hover:border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer"
                        >
                            {filteredBotsList.every(b => selectedBotIds.includes(b.id)) ? 'Seçimi Kaldır' : 'Hepsini Seç'}
                        </button>
                        <button
                            onClick={() => {
                                setIsMultiSelectMode(false);
                                setSelectedBotIds([]);
                            }}
                            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-850 hover:border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer"
                        >
                            Vazgeç
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            disabled={selectedBotIds.length === 0}
                            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                                selectedBotIds.length > 0
                                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/25 cursor-pointer'
                                : 'bg-[#181e30] border border-slate-800/50 text-slate-500 cursor-not-allowed'
                            }`}
                        >
                            Tamamla (Sil)
                        </button>
                    </div>
                </div>
            )}

            <div className="flex gap-1.5 p-1 bg-[#101626]/40 border border-slate-800/60 rounded-xl w-full md:w-fit">
                <button 
                    onClick={() => setListFilter('apps')}
                    className={`px-5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${listFilter === 'apps' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm' : 'text-slate-400 hover:text-white border border-transparent'}`}
                >
                    Uygulamalar
                </button>
                <button 
                    onClick={() => setListFilter('bots')}
                    className={`px-5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${listFilter === 'bots' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm' : 'text-slate-400 hover:text-white border border-transparent'}`}
                >
                    Botlar
                </button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                    <span className="text-xs text-slate-500 font-medium italic">Envanter verileri çekiliyor...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBotsList.map(b => (
                        <div 
                            key={b.id} 
                            onClick={() => {
                                if (isMultiSelectMode) {
                                    toggleSelectBot(b.id);
                                    return;
                                }
                                const cats = Array.isArray(b.category) ? b.category : (b.category ? (typeof b.category === 'string' && b.category.startsWith('[') ? JSON.parse(b.category) : [b.category]) : ['utilities']);
                                setEditingBot({
                                    ...b,
                                    product_type: cats.includes('apps') ? 'app' : 'bot',
                                    promoted_type: b.promoted_type || 'none',
                                    languages: b.languages || [],
                                    category: cats
                                });
                                setIsModalOpen(true);
                            }}
                            className={`border rounded-2xl p-6 flex flex-col justify-between group hover:translate-y-[-2px] transition-all duration-300 relative overflow-hidden backdrop-blur-sm cursor-pointer shadow-sm ${
                                isMultiSelectMode 
                                ? selectedBotIds.includes(b.id)
                                    ? 'bg-rose-500/10 border-rose-500/40 shadow-[0_0_15px_rgba(239,68,68,0.08)]'
                                    : 'bg-[#101626]/20 border-slate-900/40 opacity-70 hover:opacity-100 hover:border-slate-800'
                                : 'bg-[#101626]/40 border-slate-800/60 hover:border-blue-500/30'
                            }`}
                        >
                            <div className="space-y-4">
                                <div className="flex justify-between items-start relative z-10">
                                    <div className="relative">
                                        <img 
                                            src={getLiveBotIcon(b.bot_link)} 
                                            className="w-14 h-14 rounded-xl border border-slate-800/80 object-cover bg-slate-950 transition-transform duration-300 group-hover:scale-105" 
                                            onError={(e) => (e.target as any).src = `https://ui-avatars.com/api/?name=${b.name}`}
                                            referrerPolicy="no-referrer"
                                        />
                                        {b.price > 0 && <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-500 rounded-lg flex items-center justify-center border-2 border-slate-950 font-semibold text-white"><Zap size={10} fill="currentColor" /></div>}
                                    </div>
                                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                        {isMultiSelectMode ? (
                                            <button 
                                                onClick={() => toggleSelectBot(b.id)}
                                                className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                                                    selectedBotIds.includes(b.id)
                                                    ? 'bg-rose-500 text-white border border-rose-400 scale-105 shadow-md shadow-rose-950/20'
                                                    : 'bg-[#181e30] border border-slate-800/80 text-slate-500 hover:border-slate-600 hover:text-slate-350'
                                                }`}
                                            >
                                                <Check size={14} className={selectedBotIds.includes(b.id) ? "stroke-[3px]" : "stroke-[2.5px] opacity-40"} />
                                            </button>
                                        ) : (
                                            <>
                                                {b.is_official && (
                                                    <div className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-1">
                                                        <ShieldCheck size={11} className="text-blue-400" />
                                                        <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Resmi</span>
                                                    </div>
                                                )}
                                                <button 
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        const nextType = b.promoted_type === 'featured' ? 'none' : 'featured';
                                                        await DatabaseService.saveBot({ ...b, promoted_type: nextType });
                                                        load();
                                                    }}
                                                    className={`p-2 rounded-xl transition-all ${b.promoted_type === 'featured' ? 'bg-amber-500 text-white' : 'bg-[#181e30] text-slate-400 hover:text-amber-400 border border-slate-800/50'}`}
                                                    title="Öne Çıkar"
                                                >
                                                    <Star size={13} fill={b.promoted_type === 'featured' ? "currentColor" : "none"} />
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const cats = Array.isArray(b.category) ? b.category : (b.category ? (typeof b.category === 'string' && b.category.startsWith('[') ? JSON.parse(b.category) : [b.category]) : ['utilities']);
                                                        setEditingBot({
                                                            ...b,
                                                            product_type: cats.includes('apps') ? 'app' : 'bot',
                                                            promoted_type: b.promoted_type || 'none',
                                                            languages: b.languages || [],
                                                            category: cats
                                                        });
                                                        setIsModalOpen(true);
                                                    }} 
                                                    className="p-2 bg-[#181e30] text-slate-400 hover:text-white rounded-xl border border-slate-800/50 hover:bg-blue-600 transition-all shadow-md"
                                                >
                                                    <Edit3 size={13}/>
                                                </button>
                                                <button 
                                                    onClick={async (e) => { 
                                                        e.stopPropagation();
                                                        if(confirm(`'${b.name}' Silsin mi?`)) { 
                                                            await DatabaseService.deleteBot(b.id); 
                                                            await DatabaseService.logActivity('admin', 'bot_manage', 'bot_deleted', 'Bot Silindi', `${b.name} isimli bot sistemden silindi.`); 
                                                            load(); 
                                                        } 
                                                    }} 
                                                    className="p-2 bg-[#181e30] border border-slate-800/50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                                                >
                                                    <Trash2 size={13}/>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <h4 className="text-base font-bold text-white tracking-tight truncate leading-tight group-hover:text-blue-400 transition-colors">{b.name}</h4>
                                    <p className="text-xs text-slate-400 line-clamp-2 h-8 leading-normal font-normal">{b.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 mt-6 border-t border-slate-800/50 relative z-10 leading-none">
                                <div>
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Fiyatlandırma</p>
                                    <p className="text-sm font-bold text-blue-400 tracking-tight">{b.price > 0 ? `${b.price} TL` : 'Ücretsiz'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Aktif Lisans</p>
                                    <p className="text-sm font-bold text-slate-200 tracking-tight">{b.ownerCount || 0} <span className="text-[10px] text-slate-500 font-medium">Lisans</span></p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && editingBot && (
                <div className="fixed inset-0 z-[110] bg-black/95 flex items-end lg:items-center justify-center p-0 lg:p-8 backdrop-blur-3xl animate-in slide-in-from-bottom lg:fade-in">
                    <div className="bg-[#020617] border-t lg:border border-white/10 rounded-t-[40px] lg:rounded-[64px] w-full max-w-7xl h-[94vh] lg:h-[90vh] flex flex-col lg:flex-row overflow-hidden  relative">
                        
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 lg:top-8 lg:right-8 z-[120] p-3 lg:p-4 bg-white/5 rounded-2xl hover:bg-red-600 transition-all active:scale-90">
                            <X size={20} />
                        </button>

                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="p-8 lg:p-12 pb-4 lg:pb-0 space-y-8">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-brand to-brand/80 rounded-[20px] flex items-center justify-center  rotate-3">
                                        <Cpu size={24} className="text-white"/>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl lg:text-3xl font-black uppercase italic tracking-tighter">Ürün <span className="text-brand">Atölyesi</span></h3>
                                        <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] mt-1 italic">V3.5 MOTORU</p>
                                    </div>
                                </div>

                                <div className="flex gap-2 bg-white/5 p-1.5 rounded-3xl border border-white/5">
                                    {['info', 'pricing', 'media'].map(tab => (
                                        <button 
                                            key={tab}
                                            onClick={() => setActiveTab(tab as any)}
                                            className={`flex-1 py-3 lg:py-4 rounded-[20px] lg:rounded-[22px] text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white  ' : 'text-slate-500 hover:bg-white/5'}`}
                                        >
                                            {tab === 'info' ? 'DETAY' : tab === 'pricing' ? 'LİSANS' : 'GALERİ'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-8 pb-32 lg:pb-12">
                                <form onSubmit={async (e) => { 
                                    e.preventDefault(); 
                                    setIsSaving(true);
                                    try {
                                        // Check for duplicate username
                                        const cleanLink = (editingBot.bot_link || '').trim().toLowerCase().replace(/^@/, '');
                                        if (cleanLink && cleanLink !== '') {
                                            const duplicate = bots.find(b => 
                                                b.id !== editingBot.id && 
                                                b.bot_link?.trim().toLowerCase().replace(/^@/, '') === cleanLink
                                            );
                                            if (duplicate) {
                                                const confirmSave = window.confirm(`⚠️ UYARI: '@${cleanLink}' kullanıcı adı zaten '${duplicate.name}' isimli bot tarafından kullanılıyor.\n\nYine de bu kullanıcı adıyla kaydetmek istiyor musunuz?`);
                                                if (!confirmSave) {
                                                    setIsSaving(false);
                                                    return;
                                                }
                                            }
                                        }

                                        await DatabaseService.saveBot(editingBot); 
                                        setSaveSuccess(true);
                                        setTimeout(() => setSaveSuccess(false), 3000);
                                        
                                        // Non-blocking log
                                        DatabaseService.logActivity('admin', 'bot_manage', 'bot_saved', 'Bot Kaydedildi', `${editingBot.name} isimli bot bilgileri güncellendi/oluşturuldu.`).catch(console.error);
                                        
                                        setTimeout(() => {
                                            setIsModalOpen(false); 
                                            load(); 
                                        }, 1000);
                                    } catch (err: any) {
                                        console.error("Bot save error:", err);
                                        alert("Bot kaydedilemedi: " + (err.message || "Bilinmeyen hata"));
                                    } finally {
                                        setIsSaving(false);
                                    }
                                }} className="space-y-8">
                                    {activeTab === 'info' && (
                                        <div className="space-y-8 animate-in slide-in-from-left-4">
                                            <div className="p-8 bg-brand/10 border border-brand/20 rounded-[32px] space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white"><Star size={16} /></div>
                                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-white italic">1. ADIM: ÜRÜN TİPİ SEÇİMİ</h4>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <button 
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingBot({
                                                                ...editingBot, 
                                                                product_type: 'app',
                                                                category: ['apps']
                                                            });
                                                        }}
                                                        className={`py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${editingBot.product_type === 'app' || (editingBot.category || []).includes('apps') ? 'bg-brand border-brand text-white' : 'bg-slate-950 border-white/5 text-slate-500 hover:bg-white/5'}`}
                                                    >
                                                        UYGULAMA (APP)
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingBot({
                                                                ...editingBot, 
                                                                product_type: 'bot',
                                                                category: ['utilities']
                                                            });
                                                        }}
                                                        className={`py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${editingBot.product_type === 'bot' && !(editingBot.category || []).includes('apps') ? 'bg-brand border-brand text-white' : 'bg-slate-950 border-white/5 text-slate-500 hover:bg-white/5'}`}
                                                    >
                                                        TELEGRAM BOTU
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4">SİSTEM ID</label>
                                                    <div className="relative group">
                                                        <input type="text" value={editingBot.id} readOnly className="w-full h-14 lg:h-18 bg-slate-950 border border-white/5 rounded-[22px] lg:rounded-[28px] px-8 text-[11px] font-black text-slate-600 outline-none uppercase italic" />
                                                        <button type="button" onClick={copyId} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/5 rounded-xl hover:bg-brand text-slate-500 hover:text-white transition-all">
                                                            {copiedId ? <Check size={14} /> : <Copy size={14} />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <AdminInput label="BOT İSMİ" value={editingBot.name} onChange={(v:any)=>setEditingBot({...editingBot, name:v})} />
                                                
                                                <div className="space-y-2">
                                                    <AdminInput label="@KULLANICIADI" value={editingBot.bot_link} onChange={(v:any)=>setEditingBot({...editingBot, bot_link:v})} />
                                                    {(() => {
                                                        const cleanLink = (editingBot.bot_link || '').trim().toLowerCase().replace(/^@/, '');
                                                        if (cleanLink && cleanLink !== '') {
                                                            const duplicate = bots.find(b => 
                                                                b.id !== editingBot.id && 
                                                                b.bot_link?.toLowerCase().replace(/^@/, '') === cleanLink
                                                            );
                                                            if (duplicate) {
                                                                return (
                                                                    <div className="mx-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-amber-500">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                                                        <p className="text-[10px] font-semibold leading-snug uppercase tracking-tight">
                                                                            ⚠️ UYARI: BU @KULLANICIADI ZATEN '${duplicate.name}' TARAFINDAN KULLANILIYOR!
                                                                        </p>
                                                                    </div>
                                                                );
                                                            }
                                                        }
                                                        return null;
                                                    })()}
                                                </div>
                                                <div className="space-y-4 md:col-span-2">
                                                    <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4 px-4 py-2 bg-slate-900 rounded-full inline-block">
                                                        2. ADIM: {(editingBot.product_type === 'app' || (editingBot.category || []).includes('apps')) ? 'APP KATEGORİSİ' : 'BOT KATEGORİSİ'} SEÇİMİ
                                                    </label>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-6 bg-slate-950 border border-white/5 rounded-[28px] lg:rounded-[36px]">
                                                        {((editingBot.product_type === 'app' || (editingBot.category || []).includes('apps')) 
                                                            ? [
                                                                { id: 'apps', label: 'Ana Uygulama', icon: BotIcon },
                                                                ...appsSubCategories
                                                              ]
                                                            : categories.filter(c => c.id !== 'all' && c.id !== 'apps')
                                                                                                                ).map((cat: any) => {
                                                            const isSelected = (editingBot.category || []).includes(cat.id);
                                                            const labelMap: Record<string, string> = {
                                                                'all': 'Hepsi',
                                                                'cat_all': 'Hepsi',
                                                                'apps': 'Uygulamalar',
                                                                'cat_apps': 'Uygulamalar',
                                                                'apps_cat_trending': 'Trendler',
                                                                'apps_cat_editors_choice': 'Editörün Seçimi',
                                                                'apps_cat_new': 'Yeni',
                                                                'apps_cat_games': 'Oyunlar',
                                                                'apps_cat_tma_bots': 'Telegram Platformu',
                                                                'apps_cat_ton_sites': 'TON Siteleri',
                                                                'apps_cat_ai': 'Yapay Zeka',
                                                                'apps_cat_web3': 'Web3 Genel',
                                                                'apps_cat_earn': 'Kazan',
                                                                'apps_cat_tap_to_earn': 'Tıkla Kazan',
                                                                'apps_cat_trade': 'Ticaret',
                                                                'apps_cat_art': 'Sanat',
                                                                'apps_cat_social': 'Sosyal',
                                                                'apps_cat_dev': 'Geliştirici',
                                                                'apps_cat_saas': 'SaaS',
                                                                'apps_cat_security': 'Güvenlik & Gizlilik',
                                                                'cat_games': 'Oyunlar',
                                                                'cat_finance': 'Finans',
                                                                'cat_moderation': 'Moderasyon',
                                                                'cat_utilities': 'Araçlar',
                                                                'cat_ai_services': 'AI Hizmetleri',
                                                                'cat_communication': 'İletişim',
                                                                'cat_productivity': 'Üretkenlik',
                                                                'cat_music': 'Müzik',
                                                                'cat_crypto': 'Kripto',
                                                                'cat_telegram_platform': 'Telegram Platformu',
                                                                'cat_bloggers': 'Bloggerlar',
                                                                'cat_shopping': 'Alışveriş',
                                                                'cat_security': 'Güvenlik',
                                                                'cat_education': 'Eğitim',
                                                                'cat_content': 'İçerik',
                                                                'games': 'Oyunlar',
                                                                'finance': 'Finans',
                                                                'moderation': 'Moderasyon',
                                                                'utilities': 'Araçlar',
                                                                'ai_services': 'AI Hizmetleri',
                                                                'communication': 'İletişim',
                                                                'productivity': 'Üretkenlik',
                                                                'music': 'Müzik',
                                                                'crypto': 'Kripto',
                                                                'telegram_platform': 'Telegram Platformu',
                                                                'bloggers': 'Bloggerlar',
                                                                'shopping': 'Alışveriş',
                                                                'security': 'Güvenlik',
                                                                'education': 'Eğitim',
                                                                'content': 'İçerik',
                                                                'trending': 'Trendler',
                                                                'editors_choice': 'Editörün Seçimi',
                                                                'new': 'Yeni',
                                                                'games_sub': 'Oyunlar',
                                                                'tma_bots': 'Telegram Platformu',
                                                                'ton_sites': 'TON Siteleri',
                                                                'ai_sub': 'Yapay Zeka',
                                                                'web3_general': 'Web3 Genel',
                                                                'earn': 'Kazan',
                                                                'tap_to_earn': 'Tıkla Kazan',
                                                                'trade': 'Ticaret',
                                                                'art': 'Sanat',
                                                                'social': 'Sosyal',
                                                                'dev': 'Geliştirici',
                                                                'saas': 'SaaS',
                                                                'security_privacy': 'Güvenlik & Gizlilik'
                                                            };
                                                            return (
                                                                <button
                                                                    key={cat.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const current = Array.isArray(editingBot.category) ? editingBot.category : [editingBot.category || 'utilities'];
                                                                        const next = isSelected 
                                                                            ? current.filter((id: string) => id !== cat.id)
                                                                            : [...current, cat.id];
                                                                        setEditingBot({ ...editingBot, category: next });
                                                                    }}
                                                                    className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-[9px] font-black tracking-widest transition-all border ${isSelected ? 'bg-brand border-brand text-white ' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}
                                                                >
                                                                    <cat.icon size={16} className={isSelected ? 'text-white' : 'text-slate-600'} />
                                                                    <span className="uppercase italic truncate">{labelMap[cat.label] || labelMap[cat.id] || cat.label?.replace('cat_', '')?.replace('apps_cat_', '') || cat.label}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4">DESTEKLENEN DİLLER</label>
                                                    <div className="flex flex-wrap gap-2 p-4 bg-slate-950 border border-white/5 rounded-[22px] lg:rounded-[28px]">
                                                        {['🇬🇧', '🇷🇺', '🇮🇷', '🇮🇳', '🇪🇸', '🇹🇷'].map(lang => (
                                                            <button
                                                                key={lang}
                                                                type="button"
                                                                onClick={() => {
                                                                    const current = editingBot.languages || [];
                                                                    const next = current.includes(lang) 
                                                                        ? current.filter((l: string) => l !== lang)
                                                                        : [...current, lang];
                                                                    setEditingBot({ ...editingBot, languages: next });
                                                                }}
                                                                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${
                                                                    (editingBot.languages || []).includes(lang)
                                                                    ? 'bg-brand text-white '
                                                                    : 'bg-white/5 text-slate-500 hover:bg-white/10'
                                                                }`}
                                                            >
                                                                {lang}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 md:col-span-2">
                                                    <AdminInput label="TELEGRAM GRUP (@)" value={editingBot.telegram_group || ''} onChange={(v:any)=>setEditingBot({...editingBot, telegram_group:v})} placeholder="@groupname" />
                                                    <AdminInput label="WEB SİTE URL" value={editingBot.website_url || ''} onChange={(v:any)=>setEditingBot({...editingBot, website_url:v})} placeholder="https://..." />
                                                    <AdminInput label="APP URL" value={editingBot.app_url || ''} onChange={(v:any)=>setEditingBot({...editingBot, app_url:v})} placeholder="https://..." />
                                                    <AdminInput label="GITHUB URL" value={editingBot.github_url || ''} onChange={(v:any)=>setEditingBot({...editingBot, github_url:v})} placeholder="https://github.com/..." />
                                                    <AdminInput label="YOUTUBE URL" value={editingBot.youtube_url || ''} onChange={(v:any)=>setEditingBot({...editingBot, youtube_url:v})} placeholder="https://youtube.com/..." />
                                                    <AdminInput label="X / TWITTER URL" value={editingBot.x_url || ''} onChange={(v:any)=>setEditingBot({...editingBot, x_url:v})} placeholder="https://x.com/..." />
                                                    <AdminInput label="SOSYAL MEDYA URL" value={editingBot.social_url || ''} onChange={(v:any)=>setEditingBot({...editingBot, social_url:v})} placeholder="https://..." />
                                                    <AdminInput label="ANDROID CİHAZ LİNKİ (PLAY STORE)" value={editingBot.android_url || ''} onChange={(v:any)=>setEditingBot({...editingBot, android_url:v})} placeholder="https://play.google.com/..." />
                                                    <AdminInput label="IOS CİHAZ LİNKİ (APP STORE)" value={editingBot.ios_url || ''} onChange={(v:any)=>setEditingBot({...editingBot, ios_url:v})} placeholder="https://apps.apple.com/..." />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4">MARKET AÇIKLAMASI</label>
                                                <textarea value={editingBot.description} onChange={e => setEditingBot({...editingBot, description: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-8 rounded-[36px] lg:rounded-[44px] text-[11px] font-black h-32 lg:h-40 outline-none text-slate-400 focus:border-brand/30 uppercase italic leading-relaxed" />
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === 'pricing' && (
                                        <div className="space-y-8 animate-in slide-in-from-left-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <AdminInput label="LİSANS TUTARI (TRY)" type="number" value={editingBot.price} onChange={(v:any)=>setEditingBot({...editingBot, price:v})} />
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4">PLATFORM STATÜSÜ</label>
                                                    <button type="button" onClick={()=>setEditingBot({...editingBot, is_official: !editingBot.is_official})} className={`w-full h-14 lg:h-18 rounded-[22px] lg:rounded-[28px] flex items-center justify-center gap-3 transition-all font-black text-[10px] tracking-widest ${editingBot.is_official ? 'bg-brand text-white  ' : 'bg-slate-950 text-slate-600 border border-white/5'}`}>
                                                        {editingBot.is_official ? 'BİZE AİT (OFFICIAL)' : 'HARİCİ (EXTERNAL)'}
                                                    </button>
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4">ANA SAYFA VİTRİN SEÇENEĞİ</label>
                                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-[28px] border border-white/5">
                                                        {[
                                                            { id: 'none', label: 'YOK' },
                                                            { id: 'latest', label: 'EN SON EKLENENLER' },
                                                            { id: 'official', label: 'ORJİNAL' },
                                                            { id: 'featured', label: 'ÖNE ÇIKARILANLAR' }
                                                        ].map(opt => (
                                                            <button
                                                                key={opt.id}
                                                                type="button"
                                                                onClick={() => setEditingBot({ ...editingBot, promoted_type: opt.id })}
                                                                className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                                                    (editingBot.promoted_type || 'none') === opt.id
                                                                    ? 'bg-brand text-white '
                                                                    : 'bg-white/5 text-slate-500 hover:bg-white/10'
                                                                }`}
                                                            >
                                                                {opt.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === 'media' && (
                                        <div className="space-y-8 animate-in slide-in-from-left-4">
                                            <div className="space-y-6">
                                                <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4">VARLIKLAR (URL)</label>
                                                <div className="flex gap-3">
                                                    <input type="text" id="scr_input" placeholder="https://cdn.example.com/..." className="flex-1 h-14 lg:h-16 bg-slate-950 border border-white/5 rounded-2xl px-6 text-[10px] text-white outline-none italic font-black" />
                                                    <button type="button" onClick={() => { const inp = document.getElementById('scr_input') as HTMLInputElement; handleScreenshotAdd(inp.value); inp.value = ''; }} className="h-14 lg:h-16 px-8 bg-brand text-white rounded-2xl font-black text-[10px] uppercase tracking-widest ">EKLE</button>
                                                </div>
                                                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 px-2">
                                                    {(editingBot.screenshots || []).map((url: string, idx: number) => (
                                                        <div key={idx} className="relative w-28 lg:w-32 h-44 lg:h-52 shrink-0 bg-slate-950 rounded-2xl lg:rounded-[28px] border border-white/5 overflow-hidden group ">
                                                            <img src={url} className="w-full h-full object-cover transition-all group-hover:scale-110" />
                                                            <div className="absolute inset-0 bg-red-600/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer" onClick={() => removeScreenshot(idx)}>
                                                                <Trash2 size={24} className="text-white" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="fixed lg:relative bottom-0 left-0 right-0 p-6 lg:p-0 bg-gradient-to-t from-[#020617] lg:from-transparent via-[#020617]/90 lg:via-transparent to-transparent z-[130]">
                                        <button 
                                            type="submit" 
                                            disabled={isSaving}
                                            className="w-full h-16 lg:h-24 bg-brand text-white rounded-2xl lg:rounded-[32px] font-black text-[12px] uppercase tracking-[0.4em] transition-all border-b-8 border-blue-800 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-1 active:border-b-4 flex items-center justify-center gap-4"
                                        >
                                            {isSaving? (
                                                <><Loader2 className="animate-spin" size={20} /> İŞLENİYOR...</>
                                            ) : saveSuccess ? (
                                                <><CheckCircle2 size={20} className="text-emerald-400" /> SİSTEME İŞLENDİ!</>
                                            ) : (
                                                <><Database size={20} /> SİSTEMİ GÜNCELLE</>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const UserDetailModal = ({ user, onClose, onUpdate }: { user: User, onClose: () => void, onUpdate: () => void }) => {
    const [channels, setChannels] = useState<any[]>([]);
    const [bots, setBots] = useState<any[]>([]);
    const [wallet, setWallet] = useState<any>(null);
    const [stats, setStats] = useState<any[]>([]);
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'channels' | 'bots' | 'wallet' | 'stats' | 'logs'>('overview');
    const [isSavingWallet, setIsSavingWallet] = useState(false);

    const loadDetails = useCallback(async () => {
        setIsLoading(true);
        try {
            const [c, b, w, s, l] = await Promise.all([
                DatabaseService.getChannels(user.id),
                DatabaseService.getUserBots(user.id),
                DatabaseService.getUserWallet(user.id),
                DatabaseService.getPromotionChannelStats(user.id),
                DatabaseService.getActivityLogs(user.id)
            ]);
            setChannels(c);
            setBots(b);
            setWallet(w);
            setStats(s);
            setLogs(l);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [user.id]);

    useEffect(() => { loadDetails(); }, [loadDetails]);

    const toggleBotStatus = async (bot: any) => {
        try {
            await DatabaseService.updateUserBot(bot.ownership_id, { is_active: !bot.isActive });
            loadDetails();
        } catch (e) { alert("Hata oluştu"); }
    };

    const toggleBotPremium = async (bot: any) => {
        try {
            await DatabaseService.updateUserBot(bot.ownership_id, { is_premium: !bot.is_premium });
            loadDetails();
        } catch (e) { alert("Hata oluştu"); }
    };

    const toggleRestriction = async () => {
        try {
            const newStatus = !user.isRestricted;
            await DatabaseService.updateUserRestriction(user.id, newStatus);
            await DatabaseService.logActivity('admin', 'security', 'user_restriction_toggle', 'Kullanıcı Kısıtlaması Değiştirildi', `${user.username} kullanıcısının kısıtlama durumu ${newStatus ? 'AKTİF (Engellendi)' : 'PASİF (Kaldırıldı)'} olarak güncellendi.`);
            onUpdate();
            onClose();
        } catch (e) { alert("Hata oluştu"); }
    };

    const togglePublishStatus = async () => {
        try {
            const newStatus = !user.canPublishPromos;
            await DatabaseService.updateUserPublishStatus(user.id, newStatus);
            await DatabaseService.logActivity('admin', 'system', 'user_publish_status_toggle', 'Reklam Yayın Yetkisi Değiştirildi', `${user.username} kullanıcısının reklam yayınlama yetkisi ${newStatus ? 'VERİLDİ' : 'ALINDI'} olarak güncellendi.`);
            onUpdate();
            onClose();
        } catch (e) { alert("Hata oluştu"); }
    };

    const removeBot = async (bot: any) => {
        if (!confirm("Bu botu kullanıcının kütüphanesinden kaldırmak istediğinize emin misiniz?")) return;
        try {
            await DatabaseService.removeUserBotById(bot.ownership_id);
            loadDetails();
        } catch (e) { alert("Hata oluştu"); }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 lg:p-10">
            <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl" onClick={onClose}></div>
            <div className="relative w-full max-w-5xl bg-slate-900 border border-white/10 rounded-[44px] lg:rounded-[64px] overflow-hidden  flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 lg:p-12 border-b border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <img src={user.avatar} className="w-16 h-16 lg:w-24 lg:h-24 rounded-[24px] lg:rounded-[32px] object-cover border border-white/10 " />
                            <div className={`absolute -bottom-2 -right-2 w-6 h-6 lg:w-8 lg:h-8 rounded-full border-4 border-slate-900 flex items-center justify-center ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-500'}`}>
                                <CheckCircle2 size={12} className="text-white" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl lg:text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">{user.name}</h2>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">@{user.username}</span>
                                <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded bg-white/5 border border-white/5 uppercase tracking-widest ${user.role === 'Admin' ? 'text-blue-500' : 'text-slate-500'}`}>{user.role}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={async () => {
                                if (confirm(`DİKKAT: @${user.username} kullanıcısını ve kullanıcıya ait TÜM verileri (kanallar, botlar, cüzdan, işlemler vb.) silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
                                    try {
                                        await DatabaseService.deleteUser(user.id);
                                        await DatabaseService.logActivity('admin', 'system', 'user_deleted', 'Kullanıcı Silindi', `${user.username} kullanıcısı ve tüm verileri sistemden kalıcı olarak silindi.`);
                                        alert("Kullanıcı başarıyla silindi.");
                                        onUpdate();
                                        onClose();
                                    } catch (e) {
                                        alert("Hata oluştu: " + (e as any).message);
                                    }
                                }
                            }} 
                            className="w-12 h-12 lg:w-16 lg:h-16 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl lg:rounded-[24px] flex items-center justify-center transition-all"
                            title="Kullanıcıyı Sil"
                        >
                            <Trash2 size={24} />
                        </button>
                        <button onClick={onClose} className="w-12 h-12 lg:w-16 lg:h-16 bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white rounded-2xl lg:rounded-[24px] flex items-center justify-center transition-all">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex px-8 lg:px-12 border-b border-white/5 gap-8 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'overview', label: 'GENEL BAKIŞ', icon: LayoutDashboard },
                        { id: 'channels', label: 'KANALLAR', icon: Radio },
                        { id: 'bots', label: 'BOTLAR', icon: BotIcon },
                        { id: 'wallet', label: 'CÜZDAN', icon: Wallet },
                        { id: 'stats', label: 'İSTATİSTİK', icon: BarChart3 },
                        { id: 'logs', label: 'HAREKETLER', icon: History }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`py-6 lg:py-8 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 transition-all border-b-2 ${activeTab === tab.id ? 'text-blue-500 border-blue-500' : 'text-slate-600 border-transparent hover:text-slate-400'}`}
                        >
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="animate-spin text-blue-500" size={32} />
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Veriler Çekiliyor...</span>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4">
                            {activeTab === 'overview' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-slate-950/50 border border-white/5 p-6 lg:p-8 rounded-[32px] space-y-4">
                        <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic">İletişim Bilgileri</p>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-500 uppercase font-bold">E-Posta</span>
                                <span className="text-[11px] text-white font-black italic truncate ml-4">{user.email || 'Belirtilmemiş'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-500 uppercase font-bold">Telefon</span>
                                <span className="text-[11px] text-white font-black italic">{user.phone || 'Belirtilmemiş'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-950/50 border border-white/5 p-6 lg:p-8 rounded-[32px] space-y-4">
                        <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic">Hesap Durumu</p>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-500 uppercase font-bold">Kayıt Tarihi</span>
                                <span className="text-[11px] text-white font-black italic">{new Date(user.joinDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-500 uppercase font-bold">Kısıtlama</span>
                                <span className={`text-[11px] font-black italic ${user.isRestricted ? 'text-red-500' : 'text-emerald-500'}`}>{user.isRestricted ? 'KISITLI' : 'YOK'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-950/50 border border-white/5 p-6 lg:p-8 rounded-[32px] space-y-4">
                        <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic">Varlık Özeti</p>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-500 uppercase font-bold">Toplam Kanal</span>
                                <span className="text-[11px] text-white font-black italic">{channels.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-500 uppercase font-bold">Sahip Olunan Bot</span>
                                <span className="text-[11px] text-white font-black italic">{bots.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-950/50 border border-white/5 p-6 lg:p-8 rounded-[32px] space-y-6 lg:col-span-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic mb-1">Hızlı İşlemler</p>
                                <h4 className="text-sm font-black text-white uppercase italic">Hesap Yönetimi</h4>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button 
                                onClick={toggleRestriction}
                                className={`flex items-center justify-between p-5 lg:p-6 rounded-2xl border transition-all ${user.isRestricted ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${user.isRestricted ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                                        {user.isRestricted ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black uppercase italic">{user.isRestricted ? 'Kısıtlamayı Kaldır' : 'Kullanıcıyı Kısıtla'}</p>
                                        <p className="text-[8px] font-bold opacity-60 uppercase tracking-widest">{user.isRestricted ? 'Kullanıcı tüm yetkilerine geri döner' : 'Kullanıcının platform erişimi kısıtlanır'}</p>
                                    </div>
                                </div>
                            </button>

                            <button 
                                onClick={togglePublishStatus}
                                className={`flex items-center justify-between p-5 lg:p-6 rounded-2xl border transition-all ${user.canPublishPromos ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-slate-800 border-white/5 text-slate-500'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${user.canPublishPromos ? 'bg-blue-500/20' : 'bg-slate-900'}`}>
                                        <Megaphone size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black uppercase italic">{user.canPublishPromos ? 'Reklam Yetkisini Al' : 'Reklam Yetkisi Ver'}</p>
                                        <p className="text-[8px] font-bold opacity-60 uppercase tracking-widest">{user.canPublishPromos ? 'Kullanıcı artık reklam yayınlayamaz' : 'Kullanıcı platformda reklam yayınlayabilir'}</p>
                                    </div>
                                </div>
                            </button>

                            <div className="bg-slate-950/50 border border-white/5 p-5 lg:p-6 rounded-2xl lg:col-span-2 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-purple-600/10 rounded-xl flex items-center justify-center text-purple-500">
                                            <Key size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase italic">Kullanıcı Paneli Erişimi</p>
                                            <p className="text-[8px] font-bold opacity-60 uppercase tracking-widest">Özel yönetim paneli giriş yetkisi</p>
                                        </div>
                                    </div>
                                    {user.hasPanelAccess && (
                                        <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/20">AKTİF</span>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input 
                                        type="text" 
                                        placeholder="Panel Şifresi Belirle..." 
                                        id="panelPasswordInput"
                                        className="flex-1 h-12 bg-slate-900 border border-white/5 rounded-xl px-4 text-[10px] font-black text-white outline-none focus:border-purple-500 italic"
                                     />
                                    <button 
                                        onClick={async () => {
                                            const input = document.getElementById('panelPasswordInput') as HTMLInputElement;
                                            if (!input.value) return alert("Şifre giriniz");
                                            try {
                                                await DatabaseService.grantPanelAccess(user.id, input.value);
                                                await DatabaseService.logActivity('admin', 'system', 'panel_access_granted', 'Panel Erişimi Verildi', `${user.username} kullanıcısına panel erişimi ve şifre tanımlandı.`);
                                                alert("Panel erişimi başarıyla tanımlandı.");
                                                onUpdate();
                                                onClose();
                                            } catch (e) { alert("Hata oluştu"); }
                                        }}
                                        className="h-12 px-6 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                                    >
                                        YETKİ VER
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                                </div>
                            )}

                            {activeTab === 'channels' && (
                                <div className="space-y-4">
                                    {channels.length === 0 ? (
                                        <div className="py-20 text-center bg-slate-950/30 rounded-[32px] border-2 border-dashed border-slate-900">
                                            <Radio size={40} className="mx-auto text-slate-600 mb-4" />
                                            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Henüz kanal eklenmemiş</p>
                                        </div>
                                    ) : (
                                        channels.map(channel => (
                                            <div key={channel.id} className="bg-slate-950/50 border border-white/5 p-6 rounded-[28px] flex items-center justify-between group hover:border-white/10 transition-all">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-500 ">
                                                        <Radio size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-white uppercase italic tracking-tight">{channel.name}</h4>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">ID: {channel.telegram_id}</span>
                                                            <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
                                                            <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest italic">{channel.memberCount.toLocaleString()} ÜYE</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${channel.revenueEnabled ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-white/5'}`}>
                                                        {channel.revenueEnabled ? 'GELİR AKTİF' : 'GELİR PASİF'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === 'bots' && (
                                <div className="space-y-4">
                                    {bots.length === 0 ? (
                                        <div className="py-20 text-center bg-slate-950/30 rounded-[32px] border-2 border-dashed border-slate-900">
                                            <BotIcon size={40} className="mx-auto text-slate-600 mb-4" />
                                            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Henüz bot edinilmemiş</p>
                                        </div>
                                    ) : (
                                        bots.map(bot => (
                                            <div key={bot.id} className="bg-slate-950/50 border border-white/5 p-6 rounded-[28px] flex flex-col lg:flex-row lg:items-center justify-between gap-6 group hover:border-white/10 transition-all">
                                                <div className="flex items-center gap-5">
                                                    <img src={bot.icon || getLiveBotIcon(bot.bot_link)} className="w-14 h-14 rounded-2xl object-cover border border-white/5 " />
                                                    <div>
                                                        <h4 className="text-sm font-black text-white uppercase italic tracking-tight">{bot.name}</h4>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded bg-white/5 border border-white/5 uppercase tracking-widest ${bot.is_premium ? 'text-blue-500' : 'text-slate-500'}`}>
                                                                {bot.is_premium ? 'PREMIUM' : 'STANDART'}
                                                            </span>
                                                            <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
                                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">SKT: {bot.expiryDate ? new Date(bot.expiryDate).toLocaleDateString() : 'SÜRESİZ'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => toggleBotStatus(bot)}
                                                        className={`h-10 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${bot.isActive ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-500' : 'bg-slate-800 border-white/5 text-slate-500'}`}
                                                    >
                                                        {bot.isActive ? 'DURDUR' : 'BAŞLAT'}
                                                    </button>
                                                    <button 
                                                        onClick={() => toggleBotPremium(bot)}
                                                        className={`h-10 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${bot.is_premium ? 'bg-blue-600/10 border-blue-500/20 text-blue-500' : 'bg-slate-800 border-white/5 text-slate-500'}`}
                                                    >
                                                        PREMIUM
                                                    </button>
                                                    <button 
                                                        onClick={() => removeBot(bot)}
                                                        className="h-10 w-10 flex items-center justify-center bg-red-600/10 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === 'wallet' && wallet && (
                                <div className="space-y-8 animate-in slide-in-from-bottom-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-slate-950/50 border border-white/5 p-8 rounded-[32px] space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500">
                                                    <Wallet size={20} />
                                                </div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Cüzdan Bakiyesi</p>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <div className="relative">
                                                    <input 
                                                        type="number" 
                                                        value={wallet.balance} 
                                                        onChange={(e) => setWallet({...wallet, balance: parseFloat(e.target.value)})}
                                                        className="w-full h-16 bg-slate-900 border border-white/5 rounded-2xl px-6 text-xl font-black text-white outline-none focus:border-blue-500 italic"
                                                    />
                                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-600 uppercase italic">TRY</span>
                                                </div>
                                                <p className="text-[9px] text-slate-600 font-bold uppercase italic px-2">Kullanıcının harcayabileceği veya çekebileceği güncel bakiye.</p>
                                            </div>
                                        </div>

                                        <div className="bg-slate-950/50 border border-white/5 p-8 rounded-[32px] space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-emerald-600/10 rounded-xl flex items-center justify-center text-emerald-500">
                                                    <TrendingUp size={20} />
                                                </div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Toplam Gelir</p>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <div className="relative">
                                                    <input 
                                                        type="number" 
                                                        value={wallet.total_earned} 
                                                        onChange={(e) => setWallet({...wallet, total_earned: parseFloat(e.target.value)})}
                                                        className="w-full h-16 bg-slate-900 border border-white/5 rounded-2xl px-6 text-xl font-black text-white outline-none focus:border-emerald-500 italic"
                                                    />
                                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-600 uppercase italic">TRY</span>
                                                </div>
                                                <p className="text-[9px] text-slate-600 font-bold uppercase italic px-2">Kullanıcının platform üzerinden elde ettiği tüm zamanların toplam geliri.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button 
                                            onClick={async () => {
                                                setIsSavingWallet(true);
                                                try {
                                                    await DatabaseService.updateUserWallet(user.id, {
                                                        balance: wallet.balance,
                                                        total_earned: wallet.total_earned
                                                    });
                                                    await DatabaseService.logActivity('admin', 'payment', 'wallet_updated', 'Cüzdan Güncellendi', `${user.username} cüzdan bilgileri admin tarafından güncellendi.`);
                                                    alert("Cüzdan başarıyla güncellendi.");
                                                } catch (e) {
                                                    alert("Hata oluştu");
                                                } finally {
                                                    setIsSavingWallet(false);
                                                }
                                            }}
                                            disabled={isSavingWallet}
                                            className="px-10 py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest   transition-all flex items-center gap-3"
                                        >
                                            {isSavingWallet ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                            DEĞİŞİKLİKLERİ KAYDET
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'stats' && (
                                <div className="space-y-6 animate-in slide-in-from-bottom-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-slate-950/50 border border-white/5 p-6 rounded-3xl">
                                            <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic mb-2">Toplam Gösterim</p>
                                            <h4 className="text-2xl font-black text-white italic">{stats.reduce((acc, s) => acc + (s.views || 0), 0).toLocaleString()}</h4>
                                        </div>
                                        <div className="bg-slate-950/50 border border-white/5 p-6 rounded-3xl">
                                            <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic mb-2">Toplam Gelir</p>
                                            <h4 className="text-2xl font-black text-emerald-500 italic">₺{stats.reduce((acc, s) => acc + (s.revenue || 0), 0).toLocaleString()}</h4>
                                        </div>
                                        <div className="bg-slate-950/50 border border-white/5 p-6 rounded-3xl">
                                            <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic mb-2">Aktif Reklam Sayısı</p>
                                            <h4 className="text-2xl font-black text-blue-500 italic">{new Set(stats.map(s => s.promotion_id)).size}</h4>
                                        </div>
                                    </div>

                                    <div className="bg-slate-950/50 border border-white/5 rounded-[32px] overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-white/5 text-[8px] uppercase tracking-widest text-slate-700 font-black">
                                                <tr>
                                                    <th className="px-6 py-4">REKLAM</th>
                                                    <th className="px-6 py-4">KANAL</th>
                                                    <th className="px-6 py-4">GÖSTERİM</th>
                                                    <th className="px-6 py-4 text-right">GELİR</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {stats.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={4} className="px-6 py-12 text-center text-[10px] font-black text-slate-600 uppercase italic">Henüz veri bulunmuyor</td>
                                                    </tr>
                                                ) : (
                                                    stats.map((s, idx) => (
                                                        <tr key={idx} className="hover:bg-white/5 transition-all">
                                                            <td className="px-6 py-4">
                                                                <p className="text-[11px] font-black text-white uppercase italic truncate max-w-[150px]">
                                                                    {s.promotion?.title || 'Bilinmeyen Reklam'}
                                                                </p>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <p className="text-[10px] font-black text-slate-500 uppercase italic">
                                                                    {s.channel_name || 'Bilinmeyen Kanal'}
                                                                </p>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="text-[11px] font-black text-blue-500 italic">{s.views.toLocaleString()}</span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <span className="text-[11px] font-black text-emerald-500 italic">₺{s.revenue.toLocaleString()}</span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'logs' && (
                                <div className="space-y-4 animate-in slide-in-from-bottom-4">
                                    {logs.length === 0 ? (
                                        <div className="py-20 text-center bg-slate-950/30 rounded-[32px] border-2 border-dashed border-slate-900">
                                            <History size={40} className="mx-auto text-slate-600 mb-4" />
                                            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Henüz hareket kaydı yok</p>
                                        </div>
                                    ) : (
                                        <div className="relative pl-8 space-y-6 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/5">
                                            {logs.map(log => (
                                                <div key={log.id} className="relative group">
                                                    <div className="absolute -left-8 top-2 w-4 h-4 bg-[#020617] border-2 border-slate-800 rounded-full z-10 group-hover:border-blue-500 transition-colors"></div>
                                                    <div className="bg-slate-950/50 border border-white/5 p-5 rounded-2xl flex items-center gap-4 group-hover:border-white/10 transition-all ">
                                                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-500  group-hover:text-blue-500 transition-colors">
                                                            <Activity size={16} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="text-[11px] font-black text-white uppercase italic truncate">{log.title}</h4>
                                                                    <span className="text-[7px] font-black px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-slate-500 uppercase tracking-widest">{translateType(log.type)}</span>
                                                                </div>
                                                                <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">{new Date(log.created_at).toLocaleString()}</span>
                                                            </div>
                                                            <p className="text-[9px] text-slate-500 font-bold uppercase italic truncate opacity-80">{log.description}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        const data = await DatabaseService.getUsers();
        setUsers(data);
        setIsLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = users.filter(u => 
        (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (u.username || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight leading-none">Kullanıcı Kayıtları</h2>
                    <p className="text-xs text-slate-400 mt-1 leading-normal">Platform kullanıcılarını, yetkilerini ve kısıtlamalarını yönetin</p>
                </div>
                <div className="relative w-full sm:w-64 group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={16} />
                    <input 
                        type="text" 
                        placeholder="Kullanıcı ara..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        className="w-full h-11 bg-slate-950/70 border border-slate-800/80 rounded-xl pl-10 pr-4 text-xs font-normal text-white placeholder-slate-600 outline-none focus:border-blue-500 transition-all" 
                    />
                </div>
            </div>

            <div className="bg-[#101626]/40 border border-slate-800/60 rounded-xl overflow-hidden backdrop-blur-sm shadow-sm">
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#101a2e]/60 border-b border-slate-800 text-xs font-semibold text-slate-400">
                            <tr>
                                <th className="px-6 py-4">Kullanıcı</th>
                                <th className="px-6 py-4">Rol</th>
                                <th className="px-6 py-4">Hesap Durumu</th>
                                <th className="px-6 py-4 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                            {filtered.map(u => (
                                <tr key={u.id} className="hover:bg-[#121c30]/20 transition-colors text-slate-200">
                                    <td className="px-6 py-4 text-sm font-semibold text-white">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/15 flex items-center justify-center font-bold text-sm shadow-sm select-none">
                                                {u.username?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <span>@{u.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-semibold tracking-wide border ${u.role === 'Admin' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-slate-800/50 text-slate-300 border-slate-700/50'}`}>
                                            {u.role === 'Admin' ? 'Admin' : 'Üye'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                                                {u.status === 'Active' ? 'Aktif' : 'Pasif'}
                                            </span>
                                            {u.isRestricted && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-red-600/15 text-red-400 border border-red-500/15 select-none animate-pulse">
                                                    <ShieldAlert size={11} /> Kısıtlı
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => setSelectedUser(u)}
                                                className="px-3.5 py-1.5 bg-blue-500/10 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-semibold text-blue-400 transition-all border border-blue-500/10 text-center"
                                            >
                                                Yönet
                                            </button>
                                            <button 
                                                onClick={async () => {
                                                    if (confirm(`@${u.username} kullanıcısını ve tüm verilerini silmek istediğinizden emin misiniz?`)) {
                                                        try {
                                                            await DatabaseService.deleteUser(u.id);
                                                            await DatabaseService.logActivity('admin', 'system', 'user_deleted', 'Kullanıcı Silindi', `${u.username} kullanıcısı ve tüm verileri sistemden kalıcı olarak silindi.`);
                                                            load();
                                                        } catch (e) {
                                                            alert("Hata oluştu");
                                                        }
                                                    }
                                                }}
                                                className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg border border-red-500/10 hover:border-transparent transition-all"
                                                title="Sil"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                             ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden divide-y divide-slate-800/40">
                    {filtered.map(u => (
                        <div key={u.id} className="p-5 space-y-4 hover:bg-[#121c30]/10 transition-colors">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-base">
                                        {u.username?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">@{u.username}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{u.role === 'Admin' ? 'Admin' : 'Üye'}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1.5">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-500/20 border-red-500/10'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                                        {u.status === 'Active' ? 'Aktif' : 'Pasif'}
                                    </span>
                                    {u.isRestricted && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-600/15 text-red-400 border border-red-500/15 animate-pulse">
                                            Kısıtlı
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2.5 pt-1.5">
                                <button 
                                    onClick={() => setSelectedUser(u)}
                                    className="flex-1 py-2.5 bg-blue-500/10 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-semibold text-blue-400 transition-all border border-blue-500/10"
                                >
                                    Yönet
                                </button>
                                <button 
                                    onClick={async () => {
                                        if (confirm(`@${u.username} kullanıcısını silmek istediğinizden emin misiniz?`)) {
                                            try {
                                                await DatabaseService.deleteUser(u.id);
                                                load();
                                            } catch (e) { alert("Hata oluştu"); }
                                        }
                                    }}
                                    className="px-4 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-500/10"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedUser && (
                <UserDetailModal 
                    user={selectedUser} 
                    onClose={() => setSelectedUser(null)} 
                    onUpdate={load} 
                />
            )}
        </div>
    );
};

const SettingsManager = () => {
    const [settings, setSettings] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const load = useCallback(async () => {
        setIsLoading(true);
        const data = await DatabaseService.getSettings();
        setSettings(data);
        setIsLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const toggleMaintenance = async () => {
        if (!settings) return;
        setIsSaving(true);
        try {
            const newValue = !settings.maintenanceMode;
            await DatabaseService.updateSettings({ maintenance_mode: newValue });
            await DatabaseService.logActivity('admin', 'system', 'maintenance_toggle', 'Bakım Modu Değiştirildi', `Sistem bakım modu yönetici tarafından ${newValue ? 'AKTİF' : 'PASİF'} hale getirildi.`);
            setSettings({ ...settings, maintenanceMode: newValue });
            alert(`Bakım modu ${newValue ? 'etkinleştirildi' : 'devre dışı bırakıldı'}.`);
        } catch (e) {
            alert("Hata oluştu");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col gap-1">
                <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight leading-none">Sistem Ayarları</h2>
                <p className="text-xs text-slate-400 mt-1 leading-normal">Platform genel yapılandırmasını yönetin</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#101626]/40 border border-slate-800/60 p-6 rounded-2xl space-y-6 backdrop-blur-sm shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${settings?.maintenanceMode ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                            <AlertTriangle size={22} />
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-white">Bakım Modu</h4>
                            <p className="text-xs font-normal text-slate-500">Tüm kullanıcı erişimini kısıtlar</p>
                        </div>
                    </div>

                    <div className="p-5 bg-slate-950/40 rounded-xl border border-slate-800/80 space-y-5">
                        <p className="text-slate-400 text-xs font-normal leading-relaxed">
                            Bakım modu aktif edildiğinde, yöneticiler hariç tüm kullanıcılar "Hesap ve Panel Bakımdadır" bilgi ekranı ile karşılaşır. Kritik sistem güncellemeleri sırasında kullanılması önerilir.
                        </p>
                        
                        <button 
                            onClick={toggleMaintenance}
                            disabled={isSaving}
                            className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 h-11 ${
                                settings?.maintenanceMode 
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm' 
                                : 'bg-red-600 hover:bg-red-500 text-white shadow-sm'
                            }`}
                        >
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : (settings?.maintenanceMode ? <Check size={14} /> : <AlertTriangle size={14} />)}
                            {settings?.maintenanceMode ? 'Bakım Modunu Kapat' : 'Bakım Modunu Etkinleştir'}
                        </button>
                    </div>
                </div>

                <div className="bg-[#101626]/40 border border-slate-800/60 p-6 rounded-2xl space-y-6 backdrop-blur-sm shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center border bg-blue-500/10 border-blue-500/20 text-blue-400">
                            <Megaphone size={22} />
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-white">Görsel & Metin</h4>
                            <p className="text-xs font-normal text-slate-500">Versiyon yönetimi</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 tracking-tight ml-1">Uygulama Versiyonu</label>
                            <input 
                                type="text"
                                value={settings?.version || ''}
                                onChange={e => setSettings({ ...settings, version: e.target.value })}
                                className="w-full h-11 px-4 bg-slate-950/70 border border-slate-800/80 rounded-xl text-sm font-normal text-white placeholder-slate-600 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                                placeholder="ÖRN: V3.1.2"
                            />
                        </div>

                        <button 
                            onClick={async () => {
                                setIsSaving(true);
                                try {
                                    await DatabaseService.updateSettings({ 
                                        version: settings.version
                                    });
                                    await DatabaseService.logActivity('admin', 'system', 'settings_update', 'Sistem Ayarları Güncellendi', `Sistem ayarları ve versiyon bilgisi (${settings.version}) yönetici tarafından güncellendi.`);
                                    alert("Ayarlar başarıyla kaydedildi.");
                                } catch (e) {
                                    alert("Hata oluştu");
                                } finally {
                                    setIsSaving(false);
                                }
                            }}
                            disabled={isSaving}
                            className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Ayarları Güncelle
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ActivityCenter = ({ filterType }: { filterType: 'admin' | 'user' }) => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTypeFilter, setActiveTypeFilter] = useState<string>('all');
    const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

    useEffect(() => { 
        setIsLoading(true);
        DatabaseService.getActivityLogs().then(data => { 
            setLogs(data); 
            setIsLoading(false); 
        }); 
    }, [filterType]);

    const typeColors: any = { 
        payment: 'text-emerald-500', 
        bot_manage: 'text-blue-500', 
        security: 'text-red-500', 
        system: 'text-slate-500',
        auth: 'text-purple-500',
        channel_sync: 'text-orange-500'
    };

    const filteredLogs = logs.filter(log => {
        // First filter by Admin vs User
        const isAdminLog = log.user_id === 'admin';
        if (filterType === 'admin' && !isAdminLog) return false;
        if (filterType === 'user' && isAdminLog) return false;

        // Then filter by search query (User ID or Action Key or Title or Name)
        const q = searchQuery.toLowerCase();
        const matchesSearch = 
            log.user_id.toLowerCase().includes(q) ||
            log.action_key.toLowerCase().includes(q) ||
            log.title.toLowerCase().includes(q) ||
            log.description.toLowerCase().includes(q) ||
            log.user?.name?.toLowerCase().includes(q) ||
            log.user?.username?.toLowerCase().includes(q);
        
        if (!matchesSearch) return false;

        // Then filter by type
        if (activeTypeFilter !== 'all' && log.type !== activeTypeFilter) return false;

        return true;
    });

    const types = ['all', ...Array.from(new Set(logs.map(l => l.type)))];

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight leading-none">
                        {filterType === 'admin' ? 'Yönetici' : 'Üye'} Logları
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 leading-normal">
                        {filterType === 'admin' ? 'Yönetici işlemlerini ve sistem modifikasyonlarını takip edin' : 'Kullanıcı hareketlerini ve platform entegrasyonlarını izleyin'}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative group w-full sm:w-64">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={16} />
                        <input 
                            type="text"
                            placeholder="Kullanıcı veya işlem arayın..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-11 bg-slate-950/70 border border-slate-800/80 rounded-xl pl-10 pr-4 text-xs font-normal text-white placeholder-slate-600 outline-none focus:border-blue-500 transition-all"
                        />
                    </div>
                    
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                        {types.map(t => (
                            <button
                                key={t}
                                onClick={() => setActiveTypeFilter(t)}
                                className={`px-4 h-11 rounded-xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap border ${
                                    activeTypeFilter === t 
                                    ? 'bg-blue-600/10 border-blue-500/20 text-blue-400 shadow-sm' 
                                    : 'bg-[#101626]/40 border-slate-800/80 text-slate-400 hover:text-white'
                                }`}
                            >
                                {translateType(t)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                    <span className="text-xs text-slate-500 font-medium italic">Sistem logları taranıyor...</span>
                </div>
            ) : filteredLogs.length === 0 ? (
                <div className="py-24 text-center bg-[#101626]/20 rounded-xl border border-dashed border-slate-800/80">
                    <History size={40} className="mx-auto text-slate-600 mb-3" />
                    <p className="text-slate-400 text-sm font-semibold">Log kaydı bulunamadı</p>
                    <p className="text-xs text-slate-500 mt-1">Arama terimini değiştirmeyi veya farklı bir filtre seçmeyi deneyin.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredLogs.map(log => (
                        <div 
                            key={log.id} 
                            onClick={() => setSelectedLog(log)}
                            className="bg-[#101626]/40 border border-slate-800/60 p-5 rounded-2xl flex items-center gap-5 group hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden cursor-pointer select-none shadow-sm"
                        >
                            <div className={`w-10 h-10 shrink-0 bg-slate-900 border border-slate-800/50 rounded-xl flex items-center justify-center ${typeColors[log.type] || 'text-white'} `}><Activity size={18} /></div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1 gap-1 leading-none">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="font-bold text-slate-200 text-sm truncate max-w-[250px] group-hover:text-blue-400 transition-colors">{log.title}</h4>
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-900/80 border border-slate-800 ${typeColors[log.type] || 'text-slate-500'}`}>{translateType(log.type)}</span>
                                    </div>
                                    <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5 self-start sm:self-center">
                                        <Clock size={11} className="text-slate-600" /> {new Date(log.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-slate-400 text-xs font-normal truncate mt-1">{log.description}</p>
                                <div className="flex items-center gap-4 mt-3">
                                    <div className="flex items-center gap-1.5 leading-none">
                                        <Users size={11} className="text-slate-650" />
                                        <span className="text-[11px] font-medium text-slate-550">
                                            {log.user?.name ? `${log.user.name} (@${log.user.username})` : `Kullanıcı ID: ${log.user_id}`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 leading-none">
                                        <Zap size={11} className="text-slate-650" />
                                        <span className="text-[11px] font-medium text-slate-550">İşlem: {log.action_key}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedLog && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedLog(null)}></div>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative w-full max-w-lg bg-[#0e121e] border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
                    >
                        <div className="p-5 border-b border-slate-800/60 flex items-center justify-between bg-slate-900/30">
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-center ${typeColors[selectedLog.type] || 'text-white'}`}>
                                    <Activity size={18} />
                                </div>
                                <div className="leading-tight">
                                    <h3 className="text-sm font-bold text-white">İşlem Detay Raporu</h3>
                                    <p className="text-[10px] font-medium text-slate-500 mt-0.5">Ref ID: {selectedLog.id.slice(0, 8).toUpperCase()}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedLog(null)} className="p-1.5 bg-slate-900 border border-slate-800/60 rounded-lg text-slate-400 hover:text-white transition-all">
                                <X size={15} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-5">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-950/40 border border-slate-850/70 p-3.5 rounded-xl space-y-0.5 leading-none">
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">İşlem Tipi</span>
                                        <p className={`text-xs font-bold pt-1 ${typeColors[selectedLog.type]}`}>{translateType(selectedLog.type)}</p>
                                    </div>
                                    <div className="bg-slate-950/40 border border-slate-850/70 p-3.5 rounded-xl space-y-0.5 leading-none">
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">İşlem Tarihi</span>
                                        <p className="text-xs font-semibold text-slate-200 pt-1">{new Date(selectedLog.created_at).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-950/40 border border-slate-850/70 p-4 rounded-xl space-y-1.5">
                                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">İşlem Başlığı</span>
                                    <p className="text-sm font-semibold text-white leading-tight">{selectedLog.title}</p>
                                </div>

                                <div className="bg-slate-950/40 border border-slate-850/70 p-4 rounded-xl space-y-1.5">
                                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Açıklama</span>
                                    <p className="text-xs font-normal text-slate-400 leading-relaxed">{selectedLog.description}</p>
                                </div>

                                <div className="bg-slate-950/40 border border-slate-850/70 p-4 rounded-xl space-y-3">
                                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">İşlem Sahibi</span>
                                    <div className="flex items-center gap-3">
                                        <img src={selectedLog.user?.avatar || `https://ui-avatars.com/api/?name=${selectedLog.user_id}`} className="w-10 h-10 rounded-xl object-cover border border-slate-800 bg-slate-950" referrerPolicy="no-referrer" />
                                        <div className="leading-tight">
                                            <p className="text-xs font-bold text-white">{selectedLog.user?.name || 'Sistem / Anonim'}</p>
                                            <p className="text-10px text-slate-500 font-medium">@{selectedLog.user?.username || 'sistem'}</p>
                                            <p className="text-[9px] text-slate-600 font-medium mt-0.5">Sanal ID: {selectedLog.user_id}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-950/40 border border-slate-850/70 p-4 rounded-xl space-y-2">
                                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">İşlem Anahtarı (Action Key)</span>
                                    <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-850/70 leading-none">
                                        <Zap size={12} className="text-blue-400" />
                                        <code className="text-xs font-semibold text-blue-400">{selectedLog.action_key}</code>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-900/30 border-t border-slate-800/60 flex items-center justify-end">
                            <button 
                                onClick={() => setSelectedLog(null)}
                                className="px-5 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 font-semibold border border-slate-800 rounded-xl text-xs transition-all h-10"
                            >
                                Kapat
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

const SalesManagement = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

    useEffect(() => { 
        DatabaseService.getAllTransactions().then(t => { 
            setTransactions(t); 
            setIsLoading(false); 
        }); 
    }, []);

    const filtered = transactions.filter(t => filter === 'all' || t.status === filter);

    const stats = {
        totalRevenue: transactions.filter(t => t.status === 'completed').reduce((acc, curr) => {
            if (curr.currency === 'TRY') return acc + Number(curr.amount);
            if (curr.currency === 'TON') return acc + (Number(curr.amount) * 250);
            if (curr.currency === 'STARS') return acc + (Number(curr.amount) * 0.5);
            return acc;
        }, 0),
        tonRevenue: transactions.filter(t => t.status === 'completed' && t.currency === 'TON').reduce((acc, curr) => acc + Number(curr.amount), 0),
        starsRevenue: transactions.filter(t => t.status === 'completed' && t.currency === 'STARS').reduce((acc, curr) => acc + Number(curr.amount), 0),
        tryRevenue: transactions.filter(t => t.status === 'completed' && t.currency === 'TRY').reduce((acc, curr) => acc + Number(curr.amount), 0)
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col gap-1">
                <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight leading-none">Finans Merkezi</h2>
                <p className="text-xs text-slate-400 mt-1 leading-normal">Platform gelirlerini ve ödeme akışlarını izleyin</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={TrendingUp} label="Toplam Ciro (TRY)" value={`₺${stats.totalRevenue.toLocaleString()}`} color="emerald" />
                <StatCard icon={Zap} label="TON Geliri" value={`${stats.tonRevenue.toLocaleString()} TON`} color="blue" />
                <StatCard icon={Star} label="Stars Geliri" value={`${stats.starsRevenue.toLocaleString()} ⭐`} color="purple" />
                <StatCard icon={Wallet} label="TRY Geliri" value={`₺${stats.tryRevenue.toLocaleString()}`} color="orange" />
            </div>

            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {['all', 'completed', 'pending', 'failed'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-4 h-10 rounded-xl text-xs font-semibold tracking-wide transition-all border ${
                            filter === f 
                            ? 'bg-blue-600/10 border-blue-500/20 text-blue-400 shadow-sm' 
                            : 'bg-[#101626]/40 border-slate-800/80 text-slate-400 hover:text-white'
                        }`}
                    >
                        {f === 'all' ? 'Tümü' : f === 'completed' ? 'Tamamlandı' : f === 'pending' ? 'Bekleyen' : f === 'failed' ? 'İptal' : f}
                    </button>
                ))}
            </div>

            <div className="bg-[#101626]/40 border border-slate-800/60 rounded-xl overflow-hidden backdrop-blur-sm shadow-sm">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                        <span className="text-xs text-slate-500 font-medium">Finansal işlemler yükleniyor...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-24 text-center">
                        <History size={40} className="mx-auto text-slate-600 mb-3" />
                        <p className="text-slate-400 text-sm font-semibold">İşlem kaydı bulunamadı</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#101a2e]/60 border-b border-slate-800 text-xs font-semibold text-slate-400">
                                    <tr>
                                        <th className="px-6 py-4">Müşteri</th>
                                        <th className="px-6 py-4">Ürün / Tip</th>
                                        <th className="px-6 py-4">İşlem Tarihi</th>
                                        <th className="px-6 py-4">Durum</th>
                                        <th className="px-6 py-4 text-right">Tutar</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/40 text-slate-200">
                                    {filtered.map((t) => (
                                        <tr key={t.id} className="hover:bg-[#121c30]/20 transition-colors">
                                            <td className="px-6 py-4 text-sm font-semibold">
                                                <div className="flex items-center gap-3">
                                                    <img src={t.user?.avatar || `https://ui-avatars.com/api/?name=${t.user?.username}`} className="w-8 h-8 rounded-lg border border-slate-800 bg-slate-950" referrerPolicy="no-referrer" />
                                                    <div className="leading-tight">
                                                        <p className="text-sm font-semibold text-white">@{t.user?.username || 'Misafir'}</p>
                                                        <p className="text-[10px] text-slate-500">ID: {t.user_id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-semibold text-slate-200">{t.item_id}</span>
                                                    <span className="text-[10px] text-slate-500">{t.item_type}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-semibold text-slate-200">{new Date(t.created_at).toLocaleDateString()}</span>
                                                    <span className="text-[10px] text-slate-500">{new Date(t.created_at).toLocaleTimeString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                    t.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                                    t.status === 'pending' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                                    'bg-red-500/10 border-red-500/20 text-red-400'
                                                }`}>
                                                    <span className={`w-1 h-1 rounded-full ${
                                                        t.status === 'completed' ? 'bg-emerald-400' :
                                                        t.status === 'pending' ? 'bg-blue-400' :
                                                        'bg-red-400'
                                                    }`}></span>
                                                    {t.status === 'completed' ? 'Başarılı' : t.status === 'pending' ? 'Beklemede' : 'İptal'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-col items-end leading-none">
                                                    <span className={`text-sm font-bold ${t.status === 'completed' ? 'text-emerald-400' : 'text-slate-400'}`}>
                                                        {t.currency === 'TRY' ? '₺' : ''}{t.amount} {t.currency !== 'TRY' ? t.currency : ''}
                                                    </span>
                                                    {t.tx_hash && (
                                                        <a href={`https://tonviewer.com/transaction/${t.tx_hash}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:underline flex items-center gap-1 mt-1 leading-none">
                                                            Ağ Detayı <ExternalLink size={10} />
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden divide-y divide-slate-800/40">
                            {filtered.map((t) => (
                                <div key={t.id} className="p-5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <img src={t.user?.avatar || `https://ui-avatars.com/api/?name=${t.user?.username}`} className="w-8 h-8 rounded-lg border border-slate-850" referrerPolicy="no-referrer" />
                                            <div>
                                                <p className="text-sm font-semibold text-white">@{t.user?.username || 'Misafir'}</p>
                                                <p className="text-[10px] text-slate-500">ID: {t.user_id}</p>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                            t.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                            t.status === 'pending' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                            'bg-red-500/10 border-red-500/20 text-red-400 border border-red-500/10'
                                        }`}>
                                            {t.status === 'completed' ? 'Başarılı' : t.status === 'pending' ? 'Beklemede' : 'İptal'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-semibold text-slate-500">Ürün / Tip</p>
                                            <div className="flex flex-col mt-0.5">
                                                <span className="text-xs font-semibold text-white">{t.item_id}</span>
                                                <span className="text-[10px] text-slate-500">{t.item_type}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-semibold text-slate-500 mb-0.5">Tutar</p>
                                            <span className={`text-base font-bold ${t.status === 'completed' ? 'text-emerald-400' : 'text-slate-400'}`}>
                                                {t.currency === 'TRY' ? '₺' : ''}{t.amount} {t.currency !== 'TRY' ? t.currency : ''}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-2 border-t border-slate-800/40">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-medium text-slate-400">{new Date(t.created_at).toLocaleDateString()}</span>
                                            <span className="text-[9px] text-slate-500">{new Date(t.created_at).toLocaleTimeString()}</span>
                                        </div>
                                        {t.tx_hash && (
                                            <a href={`https://tonviewer.com/transaction/${t.tx_hash}`} target="_blank" rel="noopener noreferrer" className="h-8 px-3.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-blue-500/10 transition-colors hover:bg-blue-600 hover:text-white">
                                                Ağ Detayı <ExternalLink size={12} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const AnnouncementCenter = () => {
    const [anns, setAnns] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnn, setEditingAnn] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'style' | 'action'>('info');

    const load = useCallback(async () => {
        setIsLoading(true);
        setAnns(await DatabaseService.getAnnouncements());
        setIsLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const openCreateModal = () => {
        setEditingAnn({
            id: '',
            title: '',
            description: '',
            button_text: 'İNCELE',
            button_link: '',
            icon_name: 'None',
            color_scheme: 'purple',
            bg_image_url: '',
            badge_text: 'Sponsorlu',
            is_active: true,
            action_type: 'link',
            content_detail: ''
        });
        setIsModalOpen(true);
        setActiveTab('info');
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...editingAnn };
            if (!payload.id || payload.id === '') {
                delete payload.id;
            }
            await DatabaseService.saveAnnouncement(payload);
            await DatabaseService.logActivity('admin', 'system', 'announcement_saved', 'Duyuru Kaydedildi', `${editingAnn.title} başlıklı duyuru güncellendi/oluşturuldu.`);
            setIsModalOpen(false);
            load();
            alert('Duyuru başarıyla kaydedildi.');
        } catch (err: any) {
            console.error("Save Announcement Error:", err);
            alert(`Hata: ${err.message || 'Duyuru kaydedilemedi.'}`);
        }
    };

    const previewColors: Record<string, string> = {
        purple: 'from-[#6366f1] to-[#a855f7]',
        blue: 'from-[#3b82f6] to-[#60a5fa]',
        emerald: 'from-[#10b981] to-[#34d399]',
        orange: 'from-[#f59e0b] to-[#ef4444]'
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight leading-none">Duyuru Merkezi</h2>
                    <p className="text-xs text-slate-400 mt-1 leading-normal">Global platform duyurularını yönetin</p>
                </div>
                <button 
                    onClick={openCreateModal}
                    className="w-full md:w-auto h-11 bg-blue-600 hover:bg-blue-500 px-5 rounded-xl text-xs font-semibold text-white transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
                >
                    <Plus size={16} /> Yeni Duyuru Oluştur
                </button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                    <span className="text-xs text-slate-500 font-medium italic">Duyurular yükleniyor...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {anns.map(a => (
                        <div key={a.id} className="bg-[#101626]/40 border border-slate-800/60 rounded-2xl p-6 flex flex-col gap-4 group hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden backdrop-blur-sm shadow-sm select-none">
                            {a.bg_image_url && (
                                <div className="absolute inset-0 z-0">
                                    <img src={a.bg_image_url} alt="" className="w-full h-full object-cover opacity-15 group-hover:opacity-25 transition-opacity duration-300" referrerPolicy="no-referrer" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e121e] via-[#0e121e]/80 to-[#0e121e]/40"></div>
                                </div>
                            )}
                            <div className="flex justify-between items-start relative z-10">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-slate-800/50 ${a.is_active ? (a.bg_image_url ? 'bg-slate-900/80 text-white' : `bg-gradient-to-br ${previewColors[a.color_scheme] || 'from-blue-600 to-indigo-600'} text-white`) : 'bg-slate-900 text-slate-600 border-slate-900'}`}>
                                    {a.icon_name === 'None' ? <Megaphone size={18}/> : (a.icon_name === 'Megaphone' ? <Megaphone size={18}/> : a.icon_name === 'Sparkles' ? <Sparkles size={18}/> : a.icon_name === 'Zap' ? <Zap size={18}/> : <Star size={18}/>)}
                                </div>
                                <div className="flex gap-1.5">
                                    <button onClick={() => { setEditingAnn(a); setIsModalOpen(true); }} className="w-8 h-8 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-blue-500/30 text-slate-400 hover:text-white flex items-center justify-center transition-colors"><Edit3 size={14}/></button>
                                    <button onClick={async () => { if(confirm('Silsin mi?')) { await DatabaseService.deleteAnnouncement(a.id); await DatabaseService.logActivity('admin', 'system', 'announcement_deleted', 'Duyuru Silindi', `${a.title} başlıklı duyuru silindi.`); load(); } }} className="w-8 h-8 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-red-500/30 text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors"><Trash2 size={14}/></button>
                                </div>
                            </div>

                            <div className="relative z-10 flex-1 flex flex-col justify-between">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="font-bold text-slate-200 text-sm truncate group-hover:text-blue-400 transition-colors leading-tight">{a.title}</h4>
                                        {!a.is_active && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400/90 leading-none">Pasif</span>}
                                    </div>
                                    <p className="text-slate-400 text-xs font-normal line-clamp-2 leading-relaxed h-8">{a.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-800/60 relative z-10">
                                <span className={`text-[10px] font-semibold tracking-wide ${a.bg_image_url ? 'text-blue-400' : (a.color_scheme === 'purple' ? 'text-purple-400' : a.color_scheme === 'emerald' ? 'text-emerald-400' : a.color_scheme === 'orange' ? 'text-orange-400' : 'text-blue-400')}`}>
                                    {a.bg_image_url ? 'Görsel Arkaplan' : `${a.color_scheme.toUpperCase()} Tema`}
                                </span>
                                <ChevronRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && editingAnn && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-4xl bg-[#0e121e] border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
                        
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 z-[120] p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-lg transition-all">
                            <X size={14} />
                        </button>

                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="p-6 border-b border-slate-800/60 bg-slate-900/30 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-9 h-9 bg-gradient-to-br ${previewColors[editingAnn.color_scheme] || 'from-purple-600 to-indigo-600'} rounded-xl flex items-center justify-center`}>
                                        {editingAnn.icon_name !== 'None' && React.createElement(({ 
                                            Megaphone, Sparkles, Zap, Star, Gift, Info, BotIcon, Heart, Bell, Shield 
                                        } as any)[editingAnn.icon_name] || Megaphone, { size: 18, className: "text-white" })}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Duyuru Paneli</h3>
                                        <p className="text-[10px] text-slate-500">Yayın parametrelerini ve görselleri özelleştirin</p>
                                    </div>
                                </div>

                                <div className="flex gap-1.5 p-1 bg-[#101626]/80 rounded-xl border border-slate-800/80 w-fit">
                                    {['info', 'style', 'action'].map(tab => (
                                        <button 
                                            type="button"
                                            key={tab}
                                            onClick={() => setActiveTab(tab as any)}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${activeTab === tab ? 'bg-blue-600/10 border border-blue-500/10 text-blue-400' : 'text-slate-450 hover:text-white'}`}
                                        >
                                            {tab === 'info' ? 'İçerik' : tab === 'style' ? 'Görünüm' : 'Eylem'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <form onSubmit={handleSave} className="space-y-6">
                                    
                                    {activeTab === 'info' && (
                                        <div className="space-y-6 animate-in fade-in duration-200">
                                            <AdminInput label="Başlık" value={editingAnn.title} onChange={(v:any)=>setEditingAnn({...editingAnn, title:v})} />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <AdminInput label="Rozet Metni" value={editingAnn.badge_text} onChange={(v:any)=>setEditingAnn({...editingAnn, badge_text:v})} placeholder="Örn: Sponsorlu" />
                                                <AdminInput label="Etiket (Opsiyonel)" value={editingAnn.tag} onChange={(v:any)=>setEditingAnn({...editingAnn, tag:v})} placeholder="Örn: YENİ" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-slate-400">Kısa Açıklama</label>
                                                <input value={editingAnn.description} onChange={e => setEditingAnn({...editingAnn, description: e.target.value})} className="w-full h-11 bg-slate-950/70 border border-slate-800/80 rounded-xl px-4 text-xs font-normal text-white outline-none focus:border-blue-500 transition-all" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-slate-400">Detaylı İçerik (Popup)</label>
                                                <textarea value={editingAnn.content_detail} onChange={e => setEditingAnn({...editingAnn, content_detail: e.target.value})} className="w-full bg-[#101626]/40 border border-slate-800/80 p-4 rounded-xl text-xs font-normal h-32 outline-none text-slate-300 focus:border-blue-500 transition-all leading-relaxed" />
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'style' && (
                                        <div className="space-y-6 animate-in fade-in duration-200">
                                            {/* Arkaplan Tipi Seçimi */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-slate-400">Arkaplan Türü</label>
                                                <div className="flex gap-1.5 p-1 bg-[#101626]/80 rounded-xl border border-slate-800/80 w-fit">
                                                    <button 
                                                        type="button"
                                                        onClick={() => setEditingAnn({ ...editingAnn, bg_image_url: '' })}
                                                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${!editingAnn.bg_image_url ? 'bg-blue-600/10 border-blue-500/10 text-blue-400' : 'text-slate-500 hover:text-white'}`}
                                                    >
                                                        Renk Şeması
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={() => setEditingAnn({ ...editingAnn, bg_image_url: editingAnn.bg_image_url || 'https://' })}
                                                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${editingAnn.bg_image_url ? 'bg-blue-600/10 border-blue-500/10 text-blue-400' : 'text-slate-500 hover:text-white'}`}
                                                    >
                                                        Görsel / PNG URL
                                                    </button>
                                                </div>
                                            </div>

                                            {!editingAnn.bg_image_url ? (
                                                /* Renk Seçimi */
                                                <div className="space-y-4 animate-in fade-in">
                                                    <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">RENK ŞEMASI (GÖRSEL ÖNİZLEME)</label>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                        {[
                                                            { id: 'purple', label: 'Hologram Purple', class: 'from-[#6366f1] to-[#a855f7]' },
                                                            { id: 'blue', label: 'Deep Sea Blue', class: 'from-[#3b82f6] to-[#60a5fa]' },
                                                            { id: 'emerald', label: 'Neon Emerald', class: 'from-[#10b981] to-[#34d399]' },
                                                            { id: 'orange', label: 'Cyber Orange', class: 'from-[#f59e0b] to-[#ef4444]' }
                                                        ].map(scheme => (
                                                            <button
                                                                key={scheme.id}
                                                                type="button"
                                                                onClick={() => setEditingAnn({ ...editingAnn, color_scheme: scheme.id })}
                                                                className={`group relative h-24 rounded-3xl border transition-all overflow-hidden ${
                                                                    editingAnn.color_scheme === scheme.id 
                                                                    ? 'border-white ring-2 ring-white/20' 
                                                                    : 'border-white/5 hover:border-white/20'
                                                                }`}
                                                            >
                                                                <div className={`absolute inset-0 bg-gradient-to-br ${scheme.class} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <span className="text-[8px] font-black text-white uppercase tracking-tighter ">{scheme.label}</span>
                                                                </div>
                                                                {editingAnn.color_scheme === scheme.id && (
                                                                    <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1 ">
                                                                        <Check size={8} />
                                                                    </div>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                /* PNG Görsel Seçimi */
                                                <div className="space-y-4 animate-in fade-in">
                                                    <AdminInput 
                                                        label="PNG GÖRSEL URL" 
                                                        value={editingAnn.bg_image_url} 
                                                        onChange={(v:any)=>setEditingAnn({...editingAnn, bg_image_url:v})} 
                                                        placeholder="https://example.com/image.png"
                                                    />
                                                    <div className="p-4 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-4">
                                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-950 border border-white/10 flex items-center justify-center shrink-0">
                                                            {editingAnn.bg_image_url && editingAnn.bg_image_url.startsWith('http') ? (
                                                                <img src={editingAnn.bg_image_url} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                                            ) : (
                                                                <ImageIcon className="text-slate-700" size={24} />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-white">Görsel Önizleme</p>
                                                            <p className="text-[10px] text-slate-505 mt-1">Girdiğiniz PNG URL'ye göre otomatik yenilenir.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* İkon Seçimi */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-slate-400">İkon Türü</label>
                                                <div className="grid grid-cols-6 gap-2">
                                                    {[
                                                        { id: 'None', icon: X },
                                                        { id: 'Megaphone', icon: Megaphone },
                                                        { id: 'Sparkles', icon: Sparkles },
                                                        { id: 'Zap', icon: Zap },
                                                        { id: 'Star', icon: Star },
                                                        { id: 'Gift', icon: Gift },
                                                        { id: 'Info', icon: Info },
                                                        { id: 'BotIcon', icon: BotIcon },
                                                        { id: 'Heart', icon: Heart },
                                                        { id: 'Bell', icon: Bell },
                                                        { id: 'Shield', icon: Shield }
                                                    ].map(item => (
                                                        <button
                                                            key={item.id}
                                                            type="button"
                                                            onClick={() => setEditingAnn({ ...editingAnn, icon_name: item.id })}
                                                            className={`h-11 rounded-xl flex items-center justify-center transition-all border ${
                                                                editingAnn.icon_name === item.id 
                                                                ? 'bg-blue-600/10 border-blue-500/20 text-blue-400 shadow-sm' 
                                                                : 'bg-slate-950 border-slate-800/85 text-slate-500 hover:text-slate-350'
                                                            }`}
                                                        >
                                                            <item.icon size={16} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'action' && (
                                        <div className="space-y-6 animate-in fade-in duration-200">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <AdminInput label="Buton Metni" value={editingAnn.button_text} onChange={(v:any)=>setEditingAnn({...editingAnn, button_text:v})} />
                                                <AdminInput label="Hedef URL / Kullanıcı Adı" value={editingAnn.button_link} onChange={(v:any)=>setEditingAnn({...editingAnn, button_link:v})} />
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-slate-450">Aksiyon Tipi</label>
                                                    <div className="flex gap-1.5 p-1 bg-[#101626]/80 rounded-xl border border-slate-800/80 w-fit">
                                                        {['link', 'popup'].map(type => (
                                                            <button 
                                                                key={type}
                                                                type="button" 
                                                                onClick={()=>setEditingAnn({...editingAnn, action_type: type})} 
                                                                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${editingAnn.action_type === type ? 'bg-blue-600/10 border border-blue-500/10 text-blue-400' : 'text-slate-500 hover:text-slate-350'}`}
                                                            >
                                                                {type === 'link' ? 'Dış Bağlantı' : 'İç Popup'}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-slate-450">Yayın Durumu</label>
                                                    <button type="button" onClick={()=>setEditingAnn({...editingAnn, is_active: !editingAnn.is_active})} className={`h-10 px-4 rounded-xl flex items-center justify-center gap-2 transition-all font-semibold text-xs leading-none ${editingAnn.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${editingAnn.is_active ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                                                        {editingAnn.is_active ? 'Yayında' : 'Yayını Durdur'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-slate-800/60">
                                        <button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm">
                                            <Send size={14} /> Duyuruyu Kaydet
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* RIGHT: COMPACT PREVIEW SIMULATOR */}
                        <div className="hidden lg:flex w-[320px] bg-slate-950/20 border-l border-slate-800/60 p-6 flex-col items-center justify-center">
                            <div className="text-center mb-6 space-y-1 select-none">
                                <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider block">ÖNİZLEME</span>
                                <h4 className="text-xs font-normal text-slate-500">Duyuru Görünümü</h4>
                            </div>

                            <div className="w-full max-w-[260px] h-36 rounded-xl p-5 relative overflow-hidden border border-slate-800 bg-[#101626]/40 flex flex-col justify-between group">
                                {/* Dinamik Arkaplan */}
                                {editingAnn.bg_image_url ? (
                                    <div className="absolute inset-0 z-0 select-none">
                                        <img src={editingAnn.bg_image_url} alt="" className="w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity" referrerPolicy="no-referrer" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0e121e] via-[#0e121e]/85 to-transparent"></div>
                                    </div>
                                ) : (
                                    <div className={`absolute inset-0 bg-gradient-to-br ${previewColors[editingAnn.color_scheme] || previewColors.purple} opacity-80 group-hover:opacity-105 transition-all duration-300`}></div>
                                )}
                                
                                <div className="relative z-10 flex flex-col justify-between h-full">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        {editingAnn.badge_text && (
                                            <span className="text-[9px] font-semibold text-white/95 px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-md border border-white/10">{editingAnn.badge_text}</span>
                                        )}
                                        {editingAnn.tag && (
                                            <span className="text-[9px] font-semibold text-white/70 px-2 py-0.5 rounded-md bg-white/5 border border-white/10">{editingAnn.tag}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-sm mb-0.5 truncate leading-tight">{editingAnn.title || 'Başlık Yok'}</h3>
                                        <p className="text-white/60 text-[10px] leading-relaxed line-clamp-2 font-normal">{editingAnn.description || 'Açıklama girilmedi.'}</p>
                                    </div>
                                </div>
                                {!editingAnn.bg_image_url && (
                                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-300">
                                        {editingAnn.icon_name === 'None' ? null : React.createElement(({ 
                                            Megaphone, Sparkles, Zap, Star, Gift, Info, BotIcon, Heart, Bell, Shield 
                                        } as any)[editingAnn.icon_name] || Megaphone, { size: 90, className: "text-white" })}
                                    </div>
                                )}
                            </div>

                            <p className="text-[10px] font-medium text-slate-500 mt-6 select-none leading-normal">Kullanıcı cihazlarında görünecek biçim</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const NotificationCenter = () => {
    const [notes, setNotes] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newNote, setNewNote] = useState<any>({
        title: '',
        message: '',
        type: 'system',
        target_type: 'global',
        user_id: ''
    });

    const load = useCallback(async () => {
        setIsLoading(true);
        const data = await DatabaseService.getNotifications();
        setNotes(data);
        setIsLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (newNote.target_type === 'global') {
                await DatabaseService.sendGlobalNotification(newNote.title, newNote.message, newNote.type);
                await DatabaseService.logActivity('admin', 'system', 'notification_sent', 'Global Bildirim Gönderildi', `${newNote.title} başlıklı bildirim tüm kullanıcılara gönderildi.`);
            } else {
                if (!newNote.user_id) return alert('Kullanıcı ID gereklidir.');
                await DatabaseService.sendUserNotification(newNote.user_id, newNote.title, newNote.message, newNote.type);
                await DatabaseService.logActivity('admin', 'system', 'notification_sent', 'Özel Bildirim Gönderildi', `${newNote.title} başlıklı bildirim ${newNote.user_id} ID'li kullanıcıya gönderildi.`);
            }
            setIsModalOpen(false);
            load();
        } catch (e) { alert('Hata oluştu.'); }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight leading-none">Bildirim Merkezi</h2>
                    <p className="text-xs text-slate-400 mt-1 leading-normal">Kullanıcı bildirimlerini anlık yönetin</p>
                </div>
                <button 
                    onClick={() => { setNewNote({ title: '', message: '', type: 'system', target_type: 'global', user_id: '' }); setIsModalOpen(true); }}
                    className="w-full md:w-auto h-11 bg-blue-600 hover:bg-blue-500 px-5 rounded-xl text-xs font-semibold text-white transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
                >
                    <Plus size={16} /> Yeni Bildirim Tetikle
                </button>
            </div>

            <div className="bg-[#101626]/40 border border-slate-800/60 rounded-2xl overflow-hidden backdrop-blur-sm">
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#12192c]/50 text-[10px] font-semibold text-slate-400 border-b border-slate-800/80">
                            <tr>
                                <th className="px-6 py-4">BAŞLIK & TÜR</th>
                                <th className="px-6 py-4">HEDEF KİTLE</th>
                                <th className="px-6 py-4 text-center">GÖRÜNTÜLENME</th>
                                <th className="px-6 py-4">TARİH</th>
                                <th className="px-6 py-4 text-right">EYLEMLER</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                            {notes.map(n => (
                                <tr key={n.id} className="hover:bg-slate-900/30 transition-all text-slate-300 text-xs">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl bg-slate-900/80 border border-slate-800/60 ${n.type === 'payment' ? 'text-emerald-400' : n.type === 'security' ? 'text-rose-450 text-red-450' : 'text-blue-400'}`}>
                                                {n.type === 'payment' ? <Wallet size={14}/> : n.type === 'security' ? <ShieldCheck size={14}/> : <Bell size={14}/>}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-200">{n.title}</p>
                                                <p className="text-[10px] text-slate-500">{n.type === 'payment' ? 'Finansal' : n.type === 'security' ? 'Güvenlik Log' : 'Sistem Gönderisi'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 ${n.target_type === 'global' ? 'text-blue-400' : 'text-slate-450'}`}>
                                            {n.target_type === 'global' ? 'Herkese Açık' : `Özel (Kullanıcı ID: ${n.user_id})`}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-900 border border-slate-800/80 rounded-md select-none">
                                            <Eye size={11} className="text-slate-400" />
                                            <span className="text-[10px] font-bold text-slate-300">{n.view_count || 0}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 font-medium text-[11px]">{new Date(n.date).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={async () => { if(confirm('Silsin mi?')) { await DatabaseService.deleteNotification(n.id); await DatabaseService.logActivity('admin', 'system', 'notification_deleted', 'Bildirim Silindi', `${n.title} başlıklı bildirim silindi.`); load(); } }} className="w-8 h-8 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-all ml-auto"><Trash2 size={13}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card List */}
                <div className="lg:hidden p-4 space-y-3">
                    {notes.map(n => (
                        <div key={n.id} className="p-4 bg-slate-900/30 border border-slate-800/60 rounded-xl space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-lg bg-slate-900 border border-slate-800 ${n.type === 'payment' ? 'text-emerald-400' : n.type === 'security' ? 'text-red-400' : 'text-blue-400'}`}><Bell size={12}/></div>
                                    <p className="font-semibold text-slate-200 text-xs">{n.title}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                        <Eye size={11}/> {n.view_count || 0}
                                    </div>
                                    <button onClick={async () => { await DatabaseService.deleteNotification(n.id); load(); }} className="text-red-400 hover:text-red-300"><Trash2 size={12}/></button>
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-normal">{n.message}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* NOTIFICATION FORGE MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[110] bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#0b0f19] border border-slate-800/60 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col lg:flex-row overflow-hidden relative shadow-2xl">
                        
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 z-[120] p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all active:scale-95">
                            <X size={15} />
                        </button>

                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="p-6 border-b border-slate-800/60 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                                        <Bell size={18}/>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-white">Bildirim Oluştur</h3>
                                        <p className="text-[10px] text-slate-500 leading-normal">Kullanıcılara anlık uyarı ve duyuru iletimi</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <form onSubmit={handleSend} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-450">Bildirim Tipi</label>
                                            <div className="flex gap-1.5 p-1 bg-[#101626]/80 rounded-xl border border-slate-800/80">
                                                {['system', 'payment', 'security', 'bot'].map(t => (
                                                    <button 
                                                        key={t} 
                                                        type="button" 
                                                        onClick={()=>setNewNote({...newNote, type: t})} 
                                                        className={`flex-1 py-1 px-2 text-[10px] font-semibold rounded-lg capitalize transition-all ${newNote.type === t ? 'bg-blue-600/15 text-blue-400 border border-blue-500/10' : 'text-slate-500 hover:text-slate-350'}`}
                                                    >
                                                        {t === 'system' ? 'Sistem' : t === 'payment' ? 'Finansal' : t === 'security' ? 'Güvenlik' : 'Bot'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-450">Hedef Kitle</label>
                                            <div className="flex gap-1.5 p-1 bg-[#101626]/80 rounded-xl border border-slate-800/80">
                                                {['global', 'user'].map(t => (
                                                    <button 
                                                        key={t} 
                                                        type="button" 
                                                        onClick={()=>setNewNote({...newNote, target_type: t})} 
                                                        className={`flex-1 py-1 px-2 text-[10px] font-semibold rounded-lg transition-all ${newNote.target_type === t ? 'bg-blue-600/15 text-blue-400 border border-blue-500/10' : 'text-slate-500 hover:text-slate-350'}`}
                                                    >
                                                        {t === 'global' ? 'Herkese' : 'Spesifik Limit'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {newNote.target_type === 'user' && (
                                        <AdminInput label="Hedef Kullanıcı ID" value={newNote.user_id} onChange={(v:any)=>setNewNote({...newNote, user_id:v})} />
                                    )}

                                    <AdminInput label="Bildirim Başlığı" value={newNote.title} onChange={(v:any)=>setNewNote({...newNote, title:v})} />
                                    
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-450">Bildirim Mesajı</label>
                                        <textarea value={newNote.message} onChange={e => setNewNote({...newNote, message: e.target.value})} placeholder="Kullanıcıya iletilecek mesaj metni..." className="w-full bg-[#101626]/40 border border-slate-800 p-4 rounded-xl text-xs outline-none text-slate-350 focus:border-blue-500/30 h-24 placeholder:text-slate-600 leading-relaxed capitalize-none resize-none" />
                                    </div>

                                    <div className="pt-2 border-t border-slate-800/60">
                                        <button type="submit" className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm">
                                            <Send size={13} /> Bildirimi Tetikle
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* RIGHT: COMPACT INBOX SIMULATOR */}
                        <div className="hidden lg:flex w-[320px] bg-slate-950/20 border-l border-slate-800/60 p-6 flex-col items-center justify-center sticky right-0">
                            <div className="text-center mb-6 space-y-1">
                                <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider block">ANLIK SİMÜLASYON</span>
                                <h4 className="text-xs font-normal text-slate-500">Kullanıcı Bildirim Kutusu</h4>
                            </div>

                            <div className="w-full max-w-[260px] group select-none">
                                <div className="bg-[#101626]/40 border border-slate-850 border-slate-800/80 rounded-xl p-4 transition-all duration-300 relative overflow-hidden backdrop-blur-sm">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                                    <div className="flex gap-3 mb-4 relative z-10">
                                        <div className="w-9 h-9 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center text-blue-400 shrink-0">
                                            {newNote.type === 'payment' ? <Wallet size={16}/> : <Bell size={16}/>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <h5 className="text-xs font-bold text-slate-200 truncate leading-tight pr-1">{newNote.title || 'Bildirim Başlığı'}</h5>
                                                <span className="text-[8px] text-slate-500 whitespace-nowrap mt-0.5 font-medium">Şimdi</span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 leading-normal line-clamp-2">{newNote.message || 'Harika bir mesaj içeriği girildi.'}</p>
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t border-slate-800/60 flex justify-between items-center relative z-10 text-[9px] text-slate-500 font-medium">
                                        <span>{newNote.type === 'payment' ? 'Finansal' : 'Sistem Gönderisi'}</span>
                                        <div className="flex gap-1">
                                            <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                                            <div className="w-1 h-1 rounded-full bg-slate-800"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * PROMOTION MANAGEMENT - REDESIGNED Ad Sharing Center
 * FIXED: Veritabanı işlemleri (Save ve Status Update) stabilize edildi.
 */
const PromotionManagement = () => {
    const [promos, setPromos] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<any>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generateImage, setGenerateImage] = useState(true);
    const [aiError, setAiError] = useState<string | null>(null);
    const [showKeySelection, setShowKeySelection] = useState(false);

    const openAIModal = async () => {
        setAiError(null);
        setShowKeySelection(false);
        setIsAIModalOpen(true);
        
        if ((window as any).aistudio) {
            const hasKey = await (window as any).aistudio.hasSelectedApiKey();
            if (!hasKey) {
                setShowKeySelection(true);
            }
        }
    };

    const handleKeySelection = async () => {
        if ((window as any).aistudio) {
            await (window as any).aistudio.openSelectKey();
            setShowKeySelection(false);
            setAiError(null);
        }
    };

    const generateAIAd = async () => {
        if (!aiPrompt.trim()) return;
        
        setIsGenerating(true);
        setAiError(null);
        try {
            const adData = await GeminiService.generateAd(aiPrompt, generateImage);

            setEditingPromo({
                id: '',
                title: adData.title,
                content: adData.content,
                image_url: adData.image_url,
                status: 'pending',
                button_text: adData.button_text,
                button_link: '',
                click_count: 0,
                price_per_view: 0,
                source_channel: '-1003826684282',
                processed_channels: []
            });
            setIsAIModalOpen(false);
            setIsModalOpen(true);
        } catch (error: any) {
            console.error("AI Generation Detailed Error:", error);
            const errorStr = typeof error === 'string' ? error : (error.message || JSON.stringify(error));
            
            if (errorStr.includes("leaked") || errorStr.includes("PERMISSION_DENIED")) {
                setAiError("API anahtarınız sızdırılmış veya geçersiz. Lütfen yeni bir anahtar seçin.");
                setShowKeySelection(true);
            } else {
                setAiError(error.message || "AI içerik oluşturulurken bir hata oluştu.");
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await DatabaseService.getPromotions();
            setPromos(data);
        } catch (e) {
            console.error("Promos Load Error:", e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    /**
     * FIXED TOGGLE LOGIC:
     * Durumu anlık olarak 'sending'e çeker.
     */
    const handleToggleStatus = async (p: Promotion) => {
        if (updatingId) return; 
        
        const nextStatus: Promotion['status'] = p.status === 'sending' ? 'pending' : 'sending';
        setUpdatingId(p.id);
        
        // UI optimistik güncelleme
        const prev = [...promos];
        setPromos(current => current.map(item => item.id === p.id ? { ...item, status: nextStatus } : item));
        
        try {
            await DatabaseService.updatePromotionStatus(p.id, nextStatus);
            await DatabaseService.logActivity('admin', 'bot_manage', 'promotion_status_changed', 'Tanıtım Statüsü Değişti', `${p.title} kampanyasının durumu ${nextStatus} olarak güncellendi.`);
            // Veriyi Supabase'den tazeleyelim
            const fresh = await DatabaseService.getPromotions();
            setPromos(fresh);
        } catch (error: any) {
            console.error("Promotion Toggle Error:", error);
            setPromos(prev); // Rollback
            alert(error.message || "İşlem sırasında bir hata oluştu.");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // ID alanı boş ise DatabaseService.savePromotion bunu yeni kayıt olarak algılayacak
            await DatabaseService.savePromotion({ 
                ...editingPromo, 
                id: editingPromo.id === '' ? undefined : editingPromo.id
            }); 
            await DatabaseService.logActivity('admin', 'bot_manage', 'promotion_saved', 'Tanıtım Kaydedildi', `${editingPromo.title} kampanyası güncellendi/oluşturuldu.`);
            setIsModalOpen(false); 
            load(); 
        } catch (err: any) {
            console.error("Save Promotion Error:", err);
            // Sunucudan gelen hatayı doğrudan gösteriyoruz ki sorun net anlaşılsın
            alert(`Sistem Hatası: ${err.message || 'Kayıt yapılamadı.'}`);
        }
    };

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'sending': return <span className="px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full text-[9px] font-black uppercase animate-pulse">AKTİF YAYINDA</span>;
            case 'sent': return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase">TAMAMLANDI</span>;
            case 'failed': return <span className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[9px] font-black uppercase">HATA</span>;
            default: return <span className="px-3 py-1 bg-slate-500/10 text-slate-500 border border-white/5 rounded-full text-[9px] font-black uppercase">BEKLEMEDE</span>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight leading-none">Kampanyalar ve Reklamlar</h2>
                    <p className="text-xs text-slate-400 mt-1 leading-normal">Kanallar üzerinden toplu reklam ve sponsorlu gönderi dağıtımı yapın</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
                    <button 
                        onClick={openAIModal} 
                        className="w-full md:w-auto h-11 bg-blue-600/10 hover:bg-blue-600/15 border border-blue-500/20 px-5 rounded-xl text-xs font-semibold text-blue-400 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Sparkles size={14} /> AI ile Oluştur
                    </button>
                    <button 
                        onClick={() => { 
                            setEditingPromo({ 
                                id: '', 
                                title: '', 
                                content: '', 
                                image_url: '', 
                                status: 'pending', 
                                button_text: 'İNCELE', 
                                button_link: '', 
                                click_count: 0, 
                                price_per_view: 0,
                                source_channel: '-1003826684282',
                                processed_channels: [] 
                            }); 
                            setIsModalOpen(true); 
                        }} 
                        className="w-full md:w-auto h-11 bg-blue-600 hover:bg-blue-500 px-5 rounded-xl text-xs font-semibold text-white transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Plus size={14} /> Manuel Oluştur
                    </button>
                </div>
            </div>

            {isLoading && updatingId === null ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Loader2 className="animate-spin text-blue-500" size={24} />
                    <span className="text-[11px] text-slate-500 font-medium">Kampanyalar yükleniyor...</span>
                </div>
            ) : promos.length === 0 ? (
                <div className="bg-[#101626]/25 border border-dashed border-slate-800 rounded-2xl p-16 text-center">
                    <Megaphone size={36} className="text-slate-600 mx-auto mb-4 animate-bounce" />
                    <p className="text-slate-400 text-xs font-medium">Henüz aktif veya pasif bir reklam kampanyası tanımlanmadı.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {promos.map(p => (
                        <div key={p.id} className="bg-[#101626]/40 border border-slate-800/60 rounded-2xl p-5 lg:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between group hover:border-slate-800 transition-all gap-5">
                            <div className="flex-1 min-w-0 w-full">
                                <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                                    {getStatusBadge(p.status)}
                                    <span className="text-[10px] font-semibold text-slate-500">{new Date(p.created_at).toLocaleDateString()}</span>
                                </div>
                                <h4 className="text-base font-semibold text-slate-200 mb-4">{p.title}</h4>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/50 text-slate-405 text-slate-400">
                                        <Monitor size={12} className="text-slate-550 text-slate-500" />
                                        <span className="text-[10px] font-bold">{p.channel_count || 0} Kanal</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/50 text-blue-400">
                                        <TrendingUp size={12} className="text-blue-500" />
                                        <span className="text-[10px] font-bold">{p.total_reach?.toLocaleString() || 0} Erişim</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/50 text-emerald-400">
                                        <Eye size={12} className="text-emerald-500" />
                                        <span className="text-[10px] font-bold">{p.total_views?.toLocaleString() || 0} Görsel</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/50 text-rose-455 text-rose-400">
                                        <Heart size={12} className="text-rose-500" />
                                        <span className="text-[10px] font-bold">{p.total_reactions?.toLocaleString() || 0} Tepki</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#101626] border border-slate-800 text-teal-400">
                                        <MousePointer2 size={12} className="text-teal-550 text-teal-500" />
                                        <span className="text-[10px] font-bold">{p.click_count || 0} Tık</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                                <button 
                                    disabled={updatingId === p.id}
                                    onClick={() => handleToggleStatus(p)} 
                                    className={`h-9 px-4 rounded-xl text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5 min-w-[110px] justify-center ${
                                        updatingId === p.id 
                                        ? 'bg-slate-800 text-slate-600 opacity-50' 
                                        : p.status === 'sending' 
                                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                                          : 'bg-blue-600 text-white hover:bg-blue-500 shadow-sm'
                                    }`}
                                >
                                    {updatingId === p.id ? (
                                        <Loader2 className="animate-spin" size={12} />
                                    ) : (
                                        <>
                                            {p.status === 'sending' ? 'Duraklat' : 'Yayınla'}
                                            <Send size={12} />
                                        </>
                                    )}
                                </button>
                                <div className="flex gap-2 shrink-0">
                                    <button 
                                        onClick={() => { setEditingPromo(p); setIsModalOpen(true); }}
                                        className="w-9 h-9 bg-slate-900 hover:bg-slate-800 border border-slate-800/80 rounded-xl text-blue-400 hover:text-blue-300 flex items-center justify-center transition-all"
                                    >
                                        <Edit3 size={14}/>
                                    </button>
                                    <button 
                                        onClick={async () => { if(confirm('Bu kampanya silinsin mi?')) { await DatabaseService.deletePromotion(p.id); await DatabaseService.logActivity('admin', 'bot_manage', 'promotion_deleted', 'Tanıtım Silindi', `${p.title} kampanyası silindi.`); load(); } }} 
                                        className="w-9 h-9 bg-slate-900 hover:bg-red-500/15 border border-slate-800/80 hover:border-red-500/30 rounded-xl text-rose-455 text-red-400 flex items-center justify-center transition-all"
                                    >
                                        <Trash2 size={14}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isAIModalOpen && (
                <div className="fixed inset-0 z-[120] bg-black/85 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#0b0f19] p-6 lg:p-8 rounded-2xl w-full max-w-lg border border-slate-805 border-slate-800/60 relative shadow-2xl">
                        <button onClick={() => setIsAIModalOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-450 hover:text-white transition-all active:scale-95">
                            <X size={14}/>
                        </button>
                        
                        <div className="text-center space-y-5">
                            <div className="inline-flex p-3 bg-blue-600/10 rounded-xl border border-blue-500/20 mb-1">
                                <Sparkles size={24} className="text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Yapay Zeka Reklam Sihirbazı</h3>
                                <p className="text-slate-500 text-xs mt-1 leading-normal">Kanal ve kampanyanız için otomatik çarpıcı metin ve görseller üretin</p>
                            </div>

                            {aiError && (
                                <div className="bg-red-500/10 border border-red-500/15 p-4 rounded-xl text-left space-y-3 animate-in slide-in-from-top-2">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={16} />
                                        <div className="space-y-0.5">
                                            <p className="text-red-400 text-xs font-bold">Hata Oluştu</p>
                                            <p className="text-slate-400 text-[11px] leading-relaxed">{aiError}</p>
                                        </div>
                                    </div>
                                    {showKeySelection && (
                                        <button 
                                            onClick={handleKeySelection}
                                            className="w-full h-8 bg-white/5 hover:bg-white/10 border border-white/10 px-3 rounded-lg text-[10px] font-semibold text-white transition-all flex items-center justify-center gap-1.5"
                                        >
                                            <Key size={11} /> API Anahtarını Güncelle
                                        </button>
                                    )}
                                </div>
                            )}

                            {showKeySelection && !aiError && (
                                <div className="bg-blue-500/10 border border-blue-500/15 p-4 rounded-xl text-left space-y-3">
                                    <div className="flex items-start gap-3">
                                        <Info className="text-blue-400 shrink-0 mt-0.5" size={16} />
                                        <div className="space-y-0.5">
                                            <p className="text-blue-400 text-xs font-bold">API Anahtarı Gerekli</p>
                                            <p className="text-slate-400 text-[11px] leading-relaxed">AI özelliklerini kullanmak için bir API anahtarı seçmelisiniz.</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleKeySelection}
                                        className="w-full h-8 bg-white/5 hover:bg-white/10 border border-white/10 px-3 rounded-lg text-[10px] font-semibold text-white transition-all flex items-center justify-center gap-1.5"
                                    >
                                        <Key size={11} /> API Anahtarı Seç
                                    </button>
                                </div>
                            )}

                            <div className="space-y-4">
                                <textarea 
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder="Örn: Yeni çıkacak Telegram botumuz için yüksek erişim sağlayacak, kripto borsalarını hedefleyen çekici bir kampanya başlığı oluştur..."
                                    className="w-full bg-[#101626]/40 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 focus:border-blue-500/50 transition-all outline-none h-28 resize-none leading-relaxed placeholder:text-slate-600"
                                />
                                
                                <div className="flex items-center justify-center gap-2 p-2.5 bg-[#101626]/50 rounded-xl border border-slate-800/80">
                                    <input 
                                        type="checkbox" 
                                        id="ai-image-toggle"
                                        checked={generateImage}
                                        onChange={(e) => setGenerateImage(e.target.checked)}
                                        className="w-4 h-4 rounded bg-slate-900 border-slate-800 text-blue-600 focus:ring-blue-500/10 focus:ring-offset-0"
                                    />
                                    <label htmlFor="ai-image-toggle" className="text-[11px] font-medium text-slate-400 cursor-pointer select-none">
                                        Benzersiz bir AI görseli de üretilsin
                                    </label>
                                </div>

                                <button 
                                    disabled={isGenerating || !aiPrompt.trim()}
                                    onClick={generateAIAd}
                                    className="w-full h-10 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 rounded-xl text-xs font-semibold text-white transition-all flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 size={13} className="animate-spin" />
                                            Oluşturuluyor...
                                        </>
                                    ) : (
                                        <>
                                            <Zap size={13} /> İçeriği Oluştur ve Aktar
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && editingPromo && (
                <div className="fixed inset-0 z-[110] bg-black/85 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#0b0f19] rounded-2xl w-full max-w-5xl h-[82vh] overflow-hidden border border-slate-800/60 relative flex flex-col lg:flex-row shadow-2xl">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-450 hover:text-white z-50 transition-all active:scale-95">
                            <X size={14}/>
                        </button>
                        
                        {/* LEFT: Ad Composer Form */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col">
                            <div className="border-b border-slate-800/60 pb-4">
                                <h3 className="text-base font-semibold text-white">Kampanya Düzenleyici</h3>
                                <p className="text-[11px] text-slate-500 leading-normal mt-0.5">Gönderi metnini, kanalları ve buton aksiyonlarını belirleyin</p>
                            </div>

                            <form onSubmit={(e) => {
                                if (!editingPromo.source_channel || editingPromo.source_channel === '@' || editingPromo.source_channel.length < 3) {
                                    e.preventDefault();
                                    alert('Lütfen geçerli bir ana paylaşım kanalı giriniz (Örn: @kanaladi)');
                                    return;
                                }
                                handleSave(e);
                            }} className="space-y-4 pb-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <AdminInput label="Reklam Başlığı" value={editingPromo.title} onChange={(v:any)=>setEditingPromo({...editingPromo, title:v})} placeholder="Örn: Hafta Sonu Fırsatı" />
                                    <div className="relative">
                                        <AdminInput label="Ana Paylaşım Kanalı ID" value={editingPromo.source_channel} onChange={(v:any)=>setEditingPromo({...editingPromo, source_channel:v})} placeholder="-1003826684282" />
                                        <div className="absolute top-0 right-0 mt-1.5 mr-2">
                                            <span className="text-[8px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/5">Sistem</span>
                                        </div>
                                    </div>
                                    <AdminInput label="Görüntülenme Birim Fiyatı ($)" value={editingPromo.price_per_view} onChange={(v:any)=>setEditingPromo({...editingPromo, price_per_view:v})} placeholder="0.005" icon={TrendingUp} />
                                </div>
                                
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-450">Paylaşım Gönderi İçeriği (HTML Destekli)</label>
                                    <textarea 
                                        value={editingPromo.content} 
                                        onChange={e => setEditingPromo({...editingPromo, content: e.target.value})} 
                                        className="w-full bg-[#101626]/40 border border-slate-800 p-4 rounded-xl text-xs outline-none text-slate-300 focus:border-blue-500/30 h-28 leading-relaxed resize-none placeholder:text-slate-600" 
                                        placeholder="Kanalda paylaşılacak sponsorlu gönderi gövdesi..." 
                                    />
                                </div>

                                <AdminInput label="Giriş Görsel Bağlantısı (Opsiyonel URL)" value={editingPromo.image_url} onChange={(v:any)=>setEditingPromo({...editingPromo, image_url:v})} icon={ImageIcon} placeholder="https://resim-kaynagi.com/gorsel.jpg" />
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <AdminInput label="Buton Metni" value={editingPromo.button_text} onChange={(v:any)=>setEditingPromo({...editingPromo, button_text:v})} placeholder="Hemen İncele" />
                                    <AdminInput label="Buton Hedef Linki" value={editingPromo.button_link} onChange={(v:any)=>setEditingPromo({...editingPromo, button_link:v})} icon={Link2} placeholder="https://t.me/kanal_linki" />
                                </div>

                                <div className="bg-[#101626]/45 border border-slate-800/80 p-4 rounded-xl flex items-start gap-3">
                                    <div className="p-2 bg-blue-600/10 rounded-lg text-blue-400 shrink-0">
                                        <Zap size={14} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-blue-400">BotlyHub Reklam Entegratörü</p>
                                        <p className="text-[10px] text-slate-450 leading-relaxed">
                                            Reklam paylaşımları seçtiğiniz ana referans kanalı ({editingPromo.source_channel}) üzerinden tüm bağlı diğer alt ağlara otomatik kaskat edilecektir.
                                        </p>
                                        <div className="mt-2.5 p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl flex items-start gap-2">
                                            <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
                                            <p className="text-[9px] text-amber-500/80 leading-normal">
                                                İstatistiksel izleyicilerin sağlıklı çalışması için ana referans kanalınız mutlaka <b>KAMUYA AÇIK (PUBLIC)</b> olmalıdır. Özel gizli kanallarda erişim grafikleri dökülmeyebilir.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm">Kampanyayı Kaydet</button>
                            </form>
                        </div>

                        {/* RIGHT: LIVE TELEGRAM SIMULATOR */}
                        <div className="hidden lg:flex w-[320px] bg-slate-950/20 border-l border-slate-800/60 p-6 flex-col items-center justify-center sticky right-0">
                            <div className="text-center mb-6 space-y-1">
                                <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider block">ANLIK TELEGRAM SİMÜLATÖRÜ</span>
                                <h4 className="text-[10px] text-slate-500 font-normal">Kanal İçi Mobil Gönderi</h4>
                            </div>

                            {/* Telegram Message UI */}
                            <div className="w-full bg-[#101626]/40 border border-slate-800/80 rounded-xl overflow-hidden animate-in zoom-in-95">
                                {editingPromo.image_url && editingPromo.image_url.startsWith('http') ? (
                                    <img src={editingPromo.image_url} className="w-full h-32 object-cover border-b border-slate-800/80" onError={(e)=>(e.target as any).src=''} />
                                ) : (
                                    <div className="w-full h-24 bg-slate-900/40 flex flex-col items-center justify-center border-b border-slate-800/80 text-slate-600">
                                        <ImageIcon className="mb-1" size={20} />
                                        <span className="text-[9px] font-medium uppercase tracking-wider">Reklam Görseli</span>
                                    </div>
                                )}
                                <div className="p-4 space-y-2.5">
                                    <h5 className="text-slate-200 font-semibold text-xs truncate leading-normal">{editingPromo.title || 'REKLAM BAŞLIĞI'}</h5>
                                    <p className="text-slate-400 text-[10px] leading-relaxed line-clamp-3 min-h-[45px] whitespace-pre-wrap">{editingPromo.content || 'Gönderi içeriği burada canlı simüle ediliyor...'}</p>
                                    
                                    {editingPromo.button_text && (
                                        <div className="pt-2">
                                            <div className="w-full py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-xl text-blue-400 text-[10px] font-semibold text-center uppercase tracking-wider">
                                                {editingPromo.button_text}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex items-center gap-1.5 opacity-40">
                                <AlertCircle size={11} className="text-slate-550 text-slate-500" />
                                <span className="text-[9px] text-slate-550 text-slate-500 uppercase">Görünüm Telegram istemcisine göre değişebilir</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ReferralManagement = () => {
    const [referrals, setReferrals] = useState<any[]>([]);
    const [settings, setSettings] = useState<ReferralSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected'>('all');

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const [refs, sets] = await Promise.all([
                DatabaseService.getAllReferrals(),
                DatabaseService.getReferralSettings()
            ]);
            setReferrals(refs);
            setSettings(sets);
        } catch (e) {
            console.error("Referral Load Error:", e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleUpdateSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings) return;
        try {
            await DatabaseService.updateReferralSettings(settings);
            await DatabaseService.logActivity('admin', 'system', 'referral_settings_updated', 'Referans Ayarları Güncellendi', 'Referans sistemi ödülleri ve kuralları güncellendi.');
            setIsSettingsModalOpen(false);
            alert('Ayarlar kaydedildi.');
        } catch (e) { alert('Hata oluştu.'); }
    };

    const handleConfirm = async (refId: string) => {
        if (!confirm('Bu referansı onaylamak istediğinize emin misiniz? Ödül cüzdana eklenecektir.')) return;
        try {
            await DatabaseService.confirmReferral(refId);
            load();
        } catch (e) { alert('Hata oluştu.'); }
    };

    const filtered = referrals.filter(r => filter === 'all' || r.status === filter);

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight leading-none">Referans ve Davet Ödülleri</h2>
                    <p className="text-xs text-slate-400 mt-1 leading-normal">Kullanıcı davet zincirini, katılım doğrulamalarını ve ödül baremlerini yönetin</p>
                </div>
                <button 
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="w-full md:w-auto h-11 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    <SettingsIcon size={14} /> Sistem Ayarları
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} label="TOPLAM REFERANS" value={referrals.length.toString()} color="blue" />
                <StatCard icon={CheckCircle2} label="ONAYLANAN" value={referrals.filter(r => r.status === 'confirmed').length.toString()} color="emerald" />
                <StatCard icon={Clock} label="BEKLEYEN" value={referrals.filter(r => r.status === 'pending').length.toString()} color="orange" />
                <StatCard icon={TrendingUp} label="TOPLAM ÖDÜL" value={`₺${referrals.filter(r => r.status === 'confirmed').reduce((acc, r) => acc + r.reward_amount, 0).toLocaleString()}`} color="purple" />
            </div>

            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {['all', 'pending', 'confirmed', 'rejected'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-4 h-9 rounded-xl text-xs font-semibold transition-all border ${
                            filter === f 
                            ? 'bg-blue-600/10 border-blue-500/20 text-blue-400 shadow-sm' 
                            : 'bg-[#101626]/40 border-slate-800 text-slate-500 hover:text-slate-350 hover:border-slate-800'
                        }`}
                    >
                        {f === 'all' ? 'Tümü' : f === 'pending' ? 'Bekleyen' : f === 'confirmed' ? 'Onaylı' : 'Reddedilen'}
                    </button>
                ))}
            </div>

            <div className="bg-[#101626]/40 border border-slate-800/60 rounded-xl overflow-hidden ">
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#101626] border-b border-slate-800/60 text-[10px] text-slate-400 font-semibold">
                            <tr>
                                <th className="px-5 py-3">DAVET EDEN</th>
                                <th className="px-5 py-3">KATILAN ÜYE</th>
                                <th className="px-5 py-3">TARİH</th>
                                <th className="px-5 py-3">DURUM</th>
                                <th className="px-5 py-3 text-right">AKSİYON</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                            {isLoading ? (
                                <tr><td colSpan={5} className="py-16 text-center"><Loader2 className="animate-spin text-blue-500 mx-auto" size={24} /></td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={5} className="py-16 text-center text-slate-500 text-xs font-medium">Referans kaydı veya başvuru bulunmuyor.</td></tr>
                            ) : filtered.map(r => (
                                <tr key={r.id} className="hover:bg-slate-900/10 transition-all text-slate-300 text-xs">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={r.referrer?.avatar || `https://ui-avatars.com/api/?name=${r.referrer?.username}`} className="w-8 h-8 rounded-lg border border-slate-800" />
                                            <div>
                                                <p className="font-semibold text-slate-200">@{r.referrer?.username || 'Bilinmiyor'}</p>
                                                <p className="text-[10px] text-slate-500">ID: {r.referrer_id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={r.referred?.avatar || `https://ui-avatars.com/api/?name=${r.referred?.username}`} className="w-8 h-8 rounded-lg border border-slate-800" />
                                            <div>
                                                <p className="font-semibold text-slate-200">@{r.referred?.username || 'Bilinmiyor'}</p>
                                                <p className="text-[10px] text-slate-500">ID: {r.referred_id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-slate-400 text-[11px]">{new Date(r.created_at).toLocaleString()}</td>
                                    <td className="px-5 py-4">
                                        <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                                            r.status === 'confirmed' ? 'bg-emerald-500/10 border-emerald-500/10 text-emerald-400' :
                                            r.status === 'pending' ? 'bg-amber-500/10 border-amber-500/10 text-amber-500' :
                                            'bg-rose-500/10 border-rose-500/10 text-rose-400'
                                        }`}>
                                            {r.status === 'confirmed' ? 'Onaylı' : r.status === 'pending' ? 'Beklemede' : 'Reddedildi'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        {r.status === 'pending' && (
                                            <button 
                                                onClick={() => handleConfirm(r.id)}
                                                className="h-7 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-semibold transition-all shadow-sm"
                                            >
                                                Onayla
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden divide-y divide-slate-800/40">
                    {isLoading ? (
                        <div className="py-16 text-center"><Loader2 className="animate-spin text-blue-500 mx-auto" size={24} /></div>
                    ) : filtered.length === 0 ? (
                        <div className="py-16 text-center text-slate-505 text-slate-500 text-xs font-medium">Referans kaydı bulunmuyor</div>
                    ) : filtered.map(r => (
                        <div key={r.id} className="p-4 space-y-4 hover:bg-slate-900/10 transition-all text-xs">
                            <div className="flex justify-between items-start">
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-2.5">
                                        <img src={r.referrer?.avatar || `https://ui-avatars.com/api/?name=${r.referrer?.username}`} className="w-7 h-7 rounded border border-slate-800" />
                                        <div>
                                            <p className="text-[10px] text-slate-500">DAVET EDEN</p>
                                            <p className="font-semibold text-slate-205 text-slate-200">@{r.referrer?.username || 'Bilinmiyor'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <img src={r.referred?.avatar || `https://ui-avatars.com/api/?name=${r.referred?.username}`} className="w-7 h-7 rounded border border-slate-800" />
                                        <div>
                                            <p className="text-[10px] text-slate-500">KATILAN ÜYE</p>
                                            <p className="font-semibold text-slate-205 text-slate-200">@{r.referred?.username || 'Bilinmiyor'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${
                                        r.status === 'confirmed' ? 'bg-emerald-500/10 border-emerald-500/10 text-emerald-400' :
                                        r.status === 'pending' ? 'bg-amber-500/10 border-amber-500/10 text-amber-500' :
                                        'bg-rose-500/10 border-rose-500/10 text-rose-400'
                                    }`}>
                                        {r.status === 'confirmed' ? 'Onaylı' : r.status === 'pending' ? 'Beklemede' : 'Reddedildi'}
                                    </span>
                                    <p className="text-[10px] text-slate-500">{new Date(r.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            {r.status === 'pending' && (
                                <button 
                                    onClick={() => handleConfirm(r.id)}
                                    className="w-full h-8 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-semibold transition-all shadow-sm"
                                >
                                    Referansı Onayla ve Ödül Tanımla
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {isSettingsModalOpen && settings && (
                <div className="fixed inset-0 z-[110] bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#0b0f19] border border-slate-802 border-slate-800/60 rounded-2xl w-full max-w-xl overflow-hidden relative shadow-2xl p-6 space-y-5">
                        <button onClick={() => setIsSettingsModalOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-450 hover:text-white transition-all active:scale-95">
                            <X size={14} />
                        </button>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                                    <SettingsIcon size={18} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-white">Referans Sistemi Kuralları</h3>
                                    <p className="text-[10px] text-slate-500 leading-normal">Davet ve ödül kazanma mekanizması kuralları</p>
                                </div>
                            </div>

                            <form onSubmit={handleUpdateSettings} className="space-y-4 pt-1">
                                <div className="grid grid-cols-2 gap-4">
                                    <AdminInput label="Standart Davet Ödülü (TRY)" value={settings.standard_reward} onChange={(v:any)=>setSettings({...settings, standard_reward: Number(v)})} />
                                    <AdminInput label="Premium Üye Ödülü (TRY)" value={settings.premium_reward} onChange={(v:any)=>setSettings({...settings, premium_reward: Number(v)})} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <AdminInput label="Minimum Aktiflik Günü" value={settings.min_days_active} onChange={(v:any)=>setSettings({...settings, min_days_active: Number(v)})} />
                                    <AdminInput label="Bekleme Süresi (Cüzdan Saati)" value={settings.pending_duration_hours} onChange={(v:any)=>setSettings({...settings, pending_duration_hours: Number(v)})} />
                                </div>
                                <AdminInput label="Telegram Doğrulama Grup ID" value={settings.group_id} onChange={(v:any)=>setSettings({...settings, group_id: v})} />
                                
                                <div className="flex items-center justify-between p-3 bg-[#101626]/40 border border-slate-800/80 rounded-xl">
                                    <div className="flex flex-col gap-0.5 max-w-[70%]">
                                        <span className="text-xs font-semibold text-slate-200">Grup Katılım Zorunluluğu</span>
                                        <span className="text-[9px] text-slate-500 leading-normal">Kullanıcı daveti kabul etmeden önce doğrulama grubuna katılmak zorundadır.</span>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setSettings({...settings, require_group_join: !settings.require_group_join})}
                                        className={`w-10 h-6 rounded-full transition-all relative ${settings.require_group_join ? 'bg-blue-600' : 'bg-slate-800'}`}
                                    >
                                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${settings.require_group_join ? 'left-4.5' : 'left-0.5'}`} />
                                    </button>
                                </div>

                                <button type="submit" className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs transition-all shadow-sm">
                                    Kuralları ve Ayarları Kaydet
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const BlogManagement = () => {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBlog, setEditingBlog] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'content' | 'meta' | 'settings' | 'hashtags'>('content');
    const [searchQuery, setSearchQuery] = useState('');

    const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);

    const calculateReadTime = (content: string) => {
        if (!content || content.trim().length === 0) return "1 dk";
        
        // Remove HTML tags if present
        const plainText = content.replace(/<[^>]*>/g, ' ');
        
        // Count words (supporting Turkish characters and splitting by any whitespace)
        const words = plainText.trim().split(/\s+/).filter(w => w.length > 0).length;
        
        // Standard reading speed: ~225 words per minute
        const minutes = Math.max(1, Math.ceil(words / 225));
        
        return `${minutes} ${minutes > 1 ? 'dk' : 'dk'} okuma`;
    };

    const generateAISlug = async (titleOverride?: string) => {
        const titleToUse = titleOverride || editingBlog?.title;
        if (!titleToUse) return;

        setIsGeneratingSlug(true);
        try {
            const slug = await GeminiService.generateSlug(titleToUse);
            setEditingBlog((prev: any) => ({ ...prev, slug }));
        } catch (e) {
            console.error("Slug generation failed:", e);
            // Fallback manual slug
            const manualSlug = titleToUse.toLowerCase()
                .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
                .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
                .replace(/ /g, '-')
                .replace(/[^\w-]+/g, '');
            setEditingBlog((prev: any) => ({ ...prev, slug: manualSlug }));
        } finally {
            setIsGeneratingSlug(false);
        }
    };

    useEffect(() => {
        if (editingBlog?.content) {
            const time = calculateReadTime(editingBlog.content);
            if (time !== editingBlog.readTime) {
                setEditingBlog((prev: any) => ({ ...prev, readTime: time }));
            }
        }
    }, [editingBlog?.content]);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await DatabaseService.getBlogs();
            setBlogs(data);
        } catch (e) {
            console.error("Blogs Load Error:", e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const openCreateModal = () => {
        setEditingBlog({
            id: '',
            title: '',
            content: '',
            excerpt: '',
            image: '',
            author: 'BotlyHub Team',
            category: 'Haberler',
            date: new Date().toISOString(),
            readTime: '1 dk',
            isFeatured: false,
            slug: '',
            hashtags: []
        });
        setIsModalOpen(true);
        setActiveTab('content');
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...editingBlog };
            if (!payload.slug) {
                payload.slug = payload.title.toLowerCase()
                    .replace(/ /g, '-')
                    .replace(/[^\w-]+/g, '');
            }
            if (!payload.id || payload.id === '') {
                delete payload.id;
            }
            await DatabaseService.saveBlog(payload);
            await DatabaseService.logActivity('admin', 'system', 'blog_saved', 'Blog Kaydedildi', `${editingBlog.title} başlıklı blog guncellendi/olusturuldu.`);
            setIsModalOpen(false);
            load();
            alert('Blog başarıyla kaydedildi.');
        } catch (err: any) {
            console.error("Save Blog Error:", err);
            alert(`Hata: ${err.message || 'Blog kaydedilemedi.'}`);
        }
    };

    const filteredBlogs = blogs.filter(b => 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight leading-none">Blog ve Yayın Yönetimi</h2>
                    <p className="text-xs text-slate-400 mt-1 leading-normal">Portal blog yazılarını, duyuruları, SEO etiketlerini ve makaleleri düzenleyin</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                        <input 
                            type="text"
                            placeholder="Makalelerde ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-64 h-10 bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 text-xs font-medium text-slate-200 placeholder-slate-500 outline-none focus:border-slate-700 transition-all"
                        />
                    </div>
                    <button 
                        onClick={openCreateModal}
                        className="h-10 bg-blue-600 hover:bg-blue-500 px-4 rounded-xl text-xs font-semibold text-white transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Plus size={14} /> Yeni Yazı Oluştur
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={FileText} label="TOPLAM İÇERİK" value={blogs.length.toString()} color="blue" />
                <StatCard icon={TrendingUp} label="GÖRÜNTÜLENME" value={blogs.reduce((acc, b) => acc + (b.views_count || 0), 0).toString()} color="emerald" />
                <StatCard icon={Heart} label="TOPLAM BEĞENİ" value={blogs.reduce((acc, b) => acc + (b.likes_count || 0), 0).toString()} color="red" />
                <StatCard icon={Zap} label="AKTİF KATEGORİ" value={new Set(blogs.map(b => b.category)).size.toString()} color="amber" />
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={28} /></div>
            ) : filteredBlogs.length === 0 ? (
                <div className="py-16 text-center bg-[#101626]/20 rounded-xl border border-dashed border-slate-800">
                    <FileText size={36} className="mx-auto text-slate-600 mb-3" />
                    <p className="text-slate-400 text-xs font-semibold uppercase">Yayınlanmış Blog Bulunmuyor</p>
                    <p className="text-[11px] text-slate-500 mt-1">İlk makalenizi veya blog yazınızı oluşturarak başlayın.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredBlogs.map(blog => (
                        <div key={blog.id} className="bg-[#101626]/40 border border-slate-800/60 rounded-xl overflow-hidden flex flex-col group hover:border-slate-800 transition-all duration-300 relative">
                            <div className="h-40 relative overflow-hidden bg-slate-950 shrink-0">
                                {blog.image ? (
                                    <img src={blog.image} alt={blog.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                                ) : (
                                    <div className="w-full h-full bg-slate-900/60 flex items-center justify-center text-slate-700">
                                        <BookOpen size={28} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                                <div className="absolute top-4 left-4">
                                    <span className="bg-slate-900/80 backdrop-blur-md text-slate-300 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-slate-800">{blog.category}</span>
                                </div>
                                {blog.is_featured && (
                                    <div className="absolute top-4 right-4">
                                        <div className="bg-amber-500/10 border border-amber-500/25 p-1.5 rounded-lg text-amber-500 backdrop-blur-md">
                                            <Star size={12} fill="currentColor" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-semibold text-white leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">
                                        {blog.title}
                                    </h4>
                                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                                        {blog.excerpt || 'Özet belirtilmemiş.'}
                                    </p>
                                </div>

                                <div className="pt-3 border-t border-slate-800/50 flex items-center justify-between">
                                    <div className="flex gap-2.5">
                                        <div className="flex items-center gap-1">
                                            <Eye size={12} className="text-slate-500" />
                                            <span className="text-[11px] font-medium text-slate-500">{blog.views_count || 0} okuma</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={12} className="text-slate-500" />
                                            <span className="text-[11px] font-medium text-slate-500">{blog.readTime || '1 dk'}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <button onClick={() => { setEditingBlog(blog); setIsModalOpen(true); setActiveTab('content'); }} className="h-7 w-7 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg flex items-center justify-center transition-all">
                                            <Edit3 size={13}/>
                                        </button>
                                        <button onClick={async () => { if(confirm('Bu yazıyı silmek istediğinizde emin misiniz?')) { await DatabaseService.deleteBlog(blog.id); await DatabaseService.logActivity('admin', 'system', 'blog_deleted', 'Blog Silindi', `${blog.title} başlıklı blog silindi.`); load(); } }} className="h-7 w-7 bg-slate-900 border border-slate-850 text-rose-500/80 hover:text-rose-400 rounded-lg flex items-center justify-center transition-all">
                                            <Trash2 size={13}/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && editingBlog && (
                <div className="fixed inset-0 z-[110] bg-black/80 flex items-end lg:items-center justify-center p-0 lg:p-6 backdrop-blur-md animate-in duration-250">
                    <div className="bg-[#0b0f19] border-t lg:border border-slate-800 rounded-t-2xl lg:rounded-2xl w-full max-w-5xl h-[92vh] lg:h-[82vh] flex flex-col lg:flex-row overflow-hidden relative shadow-2xl">
                        
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 z-[120] p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-450 hover:text-white transition-all active:scale-95">
                            <X size={14} />
                        </button>

                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="p-6 pb-2 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-blue-600/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                                        <BookOpen size={16} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-white">Blog Yazarı & Editör</h3>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest italic">POST COMPOSER</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
                                <div className="space-y-6">
                                    <div className="flex gap-1 bg-[#101626]/60 p-1 rounded-xl border border-slate-800/60 shrink-0">
                                        {['content', 'meta', 'hashtags', 'settings'].map(tab => (
                                            <button 
                                                key={tab}
                                                type="button"
                                                onClick={() => setActiveTab(tab as any)}
                                                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-550 text-slate-500 hover:text-slate-300'}`}
                                            >
                                                {tab === 'content' ? 'İçerik' : tab === 'meta' ? 'Yayın Bilgileri' : tab === 'hashtags' ? 'Etiketler' : 'Gelişmiş'}
                                            </button>
                                        ))}
                                    </div>

                                    <form onSubmit={handleSave} className="space-y-6">
                                        
                                        {activeTab === 'content' && (
                                            <div className="space-y-4 animate-in fade-in duration-200">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Yazı Başlığı</label>
                                                        <span className="text-[9px] text-slate-500">{(editingBlog.title || '').length} Karakter</span>
                                                    </div>
                                                    <input 
                                                        value={editingBlog.title} 
                                                        onChange={e => setEditingBlog({...editingBlog, title: e.target.value})} 
                                                        onBlur={() => {
                                                            if (editingBlog.title && !editingBlog.slug) {
                                                                generateAISlug(editingBlog.title);
                                                            }
                                                        }}
                                                        placeholder="Manşet başlığı..."
                                                        className="w-full h-11 bg-slate-900 border border-slate-800 rounded-xl px-4 text-xs font-medium text-white placeholder-slate-600 outline-none focus:border-slate-700 transition-all" 
                                                    />
                                                </div>
                                                
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Ana İçerik (Markdown/HTML)</label>
                                                        <div className="flex items-center gap-2 text-[9px] text-slate-500">
                                                            <span>{(editingBlog.content || '').length} Karakter</span>
                                                            <div className="w-1 h-1 rounded-full bg-slate-800" />
                                                            <span className="text-emerald-500 font-semibold">{editingBlog.readTime}</span>
                                                        </div>
                                                    </div>
                                                    <textarea 
                                                        value={editingBlog.content} 
                                                        onChange={e => setEditingBlog({...editingBlog, content: e.target.value})} 
                                                        placeholder="Makale metnini markdown veya HTML formatında yazabilirsiniz..."
                                                        className="w-full bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs font-normal h-64 lg:h-80 outline-none text-slate-300 focus:border-slate-700 leading-relaxed no-scrollbar resize-none" 
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'meta' && (
                                            <div className="space-y-4 animate-in fade-in duration-200">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Özet (Excerpt)</label>
                                                    <textarea 
                                                        value={editingBlog.excerpt} 
                                                        onChange={e => setEditingBlog({...editingBlog, excerpt: e.target.value})} 
                                                        placeholder="Listeleme sayfasında listelenecek kısa özet cümle..."
                                                        className="w-full h-20 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-slate-700 resize-none font-medium" 
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <AdminInput label="Kategori" value={editingBlog.category} onChange={(v:any)=>setEditingBlog({...editingBlog, category:v})} />
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Okuma Süresi (Oto)</label>
                                                        <input 
                                                            readOnly
                                                            value={editingBlog.readTime} 
                                                            className="w-full h-10 bg-slate-900/60 border border-slate-800 rounded-xl px-4 text-xs font-semibold text-slate-500 outline-none" 
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <AdminInput label="Yazar İsmi" value={editingBlog.author} onChange={(v:any)=>setEditingBlog({...editingBlog, author:v})} />
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Kalıcı Bağlantı (Slug)</label>
                                                            <button 
                                                                type="button"
                                                                onClick={() => generateAISlug()}
                                                                disabled={isGeneratingSlug}
                                                                className="text-[10px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 disabled:opacity-50"
                                                            >
                                                                {isGeneratingSlug ? <Loader2 size={11} className="animate-spin" /> : <Zap size={11} />}
                                                                AI ile Oluştur
                                                            </button>
                                                        </div>
                                                        <input 
                                                            value={editingBlog.slug} 
                                                            onChange={(e) => setEditingBlog({...editingBlog, slug: e.target.value})} 
                                                            placeholder="baslik-url-formatinda"
                                                            className="w-full h-10 bg-slate-900 border border-slate-800 rounded-xl px-4 text-xs font-medium text-white placeholder-slate-650 outline-none focus:border-slate-700"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'hashtags' && (
                                            <div className="space-y-4 animate-in fade-in duration-200">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Etiketler (Enter ile Ekleyin)</label>
                                                    <div className="flex flex-wrap gap-1.5 p-3 bg-slate-900 border border-slate-800 rounded-xl">
                                                        {editingBlog.hashtags?.map((tag: string, i: number) => (
                                                            <span key={i} className="flex items-center gap-1 bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md text-[11px] font-medium border border-blue-500/15">
                                                                #{tag}
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => setEditingBlog({...editingBlog, hashtags: editingBlog.hashtags.filter((_:any, idx:any) => idx !== i)})}
                                                                    className="hover:text-red-400 shrink-0"
                                                                >
                                                                    <X size={10} />
                                                                </button>
                                                            </span>
                                                        ))}
                                                        <input 
                                                            type="text"
                                                            placeholder="Yeni etiket ismi..."
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' || e.key === ',') {
                                                                    e.preventDefault();
                                                                    const val = e.currentTarget.value.trim().replace(/#/g, '').replace(/,/g, '');
                                                                    if (val && !editingBlog.hashtags?.includes(val)) {
                                                                        setEditingBlog({
                                                                            ...editingBlog,
                                                                            hashtags: [...(editingBlog.hashtags || []), val]
                                                                        });
                                                                    }
                                                                    e.currentTarget.value = '';
                                                                }
                                                            }}
                                                            className="bg-transparent border-none outline-none text-xs text-white ml-1 flex-1 min-w-[120px]"
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-slate-500">Virgül veya Enter tuşuna basarak ardarda kelimeler ekleyebilirsiniz.</p>
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'settings' && (
                                            <div className="space-y-4 animate-in fade-in duration-200">
                                                <AdminInput label="Öne Çıkan Görsel URL" value={editingBlog.image} onChange={(v:any)=>setEditingBlog({...editingBlog, image:v})} icon={ImageIcon} />
                                                
                                                <div className="flex items-center justify-between p-4 bg-[#101626]/40 border border-slate-800/80 rounded-xl">
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-200">Öne Çıkan Makale</p>
                                                        <p className="text-[10px] text-slate-500 mt-0.5">Blog sayfasında manşetten büyük gösterilir</p>
                                                    </div>
                                                    <button 
                                                        type="button"
                                                        onClick={() => setEditingBlog({...editingBlog, isFeatured: !editingBlog.isFeatured})}
                                                        className={`w-10 h-6 rounded-full transition-all relative ${editingBlog.isFeatured ? 'bg-amber-500' : 'bg-slate-800'}`}
                                                    >
                                                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${editingBlog.isFeatured ? 'left-4.5' : 'left-0.5'}`} />
                                                    </button>
                                                </div>

                                                <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-start gap-3">
                                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 shrink-0">
                                                        <Info size={14} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide">SEO İpucu</p>
                                                        <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                                                            Google arama sonuçlarında üst sıralarda yer bulmak için ana başlığınızı (H1) yazı içinde hiyerarşik alt başlıklar (H2, H3) ve organik SEO anahtar kelimeleriyle desteklemek zengin indeksleme sağlar.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="fixed lg:relative bottom-0 left-0 right-0 p-4 lg:p-0 bg-gradient-to-t from-[#0b0f19] lg:from-transparent via-[#0b0f19] lg:via-transparent to-transparent z-[130]">
                                            <button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2">
                                                <Send size={13} /> Değişiklikleri Kaydet ve Yayınla
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: LIVE BLOG PREVIEW SIMULATOR */}
                        <div className="hidden lg:flex w-80 bg-slate-950/20 border-l border-slate-800/60 p-6 flex-col items-center justify-center shrink-0">
                            <div className="text-center mb-6 space-y-1">
                                <span className="text-[9px] font-semibold text-blue-400 uppercase tracking-wildest block">ÖNİZLEME MOTORU</span>
                                <h4 className="text-xs font-semibold text-slate-500 uppercase">Mobil Simülasyonu</h4>
                            </div>

                            <div className="w-full max-w-[210px] aspect-[9/16] bg-slate-900 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-xl relative">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-800 rounded-b-xl z-20"></div>
                                
                                <div className="h-full flex flex-col bg-[#020617] text-left">
                                    <div className="h-24 bg-slate-800/80 relative shrink-0">
                                        {editingBlog.image ? (
                                            <img src={editingBlog.image} alt="" className="w-full h-full object-cover opacity-65 animate-fade-in" referrerPolicy="no-referrer" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-700">
                                                <ImageIcon size={20} />
                                            </div>
                                        )}
                                        <div className="absolute bottom-2 left-3">
                                            <span className="bg-blue-600 px-1.5 py-0.5 rounded text-[8px] font-semibold text-white uppercase">{editingBlog.category || 'Haberler'}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="p-3 space-y-2 flex-grow">
                                        <h5 className="text-white font-semibold text-xs leading-tight line-clamp-3">
                                            {editingBlog.title || 'Manşet Başlığı Yok'}
                                        </h5>
                                        <div className="flex items-center gap-1.5 text-slate-500 text-[9px]">
                                            <div className="w-3.5 h-3.5 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                <UserPlus size={8} className="text-blue-400" />
                                            </div>
                                            <span className="truncate">@{editingBlog.author.replace(/ /g, '').toLowerCase() || 'yazar'}</span>
                                        </div>
                                        <div className="space-y-1.5 opacity-20">
                                            <div className="h-1 w-full bg-slate-700 rounded-full"></div>
                                            <div className="h-1 w-full bg-slate-700 rounded-full"></div>
                                            <div className="h-1 w-2/3 bg-slate-700 rounded-full"></div>
                                        </div>
                                    </div>

                                    <div className="p-3 mt-auto shrink-0">
                                        <div className="w-full h-7 bg-blue-500/10 border border-blue-500/15 rounded-lg flex items-center justify-center">
                                            <span className="text-blue-400 text-[9px] font-semibold">OKUMAYA BAŞLA</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <p className="text-[10px] text-slate-500 mt-6 leading-normal text-center">İçeriklerin masaüstü ve mobil ekranlardaki anlık hiyerarşik dizilimi</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
