
import React, { useState, useEffect, useCallback } from 'react';
import * as Router from 'react-router-dom';
import { 
  Trash2, Megaphone, X, LayoutDashboard, Users as UsersIcon, 
  Settings, LogOut, Shield, Activity, Loader2, DollarSign, 
  Bot as BotIcon, ChevronRight, Share2, Send, Plus
} from 'lucide-react';
import { Promotion } from '../../types';
import { DatabaseService } from '../../services/DatabaseService';
import UserList from '../UserList';
import UserDetail from '../UserDetail';

const { Routes, Route, useNavigate, useLocation, Link } = Router as any;

const AdminInput = ({ label, value, onChange, placeholder }: any) => (
    <div className="space-y-2">
        <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">{label}</label>
        <input 
            type="text" 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-16 bg-slate-950 border border-white/5 rounded-[24px] px-8 text-[11px] font-black text-white outline-none focus:border-blue-500/30 transition-all uppercase italic tracking-widest shadow-inner" 
        />
    </div>
);

const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[40px] flex items-center justify-between group hover:border-blue-500/20 transition-all shadow-2xl">
        <div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 italic">{title}</p>
            <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">{value}</h3>
        </div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} shadow-lg group-hover:scale-110 transition-transform`}>
            <Icon size={24} className="text-white" />
        </div>
    </div>
);

const Overview = () => {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        DatabaseService.getAdminStats().then(data => {
            setStats(data);
            setIsLoading(false);
        });
    }, []);

    if (isLoading) return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-500" /></div>;

    return (
        <div className="space-y-12 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="TOPLAM KULLANICI" value={stats?.userCount || 0} icon={UsersIcon} color="bg-blue-600" />
                <StatCard title="TOPLAM HASILAT" value={`₺${stats?.totalRevenue || 0}`} icon={DollarSign} color="bg-emerald-600" />
                <StatCard title="AKTİF BOTLAR" value={stats?.botCount || 0} icon={BotIcon} color="bg-purple-600" />
                <StatCard title="SİSTEM LOGU" value={stats?.logCount || 0} icon={Activity} color="bg-orange-600" />
            </div>
            <div className="bg-slate-900/20 border border-white/5 rounded-[44px] p-10">
                <h3 className="text-sm font-black text-white italic uppercase tracking-widest mb-8">Sistem Durumu</h3>
                <div className="py-12 border-2 border-dashed border-slate-800 rounded-3xl text-center">
                    <p className="text-slate-600 text-[10px] font-bold uppercase italic animate-pulse">Reklam Paylaşım Motoru Yayında...</p>
                </div>
            </div>
        </div>
    );
};

/**
 * REKLAM PAYLAŞIM MERKEZİ (PromotionManagement revize edildi)
 */
const AdSharingCenter = () => {
    const [ads, setAds] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAd, setEditingAd] = useState<any>(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        const data = await DatabaseService.getPromotions();
        setAds(data);
        setIsLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'sending': return <span className="px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full text-[9px] font-black uppercase animate-pulse">PAYLAŞILIYOR</span>;
            case 'sent': return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase">TAMAMLANDI</span>;
            default: return <span className="px-3 py-1 bg-slate-500/10 text-slate-500 border border-white/5 rounded-full text-[9px] font-black uppercase">BEKLEMEDE</span>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Reklam <span className="text-blue-500">Paylaşım</span></h2>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2 italic">Kanallar üzerinden toplu reklam gönderimi yapın</p>
                </div>
                <button onClick={() => { setEditingAd({ title: '', content: '', status: 'pending', button_text: 'İNCELE', processed_channels: [] }); setIsModalOpen(true); }} className="bg-emerald-600 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 border-b-4 border-emerald-800 flex items-center gap-3">
                    <Plus size={16} /> YENİ REKLAM PAYLAŞ
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {isLoading ? <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-500" /></div> : ads.map(ad => (
                    <div key={ad.id} className="bg-slate-900/40 border border-white/5 rounded-[40px] p-8 flex flex-col md:flex-row items-center justify-between group shadow-2xl">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                {getStatusBadge(ad.status)}
                                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">{new Date(ad.created_at).toLocaleDateString()}</span>
                            </div>
                            <h4 className="text-xl font-black italic uppercase text-white truncate">{ad.title}</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase italic mt-1">{ad.channel_count || 0} Kanala İletildi</p>
                        </div>
                        <div className="flex gap-2 mt-4 md:mt-0">
                            <button 
                                onClick={async () => { 
                                    const nextStatus = ad.status === 'sending' ? 'pending' : 'sending';
                                    await DatabaseService.updatePromotionStatus(ad.id, nextStatus); 
                                    load(); 
                                }} 
                                className={`px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 ${ad.status === 'sending' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'}`}
                            >
                                {ad.status === 'sending' ? 'DURDUR' : 'BAŞLAT'}
                                <Send size={14} />
                            </button>
                            <button onClick={async () => { if(confirm('Bu reklamı listeden silmek istiyor musunuz?')) { await DatabaseService.deletePromotion(ad.id); load(); } }} className="p-4 bg-white/5 rounded-xl text-red-500 hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18}/></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && editingAd && (
                <div className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl animate-in fade-in">
                    <div className="bg-[#020617] p-10 rounded-[64px] w-full max-w-2xl border border-white/10 shadow-2xl relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-3 bg-white/5 rounded-xl text-slate-500 hover:text-white"><X size={20}/></button>
                        <h3 className="text-2xl font-black mb-8 uppercase italic tracking-tighter">Reklam <span className="text-emerald-500">Hazırla</span></h3>
                        <form onSubmit={async (e) => { 
                            e.preventDefault(); 
                            await DatabaseService.savePromotion({ ...editingAd, status: 'pending' }); 
                            setIsModalOpen(false); 
                            load(); 
                        }} className="space-y-6">
                            <AdminInput label="REKLAM BAŞLIĞI" value={editingAd.title} onChange={(v:any)=>setEditingAd({...editingAd, title:v})} placeholder="Haftalık Fırsat..." />
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">MESAJ İÇERİĞİ</label>
                                <textarea value={editingAd.content} onChange={e => setEditingAd({...editingAd, content: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-6 rounded-[32px] text-[11px] font-black h-32 outline-none text-slate-400 focus:border-emerald-500/30 uppercase italic" placeholder="Reklam mesajınızı buraya yazın..." />
                            </div>
                            <AdminInput label="BUTON LİNKİ" value={editingAd.button_link} onChange={(v:any)=>setEditingAd({...editingAd, button_link:v})} placeholder="https://t.me/..." />
                            <button type="submit" className="w-full h-16 bg-emerald-600 rounded-[32px] font-black text-[11px] uppercase tracking-widest border-b-4 border-emerald-800 shadow-xl active:scale-95">REKLAMI LİSTEYE EKLE</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!DatabaseService.isAdminLoggedIn()) {
            navigate('/a/admin');
        }
    }, [navigate]);

    const menu = [
        { path: '/a/dashboard', icon: LayoutDashboard, label: 'Panel Özeti' },
        { path: '/a/dashboard/users', icon: UsersIcon, label: 'Kullanıcılar' },
        { path: '/a/dashboard/promotions', icon: Share2, label: 'Reklam Paylaşım' },
        { path: '/a/dashboard/settings', icon: Settings, label: 'Sistem Ayarları' }
    ];

    return (
        <div className="min-h-screen bg-[#020617] flex font-sans">
            {/* Sidebar */}
            <aside className="w-72 bg-slate-900/50 border-r border-white/5 hidden lg:flex flex-col h-screen sticky top-0 backdrop-blur-3xl">
                <div className="p-10 flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-2xl">
                        <Shield size={20} className="text-white" />
                    </div>
                    <h1 className="text-xl font-black text-white italic uppercase tracking-tight">Admin<span className="text-blue-500">V3</span></h1>
                </div>
                <nav className="flex-1 px-6 space-y-2 mt-4">
                    {menu.map((m) => (
                        <Link key={m.path} to={m.path} className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${location.pathname === m.path ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20' : 'text-slate-500 hover:bg-white/5'}`}>
                            <m.icon size={18} />
                            <span className="text-[11px] font-black uppercase tracking-widest italic">{m.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="p-8">
                    <button onClick={() => { DatabaseService.logoutAdmin(); navigate('/a/admin'); }} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all group">
                        <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                        <span className="text-[11px] font-black uppercase tracking-widest">Çıkış Yap</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-6 lg:p-12 overflow-x-hidden">
                <Routes>
                    <Route path="/" element={<Overview />} />
                    <Route path="/users" element={<UserList />} />
                    <Route path="/users/:id" element={<UserDetail />} />
                    <Route path="/promotions" element={<AdSharingCenter />} />
                    <Route path="*" element={<div className="text-slate-700 font-black uppercase italic tracking-widest py-24 text-center">Modül Hazırlanıyor...</div>} />
                </Routes>
            </main>
        </div>
    );
};

export default AdminDashboard;
