import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Producto } from '../../db/types';
import { listarCategorias } from '../../db/categorias';
import {
  agregarProducto,
  borrarProducto,
  editarProducto,
  listarProductos,
} from '../../db/productos';
import { Header } from '../../components/Header';
import { Pantalla } from '../../components/Pantalla';
import { Sheet } from '../../components/Sheet';
import { IconoChevron, IconoMas } from '../../components/Iconos';
import { formatPesos } from '../../lib/format';
import { estadoStock } from '../../lib/stock';
import { ImportarProductos } from './importar/ImportarProductos';
import { CargarCatalogo } from './CargarCatalogo';
import { ProductoForm } from './ProductoForm';
import { productosCopy as t } from './productos.copy';

interface DatosProducto {
  nombre: string;
  precio: number;
  costo?: number;
  emoji?: string;
  categoriaUuid?: string;
  stock?: number;
  stockMin?: number;
  codigoBarras?: string;
}

export function Productos() {
  const [vista, setVista] = useState<'lista' | 'hub' | 'importar' | 'catalogo'>('lista');

  if (vista === 'hub') {
    return (
      <AgregarHub
        onCatalogo={() => setVista('catalogo')}
        onImportar={() => setVista('importar')}
        onAtras={() => setVista('lista')}
      />
    );
  }
  if (vista === 'importar') {
    return <ImportarProductos onAtras={() => setVista('lista')} />;
  }
  if (vista === 'catalogo') {
    return <CargarCatalogo onAtras={() => setVista('lista')} />;
  }
  return <ListaProductos onAgregar={() => setVista('hub')} />;
}

