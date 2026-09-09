'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/*  Formas: cada shape é um array de pontos [x, y] normalizados -1..1 */
/*  As partículas morpham entre elas em ciclo.                         */
/* ------------------------------------------------------------------ */

function generateBrain(count: number): Float32Array {
  const pts = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    // Formato de cérebro: duas metades arredondadas com sulcos
    const side = i % 2 === 0 ? 1 : -1;
    const r = 0.7 + Math.sin(t * 5) * 0.08 + Math.sin(t * 13) * 0.04;
    const x = Math.cos(t) * r * 0.55 + side * 0.15;
    const y = Math.sin(t) * r * 0.75;
    // Sulcos — ondulações ao longo da superfície
    const sulcus = Math.sin(t * 8 + side * 2) * 0.06;
    pts[i * 3] = x + sulcus;
    pts[i * 3 + 1] = y;
    pts[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
  }
  return pts;
}

function generateShark(count: number): Float32Array {
  const pts = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    // Corpo do tubarão: elipse achatada com cauda e barbatana
    const bodyX = Math.cos(t) * 0.9;
    const bodyY = Math.sin(t) * 0.35;
    // Barbatana dorsal
    const finT = Math.max(0, 1 - Math.abs(t - Math.PI * 0.6) * 2);
    const finY = finT * finT * 0.6;
    // Cauda
    const tailT = Math.max(0, 1 - Math.abs(t - Math.PI) * 1.2);
    const tailX = tailT * tailT * -0.4;
    const tailY = Math.sin(t * 2) * tailT * 0.3;
    pts[i * 3] = bodyX + tailX;
    pts[i * 3 + 1] = bodyY + finY + tailY;
    pts[i * 3 + 2] = (Math.random() - 0.5) * 0.25;
  }
  return pts;
}

function generateRobot(count: number): Float32Array {
  const pts = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const section = i / count;
    let x: number, y: number;

    if (section < 0.25) {
      // Cabeça — retângulo
      const t = (section / 0.25) * Math.PI * 2;
      const hw = 0.3, hh = 0.25;
      if (t < Math.PI * 0.5) { x = hw; y = 0.45 + (t / (Math.PI * 0.5)) * hh; }
      else if (t < Math.PI) { x = hw - ((t - Math.PI * 0.5) / (Math.PI * 0.5)) * hw * 2; y = 0.45 + hh; }
      else if (t < Math.PI * 1.5) { x = -hw; y = 0.45 + hh - ((t - Math.PI) / (Math.PI * 0.5)) * hh; }
      else { x = -hw + ((t - Math.PI * 1.5) / (Math.PI * 0.5)) * hw * 2; y = 0.45; }
    } else if (section < 0.35) {
      // Olhos
      const side = i % 2 === 0 ? -1 : 1;
      const t = ((section - 0.25) / 0.1) * Math.PI * 2;
      x = side * 0.15 + Math.cos(t) * 0.08;
      y = 0.58 + Math.sin(t) * 0.06;
    } else if (section < 0.65) {
      // Torso — retângulo maior
      const t = ((section - 0.35) / 0.3) * Math.PI * 2;
      const tw = 0.4, th = 0.35;
      if (t < Math.PI * 0.5) { x = tw; y = ((t / (Math.PI * 0.5)) * th); }
      else if (t < Math.PI) { x = tw - ((t - Math.PI * 0.5) / (Math.PI * 0.5)) * tw * 2; y = th; }
      else if (t < Math.PI * 1.5) { x = -tw; y = th - ((t - Math.PI) / (Math.PI * 0.5)) * th; }
      else { x = -tw + ((t - Math.PI * 1.5) / (Math.PI * 0.5)) * tw * 2; y = 0; }
    } else if (section < 0.8) {
      // Braços
      const side = i % 2 === 0 ? -1 : 1;
      const t = (section - 0.65) / 0.15;
      x = side * (0.4 + t * 0.15);
      y = 0.3 - t * 0.3;
    } else {
      // Pernas
      const side = i % 2 === 0 ? -1 : 1;
      const t = (section - 0.8) / 0.2;
      x = side * 0.18;
      y = -t * 0.4;
    }
    pts[i * 3] = x;
    pts[i * 3 + 1] = y;
    pts[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
  }
  return pts;
}

function generateOcean(count: number): Float32Array {
  const pts = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pts[i * 3] = (Math.random() - 0.5) * 2.4;
    pts[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
    pts[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
  }
  return pts;
}

/* ------------------------------------------------------------------ */
/*  Lerp suave entre shapes                                            */
/* ------------------------------------------------------------------ */

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/* ------------------------------------------------------------------ */
/*  Scene                                                              */
/* ------------------------------------------------------------------ */

const PARTICLE_COUNT = 1500;
const SHAPE_DURATION = 4;   // Segundos por forma
const MORPH_DURATION = 1.5; // Segundos da transição

function MorphingParticles() {
  const meshRef = useRef<THREE.Points>(null);

  const shapes = useMemo(() => [
    generateOcean(PARTICLE_COUNT),
    generateBrain(PARTICLE_COUNT),
    generateOcean(PARTICLE_COUNT),
    generateShark(PARTICLE_COUNT),
    generateOcean(PARTICLE_COUNT),
    generateRobot(PARTICLE_COUNT),
  ], []);

  const currentPositions = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);
  const offsets = useMemo(() => {
    const o = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) o[i] = Math.random() * 0.3;
    return o;
  }, []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const time = clock.getElapsedTime();
    const totalCycle = shapes.length * SHAPE_DURATION;
    const loopTime = time % totalCycle;
    const shapeIdx = Math.floor(loopTime / SHAPE_DURATION);
    const nextIdx = (shapeIdx + 1) % shapes.length;
    const elapsed = loopTime - shapeIdx * SHAPE_DURATION;

    // Transição acontece nos últimos MORPH_DURATION segundos de cada shape
    const morphStart = SHAPE_DURATION - MORPH_DURATION;
    let blend = 0;
    if (elapsed > morphStart) {
      blend = smoothstep((elapsed - morphStart) / MORPH_DURATION);
    }

    const from = shapes[shapeIdx]!;
    const to = shapes[nextIdx]!;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3;
      const off = offsets[i] ?? 0;
      // Offset individual no timing do morph pra não ser uniforme
      const particleBlend = Math.min(1, Math.max(0, blend + (off - 0.15) * 0.6));
      const t = smoothstep(particleBlend);

      currentPositions[ix] = (from[ix] ?? 0) * (1 - t) + (to[ix] ?? 0) * t;
      currentPositions[ix + 1] = (from[ix + 1] ?? 0) * (1 - t) + (to[ix + 1] ?? 0) * t;
      currentPositions[ix + 2] = (from[ix + 2] ?? 0) * (1 - t) + (to[ix + 2] ?? 0) * t;

      // Micro-flutuação constante
      currentPositions[ix + 1] = (currentPositions[ix + 1] ?? 0) + Math.sin(time * 0.6 + i * 0.02) * 0.015;
    }

    const geo = mesh.geometry;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    (pos.array as Float32Array).set(currentPositions);
    pos.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[currentPositions, 3]}
          count={PARTICLE_COUNT}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.018}
        color="#00d4aa"
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function HeroDivider3D() {
  return (
    <div className="relative z-10 h-[160px] w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-[var(--ink-900)] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-[var(--ink-900)] to-transparent" />
      <Canvas
        camera={{ position: [0, 0, 2.8], fov: 50 }}
        gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]}
      >
        <MorphingParticles />
      </Canvas>
    </div>
  );
}
