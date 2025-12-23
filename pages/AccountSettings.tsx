
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Mail, Save, Loader2, CheckCircle2, Lock, ShieldCheck, AlertCircle, ArrowRight, Shield, BadgeCheck } from 'lucide-react';
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
            console.error("Veri yükleme hatası:", e);
        } finally {
            setIsLoading(false);
        }
    };
    loadUserData();
  }, [user]);

  const handleSave = async () => {
    if (isVerified) return;
    setErrorMsg(null);
    
    if (!user) {
        alert("Oturum verisi eksik.");
        return;
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        alert('Lütfen geçerli bir e-posta adresi girin.');
        return;
    }

    setIsSaving(true);
    haptic('medium');

    try {
        const payload: Partial<User> = {
            id: user.id.toString(),
            email: formData.email
        };

        await DatabaseService.syncUser(payload);
        
        notification('success');
        setIsVerified(true);
        haptic('heavy');
    } catch (e: any) {
        notification('error');
        setErrorMsg(e.message || 'Bir hata oluştu.');
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
    <div className="min-h-screen bg-[#020617] flex flex-col animate-in fade-in">
      <div className="p-6 pt-12 flex items-center justify-between">
        <button onClick={() => navigate('/settings')} className="p-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-500 hover:text-white transition-all">
          <ChevronLeft size={20} />
        </button>
        <div className="flex flex-col items-center">
            <h1 className="text-xs font-black text-white uppercase tracking-[0.2em]">Güvenlik & Kimlik</h1>
            <div className="h-0.5 w-4 bg-blue-600 mt-1 rounded-full"></div>
        </div>
        <div className="flex items-center gap-2">
            {isVerified ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <BadgeCheck size={14} className="text-emerald-500" />
                    <span className="text-[9px] font-black text-emerald-500 uppercase">Verified</span>
                </div>
            ) : (
                <div className="w-10"></div>
            )}
        </div>
      </div>

      <div className="px-6 flex-1 max-w-lg mx-auto w-full mt-4">
          <div className="mb-10">
              <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Hesap Doğrulama</h2>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Kazanç yönetimi ve güvenli işlemler için e-posta adresinizi bir kereliğine doğrulamalısınız.
              </p>
          </div>

          <div className="space-y-8">
              <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">E-Posta Adresi</label>
                    {isVerified && <span className="text-[9px] font-bold text-slate-600 italic">Değiştirilemez</span>}
                  </div>
                  <div className="relative group">
                      <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isVerified ? 'text-slate-700' : 'text-slate-600 group-focus-within:text-blue-500'}`}>
                        {isVerified ? <Lock size={16} /> : <Mail size={18} />}
                      </div>
                      <input 
                        type="email" 
                        value={formData.email} 
                        disabled={isVerified}
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                        className={`w-full py-4 pl-12 pr-6 text-sm font-semibold rounded-2xl border transition-all ${
                            isVerified 
                            ? 'bg-slate-900/20 border-slate-900/50 text-slate-500 cursor-not-allowed' 
                            : 'bg-slate-900/40 border-slate-800 text-white focus:border-blue-500/50 outline-none'
                        }`} 
                        placeholder="ornek@email.com" 
                      />
                  </div>
                  {!isVerified && (
                      <p className="text-[9px] text-slate-600 font-medium px-1">
                        * İletişim bilgileriniz güvenlik protokolü ile kilitlenecektir.
                      </p>
                  )}
              </div>

              {errorMsg && (
                  <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center gap-3 animate-in shake">
                      <AlertCircle className="text-red-500" size={16} />
                      <p className="text-red-400 text-[10px] font-bold uppercase">{errorMsg}</p>
                  </div>
              )}

              <div className="pt-8">
                  {isVerified ? (
                      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 text-center">
                          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                              <ShieldCheck className="text-emerald-500" size={24} />
                          </div>
                          <h4 className="text-white font-bold text-sm mb-1">Hesap Doğrulandı</h4>
                          <p className="text-[10px] text-slate-600 font-medium mb-6">Profil bilgileriniz başarıyla güncellendi.</p>
                          <button 
                            onClick={() => navigate('/settings')}
                            className="w-full py-4 bg-slate-800 hover:bg-slate-750 text-white font-bold rounded-2xl text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95"
                          >
                            Ayarlara Dön <ArrowRight size={14}/>
                          </button>
                      </div>
                  ) : (
                      <button 
                        onClick={handleSave} 
                        disabled={isSaving} 
                        className="w-full bg-blue-600 hover:bg-blue-500 py-4.5 rounded-2xl font-black text-white flex items-center justify-center gap-3 shadow-xl shadow-blue-600/10 active:scale-[0.98] transition-all disabled:opacity-50 text-[11px] uppercase tracking-widest"
                      >
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <><Shield size={16}/><span>Bilgileri Onayla</span></>}
                      </button>
                  )}
              </div>
          </div>
      </div>

      <div className="p-10 flex flex-col items-center opacity-20 mt-auto">
          <div className="h-px w-8 bg-slate-700 mb-4"></div>
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] italic">SECURE DATA PROTOCOL V3.2</p>
      </div>
    </div>
  );
};

export default AccountSettings;
