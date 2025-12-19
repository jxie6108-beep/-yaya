
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Stars, Sparkles, Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useStore } from '../store';
import { generateTreePositions, generateNebulaPositions } from '../utils/mathUtils';
import { COLORS, ORNAMENT_COLORS } from '../constants';

const PARTICLE_COUNT = 10000;
const ORNAMENT_COUNT = 50;
const HEART_PARTICLE_COUNT = 300;
const SNOW_COUNT = 150;

const Heart: React.FC<{ color: string; visible: boolean }> = ({ color, visible }) => {
  const heartShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(0, -0.3, -0.6, -0.3, -0.6, 0);
    s.bezierCurveTo(-0.6, 0.3, -0.3, 0.6, 0, 1.1);
    s.bezierCurveTo(0.3, 0.6, 0.6, 0.3, 0.6, 0);
    s.bezierCurveTo(0.6, -0.3, 0, -0.3, 0, 0);
    return s;
  }, []);

  const extrudeSettings = { depth: 0.2, bevelEnabled: true, bevelSegments: 3, steps: 2, bevelSize: 0.1, bevelThickness: 0.1 };

  return (
    <mesh rotation={[Math.PI, 0, 0]} position={[0, 0.5, 0]} visible={visible}>
      <extrudeGeometry args={[heartShape, extrudeSettings]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={6} metalness={0.9} roughness={0.1} />
    </mesh>
  );
};

