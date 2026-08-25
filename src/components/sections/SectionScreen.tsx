import type { ReactNode } from 'react';

interface SectionScreenProps {
  active: boolean;
  children: ReactNode;
  id?: string;
}

/**
 * Wrapper fullscreen para cada seção. Posicionado absolute sobre o container
 * pai (que deve ser relative/fixed). Quando active: opacity 1 + pointer-events.
 * A classe section-enter ativa o stagger CSS dos filhos diretos do inner wrapper.
 */
export function SectionScreen({ active, children, id }: SectionScreenProps) {
  return (
    <div
      id={id}
      className={`section-enter absolute inset-0 overflow-y-auto${active ? ' active opacity-100 pointer-events-auto' : ' opacity-0 pointer-events-none'}`}
      style={{ transition: 'opacity 0.3s ease' }}
    >
      <div className="mx-auto flex h-full max-w-7xl flex-col justify-center px-6 py-24">
        {children}
      </div>
    </div>
  );
}
