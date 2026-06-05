
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Users, Calendar, Terminal, Code, ShieldAlert, BarChart3, UserCog, History, 
  Settings, CreditCard, LogOut, LayoutDashboard, Globe, MessageSquare, 
  ChevronRight, Save, Download, Upload, RotateCcw, AlertCircle, Info, Star,
  Search, Filter, List, MoreVertical, Plus, Check, X, ShieldCheck, Zap,
  ExternalLink, ListOrdered, Sticker, Lightbulb, Shield, Columns, UserPlus, Trophy, Clock,
  Loader2, Trash2, Trash
} from 'lucide-react';
import LoginModal from '../components/LoginModal';
import { useTelegram } from '../hooks/useTelegram';
import { DatabaseService, supabase } from '../services/DatabaseService';
import { UserBot, Channel } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { API_BASE_URL } from '../constants';

const SidebarItem = ({ icon: Icon, label, path, active, badge, color, external }: any) => (
  <Link 
    to={path} 
    className={`flex items-center justify-between px-3 py-1.5 transition-all group rounded-lg ${
      active 
        ? 'bg-[#1e2430] text-blue-500 font-medium' 
        : 'text-slate-400 hover:text-white'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={18} className={`${active ? 'text-blue-500' : 'text-slate-500 group-hover:text-white'} transition-colors`} />
      <span className="text-[14px] font-medium tracking-tight">{label}</span>
    </div>
    <div className="flex items-center gap-1.5">
      {badge && (
        <span className={`text-[8px] font-black px-1 py-0.5 rounded italic uppercase border ${
          active ? 'bg-blue-500/20 text-blue-400 border-blue-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
        }`}>
          {badge}
        </span>
      )}
      {external && <ExternalLink size={10} className="text-slate-600" />}
    </div>
  </Link>
);

const GroupCard = ({ name, username, members, active, onClick }: any) => (
  <motion.div 
    whileHover={{ y: -4 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    style={{ outline: 'solid 1px #1f222abf' }}
    className="group relative bg-transparent rounded-2xl p-4 hover:border-blue-500/30 transition-all cursor-pointer"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-xl font-black text-white italic">
          {name[0].toUpperCase()}
        </div>
        <div>
          <h4 className="text-sm font-bold text-white tracking-tight">{name}</h4>
          <span className="text-[10px] text-slate-500 font-medium">@{username} • {members} Üye</span>
        </div>
      </div>
      <MoreVertical size={16} className="text-slate-600" />
    </div>
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        {active ? 'Aktif' : 'Pasif'}
      </span>
    </div>
  </motion.div>
);

const BotManagementPanel = () => {
  const { botId, groupId: routeGroupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract groupId from location.pathname if it contains /groups/
  const groupMatch = location.pathname.match(/\/groups\/([^/]+)/);
  const groupId = routeGroupId || (groupMatch ? groupMatch[1] : undefined);

  const { user, haptic, notification, setWebAuthUser } = useTelegram();
  const [bot, setBot] = useState<UserBot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);

  useEffect(() => {
    const fetchBotAndChannels = async () => {
      setIsLoading(true);
      if (botId && user?.id) {
        const bots = await DatabaseService.getUserBots(user.id.toString());
        const found = bots.find(b => b.id === botId);
        if (found) setBot(found);

        const userChannels = await DatabaseService.getChannels(user.id.toString());
        setChannels(userChannels ?? []);
      }
      setIsLoading(false);
    };
    fetchBotAndChannels();
  }, [botId, user]);

  useEffect(() => {
    if (groupId && channels.length > 0) {
      const found = channels.find(c => String(c.telegram_id) === String(groupId));
      setActiveChannel(found || null);
    } else {
      setActiveChannel(null);
    }
  }, [groupId, channels]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1218] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="text-blue-500">
           <RotateCcw size={40} />
        </motion.div>
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="min-h-screen bg-[#0f1218] flex flex-col items-center justify-center text-white gap-4">
        <AlertCircle size={48} className="text-red-500" />
        <h2 className="text-xl font-bold">Bot Bulunamadı</h2>
        <button onClick={() => navigate('/my-bots')} className="bg-white/10 px-6 py-2 rounded-xl text-sm font-bold">Geri Dön</button>
      </div>
    );
  }

  const globalNavItems = [
    { label: 'Gruplar', icon: Users, path: 'groups' },
    { label: 'Zamanlayıcı', icon: Calendar, path: 'scheduler' },
    { label: 'Komutlar', icon: Terminal, path: 'commands' },
    { label: 'API', icon: Code, path: 'api' },
  ];

  const groupNavItems = [
    { label: 'Ayarlar', icon: Settings, path: `groups/${groupId}/settings` },
    { label: 'BotlyHub AI', icon: Lightbulb, path: `groups/${groupId}/ai` },
    { label: 'Pro', icon: Star, path: `groups/${groupId}/pro`, highlight: true },
    { label: 'Moderasyon', icon: Shield, path: `groups/${groupId}/moderation` },
    { label: 'Analiz', icon: Columns, path: `groups/${groupId}/analysis` },
    { label: 'Kullanıcılar', icon: Users, path: `groups/${groupId}/users` },
    { label: 'Yönlendirmeler', icon: UserPlus, path: `groups/${groupId}/referrals` },
    { label: 'Günlük', icon: Clock, path: `groups/${groupId}/logs` },
    { label: 'Sıralama', icon: Trophy, path: `groups/${groupId}/ranking` },
  ];

  const externalNavItems = [
    { label: 'BotlyHub Anti-Spam', icon: ShieldAlert, path: 'antispam', external: true },
    { label: 'Telegram Top Groups', icon: Globe, path: 'top-groups', external: true },
    { label: 'Stickers Catalogue', icon: Sticker, path: 'stickers', external: true },
  ];

  return (
    <div className="bot-panel-scoped min-h-screen bg-[#0f1218] flex text-slate-300 font-sans selection:bg-blue-500/30">
      <style dangerouslySetInnerHTML={{ __html: `
        .bot-panel-scoped .bg-slate-800 {
            outline: solid 2px #ffffff08;
            --tw-bg-opacity: 1 !important;
        }
        .bot-panel-scoped .h-11 {
            margin: 2px !important;
            height: 1.75rem !important;
        }
      ` }} />
      {/* Sidebar */}
      <aside className="w-60 bg-[#11141a] border-r border-white/5 flex flex-col sticky top-0 h-screen overflow-y-auto no-scrollbar">
        <div className="p-4 flex-1">
          {/* Brand Header */}
          <Link to="/" className="flex items-center gap-2 px-3 mb-6">
            <div className="w-8 h-8 rounded-full border-2 border-white/10 flex items-center justify-center p-1 overflow-hidden shrink-0">
               <div className="w-full h-full bg-blue-600 rounded-full flex items-center justify-center">
                 <div className="flex gap-0.5">
                   <div className="w-0.5 h-3 bg-white/20"></div>
                   <div className="w-0.5 h-4 bg-white"></div>
                   <div className="w-0.5 h-2 bg-white/40"></div>
                 </div>
               </div>
            </div>
            <span className="font-bold text-white text-lg tracking-tight">BotlyHub</span>
          </Link>

          <div className="space-y-4">
            {/* Global Nav */}
            <div className="space-y-0.5">
              {globalNavItems.map((item) => (
                <SidebarItem 
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  path={`/bot-panel/${botId}/${item.path}`}
                  active={location.pathname.includes(`/${item.path}`) && !groupId}
                />
              ))}
            </div>

            {/* Current Active Item (Active Channel or Group) */}
            {groupId ? (
              <div className="space-y-1">
                <div className="px-3 py-2 flex items-center justify-between group cursor-pointer hover:bg-white/2 transition-all rounded-lg mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-slate-800 shrink-0 flex items-center justify-center font-black text-white italic text-sm">
                       {activeChannel?.icon ? (
                         <img src={activeChannel.icon} alt={activeChannel.name} className="w-full h-full object-cover" onError={(e) => { (e.target as any).style.display = 'none'; const parent = (e.target as any).parentElement; if (parent) parent.innerText = (activeChannel?.name?.[0] || 'G').toUpperCase(); }} />
                       ) : (
                         (activeChannel?.name?.[0] || 'G').toUpperCase()
                       )}
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-white leading-tight uppercase tracking-tight truncate max-w-[100px]">
                        {activeChannel?.name || 'Grup Detay'}
                      </h4>
                      <span className="text-[12px] text-slate-500 leading-tight block truncate max-w-[100px]">
                        {activeChannel?.telegram_id || groupId}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-600" />
                </div>

                {/* Sub-Nav Group */}
                <div className="space-y-0.5">
                  {groupNavItems.map((item: any) => (
                    <SidebarItem 
                      key={item.path}
                      icon={item.icon}
                      label={item.label}
                      badge={item.highlight ? 'Pro' : undefined}
                      path={`/bot-panel/${botId}/${item.path}`}
                      active={location.pathname.includes(`/${item.path.split('/').pop()}`)}
                    />
                  ))}
                </div>
              </div>
            ) : (
                <div className="px-3 py-4 text-center border border-dashed border-white/5 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Grup Seçilmedi</p>
                </div>
            )}

            {/* External Links Section */}
            <div className="space-y-0.5 pt-4 border-t border-white/5">
              {externalNavItems.map((item) => (
                <SidebarItem 
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  path="#"
                  external={true}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer Brand Branding */}
        <div className="mt-auto p-4 border-t border-white/5 bg-[#0d1014]">
          <div className="px-3 mb-4">
             <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Kaju</h3>
          </div>
          <div className="space-y-0.5">
            <SidebarItem icon={Settings} label="Ayarlar" path={`/bot-panel/${botId}/bot-settings`} active={location.pathname.includes('bot-settings')} />
            <SidebarItem icon={CreditCard} label="Faturalandırma" path={`/bot-panel/${botId}/billing`} active={location.pathname.includes('billing')} />
            {user ? (
              <button 
                onClick={() => { haptic('medium'); setWebAuthUser(null); }}
                className="w-full flex items-center gap-3 px-3 py-1.5 text-slate-500 hover:text-red-400 transition-all group"
              >
                <LogOut size={16} className="text-slate-500 group-hover:text-red-400" />
                <span className="text-[12px] font-medium tracking-tight">Çıkış Yap</span>
              </button>
            ) : (
                <button 
                onClick={() => { haptic('medium'); setIsLoginModalOpen(true); }}
                className="w-full flex items-center gap-3 px-3 py-1.5 text-blue-500 hover:text-blue-400 transition-all group"
              >
                <ShieldCheck size={16} className="text-blue-500 group-hover:text-blue-400" />
                <span className="text-[12px] font-medium tracking-tight">Giriş Yap</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onAuth={(user) => {
            setWebAuthUser(user);
            notification('success');
        }}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-[#14181f]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 z-20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-white italic overflow-hidden shadow-lg shadow-black/20">
               {bot.icon ? <img src={bot.icon} alt={bot.name} className="w-full h-full object-cover" /> : bot.name[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase italic tracking-widest">{bot.name}</h2>
              <span className="text-[10px] text-slate-500 font-bold tracking-widest">{groupId ? 'Grup Yönetimi' : 'Yönetim Paneli'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
             {user ? (
                <div className="flex items-center gap-3 border-r border-white/5 pr-3 mr-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-white uppercase italic leading-none">{user.name || user.username}</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter mt-1">@{user.username || 'user'}</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/20 overflow-hidden shrink-0 shadow-lg shadow-blue-500/10 capitalize flex items-center justify-center font-bold text-blue-400">
                        {user.avatar ? <img src={user.avatar} alt="User" className="w-full h-full object-cover" /> : (user.username?.[0] || user.id?.[0] || 'U')}
                    </div>
                </div>
             ) : (
                <button 
                    onClick={() => setIsLoginModalOpen(true)}
                    className="h-10 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mr-3 shadow-lg shadow-blue-500/20"
                >
                    Giriş Yap
                </button>
             )}
             <button className="h-10 px-4 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
               <Save size={14} />
               Kaydet
             </button>
             <button className="h-10 px-4 flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
               <Download size={14} />
               Alıntı
             </button>
             <button className="h-10 px-4 flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
               <Upload size={14} />
               Çıktı
             </button>
             <button className="h-10 px-4 flex items-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
               <RotateCcw size={14} />
               Sıfırla
             </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <Routes>
            <Route index element={<NavigateToGroups botId={botId} />} />
            <Route path="groups" element={<GroupsView channels={channels} isLoading={isLoading} />} />
            <Route path="scheduler" element={<EmptyModule title="Zamanlayıcı" />} />
            <Route path="commands" element={<EmptyModule title="Komutlar" />} />
            <Route path="api" element={<EmptyModule title="API Yönetimi" />} />
            <Route path="bot-settings" element={<BotSettingsView bot={bot} />} />
            <Route path="billing" element={<BillingView />} />
            
            <Route path="groups/:groupId/settings" element={<GroupSettingsView channel={activeChannel} />} />
            <Route path="groups/:groupId/moderation" element={<ModerationView />} />
            <Route path="groups/:groupId/analysis" element={<AnalysisView />} />
            <Route path="groups/:groupId/users" element={<UsersView channel={activeChannel} />} />
            <Route path="*" element={<EmptyModule />} />
          </Routes>
        </div>

        {/* Footer */}
        <footer className="h-10 bg-[#14181f] border-t border-white/5 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-6">
            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">[0.091]</span>
            <div className="flex items-center gap-3">
              <a href="#" className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">İade Politikası</a>
              <span className="text-slate-800">|</span>
              <a href="#" className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">gizlilik politikası</a>
              <span className="text-slate-800">|</span>
              <a href="#" className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">hizmet şartları</a>
              <span className="text-slate-800">|</span>
              <a href="#" className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">@botlyhubchat</a>
              <span className="text-slate-800">|</span>
              <a href="#" className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">@botlyhubnews</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest tracking-widest">v3.4.1</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

const NavigateToGroups = ({ botId }: any) => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(`/bot-panel/${botId}/groups`, { replace: true });
  }, []);
  return null;
};

const GroupSettingsView = ({ channel }: { channel: any }) => {
    const [activeTab, setActiveTab] = useState('basic'); // basic or team
    const { groupId } = useParams();
    const displayGroupId = channel ? channel.telegram_id : (groupId || '-1003360909133');

    // Functional Admin states
    const [pendingList, setPendingList] = useState<any[]>([]);
    const [loadingAdmins, setLoadingAdmins] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newAdminId, setNewAdminId] = useState('');
    const [submittingAdmin, setSubmittingAdmin] = useState(false);

    // States for custom AdminRightsModal inside GroupSettingsView
    const [rightsModalData, setRightsModalData] = useState<{ userId: string; userName: string; initialPermissions?: any } | null>(null);
    const [submittingRights, setSubmittingRights] = useState(false);

    const fetchPendingAdmins = async () => {
        if (!displayGroupId) return;
        setLoadingAdmins(true);
        try {
            let targetTelegramId = displayGroupId.toString();
            // If UUID, look up channel first
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(displayGroupId);
            if (isUuid) {
                const { data: channelData } = await supabase
                    .from('channels')
                    .select('telegram_id')
                    .eq('id', displayGroupId)
                    .maybeSingle();
                if (channelData?.telegram_id) {
                    targetTelegramId = channelData.telegram_id.toString();
                }
            }

            const { data, error } = await supabase
                .from('pending_admin_actions')
                .select('*')
                .eq('channel_id', targetTelegramId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching pending admins:", error);
            } else {
                setPendingList(data || []);
            }
        } catch (err) {
            console.error("Failed to load team actions:", err);
        } finally {
            setLoadingAdmins(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'team') {
            fetchPendingAdmins();
        }
    }, [activeTab, displayGroupId]);

    const handleAddNewAdmin = () => {
        if (!newAdminId.trim() || !displayGroupId) return;
        setRightsModalData({ userId: newAdminId.trim(), userName: `Özel Kullanıcı ID: ${newAdminId.trim()}` });
    };

    const handleConfirmAddNewAdmin = async (permissions: Record<string, boolean>) => {
        if (!rightsModalData || !displayGroupId) return;
        setSubmittingAdmin(true);
        setSubmittingRights(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/add-admin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    channelId: displayGroupId,
                    userId: rightsModalData.userId,
                    action: "promote",
                    permissions,
                }),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || "Talep eklenirken bir hata oluştu.");
            }

            alert("Yönetici yapma talebi veritabanına başarıyla eklendi! Özel belirlediğiniz yetkiler kaydedildi. Telegram botu 5 saniye içinde yetki tanıtacaktır.");
            setNewAdminId('');
            setShowAddForm(false);
            setRightsModalData(null);
            fetchPendingAdmins();
        } catch (err: any) {
            console.error("Error creating promote action from panel:", err);
            alert(err.message || "İşlem sırasında bir hata oluştu.");
        } finally {
            setSubmittingAdmin(false);
            setSubmittingRights(false);
        }
    };

    // Reconstruct active custom admins list dynamically
    const getActiveCustomAdmins = () => {
        const userActions: Record<string, any> = {};
        // Sort from oldest to newest so the latest state is captured correctly
        const sorted = [...pendingList].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        sorted.forEach(act => {
            if (act.status === 'completed' || act.status === 'pending') {
                userActions[act.user_id] = act;
            }
        });
        return Object.values(userActions).filter(act => act.action === 'promote');
    };

    const handleDemoteAdmin = async (userId: string) => {
        if (!displayGroupId) return;
        const confirmMsg = `${userId} adlı kullanıcıyı grupta yöneticilikten kaldırmak istediğinize emin misiniz? (Telegram botu 5 saniye içinde yetki kaldırma işlemini tamamlayacaktır)`;
        if (!window.confirm(confirmMsg)) return;

        setLoadingAdmins(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/add-admin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    channelId: displayGroupId,
                    userId: userId,
                    action: "demote",
                }),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || "Yöneticilikten kaldırma talebi başarısız oldu.");
            }

            alert("Yöneticilikten kaldırma talebi veritabanına başarıyla eklendi! Telegram botu 5 saniye içinde yetkiyi kaldıracaktır.");
            fetchPendingAdmins();
        } catch (err: any) {
            console.error("Error creating demote action:", err);
            alert(err.message || "İşlem yapılırken bir hata oluştu.");
        } finally {
            setLoadingAdmins(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
            <div className="flex items-center gap-2 mb-8 bg-[#14181f] p-1.5 rounded-2xl w-fit border border-white/5">
                <button 
                  onClick={() => setActiveTab('basic')}
                  className={`h-11 px-6 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === 'basic' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-white'
                  }`}
                >
                    <Settings size={14} />
                    Temel
                </button>
                <button 
                  onClick={() => setActiveTab('team')}
                  className={`h-11 px-6 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === 'team' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-white'
                  }`}
                >
                    <Users size={14} />
                    Ekip
                </button>
            </div>

            {activeTab === 'basic' ? (
                <div className="space-y-8">
                    {/* ID Section */}
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">ID</label>
                        <div className="flex items-center gap-2">
                            <div className="h-12 flex-1 bg-[#14181f] border border-white/5 rounded-xl px-4 flex items-center font-mono text-sm text-white">
                                {displayGroupId}
                            </div>
                            <button className="h-12 w-12 bg-white/5 hover:bg-white/10 text-white rounded-xl flex items-center justify-center transition-all">
                                <CreditCard size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-4">
                        <label className="flex items-start gap-3 group cursor-pointer">
                            <div className="mt-0.5">
                                <input type="checkbox" className="w-5 h-5 accent-blue-600 rounded bg-[#14181f] border-white/5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white group-hover:text-blue-500 transition-colors">Analizler sayfasını özel tut</h4>
                                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Yalnızca kimliği doğrulanmış yöneticiler erişebilir</p>
                            </div>
                        </label>

                        <label className="flex items-start gap-3 group cursor-pointer">
                            <div className="mt-0.5">
                                <input type="checkbox" className="w-5 h-5 accent-blue-600 rounded bg-[#14181f] border-white/5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white group-hover:text-blue-500 transition-colors">Günlük analiz raporu al</h4>
                                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">BotlyHub grubunuz hakkında günlük bir rapor gönderir</p>
                            </div>
                        </label>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Etiketler</label>
                        <div className="h-12 bg-[#14181f] border border-white/5 rounded-xl px-4 flex items-center text-sm text-slate-500 italic">
                        </div>
                        <p className="text-[10px] text-slate-600 mt-2 italic flex items-center gap-1">
                            <Info size={10} /> Şu anda etiket yalnızca .gban komutu için kullanılır
                        </p>
                    </div>

                    {/* Language */}
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Dil</label>
                        <div className="h-12 bg-[#14181f] border border-white/5 rounded-xl px-4 flex items-center justify-between group cursor-pointer hover:border-white/10 transition-all">
                            <span className="text-sm text-white font-medium">Türkçe (Turkish)</span>
                            <ChevronRight size={16} className="rotate-90 text-slate-600" />
                        </div>
                    </div>

                    {/* Anti-Spam */}
                    <div className="bg-blue-600/5 border border-blue-500/10 p-6 rounded-[32px]">
                        <label className="flex items-start gap-4 cursor-pointer group">
                            <div className="mt-1">
                                <input type="checkbox" defaultChecked className="w-6 h-6 accent-blue-600 rounded-lg" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-white italic uppercase tracking-tighter mb-1">BotlyHub Anti-Spam (BAS) kullan</h4>
                                <p className="text-xs text-slate-400 leading-relaxed font-medium">BotlyHub Anti-Spam, Telegram'daki spam gönderenleri tespit etmek için tasarlanmış otomatik bir sistemdir. Grubunuzu korur!</p>
                            </div>
                        </label>
                    </div>

                    {/* Footer Checkboxes */}
                    <div className="space-y-6 pt-4 border-t border-white/5">
                        <label className="flex items-start gap-3 group cursor-pointer">
                            <div className="mt-0.5"><input type="checkbox" className="w-5 h-5 accent-blue-600" /></div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-white">Yasaklamaları duyurma</h4>
                                    <span className="text-[9px] font-black bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded italic uppercase">Pro</span>
                                </div>
                                <p className="text-[11px] text-orange-400/60 leading-relaxed font-medium">Yasaklamaları duyurma yalnızca Pro'da kullanılabilir. Kullanmak için Pro'ya yükseltin.</p>
                            </div>
                        </label>

                        <label className="flex items-start gap-3 group cursor-pointer">
                            <div className="mt-0.5"><input type="checkbox" className="w-5 h-5 accent-blue-600" /></div>
                            <div>
                                <h4 className="text-sm font-bold text-white">Katılmama "Top Telegram Chats"</h4>
                                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">24 saat içinde yürürlüğe girer</p>
                            </div>
                        </label>
                    </div>

                    {/* Custom Bot Section */}
                    <div className="group bg-gradient-to-br from-slate-900 to-[#0f1218] border border-white/5 p-8 rounded-[40px] relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Özel Bot</h3>
                                <span className="text-[10px] font-black bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded italic uppercase tracking-widest border border-blue-500/20">Pro</span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-lg mb-0 italic">
                                BotlyHub yerine kendi botunuzu kullanın. Adını, kullanıcı adını, açıklamasını ve profil resmini ihtiyaçlarınıza göre özelleştirin.
                            </p>
                        </div>
                        <div className="absolute top-1/2 -right-10 -translate-y-1/2 opacity-5 pointer-events-none">
                            <Zap size={200} className="text-blue-500" />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-white italic uppercase tracking-tighter mb-1">Yöneticiler</h2>
                            <p className="text-xs text-slate-500 font-medium flex items-center gap-1 italic">
                                <Info size={12} /> BotlyHub'ı yönetebilen yöneticiler
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                             <button 
                                onClick={fetchPendingAdmins}
                                disabled={loadingAdmins}
                                className="h-10 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-50"
                             >
                                <RotateCcw size={14} className={loadingAdmins ? "animate-spin" : ""} />
                                Yenile
                             </button>
                             <button 
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="h-10 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                             >
                                {showAddForm ? <X size={14} /> : <Plus size={14} />}
                                {showAddForm ? "Vazgeç" : "Yönetici ekle"}
                             </button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {showAddForm && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden mb-6"
                            >
                                <div 
                                    style={{ outline: "solid 1px rgba(59, 130, 246, 0.2)" }} 
                                    className="bg-blue-950/20 border border-blue-500/10 p-6 rounded-[24px]"
                                >
                                    <h4 className="text-[10px] font-black text-white italic uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <Shield size={14} className="text-blue-500" />
                                        YÖNETİCİ EKLE (PROMOTE MEMBER)
                                    </h4>
                                    <p className="text-[11px] text-slate-400 mb-4 leading-relaxed italic">
                                        Telegram grubunuzda yönetici yapmak istediğiniz kullanıcının Telegram ID bilgisini girin. Botumuz yetki yükseltme işlemini anında gerçekleştirecektir.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <input 
                                            type="text"
                                            value={newAdminId}
                                            onChange={(e) => setNewAdminId(e.target.value)}
                                            placeholder="Telegram Kullanıcı ID (ör. 842614237)"
                                             className="flex-1 h-11 bg-[#14181f] border border-white/5 rounded-xl px-4 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"
                                        />
                                        <button 
                                            onClick={handleAddNewAdmin}
                                            disabled={submittingAdmin || !newAdminId.trim()}
                                            className="h-11 px-5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 border border-blue-500/10 text-white font-black uppercase text-[9px] tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                                        >
                                            {submittingAdmin ? (
                                                <Loader2 size={12} className="animate-spin text-white" />
                                            ) : (
                                                <Check size={12} />
                                            )}
                                            Sisteme Gönder
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">TEMEL GRUP YÖNETİCİLERİ</h3>
                            <div className="space-y-3">
                                {[
                                    { id: '210944655', name: 'BotlyHub', user: '@botlyhub', isBot: true },
                                    { id: '842614237', name: 'KAJU', user: '@kajju66', isBot: false },
                                ].map((admin, i) => (
                                    <div key={i} className="bg-[#14181f] border border-white/5 rounded-[24px] p-4 flex items-center gap-4 group hover:border-blue-500/30 transition-all cursor-pointer">
                                        <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center p-1 overflow-hidden">
                                            <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center font-black text-white italic text-xs">
                                                {admin.name[0]}
                                             </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-xs font-black text-blue-500 italic tracking-tighter">{admin.id}</span>
                                                <h4 className="text-sm font-bold text-white">{admin.name}</h4>
                                            </div>
                                            <span className="text-[10px] text-slate-500 font-medium">{admin.user}</span>
                                        </div>
                                         <div className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                             <MoreVertical size={16} className="text-slate-600" />
                                         </div>
                                    </div>
                                ))}
                             </div>
                        </div>

                        {/* Custom Created Admins Section */}
                        <div>
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                <ShieldCheck size={12} className="text-teal-400" /> SİZİN EKLEDİĞİNİZ YÖNETİCİLER
                            </h3>
                            {getActiveCustomAdmins().length === 0 ? (
                                <div className="bg-[#14181f]/40 border border-white/5 rounded-[24px] p-6 text-center text-xs text-slate-500 italic">
                                    Henüz bu panel üzerinden eklenmiş bir yönetici bulunmuyor. "Yönetici ekle" butonunu kullanarak yeni bir yönetici atayabilirsiniz.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {getActiveCustomAdmins().map((admin) => (
                                        <div 
                                            key={admin.user_id} 
                                            className="bg-[#14181f] border border-white/5 rounded-[24px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-blue-500/30 transition-all"
                                        >
                                            <div 
                                                onClick={() => {
                                                    setRightsModalData({ 
                                                        userId: admin.user_id, 
                                                        userName: `Yönetici ID: ${admin.user_id}`,
                                                        initialPermissions: admin.permissions
                                                    });
                                                }}
                                                className="flex items-center gap-4 cursor-pointer flex-1"
                                            >
                                                <div className="w-10 h-10 bg-teal-500/10 border border-teal-500/20 rounded-full flex items-center justify-center font-black text-teal-400 italic text-sm shrink-0">
                                                    Y
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-xs font-black text-teal-400 italic tracking-tighter">ID: {admin.user_id}</span>
                                                        {admin.status === 'completed' ? (
                                                            <span className="text-[8px] font-bold bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded uppercase tracking-wider scale-90">AKTİF</span>
                                                        ) : (
                                                            <span className="text-[8px] font-bold bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded uppercase tracking-wider scale-90 animate-pulse">TANITILIYOR...</span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 font-medium">
                                                        Üzerine tıklayarak yetkilerini düzenleyebilirsiniz.
                                                    </p>
                                                    {admin.permissions && (
                                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                                            {Object.entries(admin.permissions)
                                                                .filter(([_, val]) => val === true)
                                                                .map(([key]) => (
                                                                    <span key={key} className="text-[8.5px] font-black bg-white/5 text-slate-400 px-1.5 py-0.5 rounded border border-white/[0.03]">
                                                                        {key.replace('can_', '').replace('is_', '').replace(/_/g, ' ')}
                                                                    </span>
                                                                ))
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                                                <button
                                                    onClick={() => {
                                                        setRightsModalData({ 
                                                            userId: admin.user_id, 
                                                            userName: `Yönetici ID: ${admin.user_id}`,
                                                            initialPermissions: admin.permissions
                                                        });
                                                    }}
                                                    className="h-8 px-3 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 rounded-lg flex items-center gap-1.5 transition-all"
                                                >
                                                    <Shield size={12} className="text-teal-400" />
                                                    Yetkiler
                                                </button>
                                                <button
                                                    onClick={() => handleDemoteAdmin(admin.user_id)}
                                                    className="h-8 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-bold text-rose-400 rounded-lg flex items-center gap-1.5 transition-all"
                                                >
                                                    <Trash2 size={12} />
                                                    Kaldır
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {pendingList.length > 0 && (
                            <div>
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">TALEPLER & İŞLEM GEÇMİŞİ</h3>
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {pendingList.map((act) => (
                                        <div key={act.id} className="bg-[#14181f]/40 border border-white/5 hover:border-white/10 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold font-mono text-[10px]">
                                                    {act.action === 'promote' ? 'PROM' : 'DEMO'}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-[11px] font-semibold text-white">ID: {act.user_id}</span>
                                                        <span className="text-[10px] text-slate-500">• {new Date(act.created_at).toLocaleTimeString()}</span>
                                                    </div>
                                                    {act.error_log && (
                                                        <p className="text-[9px] text-red-500 italic max-w-sm overflow-hidden text-ellipsis whitespace-nowrap">{act.error_log}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                {act.status === 'pending' ? (
                                                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-500 border border-yellow-500/15 animate-pulse">BEKLENİYOR</span>
                                                ) : act.status === 'completed' ? (
                                                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/15">TAMAMLANDI</span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/15">BAŞARISIZ</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <AdminRightsModal
                isOpen={rightsModalData !== null}
                userId={rightsModalData?.userId || ''}
                userName={rightsModalData?.userName || ''}
                initialPermissions={rightsModalData?.initialPermissions}
                onClose={() => setRightsModalData(null)}
                onConfirm={handleConfirmAddNewAdmin}
                isSubmitting={submittingRights}
            />
        </div>
    );
};

const BotSettingsView = ({ bot }: { bot: UserBot }) => {
    const [botData, setBotData] = useState(bot);
    
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl space-y-8">
            <div>
                <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-1">Bot Ayarları</h1>
                <p className="text-sm text-slate-500 font-medium">Botunuzun genel bilgilerini ve uygulama içi görünümünü yönetin.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Settings */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#14181f] border border-white/5 rounded-[40px] p-8 text-center">
                        <div className="w-24 h-24 bg-slate-900 rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-white/5 relative group cursor-pointer overflow-hidden shadow-2xl">
                            {botData.icon ? <img src={botData.icon} className="w-full h-full object-cover" /> : botData.name[0].toUpperCase()}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Upload size={20} className="text-white" />
                            </div>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">{botData.name}</h4>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Bot Profil Resmi</span>
                    </div>

                    <div className="bg-blue-600/5 border border-blue-500/10 p-6 rounded-3xl">
                        <div className="flex items-center gap-3 mb-3">
                            <ShieldCheck size={20} className="text-blue-500" />
                            <span className="text-xs font-black text-white italic uppercase tracking-tighter">Durum</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400">Pazar Yeri Durumu</span>
                            <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black px-2 py-1 rounded-lg uppercase italic border border-emerald-500/20">Yayınlandı</span>
                        </div>
                    </div>
                </div>

                {/* Information Settings */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-[#14181f] border border-white/5 rounded-[40px] p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bot Adı</label>
                            <input 
                                type="text" 
                                value={botData.name} 
                                className="w-full h-12 bg-[#0f1218] border border-white/5 rounded-2xl px-4 text-sm text-white focus:border-blue-500/30 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kullanıcı Adı (Telegram)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-sm">@</span>
                                <input 
                                    type="text" 
                                    value={botData.slug} 
                                    disabled
                                    className="w-full h-12 bg-[#0f1218] border border-white/5 rounded-2xl pl-8 pr-4 text-sm text-slate-500 font-mono"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Açıklama</label>
                            <textarea 
                                className="w-full h-32 bg-[#0f1218] border border-white/5 rounded-2xl p-4 text-sm text-white focus:border-blue-500/30 transition-all resize-none"
                                defaultValue="Bu bot, kanallarınızı ve gruplarınızı yönetmenize yardımcı olan gelişmiş bir moderasyon sistemidir."
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kategori</label>
                                <select className="w-full h-12 bg-[#0f1218] border border-white/5 rounded-2xl px-4 text-sm text-white appearance-none outline-none">
                                    <option>Moderasyon</option>
                                    <option>Eğlence</option>
                                    <option>Finans</option>
                                    <option>Oyun</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Fiyatlandırma</label>
                                <select className="w-full h-12 bg-[#0f1218] border border-white/5 rounded-2xl px-4 text-sm text-white appearance-none outline-none">
                                    <option>Ücretsiz</option>
                                    <option>Premium (Aylık/Yıllık)</option>
                                    <option>Tek Seferlik</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <button className="h-12 px-8 flex items-center gap-2 bg-[#14181f] text-slate-400 hover:text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all">
                             İptal Et
                        </button>
                        <button className="h-12 px-8 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20">
                             <Save size={16} />
                             Ayarları Kaydet
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BillingView = () => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 max-w-5xl">
            <div>
                <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-1">Faturalandırma</h1>
                <p className="text-sm text-slate-500 font-medium">Plan ve abonelik durumunuzu yönetin.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Active Subscription Card */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-600/20">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                    <Star className="text-white" size={24} fill="white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Pro Plan</h3>
                                    <span className="text-[10px] font-black opacity-60 uppercase tracking-widest">Yıllık Abonelik</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-8 mb-10">
                                <div>
                                    <span className="text-[10px] font-black opacity-60 uppercase tracking-widest block mb-1">Durum</span>
                                    <p className="text-base font-bold italic">Yayında</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black opacity-60 uppercase tracking-widest block mb-1">Yenileme</span>
                                    <p className="text-base font-bold italic">14 Haziran 2026</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black opacity-60 uppercase tracking-widest block mb-1">Tutar</span>
                                    <p className="text-base font-bold italic">$99.99 / yıl</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button className="h-12 px-8 bg-white text-blue-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                                    Planı Değiştir
                                </button>
                                <button className="h-12 px-8 bg-black/20 hover:bg-black/30 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all">
                                    Aboneliği Yönet
                                </button>
                            </div>
                        </div>
                        {/* Decorative Pattern */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none blur-3xl"></div>
                        <Zap size={240} className="absolute -bottom-20 -right-20 opacity-10 rotate-12" />
                    </div>

                    {/* Usage Stats */}
                    <div className="bg-[#14181f] border border-white/5 rounded-[40px] p-8">
                        <h4 className="text-sm font-black text-white italic uppercase tracking-widest mb-8">Kullanım Limitleri</h4>
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-slate-500">Maksimum Grup Sayısı</span>
                                    <span className="text-white">4 / Sınırsız</span>
                                </div>
                                <div className="h-2 bg-[#0f1218] rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 w-[15%] rounded-full shadow-lg shadow-blue-600/40"></div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-slate-500">Aylık Karşılanan İstek</span>
                                    <span className="text-white">84.2k / 1M</span>
                                </div>
                                <div className="h-2 bg-[#0f1218] rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 w-[8.4%] rounded-full shadow-lg shadow-blue-600/40"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[#14181f] border border-white/5 rounded-[40px] p-8">
                        <h4 className="text-sm font-black text-white italic uppercase tracking-widest mb-6">Ödeme Yöntemi</h4>
                        <div className="flex items-center gap-4 p-4 bg-[#0f1218] border border-white/5 rounded-2xl mb-6">
                            <div className="w-10 h-6 bg-slate-800 rounded-md flex items-center justify-center overflow-hidden">
                                <CreditCard size={16} className="text-slate-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-white uppercase tracking-widest">•••• 4242</p>
                                <span className="text-[10px] text-slate-600 font-medium tracking-widest uppercase italic">Vade: 12/28</span>
                            </div>
                        </div>
                        <button className="w-full h-12 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                             Düzenle
                        </button>
                    </div>

                    <div className="bg-[#14181f] border border-white/5 rounded-[40px] p-8">
                        <h4 className="text-sm font-black text-white italic uppercase tracking-widest mb-6">Son İşlemler</h4>
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 pb-4">
                                    <div>
                                        <p className="text-xs font-bold text-white mb-0.5">Yıllık Yenileme</p>
                                        <span className="text-[10px] text-slate-500 font-medium">14 Haz 2025</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-white italic">$99.99</p>
                                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Başarılı</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const GroupsView = ({ channels, isLoading }: { channels: Channel[], isLoading: boolean }) => {
  const { botId } = useParams();
  const navigate = useNavigate();
  const { haptic } = useTelegram();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-1">Gruplar</h1>
          <p className="text-sm text-slate-500 font-medium">Botunuzun bağlı olduğu grupları ve kanalları yönetin.</p>
        </div>
        <button className="h-12 px-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20">
          <Plus size={16} />
          Yeni Grup / Kanal Ekle
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      ) : channels && channels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {channels.map((channel) => (
            <GroupCard 
              key={channel.id}
              name={channel.name} 
              username={channel.telegram_id} 
              members={typeof channel.memberCount === 'number' ? channel.memberCount.toLocaleString() : '0'} 
              active={channel.revenueEnabled !== undefined ? channel.revenueEnabled : true} 
              onClick={() => { haptic('light'); navigate(`/bot-panel/${botId}/groups/${channel.telegram_id}/settings`); }} 
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#14181f]/40 border border-dashed border-white/5 p-12 rounded-[32px] text-center mb-8">
          <Users size={48} className="text-slate-700 mx-auto mb-4" />
          <h3 className="text-base font-bold text-white mb-2">Henüz Grup veya Kanal Bulunmuyor</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed mb-6">
            Bu bota bağlı herhangi bir grup veya kanal bulunamadı. Lütfen yeni bir grup veya kanal ekleyerek başlayın.
          </p>
          <button className="h-10 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md">
            Yeni Grup / Kanal Ekle
          </button>
        </div>
      )}

      <div className="bg-orange-500/5 border border-orange-500/20 rounded-3xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/20 flex items-center justify-center shrink-0">
            <Info className="text-orange-500" size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-orange-200 mb-1 italic uppercase tracking-tight">Grubumu göremiyorum, ne yapmalıyım?</h4>
            <p className="text-xs text-orange-200/60 font-medium leading-relaxed">
              Grubunuzda yöneticiyseniz ve botu eklediyseniz ama burada göremiyorsanız, grubunuzda <code className="bg-orange-500/10 px-2 py-0.5 rounded text-orange-500 font-black">!reload_admins</code> yazın.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ModerationView = () => {
  const [activeTab, setActiveTab] = useState('general');
  const tabs = [
    { id: 'general', label: 'Temel Ayarlar' },
    { id: 'users', label: 'Yeni Üyeler' },
    { id: 'filters', label: 'Filtreler' },
    { id: 'fun', label: 'Eğlence' },
    { id: 'comments', label: 'Yorumlar' },
    { id: 'tools', label: 'Araçlar' },
    { id: 'triggers', label: 'Tetikleyiciler V2', premium: true },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-6 h-12 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-slate-800 text-white border border-white/10' 
                : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            {tab.label}
            {tab.premium && <Star size={10} className="text-amber-500" />}
          </button>
        ))}
      </div>

      <div className="bg-[#14181f] border border-white/5 rounded-[40px] p-10">
        <div className="flex items-center gap-2 mb-8">
           <LayoutDashboard className="text-blue-500" size={20} />
           <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Beyaz Liste</h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kullanıcı Listesi</label>
               <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">3 Kullanıcı</span>
            </div>
            <textarea 
               className="w-full h-40 bg-[#0f1218] border border-white/5 rounded-3xl p-6 text-sm text-white outline-none focus:border-blue-500/30 transition-all placeholder:text-slate-700"
               placeholder="Telegram ID veya kullanıcı adlarını alt alta yazarak ekleyin..."
            ></textarea>
            <p className="text-[10px] text-slate-600 font-medium italic">
              Beyaz listeye giren kullanıcılar denetime tabi değildir. Sistem onları güvenilir olarak işaretler.
            </p>
          </div>

          <label className="flex items-center gap-4 group cursor-pointer w-fit p-4 bg-white/5 rounded-2xl border border-transparent hover:border-white/10 transition-all">
             <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                <input type="checkbox" className="w-5 h-5 rounded accent-blue-600" />
             </div>
             <div>
                <h4 className="text-sm font-bold text-white group-hover:text-blue-500 transition-colors">Yalnızca Beyaz Liste</h4>
                <p className="text-[10px] text-slate-500 font-medium">Sadece listedeki kullanıcılar mesaj gönderebilir.</p>
             </div>
          </label>
        </div>
      </div>
    </div>
  );
}

const AnalysisView = () => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex items-center justify-between mb-8">
       <div>
         <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-1">Analiz</h1>
         <p className="text-sm text-slate-500 font-medium">Grubunuzun büyüme ve etkileşim verilerini takip edin.</p>
       </div>
       <div className="flex items-center gap-3">
          <div className="bg-[#14181f] border border-white/5 rounded-xl px-4 h-10 flex items-center gap-3">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Son 7 gün</span>
             <ChevronRight size={14} className="rotate-90 text-slate-500" />
          </div>
          <div className="bg-[#14181f] border border-white/5 rounded-xl px-4 h-10 flex items-center gap-3">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">11.05.2026 - 17.05.2026</span>
          </div>
          <div className="flex items-center gap-2 ml-4">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ort. DAU</span>
             <span className="text-sm font-black text-white italic">0</span>
             <span className="mx-2 text-slate-800">|</span>
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ort. Günlük Mesaj</span>
             <span className="text-sm font-black text-white italic">0</span>
          </div>
       </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
       <div className="bg-[#14181f] border border-white/5 rounded-3xl p-8">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Toplam Mesaj</span>
          <div className="flex items-end gap-3 px-1">
             <h2 className="text-4xl font-black text-white italic tracking-tighter">84.2k</h2>
             <span className="text-xs font-bold text-emerald-500 mb-2">+12%</span>
          </div>
       </div>
       <div className="bg-[#14181f] border border-white/5 rounded-3xl p-8">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Aktif Üye</span>
          <div className="flex items-end gap-3 px-1">
             <h2 className="text-4xl font-black text-white italic tracking-tighter">1.2k</h2>
             <span className="text-xs font-bold text-blue-500 mb-2">~ Stabil</span>
          </div>
       </div>
       <div className="bg-[#14181f] border border-white/5 rounded-3xl p-8">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Engellenen Spam</span>
          <div className="flex items-end gap-3 px-1">
             <h2 className="text-4xl font-black text-white italic tracking-tighter">3.5k</h2>
             <span className="text-xs font-bold text-red-500 mb-2">+5.4%</span>
          </div>
       </div>
       <div className="bg-[#14181f] border border-white/5 rounded-3xl p-8">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Sunucu Gecikme</span>
          <div className="flex items-end gap-3 px-1">
             <h2 className="text-4xl font-black text-white italic tracking-tighter">42ms</h2>
             <span className="text-xs font-bold text-emerald-500 mb-2">-2ms</span>
          </div>
       </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
       <div className="bg-[#14181f] border border-white/5 rounded-[40px] p-10 h-96 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="relative z-10 text-center">
             <BarChart3 size={48} className="text-blue-500/20 mx-auto mb-4" />
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Büyüme Grafiği</span>
             <p className="text-xs text-slate-600 font-medium italic mt-2 italic capitalize tracking-widest">Veriler yükleniyor...</p>
          </div>
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,.05)_50%,transparent_75%)] bg-[length:20px_20px]"></div>
       </div>
       <div className="bg-[#14181f] border border-white/5 rounded-[40px] p-10 h-96">
          <h3 className="text-lg font-black text-white italic uppercase tracking-tighter mb-8">Etkinlik Zaman Çizelgesi</h3>
          <div className="space-y-6">
             {[1,2,3,4].map(i => (
               <div key={i} className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-all group-hover:text-white text-slate-500">
                    <History size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-0.5">Sistem Güncellemesi</h4>
                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">12:45 • Otomatik Yedekleme</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
     </div>
   </div>
);

const UsersView = ({ channel }: { channel: any }) => {
  const { groupId } = useParams();
  const { notification } = useTelegram();
  const [groupUsers, setGroupUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [promotingUserId, setPromotingUserId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // New states for interactive AdminRightsModal
  const [rightsModalData, setRightsModalData] = useState<{ userId: string; userName: string } | null>(null);
  const [submittingRights, setSubmittingRights] = useState(false);

  const targetGroupId = channel?.telegram_id || groupId || '';

  const fetchUsers = async () => {
    if (!targetGroupId) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await DatabaseService.getGroupUsers(targetGroupId);
      setGroupUsers(data || []);
    } catch (err: any) {
      console.error("Error fetching group users:", err);
      setErrorMsg(err?.message || "Kullanıcı listesi yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeed = async () => {
    if (!targetGroupId) return;
    setIsSeeding(true);
    setErrorMsg(null);
    try {
      const res = await DatabaseService.seedGroupUsers(targetGroupId);
      if (notification) {
        notification('success');
      }
      alert('5 adet örnek grup üyesi veritabanına eklendi!');
      await fetchUsers();
    } catch (err: any) {
      console.error("Error seeding group users:", err);
      setErrorMsg(err?.message || "Örnek kullanıcılar oluşturulurken bir hata oluştu.");
    } finally {
      setIsSeeding(false);
    }
  };

  const handlePromoteAdmin = (userId: string, userName: string) => {
    setRightsModalData({ userId, userName });
  };

  const handleConfirmPromote = async (permissions: Record<string, boolean>) => {
    if (!targetGroupId || !rightsModalData) return;
    setSubmittingRights(true);
    setPromotingUserId(rightsModalData.userId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/add-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channelId: targetGroupId,
          userId: rightsModalData.userId,
          action: "promote",
          permissions,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Yönetici ekleme talebi başarısız oldu.");
      }

      alert("Yönetici yapma talebi veritabanına başarıyla eklendi! Özel belirlediğiniz yetkiler kaydedildi. Telegram botu 5 saniye içinde yetki yükseltme işlemini tamamlayacaktır.");
      setRightsModalData(null);
    } catch (err: any) {
      console.error("Error creating promote admin action:", err);
      alert(err.message || "İşlem yapılırken bir hata oluştu.");
    } finally {
      setSubmittingRights(false);
      setPromotingUserId(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [targetGroupId]);

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Reset page when group ID changes
  useEffect(() => {
    setCurrentPage(1);
  }, [targetGroupId]);

  // Safeguarded filter against null / undefined fields
  const displayedUsers = groupUsers.filter(u => {
    if (!u) return false;
    const nameStr = String(u.name || '').toLowerCase();
    const usernameStr = String(u.username || '').toLowerCase();
    const userIdStr = String(u.user_id || '').toLowerCase();
    const lastMsgStr = String(u.last_message || '').toLowerCase();
    const langStr = String(u.language || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return (
      nameStr.includes(term) || 
      usernameStr.includes(term) || 
      userIdStr.includes(term) ||
      lastMsgStr.includes(term) ||
      langStr.includes(term)
    );
  });

  // Dynamic pagination math
  const totalPages = Math.ceil(displayedUsers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = displayedUsers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs animate-in fade-in">
          <AlertCircle size={16} className="shrink-0 text-red-500" />
          <div className="flex-1">
            <span className="font-bold">Bağlantı Hatası:</span> {errorMsg}
          </div>
          <button 
            onClick={fetchUsers} 
            className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-[10px] uppercase font-black tracking-widest transition-all"
          >
            Yeniden Dene
          </button>
        </div>
      )}

      <div className="bg-[#14181f] border border-white/5 rounded-[40px] overflow-hidden animate-in fade-in duration-300">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
              <Users size={20} className="text-blue-500" />
              Grup Üyeleri (group_users)
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {channel ? `${channel.name} grubuna ait aktif üyeler` : 'Grup kullanıcı listesi'} ({targetGroupId})
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
             <div className="relative">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Kullanıcı adı, isim, ID veya son mesaj..." 
                  className="bg-[#0f1218] border border-white/5 rounded-xl pl-10 pr-4 h-10 text-xs text-white outline-none focus:border-blue-500/30 w-72 placeholder:text-slate-650" 
                />
             </div>
             
             {/* Refresh Button */}
             <button 
                onClick={fetchUsers} 
                disabled={isLoading}
                title="Listeyi Yenile"
                className="h-10 w-10 bg-white/5 hover:bg-white/10 active:scale-95 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
             >
                <RotateCcw size={14} className={isLoading ? "animate-spin text-blue-500" : ""} />
             </button>

             <button className="h-10 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                <Filter size={14} />
                Filtrele
             </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-blue-500" size={36} />
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest italic animate-pulse">group_users tablosu yükleniyor...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/2 border-b border-white/5">
                   <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Kullanıcı</th>
                   <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Telegram ID</th>
                   <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Mesaj Sayısı</th>
                   <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Son Mesaj</th>
                   <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Seviye (XP)</th>
                   <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Katılım</th>
                   <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center justify-center max-w-md mx-auto py-6">
                        <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mb-4 animate-bounce">
                          <Users size={28} />
                        </div>
                        <h4 className="text-sm font-black text-white italic uppercase tracking-wider mb-2">Grupta Kullanıcı Bulunmuyor</h4>
                        <p className="text-xs text-slate-500 leading-relaxed mb-6">
                          <strong>{targetGroupId}</strong> grubu için henüz veritabanında aktif kullanıcı kaydı yok. Test etmek için 5 adet yüksek etkileşimli örnek üye oluşturabilirsiniz.
                        </p>
                        <button 
                          onClick={handleSeed}
                          disabled={isSeeding || isLoading}
                          className="px-6 h-11 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center mx-auto gap-2"
                        >
                          {isSeeding ? (
                            <>
                              <Loader2 className="animate-spin" size={14} />
                              Üretiliyor...
                            </>
                          ) : (
                            <>
                              <UserPlus size={14} />
                              5 Örnek Üye Ekle / Üret
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((gUser, i) => (
                    <tr key={gUser.user_id || i} className="hover:bg-white/[0.01] transition-colors">
                      {/* Name & Username with beautiful avatar */}
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center font-black text-white italic text-xs uppercase shadow-inner relative overflow-hidden">
                              {/* Soft dynamic color overlay based on name letters */}
                              <div className="absolute inset-0 opacity-10 bg-gradient-to-tr from-blue-500 to-amber-500" />
                              {gUser.name?.[0] || 'U'}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-xs font-bold text-white transition-colors hover:text-blue-400 cursor-pointer">
                                  {gUser.name || 'İsimsiz Kullanıcı'}
                                </h4>
                                {gUser.language && (
                                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-tight">
                                    {gUser.language}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 font-bold lowercase tracking-wider block mt-0.5 select-all">
                                {gUser.username ? `@${gUser.username}` : '@kullanici'}
                              </span>
                            </div>
                         </div>
                      </td>

                      {/* User Telegram ID */}
                      <td className="px-8 py-5 text-[11px] font-mono text-slate-400 tracking-wide select-all">
                        {gUser.user_id}
                      </td>

                      {/* Total Message Count */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 font-mono">
                          <MessageSquare size={13} className="text-slate-500" />
                          <span className="text-xs font-bold text-slate-200">
                             {gUser.total_messages !== undefined ? gUser.total_messages : (gUser.mes !== undefined ? gUser.mes : 0)}
                          </span>
                        </div>
                      </td>

                      {/* Last Message and time */}
                      <td className="px-8 py-5 max-w-[200px]">
                        {gUser.last_message ? (
                          <div className="space-y-1">
                            <p className="text-xs text-slate-300 font-medium truncate italic" title={gUser.last_message}>
                              "{gUser.last_message}"
                            </p>
                            {gUser.last_message_at && (
                              <span className="text-[9px] text-slate-500 font-semibold block capitalize">
                                 {new Date(gUser.last_message_at).toLocaleDateString("tr-TR")} {new Date(gUser.last_message_at).toLocaleTimeString("tr-TR", {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">-</span>
                        )}
                      </td>

                      {/* XP & Level Badge */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                           <span className="text-xs font-black text-amber-500 italic uppercase">
                             {gUser.xp !== undefined ? gUser.xp : 0} XP
                           </span>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="px-8 py-5 text-[10px] font-medium text-slate-500 uppercase tracking-widest whitespace-nowrap">
                        {gUser.joined_at ? new Date(gUser.joined_at).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                      </td>

                      {/* More actions buttons */}
                      <td className="px-8 py-5 text-right whitespace-nowrap">
                        <button 
                          onClick={() => handlePromoteAdmin(gUser.user_id, gUser.name || gUser.username || "Kullanıcı")}
                          disabled={promotingUserId === gUser.user_id}
                          className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/15 disabled:bg-blue-900/40 disabled:text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all inline-flex items-center gap-1.5 active:scale-95 disabled:scale-100 disabled:opacity-50"
                        >
                          {promotingUserId === gUser.user_id ? (
                            <>
                              <Loader2 size={10} className="animate-spin text-blue-400" />
                              Ekleniyor...
                            </>
                          ) : (
                            <>
                              <Shield size={10} />
                              Yönetici Yap
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-8 bg-white/2 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
           <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">
             Veritabanı Tablosu: group_users ({displayedUsers.length} kişi, {currentPage}/{totalPages} sayfa listeleniyor)
           </span>
           <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-white/5 flex items-center justify-center text-white transition-all"
              >
                <ChevronRight size={16} className="rotate-180" />
              </button>
              
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(page => (
                <button 
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black italic transition-all text-xs ${
                    currentPage === page 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                      : 'bg-white/5 hover:bg-white/10 text-white'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-white/5 flex items-center justify-center text-white transition-all"
              >
                <ChevronRight size={16} />
              </button>
           </div>
        </div>
      </div>

      <AdminRightsModal
        isOpen={rightsModalData !== null}
        userId={rightsModalData?.userId || ''}
        userName={rightsModalData?.userName || ''}
        onClose={() => setRightsModalData(null)}
        onConfirm={handleConfirmPromote}
        isSubmitting={submittingRights}
      />
    </div>
  );
};

const EmptyModule = ({ title }: { title?: string }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
    <Zap size={48} className="text-blue-500/20 mb-4" />
    <h3 className="text-lg font-black text-white italic uppercase tracking-tighter mb-2">{title || 'Geliştirme Aşamasında'}</h3>
    <p className="text-sm text-slate-600 font-medium max-w-sm">
      {title ? `${title} modülü henüz prototip aşamasındadır. Yakında aktif hale getirilecektir.` : 'Bu modül henüz prototip aşamasındadır. Yakında aktif hale getirilecektir.'}
    </p>
  </div>
);

// High-fidelity dynamic AdminRightsModal mimicking official Telegram admin configuration UI
interface AdminRightsModalProps {
  isOpen: boolean;
  userId: string;
  userName: string;
  onClose: () => void;
  onConfirm: (permissions: Record<string, boolean>) => Promise<void>;
  isSubmitting: boolean;
  initialPermissions?: Record<string, boolean> | null;
}

const AdminRightsModal = ({ isOpen, userId, userName, onClose, onConfirm, isSubmitting, initialPermissions }: AdminRightsModalProps) => {
  const [rights, setRights] = useState<Record<string, boolean>>({
    can_change_info: false,
    can_delete_messages: true,
    can_restrict_members: true,
    can_invite_users: true,
    can_pin_messages: true,
    can_post_stories: false,
    can_manage_video_chats: false,
    is_anonymous: false,
    can_promote_members: false
  });

  useEffect(() => {
    if (isOpen) {
      if (initialPermissions) {
        setRights({
          can_change_info: initialPermissions.can_change_info ?? false,
          can_delete_messages: initialPermissions.can_delete_messages ?? true,
          can_restrict_members: initialPermissions.can_restrict_members ?? true,
          can_invite_users: initialPermissions.can_invite_users ?? true,
          can_pin_messages: initialPermissions.can_pin_messages ?? true,
          can_post_stories: initialPermissions.can_post_stories ?? false,
          can_manage_video_chats: initialPermissions.can_manage_video_chats ?? false,
          is_anonymous: initialPermissions.is_anonymous ?? false,
          can_promote_members: initialPermissions.can_promote_members ?? false,
        });
      } else {
        setRights({
          can_change_info: false,
          can_delete_messages: true,
          can_restrict_members: true,
          can_invite_users: true,
          can_pin_messages: true,
          can_post_stories: false,
          can_manage_video_chats: false,
          is_anonymous: false,
          can_promote_members: false
        });
      }
    }
  }, [isOpen, initialPermissions]);

  const toggleRight = (key: string) => {
    setRights(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!isOpen) return null;

  const rightsList = [
    { key: 'can_change_info', label: 'Grup bilgisini değiştirme', desc: 'Grup ismi, açıklaması ve resmini değiştirme yetkisi' },
    { key: 'can_delete_messages', label: 'Mesajları silme', desc: 'Diğer üyelerin gönderdiği mesajları kaldırma yetkisi' },
    { key: 'can_restrict_members', label: 'Üyeleri yasaklama', desc: 'Kullanıcıları gruptan yasaklama veya kısıtlama yetkisi' },
    { key: 'can_invite_users', label: 'Üyeler ekleme', desc: 'Gruba yeni kullanıcı davet etme ve ekleme yetkisi' },
    { key: 'can_pin_messages', label: 'Mesajları sabitleme', desc: 'Önemli mesajları sohbetin üstüne sabitleme yetkisi' },
    { key: 'can_post_stories', label: 'Hikayeleri yönetme', desc: 'Grup adına hikayeler paylaşma ve düzenleme' },
    { key: 'can_manage_video_chats', label: 'Görüntülü sohbetleri yönetme', desc: 'Sesli ve görüntülü sohbet oturumları başlatma ve yönetme' },
    { key: 'is_anonymous', label: 'Anonim kal', desc: 'Grupta mesaj gönderirken kendi adı yerine grup adını kullanma' },
    { key: 'can_promote_members', label: 'Yeni yöneticiler ekleme', desc: 'Gruptaki diğer kullanıcılara yeni yöneticiler atayabilme yetkisi' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#07090c]/80 backdrop-blur-md"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="relative max-w-md w-full bg-[#10141b] border border-blue-500/20 rounded-[32px] shadow-2xl shadow-blue-900/10 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-white/5 bg-gradient-to-b from-blue-950/20 to-transparent">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Yönetici Hakları</h3>
                  <p className="text-xs font-bold text-blue-400 italic mt-0.5">{userName || 'Grup Üyesi'}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Subheader info block similar to official Telegram mobile app */}
          <div className="bg-[#151c27] px-6 py-4 border-b border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/10 rounded-full flex items-center justify-center font-black text-blue-500 italic text-sm border border-blue-500/10 shrink-0">
              {userName ? userName[0].toUpperCase() : 'U'}
            </div>
            <div>
              <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                <span className="text-blue-500 font-bold">BotlyHub</span> tarafından atanan yöneticilik haklarını yapılandırın.
              </p>
              <span className="text-[10px] text-slate-500 font-mono italic">Kullanıcı ID: {userId}</span>
            </div>
          </div>

          {/* Section Heading */}
          <div className="px-6 pt-5 pb-2">
            <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-widest italic">BU YÖNETİCİ NE YAPABİLİR?</h4>
          </div>

          {/* Rights Toggle List with custom styled toggles */}
          <div className="flex-1 overflow-y-auto px-6 space-y-3.5 pb-6">
            {rightsList.map((item) => {
              const active = rights[item.key];
              return (
                <div key={item.key} className="flex items-center justify-between gap-4 py-1.5 border-b border-white/[0.02] last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white tracking-tight">{item.label}</p>
                    <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5 max-w-[280px]">{item.desc}</p>
                  </div>
                  
                  {/* Telegram Style Premium Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => toggleRight(item.key)}
                    className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-all duration-300 relative shrink-0 ${
                      active ? 'bg-teal-500/20 border border-teal-500/40' : 'bg-rose-500/10 border border-rose-500/25'
                    }`}
                  >
                    <div
                      className={`w-4.5 h-4.5 rounded-full flex items-center justify-center transition-all duration-300 transform select-none ${
                        active 
                          ? 'translate-x-5.5 bg-teal-500 border border-teal-400' 
                          : 'translate-x-0.5 bg-rose-500 border border-rose-450'
                      }`}
                    >
                      {active ? (
                        <Check size={9} className="text-white" strokeWidth={4} />
                      ) : (
                        <X size={9} className="text-white" strokeWidth={4} />
                      )}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Bottom actions CTA */}
          <div className="p-6 border-t border-white/5 bg-[#0b0d12] flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-11 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            >
              Vazgeç
            </button>
            <button
              onClick={() => onConfirm(rights)}
              disabled={isSubmitting}
              className="flex-1 h-11 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 border border-blue-500/20 text-white font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin text-white" />
              ) : (
                <ShieldCheck size={14} />
              )}
              Yetkileri Kaydet
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BotManagementPanel;
