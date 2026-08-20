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
