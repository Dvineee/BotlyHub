
import React, { useEffect, useState } from 'react';
import * as Router from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bot, LogOut, Menu, X, 
  Package, Loader2, RefreshCw, Plus, Edit2, Trash2, 
  Megaphone, Calendar, Settings as SettingsIcon, 
  ShieldCheck, Globe, MessageSquare, AlertTriangle,
  Zap, Star, Eye, Send, Activity, 
  Clock, Wallet, ShieldAlert, Cpu, Ban, CheckCircle, 
  Search, Database, Hash, Wand2, Image as ImageIcon, History, TrendingUp,
  Mail, User as UserIcon
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
        case 'channel_sync': return { icon: RefreshCw, color: 'text-emerald-400', bg: 'bg-emerald-400/10' };
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
            <NavItem to="/a/dashboard/notifications" icon={Send} label="Duyuru" />
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
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
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
                             <ShieldCheck size={16} className="text-blue-500" /> Audit Log (İşlem Yapan Kullanıcılar)
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
                    
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-center">
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Hızlı Erişim</h3>
                        <button onClick={() => navigate('/a/dashboard/users')} className="w-full py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:border-blue-500/50 transition-all mb-3 shadow-inner">Tüm Üyeleri Gör</button>
                        <button onClick={() => navigate('/a/dashboard/bots')} className="w-full py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:border-purple-500/50 transition-all shadow-inner">Yeni Bot Ekle</button>
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
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Envanter Hareketleri</h2>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                        <input 
                            type="text" 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Üye veya Bot ara..." 
                            className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs outline-none focus:border-blue-500 w-64 text-white font-medium" 
                        />
                    </div>
                    <button onClick={load} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white shadow-lg active:scale-95"><RefreshCw size={16} className={isLoading ? 'animate-spin' : ''}/></button>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950/50 border-b border-slate-800 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-5">Kullanıcı</th>
                                <th className="px-6 py-5">İlişkili Bot</th>
                                <th className="px-6 py-5">İşlem Tarihi</th>
                                <th className="px-6 py-5 text-right">Durum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {isLoading ? <tr><td colSpan={4} className="p-24 text-center text-slate-700 italic font-bold text-xs uppercase animate-pulse">Veriler Okunuyor...</td></tr> : 
                             filteredSales.length === 0 ? <tr><td colSpan={4} className="p-24 text-center text-slate-800 italic text-xs uppercase">Kayıt bulunamadı.</td></tr> :
                             filteredSales.map((s, idx) => (
                                <tr key={idx} className="hover:bg-slate-800/20 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <img src={s.users?.avatar} className="w-10 h-10 rounded-xl border border-slate-800 shadow-lg group-hover:scale-110 transition-transform" />
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
                                                <p className="text-[10px] text-emerald-500 uppercase font-black italic tracking-tighter">{s.bots?.price} STARS</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-[10px] text-slate-500 font-bold uppercase italic">
                                        {new Date(s.acquired_at).toLocaleString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg italic uppercase tracking-widest shadow-emerald-500/5">Aktif</span>
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
                <button onClick={() => { setEditingBot({ name: '', description: '', price: 0, category: 'productivity', bot_link: '', icon: '', screenshots: [] }); setIsModalOpen(true); }} className="px-5 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white flex items-center gap-3 shadow-xl active:scale-95 transition-all">
                    <Plus size={18}/> Yeni Bot Ekle
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? <div className="col-span-full py-24 text-center italic text-slate-700 font-bold uppercase tracking-widest animate-pulse">Market Verileri Çekiliyor...</div> : 
                 bots.map(b => (
                    <div key={b.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-all flex flex-col group shadow-xl">
                        <div className="flex gap-4 mb-5">
                            <img src={b.icon} className="w-16 h-16 rounded-xl object-cover bg-slate-950 border border-slate-800 shadow-md group-hover:scale-110 transition-transform" />
                            <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-white text-sm truncate mb-1 italic tracking-tight">{b.name}</h4>
                                <div className="flex gap-2 items-center mb-2">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase bg-slate-950 px-2 py-0.5 rounded border border-slate-800 tracking-tighter italic">ID: {b.id}</span>
                                    <span className="text-[9px] font-bold text-blue-500 uppercase italic tracking-widest">{CATEGORY_NAMES[b.category] || b.category}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-black text-white italic flex items-center gap-1.5"><Star size={12} className="text-yellow-500" fill="currentColor"/> {b.price} Yıldız</p>
                                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-[9px] font-bold text-blue-400 italic">
                                        <Users size={10} />
                                        <span>{b.ownerCount} SAHİP</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-3 mb-6 font-medium leading-relaxed italic">{b.description}</p>
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
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Sistem ID (Koda Bağımlı)</label>
                                <input type="text" required value={editingBot.id} onChange={e => setEditingBot({...editingBot, id: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-bold text-white focus:border-blue-500 outline-none shadow-inner" placeholder="örn: premium_bot_01" />
                            </div>
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
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Market Açıklaması</label>
                                <textarea required value={editingBot.description} onChange={e => setEditingBot({...editingBot, description: (e.target as any).value})} className="w-full h-28 bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-medium text-slate-300 focus:border-blue-500 outline-none resize-none shadow-inner leading-relaxed" placeholder="Kullanıcıya yönelik açıklama..." />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Telegram @Username & İkon</label>
                                <div className="flex gap-3">
                                    <input type="text" required value={editingBot.bot_link} onChange={e => setEditingBot({...editingBot, bot_link: (e.target as any).value})} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-bold text-white focus:border-blue-500 outline-none shadow-inner" placeholder="@BotlyHubBot" />
                                    <button type="button" onClick={fetchBotIcon} className="p-3 bg-slate-800 hover:bg-blue-600 rounded-xl text-white transition-all active:scale-90 shadow-md">
                                        <Wand2 size={20} />
                                    </button>
                                </div>
                                <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center overflow-hidden shrink-0 border border-slate-800">
                                        {editingBot.icon ? <img src={editingBot.icon} className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-slate-800"/>}
                                    </div>
                                    <input type="text" required value={editingBot.icon} onChange={e => setEditingBot({...editingBot, icon: (e.target as any).value})} className="flex-1 bg-transparent border-b border-slate-800 p-1 text-[10px] font-bold text-slate-400 outline-none focus:border-blue-500" placeholder="İkon URL" />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 active:scale-95 transition-all mt-4 flex items-center justify-center gap-3">
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
        (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.id || '').toString().includes(search)
    );

    return (
        <div className="animate-in fade-in space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Sistem Üyeleri</h2>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="İsim, ID veya @user..." className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs outline-none focus:border-blue-500 w-64 text-white font-medium shadow-md" />
                    </div>
                    <button onClick={load} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white shadow-lg active:scale-95"><RefreshCw size={16} className={isLoading ? 'animate-spin' : ''}/></button>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950/50 border-b border-slate-800 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-5">Üye Profili</th>
                                <th className="px-6 py-5">E-Posta</th>
                                <th className="px-6 py-5">Platform Katılımı</th>
                                <th className="px-6 py-5">Durum</th>
                                <th className="px-6 py-5 text-right">Aksiyonlar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {isLoading ? <tr><td colSpan={5} className="p-24 text-center text-slate-700 italic font-bold text-xs uppercase animate-pulse">Kullanıcı Veritabanı Taranıyor...</td></tr> : 
                             filteredUsers.length === 0 ? <tr><td colSpan={5} className="p-24 text-center text-slate-800 italic text-xs uppercase">Üye kaydı bulunamadı.</td></tr> :
                             filteredUsers.map(u => (
                                <tr key={u.id} className="hover:bg-slate-800/20 transition-all group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <img src={u.avatar} className="w-11 h-11 rounded-xl border border-slate-800 shadow-md group-hover:scale-110 transition-transform object-cover" />
                                                <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-4 border-[#020617] ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-xs italic tracking-tight">@{u.username}</p>
                                                <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">ID: {u.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-[10px] text-slate-400 font-bold">
                                        <p className="flex items-center gap-2"><Mail size={12} className="text-slate-600"/> {u.email || 'Mail Tanımlanmadı'}</p>
                                    </td>
                                    <td className="px-6 py-5 text-[10px] text-slate-500 font-bold uppercase italic tracking-tighter">
                                        {u.joinDate ? new Date(u.joinDate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Kayıt Tarihi Yok'}
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border italic ${u.status === 'Active' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-2.5">
                                            <button onClick={() => toggleStatus(u)} title={u.status === 'Active' ? 'Hesabı Askıya Al' : 'Kısıtlamayı Kaldır'} className={`p-2.5 rounded-xl transition-all shadow-md ${u.status === 'Active' ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'}`}>
                                                {u.status === 'Active' ? <Ban size={18}/> : <CheckCircle size={18}/>}
                                            </button>
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

const NotificationCenter = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({ title: '', message: '', type: 'system' as any, target_type: 'global', user_id: '', username: '' });
    const [userSearch, setUserSearch] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Kullanıcı adı arama debounced
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (userSearch.length >= 2) {
                setIsSearching(true);
                const results = await DatabaseService.searchUsers(userSearch);
                setSearchResults(results);
                setIsSearching(false);
            } else {
                setSearchResults([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [userSearch]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.target_type === 'user' && !form.user_id) {
            alert("Lütfen bir kullanıcı seçin.");
            return;
        }
        setIsLoading(true);
        try {
            await DatabaseService.sendNotification(form);
            alert(form.target_type === 'global' ? "Global duyuru ulaştırıldı." : `Bildirim @${form.username} kullanıcısına gönderildi.`);
            setForm({ title: '', message: '', type: 'system', target_type: 'global', user_id: '', username: '' });
            setUserSearch('');
        } catch (e: any) {
            alert("Hata: " + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const selectUser = (user: User) => {
        setForm({ ...form, user_id: user.id, username: user.username });
        setUserSearch(`@${user.username}`);
        setSearchResults([]);
    };

    return (
        <div className="animate-in fade-in space-y-6">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Duyuru & Bildirim Yönetimi</h2>
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[50px] pointer-events-none"></div>
                <form onSubmit={handleSend} className="space-y-6 relative z-10">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Hedef Kitle</label>
                            <select value={form.target_type} onChange={e => {
                                const val = e.target.value as any;
                                setForm({...form, target_type: val, user_id: '', username: ''});
                                setUserSearch('');
                            }} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-bold text-white outline-none focus:border-blue-500 appearance-none italic shadow-inner">
                                <option value="global">Tüm Kullanıcılar</option>
                                <option value="user">Tekil Kullanıcı</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Kategori</label>
                            <select value={form.type} onChange={e => setForm({...form, type: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-bold text-white outline-none focus:border-blue-500 appearance-none italic shadow-inner">
                                <option value="system">Duyuru</option>
                                <option value="payment">Ödeme</option>
                                <option value="security">Güvenlik</option>
                            </select>
                        </div>
                    </div>

                    {form.target_type === 'user' && (
                        <div className="space-y-1.5 relative animate-in slide-in-from-top-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Kullanıcı Arama (@username)</label>
                            <div className="relative">
                                <input 
                                    required 
                                    type="text" 
                                    value={userSearch} 
                                    onChange={e => {
                                        setUserSearch(e.target.value);
                                        if (form.user_id) setForm({...form, user_id: '', username: ''});
                                    }} 
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-bold text-white outline-none focus:border-blue-500 shadow-inner" 
                                    placeholder="Kullanıcı adı yazın..." 
                                />
                                {isSearching && <Loader2 className="absolute right-3 top-3.5 animate-spin text-blue-500" size={16} />}
                            </div>
                            
                            {searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-[100] overflow-hidden divide-y divide-slate-800 animate-in fade-in">
                                    {searchResults.map(u => (
                                        <button 
                                            key={u.id} 
                                            type="button"
                                            onClick={() => selectUser(u)}
                                            className="w-full p-3 flex items-center gap-3 hover:bg-slate-850 transition-colors text-left"
                                        >
                                            <img src={u.avatar} className="w-8 h-8 rounded-lg object-cover border border-slate-800" />
                                            <div>
                                                <p className="text-[10px] font-black text-white italic leading-none">@{u.username}</p>
                                                <p className="text-[8px] text-slate-500 font-bold uppercase mt-1 tracking-tighter">{u.name}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {form.user_id && (
                                <div className="mt-2 p-2 bg-blue-600/10 border border-blue-500/20 rounded-lg flex items-center gap-2">
                                    <CheckCircle size={12} className="text-blue-500" />
                                    <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Alıcı Onaylandı: @{form.username}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Başlık</label>
                        <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-bold text-white outline-none focus:border-blue-500 shadow-inner" placeholder="Mesaj başlığı..." />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">İçerik</label>
                        <textarea required value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full h-36 bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-medium text-slate-300 outline-none focus:border-blue-500 resize-none shadow-inner leading-relaxed" placeholder="Gönderilecek mesaj içeriği..." />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs uppercase tracking-[0.4em] shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                        {isLoading ? <Loader2 className="animate-spin" size={20}/> : <><Send size={18} /> BİLDİRİMİ GÖNDER</>}
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
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Genel Sistem Yapılandırması</h2>
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-xl shadow-2xl space-y-7 relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-600/5 blur-[50px] pointer-events-none"></div>
                <div className="space-y-1.5 relative z-10">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Uygulama Görüntüleme Adı</label>
                    <input type="text" value={settings.appName} onChange={e => setSettings({...settings, appName: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-bold text-white outline-none focus:border-blue-500 shadow-inner" />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800 shadow-inner relative z-10">
                    <div>
                        <p className="text-xs font-bold text-white uppercase tracking-tight italic">Acil Bakım Modu</p>
                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter mt-1">Sistemi son kullanıcılara kilitler.</p>
                    </div>
                    <button onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})} className={`w-12 h-6 rounded-full relative transition-all shadow-lg ${settings.maintenanceMode ? 'bg-red-600' : 'bg-slate-800'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${settings.maintenanceMode ? 'left-7' : 'left-1'}`}></div>
                    </button>
                </div>

                <div className="space-y-1.5 relative z-10">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Global Komisyon Oranı (%)</label>
                    <input type="number" value={settings.commissionRate} onChange={e => setSettings({...settings, commissionRate: Number((e.target as any).value)})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-bold text-white outline-none focus:border-blue-500 shadow-inner" />
                </div>

                <button onClick={handleSave} disabled={isSaving} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs uppercase tracking-[0.4em] shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-3 active:scale-95">
                    {isSaving ? <Loader2 className="animate-spin" size={20}/> : <><ShieldCheck size={18} /> AYARLARI GLOBAL KAYDET</>}
                </button>
            </div>
        </div>
    );
}

export default AdminDashboard;
