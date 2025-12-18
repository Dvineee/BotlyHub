
import React, { useEffect, useState } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bot, LogOut, Menu, X, 
  Package, Loader2, RefreshCw, Plus, Edit2, Trash2, 
  Mail, Phone, Image as ImageIcon, Megaphone, Calendar,
  Settings as SettingsIcon, ShieldCheck, Percent, Globe, MessageSquare, AlertTriangle
} from 'lucide-react';
import { DatabaseService } from '../../services/DatabaseService';
import { User, Bot as BotType, Announcement } from '../../types';

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
        className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
      >
        <Icon size={20} />
        <span className="font-bold text-sm">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] flex text-slate-200 font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-[70] w-72 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-12 px-2">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20"><Package className="text-white" size={24} /></div>
                <h2 className="text-xl font-black text-white tracking-tight">BOTLY <span className="text-blue-500">ADMIN</span></h2>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-500"><X size={24}/></button>
          </div>
          
          <nav className="flex-1 space-y-2">
            <NavItem to="/a/dashboard" icon={LayoutDashboard} label="Kontrol Paneli" />
            <NavItem to="/a/dashboard/users" icon={Users} label="Kullanıcılar" />
            <NavItem to="/a/dashboard/bots" icon={Bot} label="Market Botları" />
            <NavItem to="/a/dashboard/announcements" icon={Megaphone} label="Duyurular" />
            <NavItem to="/a/dashboard/settings" icon={SettingsIcon} label="Sistem Ayarları" />
          </nav>
          
          <button 
            onClick={() => { DatabaseService.logoutAdmin(); navigate('/a/admin'); }} 
            className="flex items-center gap-3 px-4 py-4 text-red-400 font-bold hover:bg-red-500/10 rounded-2xl transition-colors mt-auto"
          >
            <LogOut size={20} /> <span>Oturumu Kapat</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
        <header className="h-20 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md shrink-0">
           <button onClick={() => setSidebarOpen(true)} className="p-2.5 bg-slate-800 rounded-xl lg:hidden text-slate-300">
             <Menu size={22}/>
           </button>
           
           <div className="flex items-center gap-4 ml-auto">
              <div className="text-right hidden xs:block">
                  <p className="text-xs font-bold text-white leading-none mb-1">System Admin</p>
                  <p className="text-[10px] text-emerald-500 font-bold flex items-center justify-end gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Çevrimiçi
                  </p>
              </div>
              <div className="w-10 h-10 rounded-xl border border-slate-700 overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=Admin&background=2563eb&color=fff" className="w-full h-full object-cover" />
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto pb-10">
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/bots" element={<BotManagement />} />
              <Route path="/announcements" element={<AnnouncementManagement />} />
              <Route path="/settings" element={<SettingsManagement />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
};

