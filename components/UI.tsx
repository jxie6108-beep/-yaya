
import React, { useState } from 'react';
import { useStore } from '../store';

const UI: React.FC = () => {
  const { 
    phase, 
    gesture, 
    wishText, 
    setWishText, 
    wishSent,
    setWishSent
  } = useStore();
  
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  const handleSendWish = () => {
    handleInteraction();
    if (wishText.trim() && !wishSent) {
      setWishSent(true);
      setTimeout(() => {
        setWishSent(false);
        setWishText('');
      }, 9000);
    }
  };

  return (
    <div 
      className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between p-10"
      onClick={handleInteraction}
    >
      {/* Interaction Overlay to start the experience */}
      {!hasInteracted && (
        <div 
          className="pointer-events-auto fixed inset-0 z-[60] bg-black/60 backdrop-blur-xl flex items-center justify-center cursor-pointer group" 
          onClick={handleInteraction}
        >
          <div className="bg-white/5 p-16 rounded-[5rem] border-2 border-white/10 text-center transform transition-all group-hover:scale-105 duration-700 shadow-[0_0_100px_rgba(255,182,193,0.1)]">
            <div className="text-white font-cursive text-5xl md:text-7xl mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
              Merry Christmas
            </div>
            <div className="text-pink-100/60 font-cute text-xl md:text-2xl animate-pulse tracking-[0.2em] uppercase">
              Click to unleash the magic
            </div>
          </div>
        </div>
      )}

      {/* Detection Status */}
      <div className="flex flex-col space-y-2">
        <div className="text-pink-100/40 text-[11px] uppercase tracking-[0.5em] font-bold font-cute">Cosmic Tracker</div>
        <div className="text-white font-cute text-sm flex items-center space-x-4">
          <div className={`w-4 h-4 rounded-full ${gesture !== 'none' ? 'bg-pink-400 shadow-[0_0_15px_#FFB6C1]' : 'bg-white/10 shadow-inner'}`} />
          <span className="capitalize tracking-widest opacity-90">
            {gesture === 'none' ? (phase === 'tree' ? '1 Finger: Rotate' : 'Tracking...') : gesture}
          </span>
        </div>
      </div>

      {/* Main Title Area */}
      <div className={`transition-all duration-1000 transform text-center flex flex-col items-center ${phase === 'tree' || phase === 'blooming' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-24'}`}>
        <h1 className="text-[#FFD1DC] text-7xl md:text-[11rem] font-cursive drop-shadow-[0_0_50px_rgba(255,255,255,0.3)] leading-none select-none">
          Merry Christmas
        </h1>
        <h2 className="text-[#FFF5BA] text-4xl md:text-[4.5rem] font-cursive mt-2 drop-shadow-xl select-none">
          Yaya's friend
        </h2>
        
        {/* Wish Box */}
        <div className={`pointer-events-auto mt-16 flex flex-col items-center space-y-8 transition-all duration-1000 ${wishSent ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}>
          <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-6">
            <div className="relative group">
              <input 
                type="text"
                value={wishText}
                onChange={(e) => setWishText(e.target.value)}
                placeholder="Whisper a secret wish..."
                className="bg-white/10 backdrop-blur-3xl border-2 border-pink-100/30 rounded-[3.5rem] px-12 py-6 text-white placeholder-pink-100/40 outline-none w-80 md:w-[550px] focus:w-[600px] focus:border-pink-300/50 transition-all duration-700 font-cursive text-5xl shadow-2xl text-center italic"
                onKeyDown={(e) => e.key === 'Enter' && handleSendWish()}
              />
              <div className="absolute inset-0 rounded-[3.5rem] bg-pink-200/5 -z-10 group-focus-within:opacity-100 opacity-0 transition-opacity" />
            </div>
            <button 
              onClick={handleSendWish}
              disabled={wishSent || !wishText.trim()}
              className={`bg-gradient-to-br from-pink-300 via-rose-400 to-rose-500 text-white rounded-full px-14 py-6 font-bold font-cute text-2xl hover:scale-110 active:scale-95 transition-all shadow-2xl border-2 border-white/20 disabled:opacity-20 pointer-events-auto`}
            >
              SEND
            </button>
          </div>
          <p className="text-pink-100/40 font-cute text-[11px] tracking-[0.4em] uppercase animate-pulse">
            Palm: Bloom | Fist: Reset | 2 Fingers: Zoom (Nip to Shrink)
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center mb-8 h-10">
      </div>
    </div>
  );
};

export default UI;
