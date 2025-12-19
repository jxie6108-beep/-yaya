
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import ChristmasTree from './ChristmasTree';
import { useStore } from '../store';

const Scene: React.FC = () => {
  const { phase } = useStore();

  return (
    <div className="w-full h-full absolute inset-0 bg-[#0d0101]">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 1.5, 16]} fov={40} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={3} color="#FFD1DC" />
        <pointLight position={[-10, 5, -10]} intensity={2} color="#FFF5BA" />
        <spotLight 
          position={[0, 15, 0]} 
          angle={0.25} 
          penumbra={1} 
          intensity={15} 
          castShadow 
          color="#FFFFFF"
        />
        
        <Suspense fallback={null}>
          <ChristmasTree />
          <Environment preset="night" />
        </Suspense>

        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          maxDistance={45} 
          minDistance={5}
          autoRotate={phase === 'tree'}
          autoRotateSpeed={0.3}
        />

        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.4} luminanceSmoothing={0.9} height={500} intensity={2.2} />
          <Noise opacity={0.03} />
          <Vignette eskil={false} offset={0.05} darkness={1.2} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default Scene;
