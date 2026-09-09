'use client';

import { useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Grid de caracteres flutuando como ondas
const COLS = 64;
const ROWS = 20;
const COUNT = COLS * ROWS;
const SPREAD_X = 18;
const SPREAD_Z = 6;

// Caracteres estilo Matrix/código
const CHARS = '01{}[]<>/;:=+-%$#@!?&|~^アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

function CodeOcean() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Gerar texturas de caracteres num canvas 2D
  const charTextures = useMemo(() => {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    const textures: THREE.CanvasTexture[] = [];
    const subset = CHARS.split('').filter((_, i) => i % 3 === 0); // Pega um a cada 3

    for (const char of subset) {
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = '#00d4aa';
      ctx.font = `bold ${size * 0.7}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(char, size / 2, size / 2);
      const tex = new THREE.CanvasTexture(ctx.getImageData(0, 0, size, size) as unknown as HTMLCanvasElement);
      // Na verdade, precisamos clonar o canvas para cada textura
      const cloned = document.createElement('canvas');
      cloned.width = size;
      cloned.height = size;
      const clonedCtx = cloned.getContext('2d');
      clonedCtx?.drawImage(canvas, 0, 0);
      textures.push(new THREE.CanvasTexture(cloned));
    }
    return textures;
  }, []);

  // Posições base no grid
  const gridData = useMemo(() => {
    const data: { x: number; z: number; phase: number; speed: number; charIdx: number }[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        data.push({
          x: (c / (COLS - 1) - 0.5) * SPREAD_X,
          z: (r / (ROWS - 1) - 0.5) * SPREAD_Z,
          phase: Math.random() * Math.PI * 2,
          speed: 0.3 + Math.random() * 0.4,
          charIdx: Math.floor(Math.random() * Math.max(1, charTextures.length)),
        });
      }
    }
    return data;
  }, [charTextures.length]);

  const updateInstances = useCallback((time: number) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    for (let i = 0; i < COUNT; i++) {
      const d = gridData[i];
      if (!d) continue;

      // Onda composta: duas senoides cruzadas
      const wave1 = Math.sin(time * d.speed + d.x * 0.4 + d.phase) * 0.35;
      const wave2 = Math.cos(time * 0.3 + d.z * 0.6 + d.phase * 0.5) * 0.2;
      const y = wave1 + wave2;

      dummy.position.set(d.x, y, d.z);
      // Caracteres olham pra câmera (billboard manual no eixo Y)
      dummy.rotation.set(-0.8, 0, 0);
      // Escala baseada na altura da onda — mais alto = mais visível
      const scale = 0.08 + Math.abs(y) * 0.12;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [dummy, gridData]);

  useFrame(({ clock }) => {
    updateInstances(clock.getElapsedTime());
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        color="#00d4aa"
        transparent
        opacity={0.5}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}

// Pontos de brilho espalhados que pulsam
function GlowDots() {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const count = 200;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * SPREAD_X;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 1.2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * SPREAD_Z;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh) return;
    const mat = mesh.material as THREE.PointsMaterial;
    mat.opacity = 0.3 + Math.sin(clock.getElapsedTime() * 0.8) * 0.15;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={200} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#00d4aa"
        transparent
        opacity={0.3}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function HeroDivider3D() {
  return (
    <div className="relative z-10 h-[140px] w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-[var(--ink-900)] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-[var(--ink-900)] to-transparent" />
      <Canvas
        camera={{ position: [0, 3, 5], fov: 45 }}
        gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]}
      >
        <CodeOcean />
        <GlowDots />
      </Canvas>
    </div>
  );
}
