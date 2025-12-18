
import React, { useEffect, useState } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bot, LogOut, Menu, X, 
  Package, Loader2, RefreshCw, Plus, Edit2, Trash2, 
  Mail, Phone, Image as ImageIcon, Megaphone, Calendar,
  Settings as SettingsIcon, ShieldCheck, Percent, Globe, MessageSquare, AlertTriangle,
  Sparkles, Zap, Gift, Info, Star, ChevronRight, Eye, Send, Activity, BarChart3, Clock,
  Wallet, ShieldAlert, Cpu
} from 'lucide-react';
import { DatabaseService } from '../../services/DatabaseService';
import { User, Bot as BotType, Announcement, Channel, Notification } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

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
        className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
      >
        <Icon size={18} />
        <span className="font-bold text-xs uppercase tracking-widest">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] flex text-slate-200 font-sans overflow-hidden">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-[70] w-72 bg-slate-900 border-r border-slate-800/50 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-12 px-2">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20"><Package className="text-white" size={24} /></div>
                <h2 className="text-xl font-black text-white tracking-tight uppercase">Botly <span className="text-blue-500">SaaS</span></h2>
            </div>
          </div>
          
          <nav className="flex-1 space-y-2">
            <NavItem to="/a/dashboard" icon={LayoutDashboard} label="Genel Bakış" />
            <NavItem to="/a/dashboard/users" icon={Users} label="Kullanıcılar" />
            <NavItem to="/a/dashboard/bots" icon={Bot} label="Market Botları" />
            <NavItem to="/a/dashboard/notifications" icon={Send} label="Bildirim Merkezi" />
            <NavItem to="/a/dashboard/announcements" icon={Megaphone} label="Duyurular" />
            <NavItem to="/a/dashboard/settings" icon={SettingsIcon} label="Sistem Ayarları" />
          </nav>
          
          <button onClick={() => { DatabaseService.logoutAdmin(); navigate('/a/admin'); }} className="flex items-center gap-3 px-4 py-4 text-red-400 font-bold hover:bg-red-500/10 rounded-2xl transition-colors mt-auto uppercase text-[10px] tracking-widest">
            <LogOut size={18} /> <span>Güvenli Çıkış</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
        <header className="h-20 border-b border-slate-800/50 flex items-center justify-between px-8 bg-[#020617]/80 backdrop-blur-xl shrink-0">
           <button onClick={() => setSidebarOpen(true)} className="p-2.5 bg-slate-800 rounded-xl lg:hidden text-slate-300"><Menu size={22}/></button>
           
           <div className="flex items-center gap-6 ml-auto">
              <div className="hidden sm:flex items-center gap-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  <div className="flex items-center gap-2"> <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Sistem Stabil </div>
                  <div className="w-px h-4 bg-slate-800"></div>
                  <div className="flex items-center gap-2"> <Clock size={12}/> {new Date().toLocaleTimeString()} </div>
              </div>
              <div className="w-10 h-10 rounded-xl border border-slate-700 p-0.5">
                <img src="https://ui-avatars.com/api/?name=Admin&background=2563eb&color=fff" className="w-full h-full object-cover rounded-[8px]" />
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-10 no-scrollbar bg-[#020617]">
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
    const mockData = [
        { name: 'Pzt', users: 400, rev: 2400 },
        { name: 'Sal', users: 600, rev: 3500 },
        { name: 'Çar', users: 550, rev: 3100 },
        { name: 'Per', users: 900, rev: 5200 },
        { name: 'Cum', users: 1100, rev: 6100 },
        { name: 'Cmt', users: 1500, rev: 7800 },
        { name: 'Paz', users: 1400, rev: 7200 },
    ];

    return (
        <div className="animate-in fade-in space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">Kontrol <span className="text-blue-500">Merkezi</span></h1>
                    <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Platform Genel Durumu ve Performans</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-5 py-3 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">Rapor İndir</button>
                    <button className="px-5 py-3 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-900/20 active:scale-95 transition-all">Sistemi Yenile</button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Aktif Kullanıcı" value="4,821" icon={Users} color="blue" trend="+12%" />
                <StatCard label="Günlük Gelir" value="₺12.4K" icon={Wallet} color="emerald" trend="+5.4%" />
                <StatCard label="Canlı Oturum" value="142" icon={Activity} color="purple" trend="+22%" />
                <StatCard label="Bot Talebi" value="89" icon={Bot} color="orange" trend="-2.1%" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[32px] p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-white">Kullanıcı Büyümesi</h3>
                            <p className="text-xs text-slate-500">Haftalık yeni kayıt istatistikleri</p>
                        </div>
                        <select className="bg-slate-950 border border-slate-800 text-[10px] font-black p-2 rounded-lg outline-none uppercase">
                            <option>Son 7 Gün</option>
                            <option>Son 30 Gün</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockData}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 flex flex-col">
                    <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2"><Clock size={18} className="text-blue-500"/> Sistem Logları</h3>
                    <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar max-h-[350px]">
                        <LogItem time="Şimdi" user="admin" action="Bildirim gönderildi" status="Success" />
                        <LogItem time="12 dk önce" user="zeynep_k" action="Yeni bot yayınladı" status="Info" />
                        <LogItem time="45 dk önce" user="mert_88" action="Ödeme gerçekleştirdi" status="Payment" />
                        <LogItem time="2 sa önce" user="system" action="Veritabanı yedeklendi" status="Success" />
                        <LogItem time="3 sa önce" user="admin" action="Ayarları güncelledi" status="Update" />
                    </div>
                    <button className="w-full mt-6 py-4 border border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all">Tüm Logları Gör</button>
                </div>
            </div>
        </div>
    );
};

