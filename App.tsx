
import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, UserRole, UserTier, Post, PostVisibility, Comment, Transaction, AdminChatMessage, DirectMessage, VerificationStatus, Status } from './types';
import { MOCK_USERS, MOCK_POSTS, MOCK_TRANSACTIONS, MOCK_DMS, APP_NAME, EARNING_RATES, CURRENCY, PRICES } from './constants';
import Sidebar from './components/Sidebar';
import Discovery from './components/Discovery';
import Profile from './components/Profile';
import Earnings from './components/Earnings';
import AdminDashboard from './components/AdminDashboard';
import VideoCall from './components/VideoCall';
import Landing from './components/Landing';
import Posts from './components/Posts';
import PaymentModal from './components/PaymentModal';
import AdminChatWindow from './components/AdminChatWindow';
import Messages from './components/Messages';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'discovery' | 'posts' | 'messages' | 'profile' | 'earnings' | 'admin' | 'support'>('discovery');
  const [activeCall, setActiveCall] = useState<{ remoteUser: UserProfile; isIncoming: boolean } | null>(null);
  
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [statuses, setStatuses] = useState<Status[]>([
    {
      id: 's1',
      userId: '2',
      userName: 'Juma M.',
      userPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600',
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString()
    }
  ]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(MOCK_USERS);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>(MOCK_DMS);
  const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean, amount: number, type: any } | null>(null);
  const [adminMessages, setAdminMessages] = useState<AdminChatMessage[]>([]);
  const [focusedUserId, setFocusedUserId] = useState<string | null>(null);

  // Permission States
  const [hasCameraAccess, setHasCameraAccess] = useState<boolean | null>(null);

  const checkPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasCameraAccess(true);
    } catch (err) {
      console.error("Permission check failed:", err);
      setHasCameraAccess(false);
    }
  };

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  useEffect(() => {
    if (activeTab === 'admin' && !isAdmin && currentUser) {
      setActiveTab('discovery');
    }
  }, [activeTab, isAdmin, currentUser]);

  useEffect(() => {
    if (currentUser) {
      checkPermissions();
    }
  }, [currentUser]);

  const handleLogin = (role: UserRole) => {
    const user = role === UserRole.ADMIN ? allUsers.find(u => u.role === UserRole.ADMIN) : allUsers.find(u => u.id === '1');
    if (user) {
      if (user.isBlocked) {
        alert("Your account has been blocked by the admin.");
        return;
      }
      setCurrentUser(user);
      if (user.role === UserRole.ADMIN) setActiveTab('admin');
      else setActiveTab('discovery');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('discovery');
    setFocusedUserId(null);
  };

  const startCall = (remoteUser: UserProfile) => {
    if (!currentUser) return;
    if (remoteUser.isBlocked) {
      alert("This user is currently blocked.");
      return;
    }
    if (currentUser.role === UserRole.ADMIN && remoteUser.trialCallsRemaining > 0) {
      setAllUsers(prev => prev.map(u => u.id === remoteUser.id ? { ...u, trialCallsRemaining: u.trialCallsRemaining - 1 } : u));
    }
    setActiveCall({ remoteUser, isIncoming: false });
  };

  const handleStartMessage = (userId: string) => {
    setFocusedUserId(userId);
    setActiveTab('messages');
  };

  const handleSendDirectMessage = (receiverId: string, text: string) => {
    if (!currentUser) return;
    const newMessage: DirectMessage = {
      id: `dm-${Date.now()}`,
      senderId: currentUser.id,
      receiverId,
      text,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setDirectMessages(prev => [...prev, newMessage]);
  };

  const handleDeductPoints = (amount: number) => {
    if (!currentUser) return false;
    if (currentUser.points < amount) return false;

    const newPoints = currentUser.points - amount;
    setCurrentUser(prev => prev ? { ...prev, points: newPoints } : null);
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, points: newPoints } : u));
    
    // Log as transaction
    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      amount: amount,
      currency: 'TZS',
      type: 'MINUTES_PURCHASE',
      status: 'COMPLETED',
      provider: 'POINTS_BALANCE',
      timestamp: new Date().toISOString(),
      reference: 'IN_CALL_REDEEM'
    };
    setTransactions(prev => [tx, ...prev]);
    return true;
  };

  const handleTransaction = (tx: Transaction) => {
    setTransactions(prev => [tx, ...prev]);
  };

  const handleApproveTransaction = (txId: string) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;

    setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: 'COMPLETED' } : t));
    
    setAllUsers(prev => prev.map(u => {
      if (u.id === tx.userId) {
        let updatedUser = { ...u };
        if (tx.type === 'SUBSCRIPTION' || tx.type === 'WEEKLY_PASS') {
          updatedUser.tier = UserTier.PREMIUM;
        }
        return updatedUser;
      }
      return u;
    }));

    if (currentUser?.id === tx.userId) {
      setCurrentUser(prev => prev ? { ...prev, tier: UserTier.PREMIUM } : null);
    }
  };

  const handleVerifyUser = (userId: string, status: VerificationStatus) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, verificationStatus: status } : u));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, verificationStatus: status } : null);
    }
  };

  const handleToggleFeatured = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, featured: !p.featured } : p));
  };

  const handleRemovePost = useCallback((postId: string) => {
    if (window.confirm("Permanently remove this post from Edcall?")) {
      setPosts(prev => prev.filter(p => p.id !== postId));
    }
  }, []);

  const handleBlockUser = (userId: string) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u));
  };

  const handleRemoveUser = useCallback((userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (window.confirm(`PERMANENT ACTION: Are you absolutely sure you want to remove ${user?.name || 'this user'}? This will also delete all their posts and data.`)) {
      setAllUsers(prev => prev.filter(u => u.id !== userId));
      setPosts(prev => prev.filter(p => p.userId !== userId));
      setStatuses(prev => prev.filter(s => s.userId !== userId));
      alert(`${user?.name || 'User'} has been purged from the system.`);
    }
  }, [allUsers]);

  const handleRefillTrials = (userId: string) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, trialCallsRemaining: 3 } : u));
    alert("User's trial calls have been reset to 3.");
  };

  const handleSendAdminMessage = (text: string, receiverId: string) => {
    if (!currentUser) return;
    const newMessage: AdminChatMessage = {
      id: `am-${Date.now()}`,
      senderId: currentUser.id,
      receiverId,
      text,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setAdminMessages(prev => [...prev, newMessage]);
  };

  const handleAddStatus = (image: string) => {
    if (!currentUser) return;
    const newStatus: Status = {
      id: `s-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhoto: currentUser.photo,
      image,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString()
    };
    setStatuses(prev => [newStatus, ...prev]);
  };

  if (!currentUser) return <Landing onLogin={handleLogin} />;

  return (
    <div className={`flex h-screen overflow-hidden relative ${isAdmin ? 'bg-slate-100' : 'bg-slate-50'}`}>
      <Sidebar currentUser={currentUser} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 relative">
        <div className="max-w-7xl mx-auto px-6 py-8">
          
          {/* Permission Banner */}
          {hasCameraAccess === false && (
            <div className="mb-8 p-6 bg-rose-50 border-2 border-rose-200 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 animate-slideDown shadow-lg">
              <div className="flex items-center space-x-5 text-center md:text-left">
                <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xl">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <div>
                  <h3 className="text-xl font-black text-rose-900 uppercase italic tracking-tighter">Kamera Imefungwa!</h3>
                  <p className="text-rose-600 font-bold text-sm">Ruhusu kamera kwenye browser yako ili uweze kupiga simu za video.</p>
                </div>
              </div>
              <button 
                onClick={checkPermissions}
                className="px-10 py-4 bg-rose-600 text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 active:scale-95"
              >
                Ruhusu Sasa
              </button>
            </div>
          )}

          {activeTab === 'discovery' && (
            <Discovery 
              currentUser={currentUser} 
              users={allUsers}
              onStartCall={startCall} 
              onMessageUser={handleStartMessage}
              onLike={(u) => {}} 
              onToggleFollow={(id) => {}} 
            />
          )}
          {activeTab === 'posts' && (
            <Posts 
              currentUser={currentUser} 
              users={allUsers}
              posts={posts} 
              statuses={statuses}
              onAddStatus={handleAddStatus}
              followingIds={[]} 
              onCreatePost={() => {}} 
              onLikePost={() => {}} 
              onAddComment={() => {}} 
              onCallUser={startCall}
            />
          )}
          {activeTab === 'messages' && (
            <Messages 
              currentUser={currentUser}
              users={allUsers}
              messages={directMessages}
              onSendMessage={handleSendDirectMessage}
              onCallUser={startCall}
              initialUserId={focusedUserId || undefined}
            />
          )}
          {activeTab === 'earnings' && <Earnings user={currentUser} />}
          {activeTab === 'profile' && <Profile user={currentUser} onInitiatePayment={(amount, type) => setPaymentModal({ isOpen: true, amount, type })} />}
          {activeTab === 'support' && (
            <AdminChatWindow 
              currentUser={currentUser} 
              messages={adminMessages.filter(m => m.senderId === currentUser.id || m.receiverId === currentUser.id)}
              onSendMessage={(text) => handleSendAdminMessage(text, allUsers.find(u => u.role === UserRole.ADMIN)?.id || 'admin')}
              isUserMode={true}
            />
          )}
          {activeTab === 'admin' && isAdmin && (
            <AdminDashboard 
              adminUser={currentUser} 
              allUsers={allUsers}
              posts={posts}
              transactions={transactions}
              adminMessages={adminMessages}
              onApproveTransaction={handleApproveTransaction}
              onRejectTransaction={() => {}}
              onForceCall={startCall} 
              onSendAdminMessage={handleSendAdminMessage}
              onUpdateUser={() => {}}
              onVerifyUser={handleVerifyUser}
              onToggleFeatured={handleToggleFeatured}
              onRemovePost={handleRemovePost}
              onBlockUser={handleBlockUser}
              onRemoveUser={handleRemoveUser}
              onRefillTrials={handleRefillTrials}
              onBroadcast={() => {}}
            />
          )}
        </div>
      </main>

      {paymentModal && (
        <PaymentModal 
          isOpen={paymentModal.isOpen}
          onClose={() => setPaymentModal(null)}
          currentUser={currentUser}
          amount={paymentModal.amount}
          type={paymentModal.type}
          onPaymentInitiated={handleTransaction}
        />
      )}

      {activeCall && <VideoCall currentUser={currentUser} remoteUser={activeCall.remoteUser} isIncoming={activeCall.isIncoming} onDeductPoints={handleDeductPoints} onClose={() => setActiveCall(null)} />}
    </div>
  );
};

export default App;
