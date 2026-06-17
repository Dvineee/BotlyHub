
import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Megaphone } from 'lucide-react';
import { DatabaseService } from './services/DatabaseService';
import { useTelegram } from './hooks/useTelegram';
import { User } from './types';
import { checkAccountQuality, getDeviceFingerprint } from './security';
import './types';

// Static/Essential routes
import Maintenance from './pages/Maintenance';
import Restricted from './pages/Restricted';

// Lazy loaded routes for optimized bundle size and speed
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
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserPanelLogin = lazy(() => import('./pages/UserPanelLogin'));
const UserPanel = lazy(() => import('./pages/UserPanel'));
const ReferralPage = lazy(() => import('./pages/ReferralPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostDetail = lazy(() => import('./pages/BlogPostDetail'));
const Statistics = lazy(() => import('./pages/Statistics'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const BotManagementPanel = lazy(() => import('./pages/BotManagementPanel'));
const QAForum = lazy(() => import('./pages/QAForum'));

import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';



const TelegramWrapper = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useTelegram();
  const isAdminPath = location.pathname.startsWith('/a/');
  const isPanelPath = isAdminPath || location.pathname.startsWith('/u/');
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isRestricted, setIsRestricted] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isPanelPath) {
      root.classList.remove('light');
      root.classList.add('dark');
    } else {
      const savedTheme = localStorage.getItem('theme') || 'dark';
      root.classList.remove('light', 'dark');
      root.classList.add(savedTheme);
    }

    DatabaseService.init();
    
    const initializeApp = async () => {
        // 1. Bakım Modu & Ayarlar Kontrolü
        if (!isAdminPath) {
            const settings = await DatabaseService.getSettings();
            if (settings && settings.maintenanceMode) {
                setIsMaintenance(true);
            }
        }

        // 2. Kullanıcı Senkronizasyonu
        if (user?.id && !isAdminPath) {
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
                    
                    if (referrerId !== user.id.toString()) {
                        const existingUser = await DatabaseService.getUser(user.id.toString());
                        if (!existingUser || !existingUser.referred_by) {
                            try {
                                const ipRes = await fetch('https://api.ipify.org?format=json');
                                const { ip } = await ipRes.json();
                                const fingerprint = getDeviceFingerprint();
                                const quality = checkAccountQuality(user);
                                
                                if (quality.isValid) {
                                    await DatabaseService.createReferral(
                                        referrerId, 
                                        user.id.toString(), 
                                        ip, 
                                        fingerprint, 
                                        !!user.is_premium
                                    );
                                }
                            } catch (err) {
                                console.error("Referral processing failed:", err);
                            }
                        }
                    }
                }

                if (startParam && startParam.startsWith('bot_')) {
                    const botSlug = startParam.replace('bot_', '');
                    navigate(`/bot/${botSlug}`, { replace: true });
                }

                // 4. Kısıtlama Kontrolü
                const dbUser = await DatabaseService.getUser(user.id.toString());
                if (dbUser && dbUser.isRestricted) {
                    setIsRestricted(true);
                } else {
                    setIsRestricted(false);
                }
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
  }, [isAdminPath, user?.id]);

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
  }, [location.pathname, navigate, isAdminPath]);

  const hideBottomNav = isPanelPath || location.pathname.includes('/bot/') || location.pathname.includes('/payment/') || location.pathname.includes('/bot-panel/') || location.pathname.startsWith('/qa') || location.pathname.startsWith('/blog');

  return (
    <div className={`${isPanelPath ? 'dark bg-slate-950' : 'bg-slate-50 dark:bg-slate-950'} flex flex-col min-h-screen max-w-full overflow-x-clip transition-colors duration-300`}>
      {isMaintenance && !isAdminPath ? (
        <Maintenance />
      ) : isRestricted && !isAdminPath ? (
        <Restricted />
      ) : (
        <div className="w-full flex-1 flex flex-col">
          {children}
          {!isPanelPath && !isMaintenance && !isRestricted && (
            <>
              <Footer />
              {!hideBottomNav && <BottomNav />}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <>
      <ScrollToTop />
      <TelegramWrapper>
        <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center text-slate-500" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/bot/:slug" element={<BotDetail />} />
            <Route path="/payment/:slug" element={<Payment />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/user/:id" element={<UserProfile />} />
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
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostDetail />} />
            <Route path="/stats" element={<Statistics />} />
            <Route path="/qa" element={<QAForum />} />
            <Route path="/bot-panel/:botId/*" element={<BotManagementPanel />} />
          </Routes>
        </Suspense>
      </TelegramWrapper>
    </>
  );
}
