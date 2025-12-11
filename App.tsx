import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import UserList from './pages/UserList';
import UserDetail from './pages/UserDetail';
import Earnings from './pages/Earnings';
import BotDetail from './pages/BotDetail';
import Payment from './pages/Payment';
import ProfileSettings from './pages/ProfileSettings';
import SearchPage from './pages/SearchPage';
import MyBots from './pages/MyBots';
import MyChannels from './pages/MyChannels';
import Premium from './pages/Premium';
import Notifications from './pages/Notifications';
import AccountSettings from './pages/AccountSettings';

// Telegram Wrapper Component to handle Native Features
const TelegramWrapper = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Initialize Telegram WebApp Features
    const initTelegram = () => {
        const tg = window.Telegram?.WebApp;
        if (!tg) {
            console.warn("Telegram WebApp API not found.");
            return;
        }

        try {
            // Expand to full height (Always supported)
            tg.expand();

            // Set Header & Background Colors (Safe Check)
            // We use try-catch specifically for these calls as they can be flaky on old Android versions
            try {
                if (tg.isVersionAtLeast && tg.isVersionAtLeast('6.1')) {
                    tg.setHeaderColor?.('#020617');
                    tg.setBackgroundColor?.('#020617');
                } else {
                    // Fallback for v6.0
                    tg.setHeaderColor?.('#020617');
                    tg.setBackgroundColor?.('#020617');
                }
            } catch (e) {
                console.warn("Error setting Telegram colors:", e);
            }

            // Handle Viewport Height for Mobile Keyboards
            const setViewport = () => {
                const vh = tg.viewportHeight || window.innerHeight;
                document.documentElement.style.setProperty('--tg-viewport-height', `${vh}px`);
            };
            
            setViewport();
            tg.onEvent('viewportChanged', setViewport);
            
            // Signal Telegram that we are ready
            tg.ready();

            return () => {
                tg.offEvent('viewportChanged', setViewport);
            };
        } catch (e) {
            console.error("Critical Telegram init error:", e);
        }
    };

    const cleanup = initTelegram();

    // 2. Remove Loader (Always remove it, regardless of Telegram success/fail)
    // We use a small delay to ensure React has painted the initial frame
    const timer = setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 300);
        }
    }, 100);

    return () => {
        clearTimeout(timer);
        if (typeof cleanup === 'function') cleanup();
    };
  }, []);

  // Handle Native Back Button Logic separately to avoid re-running init logic
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg || !tg.BackButton) return;

    // Safety check for version
    const isSupported = tg.isVersionAtLeast ? tg.isVersionAtLeast('6.1') : false;
    
    if (!isSupported) {
        // If not supported, ensure it's hidden just in case
        try { tg.BackButton.hide(); } catch(e) {}
        return;
    }

    const handleBack = () => {
        // If we are at root, don't do anything (Telegram handles closing)
        if (location.pathname === '/') return;
        navigate(-1);
    };

    if (location.pathname === '/') {
        tg.BackButton.hide();
    } else {
        tg.BackButton.show();
        tg.BackButton.onClick(handleBack);
    }

    return () => {
        tg.BackButton.offClick(handleBack);
    };
  }, [location, navigate]);

  return (
      <div style={{ minHeight: 'var(--tg-viewport-height, 100vh)' }} className="bg-slate-950">
          {children}
      </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <TelegramWrapper>
        <div className="min-h-screen w-full bg-slate-950 text-white transition-colors duration-300 flex flex-col">
          <div className="max-w-md w-full mx-auto min-h-screen bg-slate-950 shadow-2xl relative overflow-hidden flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/users" element={<UserList />} />
              <Route path="/users/:id" element={<UserDetail />} />
              <Route path="/earnings" element={<Earnings />} />
              <Route path="/bot/:id" element={<BotDetail />} />
              <Route path="/payment/:id" element={<Payment />} />
              <Route path="/settings" element={<ProfileSettings />} />
              <Route path="/account-settings" element={<AccountSettings />} />
              <Route path="/my-bots" element={<MyBots />} />
              <Route path="/channels" element={<MyChannels />} />
              <Route path="/premium" element={<Premium />} />
              <Route path="/notifications" element={<Notifications />} />
            </Routes>
          </div>
        </div>
      </TelegramWrapper>
    </HashRouter>
  );
}