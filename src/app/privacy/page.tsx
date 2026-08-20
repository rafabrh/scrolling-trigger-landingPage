import type { Metadata } from 'next';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { WHATSAPP_URL, INSTAGRAM_URL } from '@/lib/content/site-content';

/**
 * Metadata própria da privacy. Escolha: `index: true`. A página é honesta e
 * pública — não há motivo para escondê-la de crawlers, e tê-la indexável é
 * um sinal de conformidade a favor do site. O canonical aponta para ela
 * mesma. (Se um dia a política mudar para algo sensível, basta trocar para
 * `index: false`.) Não herda o canonical '/' da home: o item 18 tirou o
 * canonical do layout justamente para cada página declarar o seu.
 */
export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'How SHK Group handles visitor data on this site: no cookies, no forms, no tracking.',
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
  openGraph: { url: '/privacy', title: 'Privacy | SHK Group' },
};

const UPDATED = 'August 2025';

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />

      <main
        id="intro"
        className="relative z-10 mx-auto max-w-[840px] px-24 py-32 max-md:px-6"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--paper-dim)]">
          Privacy
        </p>
        <h1 className="mt-6 font-display text-[clamp(2rem,5vw,3.25rem)] font-bold leading-[1.05] text-[var(--paper)]">
          What this site does with your data.
        </h1>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--paper-dim)]">
          Last updated {UPDATED}
        </p>

        <div className="mt-12 flex flex-col gap-10 text-[var(--paper-dim)] [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-[var(--paper)] [&_a]:text-[var(--accent)] [&_a]:underline [&_a]:underline-offset-4">
          <p className="text-[var(--paper)]">
            The short version: this website collects nothing about you. No
            cookies, no forms, no analytics, no third-party trackers. Every
            font is served from our own servers, so no external provider sees
            your visit either.
          </p>

          <section>
            <h2>No cookies</h2>
            <p>
              We do not set cookies and we do not use local or session storage
              to identify or follow you. There is no consent banner because
              there is nothing to consent to.
            </p>
          </section>

          <section>
            <h2>No forms, no accounts</h2>
            <p>
              There are no sign-up forms, contact forms, or logins on this
              site. We never ask you to type personal information into a page
              here. Any conversation happens on WhatsApp or Instagram, where
              those platforms&apos; own privacy policies apply.
            </p>
          </section>

          <section>
            <h2>No analytics or tracking today</h2>
            <p>
              At the time of this update we run no analytics and no advertising
              or tracking pixels. If that ever changes, we will update this
              page first and describe exactly what is collected and why.
            </p>
          </section>

          <section>
            <h2>Self-hosted fonts and assets</h2>
            <p>
              Fonts and images are served from our own infrastructure rather
              than a third-party CDN, so loading this page does not hand your IP
              address to an outside font or asset provider.
            </p>
          </section>

          <section>
            <h2>Talk to us</h2>
            <p>
              Questions about privacy, or a request about any data you have
              shared with us directly in a conversation? Reach us on{' '}
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer noopener">
                WhatsApp
              </a>{' '}
              or{' '}
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer noopener">
                Instagram
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
