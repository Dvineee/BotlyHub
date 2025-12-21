
import React, { useEffect, useState } from 'react';
import * as Router from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bot, LogOut, Menu, X, 
  Package, Loader2, RefreshCw, Plus, Edit2, Trash2, 
  Megaphone, Calendar, Settings as SettingsIcon, 
  ShieldCheck, Percent, Globe, MessageSquare, AlertTriangle,
  Sparkles, Zap, Star, ChevronRight, Eye, Send, Activity, 
  Clock, Wallet, ShieldAlert, Cpu, Ban, CheckCircle, Gift, Info, Heart, Bell, Shield, ExternalLink, TrendingUp, History, ListFilter, CreditCard, Image as ImageIcon, Wand2, Hash
} from 'lucide-react';
import { DatabaseService } from '../../services/DatabaseService';
import { User, Bot as BotType, Announcement, Notification, Channel } from '../../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const { useNavigate, Routes, Route, Link, useLocation } = Router as any;

const CATEGORY_NAMES: Record<string, string> = {
    'productivity': 'Üretkenlik',
    'games': 'Eğlence & Oyun',
    'utilities': 'Araçlar & Servisler',
    'finance': 'Finans & Ekonomi',
    'music': 'Müzik & Ses',
    'moderation': 'Grup Yönetimi'
};

const AVAILABLE_ICONS = [
  { name: 'Megaphone', icon: Megaphone },
  { name: 'Zap', icon: Zap },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Gift', icon: Gift },
  { name: 'Star', icon: Star },
  { name: 'Info', icon: Info },
  { name: 'BotIcon', icon: Bot },
  { name: 'Heart', icon: Heart },
  { name: 'Bell', icon: Bell },
  { name: 'Shield', icon: Shield }
];

const StatCard = ({ label, value, icon: Icon, color, trend }: any) => {
  const colors: any = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-blue-500/5',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20 shadow-purple-500/5',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5',
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20 shadow-orange-500/5'
  };

  return (
    <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-[32px] shadow-2xl group hover:border-slate-700 transition-all">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl border ${colors[color]} group-hover:scale-110 transition-transform`}>
          <Icon size={24} />
        </div>
        <div className="px-3 py-1 bg-slate-950 rounded-lg border border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{trend}</div>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-white italic tracking-tighter">{value}</p>
      </div>
    </div>
  );
};

