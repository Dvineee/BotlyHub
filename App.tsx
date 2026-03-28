
import React, { useEffect, Suspense, lazy, useState } from 'react';
import * as Router from 'react-router-dom';
import { Loader2, Megaphone } from 'lucide-react';
import { DatabaseService } from './services/DatabaseService';
import { useTelegram } from './hooks/useTelegram';
import { User } from './types';
import { checkAccountQuality, getDeviceFingerprint } from './security';
import './types';

const { HashRouter, Routes, Route, useLocation, useNavigate } = Router as any;

const Home = lazy(() => import('./pages/Home'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const BotDetail = lazy(() => import('./pages/BotDetail'));
const Payment = lazy(() => import('./pages/Payment'));
const ProfileSettings = lazy(() => import('./pages/ProfileSettings'));
const MyBots = lazy(() => import('./pages/MyBots'));
const MyChannels = lazy(() => import('./pages/MyChannels'));
const Premium = lazy(() => import('./pages/Premium'));
const Notifications = lazy(() => import('./pages/Notifications'));
const AccountSettings = lazy(() => import('./pages/AccountSettings'));
const Earnings = lazy(() => import('./pages/Earnings'));
const Maintenance = lazy(() => import('./pages/Maintenance'));
const Restricted = lazy(() => import('./pages/Restricted'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserPanelLogin = lazy(() => import('./pages/UserPanelLogin'));
const UserPanel = lazy(() => import('./pages/UserPanel'));
const ReferralPage = lazy(() => import('./pages/ReferralPage'));

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
    <span className="text-xs font-medium uppercase tracking-widest font-black opacity-40">Senkronize Ediliyor</span>
  </div>
);

const TelegramWrapper = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useTelegram();
  const isAdminPath = location.pathname.startsWith('/a/');
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isRestricted, setIsRestricted] = useState(false);

  useEffect(() => {
    DatabaseService.init();
    
    const initializeApp = async () => {
        // 1. Bakım Modu & Ayarlar Kontrolü
        if (!isAdminPath) {
            const settings = await DatabaseService.getSettings();
            if (settings) {
                if (settings.maintenanceMode) setIsMaintenance(true);
            }
        }

        // 2. Kullanıcı Senkronizasyonu
        if (user && !isAdminPath) {
            try {
                const userData: Partial<User> = {
                    id: user.id.toString(),
                    name: `${user.first_name} ${user.last_name || ''}`.trim(),
                    username: user.username || 'user',
                    avatar: user.photo_url || `https://ui-avatars.com/api/?name=${user.first_name}`,
                    role: 'User',
                    status: 'Active',
                    badges: [],
                    joinDate: new Date().toISOString()
                };
                await DatabaseService.syncUser(userData);
                
                // 3. Referans Kontrolü
                const tg = window.Telegram?.WebApp;
                const startParam = tg?.initDataUnsafe?.start_param;
                
                if (startParam && startParam.startsWith('ref_')) {
                    const referrerId = startParam.replace('ref_', '');
                    
                    // Kendini davet edemez
                    if (referrerId !== user.id.toString()) {
                        const existingUser = await DatabaseService.getUser(user.id.toString());
                        
                        // Sadece yeni kullanıcılar referans olabilir (veya henüz referansı olmayanlar)
                        if (!existingUser || !existingUser.referred_by) {
                            try {
                                // IP ve Fingerprint al
                                const ipRes = await fetch('https://api.ipify.org?format=json');
                                const { ip } = await ipRes.json();
                                const fingerprint = getDeviceFingerprint();
                                
                                // Hesap Kalite Kontrolü
                                const quality = checkAccountQuality(user);
                                
                                if (quality.isValid) {
                                    await DatabaseService.createReferral(
                                        referrerId, 
                                        user.id.toString(), 
                                        ip, 
                                        fingerprint, 
                                        !!user.is_premium
                                    );
                                } else {
                                    console.warn("Referral rejected: Low account quality", quality.reason);
                                }
                            } catch (err) {
                                console.error("Referral processing failed:", err);
                            }
                        }
                    }
                }

                // 4. Kısıtlama Kontrolü
                const dbUser = await DatabaseService.getUser(user.id.toString());
                if (dbUser && dbUser.isRestricted) {
                    setIsRestricted(true);
                } else {
                    setIsRestricted(false);
                }

                // Log visit
                await DatabaseService.logActivity(user.id.toString(), 'system', 'app_visit', 'Uygulama Ziyareti', `${userData.username} uygulamayı başlattı.`);
            } catch (e) {
                console.error("User sync failed:", e);
            }
        }
    };
    
    initializeApp();

    if (!isAdminPath) {
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.expand();
        if (tg.setHeaderColor) tg.setHeaderColor('#020617');
        tg.ready();
      }
    }

    const timer = setTimeout(() => {
      const loader = document.getElementById('loader');
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 300);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [isAdminPath, user, location.pathname]);

  useEffect(() => {
    if (isAdminPath) return;
    const tg = window.Telegram?.WebApp;
    if (!tg?.BackButton) return;

    const handleBack = () => {
      if (location.pathname === '/') return;
      navigate(-1);
    };

    if (location.pathname === '/') {
      tg.BackButton.hide();
    } else {
      tg.BackButton.show();
      tg.BackButton.onClick(handleBack);
    }
    return () => tg.BackButton.offClick(handleBack);
  }, [location, navigate, isAdminPath]);

  if (isMaintenance && !isAdminPath) {
      return <Maintenance />;
  }

  if (isRestricted && !isAdminPath) {
      return <Restricted />;
  }

  return (
    <div className={`${isAdminPath ? 'bg-[#020617]' : 'bg-slate-950'} flex flex-col min-h-screen`}>
      {children}
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <TelegramWrapper>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/bot/:id" element={<BotDetail />} />
            <Route path="/payment/:id" element={<Payment />} />
            <Route path="/settings" element={<ProfileSettings />} />
            <Route path="/account-settings" element={<AccountSettings />} />
            <Route path="/my-bots" element={<MyBots />} />
            <Route path="/channels" element={<MyChannels />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/earnings" element={<Earnings />} />
            <Route path="/a/admin" element={<AdminLogin />} />
            <Route path="/a/dashboard/*" element={<AdminDashboard />} />
            <Route path="/u/login" element={<UserPanelLogin />} />
            <Route path="/u/panel/*" element={<UserPanel />} />
            <Route path="/referral" element={<ReferralPage />} />
          </Routes>
        </Suspense>
      </TelegramWrapper>
    </HashRouter>
  );
}