const SnowTrail: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null!);
  const { handPos } = useStore();
  
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(SNOW_COUNT * 3);
    const vel = new Float32Array(SNOW_COUNT * 3);
    for (let i = 0; i < SNOW_COUNT; i++) {
      pos[i * 3 + 1] = Math.random() * 6;
      vel[i * 3 + 1] = -0.02 - Math.random() * 0.04;
    }
    return [pos, vel];
  }, []);

  useFrame(({ mouse, viewport }) => {
    const targetX = (handPos.x || mouse.x) * viewport.width / 2;
    const targetY = (handPos.y || mouse.y) * viewport.height / 2;
    
    if (pointsRef.current) {
      pointsRef.current.position.lerp(new THREE.Vector3(targetX, targetY, 0), 0.15);
      const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < SNOW_COUNT; i++) {
        const currentY = posAttr.getY(i);
        posAttr.setY(i, currentY + velocities[i * 3 + 1]);
        if (currentY < -2.5) {
          posAttr.setY(i, 3.5);
          posAttr.setX(i, (Math.random() - 0.5) * 3);
          posAttr.setZ(i, (Math.random() - 0.5) * 3);
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={SNOW_COUNT} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="white" size={0.08} transparent opacity={0.7} />
    </points>
  );
};

const ChristmasTree: React.FC = () => {
  const { phase, setPhase, wishSent, handPos, zoom, wishText } = useStore();
  const treeGroupRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const ornamentsRef = useRef<THREE.InstancedMesh>(null!);
  const heartRef = useRef<THREE.Group>(null!);
  const heartParticlesRef = useRef<THREE.InstancedMesh>(null!);

  const treePositions = useMemo(() => generateTreePositions(PARTICLE_COUNT, 9, 4), []);
  const nebulaPositions = useMemo(() => generateNebulaPositions(PARTICLE_COUNT, 16), []);
  
  useEffect(() => {
    const dummy = new THREE.Object3D();
    const colors = [new THREE.Color('#FFD1DC'), new THREE.Color('#A8D5BA'), new THREE.Color('#FFF5BA'), new THREE.Color('#FFFFFF')];

    if (meshRef.current) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        dummy.position.set(treePositions[i * 3], treePositions[i * 3 + 1], treePositions[i * 3 + 2]);
        dummy.scale.setScalar(0.05 + Math.random() * 0.05);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
        meshRef.current.setColorAt(i, colors[i % colors.length]);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
      if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }

    if (ornamentsRef.current) {
      for (let i = 0; i < ORNAMENT_COUNT; i++) {
        const h = (i / ORNAMENT_COUNT) * 9;
        const radius = 4 * (1 - h / 9);
        const angle = (i / ORNAMENT_COUNT) * Math.PI * 2 * 8;
        dummy.position.set(Math.cos(angle) * radius, h - 4.5, Math.sin(angle) * radius);
        dummy.scale.setScalar(0.15 + Math.random() * 0.1);
        dummy.updateMatrix();
        ornamentsRef.current.setMatrixAt(i, dummy.matrix);
        ornamentsRef.current.setColorAt(i, new THREE.Color(ORNAMENT_COLORS[i % ORNAMENT_COLORS.length]));
      }
      ornamentsRef.current.instanceMatrix.needsUpdate = true;
    }

    if (heartParticlesRef.current) {
      for (let i = 0; i < HEART_PARTICLE_COUNT; i++) {
        dummy.position.set(0, 5, 0);
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        heartParticlesRef.current.setMatrixAt(i, dummy.matrix);
      }
      heartParticlesRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [treePositions]);

  useEffect(() => {
    if (wishSent || phase === 'blooming') {
      const dummy = new THREE.Object3D();
      if (heartRef.current) gsap.to(heartRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.4 });
      
      for (let i = 0; i < HEART_PARTICLE_COUNT; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const target = new THREE.Vector3(Math.cos(theta) * Math.sin(phi) * 10, Math.sin(phi) * Math.sin(theta) * 10 + 5, Math.cos(phi) * 10);
        gsap.to({}, {
          duration: 2,
          ease: "expo.out",
          onUpdate: function() {
            const p = this.progress();
            dummy.position.set(0 + target.x * p, 5 + target.y * p, 0 + target.z * p);
            dummy.scale.setScalar(0.3 * (1 - p));
            dummy.updateMatrix();
            heartParticlesRef.current?.setMatrixAt(i, dummy.matrix);
            if (i % 20 === 0 && heartParticlesRef.current) heartParticlesRef.current.instanceMatrix.needsUpdate = true;
          }
        });
      }

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const target = new THREE.Vector3(nebulaPositions[i * 3], nebulaPositions[i * 3 + 1], nebulaPositions[i * 3 + 2]);
        const startX = treePositions[i * 3];
        const startY = treePositions[i * 3 + 1];
        const startZ = treePositions[i * 3 + 2];
        const targetScale = 0.4 + Math.random() * 0.3;
        gsap.to({}, {
          duration: 2.5 + Math.random(),
          ease: "expo.out",
          onUpdate: function() {
            const p = this.progress();
            dummy.position.set(startX + (target.x - startX) * p, startY + (target.y - startY) * p, startZ + (target.z - startZ) * p);
            dummy.scale.setScalar(0.08 + (targetScale - 0.08) * p);
            dummy.updateMatrix();
            meshRef.current?.setMatrixAt(i, dummy.matrix);
            if (i % 500 === 0 && meshRef.current) meshRef.current.instanceMatrix.needsUpdate = true;
          },
          onComplete: () => {
            if (i === PARTICLE_COUNT - 1 && phase !== 'nebula') setPhase('nebula');
          }
        });
      }
      if (ornamentsRef.current) gsap.to(ornamentsRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.6 });
    }

    if (phase === 'collapsing') {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const target = new THREE.Vector3(treePositions[i * 3], treePositions[i * 3 + 1], treePositions[i * 3 + 2]);
        const startX = nebulaPositions[i * 3];
        const startY = nebulaPositions[i * 3 + 1];
        const startZ = nebulaPositions[i * 3 + 2];
        gsap.to({}, {
          duration: 1.8,
          ease: "power2.inOut",
          onUpdate: function() {
            const p = this.progress();
            dummy.position.set(startX + (target.x - startX) * p, startY + (target.y - startY) * p, startZ + (target.z - startZ) * p);
            dummy.scale.setScalar(0.4 - (0.4 - 0.08) * p);
            dummy.updateMatrix();
            meshRef.current?.setMatrixAt(i, dummy.matrix);
            if (i % 500 === 0 && meshRef.current) meshRef.current.instanceMatrix.needsUpdate = true;
          },
          onComplete: () => {
            if (i === PARTICLE_COUNT - 1) setPhase('tree');
          }
        });
      }
      if (ornamentsRef.current) gsap.to(ornamentsRef.current.scale, { x: 1, y: 1, z: 1, duration: 1, delay: 0.5 });
      if (heartRef.current) gsap.to(heartRef.current.scale, { x: 1, y: 1, z: 1, duration: 1, delay: 0.5 });
    }
  }, [phase, wishSent, treePositions, nebulaPositions, setPhase]);

  useFrame(({ mouse, clock }) => {
    if (treeGroupRef.current) {
      const targetRot = (handPos.x || mouse.x) * Math.PI * 0.8;
      treeGroupRef.current.rotation.y = THREE.MathUtils.lerp(treeGroupRef.current.rotation.y, targetRot, 0.05);
      const lerpedZoom = THREE.MathUtils.lerp(treeGroupRef.current.scale.x, zoom, 0.1);
      treeGroupRef.current.scale.setScalar(lerpedZoom);
    }

    if (phase === 'tree' && !wishSent && meshRef.current) {
      const time = clock.getElapsedTime();
      const dummy = new THREE.Object3D();
      const mat = new THREE.Matrix4();
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        meshRef.current.getMatrixAt(i, mat);
        dummy.position.setFromMatrixPosition(mat);
        const orig = new THREE.Vector3(treePositions[i * 3], treePositions[i * 3 + 1], treePositions[i * 3 + 2]);
        orig.x += Math.sin(time + i * 0.05) * 0.03;
        dummy.position.lerp(orig, 0.05);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <Stars radius={120} depth={60} count={6000} factor={4} saturation={0} fade speed={1.2} />
      <Sparkles count={500} scale={18} size={4} speed={0.5} color="#FFD1DC" />
      <SnowTrail />

      <group ref={treeGroupRef}>
        <instancedMesh ref={meshRef} args={[null!, null!, PARTICLE_COUNT]}>
          <sphereGeometry args={[0.2, 12, 12]} />
          <meshStandardMaterial metalness={0.5} roughness={0.2} transparent opacity={0.85} />
        </instancedMesh>

        <instancedMesh ref={ornamentsRef} args={[null!, null!, ORNAMENT_COUNT]}>
          <sphereGeometry args={[0.45, 16, 16]} />
          <meshStandardMaterial metalness={1} roughness={0.1} />
        </instancedMesh>

        <instancedMesh ref={heartParticlesRef} args={[null!, null!, HEART_PARTICLE_COUNT]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial emissive={COLORS.wineRed} emissiveIntensity={5} />
        </instancedMesh>

        <group ref={heartRef} position={[0, 5, 0]}>
          <Float speed={5} rotationIntensity={1} floatIntensity={1}>
            <Heart color={COLORS.wineRed} visible={!wishSent && phase === 'tree'} />
            <pointLight intensity={30} color="#FFD1DC" distance={10} />
          </Float>
        </group>
      </group>

      {wishSent && (
        <Html position={[0, 8, 0]} center transform occlude="blending">
          <div className="text-white font-cursive text-5xl md:text-8xl whitespace-nowrap drop-shadow-[0_0_25px_rgba(255,182,193,0.9)] animate-bounce text-center">
             <span className="bg-pink-400/40 backdrop-blur-2xl px-16 py-8 rounded-[4rem] border-2 border-white/60 shadow-2xl">
              {wishText || "Happy Holiday!"}
             </span>
          </div>
        </Html>
      )}
    </group>
  );
};

export default ChristmasTree;
