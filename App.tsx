
import React from 'react';
import Scene from './components/Scene';
import UI from './components/UI';
import HandTracker from './components/HandTracker';

const App: React.FC = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* 3D Scene Layer */}
      <Scene />

      {/* Hand Tracking Layer */}
      <HandTracker />

      {/* 2D UI Layer */}
      <UI />

      {/* Instruction Overlay for first load */}
      <div className="fixed bottom-4 left-4 z-50 text-white/20 text-[10px] uppercase tracking-widest pointer-events-none">
        React 18 + Three.js + MediaPipe
      </div>
    </div>
  );
};

export default App;
