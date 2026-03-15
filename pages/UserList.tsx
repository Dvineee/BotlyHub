
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
    <div className="p-4 pt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kullanıcılar</h1>
        <button className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700">
            <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-3 mb-8">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Kullanıcı ara..." 
            className="w-full bg-slate-900/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-blue-500/50 focus:bg-slate-900/60 transition-all placeholder:text-slate-700 italic"
          />
        </div>
        <button className="p-4 bg-slate-900/40 rounded-2xl border border-white/5 text-slate-500 hover:bg-white/5 hover:text-slate-300 transition-all">
            <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap border italic ${
              filter === f 
              ? 'bg-blue-600 border-blue-400 text-white shadow-xl shadow-blue-900/40 scale-105 -translate-y-0.5' 
              : 'bg-slate-900/40 border-white/5 text-slate-500 hover:bg-white/5 hover:text-slate-300 hover:border-white/10'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <div 
            key={user.id} 
            onClick={() => navigate(`/users/${user.id}`)}
            className="flex items-center justify-between p-4 rounded-[28px] bg-slate-900/40 border border-white/5 hover:border-blue-500/30 hover:bg-slate-900/60 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-2xl object-cover border border-white/10 group-hover:scale-105 transition-transform" />
                {user.status === 'Active' && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#020617] rounded-full"></div>
                )}
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase italic tracking-tight">{user.name}</h3>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{user.username}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
                {user.badges.includes('Premium') && (
                    <span className="bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border border-amber-500/20">Premium</span>
                )}
                {user.badges.includes('Reklamcı') && (
                    <span className="bg-blue-500/10 text-blue-500 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border border-blue-500/20">Reklamcı</span>
                )}
                {user.status === 'Passive' && (
                    <span className="bg-red-500/10 text-red-500 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border border-red-500/20">Pasif</span>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;
