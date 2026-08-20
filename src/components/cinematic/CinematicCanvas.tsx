'use client';

import { useEffect, useRef } from 'react';
import { drawCoverImage } from '@/lib/cinematic/draw-cover';
import type { FrameCache } from '@/lib/cinematic/frame-cache';

const MAX_DEVICE_PIXEL_RATIO = 2;

export interface CinematicCanvasProps {
  readonly cache: FrameCache | null;
  /** Frame alvo, escrito pela timeline e lido pelo rAF. Nunca vira estado. */
  readonly frameRef: React.RefObject<number>;
  readonly sourceWidth: number;
  readonly sourceHeight: number;
  readonly className?: string;
}

/**
 * O canvas é decorativo: toda informação existe em HTML semântico ao lado.
 * O desenho roda num rAF próprio que lê refs, então nenhum frame provoca
 * render do React.
 */
export function CinematicCanvas({
  cache,
  frameRef,
  sourceWidth,
  sourceHeight,
  className,
}: CinematicCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastDrawnRef = useRef<number>(-1);
  const lastBitmapRef = useRef<ImageBitmap | null>(null);
  const cssSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });

  const paint = (frame: number, force: boolean): void => {
    const ctx = contextRef.current;
    const bitmap = cache?.getNearest(frame) ?? null;
    if (!ctx || !bitmap) return;

    // O guard olha o bitmap, não só o índice. `getNearest` pode ter devolvido
    // um vizinho enquanto o exato ainda decodificava; quando o exato chega, o
    // frame é o mesmo e um guard por índice suprimiria o redesenho para
    // sempre. Foi assim que a imagem ficava presa no vizinho errado depois de
    // um scroll rápido terminar.
    if (!force && frame === lastDrawnRef.current && bitmap === lastBitmapRef.current) return;

    const { width, height } = cssSizeRef.current;
    ctx.clearRect(0, 0, width, height);
    drawCoverImage(ctx, bitmap, sourceWidth, sourceHeight, width, height);
    lastDrawnRef.current = frame;
    lastBitmapRef.current = bitmap;
  };

  // Dimensiona o backing store pelo devicePixelRatio, com teto em 2. Acima
  // disso o custo de fill rate sobe sem ganho perceptível.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    contextRef.current = ctx;

    const resize = (): void => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);

      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cssSizeRef.current = { width: rect.width, height: rect.height };

      // Escrever em canvas.width limpa o backing store. Sem invalidar aqui, o
      // rAF acha que o frame já está na tela e o canvas fica preto até o
      // usuário rolar.
      lastDrawnRef.current = -1;
      lastBitmapRef.current = null;
      paint(frameRef.current, true);
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    return () => {
      observer.disconnect();
      contextRef.current = null;
    };
    // `cache` entra nas dependências porque `resize` fecha sobre ela: o efeito
    // roda primeiro com cache null, e sem isso aquele closure nunca via o
    // cache real. `paint` fica fora de propósito, é recriada a cada render.
  }, [cache, frameRef, sourceWidth, sourceHeight]);

  // Loop de desenho. Uma iteração por quadro do browser, independente de
  // quantas vezes a timeline escreveu no ref nesse intervalo.
  useEffect(() => {
    if (!cache) return;

    let rafId = 0;
    const tick = (): void => {
      const frame = frameRef.current;
      cache.setPlayhead(frame);
      paint(frame, false);
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [cache, frameRef]);

  // Redesenha assim que o primeiro bitmap chega, sem esperar movimento.
  useEffect(() => {
    if (!cache) return;
    cache.onFirstFrame(() => paint(frameRef.current, true));
  }, [cache, frameRef]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
