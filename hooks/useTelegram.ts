
import { useEffect, useState, useMemo, useCallback } from 'react';
// Fixed: Explicitly import types to ensure global window augmentation is recognized
import '../types';

// Fixed: Property 'Telegram' now exists on 'Window' thanks to augmentation in types.ts
const tg = window.Telegram?.WebApp;

export function useTelegram() {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (tg) {
            tg.ready();
            setIsReady(true);
        }
    }, []);

    const user = useMemo(() => tg?.initDataUnsafe?.user, []);
    const [webUser, setWebUser] = useState<any>(() => {
        try {
            const saved = localStorage.getItem('web_user');
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });

    const setWebAuthUser = useCallback((u: any) => {
        setWebUser(u);
        if (u) localStorage.setItem('web_user', JSON.stringify(u));
        else localStorage.removeItem('web_user');
    }, []);

    const isTelegram = useMemo(() => !!window.Telegram?.WebApp?.initData, []);
    const queryId = useMemo(() => tg?.initDataUnsafe?.query_id, []);
    const platform = useMemo(() => tg?.platform, []);
    const isExpanded = useMemo(() => tg?.isExpanded, []);
    const themeParams = useMemo(() => tg?.themeParams, []);

    const onClose = useCallback(() => {
        tg?.close();
    }, []);

    const onToggleButton = useCallback(() => {
        if (tg?.MainButton.isVisible) {
            tg.MainButton.hide();
        } else {
            tg?.MainButton.show();
        }
    }, []);

    // Titreşim (Haptic Feedback) tetikleyici
    const haptic = useCallback((style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
        if (tg?.HapticFeedback) {
            tg.HapticFeedback.impactOccurred(style);
        }
    }, []);

    // Başarılı/Hata titreşimi
    const notification = useCallback((type: 'error' | 'success' | 'warning') => {
        if (tg?.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred(type);
        }
    }, []);

    // Link açma (Native)
    const openLink = useCallback((url: string) => {
        if (url.startsWith('https://t.me') || url.startsWith('tg://')) {
            tg?.openTelegramLink(url);
        } else {
            tg?.openLink(url);
        }
    }, []);

    return useMemo(() => ({
        tg,
        user: user || webUser,
        webUser,
        setWebAuthUser,
        isTelegram,
        queryId,
        platform,
        isExpanded,
        themeParams,
        onClose,
        onToggleButton,
        haptic,
        notification,
        openLink,
        isReady
    }), [isReady, user, queryId, platform, isExpanded, themeParams, onClose, onToggleButton, haptic, notification, openLink]);
}
