import type { MetadataRoute } from 'next';

// Mesma fonte de verdade do metadataBase em layout.tsx. robots.txt precisa de
// URL absoluta para o Sitemap, então repetimos o fallback aqui.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://shkgroup.com.br';

/**
 * Serve /robots.txt para os crawlers. Indexação geral liberada (a home é
 * indexável) e aponta o sitemap. Isto coexiste com o `metadata.robots` das
 * páginas: aquele controla a meta tag por página (home index, 404 noindex),
 * este controla o arquivo robots.txt. Ambos concordam: nada é bloqueado aqui,
 * e o único noindex do site é o do 404, que o Next injeta na resposta 404.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
