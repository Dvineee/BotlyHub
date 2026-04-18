
import React, { useEffect, useRef } from 'react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface TelegramLoginWidgetProps {
  botUsername: string;
  onAuth: (user: TelegramUser) => void;
  size?: 'small' | 'medium' | 'large';
  cornerRadius?: number;
  requestAccess?: string;
}

export const TelegramLoginWidget: React.FC<TelegramLoginWidgetProps> = ({
  botUsername,
  onAuth,
  size = 'medium',
  cornerRadius,
  requestAccess = 'write',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Define the global callback
    (window as any).onTelegramAuth = (user: TelegramUser) => {
      onAuth(user);
    };

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?23';
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', size);
    if (cornerRadius !== undefined) {
      script.setAttribute('data-radius', cornerRadius.toString());
    }
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', requestAccess);
    script.async = true;

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      delete (window as any).onTelegramAuth;
    };
  }, [botUsername, onAuth, size, cornerRadius, requestAccess]);

  return <div ref={containerRef} />;
};
