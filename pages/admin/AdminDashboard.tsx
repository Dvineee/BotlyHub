
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, Users, LogOut, Menu, X, 
  Loader2, Plus, Trash2, Megaphone, Send, Activity, 
  Wallet, Search, Database, Radio, Bell, Edit3, Image as ImageIcon,
  CheckCircle2, AlertTriangle, TrendingUp, BarChart3, RadioIcon, Sparkles, UserPlus,
  ShieldCheck, ShieldAlert, Globe, Zap, Clock, ExternalLink, Filter, PieChart, Layers, 
  Settings as SettingsIcon, History, Copy, Check, Eye, ChevronRight, Monitor, Smartphone, Cpu, Save, Key,
  Info, Star, MousePointer2, Link2, AlertCircle, Shield, Calendar, Hash, Heart, Gift, Bot as BotIcon
} from 'lucide-react';
import { DatabaseService } from '../../services/DatabaseService';
import { GeminiService } from '../../services/GeminiService';
import { GoogleGenAI, Type } from "@google/genai";
import { User, Bot as BotType, Announcement, Promotion, ActivityLog, Notification, Referral, ReferralSettings } from '../../types';

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
      className={`flex items-center gap-4 px-6 py-4 rounded-[24px] transition-all duration-300 ${active ? 'bg-brand text-white shadow-2xl shadow-brand/40' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}
    >
      <Icon size={18} />
      <span className="font-black text-[10px] uppercase tracking-[0.2em]">{label}</span>
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
    <div className="dark min-h-screen bg-[#020617] flex text-slate-200 overflow-hidden font-sans">
      {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[65] lg:hidden animate-in fade-in" onClick={() => setSidebarOpen(false)}></div>
      )}

      <aside className={`fixed inset-y-0 left-0 z-[70] w-72 bg-[#020617] border-r border-white/5 transition-transform duration-500 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-8">
          <div className="flex items-center gap-4 mb-14">
            <div className="w-12 h-12 shrink-0">
                <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_15px_rgba(34,158,217,0.2)]">
                  <g transform="rotate(26 150 150)">
                    <polygon points="150,85 225,195 75,195" fill="#229ED9" opacity="0.9"/>
                    <line x1="150" y1="85" x2="225" y2="195" stroke="#FF8A3D" strokeWidth="38" strokeLinecap="round" strokeOpacity="0.85"/>
                    <line x1="75" y1="195" x2="150" y2="85" stroke="#22C55E" strokeWidth="38" strokeLinecap="round" strokeOpacity="0.85"/>
                    <line x1="225" y1="195" x2="75" y2="195" stroke="#229ED9" strokeWidth="38" strokeLinecap="round" strokeOpacity="0.85"/>
                  </g>
                </svg>
            </div>
            <div>
                <h2 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">Botly<span className="text-brand">Hub</span></h2>
                <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.4em] mt-1.5 block">Kurumsal Konsol</span>
            </div>
          </div>
          
            <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
            <NavItem to="/a/dashboard" icon={LayoutDashboard} label="Panel" active={location.pathname === '/a/dashboard'} onClick={() => setSidebarOpen(false)} />
            <div className="pt-8 pb-3 px-6"><span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">İzleme</span></div>
            <NavItem to="/a/dashboard/users" icon={Users} label="Kullanıcılar" active={location.pathname.startsWith('/a/dashboard/users')} onClick={() => setSidebarOpen(false)} />
            <NavItem to="/a/dashboard/admin-logs" icon={ShieldCheck} label="Admin Logları" active={location.pathname.startsWith('/a/dashboard/admin-logs')} onClick={() => setSidebarOpen(false)} />
            <NavItem to="/a/dashboard/user-logs" icon={History} label="Üye Hareketleri" active={location.pathname.startsWith('/a/dashboard/user-logs')} onClick={() => setSidebarOpen(false)} />
            <NavItem to="/a/dashboard/sales" icon={Wallet} label="Finans" active={location.pathname.startsWith('/a/dashboard/sales')} onClick={() => setSidebarOpen(false)} />
            <NavItem to="/a/dashboard/referrals" icon={UserPlus} label="Referanslar" active={location.pathname.startsWith('/a/dashboard/referrals')} onClick={() => setSidebarOpen(false)} />
            
            <div className="pt-8 pb-3 px-6"><span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">İçerik</span></div>
            <NavItem to="/a/dashboard/bots" icon={BotIcon} label="Market Botları" active={location.pathname.startsWith('/a/dashboard/bots')} onClick={() => setSidebarOpen(false)} />
            <NavItem to="/a/dashboard/promotions" icon={RadioIcon} label="Tanıtım Motoru" active={location.pathname.startsWith('/a/dashboard/promotions')} onClick={() => setSidebarOpen(false)} />
            <NavItem to="/a/dashboard/announcements" icon={Megaphone} label="Duyuru Merkezi" active={location.pathname.startsWith('/a/dashboard/announcements')} onClick={() => setSidebarOpen(false)} />
            <NavItem to="/a/dashboard/notifications" icon={Bell} label="Bildirim Gönder" active={location.pathname.startsWith('/a/dashboard/notifications')} onClick={() => setSidebarOpen(false)} />
            
            <div className="pt-8 pb-3 px-6"><span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Sistem</span></div>
            <NavItem to="/a/dashboard/settings" icon={SettingsIcon} label="Sistem Ayarları" active={location.pathname.startsWith('/a/dashboard/settings')} onClick={() => setSidebarOpen(false)} />
          </nav>

          <button onClick={() => { DatabaseService.logoutAdmin(); navigate('/a/admin'); }} className="mt-8 flex items-center gap-4 px-8 py-5 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/10 rounded-[24px] transition-all group border border-transparent hover:border-red-500/20">
            <LogOut size={18} /> Çıkış Yap
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-6 lg:px-10 bg-[#020617]/80 backdrop-blur-2xl z-50">
           <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-3 bg-slate-900 border border-white/5 rounded-xl text-slate-400 active:scale-95 transition-all">
              <Menu size={20}/>
           </button>
           
           <div className="flex items-center gap-4 lg:gap-8 ml-auto">
              <div className="hidden sm:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">CANLI SİSTEM</span>
              </div>
              <motion.div 
                  animate={{ 
                    boxShadow: [
                      "0 0 20px rgba(37, 99, 235, 0.2)",
                      "0 0 40px rgba(37, 99, 235, 0.6)",
                      "0 0 20px rgba(37, 99, 235, 0.2)"
                    ],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-gradient-to-br from-brand to-brand/80 flex items-center justify-center font-black text-white italic text-xl shadow-xl shadow-brand/20"
               >
                 A
               </motion.div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-12 no-scrollbar">
          <div className="max-w-7xl mx-auto space-y-12 pb-24">
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
        blue: 'text-brand bg-brand/10 border-brand/20',
        purple: 'text-brand bg-brand/10 border-brand/20',
        emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20'
    };
    return (
        <div className="bg-slate-900/40 border border-white/5 p-6 lg:p-10 rounded-[32px] lg:rounded-[48px] hover:border-white/10 transition-all group overflow-hidden">
            <div className={`w-10 h-10 lg:w-14 lg:h-14 ${colors[color]} rounded-[18px] lg:rounded-[20px] border flex items-center justify-center mb-4 lg:mb-8 shadow-xl group-hover:scale-110 transition-all`}><Icon size={24} /></div>
            <p className="text-[8px] lg:text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</p>
            <h3 className="text-xl lg:text-3xl font-black text-white tracking-tighter italic leading-none">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
        </div>
    );
};

const AdminInput = ({ label, value, onChange, type = "text", placeholder = "", icon: Icon }: any) => (
    <div className="space-y-2 text-white group">
        <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4 group-focus-within:text-blue-500 transition-colors italic">{label}</label>
        <div className="relative">
            {Icon && <Icon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-brand transition-colors" size={18} />}
            <input 
                type={type} 
                value={value} 
                onChange={e => onChange(e.target.value)} 
                placeholder={placeholder}
                className={`w-full h-14 lg:h-18 bg-slate-950 border border-white/5 rounded-[22px] lg:rounded-[28px] ${Icon ? 'pl-14' : 'px-8'} pr-8 text-[11px] font-black text-white outline-none focus:border-brand transition-all uppercase italic shadow-inner`} 
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

    if (isLoading) return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-brand" size={32} /></div>;

    return (
        <div className="animate-in fade-in duration-700 space-y-12">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl lg:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">Kurumsal <span className="text-brand">Genel Bakış</span></h1>
                <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.5em] italic">Platform büyüme ve performans metrikleri</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                <StatCard icon={Users} label="Toplam Üye" value={stats.userCount} color="blue" />
                <StatCard icon={BotIcon} label="Aktif Botlar" value={stats.botCount} color="purple" />
                <StatCard icon={BarChart3} label="Satış Adedi" value={stats.salesCount} color="orange" />
                <StatCard icon={TrendingUp} label="Toplam Ciro" value={`₺${stats.totalRevenue.toLocaleString()}`} color="emerald" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 p-8 lg:p-12 rounded-[40px] lg:rounded-[56px] shadow-2xl relative overflow-hidden group">
                    <h3 className="text-base lg:text-xl font-black italic uppercase tracking-tight mb-8">Büyüme Hızı (Haftalık)</h3>
                    <div className="h-32 lg:h-48 flex items-end gap-2 lg:gap-3 px-2">
                        {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                            <div key={i} className="flex-1 bg-gradient-to-t from-blue-600 to-indigo-400 rounded-t-xl transition-all duration-1000" style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600/20 to-transparent border border-blue-500/10 p-8 lg:p-12 rounded-[40px] lg:rounded-[56px] flex flex-col justify-center relative overflow-hidden">
                    <Sparkles className="absolute -top-6 -right-6 text-blue-500/20 w-32 h-32" />
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] mb-4 italic">GÜNLÜK RAPOR</p>
                    <p className="text-white text-xl lg:text-3xl font-black italic uppercase tracking-tighter leading-none mb-3">Sistemler <span className="text-emerald-500">Optimum</span></p>
                    <p className="text-slate-500 text-[10px] lg:text-sm font-bold leading-relaxed uppercase opacity-70">Operasyonel verimlilik %99.8. Kayıt hızı artışı %14.</p>
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
    const [copiedId, setCopiedId] = useState(false);
    const [activeTab, setActiveTab] = useState<'info' | 'media' | 'pricing'>('info');

    const load = useCallback(async () => {
        setIsLoading(true);
        setBots(await DatabaseService.getBotsWithStats());
        setIsLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const openCreateModal = () => {
        setEditingBot({
            id: generateUniqueId(),
            name: '',
            description: '',
            price: 0,
            category: 'utilities',
            bot_link: '@',
            icon: '',
            screenshots: [],
            is_official: false,
            telegram_group: '',
            website_url: '',
            app_url: '',
            social_url: ''
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

    return (
        <div className="space-y-12 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl lg:text-4xl font-black text-white italic uppercase tracking-tighter leading-none">Market <span className="text-brand">Envanteri</span></h2>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mt-2 italic">Platform envanterini profesyonelce yönetin</p>
                </div>
                <button 
                    onClick={openCreateModal}
                    className="w-full md:w-auto bg-brand hover:opacity-90 px-8 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-brand/40 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                    <Plus size={18} /> YENİ ÜRÜN TANIMLA
                </button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 className="animate-spin text-brand" size={40} />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Veriler Senkronize Ediliyor...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {bots.map(b => (
                        <div key={b.id} className="bg-slate-900/40 border border-white/5 rounded-[32px] lg:rounded-[56px] p-6 lg:p-10 flex flex-col gap-6 lg:gap-8 group hover:border-brand/30 transition-all relative overflow-hidden shadow-2xl backdrop-blur-sm">
                            <div className="flex justify-between items-start relative z-10">
                                <div className="relative">
                                    <img 
                                        src={getLiveBotIcon(b.bot_link)} 
                                        className="w-14 h-14 lg:w-20 lg:h-20 rounded-[24px] lg:rounded-[32px] border border-white/10 shadow-2xl object-cover bg-slate-950 group-hover:rotate-6 group-hover:scale-105 transition-all" 
                                        onError={(e) => (e.target as any).src = `https://ui-avatars.com/api/?name=${b.name}`}
                                    />
                                    {b.price > 0 && <div className="absolute -top-2 -right-2 w-6 h-6 lg:w-7 lg:h-7 bg-brand rounded-xl flex items-center justify-center shadow-lg border-4 border-[#020617]"><Zap size={10} fill="currentColor" /></div>}
                                </div>
                                <div className="flex gap-2">
                                    {b.is_official && (
                                        <div className="px-3 py-1 bg-brand/10 border border-brand/20 rounded-lg flex items-center gap-1.5">
                                            <ShieldCheck size={10} className="text-brand" />
                                            <span className="text-[8px] font-black text-brand uppercase tracking-widest">OFFICIAL</span>
                                        </div>
                                    )}
                                    <button onClick={() => { setEditingBot(b); setIsModalOpen(true); }} className="p-2.5 lg:p-3 bg-white/5 rounded-xl hover:bg-brand text-slate-500 hover:text-white transition-all"><Edit3 size={16}/></button>
                                    <button onClick={async () => { if(confirm('Silsin mi?')) { await DatabaseService.deleteBot(b.id); await DatabaseService.logActivity('admin', 'bot_manage', 'bot_deleted', 'Bot Silindi', `${b.name} isimli bot sistemden silindi.`); load(); } }} className="p-2.5 lg:p-3 bg-white/5 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <h4 className="text-lg lg:text-2xl font-black text-white italic uppercase tracking-tighter truncate leading-none mb-2 lg:mb-3">{b.name}</h4>
                                <p className="text-[9px] lg:text-[10px] text-slate-600 line-clamp-2 leading-relaxed font-bold uppercase italic h-8 lg:h-10">{b.description}</p>
                            </div>

                            <div className="flex items-center justify-between pt-4 lg:pt-6 border-t border-white/5 relative z-10">
                                <p className="text-base lg:text-lg font-black uppercase text-brand italic tracking-tighter leading-none">{b.price > 0 ? `${b.price} TL` : 'ÜCRETSİZ'}</p>
                                <p className="text-base lg:text-lg font-black uppercase text-white italic tracking-tighter leading-none">{b.ownerCount || 0} <span className="text-[8px] text-slate-700">LİSANS</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && editingBot && (
                <div className="fixed inset-0 z-[110] bg-black/95 flex items-end lg:items-center justify-center p-0 lg:p-8 backdrop-blur-3xl animate-in slide-in-from-bottom lg:fade-in">
                    <div className="bg-[#020617] border-t lg:border border-white/10 rounded-t-[40px] lg:rounded-[64px] w-full max-w-7xl h-[94vh] lg:h-[90vh] flex flex-col lg:flex-row overflow-hidden shadow-2xl relative">
                        
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 lg:top-8 lg:right-8 z-[120] p-3 lg:p-4 bg-white/5 rounded-2xl hover:bg-red-600 transition-all active:scale-90">
                            <X size={20} />
                        </button>

                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="p-8 lg:p-12 pb-4 lg:pb-0 space-y-8">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-brand to-brand/80 rounded-[20px] flex items-center justify-center shadow-xl rotate-3">
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
                                            className={`flex-1 py-3 lg:py-4 rounded-[20px] lg:rounded-[22px] text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'text-slate-500 hover:bg-white/5'}`}
                                        >
                                            {tab === 'info' ? 'DETAY' : tab === 'pricing' ? 'LİSANS' : 'GALERİ'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-8 pb-32 lg:pb-12">
                                <form onSubmit={async (e) => { e.preventDefault(); await DatabaseService.saveBot(editingBot); await DatabaseService.logActivity('admin', 'bot_manage', 'bot_saved', 'Bot Kaydedildi', `${editingBot.name} isimli bot bilgileri güncellendi/oluşturuldu.`); setIsModalOpen(false); load(); }} className="space-y-8">
                                    {activeTab === 'info' && (
                                        <div className="space-y-8 animate-in slide-in-from-left-4">
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
                                                <AdminInput label="@KULLANICIADI" value={editingBot.bot_link} onChange={(v:any)=>setEditingBot({...editingBot, bot_link:v})} />
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4">KATEGORİ</label>
                                                    <select value={editingBot.category} onChange={e => setEditingBot({...editingBot, category: e.target.value})} className="w-full h-14 lg:h-18 bg-slate-950 border border-white/5 rounded-[22px] lg:rounded-[28px] px-8 text-[11px] font-black text-white outline-none focus:border-brand uppercase italic appearance-none">
                                                        <option value="utilities">Araçlar & Servisler</option>
                                                        <option value="finance">Finans & Ekonomi</option>
                                                        <option value="games">Eğlence & Oyun</option>
                                                        <option value="productivity">Verimlilik & İş</option>
                                                    </select>
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
                                                                    ? 'bg-brand text-white shadow-lg'
                                                                    : 'bg-white/5 text-slate-500 hover:bg-white/10'
                                                                }`}
                                                            >
                                                                {lang}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 md:col-span-2">
                                                    <AdminInput label="TELEGRAM GRUP (@)" value={editingBot.telegram_group} onChange={(v:any)=>setEditingBot({...editingBot, telegram_group:v})} placeholder="@groupname" />
                                                    <AdminInput label="WEB SİTE URL" value={editingBot.website_url} onChange={(v:any)=>setEditingBot({...editingBot, website_url:v})} placeholder="https://..." />
                                                    <AdminInput label="APP URL" value={editingBot.app_url} onChange={(v:any)=>setEditingBot({...editingBot, app_url:v})} placeholder="https://..." />
                                                    <AdminInput label="SOSYAL MEDYA URL" value={editingBot.social_url} onChange={(v:any)=>setEditingBot({...editingBot, social_url:v})} placeholder="https://..." />
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
                                                    <button type="button" onClick={()=>setEditingBot({...editingBot, is_official: !editingBot.is_official})} className={`w-full h-14 lg:h-18 rounded-[22px] lg:rounded-[28px] flex items-center justify-center gap-3 transition-all font-black text-[10px] tracking-widest ${editingBot.is_official ? 'bg-brand text-white shadow-xl shadow-brand/40' : 'bg-slate-950 text-slate-600 border border-white/5'}`}>
                                                        {editingBot.is_official ? 'OFFICIAL BOT' : 'STANDARD BOT'}
                                                    </button>
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
                                                    <button type="button" onClick={() => { const inp = document.getElementById('scr_input') as HTMLInputElement; handleScreenshotAdd(inp.value); inp.value = ''; }} className="h-14 lg:h-16 px-8 bg-brand text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">EKLE</button>
                                                </div>
                                                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 px-2">
                                                    {(editingBot.screenshots || []).map((url: string, idx: number) => (
                                                        <div key={idx} className="relative w-28 lg:w-32 h-44 lg:h-52 shrink-0 bg-slate-950 rounded-2xl lg:rounded-[28px] border border-white/5 overflow-hidden group shadow-2xl">
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
                                        <button type="submit" className="w-full h-16 lg:h-24 bg-brand text-white rounded-2xl lg:rounded-[32px] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-brand/40 transition-all border-b-8 border-blue-800 active:translate-y-1 active:border-b-4 flex items-center justify-center gap-4">
                                            <Database size={20} /> SİSTEMİ GÜNCELLE
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
            <div className="relative w-full max-w-5xl bg-slate-900 border border-white/10 rounded-[44px] lg:rounded-[64px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 lg:p-12 border-b border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <img src={user.avatar} className="w-16 h-16 lg:w-24 lg:h-24 rounded-[24px] lg:rounded-[32px] object-cover border border-white/10 shadow-2xl" />
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
                                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner">
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
                                                    <img src={bot.icon || getLiveBotIcon(bot.bot_link)} className="w-14 h-14 rounded-2xl object-cover border border-white/5 shadow-xl" />
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
                                            className="px-10 py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-blue-900/40 transition-all flex items-center gap-3"
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
                                                    <div className="bg-slate-950/50 border border-white/5 p-5 rounded-2xl flex items-center gap-4 group-hover:border-white/10 transition-all shadow-lg">
                                                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-500 shadow-inner group-hover:text-blue-500 transition-colors">
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
        <div className="space-y-10 animate-in fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Kullanıcı <span className="text-blue-500">Kayıtları</span></h2>
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
                    <input type="text" placeholder="Üye ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full h-14 bg-slate-900 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-[10px] outline-none focus:border-blue-500 text-white font-black italic uppercase" />
                </div>
            </div>
            <div className="bg-slate-900/40 border border-white/5 rounded-[44px] overflow-hidden shadow-2xl">
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-[9px] uppercase tracking-[0.4em] text-slate-700 font-black">
                            <tr><th className="px-10 py-8">KİMLİK & ÜYE</th><th className="px-10 py-8">ROL</th><th className="px-10 py-8">DURUM</th><th className="px-10 py-8 text-right">AKSİYONLAR</th></tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map(u => (
                                <tr key={u.id} className="hover:bg-white/5 transition-all text-white">
                                    <td className="px-10 py-8 font-black italic text-sm truncate max-w-[200px]">@{u.username}</td>
                                    <td className="px-10 py-8"><span className="text-[10px] font-black text-slate-500 uppercase italic">{u.role === 'Admin' ? 'ADMİN' : 'ÜYE'}</span></td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col gap-2">
                                            <div className={`flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest ${u.status === 'Active' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                <div className={`w-2 h-2 rounded-full ${u.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>{u.status === 'Active' ? 'AKTİF' : 'PASİF'}
                                            </div>
                                            {u.isRestricted && (
                                                <div className="flex items-center gap-2 text-[8px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 w-fit">
                                                    <ShieldAlert size={10} /> KISITLI
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => setSelectedUser(u)}
                                                className="px-6 py-3 bg-white/5 rounded-xl text-[9px] font-black uppercase hover:bg-white/10 transition-all tracking-widest"
                                            >
                                                YÖNET
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
                                                className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                                                title="Sil"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden divide-y divide-white/5">
                    {filtered.map(u => (
                        <div key={u.id} className="p-6 space-y-4 hover:bg-white/5 transition-all">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white italic text-lg shadow-lg">
                                        {u.username?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-white italic uppercase tracking-tighter">@{u.username}</p>
                                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">{u.role === 'Admin' ? 'ADMİN' : 'ÜYE'}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${u.status === 'Active' ? 'text-emerald-500' : 'text-red-500'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                                        {u.status === 'Active' ? 'AKTİF' : 'PASİF'}
                                    </div>
                                    {u.isRestricted && (
                                        <div className="text-[7px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                                            KISITLI
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setSelectedUser(u)}
                                    className="flex-1 py-4 bg-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5"
                                >
                                    YÖNET
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
                                    className="px-6 py-4 bg-red-500/10 text-red-500 rounded-2xl transition-all border border-red-500/10"
                                >
                                    <Trash2 size={16} />
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
        <div className="space-y-10 animate-in fade-in">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Sistem <span className="text-blue-500">Ayarları</span></h2>
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mt-2 italic">Platform genel yapılandırmasını yönetin</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900/40 border border-white/5 p-8 lg:p-12 rounded-[44px] space-y-8">
                    <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border transition-all ${settings?.maintenanceMode ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                            <AlertTriangle size={32} />
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-white uppercase italic">Bakım Modu</h4>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Tüm kullanıcı erişimini kısıtlar</p>
                        </div>
                    </div>

                    <div className="p-8 bg-slate-950/50 rounded-3xl border border-white/5 space-y-6">
                        <p className="text-slate-400 text-xs font-bold leading-relaxed uppercase italic opacity-70">
                            Bakım modu aktif edildiğinde, adminler hariç tüm kullanıcılar "Bakımdayız" sayfasıyla karşılaşır. Kritik güncellemeler sırasında kullanılması önerilir.
                        </p>
                        
                        <button 
                            onClick={toggleMaintenance}
                            disabled={isSaving}
                            className={`w-full py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-2xl ${
                                settings?.maintenanceMode 
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20' 
                                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20'
                            }`}
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : (settings?.maintenanceMode ? <Check size={16} /> : <AlertTriangle size={16} />)}
                            {settings?.maintenanceMode ? 'BAKIM MODUNU KAPAT' : 'BAKIM MODUNU AÇ'}
                        </button>
                    </div>
                </div>

                <div className="bg-slate-900/40 border border-white/5 p-8 lg:p-12 rounded-[44px] space-y-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-3xl flex items-center justify-center border bg-blue-500/10 border-blue-500/20 text-blue-500">
                            <Megaphone size={32} />
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-white uppercase italic">Görsel & Metin</h4>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Versiyon yönetimi</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">UYGULAMA VERSİYONU</label>
                            <input 
                                type="text"
                                value={settings?.version || ''}
                                onChange={e => setSettings({ ...settings, version: e.target.value })}
                                className="w-full h-16 px-6 bg-slate-950/50 border border-white/5 rounded-2xl text-xs font-black text-white focus:border-blue-500/40 outline-none transition-all uppercase italic"
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
                            className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-900/20"
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            AYARLARI KAYDET
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
        <div className="space-y-10 animate-in fade-in">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">
                        {filterType === 'admin' ? 'Yönetici' : 'Üye'} <span className="text-blue-500">Logları</span>
                    </h2>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mt-2 italic">
                        {filterType === 'admin' ? 'Yönetici işlemlerini takip edin' : 'Kullanıcı hareketlerini detaylıca izleyin'}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input 
                            type="text"
                            placeholder="KULLANICI ID VEYA İŞLEM ARA..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-80 h-14 bg-slate-950 border border-white/5 rounded-[22px] pl-14 pr-8 text-[11px] font-black text-white outline-none focus:border-blue-500 transition-all uppercase italic shadow-inner"
                        />
                    </div>
                    
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
                        {types.map(t => (
                            <button
                                key={t}
                                onClick={() => setActiveTypeFilter(t)}
                                className={`px-6 h-14 rounded-[22px] text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                                    activeTypeFilter === t 
                                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                                    : 'bg-slate-900/40 border-white/5 text-slate-500 hover:border-white/10'
                                }`}
                            >
                                {translateType(t)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 className="animate-spin text-blue-500" size={40} />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Loglar Yükleniyor...</span>
                </div>
            ) : filteredLogs.length === 0 ? (
                <div className="py-32 text-center bg-slate-900/20 rounded-[44px] border-2 border-dashed border-slate-900">
                    <History size={48} className="mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Sonuç Bulunamadı</p>
                    <p className="text-[10px] text-slate-700 mt-2 italic font-medium">Arama kriterlerinizi değiştirmeyi deneyin.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredLogs.map(log => (
                        <div 
                            key={log.id} 
                            onClick={() => setSelectedLog(log)}
                            className="bg-slate-900/40 border border-white/5 p-6 lg:p-8 rounded-[32px] lg:rounded-[40px] flex items-center gap-6 group hover:border-white/10 transition-all relative overflow-hidden cursor-pointer active:scale-[0.99]"
                        >
                            <div className={`w-12 h-12 shrink-0 bg-white/5 rounded-2xl flex items-center justify-center ${typeColors[log.type] || 'text-white'} shadow-inner`}><Activity size={20} /></div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-1 gap-2">
                                    <div className="flex items-center gap-3">
                                        <h4 className="font-black text-white italic text-sm lg:text-base uppercase truncate">{log.title}</h4>
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded bg-white/5 border border-white/5 ${typeColors[log.type] || 'text-slate-500'} uppercase tracking-widest`}>{translateType(log.type)}</span>
                                    </div>
                                    <span className="text-[8px] lg:text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                        <Clock size={10} /> {new Date(log.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-slate-500 text-[10px] font-bold uppercase italic truncate opacity-80 mb-2">{log.description}</p>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <Users size={10} className="text-slate-700" />
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">
                                            {log.user?.name ? `${log.user.name} (@${log.user.username})` : `ID: ${log.user_id}`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Zap size={10} className="text-slate-700" />
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">ANAHTAR: {log.action_key}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedLog && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 lg:p-10">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setSelectedLog(null)}></div>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[40px] lg:rounded-[56px] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
                    >
                        <div className="p-8 lg:p-12 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className={`w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center ${typeColors[selectedLog.type] || 'text-white'}`}>
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl lg:text-2xl font-black text-white uppercase italic tracking-tighter">İşlem <span className="text-blue-500">Detayı</span></h3>
                                    <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] mt-1 italic">LOG REF: {selectedLog.id.slice(0, 8)}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedLog(null)} className="p-3 bg-white/5 rounded-xl hover:bg-red-600 transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-8">
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-950/50 border border-white/5 p-5 rounded-2xl space-y-1">
                                        <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic">İşlem Tipi</span>
                                        <p className={`text-xs font-black uppercase italic ${typeColors[selectedLog.type]}`}>{translateType(selectedLog.type)}</p>
                                    </div>
                                    <div className="bg-slate-950/50 border border-white/5 p-5 rounded-2xl space-y-1">
                                        <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic">Tarih</span>
                                        <p className="text-xs font-black text-white uppercase italic">{new Date(selectedLog.created_at).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-950/50 border border-white/5 p-6 rounded-3xl space-y-2">
                                    <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic">Başlık</span>
                                    <p className="text-sm font-black text-white uppercase italic leading-tight">{selectedLog.title}</p>
                                </div>

                                <div className="bg-slate-950/50 border border-white/5 p-6 rounded-3xl space-y-2">
                                    <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic">Açıklama</span>
                                    <p className="text-xs font-bold text-slate-400 uppercase italic leading-relaxed">{selectedLog.description}</p>
                                </div>

                                <div className="bg-slate-950/50 border border-white/5 p-6 rounded-3xl space-y-4">
                                    <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic">Kullanıcı Bilgileri</span>
                                    <div className="flex items-center gap-4">
                                        <img src={selectedLog.user?.avatar || `https://ui-avatars.com/api/?name=${selectedLog.user_id}`} className="w-12 h-12 rounded-xl object-cover border border-white/10" />
                                        <div>
                                            <p className="text-xs font-black text-white uppercase italic">{selectedLog.user?.name || 'Bilinmeyen Kullanıcı'}</p>
                                            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">@{selectedLog.user?.username || 'bilinmiyor'}</p>
                                            <p className="text-[8px] font-bold text-slate-600 mt-1">KULLANICI ID: {selectedLog.user_id}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-950/50 border border-white/5 p-6 rounded-3xl space-y-2">
                                    <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic">İşlem Anahtarı (Action Key)</span>
                                    <div className="flex items-center gap-2 bg-slate-900 p-3 rounded-xl border border-white/5">
                                        <Zap size={14} className="text-blue-500" />
                                        <code className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{selectedLog.action_key}</code>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 lg:p-12 bg-slate-950/50 border-t border-white/5">
                            <button 
                                onClick={() => setSelectedLog(null)}
                                className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all"
                            >
                                KAPAT
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
        <div className="space-y-10 animate-in fade-in">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl lg:text-4xl font-black text-white italic uppercase tracking-tighter leading-none">Finans <span className="text-blue-500">Merkezi</span></h2>
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mt-2 italic">Platform gelirlerini ve ödeme akışlarını izleyin</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                <StatCard icon={TrendingUp} label="TOPLAM CİRO (TRY)" value={`₺${stats.totalRevenue.toLocaleString()}`} color="emerald" />
                <StatCard icon={Zap} label="TON GELİRİ" value={`${stats.tonRevenue.toLocaleString()} TON`} color="blue" />
                <StatCard icon={Star} label="STARS GELİRİ" value={`${stats.starsRevenue.toLocaleString()} ⭐`} color="purple" />
                <StatCard icon={Wallet} label="TRY GELİRİ" value={`₺${stats.tryRevenue.toLocaleString()}`} color="orange" />
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {['all', 'completed', 'pending', 'failed'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-6 h-12 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                            filter === f 
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                            : 'bg-slate-900/40 border-white/5 text-slate-500 hover:border-white/10'
                        }`}
                    >
                        {f === 'all' ? 'TÜMÜ' : f === 'completed' ? 'TAMAMLANDI' : f === 'pending' ? 'BEKLEYEN' : 'İPTAL'}
                    </button>
                ))}
            </div>

            <div className="bg-slate-900/40 border border-white/5 rounded-[44px] overflow-hidden shadow-2xl">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <Loader2 className="animate-spin text-blue-500" size={40} />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">İşlemler Yükleniyor...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-32 text-center">
                        <History size={48} className="mx-auto text-slate-600 mb-4" />
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">İşlem Bulunamadı</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-[9px] uppercase tracking-[0.4em] text-slate-700 font-black">
                                    <tr>
                                        <th className="px-10 py-8">MÜŞTERİ</th>
                                        <th className="px-10 py-8">ÜRÜN / TİP</th>
                                        <th className="px-10 py-8">TARİH</th>
                                        <th className="px-10 py-8">DURUM</th>
                                        <th className="px-10 py-8 text-right">TUTAR</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filtered.map((t) => (
                                        <tr key={t.id} className="hover:bg-white/5 transition-all text-white">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-4">
                                                    <img src={t.user?.avatar || `https://ui-avatars.com/api/?name=${t.user?.username}`} className="w-10 h-10 rounded-xl border border-white/5" />
                                                    <div>
                                                        <p className="text-sm font-black italic uppercase tracking-tighter">@{t.user?.username || 'Guest'}</p>
                                                        <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">ID: {t.user_id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-black uppercase tracking-tight">{t.item_id}</span>
                                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{t.item_type}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">{new Date(t.created_at).toLocaleDateString()}</span>
                                                    <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">{new Date(t.created_at).toLocaleTimeString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <span className={`text-[9px] font-black px-3 py-1 rounded-lg border uppercase tracking-widest ${
                                                    t.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                                    t.status === 'pending' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                                                    'bg-red-500/10 border-red-500/20 text-red-500'
                                                }`}>
                                                    {t.status === 'completed' ? 'BAŞARILI' : t.status === 'pending' ? 'BEKLEMEDE' : 'İPTAL'}
                                                </span>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className={`text-lg font-black italic ${t.status === 'completed' ? 'text-emerald-500' : 'text-slate-500'}`}>
                                                        {t.currency === 'TRY' ? '₺' : ''}{t.amount} {t.currency !== 'TRY' ? t.currency : ''}
                                                    </span>
                                                    {t.tx_hash && (
                                                        <a href={`https://tonviewer.com/transaction/${t.tx_hash}`} target="_blank" className="text-[8px] text-blue-500 hover:underline uppercase font-black tracking-widest flex items-center gap-1">
                                                            TX <ExternalLink size={8} />
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
                        <div className="lg:hidden divide-y divide-white/5">
                            {filtered.map((t) => (
                                <div key={t.id} className="p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <img src={t.user?.avatar || `https://ui-avatars.com/api/?name=${t.user?.username}`} className="w-10 h-10 rounded-xl border border-white/5" />
                                            <div>
                                                <p className="text-sm font-black italic uppercase tracking-tighter text-white">@{t.user?.username || 'Guest'}</p>
                                                <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">ID: {t.user_id}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[8px] font-black px-2 py-1 rounded border uppercase tracking-widest ${
                                            t.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                            t.status === 'pending' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                                            'bg-red-500/10 border-red-500/20 text-red-500'
                                        }`}>
                                            {t.status === 'completed' ? 'BAŞARILI' : t.status === 'pending' ? 'BEKLEMEDE' : 'İPTAL'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">ÜRÜN / TİP</p>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black uppercase tracking-tight text-white">{t.item_id}</span>
                                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{t.item_type}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest mb-1">TUTAR</p>
                                            <span className={`text-lg font-black italic ${t.status === 'completed' ? 'text-emerald-500' : 'text-slate-500'}`}>
                                                {t.currency === 'TRY' ? '₺' : ''}{t.amount} {t.currency !== 'TRY' ? t.currency : ''}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-2">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{new Date(t.created_at).toLocaleDateString()}</span>
                                            <span className="text-[8px] text-slate-700 font-bold uppercase tracking-widest">{new Date(t.created_at).toLocaleTimeString()}</span>
                                        </div>
                                        {t.tx_hash && (
                                            <a href={`https://tonviewer.com/transaction/${t.tx_hash}`} target="_blank" className="h-8 px-4 bg-blue-600/10 text-blue-500 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-2 border border-blue-500/20">
                                                TX DETAY <ExternalLink size={10} />
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
            icon_name: 'Megaphone',
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
        <div className="space-y-12 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl lg:text-4xl font-black text-white italic uppercase tracking-tighter leading-none">Duyuru <span className="text-blue-500">Merkezi</span></h2>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mt-2 italic">Global platform duyurularını yönetin</p>
                </div>
                <button 
                    onClick={openCreateModal}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 px-8 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-blue-900/40 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                    <Plus size={18} /> YENİ DUYURU OLUŞTUR
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-32"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {anns.map(a => (
                        <div key={a.id} className="bg-slate-900/40 border border-white/5 rounded-[44px] p-8 lg:p-10 flex flex-col gap-6 group hover:border-blue-500/30 transition-all relative overflow-hidden shadow-2xl backdrop-blur-sm">
                            {a.bg_image_url && (
                                <div className="absolute inset-0 z-0">
                                    <img src={a.bg_image_url} alt="" className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity" referrerPolicy="no-referrer" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                                </div>
                            )}
                            <div className="flex justify-between items-start relative z-10">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl border border-white/5 ${a.is_active ? (a.bg_image_url ? 'bg-white/10 text-white backdrop-blur-md' : `bg-gradient-to-br ${previewColors[a.color_scheme] || 'bg-blue-600'} text-white`) : 'bg-slate-800 text-slate-600'}`}>
                                    {a.icon_name === 'Megaphone' ? <Megaphone size={24}/> : a.icon_name === 'Sparkles' ? <Sparkles size={24}/> : a.icon_name === 'Zap' ? <Zap size={24}/> : <Star size={24}/>}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditingAnn(a); setIsModalOpen(true); }} className="p-3 bg-white/5 rounded-xl hover:bg-blue-600 text-slate-500 hover:text-white transition-all"><Edit3 size={18}/></button>
                                    <button onClick={async () => { if(confirm('Silsin mi?')) { await DatabaseService.deleteAnnouncement(a.id); await DatabaseService.logActivity('admin', 'system', 'announcement_deleted', 'Duyuru Silindi', `${a.title} başlıklı duyuru silindi.`); load(); } }} className="p-3 bg-white/5 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-3">
                                    <h4 className="text-xl lg:text-2xl font-black text-white italic uppercase tracking-tighter truncate leading-none">{a.title}</h4>
                                    {!a.is_active && <span className="text-[8px] font-black bg-red-500/10 text-red-500 px-2 py-0.5 rounded-md">PASİF</span>}
                                </div>
                                <p className="text-[10px] text-slate-600 line-clamp-2 leading-relaxed font-bold uppercase italic h-10">{a.description}</p>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-white/5 relative z-10">
                                <span className={`text-[9px] font-black uppercase tracking-widest ${a.bg_image_url ? 'text-blue-400' : (a.color_scheme === 'purple' ? 'text-purple-500' : a.color_scheme === 'emerald' ? 'text-emerald-500' : a.color_scheme === 'orange' ? 'text-orange-500' : 'text-blue-500')}`}>
                                    {a.bg_image_url ? 'IMAGE BACKGROUND' : `${a.color_scheme.toUpperCase()} SCHEME`}
                                </span>
                                <ChevronRight size={18} className="text-slate-600" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && editingAnn && (
                <div className="fixed inset-0 z-[110] bg-black/95 flex items-end lg:items-center justify-center p-0 lg:p-8 backdrop-blur-3xl animate-in slide-in-from-bottom lg:fade-in">
                    <div className="bg-[#020617] border-t lg:border border-white/10 rounded-t-[40px] lg:rounded-[64px] w-full max-w-6xl h-[94vh] lg:h-[90vh] flex flex-col lg:flex-row overflow-hidden shadow-2xl relative">
                        
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 lg:top-8 lg:right-8 z-[120] p-3 lg:p-4 bg-white/5 rounded-2xl hover:bg-red-600 transition-all active:scale-90">
                            <X size={20} />
                        </button>

                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="p-8 lg:p-12 pb-4 lg:pb-0 space-y-8">
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br ${previewColors[editingAnn.color_scheme] || 'from-purple-600 to-indigo-600'} rounded-[20px] flex items-center justify-center shadow-xl rotate-3 transition-all duration-500`}>
                                        <Megaphone size={24} className="text-white"/>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl lg:text-3xl font-black uppercase italic tracking-tighter">Broadcast <span className="text-blue-500">Forge</span></h3>
                                        <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] mt-1 italic">V3.1 BROADCASTER</p>
                                    </div>
                                </div>

                                <div className="flex gap-2 bg-white/5 p-1.5 rounded-3xl border border-white/5">
                                    {['info', 'style', 'action'].map(tab => (
                                        <button 
                                            key={tab}
                                            onClick={() => setActiveTab(tab as any)}
                                            className={`flex-1 py-3 lg:py-4 rounded-[20px] lg:rounded-[22px] text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'text-slate-500 hover:bg-white/5'}`}
                                        >
                                            {tab === 'info' ? 'İÇERİK' : tab === 'style' ? 'GÖRÜNÜM' : 'EYLEM'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-8 pb-32 lg:pb-12">
                                <form onSubmit={handleSave} className="space-y-8">
                                    
                                    {activeTab === 'info' && (
                                        <div className="space-y-8 animate-in slide-in-from-left-4">
                                            <AdminInput label="BAŞLIK" value={editingAnn.title} onChange={(v:any)=>setEditingAnn({...editingAnn, title:v})} />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <AdminInput label="ROZET METNİ (SPONSORLU YERİNE)" value={editingAnn.badge_text} onChange={(v:any)=>setEditingAnn({...editingAnn, badge_text:v})} placeholder="Sponsorlu" />
                                                <AdminInput label="ETİKET (OPSİYONEL)" value={editingAnn.tag} onChange={(v:any)=>setEditingAnn({...editingAnn, tag:v})} placeholder="YENİ / SICAK" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">KISA AÇIKLAMA</label>
                                                <input value={editingAnn.description} onChange={e => setEditingAnn({...editingAnn, description: e.target.value})} className="w-full h-14 lg:h-18 bg-slate-950 border border-white/5 rounded-[22px] lg:rounded-[28px] px-8 text-[11px] font-black text-white outline-none focus:border-blue-500 uppercase italic shadow-inner" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">DETAYLI İÇERİK (POPUP)</label>
                                                <textarea value={editingAnn.content_detail} onChange={e => setEditingAnn({...editingAnn, content_detail: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-8 rounded-[36px] lg:rounded-[44px] text-[11px] font-black h-32 lg:h-40 outline-none text-slate-400 focus:border-blue-500/30 uppercase italic leading-relaxed" />
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'style' && (
                                        <div className="space-y-10 animate-in slide-in-from-left-4">
                                            {/* Arkaplan Tipi Seçimi */}
                                            <div className="space-y-4">
                                                <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">ARKAPLAN TİPİ</label>
                                                <div className="flex gap-2 bg-white/5 p-1.5 rounded-3xl border border-white/5">
                                                    <button 
                                                        type="button"
                                                        onClick={() => setEditingAnn({ ...editingAnn, bg_image_url: '' })}
                                                        className={`flex-1 py-3 rounded-[20px] text-[9px] font-black uppercase tracking-widest transition-all ${!editingAnn.bg_image_url ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:bg-white/5'}`}
                                                    >
                                                        RENK ŞEMASI
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={() => setEditingAnn({ ...editingAnn, bg_image_url: editingAnn.bg_image_url || 'https://' })}
                                                        className={`flex-1 py-3 rounded-[20px] text-[9px] font-black uppercase tracking-widest transition-all ${editingAnn.bg_image_url ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:bg-white/5'}`}
                                                    >
                                                        PNG GÖRSEL
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
                                                                    <span className="text-[8px] font-black text-white uppercase tracking-tighter drop-shadow-lg">{scheme.label}</span>
                                                                </div>
                                                                {editingAnn.color_scheme === scheme.id && (
                                                                    <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1 shadow-xl">
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
                                                            <p className="text-[10px] font-black text-white uppercase italic">GÖRSEL ÖNİZLEME</p>
                                                            <p className="text-[8px] font-bold text-slate-600 uppercase mt-1">Geçerli bir PNG URL'si girin.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* İkon Seçimi */}
                                            <div className="space-y-4">
                                                <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">İKON TİPİ</label>
                                                <div className="grid grid-cols-5 gap-4">
                                                    {[
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
                                                            className={`h-16 rounded-2xl flex items-center justify-center transition-all border ${
                                                                editingAnn.icon_name === item.id 
                                                                ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-900/40' 
                                                                : 'bg-slate-950 border-white/5 text-slate-600 hover:text-slate-400'
                                                            }`}
                                                        >
                                                            <item.icon size={20} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'action' && (
                                        <div className="space-y-8 animate-in slide-in-from-left-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <AdminInput label="BUTON METNİ" value={editingAnn.button_text} onChange={(v:any)=>setEditingAnn({...editingAnn, button_text:v})} />
                                                <AdminInput label="HEDEF URL / KULLANICIADI" value={editingAnn.button_link} onChange={(v:any)=>setEditingAnn({...editingAnn, button_link:v})} />
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">AKSİYON TİPİ</label>
                                                    <div className="flex gap-2">
                                                        {['link', 'popup'].map(type => (
                                                            <button 
                                                                key={type}
                                                                type="button" 
                                                                onClick={()=>setEditingAnn({...editingAnn, action_type: type})} 
                                                                className={`flex-1 h-14 rounded-2xl font-black text-[10px] uppercase transition-all ${editingAnn.action_type === type ? 'bg-blue-600 text-white shadow-xl' : 'bg-slate-950 text-slate-700 border border-white/5'}`}
                                                            >
                                                                {type === 'link' ? 'DIŞ BAĞLANTI' : 'İÇ POPUP'}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">DURUM</label>
                                                    <button type="button" onClick={()=>setEditingAnn({...editingAnn, is_active: !editingAnn.is_active})} className={`w-full h-14 rounded-2xl flex items-center justify-center gap-3 transition-all font-black text-[10px] tracking-widest ${editingAnn.is_active ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/40' : 'bg-red-950/20 text-red-500 border border-red-500/20'}`}>
                                                        {editingAnn.is_active ? 'YAYINDA' : 'DURDURULDU'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="fixed lg:relative bottom-0 left-0 right-0 p-6 lg:p-0 bg-gradient-to-t from-[#020617] lg:from-transparent via-[#020617]/90 lg:via-transparent to-transparent z-[130]">
                                        <button type="submit" className="w-full h-16 lg:h-24 bg-blue-600 text-white rounded-2xl lg:rounded-[32px] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-900/40 transition-all border-b-8 border-blue-800 active:translate-y-1 active:border-b-4 flex items-center justify-center gap-4">
                                            <Send size={20} /> DUYURUYU YAYINLA
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* RIGHT: LIVE HOLOGRAPHIC PREVIEW SIMULATOR */}
                        <div className="hidden lg:flex w-[440px] bg-slate-950/40 border-l border-white/5 p-12 flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent">
                            <div className="text-center mb-16 space-y-3">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.6em] italic block">LIVE PREVIEW</span>
                                <h4 className="text-xl font-black text-white italic tracking-widest opacity-20 uppercase">Display Simulator</h4>
                            </div>

                            <div className="w-full max-w-[320px] h-44 rounded-[40px] transition-all duration-700 p-8 relative overflow-hidden shadow-2xl transform hover:rotate-2 group">
                                {/* Dinamik Arkaplan */}
                                {editingAnn.bg_image_url ? (
                                    <div className="absolute inset-0 z-0">
                                        <img src={editingAnn.bg_image_url} alt="" className="w-full h-full object-cover opacity-40" referrerPolicy="no-referrer" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                    </div>
                                ) : (
                                    <div className={`absolute inset-0 bg-gradient-to-br ${previewColors[editingAnn.color_scheme] || previewColors.purple} transition-all duration-700`}></div>
                                )}
                                
                                <div className="relative z-10 flex flex-col h-full overflow-hidden">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="px-2 py-0.5 rounded-full bg-white/20 border border-white/20 flex items-center gap-1">
                                            <span className="text-[7px] font-black text-white uppercase tracking-wider">{editingAnn.badge_text || 'Sponsorlu'}</span>
                                        </div>
                                        {editingAnn.tag && (
                                            <div className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10">
                                                <span className="text-[7px] font-black text-white/70 uppercase tracking-wider">{editingAnn.tag}</span>
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-white font-black text-xl mb-1 tracking-tighter italic uppercase leading-tight line-clamp-2 shrink-0 whitespace-normal">{editingAnn.title || 'Başlık Yok'}</h3>
                                    <p className="text-white/70 text-[9px] font-bold uppercase tracking-tight line-clamp-3 overflow-hidden whitespace-normal">{editingAnn.description || 'Açıklama girilmedi.'}</p>
                                </div>
                                {!editingAnn.bg_image_url && (
                                    <div className="absolute -right-6 -bottom-6 opacity-20 transform rotate-12 transition-all duration-700 group-hover:scale-125">
                                        {editingAnn.icon_name === 'Megaphone' ? <Megaphone size={140} className="text-white" /> : 
                                         editingAnn.icon_name === 'Sparkles' ? <Sparkles size={140} className="text-white" /> : 
                                         editingAnn.icon_name === 'Zap' ? <Zap size={140} className="text-white" /> : 
                                         <Star size={140} className="text-white" />}
                                    </div>
                                )}
                            </div>

                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-10 italic">Gerçek zamanlı görünüm simülasyonu</p>
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
        <div className="space-y-12 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl lg:text-4xl font-black text-white italic uppercase tracking-tighter leading-none">Inbox <span className="text-blue-500">Controller</span></h2>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mt-2 italic">Kullanıcı bildirimlerini anlık yönetin</p>
                </div>
                <button 
                    onClick={() => { setNewNote({ title: '', message: '', type: 'system', target_type: 'global', user_id: '' }); setIsModalOpen(true); }}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 px-8 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-blue-900/40 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                    <Plus size={18} /> YENİ BİLDİRİM TETİKLE
                </button>
            </div>

            <div className="bg-slate-900/40 border border-white/5 rounded-[44px] overflow-hidden shadow-2xl">
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-[9px] uppercase tracking-[0.4em] text-slate-700 font-black">
                            <tr>
                                <th className="px-10 py-8">BAŞLIK & TİP</th>
                                <th className="px-10 py-8">HEDEF</th>
                                <th className="px-10 py-8 text-center">GÖRÜNTÜLENME</th>
                                <th className="px-10 py-8">TARİH</th>
                                <th className="px-10 py-8 text-right">AKSİYON</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {notes.map(n => (
                                <tr key={n.id} className="hover:bg-white/5 transition-all text-white group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl bg-white/5 ${n.type === 'payment' ? 'text-emerald-500' : n.type === 'security' ? 'text-red-500' : 'text-blue-500'}`}>
                                                {n.type === 'payment' ? <Wallet size={16}/> : n.type === 'security' ? <ShieldCheck size={16}/> : <Bell size={16}/>}
                                            </div>
                                            <div>
                                                <p className="font-black italic uppercase text-sm">{n.title}</p>
                                                <p className="text-[9px] text-slate-600 font-bold uppercase">{n.type} LOG</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8"><span className="text-[10px] font-black text-slate-400 uppercase italic">{n.target_type === 'global' ? 'GLOBAL' : `USER: ${n.user_id}`}</span></td>
                                    <td className="px-10 py-8 text-center">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                                            <Eye size={12} className="text-blue-500" />
                                            <span className="text-[11px] font-black text-white">{n.view_count || 0}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-slate-600 text-[10px] font-bold uppercase">{new Date(n.date).toLocaleString()}</td>
                                    <td className="px-10 py-8 text-right">
                                        <button onClick={async () => { if(confirm('Silsin mi?')) { await DatabaseService.deleteNotification(n.id); await DatabaseService.logActivity('admin', 'system', 'notification_deleted', 'Bildirim Silindi', `${n.title} başlıklı bildirim silindi.`); load(); } }} className="p-3 bg-white/5 rounded-xl text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card List */}
                <div className="lg:hidden p-4 space-y-3">
                    {notes.map(n => (
                        <div key={n.id} className="p-6 bg-white/5 rounded-3xl space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-white/5 ${n.type === 'payment' ? 'text-emerald-500' : n.type === 'security' ? 'text-red-500' : 'text-blue-500'}`}><Bell size={14}/></div>
                                    <p className="font-black text-white italic uppercase text-xs">{n.title}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500">
                                        <Eye size={10}/> {n.view_count || 0}
                                    </div>
                                    <button onClick={async () => { await DatabaseService.deleteNotification(n.id); load(); }} className="text-red-500"><Trash2 size={14}/></button>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-600 uppercase font-black italic">{n.message}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* NOTIFICATION FORGE MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[110] bg-black/95 flex items-end lg:items-center justify-center p-0 lg:p-8 backdrop-blur-3xl animate-in slide-in-from-bottom lg:fade-in">
                    <div className="bg-[#020617] border-t lg:border border-white/10 rounded-t-[40px] lg:rounded-[64px] w-full max-w-6xl h-[94vh] lg:h-[90vh] flex flex-col lg:flex-row overflow-hidden shadow-2xl relative">
                        
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 lg:top-8 lg:right-8 z-[120] p-3 lg:p-4 bg-white/5 rounded-2xl hover:bg-red-600 transition-all active:scale-90">
                            <X size={20} />
                        </button>

                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="p-8 lg:p-12 pb-4 lg:pb-0 space-y-8">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[20px] flex items-center justify-center shadow-xl rotate-3">
                                        <Bell size={24} className="text-white"/>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl lg:text-3xl font-black uppercase italic tracking-tighter">Inbox <span className="text-blue-500">Forge</span></h3>
                                        <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] mt-1 italic">V3.5 NOTIFIER</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-8 pb-32 lg:pb-12">
                                <form onSubmit={handleSend} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">BİLDİRİM TİPİ</label>
                                            <div className="flex gap-2">
                                                {['system', 'payment', 'security', 'bot'].map(t => (
                                                    <button key={t} type="button" onClick={()=>setNewNote({...newNote, type: t})} className={`flex-1 py-4 rounded-2xl text-[8px] font-black uppercase tracking-widest transition-all ${newNote.type === t ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'bg-slate-950 text-slate-600 border border-white/5'}`}>{t}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">HEDEF KİTLE</label>
                                            <div className="flex gap-2">
                                                {['global', 'user'].map(t => (
                                                    <button key={t} type="button" onClick={()=>setNewNote({...newNote, target_type: t})} className={`flex-1 py-4 rounded-2xl text-[8px] font-black uppercase tracking-widest transition-all ${newNote.target_type === t ? 'bg-blue-600 text-white shadow-xl' : 'bg-slate-950 text-slate-600 border border-white/5'}`}>{t === 'global' ? 'HERKESE' : 'SPESİFİK'}</button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {newNote.target_type === 'user' && (
                                        <AdminInput label="HEDEF KULLANICI ID" value={newNote.user_id} onChange={(v:any)=>setNewNote({...newNote, user_id:v})} />
                                    )}

                                    <AdminInput label="BİLDİRİM BAŞLIĞI" value={newNote.title} onChange={(v:any)=>setNewNote({...newNote, title:v})} />
                                    
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">BİLDİRİM MESAJI</label>
                                        <textarea value={newNote.message} onChange={e => setNewNote({...newNote, message: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-8 rounded-[36px] lg:rounded-[44px] text-[11px] font-black h-32 lg:h-40 outline-none text-slate-400 focus:border-blue-500/30 uppercase italic leading-relaxed shadow-inner" />
                                    </div>

                                    <div className="fixed lg:relative bottom-0 left-0 right-0 p-6 lg:p-0 bg-gradient-to-t from-[#020617] lg:from-transparent via-[#020617]/90 lg:via-transparent to-transparent z-[130]">
                                        <button type="submit" className="w-full h-16 lg:h-24 bg-blue-600 text-white rounded-2xl lg:rounded-[32px] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-900/40 transition-all border-b-8 border-blue-800 active:translate-y-1 active:border-b-4 flex items-center justify-center gap-4">
                                            <Send size={20} /> BİLDİRİMİ TETİKLE
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* RIGHT: LIVE HOLOGRAPHIC INBOX SIMULATOR */}
                        <div className="hidden lg:flex w-[480px] bg-slate-950/40 border-l border-white/5 p-12 flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent">
                            <div className="text-center mb-16 space-y-3">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.6em] italic block">INBOX SYNC</span>
                                <h4 className="text-xl font-black text-white italic tracking-widest opacity-20 uppercase">Simulator</h4>
                            </div>

                            <div className="w-full max-w-[340px] perspective-1000 group">
                                <div className="bg-slate-900/80 border border-white/10 rounded-[56px] p-8 shadow-[0_50px_100px_rgba(0,0,0,0.5)] transition-all duration-700 hover:rotate-1 hover:scale-105 backdrop-blur-md relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.8)]"></div>
                                    <div className="flex gap-5 mb-6 relative z-10">
                                        <div className="w-14 h-14 bg-slate-950 rounded-2xl border border-white/5 flex items-center justify-center text-blue-500 shadow-inner">
                                            {newNote.type === 'payment' ? <Wallet size={24}/> : <Bell size={24}/>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h5 className="text-sm font-black text-white italic uppercase tracking-tighter truncate leading-none">{newNote.title || 'Bildirim Başlığı'}</h5>
                                                <span className="text-[8px] text-slate-600 font-bold uppercase mt-1">NOW</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase italic leading-relaxed line-clamp-2">{newNote.message || 'Bildirim içeriği burada görünecek...'}</p>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-white/5 flex justify-between items-center relative z-10">
                                        <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">{newNote.type} LOG</span>
                                        <div className="flex gap-1">
                                            <div className="w-1 h-1 rounded-full bg-blue-600"></div>
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
        <div className="space-y-12 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">Promo <span className="text-blue-500">Engine</span></h2>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mt-2 italic">Kanallar üzerinden toplu reklam dağıtımı yapın</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <button 
                        onClick={openAIModal} 
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 px-8 py-5 rounded-[28px] text-[11px] font-black uppercase tracking-widest shadow-2xl active:scale-95 border-b-4 border-blue-900 transition-all flex items-center justify-center gap-3"
                    >
                        <Sparkles size={18} /> AI İLE OLUŞTUR
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
                        className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 px-8 py-5 rounded-[28px] text-[11px] font-black uppercase tracking-widest shadow-2xl active:scale-95 border-b-4 border-emerald-900 transition-all flex items-center justify-center gap-3"
                    >
                        <Plus size={18} /> MANUEL OLUŞTUR
                    </button>
                </div>
            </div>

            {isLoading && updatingId === null ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Senkronize Ediliyor...</span>
                </div>
            ) : promos.length === 0 ? (
                <div className="bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[48px] p-24 text-center">
                    <Megaphone size={48} className="text-slate-600 mx-auto mb-6" />
                    <p className="text-slate-600 font-black uppercase italic tracking-widest">Henüz bir kampanya tanımlanmadı.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {promos.map(p => (
                        <div key={p.id} className="bg-slate-900/40 border border-white/5 rounded-[48px] p-6 lg:p-10 flex flex-col lg:flex-row items-center justify-between group shadow-2xl hover:border-blue-500/20 transition-all gap-8">
                            <div className="flex-1 min-w-0 text-center lg:text-left w-full">
                                <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                                    {getStatusBadge(p.status)}
                                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em]">{new Date(p.created_at).toLocaleDateString()}</span>
                                </div>
                                <h4 className="text-xl lg:text-2xl font-black italic uppercase text-white truncate mb-6">{p.title}</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:items-center gap-4 lg:gap-8">
                                    <div className="flex items-center gap-2 justify-center lg:justify-start bg-white/5 p-3 lg:p-0 rounded-2xl lg:bg-transparent">
                                        <Monitor size={14} className="text-slate-500" />
                                        <span className="text-[9px] lg:text-[10px] font-black text-slate-500 uppercase">{p.channel_count || 0} KANAL</span>
                                    </div>
                                    <div className="flex items-center gap-2 justify-center lg:justify-start bg-white/5 p-3 lg:p-0 rounded-2xl lg:bg-transparent">
                                        <TrendingUp size={14} className="text-blue-500" />
                                        <span className="text-[9px] lg:text-[10px] font-black text-blue-500 uppercase">{p.total_reach?.toLocaleString() || 0} ERİŞİM</span>
                                    </div>
                                    <div className="flex items-center gap-2 justify-center lg:justify-start bg-white/5 p-3 lg:p-0 rounded-2xl lg:bg-transparent">
                                        <Eye size={14} className="text-emerald-500" />
                                        <span className="text-[9px] lg:text-[10px] font-black text-emerald-500 uppercase">{p.total_views?.toLocaleString() || 0} GÖRÜNTÜ</span>
                                    </div>
                                    <div className="flex items-center gap-2 justify-center lg:justify-start bg-white/5 p-3 lg:p-0 rounded-2xl lg:bg-transparent">
                                        <Heart size={14} className="text-rose-500" />
                                        <span className="text-[9px] lg:text-[10px] font-black text-rose-500 uppercase">{p.total_reactions?.toLocaleString() || 0} TEPKİ</span>
                                    </div>
                                    <div className="flex items-center gap-2 justify-center lg:justify-start bg-white/5 p-3 lg:p-0 rounded-2xl lg:bg-transparent">
                                        <MousePointer2 size={14} className="text-emerald-500" />
                                        <span className="text-[9px] lg:text-[10px] font-black text-emerald-500 uppercase">{p.click_count || 0} TIK</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                <button 
                                    disabled={updatingId === p.id}
                                    onClick={() => handleToggleStatus(p)} 
                                    className={`flex-1 lg:flex-none px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 min-w-[160px] justify-center ${
                                        updatingId === p.id 
                                        ? 'bg-slate-800 text-slate-600 opacity-50' 
                                        : p.status === 'sending' 
                                          ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-lg' 
                                          : 'bg-blue-600 text-white shadow-xl shadow-blue-900/40 hover:bg-blue-500'
                                    }`}
                                >
                                    {updatingId === p.id ? (
                                        <Loader2 className="animate-spin" size={14} />
                                    ) : (
                                        <>
                                            {p.status === 'sending' ? 'DURDUR' : 'YAYINA AL'}
                                            <Send size={14} />
                                        </>
                                    )}
                                </button>
                                <div className="flex gap-3 flex-1 lg:flex-none">
                                    <button 
                                        onClick={() => { setEditingPromo(p); setIsModalOpen(true); }}
                                        className="flex-1 lg:flex-none p-5 bg-white/5 rounded-2xl text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-xl flex items-center justify-center"
                                    >
                                        <Edit3 size={20}/>
                                    </button>
                                    <button 
                                        onClick={async () => { if(confirm('Bu kampanya silinsin mi?')) { await DatabaseService.deletePromotion(p.id); await DatabaseService.logActivity('admin', 'bot_manage', 'promotion_deleted', 'Tanıtım Silindi', `${p.title} kampanyası silindi.`); load(); } }} 
                                        className="flex-1 lg:flex-none p-5 bg-white/5 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl flex items-center justify-center"
                                    >
                                        <Trash2 size={20}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isAIModalOpen && (
                <div className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl animate-in fade-in">
                    <div className="bg-[#020617] p-10 lg:p-16 rounded-[64px] w-full max-w-3xl border border-white/10 shadow-2xl relative">
                        <button onClick={() => setIsAIModalOpen(false)} className="absolute top-8 right-8 p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all">
                            <X size={24}/>
                        </button>
                        
                        <div className="text-center space-y-8">
                            <div className="inline-flex p-6 bg-blue-500/10 rounded-[32px] border border-blue-500/20 mb-4">
                                <Sparkles size={48} className="text-blue-500" />
                            </div>
                            <div>
                                <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">AI <span className="text-blue-500">Ad Generator</span></h3>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Reklam fikrinizi yazın, gerisini yapay zekaya bırakın</p>
                            </div>

                            {aiError && (
                                <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-[32px] text-left space-y-4 animate-in slide-in-from-top-2">
                                    <div className="flex items-start gap-4">
                                        <AlertCircle className="text-red-500 shrink-0 mt-1" size={20} />
                                        <div className="space-y-1">
                                            <p className="text-red-500 text-sm font-bold uppercase tracking-widest">Hata Oluştu</p>
                                            <p className="text-slate-400 text-xs leading-relaxed">{aiError}</p>
                                        </div>
                                    </div>
                                    {showKeySelection && (
                                        <button 
                                            onClick={handleKeySelection}
                                            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all flex items-center justify-center gap-3"
                                        >
                                            <Key size={14} /> API ANAHTARINI GÜNCELLE
                                        </button>
                                    )}
                                </div>
                            )}

                            {showKeySelection && !aiError && (
                                <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-[32px] text-left space-y-4">
                                    <div className="flex items-start gap-4">
                                        <Info className="text-blue-500 shrink-0 mt-1" size={20} />
                                        <div className="space-y-1">
                                            <p className="text-blue-500 text-sm font-bold uppercase tracking-widest">API Anahtarı Gerekli</p>
                                            <p className="text-slate-400 text-xs leading-relaxed">AI özelliklerini kullanmak için bir API anahtarı seçmelisiniz.</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleKeySelection}
                                        className="w-full bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all flex items-center justify-center gap-3"
                                    >
                                        <Key size={14} /> API ANAHTARI SEÇ
                                    </button>
                                </div>
                            )}

                            <div className="space-y-4">
                                <textarea 
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder="Örn: Yeni bir kripto cüzdanı için dikkat çekici bir reklam oluştur..."
                                    className="w-full bg-white/5 border border-white/10 rounded-[32px] p-8 text-white text-lg font-medium focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none min-h-[200px] resize-none"
                                />
                                
                                <div className="flex items-center justify-center gap-3 p-4 bg-white/5 rounded-[24px] border border-white/10">
                                    <input 
                                        type="checkbox" 
                                        id="ai-image-toggle"
                                        checked={generateImage}
                                        onChange={(e) => setGenerateImage(e.target.checked)}
                                        className="w-5 h-5 rounded-lg bg-slate-900 border-white/10 text-blue-600 focus:ring-blue-500/20"
                                    />
                                    <label htmlFor="ai-image-toggle" className="text-[11px] font-black text-slate-400 uppercase tracking-widest cursor-pointer select-none">
                                        AI Görseli de Oluşturulsun
                                    </label>
                                </div>

                                <button 
                                    disabled={isGenerating || !aiPrompt.trim()}
                                    onClick={generateAIAd}
                                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 px-10 py-6 rounded-[32px] text-sm font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            OLUŞTURULUYOR...
                                        </>
                                    ) : (
                                        <>
                                            <Zap size={20} /> REKLAMI OLUŞTUR
                                        </>
                                    )}
                                </button>
                            </div>
                            
                            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">
                                * Seçiminize göre yapay zeka görsel ve metin içeriği üretecektir.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && editingPromo && (
                <div className="fixed inset-0 z-[110] bg-black/98 flex items-center justify-center p-0 lg:p-6 backdrop-blur-3xl animate-in fade-in">
                    <div className="bg-[#020617] p-8 lg:p-14 rounded-t-[40px] lg:rounded-[64px] w-full max-w-7xl h-[94vh] lg:h-[90vh] overflow-hidden border-t lg:border border-white/10 shadow-2xl relative flex flex-col lg:flex-row gap-12">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-white z-50 transition-all">
                            <X size={24}/>
                        </button>
                        
                        {/* LEFT: Ad Composer Form */}
                        <div className="flex-1 overflow-y-auto pr-2 space-y-8">
                            <div>
                                <h3 className="text-3xl font-black mb-2 uppercase italic tracking-tighter">Campaign <span className="text-emerald-500">Forge</span></h3>
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Yayınlanacak reklamın içeriğini tasarlayın</p>
                            </div>

                            <form onSubmit={(e) => {
                                if (!editingPromo.source_channel || editingPromo.source_channel === '@' || editingPromo.source_channel.length < 3) {
                                    e.preventDefault();
                                    alert('Lütfen geçerli bir ana paylaşım kanalı giriniz (Örn: @kanaladi)');
                                    return;
                                }
                                handleSave(e);
                            }} className="space-y-8 pb-10">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <AdminInput label="REKLAM BAŞLIĞI" value={editingPromo.title} onChange={(v:any)=>setEditingPromo({...editingPromo, title:v})} placeholder="Örn: Haftalık Kampanya" />
                                    <div className="relative">
                                        <AdminInput label="ANA PAYLAŞIM KANALI" value={editingPromo.source_channel} onChange={(v:any)=>setEditingPromo({...editingPromo, source_channel:v})} placeholder="-1003826684282" />
                                        <div className="absolute top-0 right-0 mt-1 mr-4">
                                            <span className="text-[8px] font-black text-blue-500 uppercase bg-blue-500/10 px-2 py-1 rounded-full">SİSTEM KANALI</span>
                                        </div>
                                    </div>
                                    <AdminInput label="GÖRÜNTÜLENME BİRİM FİYATI" value={editingPromo.price_per_view} onChange={(v:any)=>setEditingPromo({...editingPromo, price_per_view:v})} placeholder="0.005" icon={TrendingUp} />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4 italic">ANA MESAJ (HTML DESTEKLİ)</label>
                                    <textarea 
                                        value={editingPromo.content} 
                                        onChange={e => setEditingPromo({...editingPromo, content: e.target.value})} 
                                        className="w-full bg-slate-950 border border-white/5 p-8 rounded-[36px] text-[11px] font-black h-40 outline-none text-slate-400 focus:border-emerald-500/30 uppercase italic leading-relaxed" 
                                        placeholder="Kanalda görünecek reklam metni..." 
                                    />
                                </div>

                                <AdminInput label="GÖRSEL URL (OPSİYONEL)" value={editingPromo.image_url} onChange={(v:any)=>setEditingPromo({...editingPromo, image_url:v})} icon={ImageIcon} placeholder="https://..." />
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <AdminInput label="BUTON METNİ" value={editingPromo.button_text} onChange={(v:any)=>setEditingPromo({...editingPromo, button_text:v})} placeholder="İNCELE" />
                                    <AdminInput label="BUTON LİNKİ" value={editingPromo.button_link} onChange={(v:any)=>setEditingPromo({...editingPromo, button_link:v})} icon={Link2} placeholder="https://t.me/..." />
                                </div>

                                <div className="bg-blue-600/5 border border-blue-500/10 p-6 rounded-[32px] flex items-start gap-4">
                                    <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500">
                                        <Zap size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-blue-500 uppercase tracking-widest mb-1">BotlyHub Reklam Ağı</p>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase italic leading-relaxed">
                                            Reklamlar otomatik olarak <b>BotlyHub Reklam</b> kanalında ({editingPromo.source_channel}) paylaşılacak ve tüm alt kanallara bu kanal üzerinden iletilecektir.
                                        </p>
                                        <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                                            <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                                            <p className="text-[8px] text-amber-500/80 font-black uppercase italic leading-normal">
                                                ÖNEMLİ: İstatistik takibi (Görüntülenme/Gelir) için ana kanalın <b>KAMUYA AÇIK (PUBLIC)</b> olması ve bir <b>@kullanıcıadı</b> olması zorunludur. Gizli kanallarda istatistik çalışmaz.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="w-full h-20 bg-blue-600 hover:bg-blue-500 rounded-[32px] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl border-b-8 border-blue-900 transition-all active:translate-y-1 active:border-b-4">KAMPANYAYI SİSTEME KAYDET</button>
                            </form>
                        </div>

                        {/* RIGHT: LIVE HOLOGRAPHIC TELEGRAM SIMULATOR */}
                        <div className="hidden lg:flex w-[460px] flex-col items-center justify-center bg-slate-900/20 border-l border-white/5 p-12 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-600/5 via-transparent to-transparent"></div>
                            
                            <div className="text-center mb-12 space-y-2">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] italic block">TELEGRAM PREVIEW</span>
                                <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">REAL-TIME SIMULATOR</p>
                            </div>

                            {/* Telegram Message UI */}
                            <div className="w-full bg-[#020617] border border-white/10 rounded-[40px] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.6)] animate-in zoom-in-95">
                                {editingPromo.image_url && editingPromo.image_url.startsWith('http') ? (
                                    <img src={editingPromo.image_url} className="w-full h-48 object-cover border-b border-white/5" onError={(e)=>(e.target as any).src=''} />
                                ) : (
                                    <div className="w-full h-32 bg-slate-900/40 flex flex-col items-center justify-center border-b border-white/5">
                                        <ImageIcon className="text-slate-600 mb-2" size={32} />
                                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Görsel Alanı</span>
                                    </div>
                                )}
                                <div className="p-8 space-y-4">
                                    <h5 className="text-white font-black text-lg italic uppercase tracking-tighter truncate leading-none">{editingPromo.title || 'REKLAM BAŞLIĞI'}</h5>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase italic leading-relaxed line-clamp-4 min-h-[60px] whitespace-pre-wrap">{editingPromo.content || 'Yayın içeriği burada görünecek...'}</p>
                                    
                                    {editingPromo.button_text && (
                                        <div className="pt-4">
                                            <div className="w-full py-4 bg-blue-600/10 border border-blue-500/30 rounded-2xl text-blue-500 text-[9px] font-black text-center uppercase tracking-widest">
                                                {editingPromo.button_text}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-12 flex items-center gap-3 opacity-30">
                                <AlertCircle size={14} className="text-slate-500" />
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">Görünüm Telegram istemcisine göre değişebilir</span>
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
        <div className="space-y-12 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl lg:text-4xl font-black text-white italic uppercase tracking-tighter leading-none">Referral <span className="text-blue-500">Network</span></h2>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mt-2 italic">Referans sistemini ve ödülleri yönetin</p>
                </div>
                <button 
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 px-8 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-blue-900/40 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                    <SettingsIcon size={18} /> SİSTEM AYARLARI
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                <StatCard icon={Users} label="TOPLAM REFERANS" value={referrals.length.toString()} color="blue" />
                <StatCard icon={CheckCircle2} label="ONAYLANAN" value={referrals.filter(r => r.status === 'confirmed').length.toString()} color="emerald" />
                <StatCard icon={Clock} label="BEKLEYEN" value={referrals.filter(r => r.status === 'pending').length.toString()} color="orange" />
                <StatCard icon={TrendingUp} label="TOPLAM ÖDÜL" value={`₺${referrals.filter(r => r.status === 'confirmed').reduce((acc, r) => acc + r.reward_amount, 0).toLocaleString()}`} color="purple" />
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {['all', 'pending', 'confirmed', 'rejected'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-6 h-12 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                            filter === f 
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                            : 'bg-slate-900/40 border-white/5 text-slate-500 hover:border-white/10'
                        }`}
                    >
                        {f === 'all' ? 'TÜMÜ' : f === 'pending' ? 'BEKLEYEN' : f === 'confirmed' ? 'ONAYLI' : 'REDDEDİLEN'}
                    </button>
                ))}
            </div>

            <div className="bg-slate-900/40 border border-white/5 rounded-[44px] overflow-hidden shadow-2xl">
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-[9px] uppercase tracking-[0.4em] text-slate-700 font-black">
                            <tr>
                                <th className="px-10 py-8">DAVET EDEN</th>
                                <th className="px-10 py-8">KATILAN ÜYE</th>
                                <th className="px-10 py-8">TARİH</th>
                                <th className="px-10 py-8">DURUM</th>
                                <th className="px-10 py-8 text-right">AKSİYON</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="animate-spin text-blue-500 mx-auto" size={32} /></td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={5} className="py-20 text-center text-slate-500 font-black uppercase tracking-widest italic">Kayıt Bulunamadı</td></tr>
                            ) : filtered.map(r => (
                                <tr key={r.id} className="hover:bg-white/5 transition-all text-white group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <img src={r.referrer?.avatar || `https://ui-avatars.com/api/?name=${r.referrer?.username}`} className="w-10 h-10 rounded-xl border border-white/5" />
                                            <div>
                                                <p className="text-sm font-black italic uppercase tracking-tighter">@{r.referrer?.username || 'Unknown'}</p>
                                                <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">ID: {r.referrer_id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <img src={r.referred?.avatar || `https://ui-avatars.com/api/?name=${r.referred?.username}`} className="w-10 h-10 rounded-xl border border-white/5" />
                                            <div>
                                                <p className="text-sm font-black italic uppercase tracking-tighter">@{r.referred?.username || 'Unknown'}</p>
                                                <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">ID: {r.referred_id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-slate-600 text-[10px] font-bold uppercase">{new Date(r.created_at).toLocaleString()}</td>
                                    <td className="px-10 py-8">
                                        <span className={`text-[9px] font-black px-3 py-1 rounded-lg border uppercase tracking-widest ${
                                            r.status === 'confirmed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                            r.status === 'pending' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' :
                                            'bg-red-500/10 border-red-500/20 text-red-500'
                                        }`}>
                                            {r.status === 'confirmed' ? 'ONAYLI' : r.status === 'pending' ? 'BEKLEMEDE' : 'REDDEDİLDİ'}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        {r.status === 'pending' && (
                                            <button 
                                                onClick={() => handleConfirm(r.id)}
                                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                                            >
                                                ONAYLA
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden divide-y divide-white/5">
                    {isLoading ? (
                        <div className="py-20 text-center"><Loader2 className="animate-spin text-blue-500 mx-auto" size={32} /></div>
                    ) : filtered.length === 0 ? (
                        <div className="py-20 text-center text-slate-500 font-black uppercase tracking-widest italic">Kayıt Bulunamadı</div>
                    ) : filtered.map(r => (
                        <div key={r.id} className="p-6 space-y-6 hover:bg-white/5 transition-all">
                            <div className="flex justify-between items-start">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-3">
                                        <img src={r.referrer?.avatar || `https://ui-avatars.com/api/?name=${r.referrer?.username}`} className="w-8 h-8 rounded-lg border border-white/5" />
                                        <div>
                                            <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest">DAVET EDEN</p>
                                            <p className="text-xs font-black text-white italic uppercase">@{r.referrer?.username || 'Unknown'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <img src={r.referred?.avatar || `https://ui-avatars.com/api/?name=${r.referred?.username}`} className="w-8 h-8 rounded-lg border border-white/5" />
                                        <div>
                                            <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest">KATILAN ÜYE</p>
                                            <p className="text-xs font-black text-white italic uppercase">@{r.referred?.username || 'Unknown'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`text-[8px] font-black px-2 py-1 rounded-md border uppercase tracking-widest ${
                                        r.status === 'confirmed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                        r.status === 'pending' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' :
                                        'bg-red-500/10 border-red-500/20 text-red-500'
                                    }`}>
                                        {r.status === 'confirmed' ? 'ONAYLI' : r.status === 'pending' ? 'BEKLEMEDE' : 'REDDEDİLDİ'}
                                    </span>
                                    <p className="text-[8px] text-slate-600 font-bold uppercase">{new Date(r.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            {r.status === 'pending' && (
                                <button 
                                    onClick={() => handleConfirm(r.id)}
                                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-emerald-900/20"
                                >
                                    REFERANSI ONAYLA
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {isSettingsModalOpen && settings && (
                <div className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-4 lg:p-8 backdrop-blur-3xl animate-in fade-in">
                    <div className="bg-[#020617] border border-white/10 rounded-[40px] lg:rounded-[64px] w-full max-w-2xl overflow-hidden shadow-2xl relative">
                        <button onClick={() => setIsSettingsModalOpen(false)} className="absolute top-6 right-6 p-3 bg-white/5 rounded-2xl hover:bg-red-600 transition-all">
                            <X size={20} />
                        </button>
                        
                        <div className="p-8 lg:p-12 space-y-8">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-blue-600 rounded-[20px] flex items-center justify-center shadow-xl">
                                    <SettingsIcon size={24} className="text-white"/>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">Referral <span className="text-blue-500">Settings</span></h3>
                                    <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] mt-1 italic">SİSTEM PARAMETRELERİ</p>
                                </div>
                            </div>

                            <form onSubmit={handleUpdateSettings} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <AdminInput label="STANDART ÖDÜL (TRY)" value={settings.standard_reward} onChange={(v:any)=>setSettings({...settings, standard_reward: Number(v)})} />
                                    <AdminInput label="PREMIUM ÖDÜL (TRY)" value={settings.premium_reward} onChange={(v:any)=>setSettings({...settings, premium_reward: Number(v)})} />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <AdminInput label="MİN. AKTİF GÜN" value={settings.min_days_active} onChange={(v:any)=>setSettings({...settings, min_days_active: Number(v)})} />
                                    <AdminInput label="BEKLEME SÜRESİ (SAAT)" value={settings.pending_duration_hours} onChange={(v:any)=>setSettings({...settings, pending_duration_hours: Number(v)})} />
                                </div>
                                <AdminInput label="TELEGRAM GRUP ID" value={settings.group_id} onChange={(v:any)=>setSettings({...settings, group_id: v})} />
                                
                                <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">GRUP KATILIM ZORUNLULUĞU</span>
                                        <span className="text-[8px] text-slate-600 font-bold uppercase italic">Üye ödülden önce gruba katılmalı mı?</span>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setSettings({...settings, require_group_join: !settings.require_group_join})}
                                        className={`w-14 h-8 rounded-full transition-all relative ${settings.require_group_join ? 'bg-blue-600' : 'bg-slate-800'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.require_group_join ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>

                                <button type="submit" className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl border-b-4 border-blue-800 active:translate-y-1 active:border-b-0 transition-all">
                                    AYARLARI KAYDET
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
