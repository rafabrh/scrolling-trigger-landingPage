#!/usr/bin/env node
import { mkdir, rm, readdir, writeFile, stat } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import sharp from 'sharp';
import ffmpegPath from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';

const run = promisify(execFile);

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCE = path.join(ROOT, 'context/video/rafa3.mp4');
const TEMP = path.join(ROOT, '.frames-tmp');
const OUT = path.join(ROOT, 'public/cinematic');

// Espelha src/lib/cinematic/cinematic.config.ts. O script valida contra o
// vídeo real e falha alto se algo divergir, então a duplicação não silencia.
const EXPECTED = { width: 1920, height: 1080, fps: 24, frameCount: 240 };
const FINAL_FRAME = 239;
const DESKTOP_BUDGET_BYTES = 18 * 1024 * 1024;

const SETS = {
  desktop: { dir: 'desktop', width: 1600, height: 900, frameStep: 1, quality: 74, crop: null },
  mobile: {
    dir: 'mobile',
    width: 864,
    height: 1080,
    frameStep: 2,
    quality: 72,
    // Corte central 4:5 do quadro 16:9. Sem redimensionar depois, então não
    // há upscale em lugar nenhum.
    crop: { left: 528, top: 0, width: 864, height: 1080 },
  },
};

async function probe() {
  const { stdout } = await run(ffprobeStatic.path, [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,r_frame_rate,nb_frames',
    '-of', 'json',
    SOURCE,
  ]);
  const stream = JSON.parse(stdout).streams?.[0];
  if (!stream) throw new Error(`ffprobe não achou stream de vídeo em ${SOURCE}`);

  const [num, den] = String(stream.r_frame_rate).split('/').map(Number);
  const actual = {
    width: Number(stream.width),
    height: Number(stream.height),
    fps: num / den,
    frameCount: Number(stream.nb_frames),
  };

  for (const key of Object.keys(EXPECTED)) {
    if (actual[key] !== EXPECTED[key]) {
      throw new Error(
        `Vídeo divergiu da configuração: ${key} esperado ${EXPECTED[key]}, encontrado ${actual[key]}. ` +
          'Atualize EXPECTED aqui e CINEMATIC em src/lib/cinematic/cinematic.config.ts juntos.',
      );
    }
  }
  return actual;
}

async function extractPngs() {
  await rm(TEMP, { recursive: true, force: true });
  await mkdir(TEMP, { recursive: true });
  await run(ffmpegPath, [
    '-y', '-v', 'error',
    '-i', SOURCE,
    '-an',                       // nenhum áudio sai daqui, nunca
    '-vsync', '0',               // um arquivo por frame, sem duplicar nem dropar
    path.join(TEMP, 'src-%04d.png'),
  ]);

  const files = (await readdir(TEMP)).filter((f) => f.endsWith('.png')).sort();
  if (files.length !== EXPECTED.frameCount) {
    throw new Error(`ffmpeg extraiu ${files.length} frames, esperava ${EXPECTED.frameCount}`);
  }
  return files.map((f) => path.join(TEMP, f));
}

async function buildSet(name, config, pngs, quality) {
  const dir = path.join(OUT, config.dir);
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });

  let totalBytes = 0;
  let written = 0;

  for (let frame = 0; frame < pngs.length; frame += config.frameStep) {
    let pipeline = sharp(pngs[frame]);
    if (config.crop) {
      pipeline = pipeline.extract(config.crop);
    } else {
      pipeline = pipeline.resize(config.width, config.height, { kernel: 'lanczos3' });
    }

    const target = path.join(dir, `frame-${String(written).padStart(4, '0')}.webp`);
    await pipeline.webp({ quality, effort: 6 }).toFile(target);
    totalBytes += (await stat(target)).size;
    written += 1;
  }

  return { name, dir: `/cinematic/${config.dir}`, width: config.width, height: config.height,
           frameCount: written, frameStep: config.frameStep, quality, totalBytes };
}

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1);

async function main() {
  const source = await probe();
  console.log(`fonte ok: ${source.width}x${source.height} ${source.fps}fps ${source.frameCount} frames`);

  const pngs = await extractPngs();
  console.log(`extraídos ${pngs.length} PNGs`);

  // Desktop com teto de peso: se estourar, a qualidade cai em passos de 4.
  let quality = SETS.desktop.quality;
  let desktop = await buildSet('desktop', SETS.desktop, pngs, quality);
  while (desktop.totalBytes > DESKTOP_BUDGET_BYTES && quality > 50) {
    quality -= 4;
    console.log(`desktop em ${mb(desktop.totalBytes)} MB passou do teto, recodificando em q${quality}`);
    desktop = await buildSet('desktop', SETS.desktop, pngs, quality);
  }
  console.log(`desktop: ${desktop.frameCount} frames, q${desktop.quality}, ${mb(desktop.totalBytes)} MB`);

  const mobile = await buildSet('mobile', SETS.mobile, pngs, SETS.mobile.quality);
  console.log(`mobile: ${mobile.frameCount} frames, q${mobile.quality}, ${mb(mobile.totalBytes)} MB`);

  // O frame final vira o fundo fixo do site inteiro. É o mais olhado da
  // sequência, então sai em resolução cheia e qualidade alta.
  await sharp(pngs[FINAL_FRAME]).webp({ quality: 88, effort: 6 }).toFile(path.join(OUT, 'final-city.webp'));

  // O mobile desenha frames 4:5, então o fundo dele precisa ser o mesmo
  // recorte central do conjunto mobile ou a costura do handoff aparece.
  await sharp(pngs[FINAL_FRAME])
    .extract(SETS.mobile.crop)
    .webp({ quality: 88, effort: 6 })
    .toFile(path.join(OUT, 'final-city-mobile.webp'));

  await sharp(pngs[0])
    .resize(SETS.desktop.width, SETS.desktop.height, { kernel: 'lanczos3' })
    .webp({ quality: 70, effort: 6 })
    .toFile(path.join(OUT, 'poster.webp'));

  const manifest = {
    generatedAt: new Date().toISOString(),
    source: { path: 'context/video/rafa3.mp4', ...source },
    sets: {
      desktop: { dir: desktop.dir, width: desktop.width, height: desktop.height,
                 frameCount: desktop.frameCount, frameStep: desktop.frameStep,
                 quality: desktop.quality, totalBytes: desktop.totalBytes },
      mobile: { dir: mobile.dir, width: mobile.width, height: mobile.height,
                frameCount: mobile.frameCount, frameStep: mobile.frameStep,
                quality: mobile.quality, totalBytes: mobile.totalBytes },
    },
    finalCity: { path: '/cinematic/final-city.webp', frame: FINAL_FRAME,
                 width: source.width, height: source.height },
    finalCityMobile: { path: '/cinematic/final-city-mobile.webp', frame: FINAL_FRAME,
                       width: SETS.mobile.width, height: SETS.mobile.height },
    poster: { path: '/cinematic/poster.webp', frame: 0,
              width: SETS.desktop.width, height: SETS.desktop.height },
  };

  await writeFile(path.join(OUT, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  await rm(TEMP, { recursive: true, force: true });
  console.log('manifest.json gravado');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
