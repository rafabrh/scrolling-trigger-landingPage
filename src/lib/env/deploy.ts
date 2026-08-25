/**
 * Origem absoluta do site. Fonte única para canonical, og:url, metadataBase,
 * sitemap.xml, robots.txt e o JSON-LD Organization. Obrigatória em produção;
 * cai no domínio real como fallback seguro (a indexação é controlada
 * separadamente pelo sinal VERCEL_ENV, então um preview sem esta variável
 * continua desindexado).
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://shkgroup.com.br';

/**
 * Detecção do tipo de deploy para decidir indexabilidade.
 *
 * Sinal: `VERCEL_ENV`, injetada automaticamente pela Vercel. Vale
 * 'production' | 'preview' | 'development'. Só o deploy de produção canônico
 * deve ser indexado; previews e ambientes de dev não, senão viram conteúdo
 * duplicado que se auto-canonicaliza para o domínio de produção.
 */

/**
 * Retorna true quando estamos num deploy de PREVIEW da Vercel (branch preview
 * ou ambiente de desenvolvimento).
 */
export function isPreviewDeploy(): boolean {
  const env = process.env.VERCEL_ENV;
  return env === 'preview' || env === 'development';
}

/**
 * Decide se este deploy deve ser indexável pelos buscadores.
 *
 * Default conservador: quando `VERCEL_ENV` é 'production' OU está indefinida
 * (host não-Vercel, build de produção local, deploy custom), tratamos como
 * produção e liberamos a indexação — exatamente o comportamento de hoje.
 * SOMENTE um preview da Vercel detectado explicitamente vira noindex. Assim o
 * deploy real de produção nunca corre risco de ser desindexado por engano.
 */
export function shouldIndex(): boolean {
  return !isPreviewDeploy();
}
