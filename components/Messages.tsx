
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { UserProfile, DirectMessage } from '../types';

interface MessagesProps {
  currentUser: UserProfile;
  users: UserProfile[];
  messages: DirectMessage[];
  onSendMessage: (receiverId: string, text: string) => void;
  onCallUser: (user: UserProfile) => void;
  initialUserId?: string;
}

const Messages: React.FC<MessagesProps> = ({ currentUser, users, messages, onSendMessage, onCallUser, initialUserId }) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(initialUserId || null);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialUserId) setSelectedUserId(initialUserId);
  }, [initialUserId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedUserId]);

  const conversationPartners = useMemo(() => {
    const partnerIds = new Set<string>();
    messages.forEach(m => {
      if (m.senderId === currentUser.id) partnerIds.add(m.receiverId);
      else partnerIds.add(m.senderId);
    });
    
    // Add initial user if it's not already in history
    if (initialUserId) partnerIds.add(initialUserId);

    return users.filter(u => partnerIds.has(u.id) && u.id !== currentUser.id);
  }, [messages, currentUser.id, users, initialUserId]);

  const currentMessages = useMemo(() => {
    if (!selectedUserId) return [];
    return messages.filter(m => 
      (m.senderId === currentUser.id && m.receiverId === selectedUserId) ||
      (m.senderId === selectedUserId && m.receiverId === currentUser.id)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [messages, selectedUserId, currentUser.id]);

  const selectedUser = useMemo(() => 
    users.find(u => u.id === selectedUserId), [users, selectedUserId]
  );

  const handleSend = () => {
    if (!inputText.trim() || !selectedUserId) return;
    onSendMessage(selectedUserId, inputText);
    setInputText('');
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] md:h-[calc(100vh-8rem)] bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden animate-scaleIn">
      {/* Inbox List */}
      <div className={`w-full md:w-80 border-r border-slate-100 flex flex-col ${selectedUserId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-8 border-b bg-slate-50/50">
          <h2 className="text-xl font-black italic uppercase tracking-tighter">My Inbox</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Direct Conversations</p>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {conversationPartners.length === 0 ? (
            <div className="p-10 text-center space-y-4 opacity-40">
              <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <p className="text-[10px] font-black uppercase tracking-widest">No messages yet</p>
            </div>
          ) : (
            conversationPartners.map(partner => (
              <button 
                key={partner.id}
                onClick={() => setSelectedUserId(partner.id)}
                className={`w-full p-6 flex items-center space-x-4 transition-all ${selectedUserId === partner.id ? 'bg-indigo-50 border-r-4 border-indigo-500' : 'hover:bg-slate-50'}`}
              >
                <div className="relative shrink-0">
                  <img src={partner.photo} className="w-12 h-12 rounded-2xl object-cover border border-slate-200" alt="" referrerPolicy="no-referrer" crossOrigin="anonymous" />
                  {partner.isOnline && <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate">{partner.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">Click to chat</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`flex-1 flex flex-col ${!selectedUserId ? 'hidden md:flex' : 'flex'}`}>
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="p-6 border-b flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-4">
                <button onClick={() => setSelectedUserId(null)} className="md:hidden p-2 text-slate-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="relative">
                  <img src={selectedUser.photo} className="w-12 h-12 rounded-xl object-cover border border-slate-200" alt="" referrerPolicy="no-referrer" crossOrigin="anonymous" />
                  {selectedUser.isOnline && <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{selectedUser.name}</h3>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${selectedUser.isOnline ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {selectedUser.isOnline ? 'Active Now' : 'Offline'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => onCallUser(selectedUser)}
                className="bg-rose-500 text-white p-4 rounded-2xl shadow-lg hover:bg-rose-600 transition-all active:scale-95 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">Call Now</span>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
              {currentMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-30">
                  <div className="w-20 h-20 rounded-[2rem] bg-indigo-50 flex items-center justify-center text-indigo-500">
                     <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black uppercase tracking-widest text-slate-900">Start Conversation</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest mt-2">Say habari to {selectedUser.name}</p>
                  </div>
                </div>
              ) : (
                currentMessages.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                      <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          isMe 
                            ? 'bg-rose-500 text-white rounded-br-none' 
                            : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                        }`}>
                          {msg.text}
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t bg-white">
              <div className="relative flex items-center space-x-3">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all"
                />
                <button 
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="p-4 bg-indigo-500 text-white rounded-2xl shadow-xl hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center space-y-8 p-10 text-center opacity-40">
             <div className="w-24 h-24 rounded-[3rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
               <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
             </div>
             <div className="max-w-xs">
                <p className="text-xl font-black uppercase italic tracking-tighter text-slate-900">Select a Conversation</p>
                <p className="text-xs font-bold uppercase tracking-widest mt-2">Chat with your matches and friends in Tanzania instantly.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
