
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Mail, Phone, Save, Loader2, ShieldCheck, AlertCircle, CheckCircle2, Lock, Shield, ArrowRight, Fingerprint, Globe, Check } from 'lucide-react';
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
  const [formData, setFormData] = useState({ email: '', phone: '' });
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
                const verified = !!(currentUser.email || (currentUser.phone && currentUser.phone !== '+90 '));
                setIsVerified(verified);
                setFormData({
                    email: currentUser.email || '',
                    phone: currentUser.phone || '+90 '
                });
            }
        } catch (e) {
            console.error("Profil yükleme hatası:", e);
        } finally {
            setIsLoading(false);
        }
    };
    loadUserData();
  }, [user]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isVerified) return;
    let val = e.target.value;
    if (!val.startsWith('+90 ')) {
        val = '+90 ' + val.replace(/^\+90\s*/, '');
    }
    const suffix = val.slice(4).replace(/[^\d]/g, '').slice(0, 10);
    setFormData({ ...formData, phone: '+90 ' + suffix });
  };

  const handleSave = async () => {
    if (isVerified) return;
    setErrorMsg(null);
    
    if (!user) {
        alert("Telegram verisi alınamadı.");
        return;
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        alert('Lütfen geçerli bir e-posta adresi girin.');
        return;
    }

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length > 2 && phoneDigits.length < 12) {
        alert('Lütfen telefon numaranızı eksiksiz girin veya boş bırakın.');
        return;
    }

    setIsSaving(true);
    haptic('medium');

    try {
        const payload: Partial<User> = {
            id: user.id.toString(),
            email: formData.email,
            phone: phoneDigits.length <= 2 ? null : formData.phone
        };

        await DatabaseService.syncUser(payload);
        
        notification('success');
        setIsVerified(true);
        haptic('heavy');
    } catch (e: any) {
        notification('error');
        setErrorMsg(e.message || 'Kayıt sırasında bir hata oluştu.');
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading) {
      return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#020617] pb-24 animate-in fade-in overflow-x-hidden no-scrollbar">
      {/* SaaS Header */}
      <div className="p-6 pt-10 flex items-center justify-between sticky top-0 z-30 bg-[#020617]/80 backdrop-blur-xl">
        <button onClick={() => navigate('/settings')} className="p-3 bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 active:scale-90 transition-transform">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-0.5">Güvenlik Merkezi</p>
            <h1 className="text-sm font-black text-white uppercase tracking-widest italic">Kimlik Doğrulama</h1>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="px-6">
          {/* Account Health Card */}
          <div className="relative mb-10 mt-4 group">
              <div className="absolute inset-0 bg-blue-600/5 blur-3xl rounded-[40px] pointer-events-none"></div>
              <div className="relative bg-[#0f172a]/40 border border-slate-800/60 rounded-[40px] p-8 overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                      <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Profil Güvenlik Skoru</p>
                          <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">
                              {isVerified ? 'TAM KORUMA' : 'RİSKLİ DURUM'}
                          </h3>
                      </div>
                      <div className={`p-4 rounded-3xl border-2 transition-all shadow-2xl ${isVerified ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-orange-500/10 border-orange-500 text-orange-500 animate-pulse'}`}>
                          {isVerified ? <ShieldCheck size={28} /> : <AlertCircle size={28} />}
                      </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-900 rounded-full mb-4 overflow-hidden border border-slate-800 shadow-inner">
                      <div className={`h-full transition-all duration-1000 ${isVerified ? 'w-full bg-emerald-500' : 'w-1/3 bg-orange-500'}`}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Sistem Durumu: {isVerified ? 'Onaylandı' : 'Doğrulama Bekliyor'}</p>
                      <div className="flex items-center gap-1.5">
                          <Fingerprint size={12} className="text-blue-500" />
                          <span className="text-[9px] font-black text-blue-500 uppercase italic">AES-256 Encrypted</span>
                      </div>
                  </div>
              </div>
          </div>

          {/* SaaS Form Sections */}
          <div className="space-y-8">
              <div className="flex items-center gap-3 px-2">
                  <Globe size={16} className="text-slate-700" />
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">İletişim Katmanı</h4>
                  <div className="h-px flex-1 bg-slate-900"></div>
              </div>

              <div className="space-y-6">
                  {/* Email Section */}
                  <div className="group">
                      <div className="flex justify-between items-center mb-3 px-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">E-Posta Hesabı</label>
                          {isVerified && <div className="flex items-center gap-1 text-[9px] font-black text-emerald-500 italic"><Check size={10}/> AKTİF</div>}
                      </div>
                      <div className="relative">
                          <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isVerified ? 'text-emerald-500' : 'text-slate-600 group-focus-within:text-blue-500'}`}>
                              <Mail size={20} />
                          </div>
                          <input 
                            type="email" 
                            value={formData.email} 
                            disabled={isVerified}
                            onChange={e => setFormData({...formData, email: e.target.value})} 
                            className={`w-full py-5 pl-14 pr-6 text-sm font-bold rounded-[28px] border outline-none transition-all shadow-2xl ${
                                isVerified 
                                ? 'bg-slate-950/50 border-slate-900 text-slate-400' 
                                : 'bg-[#0f172a]/40 border-slate-800 text-white focus:border-blue-500/50 focus:bg-[#0f172a]'
                            }`} 
                            placeholder="mail@sirket.com" 
                          />
                      </div>
                  </div>

                  {/* Phone Section */}
                  <div className="group">
                      <div className="flex justify-between items-center mb-3 px-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Telefon Numarası (Opsiyonel)</label>
                          {isVerified && formData.phone.length > 5 && <div className="flex items-center gap-1 text-[9px] font-black text-emerald-500 italic"><Check size={10}/> AKTİF</div>}
                      </div>
                      <div className="relative">
                          <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isVerified ? 'text-emerald-500' : 'text-slate-600 group-focus-within:text-blue-500'}`}>
                              <Phone size={20} />
                          </div>
                          <input 
                            type="tel" 
                            value={formData.phone} 
                            disabled={isVerified}
                            onChange={handlePhoneChange}
                            className={`w-full py-5 pl-14 pr-6 text-sm font-bold rounded-[28px] border outline-none transition-all shadow-2xl ${
                                isVerified 
                                ? 'bg-slate-950/50 border-slate-900 text-slate-400' 
                                : 'bg-[#0f172a]/40 border-slate-800 text-white focus:border-blue-500/50 focus:bg-[#0f172a]'
                            }`} 
                            placeholder="+90 5XX XXX XX XX" 
                          />
                      </div>
                  </div>
              </div>

              {/* Verified Badge / CTA Section */}
              <div className="pt-6 relative">
                  {isVerified ? (
                      <div className="space-y-6">
                        <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-[32px] flex items-center gap-4 shadow-xl">
                            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-black text-white uppercase italic tracking-tight">Hesap Doğrulandı</p>
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">Bilgileriniz veri ambarımıza kilitlendi. Güvenlik protokolü gereği değişim yapılamaz.</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => navigate('/settings')}
                            className="w-full py-6 bg-slate-900 border border-slate-800 text-white font-black rounded-[32px] text-[11px] uppercase tracking-[0.4em] italic shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            AYARLARA DÖN <ArrowRight size={18}/>
                        </button>
                      </div>
                  ) : (
                      <>
                        {errorMsg && (
                            <div className="mb-6 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-center gap-3 animate-in shake italic">
                                <AlertCircle className="text-red-500 shrink-0" size={18} />
                                <p className="text-red-400 text-[10px] font-black uppercase tracking-tight">{errorMsg}</p>
                            </div>
                        )}
                        <button 
                            onClick={handleSave} 
                            disabled={isSaving} 
                            className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-[32px] font-black text-white flex items-center justify-center gap-4 shadow-2xl shadow-blue-900/40 active:scale-95 transition-all disabled:opacity-50 text-[11px] tracking-[0.4em] uppercase italic"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={24} /> : <><Shield size={20}/><span>Verileri Kilitle</span></>}
                        </button>
                        <div className="mt-8 flex flex-col items-center gap-4 opacity-30">
                            <div className="h-px w-20 bg-slate-800"></div>
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.6em] text-center px-10 leading-loose italic">
                                BotlyHub SaaS Framework v3.0<br/>End-to-End Encryption Enabled
                            </p>
                        </div>
                      </>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default AccountSettings;
