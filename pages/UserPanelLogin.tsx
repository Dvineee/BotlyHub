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
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-purple-600/20 rounded-3xl flex items-center justify-center mx-auto border border-purple-500/30 animate-pulse">
                        <ShieldCheck size={40} className="text-purple-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Kullanıcı Paneli</h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Güvenli Giriş Sistemi</p>
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-xl space-y-6">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kullanıcı Adı</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                    <User size={18} />
                                </div>
                                <input 
                                    type="text" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Telegram kullanıcı adınız..."
                                    className="w-full h-14 bg-slate-950 border border-white/5 rounded-2xl pl-12 pr-4 text-white text-sm font-bold outline-none focus:border-purple-500 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Panel Şifresi</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                    <Key size={18} />
                                </div>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-14 bg-slate-950 border border-white/5 rounded-2xl pl-12 pr-4 text-white text-sm font-bold outline-none focus:border-purple-500 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                                <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-wider">{error}</p>
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all group"
                        >
                            {loading ? 'GİRİŞ YAPILIYOR...' : (
                                <>
                                    PANEL GİRİŞİ
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="pt-4 text-center">
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                            Erişim yetkiniz yoksa lütfen yönetici ile iletişime geçin.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserPanelLogin;
