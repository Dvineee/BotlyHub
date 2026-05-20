
import React from 'react';
import { Send, ChevronRight, Share2 } from 'lucide-react';
import Logo from './Logo';
import { useTelegram } from '../hooks/useTelegram';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../TranslationContext';

const Footer: React.FC = () => {
    const navigate = useNavigate();
    const { haptic } = useTelegram();
    const { t } = useTranslation();

  return (
    <footer className="mt-12 px-4 pb-32 max-w-7xl mx-auto w-full border-t border-black/5 dark:border-white/5 pt-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-2">
            <div className="flex items-center mb-4">
                <Logo />
            </div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed max-w-xs">
                {t('footer_description')}
            </p>
        </div>

        <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] font-mono">{t('footer_links')}</h4>
            <div className="flex flex-col gap-3">
                <button onClick={() => navigate('/')} className="text-[11px] font-bold text-slate-400 hover:text-blue-500 text-left uppercase tracking-widest transition-colors">{t('footer_home')}</button>
                <button onClick={() => navigate('/blog')} className="text-[11px] font-bold text-slate-400 hover:text-blue-500 text-left uppercase tracking-widest transition-colors">{t('footer_blog')}</button>
                <button onClick={() => navigate('/stats')} className="text-[11px] font-bold text-slate-400 hover:text-blue-500 text-left uppercase tracking-widest transition-colors">{t('footer_stats')}</button>
                <button onClick={() => navigate('/qa')} className="text-[11px] font-bold text-slate-400 hover:text-blue-500 text-left uppercase tracking-widest transition-colors">{t('footer_qa')}</button>
                <button onClick={() => navigate('/premium')} className="text-[11px] font-bold text-slate-400 hover:text-blue-500 text-left uppercase tracking-widest transition-colors">{t('footer_premium')}</button>
                <button onClick={() => navigate('/search?mode=apps')} className="text-[11px] font-bold text-slate-400 hover:text-blue-500 text-left uppercase tracking-widest transition-colors">{t('footer_apps')}</button>
            </div>
        </div>

        <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] font-mono">{t('footer_categories')}</h4>
            <div className="flex flex-col gap-3">
                <button onClick={() => navigate('/search?category=bots')} className="text-[11px] font-bold text-slate-400 hover:text-blue-500 text-left uppercase tracking-widest transition-colors">{t('footer_tg_bots')}</button>
                <button onClick={() => navigate('/search?category=apps')} className="text-[11px] font-bold text-slate-400 hover:text-blue-500 text-left uppercase tracking-widest transition-colors">{t('footer_mini_apps')}</button>
                <button onClick={() => navigate('/search?category=channels')} className="text-[11px] font-bold text-slate-400 hover:text-blue-500 text-left uppercase tracking-widest transition-colors">{t('footer_channels')}</button>
                <button onClick={() => navigate('/search?category=groups')} className="text-[11px] font-bold text-slate-400 hover:text-blue-500 text-left uppercase tracking-widest transition-colors">{t('footer_groups')}</button>
            </div>
        </div>

        <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] font-mono">{t('footer_contact')}</h4>
            <div className="flex flex-col gap-3">
                <a href="https://t.me/botlyhub" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-blue-500 uppercase tracking-widest transition-colors"><Send size={14} /> {t('footer_tg_announcement')}</a>
                <a href="#" className="flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-blue-500 uppercase tracking-widest transition-colors"><Share2 size={14} /> {t('footer_twitter')}</a>
            </div>
        </div>
      </div>

      <div className="pt-8 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 opacity-40">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('footer_all_rights')}</p>
        <div className="flex items-center gap-6">
            <button className="text-[9px] font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-widest transition-all">{t('footer_privacy')}</button>
            <button className="text-[9px] font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-widest transition-all">{t('footer_terms')}</button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
