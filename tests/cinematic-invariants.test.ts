import { describe, it, expect } from 'vitest';
import {
  buildSceneSegments,
  frameFromWeightedProgress,
  getOverlayOpacity,
  sceneAtFrame,
} from '@/lib/cinematic/frame-math';
import { decodeWindowRadius } from '@/lib/cinematic/load-policy';
import {
  CINEMATIC,
  SCENE_ORDER,
  type OverlayWindow,
  type SceneKey,
} from '@/lib/cinematic/cinematic.config';

const OVERLAYS: ReadonlyArray<readonly [SceneKey, OverlayWindow]> = [
  ['sharknews', CINEMATIC.overlays.sharknews],
  ['aiAgent', CINEMATIC.overlays.aiAgent],
];

const segments = buildSceneSegments(CINEMATIC.scenes, SCENE_ORDER, CINEMATIC.frameCount);

describe('overlay e cena falam do mesmo trecho do vídeo', () => {
  it('cada janela de overlay cabe dentro da cena que ela nomeia', () => {
    for (const [key, window] of OVERLAYS) {
      const scene = CINEMATIC.scenes[key];
      expect(window.inStart, key).toBeGreaterThanOrEqual(scene.startFrame);
      expect(window.outEnd, key).toBeLessThanOrEqual(scene.endFrame);
    }
  });

  it('nenhum overlay aparece enquanto outra cena está no ar', () => {
    for (const [key, window] of OVERLAYS) {
      for (let frame = 0; frame <= CINEMATIC.finalFrame; frame += 1) {
        if (getOverlayOpacity(frame, window) <= 0) continue;
        expect(sceneAtFrame(frame, CINEMATIC.scenes), `${key} no frame ${frame}`).toBe(key);
      }
    }
  });

  it('o platô de cada overlay é alcançado pelo scroll, não só pelos frames', () => {
    // O mapeamento por peso comprime cenas. Um platô que só existisse entre
    // dois frames vizinhos poderia passar sem nunca chegar a 1 em tela.
    for (const [key, window] of OVERLAYS) {
      let atFull = 0;
      for (let i = 0; i <= 20000; i += 1) {
        const frame = frameFromWeightedProgress(i / 20000, segments, CINEMATIC.frameCount);
        if (getOverlayOpacity(frame, window) === 1) atFull += 1;
      }
      // Pelo menos 2% da rolagem com o overlay legível por inteiro.
      expect(atFull / 20001, key).toBeGreaterThan(0.02);
    }
  });

  it('os dois overlays estão apagados nas duas pontas do scroll', () => {
    for (const [key, window] of OVERLAYS) {
      for (const progress of [0, 1]) {
        const frame = frameFromWeightedProgress(progress, segments, CINEMATIC.frameCount);
        expect(getOverlayOpacity(frame, window), `${key} em ${progress}`).toBe(0);
      }
    }
  });
});

describe('cache: o config bate com a política', () => {
  it('a janela de decode cobre toda a vizinhança que a fila prioriza', () => {
    // A fila raciocina em frames de vídeo, o cache em arquivos. Se o raio de
    // decode ficar menor que a vizinhança, o pump baixa vizinho que se recusa
    // a decodificar e o scroll rápido mostra frame velho.
    for (const [name, set] of Object.entries(CINEMATIC.frameSets)) {
      const radius = decodeWindowRadius(CINEMATIC.cache.maxDecoded[name as 'desktop' | 'mobile']);
      const lookAroundInFiles = Math.ceil(CINEMATIC.cache.lookAround / set.frameStep);
      expect(radius, name).toBeGreaterThanOrEqual(lookAroundInFiles);
    }
  });

  it('o teto de bitmaps é menor que o conjunto inteiro, senão o despejo nunca roda', () => {
    for (const [name, set] of Object.entries(CINEMATIC.frameSets)) {
      expect(CINEMATIC.cache.maxDecoded[name as 'desktop' | 'mobile'], name).toBeLessThan(
        set.frameCount,
      );
    }
  });
});

describe('conjuntos de frame', () => {
  it('desktop é paisagem e mobile é retrato', () => {
    expect(CINEMATIC.frameSets.desktop.width).toBeGreaterThan(CINEMATIC.frameSets.desktop.height);
    expect(CINEMATIC.frameSets.mobile.height).toBeGreaterThan(CINEMATIC.frameSets.mobile.width);
  });

  it('a seção tem altura de sobra para o scrub existir', () => {
    // Com 100vh ou menos não há distância de rolagem: o progresso do
    // ScrollTrigger vira 0/0 e a sequência não anda.
    for (const vh of Object.values(CINEMATIC.scrollHeightVh)) {
      expect(vh).toBeGreaterThan(100);
    }
  });
});
