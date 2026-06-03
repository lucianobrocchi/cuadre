import type { Categoria } from '../../db/types';

interface Props {
  categorias: Categoria[];
  /** uuid de la categoría activa, o null = "Todos". */
  activa: string | null;
  onCambiar: (uuid: string | null) => void;
}

export function CategoriaChips({ categorias, activa, onCambiar }: Props) {
  if (categorias.length === 0) return null;

  return (
    <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Chip label="Todos" activo={activa === null} onClick={() => onCambiar(null)} />
      {categorias.map((c) => (
        <Chip
          key={c.uuid}
          label={`${c.emoji ? c.emoji + ' ' : ''}${c.nombre}`}
          activo={activa === c.uuid}
          onClick={() => onCambiar(c.uuid)}
        />
      ))}
    </div>
  );
}

function Chip({
  label,
  activo,
  onClick,
}: {
  label: string;
  activo: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition ${
        activo ? 'bg-cuadre text-white shadow-card' : 'bg-white text-cuadre-900/70 active:bg-cuadre-50'
      }`}
    >
      {label}
    </button>
  );
}
