import { buildLoadPriority, framesToEvict, nearestLoadedFrame } from './load-policy';
import { fileIndexForFrame } from './frame-math';

export interface FrameCacheOptions {
  readonly dir: string;
  readonly frameCount: number;
  readonly frameStep: number;
  readonly maxDecoded: number;
  readonly concurrency: number;
  readonly lookAround: number;
  readonly finalFrame: number;
}

const HEAD_COUNT = 30;

/**
 * Guarda a sequência em dois níveis. O nível encoded segura o Blob de todo
 * frame já baixado, cerca de 70 KB cada. O nível decoded segura ImageBitmap
 * prontos numa janela ao redor do playhead, cerca de 5,8 MB cada, e fecha o
 * que sai da janela. Sem essa separação, 240 bitmaps residentes passariam de
 * 1 GB.
 */
export class FrameCache {
  private readonly encoded = new Map<number, Blob>();
  private readonly decoded = new Map<number, ImageBitmap>();
  private readonly inFlight = new Set<number>();
  private readonly firstFrameCallbacks: Array<() => void> = [];

  private playhead = 0;
  private encodedBytes = 0;
  private running = false;
  private disposed = false;
  private firstFrameDelivered = false;
  private pumpScheduled = false;

  constructor(private readonly options: FrameCacheOptions) {}

  get stats(): { decoded: number; encoded: number; bytes: number } {
    return { decoded: this.decoded.size, encoded: this.encoded.size, bytes: this.encodedBytes };
  }

  onFirstFrame(callback: () => void): void {
    if (this.firstFrameDelivered) {
      callback();
      return;
    }
    this.firstFrameCallbacks.push(callback);
  }

  start(): void {
    if (this.running || this.disposed) return;
    this.running = true;
    this.pump();
  }

  setPlayhead(frame: number): void {
    if (this.playhead === frame) return;
    this.playhead = frame;
    this.evict();
    this.schedulePump();
  }

  /** Bitmap exato do frame, ou null se ele ainda não está decodificado. */
  get(frame: number): ImageBitmap | null {
    return this.decoded.get(frame) ?? null;
  }

  /** Bitmap do frame, ou o mais próximo disponível. Evita canvas vazio. */
  getNearest(frame: number): ImageBitmap | null {
    const exact = this.decoded.get(frame);
    if (exact) return exact;

    const nearest = nearestLoadedFrame(frame, [...this.decoded.keys()]);
    return nearest === null ? null : (this.decoded.get(nearest) ?? null);
  }

  dispose(): void {
    this.disposed = true;
    this.running = false;
    for (const bitmap of this.decoded.values()) bitmap.close();
    this.decoded.clear();
    this.encoded.clear();
    this.inFlight.clear();
    this.encodedBytes = 0;
    this.firstFrameCallbacks.length = 0;
  }

  private urlFor(frame: number): string {
    const index = fileIndexForFrame(frame, this.options.frameStep);
    return `${this.options.dir}/frame-${String(index).padStart(4, '0')}.webp`;
  }

  private schedulePump(): void {
    if (this.pumpScheduled || !this.running || this.disposed) return;
    this.pumpScheduled = true;
    queueMicrotask(() => {
      this.pumpScheduled = false;
      this.pump();
    });
  }

  private pump(): void {
    if (!this.running || this.disposed) return;

    const slots = this.options.concurrency - this.inFlight.size;
    if (slots <= 0) return;

    const known = new Set([...this.encoded.keys(), ...this.inFlight]);
    const queue = buildLoadPriority(this.playhead, known, {
      frameCount: this.options.frameCount,
      finalFrame: this.options.finalFrame,
      headCount: HEAD_COUNT,
      lookAround: this.options.lookAround,
    });

    for (const frame of queue.slice(0, slots)) {
      void this.load(frame);
    }
  }

  private async load(frame: number): Promise<void> {
    if (this.inFlight.has(frame) || this.encoded.has(frame) || this.disposed) return;
    this.inFlight.add(frame);

    try {
      const response = await fetch(this.urlFor(frame));
      if (!response.ok) throw new Error(`frame ${frame}: HTTP ${response.status}`);

      const blob = await response.blob();
      if (this.disposed) return;

      this.encoded.set(frame, blob);
      this.encodedBytes += blob.size;

      await this.decode(frame, blob);
    } catch {
      // Um frame que falhou não trava a sequência: getNearest cobre o buraco.
      // Ele volta para a fila na próxima passada do pump.
    } finally {
      this.inFlight.delete(frame);
      if (!this.disposed) this.schedulePump();
    }
  }

  private async decode(frame: number, blob: Blob): Promise<void> {
    if (this.decoded.has(frame) || this.disposed) return;

    const bitmap = await createImageBitmap(blob);
    if (this.disposed) {
      bitmap.close();
      return;
    }

    this.decoded.set(frame, bitmap);
    this.evict();

    if (!this.firstFrameDelivered) {
      this.firstFrameDelivered = true;
      for (const callback of this.firstFrameCallbacks) callback();
      this.firstFrameCallbacks.length = 0;
    }
  }

  private evict(): void {
    const doomed = framesToEvict(this.playhead, [...this.decoded.keys()], this.options.maxDecoded);
    for (const frame of doomed) {
      this.decoded.get(frame)?.close();
      this.decoded.delete(frame);
    }
  }
}
