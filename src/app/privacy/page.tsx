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
  title: 'Privacidade',
  description:
    'Como o SHK Group trata os dados de visitantes neste site: sem cookies, sem formulários, sem rastreamento.',
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
  openGraph: { url: '/privacy', title: 'Privacidade | SHK Group' },
};

const UPDATED = 'Agosto de 2025';

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />

      <main
        id="intro"
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
            Versão curta: este site não coleta nada sobre você. Sem cookies,
            sem formulários, sem analytics, sem rastreadores de terceiros. Todas
            as fontes são servidas pelos nossos próprios servidores — nenhum
            provedor externo vê a sua visita.
          </p>

          <section>
            <h2>Sem cookies</h2>
            <p>
              Não definimos cookies e não usamos armazenamento local ou de
              sessão para identificar ou rastrear você. Não há banner de
              consentimento porque não há nada para consentir.
            </p>
          </section>

          <section>
            <h2>Sem formulários, sem contas</h2>
            <p>
              Não há formulários de cadastro, formulários de contato ou logins
              neste site. Nunca pedimos que você informe dados pessoais em uma
              página aqui. Qualquer conversa acontece no WhatsApp ou Instagram,
              onde se aplicam as políticas de privacidade dessas plataformas.
            </p>
          </section>

          <section>
            <h2>Sem analytics ou rastreamento</h2>
            <p>
              Neste momento não usamos analytics nem pixels de publicidade ou
              rastreamento. Se isso mudar, atualizaremos esta página primeiro e
              descreveremos exatamente o que é coletado e por quê.
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
