
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { EARNING_RATES, CURRENCY, APP_NAME, ADMIN_WHATSAPP } from '../constants';

interface EarningsProps {
  user: UserProfile;
}

const Earnings: React.FC<EarningsProps> = ({ user }) => {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [mobileNumber, setMobileNumber] = useState(user.phone || '');
  const [amountPoints, setAmountPoints] = useState(5000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'details' | 'verify'>('details');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const tzsAmount = amountPoints; 
  const platformFee = tzsAmount * 0.1;
  const netAmount = tzsAmount - platformFee;

  const requestVerification = () => {
    if (amountPoints < 5000) return alert('Minimum withdrawal is 5,000 pts');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    alert(`SECURITY: A verification code has been "sent" to your mobile number. Enter it to confirm. (Demo Code: ${code})`);
    setStep('verify');
  };

  const handleWithdraw = () => {
    if (verificationCode !== generatedCode) {
      alert('INVALID SECURITY CODE. Access Denied.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowWithdraw(false);
      setStep('details');
      setVerificationCode('');
      alert('Withdrawal request submitted! Admin will process this within 24 hours to your mobile money number.');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="bg-gradient-to-br from-indigo-600 via-rose-600 to-orange-500 rounded-[3rem] p-10 md:p-14 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-1000" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <p className="text-indigo-100 uppercase tracking-[0.3em] text-xs font-black mb-3">Total Balance</p>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter">{CURRENCY} {user.points.toLocaleString()}</h2>
            <div className="flex items-center mt-8 space-x-3 bg-white/10 backdrop-blur-md w-fit px-4 py-2 rounded-2xl border border-white/10">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-white text-sm font-bold tracking-tight">Rate: 1 Pt = 1 TZS</p>
            </div>
          </div>
          <button 
            onClick={() => setShowWithdraw(true)}
            disabled={user.points < 5000}
            className="mt-12 md:mt-0 px-10 py-5 bg-white text-rose-600 font-black rounded-2xl hover:bg-rose-50 transition-all shadow-2xl disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-widest transform active:scale-95"
          >
            Withdraw Funds
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm">
          <h3 className="text-2xl font-black mb-8 text-slate-800">Earn with {APP_NAME}</h3>
          <div className="space-y-4">
            {Object.entries(EARNING_RATES).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center p-5 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-rose-200 transition-colors">
                <span className="text-slate-600 font-bold capitalize tracking-tight">{key.replace(/_/g, ' ').toLowerCase()}</span>
                <span className="bg-rose-500 text-white px-4 py-1 rounded-xl text-xs font-black">+{value} pts</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm h-fit">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-slate-800 text-center">History</h3>
          </div>
          <div className="space-y-4">
            {[{ label: 'Successful Match', pts: 100, date: 'Today, 10:45 AM', color: 'rose' }, { label: 'Daily Login Bonus', pts: 50, date: 'Today, 08:32 AM', color: 'indigo' }].map((entry, i) => (
              <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-slate-50">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl bg-${entry.color}-500/10 flex items-center justify-center text-${entry.color}-500`}>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm">{entry.label}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{entry.date}</p>
                  </div>
                </div>
                <span className="text-rose-600 font-black">+{entry.pts}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showWithdraw && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-[3.5rem] p-8 md:p-12 max-w-xl w-full space-y-8 shadow-2xl animate-scaleIn relative overflow-hidden">
            <div className="flex justify-between items-center">
              <h3 className="text-3xl font-black text-slate-900">Secure Withdrawal</h3>
              <button onClick={() => setShowWithdraw(false)} className="text-slate-400 hover:text-rose-500"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            
            {step === 'details' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">You Convert</p>
                    <p className="text-2xl font-black text-slate-900">{amountPoints.toLocaleString()} pts</p>
                  </div>
                  <div className="p-6 bg-indigo-50 rounded-3xl border-2 border-indigo-100">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">You Receive</p>
                    <p className="text-2xl font-black text-indigo-900">{CURRENCY} {netAmount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <input type="number" value={amountPoints} onChange={(e) => setAmountPoints(Number(e.target.value))} placeholder="Amount" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none text-lg font-black" />
                  <input type="tel" placeholder="+255 7XX XXX XXX" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none text-lg font-black" />
                </div>
                <button onClick={requestVerification} className="w-full py-5 bg-rose-600 text-white font-black rounded-3xl uppercase tracking-widest shadow-xl shadow-rose-200">Request Verification Code</button>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center space-y-2">
                   <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                   </div>
                   <h4 className="text-xl font-black">Verify Identity</h4>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">A code was sent to {mobileNumber.slice(0, 5)}***</p>
                </div>
                <input 
                  type="text" 
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="000000"
                  className="w-full px-6 py-6 bg-slate-50 rounded-3xl border-2 border-slate-200 text-center text-4xl font-black tracking-[0.5em] outline-none focus:border-emerald-500"
                  autoFocus
                />
                <div className="flex space-x-4">
                   <button onClick={() => setStep('details')} className="flex-1 py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest">Back</button>
                   <button 
                    onClick={handleWithdraw} 
                    disabled={verificationCode.length < 6 || isSubmitting}
                    className="flex-[2] py-4 bg-emerald-500 text-white font-black rounded-2xl shadow-lg uppercase tracking-widest flex items-center justify-center"
                   >
                     {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Confirm Transfer'}
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Earnings;
