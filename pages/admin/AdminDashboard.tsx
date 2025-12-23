
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
  GripVertical, DollarSign, LifeBuoy, FileText, Instagram, Clock, Smartphone, MoreVertical,
  ChevronLeft
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

/**
 * Pixel-Perfect Telegram Advertisement Preview (Dark Mode)
 */
const TelegramAdPreview = ({ title, content, imageUrl, buttonText }: { title: string, content: string, imageUrl?: string, buttonText?: string }) => {
    return (
        <div className="bg-[#0e1621] rounded-2xl overflow-hidden w-full max-w-[320px] shadow-2xl font-sans mx-auto flex flex-col h-[500px] border border-white/5 animate-in zoom-in-95">
            {/* Header */}
            <div className="bg-[#242f3d] p-3 flex items-center justify-between border-b border-black/20 shrink-0">
                <div className="flex items-center gap-3">
                    <ChevronLeft size={20} className="text-[#6c7883]" />
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#3b82f6] to-[#60a5fa] flex items-center justify-center text-white font-bold text-xs shadow-lg">B</div>
                    <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-white leading-none">BotlyHub Ads</span>
                        <div className="flex items-center gap-1 mt-0.5">
                             <span className="text-[10px] text-[#6c7883]">bot</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Search size={18} className="text-[#6c7883]" />
                    <MoreVertical size={18} className="text-[#6c7883]" />
                </div>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 p-2 bg-[#0e1621] overflow-hidden flex flex-col gap-2 relative bg-[url('https://i.pinimg.com/736x/8e/6b/e0/8e6be019448f4384b6f70a3c267605d3.jpg')] bg-cover bg-center">
                {/* Message Bubble */}
                <div className="bg-[#182533] rounded-xl rounded-tl-none m-1 shadow-sm border border-black/10 overflow-hidden self-start max-w-[90%] relative">
                    {imageUrl && (
                        <div className="w-full h-44 bg-slate-800 relative">
                            <img 
                                src={imageUrl} 
                                className="w-full h-full object-cover" 
                                onError={(e) => (e.target as any).style.display = 'none'}
                            />
                        </div>
                    )}
                    <div className="p-3 text-[14px] leading-[1.4] text-white">
                        {/* TITLE (Bold HTML Parse Mode) */}
                        <span className="font-bold block mb-1 text-white">{title || "Kampanya Başlığı"}</span>
                        <span className="text-[#f1f1f1] whitespace-pre-wrap">{content || "Reklam içeriği burada görüntülenecek..."}</span>
                        <div className="text-[10px] text-[#6c7883] mt-1.5 flex justify-end items-center gap-1">
                           <span>12:45</span>
                           <CheckCircle2 size={10} className="text-[#3b82f6]" />
                        </div>
                    </div>
                </div>
                
                {/* Inline Keyboard Button Style */}
                {buttonText && (
                    <div className="px-1.5 self-start w-[90%]">
                        <div className="bg-[#182533]/90 hover:bg-[#182533] border border-white/5 text-[#4ea4f5] py-2.5 rounded-lg text-[13.5px] font-bold text-center shadow-lg active:scale-95 transition-all cursor-pointer backdrop-blur-md">
                            {buttonText}
                        </div>
                    </div>
                )}
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
            <NavItem to="/a/dashboard/ads" icon={Radio} label="Reklam Merkezi" />
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
              Network Status: Online
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
            <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Panel <span className="text-blue-500">Özeti</span></h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Platform Üyesi" value={stats.userCount} icon={Users} color="blue" />
                <StatCard label="Market Botları" value={stats.botCount} icon={Bot} color="purple" />
                <StatCard label="Satış Hacmi" value={stats.salesCount} icon={Wallet} color="emerald" />
                <StatCard label="Aktivite Logu" value={stats.logCount} icon={Activity} color="orange" />
            </div>
        </div>
    );
};

const AdsManagement = () => {
    const [ads, setAds] = useState<Ad[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '', image_url: '', button_text: '', button_link: '' });

    useEffect(() => { loadAds(); }, []);
    const loadAds = async () => { setAds(await DatabaseService.getAds()); };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await DatabaseService.createAd(formData);
            setFormData({ title: '', content: '', image_url: '', button_text: '', button_link: '' });
            setIsModalOpen(false);
            loadAds();
            alert("Reklam başarıyla sisteme eklendi ve yayın sırasına alındı.");
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'sent': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'sending': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            case 'pending': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    return (
        <div className="animate-in fade-in space-y-8 pb-20">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Kampanya Yönetimi</h2>
                    <button onClick={loadAds} className="p-2.5 bg-slate-900 rounded-xl text-slate-500 hover:text-white transition-all"><RefreshCcw size={16} /></button>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                    <PlusCircle size={18} className="inline mr-2"/> YENİ REKLAM TASARLA
                </button>
            </div>

            <div className="bg-[#0f172a] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/50 border-b border-white/5 text-slate-500 font-bold uppercase">
                        <tr>
                            <th className="px-8 py-6">Kampanya Detayı</th>
                            <th className="px-8 py-6">Yayın Durumu</th>
                            <th className="px-8 py-6">Erişim Verileri</th>
                            <th className="px-8 py-6">Oluşturma</th>
                            <th className="px-8 py-6 text-right">Yönetim</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {ads.length === 0 ? (
                            <tr><td colSpan={5} className="p-16 text-center text-slate-600 font-black uppercase tracking-[0.2em] italic">Aktif kampanya kaydı bulunmuyor.</td></tr>
                        ) : ads.map(ad => (
                            <tr key={ad.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-5">
                                        {ad.image_url ? (
                                            <img src={ad.image_url} className="w-14 h-14 rounded-2xl object-cover border border-white/10 shadow-lg" />
                                        ) : (
                                            <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-700 border border-white/5"><ImageIcon size={24}/></div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="font-black text-white uppercase italic mb-1 truncate max-w-[200px]">{ad.title}</p>
                                            <p className="text-[10px] text-slate-500 truncate max-w-[200px] font-medium leading-relaxed">{ad.content}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-tighter border ${getStatusColor(ad.status)}`}>
                                        {ad.status === 'sent' ? 'YAYINLANDI' : ad.status === 'pending' ? 'SIRADA' : ad.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                        <span className="font-black text-blue-400 text-sm tracking-tight">{ad.total_reach?.toLocaleString() || 0}</span>
                                        <span className="text-[9px] text-slate-600 font-black uppercase">{ad.channel_count || 0} Kanala Gönderildi</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-slate-500 font-black uppercase tracking-tighter text-[10px]">
                                    {new Date(ad.created_at).toLocaleDateString('tr-TR')}
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button onClick={async () => { if(confirm("Bu reklam kampanyasını silmek istediğinize emin misiniz?")) { await DatabaseService.deleteAd(ad.id); loadAds(); } }} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-red-500 transition-all active:scale-90 border border-white/5">
                                        <Trash2 size={18}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/98 backdrop-blur-2xl animate-in fade-in overflow-y-auto">
                    <div className="bg-[#020617] w-full max-w-6xl rounded-[56px] border border-white/10 p-8 lg:p-14 shadow-2xl relative my-auto">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-3.5 bg-slate-900 rounded-2xl text-slate-500 hover:text-white transition-all border border-white/5 shadow-xl"><X size={24}/></button>
                        
                        <div className="flex flex-col lg:flex-row gap-16">
                            <div className="flex-1 space-y-10">
                                <div>
                                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-3">Reklam Tasarımcısı</h3>
                                    <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.3em]">Kampanya içeriklerini girin ve canlı Telegram önizlemesini izleyin.</p>
                                </div>

                                <form onSubmit={handleCreate} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kampanya Başlığı (BOLD)</label>
                                            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-900/40 border border-white/5 rounded-3xl p-6 text-xs font-bold text-white outline-none focus:border-blue-500/40 transition-all shadow-inner" placeholder="Örn: %50 İndirim Fırsatını Kaçırma!" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Görsel URL</label>
                                            <div className="relative">
                                                <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                                                <input type="text" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full bg-slate-900/40 border border-white/5 rounded-3xl p-6 pl-14 text-xs font-bold text-white outline-none focus:border-blue-500/40 transition-all shadow-inner" placeholder="https://resim-url.com/gorsel.jpg" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Reklam Mesajı</label>
                                        <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full h-44 bg-slate-900/40 border border-white/5 rounded-[40px] p-7 text-sm font-medium text-slate-300 outline-none focus:border-blue-500/40 transition-all resize-none shadow-inner leading-relaxed" placeholder="Kullanıcılara görünecek ana mesajı buraya yazın..." />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Buton Metni (Opsiyonel)</label>
                                            <input type="text" value={formData.button_text} onChange={e => setFormData({...formData, button_text: e.target.value})} className="w-full bg-slate-900/40 border border-white/5 rounded-3xl p-6 text-xs font-bold text-white outline-none focus:border-blue-500/40 transition-all shadow-inner" placeholder="Örn: Hemen İncele" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Buton Linki (URL)</label>
                                            <input type="text" value={formData.button_link} onChange={e => setFormData({...formData, button_link: e.target.value})} className="w-full bg-slate-900/40 border border-white/5 rounded-3xl p-6 text-xs font-bold text-white outline-none focus:border-blue-500/40 transition-all shadow-inner" placeholder="https://t.me/..." />
                                        </div>
                                    </div>

                                    <button type="submit" disabled={isLoading} className="w-full py-7 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[36px] text-[11px] uppercase tracking-[0.5em] shadow-2xl shadow-blue-600/30 transition-all flex items-center justify-center gap-4 active:scale-95">
                                        {isLoading ? <Loader2 className="animate-spin" size={24}/> : <><Send size={22}/> KAMPANYAYI BAŞLAT</>}
                                    </button>
                                </form>
                            </div>

                            <div className="w-full lg:w-[380px] shrink-0">
                                <div className="bg-slate-900/40 border border-white/5 rounded-[48px] p-10 flex flex-col items-center sticky top-0 shadow-2xl">
                                    <div className="flex items-center gap-3 mb-10 bg-slate-950/50 px-5 py-2.5 rounded-2xl border border-white/5">
                                        <Smartphone size={18} className="text-blue-500" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Canlı Telegram Çıktısı</span>
                                    </div>
                                    <TelegramAdPreview title={formData.title} content={formData.content} imageUrl={formData.image_url} buttonText={formData.button_text} />
                                    <div className="mt-8 space-y-4 w-full">
                                         <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                                             <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                                             HTML Parse Mode (Bold) Aktif
                                         </div>
                                         <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight text-center leading-relaxed">
                                            Gerçek Telegram mobil görünümüdür. <br/> Başlık otomatik olarak kalın yazılır.
                                         </p>
                                    </div>
                                </div>
                            </div>
                        </div>
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
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Satın Alım Geçmişi</h2>
            <div className="bg-[#0f172a] border border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/50 border-b border-white/5 text-slate-500 font-bold uppercase">
                        <tr><th className="px-8 py-6">Kullanıcı</th><th className="px-8 py-6">Alınan Ürün</th><th className="px-8 py-6 text-right">İşlem Tarihi</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {sales.map((s, idx) => (
                            <tr key={idx} className="hover:bg-white/2 transition-colors">
                                <td className="px-8 py-6 flex items-center gap-3">
                                    <img src={s.users?.avatar} className="w-9 h-9 rounded-xl border border-white/5 shadow-md" />
                                    <span className="font-bold text-white uppercase italic">@{s.users?.username}</span>
                                </td>
                                <td className="px-8 py-6 font-black text-blue-400 uppercase tracking-tighter italic text-sm">{s.bots?.name}</td>
                                <td className="px-8 py-6 text-right font-black text-slate-500 uppercase tracking-tighter">{new Date(s.acquired_at).toLocaleDateString('tr-TR')}</td>
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
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Üye Yönetimi</h2>
            <div className="bg-[#0f172a] border border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/50 border-b border-white/5 text-slate-500 font-bold uppercase">
                        <tr><th className="px-8 py-6">Üye</th><th className="px-8 py-6">Hesap Durumu</th><th className="px-8 py-6 text-right">Eylemler</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-white/2 transition-all">
                                <td className="px-8 py-6 flex items-center gap-4">
                                    <img src={u.avatar} className="w-12 h-12 rounded-2xl border border-white/10 shadow-lg" /> 
                                    <div><p className="font-black text-white italic tracking-tight uppercase text-sm">@{u.username}</p><p className="text-[9px] text-slate-600 uppercase mt-0.5 font-bold">{u.name}</p></div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`px-3 py-1.5 rounded-lg font-black text-[9px] uppercase border ${u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                        {u.status === 'Active' ? 'AKTİF' : 'PASİF'}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button onClick={async () => { await DatabaseService.updateUserStatus(u.id, u.status === 'Active' ? 'Passive' : 'Active'); load(); }} className={`p-4 rounded-2xl transition-all border border-white/5 ${u.status === 'Active' ? 'bg-slate-800 text-slate-500 hover:bg-red-600 hover:text-white' : 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20'}`}>
                                        {u.status === 'Active' ? <Ban size={20}/> : <CheckCircle size={20}/>}
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
            alert("Bot konfigürasyonu başarıyla kilitlendi.");
        } catch (err: any) { alert("Sistem hatası!"); } finally { setIsLoading(false); }
    };

    return (
        <div className="animate-in fade-in space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Market Kataloğu</h2>
                <button onClick={() => { setEditingBot({ id: '', name: '', description: '', short_desc: '', price: 0, category: 'productivity', bot_link: '', is_premium: false }); setIsModalOpen(true); }} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest shadow-xl border border-white/10 active:scale-95 transition-all">
                    <Plus size={18} className="inline mr-2"/> YENİ BOT TANIMLA
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {bots.map(b => (
                    <div key={b.id} className="bg-[#0f172a] border border-white/5 p-9 rounded-[48px] hover:border-blue-500/40 transition-all shadow-2xl relative overflow-hidden group">
                        <div className="flex items-center gap-7 mb-10 relative z-10">
                            <img src={b.bot_link ? `https://t.me/i/userpic/320/${b.bot_link.replace('@','')}.jpg` : b.icon} className="w-24 h-24 rounded-[36px] object-cover bg-slate-900 border-2 border-white/5 shadow-2xl" />
                            <div className="min-w-0 flex-1">
                                <h4 className="font-black text-white text-xl truncate italic uppercase tracking-tighter mb-1">{b.name}</h4>
                                <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.2em] bg-blue-500/5 py-1 px-3 rounded-lg border border-blue-500/10 w-fit">{b.price} STARS</p>
                            </div>
                        </div>
                        <div className="flex gap-4 relative z-10">
                            <button onClick={() => { setEditingBot(b); setIsModalOpen(true); }} className="flex-1 py-4.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-[10px] rounded-[22px] uppercase tracking-widest transition-all border border-white/5">YAPILANDIR</button>
                            <button onClick={async () => { if(confirm("Bu botu sistemden tamamen kaldırmak istediğinize emin misiniz?")) { await DatabaseService.deleteBot(b.id); load(); } }} className="p-4.5 bg-slate-800 hover:bg-red-600 text-slate-500 hover:text-white rounded-[22px] transition-all border border-white/5"><Trash2 size={20}/></button>
                        </div>
                    </div>
                ))}
            </div>
            {isModalOpen && editingBot && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/98 backdrop-blur-2xl animate-in fade-in overflow-y-auto">
                    <div className="bg-[#020617] w-full max-w-4xl my-auto rounded-[64px] border border-white/10 p-14 shadow-2xl relative">
                        <div className="flex justify-between items-center mb-12">
                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Bot Mühendisliği</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-4 bg-slate-800 text-slate-400 rounded-2xl border border-white/5"><X size={24}/></button>
                        </div>
                        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bot ID (Unique)</label>
                                    <input required type="text" value={editingBot.id} onChange={e => setEditingBot({...editingBot, id: e.target.value})} className="w-full bg-slate-900/40 border border-white/5 rounded-3xl p-6 text-xs font-bold text-white outline-none focus:border-blue-500/40" placeholder="helper_bot" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Market Etiketi</label>
                                    <input required type="text" value={editingBot.name} onChange={e => setEditingBot({...editingBot, name: e.target.value})} className="w-full bg-slate-900/40 border border-white/5 rounded-3xl p-6 text-xs font-bold text-white outline-none focus:border-blue-500/40" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Telegram @Username</label>
                                    <input required type="text" value={editingBot.bot_link?.replace('@','')} onChange={e => setEditingBot({...editingBot, bot_link: '@' + e.target.value})} className="w-full bg-slate-900/40 border border-white/5 rounded-3xl p-6 text-xs font-bold text-white outline-none focus:border-blue-500/40" />
                                </div>
                            </div>
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Landing Açıklaması</label>
                                    <input type="text" value={editingBot.short_desc} onChange={e => setEditingBot({...editingBot, short_desc: e.target.value})} className="w-full bg-slate-900/40 border border-white/5 rounded-3xl p-6 text-xs font-bold text-white outline-none focus:border-blue-500/40" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Fiyatlandırma (Stars)</label>
                                    <input type="number" value={editingBot.price} onChange={e => setEditingBot({...editingBot, price: Number(e.target.value)})} className="w-full bg-slate-900/40 border border-white/5 rounded-3xl p-6 text-xs font-bold text-white outline-none focus:border-blue-500/40" />
                                </div>
                                <div className="flex items-center gap-6 p-7 bg-slate-900/40 border border-white/5 rounded-3xl shadow-inner">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex-1">Premium Erişim</label>
                                    <button type="button" onClick={() => setEditingBot({...editingBot, is_premium: !editingBot.is_premium})} className={`w-14 h-7 rounded-full relative transition-all duration-300 ${editingBot.is_premium ? 'bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-slate-800'}`}>
                                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${editingBot.is_premium ? 'right-1' : 'left-1'}`}></div>
                                    </button>
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full py-6.5 bg-blue-600 text-white font-black rounded-[36px] text-[11px] uppercase tracking-[0.5em] shadow-2xl shadow-blue-600/30 active:scale-95 transition-all">
                                    {isLoading ? <Loader2 className="animate-spin mx-auto" size={24}/> : 'SİSTEMİ GÜNCELLE'}
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
            alert("Sistem duyurusu yayınlandı.");
        } catch (err) { alert("Hata!"); } finally { setIsLoading(false); }
    };

    return (
        <div className="animate-in fade-in space-y-12">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Sistem Duyuruları</h2>
                <button onClick={() => setEditingAnn({ title: '', description: '', button_text: 'Detaylar', icon_name: 'Zap', color_scheme: 'purple', is_active: true, action_type: 'link' })} className="px-8 py-4 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl border border-white/10 active:scale-95 transition-all">
                    <Plus size={18} className="inline mr-2"/> YENİ DUYURU TASARLA
                </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {announcements.map(ann => (
                    <div key={ann.id} className="bg-[#0f172a] border border-white/5 p-9 rounded-[48px] flex items-center justify-between group hover:border-blue-500/30 transition-all shadow-2xl relative overflow-hidden">
                        <div className="flex items-center gap-7">
                            <div className="w-16 h-16 bg-slate-950 rounded-[28px] flex items-center justify-center text-blue-500 border border-white/5 shadow-inner"><Megaphone size={28}/></div>
                            <div>
                                <h4 className="font-black text-white uppercase italic tracking-tight text-lg">{ann.title}</h4>
                                <p className="text-[10px] text-slate-600 font-black uppercase mt-1 tracking-widest">{ann.is_active ? 'YAYINDA' : 'PASİF'}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setEditingAnn(ann)} className="p-4 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all border border-white/5 shadow-lg"><SettingsIcon size={20}/></button>
                            <button onClick={async () => { if(confirm("Duyuruyu sil?")) { await supabase.from('announcements').delete().eq('id', ann.id); load(); } }} className="p-4 bg-slate-800 rounded-2xl text-slate-400 hover:text-red-500 transition-all border border-white/5 shadow-lg"><Trash2 size={20}/></button>
                        </div>
                    </div>
                ))}
            </div>
            {editingAnn && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/98 backdrop-blur-2xl animate-in fade-in">
                    <div className="bg-[#020617] w-full max-w-2xl rounded-[64px] border border-white/10 p-14 shadow-2xl relative">
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-12">Duyuru Editörü</h3>
                        <form onSubmit={handleSave} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Başlık</label>
                                <input required type="text" value={editingAnn.title} onChange={e => setEditingAnn({...editingAnn, title: e.target.value})} className="w-full bg-slate-900/40 border border-white/5 rounded-3xl p-6 text-xs font-bold text-white outline-none focus:border-blue-500/40 shadow-inner" placeholder="Büyük İndirim Başladı!" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">İçerik Metni</label>
                                <textarea required value={editingAnn.description} onChange={e => setEditingAnn({...editingAnn, description: e.target.value})} className="w-full h-32 bg-slate-900/40 border border-white/5 rounded-3xl p-7 text-xs font-medium text-slate-300 outline-none focus:border-blue-500/40 shadow-inner resize-none leading-relaxed" placeholder="Duyuru detayları..." />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <select value={editingAnn.color_scheme} onChange={e => setEditingAnn({...editingAnn, color_scheme: e.target.value})} className="w-full bg-slate-900/40 border border-white/5 rounded-3xl p-6 text-xs font-bold text-white outline-none shadow-inner cursor-pointer">
                                    <option value="purple">Mor (Indigo)</option>
                                    <option value="blue">Mavi (Ocean)</option>
                                    <option value="emerald">Yeşil (Emerald)</option>
                                    <option value="orange">Turuncu (Fire)</option>
                                </select>
                                <select value={editingAnn.icon_name} onChange={e => setEditingAnn({...editingAnn, icon_name: e.target.value})} className="w-full bg-slate-900/40 border border-white/5 rounded-3xl p-6 text-xs font-bold text-white outline-none shadow-inner cursor-pointer">
                                    <option value="Zap">Yıldırım</option>
                                    <option value="Megaphone">Hoparlör</option>
                                    <option value="Sparkles">Yıldızlar</option>
                                    <option value="Gift">Hediye</option>
                                </select>
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full py-6.5 bg-blue-600 text-white font-black rounded-[36px] text-[11px] uppercase tracking-[0.5em] shadow-2xl shadow-blue-600/30 active:scale-95 transition-all">
                                {isLoading ? <Loader2 className="animate-spin mx-auto" size={24}/> : 'DUYURUYU KİLİTLE'}
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
        alert("Platform konfigürasyonu başarıyla senkronize edildi.");
    };

    return (
        <div className="animate-in fade-in space-y-16">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Çekirdek Ayarlar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                <div className="bg-[#0f172a] border border-white/5 p-14 rounded-[56px] space-y-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/5 blur-[100px] rounded-full"></div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Platform Markası</label>
                        <input type="text" value={settings.appName} onChange={e => setSettings({...settings, appName: e.target.value})} className="w-full bg-slate-950/50 border border-white/5 rounded-3xl p-6 text-xs font-bold text-white outline-none focus:border-blue-500 shadow-inner" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Komisyon (%)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18}/>
                                <input type="number" value={settings.commissionRate} onChange={e => setSettings({...settings, commissionRate: e.target.value})} className="w-full bg-slate-950/50 border border-white/5 rounded-3xl p-6 pl-14 text-xs font-bold text-white outline-none shadow-inner" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Network Statüsü</label>
                            <button onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})} className={`w-full py-6 rounded-3xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all border border-white/5 shadow-xl ${settings.maintenanceMode ? 'bg-red-600 text-white shadow-red-600/30' : 'bg-slate-900 text-slate-400'}`}>
                                {settings.maintenanceMode ? <ShieldAlert size={18}/> : <Globe size={18}/>}
                                {settings.maintenanceMode ? 'BAKIM MODU' : 'CANLI SİSTEM'}
                            </button>
                        </div>
                    </div>
                    <button onClick={handleSave} disabled={isLoading} className="w-full py-6.5 bg-blue-600 text-white font-black rounded-[36px] text-[11px] uppercase tracking-[0.5em] shadow-2xl shadow-blue-600/30 active:scale-95 transition-all">
                        {isLoading ? <Loader2 className="animate-spin mx-auto" size={24}/> : 'KONFİGÜRASYONU KİLİTLE'}
                    </button>
                </div>
                <div className="space-y-8">
                    <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-3 ml-4"><Link2 size={18} className="text-blue-500"/> Ekosistem Bağlantıları</h3>
                    <div className="bg-[#0f172a] border border-white/5 p-10 rounded-[48px] space-y-5 shadow-2xl">
                        <div className="relative">
                            <LifeBuoy className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={20}/>
                            <input type="text" value={settings.supportLink} onChange={e => setSettings({...settings, supportLink: e.target.value})} className="w-full bg-slate-950/50 border border-white/5 rounded-[28px] p-5.5 pl-16 text-xs font-bold text-white outline-none shadow-inner" placeholder="Support Bot / Link" />
                        </div>
                        <div className="relative">
                            <MessageSquare className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={20}/>
                            <input type="text" value={settings.telegramChannelUrl} onChange={e => setSettings({...settings, telegramChannelUrl: e.target.value})} className="w-full bg-slate-950/50 border border-white/5 rounded-[28px] p-5.5 pl-16 text-xs font-bold text-white outline-none shadow-inner" placeholder="Announcement Channel" />
                        </div>
                        <div className="relative">
                            <Instagram className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={20}/>
                            <input type="text" value={settings.instagramUrl} onChange={e => setSettings({...settings, instagramUrl: e.target.value})} className="w-full bg-slate-950/50 border border-white/5 rounded-[28px] p-5.5 pl-16 text-xs font-bold text-white outline-none shadow-inner" placeholder="Instagram Profile" />
                        </div>
                        <div className="relative">
                            <FileText className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={20}/>
                            <input type="text" value={settings.termsUrl} onChange={e => setSettings({...settings, termsUrl: e.target.value})} className="w-full bg-slate-950/50 border border-white/5 rounded-[28px] p-5.5 pl-16 text-xs font-bold text-white outline-none shadow-inner" placeholder="Terms of Service" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
