import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://shkgroup.com.br';

/**
 * `lastModified` como constante estável em vez de `new Date()`. Motivo: build
 * reproduzível — dois builds do mesmo commit produzem o mesmo sitemap.xml, sem
 * churn de data que faria crawlers re-rastrearem sem conteúdo novo. Em
 * sitemap.ts (server-side, fora do HTML) um `new Date()` seria aceitável, mas
 * a constante é a escolha mais previsível. Atualize esta data quando o
 * conteúdo real das rotas mudar.
 */
const LAST_MODIFIED = '2025-08-20';

/**
 * URLs reais e indexáveis do site. As âncoras da home (#products, #technology
 * etc.) NÃO entram: são fragmentos da mesma URL '/', não documentos separados.
 * As rotas reais hoje são a home e /privacy.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
