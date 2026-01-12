
import React, { useState, useMemo } from 'react';
import { UserProfile, UserTier, UserRole } from '../types';

interface DiscoveryProps {
  currentUser: UserProfile;
  users: UserProfile[];
  onStartCall: (user: UserProfile) => void;
  onMessageUser: (userId: string) => void;
  onLike: (user: UserProfile) => void;
  onToggleFollow: (userId: string) => void;
}

const Discovery: React.FC<DiscoveryProps> = ({ currentUser, users, onStartCall, onMessageUser, onLike, onToggleFollow }) => {
  const [filter, setFilter] = useState<'foryou' | 'all' | 'online' | 'liked'>('foryou');
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  // Sophisticated Matching Algorithm
  const calculateMatchScore = (targetUser: UserProfile): number => {
    let score = 50; // Base score

    // 1. Interests Overlap (Primary weight)
    const commonInterests = currentUser.interests.filter(i => 
      targetUser.interests.some(ti => ti.toLowerCase() === i.toLowerCase())
    );
    score += commonInterests.length * 15;

    // 2. Location Proximity
    if (currentUser.location === targetUser.location) {
      score += 20;
    }

    // 3. Age Compatibility (Prefer ±5 years)
    const ageDiff = Math.abs(currentUser.age - targetUser.age);
    if (ageDiff <= 3) score += 15;
    else if (ageDiff <= 7) score += 5;
    else score -= ageDiff * 2;

    // 4. Activity Boost
    if (targetUser.isOnline) score += 10;
    if (targetUser.tier === UserTier.PREMIUM) score += 5;

    // Normalize to 0-100
    return Math.min(Math.max(score, 0), 99);
  };

  const displayUsers = useMemo(() => {
    // Filter out the current user and any blocked users
    let filtered = users.filter(u => u.id !== currentUser.id && !u.isBlocked);

    if (filter === 'liked') {
      return filtered.filter(u => likedIds.has(u.id));
    }
    
    if (filter === 'online') {
      return filtered.filter(u => u.isOnline);
    }

    if (filter === 'foryou') {
      return filtered
        .map(u => ({ ...u, matchScore: calculateMatchScore(u) }))
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    return filtered;
  }, [filter, likedIds, currentUser, users]);

  const onlineCount = users.filter(u => u.isOnline && u.id !== currentUser.id && !u.isBlocked).length;
  const likedCount = likedIds.size;

  const handleLike = (user: UserProfile) => {
    if (likedIds.has(user.id)) return;
    setLikedIds(prev => new Set(prev).add(user.id));
    onLike(user);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
             <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
               {filter === 'foryou' ? 'AI Matching' : filter === 'liked' ? 'Liked Profiles' : 'Discovery'}
             </h2>
             {filter === 'foryou' && (
               <span className="flex items-center space-x-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100 animate-pulse">
                 <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 012.49-2.333c.556 0 1.058.209 1.44.554.505-.403 1.14-.639 1.835-.639.46 0 .893.11 1.28.303.414.207.766.52 1.025.903.26.383.425.845.425 1.348a3.1 3.1 0 01-.425 1.348 3.1 3.1 0 01-1.025.903c-.387.193-.82.303-1.28.303-.695 0-1.33-.236-1.835-.639-.382.345-.884.554-1.44.554-.556 0-1.058-.209-1.44-.554a3.1 3.1 0 01-1.835.639c-.46 0-.893-.11-1.28-.303a3.1 3.1 0 01-1.025-.903c-.26-.383-.425-.845-.425-1.348s.165-.965.425-1.348a3.1 3.1 0 011.025-.903c.387-.193.82-.303 1.28-.303.46 0 .893.11 1.28.303.414.207.766.52 1.025.903z" clipRule="evenodd" /></svg>
                 <span>Smart Match Active</span>
               </span>
             )}
          </div>
          <p className="text-slate-500 font-medium">
            {filter === 'foryou' ? 'Our algorithm found these relevant matches for you' : 'Find your soulmate in Tanzania • Instant HD Video Calls'}
          </p>
        </div>
        <div className="flex bg-white rounded-2xl p-1.5 border shadow-sm self-stretch md:self-auto overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setFilter('foryou')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filter === 'foryou' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            For You
          </button>
          <button 
            onClick={() => setFilter('all')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filter === 'all' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('online')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center space-x-2 whitespace-nowrap ${filter === 'online' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <span>Online</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filter === 'online' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
              {onlineCount}
            </span>
          </button>
          <button 
            onClick={() => setFilter('liked')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center space-x-2 whitespace-nowrap ${filter === 'liked' ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <span>Liked</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filter === 'liked' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
              {likedCount}
            </span>
          </button>
        </div>
      </div>

      {displayUsers.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-white rounded-[3rem] border border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-slate-900 font-bold">
              {filter === 'liked' ? 'You haven\'t liked anyone yet' : 'No users found'}
            </p>
            <p className="text-slate-500 text-sm">
              Try switching filters to see more people.
            </p>
          </div>
          <button 
            onClick={() => setFilter('all')}
            className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all"
          >
            Show All Users
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayUsers.map(user => {
            const matchScore = (user as any).matchScore || calculateMatchScore(user);
            
            return (
              <div 
                key={user.id} 
                className={`group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border flex flex-col ${
                  user.role === UserRole.ADMIN ? 'border-slate-900 ring-2 ring-slate-900/5' : 'border-slate-100'
                }`}
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img 
                    src={user.photo} 
                    alt={user.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${user.role === UserRole.ADMIN ? 'from-slate-950/90' : 'from-black/90'} via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity`} />
                  
                  <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                    <div className="flex flex-col space-y-2">
                      {user.isOnline ? (
                        <span className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest">
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                          <span>Live Now</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-800/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest">
                          <span>Offline</span>
                        </span>
                      )}
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 text-center min-w-[70px] shadow-2xl">
                        <p className="text-[8px] font-black text-white/60 uppercase tracking-widest mb-0.5">Match</p>
                        <p className={`text-xl font-black ${matchScore >= 80 ? 'text-emerald-400' : matchScore >= 60 ? 'text-rose-400' : 'text-white'}`}>
                          {matchScore}%
                        </p>
                    </div>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-3xl font-black">{user.name}, {user.age}</h3>
                      {user.tier === UserTier.PREMIUM && (
                        <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-200 mt-2 font-medium">
                      <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                      <span>{user.location}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-4">
                      {user.interests.slice(0, 3).map(interest => {
                        const isShared = currentUser.interests.some(i => i.toLowerCase() === interest.toLowerCase());
                        return (
                          <span key={interest} className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${isShared ? 'bg-rose-500 text-white' : 'bg-white/20 text-white/80'}`}>
                            {interest}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className={`p-8 flex-1 flex flex-col ${user.role === UserRole.ADMIN ? 'bg-slate-50' : ''}`}>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium line-clamp-2 italic">
                    "{user.bio}"
                  </p>
                  
                  <div className="flex space-x-4 mt-auto">
                    <button 
                      onClick={() => onStartCall(user)}
                      className={`flex-[2.5] flex items-center justify-center space-x-3 py-5 rounded-2xl text-white font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl hover:-translate-y-1 active:scale-95 ${
                        user.role === UserRole.ADMIN ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' : 'bg-rose-500 hover:bg-rose-600 shadow-rose-200'
                      }`}
                    >
                      <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      <span>Instant Call</span>
                    </button>

                    <button 
                      onClick={() => onMessageUser(user.id)}
                      className="flex-1 flex items-center justify-center py-5 rounded-2xl transition-all border-2 bg-white border-slate-100 text-slate-400 hover:border-indigo-100 hover:text-indigo-500"
                      title="Send Direct Message"
                    >
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                    </button>
                    
                    <button 
                      onClick={() => handleLike(user)}
                      disabled={likedIds.has(user.id)}
                      className={`flex-1 flex items-center justify-center py-5 rounded-2xl transition-all border-2 ${
                        likedIds.has(user.id) 
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-500' 
                          : 'bg-white border-slate-100 text-slate-300 hover:border-rose-100 hover:text-rose-500'
                      }`}
                    >
                      <svg className="w-7 h-7" fill={likedIds.has(user.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Discovery;