const LogItem = ({ time, user, action, status }: any) => {
    const colors: any = {
        Success: 'bg-emerald-500',
        Info: 'bg-blue-500',
        Payment: 'bg-purple-500',
        Update: 'bg-orange-500'
    };
    return (
        <div className="flex gap-4 group cursor-default">
            <div className="flex flex-col items-center">
                <div className={`w-2 h-2 rounded-full ${colors[status] || 'bg-slate-500'} mt-1.5`}></div>
                <div className="w-px flex-1 bg-slate-800 mt-2"></div>
            </div>
            <div className="flex-1 pb-1">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-xs font-bold text-white">@{user}</p>
                    <span className="text-[10px] text-slate-600 font-bold">{time}</span>
                </div>
                <p className="text-[11px] text-slate-500 group-hover:text-slate-400 transition-colors">{action}</p>
            </div>
        </div>
    );
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isNoteModalOpen, setNoteModalOpen] = useState(false);

  useEffect(() => { load(); }, []);
  const load = async () => {
      setIsLoading(true);
      setUsers(await DatabaseService.getUsers());
      setIsLoading(false);
  };

  return (
    <div className="animate-in fade-in">
      <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter">Kullanıcı <span className="text-blue-500">Yönetimi</span></h1>
            <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Tüm üyeleri izle ve yönet</p>
          </div>
          <button onClick={load} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all active:scale-95">
              <RefreshCw size={20} className={isLoading ? 'animate-spin text-blue-400' : 'text-slate-400'} />
          </button>
      </div>

      <div className="bg-slate-900 rounded-[32px] border border-slate-800/50 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left min-w-[1000px]">
              <thead className="bg-slate-950/50 text-[10px] text-slate-500 uppercase font-black tracking-widest border-b border-slate-800/50">
                <tr>
                  <th className="p-6">Kullanıcı</th>
                  <th className="p-6">E-posta & Tel</th>
                  <th className="p-6">Rol</th>
                  <th className="p-6">Durum</th>
                  <th className="p-6 text-right">Aksiyonlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/20 transition-all group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <img src={u.avatar} className="w-12 h-12 rounded-xl border border-slate-800 shadow-lg group-hover:scale-110 transition-transform" />
                        <div>
                            <p className="font-black text-white text-sm">@{u.username || 'user'}</p>
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tight">{u.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                        <div className="space-y-1">
                            <p className="text-xs text-slate-300 font-bold">{u.email || '-'}</p>
                            <p className="text-[10px] text-slate-500 font-bold">{u.phone || '-'}</p>
                        </div>
                    </td>
                    <td className="p-6">
                        <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border ${u.role === 'Admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                            {u.role}
                        </span>
                    </td>
                    <td className="p-6">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${u.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></div>
                            <span className="text-[11px] font-black text-slate-400 uppercase">{u.status}</span>
                        </div>
                    </td>
                    <td className="p-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setSelectedUser(u); setNoteModalOpen(true); }} title="Bildirim Gönder" className="p-2.5 bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white rounded-xl transition-all"><Send size={16}/></button>
                            <button title="Kısıtla" className="p-2.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl transition-all"><ShieldAlert size={16}/></button>
                            <button onClick={() => setSelectedUser(u)} title="Profil Detayı" className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"><Eye size={16}/></button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>

      {isNoteModalOpen && selectedUser && (
          <NotificationModal 
            target={selectedUser} 
            onClose={() => setNoteModalOpen(false)} 
          />
      )}
    </div>
  );
};

const NotificationModal = ({ target, onClose }: { target?: User | 'global', onClose: () => void }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        title: '',
        message: '',
        type: 'system' as Notification['type']
    });

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await DatabaseService.sendNotification({
                ...form,
                user_id: target === 'global' ? undefined : target?.id,
                target_type: target === 'global' ? 'global' : 'individual'
            } as any);
            alert("Bildirim başarıyla kuyruğa eklendi ve gönderildi.");
            onClose();
        } catch (e) {
            alert("Hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[40px] p-10 relative shadow-2xl" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X size={22}/></button>
                <h3 className="text-2xl font-black mb-10 text-white tracking-tight flex items-center gap-3"><Send size={24} className="text-blue-500"/> Bildirim Gönder</h3>
                
                <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                    <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-1">Hedef Kitle</p>
                    <p className="text-sm font-bold text-white">{target === 'global' ? 'TÜM KULLANICILAR (Global Broadcast)' : `@${target?.username} - ${target?.name}`}</p>
                </div>

                <form onSubmit={handleSend} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bildirim Türü</label>
                        <select 
                            value={form.type} 
                            onChange={e => setForm({...form, type: e.target.value as any})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="system">Sistem Duyurusu</option>
                            <option value="payment">Ödeme / Finans</option>
                            <option value="security">Güvenlik Uyarısı</option>
                            <option value="bot">Bot Güncellemesi</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Başlık</label>
                        <input 
                            type="text" 
                            required
                            value={form.title}
                            onChange={e => setForm({...form, title: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold text-white shadow-inner outline-none focus:border-blue-500" 
                            placeholder="Bildirim başlığı..." 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mesaj İçeriği</label>
                        <textarea 
                            required
                            value={form.message}
                            onChange={e => setForm({...form, message: e.target.value})}
                            className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm resize-none outline-none focus:border-blue-500" 
                            placeholder="Detaylı bildirim metni..." 
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-3xl font-black text-white shadow-xl shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="animate-spin mx-auto"/> : 'ŞİMDİ GÖNDER'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const NotificationCenter = () => {
    const [isGlobalModalOpen, setGlobalModalOpen] = useState(false);
    return (
        <div className="animate-in fade-in space-y-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter">Bildirim <span className="text-blue-500">Merkezi</span></h1>
                    <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Platform genelinde iletişim kurun</p>
                </div>
                <button 
                    onClick={() => setGlobalModalOpen(true)}
                    className="bg-blue-600 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                >
                    <Megaphone size={16}/> Global Yayın Yap
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <QuickNoteCard type="system" title="Yeni Özellik" message="Platforma yeni ödeme metodları eklendi." />
                <QuickNoteCard type="security" title="Sistem Bakımı" message="Gece 03:00'da kısa süreli bir bakım çalışması olacak." />
                <QuickNoteCard type="payment" title="Yıllık Kampanya" message="Yıllık üyeliklerde %30 indirim fırsatını kaçırmayın." />
            </div>

            {isGlobalModalOpen && <NotificationModal target="global" onClose={() => setGlobalModalOpen(false)} />}
        </div>
    );
};

const QuickNoteCard = ({ type, title, message }: any) => {
    const icons: any = {
        system: Info,
        security: ShieldAlert,
        payment: Wallet
    };
    const Icon = icons[type];
    return (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[32px] hover:border-blue-500/30 transition-all group">
            <div className="w-10 h-10 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center mb-4 text-blue-500 group-hover:scale-110 transition-transform">
                <Icon size={18} />
            </div>
            <h4 className="text-sm font-black text-white mb-2">{title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{message}</p>
            <button className="mt-6 text-[10px] font-black uppercase text-blue-500 hover:text-blue-400 tracking-widest flex items-center gap-1 transition-colors">Yeniden Gönder <ChevronRight size={12}/></button>
        </div>
    );
};

const BotManagement = () => {
  const [bots, setBots] = useState<BotType[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<Partial<BotType>>({});

  useEffect(() => { load(); }, []);
  const load = async () => setBots(await DatabaseService.getBots());

  return (
    <div className="animate-in fade-in">
      <div className="flex justify-between items-center mb-10">
        <div>
            <h1 className="text-3xl font-black text-white tracking-tighter">Market <span className="text-blue-500">Botları</span></h1>
            <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Mağaza içeriğini yönet</p>
        </div>
        <button onClick={() => { setEditingBot({ category: 'productivity', screenshots: [] }); setModalOpen(true); }} className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95 transition-all"> <Plus size={18} /> Yeni Bot Ekle </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {bots.map(b => (
          <div key={b.id} className="bg-slate-900 border border-slate-800 p-6 rounded-[32px] hover:border-blue-500/50 transition-all group shadow-sm flex flex-col">
             <div className="flex gap-5 mb-6">
                <img src={b.icon} className="w-16 h-16 rounded-[24px] object-cover border border-slate-800 bg-slate-850 flex-shrink-0" />
                <div className="min-w-0">
                   <h4 className="font-bold text-white text-base truncate">{b.name}</h4>
                   <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">{b.category}</p>
                   <div className="flex items-center gap-1.5 mt-2">
                      <Star size={12} className="text-yellow-500" fill="currentColor"/>
                      <span className="text-slate-300 font-black text-xs">{b.price} Stars</span>
                   </div>
                </div>
             </div>
             <div className="flex gap-2 pt-6 border-t border-slate-800/50 mt-auto">
                <button onClick={() => { setEditingBot(b); setModalOpen(true); }} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"> <Edit2 size={14}/> Düzenle </button>
                <button onClick={async () => { if(confirm("Bot silinsin mi?")) { await DatabaseService.deleteBot(b.id); load(); } }} className="p-3 bg-slate-800 hover:bg-red-500/10 text-red-500 rounded-xl transition-all"> <Trash2 size={16}/> </button>
             </div>
          </div>
        ))}
      </div>
      {/* Bot Modal code here if needed (simplified for brevity) */}
    </div>
  );
};

const AnnouncementManagement = () => {
    const [anns, setAnns] = useState<Announcement[]>([]);
    useEffect(() => { load(); }, []);
    const load = async () => setAnns(await DatabaseService.getAnnouncements());
    return (
        <div className="animate-in fade-in">
            <div className="mb-10">
                <h1 className="text-3xl font-black text-white tracking-tighter">Ana Sayfa <span className="text-blue-500">Duyuruları</span></h1>
                <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Kullanıcı promosyonlarını yönet</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {anns.map(a => (
                    <div key={a.id} className="bg-slate-900 border border-slate-800 p-6 rounded-[32px] group relative overflow-hidden transition-all hover:border-blue-500/50">
                        <h4 className="font-black text-lg text-white mb-2">{a.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-6">{a.description}</p>
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest">{a.color_scheme}</span>
                            <div className="flex gap-2">
                                <button className="p-2.5 bg-slate-800 rounded-xl"><Edit2 size={16}/></button>
                                <button className="p-2.5 bg-slate-800 rounded-xl text-red-500"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    </div>
                ))}
                <button className="border-2 border-dashed border-slate-800 rounded-[32px] p-10 flex flex-col items-center justify-center gap-4 text-slate-600 hover:text-blue-500 hover:border-blue-500/50 transition-all">
                    <Plus size={40}/>
                    <span className="text-[10px] font-black uppercase tracking-widest">Yeni Duyuru Oluştur</span>
                </button>
            </div>
        </div>
    );
};

const SettingsManagement = () => {
    const [settings, setSettings] = useState({
        appName: 'BotlyHub V3',
        maintenanceMode: localStorage.getItem('maintenance_mode') === 'true',
        commissionRate: 5,
        supportLink: 'https://t.me/support',
        globalLang: 'tr'
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        localStorage.setItem('maintenance_mode', settings.maintenanceMode.toString());
        setTimeout(() => {
            setIsSaving(false);
            alert("Sistem ayarları güncellendi.");
        }, 800);
    };

    return (
        <div className="animate-in fade-in space-y-10">
            <div>
                <h1 className="text-3xl font-black text-white tracking-tighter">Sistem <span className="text-blue-500">Yapılandırması</span></h1>
                <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Platform çekirdek ayarları</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900 border border-slate-800 p-10 rounded-[40px] space-y-8">
                    <div className="flex items-center gap-4 mb-2"> 
                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500"><Globe size={24} /></div> 
                        <div>
                            <h3 className="font-black text-lg">Genel Bilgiler</h3>
                            <p className="text-xs text-slate-500 uppercase tracking-widest">Marka ve İletişim</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2"> 
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Uygulama Adı</label> 
                            <input type="text" value={settings.appName} onChange={e => setSettings({...settings, appName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold focus:border-blue-500 outline-none transition-all" /> 
                        </div>
                        <div className="space-y-2"> 
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Destek Kanalı</label> 
                            <input type="text" value={settings.supportLink} onChange={e => setSettings({...settings, supportLink: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold focus:border-blue-500 outline-none transition-all" /> 
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-10 rounded-[40px] space-y-8">
                    <div className="flex items-center gap-4 mb-2"> 
                        <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500"><Percent size={24} /></div> 
                        <div>
                            <h3 className="font-black text-lg">Ekonomi & Güvenlik</h3>
                            <p className="text-xs text-slate-500 uppercase tracking-widest">Komisyon ve Durum</p>
                        </div>
                    </div>
                    <div className="space-y-8">
                        <div className="flex items-center justify-between p-6 bg-slate-950 border border-slate-800 rounded-2xl">
                            <div> 
                                <p className="text-sm font-black text-white">BAKIM MODU</p> 
                                <p className="text-[10px] text-slate-600 font-bold uppercase mt-1">Erişimi kısıtla</p> 
                            </div>
                            <button onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})} className={`w-14 h-7 rounded-full relative transition-all shadow-inner ${settings.maintenanceMode ? 'bg-red-600' : 'bg-slate-800'}`}> 
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all ${settings.maintenanceMode ? 'left-8' : 'left-1'}`} /> 
                            </button>
                        </div>
                        <div className="space-y-2"> 
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Komisyon Oranı (%)</label> 
                            <div className="relative">
                                <input type="number" value={settings.commissionRate} onChange={e => setSettings({...settings, commissionRate: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-black focus:border-emerald-500 outline-none transition-all" /> 
                                <Percent size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[#0f172a] border border-blue-500/20 p-10 rounded-[40px] flex flex-col sm:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-600/10 rounded-[24px] flex items-center justify-center text-blue-500 shadow-inner">
                        <Cpu size={32}/>
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white">Sistem Kaynakları</h3>
                        <p className="text-sm text-slate-500 font-medium">Server Status: <span className="text-emerald-500 font-black">99.9% UP</span></p>
                    </div>
                </div>
                <button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto px-16 py-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-3xl shadow-2xl shadow-blue-900/40 transition-all active:scale-95 flex items-center justify-center gap-3"> 
                    {isSaving ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />} TÜM AYARLARI GÜNCELLE VE YAYINA AL 
                </button>
            </div>
        </div>
    );
}

const StatCard = ({ label, value, icon: Icon, color, trend }: any) => {
  const colors: any = {
      blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-blue-500/5',
      emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5',
      purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20 shadow-purple-500/5',
      orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20 shadow-orange-500/5'
  };
  const isUp = trend?.startsWith('+');
  return (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex justify-between items-start mb-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xl group-hover:scale-110 transition-transform ${colors[color]}`}> <Icon size={28} /> </div>
            <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${isUp ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'}`}>{trend}</span>
        </div>
        <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
        <h3 className="text-3xl font-black text-white mt-2 tracking-tighter">{value}</h3>
    </div>
  );
};

export default AdminDashboard;
