import type { NextConfig } from 'next';

const ONE_YEAR_SECONDS = 31_536_000;

const nextConfig: NextConfig = {
  // O Next 16 grava AGENTS.md e CLAUDE.md na raiz a cada `next dev`. Ninguem
  // pediu esses arquivos e um CLAUDE.md na raiz conflita com as instrucoes
  // globais do time.
  agentRules: false,

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
    ];
  },
};

export default nextConfig;
