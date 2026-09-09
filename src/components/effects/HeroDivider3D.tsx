'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ================================================================== *
 *  Constants                                                          *
 * ================================================================== */

const P = 6000;
const C = 512;            // Canvas resolution for pixel sampling
const TRACE_GAP = 13;     // Pixel spacing between circuit traces
const TRACE_W = 1.4;      // Trace line width (px)
const OUTLINE_W = 3.2;    // Shape outline stroke width (px)
const NODE_R = 2.2;       // Junction node radius (px)
const WORLD_SPAN = 3.8;   // World-space extent of shapes

/* ================================================================== *
 *  Canvas 2D pixel sampling — the professional technique              *
 *  (Codrops / Three.js Journey / Loopspeed approach)                  *
 *                                                                     *
 *  1. Draw shape + circuit traces on a hidden canvas                  *
 *  2. getImageData → collect all opaque pixel positions               *
 *  3. Randomly sample P positions → Float32Array                      *
 * ================================================================== */

function samplePixels(
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
): Float32Array {
  const arr = new Float32Array(P * 3);
  if (typeof document === 'undefined') return arr;

  const cvs = document.createElement('canvas');
  cvs.width = C;
  cvs.height = C;
  const ctx = cvs.getContext('2d');
  if (!ctx) return arr;

  draw(ctx, C, C);

  const data = ctx.getImageData(0, 0, C, C).data;
  const pts: number[] = [];
  for (let y = 0; y < C; y++) {
    for (let x = 0; x < C; x++) {
      if ((data[(y * C + x) * 4 + 3] ?? 0) > 128) pts.push(x, y);
    }
  }

  const count = pts.length / 2;
  if (count === 0) return arr;

  for (let i = 0; i < P; i++) {
    const pick = Math.floor(Math.random() * count) * 2;
    arr[i * 3] = ((pts[pick]! / C) - 0.5) * WORLD_SPAN;
    arr[i * 3 + 1] = (0.5 - (pts[pick + 1]! / C)) * WORLD_SPAN;
    arr[i * 3 + 2] = (Math.random() - 0.5) * 0.06;
  }

  return arr;
}

/* ================================================================== *
 *  Circuit trace grid — drawn before clipping to shape                *
 * ================================================================== */

function drawTraces(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.strokeStyle = 'white';
  ctx.lineWidth = TRACE_W;

  for (let y = TRACE_GAP; y < h; y += TRACE_GAP) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  for (let x = TRACE_GAP; x < w; x += TRACE_GAP) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  ctx.fillStyle = 'white';
  for (let y = TRACE_GAP; y < h; y += TRACE_GAP) {
    for (let x = TRACE_GAP; x < w; x += TRACE_GAP) {
      ctx.beginPath();
      ctx.arc(x, y, NODE_R, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/* ================================================================== *
 *  Shape outline helper                                               *
 * ================================================================== */

type EllipseSpec = readonly [cx: number, cy: number, rx: number, ry: number, rot: number];

function strokeEllipses(ctx: CanvasRenderingContext2D, specs: readonly EllipseSpec[]) {
  ctx.strokeStyle = 'white';
  ctx.lineWidth = OUTLINE_W;
  for (const [cx, cy, rx, ry, rot] of specs) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function fillUnion(ctx: CanvasRenderingContext2D, specs: readonly EllipseSpec[]) {
  ctx.fillStyle = 'white';
  ctx.beginPath();
  for (const [cx, cy, rx, ry, rot] of specs) {
    ctx.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2);
  }
  ctx.fill('nonzero');
}

/* ================================================================== *
 *  Brain — side-view profile                                          *
 * ================================================================== */

function drawBrain(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w * 0.47, cy = h * 0.44, s = Math.min(w, h) * 0.40;

  const lobes: EllipseSpec[] = [
    [cx, cy, s * 0.85, s * 0.68, -0.12],                       // Cerebrum
    [cx + s * 0.45, cy + s * 0.08, s * 0.42, s * 0.50, 0.22],  // Frontal
    [cx + s * 0.20, cy + s * 0.45, s * 0.34, s * 0.22, 0.12],  // Temporal
    [cx - s * 0.58, cy + s * 0.32, s * 0.24, s * 0.18, -0.15], // Cerebellum
    [cx - s * 0.42, cy + s * 0.60, s * 0.07, s * 0.14, -0.08], // Brainstem
  ];

  // Pass 1: Draw traces + gyri (full canvas)
  drawTraces(ctx, w, h);

  // Gyri — curved sulcus lines
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  // Lateral sulcus
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.65, cy + s * 0.05);
  ctx.bezierCurveTo(cx + s * 0.35, cy + s * 0.12, cx, cy + s * 0.18, cx - s * 0.30, cy + s * 0.10);
  ctx.stroke();
  // Central sulcus
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.18, cy - s * 0.58);
  ctx.bezierCurveTo(cx + s * 0.08, cy - s * 0.2, cx + s * 0.15, cy + s * 0.05, cx + s * 0.22, cy + s * 0.18);
  ctx.stroke();
  // Parietal fold
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.12, cy - s * 0.52);
  ctx.bezierCurveTo(cx - s * 0.22, cy - s * 0.2, cx - s * 0.18, cy + s * 0.05, cx - s * 0.10, cy + s * 0.20);
  ctx.stroke();
  // Frontal fold
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.50, cy - s * 0.32);
  ctx.bezierCurveTo(cx + s * 0.42, cy - s * 0.10, cx + s * 0.48, cy + s * 0.08, cx + s * 0.55, cy + s * 0.18);
  ctx.stroke();
  // Occipital folds
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.35, cy - s * 0.40);
  ctx.bezierCurveTo(cx - s * 0.42, cy - s * 0.15, cx - s * 0.38, cy + s * 0.05, cx - s * 0.30, cy + s * 0.15);
  ctx.stroke();

  // Pass 2: Clip traces to brain shape via destination-in
  ctx.globalCompositeOperation = 'destination-in';
  fillUnion(ctx, lobes);

  // Pass 3: Outline
  ctx.globalCompositeOperation = 'source-over';
  strokeEllipses(ctx, lobes);
}

