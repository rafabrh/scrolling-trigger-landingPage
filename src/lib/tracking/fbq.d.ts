/**
 * Type declarations para o Facebook Pixel (fbq global).
 * O script fbevents.js injeta `fbq` e `_fbq` no window.
 */
interface FbqFunction {
  (action: 'init', pixelId: string): void;
  (action: 'track', event: string, params?: Record<string, unknown>): void;
  (action: 'trackCustom', event: string, params?: Record<string, unknown>): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  loaded: boolean;
  version: string;
  push: (...args: unknown[]) => void;
}

interface Window {
  fbq: FbqFunction;
  _fbq: FbqFunction;
  dataLayer: Record<string, unknown>[];
}
