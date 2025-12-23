

import React, { useEffect, useState } from 'react';
import * as Router from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bot, LogOut, Menu, X, 
  Loader2, RefreshCw, Plus, Trash2, 
  Megaphone, Settings as SettingsIcon, 
  ShieldCheck, Globe, Send, Activity, 
  Wallet, ShieldAlert, Cpu, Ban, CheckCircle, 
  Search, Database, Hash, Wand2, Image as ImageIcon, History,
  Mail, BellRing, Sparkles, Eye, Zap, RefreshCcw, Star, Calendar, MessageSquare, ExternalLink, Layers, PlusCircle, Link2,
  Fingerprint, Info, TrendingUp, BarChart3, Radio
} from 'lucide-react';
import { DatabaseService, supabase } from '../../services/DatabaseService';
import { User, Bot as BotType, Announcement, Notification, Channel, ActivityLog, Ad } from '../../types';

const { useNavigate, Routes, Route, Link, useLocation } = Router as any;

// Fix: Added StatCard component to resolve "Cannot find name 'StatCard'" errors in dashboard views.
const StatCard = ({ label, value, icon: Icon, color }: any) => {
  const colors: Record<string, string> = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  };
  
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-[32px] shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border ${colors[color] || colors.blue}`}>
        <Icon size={24} />
      </div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
      <h3 className="text-2xl font-black text-white mt-1 italic tracking-tighter uppercase">{value}</h3>
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform pointer-events-none">
        <Icon size={100} />
      </div>
    </div>
  );
};

// Fix: Added LogItem component to resolve "Cannot find name 'LogItem'" errors in HomeView.
const LogItem = ({ log }: { log: any }) => {
  return (
    <div className="flex items-center gap-4 p-4 hover:bg-slate-800/50 rounded-2xl transition-all border border-transparent hover:border-slate-800 group">
      <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center shrink-0 border border-slate-800">
        <Activity size={18} className="text-blue-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-tight truncate">
            {log.users?.username ? `@${log.users.username}` : 'Sistem'} • {log.title}
          </h4>
          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter whitespace-nowrap">
            {new Date(log.created_at).toLocaleTimeString()}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">{log.description}</p>
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
            <NavItem to="/a/dashboard/ads" icon={Radio} label="Reklam Yayınları" />
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
              Sistem Durumu: Çevrimiçi
           </div>
           <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white shadow-lg italic border border-white/10">A</div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 no-scrollbar bg-[#020617]">
          <div className="max-w-[1400px] mx-auto pb-20">
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/ads" element={<AdsManagement />} />
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

// --- REKLAM YÖNETİMİ BİLEŞENİ ---

const AdsManagement = () => {
    const [ads, setAds] = useState<Ad[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '', image_url: '' });

    useEffect(() => { loadAds(); }, []);

    const loadAds = async () => {
        setIsLoading(true);
        const data = await DatabaseService.getAds();
        setAds(data);
        setIsLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await DatabaseService.createAd(formData);
            setFormData({ title: '', content: '', image_url: '' });
            setIsModalOpen(false);
            loadAds();
            alert("Reklam sıraya alındı! Bot tarafından otomatik olarak gönderilecektir.");
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Reklam Yayınları</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Botlar üzerinden yönetilen kanallara reklam servis edin.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 rounded-2xl text-xs font-black text-white flex items-center gap-3 shadow-xl active:scale-95 transition-all">
                    <Plus size={18}/> YENİ REKLAM OLUŞTUR
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Toplam Yayın" value={ads.length} icon={Radio} color="blue" />
                <StatCard label="Bekleyenler" value={ads.filter(a => a.status === 'pending').length} icon={RefreshCw} color="purple" />
                <StatCard label="Toplam Erişim" value={ads.reduce((acc, curr) => acc + curr.total_reach, 0).toLocaleString()} icon={TrendingUp} color="emerald" />
                <StatCard label="Aktif Kanallar" value={ads.reduce((acc, curr) => acc + curr.channel_count, 0)} icon={Megaphone} color="orange" />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/50 border-b border-slate-800 text-slate-600 font-bold uppercase">
                        <tr>
                            <th className="px-6 py-5">Reklam Başlığı</th>
                            <th className="px-6 py-5">Durum</th>
                            <th className="px-6 py-5">Erişim (Reach)</th>
                            <th className="px-6 py-5">Kanal Sayısı</th>
                            <th className="px-6 py-5 text-right">Aksiyon</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {ads.map(ad => (
                            <tr key={ad.id} className="hover:bg-slate-800/20 transition-colors">
                                <td className="px-6 py-5">
                                    <p className="font-bold text-white">{ad.title}</p>
                                    <p className="text-[9px] text-slate-500 mt-1 uppercase">{new Date(ad.created_at).toLocaleDateString()}</p>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`px-2 py-1 rounded-md font-black text-[9px] uppercase border ${
                                        ad.status === 'pending' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                        ad.status === 'sent' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                        'bg-red-500/10 text-red-400 border-red-500/20'
                                    }`}>
                                        {ad.status === 'pending' ? 'SIRADA' : ad.status === 'sent' ? 'YAYINLANDI' : 'HATA'}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp size={14} className="text-emerald-500" />
                                        <span className="font-black text-white">{ad.total_reach.toLocaleString()}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 font-bold text-slate-400">{ad.channel_count} Kanal</td>
                                <td className="px-6 py-5 text-right">
                                    <button onClick={async () => { if(confirm("Sileyim mi?")) { await DatabaseService.deleteAd(ad.id); loadAds(); } }} className="p-3 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-xl transition-all"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {ads.length === 0 && <div className="p-20 text-center text-slate-600 font-bold uppercase text-[10px]">Henüz reklam kaydı bulunmuyor.</div>}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in">
                    <div className="bg-[#020617] w-full max-w-2xl rounded-[32px] border border-slate-800 p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Reklam Oluştur</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-900 rounded-lg text-slate-500"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Reklam Başlığı</label>
                                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-blue-500" placeholder="Yaz İndirimi Duyurusu" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Görsel URL (Opsiyonel)</label>
                                <input type="text" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-blue-500" placeholder="https://..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Reklam İçeriği (Markdown Destekli)</label>
                                <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full h-40 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-medium text-slate-300 outline-none focus:border-blue-500 resize-none leading-relaxed" placeholder="Reklam metni buraya..." />
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.4em] shadow-xl transition-all flex items-center justify-center gap-3">
                                {isLoading ? <Loader2 className="animate-spin" size={20}/> : <><Send size={18} /> YAYINI BAŞLAT</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- DİĞER BİLEŞENLER ---
const HomeView = () => {
    const [stats, setStats] = useState({ userCount: 0, botCount: 0, logCount: 0, salesCount: 0 });
    const [combinedLogs, setCombinedLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { load(); }, []);

    const load = async () => {
        setIsLoading(true);
        try {
            const statData = await DatabaseService.getAdminStats();
            setStats(statData);
            const { data: logs } = await supabase.from('activity_logs').select('*, users(username, avatar)').order('created_at', { ascending: false }).limit(10);
            setCombinedLogs(logs || []);
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    return (
        <div className="animate-in fade-in space-y-8">
            <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Komuta <span className="text-blue-500">Paneli</span></h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Platform Üyesi" value={stats.userCount} icon={Users} color="blue" />
                <StatCard label="Aktif Botlar" value={stats.botCount} icon={Bot} color="purple" />
                <StatCard label="Kütüphane Kaydı" value={stats.salesCount} icon={Wallet} color="emerald" />
                <StatCard label="Denetim Kaydı" value={stats.logCount} icon={Activity} color="orange" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10"><ShieldCheck size={16} className="text-blue-500" /> Audit Log (Son İşlemler)</h3>
                <div className="space-y-1 relative z-10">
                    {isLoading ? <div className="py-20 text-center text-slate-700 animate-pulse font-bold uppercase text-xs">Yükleniyor...</div> : 
                    combinedLogs.map(log => <LogItem key={log.id} log={log} />)}
                </div>
            </div>
        </div>
    );
};

const SalesManagement = () => {
    const [sales, setSales] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => { load(); }, []);
    const load = async () => { setIsLoading(true); setSales(await DatabaseService.getAllPurchases()); setIsLoading(false); };
    return (
        <div className="animate-in fade-in space-y-6">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Envanter Hareketleri</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/50 border-b border-slate-800 text-slate-600 font-bold uppercase">
                        <tr><th className="px-6 py-5">Üye</th><th className="px-6 py-5">Bot</th><th className="px-6 py-5 text-right">Tarih</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {sales.map((s, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/20 transition-colors"><td className="px-6 py-5">@{s.users?.username}</td><td className="px-6 py-5 font-bold">{s.bots?.name}</td><td className="px-6 py-5 text-right">{new Date(s.acquired_at).toLocaleDateString()}</td></tr>
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
    const [editingBot, setEditingBot] = useState<Partial<BotType> | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => { load(); }, []);
    const load = async () => { setBots(await DatabaseService.getBotsWithStats()); };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBot?.id) return alert("Bot ID gereklidir.");
        setIsLoading(true);
        try {
            await DatabaseService.saveBot(editingBot!);
            setIsModalOpen(false);
            load();
            alert("Sistem başarıyla güncellendi!");
        } catch (err: any) {
            console.error("Bot kaydetme hatası:", err);
            alert("Kayıt başarısız! " + (err.message || 'Supabase Connection Error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleTelegramUsernameChange = (val: string) => {
        const username = val.replace('@', '').trim();
        const tgLink = username ? `@${username}` : '';
        setEditingBot(prev => ({ ...prev, bot_link: tgLink }));
    };

    const addScreenshot = () => {
        const screens = [...(editingBot?.screenshots || [])];
        screens.push("");
        setEditingBot({ ...editingBot, screenshots: screens });
    };

    const updateScreenshot = (index: number, val: string) => {
        const screens = [...(editingBot?.screenshots || [])];
        screens[index] = val;
        setEditingBot({ ...editingBot, screenshots: screens });
    };

    const removeScreenshot = (index: number) => {
        const screens = (editingBot?.screenshots || []).filter((_, i) => i !== index);
        setEditingBot({ ...editingBot, screenshots: screens });
    };

    return (
        <div className="animate-in fade-in space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Market Yönetimi</h2>
                </div>
                <button onClick={() => { setEditingBot({ id: 'bot_' + Math.random().toString(36).substr(2, 5), name: '', description: '', price: 0, category: 'productivity', bot_link: '', screenshots: [] }); setIsModalOpen(true); }} className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-500 rounded-2xl text-xs font-black text-white flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
                    <Plus size={18}/> YENİ BOT OLUŞTUR
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {bots.map(b => (
                    <div key={b.id} className="bg-slate-900 border border-slate-800 p-6 rounded-[32px] hover:border-slate-700 transition-all shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 flex flex-col items-end gap-1">
                            <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-tighter ${b.price > 0 ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                {b.price > 0 ? 'PREMIUM' : 'ÜCRETSİZ'}
                            </span>
                        </div>
                        <div className="flex gap-5 mb-6">
                            <img src={b.bot_link ? `https://t.me/i/userpic/320/${b.bot_link.replace('@','')}.jpg` : ''} className="w-16 h-16 rounded-[22px] object-cover bg-slate-800 border-2 border-slate-800" />
                            <div className="min-w-0 flex-1">
                                <h4 className="font-black text-white text-base truncate italic uppercase tracking-tighter">{b.name}</h4>
                                <p className="text-[10px] text-blue-500 font-black mt-1 uppercase tracking-widest">{b.price} STARS</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { setEditingBot(b); setIsModalOpen(true); }} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-black text-[10px] rounded-xl uppercase tracking-widest transition-all">DÜZENLE</button>
                            <button onClick={async () => { if(confirm("Bu botu silmek istediğine emin misin?")) { await DatabaseService.deleteBot(b.id); load(); } }} className="p-3 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-xl transition-all"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && editingBot && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-6 bg-black/95 backdrop-blur-md animate-in fade-in overflow-y-auto">
                    <div className="bg-[#020617] w-full max-w-6xl my-auto rounded-[32px] border border-slate-800 overflow-hidden flex flex-col shadow-2xl relative">
                         <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Bot Yapılandırma</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all"><X size={24}/></button>
                        </div>
                        <div className="p-6 lg:p-12 overflow-y-auto">
                            <form id="bot-form" onSubmit={handleSave} className="space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bot ID</label>
                                        <input required type="text" value={editingBot.id} onChange={e => setEditingBot({...editingBot, id: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-bold text-white outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Telegram Kullanıcı Adı</label>
                                        <input required type="text" value={editingBot.bot_link?.replace('@','')} onChange={e => handleTelegramUsernameChange(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-bold text-white outline-none" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.4em] shadow-xl">Kaydet ve Yayınla</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    useEffect(() => { load(); }, []);
    const load = async () => { setUsers(await DatabaseService.getUsers()); };
    return (
        <div className="animate-in fade-in space-y-6">
            <h2 className="text-xl font-black text-white uppercase italic">Platform Üyeleri</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[600px]">
                    <thead className="bg-slate-950/50 border-b border-slate-800 text-slate-600 font-bold uppercase">
                        <tr><th className="px-6 py-5">Üye</th><th className="px-6 py-5">Durum</th><th className="px-6 py-5 text-right">Aksiyon</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-slate-800/20 transition-all">
                                <td className="px-6 py-5 flex items-center gap-3"><img src={u.avatar} className="w-8 h-8 rounded-lg" /> <div><p className="font-bold">@{u.username}</p></div></td>
                                <td className="px-6 py-5"><span className="text-emerald-500 font-black px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">{u.status}</span></td>
                                <td className="px-6 py-5 text-right"><button onClick={async () => { await DatabaseService.updateUserStatus(u.id, u.status === 'Active' ? 'Passive' : 'Active'); load(); }} className="p-2 bg-slate-800 rounded-xl hover:bg-red-500/20 hover:text-red-500 transition-all"><Ban size={16}/></button></td>
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
    const [recentNotes, setRecentNotes] = useState<Notification[]>([]);
    useEffect(() => { load(); }, []);
    const load = async () => { const { data } = await supabase.from('notifications').select('*').eq('target_type', 'global').order('date', { ascending: false }).limit(5); setRecentNotes(data || []); };
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await DatabaseService.sendNotification({ ...form, target_type: 'global' });
        setForm({ title: '', message: '', type: 'system' });
        load();
        setIsLoading(false);
        alert("Duyuru gönderildi!");
    };
    return (
        <div className="animate-in fade-in space-y-8">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Yayın Merkezi</h2>
            <form onSubmit={handleSend} className="bg-slate-900 p-8 rounded-[32px] border border-slate-800 space-y-6">
                <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-bold text-white outline-none" placeholder="Yayın Başlığı" />
                <textarea required value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full h-40 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-medium text-slate-300 outline-none" placeholder="Yayın içeriği..." />
                <button type="submit" disabled={isLoading} className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.4em]">YAYINI GÖNDER</button>
            </form>
        </div>
    );
};

const SettingsManagement = () => {
    const [settings, setSettings] = useState({ appName: 'BotlyHub V3', maintenanceMode: false });
    useEffect(() => { DatabaseService.getSettings().then(data => { if (data) setSettings({ appName: data.appName, maintenanceMode: data.MaintenanceMode }); }); }, []);
    const handleSave = async () => { await DatabaseService.saveSettings(settings); alert("Güncellendi."); };
    return (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md shadow-2xl space-y-6">
            <input type="text" value={settings.appName} onChange={e => setSettings({...settings, appName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white" />
            <button onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})} className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest ${settings.maintenanceMode ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}>BAKIM MODU: {settings.maintenanceMode ? 'AÇIK' : 'KAPALI'}</button>
            <button onClick={handleSave} className="w-full py-4 bg-blue-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest">Ayarları Kaydet</button>
        </div>
    );
}

export default AdminDashboard;