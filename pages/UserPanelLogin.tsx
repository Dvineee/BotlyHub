import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { DatabaseService } from '../services/DatabaseService';

const UserPanelLogin: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const user = await DatabaseService.loginPanel(username, password);
            if (user) {
                // Store panel session
                localStorage.setItem('panel_user', JSON.stringify(user));
                await DatabaseService.logActivity(user.id.toString(), 'auth', 'panel_login', 'Panel Girişi', `${user.username} kullanıcı paneline giriş yaptı.`);
                navigate('/u/panel');
            } else {
                setError('Geçersiz kullanıcı adı veya şifre, ya da panel erişiminiz yok.');
            }
        } catch (err) {
            setError('Giriş yapılırken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-8 animate-in fade-in">
      <div className="w-full max-w-md space-y-10">
        <div className="text-center space-y-5">
          <div className="shrink-0 flex justify-center">
            <img 
              src="/logo.svg" 
              alt="BotlyHub Logo" 
              style={{ width: '4rem', height: 'auto', display: 'block' }} 
              className=" mx-auto" 
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Kullanıcı Paneli</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">Güvenli Giriş Sistemi</p>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-white/5 p-10 rounded-[48px] backdrop-blur-xl space-y-8 ">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Kullanıcı Adı</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
                  <User size={20} />
                </div>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Telegram kullanıcı adınız..."
                  className="w-full h-16 bg-slate-950/50 border border-white/5 rounded-[24px] pl-14 pr-6 text-white text-sm font-bold outline-none focus:border-brand transition-all "
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Panel Şifresi</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
                  <Key size={20} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-16 bg-slate-950/50 border border-white/5 rounded-[24px] pl-14 pr-6 text-white text-sm font-bold outline-none focus:border-brand transition-all "
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-[24px] animate-in slide-in-from-top-2">
                <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-widest leading-relaxed">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-brand hover:opacity-90 disabled:opacity-50 text-white rounded-[24px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all group  "
            >
              {loading ? 'GİRİŞ YAPILIYOR...' : (
                <>
                  PANEL GİRİŞİ
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed">
              Erişim yetkiniz yoksa lütfen yönetici ile iletişime geçin.
            </p>
          </div>
        </div>
      </div>
    </div>
    );
};

export default UserPanelLogin;
