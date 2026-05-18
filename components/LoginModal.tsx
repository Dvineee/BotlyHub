
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, Edit3, Download, ExternalLink, ShieldCheck, Loader2, Info, AlertCircle, Send, LogIn } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuth: (user: any) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onAuth }) => {
  const [identifier, setIdentifier] = useState('');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

  const getApiUrl = (path: string) => {
    const isRunApp = window.location.origin.includes('.run.app');
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    const baseUrl = import.meta.env.VITE_API_URL || ((isRunApp || isLocal) 
      ? '' 
      : 'https://ais-pre-ubzg6ohqwxfncnjxhzi3nj-16842427189.europe-west2.run.app');
      
    if (!baseUrl) return path;
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
  };

  const handleRequestCode = async () => {
    if (!identifier) return;
    setIsLoading(true);
    setError('');
    try {
        const res = await fetch(getApiUrl('/api/auth/telegram/request-code'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: identifier.trim() })
        });
        
        // Handle non-JSON responses (like Vercel 404s)
        const contentType = res.headers.get('content-type');
        const url = getApiUrl('/api/auth/telegram/request-code');
        
        if (!res.ok && res.status === 404) {
            throw new Error(`API endpoint bulunamadı (404). URL: ${url}. Eğer Vercel kullanıyorsanız backend sunucusunun yapılandırıldığından emin olun.`);
        }

        if (!contentType || !contentType.includes('application/json')) {
            const text = await res.text();
            console.error("Non-JSON response received:", text.slice(0, 200));
            throw new Error(`Sunucu doğru formatta yanıt vermedi (Kod: ${res.status}). Beklenen JSON, ancak farklı bir yanıt alındı. URL: ${url}`);
        }

        const data = await res.json();
        
        if (res.ok) {
            setStep('verify');
        } else {
            setError(data.error || 'Kod gönderilemedi');
            // If the error suggests the bot isn't started
            if (data.detail?.includes('chat not found')) {
              setError("Bot ile bağlantı kurulamadı. Lütfen @BotlyHubBOT'u başlatın.");
            }
        }
    } catch (err: any) {
        console.error("Auth Request Error:", err);
        if (err.message?.includes('formatta')) {
            setError(err.message);
        } else {
            setError('Sunucu bağlantısı başarısız. API sunucusuna ulaşılamıyor. Lütfen internet bağlantınızı veya API URL ayarınızı kontrol edin.');
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length < 6) return;
    setIsLoading(true);
    setError('');
    try {
        const res = await fetch(getApiUrl('/api/auth/telegram/verify-code'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, code })
        });

        const contentType = res.headers.get('content-type');
        const url = getApiUrl('/api/auth/telegram/verify-code');
        
        if (!res.ok && res.status === 404) {
            throw new Error(`API endpoint bulunamadı (404). URL: ${url}`);
        }

        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Sunucu doğru formatta yanıt vermedi (Kod: ${res.status}). URL: ${url}`);
        }

        const data = await res.json();
        if (res.ok) {
            onAuth(data.user);
            onClose();
            // Reset for next time
            setStep('request');
            setIdentifier('');
            setCode('');
        } else {
            setError(data.error || 'Geçersiz kod');
        }
    } catch (err: any) {
        setError(err.message || 'Doğrulama başarısız');
    } finally {
        setIsLoading(false);
    }
  };

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
            className="bg-white dark:bg-[#14181f] w-full max-w-lg rounded-3xl overflow-hidden relative shadow-2xl border border-black/5 dark:border-white/5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 sm:p-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                   <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Giriş Yap</h2>
                   <p className="text-xs text-slate-500 font-medium mt-1">Telegram ile güvenli ve hızlı erişim</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    {benefits.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center shrink-0`}>
                            <item.icon size={16} />
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 font-bold text-[11px] tracking-tight uppercase">
                        {item.text}
                        </p>
                    </div>
                    ))}
                    
                    <div className="pt-4 border-t border-black/5 dark:border-white/5">
                        <p className="text-[10px] text-slate-500 dark:text-slate-500 font-medium leading-relaxed">
                            Telegram yok mu? Uygulamayı resmi <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center gap-0.5">web sitesinden <ExternalLink size={10} /></a> edinin.
                        </p>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-black/20 p-6 rounded-2xl border border-black/5 dark:border-white/5">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] p-2.5 rounded-xl mb-4 flex items-center gap-2 font-bold uppercase">
                            <AlertCircle size={14} />
                            {error}
                        </div>
                    )}

                    {step === 'request' ? (
                        <div className="space-y-4">
                            <div className="bg-blue-600/5 border border-blue-500/10 rounded-xl p-3 mb-2">
                                <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-tighter flex items-center gap-1.5 mb-1">
                                    <Info size={12} /> Bilgilendirme
                                </h4>
                                <p className="text-[9px] text-slate-500 font-medium leading-tight">
                                    Kod alabilmek için <a href="https://t.me/BotlyHubBOT" target="_blank" rel="noreferrer" className="text-blue-500 font-bold hover:underline">@BotlyHubBOT</a> botuna start vermelisiniz.
                                </p>
                            </div>

                        <div>
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 px-1">Kullanıcı Adı</label>
                            <input 
                                type="text"
                                placeholder="@username veya kullanıcı adı..."
                                className="w-full h-11 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-xl px-4 text-slate-900 dark:text-white text-sm focus:border-blue-500/50 transition-all outline-none"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleRequestCode()}
                            />
                            <p className="text-[9px] text-slate-400 mt-2 px-1 font-bold uppercase">Örn: @BotlyHub veya @kullaniciadi</p>
                        </div>

                            <button 
                                disabled={isLoading || !identifier}
                                onClick={handleRequestCode}
                                className="w-full h-11 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={16} /> : (
                                    <>
                                        <Send size={16} />
                                        <span className="hidden sm:inline">Kod Gönder</span>
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 px-1">Doğrulama Kodu</label>
                                <input 
                                    type="text"
                                    maxLength={6}
                                    placeholder="000000"
                                    className="w-full h-12 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-xl px-4 text-slate-900 dark:text-white text-xl font-black text-center tracking-[8px] focus:border-blue-500/50 transition-all outline-none"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleVerifyCode()}
                                    autoFocus
                                />
                            </div>
                            <button 
                                disabled={isLoading || code.length < 6}
                                onClick={handleVerifyCode}
                                className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={16} /> : (
                                    <>
                                        <LogIn size={16} />
                                        <span className="hidden sm:inline">Giriş Yap</span>
                                    </>
                                )}
                            </button>
                            <button 
                                onClick={() => setStep('request')}
                                className="w-full text-[9px] text-slate-500 font-bold uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors py-1"
                            >
                                Geri Dön
                            </button>
                        </div>
                    )}
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
