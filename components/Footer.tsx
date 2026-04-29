
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
