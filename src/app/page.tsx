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
  robots: { index: true, follow: true },
  openGraph: { url: '/' },
};

/**
 * Server Component. Só o cinematic é cliente, e ele não segura nada: todo o
 * conteúdo institucional está no HTML da primeira resposta.
 */
export default function Home() {
  return (
    <>
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
