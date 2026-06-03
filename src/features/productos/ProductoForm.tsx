import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Producto } from '../../db/types';
import { agregarCategoria, listarCategorias } from '../../db/categorias';
import { emojisSugeridos } from '../../data/catalogoInicial';
import { InputPlata } from '../../components/InputPlata';
import { formatPesos } from '../../lib/format';
import { productosCopy as t } from './productos.copy';

interface DatosProducto {
  nombre: string;
  precio: number;
  costo?: number;
  emoji?: string;
  categoriaUuid?: string;
}

interface Props {
  inicial?: Producto;
  onGuardar: (datos: DatosProducto) => void;
  onBorrar?: () => void;
}

export function ProductoForm({ inicial, onGuardar, onBorrar }: Props) {
  const categorias = useLiveQuery(() => listarCategorias(), [], []);
  const [nombre, setNombre] = useState(inicial?.nombre ?? '');
  const [precio, setPrecio] = useState(inicial?.precio ?? 0);
  const [costo, setCosto] = useState(inicial?.costo ?? 0);
  const [emoji, setEmoji] = useState<string | undefined>(inicial?.emoji);
  const [categoriaUuid, setCategoriaUuid] = useState<string | undefined>(inicial?.categoriaUuid);
  const [creandoCat, setCreandoCat] = useState(false);
  const [nuevaCat, setNuevaCat] = useState('');

  const valido = nombre.trim().length > 0 && precio > 0;

  async function crearCategoria() {
    if (!nuevaCat.trim()) return;
    const cat = await agregarCategoria(nuevaCat.trim());
    setCategoriaUuid(cat.uuid);
    setNuevaCat('');
    setCreandoCat(false);
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label htmlFor="prod-nombre" className="mb-2 block font-semibold text-cuadre-900">
          {t.nombreLabel}
        </label>
        <input
          id="prod-nombre"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder={t.nombrePlaceholder}
          autoComplete="off"
          autoFocus
          className="input-grande text-xl"
        />
      </div>

      <div>
        <label htmlFor="prod-precio" className="mb-2 block font-semibold text-cuadre-900">
          {t.precioLabel}
        </label>
        <InputPlata id="prod-precio" valor={precio} onCambiar={setPrecio} placeholder="0" />
      </div>

      <div>
        <label htmlFor="prod-costo" className="mb-2 block font-semibold text-cuadre-900">
          {t.costoLabel}{' '}
          <span className="font-normal text-cuadre-900/40">· {t.costoOpcional}</span>
        </label>
        <InputPlata id="prod-costo" valor={costo} onCambiar={setCosto} placeholder="0" />
        {costo > 0 &&
          precio > 0 &&
          (costo < precio ? (
            <p className="mt-1.5 text-sm font-semibold text-cuadra">
              {t.gananciaHint(formatPesos(precio - costo), Math.round(((precio - costo) / precio) * 100))}
            </p>
          ) : (
            <p className="mt-1.5 text-sm font-semibold text-falta">{t.costoMayorPrecio}</p>
          ))}
      </div>

      {/* Categoría */}
      <div>
        <span className="mb-2 block font-semibold text-cuadre-900">{t.categoriaLabel}</span>
        <div className="flex flex-wrap gap-2">
          <CatChip
            label={t.sinCategoria}
            activo={!categoriaUuid}
            onClick={() => setCategoriaUuid(undefined)}
          />
          {categorias.map((c) => (
            <CatChip
              key={c.uuid}
              label={c.nombre}
              activo={categoriaUuid === c.uuid}
              onClick={() => setCategoriaUuid(c.uuid)}
            />
          ))}
          {!creandoCat && (
            <button
              type="button"
              onClick={() => setCreandoCat(true)}
              className="rounded-full border-2 border-dashed border-cuadre/25 px-3 py-1.5 text-sm font-semibold text-cuadre"
            >
              + {t.nuevaCategoria}
            </button>
          )}
        </div>
        {creandoCat && (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={nuevaCat}
              onChange={(e) => setNuevaCat(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && crearCategoria()}
              placeholder={t.nuevaCategoriaPh}
              autoComplete="off"
              autoFocus
              className="min-w-0 flex-1 rounded-xl border-2 border-cuadre/15 px-3 py-2 font-semibold text-cuadre-900 outline-none focus:border-cuadre"
            />
            <button
              type="button"
              onClick={crearCategoria}
              disabled={!nuevaCat.trim()}
              className="shrink-0 rounded-xl bg-cuadre px-4 font-semibold text-white disabled:opacity-30"
            >
              {t.crear}
            </button>
          </div>
        )}
      </div>

      {/* Emoji */}
      <div>
        <span className="mb-2 block font-semibold text-cuadre-900">{t.emojiLabel}</span>
        <div className="flex flex-wrap gap-2">
          {emojisSugeridos.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji((prev) => (prev === e ? undefined : e))}
              className={`flex h-11 w-11 items-center justify-center rounded-xl text-2xl transition ${
                emoji === e
                  ? 'bg-cuadre-50 ring-2 ring-cuadre'
                  : 'bg-cuadre-50/50 active:bg-cuadre-50'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={!valido}
        onClick={() =>
          onGuardar({
            nombre: nombre.trim(),
            precio,
            costo: costo > 0 ? costo : undefined,
            emoji,
            categoriaUuid,
          })
        }
        className="btn-primario mt-1"
      >
        {t.guardar}
      </button>

      {onBorrar && (
        <button
          type="button"
          onClick={onBorrar}
          className="-mt-1 py-2 text-center font-semibold text-falta transition active:opacity-70"
        >
          {t.borrar}
        </button>
      )}
    </div>
  );
}

function CatChip({
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
      className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
        activo ? 'bg-cuadre text-white' : 'bg-cuadre-50 text-cuadre-900/70 active:bg-cuadre-100'
      }`}
    >
      {label}
    </button>
  );
}
