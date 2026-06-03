import type { ReactNode } from 'react';
import { Logo } from '../../components/Logo';
import { IconoAtras } from '../../components/Iconos';

interface Props {
  paso: number;
  total?: number;
  children: ReactNode;
  footer?: ReactNode;
  onAtras?: () => void;
}

/** Marco común de los pasos del onboarding: progreso arriba, footer fijo abajo. */
export function OnboardingLayout({ paso, total = 4, children, footer, onAtras }: Props) {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col">
      <div className="safe-top px-5 pt-4">
        <div className="flex h-9 items-center justify-between">
          {onAtras ? (
            <button
              type="button"
              onClick={onAtras}
              aria-label="Volver"
              className="-ml-2 rounded-full p-2 text-cuadre transition active:bg-cuadre-50"
            >
              <IconoAtras width={22} height={22} />
            </button>
          ) : (
            <Logo />
          )}
          <span className="text-sm font-medium text-cuadre-900/40">
            Paso {paso} de {total}
          </span>
        </div>

        {/* Barra de progreso */}
        <div className="mt-3 flex gap-1.5">
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < paso ? 'bg-cuadre' : 'bg-cuadre/10'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 px-5 py-5">{children}</div>

      {footer && (
        <div
          className="sticky bottom-0 bg-gradient-to-t from-[#F3F6F4] via-[#F3F6F4] to-transparent px-5 pt-4"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.25rem)' }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
