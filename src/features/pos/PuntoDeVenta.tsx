import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { MedioPago, Producto } from '../../db/types';
import { editarPrecio, listarProductos } from '../../db/productos';
import { listarCategorias } from '../../db/categorias';
import { registrarVenta } from '../../db/ventas';
import { registrarCargo } from '../../db/fiados';
import { Header } from '../../components/Header';
import { Pantalla } from '../../components/Pantalla';
import { Sheet } from '../../components/Sheet';
import { InputPlata } from '../../components/InputPlata';
import { IconoAjustes, IconoBuscar, IconoCheck } from '../../components/Iconos';
import { normalizar } from '../../lib/format';
import { precioSegunLista, type ListaPrecio } from '../../lib/listaPrecio';
import { AbrirCajaSheet } from '../caja/AbrirCaja';
import { BarraEstadoCaja } from '../caja/BarraEstadoCaja';
import { SinCaja } from '../caja/SinCaja';
import { useCajaActiva } from '../caja/useCajaActiva';
import { CategoriaChips } from './CategoriaChips';
import { ProductoGrid } from './ProductoGrid';
import { PanelCobro } from './PanelCobro';
import { FiarSheet } from './FiarSheet';
import { useTicket } from './useTicket';
import { posCopy } from './pos.copy';

interface Props {
  nombreKiosco: string;
  fondoInicial: number;
  onIrAProductos: () => void;
  onIrACaja: () => void;
  onAbrirAjustes: () => void;
}

/** Coincide por nombre (sin acentos) o por código de barras. */
function coincideBusqueda(p: Producto, q: string): boolean {
  const norm = normalizar(q.trim());
  if (!norm) return true;
  if (normalizar(p.nombre).includes(norm)) return true;
  return p.codigoBarras != null && p.codigoBarras.includes(q.trim());
}

