'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

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

export function CinematicReadyProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const markReady = useCallback(() => setReady(true), []);

  return (
    <CinematicReadyContext.Provider value={{ ready, markReady }}>
      {children}
    </CinematicReadyContext.Provider>
  );
}

export function useCinematicReady(): CinematicReadyContextValue {
  return useContext(CinematicReadyContext);
}
