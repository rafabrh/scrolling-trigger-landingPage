// Gera os ícones do app a partir de public/brand/logo.png. O App Router serve
// src/app/icon.png e src/app/apple-icon.png automaticamente como <link rel>,
// então não há favicon.ico nem manifest a manter à mão. Reprodutível: rode
// `node scripts/build-icons.mjs` sempre que o logo mudar.
import sharp from 'sharp';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
// Usa a variante teal para os favicons: contrasta no fundo --ink-900.
const SOURCE = path.join(ROOT, 'public/brand/logo-teal.png');

// Fundo igual ao --bg do site, para o ícone não brilhar branco na aba.
const BACKGROUND = { r: 5, g: 6, b: 7, alpha: 1 };

// O logo ocupa 72% do lado, deixando margem para não colar nas bordas quando
// o SO recorta o ícone em círculo ou arredonda os cantos.
const LOGO_FRACTION = 0.72;

const TARGETS = [
  { file: 'src/app/icon.png', size: 512 },
  { file: 'src/app/apple-icon.png', size: 180 },
];

for (const { file, size } of TARGETS) {
  const inner = Math.round(size * LOGO_FRACTION);
  const logo = await sharp(SOURCE)
    .resize(inner, inner, { fit: 'inside', withoutEnlargement: false })
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: BACKGROUND },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(path.join(ROOT, file));

  console.log(`${file}: ${size}x${size} ok`);
}
