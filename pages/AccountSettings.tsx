
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Mail, Phone, Save, Loader2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../hooks/useTelegram';
import { DatabaseService } from '../services/DatabaseService';
import { User } from '../types';

const AccountSettings = () => {
  const navigate = useNavigate();
  const { user, haptic, notification } = useTelegram();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [formData, setFormData] = useState({ email: '', phone: '+90 ' });

  useEffect(() => {
    const loadUserData = async () => {
        if (!user) return;
        const users = await DatabaseService.getUsers();
        const currentUser = users.find(u => u.id === user.id.toString());
        if (currentUser) {
            setUserData(currentUser);
            setFormData({
                email: currentUser.email || '',
                phone: currentUser.phone || '+90 '
            });
        }
    };
    loadUserData();
  }, [user]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    
    // Eğer kullanıcı +90 kısmını sildiyse veya değiştirdiyse geri getir
    if (!val.startsWith('+90 ')) {
        val = '+90 ' + val.replace(/^\+90\s*/, '');
    }
    
    // Sadece sayı ve boşluklara izin ver (isteğe bağlı ama güvenli)
    const suffix = val.slice(4);
    const cleanedSuffix = suffix.replace(/[^\d\s]/g, '');
    
    setFormData({ ...formData, phone: '+90 ' + cleanedSuffix });
  };

  const handleSave = async () => {
    if (!user) return;

    // Basit Validasyonlar
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        alert('Lütfen geçerli bir e-posta adresi girin.');
        return;
    }
    if (formData.phone.trim().length < 13) {
        alert('Lütfen telefon numaranızı eksiksiz girin.');
        return;
    }

    setIsLoading(true);
    haptic('medium');

    try {
        // Mevcut kullanıcı verisiyle birleştir (Role ve Badges'ları kaybetmemek için)
        const updatePayload: Partial<User> = {
            ...userData,
            id: user.id.toString(),
            name: `${user.first_name} ${user.last_name || ''}`.trim(),
            username: user.username || 'user',
            avatar: user.photo_url || `https://ui-avatars.com/api/?name=${user.first_name}`,
            email: formData.email,
            phone: formData.phone,
            joinDate: userData?.joinDate || new Date().toISOString(),
            status: userData?.status || 'Active',
            role: userData?.role || 'User'
        };

        await DatabaseService.syncUser(updatePayload);
        
        notification('success');
        alert('Bilgileriniz başarıyla veritabanına kaydedildi.');
        navigate('/settings');
    } catch (e) {
        console.error("Save Error:", e);
        notification('error');
        alert('Veritabanına erişilirken bir hata oluştu. Lütfen bağlantınızı kontrol edin.');
    } finally {
        setIsLoading(false);
    }
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
              <h3 className="font-bold">Güvenlik Kontrolü</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Bu bilgiler, pazar yerindeki işlemlerinizi doğrulamak ve size özel destek sunabilmek için gereklidir.
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
                    className="w-full bg-[#0f172a]/60 border border-slate-800 rounded-2xl py-4.5 pl-12 pr-4 text-sm text-white focus:ring-1 ring-blue-500/40 outline-none transition-all" 
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
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20}/><span>Değişiklikleri Veritabanına Yaz</span></>}
              </button>
          </div>
      </div>
    </div>
  );
};

export default AccountSettings;
