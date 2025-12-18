
import React, { useEffect, useState } from 'react';
import * as Router from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bot, LogOut, Menu, X, 
  Package, Loader2, RefreshCw, Plus, Edit2, Trash2, 
  Megaphone, Calendar, Settings as SettingsIcon, 
  ShieldCheck, Percent, Globe, MessageSquare, AlertTriangle,
  Sparkles, Zap, Star, ChevronRight, Eye, Send, Activity, 
  Clock, Wallet, ShieldAlert, Cpu, Ban, CheckCircle, Gift, Info, Heart, Bell, Shield, ExternalLink, TrendingUp
} from 'lucide-react';
import { DatabaseService } from '../../services/DatabaseService';
import { User, Bot as BotType, Announcement, Notification, Channel } from '../../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const { useNavigate, Routes, Route, Link, useLocation } = Router as any;

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
    const [stats, setStats] = useState({ userCount: 0, botCount: 0, notifCount: 0, annCount: 0 });
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
                <StatCard label="Bildirimler" value={stats.notifCount} icon={Send} color="emerald" trend="Anlık" />
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

// --- User Management Module ---
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
    const [data, setData] = useState<{ channels: Channel[], logs: Notification[], bots: BotType[] }>({ channels: [], logs: [], bots: [] });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            const res = await DatabaseService.getUserDetailedAssets(user.id);
            setData(res as any);
            setIsLoading(false);
        };
        load();
    }, [user.id]);

    const totalMemberCount = data.channels.reduce((sum, c) => sum + (c.memberCount || 0), 0);
    const totalRevenue = data.channels.reduce((sum, c) => sum + (c.revenue || 0), 0);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/90 backdrop-blur-md animate-in fade-in" onClick={onClose}>
            <div className="h-full w-full max-w-3xl bg-[#0f172a] border-l border-slate-800 shadow-2xl flex flex-col relative overflow-hidden" onClick={e => e.stopPropagation()}>
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
                        <button onClick={onStatusToggle} className={`p-3 rounded-2xl transition-all ${user.status === 'Active' ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'}`}>
                            {user.status === 'Active' ? <Ban size={22}/> : <CheckCircle size={22}/>}
                        </button>
                        <button onClick={onClose} className="p-3 bg-slate-900 text-slate-500 hover:text-white rounded-2xl border border-slate-800 transition-colors"><X size={22}/></button>
                    </div>
                </div>

                <div className="flex px-10 gap-8 border-b border-slate-800/50 bg-slate-950/20 shrink-0">
                    <TabBtn active={activeTab === 'info'} label="Profil Özeti" icon={Info} onClick={() => setActiveTab('info')} />
                    <TabBtn active={activeTab === 'assets'} label={`Varlıklar (${data.channels.length + data.bots.length})`} icon={Package} onClick={() => setActiveTab('assets')} />
                    <TabBtn active={activeTab === 'logs'} label="Denetim Günlüğü" icon={ShieldAlert} onClick={() => setActiveTab('logs')} />
                </div>

                <div className="flex-1 overflow-y-auto p-10 no-scrollbar pb-32">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="animate-spin text-blue-500" size={32} />
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic animate-pulse">Gerçek zamanlı veriler senkronize ediliyor...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'info' && (
                                <div className="space-y-8 animate-in fade-in">
                                    <div className="grid grid-cols-2 gap-6">
                                        <DetailCard label="İletişim E-posta" value={user.email || 'Girilmemiş'} icon={Globe} />
                                        <DetailCard label="Telefon Hattı" value={user.phone || 'Girilmemiş'} icon={Activity} />
                                        <DetailCard label="Sistem Rolü" value={user.role} icon={ShieldCheck} />
                                        <DetailCard label="Toplam Üye Erişimi" value={totalMemberCount.toLocaleString()} icon={Users} />
                                        <DetailCard label="Net Kazanç (TRY)" value={`₺${totalRevenue}`} icon={Wallet} />
                                        <DetailCard label="Aktif Kanal" value={data.channels.length.toString()} icon={Megaphone} />
                                    </div>
                                    <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-[40px] flex gap-5 items-start">
                                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 shrink-0"><Sparkles size={24}/></div>
                                        <div>
                                            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-2">Platform Performansı</h4>
                                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium uppercase">Bu kullanıcı {data.channels.length} kanal ve {data.bots.length} aktif bot ile sistem kaynaklarının %0.4'ünü kullanmaktadır. Son 30 gün içerisindeki aktivite skoru: <span className="text-emerald-500">Yüksek</span>.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'assets' && (
                                <div className="space-y-12 animate-in fade-in">
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6 flex items-center gap-2 italic">
                                            <Megaphone size={16} className="text-blue-500"/> SİSTEMDEKİ KANALLAR ({data.channels.length})
                                        </h4>
                                        <div className="space-y-4">
                                            {data.channels.length === 0 ? <p className="text-slate-700 italic font-bold p-10 text-center border border-dashed border-slate-800 rounded-3xl">Henüz bir kanal verisi bulunmuyor.</p> : 
                                            data.channels.map(c => (
                                                <div key={c.id} className="bg-slate-900/50 border border-slate-800 p-6 rounded-[28px] flex items-center justify-between group hover:bg-slate-800/20 transition-all">
                                                    <div className="flex items-center gap-5">
                                                        <img src={c.icon} className="w-14 h-14 rounded-2xl border border-slate-800 object-cover shadow-xl" />
                                                        <div>
                                                            <p className="font-black text-white text-base italic">{c.name}</p>
                                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">{c.memberCount.toLocaleString()} Üye Kaydı</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[9px] text-slate-600 font-black uppercase">Toplam Ciro</p>
                                                        <p className="text-base font-black text-emerald-500 italic">₺{c.revenue}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6 flex items-center gap-2 italic">
                                            <Bot size={16} className="text-purple-500"/> KÜTÜPHANE ENVANTERİ ({data.bots.length})
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {data.bots.length === 0 ? <p className="col-span-full text-slate-700 italic font-bold p-10 text-center border border-dashed border-slate-800 rounded-3xl">Henüz bir bot kütüphanesi oluşturulmamış.</p> : 
                                            data.bots.map(b => (
                                                <div key={b.id} className="bg-slate-900/40 border border-slate-800 p-5 rounded-[28px] flex items-center gap-4 group hover:border-purple-500/30 transition-all">
                                                    <img src={b.icon} className="w-12 h-12 rounded-2xl border border-slate-800 object-cover grayscale group-hover:grayscale-0 transition-all" />
                                                    <div className="min-w-0">
                                                        <p className="font-black text-white text-sm truncate uppercase tracking-tighter italic">{b.name}</p>
                                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{b.category}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'logs' && (
                                <div className="space-y-4 animate-in fade-in">
                                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6 flex items-center gap-2 italic">
                                        <Clock size={16} className="text-blue-500"/> İŞLEM VE ERİŞİM KAYITLARI
                                    </h4>
                                    {data.logs.length === 0 ? <p className="text-slate-700 italic font-bold p-10 text-center border border-dashed border-slate-800 rounded-3xl">Denetim günlüğü henüz başlatılmamış.</p> : 
                                     data.logs.map(log => (
                                        <div key={log.id} className="bg-slate-900/30 border border-slate-800 p-5 rounded-[28px] flex gap-5 group hover:bg-slate-800/10 transition-all">
                                            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center shrink-0 shadow-inner">
                                                {log.type === 'payment' ? <Wallet size={16} className="text-emerald-500"/> : 
                                                 log.type === 'security' ? <ShieldAlert size={16} className="text-red-500"/> : 
                                                 log.type === 'bot' ? <Cpu size={16} className="text-purple-500"/> :
                                                 <Bell size={16} className="text-blue-500"/>}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex justify-between items-start gap-4">
                                                    <p className="text-xs font-black text-white italic truncate">{log.title}</p>
                                                    <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest whitespace-nowrap">{new Date(log.date).toLocaleString('tr-TR')}</p>
                                                </div>
                                                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed font-medium">{log.message}</p>
                                            </div>
                                        </div>
                                     ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#0f172a] via-[#0f172a] to-transparent shrink-0">
                    <button className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[28px] text-[10px] tracking-[0.3em] uppercase shadow-2xl shadow-blue-900/40 active:scale-95 transition-all flex items-center justify-center gap-3">
                        <MessageSquare size={18}/> KULLANICIYA SİSTEM MESAJI GÖNDER
                    </button>
                </div>
            </div>
        </div>
    );
};

const TabBtn = ({ active, label, icon: Icon, onClick }: any) => (
    <button onClick={onClick} className={`flex items-center gap-2.5 py-6 border-b-2 transition-all relative ${active ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
        <Icon size={16} className={active ? 'text-blue-400' : ''} />
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 blur-sm"></div>}
    </button>
);

const DetailCard = ({ label, value, icon: Icon }: any) => (
    <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[32px] group hover:border-slate-700 transition-all">
        <div className="flex items-center gap-2 mb-2 text-slate-600 group-hover:text-blue-500 transition-colors">
            <Icon size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
        </div>
        <p className="text-sm font-black text-white truncate italic tracking-tight">{value}</p>
    </div>
);

// --- Bot Management Module ---
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
        <div className="animate-in fade-in space-y-10">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">MARKET <span className="text-blue-500">YÖNETİMİ</span></h2>
                <button onClick={() => { setEditingBot({ name: '', description: '', price: 0, category: 'productivity', bot_link: '', icon: '', screenshots: [] }); setIsModalOpen(true); }} className="px-8 py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2 shadow-lg shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all">
                    <Plus size={18}/> Yeni Bot Ekle
                </button>
            </div>

            {isLoading ? <div className="p-40 text-center font-bold italic animate-pulse text-slate-500">Market Yükleniyor...</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {bots.length === 0 ? <div className="col-span-full py-20 text-center text-slate-600 font-bold border-2 border-dashed border-slate-800 rounded-3xl">Mağazada henüz bot bulunmuyor.</div> : 
                     bots.map(b => (
                        <div key={b.id} className="bg-[#0f172a] border border-slate-800 p-8 rounded-[40px] hover:border-blue-500/40 transition-all flex flex-col group shadow-2xl relative overflow-hidden">
                            <div className="flex gap-6 mb-8">
                                <img src={b.icon} className="w-20 h-20 rounded-[28px] object-cover border-2 border-slate-800 bg-slate-900 shadow-xl" />
                                <div className="min-w-0">
                                    <h4 className="font-black text-white text-lg truncate group-hover:text-blue-400 transition-colors italic tracking-tight">{b.name}</h4>
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2 bg-slate-800 w-fit px-2 py-1 rounded-md">{b.category}</p>
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[44px] p-10 relative shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X size={22}/></button>
                        <h3 className="text-2xl font-black mb-10 text-white italic tracking-tighter uppercase">{editingBot.id ? 'Bot Verisini Düzenle' : 'Yeni Bot Oluştur'}</h3>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Bot İsmi</label>
                                <input type="text" required value={editingBot.name} onChange={e => setEditingBot({...editingBot, name: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all shadow-inner" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Kategori</label>
                                    <select value={editingBot.category} onChange={e => setEditingBot({...editingBot, category: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-blue-500 outline-none appearance-none">
                                        <option value="productivity">Üretkenlik</option>
                                        <option value="games">Oyun</option>
                                        <option value="utilities">Araçlar</option>
                                        <option value="finance">Finans</option>
                                        <option value="music">Müzik</option>
                                        <option value="moderation">Moderasyon</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Fiyat (Stars)</label>
                                    <input type="number" required value={editingBot.price} onChange={e => setEditingBot({...editingBot, price: Number((e.target as any).value)})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-blue-500 outline-none shadow-inner" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Detaylı Açıklama</label>
                                <textarea required value={editingBot.description} onChange={e => setEditingBot({...editingBot, description: (e.target as any).value})} className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm resize-none focus:border-blue-500 outline-none font-medium leading-relaxed" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Bot Linki (@username)</label>
                                <input type="text" required value={editingBot.bot_link} onChange={e => setEditingBot({...editingBot, bot_link: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-blue-500 outline-none" placeholder="https://t.me/example_bot" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">İkon URL</label>
                                <input type="text" required value={editingBot.icon} onChange={e => setEditingBot({...editingBot, icon: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-blue-500 outline-none" />
                            </div>
                            <button type="submit" className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-3xl text-[10px] tracking-[0.3em] uppercase shadow-2xl shadow-blue-900/30 active:scale-95 transition-all mt-4">KAYITLARI YAYINLA</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Notification Center Module ---
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
                        {history.filter(n => n.target_type === 'global').length === 0 ? <p className="text-slate-700 italic font-bold p-10 text-center">Henüz global bir yayın yapılmadı.</p> : 
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

// --- Announcement Management Module ---
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
                {anns.length === 0 ? <div className="col-span-full py-32 text-center text-slate-700 font-black uppercase tracking-[0.2em] border-2 border-dashed border-slate-900 rounded-[40px]">Aktif kampanya bulunmuyor.</div> : 
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

// --- Settings Management Module ---
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
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => { load(); }, []);
    const load = async () => {
        const data = await DatabaseService.getSettings();
        if (data) setSettings(data);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await DatabaseService.saveSettings(settings);
            localStorage.setItem('maintenance_mode', settings.maintenanceMode.toString());
            alert("Sistem yapılandırması veritabanına başarıyla aktarıldı.");
        } catch (e: any) {
            console.error("Save Settings UI Error:", e);
            alert("Veritabanı kayıt hatası!\nDetay: " + (e.message || "Bilinmeyen hata"));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="animate-in fade-in space-y-12 pb-20">
            <div>
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase italic">SİSTEM <span className="text-blue-500">YAPILANDIRMASI</span></h2>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Platform Çekirdek Parametreleri (Gelişmiş)</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-[#0f172a] border border-slate-800 p-12 rounded-[48px] space-y-10 shadow-2xl">
                    <h3 className="font-black text-lg text-white mb-6 uppercase italic flex items-center gap-4"><Globe size={24} className="text-blue-500"/> Marka & Sosyal Linkler</h3>
                    <div className="space-y-8">
                        <div className="space-y-3"> 
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Uygulama Görünen Adı</label> 
                            <input type="text" value={settings.appName} onChange={e => setSettings({...settings, appName: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all shadow-inner" /> 
                        </div>
                        <div className="space-y-3"> 
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Telegram Destek Kanalı</label> 
                            <input type="text" value={settings.supportLink} onChange={e => setSettings({...settings, supportLink: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all shadow-inner" /> 
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3"> 
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Instagram</label> 
                                <input type="text" value={settings.instagramUrl} onChange={e => setSettings({...settings, instagramUrl: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-blue-500 outline-none" placeholder="@username" /> 
                            </div>
                            <div className="space-y-3"> 
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Haber Kanalı</label> 
                                <input type="text" value={settings.telegramChannelUrl} onChange={e => setSettings({...settings, telegramChannelUrl: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-blue-500 outline-none" placeholder="t.me/kanal" /> 
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#0f172a] border border-slate-800 p-12 rounded-[48px] space-y-10 shadow-2xl">
                    <h3 className="font-black text-lg text-white mb-6 uppercase italic flex items-center gap-4"><Percent size={24} className="text-emerald-500"/> Finansal & Kritik Ayarlar</h3>
                    <div className="space-y-10">
                        <div className="flex items-center justify-between p-8 bg-slate-950 border border-slate-800 rounded-[32px] group">
                            <div> 
                                <p className="text-sm font-black text-white group-hover:text-red-500 transition-colors">BAKIM MODU (MAINTENANCE)</p> 
                                <p className="text-[10px] text-slate-600 font-bold uppercase mt-1">Erişimi kısıtla ve bakım ekranını göster</p> 
                            </div>
                            <button onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})} className={`w-16 h-8 rounded-full relative transition-all shadow-lg ${settings.maintenanceMode ? 'bg-red-600' : 'bg-slate-800'}`}> 
                                <div className={`absolute top-1.5 w-5 h-5 bg-white rounded-full transition-all shadow-inner ${settings.maintenanceMode ? 'left-9' : 'left-2'}`} /> 
                            </button>
                        </div>
                        <div className="space-y-3"> 
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Global Komisyon Oranı (%)</label> 
                            <div className="relative">
                                <input type="number" value={settings.commissionRate} onChange={e => setSettings({...settings, commissionRate: Number((e.target as any).value)})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-emerald-500 outline-none transition-all shadow-inner" /> 
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-700 font-black">%</div>
                            </div>
                        </div>
                        <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-[32px] flex items-start gap-4">
                            <ShieldCheck className="text-blue-500 shrink-0" size={24}/>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed uppercase">Bu ayarlar tüm kullanıcıları ve platform ekonomisini anlık olarak etkiler. Değişiklik yapmadan önce veritabanı yedeklemesini kontrol edin.</p>
                        </div>
                    </div>
                </div>
            </div>

            <button onClick={handleSave} disabled={isSaving} className="w-full py-7 bg-blue-600 hover:bg-blue-500 text-white font-black text-[12px] uppercase tracking-[0.4em] rounded-[32px] shadow-2xl shadow-blue-900/40 transition-all active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50 mt-10"> 
                {isSaving ? <Loader2 className="animate-spin" /> : <ShieldCheck size={22} />} TÜM SİSTEMİ VERİTABANINA YAYINLA
            </button>
        </div>
    );
}

export default AdminDashboard;
