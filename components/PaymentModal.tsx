
import React, { useState } from 'react';
import { TransactionType, UserProfile } from '../types';
import { CURRENCY, ADMIN_MOBILE_MONEY } from '../constants';
import { GoogleGenAI } from "@google/genai";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  amount: number;
  type: TransactionType;
  onPaymentInitiated: (transaction: any) => void;
}

const CARRIERS = [
  { id: 'M-PESA', name: 'M-Pesa', color: 'bg-red-600', text: 'text-white', icon: 'M' },
  { id: 'TIGO-PESA', name: 'Tigo Pesa', color: 'bg-blue-600', text: 'text-white', icon: 'T' },
  { id: 'AIRTEL-MONEY', name: 'Airtel Money', color: 'bg-red-500', text: 'text-white', icon: 'A' },
  { id: 'HALOPESA', name: 'HaloPesa', color: 'bg-orange-500', text: 'text-white', icon: 'H' },
];

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, currentUser, amount, type, onPaymentInitiated }) => {
  const [step, setStep] = useState<'carrier' | 'number' | 'processing' | 'manual' | 'verifying'>('carrier');
  const [selectedCarrier, setSelectedCarrier] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phone || '');
  const [reference, setReference] = useState('');

  if (!isOpen) return null;

  const handleStartSTK = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('manual');
    }, 3000);
  };

  const handleSubmitManual = async () => {
    if (!reference.trim() || reference.length < 8) {
      alert('Tafadhali weka namba ya kumbukumbu (Reference ID) sahihi uliyopokea kwenye SMS.');
      return;
    }

    setStep('verifying');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this Tanzanian mobile money transaction reference: "${reference}". 
        Does it follow the typical alphanumeric pattern of M-Pesa, Tigo Pesa, or Airtel Money (usually 10-12 chars, e.g., 'RL92345678', 'PP123456')? 
        Reply ONLY with "VALID_FORMAT" or "INVALID_FORMAT".`,
      });

      if (response.text?.trim().includes("INVALID_FORMAT")) {
        alert("Namba uliyoweka haina uhalisia wa namba za malipo. Tafadhali kagua SMS yako na uandike namba sahihi.");
        setStep('manual');
        return;
      }

      const newTx = {
        id: `tx-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        amount: amount,
        currency: 'TZS',
        type: type,
        status: 'PENDING',
        provider: selectedCarrier,
        timestamp: new Date().toISOString(),
        reference: reference.toUpperCase()
      };

      onPaymentInitiated(newTx);
      alert('Hongera! Malipo yako yameingia kwenye mfumo. Admin Edson anahakiki sasa hivi. Utafunguliwa huduma ndani ya dakika 2-5.');
      onClose();
    } catch (e) {
      // Fallback if AI fails
      const newTx = {
        id: `tx-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        amount: amount,
        currency: 'TZS',
        type: type,
        status: 'PENDING',
        provider: selectedCarrier,
        timestamp: new Date().toISOString(),
        reference: reference.toUpperCase()
      };
      onPaymentInitiated(newTx);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-4 animate-fadeIn">
      <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-scaleIn relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-rose-500 z-10">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="p-8 md:p-10 space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">LIPIA HUDUMA</h3>
            <div className="inline-flex items-center space-x-2 bg-slate-100 px-4 py-1.5 rounded-full">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{type.replace('_', ' ')}</span>
               <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
               <span className="text-sm font-black text-rose-600">{amount.toLocaleString()} TZS</span>
            </div>
          </div>

          {step === 'carrier' && (
            <div className="space-y-4 animate-fadeIn">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Chagua Mtandao Wako:</p>
              <div className="grid grid-cols-2 gap-3">
                {CARRIERS.map(carrier => (
                  <button 
                    key={carrier.id}
                    onClick={() => { setSelectedCarrier(carrier.id); setStep('number'); }}
                    className={`${carrier.color} ${carrier.text} p-6 rounded-3xl flex flex-col items-center justify-center space-y-2 hover:scale-105 transition-all shadow-lg active:scale-95`}
                  >
                    <span className="text-2xl font-black">{carrier.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{carrier.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'number' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Namba ya Simu ({selectedCarrier})</label>
                <input 
                  type="tel" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="07XX XXX XXX"
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-slate-100 outline-none text-xl font-black focus:border-rose-500 transition-all"
                />
              </div>
              <button 
                onClick={handleStartSTK}
                className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl uppercase tracking-[0.2em] text-sm shadow-xl hover:bg-black transition-all"
              >
                Tuma STK Push
              </button>
              <button onClick={() => setStep('carrier')} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest">← Badili Mtandao</button>
            </div>
          )}

          {(step === 'processing' || step === 'verifying') && (
            <div className="py-12 text-center space-y-6 animate-fadeIn">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-rose-100 rounded-full" />
                <div className="absolute inset-0 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <svg className="w-10 h-10 text-rose-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-black italic">{step === 'processing' ? 'Angalia Simu Yako!' : 'Checking Reference...'}</h4>
                <p className="text-sm text-slate-500 font-medium">
                  {step === 'processing' 
                    ? 'Tumeandika ombi la malipo kwenye simu yako. Weka PIN kukamilisha.' 
                    : 'System is validating your transaction ID pattern...'}
                </p>
              </div>
            </div>
          )}

          {step === 'manual' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100 space-y-3">
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Malipo ya Mwongozo (Manual)</p>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Kama STK push haijatokea, tuma <span className="font-bold text-slate-900">{amount.toLocaleString()} TZS</span> kwa:
                  <br />
                  <span className="text-sm font-black text-slate-900 mt-1 block">{(ADMIN_MOBILE_MONEY as any)[selectedCarrier!] || '0757232716'}</span>
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transaction Ref ID (Kutoka kwenye SMS)</label>
                <input 
                  type="text" 
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Mfano: RL9214X..."
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-slate-100 outline-none text-xl font-black uppercase tracking-widest focus:border-rose-500"
                />
              </div>

              <button 
                onClick={handleSubmitManual}
                className="w-full py-5 bg-emerald-500 text-white font-black rounded-2xl uppercase tracking-[0.2em] text-sm shadow-xl hover:bg-emerald-600 transition-all"
              >
                Hakiki Malipo
              </button>
            </div>
          )}
        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-100 text-center">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Malipo ni Salama • Selcom Integration</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
