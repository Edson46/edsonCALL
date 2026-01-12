
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, UserTier, UserRole } from '../types';
import { CURRENCY, PRICES, APP_NAME } from '../constants';
import { PaymentService } from '../services/PaymentService';

interface VideoCallProps {
  currentUser: UserProfile;
  remoteUser: UserProfile;
  isIncoming: boolean;
  onDeductPoints: (amount: number) => boolean;
  onClose: () => void;
  isAdminMonitor?: boolean;
}

const VideoCall: React.FC<VideoCallProps> = ({ currentUser, remoteUser, isIncoming, onDeductPoints, onClose, isAdminMonitor = false }) => {
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isRecording, setIsRecording] = useState(true); 
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isRemoteTyping, setIsRemoteTyping] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ sender: string; text: string; timestamp: Date; senderId: string }[]>([
    { sender: remoteUser.name, text: "Habari! Nice to meet you.", timestamp: new Date(Date.now() - 1000 * 60), senderId: remoteUser.id }
  ]);
  const [inputValue, setInputValue] = useState("");
  
  const [minutesToBuy, setMinutesToBuy] = useState(10);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const isAdmin = currentUser.role === UserRole.ADMIN;
  const isPremium = currentUser.tier === UserTier.PREMIUM;
  const isTrial = currentUser.tier === UserTier.FREE && currentUser.trialCallsRemaining > 0;
  
  // Set limit: 24h for admin/premium, 60m for trial, 1s (to trigger prompt) for others
  const [currentLimit, setCurrentLimit] = useState(isAdmin || isPremium ? 86400 : (isTrial ? 3600 : 1));

  const setupMedia = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }
      setPermissionError(null);
    } catch (err: any) {
      console.error("Error accessing media devices:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError("Tafadhali ruhusu kamera na maikrofoni ili uweze kupiga simu.");
      } else {
        setPermissionError("Hitilafu ya kamera: " + (err.message || "Unknown error"));
      }
    }
  };

  useEffect(() => {
    setupMedia();

    const timer = setInterval(() => {
      setSeconds(prev => {
        // Only stop if NOT admin AND NOT premium
        if (!isAdmin && !isPremium && prev >= currentLimit) {
          setIsTimeUp(true);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      stopAllStreams();
    };
  }, [currentLimit, isAdmin, isPremium]);

  useEffect(() => {
    if (showChat) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setUnreadCount(0);
    } else if (messages.length > 0 && messages[messages.length - 1].senderId !== currentUser.id) {
      setUnreadCount(prev => prev + 1);
    }
  }, [messages, showChat]);

  // Simulate remote user typing occasionally
  useEffect(() => {
    const typingTimer = setInterval(() => {
      if (Math.random() > 0.8) {
        setIsRemoteTyping(true);
        setTimeout(() => setIsRemoteTyping(false), 3000);
      }
    }, 10000);
    return () => clearInterval(typingTimer);
  }, []);

  const stopAllStreams = () => {
    stream?.getTracks().forEach(track => track.stop());
    setStream(null);
  };

  const handleWhatsAppPayment = async () => {
    setIsRedirecting(true);
    const amount = minutesToBuy * PRICES.PER_MINUTE;
    const reference = `MINUTES_PURCHASE_${currentUser.id}_${Date.now()}`;
    
    await PaymentService.initiateWhatsAppPayment(
      currentUser.phone || 'NO_PHONE_PROVIDED',
      amount,
      reference
    );
    
    setTimeout(() => setIsRedirecting(false), 2000);
  };

  const handlePayWithPoints = () => {
    const pointsNeeded = 5000; // 10 minutes x 500
    if (currentUser.points < pointsNeeded) {
      alert(`Huna pointi za kutosha. Unahitaji angalau 5,000 pts. (Salio lako: ${currentUser.points} pts)`);
      return;
    }

    if (onDeductPoints(pointsNeeded)) {
      setIsTimeUp(false);
      setCurrentLimit(prev => prev + 600); // Add 10 minutes
      alert("Heko! Umetumia pointi zako kuongeza dakika 10 za maongezi.");
    }
  };

  const handleDemoUnlock = () => {
    setIsTimeUp(false);
    setSeconds(0);
    setCurrentLimit(3600); // Add another 60 minutes for demo
    alert("DEMO MODE: Payment Simulated. 60 Minutes Added.");
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    setMessages(prev => [...prev, { sender: currentUser.name, text: inputValue, timestamp: new Date(), senderId: currentUser.id }]);
    setInputValue("");
    
    if (!isAdmin) {
      setTimeout(() => {
        setIsRemoteTyping(true);
        setTimeout(() => {
          setIsRemoteTyping(false);
          setMessages(prev => [...prev, { sender: remoteUser.name, text: "Okay, sounds great! 😊", timestamp: new Date(), senderId: remoteUser.id }]);
        }, 2000);
      }, 1000);
    }
  };

  const toggleRecording = () => {
    const nextState = !isRecording;
    if (nextState) {
      const consent = window.confirm("Recording requires consent from all parties. Do you have consent to record this session?");
      if (!consent) return;
    }
    setIsRecording(nextState);
  };

  if (permissionError) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 p-4 animate-fadeIn">
        <div className="bg-white rounded-[3rem] p-10 max-w-md w-full text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900">Ruhusu Kamera</h2>
          <p className="text-slate-500 font-medium">{permissionError}</p>
          <div className="pt-4 space-y-3">
            <button onClick={setupMedia} className="w-full py-4 bg-rose-500 text-white font-black rounded-2xl uppercase tracking-widest shadow-lg hover:bg-rose-600 transition-all">Jaribu Tena</button>
            <button onClick={onClose} className="w-full py-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Ghairi</button>
          </div>
        </div>
      </div>
    );
  }

  if (isTimeUp && !isAdmin && !isPremium) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/98 backdrop-blur-3xl animate-fadeIn p-4 overflow-y-auto">
        <div className="bg-white rounded-[3.5rem] p-6 md:p-14 max-w-2xl w-full text-center space-y-8 shadow-[0_0_100px_rgba(0,0,0,0.4)] animate-scaleIn relative">
          <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-rose-600 via-orange-500 to-rose-600 animate-pulse" />
          
          <div className="space-y-4">
            <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto text-rose-600 border border-rose-100 shadow-inner">
               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter italic uppercase">Muda Umekwisha</h2>
            <p className="text-slate-500 font-bold max-w-md mx-auto">Muda wako wa bure umekwisha. Nunua dakika za ziada au tumia pointi zako kuendelea kuongea na {remoteUser.name}.</p>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 p-6 rounded-[2.5rem] border-2 border-slate-100">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Chagua Dakika:</p>
               <div className="grid grid-cols-3 gap-3">
                {[10, 30, 60].map(mins => (
                  <button 
                    key={mins}
                    onClick={() => setMinutesToBuy(mins)}
                    className={`py-5 rounded-3xl border-2 transition-all font-black uppercase text-sm tracking-widest ${minutesToBuy === mins ? 'border-rose-500 bg-white text-rose-600 shadow-xl scale-105' : 'border-white bg-white text-slate-300 shadow-sm'}`}
                  >
                    {mins} MINS
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <button 
                onClick={handleWhatsAppPayment}
                disabled={isRedirecting}
                className="w-full py-6 bg-emerald-500 text-white font-black rounded-[2rem] shadow-lg hover:bg-emerald-600 transition-all uppercase tracking-widest text-xs flex items-center justify-center space-x-3"
              >
                {isRedirecting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Lipia {CURRENCY} {(minutesToBuy * PRICES.PER_MINUTE).toLocaleString()}</span>
                )}
              </button>

              <button 
                onClick={handlePayWithPoints}
                className="w-full py-6 bg-rose-600 text-white font-black rounded-[2rem] shadow-lg hover:bg-rose-700 transition-all uppercase tracking-widest text-xs flex flex-col items-center justify-center leading-tight"
              >
                <span>Tumia Pointi</span>
                <span className="text-[10px] opacity-70">(-5,000 Pts kwa Dakika 10)</span>
              </button>
            </div>
            
            <button 
              onClick={handleDemoUnlock}
              className="w-full py-4 bg-slate-100 text-slate-500 font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all border border-slate-200"
            >
              Demo Bypass: Allow Call (Add 60m)
            </button>
          </div>

          <button 
            onClick={onClose} 
            className="text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-rose-600 transition-colors pt-4"
          >
            Nitarudi Baadae • Katisha Simu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black animate-scaleIn overflow-hidden">
      {(isAdmin || isPremium) && (
        <div className={`absolute top-0 left-0 right-0 z-[60] ${isAdmin ? 'bg-amber-400' : 'bg-rose-500'} py-2 flex items-center justify-center space-x-4 shadow-[0_4px_30px_rgba(0,0,0,0.4)] border-b border-white/10 overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" style={{ animation: 'shimmer 3s infinite' }} />
          <svg className="w-5 h-5 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          <span className="text-white text-xs font-black uppercase tracking-[0.3em]">
            {isAdmin ? 'Admin Session • Unlimited Access' : 'Premium Gold Session • Unlimited Access'}
          </span>
        </div>
      )}

      <div className={`relative w-full h-full flex flex-col md:flex-row ${(isAdmin || isPremium) ? 'pt-10' : ''}`}>
        
        <div className="relative flex-1 bg-slate-900 overflow-hidden flex flex-col">
          <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-40">
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border ${isAdmin ? 'border-amber-400/30' : 'border-white/10'}`}>
                <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${isAdmin ? 'bg-amber-400' : 'bg-rose-600'}`} />
                <span className={`text-white text-[10px] font-black uppercase tracking-widest ${isAdmin ? 'text-amber-400' : ''}`}>
                  {isAdmin ? 'Admin Session (Secure)' : (isPremium ? 'Premium Call' : 'Live Call Active')}
                </span>
              </div>
              {isRecording && (
                <div className="flex items-center space-x-2 bg-rose-600/20 backdrop-blur-md px-4 py-2 rounded-full border border-rose-500/30">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-rose-400 text-[10px] font-black uppercase tracking-widest italic">REC</span>
                </div>
              )}
            </div>
            <div className={`px-4 py-2 bg-black/40 backdrop-blur rounded-full border text-white ${isAdmin ? 'border-amber-400/20' : 'border-white/10'}`}>
              <p className="text-sm font-black">
                {formatTime(seconds)} 
                {(isAdmin || isPremium) ? <span className="ml-2 text-[10px] text-amber-400 font-black tracking-widest uppercase">/ UNLIMITED</span> : <span className="opacity-50"> / {formatTime(currentLimit)}</span>}
              </p>
            </div>
          </div>

          <div className="flex-1 relative flex items-center justify-center p-4">
             <div className={`relative w-full h-full max-w-5xl rounded-[3rem] overflow-hidden shadow-2xl border bg-slate-800 ${isAdmin ? 'border-amber-400/20' : 'border-white/10'}`}>
                <img src={remoteUser.photo} className="w-full h-full object-cover" alt="Remote" referrerPolicy="no-referrer" crossOrigin="anonymous" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                <div className="absolute bottom-12 left-12 text-white">
                  <h2 className="text-4xl font-black tracking-tighter mb-2">{remoteUser.name}</h2>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-white/70 text-sm font-medium uppercase tracking-widest">{remoteUser.location}</p>
                  </div>
                </div>
             </div>
          </div>

          <div className="absolute bottom-32 right-8 w-32 h-44 md:w-48 md:h-64 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl z-20 bg-black">
            <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${isVideoOff ? 'opacity-0' : 'opacity-100'}`} />
          </div>

          <div className="p-8 flex justify-center items-center space-x-4 bg-gradient-to-t from-black/80 to-transparent z-40">
            <button onClick={() => setIsMuted(!isMuted)} className={`p-5 rounded-full ${isMuted ? 'bg-rose-500 shadow-lg shadow-rose-200/20' : 'bg-white/10 text-white'} transition-all`} title="Mute">
               <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </button>
            <button onClick={() => setIsVideoOff(!isVideoOff)} className={`p-5 rounded-full ${isVideoOff ? 'bg-rose-500 shadow-lg shadow-rose-200/20' : 'bg-white/10 text-white'} transition-all`} title="Video">
               <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>
            <button onClick={toggleRecording} className={`p-5 rounded-full ${isRecording ? 'bg-rose-500 text-white' : 'bg-white/10 text-white'} transition-all`} title="Record">
               <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="6" />
               </svg>
            </button>
            <button onClick={onClose} className="p-7 rounded-[2.5rem] bg-rose-600 text-white shadow-2xl hover:scale-110 transition-all" title="End Call">
               <svg className="w-8 h-8 rotate-[135deg]" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
            </button>
            <button onClick={() => setShowChat(!showChat)} className={`relative p-5 rounded-full ${showChat ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200/20' : 'bg-white/10 text-white'}`} title="Chat">
               <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
               {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-slate-900 animate-bounce">{unreadCount}</span>}
            </button>
          </div>
        </div>

        {showChat && (
          <div className="w-full md:w-96 bg-white flex flex-col animate-slideInRight border-l border-slate-200 z-[50] shadow-[-20px_0_50px_rgba(0,0,0,0.1)]">
            <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img src={remoteUser.photo} className="w-10 h-10 rounded-xl object-cover border border-slate-200" alt={remoteUser.name} referrerPolicy="no-referrer" crossOrigin="anonymous" />
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{remoteUser.name}</h3>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Active Now</p>
                </div>
              </div>
              <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-rose-500 p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
              {messages.map((msg, i) => {
                const isMe = msg.senderId === currentUser.id;
                const senderPhoto = isMe ? currentUser.photo : remoteUser.photo;
                
                return (
                  <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                    <div className={`flex items-end space-x-2 max-w-[85%] ${isMe ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                      <img 
                        src={senderPhoto} 
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0 mb-1" 
                        alt={msg.sender} 
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                      />
                      <div className="flex flex-col">
                        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm relative ${
                          isMe 
                            ? 'bg-rose-500 text-white rounded-br-none' 
                            : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                        }`}>
                          {msg.text}
                        </div>
                        <span className={`text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest ${isMe ? 'text-right' : 'text-left'}`}>
                          {formatMessageTime(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {isRemoteTyping && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="flex items-center space-x-2">
                    <img src={remoteUser.photo} className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0" alt={remoteUser.name} referrerPolicy="no-referrer" crossOrigin="anonymous" />
                    <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-none flex space-x-1 items-center">
                       <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                       <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                       <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-6 bg-white border-t border-slate-100">
              <div className="relative flex items-center space-x-2">
                <input 
                  type="text" 
                  value={inputValue} 
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type message..."
                  className="flex-1 pl-6 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none text-sm font-medium focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 transition-all" 
                />
                <button 
                  onClick={handleSendMessage} 
                  disabled={!inputValue.trim()} 
                  className="p-4 bg-rose-500 text-white rounded-2xl shadow-lg hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-50"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
