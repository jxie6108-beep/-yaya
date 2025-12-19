
import * as THREE from 'three';

export const generateTreePositions = (count: number, height: number, radius: number) => {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = Math.random() * radius;
    const h = Math.random() * height;
    // Taper the radius as height increases
    const currentRadius = radius * (1 - h / height);
    const angle = Math.random() * Math.PI * 2;
    
    const x = Math.cos(angle) * (Math.random() * currentRadius);
    const z = Math.sin(angle) * (Math.random() * currentRadius);
    const y = h - height / 2;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  return positions;
};

export const generateNebulaPositions = (count: number, radius: number) => {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = radius + (Math.random() - 0.5) * (radius * 0.4);
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const y = (Math.random() - 0.5) * (radius * 0.2);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  return positions;
};
