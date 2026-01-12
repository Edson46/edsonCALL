
import React, { useState } from 'react';
import { UserProfile, UserRole, UserTier, Transaction, AdminChatMessage, VerificationStatus, Post, TransactionStatus, TransactionType } from '../types';
import AdminChatWindow from './AdminChatWindow';

interface AdminDashboardProps {
  adminUser: UserProfile;
  allUsers: UserProfile[];
  posts: Post[];
  transactions: Transaction[];
  adminMessages: AdminChatMessage[];
  onApproveTransaction: (txId: string) => void;
  onRejectTransaction: (txId: string) => void;
  onForceCall: (user: UserProfile) => void;
  onSendAdminMessage: (text: string, receiverId: string) => void;
  onUpdateUser: (userId: string, updates: Partial<UserProfile>) => void;
  onVerifyUser: (userId: string, status: VerificationStatus) => void;
  onToggleFeatured: (postId: string) => void;
  onRemovePost: (postId: string) => void;
  onBlockUser: (userId: string) => void;
  onRemoveUser: (userId: string) => void;
  onRefillTrials: (userId: string) => void;
  onBroadcast: (message: string | null) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  adminUser, 
  allUsers, 
  posts,
  transactions, 
  adminMessages,
  onApproveTransaction, 
  onRejectTransaction,
  onForceCall, 
  onSendAdminMessage,
  onUpdateUser,
  onVerifyUser,
  onToggleFeatured,
  onRemovePost,
  onBlockUser,
  onRemoveUser,
  onRefillTrials,
  onBroadcast 
}) => {
  const [activeView, setActiveView] = useState<'stats' | 'users' | 'posts' | 'verification' | 'userVerification' | 'transactions' | 'chats' | 'security'>('stats');
  const [selectedChatUser, setSelectedChatUser] = useState<UserProfile | null>(null);
  const [zoomId, setZoomId] = useState<string | null>(null);

  const [txSearch, setTxSearch] = useState('');
  const [txStatusFilter, setTxStatusFilter] = useState<TransactionStatus | 'ALL'>('ALL');
  const [txTypeFilter, setTxTypeFilter] = useState<TransactionType | 'ALL'>('ALL');

  const pendingPayments = transactions.filter(tx => tx.status === 'PENDING');
  const pendingVerifications = allUsers.filter(u => u.verificationStatus === 'PENDING');

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.userName.toLowerCase().includes(txSearch.toLowerCase()) || 
                         tx.userId.includes(txSearch) || 
                         tx.reference?.toLowerCase().includes(txSearch.toLowerCase());
    const matchesStatus = txStatusFilter === 'ALL' || tx.status === txStatusFilter;
    const matchesType = txTypeFilter === 'ALL' || tx.type === txTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  return (
    <div className="space-y-8 animate-fadeIn pb-24">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-amber-400 shadow-xl border border-amber-400/20">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Master Console</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Logged in as {adminUser.name}</p>
          </div>
        </div>

        <div className="flex bg-white rounded-2xl p-1 border shadow-sm overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveView('stats')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'stats' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Summary</button>
          <button onClick={() => setActiveView('users')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'users' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Users</button>
          <button onClick={() => setActiveView('posts')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'posts' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Posts</button>
          <button onClick={() => setActiveView('verification')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'verification' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'} relative`}>
            Approvals
            {pendingPayments.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[9px] font-black flex items-center justify-center rounded-full animate-bounce shadow-lg">{pendingPayments.length}</span>}
          </button>
          <button onClick={() => setActiveView('transactions')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'transactions' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Ledger</button>
          <button onClick={() => setActiveView('userVerification')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'userVerification' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'} relative`}>
            ID Verify
            {pendingVerifications.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center rounded-full animate-bounce shadow-lg">{pendingVerifications.length}</span>}
          </button>
          <button onClick={() => setActiveView('chats')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'chats' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Chats</button>
        </div>
      </div>

      {activeView === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fadeIn">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Revenue (TZS)</p>
            <p className="text-4xl font-black text-slate-900">{transactions.filter(tx => tx.status === 'COMPLETED').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</p>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Member Count</p>
            <p className="text-4xl font-black text-slate-900">{allUsers.length}</p>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pending Cash</p>
            <p className="text-4xl font-black text-rose-500">{pendingPayments.length}</p>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pending IDs</p>
            <p className="text-4xl font-black text-emerald-500">{pendingVerifications.length}</p>
          </div>
        </div>
      )}

      {activeView === 'users' && (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden animate-scaleIn">
          <div className="p-10 border-b bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-xl font-black italic uppercase tracking-tighter">Manage Users</h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Active: {allUsers.filter(u => !u.isBlocked).length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-6 text-left">User</th>
                  <th className="px-8 py-6 text-left">Location</th>
                  <th className="px-8 py-6 text-center">Tier / Status</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allUsers.map(user => (
                  <tr key={user.id} className={user.isBlocked ? 'bg-slate-50 opacity-60' : ''}>
                    <td className="px-8 py-6 flex items-center space-x-3">
                      <img src={user.photo} className="w-10 h-10 rounded-xl object-cover border border-slate-200" referrerPolicy="no-referrer" alt="" />
                      <div>
                        <p className="font-black text-sm">{user.name}</p>
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest">{user.role}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-medium text-slate-500">{user.location}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center space-y-1">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${user.tier === UserTier.PREMIUM ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                          {user.tier}
                        </span>
                        {user.trialCallsRemaining >= 0 && user.tier === UserTier.FREE && (
                          <span className={`text-[8px] font-black uppercase ${user.trialCallsRemaining === 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {user.trialCallsRemaining} Trials Left
                          </span>
                        )}
                        {user.isBlocked && <span className="text-[8px] font-black text-rose-500 uppercase">Blocked</span>}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right space-x-2">
                      <button 
                        onClick={() => onRefillTrials(user.id)}
                        disabled={user.id === adminUser.id || user.tier === UserTier.PREMIUM}
                        className="px-4 py-2 bg-indigo-500 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-md active:scale-95 disabled:opacity-30"
                        title="Allow 3 More Trials"
                      >
                        Refill Trials
                      </button>
                      <button 
                        onClick={() => onForceCall(user)}
                        disabled={user.isBlocked || user.id === adminUser.id}
                        className="px-4 py-2 bg-rose-500 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-rose-600 transition-all shadow-md active:scale-95 disabled:opacity-30"
                      >
                        Call
                      </button>
                      <button 
                        onClick={() => onBlockUser(user.id)}
                        disabled={user.id === adminUser.id}
                        className={`px-4 py-2 text-[10px] font-black rounded-xl uppercase tracking-widest transition-all ${
                          user.isBlocked ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-900 hover:bg-slate-950 hover:text-white'
                        } disabled:opacity-30`}
                      >
                        {user.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                      <button 
                        onClick={() => onRemoveUser(user.id)}
                        disabled={user.id === adminUser.id}
                        className="px-4 py-2 bg-rose-500 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-black transition-all disabled:opacity-30"
                      >
                        Purge
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeView === 'posts' && (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden animate-scaleIn">
          <div className="p-10 border-b bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-xl font-black italic uppercase tracking-tighter">Manage Feed Posts</h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Posts: {posts.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-6 text-left">Author</th>
                  <th className="px-8 py-6 text-left">Content Preview</th>
                  <th className="px-8 py-6 text-center">Status</th>
                  <th className="px-8 py-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {posts.map(post => (
                  <tr key={post.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-6 flex items-center space-x-3">
                      <img src={post.userPhoto} className="w-8 h-8 rounded-lg object-cover border border-slate-200" referrerPolicy="no-referrer" alt="" />
                      <span className="font-black text-sm">{post.userName}</span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs text-slate-500 truncate max-w-xs">{post.content}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center space-y-1">
                        {post.featured ? (
                          <span className="px-3 py-1 bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-widest rounded-full">Featured</span>
                        ) : (
                          <span className="px-3 py-1 bg-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-full">Standard</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right space-x-2">
                      <button 
                        onClick={() => onToggleFeatured(post.id)} 
                        className={`px-4 py-2 text-[10px] font-black rounded-xl uppercase tracking-widest transition-all ${
                          post.featured ? 'bg-slate-900 text-white hover:bg-rose-500' : 'bg-amber-400 text-slate-900 hover:bg-slate-900 hover:text-white'
                        }`}
                      >
                        {post.featured ? 'Unfeature' : 'Feature'}
                      </button>
                      <button 
                        onClick={() => onRemovePost(post.id)}
                        className="px-4 py-2 bg-rose-500 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-black transition-all"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs italic">All feed cleared</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeView === 'transactions' && (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden animate-scaleIn">
          <div className="p-10 border-b bg-slate-50/50 space-y-6">
            <h3 className="text-xl font-black italic uppercase tracking-tighter">Complete Transaction History</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search user, ID or reference..."
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all"
                />
                <svg className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              
              <select 
                value={txTypeFilter}
                onChange={(e) => setTxTypeFilter(e.target.value as any)}
                className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest outline-none focus:border-amber-400"
              >
                <option value="ALL">All Types</option>
                <option value="SUBSCRIPTION">Monthly Gold</option>
                <option value="WEEKLY_PASS">Weekly Pass</option>
                <option value="MINUTES_PURCHASE">Minutes</option>
                <option value="WITHDRAWAL">Withdrawals</option>
              </select>

              <select 
                value={txStatusFilter}
                onChange={(e) => setTxStatusFilter(e.target.value as any)}
                className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest outline-none focus:border-amber-400"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest sticky top-0 z-10">
                <tr>
                  <th className="px-8 py-6 text-left">Date & Time</th>
                  <th className="px-8 py-6 text-left">User Details</th>
                  <th className="px-8 py-6 text-left">Category</th>
                  <th className="px-8 py-6 text-left">Amount</th>
                  <th className="px-8 py-6 text-left">Reference</th>
                  <th className="px-8 py-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs">No matching transactions found</td>
                  </tr>
                ) : (
                  filteredTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <p className="text-[10px] font-black text-slate-900">{new Date(tx.timestamp).toLocaleDateString()}</p>
                        <p className="text-[9px] font-bold text-slate-400">{new Date(tx.timestamp).toLocaleTimeString()}</p>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <p className="text-xs font-black text-slate-900">{tx.userName}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">ID: {tx.userId}</p>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">{tx.type.replace('_', ' ')}</span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap font-black text-xs text-slate-900">
                        {tx.amount.toLocaleString()} TZS
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <code className="bg-slate-100 px-2 py-1 rounded text-[10px] font-bold text-slate-600">{tx.reference || 'N/A'}</code>
                      </td>
                      <td className="px-8 py-6 text-center whitespace-nowrap">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          tx.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' :
                          tx.status === 'PENDING' ? 'bg-amber-100 text-amber-600 animate-pulse' :
                          'bg-rose-100 text-rose-600'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-8 bg-slate-50 border-t flex justify-between items-center">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing {filteredTransactions.length} of {transactions.length} records</p>
             <p className="text-xs font-black text-slate-900 uppercase italic">Total Volume: {filteredTransactions.filter(t => t.status === 'COMPLETED').reduce((s, c) => s + c.amount, 0).toLocaleString()} TZS</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
