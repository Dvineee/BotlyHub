
import React, { useState } from 'react';
import { Search, SlidersHorizontal, Plus } from 'lucide-react';
// Fixed: Use namespace import for react-router-dom to resolve "no exported member" errors
import * as Router from 'react-router-dom';
import { User } from '../types';

const { useNavigate } = Router as any;

const mockUsers: User[] = [
  { id: '1', name: 'Ali Yılmaz', username: '@aliyilmaz', avatar: 'https://picsum.photos/seed/ali/200', role: 'User', status: 'Active', badges: ['Premium', 'Reklamcı'], joinDate: '2023-01-01' },
  { id: '2', name: 'Zeynep Kaya', username: '@zeynepkaya', avatar: 'https://picsum.photos/seed/zey/200', role: 'Admin', status: 'Active', badges: ['Premium'], joinDate: '2023-02-15' },
  { id: '3', name: 'Mehmet Öztürk', username: '@mehmetozturk', avatar: 'https://picsum.photos/seed/meh/200', role: 'User', status: 'Active', badges: [], joinDate: '2023-03-10' },
  { id: '4', name: 'Ayşe Demir', username: '@aysedemir', avatar: 'https://picsum.photos/seed/ayse/200', role: 'User', status: 'Passive', badges: [], joinDate: '2023-04-20' },
  { id: '5', name: 'Caner B', username: '@canerb', avatar: 'https://picsum.photos/seed/caner/200', role: 'User', status: 'Active', badges: ['Reklamcı'], joinDate: '2023-05-05' },
];

const UserList = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('Tümü');

  const filters = ['Tümü', 'Premium', 'Reklamcı', 'Aktif'];

  const filteredUsers = mockUsers.filter(user => {
    if (filter === 'Tümü') return true;
    if (filter === 'Premium') return user.badges.includes('Premium');
    if (filter === 'Reklamcı') return user.badges.includes('Reklamcı');
    if (filter === 'Aktif') return user.status === 'Active';
    return true;
  });

  return (
    <div className="p-6 pt-10 pb-32 bg-slate-50 dark:bg-[#020617] min-h-screen animate-in fade-in transition-colors duration-300">
      <div className="flex justify-between items-center mb-10 px-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Kullanıcılar</h1>
        <button className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-900/80 border border-black/5 dark:border-white/5 rounded-full text-slate-500 dark:text-slate-400 active:scale-90 transition-transform ">
            <Plus size={22} />
        </button>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Kullanıcı ara..." 
            className="w-full bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 rounded-xl py-5 pl-14 pr-6 text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:border-purple-500/50 focus:bg-white dark:focus:bg-slate-900/60 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700  text-slate-900 dark:text-white"
          />
        </div>
        <button className="w-14 h-14 flex items-center justify-center bg-white dark:bg-slate-900/40 rounded-xl border border-black/5 dark:border-white/5 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-300 transition-all ">
            <SlidersHorizontal size={20} />
        </button>
      </div>

      <div className="flex gap-3 mb-10 overflow-x-auto pb-2 no-scrollbar px-1">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap  ${
              filter === f 
              ? 'bg-purple-600 text-white  scale-105' 
              : 'bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <div 
            key={user.id} 
            onClick={() => navigate(`/users/${user.id}`)}
            className="flex items-center justify-between p-5 rounded-xl bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 hover:border-purple-500/30 dark:hover:border-purple-500/30 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-all cursor-pointer group "
          >
            <div className="flex items-center gap-5">
              <div className="relative">
                <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-14 h-14 rounded-xl object-cover border border-black/5 dark:border-white/10 group-hover:scale-105 transition-transform " 
                    referrerPolicy="no-referrer"
                />
                {user.status === 'Active' && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-slate-950 rounded-full "></div>
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{user.name}</h3>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">{user.username}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
                {user.badges.includes('Premium') && (
                    <span className="bg-amber-500/10 text-amber-600 dark:text-amber-500 text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-amber-500/20">Premium</span>
                )}
                {user.badges.includes('Reklamcı') && (
                    <span className="bg-purple-500/10 text-purple-600 dark:text-purple-500 text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-purple-500/20">Reklamcı</span>
                )}
                {user.status === 'Passive' && (
                    <span className="bg-red-500/10 text-red-600 dark:text-red-500 text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-red-500/20">Pasif</span>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;
