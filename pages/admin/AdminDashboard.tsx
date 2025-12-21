
import React, { useEffect, useState } from 'react';
import * as Router from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bot, LogOut, Menu, X, 
  Package, Loader2, RefreshCw, Plus, Edit2, Trash2, 
  Megaphone, Calendar, Settings as SettingsIcon, 
  ShieldCheck, Percent, Globe, MessageSquare, AlertTriangle,
  Sparkles, Zap, Star, ChevronRight, Eye, Send, Activity, 
  Clock, Wallet, ShieldAlert, Cpu, Ban, CheckCircle, Gift, Info, Heart, Bell, Shield, ExternalLink, TrendingUp, History, ListFilter, CreditCard, Image as ImageIcon, Wand2
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
            <NavItem to="/a/dashboard/sales" icon={CreditCard} label="Satış Geçmişi" />
            <NavItem to="/a/dashboard/users" icon={Users} label="Kullanıcılar" />
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
              <div className="text-right mr-2 hidden sm:block">
                  <p className="text-xs font-black text-white">Administrator</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Root Access</p>
              </div>
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
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { load(); }, []);
    const load = async () => {
        setIsLoading(true);
        const data = await DatabaseService.getAdminStats();
        setStats(data);
        setIsLoading(false);
    };

    const mockChartData = [
        { name: 'Pzt', users: 12 }, { name: 'Sal', users: 25 }, { name: 'Çar', users: 18 },
        { name: 'Per', users: 45 }, { name: 'Cum', users: 32 }, { name: 'Cmt', users: 58 }, { name: 'Paz', users: 52 }
    ];

    return (
        <div className="animate-in fade-in space-y-10">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">KOMUTA <span className="text-blue-500">MERKEZİ</span></h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Gerçek Zamanlı Platform Analitiği</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={load} className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all flex items-center gap-2">
                        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Verileri Yenile
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Toplam Üye" value={stats.userCount} icon={Users} color="blue" trend="+12%" />
                <StatCard label="Aktif Bot" value={stats.botCount} icon={Bot} color="purple" trend="+4%" />
                <StatCard label="Toplam İşlem" value={stats.salesCount} icon={CreditCard} color="emerald" trend="Canlı" />
                <StatCard label="Aktif Duyuru" value={stats.annCount} icon={Megaphone} color="orange" trend="Live" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-[#0f172a] border border-slate-800 rounded-[32px] p-8">
                    <h3 className="text-lg font-black text-white mb-6 uppercase tracking-tight italic">Haftalık Kayıt Trafiği</h3>
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
                <div className="bg-[#0f172a] border border-slate-800 rounded-[32px] p-8 flex flex-col">
                    <h3 className="text-lg font-black text-white mb-6 uppercase tracking-tight italic flex items-center gap-3"><Clock size={18} className="text-blue-500"/> Sistem Hareketleri</h3>
                    <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar pr-2 max-h-[300px]">
                        <LogItem time="Şimdi" action="Dashboard verileri güncellendi" status="Success" />
                        <LogItem time="12 dk" action="Admin girişi başarılı" status="Info" />
                        <LogItem time="45 dk" action="Sistem ayarları denetlendi" status="Update" />
                        <LogItem time="2 sa" action="Veritabanı senkronize edildi" status="Success" />
                    </div>
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
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">İŞLEM <span className="text-emerald-500">GEÇMİŞİ</span></h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Market Satış ve Edinme Kayıtları ({sales.length})</p>
                </div>
                <div className="flex gap-4">
                    <input 
                        type="text" 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Kullanıcı veya bot ara..." 
                        className="bg-[#0f172a] border border-slate-800 rounded-2xl px-6 py-4 text-xs outline-none focus:border-emerald-500 transition-all w-full sm:w-80 font-bold" 
                    />
                    <button onClick={load} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all"><RefreshCw size={20} className={isLoading ? 'animate-spin' : ''}/></button>
                </div>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950/50 border-b border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-6">Kullanıcı</th>
                                <th className="px-8 py-6">Alınan Bot</th>
                                <th className="px-8 py-6">İşlem Tipi</th>
                                <th className="px-8 py-6">Tarih</th>
                                <th className="px-8 py-6 text-right">Durum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {isLoading ? <tr><td colSpan={5} className="p-20 text-center text-slate-500 font-bold animate-pulse">KAYITLAR YÜKLENİYOR...</td></tr> : 
                             filteredSales.length === 0 ? <tr><td colSpan={5} className="p-20 text-center text-slate-600 font-bold italic">Henüz bir işlem kaydı bulunmuyor.</td></tr> : 
                             filteredSales.map((s, idx) => (
                                <tr key={idx} className="hover:bg-slate-800/20 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <img src={s.users?.avatar} className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800" />
                                            <div>
                                                <p className="font-black text-white text-xs">@{s.users?.username}</p>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">{s.users?.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <img src={s.bots?.icon} className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800" />
                                            <div>
                                                <p className="font-black text-white text-xs italic">{s.bots?.name}</p>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase">Stars {s.bots?.price}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border ${s.is_premium ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                                            {s.is_premium ? 'Premium' : 'Ücretsiz'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs text-slate-400 font-bold">{new Date(s.acquired_at).toLocaleDateString('tr-TR')}</p>
                                        <p className="text-[9px] text-slate-600 uppercase font-black">{new Date(s.acquired_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                            <span className="text-[10px] font-black text-emerald-400 uppercase">BAŞARILI</span>
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

const StatCard = ({ label, value, icon: Icon, color, trend }: any) => {
    const colors: any = {
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20'
    };
    return (
        <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-[40px] hover:border-slate-700 transition-all group">
            <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xl group-hover:scale-110 transition-transform ${colors[color]}`}>
                    <Icon size={28} />
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${trend.startsWith('+') ? 'text-emerald-500 bg-emerald-500/10' : 'text-blue-500 bg-blue-500/10'}`}>{trend}</span>
            </div>
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
            <h3 className="text-4xl font-black text-white mt-2 tracking-tighter">{value}</h3>
        </div>
    );
};

const LogItem = ({ time, action, status }: any) => {
    const dots: any = { Success: 'bg-emerald-500', Info: 'bg-blue-500', Update: 'bg-orange-500', User: 'bg-purple-500' };
    return (
        <div className="flex gap-4 items-start group cursor-default">
            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dots[status]}`}></div>
            <div>
                <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">{action}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{time} önce</p>
            </div>
        </div>
    );
};

const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => { load(); }, []);
    const load = async () => { setIsLoading(true); setUsers(await DatabaseService.getUsers()); setIsLoading(false); };

    const toggleStatus = async (user: User) => {
        const nextStatus = user.status === 'Active' ? 'Passive' : 'Active';
        await DatabaseService.updateUserStatus(user.id, nextStatus);
        if (selectedUser?.id === user.id) setSelectedUser({...selectedUser, status: nextStatus as any});
        load();
    };

    const filteredUsers = users.filter(u => 
        (u.name || '').toLowerCase().includes(search.toLowerCase()) || 
        (u.username || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="animate-in fade-in space-y-10 relative">
            <div className="flex flex-col sm:flex-row justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">ÜYE <span className="text-blue-500">KONTROLÜ</span></h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Platformdaki Tüm Kullanıcılar ({users.length})</p>
                </div>
                <div className="relative">
                    <input 
                        type="text" 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Kullanıcı ara..." 
                        className="bg-[#0f172a] border border-slate-800 rounded-2xl px-6 py-4 text-xs outline-none focus:border-blue-500 transition-all w-full sm:w-80 font-bold shadow-inner" 
                    />
                </div>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950/50 border-b border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-6">Kullanıcı</th>
                                <th className="px-8 py-6">E-posta & Tel</th>
                                <th className="px-8 py-6">Rol</th>
                                <th className="px-8 py-6">Durum</th>
                                <th className="px-8 py-6 text-right">Eylemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {isLoading ? <tr><td colSpan={5} className="p-20 text-center text-slate-500 font-bold italic uppercase tracking-widest animate-pulse">Veriler Çekiliyor...</td></tr> : 
                             filteredUsers.length === 0 ? <tr><td colSpan={5} className="p-20 text-center text-slate-600 font-bold italic">Kayıtlı üye bulunamadı.</td></tr> : 
                             filteredUsers.map(u => (
                                <tr key={u.id} className="hover:bg-slate-800/20 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <img src={u.avatar} className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 shadow-md group-hover:scale-105 transition-transform" />
                                            <div>
                                                <p className="font-black text-white text-sm">@{u.username}</p>
                                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-tight">{u.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1">
                                            <p className="text-xs text-slate-300 font-bold">{u.email || '-'}</p>
                                            <p className="text-[10px] text-slate-500 font-medium">{u.phone || '-'}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border ${u.role === 'Admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${u.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></div>
                                            <span className="text-[11px] font-black text-slate-400 uppercase">{u.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => toggleStatus(u)} title={u.status === 'Active' ? 'Kısıtla' : 'Aktifleştir'} className={`p-2.5 rounded-xl transition-all ${u.status === 'Active' ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'}`}>
                                                {u.status === 'Active' ? <Ban size={18}/> : <CheckCircle size={18}/>}
                                            </button>
                                            <button onClick={() => setSelectedUser(u)} className="p-2.5 bg-slate-800 text-slate-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                                                <Eye size={18}/>
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

    useEffect(() => {
        loadData();
    }, [user.id]);

    const totalMemberCount = data.channels.reduce((sum, c) => sum + (c.memberCount || 0), 0);
    const totalRevenue = data.channels.reduce((sum, c) => sum + (c.revenue || 0), 0);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/90 backdrop-blur-md animate-in fade-in" onClick={onClose}>
            <div className="h-full w-full max-w-4xl bg-[#0f172a] border-l border-slate-800 shadow-2xl flex flex-col relative overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-10 pb-6 border-b border-slate-800/50 flex justify-between items-start shrink-0">
                    <div className="flex gap-8">
                        <div className="relative">
                            <img src={user.avatar} className="w-24 h-24 rounded-[32px] border-4 border-slate-900 shadow-2xl object-cover" />
                            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-[#0f172a] ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white tracking-tighter italic uppercase">{user.name}</h3>
                            <p className="text-blue-500 font-black text-sm tracking-widest mt-1 uppercase">@{user.username}</p>
                            <div className="flex gap-3 mt-4">
                                <span className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-[9px] font-black text-slate-500 uppercase tracking-widest">UID: {user.id}</span>
                                <span className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-[9px] font-black text-slate-500 uppercase tracking-widest">Kayıt: {new Date(user.joinDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={loadData} title="Yenile" className="p-3 bg-slate-900 text-slate-400 hover:text-white rounded-2xl border border-slate-800 transition-colors"><RefreshCw size={22} className={isLoading ? 'animate-spin' : ''}/></button>
                        <button onClick={onStatusToggle} className={`p-3 rounded-2xl transition-all ${user.status === 'Active' ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'}`}>
                            {user.status === 'Active' ? <Ban size={22}/> : <CheckCircle size={22}/>}
                        </button>
                        <button onClick={onClose} className="p-3 bg-slate-900 text-slate-500 hover:text-white rounded-2xl border border-slate-800 transition-colors"><X size={22}/></button>
                    </div>
                </div>

                <div className="flex px-10 gap-8 border-b border-slate-800/50 bg-slate-950/20 shrink-0">
                    <TabBtn active={activeTab === 'info'} label="Profil Analizi" icon={TrendingUp} onClick={() => setActiveTab('info')} />
                    <TabBtn active={activeTab === 'assets'} label={`Varlıklar (${data.channels.length + data.userBots.length})`} icon={Package} onClick={() => setActiveTab('assets')} />
                    <TabBtn active={activeTab === 'logs'} label="İşlem Geçmişi" icon={History} onClick={() => setActiveTab('logs')} />
                </div>

                <div className="flex-1 overflow-y-auto p-10 no-scrollbar pb-32">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="animate-spin text-blue-500" size={32} />
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic animate-pulse">Veriler Getiriliyor...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'info' && (
                                <div className="space-y-8 animate-in fade-in">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                        <DetailCard label="E-posta" value={user.email || 'Girilmemiş'} icon={Globe} />
                                        <DetailCard label="Telefon" value={user.phone || 'Girilmemiş'} icon={Activity} />
                                        <DetailCard label="Sistem Rolü" value={user.role} icon={ShieldCheck} />
                                        <DetailCard label="Üye Erişimi" value={totalMemberCount.toLocaleString()} icon={Users} />
                                        <DetailCard label="Ciro" value={`₺${totalRevenue}`} icon={Wallet} />
                                        <DetailCard label="Aktif Kaynak" value={data.channels.length + data.userBots.length} icon={Cpu} />
                                    </div>
                                    <div className="p-10 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-[44px]">
                                        <div className="flex gap-6 items-start">
                                            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-900/40"><Sparkles size={32}/></div>
                                            <div className="flex-1">
                                                <h4 className="text-lg font-black text-white uppercase italic tracking-tighter mb-2">Platform Karnesi</h4>
                                                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                                    Bu kullanıcı sistemimizde <span className="text-white font-bold">{data.channels.length} kanal</span> ve <span className="text-white font-bold">{data.userBots.length} aktif bot</span> yönetmektedir. 
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'assets' && (
                                <div className="space-y-12 animate-in fade-in">
                                    <section>
                                        <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-3 italic">
                                            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div> KANALLAR ({data.channels.length})
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {data.channels.length === 0 ? <p className="col-span-full text-slate-700 italic font-bold p-16 text-center border-2 border-dashed border-slate-900 rounded-[40px] text-[10px]">Kanal Verisi Yok</p> : 
                                            data.channels.map(c => (
                                                <div key={c.id} className="bg-slate-900/50 border border-slate-800 p-8 rounded-[36px] flex flex-col group hover:bg-slate-800/20 transition-all shadow-xl">
                                                    <div className="flex items-center gap-5 mb-6">
                                                        <img src={c.icon} className="w-16 h-16 rounded-[24px] border border-slate-800 object-cover shadow-2xl" />
                                                        <div className="min-w-0">
                                                            <p className="font-black text-white text-lg italic truncate">{c.name}</p>
                                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{c.memberCount.toLocaleString()} Üye</span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-auto pt-6 border-t border-slate-800/50 flex justify-between items-center">
                                                        <span className="text-[9px] font-black text-slate-600 uppercase italic">Kazanç</span>
                                                        <p className="text-xl font-black text-emerald-500 italic">₺{c.revenue}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                    
                                    <section>
                                        <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-3 italic">
                                            <div className="w-1.5 h-6 bg-purple-600 rounded-full"></div> ENVANTER ({data.userBots.length})
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {data.userBots.length === 0 ? (
                                                <div className="col-span-full flex flex-col items-center justify-center p-20 border-2 border-dashed border-slate-800 rounded-[40px] bg-slate-950/20 text-center">
                                                    <Bot size={48} className="text-slate-800 mb-4" />
                                                    <p className="text-slate-600 font-bold uppercase tracking-widest text-[10px]">Henüz Bot Eklenmemiş</p>
                                                    <p className="text-slate-800 text-[9px] mt-2 italic">Kullanıcı marketten bot eklediğinde burada listelenecek.</p>
                                                </div>
                                            ) : (
                                                data.userBots.map((item, idx) => (
                                                    <div key={idx} className="bg-slate-900/40 border border-slate-800 p-6 rounded-[32px] flex flex-col group hover:border-purple-500/40 transition-all shadow-lg relative">
                                                        <div className="flex gap-4 items-center mb-4">
                                                            <img src={item.bot.icon} className="w-16 h-16 rounded-[24px] border border-slate-800 object-cover shadow-xl bg-slate-950" />
                                                            <div className="min-w-0 flex-1">
                                                                <p className="font-black text-white text-sm italic truncate tracking-tight">{item.bot.name}</p>
                                                                <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1">
                                                                    {CATEGORY_NAMES[item.bot.category] || item.bot.category}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex flex-wrap gap-1.5 mt-auto">
                                                            <span className={`text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest border ${item.ownership.is_active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                                {item.ownership.is_active ? 'AKTİF' : 'PASİF'}
                                                            </span>
                                                            {item.ownership.is_premium && (
                                                                <span className="text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center gap-1">
                                                                    <Star size={8} fill="currentColor"/> PREMIUM
                                                                </span>
                                                            )}
                                                            <span className="text-[8px] font-black px-2 py-1 rounded-lg uppercase bg-slate-800 text-slate-500 border border-slate-700">
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
                                <div className="space-y-4 animate-in fade-in">
                                    <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] mb-10 flex items-center gap-3 italic">
                                        <div className="w-1.5 h-6 bg-emerald-600 rounded-full"></div> İŞLEM KAYITLARI
                                    </h4>
                                    {data.logs.length === 0 ? <p className="text-slate-700 italic font-bold p-16 text-center border-2 border-dashed border-slate-900 rounded-[40px] text-[10px]">Kayıt Bulunmuyor</p> : 
                                     data.logs.map(log => (
                                        <div key={log.id} className="bg-slate-900/30 border border-slate-800 p-6 rounded-[32px] flex gap-6 group hover:bg-slate-800/10 border-l-4 hover:border-l-blue-500 transition-all">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                                                {log.type === 'payment' ? <Wallet size={20} className="text-emerald-500"/> : 
                                                 log.type === 'security' ? <ShieldAlert size={20} className="text-red-500"/> : 
                                                 log.type === 'bot' ? <Cpu size={20} className="text-purple-500"/> :
                                                 <Bell size={20} className="text-blue-500"/>}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex justify-between items-start gap-4 mb-2">
                                                    <p className="text-sm font-black text-white italic truncate">{log.title}</p>
                                                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest whitespace-nowrap bg-slate-950 px-2 py-1 rounded-lg">{new Date(log.date).toLocaleString('tr-TR')}</p>
                                                </div>
                                                <p className="text-xs text-slate-500 leading-relaxed font-medium">{log.message}</p>
                                            </div>
                                        </div>
                                     ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#0f172a] via-[#0f172a] to-transparent shrink-0">
                    <button className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[36px] text-[11px] tracking-[0.4em] uppercase shadow-2xl shadow-blue-900/40 active:scale-95 transition-all flex items-center justify-center gap-4">
                        <MessageSquare size={20}/> KULLANICIYA MESAJ İLET
                    </button>
                </div>
            </div>
        </div>
    );
};

const TabBtn = ({ active, label, icon: Icon, onClick }: any) => (
    <button onClick={onClick} className={`flex items-center gap-3 py-6 border-b-2 transition-all relative ${active ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
        <Icon size={18} className={active ? 'text-blue-400' : ''} />
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 blur-sm"></div>}
    </button>
);

const DetailCard = ({ label, value, icon: Icon }: any) => (
    <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[36px] group hover:border-slate-700 transition-all">
        <div className="flex items-center gap-2 mb-2 text-slate-600 group-hover:text-blue-500 transition-colors">
            <Icon size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
        </div>
        <p className="text-sm font-black text-white truncate italic tracking-tight">{value}</p>
    </div>
);

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
        } catch (err: any) {
            alert("Hata: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const fetchBotIcon = async () => {
        if (!editingBot?.bot_link || !editingBot.bot_link.startsWith('@')) {
            alert("Lütfen önce geçerli bir Telegram kullanıcı adı girin (@BotName formatında)");
            return;
        }

        setIsFetchingIcon(true);
        // CORS ve ön-yükleme hatalarından kaçınmak için doğrudan URL oluşturup atıyoruz.
        // Telegram görsel sunucusu genellikle img.t.me veya t.me üzerinden çalışır.
        const username = editingBot.bot_link.replace('@', '').toLowerCase();
        const iconUrl = `https://t.me/i/userpic/320/${username}.jpg`;
        
        // Küçük bir yapay bekleme (deneyim için)
        setTimeout(() => {
            setEditingBot({ ...editingBot, icon: iconUrl });
            setIsFetchingIcon(false);
        }, 600);
    };

    return (
        <div className="animate-in fade-in space-y-10">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">MARKET <span className="text-blue-500">YÖNETİMİ</span></h2>
                <button onClick={() => { setEditingBot({ name: '', description: '', price: 0, category: 'productivity', bot_link: '', icon: '', screenshots: [] }); setIsModalOpen(true); }} className="px-8 py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95 transition-all">
                    <Plus size={18}/> Yeni Bot Ekle
                </button>
            </div>

            {isLoading ? <div className="p-40 text-center font-bold italic animate-pulse text-slate-500">Market Yükleniyor...</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {bots.length === 0 ? <div className="col-span-full py-20 text-center text-slate-600 font-bold border-2 border-dashed border-slate-800 rounded-3xl uppercase tracking-widest text-[10px]">Mağaza Boş</div> : 
                     bots.map(b => (
                        <div key={b.id} className="bg-[#0f172a] border border-slate-800 p-8 rounded-[40px] hover:border-blue-500/40 transition-all flex flex-col group shadow-2xl relative overflow-hidden">
                            <div className="flex gap-6 mb-8">
                                <img src={b.icon} className="w-20 h-20 rounded-[28px] object-cover border-2 border-slate-800 bg-slate-900 shadow-xl" />
                                <div className="min-w-0">
                                    <h4 className="font-black text-white text-lg truncate group-hover:text-blue-400 transition-colors italic tracking-tight">{b.name}</h4>
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2 bg-slate-800 w-fit px-2 py-1 rounded-md">
                                        {CATEGORY_NAMES[b.category] || b.category}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-3 text-yellow-500">
                                        <Star size={14} fill="currentColor"/>
                                        <span className="font-black text-sm text-white">{b.price} Stars</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-3 mb-8 font-medium leading-relaxed">{b.description}</p>
                            <div className="flex gap-2 mt-auto border-t border-slate-800 pt-8">
                                <button onClick={() => { setEditingBot(b); setIsModalOpen(true); }} className="flex-1 py-4 bg-slate-800 hover:bg-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"> <Edit2 size={14}/> Düzenle </button>
                                <button onClick={async () => { if(confirm("Botu mağazadan kaldırmak istediğinize emin misiniz?")) { await DatabaseService.deleteBot(b.id); load(); } }} className="p-4 bg-slate-800 hover:bg-red-500 text-slate-400 hover:text-white rounded-xl transition-all"><Trash2 size={18}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && editingBot && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in" onClick={() => !isSaving && setIsModalOpen(false)}>
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[44px] p-10 relative shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setIsModalOpen(false)} disabled={isSaving} className="absolute top-8 right-8 text-slate-500 hover:text-white disabled:opacity-30"><X size={22}/></button>
                        <h3 className="text-2xl font-black mb-10 text-white italic tracking-tighter uppercase">{editingBot.id ? 'Bot Verisini Düzenle' : 'Yeni Bot Oluştur'}</h3>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Bot İsmi</label>
                                <input type="text" required value={editingBot.name} onChange={e => setEditingBot({...editingBot, name: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all shadow-inner" placeholder="Botun Marketteki Adı" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Kategori</label>
                                    <select value={editingBot.category} onChange={e => setEditingBot({...editingBot, category: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-blue-500 outline-none appearance-none">
                                        <option value="productivity">Üretkenlik</option>
                                        <option value="games">Eğlence & Oyun</option>
                                        <option value="utilities">Araçlar & Servisler</option>
                                        <option value="finance">Finans & Ekonomi</option>
                                        <option value="music">Müzik & Ses</option>
                                        <option value="moderation">Grup Yönetimi</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Fiyat (Stars)</label>
                                    <input type="number" required value={editingBot.price} onChange={e => setEditingBot({...editingBot, price: Number((e.target as any).value)})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-blue-500 outline-none shadow-inner" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Detaylı Açıklama</label>
                                <textarea required value={editingBot.description} onChange={e => setEditingBot({...editingBot, description: (e.target as any).value})} className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm resize-none focus:border-blue-500 outline-none font-medium leading-relaxed" placeholder="Bot ne işe yarar? Kullanıcılara ne sunar?" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Bot Linki (Telegram @)</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1 group">
                                        <Send className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                                        <input type="text" required value={editingBot.bot_link} onChange={e => setEditingBot({...editingBot, bot_link: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 pl-12 pr-4 text-sm font-bold text-white focus:border-blue-500 outline-none" placeholder="Örn: @BotlyHubBOT" />
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={fetchBotIcon}
                                        disabled={isFetchingIcon}
                                        title="Görseli Bottan Çek"
                                        className="px-6 bg-slate-950 border border-slate-800 rounded-2xl text-blue-500 hover:text-blue-400 hover:border-blue-500/50 transition-all flex items-center justify-center disabled:opacity-50 active:scale-95"
                                    >
                                        {isFetchingIcon ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
                                    </button>
                                </div>
                                <p className="text-[9px] text-slate-600 font-bold uppercase ml-2 tracking-tighter italic">Sihirbaz butonuna basarak botun profil resmini otomatik çekebilirsiniz.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">İkon URL (Görsel Adresi)</label>
                                <div className="flex gap-4 items-center">
                                    <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                                        {editingBot.icon ? <img src={editingBot.icon} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-800" size={24}/>}
                                    </div>
                                    <input type="text" required value={editingBot.icon} onChange={e => setEditingBot({...editingBot, icon: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-blue-500 outline-none" placeholder="https://..." />
                                </div>
                            </div>
                            <button type="submit" disabled={isSaving} className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-3xl text-[10px] tracking-[0.3em] uppercase shadow-2xl shadow-blue-900/30 active:scale-95 transition-all mt-4 flex items-center justify-center gap-3">
                                {isSaving ? <Loader2 className="animate-spin" /> : 'KAYITLARI YAYINLA'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const NotificationCenter = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({ title: '', message: '', type: 'system' as any });
    const [history, setHistory] = useState<Notification[]>([]);

    useEffect(() => { load(); }, []);
    const load = async () => { setHistory(await DatabaseService.getNotifications()); };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await DatabaseService.sendNotification({
            ...form,
            target_type: 'global'
        });
        setIsLoading(false);
        setForm({ title: '', message: '', type: 'system' });
        load();
        alert("Bildirim global olarak yayınlandı.");
    };

    return (
        <div className="animate-in fade-in space-y-12">
            <div className="flex flex-col sm:flex-row justify-between gap-10">
                <div className="bg-[#0f172a] border border-slate-800 p-10 rounded-[40px] flex-1 max-w-xl shadow-2xl">
                    <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-10 flex items-center gap-4"><Megaphone className="text-blue-500" size={28}/> Global Broadcast</h3>
                    <form onSubmit={handleSend} className="space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Bildirim Tipi</label>
                                <select value={form.type} onChange={e => setForm({...form, type: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold focus:border-blue-500 outline-none appearance-none">
                                    <option value="system">Duyuru</option>
                                    <option value="payment">Ödeme</option>
                                    <option value="security">Güvenlik</option>
                                    <option value="bot">Güncelleme</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Kısa Başlık</label>
                                <input required type="text" value={form.title} onChange={e => setForm({...form, title: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold focus:border-blue-500 outline-none" placeholder="Örn: Yeni Özellik!" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Mesaj Detayı</label>
                            <textarea required value={form.message} onChange={e => setForm({...form, message: (e.target as any).value})} className="w-full h-40 bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm resize-none focus:border-blue-500 outline-none font-medium leading-relaxed" placeholder="Tüm kullanıcılara ulaştırılacak mesaj..." />
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-3xl text-[10px] tracking-[0.3em] uppercase shadow-2xl shadow-blue-900/40 active:scale-95 transition-all">
                            {isLoading ? <Loader2 className="animate-spin mx-auto"/> : 'HEMEN YAYINLA'}
                        </button>
                    </form>
                </div>

                <div className="flex-1 flex flex-col">
                    <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-6 flex items-center gap-3"><Clock className="text-purple-500"/> Yayın Geçmişi</h3>
                    <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar pr-2 max-h-[600px]">
                        {history.filter(n => n.target_type === 'global').length === 0 ? <p className="text-slate-700 italic font-bold p-10 text-center text-[10px] uppercase tracking-widest">Global Yayın Yok</p> : 
                         history.filter(n => n.target_type === 'global').map(n => (
                            <div key={n.id} className="bg-slate-900/40 border border-slate-800 p-6 rounded-[32px] flex gap-5 hover:bg-slate-800/30 transition-all group">
                                <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                                    <Send size={18} className="text-blue-500"/>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex justify-between items-start mb-1 gap-4">
                                        <p className="text-sm font-black text-white truncate italic">{n.title}</p>
                                        <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest whitespace-nowrap mt-1">{new Date(n.date).toLocaleDateString()}</p>
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">{n.message}</p>
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
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">PROMOSYON <span className="text-blue-500">MASASI</span></h2>
                <button onClick={() => { setEditingAnn({ title: '', description: '', button_text: 'İncele', button_link: '', icon_name: 'Megaphone', color_scheme: 'purple', is_active: true, action_type: 'link' }); setIsModalOpen(true); }} className="px-8 py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95 transition-all">
                    <Plus size={18}/> Yeni Kart Oluştur
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {anns.length === 0 ? <div className="col-span-full py-32 text-center text-slate-700 font-black uppercase tracking-[0.2em] border-2 border-dashed border-slate-900 rounded-[40px] text-[10px]">Aktif kampanya yok</div> : 
                 anns.map(a => (
                    <div key={a.id} className="bg-[#0f172a] border border-slate-800 p-8 rounded-[40px] group relative overflow-hidden transition-all hover:border-blue-500/50 flex flex-col shadow-2xl">
                        <div className={`w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-8 shadow-inner`}>
                            {React.createElement(AVAILABLE_ICONS.find(i => i.name === a.icon_name)?.icon || Megaphone, { size: 24, className: 'text-blue-500' })}
                        </div>
                        <h4 className="font-black text-xl text-white mb-3 italic tracking-tight">{a.title}</h4>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-10 font-medium leading-relaxed">{a.description}</p>
                        <div className="flex justify-between items-center mt-auto border-t border-slate-800 pt-8">
                            <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border border-slate-800 text-slate-400 bg-slate-900/50`}>{a.color_scheme}</span>
                            <div className="flex gap-3">
                                <button onClick={() => { setEditingAnn(a); setIsModalOpen(true); }} className="p-3 bg-slate-800 hover:bg-blue-600 text-white rounded-xl transition-all"><Edit2 size={18}/></button>
                                <button onClick={async () => { if(confirm("Bu duyuru kartını silmek istiyor musunuz?")) { await DatabaseService.deleteAnnouncement(a.id); load(); } }} className="p-3 bg-slate-800 hover:bg-red-500 text-slate-400 hover:text-white rounded-xl transition-all"><Trash2 size={18}/></button>
                            </div>
                        </div>
                        {!a.is_active && <div className="absolute top-4 right-4 bg-red-600/10 text-red-500 text-[8px] font-black px-2 py-1 rounded uppercase border border-red-500/20">Pasif</div>}
                    </div>
                ))}
            </div>

            {isModalOpen && editingAnn && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[44px] p-10 relative shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X size={22}/></button>
                        <h3 className="text-2xl font-black mb-10 text-white italic tracking-tighter uppercase">{editingAnn.id ? 'Kart Verilerini Güncelle' : 'Yeni Duyuru Kartı'}</h3>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Kart Başlığı</label>
                                <input type="text" required value={editingAnn.title} onChange={e => setEditingAnn({...editingAnn, title: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all shadow-inner" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Kısa Promo Metni</label>
                                <textarea required value={editingAnn.description} onChange={e => setEditingAnn({...editingAnn, description: (e.target as any).value})} className="w-full h-24 bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm resize-none focus:border-blue-500 outline-none font-medium leading-relaxed" />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Kart İkonu Belirle</label>
                                <div className="grid grid-cols-5 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                    {AVAILABLE_ICONS.map(i => (
                                        <button 
                                            key={i.name} 
                                            type="button"
                                            onClick={() => setEditingAnn({...editingAnn, icon_name: i.name})}
                                            className={`p-3 rounded-xl flex items-center justify-center transition-all ${editingAnn.icon_name === i.name ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-500 hover:text-slate-300'}`}
                                        >
                                            <i.icon size={20} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Buton Metni</label>
                                    <input type="text" required value={editingAnn.button_text} onChange={e => setEditingAnn({...editingAnn, button_text: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold focus:border-blue-500 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Renk Paleti</label>
                                    <select value={editingAnn.color_scheme} onChange={e => setEditingAnn({...editingAnn, color_scheme: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold focus:border-blue-500 outline-none appearance-none">
                                        <option value="purple">Modern Mor</option>
                                        <option value="blue">Okyanus Mavi</option>
                                        <option value="emerald">Canlı Yeşil</option>
                                        <option value="orange">Neon Turuncu</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Hedef (@user / link)</label>
                                <input type="text" value={editingAnn.button_link} onChange={e => setEditingAnn({...editingAnn, button_link: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold focus:border-blue-500 outline-none shadow-inner" placeholder="@username veya /sayfa" />
                            </div>
                            <div className="flex items-center justify-between p-6 bg-slate-950 border border-slate-800 rounded-3xl">
                                <div>
                                    <p className="text-xs font-black text-white uppercase tracking-tight">KART DURUMU</p>
                                    <p className="text-[9px] text-slate-600 font-bold uppercase mt-1">Sistemde gösterilsin mi?</p>
                                </div>
                                <button type="button" onClick={() => setEditingAnn({...editingAnn, is_active: !editingAnn.is_active})} className={`w-14 h-7 rounded-full relative transition-all shadow-inner ${editingAnn.is_active ? 'bg-emerald-600' : 'bg-slate-800'}`}>
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-lg ${editingAnn.is_active ? 'left-8' : 'left-1'}`} />
                                </button>
                            </div>
                            <button type="submit" className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-3xl text-[10px] tracking-[0.3em] uppercase shadow-2xl shadow-blue-900/30 active:scale-95 transition-all mt-4">PARAMETRELERİ GÜNCELLE</button>
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
            alert("Sistem yapılandırması başarıyla kaydedildi.");
        } catch (e: any) {
            console.error("Critical: Settings save error:", e);
            alert("Veritabanı hatası!\nLütfen Supabase SQL Editor'den tabloları oluşturduğunuzdan emin olun.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in space-y-12 pb-20">
            <div>
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase italic">SİSTEM <span className="text-blue-500">YAPILANDIRMASI</span></h2>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Platform Çekirdek Parametreleri</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-[#0f172a] border border-slate-800 p-12 rounded-[48px] space-y-10 shadow-2xl">
                    <h3 className="font-black text-lg text-white mb-6 uppercase italic flex items-center gap-4"><Globe size={24} className="text-blue-500"/> Marka & Sosyal</h3>
                    <div className="space-y-8">
                        <div className="space-y-3"> 
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Uygulama Adı</label> 
                            <input type="text" value={settings.appName} onChange={e => setSettings({...settings, appName: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all shadow-inner" /> 
                        </div>
                        <div className="space-y-3"> 
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Destek Kanalı</label> 
                            <input type="text" value={settings.supportLink} onChange={e => setSettings({...settings, supportLink: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-blue-500 outline-none" /> 
                        </div>
                    </div>
                </div>

                <div className="bg-[#0f172a] border border-slate-800 p-12 rounded-[48px] space-y-10 shadow-2xl">
                    <h3 className="font-black text-lg text-white mb-6 uppercase italic flex items-center gap-4"><Percent size={24} className="text-emerald-500"/> Kritik Ayarlar</h3>
                    <div className="space-y-10">
                        <div className="flex items-center justify-between p-8 bg-slate-950 border border-slate-800 rounded-[32px]">
                            <div> 
                                <p className="text-sm font-black text-white">BAKIM MODU</p> 
                                <p className="text-[10px] text-slate-600 font-bold uppercase mt-1">Platformu erişime kapatır</p> 
                            </div>
                            <button onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})} className={`w-16 h-8 rounded-full relative transition-all shadow-lg ${settings.maintenanceMode ? 'bg-red-600' : 'bg-slate-800'}`}> 
                                <div className={`absolute top-1.5 w-5 h-5 bg-white rounded-full transition-all shadow-inner ${settings.maintenanceMode ? 'left-9' : 'left-2'}`} /> 
                            </button>
                        </div>
                        <div className="space-y-3"> 
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Komisyon Oranı (%)</label> 
                            <input type="number" value={settings.commissionRate} onChange={e => setSettings({...settings, commissionRate: Number((e.target as any).value)})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-emerald-500 outline-none" /> 
                        </div>
                    </div>
                </div>
            </div>

            <button onClick={handleSave} disabled={isSaving} className="w-full py-7 bg-blue-600 hover:bg-blue-500 text-white font-black text-[12px] uppercase tracking-[0.4em] rounded-[32px] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50 mt-10"> 
                {isSaving ? <Loader2 className="animate-spin" /> : <ShieldCheck size={22} />} TÜM SİSTEMİ YAYINLA
            </button>
        </div>
    );
}

export default AdminDashboard;
