'use client';

import { useRef, useMemo, useEffect, useState, type MutableRefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ================================================================== *
 *  Constants                                                          *
 * ================================================================== */

const P = 65_000;
const C = 1024;
const WORLD_SPAN = 4.0;
const PHASE_DUR = 4.0;    // seconds for one morph direction

/* ================================================================== *
 *  Image-based pixel sampling                                         *
 * ================================================================== */

interface ShapeData {
  positions: Float32Array;
  sizes: Float32Array;
}

function sampleFromImage(img: HTMLImageElement): ShapeData {
  const positions = new Float32Array(P * 3);
  const sizes = new Float32Array(P);
  if (typeof document === 'undefined') return { positions, sizes };

  const cvs = document.createElement('canvas');
  cvs.width = C;
  cvs.height = C;
  const ctx = cvs.getContext('2d');
  if (!ctx) return { positions, sizes };

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, C, C);

  const aspect = img.width / img.height;
  let dw = C, dh = C;
  if (aspect > 1) { dh = C / aspect; } else { dw = C * aspect; }
  const dx = (C - dw) / 2;
  const dy = (C - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);

  const data = ctx.getImageData(0, 0, C, C).data;
  const cands: { x: number; y: number; b: number }[] = [];

  for (let y = 0; y < C; y++) {
    for (let x = 0; x < C; x++) {
      const idx = (y * C + x) * 4;
      const r = data[idx] ?? 0;
      const g = data[idx + 1] ?? 0;
      const b = data[idx + 2] ?? 0;
      const bright = Math.max(r, g, b);

      // Threshold 50: cuts background glow, only actual traces + nodes.
      // Dark space between traces stays empty = circuit-board look.
      if (bright < 50) continue;

      let weight = 1;
      if (bright > 230) weight = 12;
      else if (bright > 190) weight = 8;
      else if (bright > 150) weight = 5;
      else if (bright > 110) weight = 3;
      else if (bright > 75) weight = 2;

      for (let w = 0; w < weight; w++) {
        cands.push({ x, y, b: bright });
      }
    }
  }

  const count = cands.length;
  if (count === 0) return { positions, sizes };

  for (let i = 0; i < P; i++) {
    const pick = cands[Math.floor(Math.random() * count)]!;
    // Sub-pixel jitter: slight randomness to avoid grid artifacts
    const jx = pick.x + (Math.random() - 0.5) * 0.8;
    const jy = pick.y + (Math.random() - 0.5) * 0.8;
    positions[i * 3] = ((jx / C) - 0.5) * WORLD_SPAN;
    positions[i * 3 + 1] = (0.5 - (jy / C)) * WORLD_SPAN;
    // Thin Z layer: glow nodes slightly forward, traces flat
    const n = pick.b / 255;
    positions[i * 3 + 2] = (n - 0.5) * 0.05 + (Math.random() - 0.5) * 0.02;

    // Small sharp particles: thin traces (0.15) ↔ junction nodes (1.2)
    // Linear curve keeps everything tight — no blob blow-out
    sizes[i] = 0.15 + n * 1.05;
  }

  return { positions, sizes };
}

/* ================================================================== *
 *  Ocean wave state                                                   *
 * ================================================================== */

function ocean(): ShapeData {
  const positions = new Float32Array(P * 3);
  const sizes = new Float32Array(P);
  for (let i = 0; i < P; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 7;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
    sizes[i] = 0.6 + Math.random() * 1.0;
  }
  return { positions, sizes };
}

/* ================================================================== *
 *  Helpers                                                            *
 * ================================================================== */

