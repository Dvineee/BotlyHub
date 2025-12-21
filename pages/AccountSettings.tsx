
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Mail, Phone, Save, Loader2, ShieldCheck, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
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
                // Eğer email veya telefon varsa hesabı doğrulanmış kabul et (tek seferlik kuralı)
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

    // Email Validasyonu (Zorunlu)
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        alert('Lütfen geçerli bir e-posta adresi girin.');
        return;
    }

    // Telefon kontrolü (Opsiyonel ama girilmişse tam olmalı)
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
        alert('Hesabınız başarıyla doğrulanmıştır!');
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
    <div className="min-h-screen bg-[#020617] p-6 pt-10 pb-20 no-scrollbar">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => navigate('/settings')} className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 active:scale-90 transition-transform">
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-xl font-black text-white tracking-tight">Hesap Doğrulama</h1>
      </div>

      {isVerified ? (
        <div className="mb-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-[32px] flex flex-col items-center text-center animate-in fade-in">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-2xl shadow-blue-500/20 border-4 border-[#020617]">
                <CheckCircle2 size={32} className="text-white" />
            </div>
            <h3 className="text-white font-black text-lg">Hesabınız Doğrulandı</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">İletişim bilgileriniz güvenli bir şekilde kaydedildi. Bu bilgiler güvenlik sebebiyle değiştirilemez.</p>
        </div>
      ) : (
        <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-[32px] mb-8">
            <div className="flex items-center gap-3 mb-4 text-emerald-400">
                <ShieldCheck size={24} />
                <h3 className="font-bold">Güvenli Kayıt</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Ödemelerinizi alabilmeniz için bilgileriniz gereklidir. Bu işlemi sadece **bir kez** yapabilirsiniz.
            </p>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
          <p className="text-red-400/80 text-[10px] leading-relaxed">{errorMsg}</p>
        </div>
      )}

      <div className="space-y-8">
          <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-600 block ml-2 uppercase tracking-[0.2em] flex justify-between items-center">
                <span>E-posta Adresi</span>
                {isVerified && <span className="text-blue-500 text-[8px] italic">KİLİTLİ</span>}
              </label>
              <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors">
                    {isVerified ? <Lock size={16} /> : <Mail size={18} />}
                  </div>
                  <input 
                    type="email" 
                    value={formData.email} 
                    disabled={isVerified}
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    className={`w-full border py-5 pl-12 pr-4 text-sm text-white rounded-[24px] outline-none transition-all ${
                        isVerified 
                        ? 'bg-slate-900/40 border-slate-900 text-slate-500' 
                        : 'bg-[#0f172a]/60 border-slate-800 focus:border-blue-500/50'
                    }`} 
                    placeholder="ornek@mail.com" 
                  />
              </div>
          </div>

          <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-600 block ml-2 uppercase tracking-[0.2em] flex justify-between items-center">
                <span>Telefon (Sabit +90)</span>
                {isVerified && <span className="text-blue-500 text-[8px] italic">KİLİTLİ</span>}
              </label>
              <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors">
                    {isVerified ? <Lock size={16} /> : <Phone size={18} />}
                  </div>
                  <input 
                    type="tel" 
                    value={formData.phone} 
                    disabled={isVerified}
                    onChange={handlePhoneChange}
                    className={`w-full border py-5 pl-12 pr-4 text-sm text-white rounded-[24px] outline-none transition-all ${
                        isVerified 
                        ? 'bg-slate-900/40 border-slate-900 text-slate-500' 
                        : 'bg-[#0f172a]/60 border-slate-800 focus:border-blue-500/50'
                    }`} 
                    placeholder="+90 5XX XXX XX XX" 
                  />
              </div>
          </div>

          {!isVerified && (
            <div className="pt-6">
                <button 
                    onClick={handleSave} 
                    disabled={isSaving} 
                    className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-[28px] font-black text-white flex items-center justify-center gap-4 shadow-2xl shadow-blue-900/40 active:scale-95 transition-all disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="animate-spin" size={24} /> : <><Save size={20}/><span>Doğrulamayı Tamamla</span></>}
                </button>
                <p className="text-center text-[9px] text-slate-700 mt-6 uppercase tracking-widest font-black italic">
                    Gelecek güncellemede OTP (Kod) doğrulaması aktif edilecektir.
                </p>
            </div>
          )}
      </div>
    </div>
  );
};

export default AccountSettings;
