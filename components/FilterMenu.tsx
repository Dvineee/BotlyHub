
import React, { useState, useRef, useEffect } from 'react';
import { Check, Zap, Gift, Sparkles, TrendingUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFilter, FilterType } from '../FilterContext';
import { useTelegram } from '../hooks/useTelegram';
import { useTranslation } from '../TranslationContext';

const FilterIcon = ({ size = 18, className = "" }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    fill="none" 
    viewBox="0 0 24 24" 
    className={className}
    style={{ height: size, width: size, display: 'block', flex: '0 0 auto' }}
  >
    <path 
      fill="currentColor" 
      d="M16.929 13.28a3.643 3.643 0 1 1-3.546 4.484 1 1 0 0 1-.168.017l-7.432.006a.858.858 0 0 1 0-1.714l7.432-.006a1 1 0 0 1 .168.017 3.645 3.645 0 0 1 3.546-2.803m0 1.716a1.929 1.929 0 1 0 0 3.857 1.929 1.929 0 0 0 0-3.857M7.643 4a3.645 3.645 0 0 1 3.545 2.802 1 1 0 0 1 .17-.016h8.356a.858.858 0 0 1 0 1.714h-8.357a1 1 0 0 1-.168-.017A3.643 3.643 0 1 1 7.643 4m0 1.714a1.928 1.928 0 1 0 0 3.857 1.928 1.928 0 0 0 0-3.857"
    />
  </svg>
);

export const FilterMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { activeFilter, setActiveFilter, searchMode, setSearchMode } = useFilter();
  const { haptic } = useTelegram();
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);

  const options: { id: FilterType; label: string; icon: any; color: string }[] = [
    { id: 'all', label: 'Tümü', icon: FilterIcon, color: 'text-slate-400' },
    { id: 'paid', label: 'Ücretli', icon: Zap, color: 'text-slate-400' },
    { id: 'free', label: 'Ücretsiz', icon: Gift, color: 'text-slate-400' },
    { id: 'popular', label: 'En Popüler', icon: TrendingUp, color: 'text-slate-400' },
    { id: 'bhub', label: 'BHub Orijinal', icon: Sparkles, color: 'text-slate-400' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: FilterType) => {
    haptic('light');
    setActiveFilter(id);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => { e.stopPropagation(); haptic('light'); setIsOpen(!isOpen); }}
        className={`w-10 h-10 flex items-center justify-center transition-all ${
          isOpen || activeFilter !== 'all'
            ? 'text-blue-600 dark:text-blue-500'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <FilterIcon size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute right-0 mt-4 w-60 bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-white/5 rounded-2xl shadow-2xl p-2 z-[150] animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Filtrele</span>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} 
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Bots / Apps Toggle Segment */}
            <div className="px-1 pb-2 mb-2 border-b border-slate-100 dark:border-white/5">
              <div className="flex bg-slate-100/80 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200/20">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    haptic('light');
                    setSearchMode('bots');
                  }}
                  className={`flex-1 py-1.5 text-center text-[11px] font-extrabold uppercase tracking-wider rounded-lg transition-all ${
                    searchMode === 'bots'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                  }`}
                >
                  {t("cat_bots") || "Botlar"}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    haptic('light');
                    setSearchMode('apps');
                  }}
                  className={`flex-1 py-1.5 text-center text-[11px] font-extrabold uppercase tracking-wider rounded-lg transition-all ${
                    searchMode === 'apps'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                  }`}
                >
                  {t("cat_apps_nav") || t("apps") || "Uygulamalar"}
                </button>
              </div>
            </div>

            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={(e) => { e.stopPropagation(); handleSelect(opt.id); }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <opt.icon size={18} className={`${opt.color} ${activeFilter === opt.id ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`} />
                  <span className={`text-xs font-bold uppercase tracking-tight ${
                    activeFilter === opt.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                  }`}>
                    {opt.label}
                  </span>
                </div>
                {activeFilter === opt.id && <Check size={14} className="text-blue-600 dark:text-blue-400" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
