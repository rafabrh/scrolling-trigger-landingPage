import type { Metadata } from 'next';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { WHATSAPP_URL, INSTAGRAM_URL } from '@/lib/content/whatsapp';

export const metadata: Metadata = {
  title: 'Privacidade',
  description:
    'Como o SHK Group trata os dados de visitantes neste site: cookies, newsletter, analytics e rastreamento.',
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
  openGraph: { url: '/privacy', title: 'Privacidade | SHK Group' },
};

const UPDATED = 'Setembro de 2026';

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />

      <main
        id="top"
        className="relative z-10 mx-auto max-w-[840px] px-24 py-32 max-md:px-6"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--paper-dim)]">
          Privacidade
        </p>
        <h1 className="mt-6 font-display text-[clamp(2rem,5vw,3.25rem)] font-bold leading-[1.05] text-[var(--paper)]">
          O que este site faz com os seus dados.
        </h1>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--paper-dim)]">
          Atualizado em {UPDATED}
        </p>

        <div className="mt-12 flex flex-col gap-10 text-[var(--paper-dim)] [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-[var(--paper)] [&_a]:text-[var(--accent)] [&_a]:underline [&_a]:underline-offset-4">
          <p className="text-[var(--paper)]">
            Versão curta: este site usa ferramentas de analytics com
            consentimento gerenciado. Nenhum dado é coletado sem a sua
            autorização. Abaixo explicamos o que existe e como funciona.
          </p>

          <section>
            <h2>Analytics e rastreamento</h2>
            <p>
              Utilizamos o Google Tag Manager (GTM) e o Meta Pixel (Facebook
              Pixel) para medir o desempenho do site. Ambos operam sob o
              Consent Mode v2: todas as categorias de consentimento (analytics,
              publicidade, personalização) ficam negadas por padrão. Isso
              significa que nenhum cookie de rastreamento é definido e nenhum
              evento de marketing é disparado até que o visitante conceda
              permissão.
            </p>
          </section>

          <section>
            <h2>Cookies</h2>
            <p>
              Enquanto o consentimento estiver negado, nenhum cookie de
              rastreamento é definido. Se no futuro o consentimento for
              concedido (por exemplo via banner de cookies), o GTM e o Pixel
              poderão definir cookies funcionais e de analytics conforme
              descrito nas políticas do{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer noopener">
                Google
              </a>{' '}
              e da{' '}
              <a href="https://www.facebook.com/privacy/policy" target="_blank" rel="noreferrer noopener">
                Meta
              </a>
              .
            </p>
          </section>

          <section>
            <h2>Newsletter (SharkNews)</h2>
            <p>
              O formulário de inscrição na SharkNews coleta seu nome e e-mail.
              Esses dados são usados exclusivamente para o envio da newsletter.
              A inscrição exige aceite explícito da política de privacidade via
              checkbox. Você pode cancelar a qualquer momento com um clique no
              link de cada edição.
            </p>
          </section>

          <section>
            <h2>Fontes e arquivos hospedados por nós</h2>
            <p>
              Fontes e imagens são servidas da nossa própria infraestrutura, e
              não de um CDN de terceiros — carregar esta página não repassa o
              seu endereço IP a nenhum provedor externo.
            </p>
          </section>

          <section>
            <h2>Fale com a gente</h2>
            <p>
              Dúvidas sobre privacidade, ou pedido sobre dados que você
              compartilhou conosco diretamente em uma conversa? Nos encontre no{' '}
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer noopener">
                WhatsApp
              </a>{' '}
              ou{' '}
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
