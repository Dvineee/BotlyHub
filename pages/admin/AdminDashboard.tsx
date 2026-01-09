
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
  DollarSign, Edit3, Save, AlertTriangle, Image as ImageIconLucide, PlusSquare, Heart, Shield, Gift, ImageIcon,
  UserPlus, UserX, Crown, ShieldQuestion, Clock, MapPin, Tablet
} from 'lucide-react';
import { DatabaseService, supabase } from '../../services/DatabaseService';
import { User, Bot as BotType, Announcement, Notification, Channel, ActivityLog, Promotion, UserBot } from '../../types';

const { useNavigate, Routes, Route, Link, useLocation } = Router as any;

/**
 * Telegram üzerinden güncel profil resmini çeken yardımcı fonksiyon
 */
const getLiveBotIcon = (bot: Partial<BotType>) => {
    if (bot.icon && bot.icon.startsWith('http')) return bot.icon;
    if (bot.bot_link) {
        const username = bot.bot_link.replace('@', '').replace('https://t.me/', '').split('/').pop()?.trim();
        if (username) return `https://t.me/i/userpic/320/${username}.jpg`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name || 'Bot')}&background=1e293b&color=fff&bold=true`;
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
            <NavItem to="/a/dashboard/promotions" icon={Radio} label="Tanıtımlar" />
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
              <Route path="users" element={<UserManagement />} />
              <Route path="bots" element={<BotManagement />} />
              <Route path="sales" element={<SalesManagement />} />
              <Route path="promotions" element={<PromotionManagement />} />
              <Route path="announcements" element={<AnnouncementCenter />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="logs" element={<SystemLogs />} />
              <Route path="settings" element={<SettingsManagement />} />
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

// --- PROMOTION MANAGEMENT MODULE (Bypass AdBlocker) ---
const PromotionManagement = () => {
    const [promos, setPromos] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<Partial<Promotion> | null>(null);
    const [activeChannelsCount, setActiveChannelsCount] = useState(0);

    const load = async () => {
        setIsLoading(true);
        try {
            const [promosData, channelsCount] = await Promise.all([
                DatabaseService.getPromotions(),
                DatabaseService.getChannelsCount(true)
            ]);
            setPromos(promosData);
            setActiveChannelsCount(channelsCount);
        } catch (e) {
            console.error("Yükleme hatası:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { 
        load(); 
        const interval = setInterval(() => {
            if (promos.some(p => p.status === 'sending')) load();
        }, 8000);
        return () => clearInterval(interval);
    }, [promos]);

    const handleDelete = async (id: string) => {
        if (!confirm('Bu içeriği silmek istediğinize emin misiniz?')) return;
        try {
            await DatabaseService.deletePromotion(id);
            load();
        } catch (e) { alert('Silme hatası! Veritabanında promotions tablosu olduğundan emin olun.'); }
    };

    const handleToggleStatus = async (promo: Promotion) => {
        const nextStatus = promo.status === 'sending' ? 'pending' : 'sending';
        try {
            await DatabaseService.updatePromotionStatus(promo.id, nextStatus);
            load();
        } catch (e) { alert('Durum güncellenemedi! promotions tablosunu kontrol edin.'); }
    };

    if (isLoading && promos.length === 0) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>;

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-1">Tanıtım <span className="text-blue-500">Merkezi</span></h2>
                    <div className="flex items-center gap-4">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Radio size={12} className="text-emerald-500 animate-pulse" /> {activeChannelsCount} Kanal Yayına Hazır
                        </p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={load} className="p-5 bg-slate-900/60 border border-white/5 rounded-3xl text-slate-400 hover:text-white transition-all"><RefreshCcw size={20}/></button>
                    <button 
                      onClick={() => { setEditingPromo({ title: '', content: '', status: 'pending', button_text: 'İncele', button_link: '', total_reach: 0, channel_count: 0, processed_channels: [] }); setIsModalOpen(true); }}
                      className="bg-blue-600 hover:bg-blue-500 px-8 py-5 rounded-[28px] text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-3 transition-all active:scale-95 border-b-4 border-blue-800"
                    >
                        <PlusSquare size={18}/> YENİ TANITIM OLUŞTUR
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {promos.length === 0 ? (
                    <div className="py-24 text-center bg-slate-900/20 rounded-[48px] border-2 border-dashed border-slate-900 flex flex-col items-center opacity-40">
                        <Radio size={48} className="mb-4 text-slate-800" />
                        <p className="font-black uppercase tracking-[0.2em] text-slate-700">Veritabanında 'promotions' tablosu bulunamadı veya boş.</p>
                        <p className="text-[9px] font-bold uppercase mt-4 text-blue-500">Lütfen Supabase panelinde 'ads' tablosunun adını 'promotions' yapın.</p>
                    </div>
                ) : (
                    promos.map(promo => {
                        const progress = promo.status === 'sent' ? 100 : Math.min(100, (promo.channel_count / (activeChannelsCount || 1)) * 100);
                        return (
                            <div key={promo.id} className={`bg-slate-900/40 border rounded-[44px] p-8 flex flex-col gap-6 transition-all group relative overflow-hidden ${promo.status === 'sending' ? 'border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.05)]' : 'border-white/5 hover:border-blue-500/30'}`}>
                                <div className="flex flex-col lg:flex-row gap-8 items-center relative z-10">
                                    <div className="w-32 h-32 rounded-[32px] bg-slate-950 border border-white/5 overflow-hidden shrink-0 shadow-2xl">
                                        {promo.image_url ? (
                                            <img src={promo.image_url} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-800"><ImageIcon size={40}/></div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter truncate">{promo.title}</h4>
                                            <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                                                promo.status === 'sending' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 animate-pulse' : 
                                                promo.status === 'sent' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                                                'bg-slate-800 text-slate-500 border-white/5'
                                            }`}>
                                                {promo.status === 'sending' ? 'YAYINLANIYOR...' : 
                                                 promo.status === 'sent' ? 'TAMAMLANDI' : 'BEKLEMEDE'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 font-medium">{promo.content}</p>
                                        
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-600">
                                                <span>Yayılma İlerlemesi</span>
                                                <span>{promo.channel_count} / {activeChannelsCount} KANAL</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                                                <div 
                                                    className={`h-full transition-all duration-1000 ${promo.status === 'sending' ? 'bg-emerald-500' : 'bg-blue-600'}`} 
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-4 pt-2">
                                            <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest bg-slate-950/50 px-3 py-1.5 rounded-xl">
                                                <Activity size={12} className="text-blue-500" /> {promo.total_reach?.toLocaleString() || 0} ERİŞİM
                                            </div>
                                            <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest bg-slate-950/50 px-3 py-1.5 rounded-xl">
                                                <Calendar size={12} className="text-orange-500" /> {new Date(promo.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 shrink-0 w-full lg:w-auto">
                                        <button 
                                            onClick={() => handleToggleStatus(promo)}
                                            className={`w-full px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                promo.status === 'sending' ? 'bg-orange-600/10 text-orange-500 border border-orange-500/20' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-900/20'
                                            }`}
                                        >
                                            {promo.status === 'sending' ? 'DURAKLAT' : 'YAYINI BAŞLAT'}
                                        </button>
                                        <div className="flex gap-3">
                                            <button onClick={() => { setEditingPromo(promo); setIsModalOpen(true); }} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5"><Edit3 size={18}/></button>
                                            <button onClick={() => handleDelete(promo.id)} className="p-4 bg-white/5 hover:bg-red-600 rounded-2xl text-red-500 hover:text-white transition-all border border-white/5"><Trash2 size={18}/></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {isModalOpen && editingPromo && (
                <div className="fixed inset-0 z-[110] bg-black/98 flex items-center justify-center p-6 backdrop-blur-xl">
                    <div className="bg-[#020617] p-12 rounded-[64px] w-full max-w-4xl border border-white/10 overflow-y-auto max-h-[90vh] shadow-2xl relative scrollbar-hide">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-4 bg-white/5 rounded-3xl hover:bg-red-600 transition-all active:scale-90"><X size={24}/></button>
                        
                        <div className="flex items-center gap-6 mb-12">
                            <div className="w-16 h-16 bg-blue-600 rounded-[28px] flex items-center justify-center shadow-2xl shadow-blue-600/20"><Bot size={32} className="text-white"/></div>
                            <div>
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">İçerik <span className="text-blue-500">Yapılandırıcı</span></h3>
                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mt-1">Yayın Ayarları ve Linkler</p>
                            </div>
                        </div>

                        <form onSubmit={async (e) => { e.preventDefault(); await DatabaseService.savePromotion(editingPromo); setIsModalOpen(false); load(); }} className="space-y-10">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="space-y-8">
                                    <AdminInput label="BAŞLIK" value={editingPromo.title} onChange={(v: string) => setEditingPromo({...editingPromo, title: v})} />
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">MESAJ İÇERİĞİ (HTML)</label>
                                        <textarea 
                                            value={editingPromo.content} 
                                            onChange={e => setEditingPromo({...editingPromo, content: e.target.value})}
                                            className="w-full bg-slate-950 border border-white/5 rounded-3xl p-6 text-[11px] font-medium text-slate-300 h-48 focus:border-blue-500/50 outline-none resize-none shadow-inner" 
                                            placeholder="Gövde metni..."
                                        />
                                    </div>
                                </div>
                                <div className="space-y-8">
                                    <AdminInput label="MEDYA URL (RESİM)" value={editingPromo.image_url} onChange={(v: string) => setEditingPromo({...editingPromo, image_url: v})} />
                                    <div className="grid grid-cols-2 gap-6">
                                        <AdminInput label="BUTON ETİKETİ" value={editingPromo.button_text} onChange={(v: string) => setEditingPromo({...editingPromo, button_text: v})} />
                                        <AdminInput label="HEDEF LİNK" value={editingPromo.button_link} onChange={(v: string) => setEditingPromo({...editingPromo, button_link: v})} />
                                    </div>
                                    <div className="p-8 bg-slate-900/30 border border-white/5 rounded-[40px] flex items-start gap-4">
                                        <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500"><Shield size={20}/></div>
                                        <p className="text-[10px] text-slate-600 leading-relaxed font-bold uppercase italic">
                                            Sistem 'promotions' tablosunu kullanarak AdBlocker filtrelerini aşar. Herhangi bir ağ hatası alıyorsanız Supabase ayarlarını kontrol edin.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-8 rounded-[32px] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-blue-600/30 transition-all active:scale-95 border-b-8 border-blue-800 flex items-center justify-center gap-4">
                                <Save size={24} /> SİSTEME KAYDET VE KAPAT
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- USER MANAGEMENT CENTER ---
const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userBots, setUserBots] = useState<UserBot[]>([]);
    const [userChannels, setUserChannels] = useState<Channel[]>([]);
    const [userLogs, setUserLogs] = useState<ActivityLog[]>([]);
    const [isUpdating, setIsUpdating] = useState(false);
    
    // Private Notification States
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [noteTitle, setNoteTitle] = useState('');
    const [noteMessage, setNoteMessage] = useState('');
    const [isSendingNote, setIsSendingNote] = useState(false);

    useEffect(() => { load(); }, []);

    const load = async () => {
        setIsLoading(true);
        const data = await DatabaseService.getUsers();
        setUsers(data);
        setIsLoading(false);
    };

    const handleUserClick = async (user: User) => {
        setSelectedUser(user);
        setUserBots([]);
        setUserChannels([]);
        setUserLogs([]);
        
        // Fetch specific details for selected user
        const [bots, logs, channels] = await Promise.all([
            DatabaseService.getUserBots(user.id),
            supabase.from('activity_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
            DatabaseService.getChannels(user.id)
        ]);
        setUserBots(bots);
        setUserLogs(logs.data || []);
        setUserChannels(channels);
    };

    const handleSendPrivateNote = async () => {
        if (!selectedUser || !noteTitle || !noteMessage) return;
        setIsSendingNote(true);
        try {
            await DatabaseService.sendUserNotification(selectedUser.id, noteTitle, noteMessage, 'system');
            alert(`Bildirim @${selectedUser.username} kullanıcısına iletildi.`);
            setNoteTitle('');
            setNoteMessage('');
            setIsNoteModalOpen(false);
        } catch (e) {
            alert("Bildirim gönderilemedi!");
        } finally {
            setIsSendingNote(false);
        }
    };

    const updateUserStatus = async (status: 'Active' | 'Passive') => {
        if (!selectedUser) return;
        setIsUpdating(true);
        try {
            await DatabaseService.updateUserStatus(selectedUser.id, status);
            setSelectedUser({ ...selectedUser, status });
            load();
        } finally { setIsUpdating(false); }
    };

    const updateUserRole = async (role: 'Admin' | 'User' | 'Moderator') => {
        if (!selectedUser) return;
        setIsUpdating(true);
        try {
            await supabase.from('users').update({ role }).eq('id', selectedUser.id);
            setSelectedUser({ ...selectedUser, role });
            load();
        } finally { setIsUpdating(false); }
    };

    const toggleAdRights = async () => {
        if (!selectedUser) return;
        setIsUpdating(true);
        const newVal = !selectedUser.canPublishPromos;
        try {
            await supabase.from('users').update({ canPublishPromos: newVal }).eq('id', selectedUser.id);
            setSelectedUser({ ...selectedUser, canPublishPromos: newVal });
            load();
        } finally { setIsUpdating(false); }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Üye <span className="text-blue-500">Listesi</span></h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Platform kullanıcılarını ve yetkilerini yönetin.</p>
                </div>
                <div className="relative w-full lg:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input 
                        type="text" 
                        placeholder="İsim veya @username ile ara..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-xs text-white outline-none focus:border-blue-500/30 transition-all"
                    />
                </div>
            </div>

            <div className="bg-slate-900/40 border border-white/5 rounded-[40px] overflow-hidden backdrop-blur-md shadow-2xl">
                <table className="w-full text-left text-xs">
                    <thead className="bg-white/5 text-[9px] uppercase tracking-[0.2em] text-slate-500 font-black italic">
                        <tr>
                            <th className="px-8 py-6">Üye Kimliği</th>
                            <th className="px-8 py-6">Rol / Yetki</th>
                            <th className="px-8 py-6">Durum</th>
                            <th className="px-8 py-6">Katılım</th>
                            <th className="px-8 py-6 text-right italic pr-12">Yönetim</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium">
                        {filteredUsers.map(u => (
                            <tr key={u.id} className="hover:bg-white/5 transition-all cursor-pointer group" onClick={() => handleUserClick(u)}>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <img src={u.avatar} className="w-10 h-10 rounded-xl border border-white/10 bg-slate-950 object-cover" />
                                        <div>
                                            <p className="font-black text-white italic tracking-tight">{u.name}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">@{u.username}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                            u.role === 'Admin' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                                            u.role === 'Moderator' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : 
                                            'bg-slate-800 text-slate-400 border-white/5'
                                        }`}>
                                            {u.role}
                                        </span>
                                        {u.canPublishPromos && <span className="p-1 bg-emerald-500/10 text-emerald-500 rounded-lg" title="Yayın Yetkisi"><Megaphone size={12}/></span>}
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${u.status === 'Active' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                                        {u.status === 'Active' ? 'AKTİF' : 'KISITLI'}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-slate-500 text-[10px] font-bold">
                                    {new Date(u.joinDate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="px-8 py-5 text-right pr-12">
                                    <button className="p-3 bg-white/5 rounded-xl text-slate-500 group-hover:text-blue-500 group-hover:bg-blue-500/10 transition-all">
                                        <ChevronRight size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* User Command Center Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl">
                    <div className="bg-[#020617] p-12 rounded-[64px] w-full max-w-6xl border border-white/10 overflow-y-auto max-h-[90vh] shadow-2xl relative scrollbar-hide flex flex-col lg:flex-row gap-12">
                        <button onClick={() => setSelectedUser(null)} className="absolute top-10 right-10 p-4 bg-white/5 rounded-3xl hover:bg-red-600 transition-all active:scale-90"><X size={24}/></button>
                        
                        {/* Sidebar: Profile Info */}
                        <div className="lg:w-80 flex flex-col items-center text-center space-y-8 lg:border-r border-white/5 lg:pr-12 shrink-0">
                            <div className="relative">
                                <img src={selectedUser.avatar} className="w-40 h-40 rounded-[48px] border-4 border-white/5 shadow-2xl bg-slate-950 object-cover" />
                                <div className={`absolute -bottom-3 -right-3 p-3 rounded-2xl border-4 border-[#020617] shadow-xl ${selectedUser.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                    {selectedUser.status === 'Active' ? <CheckCircle2 size={24}/> : <ShieldAlert size={24}/>}
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-1">{selectedUser.name}</h3>
                                <p className="text-blue-500 font-black text-xs uppercase tracking-[0.2em]">@{selectedUser.username}</p>
                                <div className="mt-4 flex items-center justify-center gap-4">
                                    <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5 flex items-center gap-2">
                                        <Fingerprint size={12} className="text-slate-500" />
                                        <span className="text-[9px] font-black text-slate-400">{selectedUser.id}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full space-y-3">
                                <div className="p-4 bg-slate-900/30 border border-white/5 rounded-2xl text-left">
                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-1">E-POSTA</span>
                                    <span className="text-[11px] font-bold text-white italic truncate block">{selectedUser.email || 'Doğrulanmamış'}</span>
                                </div>
                                <div className="p-4 bg-slate-900/30 border border-white/5 rounded-2xl text-left">
                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-1">KAYIT TARİHİ</span>
                                    <span className="text-[11px] font-bold text-white italic">{new Date(selectedUser.joinDate).toLocaleString()}</span>
                                </div>
                            </div>

                            <button 
                                onClick={() => setIsNoteModalOpen(true)}
                                className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95"
                            >
                                <Send size={18} /> ÖZEL BİLDİRİM GÖNDER
                            </button>
                        </div>

                        {/* Main Body: Management, Channels & Bots */}
                        <div className="flex-1 space-y-12">
                            {/* Control Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] px-2 italic">ERİŞİM VE YETKİLER</h4>
                                    <div className="bg-slate-900/30 border border-white/5 rounded-[32px] overflow-hidden divide-y divide-white/5">
                                        <div className="p-6 flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20"><Ban size={20}/></div>
                                                <div>
                                                    <p className="text-[11px] font-black text-white uppercase italic">Hesabı Kısıtla</p>
                                                    <p className="text-[9px] text-slate-500 font-bold uppercase">Platforma girişi engeller</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => updateUserStatus(selectedUser.status === 'Active' ? 'Passive' : 'Active')}
                                                className={`w-14 h-7 rounded-full relative transition-all duration-500 ${selectedUser.status !== 'Active' ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'bg-slate-800'}`}
                                            >
                                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-500 ${selectedUser.status !== 'Active' ? 'left-8' : 'left-1'}`}></div>
                                            </button>
                                        </div>

                                        <div className="p-6 flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20"><Megaphone size={20}/></div>
                                                <div>
                                                    <p className="text-[11px] font-black text-white uppercase italic">Tanıtım Yetkisi</p>
                                                    <p className="text-[9px] text-slate-500 font-bold uppercase">Tanıtım yayınlama izni</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={toggleAdRights}
                                                className={`w-14 h-7 rounded-full relative transition-all duration-500 ${selectedUser.canPublishPromos ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-slate-800'}`}
                                            >
                                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-500 ${selectedUser.canPublishPromos ? 'left-8' : 'left-1'}`}></div>
                                            </button>
                                        </div>

                                        <div className="p-6 flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20"><Crown size={20}/></div>
                                                <div>
                                                    <p className="text-[11px] font-black text-white uppercase italic">Üye Rolü</p>
                                                    <p className="text-[9px] text-slate-500 font-bold uppercase">Sistem hiyerarşisi</p>
                                                </div>
                                            </div>
                                            <select 
                                                value={selectedUser.role} 
                                                onChange={e => updateUserRole(e.target.value as any)}
                                                className="bg-slate-950 border border-white/5 rounded-xl px-4 py-2 text-[10px] font-black text-white uppercase outline-none focus:border-purple-500/50"
                                            >
                                                <option value="User">Üye</option>
                                                <option value="Moderator">Moderasyon</option>
                                                <option value="Admin">Yönetici</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Asset Summary */}
                                <div className="grid grid-cols-2 gap-6 h-fit">
                                    <div className="bg-slate-900/40 p-6 rounded-[32px] border border-white/5">
                                        <Bot size={24} className="text-blue-500 mb-4" />
                                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-1">SAHİP OLUNAN BOT</span>
                                        <span className="text-2xl font-black text-white italic">{userBots.length}</span>
                                    </div>
                                    <div className="bg-slate-900/40 p-6 rounded-[32px] border border-white/5">
                                        <Megaphone size={24} className="text-purple-500 mb-4" />
                                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-1">BAĞLI KANALLAR</span>
                                        <span className="text-2xl font-black text-white italic">{userChannels.length}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Owned Channels Grid */}
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] px-2 italic">ÜYENİN SAHİP OLDUĞU KANALLAR</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {userChannels.length > 0 ? userChannels.map(channel => (
                                        <div key={channel.id} className="bg-slate-900/30 border border-white/5 p-4 rounded-3xl flex items-center justify-between hover:border-blue-500/30 transition-all">
                                            <div className="flex items-center gap-4">
                                                <img src={channel.icon} className="w-12 h-12 rounded-2xl object-cover bg-slate-950" onError={(e) => (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name)}`} />
                                                <div>
                                                    <p className="text-[11px] font-black text-white uppercase italic">{channel.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Users size={10} className="text-slate-600" />
                                                        <span className="text-[9px] font-bold text-slate-500">{channel.memberCount.toLocaleString()} Üye</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-emerald-500 text-[10px] font-black">₺{channel.revenue}</p>
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${channel.revenueEnabled ? 'bg-blue-600/10 text-blue-500' : 'bg-slate-800 text-slate-600'}`}>
                                                    {channel.revenueEnabled ? 'YAYIN AKTİF' : 'PASİF'}
                                                </span>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="col-span-2 py-12 flex flex-col items-center justify-center bg-slate-900/20 rounded-[32px] border-2 border-dashed border-white/5 opacity-30">
                                            <Megaphone size={32} />
                                            <span className="text-[9px] font-black uppercase mt-2 tracking-widest">HENÜZ KANAL BAĞLANMAMIŞ</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Owned Bots Grid */}
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] px-2 italic">KÜTÜPHANE VE ABONELİKLER</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {userBots.length > 0 ? userBots.map(bot => (
                                        <div key={bot.id} className="bg-slate-900/30 border border-white/5 p-4 rounded-3xl flex items-center gap-4 hover:border-emerald-500/30 transition-all">
                                            <img src={getLiveBotIcon(bot)} className="w-12 h-12 rounded-2xl object-cover bg-slate-950" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-black text-white uppercase italic truncate">{bot.name}</p>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase truncate">{bot.category}</p>
                                            </div>
                                            <div className="shrink-0">
                                                <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg ${bot.price > 0 ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}>
                                                    {bot.price > 0 ? 'PREMIUM' : 'FREE'}
                                                </span>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="col-span-2 py-12 flex flex-col items-center justify-center bg-slate-900/20 rounded-[32px] border-2 border-dashed border-white/5 opacity-30">
                                            <Bot size={32} />
                                            <span className="text-[9px] font-black uppercase mt-2 tracking-widest">KÜTÜPHANE BOŞ</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="pt-8 border-t border-white/5 flex items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center border border-white/5"><ShieldQuestion size={22} className="text-slate-600"/></div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">GÜVENLİK SKORU</p>
                                        <p className={`text-lg font-black italic uppercase ${selectedUser.status === 'Active' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {selectedUser.status === 'Active' ? 'GÜVENLİ PROFİL' : 'ŞÜPHELİ / KISITLI'}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedUser(null)} className="px-12 py-5 rounded-[24px] bg-slate-900 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] hover:text-white hover:bg-slate-800 transition-all active:scale-95 border border-white/5">KOMUTA PANELİNİ KAPAT</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Targeted Private Notification Modal */}
            {isNoteModalOpen && selectedUser && (
                <div className="fixed inset-0 z-[130] bg-black/98 flex items-center justify-center p-6 backdrop-blur-xl animate-in zoom-in-95">
                    <div className="bg-[#020617] p-12 rounded-[56px] w-full max-w-xl border border-white/10 shadow-2xl relative">
                        <button onClick={() => setIsNoteModalOpen(false)} className="absolute top-10 right-10 p-4 bg-white/5 rounded-2xl hover:bg-red-600 transition-all"><X size={20}/></button>
                        
                        <div className="text-center mb-10">
                            <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                                <Bell size={32} className="text-blue-500" />
                            </div>
                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">Özel <span className="text-blue-500">Bildirim</span></h3>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Alıcı: @{selectedUser.username}</p>
                        </div>

                        <div className="space-y-8">
                            <AdminInput label="BİLDİRİM BAŞLIĞI" value={noteTitle} onChange={setNoteTitle} />
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">MESAJ İÇERİĞİ</label>
                                <textarea 
                                    value={noteMessage} 
                                    onChange={e => setNoteMessage(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/5 rounded-3xl p-6 text-[11px] font-medium text-slate-400 h-40 outline-none focus:border-blue-500/40 resize-none shadow-inner"
                                    placeholder="Kullanıcıya özel mesajınızı yazın..."
                                />
                            </div>
                            
                            <button 
                                onClick={handleSendPrivateNote}
                                disabled={isSendingNote || !noteTitle || !noteMessage}
                                className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-[32px] text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/30 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                            >
                                {isSendingNote ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                                BİLDİRİMİ GÖNDER
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

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

const BotManagement = () => {
    const [bots, setBots] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBot, setEditingBot] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [screenshotUrl, setScreenshotUrl] = useState('');

    useEffect(() => { load(); }, []);
    
    const load = async () => {
        setIsLoading(true);
        const data = await DatabaseService.getBotsWithStats();
        setBots(data);
        setIsLoading(false);
    };

    const addScreenshot = () => {
        if (!screenshotUrl) return;
        const current = editingBot.screenshots || [];
        setEditingBot({ ...editingBot, screenshots: [...current, screenshotUrl] });
        setScreenshotUrl('');
    };

    const removeScreenshot = (index: number) => {
        const current = [...(editingBot.screenshots || [])];
        current.splice(index, 1);
        setEditingBot({ ...editingBot, screenshots: current });
    };

    if (isLoading) return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;

    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Bot <span className="text-blue-500">Envanteri</span></h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mağaza vitrinini ve bot özelliklerini yönetin.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-6 py-4 bg-slate-900/40 border border-white/5 rounded-2xl text-center">
                        <span className="text-[8px] font-black text-slate-600 block uppercase mb-1">TOPLAM BOT</span>
                        <span className="text-xl font-black text-white italic">{bots.length}</span>
                    </div>
                    <button 
                      onClick={() => { setEditingBot({ id: '', name: '', description: '', short_desc: '', price: 0, category: 'productivity', bot_link: '', screenshots: [], icon: '', is_premium: false }); setIsModalOpen(true); }} 
                      className="bg-blue-600 hover:bg-blue-500 px-8 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-blue-600/30 flex items-center gap-3 transition-all active:scale-95 border-b-4 border-blue-800"
                    >
                        <Plus size={20}/> YENİ MARKET BOTU EKLE
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {bots.map(b => (
                    <div key={b.id} className="bg-slate-900/40 backdrop-blur-md p-8 rounded-[48px] border border-white/5 flex flex-col gap-6 hover:border-blue-500/30 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 -mr-16 -mt-16 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all"></div>
                        
                        <div className="flex items-start justify-between relative z-10">
                            <div className="relative">
                                <img 
                                    src={getLiveBotIcon(b)} 
                                    className="w-20 h-20 rounded-[32px] border-2 border-white/10 shadow-2xl object-cover bg-slate-950 group-hover:scale-105 transition-transform" 
                                    onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(b.name)}&background=1e293b&color=fff&bold=true`; }}
                                />
                                {b.is_premium && (
                                    <div className="absolute -top-2 -left-2 bg-yellow-500 p-1.5 rounded-xl border-4 border-[#020617] shadow-lg">
                                        <Star size={12} fill="white" className="text-white" />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <button onClick={() => {setEditingBot(b); setIsModalOpen(true);}} className="p-3.5 bg-white/5 hover:bg-blue-600 rounded-2xl transition-all shadow-xl"><Edit3 size={18}/></button>
                                <button onClick={async () => { if(confirm('Bu botu kalıcı olarak silmek istediğinize emin misiniz?')) { await DatabaseService.deleteBot(b.id); load(); } }} className="p-3.5 bg-white/5 hover:bg-red-600 rounded-2xl transition-all text-red-500 hover:text-white shadow-xl"><Trash2 size={18}/></button>
                            </div>
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-black text-xl text-white italic tracking-tighter uppercase group-hover:text-blue-400 transition-colors">{b.name}</h4>
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg">{b.category}</span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium mb-4">{b.description}</p>
                            
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/50 rounded-xl border border-white/5">
                                    <ImageIcon size={12} className="text-blue-500" />
                                    <span className="text-[9px] font-black text-slate-400 uppercase">{b.screenshots?.length || 0} GÖRSEL</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/50 rounded-xl border border-white/5">
                                    <Users size={12} className="text-purple-500" />
                                    <span className="text-[9px] font-black text-slate-400 uppercase">{b.ownerCount || 0} SAHİP</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-white/5 relative z-10">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">FİYAT ETİKETİ</span>
                                <span className={`text-xl font-black italic ${b.price > 0 ? 'text-emerald-500' : 'text-blue-500'}`}>
                                    {b.price > 0 ? `${b.price} TL` : 'ÜCRETSİZ'}
                                </span>
                            </div>
                            <button onClick={() => window.open(b.bot_link, '_blank')} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 transition-all"><ExternalLink size={18}/></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && editingBot && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl">
                    <div className="bg-[#020617] p-12 rounded-[64px] w-full max-w-4xl border border-white/10 overflow-y-auto max-h-[90vh] shadow-2xl relative scrollbar-hide">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-4 bg-white/5 rounded-3xl hover:bg-red-600 transition-all active:scale-90"><X size={24}/></button>
                        
                        <div className="flex items-center gap-6 mb-12">
                            <div className="w-16 h-16 bg-blue-600 rounded-[28px] flex items-center justify-center shadow-2xl shadow-blue-600/20"><Bot size={32} className="text-white"/></div>
                            <div>
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Bot <span className="text-blue-500">Editörü</span></h3>
                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mt-1">Konfigürasyon ve Görsel Yönetimi</p>
                            </div>
                        </div>
                        
                        <form onSubmit={async (e) => { e.preventDefault(); await DatabaseService.saveBot(editingBot); setIsModalOpen(false); load(); }} className="space-y-10">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="space-y-8">
                                    <div className="grid grid-cols-2 gap-6">
                                        <AdminInput label="BOT ID (BENZERSİZ)" value={editingBot.id} onChange={(v: string) => setEditingBot({...editingBot, id: v})} />
                                        <AdminInput label="BOT İSMİ" value={editingBot.name} onChange={(v: string) => setEditingBot({...editingBot, name: v})} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">KATEGORİ</label>
                                            <select value={editingBot.category} onChange={e => setEditingBot({...editingBot, category: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-[11px] font-black text-white outline-none focus:border-blue-500/50 appearance-none">
                                                <option value="productivity">Üretkenlik</option>
                                                <option value="finance">Finans</option>
                                                <option value="utilities">Araçlar</option>
                                                <option value="games">Oyun</option>
                                                <option value="moderation">Moderasyon</option>
                                            </select>
                                        </div>
                                        <AdminInput label="FİYAT (TL)" value={editingBot.price} type="number" onChange={(v: string) => setEditingBot({...editingBot, price: v})} />
                                    </div>
                                    <AdminInput label="TELEGRAM BAĞLANTISI (@username)" value={editingBot.bot_link} onChange={(v: string) => setEditingBot({...editingBot, bot_link: v})} />
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">AÇIKLAMA METNİ</label>
                                        <textarea value={editingBot.description} onChange={e => setEditingBot({...editingBot, description: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-6 rounded-3xl text-[11px] font-medium text-slate-400 h-32 focus:border-blue-500/50 outline-none resize-none shadow-inner" />
                                    </div>
                                </div>
                                <div className="space-y-8">
                                    <div className="flex items-center gap-6 p-6 bg-slate-900/30 rounded-[32px] border border-white/5 shadow-inner">
                                        <img src={getLiveBotIcon(editingBot)} className="w-20 h-20 rounded-[28px] border-2 border-white/10 shadow-xl object-cover bg-slate-950" onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(editingBot.name || 'P')}&background=1e293b&color=fff`; }} />
                                        <div className="flex-1"><AdminInput label="ÖZEL İKON URL (OPSİYONEL)" value={editingBot.icon} onChange={(v: string) => setEditingBot({...editingBot, icon: v})} /></div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-2"><label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">EKRAN GÖRÜNTÜLERİ ({editingBot.screenshots?.length || 0})</label></div>
                                        <div className="flex gap-4"><div className="flex-1"><input type="text" value={screenshotUrl} onChange={e => setScreenshotUrl(e.target.value)} placeholder="Görsel URL ekle..." className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-[11px] font-black text-white outline-none focus:border-blue-500/50" /></div><button type="button" onClick={addScreenshot} className="bg-blue-600 hover:bg-blue-500 p-4 rounded-2xl text-white transition-all shadow-xl shadow-blue-600/20 active:scale-90"><Plus size={20}/></button></div>
                                        <div className="grid grid-cols-4 gap-4 p-6 bg-slate-950/50 rounded-[32px] border border-white/5 min-h-[120px]">{(editingBot.screenshots || []).map((url: string, idx: number) => (<div key={idx} className="relative group aspect-[9/16] rounded-xl overflow-hidden border border-white/10 shadow-lg"><img src={url} className="w-full h-full object-cover" /><button type="button" onClick={() => removeScreenshot(idx)} className="absolute top-10 right-10 p-1.5 bg-red-600 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"><X size={12}/></button></div>))}</div>
                                    </div>
                                    <div className="flex items-center justify-between p-6 bg-slate-900/30 rounded-[32px] border border-white/5"><div className="flex flex-col"><span className="text-[10px] font-black text-white uppercase italic tracking-widest">PREMIUM BOT</span></div><button type="button" onClick={() => setEditingBot({...editingBot, is_premium: !editingBot.is_premium})} className={`w-16 h-8 rounded-full relative transition-all duration-500 ${editingBot.is_premium ? 'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'bg-slate-800'}`}><div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-500 shadow-xl ${editingBot.is_premium ? 'left-9' : 'left-1'}`}></div></button></div>
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-8 rounded-[32px] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-blue-600/30 transition-all active:scale-95 border-b-8 border-blue-800 flex items-center justify-center gap-4"><CheckCircle size={24} /> MARKET BOTUNU SİSTEME KAYDET</button>
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
            className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-[11px] font-black text-white outline-none focus:border-blue-500/50" 
        />
    </div>
);

const SystemLogs = () => <div className="p-12 text-center text-slate-500 font-bold uppercase tracking-widest italic opacity-40">Sistem Kayıtları Arşivi</div>;
const SettingsManagement = () => <div className="p-12 text-center text-slate-500 font-bold uppercase tracking-widest italic opacity-40">Sistem Konfigürasyonu</div>;

export default AdminDashboard;
