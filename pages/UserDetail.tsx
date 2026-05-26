
import React, { useState, useEffect } from 'react';
import { Bell, Bot, BarChart2, ShieldAlert, Ban, X, ChevronLeft } from 'lucide-react';
// Fixed: Use namespace import for react-router-dom to resolve "no exported member" errors
import * as Router from 'react-router-dom';
import { DatabaseService } from '../services/DatabaseService';
import { User } from '../types';

const { useNavigate, useParams } = Router as any;

const mockUsers: User[] = [
  { id: '1259102763', name: 'Ali Yılmaz', username: 'aliyilmaz', avatar: 'https://picsum.photos/seed/ali/200', role: 'User', status: 'Active', badges: ['Premium', 'Reklamcı'], joinDate: '23.05.2023' },
  { id: '8426134237', name: 'Zeynep Kaya', username: 'zeynepkaya', avatar: 'https://picsum.photos/seed/zey/200', role: 'Admin', status: 'Active', badges: ['Premium'], joinDate: '15.02.2023' },
  { id: '8099071818', name: 'Kaju', username: 'Kajusoft', avatar: 'https://picsum.photos/seed/meh/200', role: 'User', status: 'Active', badges: [], joinDate: '10.03.2023' },
  { id: 'guest_user', name: 'User', username: 'user', avatar: 'https://picsum.photos/seed/ayse/200', role: 'User', status: 'Passive', badges: [], joinDate: '20.04.2023' },
];

const UserDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [restrictions, setRestrictions] = useState({
    restrictPlatform: false,
    restrictAds: false,
    modBot: true,
    analysisBot: false
  });

  const [activeTab, setActiveTab] = useState<'bots' | 'apps' | 'channels'>('bots');

  useEffect(() => {
    let active = true;
    if (!id) return;

    DatabaseService.getUser(id)
      .then((fetched) => {
        if (!active) return;
        if (fetched) {
          setUser(fetched);
          setRestrictions(prev => ({
            ...prev,
            restrictPlatform: !!fetched.isRestricted,
            restrictAds: !fetched.canPublishPromos
          }));
        } else {
          const matchMock = mockUsers.find(mu => mu.id === id);
          if (matchMock) {
            setUser(matchMock);
            setRestrictions(prev => ({
              ...prev,
              restrictPlatform: matchMock.status === 'Passive',
              restrictAds: !matchMock.badges.includes('Reklamcı')
            }));
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching user detail:", err);
        const matchMock = mockUsers.find(mu => mu.id === id);
        if (active && matchMock) {
          setUser(matchMock);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [id]);

  const toggleLocal = (key: 'modBot' | 'analysisBot') => {
    setRestrictions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePlatformRestriction = async () => {
    if (!user) return;
    const newVal = !restrictions.restrictPlatform;
    try {
      await DatabaseService.updateUserRestriction(user.id, newVal);
      setRestrictions(prev => ({ ...prev, restrictPlatform: newVal }));
      setUser(prev => prev ? { ...prev, isRestricted: newVal } : null);
    } catch (e) {
      console.error("Failed to update platform restriction:", e);
    }
  };

  const toggleAdsRestriction = async () => {
    if (!user) return;
    const newVal = !restrictions.restrictAds;
    try {
      await DatabaseService.updateUserPublishStatus(user.id, !newVal);
      setRestrictions(prev => ({ ...prev, restrictAds: newVal }));
      setUser(prev => prev ? { ...prev, canPublishPromos: !newVal } : null);
    } catch (e) {
      console.error("Failed to update ads restriction:", e);
    }
  };

  const getDisplayName = (u: User) => {
    if (!u.name || u.name === 'undefined' || u.name.trim() === '') {
      if (u.username && u.username !== 'undefined' && u.username.trim() !== '') {
        return u.username;
      }
      return `Kullanıcı #${u.id.substring(0, 6)}`;
    }
    return u.name;
  };

  const getDisplayUsername = (u: User) => {
    if (!u.username || u.username === 'undefined' || u.username.trim() === '') {
      return `@user_${u.id.substring(0, 4)}`;
    }
    return u.username.startsWith('@') ? u.username : `@${u.username}`;
  };

  const getUserAvatar = (u: User) => {
    if (u.avatar && u.avatar.startsWith('http')) {
      return u.avatar;
    }
    const nameParam = encodeURIComponent(getDisplayName(u));
    return `https://ui-avatars.com/api/?name=${nameParam}&background=0f172a&color=fff`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold mb-4">Kullanıcı Bulunamadı</h2>
        <button onClick={() => navigate('/users')} className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold">Geri Dön</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-200 animate-in fade-in pb-32 transition-colors duration-300">
      {/* Header */}
      <div className="p-4 flex items-center justify-between sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl z-50 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/users')}
              className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-[14px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Kullanıcı Detayları</h1>
        </div>
        <div className="flex items-center gap-2">
            <div className={`px-3 py-1.5 border rounded-xl ${restrictions.restrictPlatform ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                 <span className="text-[8px] font-black uppercase tracking-widest leading-none">{restrictions.restrictPlatform ? 'Kısıtlı' : 'Çevrimiçi'}</span>
            </div>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="px-6 mt-8 mb-10">
        <div className="relative p-8 bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 rounded-xl overflow-hidden fancy-glass-card">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 dark:bg-brand-light/5 blur-3xl -mr-16 -mt-16 rounded-full" />
            
            <div className="relative z-10 flex flex-col items-center">
                <div className="relative mb-6">
                    <div className="w-28 h-28 rounded-xl p-1 bg-gradient-to-tr from-brand/20 to-brand-light/20 backdrop-blur-md">
                        <img 
                            src={getUserAvatar(user)} 
                            alt={getDisplayName(user)} 
                            className="w-full h-full rounded-xl object-cover border-4 border-white dark:border-slate-950" 
                        />
                    </div>
                </div>
                
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">{getDisplayName(user)}</h2>
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-brand dark:text-brand-light text-[10px] font-black uppercase tracking-[0.2em]">{getDisplayUsername(user)}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest">{user.role === 'Admin' ? 'ADMİN' : 'PRO ÜYE'}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 w-full mt-10">
                    <div className="p-4 bg-slate-50/50 dark:bg-slate-950/40 rounded-[24px] border border-black/5 dark:border-white/5 text-center stats-card-bg">
                        <p className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">ID NUMARASI</p>
                        <p className="text-xs font-black text-slate-600 dark:text-slate-300 tabular-nums">#{user.id}</p>
                    </div>
                    <div className="p-4 bg-slate-50/50 dark:bg-slate-950/40 rounded-[24px] border border-black/5 dark:border-white/5 text-center stats-card-bg">
                        <p className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">KATILIM TARİHİ</p>
                        <p className="text-xs font-black text-slate-600 dark:text-slate-300 tabular-nums">
                          {user.joinDate ? new Date(user.joinDate).toLocaleDateString('tr-TR') : '24.05.2023'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Main Settings Section */}
      <div className="px-6 space-y-10 max-w-lg mx-auto">
        
        {/* Action Button */}
        <button className="w-full bg-brand dark:bg-brand-light hover:shadow-lg hover:shadow-brand/20 active:scale-95 transition-all text-white font-black py-6 rounded-xl flex items-center justify-center gap-4 uppercase text-[11px] tracking-[0.3em] border-b-8 border-brand-dark dark:border-brand-light/20 relative group overflow-hidden">
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <Bell size={20} className="relative z-10" />
            <span className="relative z-10">Bildirim Gönder</span>
        </button>

        {/* Tab Switcher */}
        <div>
            <div className="bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-xl flex border border-black/5 dark:border-white/5 mb-6">
                <button 
                  onClick={() => setActiveTab('bots')}
                  className={`flex-1 py-4 text-[11px] font-black rounded-xl uppercase tracking-widest transition-all ${activeTab === 'bots' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                >
                  Botlar
                </button>
                <button 
                  onClick={() => setActiveTab('apps')}
                  className={`flex-1 py-4 text-[11px] font-black rounded-xl uppercase tracking-widest transition-all ${activeTab === 'apps' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                >
                  Apps
                </button>
                <button 
                  onClick={() => setActiveTab('channels')}
                  className={`flex-1 py-4 text-[11px] font-black rounded-xl uppercase tracking-widest transition-all ${activeTab === 'channels' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                >
                  Kanallar
                </button>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between px-2 mb-2">
                    <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">AKTİF BOT LİSTESİ</h3>
                    <div className="w-8 h-px bg-slate-200 dark:bg-slate-900" />
                </div>

                {/* Bot List with Toggles */}
                <div className="flex flex-col bg-white dark:bg-slate-900/40 rounded-xl border border-black/5 dark:border-white/5 backdrop-blur-xl overflow-hidden fancy-glass-card">
                    <div className="p-2 space-y-1">
                        <div className="p-6 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-center border border-black/5 dark:border-white/5 text-blue-500">
                                    <Bot size={24} />
                                </div>
                                <div>
                                    <h3 className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Moderasyon Botu</h3>
                                    <p className="text-[9px] text-brand dark:text-brand-light font-black uppercase mt-1 tracking-widest">@modbot_pro</p>
                                </div>
                            </div>
                            <div 
                                onClick={() => toggleLocal('modBot')}
                                className={`w-14 h-8 rounded-[14px] p-1.5 cursor-pointer transition-all duration-500 ${restrictions.modBot ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-lg transition-all shadow-md  ${restrictions.modBot ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                        </div>

                        <div className="p-6 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-center border border-black/5 dark:border-white/5 text-purple-500">
                                    <BarChart2 size={24} />
                                </div>
                                <div>
                                    <h3 className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Analiz Botu</h3>
                                    <p className="text-[9px] text-brand dark:text-brand-light font-black uppercase mt-1 tracking-widest">@stats_helper_bot</p>
                                </div>
                            </div>
                            <div 
                                onClick={() => toggleLocal('analysisBot')}
                                className={`w-14 h-8 rounded-[14px] p-1.5 cursor-pointer transition-all duration-500 ${restrictions.analysisBot ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-lg transition-all shadow-md  ${restrictions.analysisBot ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Admin Controls Section */}
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">ERİŞİM YÖNETİMİ</h3>
                <ShieldAlert size={14} className="text-red-500/50" />
            </div>

            <div className="flex flex-col bg-white dark:bg-slate-900/40 rounded-xl border border-red-500/5 dark:border-red-500/10 overflow-hidden fancy-glass-card">
                <div className="p-2 space-y-1">
                    <div className="p-6 flex items-center justify-between bg-red-500/5 dark:bg-red-500/5 rounded-xl">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/10 text-red-500">
                                <Ban size={24} />
                            </div>
                            <div>
                                <h3 className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Sistemi Kilitle</h3>
                                <p className="text-[9px] text-red-500/70 font-black uppercase mt-1 tracking-widest">TÜM ERİŞİMİ KESER</p>
                            </div>
                        </div>
                        <div 
                            onClick={togglePlatformRestriction}
                            className={`w-14 h-8 rounded-[14px] p-1.5 cursor-pointer transition-all duration-500 ${restrictions.restrictPlatform ? 'bg-red-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-lg transition-all shadow-md  ${restrictions.restrictPlatform ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                    </div>

                    <div className="p-6 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-center border border-black/5 dark:border-white/5 text-orange-500">
                                <ShieldAlert size={24} />
                            </div>
                            <div>
                                <h3 className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Reklam Kısıtı</h3>
                                <p className="text-[9px] text-slate-500/70 font-black uppercase mt-1 tracking-widest">REKLAM YETKİSİNİ ENGELLE</p>
                            </div>
                        </div>
                        <div 
                            onClick={toggleAdsRestriction}
                            className={`w-14 h-8 rounded-[14px] p-1.5 cursor-pointer transition-all duration-500 ${restrictions.restrictAds ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-lg transition-all shadow-md  ${restrictions.restrictAds ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default UserDetail;
