
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Mail, Phone, Save, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
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
  const [userData, setUserData] = useState<User | null>(null);
  const [formData, setFormData] = useState({ email: '', phone: '+90 ' });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
        if (!user?.id) {
            setIsLoading(false);
            return;
        }
        
        try {
            // Sadece bu kullanıcının verilerini çekiyoruz
            const currentUser = await DatabaseService.getUserById(user.id.toString());
            if (currentUser) {
                setUserData(currentUser);
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
    let val = e.target.value;
    if (!val.startsWith('+90 ')) {
        val = '+90 ' + val.replace(/^\+90\s*/, '');
    }
    const suffix = val.slice(4).replace(/[^\d]/g, '').slice(0, 10);
    setFormData({ ...formData, phone: '+90 ' + suffix });
  };

  const handleSave = async () => {
    setErrorMsg(null);
    if (!user) {
        alert("Telegram verisi alınamadı. Lütfen uygulamayı yeniden başlatın.");
        return;
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        alert('Lütfen geçerli bir e-posta adresi girin.');
        return;
    }
    if (formData.phone.replace(/\s/g, '').length < 12) {
        alert('Lütfen telefon numaranızı eksiksiz girin.');
        return;
    }

    setIsSaving(true);
    haptic('medium');

    try {
        const payload: Partial<User> = {
            id: user.id.toString(),
            email: formData.email,
            phone: formData.phone
        };

        // DatabaseService.syncUser artık akıllı olduğu için email/phone'u koruyacak
        await DatabaseService.syncUser(payload);
        
        notification('success');
        alert('Profil bilgileriniz başarıyla güncellendi!');
        navigate('/settings');
    } catch (e: any) {
        console.error("Kayıt Hatası:", e);
        notification('error');
        setErrorMsg(e.message || 'Bilinmeyen bir hata oluştu.');
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
    <div className="min-h-screen bg-[#020617] p-6 pt-10 pb-20">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => navigate('/settings')} className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 active:scale-90 transition-transform">
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-xl font-black text-white tracking-tight">Hesap Doğrulama</h1>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-red-500 text-xs font-bold">İşlem Başarısız</p>
            <p className="text-red-400/80 text-[10px] mt-1 leading-relaxed">{errorMsg}</p>
          </div>
        </div>
      )}

      <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-[32px] mb-8">
          <div className="flex items-center gap-3 mb-4 text-emerald-400">
              <ShieldCheck size={24} />
              <h3 className="font-bold">Güvenli Kayıt</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Kazançlarınızı çekebilmeniz için iletişim bilgilerinizin doğruluğu önemlidir. Bilgileriniz şifrelenerek korunur.
          </p>
      </div>

      <div className="space-y-6">
          <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-600 block ml-2 uppercase tracking-[0.2em]">E-posta Adresi</label>
              <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    className="w-full bg-[#0f172a]/60 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:ring-1 ring-blue-500/40 outline-none transition-all" 
                    placeholder="ornek@mail.com" 
                  />
              </div>
          </div>

          <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-600 block ml-2 uppercase tracking-[0.2em]">Telefon (Sabit +90)</label>
              <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    type="tel" 
                    value={formData.phone} 
                    onChange={handlePhoneChange}
                    className="w-full bg-[#0f172a]/60 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:ring-1 ring-blue-500/40 outline-none transition-all font-medium" 
                    placeholder="+90 5XX XXX XX XX" 
                  />
              </div>
          </div>

          <div className="pt-4">
              <button 
                onClick={handleSave} 
                disabled={isSaving} 
                className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-[24px] font-black text-white flex items-center justify-center gap-3 shadow-lg shadow-blue-900/20 active:scale-95 transition-all disabled:opacity-50"
              >
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20}/><span>Değişiklikleri Kaydet</span></>}
              </button>
          </div>
      </div>
    </div>
  );
};

export default AccountSettings;
