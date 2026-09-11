'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

interface CinematicReadyContextValue {
  /** true depois que o handoff final do cinematic completa */
  ready: boolean;
  /** chamado pelo CinematicExperience no final da sequência */
  markReady: () => void;
}

const CinematicReadyContext = createContext<CinematicReadyContextValue>({
  ready: false,
  markReady: () => {},
});

/**
 * Timeout de segurança: se o cinematic não disparar markReady em 8s (rede
 * lenta, erro silencioso, JS falhando parcialmente), o header aparece de
 * qualquer jeito. Sem isto os itens data-boot-item ficam em opacity:0 para
 * sempre quando o cinematic falha com JS carregado.
 */
const READY_TIMEOUT_MS = 8_000;

export function CinematicReadyProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const markReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), READY_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <CinematicReadyContext.Provider value={{ ready, markReady }}>
      {children}
    </CinematicReadyContext.Provider>
  );
}

export function useCinematicReady(): CinematicReadyContextValue {
  return useContext(CinematicReadyContext);
}
