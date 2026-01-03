
import React, { useEffect, useState, useMemo } from 'react';
import * as Router from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bot, LogOut, Menu, X, 
  Loader2, RefreshCw, Plus, Trash2, 
  Megaphone, Settings as SettingsIcon, 
  ShieldCheck, Globe, Send, Activity, 
  Wallet, ShieldAlert, Cpu, Ban, CheckCircle, 
  Search, Database, Hash, Wand2, History,
  Mail, BellRing, Sparkles, Eye, Zap, RefreshCcw, Star, Calendar, MessageSquare, ExternalLink, Layers, PlusCircle, Link2,
  Fingerprint, Info, TrendingUp, BarChart3, Radio,
  Layout, MousePointer2, Target, Bell, CheckCircle2, ChevronRight,
  DollarSign, Edit3, Save, AlertTriangle, Image as ImageIconLucide, PlusSquare, Heart, Shield, Gift
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DatabaseService, supabase } from '../../services/DatabaseService';
import PriceService from '../../services/PriceService';
import { User, Bot as BotType, Announcement, Notification, Channel, ActivityLog, Ad } from '../../types';

const { useNavigate, Routes, Route, Link, useLocation } = Router as any;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!DatabaseService.isAdminLoggedIn()) navigate('/a/admin');
  }, [navigate]);

  const NavItem = ({ to, icon: Icon, label }: any) => {
    const active = location.pathname === to || (to !== '/a/dashboard' && location.pathname.startsWith(to));
    return (
      <Link 
        to={to} 
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-4 px-6 py-4 rounded-[20px] transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}
      >
        <Icon size={20} />
        <span className="font-bold text-[11px] uppercase tracking-widest">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] flex text-slate-200 overflow-hidden font-sans">
      {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[65] lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      <aside className={`fixed inset-y-0 left-0 z-[70] w-72 bg-[#020617] border-r border-white/5 transition-transform duration-500 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-4 mb-12 px-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg"><Database size={20} className="text-white"/></div>
            <div>
                <h2 className="text-lg font-black text-white italic tracking-tighter uppercase leading-none">Botly<span className="text-blue-500">Hub</span></h2>
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] mt-1 block">YÖNETİM PANELİ</span>
            </div>
          </div>
          
          <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
            <NavItem to="/a/dashboard" icon={LayoutDashboard} label="Genel Bakış" />
            <div className="pt-6 pb-2 px-6"><span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">Kullanıcılar</span></div>
            <NavItem to="/a/dashboard/users" icon={Users} label="Üye Listesi" />
            <NavItem to="/a/dashboard/sales" icon={Wallet} label="Satışlar" />
            
            <div className="pt-6 pb-2 px-6"><span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">İçerik</span></div>
            <NavItem to="/a/dashboard/bots" icon={Bot} label="Market Botları" />
            <NavItem to="/a/dashboard/ads" icon={Radio} label="Reklamlar" />
            <NavItem to="/a/dashboard/announcements" icon={Megaphone} label="Duyurular" />
            <NavItem to="/a/dashboard/notifications" icon={Bell} label="Bildirim Gönder" />
            
            <div className="pt-6 pb-2 px-6"><span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">Sistem</span></div>
            <NavItem to="/a/dashboard/logs" icon={Activity} label="Sistem Logları" />
            <NavItem to="/a/dashboard/settings" icon={SettingsIcon} label="Ayarlar" />
          </nav>

          <button onClick={() => { DatabaseService.logoutAdmin(); navigate('/a/admin'); }} className="mt-6 flex items-center gap-4 px-6 py-4 text-red-500 font-bold text-[11px] uppercase tracking-widest hover:bg-red-500/10 rounded-[20px] transition-all group">
            <LogOut size={18} /> Oturumu Kapat
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#020617]/80 backdrop-blur-xl z-50">
           <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-3 bg-slate-900 border border-white/5 rounded-xl text-slate-400"><Menu size={20}/></button>
           
           <div className="flex items-center gap-4 ml-auto">
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Sistem Aktif</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center font-black text-white italic">A</div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 no-scrollbar">
          <div className="max-w-6xl mx-auto space-y-10">
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/bots" element={<BotManagement />} />
              <Route path="/sales" element={<SalesManagement />} />
              <Route path="/ads" element={<AdsManagement />} />
              <Route path="/announcements" element={<AnnouncementCenter />} />
              <Route path="/notifications" element={<AdminNotifications />} />
              <Route path="/logs" element={<SystemLogs />} />
              <Route path="/settings" element={<SettingsManagement />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
};

const HomeView = () => {
    const [stats, setStats] = useState({ userCount: 0, botCount: 0, logCount: 0, salesCount: 0 });
    useEffect(() => {
        DatabaseService.getAdminStats().then(data => setStats(data));
    }, []);

    const StatCard = ({ label, value, icon: Icon, color }: any) => (
        <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[32px] hover:border-blue-500/30 transition-all relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 -mr-8 -mt-8 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all"></div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 border border-white/5 ${color}`}>
                <Icon size={22} />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{value}</h3>
        </div>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Panel <span className="text-blue-500">Özeti</span></h1>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Toplam Üye" value={stats.userCount} icon={Users} color="text-blue-500" />
                <StatCard label="Aktif Botlar" value={stats.botCount} icon={Bot} color="text-purple-500" />
                <StatCard label="Toplam Satış" value={stats.salesCount} icon={Wallet} color="text-emerald-500" />
                <StatCard label="İşlem Kaydı" value={stats.logCount} icon={Activity} color="text-orange-500" />
            </div>
        </div>
    );
};

