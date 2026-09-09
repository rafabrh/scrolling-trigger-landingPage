'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ================================================================== *
 *  SDF primitives — building blocks for all shapes                    *
 * ================================================================== */

const sdCircle = (x: number, y: number, cx: number, cy: number, r: number) =>
  Math.hypot(x - cx, y - cy) - r;

const sdBox = (x: number, y: number, cx: number, cy: number, hw: number, hh: number) => {
  const dx = Math.abs(x - cx) - hw;
  const dy = Math.abs(y - cy) - hh;
  return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0);
};

/** Smooth union — blends two SDF shapes. */
const opSU = (a: number, b: number, k: number) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
};

/* ================================================================== *
 *  Shape SDFs — precise signed-distance definitions                   *
 * ================================================================== */

/** Brain — side view profile with gyri texture. */
function brainSDF(x: number, y: number): number {
  // Main cerebrum mass (elliptical)
  let d = sdCircle(x / 1.15, y / 0.92, 0, 0.05, 0.58);
  // Frontal lobe
  d = opSU(d, sdCircle(x, y, 0.38, 0.18, 0.34), 0.18);
  // Parietal region
  d = opSU(d, sdCircle(x, y, -0.05, 0.38, 0.30), 0.15);
  // Temporal lobe
  d = opSU(d, sdCircle(x, y, 0.28, -0.20, 0.27), 0.12);
  // Occipital region
  d = opSU(d, sdCircle(x, y, -0.38, 0.08, 0.26), 0.12);
  // Cerebellum
  d = opSU(d, sdCircle(x, y, -0.48, -0.22, 0.20), 0.08);
  // Brain stem
  d = opSU(d, sdBox(x, y, -0.38, -0.48, 0.065, 0.12), 0.06);
  // Gyri bumps along the surface
  const a = Math.atan2(y - 0.05, x);
  d += Math.sin(a * 11) * 0.014 + Math.sin(a * 19) * 0.006;
  return d;
}

/** Shark — side view profile. */
function sharkSDF(x: number, y: number): number {
  // Torpedo body (elongated ellipse via coordinate stretch)
  let d = sdCircle(x / 1.9, y / 0.42, 0, 0, 0.38);
  // Tapered snout
  d = opSU(d, sdCircle(x / 1.35, y / 0.32, 0.52, -0.01, 0.20), 0.14);
  // Dorsal fin — two circles merged into teardrop
  const finBase = sdCircle(x, y, -0.12, 0.28, 0.18);
  const finTip = sdCircle(x, y, -0.10, 0.52, 0.08);
  d = opSU(d, opSU(finBase, finTip, 0.14), 0.10);
  // Upper tail lobe
  d = opSU(d, sdCircle(x / 0.65, y, -0.98, 0.20, 0.13), 0.06);
  // Lower tail lobe
  d = opSU(d, sdCircle(x / 0.65, y, -0.94, -0.10, 0.09), 0.05);
  // Pectoral fin
  d = opSU(d, sdCircle(x / 1.1, y / 0.70, 0.18, -0.30, 0.11), 0.06);
  return d;
}

/** Robot — front view with head, torso, limbs. */
function robotSDF(x: number, y: number): number {
  // Head
  let d = sdBox(x, y, 0, 0.68, 0.28, 0.20);
  // Antenna rod + tip
  d = Math.min(d, sdBox(x, y, 0, 0.95, 0.02, 0.06));
  d = Math.min(d, sdCircle(x, y, 0, 1.03, 0.035));
  // Eyes
  d = Math.min(d, sdCircle(x, y, -0.13, 0.72, 0.055));
  d = Math.min(d, sdCircle(x, y, 0.13, 0.72, 0.055));
  // Neck
  d = opSU(d, sdBox(x, y, 0, 0.42, 0.07, 0.06), 0.04);
  // Torso
  d = opSU(d, sdBox(x, y, 0, 0.10, 0.36, 0.26), 0.05);
  // Chest panel detail
  d = Math.min(d, sdBox(x, y, 0, 0.12, 0.20, 0.14));
  // Arms
  d = opSU(d, sdBox(x, y, -0.50, 0.10, 0.08, 0.25), 0.04);
  d = opSU(d, sdBox(x, y, 0.50, 0.10, 0.08, 0.25), 0.04);
  // Hands
  d = Math.min(d, sdCircle(x, y, -0.50, -0.17, 0.055));
  d = Math.min(d, sdCircle(x, y, 0.50, -0.17, 0.055));
  // Legs
  d = opSU(d, sdBox(x, y, -0.15, -0.42, 0.09, 0.20), 0.04);
  d = opSU(d, sdBox(x, y, 0.15, -0.42, 0.09, 0.20), 0.04);
  // Feet
  d = opSU(d, sdBox(x, y, -0.15, -0.64, 0.12, 0.035), 0.03);
  d = opSU(d, sdBox(x, y, 0.15, -0.64, 0.12, 0.035), 0.03);
  return d;
}

