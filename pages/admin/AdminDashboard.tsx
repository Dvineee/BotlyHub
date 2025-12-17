
import React, { useEffect, useState } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bot, CreditCard, Settings, 
  LogOut, Menu, X, TrendingUp, DollarSign, Package, 
  ArrowUpRight, BarChart3, Bell, Loader2, RefreshCw, 
  Plus, Edit2, Trash2, Save, Mail, Phone, Image as ImageIcon, Link as LinkIcon, Sparkles, Megaphone, Calendar
} from 'lucide-react';
import { DatabaseService } from '../../services/DatabaseService';
import { User, Bot as BotType, Announcement } from '../../types';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!DatabaseService.isAdminLoggedIn()) navigate('/a/admin');
  }, [navigate]);

  const NavItem = ({ to, icon: Icon, label }: any) => {
    const active = location.pathname === to;
    return (
      <Link to={to} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
        <Icon size={20} />
        <span className="font-bold text-sm">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-200 font-sans">
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-12 px-2">
            <div className="p-2 bg-blue-600 rounded-xl"><Package className="text-white" size={24} /></div>
            <h2 className="text-xl font-black text-white tracking-tight">BOTLY <span className="text-blue-500">ADMIN</span></h2>
          </div>
          <nav className="flex-1 space-y-2">
            <NavItem to="/a/dashboard" icon={LayoutDashboard} label="Kontrol Paneli" />
            <NavItem to="/a/dashboard/users" icon={Users} label="Kullanıcılar" />
            <NavItem to="/a/dashboard/bots" icon={Bot} label="Market Botları" />
            <NavItem to="/a/dashboard/announcements" icon={Megaphone} label="Duyurular" />
          </nav>
          <button onClick={() => { DatabaseService.logoutAdmin(); navigate('/a/admin'); }} className="flex items-center gap-3 px-4 py-4 text-red-400 font-bold hover:bg-red-500/10 rounded-2xl">
            <LogOut size={20} /> <span>Oturumu Kapat</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
           <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 bg-slate-800 rounded-xl lg:hidden"><Menu/></button>
           <div className="flex items-center gap-4 ml-auto">
              <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-white">System Admin</p>
                  <p className="text-[10px] text-emerald-500 font-bold">● Sunucu Çevrimiçi</p>
              </div>
              <img src="https://ui-avatars.com/api/?name=A&background=2563eb&color=fff" className="w-10 h-10 rounded-xl border border-slate-700" />
           </div>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in"><StatCard label="Top. Kullanıcı" value="1,240" icon={Users} color="blue"/><StatCard label="Yayındaki Bot" value="48" icon={Bot} color="emerald"/><StatCard label="Duyuru Sayısı" value="5" icon={Megaphone} color="purple"/></div>} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/bots" element={<BotManagement />} />
            <Route path="/announcements" element={<AnnouncementManagement />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

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
          <h1 className="text-2xl font-black">Kullanıcı Yönetimi</h1>
          <button onClick={load} className="p-2.5 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors">
              <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
      </div>

      <div className="bg-slate-900 rounded-[32px] border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-800/50 text-[10px] text-slate-500 uppercase font-black tracking-widest border-b border-slate-800">
                <tr>
                  <th className="p-6">Kullanıcı Profil</th>
                  <th className="p-6">İletişim Bilgileri</th>
                  <th className="p-6">Kayıt Tarihi</th>
                  <th className="p-6 text-center">Durum / Rol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.length > 0 ? users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-6 flex items-center gap-4">
                      <img src={u.avatar} className="w-12 h-12 rounded-2xl border border-slate-800" />
                      <div>
                          <p className="font-bold text-white text-sm">{u.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">@{u.username || 'user'}</p>
                          <p className="text-[9px] text-blue-500/80 mt-1 font-mono">UID: {u.id}</p>
                      </div>
                    </td>
                    <td className="p-6">
                       <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Mail size={12} className="text-slate-600" />
                                <span>{u.email || <span className="text-slate-700 italic">Belirtilmemiş</span>}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Phone size={12} className="text-slate-600" />
                                <span>{u.phone || <span className="text-slate-700 italic">Belirtilmemiş</span>}</span>
                            </div>
                       </div>
                    </td>
                    <td className="p-6">
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                            <Calendar size={12} className="text-slate-600" />
                            <span>{formatDate(u.joinDate)}</span>
                        </div>
                    </td>
                    <td className="p-6 text-center">
                        <div className="flex flex-col items-center gap-2">
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                {u.status}
                            </span>
                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{u.role}</span>
                        </div>
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

// ... Rest of the file (BotManagement, AnnouncementManagement, StatCard) remains the same ...

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
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-black">Duyuru Yönetimi</h1>
                <button onClick={() => { setEditing({ color_scheme: 'blue', is_active: true }); setModalOpen(true); }} className="bg-blue-600 px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2"> <Plus size={18} /> Yeni Duyuru </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {anns.map(a => (
                    <div key={a.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex justify-between items-start">
                        <div>
                            <h4 className="font-bold text-lg">{a.title}</h4>
                            <p className="text-xs text-slate-500 mb-4">{a.description}</p>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded bg-${a.color_scheme}-500/10 text-${a.color_scheme}-500 uppercase`}>{a.color_scheme}</span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { setEditing(a); setModalOpen(true); }} className="p-2 bg-slate-800 rounded-lg"><Edit2 size={16}/></button>
                            <button onClick={async () => { await DatabaseService.deleteAnnouncement(a.id); load(); }} className="p-2 bg-slate-800 rounded-lg text-red-500"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl p-8">
                        <h3 className="text-xl font-bold mb-6">Duyuru Düzenle</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <input type="text" value={editing.title} onChange={e => setEditing({...editing, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm" placeholder="Başlık" required />
                            <textarea value={editing.description} onChange={e => setEditing({...editing, description: e.target.value})} className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm" placeholder="Açıklama" />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" value={editing.button_text} onChange={e => setEditing({...editing, button_text: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm" placeholder="Buton Metni" />
                                <input type="text" value={editing.button_link} onChange={e => setEditing({...editing, button_link: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm" placeholder="Buton Linki (/premium vb.)" />
                            </div>
                            <select value={editing.color_scheme} onChange={e => setEditing({...editing, color_scheme: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm">
                                <option value="blue">Mavi</option>
                                <option value="purple">Mor</option>
                                <option value="emerald">Yeşil</option>
                                <option value="orange">Turuncu</option>
                            </select>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 bg-slate-800 py-3 rounded-xl font-bold">İptal</button>
                                <button type="submit" className="flex-1 bg-blue-600 py-3 rounded-xl font-bold">Kaydet</button>
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
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-black">Market Bot Yönetimi</h1>
        <button onClick={() => { setEditingBot({ category: 'productivity', screenshots: [] }); setModalOpen(true); }} className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95"> <Plus size={20} /> Yeni Bot Tanımla </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bots.map(b => (
          <div key={b.id} className="bg-slate-900 border border-slate-800 p-6 rounded-[32px] hover:border-blue-500/50 transition-all group shadow-sm">
             <div className="flex gap-5 mb-6">
                <img src={b.icon} className="w-20 h-20 rounded-3xl object-cover border border-slate-800 bg-slate-850" />
                <div className="min-w-0">
                   <h4 className="font-bold text-white text-lg truncate">{b.name}</h4>
                   <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">{b.category}</p>
                   <p className="text-emerald-400 font-black text-sm mt-2">₺{b.price}</p>
                </div>
             </div>
             <div className="flex gap-2 pt-6 border-t border-slate-800/50">
                <button onClick={() => { setEditingBot(b); setModalOpen(true); }} className="flex-1 py-3 bg-slate-800 hover:bg-blue-600/10 hover:text-blue-400 rounded-xl transition-all text-xs font-bold flex items-center justify-center gap-2"> <Edit2 size={14}/> Düzenle </button>
                <button onClick={async () => { if(confirm("Silmek istediğine emin misin?")) { await DatabaseService.deleteBot(b.id); load(); } }} className="p-3 bg-slate-800 hover:bg-red-500/10 text-red-500 rounded-xl transition-all"> <Trash2 size={16}/> </button>
             </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-[40px] p-10 overflow-y-auto max-h-[90vh]">
            <h3 className="text-3xl font-black mb-10 text-white tracking-tight">{editingBot.id ? 'Botu Güncelle' : 'Yeni Bot Kaydı'}</h3>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Bot Başlığı</label>
                      <input type="text" value={editingBot.name} onChange={e => setEditingBot({...editingBot, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm" placeholder="Task Master Bot" required />
                  </div>
                  <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Fiyat (Stars/Yıldız)</label>
                      <input type="number" value={editingBot.price} onChange={e => setEditingBot({...editingBot, price: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm" required />
                  </div>
              </div>
              <textarea value={editingBot.description} onChange={e => setEditingBot({...editingBot, description: e.target.value})} className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm" placeholder="Bot Açıklaması" required />
              <div className="grid grid-cols-2 gap-6">
                <input type="text" value={editingBot.bot_link} onChange={e => setEditingBot({...editingBot, bot_link: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm" placeholder="Telegram Linki" required />
                <input type="text" value={editingBot.icon} onChange={e => setEditingBot({...editingBot, icon: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm" placeholder="İkon URL" required />
              </div>
              
              <div className="border border-slate-800 p-6 rounded-3xl bg-slate-950/50">
                 <p className="text-[10px] font-black text-slate-500 mb-4 uppercase flex items-center gap-2"><ImageIcon size={14}/> Ekran Görüntüleri ({editingBot.screenshots?.length || 0})</p>
                 <div className="flex gap-3 mb-6">
                    <input type="text" value={tempScr} onChange={e => setTempScr(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs" placeholder="Görsel URL (upload simülasyonu)..." />
                    <button type="button" onClick={addScr} className="bg-slate-800 px-6 rounded-xl text-xs font-bold">EKLE</button>
                 </div>
                 <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                    {editingBot.screenshots?.map((s, idx) => (
                        <div key={idx} className="relative w-24 h-40 rounded-xl border border-slate-800 overflow-hidden flex-shrink-0 group">
                           <img src={s} className="w-full h-full object-cover" />
                           <button type="button" onClick={() => setEditingBot({...editingBot, screenshots: editingBot.screenshots?.filter((_, i) => i !== idx)})} className="absolute top-2 right-2 bg-red-600 text-white rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                        </div>
                    ))}
                 </div>
              </div>

              <div className="flex gap-4 pt-8">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 bg-slate-800 py-5 rounded-[24px] font-bold">Vazgeç</button>
                <button type="submit" className="flex-1 bg-blue-600 py-5 rounded-[24px] font-black text-white"> KAYDET </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] relative overflow-hidden">
    <div className={`w-14 h-14 rounded-2xl bg-${color}-500/10 text-${color}-500 flex items-center justify-center mb-6 border border-${color}-500/20`}> <Icon size={28} /> </div>
    <p className="text-slate-500 text-xs font-black uppercase">{label}</p>
    <h3 className="text-3xl font-black text-white mt-2">{value}</h3>
  </div>
);

export default AdminDashboard;
