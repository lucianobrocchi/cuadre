import type { ReactNode } from 'react';
import type { EstadoCierre } from '../db/types';
import { IconoCheck, IconoFlechaAbajo, IconoMas } from './Iconos';

interface Props {
  estado: EstadoCierre;
  titulo: string;
  detalle: string;
  children?: ReactNode;
}

const ESTILOS: Record<
  EstadoCierre,
  { fondo: string; circulo: string; texto: string; Icono: typeof IconoCheck }
> = {
  cuadra: {
    fondo: 'bg-cuadra/10',
    circulo: 'bg-cuadra',
    texto: 'text-cuadra',
    Icono: IconoCheck,
  },
  falta: {
    fondo: 'bg-falta/10',
    circulo: 'bg-falta',
    texto: 'text-falta',
    Icono: IconoFlechaAbajo,
  },
  sobra: {
    fondo: 'bg-sobra/10',
    circulo: 'bg-sobra',
    texto: 'text-sobra',
    Icono: IconoMas,
  },
};

/** Resultado grande y visual del cierre. El corazón del "ajá". */
export function ResultadoCierre({ estado, titulo, detalle, children }: Props) {
  const e = ESTILOS[estado];
  return (
    <div
      className={`animate-pop flex flex-col items-center rounded-3xl ${e.fondo} px-6 py-8 text-center`}
    >
      <div
        className={`flex h-20 w-20 items-center justify-center rounded-full ${e.circulo} text-white shadow-card`}
      >
        <e.Icono width={44} height={44} strokeWidth={2.5} />
      </div>
      <h2 className={`mt-5 text-4xl font-extrabold leading-tight ${e.texto}`}>
        {titulo}
      </h2>
      <p className="mt-3 max-w-xs text-base leading-relaxed text-cuadre-900/70">
        {detalle}
      </p>
      {children && <div className="mt-6 w-full">{children}</div>}
    </div>
  );
}
