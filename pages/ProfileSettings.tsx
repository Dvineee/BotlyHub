
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { ChevronLeft, User, CreditCard, Bell, Globe, ChevronRight, Crown, Users } from 'lucide-react';
// Fixed: Use namespace import for react-router-dom to resolve "no exported member" errors
import * as Router from 'react-router-dom';
import { subscriptionPlans } from '../data';
import { useTelegram } from '../hooks/useTelegram';

const { useNavigate } = Router as any;

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { user } = useTelegram();
  const [currentPlanName, setCurrentPlanName] = useState('Başlangıç');
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
      const planId = localStorage.getItem('userPlan');
      if (planId) {
          const plan = subscriptionPlans.find(p => p.id === planId);
          if (plan) setCurrentPlanName(plan.name);
      }
      
      // Fetch version
      import('../services/DatabaseService').then(({ DatabaseService }) => {
          DatabaseService.getSettings().then(settings => {
              if (settings?.version) setVersion(settings.version);
          });
      });
  }, []);

  // Kullanıcı adı veya isim yoksa varsayılan değerler
  const displayName = useMemo(() => user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Misafir Kullanıcı', [user]);
  const displayUsername = useMemo(() => user?.username ? `@${user.username}` : (user?.id ? `ID: ${user.id}` : '@misafir'), [user]);
  
  // Profil fotoğrafı yoksa baş harflerden avatar oluşturma (Placeholder API)
  const avatarUrl = useMemo(() => user?.photo_url 
    ? user.photo_url 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=334155&color=fff&size=200`, [user, displayName]);

  const MenuItem = React.memo(({ icon: Icon, label, value, hasArrow = true, onClick }: { icon: any, label: string, value?: string, hasArrow?: boolean, onClick?: () => void }) => (
    <div 
        onClick={onClick}
        className="flex items-center justify-between p-5 bg-slate-900/40 hover:bg-slate-900/60 transition-all cursor-pointer group first:rounded-t-[32px] last:rounded-b-[32px] border-b border-white/5 last:border-0 active:scale-[0.98]"
    >
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 group-hover:bg-blue-600/10 flex items-center justify-center transition-all border border-white/5 group-hover:border-blue-500/20">
                <Icon size={20} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <span className="font-black text-[11px] text-white uppercase tracking-widest italic">{label}</span>
        </div>
        <div className="flex items-center gap-3">
            {value && <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic">{value}</span>}
            {hasArrow && <ChevronRight size={16} className="text-slate-700 group-hover:text-white transition-colors" />}
        </div>
    </div>
  ));

  return (
    <div className="min-h-screen p-6 pt-10 pb-32 bg-slate-950 transition-colors">
         <div className="flex items-center gap-5 mb-10">
            <button onClick={() => navigate('/')} className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-white active:scale-90 transition-all">
                <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
                <h1 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">Profil Ayarları</h1>
                <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.4em] mt-1.5 italic">User Configuration v4</p>
            </div>
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-5 mb-10 p-6 bg-slate-900/40 rounded-[32px] border border-white/5 backdrop-blur-xl shadow-2xl">
             <div className="w-20 h-20 rounded-[28px] bg-slate-950 flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
                 <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" loading="lazy" />
             </div>
             <div className="flex-1 min-w-0">
                 <h2 className="font-black text-xl text-white italic tracking-tighter uppercase truncate leading-none mb-1">{displayName}</h2>
                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic mb-3">{displayUsername}</p>
                 <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-blue-500/20 shadow-lg shadow-blue-900/20">
                    <Crown size={12} className="fill-blue-500/20" />
                    <span>{currentPlanName}</span>
                 </div>
             </div>
        </div>

        <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] mb-4 italic ml-4">Hesap Yönetimi</h3>
        <div className="mb-8 rounded-[32px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-xl">
            <MenuItem 
                icon={User} 
                label="Hesap Bilgileri" 
                onClick={() => navigate('/account-settings')}
            />
            <MenuItem 
                icon={CreditCard} 
                label="Abonelik Yönetimi" 
                value={currentPlanName} 
                onClick={() => navigate('/premium')}
            />
            <MenuItem 
                icon={Users} 
                label="Referans Sistemi" 
                onClick={() => navigate('/referral')}
            />
        </div>

        <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] mb-4 italic ml-4">Uygulama Tercihleri</h3>
        <div className="mb-8 rounded-[32px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-xl">
            <MenuItem 
                icon={Bell} 
                label="Bildirimler" 
                onClick={() => navigate('/notifications')}
            />
            <MenuItem icon={Globe} label="Dil Seçimi" value="Türkçe" />
        </div>

        {version && (
            <div className="mt-12 text-center opacity-20">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">BOTLYHUB {version}</p>
            </div>
        )}
    </div>
  );
};

export default ProfileSettings;
