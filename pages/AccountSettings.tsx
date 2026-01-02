
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, Mail, Save, Loader2, CheckCircle2, 
  Lock, ShieldCheck, AlertCircle, ArrowRight, 
  Shield, BadgeCheck, Fingerprint, Info
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
            const currentUser = await DatabaseService.getUserById(user.id.toString());
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
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-500/50" size={28} />
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col text-slate-200 animate-in fade-in pb-20">
      {/* Custom Minimal Header */}
      <nav className="h-20 px-6 flex items-center justify-between border-b border-white/5 bg-[#020617]/50 backdrop-blur-xl sticky top-0 z-50">
        <button onClick={() => navigate('/settings')} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
          <ChevronLeft size={24} />
        </button>
        <span className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase italic">Güvenlik Paneli</span>
        <div className="w-10"></div>
      </nav>

      <div className="px-8 mt-10 max-w-lg mx-auto w-full">
          {/* Status Header */}
          <div className="mb-12 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-white/5 rounded-2xl mb-6 shadow-xl">
                  {isVerified ? (
                      <><BadgeCheck size={14} className="text-emerald-500" /><span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">DOĞRULANMIŞ HESAP</span></>
                  ) : (
                      <><Fingerprint size={14} className="text-blue-500" /><span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">DOĞRULAMA BEKLİYOR</span></>
                  )}
              </div>
              <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Hesap <span className="text-blue-600">Kimliği</span></h1>
              <p className="text-xs text-slate-500 leading-relaxed font-bold uppercase italic opacity-60 px-4">
                  Ödemeleriniz ve bot yönetiminiz için kimlik doğrulaması zorunludur.
              </p>
          </div>

          {/* Form Card */}
          <div className="space-y-10">
              <div className="space-y-4">
                  <div className="flex justify-between items-center px-4">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">E-POSTA ADRESİ</label>
                  </div>
                  <div className="relative group">
                      <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isVerified ? 'text-emerald-500' : 'text-slate-600 group-focus-within:text-blue-500'}`}>
                        {isVerified ? <ShieldCheck size={18} /> : <Mail size={18} />}
                      </div>
                      <input 
                        type="email" 
                        value={formData.email} 
                        readOnly={isVerified}
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                        className={`w-full h-18 pl-14 pr-6 text-xs font-black rounded-[28px] border transition-all uppercase italic tracking-widest ${
                            isVerified 
                            ? 'bg-slate-950 border-emerald-500/20 text-emerald-500/60' 
                            : 'bg-slate-900/40 border-white/5 text-white focus:border-blue-500/50 outline-none shadow-2xl'
                        }`} 
                        placeholder="EMAIL@DOMAIN.COM" 
                      />
                  </div>
              </div>

              {errorMsg && (
                  <div className="p-5 bg-red-500/5 border border-red-500/10 rounded-3xl flex items-center gap-4 animate-in shake">
                      <AlertCircle className="text-red-500 shrink-0" size={18} />
                      <p className="text-red-400 text-[10px] font-black uppercase tracking-tight italic">{errorMsg}</p>
                  </div>
              )}

              <div className="pt-4">
                  {isVerified ? (
                      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[40px] p-8 text-center animate-in zoom-in-95">
                          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-[24px] flex items-center justify-center mx-auto mb-6">
                              <ShieldCheck className="text-emerald-500" size={32} />
                          </div>
                          <h4 className="text-white font-black text-sm mb-2 uppercase italic tracking-tight">KİMLİK ONAYLANDI</h4>
                          <p className="text-[10px] text-slate-600 font-bold uppercase italic mb-8">Tüm platform özellikleri aktif edildi.</p>
                          <button 
                            onClick={() => navigate('/settings')}
                            className="w-full h-16 bg-slate-900 hover:bg-slate-850 text-white font-black rounded-3xl text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 active:scale-95 border border-white/5"
                          >
                            PROFİLE DÖN <ArrowRight size={14}/>
                          </button>
                      </div>
                  ) : (
                      <button 
                        onClick={handleSave} 
                        disabled={isSaving} 
                        className="w-full h-20 bg-blue-600 hover:bg-blue-500 rounded-[32px] font-black text-white flex flex-col items-center justify-center gap-1 shadow-2xl shadow-blue-600/20 active:scale-[0.96] transition-all disabled:opacity-50 border-b-4 border-blue-800"
                      >
                        {isSaving ? <Loader2 className="animate-spin" size={24} /> : (
                            <>
                                <span className="text-[11px] uppercase tracking-[0.3em] italic">VERİLERİ KİLİTLE</span>
                                <span className="text-[8px] opacity-60 uppercase tracking-widest font-black">GÜVENLİ ONAY</span>
                            </>
                        )}
                      </button>
                  )}
              </div>
          </div>
      </div>

      <div className="mt-auto pt-20 flex flex-col items-center gap-4 opacity-30">
          <div className="h-px w-12 bg-slate-800"></div>
          <div className="flex items-center gap-3">
              <Shield size={14} className="text-slate-500" />
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] italic">BOTLYHUB SECURITY ARCHITECTURE</p>
          </div>
      </div>
    </div>
  );
};

export default AccountSettings;
