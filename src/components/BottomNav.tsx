import {
  IconoCaja,
  IconoGanancia,
  IconoHistorial,
  IconoProductos,
  IconoVender,
} from './Iconos';

export type Tab = 'vender' | 'negocio' | 'caja' | 'productos' | 'historial';

const TABS: { id: Tab; label: string; Icono: typeof IconoVender }[] = [
  { id: 'vender', label: 'Vender', Icono: IconoVender },
  { id: 'negocio', label: 'Negocio', Icono: IconoGanancia },
  { id: 'caja', label: 'Caja', Icono: IconoCaja },
  { id: 'productos', label: 'Productos', Icono: IconoProductos },
  { id: 'historial', label: 'Historial', Icono: IconoHistorial },
];

interface Props {
  activa: Tab;
  onCambiar: (tab: Tab) => void;
}

export function BottomNav({ activa, onCambiar }: Props) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-cuadre/10 bg-white/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-md">
        {TABS.map(({ id, label, Icono }) => {
          const activo = id === activa;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onCambiar(id)}
              aria-current={activo ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors ${
                activo ? 'text-cuadre' : 'text-cuadre-900/40'
              }`}
            >
              <Icono filled={activo} width={26} height={26} />
              <span className={`text-xs ${activo ? 'font-semibold' : 'font-medium'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
