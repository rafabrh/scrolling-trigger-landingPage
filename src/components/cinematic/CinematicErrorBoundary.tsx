'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  readonly fallback: ReactNode;
  readonly children: ReactNode;
}

interface State {
  readonly failed: boolean;
}

/**
 * Cerca só a ilha cinematic. Sem ela, um erro de cliente na única parte da
 * página que não carrega informação — gsap, createImageBitmap, canvas.getContext,
 * leituras de navigator.connection — troca o documento inteiro pela tela de
 * "Application error" do Next. Com ela, a falha fica contida e o fallback
 * estático assume, preservando as seis seções institucionais.
 *
 * Precisa ser class component: getDerivedStateFromError e componentDidCatch não
 * têm equivalente em hooks. O erro é registrado, não engolido — em produção
 * sobe para o console de quem estiver depurando, sem derrubar a página.
 */
export class CinematicErrorBoundary extends Component<Props, State> {
  override state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  override componentDidCatch(error: unknown): void {
    console.error('[cinematic] ilha caiu, servindo fallback estático:', error);
  }

  override render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