/* ================================================================== *
 *  Grid-based shape sampling — circuit-board particle placement       *
 * ================================================================== */

const P = 6000;
const SHAPE_SCALE = 1.6;

/**
 * Samples P particles inside an SDF using three layers:
 *  1. Edge particles — crisp outline along the SDF boundary
 *  2. Trace particles — horizontal/vertical grid lines (circuit board traces)
 *  3. Fill particles — random interior for density
 */
function sampleShape(sdf: (x: number, y: number) => number): Float32Array {
  const arr = new Float32Array(P * 3);
  const BX = 2.2, BY = 1.8;
  const EDGE_GRID = 220;
  const EDGE_THRESH = 0.035;
  const TRACE_STEP = 0.09;
  const TRACE_DENSITY = 0.025;

  /* Phase 1 — Edge points (SDF boundary) */
  const edgePts: number[] = [];
  for (let gx = 0; gx < EDGE_GRID; gx++) {
    for (let gy = 0; gy < EDGE_GRID; gy++) {
      const x = (gx / (EDGE_GRID - 1) - 0.5) * BX * 2;
      const y = (gy / (EDGE_GRID - 1) - 0.5) * BY * 2;
      const d = sdf(x, y);
      if (d < 0 && d > -EDGE_THRESH) {
        edgePts.push(x, y);
      }
    }
  }

  /* Phase 2 — Circuit trace points (grid lines inside shape) */
  const tracePts: number[] = [];
  const minB = -BX, maxB = BX, minY = -BY, maxY = BY;

  // Horizontal traces
  for (let row = minY; row <= maxY; row += TRACE_STEP) {
    for (let col = minB; col <= maxB; col += TRACE_DENSITY) {
      if (sdf(col, row) < -0.015) tracePts.push(col, row);
    }
  }
  // Vertical traces
  for (let col = minB; col <= maxB; col += TRACE_STEP) {
    for (let row = minY; row <= maxY; row += TRACE_DENSITY) {
      if (sdf(col, row) < -0.015) tracePts.push(col, row);
    }
  }

  /* Phase 3 — Fill points (random interior) */
  const fillPts: number[] = [];
  const FILL_GRID = 150;
  for (let gx = 0; gx < FILL_GRID; gx++) {
    for (let gy = 0; gy < FILL_GRID; gy++) {
      const x = (gx / (FILL_GRID - 1) - 0.5) * BX * 2;
      const y = (gy / (FILL_GRID - 1) - 0.5) * BY * 2;
      if (sdf(x, y) < -0.01) fillPts.push(x, y);
    }
  }

  /* Distribute particles across the three layers */
  const edgeN = Math.min(Math.floor(P * 0.30), Math.floor(edgePts.length / 2));
  const traceN = Math.min(Math.floor(P * 0.55), Math.floor(tracePts.length / 2));
  const fillN = P - edgeN - traceN;

  let idx = 0;

  // Edge — tight noise for organic feel
  for (let i = 0; i < edgeN; i++) {
    const pick = Math.floor(Math.random() * (edgePts.length / 2)) * 2;
    arr[idx] = ((edgePts[pick] ?? 0) + (Math.random() - 0.5) * 0.008) * SHAPE_SCALE;
    arr[idx + 1] = ((edgePts[pick + 1] ?? 0) + (Math.random() - 0.5) * 0.008) * SHAPE_SCALE;
    arr[idx + 2] = (Math.random() - 0.5) * 0.06;
    idx += 3;
  }

  // Traces — minimal noise to preserve grid lines
  for (let i = 0; i < traceN; i++) {
    const pick = Math.floor(Math.random() * (tracePts.length / 2)) * 2;
    arr[idx] = ((tracePts[pick] ?? 0) + (Math.random() - 0.5) * 0.005) * SHAPE_SCALE;
    arr[idx + 1] = ((tracePts[pick + 1] ?? 0) + (Math.random() - 0.5) * 0.005) * SHAPE_SCALE;
    arr[idx + 2] = (Math.random() - 0.5) * 0.04;
    idx += 3;
  }

  // Fill — general interior scatter
  for (let i = 0; i < fillN; i++) {
    if (fillPts.length >= 2) {
      const pick = Math.floor(Math.random() * (fillPts.length / 2)) * 2;
      arr[idx] = ((fillPts[pick] ?? 0) + (Math.random() - 0.5) * 0.015) * SHAPE_SCALE;
      arr[idx + 1] = ((fillPts[pick + 1] ?? 0) + (Math.random() - 0.5) * 0.015) * SHAPE_SCALE;
    } else {
      arr[idx] = (Math.random() - 0.5) * 2 * SHAPE_SCALE;
      arr[idx + 1] = (Math.random() - 0.5) * 1.5 * SHAPE_SCALE;
    }
    arr[idx + 2] = (Math.random() - 0.5) * 0.05;
    idx += 3;
  }

  return arr;
}

