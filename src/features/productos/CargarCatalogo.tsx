import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { asegurarCategorias } from '../../db/categorias';
import { agregarProductos, listarProductos } from '../../db/productos';
import { catalogoPrecargado } from '../../data/catalogoPrecargado';
import { Header } from '../../components/Header';
import { Pantalla } from '../../components/Pantalla';
import { IconoCheck } from '../../components/Iconos';
import { formatNumero, formatPesos, parsePesos } from '../../lib/format';
import { cargarCopy as t } from './cargar.copy';

interface Elegido {
  nombre: string;
  precio: number;
  costo?: number;
  categoria: string;
  emoji: string;
}

interface ItemCat {
  nombre: string;
  precio: number;
  emoji: string;
  categoria: string;
}

const DIACRITICOS = /[̀-ͯ]/g;
const norm = (s: string) => s.normalize('NFD').replace(DIACRITICOS, '').toLowerCase().trim();

export function CargarCatalogo({ onAtras }: { onAtras: () => void }) {
  const existentesLista = useLiveQuery(() => listarProductos(), [], []);
  const existentes = new Set(existentesLista.map((p) => p.nombre.trim().toLowerCase()));

  const [catIdx, setCatIdx] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [seleccion, setSeleccion] = useState<Map<string, Elegido>>(new Map());
  const [guardado, setGuardado] = useState<number | null>(null);

  const categoria = catalogoPrecargado[catIdx];

  // Índice plano de todo el catálogo, para el buscador.
  const todos = useMemo<ItemCat[]>(
    () =>
      catalogoPrecargado.flatMap((c) =>
        c.productos.map((p) => ({
          nombre: p.nombre,
          precio: p.precio,
          emoji: p.emoji,
          categoria: c.nombre,
        })),
      ),
    [],
  );

  const buscando = busqueda.trim().length > 0;
  const resultados = useMemo<ItemCat[]>(() => {
    if (!buscando) return [];
    const q = norm(busqueda);
    return todos.filter((i) => norm(i.nombre).includes(q)).slice(0, 60);
  }, [busqueda, buscando, todos]);

  function toggle(item: { nombre: string; precio: number; emoji: string }, catNombre: string) {
    const key = item.nombre.toLowerCase();
    setSeleccion((prev) => {
      const m = new Map(prev);
      if (m.has(key)) m.delete(key);
      else
        m.set(key, {
          nombre: item.nombre,
          precio: item.precio,
          costo: undefined,
          categoria: catNombre,
          emoji: item.emoji,
        });
      return m;
    });
  }

  function setCampo(nombre: string, campo: 'precio' | 'costo', valor: number) {
    const key = nombre.toLowerCase();
    setSeleccion((prev) => {
      const actual = prev.get(key);
      if (!actual) return prev;
      const m = new Map(prev);
      m.set(key, {
        ...actual,
        [campo]: campo === 'costo' ? (valor > 0 ? valor : undefined) : valor,
      });
      return m;
    });
  }

  // Productos de la categoría actual que todavía no están cargados.
  const dispCat = categoria.productos.filter((i) => !existentes.has(i.nombre.toLowerCase()));
  const todaSeleccionada =
    dispCat.length > 0 && dispCat.every((i) => seleccion.has(i.nombre.toLowerCase()));

  function toggleCategoria() {
    setSeleccion((prev) => {
      const m = new Map(prev);
      for (const i of dispCat) {
        const key = i.nombre.toLowerCase();
        if (todaSeleccionada) m.delete(key);
        else
          m.set(key, {
            nombre: i.nombre,
            precio: i.precio,
            costo: undefined,
            categoria: categoria.nombre,
            emoji: i.emoji,
          });
      }
      return m;
    });
  }

  async function agregar() {
    const items = [...seleccion.values()];
    if (items.length === 0) return;
    const mapaCat = await asegurarCategorias(items.map((i) => i.categoria));
    await agregarProductos(
      items.map((i) => ({
        nombre: i.nombre,
        precio: i.precio,
        costo: i.costo,
        emoji: i.emoji,
        categoriaUuid: mapaCat.get(i.categoria.toLowerCase()),
      })),
    );
    setGuardado(items.length);
    setSeleccion(new Map());
  }

  // ---- Pantalla de éxito ----
  if (guardado !== null) {
    return (
      <>
        <Header titulo={t.headerTitulo} />
        <Pantalla>
          <div className="mt-16 flex flex-col items-center text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-cuadra text-white">
              <IconoCheck width={44} height={44} strokeWidth={2.5} />
            </span>
            <h2 className="mt-5 text-2xl font-extrabold text-cuadre-900">{t.listoTitulo}</h2>
            <p className="mt-1 text-cuadre-900/60">{t.listoSub(guardado)}</p>
            <button
              type="button"
              onClick={() => setGuardado(null)}
              className="btn-primario mt-7 w-auto px-8"
            >
              {t.seguir}
            </button>
            <button type="button" onClick={onAtras} className="mt-3 font-semibold text-cuadre">
              {t.volver}
            </button>
          </div>
        </Pantalla>
      </>
    );
  }

  const total = seleccion.size;
  const lista: ItemCat[] = buscando
    ? resultados
    : categoria.productos.map((p) => ({ ...p, categoria: categoria.nombre }));

  return (
    <>
      <Header titulo={t.headerTitulo} subtitulo={t.headerSub} onAtras={onAtras} />

      <Pantalla>
        {/* Buscador */}
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder={t.buscarPh}
          autoComplete="off"
          className="mb-3 w-full rounded-xl border-2 border-cuadre/15 px-4 py-2.5 font-semibold text-cuadre-900 outline-none focus:border-cuadre"
        />

        {!buscando && (
          <>
            {/* Chips de categorías del catálogo */}
            <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {catalogoPrecargado.map((c, i) => {
                const activo = i === catIdx;
                const elegidosCat = [...seleccion.values()].filter(
                  (e) => e.categoria === c.nombre,
                ).length;
                return (
                  <button
                    key={c.nombre}
                    type="button"
                    onClick={() => setCatIdx(i)}
                    className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                      activo
                        ? 'bg-cuadre text-white shadow-card'
                        : 'bg-white text-cuadre-900/70 active:bg-cuadre-50'
                    }`}
                  >
                    {c.emoji} {c.nombre}
                    {elegidosCat > 0 && (
                      <span className={activo ? 'text-white/80' : 'text-cuadre'}> ·{elegidosCat}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Agregar toda la categoría */}
            {dispCat.length > 0 && (
              <button
                type="button"
                onClick={toggleCategoria}
                className="mb-2 w-full rounded-xl border-2 border-dashed border-cuadre/25 py-2 text-sm font-semibold text-cuadre transition active:bg-cuadre-50"
              >
                {todaSeleccionada ? t.quitarCategoria : t.agregarCategoria(dispCat.length)}
              </button>
            )}
          </>
        )}

        {buscando && resultados.length === 0 && (
          <p className="mt-10 text-center text-cuadre-900/50">{t.sinResultados}</p>
        )}

        <ul className={`flex flex-col gap-2 ${total > 0 ? 'pb-24' : ''}`}>
          {lista.map((item) => {
            const key = item.nombre.toLowerCase();
            return (
              <ItemFila
                key={item.nombre}
                item={item}
                categoriaNombre={item.categoria}
                mostrarCategoria={buscando}
                yaExiste={existentes.has(key)}
                elegido={seleccion.get(key)}
                onToggle={() => toggle(item, item.categoria)}
                onPrecio={(n) => setCampo(item.nombre, 'precio', n)}
                onCosto={(n) => setCampo(item.nombre, 'costo', n)}
              />
            );
          })}
        </ul>
      </Pantalla>

      {/* Barra de acción fija */}
      <div
        className="fixed inset-x-0 z-30 border-t border-cuadre/10 bg-white/95 p-3 backdrop-blur"
        style={{ bottom: 'calc(var(--nav-h) + env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto max-w-md">
          <button type="button" onClick={agregar} disabled={total === 0} className="btn-primario">
            {total === 0 ? t.sinSeleccion : t.agregarBtn(total)}
          </button>
        </div>
      </div>
    </>
  );
}

function ItemFila({
  item,
  categoriaNombre,
  mostrarCategoria,
  yaExiste,
  elegido,
  onToggle,
  onPrecio,
  onCosto,
}: {
  item: { nombre: string; precio: number; emoji: string };
  categoriaNombre: string;
  mostrarCategoria: boolean;
  yaExiste: boolean;
  elegido?: Elegido;
  onToggle: () => void;
  onPrecio: (n: number) => void;
  onCosto: (n: number) => void;
}) {
  const sel = !!elegido;
  return (
    <li
      className={`card p-2.5 transition ${sel ? 'ring-2 ring-cuadre' : ''} ${
        yaExiste ? 'opacity-55' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={yaExiste}
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-3 py-1 text-left disabled:cursor-default"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cuadre-50 text-2xl">
            {item.emoji}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold text-cuadre-900">{item.nombre}</span>
            {yaExiste ? (
              <span className="text-sm font-semibold text-cuadra">{t.yaCargado}</span>
            ) : mostrarCategoria ? (
              <span className="block truncate text-sm text-cuadre-900/40">{categoriaNombre}</span>
            ) : (
              !sel && (
                <span className="num block text-sm text-cuadre-900/40">
                  {formatPesos(item.precio)}
                </span>
              )
            )}
          </span>
        </button>

        {!yaExiste && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={sel ? `Quitar ${item.nombre}` : `Agregar ${item.nombre}`}
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition ${
              sel ? 'bg-cuadre text-white' : 'border-2 border-cuadre/20 text-transparent'
            }`}
          >
            <IconoCheck width={16} height={16} strokeWidth={3} />
          </button>
        )}
      </div>

      {sel && elegido && (
        <div className="mt-2 flex flex-wrap items-end gap-2 pl-[3.25rem]">
          <MiniMoneda label={t.precio} valor={elegido.precio} onCambiar={onPrecio} />
          <MiniMoneda label={t.costo} valor={elegido.costo ?? 0} onCambiar={onCosto} />
          {elegido.costo != null &&
            elegido.costo > 0 &&
            elegido.precio > 0 &&
            elegido.costo < elegido.precio && (
              <span className="pb-2 text-sm font-semibold text-cuadra">
                {t.gananciaPct(Math.round(((elegido.precio - elegido.costo) / elegido.precio) * 100))}
              </span>
            )}
        </div>
      )}
    </li>
  );
}

function MiniMoneda({
  label,
  valor,
  onCambiar,
}: {
  label: string;
  valor: number;
  onCambiar: (n: number) => void;
}) {
  return (
    <label className="block w-24">
      <span className="mb-0.5 block text-[11px] font-medium text-cuadre-900/45">{label}</span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-cuadre-900/40">
          $
        </span>
        <input
          type="text"
          inputMode="numeric"
          aria-label={label}
          value={valor > 0 ? formatNumero(valor) : ''}
          onChange={(e) => onCambiar(parsePesos(e.target.value))}
          placeholder="0"
          className="num w-full rounded-xl border-2 border-cuadre/15 py-2 pl-5 pr-2 text-right font-semibold text-cuadre-900 outline-none focus:border-cuadre"
        />
      </span>
    </label>
  );
}
