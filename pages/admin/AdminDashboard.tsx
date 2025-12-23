
import React, { useEffect, useState } from 'react';
import * as Router from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bot, LogOut, Menu, X, 
  Loader2, RefreshCw, Plus, Trash2, 
  Megaphone, Settings as SettingsIcon, 
  ShieldCheck, Globe, Send, Activity, 
  Wallet, ShieldAlert, Cpu, Ban, CheckCircle, 
  Search, Database, Hash, Wand2, Image as ImageIcon, History,
  Mail, BellRing, Sparkles, Eye, Zap, RefreshCcw,
  // Added Star icon to resolve 'Cannot find name Star' error in BotManagement component.
  Star
} from 'lucide-react';
import { DatabaseService, supabase } from '../../services/DatabaseService';
import { User, Bot as BotType, Announcement, Notification, Channel, ActivityLog } from '../../types';

const { useNavigate, Routes, Route, Link, useLocation } = Router as any;

const CATEGORY_NAMES: Record<string, string> = {
    'productivity': 'Üretkenlik',
    'games': 'Eğlence & Oyun',
    'utilities': 'Araçlar & Servisler',
    'finance': 'Finans & Ekonomi',
    'music': 'Müzik & Ses',
    'moderation': 'Grup Yönetimi'
};

// --- ALT BİLEŞENLER ---

const StatCard = ({ label, value, icon: Icon, color }: any) => {
  const colors: any = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20'
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg border ${colors[color]}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
          <p className="text-2xl font-black text-white">{value}</p>
        </div>
      </div>
    </div>
  );
};

