#!/usr/bin/env node
import { readdir } from 'node:fs/promises';
import path from 'node:path';

/**
 * Guarda de build. Existe porque a falha que ela pega é invisível: `poster.webp`
 * e `final-city.webp` são versionados, então um deploy sem a sequência mostra o
 * poster, segura 500vh de scroll morto e faz o handoff normalmente. A página
 * parece intencional. O único jeito de descobrir era alguém rolar a URL de
 * produção.
 *
 * Roda no prebuild. Sem os frames, o build falha em vez de publicar um site sem
 * o motivo dele existir.
 */
const ROOT = path.resolve(import.meta.dirname, '..');
const EXPECTED = { desktop: 240, mobile: 120 };
const STILLS = ['final-city.webp', 'final-city-mobile.webp', 'poster.webp', 'manifest.json'];

const problems = [];

for (const [set, expected] of Object.entries(EXPECTED)) {
  const dir = path.join(ROOT, 'public/cinematic', set);
  const files = await readdir(dir).catch(() => null);

  if (files === null) {
    problems.push(`public/cinematic/${set}/ não existe`);
    continue;
  }

  const webp = files.filter((f) => f.endsWith('.webp'));
  if (webp.length !== expected) {
    problems.push(`public/cinematic/${set}/: ${webp.length} frames, esperado ${expected}`);
  }
}

const loose = await readdir(path.join(ROOT, 'public/cinematic')).catch(() => []);
for (const still of STILLS) {
  if (!loose.includes(still)) problems.push(`public/cinematic/${still} ausente`);
}

if (problems.length > 0) {
  console.error('Assets do cinematic incompletos:');
  for (const p of problems) console.error(`  - ${p}`);
  console.error('\nRode `pnpm frames` para regenerar a partir de context/video/rafa3.mp4.');
  process.exit(1);
}

console.log(`cinematic ok: ${EXPECTED.desktop} frames desktop, ${EXPECTED.mobile} mobile, ${STILLS.length} avulsos`);
