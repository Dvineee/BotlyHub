
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, Mail, Save, Loader2, CheckCircle2, 
  Lock, ShieldCheck, AlertCircle, ArrowRight, 
  Shield, BadgeCheck, Fingerprint, Info, Check
} from 'lucide-react';
import * as Router from 'react-router-dom';
import { useTelegram } from '../hooks/useTelegram';
import { DatabaseService } from '../services/DatabaseService';
import { User } from '../types';

const { useNavigate } = Router as any;

const AccountSettings = () => {
  const navigate = useNavigate();
  const { user, haptic, notification } = useTelegram();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [formData, setFormData] = useState({ email: '' });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
        if (!user?.id) {
            setIsLoading(false);
            return;
        }
        
        try {
            const currentUser = await DatabaseService.getUser(user.id.toString());
            if (currentUser) {
                const verified = !!currentUser.email;
                setIsVerified(verified);
                setFormData({
                    email: currentUser.email || ''
                });
            }
        } catch (e) {
            console.error("Account data load error:", e);
        } finally {
            setIsLoading(false);
        }
    };
    loadUserData();
  }, [user]);

  const handleSave = async () => {
    if (isVerified || isSaving) return;
    setErrorMsg(null);
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        haptic('rigid');
        setErrorMsg('Lütfen geçerli bir e-posta adresi girin.');
        return;
    }

    setIsSaving(true);
    haptic('medium');

    try {
        const payload: Partial<User> = {
            id: user.id.toString(),
            email: formData.email.trim().toLowerCase()
        };

        await DatabaseService.syncUser(payload);
        
        await DatabaseService.logActivity(user.id.toString(), 'auth', 'email_verified', 'E-posta Doğrulama', `E-posta adresi (${formData.email}) başarıyla doğrulandı.`);
        
        notification('success');
        setIsVerified(true);
        haptic('heavy');
    } catch (e: any) {
        notification('error');
        setErrorMsg('Sunucu hatası. Lütfen tekrar deneyin.');
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center transition-colors duration-300">
            <Loader2 className="animate-spin text-brand dark:text-brand-light" size={28} />
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col text-slate-900 dark:text-slate-200 animate-in fade-in pb-20 transition-colors duration-300">
      {/* Premium Header */}
      <nav className="h-24 px-6 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-white/50 dark:bg-[#020617]/50 backdrop-blur-xl sticky top-0 z-50">
        <button onClick={() => navigate('/settings')} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-900/80 border border-black/5 dark:border-white/5 rounded-full text-slate-500 dark:text-slate-400 active:scale-90 transition-transform shadow-lg">
          <ChevronLeft size={22} />
        </button>
        <span className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-white/40 uppercase">GÜVENLİK MERKEZİ</span>
        <div className="w-12"></div>
      </nav>

      <div className="px-8 mt-12 max-w-lg mx-auto w-full">
          {/* Status Badge */}
          <div className="mb-12 text-center">
              <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-[20px] mb-8 shadow-xl border animate-in slide-in-from-top-4 transition-all ${
                  isVerified ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-brand/5 border-brand/10'
              }`}>
                  {isVerified ? (
                      <><BadgeCheck size={18} className="text-emerald-600 dark:text-emerald-500" /><span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">HESAP DOĞRULANDI</span></>
                  ) : (
                      <><Fingerprint size={18} className="text-brand dark:text-brand-light" /><span className="text-[11px] font-bold text-brand dark:text-brand-light uppercase tracking-widest">DOĞRULAMA BEKLİYOR</span></>
                  )}
              </div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">Hesap <span className="text-brand dark:text-brand-light">Kimliği</span></h1>
              <p className="text-xs text-slate-500 leading-relaxed font-medium uppercase px-6">
                  Ödemelerinizi almak ve botlarınızı yönetmek için kimlik doğrulaması gereklidir.
              </p>
          </div>

          {/* Minimalist Input Group */}
          <div className="space-y-10">
              <div className="space-y-4">
                  <div className="flex justify-between items-center px-4">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">E-POSTA ADRESİ</label>
                    {isVerified && <Check size={16} className="text-emerald-600 dark:text-emerald-500" />}
                  </div>
                  <div className="relative group">
                      <div className={`absolute left-6 top-1/2 -translate-y-1/2 transition-all duration-300 ${isVerified ? 'text-emerald-600 dark:text-emerald-500 scale-110' : 'text-slate-400 dark:text-slate-500 group-focus-within:text-brand dark:group-focus-within:text-brand-light'}`}>
                        {isVerified ? <ShieldCheck size={22} /> : <Mail size={22} />}
                      </div>
                      <input 
                        type="email" 
                        value={formData.email} 
                        readOnly={isVerified}
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                        className={`w-full h-18 pl-16 pr-6 text-sm font-bold rounded-[28px] border transition-all uppercase tracking-widest shadow-xl ${
                            isVerified 
                            ? 'bg-slate-100 dark:bg-slate-950/50 border-emerald-500/20 text-emerald-600/70 dark:text-emerald-500/70 cursor-default' 
                            : 'bg-white dark:bg-slate-900/30 border-black/5 dark:border-white/10 text-slate-900 dark:text-white focus:border-brand/40 focus:bg-white dark:focus:bg-slate-900/50 outline-none'
                        }`} 
                        placeholder="EMAIL@EXAMPLE.COM" 
                      />
                  </div>
              </div>

              {errorMsg && (
                  <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-[32px] flex items-center gap-4 animate-in shake shadow-lg">
                      <AlertCircle className="text-red-600 dark:text-red-500 shrink-0" size={22} />
                      <p className="text-red-600 dark:text-red-400 text-[11px] font-bold uppercase tracking-tight">{errorMsg}</p>
                  </div>
              )}

              <div className="pt-6">
                  {isVerified ? (
                      <div className="bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 rounded-[44px] p-10 text-center animate-in zoom-in-95 shadow-xl">
                          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-inner">
                              <ShieldCheck className="text-emerald-600 dark:text-emerald-500" size={36} />
                          </div>
                          <h4 className="text-slate-900 dark:text-white font-bold text-lg mb-2 uppercase tracking-tight">KİMLİK ONAYLANDI</h4>
                          <p className="text-[11px] text-slate-500 font-bold uppercase mb-8">Tüm platform özellikleri aktif edildi.</p>
                          <button 
                            onClick={() => navigate('/settings')}
                            className="w-full h-16 bg-slate-900 dark:bg-slate-950 hover:bg-slate-800 dark:hover:bg-slate-900 text-white font-bold rounded-[24px] text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 border border-black/5 dark:border-white/5 shadow-lg"
                          >
                            AYARLARA DÖN <ArrowRight size={16}/>
                          </button>
                      </div>
                  ) : (
                      <button 
                        onClick={handleSave} 
                        disabled={isSaving} 
                        className="w-full h-20 bg-brand dark:bg-brand-light hover:opacity-90 rounded-[32px] font-bold text-white flex flex-col items-center justify-center gap-1 shadow-2xl shadow-blue-900/30 active:scale-[0.97] transition-all disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 className="animate-spin" size={24} /> : (
                            <>
                                <span className="text-[12px] uppercase tracking-widest">VERİLERİ DOĞRULA</span>
                                <span className="text-[9px] opacity-60 uppercase tracking-widest font-bold">GÜVENLİ ONAY</span>
                            </>
                        )}
                      </button>
                  )}
              </div>
          </div>
      </div>

      <div className="mt-auto pt-20 flex flex-col items-center gap-4 opacity-20">
          <div className="h-[1px] w-12 bg-slate-300 dark:bg-slate-800"></div>
          <div className="flex items-center gap-3">
              <Shield size={14} className="text-slate-400 dark:text-slate-500" />
              <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] italic">BOTLYHUB V3 SECURITY INFRASTRUCTURE</p>
          </div>
      </div>
    </div>
  );
};

export default AccountSettings;
