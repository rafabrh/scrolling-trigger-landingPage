import type { NextConfig } from 'next';

const ONE_YEAR_SECONDS = 31_536_000;

// Politica de seguranca de conteudo, montada como array de diretivas para
// ficar legivel e diffavel. Sobe como Report-Only (ver abaixo) antes de
// virar enforcing num deploy futuro.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  // 'unsafe-inline' no script-src: o payload de hidratacao do React vem inline
  // no HTML. Um nonce exigiria render dinamico por request e mataria o
  // prerender estatico desta landing. Como nao ha entrada de usuario nem sink
  // de XSS, o inline aqui e aceitavel.
  // Facebook Pixel (connect.facebook.net) e GTM (googletagmanager.com) precisam
  // carregar scripts externos; ambos sao injetados via next/script afterInteractive.
  "script-src 'self' 'unsafe-inline' https://connect.facebook.net https://www.googletagmanager.com",
  // 'unsafe-inline' no style-src: styled/inline styles do build.
  "style-src 'self' 'unsafe-inline'",
  // data: obrigatorio: o grao do GrainOverlay usa um data URI; sem isto a
  // textura some. facebook.com e para o pixel noscript img tracker.
  "img-src 'self' data: https://www.facebook.com",
  // Fontes sao self-hosted no build; nenhum CDN externo.
  "font-src 'self'",
  // Endpoints externos que o site acessa via fetch(): newsletter, CAPI, Pixel e
  // Analytics. O Pixel faz beacons para facebook.com; o GTM para google-analytics.
  "connect-src 'self' https://sharknews-sub.com.br https://n8n.shkgroups.com https://connect.facebook.net https://www.facebook.com https://www.google-analytics.com https://www.googletagmanager.com",
  // GTM noscript iframe precisa de frame-src para carregar o ns.html.
  "frame-src https://www.googletagmanager.com",
  // frame-ancestors 'none': impede clickjacking. O risco concreto e envelopar
  // a pagina numa casca e trocar o botao de WhatsApp por outro numero (fraude
  // de marca, ja que o funil inteiro e um telefone).
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const nextConfig: NextConfig = {
  // O Next 16 grava AGENTS.md e CLAUDE.md na raiz a cada `next dev`. Ninguem
  // pediu esses arquivos e um CLAUDE.md na raiz conflita com as instrucoes
  // globais do time.
  agentRules: false,

  // Remove o header X-Powered-By: nao entrega gratuitamente qual stack roda
  // aqui e economiza alguns bytes por response.
  poweredByHeader: false,

  async headers() {
    return [
      {
        // Os nomes dos frames sao deterministicos e o conteudo so muda quando
        // o pipeline roda de novo. Sem isto os 23 MB da sequencia sobem com
        // max-age=0 e toda revisita revalida 360 arquivos antes de desenhar.
        source: '/cinematic/:path*',
        headers: [{ key: 'Cache-Control', value: `public, max-age=${ONE_YEAR_SECONDS}, immutable` }],
      },
      {
        source: '/brand/:path*',
        headers: [{ key: 'Cache-Control', value: `public, max-age=${ONE_YEAR_SECONDS}, immutable` }],
      },
      {
        // Headers de seguranca em todas as rotas.
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Strict-Transport-Security so tem efeito sobre HTTPS; o browser
          // ignora este header quando servido por HTTP. max-age de 2 anos com
          // includeSubDomains, conservador (sem preload por enquanto).
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains',
          },
          // Permissions-Policy: restringe APIs do browser que o site nao usa.
          // Reduz superficie de ataque e sinaliza conformidade em auditorias.
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          // CSP em modo enforcing. Passou pelo ciclo de observacao (Report-Only)
          // sem violacoes registradas; agora bloqueia de fato.
          {
            key: 'Content-Security-Policy',
            value: CONTENT_SECURITY_POLICY,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
