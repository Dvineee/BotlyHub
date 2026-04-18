
import React, { useState, useRef, useEffect } from 'react';
import { Check, Zap, Gift, Sparkles, TrendingUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFilter, FilterType } from '../FilterContext';
import { useTelegram } from '../hooks/useTelegram';

const FilterIcon = ({ size = 18, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="4" y1="6" x2="20" y2="6"/>
      <circle cx="13" cy="6" r="1.5" fill="currentColor"/>
      
      <line x1="4" y1="12" x2="20" y2="12"/>
      <circle cx="8" cy="12" r="1.5" fill="currentColor"/>
      
      <line x1="4" y1="18" x2="20" y2="18"/>
      <circle cx="16" cy="18" r="1.5" fill="currentColor"/>
    </g>
  </svg>
);

export const FilterMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { activeFilter, setActiveFilter } = useFilter();
  const { haptic } = useTelegram();
  const menuRef = useRef<HTMLDivElement>(null);

  const options: { id: FilterType; label: string; icon: any; color: string }[] = [
    { id: 'all', label: 'Tümü', icon: FilterIcon, color: 'text-slate-400' },
    { id: 'paid', label: 'Ücretli', icon: Zap, color: 'text-purple-500' },
    { id: 'free', label: 'Ücretsiz', icon: Gift, color: 'text-emerald-500' },
    { id: 'popular', label: 'En Popüler', icon: TrendingUp, color: 'text-orange-500' },
    { id: 'bhub', label: 'BHub Orijinal', icon: Sparkles, color: 'text-blue-500' },
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
        onClick={() => { haptic('light'); setIsOpen(!isOpen); }}
        className={`w-10 h-10 flex items-center justify-center rounded-2xl border transition-all active:scale-90  ${
          isOpen || activeFilter !== 'all'
            ? 'bg-blue-600 border-blue-500 text-white'
            : 'bg-white dark:bg-slate-900/80 border-black/5 dark:border-white/5 text-slate-500 dark:text-slate-400'
        }`}
      >
        <FilterIcon size={18} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-[28px]  overflow-hidden z-[100] py-2 backdrop-blur-2xl"
          >
            <div className="px-5 py-2 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtrele</span>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X size={14} />
              </button>
            </div>
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-black/5 dark:hover:bg-white/5 text-left transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <opt.icon size={16} className={`${opt.color} ${activeFilter === opt.id ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`} />
                  <span className={`text-[11px] font-black uppercase tracking-tight ${
                    activeFilter === opt.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
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