// --- ANNOUNCEMENT CENTER MODULE ---
const AnnouncementCenter = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnn, setEditingAnn] = useState<any>(null);

    const load = async () => {
        setIsLoading(true);
        const data = await DatabaseService.getAnnouncements();
        setAnnouncements(data);
        setIsLoading(false);
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) return;
        try {
            await DatabaseService.deleteAnnouncement(id);
            load();
        } catch (e) { alert('Silme hatası!'); }
    };

    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>;

    const colors: Record<string, string> = {
        purple: 'bg-gradient-to-br from-[#6366f1] to-[#a855f7]',
        emerald: 'bg-gradient-to-br from-[#10b981] to-[#34d399]',
        blue: 'bg-gradient-to-br from-[#3b82f6] to-[#60a5fa]',
        orange: 'bg-gradient-to-br from-[#f59e0b] to-[#ef4444]'
    };

    // Fix: Using 'Bot' icon from lucide-react instead of 'BotType' interface.
    const iconMap: Record<string, any> = { Sparkles, Megaphone, Zap, Gift, Star, Info, Bot, Heart, Bell, Shield };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Duyuru <span className="text-purple-500">Yönetimi</span></h2>
                <button 
                  onClick={() => { setEditingAnn({ id: '', title: '', description: '', button_text: 'İncele', button_link: '', icon_name: 'Megaphone', color_scheme: 'purple', is_active: true, action_type: 'link', content_detail: '' }); setIsModalOpen(true); }}
                  className="bg-purple-600 hover:bg-purple-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-3 transition-all active:scale-95"
                >
                    <PlusSquare size={18}/> YENİ DUYURU YARAT
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {announcements.map(ann => (
                    <div key={ann.id} className="bg-slate-900/40 border border-white/5 rounded-[40px] p-8 flex flex-col gap-6 relative group overflow-hidden">
                        <div className="flex justify-between items-start">
                             <div className={`p-4 rounded-2xl ${colors[ann.color_scheme] || colors.purple} shadow-lg shadow-black/20`}>
                                {React.createElement(iconMap[ann.icon_name] || Megaphone, { size: 24, className: 'text-white' })}
                             </div>
                             <div className="flex gap-2">
                                <button onClick={() => { setEditingAnn(ann); setIsModalOpen(true); }} className="p-3 bg-white/5 hover:bg-blue-600 rounded-xl transition-all"><Edit3 size={18}/></button>
                                <button onClick={() => handleDelete(ann.id)} className="p-3 bg-white/5 hover:bg-red-600 rounded-xl transition-all text-red-500 hover:text-white"><Trash2 size={18}/></button>
                             </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-xl font-black text-white italic tracking-tighter uppercase">{ann.title}</h4>
                                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${ann.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {ann.is_active ? 'AKTİF' : 'PASİF'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">{ann.description}</p>
                        </div>
                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Aksiyon: {ann.action_type}</span>
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">{ann.color_scheme} tema</span>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6 backdrop-blur-md">
                    <div className="bg-[#020617] p-12 rounded-[56px] w-full max-w-3xl border border-white/10 overflow-y-auto max-h-[90vh] shadow-2xl relative scrollbar-hide">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-3 bg-white/5 rounded-2xl hover:bg-red-600 transition-all"><X size={20}/></button>
                        <h3 className="text-2xl font-black mb-10 italic uppercase tracking-tighter text-purple-500">Duyuru Yapılandırma</h3>
                        
                        <form onSubmit={async (e) => { e.preventDefault(); await DatabaseService.saveAnnouncement(editingAnn); setIsModalOpen(false); load(); }} className="space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <AdminInput label="DUYURU BAŞLIĞI" value={editingAnn.title} onChange={(v: string) => setEditingAnn({...editingAnn, title: v})} />
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">RENK ŞEMASI</label>
                                    <select value={editingAnn.color_scheme} onChange={e => setEditingAnn({...editingAnn, color_scheme: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-[11px] font-black text-white outline-none">
                                        <option value="purple">Modern Mor</option>
                                        <option value="emerald">Canlı Yeşil</option>
                                        <option value="blue">Okyanus Mavisi</option>
                                        <option value="orange">Ateş Turuncusu</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Kısa Açıklama (Kart Üzeri)</label>
                                <textarea value={editingAnn.description} onChange={e => setEditingAnn({...editingAnn, description: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-6 rounded-3xl text-xs font-medium text-slate-400 h-24 focus:border-purple-500/50 outline-none" />
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <AdminInput label="BUTON METNİ" value={editingAnn.button_text} onChange={(v: string) => setEditingAnn({...editingAnn, button_text: v})} />
                                <AdminInput label="BUTON LİNKİ (@user, /path, http...)" value={editingAnn.button_link} onChange={(v: string) => setEditingAnn({...editingAnn, button_link: v})} />
                            </div>

                            <div className="grid grid-cols-3 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">İKON</label>
                                    <select value={editingAnn.icon_name} onChange={e => setEditingAnn({...editingAnn, icon_name: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-[11px] font-black text-white outline-none">
                                        {Object.keys(iconMap).map(k => <option key={k} value={k}>{k}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">AKSİYON TİPİ</label>
                                    <select value={editingAnn.action_type} onChange={e => setEditingAnn({...editingAnn, action_type: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-[11px] font-black text-white outline-none">
                                        <option value="link">Doğrudan Link</option>
                                        <option value="popup">Pop-up Bilgi</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">DURUM</label>
                                    <button type="button" onClick={() => setEditingAnn({...editingAnn, is_active: !editingAnn.is_active})} className={`w-full h-[54px] rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${editingAnn.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {editingAnn.is_active ? 'YAYINDA' : 'PASİF'}
                                    </button>
                                </div>
                            </div>

                            {editingAnn.action_type === 'popup' && (
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Pop-up Detay Metni</label>
                                    <textarea value={editingAnn.content_detail} onChange={e => setEditingAnn({...editingAnn, content_detail: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-6 rounded-3xl text-xs font-medium text-slate-400 h-40 focus:border-purple-500/50 outline-none" />
                                </div>
                            )}
                            
                            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 py-6 rounded-[32px] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-purple-600/30">DUYURUYU KAYDET</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- ADMIN NOTIFICATIONS MODULE ---
const AdminNotifications = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState<Notification['type']>('system');
    const [isSending, setIsSending] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !message) return;
        setIsSending(true);
        try {
            await DatabaseService.sendGlobalNotification(title, message, type);
            alert("Bildirim tüm kullanıcılara gönderildi.");
            setTitle('');
            setMessage('');
        } catch (e) {
            alert("Gönderim hatası! Lütfen console üzerinden detayı inceleyin.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Bildirim <span className="text-blue-600">Merkezi</span></h2>
            <div className="bg-slate-900/40 border border-white/5 p-12 rounded-[56px] shadow-2xl">
                <form onSubmit={handleSend} className="max-w-2xl space-y-8">
                    <AdminInput label="BİLDİRİM BAŞLIĞI" value={title} onChange={setTitle} />
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Detaylı Mesaj</label>
                        <textarea 
                            value={message} 
                            onChange={e => setMessage(e.target.value)} 
                            className="w-full bg-slate-950 border border-white/5 rounded-3xl p-6 text-[11px] font-medium text-slate-400 h-40 resize-none outline-none focus:border-blue-600/50" 
                            placeholder="Kullanıcıların pop-up ekranında göreceği metin..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Bildirim Tipi</label>
                            <select 
                                value={type}
                                onChange={e => setType(e.target.value as any)}
                                className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-[11px] font-black text-white outline-none appearance-none cursor-pointer"
                            >
                                <option value="system">Sistem</option>
                                <option value="bot">Bot Güncellemesi</option>
                                <option value="payment">Ödeme/Kampanya</option>
                                <option value="security">Güvenlik</option>
                            </select>
                        </div>
                        <button 
                            type="submit" 
                            disabled={isSending}
                            className="mt-auto h-[54px] bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {isSending ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                            GLOBAL YAYINLA
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminInput = ({ label, value, onChange, type = "text" }: any) => (
    <div className="space-y-2">
        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">{label}</label>
        <input 
            type={type} 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-[11px] font-black text-white outline-none focus:border-blue-600/50" 
        />
    </div>
);

// --- RESTORED MODULES ---
const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { 
        DatabaseService.getUsers().then(data => {
            setUsers(data);
            setIsLoading(false);
        }); 
    }, []);

    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-black">ÜYE YÖNETİMİ</h2>
            <div className="bg-slate-900/50 border border-white/5 rounded-3xl overflow-hidden">
                <table className="w-full text-left text-xs">
                    <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-slate-500">
                        <tr>
                            <th className="px-6 py-4">Kullanıcı</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Durum</th>
                            <th className="px-6 py-4">Tarih</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <img src={u.avatar} className="w-8 h-8 rounded-full border border-white/10" />
                                    <div>
                                        <p className="font-bold text-white">{u.name}</p>
                                        <p className="text-[10px] text-slate-500">@{u.username}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded-lg">{u.role}</span></td>
                                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-lg ${u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>{u.status}</span></td>
                                <td className="px-6 py-4 text-slate-500">{new Date(u.joinDate).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const BotManagement = () => {
    const [bots, setBots] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBot, setEditingBot] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { load(); }, []);
    
    const load = async () => {
        setIsLoading(true);
        const data = await DatabaseService.getBotsWithStats();
        setBots(data);
        setIsLoading(false);
    };

    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-black italic tracking-tighter">BOT ENVANTERİ</h2>
                <button 
                  onClick={() => { setEditingBot({ id: '', name: '', description: '', price: 0, category: 'productivity', bot_link: '', screenshots: [], icon: '' }); setIsModalOpen(true); }} 
                  className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2"
                >
                    <Plus size={16}/> YENİ BOT EKLE
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bots.map(b => (
                    <div key={b.id} className="bg-slate-900/50 p-8 rounded-[32px] border border-white/5 flex flex-col gap-5 hover:border-blue-500/30 transition-all group">
                        <div className="flex items-center gap-4">
                            <img src={b.icon || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.name)}`} className="w-12 h-12 rounded-2xl border border-white/10" />
                            <div>
                                <h4 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">{b.name}</h4>
                                <p className="text-[10px] text-slate-500 uppercase font-black">{b.category}</p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{b.description}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                            <span className="text-sm font-black text-emerald-500">{b.price} TL</span>
                            <div className="flex gap-2">
                                <button onClick={() => {setEditingBot(b); setIsModalOpen(true);}} className="p-2 bg-white/5 hover:bg-blue-600 rounded-xl transition-all"><Edit3 size={16}/></button>
                                <button onClick={async () => { if(confirm('Emin misiniz?')) { await DatabaseService.deleteBot(b.id); load(); } }} className="p-2 bg-white/5 hover:bg-red-600 rounded-xl transition-all text-red-500 hover:text-white"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6 backdrop-blur-md">
                    <div className="bg-[#020617] p-10 rounded-[48px] w-full max-w-2xl border border-white/10 overflow-y-auto max-h-[90vh] shadow-2xl relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-3 bg-white/5 rounded-2xl hover:bg-red-600 transition-all"><X size={20}/></button>
                        <h3 className="text-xl font-black mb-10 italic uppercase tracking-tighter text-blue-500">Bot Bilgilerini Düzenle</h3>
                        
                        <form onSubmit={async (e) => { e.preventDefault(); await DatabaseService.saveBot(editingBot); setIsModalOpen(false); load(); }} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <AdminInput label="BOT ID" value={editingBot.id} onChange={(v: string) => setEditingBot({...editingBot, id: v})} />
                                <AdminInput label="BOT İSMİ" value={editingBot.name} onChange={(v: string) => setEditingBot({...editingBot, name: v})} />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                {/* Fix: Changed 'editingAnn.category' to 'editingBot.category' to resolve the 'Cannot find name' error. */}
                                <AdminInput label="KATEGORİ" value={editingBot.category} onChange={(v: string) => setEditingBot({...editingBot, category: v})} />
                                <AdminInput label="FİYAT (TL)" value={editingBot.price} type="number" onChange={(v: string) => setEditingBot({...editingBot, price: v})} />
                            </div>
                            <AdminInput label="TELEGRAM LİNK" value={editingBot.bot_link} onChange={(v: string) => setEditingBot({...editingBot, bot_link: v})} />
                            <AdminInput label="ICON URL" value={editingBot.icon} onChange={(v: string) => setEditingBot({...editingBot, icon: v})} />
                            <AdminInput label="GÖRSELLER (CSV)" value={(editingBot.screenshots || []).join(',')} onChange={(v: string) => setEditingBot({...editingBot, screenshots: v.split(',')})} />
                            
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Bot Açıklaması</label>
                                <textarea 
                                  value={editingBot.description} 
                                  onChange={e => setEditingBot({...editingBot, description: e.target.value})} 
                                  className="w-full bg-slate-950 border border-white/5 p-6 rounded-3xl text-xs font-medium text-slate-400 h-32 focus:border-blue-500/50 outline-none" 
                                />
                            </div>
                            
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-3xl font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-blue-600/30">DEĞİŞİKLİKLERİ KAYDET</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const SalesManagement = () => {
    const [sales, setSales] = useState<any[]>([]);
    useEffect(() => { DatabaseService.getAllPurchases().then(setSales); }, []);
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-black italic tracking-tighter uppercase">Satış Geçmişi</h2>
            <div className="bg-slate-900/50 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <table className="w-full text-left text-xs">
                    <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-slate-500 font-black">
                        <tr>
                            <th className="px-6 py-4 italic">Kullanıcı</th>
                            <th className="px-6 py-4 italic">Alınan Bot</th>
                            <th className="px-6 py-4 italic">Tarih</th>
                            <th className="px-6 py-4 italic text-right">Tutar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium">
                        {sales.map((s, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 text-slate-300">@{s.users?.username || 'Anonim'}</td>
                                <td className="px-6 py-4 text-white font-bold">{s.bots?.name || 'Bilinmiyor'}</td>
                                <td className="px-6 py-4 text-slate-500">{new Date(s.acquired_at).toLocaleString()}</td>
                                <td className="px-6 py-4 text-right text-emerald-500 font-black italic">{s.bots?.price || 0} TL</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AdsManagement = () => <div className="p-12 text-center text-slate-500 font-bold uppercase tracking-widest italic opacity-40">Reklam Merkezi Çok Yakında</div>;
const SystemLogs = () => <div className="p-12 text-center text-slate-500 font-bold uppercase tracking-widest italic opacity-40">Sistem Kayıtları Arşivi</div>;
const SettingsManagement = () => <div className="p-12 text-center text-slate-500 font-bold uppercase tracking-widest italic opacity-40">Sistem Konfigürasyonu</div>;

export default AdminDashboard;
