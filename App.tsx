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
    const tg = window.Telegram?.WebApp;
    if (tg) {
      // Initialize Telegram WebApp
      tg.ready();
      try {
        tg.expand(); // Try to expand to full height
        tg.enableClosingConfirmation(); // Prevent accidental closes on Swipe Down
      } catch (e) {
        console.warn('Telegram expand/confirmation not available', e);
      }
      
      // Fix colors to match theme (Optional sync)
      if (tg.colorScheme === 'dark') {
          document.documentElement.classList.add('dark');
      }
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
      // Remove previous listeners to avoid duplicates
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
        <div className="min-h-screen bg-slate-950 text-white transition-colors duration-300">
          <div className="max-w-md mx-auto min-h-screen bg-slate-950 shadow-2xl relative overflow-hidden">
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