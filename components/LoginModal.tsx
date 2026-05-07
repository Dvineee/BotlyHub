
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, Edit3, Download, ExternalLink } from 'lucide-react';
import { TelegramLoginWidget } from './TelegramLoginWidget';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuth: (user: any) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onAuth }) => {
  const benefits = [
    {
      icon: Bell,
      text: 'Uygulama bildirimlerinden anında haberdar olun',
      color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-500'
    },
    {
      icon: Edit3,
      text: 'Uygulamalar hakkında inceleme ve yorum bırakın',
      color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-500'
    },
    {
      icon: Download,
      text: 'Katalog güncellemelerini ve yeni botları kaçırmayın',
      color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-500'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-xl overflow-hidden relative shadow-2xl border border-black/5 dark:border-white/5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 sm:p-12">
              <div className="flex justify-between items-start mb-6 sm:mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Giriş Yap</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-400"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6 sm:space-y-8 mb-8 sm:mb-12">
                {benefits.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 sm:gap-5">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${item.color} flex items-center justify-center shrink-0`}>
                      <item.icon size={20} className="sm:w-[22px] sm:h-[22px]" />
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-medium text-base sm:text-lg tracking-tight">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <div className="flex justify-center w-full">
                  <TelegramLoginWidget 
                    botUsername="BotlyHubBOT" 
                    cornerRadius={12}
                    size="large"
                    onAuth={(user) => {
                      onAuth(user);
                      onClose();
                    }} 
                  />
                </div>
                
                <div className="text-center">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                    Telegram yok mu? Uygulamayı resmi{' '}
                    <a 
                      href="https://telegram.org" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline inline-flex items-center gap-1"
                    >
                      web sitesinden
                      <ExternalLink size={12} />
                    </a>
                    {' '}edinin.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
