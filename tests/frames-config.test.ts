import { describe, it, expect } from 'vitest';
import { CINEMATIC } from '@/lib/cinematic/cinematic.config';
import framesConfig from '@/lib/cinematic/frames.config.json';

// Isto é a comparação que faltava: o runtime `CINEMATIC` e o JSON fonte-única
// (também lido por scripts/build-frames.mjs) não podem desencontrar em silêncio.
describe('CINEMATIC vs frames.config.json', () => {
  it('deriva a fonte do JSON', () => {
    expect(CINEMATIC.frameCount).toBe(framesConfig.source.frameCount);
    expect(CINEMATIC.fps).toBe(framesConfig.source.fps);
    expect(CINEMATIC.sourceWidth).toBe(framesConfig.source.width);
    expect(CINEMATIC.sourceHeight).toBe(framesConfig.source.height);
    expect(CINEMATIC.finalFrame).toBe(framesConfig.source.frameCount - 1);
  });

  it('deriva cada conjunto do JSON', () => {
    for (const name of ['desktop', 'mobile'] as const) {
      const json = framesConfig.sets[name];
      const set = CINEMATIC.frameSets[name];
      expect(set.dir).toBe(`/cinematic/${json.dir}`);
      expect(set.width).toBe(json.width);
      expect(set.height).toBe(json.height);
      expect(set.frameStep).toBe(json.frameStep);
      expect(set.frameCount).toBe(Math.ceil(framesConfig.source.frameCount / json.frameStep));
    }
    // Explícito: desktop = frameCount, mobile = frameCount / 2.
    expect(CINEMATIC.frameSets.desktop.frameCount).toBe(framesConfig.source.frameCount);
    expect(CINEMATIC.frameSets.mobile.frameCount).toBe(framesConfig.source.frameCount / 2);
  });
});