/** Ocean wave — wide horizontal scatter (base/transition state). */
function ocean(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    a[i * 3] = (Math.random() - 0.5) * 6;
    a[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
    a[i * 3 + 2] = (Math.random() - 0.5) * 2;
  }
  return a;
}

/* ================================================================== *
 *  Morph animation                                                    *
 * ================================================================== */

function smoothstep(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

const HOLD = 4;    // seconds each shape is visible
const MORPH = 1.8; // seconds for the morph transition

function MorphingParticles() {
  const meshRef = useRef<THREE.Points>(null);

  // Shape cycle: ocean → brain → ocean → shark → ocean → robot → loop
  const shapes = useMemo(() => [
    ocean(P),
    sampleShape(brainSDF),
    ocean(P),
    sampleShape(sharkSDF),
    ocean(P),
    sampleShape(robotSDF),
  ], []);

  const pos = useMemo(() => new Float32Array(P * 3), []);
  const offsets = useMemo(() => {
    const o = new Float32Array(P);
    for (let i = 0; i < P; i++) o[i] = Math.random();
    return o;
  }, []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const time = clock.getElapsedTime();
    const cycle = shapes.length * HOLD;
    const loop = time % cycle;
    const shapeIdx = Math.floor(loop / HOLD);
    const nextIdx = (shapeIdx + 1) % shapes.length;
    const elapsed = loop - shapeIdx * HOLD;

    // Blend ramps up during the last MORPH seconds of each hold
    const morphStart = HOLD - MORPH;
    let blend = 0;
    if (elapsed > morphStart) {
      blend = (elapsed - morphStart) / MORPH;
    }

    const from = shapes[shapeIdx]!;
    const to = shapes[nextIdx]!;

    const isFromOcean = shapeIdx % 2 === 0;
    const isToOcean = nextIdx % 2 === 0;

    for (let i = 0; i < P; i++) {
      const ix = i * 3;
      const off = offsets[i] ?? 0;
      // Per-particle staggered morph
      const pb = smoothstep(blend * 1.5 - off * 0.5);

      let fx = from[ix] ?? 0;
      let fy = from[ix + 1] ?? 0;
      const fz = from[ix + 2] ?? 0;
      let tx = to[ix] ?? 0;
      let ty = to[ix + 1] ?? 0;
      const tz = to[ix + 2] ?? 0;

      // Animate ocean state with sine waves
      if (isFromOcean && pb < 0.5) {
        fy += Math.sin(time * 0.6 + fx * 1.2 + off * 6) * 0.2
            + Math.cos(time * 0.35 + fz * 2) * 0.12;
        fx += Math.sin(time * 0.25 + off * 4) * 0.04;
      }
      if (isToOcean && pb > 0.5) {
        ty += Math.sin(time * 0.6 + tx * 1.2 + off * 6) * 0.2
            + Math.cos(time * 0.35 + tz * 2) * 0.12;
        tx += Math.sin(time * 0.25 + off * 4) * 0.04;
      }

      // Interpolate with arc motion during morph
      const arc = Math.sin(pb * Math.PI);
      pos[ix] = fx * (1 - pb) + tx * pb + arc * ((i % 11) / 11 - 0.5) * 0.15;
      pos[ix + 1] = fy * (1 - pb) + ty * pb + arc * 0.2;
      pos[ix + 2] = fz * (1 - pb) + tz * pb;

      // Subtle floating motion (always active)
      pos[ix + 1] = (pos[ix + 1] ?? 0) + Math.sin(time * 0.8 + i * 0.005) * 0.006;
    }

    const attr = mesh.geometry.attributes.position as THREE.BufferAttribute;
    (attr.array as Float32Array).set(pos);
    attr.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} count={P} />
      </bufferGeometry>
      <pointsMaterial
        size={0.028}
        color="#00d4aa"
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ================================================================== *
 *  Export                                                              *
 * ================================================================== */

export function HeroDivider3D() {
  return (
    <div className="relative z-10 h-[420px] w-full overflow-hidden sm:h-[520px]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-[var(--ink-900)] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-[var(--ink-900)] to-transparent" />
      <Canvas
        camera={{ position: [0, 0.1, 3.2], fov: 55 }}
        gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]}
      >
        <MorphingParticles />
      </Canvas>
    </div>
  );
}
