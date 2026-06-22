import { Logo } from './Logo';
import { IconoAjustes } from './Iconos';
import { TABS, type Tab } from './navTabs';

interface Props {
  activa: Tab;
  onCambiar: (tab: Tab) => void;
  onAjustes: () => void;
  enAjustes?: boolean;
}

/** Navegación lateral fija, solo en escritorio (lg+). En mobile va la inferior. */
export function SideNav({ activa, onCambiar, onAjustes, enAjustes }: Props) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-cuadre/10 bg-white lg:flex">
      <div className="px-5 py-5">
        <Logo />
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {TABS.map(({ id, label, Icono }) => {
          const activo = !enAjustes && id === activa;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onCambiar(id)}
              aria-current={activo ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left font-semibold transition ${
                activo
                  ? 'bg-cuadre text-white shadow-card'
                  : 'text-cuadre-900/60 hover:bg-cuadre-50 active:bg-cuadre-100'
              }`}
            >
              <Icono filled={activo} width={24} height={24} />
              {label}
            </button>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={onAjustes}
        aria-current={enAjustes ? 'page' : undefined}
        className={`m-3 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left font-semibold transition ${
          enAjustes ? 'bg-cuadre text-white' : 'text-cuadre-900/60 hover:bg-cuadre-50'
        }`}
      >
        <IconoAjustes width={24} height={24} />
        Ajustes
      </button>
    </aside>
  );
}
