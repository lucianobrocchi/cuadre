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
}

export function Productos() {
  const [vista, setVista] = useState<'lista' | 'importar' | 'catalogo'>('lista');

  if (vista === 'importar') {
    return <ImportarProductos onAtras={() => setVista('lista')} />;
  }
  if (vista === 'catalogo') {
    return <CargarCatalogo onAtras={() => setVista('lista')} />;
  }
  return (
    <ListaProductos
      onImportar={() => setVista('importar')}
      onCargarCatalogo={() => setVista('catalogo')}
    />
  );
}

function ListaProductos({
  onImportar,
  onCargarCatalogo,
}: {
  onImportar: () => void;
  onCargarCatalogo: () => void;
}) {
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

  function abrirNuevo() {
    setEditando(undefined);
    setSheetAbierto(true);
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
            onClick={abrirNuevo}
            aria-label={t.agregar}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 transition active:bg-white/25"
          >
            <IconoMas width={24} height={24} />
          </button>
        }
      />

      <Pantalla>
        <div className="mb-3 flex flex-col gap-2">
          <button type="button" onClick={onCargarCatalogo} className="btn-primario">
            ⚡ Cargar del catálogo
          </button>
          <button type="button" onClick={onImportar} className="btn-secundario">
            📥 Importar de Excel o foto
          </button>
        </div>

        {productos.length === 0 ? (
          <div className="mt-12 flex flex-col items-center text-center">
            <span className="text-5xl" aria-hidden>
              📦
            </span>
            <h2 className="mt-4 text-xl font-bold text-cuadre-900">{t.vacioTitulo}</h2>
            <p className="mt-1 text-cuadre-900/60">{t.vacioSub}</p>
            <button type="button" onClick={abrirNuevo} className="btn-primario mt-6 w-auto px-8">
              {t.agregar}
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
        <span className="num font-bold text-cuadre-900">{formatPesos(p.precio)}</span>
        <IconoChevron width={20} height={20} className="shrink-0 text-cuadre-900/25" />
      </button>
    </li>
  );
}
