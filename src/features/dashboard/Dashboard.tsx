import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Producto } from '../../db/types';
import { editarProducto, listarProductos } from '../../db/productos';
import { listarCategorias } from '../../db/categorias';
import { ventasEntre } from '../../db/ventas';
import { Header } from '../../components/Header';
import { Pantalla } from '../../components/Pantalla';
import { Sheet } from '../../components/Sheet';
import { InputPlata } from '../../components/InputPlata';
import { IconoChevron } from '../../components/Iconos';
import { finDelDia, inicioDelDia, rangoUltimosDias } from '../../lib/fecha';
import { formatPesos } from '../../lib/format';
import {
  formatPct,
  gananciaPeriodo,
  resumenCatalogo,
  type CategoriaCatalogo,
  type ProductoConMargen,
  type ResumenPeriodo,
} from '../../lib/rentabilidad';
import { dashboardCopy as t } from './dashboard.copy';

type Periodo = 'hoy' | 'semana';

export function Dashboard() {
  const [periodo, setPeriodo] = useState<Periodo>('hoy');
  const [editando, setEditando] = useState<Producto | null>(null);

  const productos = useLiveQuery(() => listarProductos(), [], []);
  const categorias = useLiveQuery(() => listarCategorias(), [], []);

  const [desde, hasta] = useMemo<[number, number]>(
    () => (periodo === 'hoy' ? [inicioDelDia(), finDelDia()] : rangoUltimosDias(7)),
    [periodo],
  );
  const ventas = useLiveQuery(() => ventasEntre(desde, hasta), [desde, hasta], []);

  const catalogo = useMemo(
    () => resumenCatalogo(productos, categorias),
    [productos, categorias],
  );
  const real = useMemo(
    () => gananciaPeriodo(ventas, productos, categorias),
    [ventas, productos, categorias],
  );

  const ranking = real.categorias.filter((c) => c.margenPct !== null);

  return (
    <>
      <Header titulo={t.headerTitulo} subtitulo={t.headerSubtitulo} />
      <Pantalla>
        {/* Período */}
        <div className="mb-3 flex gap-2">
          <ChipPeriodo activo={periodo === 'hoy'} onClick={() => setPeriodo('hoy')}>
            {t.periodoHoy}
          </ChipPeriodo>
          <ChipPeriodo activo={periodo === 'semana'} onClick={() => setPeriodo('semana')}>
            {t.periodoSemana}
          </ChipPeriodo>
        </div>

        {/* Lo que ganaste de verdad */}
        <HeroGanancia real={real} semana={periodo === 'semana'} />

        {/* De dónde salió */}
        {ranking.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-cuadre-900/45">
              {t.deDondeSalio}
            </h2>
            <ul className="flex flex-col gap-2">
              {ranking.slice(0, 5).map((c) => (
                <li key={c.uuid ?? '__sin__'} className="card flex items-center gap-3 p-3">
                  <Emoji>{c.emoji}</Emoji>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-cuadre-900">{c.nombre}</span>
                    {c.margenPct !== null && (
                      <span className="text-sm text-cuadre-900/45">
                        {t.margen(formatPct(c.margenPct))}
                      </span>
                    )}
                  </span>
                  <span className="num shrink-0 font-extrabold text-cuadra">
                    {formatPesos(c.ganancia)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Margen del catálogo */}
        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-cuadre-900/45">
            {t.catalogoTitulo}
          </h2>
          <p className="mb-2 text-sm text-cuadre-900/55">{t.catalogoSub}</p>

          {productos.length === 0 ? (
            <div className="card mt-2 flex flex-col items-center p-8 text-center">
              <span className="text-4xl" aria-hidden>
                📦
              </span>
              <h3 className="mt-3 font-bold text-cuadre-900">{t.sinProductosTitulo}</h3>
              <p className="mt-1 text-sm text-cuadre-900/55">{t.sinProductosSub}</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {catalogo.categorias.map((c) => (
                <FilaCategoria key={c.uuid ?? '__sin__'} cat={c} onEditar={setEditando} />
              ))}
            </ul>
          )}
        </section>
      </Pantalla>

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

function ChipPeriodo({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-full py-2 text-sm font-bold transition ${
        activo ? 'bg-cuadre text-white shadow-card' : 'bg-white text-cuadre-900/55 active:bg-cuadre-50'
      }`}
    >
      {children}
    </button>
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

function HeroGanancia({ real, semana }: { real: ResumenPeriodo; semana: boolean }) {
  // Sin ventas en el período.
  if (real.vendido === 0) {
    return (
      <div className="card p-6 text-center">
        <p className="text-3xl" aria-hidden>
          🧮
        </p>
        <p className="mt-2 font-semibold text-cuadre-900">{t.sinVentas(semana)}</p>
        <p className="mt-0.5 text-sm text-cuadre-900/55">{t.sinVentasSub}</p>
      </div>
    );
  }
  // Vendió, pero no hay ningún costo cargado: no se puede calcular la ganancia.
  if (real.margenPct === null) {
    return (
      <div className="card p-5">
        <p className="text-sm font-semibold text-cuadre-900/55">{t.vendiste}</p>
        <p className="num text-3xl font-extrabold text-cuadre-900">{formatPesos(real.vendido)}</p>
        <div className="mt-4 rounded-xl bg-sobra/10 p-3">
          <p className="font-semibold text-cuadre-900">{t.faltanCostosTitulo}</p>
          <p className="mt-0.5 text-sm text-cuadre-900/60">{t.faltanCostosSub}</p>
        </div>
      </div>
    );
  }
  // Normal: ganancia del período.
  const positivo = real.ganancia >= 0;
  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold text-cuadre-900/55">{t.gananciaLabel}</p>
        <p className="text-sm font-semibold text-cuadre-900/45">
          {t.margen(formatPct(real.margenPct))}
        </p>
      </div>
      <p
        className={`num mt-0.5 text-4xl font-extrabold ${positivo ? 'text-cuadra' : 'text-falta'}`}
      >
        {formatPesos(real.ganancia)}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <MiniDato label={t.vendiste} valor={formatPesos(real.vendido)} />
        <MiniDato label={t.costo} valor={formatPesos(real.costo)} />
      </div>
      {real.unidadesSinCosto > 0 && (
        <p className="mt-3 text-xs text-cuadre-900/45">{t.unidadesSinCosto(real.unidadesSinCosto)}</p>
      )}
    </div>
  );
}

function MiniDato({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="rounded-xl bg-cuadre-50/60 px-3 py-2">
      <p className="text-xs font-medium text-cuadre-900/50">{label}</p>
      <p className="num font-bold text-cuadre-900">{valor}</p>
    </div>
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
              className={`num block font-bold ${
                margen.ganancia >= 0 ? 'text-cuadra' : 'text-falta'
              }`}
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