const HomeView = () => (
    <div className="animate-in fade-in space-y-8">
        <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-black text-white">Hoşgeldin, Admin! 👋</h1>
            <p className="text-slate-500 text-sm">Platformun genel durumu ve son aktiviteler.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard label="Top. Kullanıcı" value="1,240" icon={Users} color="blue"/>
            <StatCard label="Yayındaki Bot" value="48" icon={Bot} color="emerald"/>
            <StatCard label="Aktif Duyuru" value="5" icon={Megaphone} color="purple"/>
        </div>
    </div>
);

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { load(); }, []);
  const load = async () => {
      setIsLoading(true);
      setUsers(await DatabaseService.getUsers());
      setIsLoading(false);
  };

  const formatDate = (dateStr: string) => {
      try {
          return new Date(dateStr).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
      } catch (e) { return dateStr; }
  };

  return (
    <div className="animate-in fade-in">
      <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black text-white">Kullanıcılar</h1>
          <button onClick={load} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors">
              <RefreshCw size={20} className={isLoading ? 'animate-spin text-blue-400' : 'text-slate-400'} />
          </button>
      </div>

      <div className="bg-slate-900 rounded-[32px] border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-slate-800/50 text-[10px] text-slate-500 uppercase font-black tracking-widest border-b border-slate-800">
                <tr>
                  <th className="p-6">Profil</th>
                  <th className="p-6">İletişim</th>
                  <th className="p-6">Kayıt</th>
                  <th className="p-6 text-center">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.length > 0 ? users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-6 flex items-center gap-4">
                      <img src={u.avatar} className="w-10 h-10 rounded-xl border border-slate-800 flex-shrink-0" />
                      <div className="min-w-0">
                          <p className="font-bold text-white text-sm truncate">{u.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">@{u.username || 'user'}</p>
                      </div>
                    </td>
                    <td className="p-6">
                       <div className="space-y-1">
                            <p className="text-[11px] text-slate-400 truncate">{u.email || '-'}</p>
                            <p className="text-[11px] text-slate-500 truncate">{u.phone || '-'}</p>
                       </div>
                    </td>
                    <td className="p-6">
                        <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">{formatDate(u.joinDate)}</span>
                    </td>
                    <td className="p-6 text-center">
                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                            {u.status}
                        </span>
                    </td>
                  </tr>
                )) : (
                    <tr>
                        <td colSpan={4} className="p-20 text-center">
                            {isLoading ? <Loader2 className="animate-spin mx-auto text-blue-500" /> : <p className="text-slate-600 font-bold italic">Kullanıcı bulunamadı.</p>}
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

const SettingsManagement = () => {
    const [settings, setSettings] = useState({
        appName: 'BotlyHub V3',
        maintenanceMode: false,
        commissionRate: 5,
        supportLink: 'https://t.me/support',
        globalLang: 'tr'
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            alert("Sistem ayarları başarıyla güncellendi.");
        }, 1000);
    };

    return (
        <div className="animate-in fade-in space-y-8">
            <h1 className="text-2xl font-black text-white">Sistem Ayarları</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* General Config */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Globe className="text-blue-500" size={20} />
                        <h3 className="font-bold">Genel Yapılandırma</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Uygulama Adı</label>
                            <input type="text" value={settings.appName} onChange={e => setSettings({...settings, appName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm focus:border-blue-500 outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Destek Kanalı Linki</label>
                            <input type="text" value={settings.supportLink} onChange={e => setSettings({...settings, supportLink: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm focus:border-blue-500 outline-none transition-all" />
                        </div>
                    </div>
                </div>

                {/* Economic & Status */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Percent className="text-emerald-500" size={20} />
                        <h3 className="font-bold">Ekonomi ve Durum</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                            <div>
                                <p className="text-sm font-bold text-white">Bakım Modu</p>
                                <p className="text-[10px] text-slate-500">Kullanıcı erişimini kısıtlar.</p>
                            </div>
                            <button 
                                onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                                className={`w-12 h-6 rounded-full relative transition-colors ${settings.maintenanceMode ? 'bg-red-500' : 'bg-slate-800'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Varsayılan Komisyon (%)</label>
                            <input type="number" value={settings.commissionRate} onChange={e => setSettings({...settings, commissionRate: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm focus:border-emerald-500 outline-none transition-all" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Warning Box */}
            <div className="bg-orange-500/5 border border-orange-500/10 p-6 rounded-[24px] flex items-start gap-4">
                <AlertTriangle className="text-orange-500 shrink-0 mt-1" size={20} />
                <div>
                    <p className="text-orange-400 text-sm font-bold">Önemli Uyarı</p>
                    <p className="text-orange-400/70 text-xs mt-1">Bu ayarlar tüm kullanıcıları ve ödeme süreçlerini doğrudan etkiler. Değişiklik yapmadan önce iki kez kontrol edin.</p>
                </div>
            </div>

            <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full sm:w-auto px-12 py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black rounded-3xl shadow-xl shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
                {isSaving ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />}
                Ayarları Kaydet ve Yayına Al
            </button>
        </div>
    );
}

const AnnouncementManagement = () => {
    const [anns, setAnns] = useState<Announcement[]>([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Partial<Announcement>>({});

    useEffect(() => { load(); }, []);
    const load = async () => setAnns(await DatabaseService.getAnnouncements());

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await DatabaseService.saveAnnouncement(editing);
        setModalOpen(false);
        load();
    };

    return (
        <div className="animate-in fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h1 className="text-2xl font-black text-white">Duyurular</h1>
                <button onClick={() => { setEditing({ color_scheme: 'blue', is_active: true }); setModalOpen(true); }} className="w-full sm:w-auto bg-blue-600 px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"> <Plus size={18} /> Yeni Duyuru </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {anns.map(a => (
                    <div key={a.id} className="bg-slate-900 border border-slate-800 p-6 rounded-[32px] flex flex-col justify-between">
                        <div className="mb-6">
                            <h4 className="font-bold text-lg text-white mb-1">{a.title}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{a.description}</p>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${
                                a.color_scheme === 'purple' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                a.color_scheme === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>{a.color_scheme}</span>
                            <div className="flex gap-2">
                                <button onClick={() => { setEditing(a); setModalOpen(true); }} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"><Edit2 size={16} className="text-slate-400"/></button>
                                <button onClick={async () => { if(confirm("Duyuru silinsin mi?")) { await DatabaseService.deleteAnnouncement(a.id); load(); } }} className="p-2.5 bg-slate-800 hover:bg-red-500/10 rounded-xl transition-colors text-red-500"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-md">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[40px] p-6 sm:p-10 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-2xl font-black mb-8 text-white">Duyuru Oluştur</h3>
                        <form onSubmit={handleSave} className="space-y-6">
                            <input type="text" value={editing.title} onChange={e => setEditing({...editing, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm" placeholder="Başlık" required />
                            <textarea value={editing.description} onChange={e => setEditing({...editing, description: e.target.value})} className="w-full h-24 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm resize-none" placeholder="Açıklama" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input type="text" value={editing.button_text} onChange={e => setEditing({...editing, button_text: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm" placeholder="Buton Metni" />
                                <input type="text" value={editing.button_link} onChange={e => setEditing({...editing, button_link: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm" placeholder="Buton Linki" />
                            </div>
                            <select value={editing.color_scheme} onChange={e => setEditing({...editing, color_scheme: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm appearance-none outline-none focus:border-blue-500 transition-all">
                                <option value="blue">Mavi Tema</option>
                                <option value="purple">Mor Tema</option>
                                <option value="emerald">Yeşil Tema</option>
                            </select>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 bg-slate-800 py-4 rounded-3xl font-bold">İptal</button>
                                <button type="submit" className="flex-1 bg-blue-600 py-4 rounded-3xl font-black text-white">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const BotManagement = () => {
  const [bots, setBots] = useState<BotType[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<Partial<BotType>>({});
  const [tempScr, setTempScr] = useState('');

  useEffect(() => { load(); }, []);
  const load = async () => setBots(await DatabaseService.getBots());

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await DatabaseService.saveBot(editingBot);
    setModalOpen(false);
    load();
  };

  const addScr = () => { if(tempScr) { setEditingBot({...editingBot, screenshots: [...(editingBot.screenshots || []), tempScr]}); setTempScr(''); } };

  return (
    <div className="animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <h1 className="text-2xl font-black text-white">Market Botları</h1>
        <button onClick={() => { setEditingBot({ category: 'productivity', screenshots: [] }); setModalOpen(true); }} className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"> <Plus size={20} /> Yeni Bot Tanımla </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {bots.map(b => (
          <div key={b.id} className="bg-slate-900 border border-slate-800 p-6 rounded-[32px] hover:border-blue-500/50 transition-all group shadow-sm flex flex-col">
             <div className="flex gap-5 mb-6">
                <img src={b.icon} className="w-16 h-16 rounded-2xl object-cover border border-slate-800 bg-slate-850 flex-shrink-0" />
                <div className="min-w-0">
                   <h4 className="font-bold text-white text-base truncate">{b.name}</h4>
                   <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">{b.category}</p>
                   <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-emerald-400 font-black text-xs">Stars {b.price}</span>
                   </div>
                </div>
             </div>
             <div className="flex gap-2 pt-6 border-t border-slate-800/50 mt-auto">
                <button onClick={() => { setEditingBot(b); setModalOpen(true); }} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all text-xs font-bold flex items-center justify-center gap-2"> <Edit2 size={14}/> Düzenle </button>
                <button onClick={async () => { if(confirm("Silmek istediğine emin misin?")) { await DatabaseService.deleteBot(b.id); load(); } }} className="p-3 bg-slate-800 hover:bg-red-500/10 text-red-500 rounded-xl transition-all"> <Trash2 size={16}/> </button>
             </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-[40px] p-6 sm:p-10 overflow-y-auto max-h-[90vh] no-scrollbar">
            <h3 className="text-2xl font-black mb-10 text-white tracking-tight">{editingBot.id ? 'Botu Güncelle' : 'Yeni Bot Kaydı'}</h3>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bot Başlığı</label>
                      <input type="text" value={editingBot.name} onChange={e => setEditingBot({...editingBot, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm" placeholder="Task Master Bot" required />
                  </div>
                  <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Fiyat (Stars)</label>
                      <input type="number" value={editingBot.price} onChange={e => setEditingBot({...editingBot, price: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm" required />
                  </div>
              </div>
              <textarea value={editingBot.description} onChange={e => setEditingBot({...editingBot, description: e.target.value})} className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm resize-none" placeholder="Bot Açıklaması" required />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <input type="text" value={editingBot.bot_link} onChange={e => setEditingBot({...editingBot, bot_link: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm" placeholder="Telegram Linki" required />
                <input type="text" value={editingBot.icon} onChange={e => setEditingBot({...editingBot, icon: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm" placeholder="İkon URL" required />
              </div>
              
              <div className="border border-slate-800 p-6 rounded-3xl bg-slate-950/50">
                 <p className="text-[10px] font-black text-slate-500 mb-4 uppercase flex items-center gap-2"><ImageIcon size={14}/> Ekran Görüntüleri ({editingBot.screenshots?.length || 0})</p>
                 <div className="flex gap-3 mb-6">
                    <input type="text" value={tempScr} onChange={e => setTempScr(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs" placeholder="Görsel URL..." />
                    <button type="button" onClick={addScr} className="bg-slate-800 px-6 rounded-xl text-xs font-bold whitespace-nowrap">EKLE</button>
                 </div>
                 <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                    {editingBot.screenshots?.map((s, idx) => (
                        <div key={idx} className="relative w-20 h-32 rounded-xl border border-slate-800 overflow-hidden flex-shrink-0 group">
                           <img src={s} className="w-full h-full object-cover" />
                           <button type="button" onClick={() => setEditingBot({...editingBot, screenshots: editingBot.screenshots?.filter((_, i) => i !== idx)})} className="absolute top-2 right-2 bg-red-600 text-white rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                        </div>
                    ))}
                 </div>
              </div>

              <div className="flex gap-4 pt-8">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 bg-slate-800 py-4 sm:py-5 rounded-3xl font-bold">Vazgeç</button>
                <button type="submit" className="flex-1 bg-blue-600 py-4 sm:py-5 rounded-3xl font-black text-white"> KAYDET </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] relative overflow-hidden group">
    <div className={`w-14 h-14 rounded-2xl bg-${color}-500/10 text-${color}-500 flex items-center justify-center mb-6 border border-${color}-500/20 group-hover:scale-110 transition-transform`}> 
      <Icon size={28} /> 
    </div>
    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{label}</p>
    <h3 className="text-3xl font-black text-white mt-2">{value}</h3>
    <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${color}-500/5 rounded-full blur-2xl group-hover:bg-${color}-500/10 transition-all`} />
  </div>
);

export default AdminDashboard;
