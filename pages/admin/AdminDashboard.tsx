
import React, { useState, useEffect, useCallback } from 'react';
import * as Router from 'react-router-dom';
import { 
  Trash2, Megaphone, X, LayoutDashboard, Users as UsersIcon, 
  Settings, LogOut, Shield, Bell, Activity, Database, 
  Loader2, TrendingUp, DollarSign, Bot as BotIcon, 
  ChevronRight, Search, SlidersHorizontal, Plus, 
  ShieldAlert, Ban, User as UserIcon, BarChart2
} from 'lucide-react';
import { Promotion, User } from '../../types';
import { DatabaseService } from '../../services/DatabaseService';
import UserList from '../UserList';
import UserDetail from '../UserDetail';

const { Routes, Route, useNavigate, useLocation, Link } = Router as any;

// --- YARDIMCI BİLEŞENLER ---

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

// --- MODÜLLER ---

/**
 * DASHBOARD OVERVIEW
 * Canlı veriler ve genel durum özeti
 */
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
                <h3 className="text-sm font-black text-white italic uppercase tracking-widest mb-8">Son Sistem Aktiviteleri</h3>
                <div className="space-y-4">
                    <p className="text-slate-600 text-[10px] font-bold uppercase italic text-center py-12 border-2 border-dashed border-slate-800 rounded-3xl">Henüz detaylı aktivite logu bulunmuyor.</p>
                </div>
            </div>
        </div>
    );
};

/**
 * PROMOTION MANAGEMENT
 * Reklam dağıtım kontrolü
 */
