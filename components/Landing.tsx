
import React, { useState, useEffect, useCallback } from 'react';
import { UserRole } from '../types';
import { APP_NAME } from '../constants';

interface LandingProps {
  onLogin: (role: UserRole) => void;
}

const Landing: React.FC<LandingProps> = ({ onLogin }) => {
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [pin, setPin] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaChallenge, setCaptchaChallenge] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Secret trigger state
  const [secretCounter, setSecretCounter] = useState(0);

  const generateCaptcha = useCallback(() => {
    // Using only numbers for the security code to make it faster and clearer
    const digits = '0123456789'; 
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    setCaptchaChallenge(result);
    setCaptchaInput('');
  }, []);

  useEffect(() => {
    const savedLockout = localStorage.getItem('admin_lockout');
    if (savedLockout) {
      const remaining = parseInt(savedLockout) - Date.now();
      if (remaining > 0) setLockoutTime(parseInt(savedLockout));
    }
  }, []);

  useEffect(() => {
    if (showAdminAuth && !lockoutTime) {
      generateCaptcha();
    }
  }, [showAdminAuth, lockoutTime, generateCaptcha]);

  useEffect(() => {
    if (lockoutTime) {
      const interval = setInterval(() => {
        const remaining = lockoutTime - Date.now();
        if (remaining <= 0) {
          setLockoutTime(null);
          setAttempts(0);
          localStorage.removeItem('admin_lockout');
          generateCaptcha();
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutTime, generateCaptcha]);

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTime || isLoading) return;

    setError(null);
    setIsLoading(true);

    // Give visual feedback of verification
    setTimeout(() => {
      const trimmedCaptcha = captchaInput.trim();
      const trimmedPin = pin.trim();

      // 1. Check if fields are empty
      if (!trimmedCaptcha) {
        setError('STEP 1: Please enter the Security Code');
        setIsLoading(false);
        return;
      }
      if (!trimmedPin) {
        setError('STEP 2: Please enter the Master PIN');
        setIsLoading(false);
        return;
      }

      // 2. Validate Security Code Length
      if (trimmedCaptcha.length < 6) {
        setError('Security Code must be 6 digits');
        setIsLoading(false);
        return;
      }

      // 3. Validate Security Code Match
      if (trimmedCaptcha !== captchaChallenge) {
        setError('Security Code Mismatch! Try the new code.');
        generateCaptcha();
        setIsLoading(false);
        return;
      }

      // 4. Validate Master PIN
      const storedMasterPin = localStorage.getItem('admin_master_pin') || '2025';

      if (trimmedPin === storedMasterPin) {
        onLogin(UserRole.ADMIN);
      } else {
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);
        setError(`Incorrect PIN (${3 - nextAttempts} tries remaining)`);
        setPin('');
        generateCaptcha();
        setIsLoading(false);
        
        if (nextAttempts >= 3) {
          const expiry = Date.now() + 15 * 60 * 1000;
          setLockoutTime(expiry);
          localStorage.setItem('admin_lockout', expiry.toString());
        }
      }
    }, 600);
  };

  const handleSecretClick = () => {
    const nextCount = secretCounter + 1;
    setSecretCounter(nextCount);
    if (nextCount >= 5) {
      setShowAdminAuth(true);
      setSecretCounter(0);
    }
    const timer = setTimeout(() => setSecretCounter(0), 3000);
    return () => clearTimeout(timer);
  };

  if (showAdminAuth) {
    const isLocked = lockoutTime !== null;
    const remainingSeconds = isLocked ? Math.ceil((lockoutTime! - Date.now()) / 1000) : 0;

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-500 rounded-full blur-[150px] animate-pulse" />
        </div>

        <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-3xl p-10 rounded-[3.5rem] border-2 border-amber-400/20 shadow-[0_0_100px_rgba(251,191,36,0.1)] space-y-6 animate-scaleIn relative z-10">
          <div className="text-center space-y-4">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto border-2 transition-all duration-500 ${isLocked ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' : 'bg-amber-400/10 text-amber-400 border-amber-400/40 shadow-[0_0_30px_rgba(251,191,36,0.2)]'}`}>
              <svg className={`w-10 h-10 ${!isLocked && !isLoading && 'animate-bounce'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isLocked ? "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" : "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"} />
              </svg>
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">
                {isLocked ? 'Terminal Locked' : 'Secure Access'}
              </h2>
              <p className="text-amber-400/60 text-[9px] font-black uppercase tracking-[0.3em]">
                {isLocked ? `Cooldown: ${Math.floor(remainingSeconds / 60)}m ${remainingSeconds % 60}s` : 'Master Authentication Required'}
              </p>
            </div>
          </div>

          {!isLocked && (
            <form onSubmit={handleAdminAuth} className="space-y-6">
              {/* STEP 1: SECURITY CODE */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Step 1: Security Code</label>
                  <button type="button" onClick={generateCaptcha} className="text-[9px] font-black text-amber-400 uppercase tracking-widest hover:text-white transition-colors">New Code</button>
                </div>
                <div className="flex space-x-3">
                  <div className="flex-1 bg-black/60 rounded-2xl flex items-center justify-center border border-white/5 relative overflow-hidden py-3">
                    <span className="text-2xl font-black text-white tracking-[0.5em] select-none italic">
                      {captchaChallenge}
                    </span>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Enter"
                    maxLength={6}
                    autoComplete="off"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value.replace(/\D/g, ''))}
                    className="w-32 bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-center text-sm font-black text-amber-400 outline-none focus:border-amber-400/50 transition-all"
                  />
                </div>
              </div>

              {/* STEP 2: MASTER PIN */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Step 2: Master PIN</label>
                  {attempts > 0 && <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">{3 - attempts} left</span>}
                </div>
                <input 
                  type="password" 
                  maxLength={4}
                  autoComplete="current-password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className={`w-full bg-black/40 border-2 ${error && !error.includes('Step 1') ? 'border-rose-500' : 'border-white/10 focus:border-amber-400'} rounded-[2rem] py-5 text-center text-4xl text-amber-400 font-black tracking-[0.8em] outline-none transition-all placeholder:text-slate-800 shadow-inner`}
                />
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 py-3 px-4 rounded-xl text-center animate-fadeIn">
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-relaxed">{error}</p>
                </div>
              )}

              <button 
                type="submit"
                className="w-full py-5 bg-amber-400 text-slate-900 font-black rounded-2xl uppercase tracking-[0.25em] text-xs hover:bg-white transition-all shadow-xl shadow-amber-400/20 active:scale-95 flex items-center justify-center space-x-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <span>Unlock Terminal</span>
                )}
              </button>
            </form>
          )}

          {isLocked && (
            <div className="py-12 text-center space-y-4">
              <p className="text-slate-400 text-sm font-medium leading-relaxed italic">"Access denied. Security protocol active."</p>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: `${(remainingSeconds / 900) * 100}%`, transition: 'width 1s linear' }} />
              </div>
            </div>
          )}

          <button onClick={() => setShowAdminAuth(false)} className="w-full text-slate-600 hover:text-white text-[9px] font-black uppercase tracking-widest transition-colors py-2">← Exit Master Mode</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden relative font-sans">
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1523933155822-45459392e21e?auto=format&fit=crop&q=80&w=1920" alt="Tanzania" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white/90 to-transparent" />
      </div>

      <header className="relative z-10 px-6 py-8 md:px-12 flex justify-between items-center max-w-7xl mx-auto">
        <h1 className="text-3xl font-black bg-gradient-to-r from-rose-600 to-orange-500 bg-clip-text text-transparent tracking-tighter italic">{APP_NAME}</h1>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 md:pt-20 pb-20 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 space-y-12 text-center md:text-left">
          <div className="space-y-6">
            <div className="relative inline-block group">
              <button 
                onClick={handleSecretClick}
                className={`relative px-6 py-3 bg-white text-rose-600 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border-2 transition-all duration-300 transform active:scale-90 ${secretCounter > 0 ? 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)]' : 'border-rose-100'}`}
              >
                {secretCounter > 0 ? `Unlocking... ${secretCounter}/5` : '100% Tanzanian Vibe 🇹🇿'}
              </button>
            </div>
            
            <h2 className="text-6xl md:text-9xl font-black text-slate-900 leading-[0.9] tracking-tighter">Find Your <br /> <span className="text-rose-600 italic">Person.</span></h2>
            <p className="text-xl text-slate-600 max-w-lg font-medium leading-relaxed">Genuine connections for the Tanzanian heart. <br />Safe, verified, and always local.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-6">
            <button onClick={() => onLogin(UserRole.USER)} className="w-full sm:w-auto px-12 py-6 bg-rose-600 text-white font-black rounded-[2rem] hover:bg-rose-700 hover:scale-105 transition-all shadow-2xl shadow-rose-200 text-xl uppercase tracking-widest">Join the Vibe</button>
          </div>
        </div>
        
        <div className="md:w-1/2 mt-20 md:mt-0 relative flex justify-center scale-110">
          <div className="relative w-full max-w-[400px]">
            <div className="bg-slate-950 rounded-[4rem] p-4 shadow-2xl border-[12px] border-slate-100 aspect-[9/19] relative overflow-hidden transform md:rotate-3">
               <img src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover rounded-[3rem] opacity-90" />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
               <div className="absolute bottom-12 left-10 text-white">
                 <p className="text-3xl font-black italic">Rehema, 23</p>
                 <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mt-2">Active in Dar</p>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
