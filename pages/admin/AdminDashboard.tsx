
import React, { useEffect, useState } from 'react';
import * as Router from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bot, LogOut, Menu, X, 
  Package, Loader2, RefreshCw, Plus, Edit2, Trash2, 
  Megaphone, Calendar, Settings as SettingsIcon, 
  ShieldCheck, Percent, Globe, MessageSquare, AlertTriangle,
  Sparkles, Zap, Star, ChevronRight, Eye, Send, Activity, 
  Clock, Wallet, ShieldAlert, Cpu, Ban, CheckCircle, Gift, Info, Heart, Bell, Shield, ExternalLink, TrendingUp, History, ListFilter, CreditCard, Image as ImageIcon, Wand2, Hash, Fingerprint, Key, Search, Database
} from 'lucide-react';
import { DatabaseService, supabase } from '../../services/DatabaseService';
import { User, Bot as BotType, Announcement, Notification, Channel, ActivityLog } from '../../types';
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

const LogItem = ({ log }: { log: ActivityLog }) => {
  const getLogStyle = (type: string) => {
    switch(type) {
        case 'auth': return { icon: Key, color: 'text-blue-400', bg: 'bg-blue-400/10' };
        case 'bot_manage': return { icon: Bot, color: 'text-purple-400', bg: 'bg-purple-400/10' };
        case 'channel_sync': return { icon: RefreshCw, color: 'text-emerald-400', bg: 'bg-emerald-400/10' };
        case 'payment': return { icon: Wallet, color: 'text-yellow-400', bg: 'bg-yellow-400/10' };
        case 'security': return { icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-400/10' };
        default: return { icon: Activity, color: 'text-slate-400', bg: 'bg-slate-400/10' };
    }
  };

  const style = getLogStyle(log.type);
  const Icon = style.icon;

  return (
    <div className="flex gap-5 group animate-in slide-in-from-left duration-300 bg-slate-900/40 p-5 rounded-[28px] border border-slate-800 hover:border-blue-500/30 transition-all">
      <div className={`w-14 h-14 rounded-2xl ${style.bg} ${style.color} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3">
                <p className="text-sm font-black text-white italic tracking-tight">{log.title}</p>
                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${style.bg} ${style.color} border-current opacity-50`}>{log.type}</span>
            </div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic bg-slate-950 px-3 py-1 rounded-xl shadow-inner">
                {new Date(log.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </p>
        </div>
        <p className="text-xs text-slate-400 font-medium group-hover:text-slate-300 transition-colors leading-relaxed mb-3">{log.description}</p>
        
        {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-800/50">
                {Object.entries(log.metadata).map(([key, val]: any) => (
                    key !== 'client_time' && key !== 'platform' && (
                        <div key={key} className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shadow-inner group/meta">
                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{key.replace('_', ' ')}:</span>
                            <span className="text-[9px] font-black text-blue-400 italic truncate max-w-[150px]">{String(val)}</span>
                        </div>
                    )
                ))}
            </div>
        )}
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
        className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
      >
        <Icon size={18} />
        <span className="font-bold text-[10px] uppercase tracking-widest">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] flex text-slate-200 font-sans overflow-hidden">
      <aside className={`fixed inset-y-0 left-0 z-[70] w-72 bg-[#0f172a] border-r border-slate-800/50 transition-transform lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-8">
          <div className="flex items-center gap-4 mb-14 px-2">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-600/20 rotate-3"><Database size={24} className="text-white"/></div>
            <h2 className="text-xl font-black text-white italic tracking-tighter">BOTLY HUB <span className="text-blue-500">ADMIN</span></h2>
          </div>
          <nav className="flex-1 space-y-3">
            <NavItem to="/a/dashboard" icon={LayoutDashboard} label="Komuta Merkezi" />
            <NavItem to="/a/dashboard/sales" icon={CreditCard} label="Kütüphane Kayıtları" />
            <NavItem to="/a/dashboard/users" icon={Users} label="Üye Yönetimi" />
            <NavItem to="/a/dashboard/bots" icon={Bot} label="Market Ürünleri" />
            <NavItem to="/a/dashboard/notifications" icon={Send} label="Bildirim Gönder" />
            <NavItem to="/a/dashboard/announcements" icon={Megaphone} label="Kampanya Yönetimi" />
            <NavItem to="/a/dashboard/settings" icon={SettingsIcon} label="Sistem Ayarları" />
          </nav>
          <button onClick={() => { DatabaseService.logoutAdmin(); navigate('/a/admin'); }} className="mt-auto flex items-center gap-4 px-6 py-4 text-red-500 font-black text-[11px] tracking-widest uppercase hover:bg-red-500/10 rounded-2xl transition-all active:scale-95">
            <LogOut size={20} /> Güvenli Çıkış
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-slate-800/50 flex items-center justify-between px-10 bg-[#020617]/50 backdrop-blur-3xl shrink-0 z-50">
           <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-3 bg-slate-900 rounded-2xl text-slate-400 border border-slate-800"><Menu size={20}/></button>
           <div className="hidden sm:flex items-center gap-10 text-[10px] font-black text-slate-600 uppercase tracking-widest">
              <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div> Canlı Sistem Akışı</div>
              <div className="w-px h-5 bg-slate-800"></div>
              <div className="flex items-center gap-3"><Cpu size={16} className="text-blue-500"/> Sunucu Stabil</div>
           </div>
           <div className="flex items-center gap-6 ml-auto">
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-[10px] font-black text-white uppercase italic">Sistem Yöneticisi</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Admin Root</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-white shadow-2xl border border-white/10 italic text-xl">AD</div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 bg-[#020617] no-scrollbar">
          <div className="max-w-[1500px] mx-auto pb-20">
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
    // Fix: Adding missing useNavigate hook to resolve 'navigate' is not defined error in this sub-component.
    const navigate = useNavigate();
    const [stats, setStats] = useState({ userCount: 0, botCount: 0, logCount: 0, salesCount: 0 });
    const [combinedLogs, setCombinedLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { load(); }, []);

    const load = async () => {
        setIsLoading(true);
        try {
            const statData = await DatabaseService.getAdminStats();
            setStats(statData);
            
            const { data: logs } = await supabase
                .from('activity_logs')
                .select('*, users(username, avatar)')
                .order('created_at', { ascending: false })
                .limit(20);
            setCombinedLogs(logs || []);
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

    return (
        <div className="animate-in fade-in space-y-12">
            <div className="flex flex-col sm:flex-row justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">KOMUTA <span className="text-blue-500">PANELİ</span></h1>
                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.3em] mt-2">Platform Analitiği ve Operasyon Takibi</p>
                </div>
                <button onClick={load} className="px-8 py-4 bg-slate-900 border border-slate-800 rounded-[20px] text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-blue-500/50 transition-all flex items-center gap-3 shadow-2xl active:scale-95">
                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> Sistemi Senkronize Et
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard label="Platform Üyesi" value={stats.userCount} icon={Users} color="blue" trend="+12% Artış" />
                <StatCard label="Aktif Botlar" value={stats.botCount} icon={Bot} color="purple" trend="+4 Bugün" />
                <StatCard label="Bot Edinme" value={stats.salesCount} icon={CreditCard} color="emerald" trend="Anlık" />
                <StatCard label="Sistem Denetimi" value={stats.logCount} icon={Fingerprint} color="orange" trend="Audit" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-[#0f172a] border border-slate-800 rounded-[48px] p-10 shadow-2xl">
                    <h3 className="text-xl font-black text-white mb-8 uppercase tracking-tight italic flex items-center gap-4"><TrendingUp className="text-blue-500" size={24}/> Trafik ve Katılım</h3>
                    <div className="h-[400px] w-full">
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
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '20px', padding: '15px' }} 
                                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase' }}
                                />
                                <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                <div className="bg-[#0f172a] border border-slate-800 rounded-[48px] p-10 flex flex-col shadow-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight italic flex items-center gap-4"><Clock size={22} className="text-blue-500"/> Audit Log</h3>
                    </div>

                    <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar pr-2 pb-10">
                        {isLoading ? (
                            <div className="py-24 flex flex-col items-center justify-center gap-6 animate-pulse">
                                <Loader2 className="animate-spin text-slate-700" size={48} />
                                <p className="text-[11px] font-black text-slate-700 uppercase tracking-[0.5em] italic">Denetim Verileri İşleniyor</p>
                            </div>
                        ) : combinedLogs.length === 0 ? (
                            <div className="py-24 text-center">
                                <Activity className="mx-auto text-slate-900 mb-6" size={64} />
                                <p className="text-sm text-slate-700 font-black italic uppercase tracking-widest">Sistem kaydı temiz.</p>
                            </div>
                        ) : (
                            combinedLogs.map((log) => (
                                <div key={log.id} className="flex items-center gap-4 p-4 bg-slate-950/40 border border-slate-900 rounded-[28px] group/item hover:border-blue-500/20 transition-all shadow-xl">
                                    <div className="relative shrink-0">
                                        <img src={log.users?.avatar} className="w-12 h-12 rounded-2xl object-cover border border-slate-800" />
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full border-2 border-[#020617] flex items-center justify-center">
                                            <Zap size={8} className="text-white fill-white"/>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-white truncate italic uppercase tracking-tighter">@{log.users?.username || 'user'}</p>
                                        <p className="text-[10px] text-slate-500 truncate font-medium leading-tight">{log.title}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-700 uppercase tracking-tighter">{new Date(log.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                                        <p className="text-[7px] font-black text-slate-800 uppercase italic">Canlı</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/90 to-transparent pointer-events-none"></div>
                    <button onClick={() => navigate('/a/dashboard/users')} className="mt-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] hover:text-white transition-all shadow-xl">Tüm Günlüğü Görüntüle</button>
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
        <div className="animate-in fade-in space-y-12">
            <div className="flex flex-col sm:flex-row justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">ENVANTER <span className="text-emerald-500">HAREKETLERİ</span></h2>
                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.3em] mt-2">Kütüphane Kayıtları ({sales.length})</p>
                </div>
                <div className="flex gap-4">
                    <input 
                        type="text" 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Kullanıcı veya bot ara..." 
                        className="bg-[#0f172a] border border-slate-800 rounded-[24px] px-8 py-5 text-sm outline-none focus:border-emerald-500 transition-all w-full sm:w-96 font-bold shadow-2xl" 
                    />
                    <button onClick={load} className="p-5 bg-slate-900 border border-slate-800 rounded-[20px] text-slate-400 hover:text-white transition-all shadow-2xl active:scale-95"><RefreshCw size={24} className={isLoading ? 'animate-spin' : ''}/></button>
                </div>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-[56px] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950/50 border-b border-slate-800 text-[11px] font-black text-slate-600 uppercase tracking-[0.4em]">
                            <tr>
                                <th className="px-12 py-10">Üye Profili</th>
                                <th className="px-12 py-10">İlişkili Bot</th>
                                <th className="px-12 py-10">Tarih</th>
                                <th className="px-12 py-10 text-right">Mülkiyet</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {isLoading ? <tr><td colSpan={4} className="p-32 text-center text-slate-700 font-black italic animate-pulse uppercase tracking-[0.5em]">Veriler Çekiliyor</td></tr> : 
                             filteredSales.length === 0 ? <tr><td colSpan={4} className="p-32 text-center text-slate-800 font-black italic uppercase tracking-widest">Kayıt bulunamadı.</td></tr> : 
                             filteredSales.map((s, idx) => (
                                <tr key={idx} className="hover:bg-slate-800/20 transition-all group">
                                    <td className="px-12 py-10">
                                        <div className="flex items-center gap-6">
                                            <img src={s.users?.avatar} className="w-16 h-16 rounded-[28px] bg-slate-950 border border-slate-800 shadow-2xl group-hover:scale-110 transition-transform" />
                                            <div>
                                                <p className="font-black text-white text-lg italic tracking-tight">@{s.users?.username}</p>
                                                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">{s.users?.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-12 py-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-[24px] bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shadow-xl">
                                                <img src={s.bots?.icon} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="font-black text-white text-base italic tracking-tight">{s.bots?.name}</p>
                                                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 italic">{s.bots?.price} STARS</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-12 py-10">
                                        <p className="text-sm text-slate-300 font-black italic tracking-tighter">{new Date(s.acquired_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-1.5">{new Date(s.acquired_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                                    </td>
                                    <td className="px-12 py-10 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.7)]"></div>
                                            <span className="text-[12px] font-black text-emerald-400 uppercase tracking-[0.2em] italic">Aktif</span>
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
        <div className="animate-in fade-in space-y-12">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">ÜRÜN <span className="text-blue-500">EKOSİSTEMİ</span></h2>
                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.3em] mt-2">Market Envanteri ve Bot Tanımları</p>
                </div>
                <button onClick={() => { setEditingBot({ name: '', description: '', price: 0, category: 'productivity', bot_link: '', icon: '', screenshots: [] }); setIsModalOpen(true); }} className="px-10 py-6 bg-blue-600 rounded-[32px] text-[11px] font-black uppercase tracking-[0.3em] text-white flex items-center gap-4 shadow-2xl shadow-blue-900/40 active:scale-95 transition-all">
                    <Plus size={22}/> Yeni Bot Tanımla
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {isLoading ? <div className="col-span-full p-48 text-center font-black italic animate-pulse text-slate-800 uppercase tracking-[0.5em]">Market Verileri Okunuyor</div> : 
                 bots.map(b => (
                    <div key={b.id} className="bg-[#0f172a] border border-slate-800 p-12 rounded-[56px] hover:border-blue-500/40 transition-all flex flex-col group shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[60px] pointer-events-none"></div>
                        <div className="flex gap-8 mb-10 relative z-10">
                            <img src={b.icon} className="w-24 h-24 rounded-[32px] object-cover border-4 border-slate-900 bg-slate-950 shadow-2xl group-hover:scale-105 transition-transform" />
                            <div className="min-w-0 flex-1">
                                <h4 className="font-black text-white text-xl italic tracking-tight truncate mb-2">{b.name}</h4>
                                <div className="flex flex-wrap gap-2.5 items-center mb-4">
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-900 shadow-inner">ID: {b.id}</span>
                                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/5 px-3 py-1.5 rounded-xl border border-blue-500/10 italic">{CATEGORY_NAMES[b.category] || b.category}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Star size={18} className="text-yellow-500" fill="currentColor"/>
                                    <span className="font-black text-xl text-white italic tracking-tighter">{b.price} Yıldız</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-3 mb-12 font-medium leading-relaxed italic">{b.description}</p>
                        <div className="flex gap-3 mt-auto relative z-10">
                            <button onClick={() => { setEditingBot(b); setIsModalOpen(true); }} className="flex-1 py-5 bg-slate-800 hover:bg-blue-600 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl"> <Edit2 size={16}/> Düzenle </button>
                            <button onClick={async () => { if(confirm("Botu sistemden silmek istediğinize emin misiniz?")) { await DatabaseService.deleteBot(b.id); load(); } }} className="p-5 bg-slate-800 hover:bg-red-500 text-slate-500 hover:text-white rounded-2xl transition-all shadow-xl active:scale-90"><Trash2 size={20}/></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && editingBot && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in" onClick={() => !isSaving && setIsModalOpen(false)}>
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[64px] p-14 relative shadow-2xl overflow-y-auto max-h-[95vh] no-scrollbar" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setIsModalOpen(false)} disabled={isSaving} className="absolute top-12 right-12 text-slate-500 hover:text-white disabled:opacity-30 transition-colors"><X size={32}/></button>
                        <h3 className="text-4xl font-black mb-14 text-white italic tracking-tighter uppercase">{editingBot.id ? 'Verileri Revize Et' : 'Yeni Ürün Kaydı'}</h3>
                        <form onSubmit={handleSave} className="space-y-10">
                            <div className="bg-blue-600/5 border border-blue-500/10 p-8 rounded-[36px] mb-6 flex items-start gap-5 shadow-inner">
                                <AlertTriangle size={28} className="text-blue-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[11px] font-black text-white uppercase tracking-widest mb-1.5">Kritik Kodlama Notu</p>
                                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Bu botun Python/JS kodundaki <span className="text-blue-400 font-bold italic">BOT_ID</span> parametresi ile buradaki Sistem ID (Kod) değeri tam olarak eşleşmelidir. Aksi halde senkronizasyon başarısız olur.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Sistem ID (Kod Kimliği)</label>
                                    <div className="relative group">
                                        <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-500 transition-colors" size={18} />
                                        <input type="text" required value={editingBot.id} onChange={e => setEditingBot({...editingBot, id: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-3xl py-6 pl-14 pr-6 text-sm font-black text-white focus:border-blue-500 outline-none shadow-inner" placeholder="örn: task_pro_01" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Ürün Görünür Adı</label>
                                    <input type="text" required value={editingBot.name} onChange={e => setEditingBot({...editingBot, name: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 text-sm font-black text-white focus:border-blue-500 outline-none shadow-inner" placeholder="Task Master" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Sektörel Kategori</label>
                                    <select value={editingBot.category} onChange={e => setEditingBot({...editingBot, category: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 text-sm font-black text-white focus:border-blue-500 outline-none appearance-none italic shadow-inner">
                                        {Object.entries(CATEGORY_NAMES).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Satış Fiyatı (Stars)</label>
                                    <input type="number" required value={editingBot.price} onChange={e => setEditingBot({...editingBot, price: Number((e.target as any).value)})} className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 text-sm font-black text-white focus:border-blue-500 outline-none shadow-inner" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Market Açıklaması</label>
                                <textarea required value={editingBot.description} onChange={e => setEditingBot({...editingBot, description: (e.target as any).value})} className="w-full h-40 bg-slate-950 border border-slate-800 rounded-[32px] p-8 text-sm resize-none focus:border-blue-500 outline-none font-medium leading-relaxed shadow-inner" placeholder="Kullanıcılar botu neden kullanmalı? Özelliklerini detaylandırın..." />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Telegram Bot Linki (@Username)</label>
                                <div className="flex gap-4">
                                    <div className="relative flex-1 group">
                                        <Send className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-500 transition-colors" size={20} />
                                        <input type="text" required value={editingBot.bot_link} onChange={e => setEditingBot({...editingBot, bot_link: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-3xl py-6 pl-14 pr-6 text-sm font-black text-white focus:border-blue-500 outline-none shadow-inner" placeholder="@BotlyHubBOT" />
                                    </div>
                                    <button type="button" onClick={fetchBotIcon} disabled={isFetchingIcon} className="px-8 bg-slate-950 border border-slate-800 rounded-3xl text-blue-500 hover:text-white hover:bg-blue-600 transition-all flex items-center justify-center disabled:opacity-50 active:scale-95 shadow-2xl">
                                        {isFetchingIcon ? <Loader2 className="animate-spin" size={24} /> : <Wand2 size={24} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Ürün İkonu (URL)</label>
                                <div className="flex gap-8 items-center bg-slate-950 p-8 rounded-[36px] border border-slate-800 shadow-inner">
                                    <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-[28px] flex items-center justify-center overflow-hidden shrink-0 shadow-2xl">
                                        {editingBot.icon ? <img src={editingBot.icon} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-800" size={32}/>}
                                    </div>
                                    <input type="text" required value={editingBot.icon} onChange={e => setEditingBot({...editingBot, icon: (e.target as any).value})} className="w-full bg-transparent border-b border-slate-800 p-3 text-xs font-black text-white focus:border-blue-500 outline-none" placeholder="İkon linkini buraya yapıştırın veya sihirbazı kullanın..." />
                                </div>
                            </div>
                            
                            <button type="submit" disabled={isSaving} className="w-full py-8 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[36px] text-[12px] tracking-[0.5em] uppercase shadow-2xl shadow-blue-900/40 active:scale-95 transition-all mt-10 flex items-center justify-center gap-5 disabled:opacity-50">
                                {isSaving ? <Loader2 className="animate-spin" /> : <ShieldCheck size={26} />} MARKET VERİLERİNİ YAYINLA
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

    useEffect(() => { load(); }, []);
    
    const load = async () => { 
        setIsLoading(true); 
        try {
            const data = await DatabaseService.getUsers();
            setUsers(data); 
        } catch (e: any) {
            console.error("User management fetch crash:", e.message);
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
        <div className="animate-in fade-in space-y-12 relative">
            <div className="flex flex-col sm:flex-row justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">ÜYE <span className="text-blue-500">EKOSİSTEMİ</span></h2>
                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.3em] mt-2">Sistemdeki Tüm Kayıtlar ({users.length})</p>
                </div>
                <div className="flex gap-4">
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="İsim, ID veya @username..." className="bg-[#0f172a] border border-slate-800 rounded-[28px] px-10 py-5 text-sm outline-none focus:border-blue-500 transition-all w-full sm:w-[450px] font-bold shadow-2xl" />
                    <button onClick={load} className="p-6 bg-slate-900 border border-slate-800 rounded-[24px] text-slate-400 hover:text-white transition-all shadow-2xl active:scale-95"><RefreshCw size={24} className={isLoading ? 'animate-spin' : ''}/></button>
                </div>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-[64px] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950/50 border-b border-slate-800 text-[11px] font-black text-slate-600 uppercase tracking-[0.4em]">
                            <tr>
                                <th className="px-12 py-10">Üye Profili</th>
                                <th className="px-12 py-10">İletişim</th>
                                <th className="px-12 py-10">Katılım</th>
                                <th className="px-12 py-10">Durum</th>
                                <th className="px-12 py-10 text-right">Aksiyon</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {isLoading ? <tr><td colSpan={5} className="p-40 text-center text-slate-800 font-black uppercase tracking-[0.5em] animate-pulse italic">Üye Verileri Taranıyor</td></tr> : 
                             filteredUsers.length === 0 ? <tr><td colSpan={5} className="p-20 text-center text-slate-800 font-black italic uppercase tracking-widest">Üye bulunamadı.</td></tr> : 
                             filteredUsers.map(u => (
                                <tr key={u.id} className="hover:bg-slate-800/20 transition-all group">
                                    <td className="px-12 py-10">
                                        <div className="flex items-center gap-6">
                                            <div className="relative">
                                                <img src={u.avatar} className="w-16 h-16 rounded-[28px] bg-slate-900 border-2 border-slate-800 shadow-2xl group-hover:scale-110 transition-transform object-cover" />
                                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-[#0f172a] ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                            </div>
                                            <div>
                                                <p className="font-black text-white text-lg tracking-tight italic">@{u.username}</p>
                                                <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest">ID: {u.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-12 py-10">
                                        <div className="space-y-1.5">
                                            <p className="text-sm text-slate-300 font-black italic">{u.email || 'Mail Kaydı Yok'}</p>
                                            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">{u.phone || 'Telefon Kaydı Yok'}</p>
                                        </div>
                                    </td>
                                    <td className="px-12 py-10">
                                        <p className="text-sm text-slate-400 font-black italic">{u.joinDate ? new Date(u.joinDate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Belirsiz'}</p>
                                        <p className="text-[9px] text-slate-700 uppercase font-black mt-1.5 tracking-widest">Platform Kaydı</p>
                                    </td>
                                    <td className="px-12 py-10">
                                        <span className={`text-[10px] font-black px-4 py-2 rounded-2xl uppercase tracking-[0.2em] border italic ${u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5' : 'bg-red-500/10 text-red-500 border-red-500/20 shadow-red-500/5'}`}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td className="px-12 py-10 text-right">
                                        <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                            <button onClick={() => toggleStatus(u)} title={u.status === 'Active' ? 'Hesabı Kısıtla' : 'Kısıtlamayı Kaldır'} className={`p-4 rounded-2xl transition-all shadow-xl ${u.status === 'Active' ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'}`}>
                                                {u.status === 'Active' ? <Ban size={22}/> : <CheckCircle size={22}/>}
                                            </button>
                                            <button onClick={() => setSelectedUser(u)} className="p-4 bg-slate-800 text-slate-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-xl">
                                                <Eye size={22}/>
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
    const [data, setData] = useState<{ channels: Channel[], logs: ActivityLog[], userBots: any[] }>({ channels: [], logs: [], userBots: [] });
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
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/95 backdrop-blur-xl animate-in fade-in" onClick={onClose}>
            <div className="h-full w-full max-w-5xl bg-[#0f172a] border-l border-slate-800 shadow-2xl flex flex-col relative overflow-hidden" onClick={e => e.stopPropagation()}>
                
                <div className="p-14 pb-10 border-b border-slate-800/50 flex justify-between items-start shrink-0 bg-slate-950/30 relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] pointer-events-none"></div>
                    <div className="flex gap-12 relative z-10">
                        <div className="relative">
                            <img src={user.avatar} className="w-32 h-32 rounded-[44px] border-4 border-slate-900 shadow-2xl object-cover" />
                            <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-4 border-[#0f172a] ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        </div>
                        <div className="flex flex-col justify-center">
                            <h3 className="text-5xl font-black text-white tracking-tighter italic uppercase">{user.name}</h3>
                            <p className="text-blue-500 font-black text-xl tracking-[0.3em] mt-2 uppercase italic">@{user.username}</p>
                            <div className="flex gap-5 mt-8">
                                <span className="bg-slate-950 px-5 py-2.5 rounded-2xl border border-slate-800 text-[11px] font-black text-slate-500 uppercase tracking-widest italic shadow-inner">ID: {user.id}</span>
                                <span className="bg-slate-950 px-5 py-2.5 rounded-2xl border border-slate-800 text-[11px] font-black text-slate-500 uppercase tracking-widest italic shadow-inner">KATILIM: {user.joinDate ? new Date(user.joinDate).toLocaleDateString('tr-TR') : 'Belirsiz'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 relative z-10">
                        <button onClick={onStatusToggle} className={`p-5 rounded-[24px] transition-all shadow-xl ${user.status === 'Active' ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'}`}>
                            {user.status === 'Active' ? <Ban size={30}/> : <CheckCircle size={30}/>}
                        </button>
                        <button onClick={onClose} className="p-5 bg-slate-900 text-slate-500 hover:text-white rounded-[24px] border border-slate-800 transition-all shadow-xl active:scale-90"><X size={30}/></button>
                    </div>
                </div>

                <div className="flex px-14 gap-12 border-b border-slate-800/50 bg-slate-950/40 shrink-0">
                    <TabBtn active={activeTab === 'info'} label="Profil Özeti" icon={TrendingUp} onClick={() => setActiveTab('info')} />
                    <TabBtn active={activeTab === 'assets'} label={`Varlıklar (${data.channels.length + data.userBots.length})`} icon={Package} onClick={() => setActiveTab('assets')} />
                    <TabBtn active={activeTab === 'logs'} label="Detaylı Denetim Kaydı" icon={History} onClick={() => setActiveTab('logs')} />
                </div>

                <div className="flex-1 overflow-y-auto p-14 no-scrollbar pb-60">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-8">
                            <Loader2 className="animate-spin text-blue-500" size={56} />
                            <p className="text-sm font-black text-slate-700 uppercase tracking-[0.6em] italic animate-pulse">Kullanıcı Veritabanı Taranıyor</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'info' && (
                                <div className="space-y-12 animate-in fade-in">
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                                        <DetailCard label="E-POSTA" value={user.email || 'Tanımsız'} icon={Globe} />
                                        <DetailCard label="TELEFON" value={user.phone || 'Tanımsız'} icon={Activity} />
                                        <DetailCard label="YETKİ" value={user.role} icon={ShieldCheck} />
                                        <DetailCard label="PLATFORM KAZANCI" value={`₺${totalRevenue}`} icon={Wallet} />
                                        <DetailCard label="BAĞLI KANALLAR" value={data.channels.length} icon={Megaphone} />
                                        <DetailCard label="MARKET ÜRÜNLERİ" value={data.userBots.length} icon={Bot} />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'assets' && (
                                <div className="space-y-20 animate-in fade-in">
                                    <section>
                                        <div className="flex justify-between items-center mb-14">
                                            <h4 className="text-[12px] font-black text-slate-600 uppercase tracking-[0.5em] flex items-center gap-5 italic">
                                                <div className="w-2.5 h-10 bg-blue-600 rounded-full"></div> KONTROL EDİLEN KANALLAR ({data.channels.length})
                                            </h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            {data.channels.length === 0 ? <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-900 rounded-[56px] text-slate-800 font-black uppercase tracking-[0.4em] italic text-sm">Kanal Kaydı Bulunmuyor</div> : 
                                            data.channels.map(c => (
                                                <div key={c.id} className="bg-slate-900/60 border border-slate-800 p-10 rounded-[48px] flex flex-col group hover:bg-slate-800/30 hover:border-blue-500/30 transition-all shadow-2xl relative overflow-hidden">
                                                    <div className="flex items-center gap-6 mb-10">
                                                        <img src={c.icon} className="w-24 h-24 rounded-[32px] border-4 border-slate-800 object-cover shadow-2xl group-hover:scale-105 transition-transform bg-slate-950" />
                                                        <div className="min-w-0">
                                                            <p className="font-black text-white text-2xl italic truncate tracking-tight">{c.name}</p>
                                                            <span className="text-[12px] font-black text-slate-500 uppercase tracking-[0.2em]">{c.memberCount.toLocaleString()} Üye</span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-auto pt-10 border-t border-slate-800/50 flex justify-between items-center">
                                                        <div className="flex flex-col">
                                                            <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest italic mb-1.5">Net Gelir</span>
                                                            <p className="text-3xl font-black text-emerald-500 italic tracking-tighter">₺{c.revenue}</p>
                                                        </div>
                                                        <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-2 rounded-2xl border border-emerald-500/20">
                                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                            <span className="text-[11px] font-black text-emerald-500 uppercase tracking-widest italic">Aktif</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                    
                                    <section>
                                        <h4 className="text-[12px] font-black text-slate-600 uppercase tracking-[0.5em] mb-14 flex items-center gap-5 italic">
                                            <div className="w-2.5 h-10 bg-purple-600 rounded-full"></div> KÜTÜPHANEDEKİ ÜRÜNLER ({data.userBots.length})
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {data.userBots.length === 0 ? (
                                                <div className="col-span-full flex flex-col items-center justify-center py-32 border-2 border-dashed border-slate-900 rounded-[56px] bg-slate-950/20 text-center">
                                                    <Bot size={72} className="text-slate-900 mb-8" />
                                                    <p className="text-slate-800 font-black uppercase tracking-[0.5em] text-[12px] italic">Kütüphane Boş</p>
                                                </div>
                                            ) : (
                                                data.userBots.map((item, idx) => (
                                                    <div key={idx} className="bg-slate-900/50 border border-slate-800 p-8 rounded-[40px] flex gap-6 group hover:border-purple-500/40 transition-all shadow-2xl relative overflow-hidden">
                                                        <img src={item.bot.icon} className="w-20 h-20 rounded-[28px] border-2 border-slate-800 object-cover shadow-2xl bg-slate-950 shrink-0" />
                                                        <div className="min-w-0 flex-1 flex flex-col justify-center">
                                                            <p className="font-black text-white text-lg italic truncate tracking-tight mb-1">{item.bot.name}</p>
                                                            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest italic mb-4">{CATEGORY_NAMES[item.bot.category] || item.bot.category}</p>
                                                            <div className="flex gap-3">
                                                                <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border ${item.ownership.is_active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/5' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                                    {item.ownership.is_active ? 'Kullanımda' : 'Pasif'}
                                                                </span>
                                                                <span className="text-[9px] font-black px-3 py-1.5 rounded-xl uppercase bg-slate-950 text-slate-600 border border-slate-900 shadow-inner">
                                                                    {new Date(item.ownership.acquired_at).toLocaleDateString('tr-TR')}
                                                                </span>
                                                            </div>
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
                                    <h4 className="text-[12px] font-black text-slate-600 uppercase tracking-[0.5em] mb-14 flex items-center gap-5 italic">
                                        <div className="w-2.5 h-10 bg-emerald-600 rounded-full"></div> OPERASYONEL DENETİM GEÇMİŞİ
                                    </h4>
                                    {data.logs.length === 0 ? <p className="text-slate-800 italic font-black py-40 text-center border-2 border-dashed border-slate-900 rounded-[56px] text-sm uppercase tracking-[0.5em]">Denetim kaydı bulunmuyor</p> : 
                                     data.logs.map(log => <LogItem key={log.id} log={log} />)}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-14 bg-gradient-to-t from-[#0f172a] via-[#0f172a] to-transparent shrink-0 z-20">
                    <button className="w-full py-8 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[40px] text-[13px] tracking-[0.6em] uppercase shadow-2xl shadow-blue-900/60 active:scale-95 transition-all flex items-center justify-center gap-6">
                        <MessageSquare size={30}/> KULLANICI İLE İLETİŞİME GEÇ
                    </button>
                </div>
            </div>
        </div>
    );
};

const TabBtn = ({ active, label, icon: Icon, onClick }: any) => (
    <button onClick={onClick} className={`flex items-center gap-5 py-10 border-b-4 transition-all relative ${active ? 'border-blue-500 text-white' : 'border-transparent text-slate-600 hover:text-slate-400'}`}>
        <Icon size={22} className={active ? 'text-blue-400' : ''} />
        <span className="text-[12px] font-black uppercase tracking-widest">{label}</span>
        {active && <div className="absolute bottom-0 left-0 right-0 h-3 bg-blue-500 blur-xl opacity-50"></div>}
    </button>
);

const DetailCard = ({ label, value, icon: Icon }: any) => (
    <div className="bg-slate-900/50 border border-slate-800 p-10 rounded-[48px] group hover:border-slate-700 transition-all shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-[50px] pointer-events-none"></div>
        <div className="flex items-center gap-4 mb-4 text-slate-600 group-hover:text-blue-500 transition-all">
            <Icon size={20} />
            <span className="text-[11px] font-black uppercase tracking-[0.3em]">{label}</span>
        </div>
        <p className="text-2xl font-black text-white truncate italic tracking-tighter relative z-10">{value}</p>
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
                <div className="bg-[#0f172a] border border-slate-800 p-14 rounded-[64px] flex-1 max-w-2xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] pointer-events-none"></div>
                    <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-14 flex items-center gap-5 relative z-10"><Megaphone className="text-blue-500" size={36}/> GLOBAL YAYIN</h3>
                    <form onSubmit={handleSend} className="space-y-12 relative z-10">
                        <div className="grid grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">İÇERİK TİPİ</label>
                                <select value={form.type} onChange={e => setForm({...form, type: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-7 text-sm font-black focus:border-blue-500 outline-none appearance-none italic shadow-inner">
                                    <option value="system">Duyuru / Kampanya</option>
                                    <option value="payment">Ödeme / Finans</option>
                                    <option value="security">Güvenlik Uyarısı</option>
                                    <option value="bot">Yeni Bot / Güncelleme</option>
                                </select>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">YAYIN BAŞLIĞI</label>
                                <input required type="text" value={form.title} onChange={e => setForm({...form, title: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-7 text-sm font-black text-white focus:border-blue-500 outline-none shadow-inner" placeholder="örn: Yeni Premium Bot Yayında!" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">MESAJ GÖVDESİ</label>
                            <textarea required value={form.message} onChange={e => setForm({...form, message: (e.target as any).value})} className="w-full h-60 bg-slate-950 border border-slate-800 rounded-[36px] p-8 text-sm resize-none focus:border-blue-500 outline-none font-medium leading-relaxed shadow-inner" placeholder="Tüm kullanıcıların ekranına düşecek mesajı buraya yazın..." />
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full py-8 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[40px] text-[13px] tracking-[0.5em] uppercase shadow-2xl shadow-blue-900/60 active:scale-95 transition-all">
                            {isLoading ? <Loader2 className="animate-spin mx-auto" size={32}/> : 'YAYINI BAŞLAT'}
                        </button>
                    </form>
                </div>
                <div className="flex-1 flex flex-col">
                    <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-12 flex items-center gap-5"><Clock className="text-purple-500" size={30}/> YAYIN ARŞİVİ</h3>
                    <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar pr-4 max-h-[800px] pb-20">
                        {history.filter(n => n.target_type === 'global').length === 0 ? <p className="text-slate-800 italic font-black py-40 text-center text-sm uppercase tracking-[0.5em] border-2 border-dashed border-slate-900 rounded-[56px]">Henüz yayın yapılmadı.</p> : 
                         history.filter(n => n.target_type === 'global').map(n => (
                            <div key={n.id} className="bg-slate-900/50 border border-slate-800 p-8 rounded-[40px] flex gap-8 hover:bg-slate-800/40 transition-all group shadow-2xl relative overflow-hidden">
                                <div className="w-16 h-16 rounded-[24px] bg-slate-950 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform border border-slate-900">
                                    <Send size={26} className="text-blue-500"/>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex justify-between items-start mb-3 gap-6">
                                        <p className="text-xl font-black text-white italic truncate tracking-tight uppercase">{n.title}</p>
                                        <p className="text-[10px] text-slate-700 font-black uppercase tracking-widest whitespace-nowrap mt-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-900 shadow-inner">{new Date(n.date).toLocaleDateString('tr-TR')}</p>
                                    </div>
                                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed font-medium italic">{n.message}</p>
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
        <div className="animate-in fade-in space-y-12">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">KAMPANYA <span className="text-blue-500">MASASI</span></h2>
                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.3em] mt-2">Ana Sayfa Promosyon Kartları Yönetimi</p>
                </div>
                <button onClick={() => { setEditingAnn({ title: '', description: '', button_text: 'İncele', button_link: '', icon_name: 'Megaphone', color_scheme: 'purple', is_active: true, action_type: 'link' }); setIsModalOpen(true); }} className="px-12 py-6 bg-blue-600 rounded-[36px] text-[11px] font-black uppercase tracking-[0.3em] text-white flex items-center gap-4 shadow-2xl shadow-blue-900/40 active:scale-95 transition-all">
                    <Plus size={22}/> Yeni Kart Oluştur
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {anns.length === 0 ? <div className="col-span-full py-48 text-center text-slate-800 font-black uppercase tracking-[0.6em] border-2 border-dashed border-slate-900 rounded-[64px] text-sm italic">Aktif kampanya bulunmuyor</div> : 
                 anns.map(a => (
                    <div key={a.id} className="bg-[#0f172a] border border-slate-800 p-12 rounded-[64px] group relative overflow-hidden transition-all hover:border-blue-500/50 flex flex-col shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[60px] pointer-events-none"></div>
                        <div className={`w-20 h-20 rounded-[28px] bg-slate-950 border border-slate-800 flex items-center justify-center mb-12 shadow-inner group-hover:scale-110 transition-transform relative z-10`}>
                            {React.createElement(AVAILABLE_ICONS.find(i => i.name === a.icon_name)?.icon || Megaphone, { size: 36, className: 'text-blue-500' })}
                        </div>
                        <h4 className="font-black text-3xl text-white mb-6 italic tracking-tighter uppercase relative z-10 leading-none">{a.title}</h4>
                        <p className="text-sm text-slate-500 line-clamp-3 mb-14 font-medium leading-relaxed italic relative z-10">{a.description}</p>
                        <div className="flex justify-between items-center mt-auto border-t border-slate-800/50 pt-10 relative z-10">
                            <span className={`text-[11px] font-black px-5 py-2.5 rounded-2xl uppercase tracking-widest border border-slate-800 text-slate-600 bg-slate-950/50 shadow-inner italic`}>{a.color_scheme}</span>
                            <div className="flex gap-4">
                                <button onClick={() => { setEditingAnn(a); setIsModalOpen(true); }} className="p-5 bg-slate-800 hover:bg-blue-600 text-white rounded-[20px] transition-all shadow-xl active:scale-90"><Edit2 size={24}/></button>
                                <button onClick={async () => { if(confirm("Duyuruyu silmek istiyor musunuz?")) { await DatabaseService.deleteAnnouncement(a.id); load(); } }} className="p-5 bg-slate-800 hover:bg-red-500 text-slate-500 hover:text-white rounded-[20px] transition-all shadow-xl active:scale-90"><Trash2 size={24}/></button>
                            </div>
                        </div>
                        {!a.is_active && <div className="absolute top-8 right-12 bg-red-600/10 text-red-500 text-[10px] font-black px-4 py-2 rounded-2xl uppercase border border-red-500/20 italic tracking-[0.2em] shadow-2xl">PASİF</div>}
                    </div>
                ))}
            </div>
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
        <div className="animate-in fade-in space-y-12 pb-32">
            <div>
                <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">PLATFORM <span className="text-blue-500">AYARLARI</span></h2>
                <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.3em] mt-2">Çekirdek Sistem Yapılandırması</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-[#0f172a] border border-slate-800 p-14 rounded-[64px] space-y-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2.5 h-full bg-blue-600"></div>
                    <h3 className="font-black text-2xl text-white mb-4 uppercase italic flex items-center gap-5"><Globe size={32} className="text-blue-500"/> Marka ve Destek Hattı</h3>
                    <div className="space-y-10">
                        <div className="space-y-4"> 
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Platformun Genel Adı</label> 
                            <input type="text" value={settings.appName} onChange={e => setSettings({...settings, appName: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-7 text-sm font-black text-white focus:border-blue-500 outline-none transition-all shadow-inner" /> 
                        </div>
                    </div>
                </div>
            </div>
            <button onClick={handleSave} disabled={isSaving} className="w-full py-10 bg-blue-600 hover:bg-blue-500 text-white font-black text-[13px] uppercase tracking-[0.8em] rounded-[48px] shadow-2xl shadow-blue-900/60 active:scale-95 transition-all flex items-center justify-center gap-6 disabled:opacity-50 mt-12"> 
                {isSaving ? <Loader2 className="animate-spin" size={32} /> : <ShieldCheck size={32} />} SİSTEMİ GLOBAL OLARAK GÜNCELLE
            </button>
        </div>
    );
}

export default AdminDashboard;