const LogItem = ({ time, action, status }: { time: string, action: string, status: 'Success' | 'Info' | 'Update' }) => {
  const colors: any = {
    Success: 'bg-emerald-500',
    Info: 'bg-blue-500',
    Update: 'bg-purple-500'
  };

  return (
    <div className="flex gap-4 group animate-in slide-in-from-left duration-300">
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${colors[status]} shadow-[0_0_10px_rgba(59,130,246,0.3)]`}></div>
        <div className="w-px flex-1 bg-slate-800/50 my-2"></div>
      </div>
      <div className="pb-6">
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">{time}</p>
        <p className="text-sm text-slate-400 font-medium group-hover:text-white transition-colors leading-relaxed">{action}</p>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!DatabaseService.isAdminLoggedIn()) navigate('/a/admin');
  }, [navigate]);

  const NavItem = ({ to, icon: Icon, label }: any) => {
    const active = location.pathname === to;
    return (
      <Link 
        to={to} 
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 px-4 py-4 rounded-2xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
      >
        <Icon size={18} />
        <span className="font-bold text-[10px] uppercase tracking-widest">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] flex text-slate-200 font-sans overflow-hidden">
      <aside className={`fixed inset-y-0 left-0 z-[70] w-72 bg-[#0f172a] border-r border-slate-800/50 transition-transform lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-12 px-2">
            <div className="p-2 bg-blue-600 rounded-xl"><Package size={22} className="text-white"/></div>
            <h2 className="text-xl font-black text-white italic tracking-tighter">BOTLY HUB <span className="text-blue-500">PRO</span></h2>
          </div>
          <nav className="flex-1 space-y-2">
            <NavItem to="/a/dashboard" icon={LayoutDashboard} label="Kontrol Paneli" />
            <NavItem to="/a/dashboard/sales" icon={CreditCard} label="Satış & Kütüphane" />
            <NavItem to="/a/dashboard/users" icon={Users} label="Kullanıcı Yönetimi" />
            <NavItem to="/a/dashboard/bots" icon={Bot} label="Market Botları" />
            <NavItem to="/a/dashboard/notifications" icon={Send} label="Bildirim Merkezi" />
            <NavItem to="/a/dashboard/announcements" icon={Megaphone} label="Duyuru Yönetimi" />
            <NavItem to="/a/dashboard/settings" icon={SettingsIcon} label="Sistem Ayarları" />
          </nav>
          <button onClick={() => { DatabaseService.logoutAdmin(); navigate('/a/admin'); }} className="mt-auto flex items-center gap-3 px-4 py-4 text-red-500 font-black text-[10px] tracking-widest uppercase hover:bg-red-500/5 rounded-2xl transition-colors">
            <LogOut size={18} /> Çıkış Yap
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-slate-800/50 flex items-center justify-between px-8 bg-[#020617]/50 backdrop-blur-xl shrink-0">
           <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2.5 bg-slate-800 rounded-xl text-slate-400"><Menu size={20}/></button>
           <div className="hidden sm:flex items-center gap-6 text-[10px] font-black text-slate-600 uppercase tracking-widest">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Canlı Veri Akışı</div>
              <div className="w-px h-4 bg-slate-800"></div>
              <div className="flex items-center gap-2"><Activity size={14}/> Sistem Stabil</div>
           </div>
           <div className="flex items-center gap-4 ml-auto">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white shadow-lg shadow-blue-900/20 border border-white/10">AD</div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-[#020617] no-scrollbar">
          <div className="max-w-[1400px] mx-auto pb-10">
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/sales" element={<SalesManagement />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/bots" element={<BotManagement />} />
              <Route path="/notifications" element={<NotificationCenter />} />
              <Route path="/announcements" element={<AnnouncementManagement />} />
              <Route path="/settings" element={<SettingsManagement />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
};

const HomeView = () => {
    const [stats, setStats] = useState({ userCount: 0, botCount: 0, notifCount: 0, annCount: 0, salesCount: 0 });
    const [combinedLogs, setCombinedLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAllLogs, setShowAllLogs] = useState(false);

    useEffect(() => { load(); }, []);

    const getTimeAgo = (dateStr: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " yıl önce";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " ay önce";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " gün önce";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " sa önce";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " dk önce";
        return "az önce";
    };

    const load = async () => {
        setIsLoading(true);
        try {
            const [statData, purchases, globalNotifs] = await Promise.all([
                DatabaseService.getAdminStats(),
                DatabaseService.getAllPurchases(),
                DatabaseService.getNotifications()
            ]);
            setStats(statData);

            const logs = [
                ...purchases.map(p => ({
                    id: p.id || Math.random(),
                    date: p.acquired_at,
                    action: `@${p.users?.username || 'user'} '${p.bots?.name || 'Bot'}' edindi.`,
                    status: p.is_premium ? 'Update' : 'Success'
                })),
                ...globalNotifs.map(n => ({
                    id: n.id,
                    date: n.date,
                    action: `SİSTEM: ${n.title}`,
                    status: n.type === 'security' ? 'Update' : 'Info'
                }))
            ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setCombinedLogs(logs);
        } catch (e) {
            console.error("Home load error:", e);
        } finally {
            setIsLoading(false);
        }
    };

    const mockChartData = [
        { name: 'Pzt', users: 12 }, { name: 'Sal', users: 25 }, { name: 'Çar', users: 18 },
        { name: 'Per', users: 45 }, { name: 'Cum', users: 32 }, { name: 'Cmt', users: 58 }, { name: 'Paz', users: 52 }
    ];

    const displayedLogs = showAllLogs ? combinedLogs : combinedLogs.slice(0, 5);

    return (
        <div className="animate-in fade-in space-y-10">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">KOMUTA <span className="text-blue-500">MERKEZİ</span></h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Gerçek Zamanlı Platform Analitiği</p>
                </div>
                <button onClick={load} className="px-6 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all flex items-center gap-2">
                    <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Verileri Senkronize Et
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Üye Sayısı" value={stats.userCount} icon={Users} color="blue" trend="+12%" />
                <StatCard label="Pazar Botları" value={stats.botCount} icon={Bot} color="purple" trend="+4%" />
                <StatCard label="Toplam Edinme" value={stats.salesCount} icon={CreditCard} color="emerald" trend="Canlı" />
                <StatCard label="Bildirimler" value={stats.notifCount} icon={Send} color="orange" trend="Live" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-[#0f172a] border border-slate-800 rounded-[32px] p-8 shadow-2xl">
                    <h3 className="text-lg font-black text-white mb-6 uppercase tracking-tight italic">Haftalık Trafik</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockChartData}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }} />
                                <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                <div className="bg-[#0f172a] border border-slate-800 rounded-[32px] p-8 flex flex-col shadow-2xl relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-black text-white uppercase tracking-tight italic flex items-center gap-3"><Clock size={18} className="text-blue-500"/> Son İşlemler</h3>
                        <button 
                            onClick={() => setShowAllLogs(!showAllLogs)}
                            className="text-[9px] font-black text-blue-500 uppercase tracking-widest hover:text-white transition-colors bg-blue-500/5 px-3 py-1.5 rounded-lg border border-blue-500/20 shadow-xl"
                        >
                            {showAllLogs ? 'Küçült' : 'Tümünü Gör'}
                        </button>
                    </div>

                    <div className={`space-y-4 flex-1 overflow-y-auto no-scrollbar pr-2 transition-all ${showAllLogs ? 'max-h-[600px]' : 'max-h-[350px]'}`}>
                        {isLoading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4 animate-pulse">
                                <Loader2 className="animate-spin text-slate-700" size={32} />
                                <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Sistem Taranıyor...</p>
                            </div>
                        ) : displayedLogs.length === 0 ? (
                            <div className="py-20 text-center">
                                <Activity className="mx-auto text-slate-800 mb-4" size={40} />
                                <p className="text-xs text-slate-600 font-bold italic">İşlem kaydı bulunmuyor.</p>
                            </div>
                        ) : (
                            displayedLogs.map((log) => (
                                <LogItem 
                                    key={log.id} 
                                    time={getTimeAgo(log.date)} 
                                    action={log.action} 
                                    status={log.status as any} 
                                />
                            ))
                        )}
                    </div>

                    {!showAllLogs && combinedLogs.length > 5 && (
                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0f172a] to-transparent pointer-events-none group-hover:opacity-50 transition-opacity"></div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SalesManagement = () => {
    const [sales, setSales] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => { load(); }, []);
    const load = async () => {
        setIsLoading(true);
        const data = await DatabaseService.getAllPurchases();
        setSales(data);
        setIsLoading(false);
    };

    const filteredSales = sales.filter(s => 
        (s.users?.name || '').toLowerCase().includes(search.toLowerCase()) || 
        (s.bots?.name || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="animate-in fade-in space-y-10">
            <div className="flex flex-col sm:flex-row justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">EDİNME <span className="text-emerald-500">KAYITLARI</span></h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Kim Hangi Botu Ekledi? ({sales.length})</p>
                </div>
                <div className="flex gap-4">
                    <input 
                        type="text" 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Kullanıcı veya bot ara..." 
                        className="bg-[#0f172a] border border-slate-800 rounded-2xl px-6 py-4 text-xs outline-none focus:border-emerald-500 transition-all w-full sm:w-80 font-bold" 
                    />
                    <button onClick={load} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all shadow-xl active:scale-95"><RefreshCw size={20} className={isLoading ? 'animate-spin' : ''}/></button>
                </div>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950/50 border-b border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <tr>
                                <th className="px-10 py-8">Kullanıcı Profil</th>
                                <th className="px-10 py-8">İlgili Bot</th>
                                <th className="px-10 py-8">Tarih</th>
                                <th className="px-10 py-8 text-right">Durum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {isLoading ? <tr><td colSpan={4} className="p-20 text-center text-slate-500 font-bold animate-pulse uppercase tracking-[0.3em]">Kayitlar Yukleniyor</td></tr> : 
                             filteredSales.length === 0 ? <tr><td colSpan={4} className="p-20 text-center text-slate-600 font-bold italic">Kayıt bulunamadı.</td></tr> : 
                             filteredSales.map((s, idx) => (
                                <tr key={idx} className="hover:bg-slate-800/20 transition-all group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-5">
                                            <img src={s.users?.avatar} className="w-12 h-12 rounded-[20px] bg-slate-900 border border-slate-800 shadow-xl" />
                                            <div>
                                                <p className="font-black text-white text-sm">@{s.users?.username}</p>
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-tight">{s.users?.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-[20px] bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden">
                                                <img src={s.bots?.icon} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="font-black text-white text-sm italic">{s.bots?.name}</p>
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">STARS {s.bots?.price}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <p className="text-xs text-slate-300 font-bold italic">{new Date(s.acquired_at).toLocaleDateString('tr-TR')}</p>
                                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-1">{new Date(s.acquired_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]"></div>
                                            <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Kütüphanede</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const BotManagement = () => {
    const [bots, setBots] = useState<BotType[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBot, setEditingBot] = useState<Partial<BotType> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isFetchingIcon, setIsFetchingIcon] = useState(false);

    useEffect(() => { load(); }, []);
    const load = async () => { setIsLoading(true); setBots(await DatabaseService.getBots()); setIsLoading(false); };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBot) return;
        setIsSaving(true);
        try {
            await DatabaseService.saveBot(editingBot);
            setIsModalOpen(false);
            load();
        } catch (err: any) { alert("Hata: " + err.message); } finally { setIsSaving(false); }
    };

    const fetchBotIcon = async () => {
        if (!editingBot?.bot_link || !editingBot.bot_link.startsWith('@')) {
            alert("Lütfen önce @BotName formatında link girin.");
            return;
        }
        setIsFetchingIcon(true);
        const username = editingBot.bot_link.replace('@', '').toLowerCase();
        const iconUrl = `https://t.me/i/userpic/320/${username}.jpg`;
        setTimeout(() => {
            setEditingBot({ ...editingBot, icon: iconUrl });
            setIsFetchingIcon(false);
        }, 800);
    };

    return (
        <div className="animate-in fade-in space-y-10">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">MARKET <span className="text-blue-500">ENVANTERİ</span></h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Sistemdeki Bot Tanımlamaları</p>
                </div>
                <button onClick={() => { setEditingBot({ name: '', description: '', price: 0, category: 'productivity', bot_link: '', icon: '', screenshots: [] }); setIsModalOpen(true); }} className="px-8 py-5 bg-blue-600 rounded-[28px] text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-3 shadow-2xl shadow-blue-900/30 active:scale-95 transition-all">
                    <Plus size={18}/> Yeni Bot Tanımla
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {isLoading ? <div className="col-span-full p-40 text-center font-bold italic animate-pulse text-slate-700 uppercase tracking-widest">Pazar Yukleniyor...</div> : 
                 bots.map(b => (
                    <div key={b.id} className="bg-[#0f172a] border border-slate-800 p-10 rounded-[48px] hover:border-blue-500/40 transition-all flex flex-col group shadow-2xl">
                        <div className="flex gap-6 mb-8">
                            <img src={b.icon} className="w-20 h-20 rounded-[28px] object-cover border-2 border-slate-800 bg-slate-950 shadow-2xl group-hover:scale-105 transition-transform" />
                            <div className="min-w-0">
                                <h4 className="font-black text-white text-lg italic tracking-tight truncate mb-1">{b.name}</h4>
                                <div className="flex flex-wrap gap-2 items-center">
                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">#{b.id}</span>
                                    <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/5 px-2 py-1 rounded-lg border border-blue-500/10 italic">{b.category}</span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-3">
                                    <Star size={14} className="text-yellow-500" fill="currentColor"/>
                                    <span className="font-black text-sm text-white">{b.price} Yıldız</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-3 mb-10 font-medium leading-relaxed">{b.description}</p>
                        <div className="flex gap-2 mt-auto">
                            <button onClick={() => { setEditingBot(b); setIsModalOpen(true); }} className="flex-1 py-4 bg-slate-800 hover:bg-blue-600 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2"> <Edit2 size={14}/> Düzenle </button>
                            <button onClick={async () => { if(confirm("Bu botu sistemden silmek istediğinize emin misiniz?")) { await DatabaseService.deleteBot(b.id); load(); } }} className="p-4 bg-slate-800 hover:bg-red-500 text-slate-400 hover:text-white rounded-2xl transition-all shadow-xl"><Trash2 size={18}/></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && editingBot && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in" onClick={() => !isSaving && setIsModalOpen(false)}>
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[56px] p-12 relative shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setIsModalOpen(false)} disabled={isSaving} className="absolute top-10 right-10 text-slate-500 hover:text-white disabled:opacity-30"><X size={26}/></button>
                        <h3 className="text-3xl font-black mb-12 text-white italic tracking-tighter uppercase">{editingBot.id ? 'Bot Verisini Revize Et' : 'Sisteme Yeni Bot Ekle'}</h3>
                        <form onSubmit={handleSave} className="space-y-8">
                            
                            <div className="bg-blue-600/5 border border-blue-500/10 p-6 rounded-[32px] mb-4 flex items-start gap-4">
                                <AlertTriangle size={24} className="text-blue-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Kritik Not</p>
                                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Bu botun Python/NodeJS kodundaki <span className="text-blue-400 font-bold">BOT_ID</span> değeri ile buradaki ID aynı olmalıdır.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Sistem ID (Kod Kimliği)</label>
                                    <div className="relative">
                                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                                        <input type="text" required value={editingBot.id} onChange={e => setEditingBot({...editingBot, id: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 pl-12 pr-4 text-xs font-black text-white focus:border-blue-500 outline-none" placeholder="örn: task_pro_01" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Bot Görünür Adı</label>
                                    <input type="text" required value={editingBot.name} onChange={e => setEditingBot({...editingBot, name: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-xs font-black text-white focus:border-blue-500 outline-none" placeholder="Task Master" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Market Kategorisi</label>
                                    <select value={editingBot.category} onChange={e => setEditingBot({...editingBot, category: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-xs font-black text-white focus:border-blue-500 outline-none appearance-none">
                                        {Object.entries(CATEGORY_NAMES).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Satış Fiyatı (Stars)</label>
                                    <input type="number" required value={editingBot.price} onChange={e => setEditingBot({...editingBot, price: Number((e.target as any).value)})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-xs font-black text-white focus:border-blue-500 outline-none" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Bot Açıklaması</label>
                                <textarea required value={editingBot.description} onChange={e => setEditingBot({...editingBot, description: (e.target as any).value})} className="w-full h-32 bg-slate-950 border border-slate-800 rounded-3xl p-6 text-sm resize-none focus:border-blue-500 outline-none font-medium leading-relaxed" placeholder="Kullanıcılar botu neden kullanmalı?" />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Telegram Linki (@UserName)</label>
                                <div className="flex gap-4">
                                    <div className="relative flex-1 group">
                                        <Send className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-500 transition-colors" size={18} />
                                        <input type="text" required value={editingBot.bot_link} onChange={e => setEditingBot({...editingBot, bot_link: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 pl-12 pr-4 text-xs font-black text-white focus:border-blue-500 outline-none" placeholder="@BotlyHubBOT" />
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={fetchBotIcon}
                                        disabled={isFetchingIcon}
                                        className="px-6 bg-slate-950 border border-slate-800 rounded-2xl text-blue-500 hover:text-white hover:bg-blue-600/20 transition-all flex items-center justify-center disabled:opacity-50 active:scale-95 shadow-xl"
                                    >
                                        {isFetchingIcon ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">İkon URL (Görsel Adresi)</label>
                                <div className="flex gap-6 items-center bg-slate-950 p-6 rounded-3xl border border-slate-800">
                                    <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-2xl">
                                        {editingBot.icon ? <img src={editingBot.icon} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-800" size={24}/>}
                                    </div>
                                    <input type="text" required value={editingBot.icon} onChange={e => setEditingBot({...editingBot, icon: (e.target as any).value})} className="w-full bg-transparent border-b border-slate-800 p-2 text-xs font-bold text-white focus:border-blue-500 outline-none" placeholder="Görsel linki otomatik veya manuel..." />
                                </div>
                            </div>
                            
                            <button type="submit" disabled={isSaving} className="w-full py-7 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[32px] text-[11px] tracking-[0.4em] uppercase shadow-2xl shadow-blue-900/40 active:scale-95 transition-all mt-8 flex items-center justify-center gap-4 disabled:opacity-50">
                                {isSaving ? <Loader2 className="animate-spin" /> : <ShieldCheck size={22} />} VERİLERİ SİSTEME YAYINLA
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => { 
        load(); 
    }, []);
    
    const load = async () => { 
        setIsLoading(true); 
        try {
            const data = await DatabaseService.getUsers();
            setUsers(data); 
        } catch (e) {
            console.error("User management load error:", e);
        } finally {
            setIsLoading(false); 
        }
    };

    const toggleStatus = async (user: User) => {
        const nextStatus = user.status === 'Active' ? 'Passive' : 'Active';
        await DatabaseService.updateUserStatus(user.id, nextStatus);
        if (selectedUser?.id === user.id) setSelectedUser({...selectedUser, status: nextStatus as any});
        load();
    };

    const filteredUsers = users.filter(u => 
        (u.name || '').toLowerCase().includes(search.toLowerCase()) || 
        (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.id || '').toString().includes(search)
    );

    return (
        <div className="animate-in fade-in space-y-10 relative">
            <div className="flex flex-col sm:flex-row justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">ÜYE <span className="text-blue-500">EKOSİSTEMİ</span></h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Sistemdeki Tüm Kayıtlar ({users.length})</p>
                </div>
                <div className="flex gap-4">
                    <input 
                        type="text" 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="İsim, ID veya @username..." 
                        className="bg-[#0f172a] border border-slate-800 rounded-[28px] px-8 py-5 text-xs outline-none focus:border-blue-500 transition-all w-full sm:w-96 font-bold shadow-2xl" 
                    />
                    <button onClick={load} className="p-5 bg-slate-900 border border-slate-800 rounded-[24px] text-slate-400 hover:text-white transition-all shadow-xl active:scale-95"><RefreshCw size={20} className={isLoading ? 'animate-spin' : ''}/></button>
                </div>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-[48px] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950/50 border-b border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <tr>
                                <th className="px-10 py-8">Kullanıcı Profil</th>
                                <th className="px-10 py-8">İletişim</th>
                                <th className="px-10 py-8">Kayıt Tarihi</th>
                                <th className="px-10 py-8">Durum</th>
                                <th className="px-10 py-8 text-right">Eylemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {isLoading ? <tr><td colSpan={5} className="p-32 text-center text-slate-700 font-bold uppercase tracking-[0.5em] animate-pulse italic">Kullanicilar Taranıyor</td></tr> : 
                             filteredUsers.length === 0 ? <tr><td colSpan={5} className="p-20 text-center text-slate-600 font-bold italic">Üye bulunamadı.</td></tr> : 
                             filteredUsers.map(u => (
                                <tr key={u.id} className="hover:bg-slate-800/20 transition-all group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-5">
                                            <div className="relative">
                                                <img src={u.avatar} className="w-14 h-14 rounded-[24px] bg-slate-900 border-2 border-slate-800 shadow-2xl group-hover:scale-110 transition-transform object-cover" />
                                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0f172a] ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                            </div>
                                            <div>
                                                <p className="font-black text-white text-base tracking-tight italic">@{u.username}</p>
                                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">ID: {u.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="space-y-1">
                                            <p className="text-xs text-slate-300 font-bold">{u.email || 'Mail Yok'}</p>
                                            <p className="text-[10px] text-slate-600 font-black uppercase tracking-tighter">{u.phone || 'Tel Yok'}</p>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <p className="text-xs text-slate-500 font-bold">{u.joinDate ? new Date(u.joinDate).toLocaleDateString() : 'Belirsiz'}</p>
                                        <p className="text-[9px] text-slate-700 uppercase font-black mt-1">Platform Katılımı</p>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border ${u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => toggleStatus(u)} title={u.status === 'Active' ? 'Erişimi Kes' : 'Erişim Ver'} className={`p-3 rounded-2xl transition-all shadow-xl ${u.status === 'Active' ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'}`}>
                                                {u.status === 'Active' ? <Ban size={20}/> : <CheckCircle size={20}/>}
                                            </button>
                                            <button onClick={() => setSelectedUser(u)} className="p-3 bg-slate-800 text-slate-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-xl">
                                                <Eye size={20}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedUser && (
                <UserDetailsView user={selectedUser} onClose={() => setSelectedUser(null)} onStatusToggle={() => toggleStatus(selectedUser)} />
            )}
        </div>
    );
};

const UserDetailsView = ({ user, onClose, onStatusToggle }: { user: User, onClose: () => void, onStatusToggle: () => void }) => {
    const [activeTab, setActiveTab] = useState<'info' | 'assets' | 'logs'>('info');
    const [data, setData] = useState<{ channels: Channel[], logs: Notification[], userBots: any[] }>({ channels: [], logs: [], userBots: [] });
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        setIsLoading(true);
        const res = await DatabaseService.getUserDetailedAssets(user.id);
        setData(res as any);
        setIsLoading(false);
    };

    useEffect(() => { loadData(); }, [user.id]);

    const totalRevenue = data.channels.reduce((sum, c) => sum + (c.revenue || 0), 0);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/90 backdrop-blur-md animate-in fade-in" onClick={onClose}>
            <div className="h-full w-full max-w-4xl bg-[#0f172a] border-l border-slate-800 shadow-2xl flex flex-col relative overflow-hidden" onClick={e => e.stopPropagation()}>
                
                <div className="p-12 pb-8 border-b border-slate-800/50 flex justify-between items-start shrink-0 bg-slate-950/20">
                    <div className="flex gap-10">
                        <div className="relative">
                            <img src={user.avatar} className="w-28 h-28 rounded-[40px] border-4 border-slate-900 shadow-2xl object-cover" />
                            <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-4 border-[#0f172a] ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        </div>
                        <div>
                            <h3 className="text-4xl font-black text-white tracking-tighter italic uppercase">{user.name}</h3>
                            <p className="text-blue-500 font-black text-base tracking-[0.2em] mt-1 uppercase">@{user.username}</p>
                            <div className="flex gap-4 mt-6">
                                <span className="bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest italic shadow-inner">ID: {user.id}</span>
                                <span className="bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest italic shadow-inner">KATILIM: {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'Belirsiz'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onStatusToggle} className={`p-4 rounded-2xl transition-all shadow-xl ${user.status === 'Active' ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'}`}>
                            {user.status === 'Active' ? <Ban size={24}/> : <CheckCircle size={24}/>}
                        </button>
                        <button onClick={onClose} className="p-4 bg-slate-900 text-slate-500 hover:text-white rounded-2xl border border-slate-800 transition-colors shadow-xl"><X size={24}/></button>
                    </div>
                </div>

                <div className="flex px-12 gap-10 border-b border-slate-800/50 bg-slate-950/40 shrink-0">
                    <TabBtn active={activeTab === 'info'} label="Profil Özeti" icon={TrendingUp} onClick={() => setActiveTab('info')} />
                    <TabBtn active={activeTab === 'assets'} label={`Varlıklar (${data.channels.length + data.userBots.length})`} icon={Package} onClick={() => setActiveTab('assets')} />
                    <TabBtn active={activeTab === 'logs'} label="Aktivite Kaydı" icon={History} onClick={() => setActiveTab('logs')} />
                </div>

                <div className="flex-1 overflow-y-auto p-12 no-scrollbar pb-40">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="animate-spin text-blue-500" size={40} />
                            <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest italic animate-pulse">Sistem Verileri Cekiliyor...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'info' && (
                                <div className="space-y-10 animate-in fade-in">
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                        <DetailCard label="E-POSTA" value={user.email || 'Tanımsız'} icon={Globe} />
                                        <DetailCard label="TELEFON" value={user.phone || 'Tanımsız'} icon={Activity} />
                                        <DetailCard label="YETKİ" value={user.role} icon={ShieldCheck} />
                                        <DetailCard label="TOPLAM KAZANÇ" value={`₺${totalRevenue}`} icon={Wallet} />
                                        <DetailCard label="BAĞLI KANAL" value={data.channels.length} icon={Megaphone} />
                                        <DetailCard label="KÜTÜPHANE" value={data.userBots.length} icon={Bot} />
                                    </div>
                                    <div className="p-12 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-[48px] shadow-2xl">
                                        <div className="flex gap-8 items-center">
                                            <div className="w-20 h-20 bg-blue-600 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-blue-900/50 rotate-3"><Sparkles size={40}/></div>
                                            <div className="flex-1">
                                                <h4 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Kullanıcı Karnesi</h4>
                                                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                                    Bu kullanıcı toplam <span className="text-white font-bold">{data.channels.length} kanal</span> üzerinden botlarımızı aktif etmiştir. 
                                                    Platformdaki genel güven puanı <span className="text-emerald-500 font-black">YÜKSEK</span> olarak işaretlenmiştir.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'assets' && (
                                <div className="space-y-16 animate-in fade-in">
                                    <section>
                                        <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] mb-10 flex items-center gap-4 italic">
                                            <div className="w-2 h-8 bg-blue-600 rounded-full"></div> BAĞLI KANALLAR ({data.channels.length})
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {data.channels.length === 0 ? <p className="col-span-full text-slate-800 italic font-black p-24 text-center border-2 border-dashed border-slate-900 rounded-[48px] text-[10px] uppercase tracking-widest">Kanal Bulunamadı</p> : 
                                            data.channels.map(c => (
                                                <div key={c.id} className="bg-slate-900/50 border border-slate-800 p-10 rounded-[44px] flex flex-col group hover:bg-slate-800/20 transition-all shadow-2xl relative overflow-hidden">
                                                    <div className="flex items-center gap-6 mb-8">
                                                        <img src={c.icon} className="w-20 h-20 rounded-[28px] border-2 border-slate-800 object-cover shadow-2xl group-hover:scale-105 transition-transform" />
                                                        <div className="min-w-0">
                                                            <p className="font-black text-white text-xl italic truncate">{c.name}</p>
                                                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{c.memberCount.toLocaleString()} Üye</span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-auto pt-8 border-t border-slate-800/50 flex justify-between items-center">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic mb-1">Gelir</span>
                                                            <p className="text-2xl font-black text-emerald-500 italic tracking-tighter">₺{c.revenue}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aktif</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                    
                                    <section>
                                        <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] mb-10 flex items-center gap-4 italic">
                                            <div className="w-2 h-8 bg-purple-600 rounded-full"></div> KÜTÜPHANE / BOTLAR ({data.userBots.length})
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {data.userBots.length === 0 ? (
                                                <div className="col-span-full flex flex-col items-center justify-center p-24 border-2 border-dashed border-slate-900 rounded-[48px] bg-slate-950/20 text-center">
                                                    <Bot size={56} className="text-slate-800 mb-6" />
                                                    <p className="text-slate-700 font-black uppercase tracking-[0.3em] text-[11px]">Kütüphane Boş</p>
                                                </div>
                                            ) : (
                                                data.userBots.map((item, idx) => (
                                                    <div key={idx} className="bg-slate-900/40 border border-slate-800 p-8 rounded-[40px] flex flex-col group hover:border-purple-500/50 transition-all shadow-2xl">
                                                        <div className="flex gap-5 items-center mb-6">
                                                            <img src={item.bot.icon} className="w-16 h-16 rounded-[24px] border border-slate-800 object-cover shadow-2xl bg-slate-950" />
                                                            <div className="min-w-0 flex-1">
                                                                <p className="font-black text-white text-base italic truncate tracking-tight mb-1">{item.bot.name}</p>
                                                                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest italic">{CATEGORY_NAMES[item.bot.category] || item.bot.category}</p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex flex-wrap gap-2 mt-auto">
                                                            <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border ${item.ownership.is_active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                                {item.ownership.is_active ? 'Kullanımda' : 'Durduruldu'}
                                                            </span>
                                                            {item.ownership.is_premium && (
                                                                <span className="text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center gap-1.5">
                                                                    <Star size={10} fill="currentColor"/> Premium
                                                                </span>
                                                            )}
                                                            <span className="text-[9px] font-black px-3 py-1.5 rounded-xl uppercase bg-slate-800 text-slate-500 border border-slate-700 shadow-inner">
                                                                {new Date(item.ownership.acquired_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </section>
                                </div>
                            )}

                            {activeTab === 'logs' && (
                                <div className="space-y-6 animate-in fade-in">
                                    <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] mb-10 flex items-center gap-4 italic">
                                        <div className="w-2 h-8 bg-emerald-600 rounded-full"></div> SON AKTİVİTELER
                                    </h4>
                                    {data.logs.length === 0 ? <p className="text-slate-800 italic font-black p-24 text-center border-2 border-dashed border-slate-900 rounded-[48px] text-[10px] uppercase tracking-widest">Kayıt Bulunmuyor</p> : 
                                     data.logs.map(log => (
                                        <div key={log.id} className="bg-slate-900/30 border border-slate-800 p-8 rounded-[36px] flex gap-8 group hover:bg-slate-800/10 transition-all border-l-8 border-l-slate-800 hover:border-l-blue-600">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                                                {log.type === 'payment' ? <Wallet size={24} className="text-emerald-500"/> : 
                                                 log.type === 'security' ? <ShieldAlert size={24} className="text-red-500"/> : 
                                                 log.type === 'bot' ? <Cpu size={24} className="text-purple-500"/> :
                                                 <Bell size={24} className="text-blue-500"/>}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex justify-between items-start gap-4 mb-3">
                                                    <p className="text-base font-black text-white italic truncate tracking-tight">{log.title}</p>
                                                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest whitespace-nowrap mt-1 bg-slate-950 px-3 py-1.5 rounded-xl shadow-inner">{new Date(log.date).toLocaleString('tr-TR')}</p>
                                                </div>
                                                <p className="text-sm text-slate-500 leading-relaxed font-medium">{log.message}</p>
                                            </div>
                                        </div>
                                     ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-[#0f172a] via-[#0f172a] to-transparent shrink-0">
                    <button className="w-full py-7 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[36px] text-[11px] tracking-[0.5em] uppercase shadow-2xl shadow-blue-900/50 active:scale-95 transition-all flex items-center justify-center gap-4">
                        <MessageSquare size={24}/> KULLANICIYA MESAJ GÖNDER
                    </button>
                </div>
            </div>
        </div>
    );
};

const TabBtn = ({ active, label, icon: Icon, onClick }: any) => (
    <button onClick={onClick} className={`flex items-center gap-4 py-8 border-b-4 transition-all relative ${active ? 'border-blue-500 text-white' : 'border-transparent text-slate-600 hover:text-slate-400'}`}>
        <Icon size={20} className={active ? 'text-blue-400' : ''} />
        <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
        {active && <div className="absolute bottom-0 left-0 right-0 h-2 bg-blue-500 blur-md"></div>}
    </button>
);

const DetailCard = ({ label, value, icon: Icon }: any) => (
    <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[44px] group hover:border-slate-700 transition-all shadow-xl">
        <div className="flex items-center gap-3 mb-3 text-slate-600 group-hover:text-blue-500 transition-colors">
            <Icon size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
        </div>
        <p className="text-lg font-black text-white truncate italic tracking-tight">{value}</p>
    </div>
);

const NotificationCenter = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({ title: '', message: '', type: 'system' as any });
    const [history, setHistory] = useState<Notification[]>([]);

    useEffect(() => { load(); }, []);
    const load = async () => { setHistory(await DatabaseService.getNotifications()); };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await DatabaseService.sendNotification({ ...form, target_type: 'global' });
        setIsLoading(false);
        setForm({ title: '', message: '', type: 'system' });
        load();
        alert("Bildirim tüm kullanıcılara ulaştırıldı.");
    };

    return (
        <div className="animate-in fade-in space-y-12">
            <div className="flex flex-col lg:flex-row justify-between gap-12">
                <div className="bg-[#0f172a] border border-slate-800 p-12 rounded-[56px] flex-1 max-w-2xl shadow-2xl">
                    <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-12 flex items-center gap-4"><Megaphone className="text-blue-500" size={32}/> GLOBAL BROADCAST</h3>
                    <form onSubmit={handleSend} className="space-y-10">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">BİLDİRİM TİPİ</label>
                                <select value={form.type} onChange={e => setForm({...form, type: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-sm font-bold focus:border-blue-500 outline-none appearance-none italic">
                                    <option value="system">Duyuru / Kampanya</option>
                                    <option value="payment">Ödeme / Finans</option>
                                    <option value="security">Güvenlik Uyarısı</option>
                                    <option value="bot">Yeni Bot / Güncelleme</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">BİLDİRİM BAŞLIĞI</label>
                                <input required type="text" value={form.title} onChange={e => setForm({...form, title: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-sm font-bold focus:border-blue-500 outline-none shadow-inner" placeholder="örn: Yeni Premium Bot!" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">MESAJ İÇERİĞİ</label>
                            <textarea required value={form.message} onChange={e => setForm({...form, message: (e.target as any).value})} className="w-full h-48 bg-slate-950 border border-slate-800 rounded-3xl p-8 text-sm resize-none focus:border-blue-500 outline-none font-medium leading-relaxed" placeholder="Tüm kullanıcıların bildirim kutusuna düşecek mesaj..." />
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full py-7 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[36px] text-[12px] tracking-[0.4em] uppercase shadow-2xl shadow-blue-900/50 active:scale-95 transition-all">
                            {isLoading ? <Loader2 className="animate-spin mx-auto"/> : 'YAYINI BAŞLAT'}
                        </button>
                    </form>
                </div>

                <div className="flex-1 flex flex-col">
                    <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-10 flex items-center gap-4"><Clock className="text-purple-500"/> YAYIN GEÇMİŞİ</h3>
                    <div className="space-y-5 flex-1 overflow-y-auto no-scrollbar pr-2 max-h-[700px]">
                        {history.filter(n => n.target_type === 'global').length === 0 ? <p className="text-slate-800 italic font-black p-20 text-center text-[11px] uppercase tracking-widest border-2 border-dashed border-slate-900 rounded-[48px]">Henüz yayın yapılmadı.</p> : 
                         history.filter(n => n.target_type === 'global').map(n => (
                            <div key={n.id} className="bg-slate-900/40 border border-slate-800 p-8 rounded-[40px] flex gap-6 hover:bg-slate-800/30 transition-all group shadow-xl">
                                <div className="w-14 h-14 rounded-[20px] bg-slate-950 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                                    <Send size={20} className="text-blue-500"/>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex justify-between items-start mb-2 gap-4">
                                        <p className="text-base font-black text-white italic truncate tracking-tight">{n.title}</p>
                                        <p className="text-[10px] text-slate-700 font-black uppercase tracking-widest whitespace-nowrap mt-1 bg-slate-950 px-3 py-1.5 rounded-xl shadow-inner">{new Date(n.date).toLocaleDateString()}</p>
                                    </div>
                                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed font-medium">{n.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AnnouncementManagement = () => {
    const [anns, setAnns] = useState<Announcement[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnn, setEditingAnn] = useState<Partial<Announcement> | null>(null);

    useEffect(() => { load(); }, []);
    const load = async () => setAnns(await DatabaseService.getAnnouncements());

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAnn) return;
        await DatabaseService.saveAnnouncement(editingAnn);
        setIsModalOpen(false);
        load();
    };

    return (
        <div className="animate-in fade-in space-y-10">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">KAMPANYA <span className="text-blue-500">MASASI</span></h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Ana Sayfa Promosyon Kartları</p>
                </div>
                <button onClick={() => { setEditingAnn({ title: '', description: '', button_text: 'İncele', button_link: '', icon_name: 'Megaphone', color_scheme: 'purple', is_active: true, action_type: 'link' }); setIsModalOpen(true); }} className="px-10 py-5 bg-blue-600 rounded-[32px] text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-3 shadow-2xl shadow-blue-900/30 active:scale-95 transition-all">
                    <Plus size={18}/> Yeni Kart Oluştur
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {anns.length === 0 ? <div className="col-span-full py-40 text-center text-slate-800 font-black uppercase tracking-[0.4em] border-2 border-dashed border-slate-900 rounded-[56px] text-[11px] italic">Aktif kampanya bulunmuyor</div> : 
                 anns.map(a => (
                    <div key={a.id} className="bg-[#0f172a] border border-slate-800 p-10 rounded-[56px] group relative overflow-hidden transition-all hover:border-blue-500/50 flex flex-col shadow-2xl">
                        <div className={`w-16 h-16 rounded-[24px] bg-slate-950 border border-slate-800 flex items-center justify-center mb-10 shadow-inner group-hover:scale-110 transition-transform`}>
                            {React.createElement(AVAILABLE_ICONS.find(i => i.name === a.icon_name)?.icon || Megaphone, { size: 28, className: 'text-blue-500' })}
                        </div>
                        <h4 className="font-black text-2xl text-white mb-4 italic tracking-tighter uppercase">{a.title}</h4>
                        <p className="text-sm text-slate-500 line-clamp-3 mb-12 font-medium leading-relaxed">{a.description}</p>
                        <div className="flex justify-between items-center mt-auto border-t border-slate-800 pt-10">
                            <span className={`text-[10px] font-black px-4 py-2 rounded-2xl uppercase tracking-widest border border-slate-800 text-slate-500 bg-slate-950/50 shadow-inner italic`}>{a.color_scheme}</span>
                            <div className="flex gap-3">
                                <button onClick={() => { setEditingAnn(a); setIsModalOpen(true); }} className="p-4 bg-slate-800 hover:bg-blue-600 text-white rounded-2xl transition-all shadow-xl"><Edit2 size={20}/></button>
                                <button onClick={async () => { if(confirm("Duyuruyu silmek istiyor musunuz?")) { await DatabaseService.deleteAnnouncement(a.id); load(); } }} className="p-4 bg-slate-800 hover:bg-red-500 text-slate-500 hover:text-white rounded-2xl transition-all shadow-xl"><Trash2 size={20}/></button>
                            </div>
                        </div>
                        {!a.is_active && <div className="absolute top-6 right-10 bg-red-600/10 text-red-500 text-[9px] font-black px-3 py-1.5 rounded-xl uppercase border border-red-500/20 italic tracking-widest">PASİF</div>}
                    </div>
                ))}
            </div>

            {isModalOpen && editingAnn && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[56px] p-12 relative shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 text-slate-500 hover:text-white"><X size={26}/></button>
                        <h3 className="text-3xl font-black mb-12 text-white italic tracking-tighter uppercase">{editingAnn.id ? 'Kart Verilerini Düzenle' : 'Yeni Duyuru Kartı'}</h3>
                        <form onSubmit={handleSave} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">KART BAŞLIĞI</label>
                                <input type="text" required value={editingAnn.title} onChange={e => setEditingAnn({...editingAnn, title: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-sm font-bold text-white focus:border-blue-500 outline-none shadow-inner" placeholder="örn: Yeni Premium Bot!" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">PROMO METNİ</label>
                                <textarea required value={editingAnn.description} onChange={e => setEditingAnn({...editingAnn, description: (e.target as any).value})} className="w-full h-28 bg-slate-950 border border-slate-800 rounded-3xl p-6 text-sm resize-none focus:border-blue-500 outline-none font-medium leading-relaxed" placeholder="Ana sayfada görünecek açıklama..." />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">İCON BELİRLE</label>
                                <div className="grid grid-cols-5 gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-inner">
                                    {AVAILABLE_ICONS.map(i => (
                                        <button 
                                            key={i.name} 
                                            type="button"
                                            onClick={() => setEditingAnn({...editingAnn, icon_name: i.name})}
                                            className={`p-4 rounded-2xl flex items-center justify-center transition-all shadow-xl ${editingAnn.icon_name === i.name ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-700 hover:text-slate-400'}`}
                                        >
                                            <i.icon size={24} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">BUTON METNİ</label>
                                    <input type="text" required value={editingAnn.button_text} onChange={e => setEditingAnn({...editingAnn, button_text: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-sm font-bold focus:border-blue-500 outline-none shadow-inner" placeholder="Hemen Başla" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">RENK ŞEMASI</label>
                                    <select value={editingAnn.color_scheme} onChange={e => setEditingAnn({...editingAnn, color_scheme: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-sm font-bold focus:border-blue-500 outline-none appearance-none italic">
                                        <option value="purple">Modern Mor</option>
                                        <option value="blue">Deniz Mavisi</option>
                                        <option value="emerald">Zümrüt Yeşil</option>
                                        <option value="orange">Neon Turuncu</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">HEDEF LİNK / @USER</label>
                                <input type="text" value={editingAnn.button_link} onChange={e => setEditingAnn({...editingAnn, button_link: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-sm font-bold focus:border-blue-500 outline-none shadow-inner" placeholder="@username, /sayfa veya link..." />
                            </div>
                            <div className="flex items-center justify-between p-8 bg-slate-950 border border-slate-800 rounded-[32px] shadow-inner">
                                <div>
                                    <p className="text-sm font-black text-white uppercase tracking-tight">AKTİF DURUMU</p>
                                    <p className="text-[10px] text-slate-600 font-bold uppercase mt-1">Sistemde gösterilsin mi?</p>
                                </div>
                                <button type="button" onClick={() => setEditingAnn({...editingAnn, is_active: !editingAnn.is_active})} className={`w-16 h-8 rounded-full relative transition-all shadow-xl ${editingAnn.is_active ? 'bg-emerald-600' : 'bg-slate-800'}`}>
                                    <div className={`absolute top-1.5 w-5 h-5 bg-white rounded-full transition-all shadow-2xl ${editingAnn.is_active ? 'left-9' : 'left-2'}`} />
                                </button>
                            </div>
                            <button type="submit" className="w-full py-7 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[36px] text-[12px] tracking-[0.4em] uppercase shadow-2xl shadow-blue-900/50 active:scale-95 transition-all mt-6 flex items-center justify-center gap-4">
                                <ShieldCheck size={22} /> KARTI SİSTEME YÜKLE
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const SettingsManagement = () => {
    const [settings, setSettings] = useState({
        appName: 'BotlyHub V3',
        maintenanceMode: false,
        commissionRate: 5,
        supportLink: 'https://t.me/support',
        termsUrl: 'https://botlyhub.com/terms',
        instagramUrl: '',
        telegramChannelUrl: ''
    });
    const [isSaving, setIsLoading] = useState(false);

    useEffect(() => { load(); }, []);
    const load = async () => {
        const data = await DatabaseService.getSettings();
        if (data) setSettings(data);
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await DatabaseService.saveSettings(settings);
            localStorage.setItem('maintenance_mode', settings.maintenanceMode.toString());
            alert("Sistem yapılandırması güncellendi.");
        } catch (e: any) { alert("Hata: Veritabanına ulaşılamadı."); } finally { setIsLoading(false); }
    };

    return (
        <div className="animate-in fade-in space-y-12 pb-24">
            <div>
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">SİSTEM <span className="text-blue-500">PARAMETRELERİ</span></h2>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Platform Çekirdek Ayarları</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-[#0f172a] border border-slate-800 p-12 rounded-[56px] space-y-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
                    <h3 className="font-black text-xl text-white mb-8 uppercase italic flex items-center gap-4"><Globe size={28} className="text-blue-500"/> Marka & Destek</h3>
                    <div className="space-y-8">
                        <div className="space-y-3"> 
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Platform Başlığı</label> 
                            <input type="text" value={settings.appName} onChange={e => setSettings({...settings, appName: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all shadow-inner" /> 
                        </div>
                        <div className="space-y-3"> 
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Destek Kanal Linki</label> 
                            <input type="text" value={settings.supportLink} onChange={e => setSettings({...settings, supportLink: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-sm font-bold text-white focus:border-blue-500 outline-none shadow-inner" /> 
                        </div>
                    </div>
                </div>

                <div className="bg-[#0f172a] border border-slate-800 p-12 rounded-[56px] space-y-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-emerald-600"></div>
                    <h3 className="font-black text-xl text-white mb-8 uppercase italic flex items-center gap-4"><Percent size={28} className="text-emerald-500"/> Operasyonel Ayarlar</h3>
                    <div className="space-y-10">
                        <div className="flex items-center justify-between p-8 bg-slate-950 border border-slate-800 rounded-[36px] shadow-inner">
                            <div> 
                                <p className="text-base font-black text-white italic tracking-tight uppercase">BAKIM MODU</p> 
                                <p className="text-[10px] text-slate-600 font-bold uppercase mt-1 italic tracking-widest">Platformu erişime kapat</p> 
                            </div>
                            <button onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})} className={`w-16 h-8 rounded-full relative transition-all shadow-2xl ${settings.maintenanceMode ? 'bg-red-600' : 'bg-slate-800'}`}> 
                                <div className={`absolute top-1.5 w-5 h-5 bg-white rounded-full transition-all shadow-inner ${settings.maintenanceMode ? 'left-9' : 'left-2'}`} /> 
                            </button>
                        </div>
                        <div className="space-y-3"> 
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Komisyon Oranı (%)</label> 
                            <input type="number" value={settings.commissionRate} onChange={e => setSettings({...settings, commissionRate: Number((e.target as any).value)})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-sm font-bold text-white focus:border-emerald-500 outline-none shadow-inner" /> 
                        </div>
                    </div>
                </div>
            </div>

            <button onClick={handleSave} disabled={isSaving} className="w-full py-8 bg-blue-600 hover:bg-blue-500 text-white font-black text-[12px] uppercase tracking-[0.6em] rounded-[40px] shadow-2xl shadow-blue-900/50 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 mt-12"> 
                {isSaving ? <Loader2 className="animate-spin" /> : <ShieldCheck size={26} />} TÜM SİSTEMİ GÜNCELLE
            </button>
        </div>
    );
}

export default AdminDashboard;
