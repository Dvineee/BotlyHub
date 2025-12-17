
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Mail, Phone, Save, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../hooks/useTelegram';
import { DatabaseService } from '../services/DatabaseService';

const AccountSettings = () => {
  const navigate = useNavigate();
  const { user } = useTelegram();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', phone: '' });

  useEffect(() => {
    // Mevcut veriyi DB'den de çekebiliriz, şimdilik local dolduruyoruz
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
        await DatabaseService.syncUser({
            id: user.id.toString(),
            name: `${user.first_name} ${user.last_name || ''}`.trim(),
            username: user.username || 'unknown',
            avatar: user.photo_url || '',
            role: 'User',
            status: 'Active',
            joinDate: new Date().toISOString(),
            email: formData.email,
            phone: formData.phone
        });
        alert('Bilgileriniz kaydedildi. Artık yönetim tarafından doğrulanabilir durumdasınız.');
    } catch (e) {
        alert('Kaydetme hatası!');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 pt-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/settings')} className="p-2 hover:bg-slate-900 rounded-full"><ChevronLeft /></button>
        <h1 className="text-xl font-bold text-white">Hesap Doğrulama</h1>
      </div>

      <div className="space-y-6">
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <label className="text-xs font-bold text-slate-500 block mb-2 uppercase">İletişim E-postası</label>
              <div className="relative">
                  <Mail className="absolute left-3 top-3 text-slate-600" size={18} />
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm" placeholder="eposta@adres.com" />
              </div>
          </div>

          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <label className="text-xs font-bold text-slate-500 block mb-2 uppercase">Telefon Numarası</label>
              <div className="relative">
                  <Phone className="absolute left-3 top-3 text-slate-600" size={18} />
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm" placeholder="+90 5xx xxx xx xx" />
              </div>
          </div>

          <button onClick={handleSave} disabled={isLoading} className="w-full bg-blue-600 py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2">
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20}/><span>Bilgileri Kaydet ve Doğrula</span></>}
          </button>
          
          <p className="text-[10px] text-slate-500 text-center px-6 italic">Bu bilgiler sadece admin tarafından ödeme ve destek süreçleri için kullanılacaktır.</p>
      </div>
    </div>
  );
};

export default AccountSettings;
