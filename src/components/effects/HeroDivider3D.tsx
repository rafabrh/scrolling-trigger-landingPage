'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 800;
const GRID_WIDTH = 16;
const GRID_DEPTH = 4;

function ParticleField() {
  const meshRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * GRID_WIDTH;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 1.2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * GRID_DEPTH;
    }
    return pos;
  }, []);

  const speeds = useMemo(() => {
    const s = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      s[i] = 0.2 + Math.random() * 0.6;
    }
    return s;
  }, []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const geo = mesh.geometry;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const time = clock.getElapsedTime();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3;
      const speed = speeds[i] ?? 0.3;
      // Drift horizontal
      arr[ix] = (arr[ix] ?? 0) + speed * 0.003;
      // Wrap around
      if ((arr[ix] ?? 0) > GRID_WIDTH / 2) {
        arr[ix] = -GRID_WIDTH / 2;
      }
      // Subtle wave
      arr[ix + 1] =
        Math.sin(time * 0.4 + (arr[ix] ?? 0) * 0.5) * 0.15 +
        Math.cos(time * 0.3 + i * 0.01) * 0.08;
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={PARTICLE_COUNT}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#00d4aa"
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function GridLines() {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.1) * 0.02;
    }
  });

  const lines = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices: number[] = [];

    // Horizontal lines
    for (let z = -GRID_DEPTH / 2; z <= GRID_DEPTH / 2; z += 0.8) {
      vertices.push(-GRID_WIDTH / 2, 0, z, GRID_WIDTH / 2, 0, z);
    }
    // Vertical lines (along X)
    for (let x = -GRID_WIDTH / 2; x <= GRID_WIDTH / 2; x += 0.8) {
      vertices.push(x, 0, -GRID_DEPTH / 2, x, 0, GRID_DEPTH / 2);
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geo;
  }, []);

  return (
    <group ref={ref}>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color="#00d4aa" transparent opacity={0.06} />
      </lineSegments>
    </group>
  );
}

function CenterGlow() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.04 + Math.sin(clock.getElapsedTime() * 0.5) * 0.02;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshBasicMaterial color="#00d4aa" transparent opacity={0.04} />
    </mesh>
  );
}

export function HeroDivider3D() {
  return (
    <div className="relative z-10 h-[120px] w-full overflow-hidden">
      {/* Top/bottom fade edges */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-[var(--ink-900)] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-[var(--ink-900)] to-transparent" />
      <Canvas
        camera={{ position: [0, 1.8, 3], fov: 50 }}
        gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]}
      >
        <GridLines />
        <ParticleField />
        <CenterGlow />
      </Canvas>
    </div>
  );
}
