import type { ReactNode } from 'react';
import { IconoAtras } from './Iconos';

interface Props {
  titulo: string;
  subtitulo?: string;
  onAtras?: () => void;
  accion?: ReactNode;
}

/** Header verde Cuadre, fijo arriba. Opcionalmente con botón "atrás". */
export function Header({ titulo, subtitulo, onAtras, accion }: Props) {
  return (
    <header className="safe-top sticky top-0 z-20 bg-cuadre text-white">
      <div className="mx-auto flex min-h-[3.5rem] max-w-md items-center gap-2 px-4 py-3 lg:max-w-4xl">
        {onAtras && (
          <button
            type="button"
            onClick={onAtras}
            aria-label="Volver"
            className="-ml-2 rounded-full p-2 transition active:bg-white/15"
          >
            <IconoAtras width={24} height={24} />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold leading-tight">{titulo}</h1>
          {subtitulo && (
            <p className="truncate text-sm text-white/70">{subtitulo}</p>
          )}
        </div>
        {accion}
      </div>
    </header>
  );
}