function ListaProductos({ onAgregar }: { onAgregar: () => void }) {
  const productos = useLiveQuery(() => listarProductos(), [], []);
  const categorias = useLiveQuery(() => listarCategorias(), [], []);
  const [sheetAbierto, setSheetAbierto] = useState(false);
  const [editando, setEditando] = useState<Producto | undefined>(undefined);

  const nombreCategoria = new Map(categorias.map((c) => [c.uuid, c.nombre]));

  const grupos: { uuid: string | null; nombre: string; emoji?: string; items: Producto[] }[] =
    categorias
      .map((c) => ({
        uuid: c.uuid,
        nombre: c.nombre,
        emoji: c.emoji,
        items: productos.filter((p) => p.categoriaUuid === c.uuid),
      }))
      .filter((g) => g.items.length > 0);
  const sinCategoria = productos.filter(
    (p) => !p.categoriaUuid || !nombreCategoria.has(p.categoriaUuid),
  );
  if (sinCategoria.length > 0) {
    grupos.push({ uuid: null, nombre: t.sinCategoria, emoji: undefined, items: sinCategoria });
  }

  function abrirEdicion(p: Producto) {
    setEditando(p);
    setSheetAbierto(true);
  }

  async function guardar(datos: DatosProducto) {
    if (editando?.id != null) {
      await editarProducto(editando.id, datos);
    } else {
      await agregarProducto(datos);
    }
    setSheetAbierto(false);
  }

  async function borrar() {
    if (editando?.id == null) return;
    if (!window.confirm(t.borrarConfirm(editando.nombre))) return;
    await borrarProducto(editando.id);
    setSheetAbierto(false);
  }

  return (
    <>
      <Header
        titulo={t.headerTitulo}
        subtitulo={productos.length > 0 ? `${productos.length} cargados` : undefined}
        accion={
          <button
            type="button"
            onClick={onAgregar}
            aria-label={t.agregarProductos}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 transition active:bg-white/25"
          >
            <IconoMas width={24} height={24} />
          </button>
        }
      />

      <Pantalla>
        <button type="button" onClick={onAgregar} className="btn-primario mb-3">
          <IconoMas width={22} height={22} /> {t.agregarProductos}
        </button>

        {productos.length === 0 ? (
          <div className="mt-12 flex flex-col items-center text-center">
            <span className="text-5xl" aria-hidden>
              📦
            </span>
            <h2 className="mt-4 text-xl font-bold text-cuadre-900">{t.vacioTitulo}</h2>
            <p className="mt-1 text-cuadre-900/60">{t.vacioSub}</p>
            <button type="button" onClick={onAgregar} className="btn-primario mt-6 w-auto px-8">
              {t.agregarProductos}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {grupos.map((g) => (
              <section key={g.uuid ?? '__sin__'}>
                <h3 className="mb-2 flex items-center gap-1.5 px-1 text-sm font-bold uppercase tracking-wide text-cuadre-900/45">
                  <span aria-hidden>{g.emoji ?? '🛒'}</span>
                  <span>{g.nombre}</span>
                  <span className="font-semibold text-cuadre-900/30">· {g.items.length}</span>
                </h3>
                <ul className="flex flex-col gap-2">
                  {g.items.map((p) => (
                    <ProductoFila key={p.id} p={p} onClick={() => abrirEdicion(p)} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </Pantalla>

      <Sheet
        abierto={sheetAbierto}
        onCerrar={() => setSheetAbierto(false)}
        titulo={editando ? t.editarTitulo : t.nuevoTitulo}
      >
        <ProductoForm
          key={editando?.id ?? 'nuevo'}
          inicial={editando}
          onGuardar={guardar}
          onBorrar={editando ? borrar : undefined}
        />
      </Sheet>
    </>
  );
}

function ProductoFila({ p, onClick }: { p: Producto; onClick: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="card flex w-full items-center gap-3 p-3 text-left transition active:scale-[0.99]"
      >
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cuadre-50 text-2xl"
          aria-hidden
        >
          {p.emoji || '🛒'}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-cuadre-900">{p.nombre}</span>
          {p.costo != null && (
            <span className="num block text-sm text-cuadre-900/45">costo {formatPesos(p.costo)}</span>
          )}
        </span>
        <StockBadge p={p} />
        <span className="num font-bold text-cuadre-900">{formatPesos(p.precio)}</span>
        <IconoChevron width={20} height={20} className="shrink-0 text-cuadre-900/25" />
      </button>
    </li>
  );
}

function StockBadge({ p }: { p: Producto }) {
  if (p.stock == null) return null;
  const estado = estadoStock(p);
  const cls =
    estado === 'sin'
      ? 'bg-falta/10 text-falta'
      : estado === 'bajo'
        ? 'bg-sobra/15 text-sobra'
        : 'bg-cuadre-50 text-cuadre-900/55';
  return (
    <span className={`num shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${cls}`}>
      {estado === 'sin' ? t.sinStockBadge : t.stockBadge(p.stock)}
    </span>
  );
}

function AgregarHub({
  onCatalogo,
  onImportar,
  onAtras,
}: {
  onCatalogo: () => void;
  onImportar: () => void;
  onAtras: () => void;
}) {
  const [manualAbierto, setManualAbierto] = useState(false);

  async function guardarManual(datos: DatosProducto) {
    await agregarProducto(datos);
    setManualAbierto(false);
    onAtras();
  }

  return (
    <>
      <Header titulo={t.hubTitulo} onAtras={onAtras} />
      <Pantalla>
        <div className="flex flex-col gap-3">
          <HubCard
            emoji="⚡"
            titulo={t.hubCatalogoTit}
            sub={t.hubCatalogoSub}
            onClick={onCatalogo}
          />
          <HubCard
            emoji="📥"
            titulo={t.hubExcelTit}
            sub={t.hubExcelSub}
            badge={t.hubExcelBadge}
            onClick={onImportar}
          />
          <HubCard
            emoji="✏️"
            titulo={t.hubManualTit}
            sub={t.hubManualSub}
            onClick={() => setManualAbierto(true)}
          />
        </div>
      </Pantalla>

      <Sheet abierto={manualAbierto} onCerrar={() => setManualAbierto(false)} titulo={t.nuevoTitulo}>
        <ProductoForm onGuardar={guardarManual} />
      </Sheet>
    </>
  );
}

function HubCard({
  emoji,
  titulo,
  sub,
  badge,
  onClick,
}: {
  emoji: string;
  titulo: string;
  sub: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="card flex items-center gap-4 p-4 text-left transition active:scale-[0.99]"
    >
      <span
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cuadre-50 text-3xl"
        aria-hidden
      >
        {emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="font-bold text-cuadre-900">{titulo}</span>
          {badge && (
            <span className="rounded-full bg-cuadre px-2 py-0.5 text-[11px] font-bold text-white">
              {badge}
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-sm text-cuadre-900/55">{sub}</span>
      </span>
      <IconoChevron width={20} height={20} className="shrink-0 text-cuadre-900/25" />
    </button>
  );
}
