
import React, { useState, useEffect } from 'react';
import { 
  Mail, Save, Loader2, CheckCircle2, 
  Lock, ShieldCheck, AlertCircle, ArrowRight, 
  Shield, BadgeCheck, Fingerprint, Info, Check, ChevronLeft
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-300">
            <Loader2 className="animate-spin text-brand dark:text-brand-light" size={28} />
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-200 animate-in fade-in pb-20 transition-colors duration-300">
      {/* Header */}
      <div className="p-4 flex items-center justify-between sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl z-50 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 rounded-2xl text-slate-500 dark:text-slate-400 active:scale-90 transition-transform ">
                <ChevronLeft size={20} />
            </button>
            <h1 className="text-[14px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Hesap Ayarları</h1>
        </div>
        <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-brand/10 border border-brand/20 rounded-xl">
                 <Shield className="text-brand dark:text-brand-light" size={12} />
            </div>
        </div>
      </div>

      <div className="px-6 mt-10 max-w-lg mx-auto w-full">
          {/* Status Badge */}
          <div className="text-center mb-10">
              <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-[24px] mb-8 border animate-in slide-in-from-top-4 transition-all shadow-sm ${
                  isVerified ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-brand/5 border-brand/20'
              }`}>
                  {isVerified ? (
                      <><BadgeCheck size={18} className="text-emerald-500" /><span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">HESAP DOĞRULANDI</span></>
                  ) : (
                      <><Fingerprint size={18} className="text-brand dark:text-brand-light" /><span className="text-[10px] font-black text-brand dark:text-brand-light uppercase tracking-[0.2em]">ONAY BEKLİYOR</span></>
                  )}
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none mb-3">Hesap <span className="text-brand dark:text-brand-light">Kimliği</span></h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em] px-10">
                  Botlarınızın kontrolü ve finansal işlemleriniz için kimliğinizi doğrulayın.
              </p>
          </div>

          {/* Minimalist Input Group */}
          <div className="space-y-10">
              <div className="space-y-4">
                  <div className="flex justify-between items-center px-4">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">E-POSTA ADRESİ</label>
                    {isVerified && <CheckCircle2 size={16} className="text-emerald-500" />}
                  </div>
                  <div className="relative group">
                      <div className={`absolute left-6 top-1/2 -translate-y-1/2 transition-all duration-500 z-10 ${isVerified ? 'text-emerald-500 scale-110' : 'text-slate-400 group-focus-within:text-brand dark:group-focus-within:text-brand-light'}`}>
                        {isVerified ? <ShieldCheck size={24} /> : <Mail size={24} />}
                      </div>
                      <input 
                        type="email" 
                        value={formData.email} 
                        readOnly={isVerified}
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                        className={`w-full h-20 pl-16 pr-6 text-sm font-black rounded-[32px] border transition-all uppercase tracking-[0.2em] shadow-sm  ${
                            isVerified 
                            ? 'bg-slate-100 dark:bg-slate-950/50 border-emerald-500/20 text-emerald-500/70 cursor-default' 
                            : 'bg-white dark:bg-slate-900/30 border-black/5 dark:border-white/10 text-slate-900 dark:text-white focus:border-brand/40 focus:ring-4 focus:ring-brand/5 outline-none'
                        }`} 
                        placeholder="EMAIL@DOMAIN.COM" 
                      />
                  </div>
              </div>

              {errorMsg && (
                  <div className="p-6 bg-red-400/5 border border-red-400/10 rounded-[32px] flex items-center gap-4 animate-in shake ">
                      <AlertCircle className="text-red-500 shrink-0" size={24} />
                      <p className="text-red-500 text-[11px] font-black uppercase tracking-tight italic">{errorMsg}</p>
                  </div>
              )}

              <div className="pt-6">
                  {isVerified ? (
                      <div className="bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 rounded-[44px] p-10 text-center animate-in zoom-in-95 backdrop-blur-xl fancy-glass-card">
                          <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-sm">
                              <ShieldCheck className="text-emerald-500" size={44} />
                          </div>
                          <h4 className="text-slate-900 dark:text-white font-black text-xl mb-2 uppercase tracking-tighter italic">KİMLİK ONAYLANDI</h4>
                          <p className="text-[10px] text-slate-400 dark:text-slate-600 font-black uppercase tracking-widest leading-relaxed mb-8">Pro hesabınız ile tüm yönetim araçlarına <br/>erişiminiz sağlandı.</p>
                          <button 
                            onClick={() => navigate('/settings')}
                            className="w-full h-18 bg-slate-900 dark:bg-slate-950 hover:opacity-90 text-white font-black rounded-[28px] sm:rounded-[22px] text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 active:scale-95 border border-black/5 dark:border-white/10  "
                          >
                            AYARLARA DÖN <ArrowRight size={18}/>
                          </button>
                      </div>
                  ) : (
                      <button 
                        onClick={handleSave} 
                        disabled={isSaving} 
                        className="w-full h-24 bg-brand dark:bg-brand-light hover:shadow-lg hover:shadow-brand/20 rounded-[36px] font-black text-white flex flex-col items-center justify-center gap-1 active:scale-[0.97] transition-all disabled:opacity-50 border-b-8 border-brand-dark dark:border-brand-light/20 relative group overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        {isSaving ? <Loader2 className="animate-spin relative z-10" size={28} /> : (
                            <div className="relative z-10 flex flex-col items-center">
                                <span className="text-[13px] uppercase tracking-[0.3em] italic">VERİLERİ DOĞRULA</span>
                                <span className="text-[9px] opacity-60 uppercase tracking-[0.2em] font-black mt-1">GÜVENLİ ONAY SİSTEMİ</span>
                            </div>
                        )}
                      </button>
                  )}
              </div>
          </div>
      </div>

      <div className="mt-auto pt-24 pb-12 flex flex-col items-center gap-5 opacity-30">
          <div className="h-[2px] w-16 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
          <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                  <Shield size={16} className="text-slate-400 dark:text-slate-500" />
                  <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.5em] italic">BOTLYHUB V3 SECURITY</p>
              </div>
              <p className="text-[7px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em]">End-to-End Encryption Enabled</p>
          </div>
      </div>
    </div>
  );
};

export default AccountSettings;
