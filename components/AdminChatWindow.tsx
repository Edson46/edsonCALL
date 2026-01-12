
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, UserRole, AdminChatMessage } from '../types';

interface AdminChatWindowProps {
  currentUser: UserProfile;
  messages: AdminChatMessage[];
  onSendMessage: (text: string) => void;
  targetUser?: UserProfile;
  isUserMode?: boolean;
}

const AdminChatWindow: React.FC<AdminChatWindowProps> = ({ currentUser, messages, onSendMessage, targetUser, isUserMode = false }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // The admin interface should look like a command center
  const isAdmin = currentUser.role === UserRole.ADMIN && !isUserMode;

  return (
    <div className={`flex flex-col h-full ${isAdmin ? 'bg-slate-950' : 'bg-white'}`}>
      {/* Header */}
      <div className={`p-6 border-b flex items-center justify-between ${isAdmin ? 'border-amber-500/20 bg-slate-900' : 'border-slate-100 bg-slate-50'}`}>
        <div className="flex items-center space-x-4">
          <div className="relative">
            {isAdmin ? (
              <img src={targetUser?.photo} className="w-12 h-12 rounded-xl object-cover border border-amber-500/30" alt="User" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-amber-400 border border-amber-500/30">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
          </div>
          <div>
            <h3 className={`text-sm font-black uppercase tracking-widest ${isAdmin ? 'text-white' : 'text-slate-900'}`}>
              {isAdmin ? `Chat with ${targetUser?.name}` : 'Edcall Official Support'}
            </h3>
            <p className={`text-[9px] font-black uppercase tracking-widest ${isAdmin ? 'text-amber-500/60' : 'text-emerald-500'}`}>
              {isAdmin ? `TERMINAL SESSION: ${targetUser?.id.toUpperCase()}` : 'Authorized Administrator Online'}
            </p>
          </div>
        </div>
        {isAdmin && (
           <div className="flex items-center space-x-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
              <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">SECURE CHANNEL</span>
           </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-40 space-y-4">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
            <p className="text-[10px] font-black uppercase tracking-widest">No previous correspondence</p>
          </div>
        )}
        {messages.map((msg) => {
          const isFromMe = msg.senderId === currentUser.id;
          const isFromAdmin = !isFromMe && !isAdmin;

          return (
            <div key={msg.id} className={`flex ${isFromMe ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
              <div className={`max-w-[80%] flex flex-col ${isFromMe ? 'items-end' : 'items-start'}`}>
                <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  isFromMe 
                    ? (isAdmin ? 'bg-amber-500 text-slate-950 font-bold rounded-tr-none' : 'bg-rose-500 text-white rounded-br-none') 
                    : (isFromAdmin 
                        ? 'bg-slate-900 text-amber-400 border border-amber-500/20 rounded-tl-none font-medium' 
                        : (isAdmin ? 'bg-slate-800 text-white rounded-tl-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'))
                }`}>
                  {isFromAdmin && (
                    <div className="flex items-center space-x-2 mb-1 border-b border-amber-500/20 pb-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      <span className="text-[9px] font-black uppercase tracking-widest">Official Support</span>
                    </div>
                  )}
                  {msg.text}
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isAdmin ? 'text-slate-600' : 'text-slate-400'}`}>
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`p-6 border-t ${isAdmin ? 'border-amber-500/20 bg-slate-900' : 'border-slate-100 bg-white'}`}>
        <div className="relative flex items-center space-x-4">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isAdmin ? "Enter system command or message..." : "Type your message to support..."}
            className={`flex-1 px-6 py-4 rounded-2xl text-sm font-medium outline-none transition-all ${
              isAdmin 
                ? 'bg-slate-950 border border-amber-500/30 text-amber-400 focus:border-amber-400 placeholder:text-amber-900' 
                : 'bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-rose-500/10'
            }`}
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={`p-4 rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50 ${
              isAdmin ? 'bg-amber-500 text-slate-950' : 'bg-rose-500 text-white'
            }`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
          </button>
        </div>
        {isAdmin && (
           <p className="mt-3 text-[8px] font-black text-amber-500/40 uppercase tracking-[0.4em] text-center">
             System Log: Message will be broadcast to target terminal
           </p>
        )}
      </div>
    </div>
  );
};

export default AdminChatWindow;