const PromotionManagement = () => {
    const [promos, setPromos] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<any>(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        const data = await DatabaseService.getPromotions();
        setPromos(data);
        setIsLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'sending': return <span className="px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full text-[9px] font-black uppercase animate-pulse">YAYINDA</span>;
            case 'sent': return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase">TAMAMLANDI</span>;
            default: return <span className="px-3 py-1 bg-slate-500/10 text-slate-500 border border-white/5 rounded-full text-[9px] font-black uppercase">BEKLEMEDE</span>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Promo <span className="text-blue-500">Engine</span></h2>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2 italic">Global reklam dağıtım merkezi</p>
                </div>
                <button onClick={() => { setEditingPromo({ title: '', content: '', status: 'pending', button_text: 'İNCELE', processed_channels: [] }); setIsModalOpen(true); }} className="w-full sm:w-auto bg-emerald-600 px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 border-b-4 border-emerald-800">YENİ YAYIN FORGE ET</button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {isLoading ? <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-500" /></div> : promos.map(p => (
                    <div key={p.id} className="bg-slate-900/40 border border-white/5 rounded-[40px] p-6 lg:p-10 flex flex-col md:flex-row items-center justify-between group shadow-2xl">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                {getStatusBadge(p.status)}
                                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">{new Date(p.created_at).toLocaleDateString()}</span>
                            </div>
                            <h4 className="text-xl lg:text-2xl font-black italic uppercase text-white">{p.title}</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase italic mt-1">{p.channel_count || 0} Kanala İletildi</p>
                        </div>
                        <div className="flex gap-2 mt-6 md:mt-0">
                            <button 
                                onClick={async () => { 
                                    const nextStatus = p.status === 'sending' ? 'pending' : 'sending';
                                    await DatabaseService.updatePromotionStatus(p.id, nextStatus); 
                                    load(); 
                                }} 
                                className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${p.status === 'sending' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-blue-600 text-white shadow-lg'}`}
                            >
                                {p.status === 'sending' ? 'DURDUR' : 'BAŞLAT'}
                            </button>
                            <button onClick={async () => { if(confirm('Silsin mi?')) { await DatabaseService.deletePromotion(p.id); load(); } }} className="p-4 bg-white/5 rounded-xl text-red-500 hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18}/></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && editingPromo && (
                <div className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl animate-in fade-in">
                    <div className="bg-[#020617] p-10 lg:p-16 rounded-[64px] w-full max-w-2xl border border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all"><X size={20}/></button>
                        <h3 className="text-2xl font-black mb-10 uppercase italic tracking-tighter">Yayın <span className="text-emerald-500">Forge</span></h3>
                        <form onSubmit={async (e) => { 
                            e.preventDefault(); 
                            await DatabaseService.savePromotion({ ...editingPromo, status: 'sending' }); 
                            setIsModalOpen(false); 
                            load(); 
                        }} className="space-y-6">
                            <AdminInput label="REKLAM BAŞLIĞI" value={editingPromo.title} onChange={(v:any)=>setEditingPromo({...editingPromo, title:v})} placeholder="Haftalık Bülten..." />
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">MESAJ İÇERİĞİ</label>
                                <textarea value={editingPromo.content} onChange={e => setEditingPromo({...editingPromo, content: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-8 rounded-[32px] text-[11px] font-black h-40 outline-none text-slate-400 focus:border-emerald-500/30 uppercase italic leading-relaxed" placeholder="Reklam içeriğini buraya yazın..." />
                            </div>
                            <AdminInput label="BUTON LİNKİ" value={editingPromo.button_link} onChange={(v:any)=>setEditingPromo({...editingPromo, button_link:v})} placeholder="https://t.me/..." />
                            <button type="submit" className="w-full h-20 bg-emerald-600 rounded-[32px] font-black text-[11px] uppercase tracking-widest shadow-2xl active:scale-95 border-b-4 border-emerald-800 mt-8">DAĞITIMA BAŞLA</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * SIDEBAR & LAYOUT
 */
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
        { path: '/a/dashboard/promotions', icon: Megaphone, label: 'Reklam Forge' },
        { path: '/a/dashboard/settings', icon: Settings, label: 'Sistem Ayarları' }
    ];

    return (
        <div className="min-h-screen bg-[#020617] flex font-sans">
            {/* Sidebar */}
            <aside className="w-80 bg-slate-900/50 border-r border-white/5 hidden lg:flex flex-col h-screen sticky top-0 backdrop-blur-3xl overflow-y-auto no-scrollbar">
                <div className="p-10 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-[20px] flex items-center justify-center shadow-2xl shadow-blue-500/20 rotate-3 transition-transform hover:rotate-0">
                        <Shield size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">Admin<span className="text-blue-500">V3</span></h1>
                        <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest mt-1.5 italic">BotlyHub Control</p>
                    </div>
                </div>

                <nav className="flex-1 px-8 space-y-3 mt-4">
                    {menu.map((m) => {
                        const isActive = location.pathname === m.path;
                        return (
                            <Link 
                                key={m.path}
                                to={m.path}
                                className={`flex items-center gap-5 px-8 py-5 rounded-[24px] transition-all group relative overflow-hidden ${isActive ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20' : 'text-slate-500 hover:bg-white/5'}`}
                            >
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_white]"></div>}
                                <m.icon size={20} className={isActive ? 'text-white' : 'text-slate-700 group-hover:text-blue-500'} />
                                <span className="text-[11px] font-black uppercase tracking-widest italic">{m.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-10">
                    <button onClick={() => { DatabaseService.logoutAdmin(); navigate('/a/admin'); }} className="w-full flex items-center gap-5 px-8 py-5 rounded-[24px] text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all group">
                        <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                        <span className="text-[11px] font-black uppercase tracking-widest italic">Oturumu Kapat</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-x-hidden p-6 lg:p-12">
                <div className="max-w-7xl mx-auto">
                    <Routes>
                        <Route path="/" element={<Overview />} />
                        <Route path="/users" element={<UserList />} />
                        <Route path="/users/:id" element={<UserDetail />} />
                        <Route path="/promotions" element={<PromotionManagement />} />
                        <Route path="*" element={<div className="py-32 text-center text-slate-700 font-black uppercase italic tracking-widest">Geliştirme Aşamasında...</div>} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
