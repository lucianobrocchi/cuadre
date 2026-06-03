import type { ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  /** Si la pantalla vive dentro del shell con barra inferior, agrega padding. */
  conNav?: boolean;
  className?: string;
}

/** Contenedor scrollable de contenido, centrado y con ancho máximo mobile. */
export function Pantalla({ children, conNav = true, className = '' }: Props) {
  return (
    <main className={`mx-auto max-w-md px-4 pt-4 ${conNav ? 'pad-nav' : ''} ${className}`}>
      {children}
    </main>
  );
}
