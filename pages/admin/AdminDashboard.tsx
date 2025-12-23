
import React, { useEffect, useState } from 'react';
import * as Router from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bot, LogOut, Menu, X, 
  Package, Loader2, RefreshCw, Plus, Edit2, Trash2, 
  Megaphone, Calendar, Settings as SettingsIcon, 
  ShieldCheck, Globe, MessageSquare, AlertTriangle,
  Zap, Star, Eye, Send, Activity, 
  Clock, Wallet, ShieldAlert, Cpu, Ban, CheckCircle, 
  Search, Database, Hash, Wand2, Image as ImageIcon, History
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

const AVAILABLE_ICONS = [
  { name: 'Megaphone', icon: Megaphone },
  { name: 'Zap', icon: Zap },
  { name: 'Star', icon: Star },
  { name: 'BotIcon', icon: Bot },
  { name: 'Shield', icon: ShieldCheck }
];

// --- ALT BİLEŞENLER ---

const StatCard = ({ label, value, icon: Icon, color }: any) => {
  const colors: any = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20'
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl border ${colors[color]}`}>
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

const LogItem = ({ log }: { log: ActivityLog }) => {
  const getLogStyle = (type: string) => {
    switch(type) {
        case 'auth': return { icon: Hash, color: 'text-blue-400', bg: 'bg-blue-400/10' };
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
    <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl mb-3 hover:border-slate-700 transition-all">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${style.bg} ${style.color}`}>
                <Icon size={16} />
            </div>
            <div>
                <p className="text-sm font-bold text-white">{log.title}</p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">{log.type}</p>
            </div>
        </div>
        <p className="text-[10px] text-slate-600 font-bold">
            {new Date(log.created_at).toLocaleString('tr-TR')}
        </p>
      </div>
      <p className="text-xs text-slate-400 mb-3 ml-11">{log.description}</p>
      
      {/* DETAYLI METADATA GÖSTERİMİ */}
      {log.metadata && Object.keys(log.metadata).length > 0 && (
          <div className="flex flex-wrap gap-2 ml-11 pt-2 border-t border-slate-800/50">
              {Object.entries(log.metadata).map(([key, val]: any) => (
                  key !== 'client_time' && key !== 'platform' && (
                      <div key={key} className="bg-slate-950 px-2 py-1 rounded border border-slate-800 flex items-center gap-2">
                          <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">{key.replace('_', ' ')}:</span>
                          <span className="text-[9px] font-black text-blue-400 italic">{String(val)}</span>
                      </div>
                  )
              ))}
          </div>
      )}
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
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-[70] w-64 bg-slate-900 border-r border-slate-800 transition-transform lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg"><Database size={20} className="text-white"/></div>
            <h2 className="text-lg font-black text-white italic tracking-tighter">BOTLY HUB <span className="text-blue-500">ADM</span></h2>
          </div>
          <nav className="flex-1 space-y-1">
            <NavItem to="/a/dashboard" icon={LayoutDashboard} label="Genel Bakış" />
            <NavItem to="/a/dashboard/sales" icon={Wallet} label="Kütüphaneler" />
            <NavItem to="/a/dashboard/users" icon={Users} label="Üyeler" />
            <NavItem to="/a/dashboard/bots" icon={Bot} label="Market" />
            <NavItem to="/a/dashboard/notifications" icon={Send} label="Duyuru" />
            <NavItem to="/a/dashboard/settings" icon={SettingsIcon} label="Ayarlar" />
          </nav>
          <button onClick={() => { DatabaseService.logoutAdmin(); navigate('/a/admin'); }} className="mt-auto flex items-center gap-3 px-4 py-3 text-red-500 font-bold text-xs uppercase hover:bg-red-500/10 rounded-xl transition-all">
            <LogOut size={18} /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-md shrink-0 z-50">
           <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 bg-slate-900 rounded-lg text-slate-400"><Menu size={20}/></button>
           <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              Sistem Canlı
           </div>
           <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-400 uppercase italic">Admin Root</span>
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white shadow-lg italic">A</div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
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
                .limit(20);
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
                    <h1 className="text-2xl font-black text-white uppercase italic">Dashboard</h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Platform Özet İstatistikleri</p>
                </div>
                <button onClick={load} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all">
                    <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Platform Üyesi" value={stats.userCount} icon={Users} color="blue" />
                <StatCard label="Aktif Botlar" value={stats.botCount} icon={Bot} color="purple" />
                <StatCard label="Bot Edinme" value={stats.salesCount} icon={Wallet} color="emerald" />
                <StatCard label="Sistem Denetimi" value={stats.logCount} icon={Activity} color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                         <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                             <History size={16} className="text-blue-500" /> Son Aktiviteler (Metadata Detaylı)
                         </h3>
                         <div className="space-y-1">
                             {isLoading ? (
                                <div className="py-20 text-center text-slate-700 animate-pulse font-bold uppercase text-xs">Yükleniyor...</div>
                             ) : combinedLogs.length === 0 ? (
                                <div className="py-20 text-center text-slate-800 italic text-xs">Henüz kayıt yok.</div>
                             ) : (
                                combinedLogs.map(log => <LogItem key={log.id} log={log} />)
                             )}
                         </div>
                    </div>
                </div>
                
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Cpu size={16} className="text-purple-500" /> Sunucu Durumu
                        </h3>
                        <div className="space-y-4">
                            <ServerMetric label="CPU Kullanımı" value="12%" />
                            <ServerMetric label="RAM Kullanımı" value="4.2 GB" />
                            <ServerMetric label="API Yanıt Süresi" value="48ms" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ServerMetric = ({ label, value }: any) => (
    <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
        <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
        <span className="text-xs font-black text-white italic">{value}</span>
    </div>
);

