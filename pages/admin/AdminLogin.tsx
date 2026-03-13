
import React, { useState } from 'react';
import * as Router from 'react-router-dom';
import { Shield, Lock, User, AlertCircle, ChevronRight, Sparkles } from 'lucide-react';
import { DatabaseService } from '../../services/DatabaseService';
import { motion, AnimatePresence } from 'motion/react';

const { useNavigate } = Router as any;

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    if (username === 'admin' && password === 'admin123') {
      DatabaseService.setAdminSession('v3_token_' + Math.random());
      navigate('/a/dashboard');
    } else {
      setError('Geçersiz kullanıcı adı veya şifre.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full relative z-10"
      >
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-[0_20px_50px_rgba(37,99,235,0.3)] relative group"
          >
            <Shield size={48} className="text-white relative z-10" />
            <div className="absolute inset-0 bg-white/20 rounded-[32px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </motion.div>
          
          <h1 className="text-5xl font-black text-white mb-4 italic uppercase tracking-tighter leading-none">
            Botly<span className="text-blue-500">Hub</span> <span className="text-2xl align-top text-slate-700">V3</span>
          </h1>
          <div className="flex items-center justify-center gap-2 text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">
            <Sparkles size={12} className="text-blue-500" />
            ADMIN CONTROL CENTER
            <Sparkles size={12} className="text-blue-500" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <form 
            onSubmit={handleLogin} 
            className="bg-slate-900/50 backdrop-blur-2xl border border-white/5 p-10 rounded-[48px] shadow-2xl relative overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-500 p-5 rounded-2xl flex items-center gap-4 text-xs font-bold uppercase tracking-wider"
                >
                  <AlertCircle size={20} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Kullanıcı Adı</label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-16 bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white font-bold outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-800"
                    placeholder="admin"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Şifre</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-16 bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white font-bold outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-800"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full h-16 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center gap-3 group relative overflow-hidden"
              >
                {isLoading ? (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    Giriş Yap
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-[-20deg]"></div>
              </button>
            </div>
          </form>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-slate-700 mt-10 text-[9px] font-black uppercase tracking-[0.3em] italic"
        >
          Güvenliğiniz için her oturum sonunda çıkış yapmayı unutmayın.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
