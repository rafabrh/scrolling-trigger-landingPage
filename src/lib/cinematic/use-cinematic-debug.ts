'use client';

import { useEffect, useState } from 'react';

export const DEBUG_QUERY_PARAM = 'cinematicDebug';

/**
 * Desligado por padrão em qualquer ambiente, inclusive produção. Só a query
 * string liga, o que permite calibrar frame a frame num deploy real sem
 * expor o painel para quem chega pela URL limpa.
 */
export function useCinematicDebugEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEnabled(params.get(DEBUG_QUERY_PARAM) === 'true');
  }, []);

  return enabled;
}
