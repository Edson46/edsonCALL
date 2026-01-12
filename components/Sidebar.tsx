
import React from 'react';
import { UserProfile, UserRole } from '../types';
import { APP_NAME } from '../constants';

interface SidebarProps {
  currentUser: UserProfile;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser, activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'discovery', label: 'Explore', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    { id: 'posts', label: 'Feed', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012-2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
    { id: 'messages', label: 'Messages', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
    { id: 'earnings', label: 'Earnings', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'support', label: 'Support Chat', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    { id: 'profile', label: 'My Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];

  const isAdmin = currentUser.role === UserRole.ADMIN;

  return (
    <aside className="hidden md:flex flex-col w-72 bg-white border-r p-8">
      <div className="mb-12">
        <h1 className="text-3xl font-black bg-gradient-to-r from-rose-600 to-orange-500 bg-clip-text text-transparent italic tracking-tighter">
          {APP_NAME}
        </h1>
        <div className={`mt-2 inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${isAdmin ? 'bg-slate-900 border-amber-500/30' : 'bg-slate-50 border-slate-100'}`}>
           <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isAdmin ? 'bg-amber-400' : 'bg-emerald-500'}`} />
           <p className={`text-[9px] font-black uppercase tracking-widest ${isAdmin ? 'text-amber-400' : 'text-slate-400'}`}>
             {isAdmin ? 'System Master Mode' : 'Tanzania HQ'}
           </p>
        </div>
      </div>

      <nav className="flex-1 space-y-3">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
              activeTab === item.id 
                ? 'bg-rose-500 text-white font-black shadow-xl shadow-rose-100 translate-x-1' 
                : 'text-slate-500 hover:bg-slate-50 font-bold'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={item.icon} />
            </svg>
            <span className="text-sm">{item.label}</span>
          </button>
        ))}

        {isAdmin && (
          <div className="pt-8 mt-8 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('admin')}
              className={`w-full group relative flex flex-col items-start p-6 rounded-[2.5rem] transition-all duration-500 overflow-hidden ${
                activeTab === 'admin' 
                  ? 'bg-slate-950 text-amber-400 shadow-[0_20px_50px_rgba(251,191,36,0.2)]' 
                  : 'bg-amber-400 text-slate-900 hover:bg-slate-950 hover:text-amber-400'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2 z-10">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="font-black uppercase tracking-[0.2em] text-[10px]">Security Control</span>
              </div>
              <p className="text-xs font-black uppercase tracking-tighter italic z-10">Admin Dashboard</p>
              
              <div className="absolute top-0 right-0 p-2 opacity-10 rotate-12">
                 <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              </div>
            </button>
          </div>
        )}
      </nav>

      <div className="mt-auto pt-8 border-t space-y-4">
        <div className={`flex items-center space-x-4 p-4 rounded-3xl ${isAdmin ? 'bg-slate-950 text-white' : 'bg-slate-50'}`}>
          <img 
            src={currentUser.photo} 
            className="w-12 h-12 rounded-2xl border-2 border-rose-500 object-cover" 
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            alt={currentUser.name}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black truncate leading-tight">{currentUser.name}</p>
            <p className={`text-[9px] font-black uppercase tracking-widest ${isAdmin ? 'text-amber-400' : 'text-rose-500'}`}>
               {isAdmin ? 'Super Admin' : currentUser.tier}
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-6 py-4 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all font-bold text-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
