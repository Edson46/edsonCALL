
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, UserTier, UserRole, Transaction, TransactionType } from '../types';
import { CURRENCY, PRICES, APP_NAME, ADMIN_WHATSAPP, ADMIN_PAYMENT_NAME } from '../constants';
import { GoogleGenAI } from "@google/genai";

interface ProfileProps {
  user: UserProfile;
  onInitiatePayment: (amount: number, type: TransactionType) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onInitiatePayment }) => {
  const [bio, setBio] = useState(user.bio);
  const [profilePhoto, setProfilePhoto] = useState(user.photo);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTestingCamera, setIsTestingCamera] = useState(false);
  const [testStream, setTestStream] = useState<MediaStream | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isAdmin = user.role === UserRole.ADMIN;

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCameraTest = async () => {
    if (isTestingCamera) {
      testStream?.getTracks().forEach(track => track.stop());
      setTestStream(null);
      setIsTestingCamera(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setTestStream(stream);
        if (videoRef.current) videoRef.current.srcObject = stream;
        setIsTestingCamera(true);
      } catch (err) {
        alert("Imeshindwa kufungua kamera. Tafadhali hakikisha umeruhusu browser kutumia kamera.");
      }
    }
  };

  useEffect(() => {
    return () => {
      testStream?.getTracks().forEach(track => track.stop());
    };
  }, [testStream]);

  const isVerified = user.verificationStatus === 'VERIFIED' || isAdmin;

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fadeIn">
      <div className="flex flex-col md:flex-row items-start md:items-center space-y-8 md:space-y-0 md:space-x-12 mb-12">
        <div className="flex flex-row items-center space-x-6">
          <div className="relative group shrink-0">
            <img src={profilePhoto} className={`w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] object-cover border-4 shadow-2xl transition-all ${isAdmin ? 'border-slate-900 ring-4 ring-amber-400/20' : 'border-white'}`} />
            <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
          </div>
          <div className="flex flex-col space-y-3">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-900 hover:bg-slate-50 transition-all shadow-sm"
            >
              <span>Upload Photo</span>
            </button>
          </div>
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-black text-slate-900">{user.name}, {user.age}</h2>
            <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${user.tier === UserTier.PREMIUM ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
              {user.tier}
            </span>
          </div>
          <textarea 
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full border rounded-2xl p-4 text-slate-600 text-lg font-medium h-32 outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Device Health Tool */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.954 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h3 className="text-xl font-black uppercase italic tracking-tighter">Device Diagnostic</h3>
          </div>
          
          <div className="flex-1 space-y-4">
             <p className="text-slate-500 text-sm font-medium">Hakiki kama kamera na maikrofoni yako vinafanya kazi vizuri kabla ya kupiga simu.</p>
             
             {isTestingCamera ? (
               <div className="relative aspect-video rounded-3xl overflow-hidden bg-black border-2 border-emerald-500">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full animate-pulse">Live Feed</div>
               </div>
             ) : (
               <div className="aspect-video rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200">
                 <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
               </div>
             )}
          </div>
          
          <button 
            onClick={toggleCameraTest}
            className={`mt-8 w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
              isTestingCamera ? 'bg-slate-900 text-white' : 'bg-emerald-500 text-white shadow-xl shadow-emerald-200'
            }`}
          >
            {isTestingCamera ? 'Stop Diagnostic' : 'Test My Camera'}
          </button>
        </div>

        {/* Membership Options */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black mb-8 uppercase italic tracking-tighter">Premium Membership</h3>
          <div className="space-y-4">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-black text-slate-900">Weekly Pass</span>
                <span className="text-lg font-black text-rose-600">{PRICES.WEEKLY.toLocaleString()} TZS</span>
              </div>
              <button 
                onClick={() => onInitiatePayment(PRICES.WEEKLY, 'WEEKLY_PASS')}
                className="w-full py-3.5 bg-slate-900 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-black transition-all"
              >
                Buy Now
              </button>
            </div>
            
            <div className="p-6 bg-slate-900 rounded-3xl border border-amber-400/20 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-black text-white">Monthly Gold</span>
                  <span className="text-lg font-black text-amber-400">{PRICES.MONTHLY.toLocaleString()} TZS</span>
                </div>
                <button 
                  onClick={() => onInitiatePayment(PRICES.MONTHLY, 'SUBSCRIPTION')}
                  className="w-full py-3.5 bg-amber-400 text-slate-900 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-white transition-all"
                >
                  Buy Monthly
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
