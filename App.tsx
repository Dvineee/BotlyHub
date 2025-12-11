
import React, { useEffect, useState } from 'react';
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
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Safety check for window.Telegram
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      
      // Notify Telegram that the Mini App is ready to be displayed
      tg.ready();
      setIsReady(true);

      try {
        tg.expand(); // Try to expand to full height
        tg.enableClosingConfirmation(); 
        
        // Set header color
        if (tg.setHeaderColor) {
            tg.setHeaderColor('#020617'); // Match slate-950
        }
        if (tg.setBackgroundColor) {
            tg.setBackgroundColor('#020617');
        }

      } catch (e) {
        console.warn('Telegram API initialization warning:', e);
      }
      
      // Fix colors to match theme
      if (tg.colorScheme === 'dark') {
          document.documentElement.classList.add('dark');
      }
    } else {
        // Fallback for browser testing
        setIsReady(true);
    }
  }, []);

  // Handle Native Back Button
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    const handleBack = () => {
      navigate(-1);
    };

    if (location.pathname === '/') {
      tg.BackButton.hide();
    } else {
      tg.BackButton.show();
      tg.BackButton.offClick(handleBack); 
      tg.BackButton.onClick(handleBack);
    }

    return () => {
      tg.BackButton.offClick(handleBack);
    };
  }, [location, navigate]);

  return <>{children}</>;
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
