
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
  ChevronLeft, Edit3, Save, AlertTriangle
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
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mt-1">{value}</h3>
      </div>
    </div>
  );
};

/**
 * Pixel-Perfect Telegram Advertisement Preview (Dark Mode)
 */
const TelegramAdPreview = ({ title, content, imageUrl, buttonText }: { title: string, content: string, imageUrl?: string, buttonText?: string }) => {
    return (
        <div className="bg-[#0e1621] rounded-2xl overflow-hidden w-full max-w-[300px] shadow-2xl font-sans mx-auto flex flex-col h-[480px] border border-white/5 animate-in zoom-in-95">
            {/* Header */}
            <div className="bg-[#242f3d] p-2.5 flex items-center justify-between border-b border-black/20 shrink-0">
                <div className="flex items-center gap-2.5">
                    <ChevronLeft size={18} className="text-[#6c7883]" />
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3b82f6] to-[#60a5fa] flex items-center justify-center text-white font-bold text-[10px] shadow-lg">B</div>
                    <div className="flex flex-col">
                        <span className="text-[12px] font-bold text-white leading-none">BotlyHub Ads</span>
                        <span className="text-[9px] text-[#6c7883] mt-0.5">bot</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Search size={16} className="text-[#6c7883]" />
                    <MoreVertical size={16} className="text-[#6c7883]" />
                </div>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 p-2 bg-[#0e1621] overflow-hidden flex flex-col gap-2 relative bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
                {/* Message Bubble */}
                <div className="bg-[#182533] rounded-xl rounded-tl-none m-1 shadow-sm border border-black/10 overflow-hidden self-start max-w-[92%] relative">
                    {imageUrl && (
                        <div className="w-full h-40 bg-slate-800 relative">
                            <img 
                                src={imageUrl} 
                                className="w-full h-full object-cover" 
                                onError={(e) => (e.target as any).style.display = 'none'}
                            />
                        </div>
                    )}
                    <div className="p-2.5 text-[13px] leading-[1.4] text-white">
                        <span className="font-bold block mb-0.5 text-white">{title || "Kampanya Başlığı"}</span>
                        <span className="text-[#f1f1f1] whitespace-pre-wrap">{content || "Reklam içeriği burada görüntülenecek..."}</span>
                        <div className="text-[9px] text-[#6c7883] mt-1 flex justify-end items-center gap-1">
                           <span>12:45</span>
                           <CheckCircle2 size={10} className="text-[#3b82f6]" />
                        </div>
                    </div>
                </div>
                
                {/* Inline Keyboard Button Style */}
                {buttonText && (
                    <div className="px-1 self-start w-[92%]">
                        <div className="bg-[#182533]/95 hover:bg-[#182533] border border-white/5 text-[#4ea4f5] py-2 rounded-lg text-[13px] font-bold text-center shadow-lg active:scale-95 transition-all cursor-pointer backdrop-blur-md">
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
    const active = location.pathname === to || (to !== '/a/dashboard' && location.pathname.startsWith(to));
    return (
      <Link 
        to={to} 
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 translate-x-1' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
      >
        <Icon size={18} />
        <span className="font-bold text-[10px] uppercase tracking-[0.15em]">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] flex text-slate-200 font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[65] lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      <aside className={`fixed inset-y-0 left-0 z-[70] w-72 bg-[#0f172a] border-r border-white/5 transition-transform duration-500 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-8">
          <div className="flex items-center gap-4 mb-12 px-2">
            <div className="p-2.5 bg-blue-600 rounded-2xl shadow-2xl shadow-blue-600/30 rotate-6 group hover:rotate-0 transition-transform"><Database size={22} className="text-white"/></div>
            <div>
                <h2 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">BotlyHub</h2>
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em]">Administrator</span>
            </div>
          </div>
          
          <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
            <NavItem to="/a/dashboard" icon={LayoutDashboard} label="Kontrol Paneli" />
            <div className="pt-4 pb-2 px-4"><span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">Operasyon</span></div>
            <NavItem to="/a/dashboard/ads" icon={Radio} label="Reklam Yayını" />
            <NavItem to="/a/dashboard/sales" icon={Wallet} label="Satışlar" />
            <NavItem to="/a/dashboard/users" icon={Users} label="Üye Yönetimi" />
            <NavItem to="/a/dashboard/bots" icon={Bot} label="Market Botları" />
            <div className="pt-4 pb-2 px-4"><span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">Sistem</span></div>
            <NavItem to="/a/dashboard/announcements" icon={Megaphone} label="Duyuru Paneli" />
            <NavItem to="/a/dashboard/settings" icon={SettingsIcon} label="Yapılandırma" />
          </nav>

          <button onClick={() => { DatabaseService.logoutAdmin(); navigate('/a/admin'); }} className="mt-8 flex items-center gap-3 px-6 py-4 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/10 rounded-2xl transition-all border border-transparent hover:border-red-500/20 group">
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> Güvenli Çıkış
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-[#0f172a]/40 backdrop-blur-xl shrink-0 z-50">
           <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-3 bg-slate-900 border border-white/5 rounded-2xl text-slate-400 active:scale-90 transition-all shadow-xl"><Menu size={22}/></button>
           <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Sistem Stabil</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <Clock size={14} />
                <span>Son Senkronizasyon: Az Önce</span>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-black text-white uppercase italic tracking-tighter">System Root</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Super Admin</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white shadow-2xl border border-white/10 italic text-lg rotate-3">A</div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-12 no-scrollbar bg-[#020617] relative">
          <div className="max-w-7xl mx-auto pb-24">
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
          
          {/* Footer Blur Effect */}
          <div className="fixed bottom-0 right-0 left-0 lg:left-72 h-32 bg-gradient-to-t from-[#020617] to-transparent pointer-events-none z-40"></div>
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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Sistem <span className="text-blue-500">Özeti</span></h1>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em]">Platformun anlık performans verileri</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard label="Toplam Üye" value={stats.userCount} icon={Users} color="blue" />
                <StatCard label="Pazar Botu" value={stats.botCount} icon={Bot} color="purple" />
                <StatCard label="Tamamlanan Satış" value={stats.salesCount} icon={Wallet} color="emerald" />
                <StatCard label="Sistem Logu" value={stats.logCount} icon={Activity} color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#0f172a]/40 border border-white/5 p-8 rounded-[40px] shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Son Aktiviteler</h3>
                        <Activity size={18} className="text-blue-500" />
                    </div>
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-start gap-4 p-4 bg-slate-900/40 rounded-2xl border border-white/5 hover:border-blue-500/20 transition-all cursor-default">
                                <div className="p-2.5 bg-blue-600/10 rounded-xl text-blue-500"><History size={16}/></div>
                                <div>
                                    <p className="text-[11px] font-black text-white uppercase tracking-tight">Kullanıcı Girişi: @user{i}</p>
                                    <p className="text-[9px] font-bold text-slate-500 mt-0.5">Sistem doğrulandı. IP: 192.168.1.{i}</p>
                                </div>
                                <span className="ml-auto text-[9px] font-bold text-slate-700 uppercase">2dk önce</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-[#0f172a]/40 border border-white/5 p-8 rounded-[40px] shadow-2xl flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
                        <ShieldCheck size={32} className="text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-black text-white uppercase italic mb-2 tracking-tight">Sistem Koruma Aktif</h3>
                    <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-medium">Bütün modüller tam kapasite çalışıyor. Herhangi bir güvenlik ihlali saptanmadı.</p>
                </div>
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
            alert("Reklam yayını başarıyla sıraya alındı.");
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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Reklam <span className="text-blue-500">Yayını</span></h2>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em]">Bağlı tüm kanallara global reklam gönderimi</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[28px] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 active:scale-95 transition-all flex items-center gap-3">
                    <PlusCircle size={20}/> YENİ REKLAM OLUŞTUR
                </button>
            </div>

            <div className="bg-[#0f172a]/40 border border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left text-xs min-w-[800px]">
                        <thead className="bg-slate-950/50 border-b border-white/5 text-slate-500 font-black uppercase tracking-[0.1em]">
                            <tr>
                                <th className="px-10 py-8">İçerik</th>
                                <th className="px-10 py-8">Statü</th>
                                <th className="px-10 py-8">Erişim</th>
                                <th className="px-10 py-8">Zaman</th>
                                <th className="px-10 py-8 text-right">Eylem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {ads.length === 0 ? (
                                <tr><td colSpan={5} className="p-20 text-center text-slate-700 font-black uppercase tracking-[0.4em] italic">Yayınlanmış reklam bulunmuyor.</td></tr>
                            ) : ads.map(ad => (
                                <tr key={ad.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-6">
                                            {ad.image_url ? (
                                                <img src={ad.image_url} className="w-16 h-16 rounded-2xl object-cover border border-white/10 shadow-2xl group-hover:scale-105 transition-transform" />
                                            ) : (
                                                <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-700 border border-white/5"><ImageIcon size={28}/></div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="font-black text-white uppercase italic mb-1 truncate max-w-[240px] text-sm tracking-tight">{ad.title}</p>
                                                <p className="text-[10px] text-slate-500 truncate max-w-[240px] font-bold leading-relaxed">{ad.content}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className={`px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest border shadow-inner ${getStatusColor(ad.status)}`}>
                                            {ad.status === 'sent' ? 'GÖNDERİLDİ' : ad.status === 'pending' ? 'BEKLEMEDE' : ad.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col">
                                            <span className="font-black text-blue-400 text-base tracking-tighter italic">{ad.total_reach?.toLocaleString() || 0}</span>
                                            <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{ad.channel_count || 0} Kanal</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-slate-500 font-black uppercase tracking-tighter text-[10px]">
                                        {new Date(ad.created_at).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <button onClick={async () => { if(confirm("Silmek istediğinize emin misiniz?")) { await DatabaseService.deleteAd(ad.id); loadAds(); } }} className="p-4 bg-slate-800/60 hover:bg-red-600/20 rounded-[20px] text-slate-500 hover:text-red-500 transition-all active:scale-90 border border-white/5">
                                            <Trash2 size={20}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl animate-in fade-in overflow-y-auto no-scrollbar">
                    <div className="bg-[#020617] w-full max-w-6xl rounded-[64px] border border-white/10 p-10 lg:p-16 shadow-2xl relative my-auto">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-4 bg-slate-900/60 border border-white/5 rounded-3xl text-slate-500 hover:text-white transition-all shadow-2xl active:scale-90"><X size={24}/></button>
                        
                        <div className="flex flex-col lg:flex-row gap-20">
                            <div className="flex-1 space-y-12">
                                <div>
                                    <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">Reklam <span className="text-blue-500">Editörü</span></h3>
                                    <p className="text-[12px] text-slate-500 font-black uppercase tracking-[0.4em]">Mesaj detaylarını girin ve canlı simülasyonu izleyin.</p>
                                </div>

                                <form onSubmit={handleCreate} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Mesaj Başlığı (BOLD)</label>
                                            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-900/40 border border-white/5 rounded-[28px] p-7 text-xs font-bold text-white outline-none focus:border-blue-500/40 transition-all shadow-inner" placeholder="Örn: %50 İndirim Fırsatı!" />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Görsel URL (Media)</label>
                                            <div className="relative">
                                                <ImageIcon className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-600" size={22} />
                                                <input type="text" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full bg-slate-900/40 border border-white/5 rounded-[28px] p-7 pl-16 text-xs font-bold text-white outline-none focus:border-blue-500/40 transition-all shadow-inner" placeholder="https://..." />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Reklam Mesajı (Caption)</label>
                                        <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full h-48 bg-slate-900/40 border border-white/5 rounded-[44px] p-8 text-sm font-medium text-slate-300 outline-none focus:border-blue-500/40 transition-all resize-none shadow-inner leading-relaxed" placeholder="Reklam mesajını buraya yazın..." />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Buton Yazısı (Inline)</label>
                                            <input type="text" value={formData.button_text} onChange={e => setFormData({...formData, button_text: e.target.value})} className="w-full bg-slate-900/40 border border-white/5 rounded-[28px] p-7 text-xs font-bold text-white outline-none focus:border-blue-500/40 transition-all shadow-inner" placeholder="Örn: Hemen Katıl" />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Buton Bağlantısı (URL)</label>
                                            <input type="text" value={formData.button_link} onChange={e => setFormData({...formData, button_link: e.target.value})} className="w-full bg-slate-900/40 border border-white/5 rounded-[28px] p-7 text-xs font-bold text-white outline-none focus:border-blue-500/40 transition-all shadow-inner" placeholder="Örn: https://t.me/..." />
                                        </div>
                                    </div>

                                    <button type="submit" disabled={isLoading} className="w-full py-8 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[40px] text-[12px] uppercase tracking-[0.5em] shadow-2xl shadow-blue-600/30 transition-all flex items-center justify-center gap-4 active:scale-95 group">
                                        {isLoading ? <Loader2 className="animate-spin" size={24}/> : <><Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"/> YAYINI BAŞLAT</>}
                                    </button>
                                </form>
                            </div>

                            <div className="w-full lg:w-[360px] shrink-0">
                                <div className="bg-slate-900/40 border border-white/5 rounded-[56px] p-10 flex flex-col items-center sticky top-0 shadow-2xl">
                                    <div className="flex items-center gap-3 mb-10 bg-slate-950/60 px-6 py-3 rounded-2xl border border-white/5">
                                        <Smartphone size={18} className="text-blue-500" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Telegram Mobil Önizleme</span>
                                    </div>
                                    <TelegramAdPreview title={formData.title} content={formData.content} imageUrl={formData.image_url} buttonText={formData.button_text} />
                                    <div className="mt-10 space-y-5 w-full">
                                         <div className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-tighter">
                                             <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                             HTML Parse Mode (Bold) Simüle Edildi
                                         </div>
                                         <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight text-center leading-relaxed italic opacity-60">
                                            Gerçek Telegram karanlık mod çıktısıdır. <br/> Mesajlar tüm bağlı botlara iletilir.
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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Envanter <span className="text-blue-500">Geçmişi</span></h2>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em]">Market üzerinden yapılan tüm satın alımlar</p>
            </div>
            
            <div className="bg-[#0f172a]/40 border border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/50 border-b border-white/5 text-slate-500 font-black uppercase tracking-[0.1em]">
                        <tr><th className="px-10 py-8">Platform Üyesi</th><th className="px-10 py-8">Market Ürünü</th><th className="px-10 py-8 text-right">Tarih</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {sales.length === 0 ? (
                            <tr><td colSpan={3} className="p-20 text-center text-slate-700 font-black uppercase tracking-[0.4em] italic">Henüz satış kaydı bulunmuyor.</td></tr>
                        ) : sales.map((s, idx) => (
                            <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-10 py-8 flex items-center gap-4">
                                    <img src={s.users?.avatar} className="w-10 h-10 rounded-xl border border-white/10 shadow-xl" />
                                    <span className="font-black text-white uppercase italic tracking-tight">@{s.users?.username}</span>
                                </td>
                                <td className="px-10 py-8 font-black text-blue-400 uppercase tracking-tighter italic text-sm">{s.bots?.name}</td>
                                <td className="px-10 py-8 text-right font-black text-slate-500 uppercase tracking-widest">{new Date(s.acquired_at).toLocaleDateString('tr-TR')}</td>
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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Üye <span className="text-blue-500">Veritabanı</span></h2>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em]">Kayıtlı platform üyelerinin yönetimi</p>
            </div>

            <div className="bg-[#0f172a]/40 border border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/50 border-b border-white/5 text-slate-500 font-black uppercase tracking-[0.1em]">
                        <tr><th className="px-10 py-8">Kullanıcı</th><th className="px-10 py-8">Hesap Durumu</th><th className="px-10 py-8 text-right">İşlem</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-white/[0.02] transition-all group">
                                <td className="px-10 py-8 flex items-center gap-6">
                                    <img src={u.avatar} className="w-14 h-14 rounded-[22px] border border-white/10 shadow-2xl group-hover:rotate-2 transition-transform" /> 
                                    <div><p className="font-black text-white italic tracking-tight uppercase text-base">@{u.username}</p><p className="text-[9px] text-slate-600 uppercase mt-0.5 font-black tracking-widest">{u.name}</p></div>
                                </td>
                                <td className="px-10 py-8">
                                    <span className={`px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest border ${u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                        {u.status === 'Active' ? 'AKTİF' : 'PASİF'}
                                    </span>
                                </td>
                                <td className="px-10 py-8 text-right">
                                    <button onClick={async () => { await DatabaseService.updateUserStatus(u.id, u.status === 'Active' ? 'Passive' : 'Active'); load(); }} className={`p-4 rounded-2xl transition-all border border-white/5 shadow-xl ${u.status === 'Active' ? 'bg-slate-800 text-slate-500 hover:bg-red-600 hover:text-white' : 'bg-emerald-600 text-white shadow-emerald-600/30'}`}>
                                        {u.status === 'Active' ? <Ban size={22}/> : <CheckCircle size={22}/>}
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
            alert("Bot verileri başarıyla senkronize edildi.");
        } catch (err: any) { alert("Market hatası oluştu!"); } finally { setIsLoading(false); }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Market <span className="text-blue-500">Kataloğu</span></h2>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em]">Mağaza vitrinindeki tüm botların yönetimi</p>
                </div>
                <button onClick={() => { setEditingBot({ id: '', name: '', description: '', short_desc: '', price: 0, category: 'productivity', bot_link: '', is_premium: false }); setIsModalOpen(true); }} className="px-10 py-5 bg-blue-600 hover:bg-blue-500 rounded-[28px] text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 active:scale-95 transition-all">
                    <Plus size={20} className="inline mr-2"/> YENİ BOT TANIMLA
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {bots.map(b => (
                    <div key={b.id} className="bg-[#0f172a]/40 border border-white/5 p-10 rounded-[56px] hover:border-blue-500/30 transition-all shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[80px] rounded-full group-hover:bg-blue-600/10 transition-all"></div>
                        <div className="flex items-center gap-8 mb-10 relative z-10">
                            <img src={b.bot_link ? `https://t.me/i/userpic/320/${b.bot_link.replace('@','')}.jpg` : b.icon} className="w-24 h-24 rounded-[36px] object-cover bg-slate-950 border-2 border-white/10 shadow-2xl group-hover:rotate-3 transition-transform" />
                            <div className="min-w-0 flex-1">
                                <h4 className="font-black text-white text-xl truncate italic uppercase tracking-tighter mb-1">{b.name}</h4>
                                <div className="flex items-center gap-2">
                                    <Star size={14} className="text-yellow-500" fill="currentColor"/>
                                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">{b.price} STARS</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 relative z-10">
                            <button onClick={() => { setEditingBot(b); setIsModalOpen(true); }} className="flex-1 py-4.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-[10px] rounded-2xl uppercase tracking-widest transition-all border border-white/5">YÖNET</button>
                            <button onClick={async () => { if(confirm("Botu marketten kaldırmak istediğinize emin misiniz?")) { await DatabaseService.deleteBot(b.id); load(); } }} className="p-4.5 bg-slate-800 hover:bg-red-600 text-slate-500 hover:text-white rounded-2xl transition-all border border-white/5"><Trash2 size={20}/></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && editingBot && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl animate-in fade-in overflow-y-auto no-scrollbar">
                    <div className="bg-[#020617] w-full max-w-4xl my-auto rounded-[72px] border border-white/10 p-12 shadow-2xl relative">
                        <div className="flex justify-between items-center mb-14">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500"><Wand2 size={24}/></div>
                                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Bot <span className="text-blue-500">Mühendisliği</span></h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-4 bg-slate-900 border border-white/5 rounded-2xl text-slate-500 hover:text-white transition-all shadow-xl"><X size={28}/></button>
                        </div>
                        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Sistem Kimliği (ID)</label>
                                    <input required type="text" value={editingBot.id} onChange={e => setEditingBot({...editingBot, id: e.target.value})} className="w-full bg-slate-900/40 border border-white/5 rounded-[28px] p-7 text-xs font-bold text-white outline-none focus:border-blue-500/40 shadow-inner" placeholder="helper_bot" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Market İsmi</label>
                                    <input required type="text" value={editingBot.name} onChange={e => setEditingBot({...editingBot, name: e.target.value})} className="w-full bg-slate-900/40 border border-white/5 rounded-[28px] p-7 text-xs font-bold text-white outline-none focus:border-blue-500/40 shadow-inner" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Telegram @Username</label>
                                    <input required type="text" value={editingBot.bot_link?.replace('@','')} onChange={e => setEditingBot({...editingBot, bot_link: '@' + e.target.value})} className="w-full bg-slate-900/40 border border-white/5 rounded-[28px] p-7 text-xs font-bold text-white outline-none focus:border-blue-500/40 shadow-inner" />
                                </div>
                            </div>
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Kısa Açıklama</label>
                                    <input type="text" value={editingBot.short_desc} onChange={e => setEditingBot({...editingBot, short_desc: e.target.value})} className="w-full bg-slate-900/40 border border-white/5 rounded-[28px] p-7 text-xs font-bold text-white outline-none focus:border-blue-500/40 shadow-inner" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Fiyat (Telegram Stars)</label>
                                    <div className="relative">
                                        <Star className="absolute left-7 top-1/2 -translate-y-1/2 text-yellow-500" size={18} fill="currentColor"/>
                                        <input type="number" value={editingBot.price} onChange={e => setEditingBot({...editingBot, price: Number(e.target.value)})} className="w-full bg-slate-900/40 border border-white/5 rounded-[28px] p-7 pl-16 text-xs font-bold text-white outline-none focus:border-blue-500/40 shadow-inner" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 p-7 bg-slate-900/40 border border-white/5 rounded-[28px] shadow-inner">
                                    <div className="flex-1">
                                        <label className="text-[11px] font-black text-white uppercase tracking-widest">Premium Statüsü</label>
                                        <p className="text-[9px] text-slate-600 font-bold uppercase mt-1">Sadece VIP üyeler görebilir</p>
                                    </div>
                                    <button type="button" onClick={() => setEditingBot({...editingBot, is_premium: !editingBot.is_premium})} className={`w-14 h-7 rounded-full relative transition-all duration-500 ${editingBot.is_premium ? 'bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-slate-800'}`}>
                                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${editingBot.is_premium ? 'right-1' : 'left-1'}`}></div>
                                    </button>
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full py-7 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[36px] text-[11px] uppercase tracking-[0.5em] shadow-2xl shadow-blue-600/30 active:scale-95 transition-all">
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
            alert("Duyuru yayını güncellendi.");
        } catch (err) { alert("Sistem hatası!"); } finally { setIsLoading(false); }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Duyuru <span className="text-blue-500">Paneli</span></h2>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em]">Ana sayfadaki kampanya ve duyuruların yönetimi</p>
                </div>
                <button onClick={() => setEditingAnn({ title: '', description: '', button_text: 'İncele', icon_name: 'Zap', color_scheme: 'purple', is_active: true, action_type: 'link' })} className="px-10 py-5 bg-white text-slate-950 rounded-[28px] text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">
                    <Plus size={20} className="inline mr-2"/> YENİ DUYURU TASARLA
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {announcements.map(ann => (
                    <div key={ann.id} className="bg-[#0f172a]/40 border border-white/5 p-10 rounded-[56px] flex items-center justify-between group hover:border-blue-500/30 transition-all shadow-2xl relative overflow-hidden">
                        <div className="flex items-center gap-8 relative z-10">
                            <div className="w-16 h-16 bg-slate-950 rounded-[32px] flex items-center justify-center text-blue-500 border border-white/5 shadow-inner"><Megaphone size={28}/></div>
                            <div>
                                <h4 className="font-black text-white uppercase italic tracking-tight text-xl">{ann.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className={`w-2 h-2 rounded-full ${ann.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></div>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{ann.is_active ? 'YAYINDA' : 'PASİF'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 relative z-10">
                            <button onClick={() => setEditingAnn(ann)} className="p-4 bg-slate-800/60 rounded-2xl text-slate-400 hover:text-white transition-all border border-white/5"><Edit3 size={20}/></button>
                            <button onClick={async () => { if(confirm("Duyuruyu kaldırmak istediğinize emin misiniz?")) { await supabase.from('announcements').delete().eq('id', ann.id); load(); } }} className="p-4 bg-slate-800/60 rounded-2xl text-slate-400 hover:text-red-500 transition-all border border-white/5"><Trash2 size={20}/></button>
                        </div>
                    </div>
                ))}
            </div>

            {editingAnn && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl animate-in fade-in overflow-y-auto no-scrollbar">
                    <div className="bg-[#020617] w-full max-w-2xl rounded-[72px] border border-white/10 p-14 shadow-2xl relative">
                        <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-12">Duyuru <span className="text-blue-500">Editörü</span></h3>
                        <form onSubmit={handleSave} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Başlık</label>
                                <input required type="text" value={editingAnn.title} onChange={e => setEditingAnn({...editingAnn, title: e.target.value})} className="w-full bg-slate-900/40 border border-white/5 rounded-[28px] p-7 text-xs font-bold text-white outline-none focus:border-blue-500/40 shadow-inner" placeholder="Örn: Büyük Güncelleme V3!" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Açıklama (Ana Sayfa)</label>
                                <textarea required value={editingAnn.description} onChange={e => setEditingAnn({...editingAnn, description: e.target.value})} className="w-full h-32 bg-slate-900/40 border border-white/5 rounded-[28px] p-8 text-xs font-medium text-slate-300 outline-none focus:border-blue-500/40 shadow-inner resize-none leading-relaxed" placeholder="Kısa özet..." />
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Renk Şeması</label>
                                    <select value={editingAnn.color_scheme} onChange={e => setEditingAnn({...editingAnn, color_scheme: e.target.value})} className="w-full bg-slate-900/40 border border-white/5 rounded-[28px] p-7 text-xs font-bold text-white outline-none shadow-inner cursor-pointer appearance-none">
                                        <option value="purple">Mor (Indigo)</option>
                                        <option value="blue">Mavi (Ocean)</option>
                                        <option value="emerald">Yeşil (Emerald)</option>
                                        <option value="orange">Turuncu (Fire)</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">İkon Modeli</label>
                                    <select value={editingAnn.icon_name} onChange={e => setEditingAnn({...editingAnn, icon_name: e.target.value})} className="w-full bg-slate-900/40 border border-white/5 rounded-[28px] p-7 text-xs font-bold text-white outline-none shadow-inner cursor-pointer appearance-none">
                                        <option value="Zap">Yıldırım</option>
                                        <option value="Megaphone">Hoparlör</option>
                                        <option value="Sparkles">Yıldızlar</option>
                                        <option value="Gift">Hediye</option>
                                        <option value="Star">Yıldız</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 p-7 bg-slate-900/40 border border-white/5 rounded-[28px] shadow-inner">
                                <div className="flex-1">
                                    <label className="text-[11px] font-black text-white uppercase tracking-widest">Yayın Durumu</label>
                                    <p className="text-[9px] text-slate-600 font-bold uppercase mt-1">Ana sayfada görünürlüğü belirler</p>
                                </div>
                                <button type="button" onClick={() => setEditingAnn({...editingAnn, is_active: !editingAnn.is_active})} className={`w-14 h-7 rounded-full relative transition-all duration-500 ${editingAnn.is_active ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'bg-slate-800'}`}>
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${editingAnn.is_active ? 'right-1' : 'left-1'}`}></div>
                                </button>
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full py-7 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[36px] text-[11px] uppercase tracking-[0.5em] shadow-2xl shadow-blue-600/30 active:scale-95 transition-all">
                                {isLoading ? <Loader2 className="animate-spin mx-auto" size={24}/> : 'DUYURU VERİLERİNİ KİLİTLE'}
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
        try {
            await DatabaseService.saveSettings(settings);
            alert("Platform çekirdek ayarları başarıyla güncellendi.");
        } catch (e) { alert("Ayarlar kaydedilemedi!"); } finally { setIsLoading(false); }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-16">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Sistem <span className="text-blue-500">Konfigürasyonu</span></h2>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em]">Platformun çalışma parametreleri ve global ayarlar</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                <div className="bg-[#0f172a]/40 border border-white/5 p-14 rounded-[64px] space-y-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[120px] rounded-full"></div>
                    
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-3 italic">Uygulama Markası</label>
                        <input type="text" value={settings.appName} onChange={e => setSettings({...settings, appName: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-[28px] p-7 text-sm font-black text-white outline-none focus:border-blue-500 shadow-inner" />
                    </div>

                    <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-3 italic">Komisyon Oranı (%)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-600" size={20}/>
                                <input type="number" value={settings.commissionRate} onChange={e => setSettings({...settings, commissionRate: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-[28px] p-7 pl-16 text-sm font-black text-white outline-none shadow-inner" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-3 italic">Network Modu</label>
                            <button onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})} className={`w-full py-7 rounded-[28px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all border border-white/5 shadow-2xl ${settings.maintenanceMode ? 'bg-red-600 text-white shadow-red-600/30' : 'bg-slate-900 text-slate-400'}`}>
                                {settings.maintenanceMode ? <ShieldAlert size={20}/> : <Globe size={20}/>}
                                {settings.maintenanceMode ? 'BAKIM MODU' : 'CANLI SİSTEM'}
                            </button>
                        </div>
                    </div>

                    <button onClick={handleSave} disabled={isLoading} className="w-full py-8 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[40px] text-[11px] uppercase tracking-[0.5em] shadow-2xl shadow-blue-600/30 active:scale-95 transition-all">
                        {isLoading ? <Loader2 className="animate-spin mx-auto" size={24}/> : <><Save size={20} className="inline mr-3"/> YAPILANDIRMAYI KİLİTLE</>}
                    </button>
                </div>

                <div className="space-y-10">
                    <div className="flex items-center gap-4 ml-6">
                        <Link2 size={22} className="text-blue-500"/>
                        <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">Harici Servis Bağlantıları</h3>
                    </div>
                    <div className="bg-[#0f172a]/40 border border-white/5 p-12 rounded-[56px] space-y-6 shadow-2xl relative">
                        <div className="space-y-4">
                             <div className="relative group">
                                <div className="absolute left-7 top-1/2 -translate-y-1/2 p-2 bg-slate-950 rounded-xl group-focus-within:text-blue-500 transition-colors">
                                    <LifeBuoy size={20} className="text-slate-600" />
                                </div>
                                <input type="text" value={settings.supportLink} onChange={e => setSettings({...settings, supportLink: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-[32px] p-6 pl-20 text-xs font-bold text-white outline-none focus:border-blue-500/40 shadow-inner" placeholder="Destek Botu / URL" />
                            </div>
                        </div>
                        <div className="space-y-4">
                             <div className="relative group">
                                <div className="absolute left-7 top-1/2 -translate-y-1/2 p-2 bg-slate-950 rounded-xl group-focus-within:text-blue-500 transition-colors">
                                    <MessageSquare size={20} className="text-slate-600" />
                                </div>
                                <input type="text" value={settings.telegramChannelUrl} onChange={e => setSettings({...settings, telegramChannelUrl: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-[32px] p-6 pl-20 text-xs font-bold text-white outline-none focus:border-blue-500/40 shadow-inner" placeholder="Telegram Duyuru Kanalı" />
                            </div>
                        </div>
                        <div className="space-y-4">
                             <div className="relative group">
                                <div className="absolute left-7 top-1/2 -translate-y-1/2 p-2 bg-slate-950 rounded-xl group-focus-within:text-blue-500 transition-colors">
                                    <Instagram size={20} className="text-slate-600" />
                                </div>
                                <input type="text" value={settings.instagramUrl} onChange={e => setSettings({...settings, instagramUrl: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-[32px] p-6 pl-20 text-xs font-bold text-white outline-none focus:border-blue-500/40 shadow-inner" placeholder="Instagram Profil URL" />
                            </div>
                        </div>
                        <div className="space-y-4">
                             <div className="relative group">
                                <div className="absolute left-7 top-1/2 -translate-y-1/2 p-2 bg-slate-950 rounded-xl group-focus-within:text-blue-500 transition-colors">
                                    <FileText size={20} className="text-slate-600" />
                                </div>
                                <input type="text" value={settings.termsUrl} onChange={e => setSettings({...settings, termsUrl: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-[32px] p-6 pl-20 text-xs font-bold text-white outline-none focus:border-blue-500/40 shadow-inner" placeholder="Kullanım Koşulları URL" />
                            </div>
                        </div>
                    </div>

                    <div className="p-10 bg-blue-600/5 border border-blue-600/10 rounded-[48px] flex items-start gap-6">
                        <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500 shrink-0"><ShieldCheck size={24}/></div>
                        <div>
                            <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-2">Güvenli Bağlantı</h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-tighter italic opacity-60">Platform üzerindeki tüm URL çıkışları HTTPS protokolü ile korunmakta ve şifrelenmektedir.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