function smoothstep(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

/* ================================================================== *
 *  Custom shader                                                      *
 * ================================================================== */

const vertexShader = /* glsl */ `
  attribute float aSize;
  varying float vBright;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (14.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
    vBright = clamp(aSize / 1.2, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vBright;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float glow = smoothstep(0.5, 0.18, d);
    float alpha = glow * uOpacity * (0.3 + vBright * 0.7);
    vec3 col = mix(uColor, vec3(1.0), vBright * 0.3);
    gl_FragColor = vec4(col, alpha);
  }
`;

/* ================================================================== *
 *  MorphingParticles                                                  *
 *  Stays as ocean until triggeredRef flips to true, then starts       *
 *  cosine boomerang: ocean ↔ brain forever.                           *
 * ================================================================== */

function MorphingParticles({ triggeredRef }: { triggeredRef: MutableRefObject<boolean> }) {
  const meshRef = useRef<THREE.Points>(null);

  const oceanData = useMemo(() => ocean(), []);
  const brainRef = useRef<ShapeData>(oceanData);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { brainRef.current = sampleFromImage(img); };
    img.src = '/shapes/brain.png';
  }, []);

  const pos = useMemo(() => new Float32Array(P * 3), []);
  const sizeArr = useMemo(() => { const s = new Float32Array(P); s.fill(1); return s; }, []);
  const offsets = useMemo(() => {
    const o = new Float32Array(P);
    for (let i = 0; i < P; i++) o[i] = Math.random();
    return o;
  }, []);

  const uniforms = useRef({
    uColor: { value: new THREE.Color('#00d4aa') },
    uOpacity: { value: 0.4 },
  });

  // Captures the R3F clock time on the first frame after trigger
  const morphStartRef = useRef(-1);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const brain = brainRef.current;
    const time = clock.getElapsedTime();

    // Before trigger: blend stays 0 (pure ocean with waves)
    // After trigger: cosine boomerang starting from the click moment
    let rawBlend = 0;
    if (triggeredRef.current) {
      if (morphStartRef.current < 0) morphStartRef.current = time;
      const morphTime = time - morphStartRef.current;
      rawBlend = 0.5 - 0.5 * Math.cos(morphTime * Math.PI / PHASE_DUR);
    }

    const oP = oceanData.positions;
    const oS = oceanData.sizes;
    const bP = brain.positions;
    const bS = brain.sizes;

    for (let i = 0; i < P; i++) {
      const ix = i * 3;
      const off = offsets[i] ?? 0;
      const pb = smoothstep(rawBlend * 1.3 - off * 0.3);

      // --- ocean with wave animation ---
      let fx = oP[ix] ?? 0;
      let fy = oP[ix + 1] ?? 0;
      const fz = oP[ix + 2] ?? 0;
      const oceanW = 1 - pb;

      if (oceanW > 0.01) {
        fy += (Math.sin(time * 0.8 + fx * 1.5 + off * 6) * 0.25
             + Math.cos(time * 0.5 + fz * 2.5) * 0.15) * oceanW;
        fx += Math.sin(time * 0.4 + off * 5) * 0.06 * oceanW;
      }

      // --- brain with alive animation ---
      let tx = bP[ix] ?? 0;
      let ty = bP[ix + 1] ?? 0;
      let tz = bP[ix + 2] ?? 0;
      const brainW = pb;

      if (brainW > 0.01) {
        const phase = off * Math.PI * 2;
        const speed = 0.5 + off * 0.6;
        const pSize = bS[i] ?? 1;
        const drift = (0.015 + (1 - pSize / 1.2) * 0.04) * brainW;

        tx += Math.sin(time * speed + phase) * drift;
        ty += Math.cos(time * speed * 0.8 + phase) * drift;
        tz += Math.sin(time * 0.6 + phase * 1.4) * 0.04 * brainW;
      }

      // --- interpolate with arc ---
      const arc = Math.sin(pb * Math.PI);
      pos[ix] = fx * oceanW + tx * brainW + arc * ((i % 11) / 11 - 0.5) * 0.15;
      pos[ix + 1] = fy * oceanW + ty * brainW + arc * 0.18;
      pos[ix + 2] = fz * oceanW + tz * brainW;

      // --- size + twinkle ---
      let size = (oS[i] ?? 1) * oceanW + (bS[i] ?? 1) * brainW;
      if (brainW > 0.2) {
        size *= 0.82 + 0.18 * Math.sin(time * 2.0 + off * 50);
      }
      sizeArr[i] = size;
    }

    const posAttr = mesh.geometry.attributes.position as THREE.BufferAttribute;
    (posAttr.array as Float32Array).set(pos);
    posAttr.needsUpdate = true;

    const sizeAttr = mesh.geometry.attributes.aSize as THREE.BufferAttribute;
    (sizeAttr.array as Float32Array).set(sizeArr);
    sizeAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} count={P} />
        <bufferAttribute attach="attributes-aSize" args={[sizeArr, 1]} count={P} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ================================================================== *
 *  Brain SVG icon for the trigger button                              *
 * ================================================================== */

function BrainIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2a5 5 0 0 0-4.8 3.6A4.5 4.5 0 0 0 4 10a4.5 4.5 0 0 0 2.2 3.9A4.2 4.2 0 0 0 8 18a4 4 0 0 0 4 4" />
      <path d="M12 2a5 5 0 0 1 4.8 3.6A4.5 4.5 0 0 1 20 10a4.5 4.5 0 0 1-2.2 3.9A4.2 4.2 0 0 1 16 18a4 4 0 0 1-4 4" />
      <path d="M12 2v20" />
      <path d="M8 8h3" />
      <path d="M13 8h3" />
      <path d="M7.5 13h3" />
      <path d="M13.5 13h3" />
    </svg>
  );
}

/* ================================================================== *
 *  Export                                                              *
 * ================================================================== */

export function HeroDivider3D() {
  const triggeredRef = useRef(false);
  const [showButton, setShowButton] = useState(true);

  const handleTrigger = () => {
    triggeredRef.current = true;
    setShowButton(false);
  };

  return (
    <div className="relative z-10 h-[420px] w-full overflow-hidden sm:h-[520px]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-[var(--ink-900)] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-[var(--ink-900)] to-transparent" />

      {/* Brain trigger button */}
      <button
        onClick={handleTrigger}
        aria-label="Ativar visualização do cérebro"
        className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border border-[var(--accent)]/40 bg-[var(--ink-900)]/60 text-[var(--accent)] backdrop-blur-sm transition-all duration-700 hover:scale-110 hover:border-[var(--accent)]/80 hover:shadow-[0_0_24px_rgba(0,212,170,0.3)] sm:h-20 sm:w-20"
        style={{
          opacity: showButton ? 1 : 0,
          pointerEvents: showButton ? 'auto' : 'none',
        }}
      >
        <BrainIcon className="h-8 w-8 sm:h-10 sm:w-10" />
        <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-widest text-[var(--accent)]" style={{ opacity: 0.7 }}>
          clique aqui
        </span>
      </button>

      <Canvas
        camera={{ position: [0, 0.1, 3.2], fov: 55 }}
        gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]}
      >
        <MorphingParticles triggeredRef={triggeredRef} />
      </Canvas>
    </div>
  );
}