export function PuntoDeVenta({
  nombreKiosco,
  fondoInicial,
  onIrAProductos,
  onIrACaja,
  onAbrirAjustes,
}: Props) {
  const caja = useCajaActiva();
  const productos = useLiveQuery(() => listarProductos(), [], []);
  const categorias = useLiveQuery(() => listarCategorias(), [], []);
  const ticket = useTicket();
  const [expandido, setExpandido] = useState(false);
  const [cobrado, setCobrado] = useState(false);
  const [medio, setMedio] = useState<MedioPago>('efectivo');
  const [fiarAbierto, setFiarAbierto] = useState(false);
  const [sheetAbrir, setSheetAbrir] = useState(false);
  const [catActiva, setCatActiva] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [lista, setLista] = useState<ListaPrecio>('minorista');
  const [editando, setEditando] = useState<Producto | null>(null);
  const [nuevoPrecio, setNuevoPrecio] = useState(0);

  const precioDe = (p: Producto) => precioSegunLista(p, lista);
  const agregarConLista = (p: Producto) => ticket.agregar(p, precioDe(p));

  /** Cambia la lista de precios y recalcula los renglones ya cargados. */
  function cambiarLista(nueva: ListaPrecio) {
    setLista(nueva);
    const porId = new Map(productos.map((p) => [p.id, p]));
    ticket.aplicarPrecios((id) => {
      const p = porId.get(id);
      return p ? precioSegunLista(p, nueva) : 0;
    });
  }

  const enTicket = new Map(ticket.items.map((it) => [it.productoId, it.cantidad]));
  const hayItems = ticket.items.length > 0;
  const buscando = busqueda.trim().length > 0;
  const productosFiltrados = buscando
    ? productos.filter((p) => coincideBusqueda(p, busqueda))
    : catActiva === null
      ? productos
      : productos.filter((p) => p.categoriaUuid === catActiva);

  /** Enter en el buscador = lector de barras: agrega el match exacto o el único resultado. */
  function buscarEnter() {
    const q = busqueda.trim();
    if (!q) return;
    const exacto = productos.find((p) => p.codigoBarras && p.codigoBarras === q);
    const match = exacto ?? (productosFiltrados.length === 1 ? productosFiltrados[0] : null);
    if (match) {
      agregarConLista(match);
      setBusqueda('');
    }
  }

  function abrirEditarPrecio(p: Producto) {
    setEditando(p);
    setNuevoPrecio(p.precio);
  }

  async function guardarPrecio() {
    if (editando?.id != null) await editarPrecio(editando.id, nuevoPrecio);
    setEditando(null);
  }

  async function cobrar() {
    if (!hayItems || !caja) return;
    await registrarVenta(ticket.itemsParaCobrar(), medio, caja.uuid);
    finalizarVenta();
  }

  async function fiar(clienteUuid: string) {
    if (!hayItems || !caja) return;
    const ventaId = await registrarVenta(ticket.itemsParaCobrar(), 'fiado', caja.uuid);
    await registrarCargo({ clienteUuid, monto: ticket.total, ventaId });
    setFiarAbierto(false);
    finalizarVenta();
  }

  function finalizarVenta() {
    ticket.limpiar();
    setExpandido(false);
    setMedio('efectivo');
    setCobrado(true);
    window.setTimeout(() => setCobrado(false), 1300);
  }

  // Atajo de teclado: F8 cobra (útil con teclado/lector en mostrador).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'F8') {
        e.preventDefault();
        cobrar();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hayItems, caja, medio, ticket.total]);

  const header = (
    <Header
      titulo={nombreKiosco || 'Vender'}
      subtitulo={posCopy.headerSubtitulo}
      accion={
        <button
          type="button"
          onClick={onAbrirAjustes}
          aria-label={posCopy.ajustes}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 transition active:bg-white/25"
        >
          <IconoAjustes width={22} height={22} />
        </button>
      }
    />
  );

  // Cargando estado de caja.
  if (caja === undefined) {
    return (
      <>
        {header}
        <Pantalla />
      </>
    );
  }

  // Sin caja abierta: no se puede vender.
  if (caja === null) {
    return (
      <>
        {header}
        <Pantalla>
          <SinCaja onAbrir={() => setSheetAbrir(true)} />
        </Pantalla>
        <AbrirCajaSheet
          abierto={sheetAbrir}
          onCerrar={() => setSheetAbrir(false)}
          fondoSugerido={fondoInicial}
        />
      </>
    );
  }

  // Caja abierta: POS operativo.
  return (
    <>
      {header}

      {/* En escritorio, el panel de cobro vive a la derecha; reservamos su ancho. */}
      <div className="mx-auto max-w-md px-4 pt-4 pad-nav lg:mx-0 lg:max-w-none lg:px-6 lg:pt-6 lg:pb-10 lg:pr-[404px]">
        <BarraEstadoCaja caja={caja} onClick={onIrACaja} />

        {productos.length === 0 ? (
          <div className="mt-12 flex flex-col items-center text-center">
            <span className="text-5xl" aria-hidden>
              🛒
            </span>
            <h2 className="mt-4 text-xl font-bold text-cuadre-900">{posCopy.sinProductosTitulo}</h2>
            <p className="mt-1 text-cuadre-900/60">{posCopy.sinProductosSub}</p>
            <button type="button" onClick={onIrAProductos} className="btn-primario mt-6 w-auto px-8">
              Cargar productos
            </button>
          </div>
        ) : (
          <>
            {/* Lista de precios (aparece cuando hay precios mayoristas cargados) */}
            {productos.some((p) => p.precioMayor != null) && (
              <div className="mb-3 flex rounded-2xl bg-cuadre-50 p-1 lg:max-w-sm">
                {(['minorista', 'mayorista'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => cambiarLista(l)}
                    className={`flex-1 rounded-xl py-1.5 text-sm font-bold transition ${
                      lista === l ? 'bg-white text-cuadre shadow-card' : 'text-cuadre-900/50'
                    }`}
                  >
                    {l === 'minorista' ? posCopy.listaMinorista : posCopy.listaMayorista}
                  </button>
                ))}
              </div>
            )}

            {/* Buscador + lector de barras */}
            <div className="relative mb-3">
              <IconoBuscar
                width={20}
                height={20}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-cuadre-900/35"
              />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && buscarEnter()}
                placeholder={posCopy.buscarPlaceholder}
                autoComplete="off"
                className="w-full rounded-2xl border-2 border-cuadre/12 bg-white py-3 pl-11 pr-10 font-semibold text-cuadre-900 outline-none focus:border-cuadre"
              />
              {buscando && (
                <button
                  type="button"
                  onClick={() => setBusqueda('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-cuadre-900/40 active:bg-cuadre-50"
                >
                  ✕
                </button>
              )}
            </div>

            {!buscando && (
              <CategoriaChips categorias={categorias} activa={catActiva} onCambiar={setCatActiva} />
            )}
            <div className={hayItems ? 'pb-44 lg:pb-0' : ''}>
              {productosFiltrados.length === 0 ? (
                <p className="mt-10 text-center text-cuadre-900/45">
                  {buscando ? posCopy.sinResultados : posCopy.sinProductosCategoria}
                </p>
              ) : (
                <ProductoGrid
                  productos={productosFiltrados}
                  onAgregar={agregarConLista}
                  enTicket={enTicket}
                  onEditarPrecio={abrirEditarPrecio}
                  precioDe={precioDe}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* Panel de cobro — escritorio: fijo a la derecha. */}
      <aside className="fixed bottom-0 right-0 top-14 z-20 hidden w-[380px] flex-col border-l border-cuadre/10 bg-white lg:flex">
        <PanelCobro
          ticket={ticket}
          medio={medio}
          onMedio={setMedio}
          onCobrar={cobrar}
          onFiar={() => setFiarAbierto(true)}
          variante="desktop"
        />
      </aside>

      {/* Panel de cobro — mobile: flotante sobre la barra inferior. */}
      {hayItems && (
        <div
          className="fixed inset-x-0 z-30 lg:hidden"
          style={{ bottom: 'calc(var(--nav-h) + env(safe-area-inset-bottom))' }}
        >
          <div className="mx-auto max-w-md px-3">
            <PanelCobro
              ticket={ticket}
              medio={medio}
              onMedio={setMedio}
              onCobrar={cobrar}
              onFiar={() => setFiarAbierto(true)}
              variante="mobile"
              expandido={expandido}
              onToggleExpandir={() => setExpandido((v) => !v)}
            />
          </div>
        </div>
      )}

      {/* Fiar: elegir / crear cliente. */}
      <FiarSheet
        abierto={fiarAbierto}
        total={ticket.total}
        onCerrar={() => setFiarAbierto(false)}
        onFiar={fiar}
      />

      {/* Feedback al cobrar. */}
      {cobrado && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
          <div className="animate-pop flex items-center gap-2 rounded-2xl bg-cuadre px-5 py-3 text-white shadow-sheet">
            <IconoCheck width={22} height={22} strokeWidth={2.5} />
            <span className="font-semibold">{posCopy.ventaGuardada}</span>
          </div>
        </div>
      )}

      {/* Editar precio en el momento (al mantener presionada una card). */}
      <Sheet
        abierto={editando !== null}
        onCerrar={() => setEditando(null)}
        titulo={posCopy.editarPrecioTitulo}
      >
        {editando && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-lg font-bold text-cuadre-900">
                {editando.emoji ? `${editando.emoji} ` : ''}
                {editando.nombre}
              </p>
              <p className="mt-1 text-sm text-cuadre-900/55">{posCopy.editarPrecioHint}</p>
            </div>
            <InputPlata valor={nuevoPrecio} onCambiar={setNuevoPrecio} placeholder="0" autoFocus />
            <button
              type="button"
              onClick={guardarPrecio}
              disabled={nuevoPrecio <= 0}
              className="btn-primario"
            >
              {posCopy.guardarPrecio}
            </button>
          </div>
        )}
      </Sheet>
    </>
  );
}
