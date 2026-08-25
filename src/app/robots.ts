import type { MetadataRoute } from 'next';
import { shouldIndex, SITE_URL } from '@/lib/env/deploy';

/**
 * Serve /robots.txt para os crawlers. Indexação geral liberada (a home é
 * indexável) e aponta o sitemap. Isto coexiste com o `metadata.robots` das
 * páginas: aquele controla a meta tag por página (home index, 404 noindex),
 * este controla o arquivo robots.txt. Ambos concordam: nada é bloqueado aqui,
 * e o único noindex do site é o do 404, que o Next injeta na resposta 404.
 */
export default function robots(): MetadataRoute.Robots {
  // Num preview da Vercel, bloqueia todo crawling para não indexar o ambiente
  // nem duplicar conteúdo do domínio de produção. Produção segue liberando '/'.
  if (!shouldIndex()) {
    return {
      rules: { userAgent: '*', disallow: '/' },
      sitemap: `${SITE_URL}/sitemap.xml`,
      host: SITE_URL,
    };
  }

  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
