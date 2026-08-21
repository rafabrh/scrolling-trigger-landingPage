'use client';

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import type { SceneHandle } from './CinematicOverlay';
import { CINEMATIC } from '@/lib/cinematic/cinematic.config';

/**
 * Efeito de relâmpago/eletricidade que se sobrepõe ao canvas durante a cena
 * cityReveal. Ativo entre os frames 168–239, com pico de intensidade na
 * transição (168–185) e decaimento suave até o fade final.
 *
 * Implementação pura em canvas 2D: sem dependência externa. Os arcos são
 * gerados por segmentação recursiva de linha com deslocamento aleatório
 * (midpoint displacement), técnica padrão para raios procedurais.
 *
 * O canvas é aria-hidden: é puramente decorativo.
 */

interface Bolt {
  segments: Array<{ x1: number; y1: number; x2: number; y2: number }>;
  alpha: number;
  life: number;
  maxLife: number;
}

function generateBolt(
  x1: number, y1: number, x2: number, y2: number,
  depth: number,
  segments: Bolt['segments'],
): void {
  if (depth === 0) {
    segments.push({ x1, y1, x2, y2 });
    return;
  }

  const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * (Math.abs(x2 - x1) + Math.abs(y2 - y1)) * 0.35;
  const my = (y1 + y2) / 2 + (Math.random() - 0.5) * (Math.abs(x2 - x1) + Math.abs(y2 - y1)) * 0.35;

  generateBolt(x1, y1, mx, my, depth - 1, segments);
  generateBolt(mx, my, x2, y2, depth - 1, segments);
}

function spawnBolt(w: number, h: number): Bolt {
  const segments: Bolt['segments'] = [];
  // Raio nasce de um ponto aleatório no topo e desce para um ponto na metade inferior
  const x1 = Math.random() * w;
  const y1 = 0;
  const x2 = x1 + (Math.random() - 0.5) * w * 0.4;
  const y2 = h * 0.4 + Math.random() * h * 0.5;
  generateBolt(x1, y1, x2, y2, 5, segments);
  const maxLife = 6 + Math.floor(Math.random() * 8);
  return { segments, alpha: 1, life: maxLife, maxLife };
}

export interface LightningOverlayHandle {
  apply(frame: number): void;
}

export const LightningOverlay = forwardRef<LightningOverlayHandle>(
  function LightningOverlay(_props, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const boltsRef = useRef<Bolt[]>([]);
    const rafRef = useRef<number>(0);
    const frameRef = useRef<number>(0);
    const tickCountRef = useRef<number>(0);

    useImperativeHandle(ref, () => ({
      apply(frame: number) {
        frameRef.current = frame;
      },
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const resize = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(canvas);

      const { startFrame, endFrame } = CINEMATIC.scenes.cityReveal;
      // Pico de raios no primeiro quarto da cena, decaindo depois
      const peakFrame = startFrame + Math.floor((endFrame - startFrame) * 0.25);

      const loop = () => {
        rafRef.current = requestAnimationFrame(loop);
        const frame = frameRef.current;

        // Fora da cena cityReveal: limpa e para
        if (frame < startFrame || frame > endFrame) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          boltsRef.current = [];
          return;
        }

        const progress = (frame - startFrame) / (endFrame - startFrame);
        // Intensidade máxima no início, zero no fim
        const intensity = Math.max(0, 1 - progress * 1.4);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        tickCountRef.current += 1;
        // Spawn de novos raios com probabilidade proporcional à intensidade
        const spawnThreshold = intensity * 0.55;
        if (Math.random() < spawnThreshold && frame < peakFrame + 20) {
          boltsRef.current.push(spawnBolt(canvas.width, canvas.height));
          // Raio secundário com 40% de chance
          if (Math.random() < 0.4) {
            boltsRef.current.push(spawnBolt(canvas.width, canvas.height));
          }
        }

        // Desenha e envelhece os raios — double-stroke sem shadowBlur (CPU-safe em mobile)
        // Captura referência ao raio mais recente antes do filter (noUncheckedIndexedAccess)
        const newestBolt = boltsRef.current[boltsRef.current.length - 1] ?? null;
        boltsRef.current = boltsRef.current.filter((bolt) => bolt.life > 0);
        for (const bolt of boltsRef.current) {
          // O raio mais novo recebe alpha elevado para o flash inicial
          const isNewest = bolt === newestBolt;
          const baseAlpha = (bolt.life / bolt.maxLife) * intensity;
          const coreAlpha = isNewest ? Math.min(1, baseAlpha * 1.2) : baseAlpha * 0.85;

          const path = new Path2D();
          for (const seg of bolt.segments) {
            path.moveTo(seg.x1, seg.y1);
            path.lineTo(seg.x2, seg.y2);
          }

          // Halo pass: traço largo e transparente para simular glow sem shadowBlur
          ctx.strokeStyle = `rgba(64, 193, 231, ${(coreAlpha * 0.3).toFixed(3)})`;
          ctx.lineWidth = 2.5;
          ctx.stroke(path);

          // Core pass: traço fino e opaco
          ctx.strokeStyle = `rgba(64, 193, 231, ${coreAlpha.toFixed(3)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke(path);

          bolt.life -= 1;
          bolt.alpha = bolt.life / bolt.maxLife;
        }
      };

      rafRef.current = requestAnimationFrame(loop);

      return () => {
        cancelAnimationFrame(rafRef.current);
        ro.disconnect();
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ mixBlendMode: 'screen' }}
      />
    );
  },
);
