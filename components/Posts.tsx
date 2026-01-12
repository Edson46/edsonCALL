
import React, { useState, useRef, useEffect } from 'react';
import { Post, UserProfile, UserRole, PostVisibility, Comment, Status } from '../types';
import { EARNING_RATES, CURRENCY, APP_NAME } from '../constants';

interface PostsProps {
  currentUser: UserProfile;
  users: UserProfile[];
  posts: Post[];
  statuses: Status[];
  onAddStatus: (image: string) => void;
  followingIds: string[];
  onCreatePost: (content: string, visibility: PostVisibility, image?: string) => void;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onCallUser: (user: UserProfile) => void;
}

const Posts: React.FC<PostsProps> = ({ currentUser, users, posts, statuses, onAddStatus, followingIds, onCreatePost, onLikePost, onAddComment, onCallUser }) => {
  const [activeFeed, setActiveFeed] = useState<'recent' | 'hot' | 'following'>('recent');
  const [showCreate, setShowCreate] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostVisibility, setNewPostVisibility] = useState<PostVisibility>('PUBLIC');
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [activeStatusUser, setActiveStatusUser] = useState<string | null>(null);
  const [statusProgress, setStatusProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const statusInputRef = useRef<HTMLInputElement>(null);
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState<string>('');

  useEffect(() => {
    if (shareToast) {
      const timer = setTimeout(() => setShareToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [shareToast]);

  // Handle status progress timer
  useEffect(() => {
    let timer: number;
    if (activeStatusUser) {
      setStatusProgress(0);
      timer = window.setInterval(() => {
        setStatusProgress(prev => {
          if (prev >= 100) {
            setActiveStatusUser(null);
            return 100;
          }
          return prev + 1;
        });
      }, 50); // 5 seconds total (100 * 50ms)
    }
    return () => clearInterval(timer);
  }, [activeStatusUser]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image is too large. Please select a file smaller than 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStatusUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onAddStatus(reader.result as string);
        setShareToast("Status updated! 🇹🇿");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim() && !selectedImage) return;
    onCreatePost(newPostContent, newPostVisibility, selectedImage);
    setNewPostContent('');
    setSelectedImage(undefined);
    setNewPostVisibility('PUBLIC');
    setShowCreate(false);
    setShareToast("Post created! +300 points earned.");
    setActiveFeed('recent');
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleShare = async (post: Post) => {
    const shareData = {
      title: `${post.userName} on ${APP_NAME}`,
      text: post.content,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareToast("Shared successfully!");
      } else {
        await navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
        setShareToast("Link copied to clipboard!");
      }
    } catch (err) {
      console.error('Error sharing:', err);
      try {
        await navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
        setShareToast("Link copied to clipboard!");
      } catch (clipErr) {
        setShareToast("Failed to share. Please try again.");
      }
    }
  };

  const handleAddComment = (postId: string) => {
    if (!newCommentText.trim()) return;
    onAddComment(postId, newCommentText);
    setNewCommentText('');
  };

  const filteredPosts = posts.filter(post => {
    if (currentUser.role === UserRole.ADMIN) return true;
    if (post.userId === currentUser.id) return true;
    if (post.visibility === 'FOLLOWERS') return followingIds.includes(post.userId);
    if (post.visibility === 'ADMIN_ONLY') return false;
    return true;
  }).filter(p => {
    if (activeFeed === 'hot') return p.isHot || p.likes > 20;
    if (activeFeed === 'following') return followingIds.includes(p.userId) || p.userId === currentUser.id;
    return true;
  }).sort((a, b) => {
    // Priority: Featured > Non-featured
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0; // Maintain relative order if both are same featured status
  });

  const getPostUser = (userId: string): UserProfile | undefined => users.find(u => u.id === userId);
  const isPostAdmin = (userId: string) => getPostUser(userId)?.role === UserRole.ADMIN;

  const getVisibilityIcon = (visibility: PostVisibility) => {
    switch(visibility) {
      case 'PUBLIC':
        return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>;
      case 'FOLLOWERS':
        return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" /></svg>;
      case 'ADMIN_ONLY':
        return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
    }
  };

  const getVisibilityLabel = (visibility: PostVisibility) => {
    switch(visibility) {
      case 'PUBLIC': return 'Public';
      case 'FOLLOWERS': return 'Followers Only';
      case 'ADMIN_ONLY': return 'Admin Only';
    }
  };

  // Group statuses by user, only for users who aren't blocked/removed
  const groupedStatuses = statuses.reduce((acc, status) => {
    const user = getPostUser(status.userId);
    if (!user || user.isBlocked) return acc;
    
    if (!acc[status.userId]) {
      acc[status.userId] = [];
    }
    acc[status.userId].push(status);
    return acc;
  }, {} as Record<string, Status[]>);

  const statusList = Object.values(groupedStatuses).map(group => group[0]);
  const activeStatus = activeStatusUser ? groupedStatuses[activeStatusUser]?.[0] : null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn pb-24 relative">
      {shareToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] animate-slideDown">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs font-black uppercase tracking-widest">{shareToast}</p>
          </div>
        </div>
      )}

      {/* Status Viewer Overlay */}
      {activeStatus && (
        <div className="fixed inset-0 z-[300] bg-black flex flex-col items-center justify-center animate-fadeIn">
          <div className="absolute top-0 left-0 w-full h-1.5 flex px-2 pt-4 space-x-1 z-50">
            <div className="flex-1 h-full bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white transition-all duration-50" style={{ width: `${statusProgress}%` }} />
            </div>
          </div>
          <div className="absolute top-8 left-6 flex items-center space-x-3 z-50">
            <img src={activeStatus.userPhoto} className="w-10 h-10 rounded-full border-2 border-white object-cover" referrerPolicy="no-referrer" crossOrigin="anonymous" alt={activeStatus.userName} />
            <span className="text-white font-black text-sm uppercase tracking-widest">{activeStatus.userName}</span>
          </div>
          <button 
            onClick={() => setActiveStatusUser(null)}
            className="absolute top-8 right-6 text-white/50 hover:text-white z-50 p-2"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <img src={activeStatus.image} className="max-w-full max-h-screen object-contain" referrerPolicy="no-referrer" crossOrigin="anonymous" alt="Status" />
        </div>
      )}

      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-10 p-2"
            onClick={(e) => { e.stopPropagation(); setLightboxImage(null); }}
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <img src={lightboxImage} className="max-w-full max-h-[90vh] rounded-3xl shadow-2xl animate-scaleIn object-contain" alt="Lightbox" onClick={(e) => e.stopPropagation()} referrerPolicy="no-referrer" crossOrigin="anonymous" />
        </div>
      )}

      {/* Stories Section */}
      <div className="flex space-x-5 overflow-x-auto no-scrollbar py-2 px-1">
        <div className="flex flex-col items-center space-y-2 shrink-0">
          <input type="file" ref={statusInputRef} onChange={handleStatusUpload} accept="image/*" className="hidden" />
          <button 
            onClick={() => statusInputRef.current?.click()}
            className="w-16 h-16 rounded-full border-2 border-dashed border-rose-400 flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors bg-white shadow-sm"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
          </button>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Add Status</span>
        </div>
        
        {statusList.map((status) => (
          <div 
            key={status.id} 
            onClick={() => setActiveStatusUser(status.userId)}
            className="flex flex-col items-center space-y-2 shrink-0 group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full p-0.5 border-2 border-rose-500 bg-white">
              <img src={status.userPhoto} className="w-full h-full rounded-full object-cover group-hover:scale-110 transition-transform" alt={status.userName} referrerPolicy="no-referrer" crossOrigin="anonymous" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{status.userName.split(' ')[0]}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center sticky top-4 z-20 md:static">
        <div className="flex bg-white/80 backdrop-blur-md rounded-2xl p-1 border shadow-xl shadow-slate-200/50 overflow-x-auto no-scrollbar max-w-[calc(100%-80px)]">
          {(['recent', 'hot', 'following'] as const).map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveFeed(tab)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${activeFeed === tab ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <button 
          onClick={() => setShowCreate(true)}
          className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-black transition-all shadow-xl hover:-translate-y-1 active:scale-95"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>

      {showCreate && (
        <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 shadow-2xl animate-scaleIn">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 italic">Share your moment</h3>
            <div className="flex items-center space-x-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visibility:</span>
               <select 
                value={newPostVisibility}
                onChange={(e) => setNewPostVisibility(e.target.value as PostVisibility)}
                className="bg-transparent text-[10px] font-black uppercase text-rose-500 focus:outline-none cursor-pointer"
               >
                 <option value="PUBLIC">🌍 Public</option>
                 <option value="FOLLOWERS">👥 Followers Only</option>
                 <option value="ADMIN_ONLY">🛡️ Admin Only</option>
               </select>
            </div>
          </div>

          <textarea 
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="Habari! What's happening in your world? 🇹🇿"
            className="w-full h-32 p-6 bg-slate-50 rounded-[2rem] border border-slate-200 focus:ring-4 focus:ring-rose-500/10 outline-none resize-none text-lg font-medium"
          />
          
          {selectedImage && (
            <div className="mt-4 relative rounded-[2.5rem] overflow-hidden border border-slate-200 group bg-slate-100 shadow-inner">
              <img src={selectedImage} className="w-full max-h-[400px] object-contain mx-auto" alt="Preview" />
              <button 
                onClick={() => { setSelectedImage(undefined); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                className="absolute top-4 right-4 p-3 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-all shadow-xl"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}

          <div className="flex justify-between items-center mt-8">
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-4 text-slate-400 hover:text-rose-500 transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-rose-50 group-hover:border-rose-100 transition-all">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div className="text-left">
                <span className="block text-[10px] font-black uppercase tracking-widest">{selectedImage ? 'Change Image' : 'Add Photo'}</span>
                <span className="block text-[8px] text-emerald-500 font-bold uppercase">+300 Points Reward</span>
              </div>
            </button>
            <div className="flex space-x-4">
              <button onClick={() => setShowCreate(false)} className="px-6 py-2 text-slate-400 font-black uppercase text-[10px] tracking-widest">Cancel</button>
              <button 
                onClick={handleCreatePost}
                disabled={!newPostContent.trim() && !selectedImage}
                className="px-10 py-4 bg-rose-500 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-rose-600 shadow-xl shadow-rose-200 transition-all active:scale-95 disabled:opacity-50"
              >
                Post Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-12">
        {filteredPosts.length === 0 ? (
          <div className="py-32 text-center space-y-4 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <p className="text-slate-900 font-black uppercase tracking-widest">Feed is Quiet</p>
            <button onClick={() => setActiveFeed('recent')} className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black">Explore Recent</button>
          </div>
        ) : (
          filteredPosts.map(post => {
            const isAdmin = isPostAdmin(post.userId);
            const isCommentsExpanded = expandedCommentsPostId === post.id;
            const postUser = getPostUser(post.userId);
            
            return (
              <div 
                key={post.id} 
                className={`bg-white rounded-[3.5rem] overflow-hidden border shadow-sm hover:shadow-2xl transition-all duration-700 group relative ${isAdmin ? 'border-slate-900' : 'border-slate-100'} ${post.featured ? 'ring-4 ring-amber-400/20 scale-[1.01]' : ''}`}
              >
                {/* Featured Badge */}
                {post.featured && (
                  <div className="absolute top-10 right-10 z-30 pointer-events-none animate-bounce">
                    <div className="bg-amber-400 text-slate-950 px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-2xl flex items-center space-x-2 border-2 border-slate-950">
                       <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                       <span>Featured Post</span>
                    </div>
                  </div>
                )}

                <div className={`p-8 flex items-center justify-between ${isAdmin ? 'bg-slate-900 text-white' : ''}`}>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img 
                        src={post.userPhoto} 
                        className={`w-14 h-14 rounded-2xl object-cover border-2 ${isAdmin ? 'border-amber-400' : 'border-slate-50'}`} 
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        alt={post.userName}
                      />
                      {(post.isHot || isAdmin) && (
                        <div className={`absolute -top-2 -right-2 ${isAdmin ? 'bg-amber-400' : 'bg-rose-500'} text-white p-1 rounded-full shadow-lg border-2 ${isAdmin ? 'border-slate-900' : 'border-white'}`}>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" /></svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className={`text-base font-black ${isAdmin ? 'text-white' : 'text-slate-900'}`}>{post.userName}</h4>
                        <div className={`flex items-center space-x-1.5 text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${
                          post.visibility === 'ADMIN_ONLY' 
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' 
                            : isAdmin ? 'bg-white/10 border-white/20 text-white' : 'bg-slate-100 border-slate-200 text-slate-500'
                        }`}>
                          {getVisibilityIcon(post.visibility)}
                          <span>{getVisibilityLabel(post.visibility)}</span>
                        </div>
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{post.timestamp}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {postUser && postUser.id !== currentUser.id && (
                      <button 
                        onClick={() => onCallUser(postUser)}
                        className={`p-4 rounded-2xl shadow-lg transition-all active:scale-90 ${isAdmin ? 'bg-amber-400 text-slate-950' : 'bg-rose-500 text-white hover:bg-rose-600'}`}
                        title="Instant Video Call"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      </button>
                    )}
                    <button className={`${isAdmin ? 'text-slate-500 hover:text-white' : 'text-slate-300 hover:text-slate-600'}`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                    </button>
                  </div>
                </div>

                <div className="px-10 py-6">
                  <p className="text-slate-700 text-lg leading-relaxed font-medium whitespace-pre-wrap italic">{post.content}</p>
                </div>

                {post.image && (
                  <div className="relative w-full overflow-hidden cursor-zoom-in bg-slate-50 group-hover:shadow-inner" onClick={() => setLightboxImage(post.image!)}>
                     <img src={post.image} className="w-full object-cover max-h-[600px] group-hover:scale-[1.02] transition-transform duration-1000" alt="Post" referrerPolicy="no-referrer" crossOrigin="anonymous" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                        <div className="bg-white/20 backdrop-blur-xl px-6 py-3 rounded-full text-white text-xs font-black uppercase tracking-widest border border-white/20">
                          View Full HD 🇹🇿
                        </div>
                     </div>
                  </div>
                )}

                <div className="p-10 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center space-x-12">
                    <button onClick={() => onLikePost(post.id)} className="flex items-center space-x-3 text-slate-400 hover:text-rose-500 transition-all group/btn">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/btn:shadow-rose-100 group-hover/btn:border-rose-100">
                        <svg className="w-7 h-7 group-hover/btn:scale-125 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                      </div>
                      <span className="text-sm font-black italic">{post.likes.toLocaleString()}</span>
                    </button>
                    <button 
                      onClick={() => setExpandedCommentsPostId(isCommentsExpanded ? null : post.id)}
                      className={`flex items-center space-x-3 transition-all group/btn ${isCommentsExpanded ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-500'}`}
                    >
                      <div className={`w-14 h-14 rounded-2xl bg-white border flex items-center justify-center shadow-sm ${isCommentsExpanded ? 'border-indigo-200 bg-indigo-50' : 'border-slate-100'}`}>
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      </div>
                      <span className="text-sm font-black italic">{post.comments.toLocaleString()}</span>
                    </button>
                  </div>
                  <button onClick={() => handleShare(post)} className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm text-slate-400 hover:text-emerald-500 hover:shadow-emerald-100">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                  </button>
                </div>

                {isCommentsExpanded && (
                  <div className="border-t border-slate-100 animate-fadeIn p-8 bg-slate-50/20">
                    <div className="space-y-6 mb-8">
                      {post.commentsList && post.commentsList.length > 0 ? (
                        post.commentsList.map((comment) => (
                          <div key={comment.id} className="flex space-x-4 group/comment">
                            <img src={comment.userPhoto} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200" referrerPolicy="no-referrer" crossOrigin="anonymous" alt={comment.userName} />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-black text-slate-900">{comment.userName}</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{comment.timestamp}</span>
                              </div>
                              <p className="text-sm text-slate-600 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm leading-relaxed">
                                {comment.text}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center text-slate-400">
                          <p className="text-[10px] font-black uppercase tracking-widest">No comments yet. Be the first!</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      <img src={currentUser.photo} className="w-10 h-10 rounded-xl object-cover border border-slate-200" referrerPolicy="no-referrer" crossOrigin="anonymous" alt="Me" />
                      <div className="flex-1 relative">
                        <input 
                          type="text"
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                          placeholder="Write a comment..."
                          className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-3 text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all shadow-inner"
                        />
                        <button 
                          onClick={() => handleAddComment(post.id)}
                          disabled={!newCommentText.trim()}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-500 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-indigo-500 transition-colors"
                        >
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Posts;
