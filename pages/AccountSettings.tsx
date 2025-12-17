
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Mail, Phone, Save, Loader2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../hooks/useTelegram';
import { DatabaseService } from '../services/DatabaseService';

const AccountSettings = () => {
  const navigate = useNavigate();
  const { user } = useTelegram();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', phone: '+90 ' });

  useEffect(() => {
    // Mevcut veriyi çekip form alanlarını dolduralım
    const loadUserData = async () => {
        if (!user) return;
        const users = await DatabaseService.getUsers();
        const currentUser = users.find(u => u.id === user.id.toString());
        if (currentUser) {
            setFormData({
                email: currentUser.email || '',
                phone: currentUser.phone || '+90 '
            });
        }
    };
    loadUserData();
  }, [user]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Kullanıcının +90 kısmını silmesini engelle
    if (val.startsWith('+90 ')) {
        setFormData({ ...formData, phone: val });
    } else if (val === '' || val === '+' || val === '+9') {
        setFormData({ ...formData, phone: '+90 ' });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    if (!formData.email.includes('@')) {
        alert('Lütfen geçerli bir e-posta adresi girin.');
        return;
    }
    if (formData.phone.length < 14) {
        alert('Lütfen telefon numaranızı eksiksiz girin.');
        return;
    }

    setIsLoading(true);
    try {
        await DatabaseService.syncUser({
            id: user.id.toString(),
            name: `${user.first_name} ${user.last_name || ''}`.trim(),
            username: user.username || 'user',
            avatar: user.photo_url || '',
            role: 'User',
            status: 'Active',
            joinDate: new Date().toISOString(),
            email: formData.email,
            phone: formData.phone
        });
        
        // Haptic feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
        
        alert('Bilgileriniz başarıyla güncellendi ve veritabanına kaydedildi.');
        navigate('/settings');
    } catch (e) {
        console.error(e);
        alert('Kaydetme sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] p-6 pt-10">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => navigate('/settings')} className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 active:scale-90 transition-transform"><ChevronLeft size={22} /></button>
        <h1 className="text-xl font-black text-white tracking-tight">Hesap Doğrulama</h1>
      </div>

      <div className="bg-blue-600/5 border border-blue-500/10 p-6 rounded-[32px] mb-8">
          <div className="flex items-center gap-3 mb-4 text-blue-400">
              <ShieldCheck size={24} />
              <h3 className="font-bold">Neden Gereklidir?</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Ödemelerinizi güvenle alabilmeniz ve hesabınızın doğruluğunu teyit edebilmemiz için iletişim bilgilerinize ihtiyacımız var. Verileriniz şifrelenmiş olarak saklanır.
          </p>
      </div>

      <div className="space-y-6">
          <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-600 block ml-2 uppercase tracking-[0.2em]">İletişim E-postası</label>
              <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    className="w-full bg-[#0f172a]/60 border border-slate-800 rounded-2xl py-4.5 pl-12 pr-4 text-sm text-white focus:ring-1 ring-blue-500/40 outline-none transition-all" 
                    placeholder="ornek@mail.com" 
                  />
              </div>
          </div>

          <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-600 block ml-2 uppercase tracking-[0.2em]">Telefon Numarası</label>
              <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    type="tel" 
                    value={formData.phone} 
                    onChange={handlePhoneChange}
                    className="w-full bg-[#0f172a]/60 border border-slate-800 rounded-2xl py-4.5 pl-12 pr-4 text-sm text-white focus:ring-1 ring-blue-500/40 outline-none transition-all font-medium" 
                    placeholder="+90 5xx xxx xx xx" 
                  />
              </div>
          </div>

          <div className="pt-4">
              <button 
                onClick={handleSave} 
                disabled={isLoading} 
                className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-[24px] font-black text-white flex items-center justify-center gap-3 shadow-lg shadow-blue-900/20 active:scale-95 transition-all disabled:opacity-50"
              >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20}/><span>Bilgileri Kaydet ve Doğrula</span></>}
              </button>
          </div>
          
          <p className="text-[10px] text-slate-700 text-center px-8 italic font-medium">
              Kaydet butonuna bastığınızda verileriniz BotlyHub bulut sunucularına güvenle iletilecektir.
          </p>
      </div>
    </div>
  );
};

export default AccountSettings;
