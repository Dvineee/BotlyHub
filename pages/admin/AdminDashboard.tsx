
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
  Fingerprint, Info, TrendingUp, BarChart3, Radio,
  Layout, MousePointer2, Target, Bell, CheckCircle2, ChevronRight
} from 'lucide-react';
import { DatabaseService, supabase } from '../../services/DatabaseService';
import { User, Bot as BotType, Announcement, Notification, Channel, ActivityLog, Ad } from '../../types';

const { useNavigate, Routes, Route, Link, useLocation } = Router as any;

const StatCard = ({ label, value, icon: Icon, color, trend }: any) => {
  const colors: Record<string, string> = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  };
  
  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 p-6 rounded-[32px] shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border ${colors[color] || colors.blue}`}>
        <Icon size={24} />
      </div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{value}</h3>
        {trend && <span className="text-[10px] text-emerald-500 font-bold">+{trend}%</span>}
      </div>
    </div>
  );
};

const LogItem = ({ log }: { log: any }) => (
    <div className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5 group">
      <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center shrink-0 border border-white/5">
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
      <aside className={`fixed inset-y-0 left-0 z-[70] w-64 bg-slate-900 border-r border-white/5 transition-transform lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-md shrink-0 z-50">
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
                <StatCard label="Denetim Kaydı" value={stats.logCount} icon={Activity} color="orange" trend="5" />
            </div>
            <div className="bg-slate-900/40 border border-white/5 rounded-[48px] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full"></div>
                <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-10 flex items-center gap-3 relative z-10">
                    <ShieldCheck size={18} className="text-blue-500" /> Audit Log (İşlem Geçmişi)
                </h3>
                <div className="space-y-1 relative z-10">
                    {isLoading ? <div className="py-20 text-center text-slate-800 animate-pulse font-bold uppercase text-[10px] italic tracking-widest">Sinyaller Taranıyor...</div> : 
                    combinedLogs.map(log => <LogItem key={log.id} log={log} />)}
                </div>
            </div>
        </div>
    );
};

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
            alert("Reklam yayına hazır!");
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    return (
        <div className="animate-in fade-in space-y-8 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Reklam Yayıncılığı</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Botlar üzerinden kanallara reklam servis edin.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto px-8 py-4 bg-white text-slate-950 hover:bg-blue-600 hover:text-white rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95">
                    <PlusCircle size={18} className="inline mr-2"/> YENİ REKLAM
                </button>
            </div>
            
            <div className="bg-slate-900 border border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/50 border-b border-white/5 text-slate-500 font-bold uppercase">
                        <tr>
                            <th className="px-8 py-6">Reklam Kampanyası</th>
                            <th className="px-8 py-6">Durum</th>
                            <th className="px-8 py-6 text-right">Erişim</th>
                            <th className="px-8 py-6 text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {ads.map(ad => (
                            <tr key={ad.id} className="hover:bg-white/2 transition-colors">
                                <td className="px-8 py-6"><p className="font-bold text-white uppercase italic tracking-tight">{ad.title}</p></td>
                                <td className="px-8 py-6">
                                    <span className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-black text-[9px] uppercase tracking-tighter">
                                        {ad.status}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right font-black text-emerald-500">
                                    <TrendingUp size={14} className="inline mr-1"/> {ad.total_reach}
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button onClick={async () => { if(confirm("Silmek istiyor musunuz?")) { await DatabaseService.deleteAd(ad.id); loadAds(); } }} className="p-3 bg-slate-800 hover:bg-red-600 rounded-2xl text-slate-400 hover:text-white transition-all">
                                        <Trash2 size={16}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                 <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in">
                    <div className="bg-[#020617] w-full max-w-2xl rounded-[48px] border border-white/10 p-12 shadow-2xl relative">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Kampanya Hazırla</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-900 rounded-2xl text-slate-500 hover:text-white transition-colors"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-6">
                            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-3xl p-6 text-xs font-bold text-white outline-none focus:border-blue-500" placeholder="Reklam Başlığı" />
                            <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full h-40 bg-slate-950 border border-white/5 rounded-3xl p-6 text-xs font-medium text-slate-300 outline-none focus:border-blue-500 resize-none" placeholder="Reklam Metni" />
                            <button type="submit" disabled={isLoading} className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[32px] text-[11px] uppercase tracking-[0.4em] shadow-xl">
                                {isLoading ? <Loader2 className="animate-spin" size={20}/> : 'YAYINI BAŞLAT'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
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
        if (!editingBot?.id) return;
        setIsLoading(true);
        try {
            await DatabaseService.saveBot(editingBot!);
            setIsModalOpen(false);
            load();
            alert("Ürün katalog verileri güncellendi.");
        } catch (err: any) { alert("Güncelleme başarısız."); } finally { setIsLoading(false); }
    };

    return (
        <div className="animate-in fade-in space-y-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Katalog Yönetimi</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Platformdaki ürünleri ve market vitrinini yönetin.</p>
                </div>
                <button onClick={() => { setEditingBot({ id: 'bot_' + Math.random().toString(36).substr(2, 5), name: '', description: '', price: 0, category: 'productivity', bot_link: '', screenshots: [] }); setIsModalOpen(true); }} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-3xl text-[10px] font-black text-white flex items-center gap-3 transition-all active:scale-95 shadow-xl">
                    <Plus size={18}/> YENİ ÜRÜN EKLE
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {bots.map(b => (
                    <div key={b.id} className="bg-slate-900 border border-white/5 p-8 rounded-[48px] hover:border-blue-500/30 transition-all shadow-2xl group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Bot size={80} />
                        </div>
                        <div className="flex gap-6 mb-8 relative z-10">
                            <img src={b.bot_link ? `https://t.me/i/userpic/320/${b.bot_link.replace('@','')}.jpg` : ''} className="w-20 h-20 rounded-[32px] object-cover bg-slate-800 border-2 border-slate-800 shadow-xl" />
                            <div className="min-w-0 flex-1 flex flex-col justify-center">
                                <h4 className="font-black text-white text-lg truncate italic uppercase tracking-tighter">{b.name}</h4>
                                <p className="text-[10px] text-blue-500 font-black mt-2 uppercase tracking-[0.2em]">{b.price} STARS</p>
                            </div>
                        </div>
                        <div className="flex gap-3 relative z-10">
                            <button onClick={() => { setEditingBot(b); setIsModalOpen(true); }} className="flex-1 py-4 bg-slate-850 hover:bg-slate-800 text-white font-black text-[10px] rounded-[20px] uppercase tracking-widest transition-all">YAPILANDIR</button>
                            <button onClick={async () => { if(confirm("Ürünü silmek istediğinize emin misiniz?")) { await DatabaseService.deleteBot(b.id); load(); } }} className="p-4 bg-slate-850 hover:bg-red-600/20 text-slate-500 hover:text-red-500 rounded-[20px] transition-all"><Trash2 size={18}/></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && editingBot && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in overflow-y-auto">
                    <div className="bg-[#020617] w-full max-w-4xl my-auto rounded-[64px] border border-white/10 p-12 shadow-2xl relative">
                        <div className="flex justify-between items-center mb-12">
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Bot Ürün Yapılandırması</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Bot teknik detaylarını ve fiyatlandırmasını girin.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-4 bg-slate-900 rounded-[24px] text-slate-500 hover:text-white transition-colors"><X size={28}/></button>
                        </div>
                        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bot Benzersiz Kimlik (ID)</label>
                                    <input required type="text" value={editingBot.id} onChange={e => setEditingBot({...editingBot, id: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-[24px] p-6 text-xs font-bold text-white outline-none focus:border-blue-500" placeholder="Örn: task_master" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ürün İsmi</label>
                                    <input required type="text" value={editingBot.name} onChange={e => setEditingBot({...editingBot, name: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-[24px] p-6 text-xs font-bold text-white outline-none focus:border-blue-500" placeholder="Bot İsmi" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Telegram Kullanıcı Adı</label>
                                    <input required type="text" value={editingBot.bot_link?.replace('@','')} onChange={e => setEditingBot({...editingBot, bot_link: '@' + e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-[24px] p-6 text-xs font-bold text-white outline-none focus:border-blue-500" placeholder="@username" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Satış Fiyatı (Stars)</label>
                                    <input type="number" value={editingBot.price} onChange={e => setEditingBot({...editingBot, price: Number(e.target.value)})} className="w-full bg-slate-950 border border-white/5 rounded-[24px] p-6 text-xs font-bold text-white outline-none focus:border-blue-500" placeholder="Fiyat" />
                                </div>
                            </div>
                            <div className="space-y-6 flex flex-col">
                                <div className="space-y-2 flex-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Detaylı Açıklama</label>
                                    <textarea value={editingBot.description} onChange={e => setEditingBot({...editingBot, description: e.target.value})} className="w-full h-full min-h-[160px] bg-slate-950 border border-white/5 rounded-[32px] p-6 text-xs font-medium text-slate-300 outline-none focus:border-blue-500 resize-none" placeholder="Ürün özelliklerini buraya yazın..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Vitrindeki Kategorisi</label>
                                    <select value={editingBot.category} onChange={e => setEditingBot({...editingBot, category: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-[24px] p-6 text-xs font-bold text-white outline-none focus:border-blue-500 appearance-none">
                                        <option value="productivity">Üretkenlik & İş</option>
                                        <option value="games">Eğlence & Oyun</option>
                                        <option value="utilities">Servisler & Araçlar</option>
                                        <option value="moderation">Moderasyon & Yönetim</option>
                                    </select>
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full py-6 bg-blue-600 text-white font-black rounded-[32px] text-[11px] uppercase tracking-[0.4em] shadow-xl mt-4">
                                    {isLoading ? <Loader2 className="animate-spin mx-auto" size={24}/> : 'SİSTEM VERİLERİNİ GÜNCELLE'}
                                </button>
                            </div>
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
    const [recentNotes, setRecentNotes] = useState<Notification[]>([]);

    useEffect(() => { load(); }, []);
    const load = async () => {
        const { data } = await supabase.from('notifications').select('*').eq('target_type', 'global').order('date', { ascending: false }).limit(6);
        setRecentNotes(data || []);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await DatabaseService.sendNotification({ ...form, target_type: 'global' });
            setForm({ title: '', message: '', type: 'system' });
            load();
            alert("Global yayın tüm üyelere başarıyla aktarıldı!");
        } catch (err) { alert("Yayın hatası."); } finally { setIsLoading(false); }
    };

    return (
        <div className="animate-in fade-in space-y-12">
            <div>
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Bildirim Yayın Merkezi</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Platform genelindeki kullanıcılara anlık duyurular servis edin.</p>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
                <form onSubmit={handleSend} className="bg-slate-900 border border-white/5 p-12 rounded-[56px] space-y-8 shadow-2xl">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Yayın Başlığı</label>
                        <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-3xl p-6 text-xs font-bold text-white outline-none focus:border-blue-500" placeholder="Örn: Yeni Özellik Yayında!" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mesaj İçeriği</label>
                        <textarea required value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full h-44 bg-slate-950 border border-white/5 rounded-[32px] p-6 text-xs font-medium text-slate-300 outline-none focus:border-blue-500 resize-none" placeholder="Kullanıcıların göreceği detaylı duyuru..." />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Yayın Kategorisi</label>
                        <select value={form.type} onChange={e => setForm({...form, type: e.target.value as any})} className="w-full bg-slate-950 border border-white/5 rounded-3xl p-6 text-xs font-bold text-white outline-none focus:border-blue-500">
                            <option value="system">Sistem Duyurusu</option>
                            <option value="payment">Ödeme & Finans</option>
                            <option value="security">Güvenlik Uyarısı</option>
                        </select>
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[32px] text-[11px] uppercase tracking-[0.4em] shadow-xl">
                        {isLoading ? <Loader2 className="animate-spin" size={24}/> : <><Send size={18} className="inline mr-3"/> YAYINI PLATFORMA SERVİS ET</>}
                    </button>
                </form>

                <div className="space-y-8">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-3">
                        <History size={18} className="text-blue-500"/> Yayın Kayıtları (Log)
                    </h3>
                    <div className="space-y-4">
                        {recentNotes.map(note => (
                            <div key={note.id} className="p-6 bg-slate-900/40 border border-white/5 rounded-[32px] flex items-center justify-between group hover:border-blue-500/20 transition-all">
                                <div className="flex items-center gap-5 min-w-0">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center text-blue-400 border border-white/5 group-hover:scale-110 transition-transform">
                                        <BellRing size={20}/>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-white truncate uppercase italic tracking-tight">{note.title}</p>
                                        <p className="text-[10px] text-slate-600 font-bold uppercase mt-1.5">{new Date(note.date).toLocaleDateString('tr-TR')} • {note.type}</p>
                                    </div>
                                </div>
                                <div className="text-emerald-500/50 group-hover:text-emerald-500 transition-colors">
                                    <CheckCircle2 size={20}/>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SettingsManagement = () => {
    const [settings, setSettings] = useState({ appName: 'BotlyHub V3', maintenanceMode: false });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => { DatabaseService.getSettings().then(data => { if (data) setSettings({ appName: data.appName, maintenanceMode: data.MaintenanceMode }); }); }, []);

    const handleSave = async () => {
        setIsLoading(true);
        await DatabaseService.saveSettings(settings);
        setIsLoading(false);
        alert("Platform yapılandırma ayarları kilitlendi.");
    };

    return (
        <div className="animate-in fade-in space-y-12">
            <div>
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Global Yapılandırma</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Sistemin temel parametrelerini ve güvenlik modlarını yönetin.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="bg-slate-900 border border-white/5 p-12 rounded-[56px] space-y-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/5 blur-[80px] rounded-full"></div>
                    <div className="space-y-4 relative z-10">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Platform Marka İsmi</label>
                        <input type="text" value={settings.appName} onChange={e => setSettings({...settings, appName: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-3xl p-6 text-xs font-bold text-white outline-none focus:border-blue-500" />
                    </div>
                    <div className="space-y-4 relative z-10">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Altyapı Durumu</label>
                        <button onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})} className={`w-full py-6 rounded-[32px] text-[11px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${settings.maintenanceMode ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                            {settings.maintenanceMode ? <><ShieldAlert size={20}/> BAKIM MODU AKTİF</> : <><Globe size={20}/> PLATFORM ÇEVRİMİÇİ</>}
                        </button>
                    </div>
                    <button onClick={handleSave} disabled={isLoading} className="w-full py-7 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[32px] text-[12px] uppercase tracking-[0.5em] shadow-xl relative z-10">
                        {isLoading ? <Loader2 className="animate-spin mx-auto" size={24}/> : 'KONFİGÜRASYONU KAYDET'}
                    </button>
                </div>
                
                <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-slate-800 rounded-[56px] opacity-40">
                    <Cpu size={80} className="text-slate-700 mb-8" />
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 italic">Infrastructure V3.5</h4>
                    <p className="text-[11px] text-slate-600 font-bold uppercase leading-relaxed max-w-xs">
                        Bu alandaki değişiklikler anlık olarak veritabanına işlenir ve tüm istemcileri etkiler. Güvenliğiniz için dikkatli işlem yapın.
                    </p>
                </div>
            </div>
        </div>
    );
};

const SalesManagement = () => {
    const [sales, setSales] = useState<any[]>([]);
    useEffect(() => { load(); }, []);
    const load = async () => { setSales(await DatabaseService.getAllPurchases()); };
    return (
        <div className="animate-in fade-in space-y-8">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Envanter & Satış Takibi</h2>
            <div className="bg-slate-900 border border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/50 border-b border-white/5 text-slate-500 font-bold uppercase">
                        <tr><th className="px-8 py-6">Üye</th><th className="px-8 py-6">Ürün / Bot</th><th className="px-8 py-6 text-right">Acquisition Tarihi</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {sales.map((s, idx) => (
                            <tr key={idx} className="hover:bg-white/2 transition-colors">
                                <td className="px-8 py-6 flex items-center gap-3">
                                    <img src={s.users?.avatar} className="w-8 h-8 rounded-lg border border-white/5" />
                                    <span className="font-bold text-white">@{s.users?.username}</span>
                                </td>
                                <td className="px-8 py-6 font-black text-blue-400 uppercase tracking-tighter italic">{s.bots?.name}</td>
                                <td className="px-8 py-6 text-right font-medium text-slate-500">{new Date(s.acquired_at).toLocaleDateString('tr-TR')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {sales.length === 0 && <div className="p-32 text-center text-slate-800 font-bold uppercase text-[10px] italic tracking-widest">Henüz bir satış kaydı bulunmuyor.</div>}
            </div>
        </div>
    );
};

const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    useEffect(() => { load(); }, []);
    const load = async () => { setUsers(await DatabaseService.getUsers()); };
    return (
        <div className="animate-in fade-in space-y-8">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Üye Veri Tabanı</h2>
            <div className="bg-slate-900 border border-white/5 rounded-[48px] overflow-hidden shadow-2xl overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[700px]">
                    <thead className="bg-slate-950/50 border-b border-white/5 text-slate-500 font-bold uppercase">
                        <tr><th className="px-8 py-6">Kullanıcı Bilgisi</th><th className="px-8 py-6">Hesap Statüsü</th><th className="px-8 py-6 text-right">Eylem</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-white/2 transition-all">
                                <td className="px-8 py-6 flex items-center gap-4">
                                    <img src={u.avatar} className="w-12 h-12 rounded-[20px] border border-white/5 shadow-lg" /> 
                                    <div><p className="font-black text-white italic tracking-tight uppercase">@{u.username}</p><p className="text-[9px] text-slate-600 uppercase mt-0.5 font-bold">{u.name}</p></div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`px-3 py-1.5 rounded-lg font-black text-[9px] uppercase border ${u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                        {u.status}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button onClick={async () => { await DatabaseService.updateUserStatus(u.id, u.status === 'Active' ? 'Passive' : 'Active'); load(); }} className={`p-4 rounded-2xl transition-all ${u.status === 'Active' ? 'bg-slate-800 text-slate-500 hover:bg-red-600 hover:text-white' : 'bg-emerald-600 text-white'}`}>
                                        {u.status === 'Active' ? <Ban size={18}/> : <CheckCircle size={18}/>}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;