/* ================================================================== *
 *  Shark — side-view profile using bezier path                        *
 * ================================================================== */

function drawShark(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w * 0.48, cy = h * 0.48, s = Math.min(w, h) * 0.38;

  // Pass 1: Traces + shark details
  drawTraces(ctx, w, h);

  // Gill slits
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    const gx = cx + s * (0.35 - i * 0.08);
    ctx.beginPath();
    ctx.moveTo(gx, cy - s * 0.08);
    ctx.lineTo(gx - s * 0.02, cy + s * 0.10);
    ctx.stroke();
  }
  // Eye
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(cx + s * 0.68, cy - s * 0.08, s * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // Pass 2: Clip to shark silhouette
  ctx.globalCompositeOperation = 'destination-in';
  ctx.fillStyle = 'white';
  ctx.beginPath();

  // Body top line: snout → dorsal → tail
  ctx.moveTo(cx + s * 0.95, cy);                                                      // Snout tip
  ctx.bezierCurveTo(cx + s * 0.75, cy - s * 0.15, cx + s * 0.50, cy - s * 0.25, cx + s * 0.20, cy - s * 0.28);  // Upper snout to back
  ctx.bezierCurveTo(cx + s * 0.05, cy - s * 0.30, cx - s * 0.05, cy - s * 0.30, cx - s * 0.10, cy - s * 0.30);  // Toward dorsal
  // Dorsal fin
  ctx.bezierCurveTo(cx - s * 0.12, cy - s * 0.32, cx - s * 0.15, cy - s * 0.65, cx - s * 0.18, cy - s * 0.80); // Fin up
  ctx.bezierCurveTo(cx - s * 0.22, cy - s * 0.70, cx - s * 0.30, cy - s * 0.42, cx - s * 0.35, cy - s * 0.30); // Fin down
  // Back to tail
  ctx.bezierCurveTo(cx - s * 0.50, cy - s * 0.26, cx - s * 0.65, cy - s * 0.22, cx - s * 0.75, cy - s * 0.18);
  // Upper tail lobe
  ctx.bezierCurveTo(cx - s * 0.82, cy - s * 0.22, cx - s * 0.88, cy - s * 0.40, cx - s * 0.95, cy - s * 0.52);
  // Tail fork
  ctx.bezierCurveTo(cx - s * 0.92, cy - s * 0.42, cx - s * 0.88, cy - s * 0.15, cx - s * 0.82, cy - s * 0.05);
  // Lower tail lobe
  ctx.bezierCurveTo(cx - s * 0.86, cy + s * 0.08, cx - s * 0.90, cy + s * 0.22, cx - s * 0.88, cy + s * 0.30);
  // Tail back to body bottom
  ctx.bezierCurveTo(cx - s * 0.84, cy + s * 0.22, cx - s * 0.78, cy + s * 0.12, cx - s * 0.70, cy + s * 0.10);
  // Body bottom line
  ctx.bezierCurveTo(cx - s * 0.50, cy + s * 0.15, cx - s * 0.25, cy + s * 0.22, cx, cy + s * 0.24);
  // Pectoral fin
  ctx.bezierCurveTo(cx + s * 0.05, cy + s * 0.25, cx + s * 0.08, cy + s * 0.45, cx + s * 0.02, cy + s * 0.55);
  ctx.bezierCurveTo(cx + s * 0.10, cy + s * 0.48, cx + s * 0.18, cy + s * 0.35, cx + s * 0.22, cy + s * 0.25);
  // Belly to snout
  ctx.bezierCurveTo(cx + s * 0.40, cy + s * 0.20, cx + s * 0.60, cy + s * 0.12, cx + s * 0.80, cy + s * 0.06);
  ctx.bezierCurveTo(cx + s * 0.88, cy + s * 0.03, cx + s * 0.93, cy + s * 0.01, cx + s * 0.95, cy);

  ctx.closePath();
  ctx.fill();

  // Pass 3: Outline
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = 'white';
  ctx.lineWidth = OUTLINE_W;
  // Re-trace the same path for outline
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.95, cy);
  ctx.bezierCurveTo(cx + s * 0.75, cy - s * 0.15, cx + s * 0.50, cy - s * 0.25, cx + s * 0.20, cy - s * 0.28);
  ctx.bezierCurveTo(cx + s * 0.05, cy - s * 0.30, cx - s * 0.05, cy - s * 0.30, cx - s * 0.10, cy - s * 0.30);
  ctx.bezierCurveTo(cx - s * 0.12, cy - s * 0.32, cx - s * 0.15, cy - s * 0.65, cx - s * 0.18, cy - s * 0.80);
  ctx.bezierCurveTo(cx - s * 0.22, cy - s * 0.70, cx - s * 0.30, cy - s * 0.42, cx - s * 0.35, cy - s * 0.30);
  ctx.bezierCurveTo(cx - s * 0.50, cy - s * 0.26, cx - s * 0.65, cy - s * 0.22, cx - s * 0.75, cy - s * 0.18);
  ctx.bezierCurveTo(cx - s * 0.82, cy - s * 0.22, cx - s * 0.88, cy - s * 0.40, cx - s * 0.95, cy - s * 0.52);
  ctx.bezierCurveTo(cx - s * 0.92, cy - s * 0.42, cx - s * 0.88, cy - s * 0.15, cx - s * 0.82, cy - s * 0.05);
  ctx.bezierCurveTo(cx - s * 0.86, cy + s * 0.08, cx - s * 0.90, cy + s * 0.22, cx - s * 0.88, cy + s * 0.30);
  ctx.bezierCurveTo(cx - s * 0.84, cy + s * 0.22, cx - s * 0.78, cy + s * 0.12, cx - s * 0.70, cy + s * 0.10);
  ctx.bezierCurveTo(cx - s * 0.50, cy + s * 0.15, cx - s * 0.25, cy + s * 0.22, cx, cy + s * 0.24);
  ctx.bezierCurveTo(cx + s * 0.05, cy + s * 0.25, cx + s * 0.08, cy + s * 0.45, cx + s * 0.02, cy + s * 0.55);
  ctx.bezierCurveTo(cx + s * 0.10, cy + s * 0.48, cx + s * 0.18, cy + s * 0.35, cx + s * 0.22, cy + s * 0.25);
  ctx.bezierCurveTo(cx + s * 0.40, cy + s * 0.20, cx + s * 0.60, cy + s * 0.12, cx + s * 0.80, cy + s * 0.06);
  ctx.bezierCurveTo(cx + s * 0.88, cy + s * 0.03, cx + s * 0.93, cy + s * 0.01, cx + s * 0.95, cy);
  ctx.closePath();
  ctx.stroke();
}

