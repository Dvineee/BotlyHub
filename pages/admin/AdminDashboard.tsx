
import React, { useEffect, useState } from 'react';
// Fix: Import standard react-router-dom components and hooks for v6 correctly
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bot, CreditCard, Settings, 
  LogOut, Menu, X, TrendingUp, DollarSign, Package, 
  ArrowUpRight, BarChart3, Bell, Loader2, RefreshCw, 
  Plus, Edit2, Trash2, CheckCircle, AlertCircle, Save,
  Search
} from 'lucide-react';
import { DatabaseService } from '../../services/DatabaseService';
import { User, Bot as BotType, CryptoTransaction } from '../../types';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBots: 0,
    totalRevenue: 0,
    activeSubscriptions: 0
  });

  useEffect(() => {
    if (!DatabaseService.isAdminLoggedIn()) {
      navigate('/a/admin');
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const users = await DatabaseService.getUsers();
      const bots = await DatabaseService.getBots();
      const transactions = await DatabaseService.getTransactions();
      
      const totalRev = transactions.reduce((acc, curr) => acc + (curr.amount || 0), 0);

      setStats({
        totalUsers: users.length,
        totalBots: bots.length,
        totalRevenue: totalRev,
        activeSubscriptions: users.filter(u => u.badges?.includes('Premium')).length
      });
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const SidebarItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
          isActive 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
        }`}
      >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-200">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Package className="text-white" size={24} />
            </div>
            <h2 className="text-xl font-bold text-white">BotlyHub V3</h2>
          </div>

          <nav className="flex-1 space-y-2">
            <SidebarItem to="/a/dashboard" icon={LayoutDashboard} label="Genel Bakış" />
            <SidebarItem to="/a/dashboard/users" icon={Users} label="Kullanıcılar" />
            <SidebarItem to="/a/dashboard/bots" icon={Bot} label="Bot Yönetimi" />
            <SidebarItem to="/a/dashboard/finance" icon={CreditCard} label="İşlemler" />
            <div className="my-4 border-t border-slate-800/50"></div>
            <SidebarItem to="/a/dashboard/settings" icon={Settings} label="Ayarlar" />
          </nav>

          <button 
            onClick={() => { DatabaseService.logoutAdmin(); navigate('/a/admin'); }} 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all mt-auto"
          >
            <LogOut size={20} />
            <span className="font-medium">Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 p-6 flex justify-between items-center">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 hover:bg-slate-800 rounded-lg">
            <Menu />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 relative">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-slate-950"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <img src="https://ui-avatars.com/api/?name=Admin&background=2563eb&color=fff" className="w-8 h-8 rounded-full border border-slate-700" alt="Admin" />
              <span className="text-sm font-bold text-white hidden sm:inline">Botly Admin</span>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Overview stats={stats} loading={loading} onRefresh={loadData} />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/bots" element={<BotManagement />} />
            <Route path="/finance" element={<FinanceManagement />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

// --- Sub-Component: Overview ---
const Overview = ({ stats, loading, onRefresh }: any) => (
  <div className="animate-in fade-in duration-500">
    <div className="flex justify-between items-end mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Genel Bakış</h1>
        <p className="text-slate-500 mt-1">Platformun anlık veritabanı durumu.</p>
      </div>
      <button onClick={onRefresh} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all">
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        Verileri Yenile
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <StatCard label="Toplam Kullanıcı" value={stats.totalUsers} icon={Users} color="blue" />
      <StatCard label="Yayındaki Bot" value={stats.totalBots} icon={Bot} color="emerald" />
      <StatCard label="Toplam Ciro" value={`₺${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} color="purple" />
      <StatCard label="Premium Üyeler" value={stats.activeSubscriptions} icon={TrendingUp} color="orange" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg flex items-center gap-2 text-white">
            <BarChart3 size={20} className="text-blue-500" />
            Sistem Trafiği
          </h3>
        </div>
        <div className="h-64 flex items-end justify-between gap-2 px-2">
          {[40, 70, 45, 90, 65, 80, 50, 60, 85, 45, 75, 95].map((h, i) => (
            <div key={i} className="flex-1 bg-blue-600/20 hover:bg-blue-600/40 rounded-t-lg transition-all relative group" style={{ height: `${h}%` }}>
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {h} İstek/sn
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <h3 className="font-bold text-lg mb-6 text-white">Sistem Logları</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <ArrowUpRight size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate text-slate-200">DB Senkronizasyonu</p>
                  <p className="text-[10px] text-slate-500">Başarıyla tamamlandı</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-600">12:3{i}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// --- Sub-Component: User Management ---
const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    const data = await DatabaseService.getUsers();
    setUsers(data);
    setLoading(false);
  };

  const toggleUserStatus = async (user: User) => {
    try {
      const newStatus = user.status === 'Active' ? 'Passive' : 'Active';
      await DatabaseService.updateUser({ ...user, status: newStatus as any });
      loadUsers();
    } catch (err) {
      alert("Durum güncellenemedi.");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold text-white">Kullanıcı Yönetimi</h1>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kullanıcı ara..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-800/50 border-b border-slate-800">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Kullanıcı</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Rol</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Durum</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Kayıt Tarihi</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Aksiyon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="text-sm font-bold text-white">{user.name}</p>
                          <p className="text-xs text-slate-500">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded uppercase tracking-wider">{user.role}</span>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded ${user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {user.status === 'Active' ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-400">{new Date(user.joinDate).toLocaleDateString()}</td>
                    <td className="p-4">
                      <button 
                        onClick={() => toggleUserStatus(user)} 
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                          user.status === 'Active' 
                          ? 'border-red-500/30 text-red-500 hover:bg-red-500/10' 
                          : 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10'
                        }`}
                      >
                        {user.status === 'Active' ? 'Askıya Al' : 'Aktif Et'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-slate-600 italic">Kayıt bulunamadı.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-Component: Bot Management ---
const BotManagement = () => {
  const [bots, setBots] = useState<BotType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<Partial<BotType> | null>(null);

  useEffect(() => { loadBots(); }, []);

  const loadBots = async () => {
    setLoading(true);
    const data = await DatabaseService.getBots();
    setBots(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBot) return;
    try {
      await DatabaseService.saveBot(editingBot);
      setModalOpen(false);
      loadBots();
    } catch (err) {
      alert("Bot kaydedilemedi. Supabase bağlantısını kontrol edin.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu botu sistemden kalıcı olarak silmek istediğinize emin misiniz?")) {
      try {
        await DatabaseService.deleteBot(id);
        loadBots();
      } catch (err) {
        alert("Bot silinemedi.");
      }
    }
  };

  const openModal = (bot: BotType | null = null) => {
    setEditingBot(bot || { 
      name: '', 
      description: '', 
      price: 0, 
      category: 'productivity', 
      icon: 'https://picsum.photos/seed/bot/200' 
    });
    setModalOpen(true);
  };

  return (
    <div className="animate-in fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Market Botları</h1>
        <button 
          onClick={() => openModal()} 
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
        >
          <Plus size={18} /> Yeni Bot Ekle
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots.map(bot => (
            <div key={bot.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl group hover:border-blue-500/50 transition-all shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <img src={bot.icon} className="w-16 h-16 rounded-2xl object-cover bg-slate-800 border border-slate-700" alt={bot.name} />
                <div className="min-w-0">
                  <h4 className="font-bold text-white truncate text-lg">{bot.name}</h4>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">{bot.category}</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 line-clamp-2 mb-6 h-10 leading-relaxed">{bot.description}</p>
              <div className="flex justify-between items-center pt-6 border-t border-slate-800">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Fiyat</span>
                  <span className="font-bold text-emerald-400 text-lg">₺{bot.price}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openModal(bot)} className="p-2.5 bg-slate-800 hover:bg-blue-600/10 hover:text-blue-500 rounded-xl transition-all text-slate-400">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(bot.id)} className="p-2.5 bg-slate-800 hover:bg-red-600/10 hover:text-red-500 rounded-xl transition-all text-slate-400">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {bots.length === 0 && (
            <div className="col-span-full py-20 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl">
              <Bot className="mx-auto mb-4 opacity-10" size={60} />
              <p className="text-slate-500 italic">Veritabanında kayıtlı bot bulunamadı.</p>
            </div>
          )}
        </div>
      )}

      {/* Bot Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-8 animate-in zoom-in-95">
            <h3 className="text-2xl font-bold mb-8 text-white">{editingBot?.id ? 'Botu Güncelle' : 'Yeni Market Botu'}</h3>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">Bot Adı</label>
                <input 
                  type="text" 
                  value={editingBot?.name} 
                  onChange={e => setEditingBot({...editingBot!, name: e.target.value})} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm focus:border-blue-500 outline-none transition-all" 
                  placeholder="Örn: Task Master"
                  required 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">Kısa Açıklama</label>
                <textarea 
                  value={editingBot?.description} 
                  onChange={e => setEditingBot({...editingBot!, description: e.target.value})} 
                  className="w-full h-28 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm focus:border-blue-500 outline-none resize-none transition-all" 
                  placeholder="Botun ne yaptığını kısaca anlatın..."
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">Fiyat (₺)</label>
                  <input 
                    type="number" 
                    value={editingBot?.price} 
                    onChange={e => setEditingBot({...editingBot!, price: Number(e.target.value)})} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm focus:border-blue-500 outline-none transition-all" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">Kategori</label>
                  <select 
                    value={editingBot?.category} 
                    onChange={e => setEditingBot({...editingBot!, category: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm focus:border-blue-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="productivity">Üretkenlik</option>
                    <option value="games">Oyun</option>
                    <option value="finance">Finans</option>
                    <option value="moderation">Moderasyon</option>
                    <option value="music">Müzik</option>
                    <option value="utilities">Araçlar</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">İkon URL</label>
                <input 
                  type="text" 
                  value={editingBot?.icon} 
                  onChange={e => setEditingBot({...editingBot!, icon: e.target.value})} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm focus:border-blue-500 outline-none transition-all" 
                  required 
                />
              </div>
              <div className="flex gap-4 pt-6">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)} 
                  className="flex-1 py-4 text-sm font-bold text-slate-400 hover:bg-slate-800 rounded-xl transition-all"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={18} /> Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-Component: Finance Management ---
const FinanceManagement = () => {
  const [txs, setTxs] = useState<CryptoTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    const data = await DatabaseService.getTransactions();
    setTxs(data);
    setLoading(false);
  };

  return (
    <div className="animate-in fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Finansal İşlemler</h1>
        <button onClick={loadTransactions} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition-colors">
          <RefreshCw className={loading ? 'animate-spin' : ''} size={20} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-800/50 border-b border-slate-800">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">İşlem ID / Hash</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Tür</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Miktar</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Tarih</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {txs.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-4">
                      <p className="text-xs font-mono text-slate-400 truncate w-32" title={tx.hash}>{tx.hash || tx.id}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${tx.type === 'Withdrawal' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                          {tx.type === 'Withdrawal' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                        </div>
                        <span className="text-sm font-bold text-slate-200">{tx.type}</span>
                      </div>
                    </td>
                    <td className={`p-4 text-sm font-bold ${tx.type === 'Withdrawal' ? 'text-red-400' : 'text-emerald-400'}`}>
                      {tx.type === 'Withdrawal' ? '-' : '+'}{tx.amount} {tx.symbol}
                    </td>
                    <td className="p-4 text-xs text-slate-400">{new Date(tx.date).toLocaleString('tr-TR')}</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded tracking-wider uppercase ${
                        tx.status === 'Success' ? 'bg-emerald-500/10 text-emerald-500' : 
                        tx.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {txs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-slate-600 italic">Finansal veri bulunamadı.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-sm hover:border-slate-700 transition-all">
    <div className={`w-12 h-12 rounded-2xl bg-${color}-600/10 text-${color}-500 flex items-center justify-center mb-4`}>
      <Icon size={24} />
    </div>
    <p className="text-slate-500 text-sm font-medium">{label}</p>
    <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
  </div>
);

// Helper for transaction list
const ArrowDownLeft = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="17" y1="7" x2="7" y2="17"></line>
    <polyline points="17 17 7 17 7 7"></polyline>
  </svg>
);

export default AdminDashboard;
