
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
  Layout, MousePointer2, Target, Bell, CheckCircle2, ChevronRight,
  GripVertical, DollarSign, LifeBuoy, FileText, Instagram
} from 'lucide-react';
import { DatabaseService, supabase } from '../../services/DatabaseService';
import { User, Bot as BotType, Announcement, Notification, Channel, ActivityLog, Ad } from '../../types';

const { useNavigate, Routes, Route, Link, useLocation } = Router as any;

const StatCard = ({ label, value, icon: Icon, color }: any) => {
  const colors: Record<string, string> = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  };
  
  return (
    <div className="bg-[#0f172a]/50 backdrop-blur-md border border-white/5 p-6 rounded-3xl shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border ${colors[color] || colors.blue}`}>
        <Icon size={24} />
      </div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mt-1">{value}</h3>
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
        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
      >
        <Icon size={18} />
        <span className="font-bold text-[10px] uppercase tracking-widest">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] flex text-slate-200 font-sans overflow-hidden">
      <aside className={`fixed inset-y-0 left-0 z-[70] w-64 bg-[#0f172a] border-r border-white/5 transition-transform lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg rotate-3"><Database size={20} className="text-white"/></div>
            <h2 className="text-lg font-black text-white italic tracking-tighter uppercase">BotlyHub <span className="text-blue-500">Adm</span></h2>
          </div>
          <nav className="flex-1 space-y-1">
            <NavItem to="/a/dashboard" icon={LayoutDashboard} label="Genel Bakış" />
            <NavItem to="/a/dashboard/ads" icon={Radio} label="Reklam Yayınları" />
            <NavItem to="/a/dashboard/sales" icon={Wallet} label="Envanter" />
            <NavItem to="/a/dashboard/users" icon={Users} label="Üyeler" />
            <NavItem to="/a/dashboard/bots" icon={Bot} label="Market" />
            <NavItem to="/a/dashboard/announcements" icon={Megaphone} label="Duyurular" />
            <NavItem to="/a/dashboard/settings" icon={SettingsIcon} label="Sistem Ayarları" />
          </nav>
          <button onClick={() => { DatabaseService.logoutAdmin(); navigate('/a/admin'); }} className="mt-auto flex items-center gap-3 px-4 py-3 text-red-500 font-bold text-[10px] uppercase tracking-widest hover:bg-red-500/10 rounded-xl transition-all">
            <LogOut size={18} /> Güvenli Çıkış
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0f172a]/80 backdrop-blur-md shrink-0 z-50">
           <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 bg-slate-900 rounded-lg text-slate-400"><Menu size={20}/></button>
           <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
              Sistem Altyapısı: Stabil
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
              <Route path="/announcements" element={<AnnouncementCenter />} />
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
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { load(); }, []);
    const load = async () => {
        setIsLoading(true);
        try {
            const statData = await DatabaseService.getAdminStats();
            setStats(statData);
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    return (
        <div className="animate-in fade-in space-y-8">
            <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Sistem <span className="text-blue-500">Panoramsı</span></h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Platform Üyesi" value={stats.userCount} icon={Users} color="blue" />
                <StatCard label="Market Botları" value={stats.botCount} icon={Bot} color="purple" />
                <StatCard label="Satış Hacmi" value={stats.salesCount} icon={Wallet} color="emerald" />
                <StatCard label="Aktivite Logu" value={stats.logCount} icon={Activity} color="orange" />
            </div>
            <div className="p-12 border border-dashed border-white/5 rounded-[48px] flex flex-col items-center justify-center text-center opacity-40">
                <Cpu size={64} className="mb-6 text-slate-800" />
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Sistem Analitiği Hazırlanıyor...</p>
            </div>
        </div>
    );
};

const BotManagement = () => {
    const [bots, setBots] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBot, setEditingBot] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => { load(); }, []);
    const load = async () => { setBots(await DatabaseService.getBotsWithStats()); };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await DatabaseService.saveBot(editingBot);
            setIsModalOpen(false);
            load();
            alert("Bot verileri senkronize edildi.");
        } catch (err: any) { alert("Hata!"); } finally { setIsLoading(false); }
    };

    return (
        <div className="animate-in fade-in space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Bot Kataloğu</h2>
                <button onClick={() => { setEditingBot({ id: '', name: '', description: '', short_desc: '', price: 0, category: 'productivity', bot_link: '', is_premium: false }); setIsModalOpen(true); }} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest shadow-xl">
                    <Plus size={18} className="inline mr-2"/> YENİ BOT EKLE
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {bots.map(b => (
                    <div key={b.id} className="bg-[#0f172a] border border-white/5 p-8 rounded-[48px] hover:border-blue-500/30 transition-all shadow-2xl relative overflow-hidden group">
                        <div className="flex items-center gap-6 mb-8 relative z-10">
                            <img src={b.bot_link ? `https://t.me/i/userpic/320/${b.bot_link.replace('@','')}.jpg` : b.icon} className="w-20 h-20 rounded-[32px] object-cover bg-slate-800 border-2 border-slate-800 shadow-xl" />
                            <div className="min-w-0 flex-1">
                                <h4 className="font-black text-white text-lg truncate italic uppercase tracking-tighter">{b.name}</h4>
                                <p className="text-[10px] text-blue-500 font-black mt-1 uppercase tracking-widest">{b.price} STARS</p>
                            </div>
                        </div>
                        <div className="flex gap-3 relative z-10">
                            <button onClick={() => { setEditingBot(b); setIsModalOpen(true); }} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black text-[10px] rounded-2xl uppercase tracking-widest transition-all">YÖNET</button>
                            <button onClick={async () => { if(confirm("Silmek istiyor musun?")) { await DatabaseService.deleteBot(b.id); load(); } }} className="p-4 bg-slate-800 hover:bg-red-600 text-slate-500 hover:text-white rounded-2xl transition-all"><Trash2 size={18}/></button>
                        </div>
                    </div>
                ))}
            </div>
            {isModalOpen && editingBot && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in overflow-y-auto">
                    <div className="bg-[#020617] w-full max-w-4xl my-auto rounded-[64px] border border-white/10 p-12 shadow-2xl relative">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Bot Yapılandırması</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-4 bg-slate-800 text-slate-400 rounded-2xl"><X size={24}/></button>
                        </div>
                        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bot Benzersiz Kimliği (ID)</label>
                                    <input required type="text" value={editingBot.id} onChange={e => setEditingBot({...editingBot, id: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-3xl p-6 text-xs font-bold text-white outline-none" placeholder="Örn: helper_bot" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Market İsmi</label>
                                    <input required type="text" value={editingBot.name} onChange={e => setEditingBot({...editingBot, name: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-3xl p-6 text-xs font-bold text-white outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Telegram Username (@)</label>
                                    <input required type="text" value={editingBot.bot_link?.replace('@','')} onChange={e => setEditingBot({...editingBot, bot_link: '@' + e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-3xl p-6 text-xs font-bold text-white outline-none" />
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kısa Açıklama (Home)</label>
                                    <input type="text" value={editingBot.short_desc} onChange={e => setEditingBot({...editingBot, short_desc: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-3xl p-6 text-xs font-bold text-white outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Satış Fiyatı (Stars)</label>
                                    <input type="number" value={editingBot.price} onChange={e => setEditingBot({...editingBot, price: Number(e.target.value)})} className="w-full bg-slate-950 border border-white/5 rounded-3xl p-6 text-xs font-bold text-white outline-none" />
                                </div>
                                <div className="flex items-center gap-4 p-6 bg-slate-950 border border-white/5 rounded-3xl">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex-1">Premium Bot Mu?</label>
                                    <button type="button" onClick={() => setEditingBot({...editingBot, is_premium: !editingBot.is_premium})} className={`w-12 h-6 rounded-full relative transition-all ${editingBot.is_premium ? 'bg-blue-600' : 'bg-slate-800'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editingBot.is_premium ? 'right-1' : 'left-1'}`}></div>
                                    </button>
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full py-6 bg-blue-600 text-white font-black rounded-[32px] text-[10px] uppercase tracking-[0.4em] shadow-xl">
                                    {isLoading ? <Loader2 className="animate-spin mx-auto" size={20}/> : 'DEĞİŞİKLİKLERİ KİLİTLE'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const AnnouncementCenter = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [editingAnn, setEditingAnn] = useState<any>(null);

    useEffect(() => { load(); }, []);
    const load = async () => { setAnnouncements(await DatabaseService.getAnnouncements()); };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { error } = await supabase.from('announcements').upsert(editingAnn);
            if (error) throw error;
            setEditingAnn(null);
            load();
            alert("Duyuru güncellendi.");
        } catch (err) { alert("Hata!"); } finally { setIsLoading(false); }
    };

    return (
        <div className="animate-in fade-in space-y-10">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Ana Sayfa Duyuruları</h2>
                <button onClick={() => setEditingAnn({ title: '', description: '', button_text: 'İncele', icon_name: 'Zap', color_scheme: 'purple', is_active: true, action_type: 'link' })} className="px-8 py-4 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                    <Plus size={18} className="inline mr-2"/> YENİ DUYURU
                </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {announcements.map(ann => (
                    <div key={ann.id} className="bg-[#0f172a] border border-white/5 p-8 rounded-[48px] flex items-center justify-between group">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-slate-950 rounded-[22px] flex items-center justify-center text-blue-500 border border-white/5"><Megaphone size={24}/></div>
                            <div>
                                <h4 className="font-black text-white uppercase italic tracking-tight">{ann.title}</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{ann.is_active ? 'YAYINDA' : 'PASİF'}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setEditingAnn(ann)} className="p-4 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all"><SettingsIcon size={18}/></button>
                            <button onClick={async () => { if(confirm("Sil?")) { await supabase.from('announcements').delete().eq('id', ann.id); load(); } }} className="p-4 bg-slate-800 rounded-2xl text-slate-400 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
                        </div>
                    </div>
                ))}
            </div>
            {editingAnn && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in">
                    <div className="bg-[#020617] w-full max-w-2xl rounded-[64px] border border-white/10 p-12 shadow-2xl relative">
                        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-10">Duyuru Editörü</h3>
                        <form onSubmit={handleSave} className="space-y-6">
                            <input required type="text" value={editingAnn.title} onChange={e => setEditingAnn({...editingAnn, title: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-3xl p-6 text-xs font-bold text-white outline-none" placeholder="Duyuru Başlığı" />
                            <textarea required value={editingAnn.description} onChange={e => setEditingAnn({...editingAnn, description: e.target.value})} className="w-full h-32 bg-slate-950 border border-white/5 rounded-3xl p-6 text-xs font-medium text-slate-300 outline-none" placeholder="Duyuru Metni" />
                            <div className="grid grid-cols-2 gap-4">
                                <select value={editingAnn.color_scheme} onChange={e => setEditingAnn({...editingAnn, color_scheme: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-3xl p-6 text-xs font-bold text-white outline-none">
                                    <option value="purple">Mor (Indigo)</option>
                                    <option value="blue">Mavi (Ocean)</option>
                                    <option value="emerald">Yeşil (Emerald)</option>
                                    <option value="orange">Turuncu (Fire)</option>
                                </select>
                                <select value={editingAnn.icon_name} onChange={e => setEditingAnn({...editingAnn, icon_name: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-3xl p-6 text-xs font-bold text-white outline-none">
                                    <option value="Zap">Yıldırım (Zap)</option>
                                    <option value="Megaphone">Hoparlör (Announcement)</option>
                                    <option value="Sparkles">Yıldızlar (Sparkles)</option>
                                    <option value="Gift">Hediye (Gift)</option>
                                </select>
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full py-6 bg-blue-600 text-white font-black rounded-[32px] text-[10px] uppercase tracking-[0.4em] shadow-xl">
                                {isLoading ? <Loader2 className="animate-spin mx-auto" size={20}/> : 'DUYURUYU YAYINLA'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const SettingsManagement = () => {
    const [settings, setSettings] = useState<any>({ appName: 'BotlyHub V3', maintenanceMode: false, commissionRate: 20, supportLink: '', telegramChannelUrl: '' });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => { load(); }, []);
    const load = async () => {
        const data = await DatabaseService.getSettings();
        if (data) setSettings({ ...data, maintenanceMode: data.MaintenanceMode });
    };

    const handleSave = async () => {
        setIsLoading(true);
        await DatabaseService.saveSettings(settings);
        setIsLoading(false);
        alert("Sistem konfigürasyonu başarıyla kilitlendi.");
    };

    return (
        <div className="animate-in fade-in space-y-12">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Sistem Konfigürasyonu</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="bg-[#0f172a] border border-white/5 p-12 rounded-[56px] space-y-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/5 blur-[80px] rounded-full"></div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Platform Marka İsmi</label>
                        <input type="text" value={settings.appName} onChange={e => setSettings({...settings, appName: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-3xl p-6 text-xs font-bold text-white outline-none focus:border-blue-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Reklam Komisyonu (%)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={16}/>
                                <input type="number" value={settings.commissionRate} onChange={e => setSettings({...settings, commissionRate: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-3xl p-6 pl-14 text-xs font-bold text-white outline-none" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Altyapı Durumu</label>
                            <button onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})} className={`w-full py-6 rounded-3xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${settings.maintenanceMode ? 'bg-red-600 text-white shadow-xl shadow-red-600/20' : 'bg-slate-800 text-slate-400'}`}>
                                {settings.maintenanceMode ? <ShieldAlert size={16}/> : <Globe size={16}/>}
                                {settings.maintenanceMode ? 'BAKIMDA' : 'AKTİF'}
                            </button>
                        </div>
                    </div>
                    <button onClick={handleSave} disabled={isLoading} className="w-full py-6 bg-blue-600 text-white font-black rounded-[32px] text-[10px] uppercase tracking-[0.4em] shadow-xl shadow-blue-600/20">
                        {isLoading ? <Loader2 className="animate-spin mx-auto" size={24}/> : 'KONFİGÜRASYONU KAYDET'}
                    </button>
                </div>
                <div className="space-y-6">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-4"><Link2 size={16}/> Destek ve Sosyal Medya</h3>
                    <div className="bg-[#0f172a] border border-white/5 p-8 rounded-[48px] space-y-4 shadow-xl">
                        <div className="relative">
                            <LifeBuoy className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18}/>
                            <input type="text" value={settings.supportLink} onChange={e => setSettings({...settings, supportLink: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-[22px] p-5 pl-14 text-xs font-bold text-white outline-none" placeholder="Destek Botu / Linki" />
                        </div>
                        <div className="relative">
                            <MessageSquare className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18}/>
                            <input type="text" value={settings.telegramChannelUrl} onChange={e => setSettings({...settings, telegramChannelUrl: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-[22px] p-5 pl-14 text-xs font-bold text-white outline-none" placeholder="Telegram Duyuru Kanalı" />
                        </div>
                        <div className="relative">
                            <Instagram className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18}/>
                            <input type="text" value={settings.instagramUrl} onChange={e => setSettings({...settings, instagramUrl: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-[22px] p-5 pl-14 text-xs font-bold text-white outline-none" placeholder="Instagram Hesabı" />
                        </div>
                        <div className="relative">
                            <FileText className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18}/>
                            <input type="text" value={settings.termsUrl} onChange={e => setSettings({...settings, termsUrl: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-[22px] p-5 pl-14 text-xs font-bold text-white outline-none" placeholder="Kullanım Koşulları Linki" />
                        </div>
                    </div>
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
    const loadAds = async () => { setAds(await DatabaseService.getAds()); };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await DatabaseService.createAd(formData);
            setFormData({ title: '', content: '', image_url: '' });
            setIsModalOpen(false);
            loadAds();
            alert("Reklam yayın sırasına eklendi.");
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    return (
        <div className="animate-in fade-in space-y-8 pb-20">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Reklam Yayıncılığı</h2>
                <button onClick={() => setIsModalOpen(true)} className="px-8 py-4 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                    <PlusCircle size={18} className="inline mr-2"/> KAMPANYA BAŞLAT
                </button>
            </div>
            <div className="bg-[#0f172a] border border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/50 border-b border-white/5 text-slate-500 font-bold uppercase">
                        <tr><th className="px-8 py-6">Kampanya</th><th className="px-8 py-6">Statü</th><th className="px-8 py-6">Performans</th><th className="px-8 py-6 text-right">Eylem</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {ads.map(ad => (
                            <tr key={ad.id} className="hover:bg-white/2 transition-colors">
                                <td className="px-8 py-6"><p className="font-bold text-white uppercase italic">{ad.title}</p></td>
                                <td className="px-8 py-6"><span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded font-black text-[9px] uppercase tracking-tighter border border-blue-500/20">{ad.status}</span></td>
                                <td className="px-8 py-6 font-black text-emerald-500"><TrendingUp size={14} className="inline mr-1"/> {ad.total_reach}</td>
                                <td className="px-8 py-6 text-right"><button onClick={async () => { if(confirm("Sil?")) { await DatabaseService.deleteAd(ad.id); loadAds(); } }} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all"><Trash2 size={16}/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                 <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in">
                    <div className="bg-[#020617] w-full max-w-2xl rounded-[48px] border border-white/10 p-12 shadow-2xl relative">
                        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-10">Yeni Kampanya</h3>
                        <form onSubmit={handleCreate} className="space-y-6">
                            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-3xl p-6 text-xs font-bold text-white outline-none" placeholder="Kampanya Başlığı" />
                            <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full h-40 bg-slate-950 border border-white/5 rounded-3xl p-6 text-xs font-medium text-slate-300 outline-none" placeholder="Reklam İçeriği" />
                            <button type="submit" disabled={isLoading} className="w-full py-6 bg-blue-600 text-white font-black rounded-[32px] text-[10px] uppercase tracking-[0.4em] shadow-xl">
                                {isLoading ? <Loader2 className="animate-spin" size={20}/> : 'YAYINI TETİKLE'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const SalesManagement = () => {
    const [sales, setSales] = useState<any[]>([]);
    useEffect(() => { load(); }, []);
    const load = async () => { setSales(await DatabaseService.getAllPurchases()); };
    return (
        <div className="animate-in fade-in space-y-8">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Kütüphane Hareketleri</h2>
            <div className="bg-[#0f172a] border border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/50 border-b border-white/5 text-slate-500 font-bold uppercase">
                        <tr><th className="px-8 py-6">Üye</th><th className="px-8 py-6">Ürün</th><th className="px-8 py-6 text-right">Tarih</th></tr>
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
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Üye Veritabanı</h2>
            <div className="bg-[#0f172a] border border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/50 border-b border-white/5 text-slate-500 font-bold uppercase">
                        <tr><th className="px-8 py-6">Kullanıcı</th><th className="px-8 py-6">Durum</th><th className="px-8 py-6 text-right">İşlem</th></tr>
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