// --- YÖNETİM SAYFALARI ---

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
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-white uppercase italic">Kütüphane Kayıtları</h2>
                <div className="flex gap-3">
                    <input 
                        type="text" 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Ara..." 
                        className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs outline-none focus:border-blue-500 w-64" 
                    />
                    <button onClick={load} className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400"><RefreshCw size={16} className={isLoading ? 'animate-spin' : ''}/></button>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left">
                    <thead className="bg-slate-950/50 border-b border-slate-800 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Kullanıcı</th>
                            <th className="px-6 py-4">Bot</th>
                            <th className="px-6 py-4">Tarih</th>
                            <th className="px-6 py-4 text-right">Durum</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {isLoading ? <tr><td colSpan={4} className="p-20 text-center text-slate-800 text-xs">Yükleniyor...</td></tr> : 
                         filteredSales.map((s, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/20">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img src={s.users?.avatar} className="w-8 h-8 rounded-lg" />
                                        <div>
                                            <p className="font-bold text-white text-xs">@{s.users?.username}</p>
                                            <p className="text-[10px] text-slate-500 font-medium">{s.users?.name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="font-bold text-white text-xs">{s.bots?.name}</p>
                                    <p className="text-[10px] text-emerald-500 uppercase font-black italic">{s.bots?.price} STARS</p>
                                </td>
                                <td className="px-6 py-4 text-[10px] text-slate-500 font-bold">
                                    {new Date(s.acquired_at).toLocaleDateString('tr-TR')}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Aktif</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const BotManagement = () => {
    const [bots, setBots] = useState<BotType[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBot, setEditingBot] = useState<Partial<BotType> | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => { load(); }, []);
    const load = async () => { setIsLoading(true); setBots(await DatabaseService.getBots()); setIsLoading(false); };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBot) return;
        await DatabaseService.saveBot(editingBot);
        setIsModalOpen(false);
        load();
    };

    return (
        <div className="animate-in fade-in space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-white uppercase italic">Market Ürünleri</h2>
                <button onClick={() => { setEditingBot({ name: '', description: '', price: 0, category: 'productivity', bot_link: '', icon: '', screenshots: [] }); setIsModalOpen(true); }} className="px-4 py-2.5 bg-blue-600 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-lg active:scale-95 transition-all">
                    <Plus size={16}/> Yeni Bot
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bots.map(b => (
                    <div key={b.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-all flex flex-col group">
                        <div className="flex gap-4 mb-6">
                            <img src={b.icon} className="w-16 h-16 rounded-xl object-cover bg-slate-950 border border-slate-800" />
                            <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-white text-sm truncate mb-1">{b.name}</h4>
                                <div className="flex gap-2 items-center mb-2">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase bg-slate-950 px-2 py-0.5 rounded border border-slate-800">ID: {b.id}</span>
                                    <span className="text-[9px] font-bold text-blue-500 uppercase">{CATEGORY_NAMES[b.category] || b.category}</span>
                                </div>
                                <p className="text-xs font-black text-white italic">{b.price} Yıldız</p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-6 font-medium italic">{b.description}</p>
                        <div className="flex gap-2 mt-auto">
                            <button onClick={() => { setEditingBot(b); setIsModalOpen(true); }} className="flex-1 py-2 bg-slate-800 hover:bg-blue-600 text-[10px] font-bold uppercase rounded-lg transition-all">Düzenle</button>
                            <button onClick={async () => { if(confirm("Silmek istiyor musunuz?")) { await DatabaseService.deleteBot(b.id); load(); } }} className="p-2 bg-slate-800 hover:bg-red-500 text-slate-500 hover:text-white rounded-lg transition-all"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && editingBot && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm animate-in fade-in" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-8 relative shadow-2xl" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={20}/></button>
                        <h3 className="text-xl font-black mb-8 text-white uppercase italic">{editingBot.id ? 'Düzenle' : 'Yeni Kayıt'}</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Sistem ID</label>
                                <input type="text" required value={editingBot.id} onChange={e => setEditingBot({...editingBot, id: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-bold text-white focus:border-blue-500 outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Bot Adı</label>
                                <input type="text" required value={editingBot.name} onChange={e => setEditingBot({...editingBot, name: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-bold text-white focus:border-blue-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Kategori</label>
                                    <select value={editingBot.category} onChange={e => setEditingBot({...editingBot, category: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-bold text-white focus:border-blue-500 outline-none">
                                        {Object.entries(CATEGORY_NAMES).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Fiyat (Stars)</label>
                                    <input type="number" required value={editingBot.price} onChange={e => setEditingBot({...editingBot, price: Number((e.target as any).value)})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-bold text-white focus:border-blue-500 outline-none" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Açıklama</label>
                                <textarea required value={editingBot.description} onChange={e => setEditingBot({...editingBot, description: (e.target as any).value})} className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-bold text-white focus:border-blue-500 outline-none resize-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">İkon URL</label>
                                <input type="text" required value={editingBot.icon} onChange={e => setEditingBot({...editingBot, icon: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-bold text-white focus:border-blue-500 outline-none" />
                            </div>
                            <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all mt-4">KAYDET</button>
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
        (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.id || '').toString().includes(search)
    );

    return (
        <div className="animate-in fade-in space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-white uppercase italic">Üye Listesi</h2>
                <div className="flex gap-3">
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Üye ara..." className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs outline-none focus:border-blue-500 w-64" />
                    <button onClick={load} className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400"><RefreshCw size={16} className={isLoading ? 'animate-spin' : ''}/></button>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left">
                    <thead className="bg-slate-950/50 border-b border-slate-800 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Üye</th>
                            <th className="px-6 py-4">İletişim</th>
                            <th className="px-6 py-4">Durum</th>
                            <th className="px-6 py-4 text-right">Aksiyon</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {filteredUsers.map(u => (
                            <tr key={u.id} className="hover:bg-slate-800/20">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img src={u.avatar} className="w-10 h-10 rounded-xl border border-slate-800" />
                                        <div>
                                            <p className="font-bold text-white text-xs">@{u.username}</p>
                                            <p className="text-[10px] text-slate-500 font-medium">ID: {u.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-[10px] text-slate-400 font-bold">
                                    <p>{u.email || 'Mail Yok'}</p>
                                    <p className="text-slate-600 mt-1">{u.phone || 'Tel Yok'}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase ${u.status === 'Active' ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>{u.status}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => toggleStatus(u)} className={`p-2 rounded-lg transition-all ${u.status === 'Active' ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'}`}>
                                            {u.status === 'Active' ? <Ban size={16}/> : <CheckCircle size={16}/>}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const NotificationCenter = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({ title: '', message: '', type: 'system' as any });

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await DatabaseService.sendNotification({ ...form, target_type: 'global' });
        setIsLoading(false);
        setForm({ title: '', message: '', type: 'system' });
        alert("Duyuru yayınlandı.");
    };

    return (
        <div className="animate-in fade-in space-y-6">
            <h2 className="text-xl font-black text-white uppercase italic">Duyuru Yönetimi</h2>
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-xl shadow-xl">
                <form onSubmit={handleSend} className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Kategori</label>
                        <select value={form.type} onChange={e => setForm({...form, type: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-blue-500">
                            <option value="system">Sistem Duyurusu</option>
                            <option value="payment">Ödeme Bildirimi</option>
                            <option value="security">Güvenlik Uyarısı</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Başlık</label>
                        <input required type="text" value={form.title} onChange={e => setForm({...form, title: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-blue-500" placeholder="Örn: Yeni Bot Güncellemesi" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Mesaj İçeriği</label>
                        <textarea required value={form.message} onChange={e => setForm({...form, message: (e.target as any).value})} className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-blue-500 resize-none" placeholder="Tüm üyelere iletilecek mesaj..." />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                        {isLoading ? <Loader2 className="animate-spin mx-auto" size={20}/> : 'DUYURUYU YAYINLA'}
                    </button>
                </form>
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

    useEffect(() => {
        DatabaseService.getSettings().then(data => data && setSettings(data));
    }, []);

    const handleSave = async () => {
        await DatabaseService.saveSettings(settings);
        alert("Ayarlar güncellendi.");
    };

    return (
        <div className="animate-in fade-in space-y-6">
            <h2 className="text-xl font-black text-white uppercase italic">Sistem Ayarları</h2>
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-xl shadow-xl space-y-6">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Uygulama Adı</label>
                    <input type="text" value={settings.appName} onChange={e => setSettings({...settings, appName: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-blue-500" />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <div>
                        <p className="text-xs font-bold text-white uppercase">Bakım Modu</p>
                        <p className="text-[10px] text-slate-500 font-medium">Uygulamayı tüm üyelere kapatır.</p>
                    </div>
                    <button onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})} className={`w-12 h-6 rounded-full relative transition-all ${settings.maintenanceMode ? 'bg-red-600' : 'bg-slate-800'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'left-7' : 'left-1'}`}></div>
                    </button>
                </div>
                <button onClick={handleSave} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs uppercase tracking-widest shadow-lg">AYARLARI KAYDET</button>
            </div>
        </div>
    );
}

export default AdminDashboard;