/* ================================================================== *
 *  Robot — front-view geometric silhouette                            *
 * ================================================================== */

function drawRobot(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w * 0.50, cy = h * 0.46, s = Math.min(w, h) * 0.36;

  // Pass 1: Traces + robot details
  drawTraces(ctx, w, h);

  // Chest panel lines
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - s * 0.32, cy - s * 0.08, s * 0.64, s * 0.42);
  // Chest indicator circles
  ctx.fillStyle = 'white';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(cx - s * 0.15 + i * s * 0.15, cy + s * 0.18, s * 0.035, 0, Math.PI * 2);
    ctx.fill();
  }

  // Pass 2: Clip to robot silhouette
  ctx.globalCompositeOperation = 'destination-in';
  ctx.fillStyle = 'white';

  // Head
  roundRect(ctx, cx - s * 0.38, cy - s * 0.72, s * 0.76, s * 0.42, s * 0.06);
  ctx.fill();
  // Antenna rod
  ctx.fillRect(cx - s * 0.03, cy - s * 0.88, s * 0.06, s * 0.18);
  // Antenna tip
  ctx.beginPath();
  ctx.arc(cx, cy - s * 0.92, s * 0.05, 0, Math.PI * 2);
  ctx.fill();
  // Neck
  ctx.fillRect(cx - s * 0.10, cy - s * 0.32, s * 0.20, s * 0.10);
  // Torso
  roundRect(ctx, cx - s * 0.48, cy - s * 0.24, s * 0.96, s * 0.58, s * 0.04);
  ctx.fill();
  // Left arm
  roundRect(ctx, cx - s * 0.68, cy - s * 0.18, s * 0.14, s * 0.52, s * 0.04);
  ctx.fill();
  // Right arm
  roundRect(ctx, cx + s * 0.54, cy - s * 0.18, s * 0.14, s * 0.52, s * 0.04);
  ctx.fill();
  // Left hand
  ctx.beginPath();
  ctx.arc(cx - s * 0.61, cy + s * 0.38, s * 0.07, 0, Math.PI * 2);
  ctx.fill();
  // Right hand
  ctx.beginPath();
  ctx.arc(cx + s * 0.61, cy + s * 0.38, s * 0.07, 0, Math.PI * 2);
  ctx.fill();
  // Left leg
  roundRect(ctx, cx - s * 0.28, cy + s * 0.38, s * 0.18, s * 0.46, s * 0.04);
  ctx.fill();
  // Right leg
  roundRect(ctx, cx + s * 0.10, cy + s * 0.38, s * 0.18, s * 0.46, s * 0.04);
  ctx.fill();
  // Left foot
  roundRect(ctx, cx - s * 0.32, cy + s * 0.80, s * 0.26, s * 0.08, s * 0.03);
  ctx.fill();
  // Right foot
  roundRect(ctx, cx + s * 0.06, cy + s * 0.80, s * 0.26, s * 0.08, s * 0.03);
  ctx.fill();

  // Pass 3: Outline
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = 'white';
  ctx.lineWidth = OUTLINE_W;

  // Head
  roundRect(ctx, cx - s * 0.38, cy - s * 0.72, s * 0.76, s * 0.42, s * 0.06);
  ctx.stroke();
  // Eyes
  ctx.beginPath();
  ctx.arc(cx - s * 0.16, cy - s * 0.55, s * 0.08, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + s * 0.16, cy - s * 0.55, s * 0.08, 0, Math.PI * 2);
  ctx.stroke();
  // Mouth
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.12, cy - s * 0.38);
  ctx.lineTo(cx + s * 0.12, cy - s * 0.38);
  ctx.stroke();
  ctx.lineWidth = OUTLINE_W;
  // Antenna
  ctx.beginPath();
  ctx.arc(cx, cy - s * 0.92, s * 0.05, 0, Math.PI * 2);
  ctx.stroke();
  // Torso
  roundRect(ctx, cx - s * 0.48, cy - s * 0.24, s * 0.96, s * 0.58, s * 0.04);
  ctx.stroke();
  // Arms
  roundRect(ctx, cx - s * 0.68, cy - s * 0.18, s * 0.14, s * 0.52, s * 0.04);
  ctx.stroke();
  roundRect(ctx, cx + s * 0.54, cy - s * 0.18, s * 0.14, s * 0.52, s * 0.04);
  ctx.stroke();
  // Legs
  roundRect(ctx, cx - s * 0.28, cy + s * 0.38, s * 0.18, s * 0.46, s * 0.04);
  ctx.stroke();
  roundRect(ctx, cx + s * 0.10, cy + s * 0.38, s * 0.18, s * 0.46, s * 0.04);
  ctx.stroke();
}

/** Helper: creates a rounded-rect sub-path. */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/* ================================================================== *
 *  Ocean wave state                                                   *
 * ================================================================== */

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

const HOLD = 4;
const MORPH = 1.8;

function MorphingParticles() {
  const meshRef = useRef<THREE.Points>(null);

  const shapes = useMemo(() => [
    ocean(P),
    samplePixels(drawBrain),
    ocean(P),
    samplePixels(drawShark),
    ocean(P),
    samplePixels(drawRobot),
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
      const pb = smoothstep(blend * 1.5 - off * 0.5);

      let fx = from[ix] ?? 0;
      let fy = from[ix + 1] ?? 0;
      const fz = from[ix + 2] ?? 0;
      let tx = to[ix] ?? 0;
      let ty = to[ix + 1] ?? 0;
      const tz = to[ix + 2] ?? 0;

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

      const arc = Math.sin(pb * Math.PI);
      pos[ix] = fx * (1 - pb) + tx * pb + arc * ((i % 11) / 11 - 0.5) * 0.15;
      pos[ix + 1] = fy * (1 - pb) + ty * pb + arc * 0.2;
      pos[ix + 2] = fz * (1 - pb) + tz * pb;

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
