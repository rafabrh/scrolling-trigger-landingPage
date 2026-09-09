'use client';

import { useEffect, useRef, useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Data: conversa que roda no mockup                                  */
/* ------------------------------------------------------------------ */

type Bubble = {
  from: 'user' | 'agent';
  text: string;
  badge?: string;
  badgeColor?: string;
};

const CONVERSATION: Bubble[] = [
  {
    from: 'user',
    text: 'Olá! Vi o anúncio de vocês. Quanto custa o serviço? 😊',
    badge: 'Lead qualificado',
    badgeColor: '#a855f7',
  },
  {
    from: 'agent',
    text: 'Olá! Nosso plano Start é apenas R$99,90/mês. Inclui 1 agente IA + funil de vendas completo 😄',
  },
  {
    from: 'user',
    text: 'Muito bom! Como funciona a ativação?',
  },
  {
    from: 'agent',
    text: 'Ativamos em até 48h! Posso gerar seu link de pagamento agora?',
    badge: 'Pagamento enviado',
    badgeColor: '#00d4aa',
  },
];

const TYPING_DELAY = 1200;
const MESSAGE_DELAY = 1800;

/* ------------------------------------------------------------------ */
/*  Componentes internos                                               */
/* ------------------------------------------------------------------ */

function TypingIndicator() {
  return (
    <div className="flex gap-1 rounded-2xl rounded-tl-sm bg-[#1e1e2e] px-4 py-3" style={{ width: 'fit-content' }}>
      <span className="animate-[bounce_1.2s_ease-in-out_infinite] h-2 w-2 rounded-full bg-[#666]" />
      <span className="animate-[bounce_1.2s_ease-in-out_0.2s_infinite] h-2 w-2 rounded-full bg-[#666]" />
      <span className="animate-[bounce_1.2s_ease-in-out_0.4s_infinite] h-2 w-2 rounded-full bg-[#666]" />
    </div>
  );
}

function ChatBubble({ bubble, visible }: { bubble: Bubble; visible: boolean }) {
  const isAgent = bubble.from === 'agent';
  return (
    <div
      className="transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
      }}
    >
      {/* Badge acima da mensagem */}
      {bubble.badge && visible && (
        <div className={`mb-1 flex ${isAgent ? 'justify-start' : 'justify-end'}`}>
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white"
            style={{ backgroundColor: bubble.badgeColor }}
          >
            {bubble.badge}
          </span>
        </div>
      )}
      <div className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}>
        <div
          className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed ${
            isAgent
              ? 'rounded-tl-sm bg-[#1e1e2e] text-[#e0e0e0]'
              : 'rounded-tr-sm bg-[#6c3fc5] text-white'
          }`}
        >
          {bubble.text}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Componente principal                                               */
/* ------------------------------------------------------------------ */

export function PhoneMockup() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [showTyping, setShowTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    // IntersectionObserver: só anima quando entra no viewport
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !hasStarted.current) {
          hasStarted.current = true;
          runSequence();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function runSequence() {
    let delay = 500;
    for (let i = 0; i < CONVERSATION.length; i++) {
      // Mostra typing
      const typingDelay = delay;
      setTimeout(() => setShowTyping(true), typingDelay);
      delay += TYPING_DELAY;

      // Esconde typing, mostra mensagem
      const msgDelay = delay;
      const msgIndex = i + 1;
      setTimeout(() => {
        setShowTyping(false);
        setVisibleCount(msgIndex);
      }, msgDelay);
      delay += MESSAGE_DELAY;
    }

    // Reinicia a animação depois de uma pausa
    setTimeout(() => {
      setVisibleCount(0);
      hasStarted.current = false;
      // Dispara de novo se ainda visível
      const el = containerRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          hasStarted.current = true;
          runSequence();
        }
      }
    }, delay + 3000);
  }

  return (
    <div ref={containerRef} className="flex items-center justify-center">
      {/* Frame do celular */}
      <div
        className="relative w-[300px] overflow-hidden rounded-[36px] border border-[#2a2a3a] bg-[#0d0d14] shadow-2xl sm:w-[320px]"
        style={{ boxShadow: '0 0 60px rgba(0, 212, 170, 0.08), 0 25px 50px rgba(0, 0, 0, 0.6)' }}
      >
        {/* Notch */}
        <div className="mx-auto mt-2 h-5 w-24 rounded-full bg-[#1a1a24]" />

        {/* Header do chat */}
        <div className="flex items-center gap-3 border-b border-[#1e1e2e] px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6c3fc5] text-xs font-bold text-white">
            IA
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-white">Agente IA — SHK</span>
            <span className="flex items-center gap-1 text-[10px] text-[#00d4aa]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#00d4aa]" />
              Online agora
            </span>
          </div>
        </div>

        {/* Corpo do chat */}
        <div className="flex min-h-[320px] flex-col gap-3 px-3 py-4">
          {CONVERSATION.map((bubble, i) => (
            <ChatBubble key={i} bubble={bubble} visible={i < visibleCount} />
          ))}
          {showTyping && (
            <div className="animate-in fade-in duration-300">
              <TypingIndicator />
            </div>
          )}
        </div>

        {/* Badge "Resposta em 10s" */}
        <div className="flex justify-center pb-4">
          <span className="flex items-center gap-1.5 rounded-full bg-[#1e1e2e] px-3 py-1.5 text-[10px] font-semibold text-[#f5c542]">
            <span>⚡</span> Resposta em 10s
          </span>
        </div>

        {/* Input bar */}
        <div className="flex items-center gap-2 border-t border-[#1e1e2e] px-3 py-3">
          <div className="flex-1 rounded-full bg-[#1a1a24] px-4 py-2 text-[11px] text-[#555]">
            Mensagem...
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00d4aa]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </div>
        </div>

        {/* Home bar */}
        <div className="mx-auto mb-2 mt-1 h-1 w-28 rounded-full bg-[#333]" />
      </div>
    </div>
  );
}
