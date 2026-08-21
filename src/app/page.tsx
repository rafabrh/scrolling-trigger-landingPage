import { PersistentCityBackground } from '@/components/background/PersistentCityBackground';
import { CinematicExperience } from '@/components/cinematic/CinematicExperience';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { InstitutionalIntro } from '@/components/sections/InstitutionalIntro';
import { ProductsSection } from '@/components/sections/ProductsSection';
import { TechnologySection } from '@/components/sections/TechnologySection';
import { AboutSection } from '@/components/sections/AboutSection';
import { CasesSection } from '@/components/sections/CasesSection';
import { ContactSection } from '@/components/sections/ContactSection';
import type { Metadata } from 'next';
import { SITE_URL } from './layout';
import { INSTAGRAM_URL, WHATSAPP_URL } from '@/lib/content/whatsapp';
import { shouldIndex } from '@/lib/env/deploy';

/**
 * Metadata ESPECÍFICA da home. Fica aqui, e não no layout, porque o layout
 * envolve o not-found: um `canonical: '/'` ou `robots` no layout vazaria para
 * o 404 e o faria se auto-canonicalizar para a home (soft-404). Este metadata
 * faz merge sobre o base do layout — só declara o que é próprio da home.
 *
 * O canonical existe porque ?cinematicDebug=true e qualquer UTM viram
 * documento indexável separado; ele colapsa tudo na raiz. O `openGraph.url`
 * repete o canonical para o card apontar para a URL canônica da home.
 */
export const metadata: Metadata = {
  alternates: { canonical: '/' },
  // Indexação condicionada ao sinal de deploy: um preview da Vercel vira
  // noindex/nofollow; produção (e qualquer host não-Vercel) segue indexável.
  robots: { index: shouldIndex(), follow: shouldIndex() },
  openGraph: { url: '/' },
};

/**
 * Server Component. Só o cinematic é cliente, e ele não segura nada: todo o
 * conteúdo institucional está no HTML da primeira resposta.
 */
/**
 * JSON-LD Organization: dado estruturado estático para os buscadores associarem
 * marca, URL, logo e perfis sociais. Objeto tipado, sem input dinâmico/usuário.
 */
const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'SHK Group',
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  sameAs: [INSTAGRAM_URL, WHATSAPP_URL],
} as const;

export default function Home() {
  return (
    <>
      {/*
        dangerouslySetInnerHTML aqui NÃO é sink de XSS: o conteúdo é um
        JSON.stringify de `orgJsonLd`, um objeto constante e estático, sem
        nenhuma interpolação de input dinâmico/usuário. Renderiza server-side no
        HTML pré-renderizado. É o idioma padrão e seguro de JSON-LD no Next.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <PersistentCityBackground />
      <SiteHeader />

      <main id="top">
        <CinematicExperience />
        <InstitutionalIntro />
        <ProductsSection />
        <TechnologySection />
        <AboutSection />
        <CasesSection />
        <ContactSection />
      </main>

      <SiteFooter />
    </>
  );
}
