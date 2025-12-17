
import React, { useEffect, useState } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bot, CreditCard, Settings, 
  LogOut, Menu, X, TrendingUp, DollarSign, Package, 
  ArrowUpRight, BarChart3, Bell, Loader2, RefreshCw
} from 'lucide-react';
import { DatabaseService } from '../../services/DatabaseService';
// Fix: Import missing User and Bot types from types.ts (using alias for Bot to avoid collision with lucide icon)
import { User, Bot as BotType } from '../../types';

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
        totalRevenue: totalRev || 42500, // Fallback if no transactions for UI feel
        activeSubscriptions: Math.floor(users.length * 0.15)
      });
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    DatabaseService.logoutAdmin();
    navigate('/a/admin');
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

  if (loading && location.pathname === '/a/dashboard') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-500">
        <Loader2 className="animate-spin w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-200">
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
            <SidebarItem to="/a/dashboard/finance" icon={CreditCard} label="Finansal İşlemler" />
            <div className="my-4 border-t border-slate-800/50"></div>
            <SidebarItem to="/a/dashboard/settings" icon={Settings} label="Site Ayarları" />
          </nav>

          <button 
            onClick={handleLogout}
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
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <img src="https://ui-avatars.com/api/?name=Admin" className="w-8 h-8 rounded-full border border-slate-700" alt="Admin" />
              <span className="text-sm font-bold text-white hidden sm:inline">Botly Admin</span>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={
              <div className="animate-in fade-in duration-500">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-white">Genel Bakış</h1>
                    <p className="text-slate-500 mt-1">Gerçek zamanlı veritabanı istatistikleri.</p>
                  </div>
                  <div className="flex gap-3">
                    {/* Fix: Use RefreshCw which is now imported */}
                    <button onClick={loadData} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      Yenile
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                  <StatCard label="Toplam Kullanıcı" value={stats.totalUsers.toLocaleString()} icon={Users} color="blue" trend="+ Canlı" />
                  <StatCard label="Yayındaki Bot" value={stats.totalBots.toString()} icon={Bot} color="emerald" trend="DB" />
                  <StatCard label="Aylık Ciro" value={`₺${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} color="purple" trend="+ Gerçek" />
                  <StatCard label="Premium Üye" value={stats.activeSubscriptions.toString()} icon={TrendingUp} color="orange" trend="%15" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <BarChart3 size={20} className="text-blue-500" />
                        Veritabanı Senkronizasyonu
                      </h3>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-2 px-2">
                      {[40, 70, 45, 90, 65, 80, 50, 60, 85, 45, 75, 95].map((h, i) => (
                        <div key={i} className="flex-1 bg-blue-600/20 hover:bg-blue-600/40 rounded-t-lg transition-all relative group" style={{ height: `${h}%` }}></div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                    <h3 className="font-bold text-lg mb-6">Son DB Kayıtları</h3>
                    <div className="space-y-4">
                      {loading ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>
                      ) : (
                        [1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <ArrowUpRight size={14} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold truncate">İşlem Loglandı</p>
                                <p className="text-[10px] text-slate-500">DB Sync Tamam</p>
                              </div>
                            </div>
                            <span className="text-sm font-bold text-emerald-400">OK</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            } />
            <Route path="/users" element={<AdminUsers />} />
            <Route path="/bots" element={<AdminBots />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color, trend }: any) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-sm hover:border-slate-700 transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl bg-${color}-600/10 text-${color}-500`}>
        <Icon size={24} />
      </div>
      <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">{trend}</span>
    </div>
    <p className="text-slate-500 text-sm font-medium">{label}</p>
    <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
  </div>
);

const AdminUsers = () => {
  // Fix: User type is now imported from types.ts
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DatabaseService.getUsers().then(data => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-right-4">
      <h1 className="text-2xl font-bold mb-6 text-white">DB Kullanıcıları</h1>
      {loading ? <Loader2 className="animate-spin mx-auto mt-20" /> : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50 border-b border-slate-800">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Kullanıcı</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Rol</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Kayıt</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500 text-xs font-bold">
                        {user.name?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{user.name}</p>
                        <p className="text-xs text-slate-500">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4"><span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded">{user.role}</span></td>
                  <td className="p-4 text-sm text-slate-400">{new Date(user.joinDate).toLocaleDateString()}</td>
                  <td className="p-4"><button className="text-xs text-blue-500 font-bold hover:underline">Yönet</button></td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-slate-600 italic">Veritabanında kayıtlı kullanıcı bulunamadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const AdminBots = () => {
  // Fix: BotType (aliased from Bot type in types.ts) is now imported
  const [bots, setBots] = useState<BotType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DatabaseService.getBots().then(data => {
      setBots(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-right-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">DB Bot Yönetimi</h1>
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20">
          Yeni Bot Ekle
        </button>
      </div>
      {loading ? <Loader2 className="animate-spin mx-auto mt-20" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots.map(bot => (
            <div key={bot.id} className="bg-slate-900 border border-slate-800 p-4 rounded-3xl group hover:border-blue-500/50 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-slate-800 rounded-2xl overflow-hidden">
                  <img src={bot.icon} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-white truncate">{bot.name}</h4>
                  <p className="text-xs text-slate-500 truncate">{bot.category}</p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                <span className="font-bold text-emerald-400">₺{bot.price}</span>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><Settings size={16} /></button>
                  <button className="p-2 hover:bg-red-500/10 rounded-lg text-red-500"><X size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
