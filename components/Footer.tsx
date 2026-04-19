
import React, { useState } from 'react';
import { Send, Instagram, Youtube, Link, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';
import { useTelegram } from '../hooks/useTelegram';

const Footer: React.FC = () => {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const { haptic } = useTelegram();

  return (
    <footer className="mt-12 pt-8 border-t border-black/5 dark:border-white/5 flex flex-col items-center gap-10 px-4 pb-8 max-w-7xl mx-auto w-full">
      {/* Partners Section */}
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6">
        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] italic">İş Ortaklarımız</h3>
        <div className="flex items-center justify-center gap-12 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          {/* Google */}
          <div className="flex items-center gap-2 group cursor-pointer">
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Google</span>
          </div>

          {/* Telegram */}
          <div className="flex items-center gap-2 group cursor-pointer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 12 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.52-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.42-1.39-.88.03-.24.37-.48 1.02-.73 4-1.74 6.67-2.89 8.02-3.46 3.81-1.62 4.61-1.9 5.13-1.91.11 0 .37.03.54.17.14.12.18.28.19.41-.01.06-.01.22-.02.3z" fill="#0088CC"/>
            </svg>
            <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Telegram</span>
          </div>
        </div>
      </div>

      {/* Accordions */}
      <div className="w-full space-y-4 max-w-4xl mx-auto">
        {/* Accordion 1 */}
        <div className="bg-white dark:bg-slate-900/60 rounded-[8px] border border-black/5 dark:border-white/5 overflow-hidden transition-all duration-300">
          <button 
            onClick={() => { haptic('light'); setOpenAccordion(openAccordion === 'why' ? null : 'why'); }}
            className="w-full flex items-center justify-between p-[14px] text-left group"
          >
            <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-700 dark:text-slate-300 group-hover:text-blue-500 transition-colors italic">Neden BotlyHub?</span>
            <motion.div
              animate={{ rotate: openAccordion === 'why' ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <ChevronDown size={18} className="text-slate-400" />
            </motion.div>
          </button>
          <AnimatePresence>
            {openAccordion === 'why' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="px-6 pb-6 text-[12px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                  BotlyHub, en güvenilir ve onaylanmış Telegram botlarını tek bir çatı altında toplayarak size hem güvenlik hem de çeşitlilik sunar. 
                  Yapay zeka destekli analizlerimiz ve kullanıcı yorumlarımızla en iyi deneyimi yaşamanızı sağlıyoruz.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accordion 2 */}
        <div className="bg-white dark:bg-slate-900/60 rounded-[8px] border border-black/5 dark:border-white/5 overflow-hidden transition-all duration-300">
          <button 
            onClick={() => { haptic('light'); setOpenAccordion(openAccordion === 'how' ? null : 'how'); }}
            className="w-full flex items-center justify-between p-[14px] text-left group"
          >
            <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-700 dark:text-slate-300 group-hover:text-blue-500 transition-colors italic">Nasıl Çalışır?</span>
            <motion.div
              animate={{ rotate: openAccordion === 'how' ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <ChevronDown size={18} className="text-slate-400" />
            </motion.div>
          </button>
          <AnimatePresence>
            {openAccordion === 'how' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="px-6 pb-6 text-[12px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                  İhtiyacınız olan botu seçin, detaylarını inceleyin ve "Botu Başlat" butonuna tıklayarak saniyeler içinde kullanmaya başlayın. 
                  Eğer ücretli bir lisan gerekiyorsa, TON cüzdanınızla hızlıca ödeme yapıp ömür boyu erişim sağlayabilirsiniz.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 w-full">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="shrink-0 text-slate-400 dark:text-slate-500">
              <Logo style={{ width: '2.5rem', height: 'auto', display: 'block' }} />
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
            <a href="https://t.me/botlyhub" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors"><Send size={18} /></a>
            <a href="#" className="hover:text-pink-500 transition-colors"><Instagram size={18} /></a>
            <a href="#" className="hover:text-red-500 transition-colors"><Youtube size={18} /></a>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <a href="#" className="flex items-center gap-2 text-[#0098ea] text-[11px] font-black uppercase tracking-widest hover:opacity-80 transition-opacity">
            <Link size={14} />
            Hakkımızda
          </a>
          <a href="#" className="flex items-center gap-2 text-[#0098ea] text-[11px] font-black uppercase tracking-widest hover:opacity-80 transition-opacity">
            <Link size={14} />
            İletişim
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
