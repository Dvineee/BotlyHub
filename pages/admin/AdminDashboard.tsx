
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
  DollarSign, Edit3, Save, AlertTriangle, Image as ImageIconLucide, PlusSquare
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DatabaseService, supabase } from '../../services/DatabaseService';
import PriceService from '../../services/PriceService';
import { User, Bot as BotType, Announcement, Notification, Channel, ActivityLog, Ad } from '../../types';

const { useNavigate, Routes, Route, Link, useLocation } = Router as any;

const chartData = [
  { name: 'Pzt', users: 400, sales: 240 },
  { name: 'Sal', users: 300, sales: 139 },
  { name: 'Çar', users: 200, sales: 980 },
  { name: 'Per', users: 278, sales: 390 },
  { name: 'Cum', users: 189, sales: 480 },
  { name: 'Cmt', users: 239, sales: 380 },
  { name: 'Paz', users: 349, sales: 430 },
];

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
            alert("Gönderim hatası!");
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

// --- DİĞER MODÜLLER (BASİTLEŞTİRİLMİŞ) ---
const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    useEffect(() => { DatabaseService.getUsers().then(setUsers); }, []);
    return <div className="p-4">Kullanıcı Listesi ({users.length})</div>;
};

const BotManagement = () => {
    const [bots, setBots] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBot, setEditingBot] = useState<any>(null);
    useEffect(() => { load(); }, []);
    const load = async () => setBots(await DatabaseService.getBotsWithStats());
    return (
        <div className="space-y-6">
            <div className="flex justify-between">
                <h2 className="text-xl font-black">BOT ENVANTERİ</h2>
                <button onClick={() => { setEditingBot({ id: '', name: '', description: '', price: 0, category: 'productivity', bot_link: '', screenshots: [] }); setIsModalOpen(true); }} className="bg-blue-600 px-4 py-2 rounded-xl text-xs font-bold">YENİ BOT</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {bots.map(b => (
                    <div key={b.id} className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 flex flex-col gap-4">
                        <h4 className="font-bold">{b.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2">{b.description}</p>
                        <button onClick={() => {setEditingBot(b); setIsModalOpen(true);}} className="bg-white/5 py-2 rounded-lg text-[10px] font-bold">DÜZENLE</button>
                    </div>
                ))}
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6">
                    <div className="bg-[#020617] p-8 rounded-3xl w-full max-w-2xl border border-white/10 overflow-y-auto max-h-[90vh]">
                        <button onClick={() => setIsModalOpen(false)} className="float-right"><X/></button>
                        <h3 className="text-lg font-bold mb-6 italic">BOT DÜZENLE</h3>
                        <form onSubmit={async (e) => { e.preventDefault(); await DatabaseService.saveBot(editingBot); setIsModalOpen(false); load(); }} className="space-y-4">
                            <AdminInput label="BOT ID" value={editingBot.id} onChange={v => setEditingBot({...editingBot, id: v})} />
                            <AdminInput label="BOT İSMİ" value={editingBot.name} onChange={v => setEditingBot({...editingBot, name: v})} />
                            <AdminInput label="TELEGRAM LİNK" value={editingBot.bot_link} onChange={v => setEditingBot({...editingBot, bot_link: v})} />
                            <AdminInput label="FİYAT" value={editingBot.price} type="number" onChange={v => setEditingBot({...editingBot, price: v})} />
                            <AdminInput label="GÖRSELLER (CSV)" value={(editingBot.screenshots || []).join(',')} onChange={v => setEditingBot({...editingBot, screenshots: v.split(',')})} />
                            <textarea value={editingBot.description} onChange={e => setEditingBot({...editingBot, description: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-4 rounded-xl text-xs h-32" />
                            <button type="submit" className="w-full bg-blue-600 py-4 rounded-xl font-bold">KAYDET</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const SalesManagement = () => <div className="p-4">Satış Geçmişi</div>;
const AdsManagement = () => <div className="p-4">Reklam Merkezi</div>;
const AnnouncementCenter = () => <div className="p-4">Duyuru Yönetimi</div>;
const SystemLogs = () => <div className="p-4">Sistem Logları</div>;
const SettingsManagement = () => <div className="p-4">Platform Ayarları</div>;

export default AdminDashboard;
