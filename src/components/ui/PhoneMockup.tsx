'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

/* ------------------------------------------------------------------ */
/*  Data: conversa que roda no mockup                                  */
/* ------------------------------------------------------------------ */

type Bubble = {
  from: 'user' | 'agent';
  text: string;
  badge?: string;
};

const CONVERSATION: Bubble[] = [
  {
    from: 'user',
    text: 'Olá! Vi o anúncio de vocês. Quanto custa o serviço? 😊',
    badge: 'Lead qualificado',
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
  },
];

const TYPING_DELAY = 1200;
const MESSAGE_DELAY = 1800;

/* ------------------------------------------------------------------ */
/*  Componentes internos                                               */
/* ------------------------------------------------------------------ */

function TypingIndicator() {
  return (
    <div
      className="flex gap-1 rounded-2xl rounded-tl-sm px-4 py-3"
      style={{ width: 'fit-content', backgroundColor: 'var(--ink-800)' }}
    >
      <span className="animate-[bounce_1.2s_ease-in-out_infinite] h-2 w-2 rounded-full bg-[var(--accent-dim)]" />
      <span className="animate-[bounce_1.2s_ease-in-out_0.2s_infinite] h-2 w-2 rounded-full bg-[var(--accent-dim)]" />
      <span className="animate-[bounce_1.2s_ease-in-out_0.4s_infinite] h-2 w-2 rounded-full bg-[var(--accent-dim)]" />
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
      {bubble.badge && visible && (
        <div className={`mb-1 flex ${isAgent ? 'justify-start' : 'justify-end'}`}>
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
            style={{
              backgroundColor: isAgent ? 'var(--accent)' : 'var(--accent-dim)',
              color: 'var(--ink-900)',
            }}
          >
            {bubble.badge}
          </span>
        </div>
      )}
      <div className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}>
        <div
          className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed"
          style={
            isAgent
              ? {
                  borderTopLeftRadius: '4px',
                  backgroundColor: 'var(--ink-800)',
                  color: 'var(--paper)',
                }
              : {
                  borderTopRightRadius: '4px',
                  backgroundColor: 'var(--accent-dim)',
                  color: 'var(--ink-900)',
                }
          }
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
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setVisibleCount(CONVERSATION.length);
      return;
    }

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

    return () => {
      observer.disconnect();
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function runSequence() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    let delay = 500;
    for (let i = 0; i < CONVERSATION.length; i++) {
      const typingDelay = delay;
      timersRef.current.push(setTimeout(() => setShowTyping(true), typingDelay));
      delay += TYPING_DELAY;

      const msgDelay = delay;
      const msgIndex = i + 1;
      timersRef.current.push(setTimeout(() => {
        setShowTyping(false);
        setVisibleCount(msgIndex);
      }, msgDelay));
      delay += MESSAGE_DELAY;
    }

    timersRef.current.push(setTimeout(() => {
      setVisibleCount(0);
      hasStarted.current = false;
      const el = containerRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          hasStarted.current = true;
          runSequence();
        }
      }
    }, delay + 3000));
  }

  return (
    <div ref={containerRef} className="flex items-center justify-center" aria-hidden="true">
      {/* Frame do celular */}
      <div
        className="relative w-[300px] overflow-hidden rounded-[36px] shadow-2xl sm:w-[320px]"
        style={{
          backgroundColor: 'var(--ink-900)',
          border: '1px solid var(--surface-border)',
          boxShadow: '0 0 60px var(--accent-pulse), 0 25px 50px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Notch */}
        <div className="mx-auto mt-2 h-5 w-24 rounded-full" style={{ backgroundColor: 'var(--ink-700)' }} />

        {/* Header do chat */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: '1px solid var(--surface-border)' }}
        >
          <div
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full"
            style={{ backgroundColor: 'var(--ink-700)' }}
          >
            <Image src="/brand/logo-teal.png" alt="" width={28} height={28} className="h-7 w-7 object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold" style={{ color: 'var(--paper)' }}>
              Agente IA — SHK
            </span>
            <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--accent)' }}>
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: 'var(--accent)' }}
              />
              Online agora
            </span>
          </div>
        </div>

        {/* Corpo do chat — altura fixa para o celular não pular */}
        <div className="flex h-[340px] flex-col gap-3 overflow-hidden px-3 py-4">
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
          <span
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold"
            style={{ backgroundColor: 'var(--ink-800)', color: 'var(--accent)' }}
          >
            <span>⚡</span> Resposta em 10s
          </span>
        </div>

        {/* Input bar */}
        <div
          className="flex items-center gap-2 px-3 py-3"
          style={{ borderTop: '1px solid var(--surface-border)' }}
        >
          <div
            className="flex-1 rounded-full px-4 py-2 text-[11px]"
            style={{ backgroundColor: 'var(--ink-700)', color: 'var(--paper-dim)' }}
          >
            Mensagem...
          </div>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 2L11 13" stroke="var(--ink-900)" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="var(--ink-900)" />
            </svg>
          </div>
        </div>

        {/* Home bar */}
        <div className="mx-auto mb-2 mt-1 h-1 w-28 rounded-full" style={{ backgroundColor: 'var(--surface-border)' }} />
      </div>
    </div>
  );
}