const LogItem = ({ log }: { log: any }) => {
  const getLogStyle = (type: string) => {
    switch(type) {
        case 'auth': return { icon: Hash, color: 'text-blue-400', bg: 'bg-blue-400/10' };
        case 'bot_manage': return { icon: Bot, color: 'text-purple-400', bg: 'bg-purple-400/10' };
        case 'channel_sync': return { icon: RefreshCcw, color: 'text-emerald-400', bg: 'bg-emerald-400/10' };
        case 'payment': return { icon: Wallet, color: 'text-yellow-400', bg: 'bg-yellow-400/10' };
        case 'security': return { icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-400/10' };
        default: return { icon: Activity, color: 'text-slate-400', bg: 'bg-slate-400/10' };
    }
  };

  const style = getLogStyle(log.type);
  const Icon = style.icon;
  const logUser = log.users;

  return (
    <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl mb-3 hover:border-slate-700 transition-all group relative overflow-hidden">
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${style.bg} ${style.color} group-hover:scale-110 transition-transform`}>
                <Icon size={16} />
            </div>
            <div>
                <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white leading-none">{log.title}</p>
                    {logUser && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-950 border border-slate-800 rounded-md">
                            <img src={logUser.avatar} className="w-3.5 h-3.5 rounded-full object-cover" />
                            <span className="text-[9px] font-black text-blue-400 italic">@{logUser.username}</span>
                        </div>
                    )}
                </div>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight mt-1">{log.type}</p>
            </div>
        </div>
        <div className="text-right">
            <p className="text-[10px] text-slate-600 font-bold italic leading-none">
                {new Date(log.created_at).toLocaleTimeString('tr-TR')}
            </p>
            <p className="text-[8px] text-slate-700 font-bold uppercase tracking-tighter mt-1">
                {new Date(log.created_at).toLocaleDateString('tr-TR')}
            </p>
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-3 ml-11 leading-relaxed border-l-2 border-slate-800 pl-3 py-0.5">{log.description}</p>
    </div>
  );
};

// --- ANA PANEL ---

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
        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
      >
        <Icon size={18} />
        <span className="font-bold text-xs uppercase tracking-widest">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] flex text-slate-200 font-sans overflow-hidden">
      <aside className={`fixed inset-y-0 left-0 z-[70] w-64 bg-slate-900 border-r border-slate-800 transition-transform lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg rotate-3"><Database size={20} className="text-white"/></div>
            <h2 className="text-lg font-black text-white italic tracking-tighter uppercase">BotlyHub <span className="text-blue-500">Adm</span></h2>
          </div>
          <nav className="flex-1 space-y-1">
            <NavItem to="/a/dashboard" icon={LayoutDashboard} label="Genel Bakış" />
            <NavItem to="/a/dashboard/sales" icon={Wallet} label="Kütüphaneler" />
            <NavItem to="/a/dashboard/users" icon={Users} label="Üyeler" />
            <NavItem to="/a/dashboard/bots" icon={Bot} label="Market" />
            <NavItem to="/a/dashboard/notifications" icon={BellRing} label="Duyurular" />
            <NavItem to="/a/dashboard/settings" icon={SettingsIcon} label="Ayarlar" />
          </nav>
          <button onClick={() => { DatabaseService.logoutAdmin(); navigate('/a/admin'); }} className="mt-auto flex items-center gap-3 px-4 py-3 text-red-500 font-bold text-xs uppercase hover:bg-red-500/10 rounded-xl transition-all">
            <LogOut size={18} /> Güvenli Çıkış
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-md shrink-0 z-50">
           <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 bg-slate-900 rounded-lg text-slate-400"><Menu size={20}/></button>
           <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
              Sistem Durumu: Stabil
           </div>
           <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-bold text-white uppercase italic leading-none">Admin Root</p>
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Platform Manager</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white shadow-lg italic border border-white/10">A</div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-[#020617]">
          <div className="max-w-[1400px] mx-auto pb-20">
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/sales" element={<SalesManagement />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/bots" element={<BotManagement />} />
              <Route path="/notifications" element={<NotificationCenter />} />
              <Route path="/settings" element={<SettingsManagement />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
};

const HomeView = () => {
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
                .limit(10);
            setCombinedLogs(logs || []);
        } catch (e) {
            console.error("Home load error:", e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Komuta <span className="text-blue-500">Paneli</span></h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Sistem Analitiği ve Operasyon Takibi</p>
                </div>
                <button onClick={load} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all shadow-lg active:scale-95">
                    <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Platform Üyesi" value={stats.userCount} icon={Users} color="blue" />
                <StatCard label="Aktif Botlar" value={stats.botCount} icon={Bot} color="purple" />
                <StatCard label="Kütüphane Kaydı" value={stats.salesCount} icon={Wallet} color="emerald" />
                <StatCard label="Denetim Kaydı" value={stats.logCount} icon={Activity} color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><History size={80} /></div>
                         <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
                             <ShieldCheck size={16} className="text-blue-500" /> Audit Log
                         </h3>
                         <div className="space-y-1 relative z-10">
                             {isLoading ? (
                                <div className="py-20 text-center text-slate-700 animate-pulse font-bold uppercase text-xs">Veritabanı Senkronize Ediliyor...</div>
                             ) : combinedLogs.length === 0 ? (
                                <div className="py-20 text-center text-slate-800 italic text-xs uppercase tracking-widest">Henüz denetim kaydı bulunmuyor.</div>
                             ) : (
                                combinedLogs.map(log => <LogItem key={log.id} log={log} />)
                             )}
                         </div>
                    </div>
                </div>
                
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Cpu size={16} className="text-purple-500" /> Altyapı Durumu
                        </h3>
                        <div className="space-y-4">
                            <ServerMetric label="CPU Yükü" value="%12" />
                            <ServerMetric label="RAM Kullanımı" value="4.2 GB" />
                            <ServerMetric label="DB Gecikme" value="48ms" />
                            <ServerMetric label="Aktif WebSocket" value="Online" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ServerMetric = ({ label, value }: any) => (
    <div className="flex justify-between items-center p-3.5 bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{label}</span>
        <span className="text-xs font-black text-white italic">{value}</span>
    </div>
);

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
        <div className="animate-in fade-in space-y-6">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Envanter Hareketleri</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950/50 border-b border-slate-800 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-5">Kullanıcı</th>
                                <th className="px-6 py-5">İlişkili Bot</th>
                                <th className="px-6 py-5">İşlem Tarihi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {isLoading ? <tr><td colSpan={3} className="p-24 text-center text-slate-700 italic font-bold text-xs uppercase animate-pulse">Veriler Okunuyor...</td></tr> : 
                             filteredSales.length === 0 ? <tr><td colSpan={3} className="p-24 text-center text-slate-800 italic text-xs uppercase">Kayıt bulunamadı.</td></tr> :
                             filteredSales.map((s, idx) => (
                                <tr key={idx} className="hover:bg-slate-800/20 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <img src={s.users?.avatar} className="w-10 h-10 rounded-xl border border-slate-800 shadow-lg object-cover" />
                                            <div>
                                                <p className="font-bold text-white text-xs italic tracking-tight">@{s.users?.username}</p>
                                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">{s.users?.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                                                <img src={s.bots?.icon} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-xs italic">{s.bots?.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-[10px] text-slate-500 font-bold uppercase italic">
                                        {new Date(s.acquired_at).toLocaleString('tr-TR')}
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
    const [bots, setBots] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBot, setEditingBot] = useState<Partial<BotType> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingIcon, setIsFetchingIcon] = useState(false);

    useEffect(() => { load(); }, []);
    const load = async () => { 
        setIsLoading(true); 
        const botData = await DatabaseService.getBotsWithStats();
        setBots(botData); 
        setIsLoading(false); 
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBot) return;
        await DatabaseService.saveBot(editingBot);
        setIsModalOpen(false);
        load();
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
        <div className="animate-in fade-in space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Market Yönetimi</h2>
                <button onClick={() => { setEditingBot({ name: '', description: '', price: 0, category: 'productivity', bot_link: '', icon: '', screenshots: [] }); setIsModalOpen(true); }} className="px-5 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white flex items-center gap-3 shadow-xl transition-all">
                    <Plus size={18}/> Yeni Bot Ekle
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? <div className="col-span-full py-24 text-center italic text-slate-700 font-bold uppercase tracking-widest animate-pulse">Market Verileri Çekiliyor...</div> : 
                 bots.map(b => (
                    <div key={b.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-all flex flex-col group shadow-xl">
                        <div className="flex gap-4 mb-5">
                            <img src={b.icon} className="w-16 h-16 rounded-xl object-cover bg-slate-950 border border-slate-800 shadow-md transition-transform" />
                            <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-white text-sm truncate mb-1 italic tracking-tight">{b.name}</h4>
                                <div className="flex gap-2 items-center mb-2">
                                    <span className="text-[9px] font-bold text-blue-500 uppercase italic tracking-widest">{CATEGORY_NAMES[b.category] || b.category}</span>
                                </div>
                                <p className="text-xs font-black text-white italic flex items-center gap-1.5"><Star size={12} className="text-yellow-500" fill="currentColor"/> {b.price} Yıldız</p>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-auto">
                            <button onClick={() => { setEditingBot(b); setIsModalOpen(true); }} className="flex-1 py-2.5 bg-slate-800 hover:bg-blue-600 text-white text-[10px] font-bold uppercase rounded-lg transition-all shadow-md">Düzenle</button>
                            <button onClick={async () => { if(confirm("Bu botu marketten silmek istediğinize emin misiniz?")) { await DatabaseService.deleteBot(b.id); load(); } }} className="p-2.5 bg-slate-800 hover:bg-red-500 text-slate-500 hover:text-white rounded-lg transition-all shadow-md active:scale-90"><Trash2 size={18}/></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && editingBot && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-8 relative shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"><X size={24}/></button>
                        <h3 className="text-xl font-black mb-8 text-white uppercase italic tracking-tighter">{editingBot.id ? 'Ürün Detaylarını Revize Et' : 'Yeni Ürün Tanımla'}</h3>
                        <form onSubmit={handleSave} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Bot Görünür Adı</label>
                                <input type="text" required value={editingBot.name} onChange={e => setEditingBot({...editingBot, name: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-bold text-white focus:border-blue-500 outline-none shadow-inner" placeholder="Market Adı" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Kategori</label>
                                    <select value={editingBot.category} onChange={e => setEditingBot({...editingBot, category: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-bold text-white focus:border-blue-500 outline-none appearance-none shadow-inner italic">
                                        {Object.entries(CATEGORY_NAMES).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Fiyat (Stars)</label>
                                    <input type="number" required value={editingBot.price} onChange={e => setEditingBot({...editingBot, price: Number((e.target as any).value)})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-bold text-white focus:border-blue-500 outline-none shadow-inner" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Telegram @Username</label>
                                <div className="flex gap-3">
                                    <input type="text" required value={editingBot.bot_link} onChange={e => setEditingBot({...editingBot, bot_link: (e.target as any).value})} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-bold text-white focus:border-blue-500 outline-none shadow-inner" placeholder="@BotlyHubBot" />
                                    <button type="button" onClick={fetchBotIcon} className="p-3 bg-slate-800 hover:bg-blue-600 rounded-xl text-white transition-all active:scale-90 shadow-md">
                                        <Wand2 size={20} />
                                    </button>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs uppercase tracking-[0.2em] transition-all mt-4 flex items-center justify-center gap-3">
                                <ShieldCheck size={18} /> MARKET VERİSİNİ YAYINLA
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

    useEffect(() => { load(); }, []);
    const load = async () => { setIsLoading(true); setUsers(await DatabaseService.getUsers()); setIsLoading(false); };

    const toggleStatus = async (user: User) => {
        const nextStatus = user.status === 'Active' ? 'Passive' : 'Active';
        await DatabaseService.updateUserStatus(user.id, nextStatus);
        load();
    };

    const filteredUsers = users.filter(u => 
        (u.name || '').toLowerCase().includes(search.toLowerCase()) || 
        (u.username || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="animate-in fade-in space-y-6">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Sistem Üyeleri</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950/50 border-b border-slate-800 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-5">Üye Profili</th>
                                <th className="px-6 py-5">Durum</th>
                                <th className="px-6 py-5 text-right">Aksiyon</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {isLoading ? <tr><td colSpan={3} className="p-24 text-center text-slate-700 italic font-bold text-xs uppercase animate-pulse">Tarama Yapılıyor...</td></tr> : 
                             filteredUsers.map(u => (
                                <tr key={u.id} className="hover:bg-slate-800/20 transition-all">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <img src={u.avatar} className="w-10 h-10 rounded-xl border border-slate-800 object-cover" />
                                            <div>
                                                <p className="font-bold text-white text-xs italic">@{u.username}</p>
                                                <p className="text-[9px] text-slate-600 font-black uppercase">ID: {u.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border italic ${u.status === 'Active' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button onClick={() => toggleStatus(u)} className={`p-2.5 rounded-xl transition-all shadow-md ${u.status === 'Active' ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'}`}>
                                            {u.status === 'Active' ? <Ban size={18}/> : <CheckCircle size={18}/>}
                                        </button>
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

// --- YENİLENEN DUYURU MERKEZİ ---

const NotificationCenter = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({ title: '', message: '', type: 'system' as any });

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await DatabaseService.sendNotification({
                ...form,
                target_type: 'global'
            });
            alert("Global duyuru başarıyla yayınlandı. Tüm kullanıcılara anlık olarak ulaştırılacak.");
            setForm({ title: '', message: '', type: 'system' });
        } catch (e: any) {
            console.error("Gönderim Hatası:", e);
            alert("Gönderim Hatası: " + (e.message || "Bilinmeyen veritabanı hatası"));
        } finally {
            setIsLoading(false);
        }
    };

    const categories = [
        { id: 'system', label: 'Sistem Duyurusu', icon: BellRing, color: 'text-blue-400' },
        { id: 'payment', label: 'Kampanya / Fırsat', icon: Zap, color: 'text-yellow-400' },
        { id: 'security', label: 'Güvenlik Uyarısı', icon: ShieldAlert, color: 'text-red-400' },
        { id: 'bot', label: 'Bot Güncellemesi', icon: RefreshCcw, color: 'text-emerald-400' }
    ];

    return (
        <div className="animate-in fade-in space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Duyuru Yayın Merkezi</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Platformdaki tüm kullanıcılara anlık mesaj gönderin.</p>
                </div>
                <div className="px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-xl flex items-center gap-2">
                    <Globe size={14} className="text-blue-500" />
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Hedef: %100 Global</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* FORM ALANI */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/5 blur-[80px] pointer-events-none"></div>
                    <form onSubmit={handleSend} className="space-y-6 relative z-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Kategori Seçimi</label>
                            <div className="grid grid-cols-2 gap-3">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setForm({...form, type: cat.id as any})}
                                        className={`p-4 rounded-2xl border transition-all flex items-center gap-3 text-left ${
                                            form.type === cat.id 
                                            ? 'bg-blue-600/10 border-blue-600/50 text-white shadow-lg' 
                                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                                        }`}
                                    >
                                        <cat.icon size={18} className={form.type === cat.id ? cat.color : ''} />
                                        <span className="text-[10px] font-black uppercase tracking-tight leading-none">{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Duyuru Başlığı</label>
                            <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-blue-500 shadow-inner" placeholder="örn: Bayram Kampanyası Başladı!" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Mesaj İçeriği</label>
                            <textarea required value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full h-44 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-medium text-slate-300 outline-none focus:border-blue-500 resize-none shadow-inner leading-relaxed" placeholder="Kullanıcılara ulaştırılacak ana mesaj metni..." />
                        </div>

                        <button type="submit" disabled={isLoading} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[20px] text-xs uppercase tracking-[0.4em] shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                            {isLoading ? <Loader2 className="animate-spin" size={20}/> : <><Send size={18} /> YAYINI BAŞLAT</>}
                        </button>
                    </form>
                </div>

                {/* ÖNİZLEME ALANI */}
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] shadow-xl">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                            <Eye size={16} className="text-blue-400" /> Mobil Uygulama Önizlemesi
                        </h3>
                        
                        <div className="bg-[#020617] w-full aspect-[9/10] max-w-[300px] mx-auto rounded-[40px] border-[6px] border-slate-800 shadow-2xl relative overflow-hidden flex flex-col p-4">
                            <div className="w-20 h-5 bg-slate-800 rounded-b-2xl absolute top-0 left-1/2 -translate-x-1/2 z-10"></div>
                            
                            <div className="mt-8 flex-1">
                                <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-4">Bildirimler</p>
                                
                                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 shadow-lg relative overflow-hidden animate-pulse">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center shrink-0">
                                            {React.createElement(categories.find(c => c.id === form.type)?.icon || BellRing, { size: 14, className: 'text-blue-400' })}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-black text-white truncate">{form.title || 'Duyuru Başlığı'}</p>
                                            <p className="text-[8px] text-slate-500 font-medium line-clamp-2 mt-0.5">{form.message || 'Mesaj içeriği burada bu şekilde görünecektir...'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="h-1 w-1/3 bg-slate-800 rounded-full mx-auto mt-auto mb-2"></div>
                        </div>

                        <div className="mt-8 p-4 bg-blue-600/5 border border-blue-500/10 rounded-2xl flex items-start gap-4">
                            <Sparkles size={18} className="text-blue-400 mt-1 shrink-0" />
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                                Duyuru gönderildiğinde tüm kullanıcılar için "Okunmadı" statüsünde yeni bir bildirim kaydı oluşturulur. Büyük duyurular için sistem günlüğü otomatik kayıt tutar.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SettingsManagement = () => {
    const [settings, setSettings] = useState({
        appName: 'BotlyHub V3',
        maintenanceMode: false,
        commissionRate: 5
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        DatabaseService.getSettings().then(data => data && setSettings(data));
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        await DatabaseService.saveSettings(settings);
        setIsSaving(false);
        alert("Sistem yapılandırması başarıyla güncellendi.");
    };

    return (
        <div className="animate-in fade-in space-y-6">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Sistem Yapılandırması</h2>
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-xl shadow-2xl space-y-7 relative overflow-hidden">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Uygulama Adı</label>
                    <input type="text" value={settings.appName} onChange={e => setSettings({...settings, appName: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-bold text-white outline-none focus:border-blue-500 shadow-inner" />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
                    <div>
                        <p className="text-xs font-bold text-white uppercase tracking-tight italic">Acil Bakım Modu</p>
                    </div>
                    <button onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})} className={`w-12 h-6 rounded-full relative transition-all shadow-lg ${settings.maintenanceMode ? 'bg-red-600' : 'bg-slate-800'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${settings.maintenanceMode ? 'left-7' : 'left-1'}`}></div>
                    </button>
                </div>

                <button onClick={handleSave} disabled={isSaving} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 active:scale-95">
                    {isSaving ? <Loader2 className="animate-spin" size={20}/> : <><ShieldCheck size={18} /> AYARLARI KAYDET</>}
                </button>
            </div>
        </div>
    );
}

export default AdminDashboard;
