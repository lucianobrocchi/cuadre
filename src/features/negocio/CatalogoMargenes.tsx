import { useState } from 'react';
import type { Producto } from '../../db/types';
import { editarProducto } from '../../db/productos';
import { Sheet } from '../../components/Sheet';
import { InputPlata } from '../../components/InputPlata';
import { IconoChevron } from '../../components/Iconos';
import { formatPesos } from '../../lib/format';
import {
  formatPct,
  type CategoriaCatalogo,
  type ProductoConMargen,
  type ResumenCatalogo,
} from '../../lib/rentabilidad';
import { negocioCopy as t } from './negocio.copy';

/** Margen del catálogo por categoría → producto, con edición de costo al toque. */
export function CatalogoMargenes({ catalogo }: { catalogo: ResumenCatalogo }) {
  const [editando, setEditando] = useState<Producto | null>(null);

  if (catalogo.totalProductos === 0) {
    return (
      <div className="card mt-2 flex flex-col items-center p-8 text-center">
        <span className="text-4xl" aria-hidden>
          📦
        </span>
        <h3 className="mt-3 font-bold text-cuadre-900">{t.sinProductosTitulo}</h3>
        <p className="mt-1 text-sm text-cuadre-900/55">{t.sinProductosSub}</p>
      </div>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-2">
        {catalogo.categorias.map((c) => (
          <FilaCategoria key={c.uuid ?? '__sin__'} cat={c} onEditar={setEditando} />
        ))}
      </ul>

      <Sheet
        abierto={editando !== null}
        onCerrar={() => setEditando(null)}
        titulo={editando?.nombre ?? ''}
      >
        {editando && <EditorCosto producto={editando} onListo={() => setEditando(null)} />}
      </Sheet>
    </>
  );
}

function Emoji({ children }: { children?: string }) {
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cuadre-50 text-xl"
      aria-hidden
    >
      {children ?? '🛒'}
    </span>
  );
}

function FilaCategoria({
  cat,
  onEditar,
}: {
  cat: CategoriaCatalogo;
  onEditar: (p: Producto) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  return (
    <li className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center gap-3 p-3 text-left transition active:bg-cuadre-50/40"
      >
        <Emoji>{cat.emoji}</Emoji>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-cuadre-900">{cat.nombre}</span>
          {cat.sinCosto > 0 && <span className="text-sm text-sobra">{t.nSinCosto(cat.sinCosto)}</span>}
        </span>
        {cat.margenPct !== null ? (
          <span className="num shrink-0 font-extrabold text-cuadra">{formatPct(cat.margenPct)}</span>
        ) : (
          <span className="shrink-0 text-sm text-cuadre-900/40">{t.sinCosto}</span>
        )}
        <IconoChevron
          width={18}
          height={18}
          className={`shrink-0 text-cuadre-900/25 transition-transform ${abierto ? 'rotate-90' : ''}`}
        />
      </button>
      {abierto && (
        <ul className="divide-y divide-cuadre/5 border-t border-cuadre/5">
          {cat.productos.map((pm) => (
            <FilaProducto key={pm.producto.id} pm={pm} onEditar={onEditar} />
          ))}
        </ul>
      )}
    </li>
  );
}

function FilaProducto({
  pm,
  onEditar,
}: {
  pm: ProductoConMargen;
  onEditar: (p: Producto) => void;
}) {
  const { producto, margen } = pm;
  return (
    <li>
      <button
        type="button"
        onClick={() => onEditar(producto)}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition active:bg-cuadre-50/40"
      >
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cuadre-50 text-lg"
          aria-hidden
        >
          {producto.emoji ?? '🛒'}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-cuadre-900">
            {producto.nombre}
          </span>
          <span className="num block text-xs text-cuadre-900/45">
            {formatPesos(producto.precio)}
            {producto.costo != null && <> · costo {formatPesos(producto.costo)}</>}
          </span>
        </span>
        {margen ? (
          <span className="shrink-0 text-right">
            <span
              className={`num block font-bold ${margen.ganancia >= 0 ? 'text-cuadra' : 'text-falta'}`}
            >
              {formatPesos(margen.ganancia)}
            </span>
            <span className="num block text-xs text-cuadre-900/45">{formatPct(margen.pct)}</span>
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-sobra/15 px-2.5 py-1 text-xs font-bold text-sobra">
            {t.ponerCosto}
          </span>
        )}
      </button>
    </li>
  );
}

function EditorCosto({ producto, onListo }: { producto: Producto; onListo: () => void }) {
  const [costo, setCosto] = useState(producto.costo ?? 0);
  const ganancia = producto.precio - costo;
  const pct = producto.precio > 0 ? ganancia / producto.precio : 0;

  async function guardar() {
    if (producto.id == null) return;
    await editarProducto(producto.id, { costo: costo > 0 ? costo : undefined });
    onListo();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-xl bg-cuadre-50/60 px-4 py-3">
        <span className="text-cuadre-900/60">{t.editorPrecio}</span>
        <span className="num font-bold text-cuadre-900">{formatPesos(producto.precio)}</span>
      </div>
      <div>
        <label htmlFor="costo-rapido" className="mb-2 block font-semibold text-cuadre-900">
          {t.editorCosto}
        </label>
        <InputPlata id="costo-rapido" valor={costo} onCambiar={setCosto} placeholder="0" autoFocus />
        {costo > 0 &&
          producto.precio > 0 &&
          (costo < producto.precio ? (
            <p className="mt-1.5 text-sm font-semibold text-cuadra">
              {t.editorGanancia(formatPesos(ganancia), formatPct(pct))}
            </p>
          ) : (
            <p className="mt-1.5 text-sm font-semibold text-falta">{t.editorCostoAlto}</p>
          ))}
      </div>
      <button type="button" onClick={guardar} className="btn-primario">
        {t.editorGuardar}
      </button>
    </div>
  );
}
