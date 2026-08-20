import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Archivo, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-archivo',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://shkgroup.com.br';

const DESCRIPTION =
  'AI agents, software and digital products for companies whose sales operation runs slower than their demand.';

// Frame final da cidade, já commitado e antes sem uso. É o mesmo quadro em que
// o cinematic entrega, então o card do link e a primeira tela batem.
const OG_IMAGE = {
  url: '/cinematic/final-city.webp',
  width: 1920,
  height: 1080,
  alt: 'SHK Group',
} as const;

/**
 * Os canais de distribuicao declarados do produto sao WhatsApp e Instagram.
 * Sem openGraph, um link colado no WhatsApp vira o card mais pobre que a
 * plataforma produz, so titulo e descricao. O canonical existe porque
 * ?cinematicDebug=true e qualquer UTM viram documento indexavel separado.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'SHK Group', template: '%s | SHK Group' },
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'SHK Group',
    title: 'SHK Group',
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  // O twitter não herda images do openGraph no Next: sem esta linha o card
  // summary_large_image degrada para summary por falta de imagem.
  twitter: {
    card: 'summary_large_image',
    title: 'SHK Group',
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

export const viewport: Viewport = { themeColor: '#050607' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${archivo.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        {/*
          A ordem de tabulacao comeca no header e atravessa 500vh de cinematic
          decorativo antes de chegar em qualquer secao com conteudo.
        */}
        <a
          href="#intro"
          className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-50 focus:border focus:border-[var(--accent)] focus:bg-[var(--ink-900)] focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
