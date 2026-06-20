import { useState } from 'react';
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
import { IconoAjustes, IconoBuscar, IconoCheck, IconoChevron } from '../../components/Iconos';
import { formatPesos, normalizar } from '../../lib/format';
import { medios } from '../../lib/medios';
import { AbrirCajaSheet } from '../caja/AbrirCaja';
import { BarraEstadoCaja } from '../caja/BarraEstadoCaja';
import { SinCaja } from '../caja/SinCaja';
import { useCajaActiva } from '../caja/useCajaActiva';
import { CategoriaChips } from './CategoriaChips';
import { ProductoGrid } from './ProductoGrid';
import { TicketLista } from './TicketLista';
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
  const [editando, setEditando] = useState<Producto | null>(null);
  const [nuevoPrecio, setNuevoPrecio] = useState(0);

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
      ticket.agregar(match);
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
    await registrarVenta(ticket.items, medio, caja.uuid);
    finalizarVenta();
  }

  async function fiar(clienteUuid: string) {
    if (!hayItems || !caja) return;
    const ventaId = await registrarVenta(ticket.items, 'fiado', caja.uuid);
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

      <Pantalla>
        <BarraEstadoCaja caja={caja} onClick={onIrACaja} />

        {productos.length === 0 ? (
          <div className="mt-12 flex flex-col items-center text-center">
            <span className="text-5xl" aria-hidden>
              🛒
            </span>
            <h2 className="mt-4 text-xl font-bold text-cuadre-900">
              {posCopy.sinProductosTitulo}
            </h2>
            <p className="mt-1 text-cuadre-900/60">{posCopy.sinProductosSub}</p>
            <button type="button" onClick={onIrAProductos} className="btn-primario mt-6 w-auto px-8">
              Cargar productos
            </button>
          </div>
        ) : (
          <>
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
            <div className={hayItems ? 'pb-44' : ''}>
              {productosFiltrados.length === 0 ? (
                <p className="mt-10 text-center text-cuadre-900/45">
                  {buscando ? posCopy.sinResultados : posCopy.sinProductosCategoria}
                </p>
              ) : (
                <ProductoGrid
                  productos={productosFiltrados}
                  onAgregar={ticket.agregar}
                  enTicket={enTicket}
                  onEditarPrecio={abrirEditarPrecio}
                />
              )}
            </div>
          </>
        )}
      </Pantalla>

      {/* Panel del ticket, fijo por encima de la barra inferior. */}
      {hayItems && (
        <div
          className="fixed inset-x-0 z-30"
          style={{ bottom: 'calc(var(--nav-h) + env(safe-area-inset-bottom))' }}
        >
          <div className="mx-auto max-w-md px-3">
            <div className="overflow-hidden rounded-3xl bg-white shadow-sheet ring-1 ring-cuadre/10">
              {expandido && (
                <div className="px-4 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-cuadre-900/55">Ticket</span>
                    <button
                      type="button"
                      onClick={ticket.limpiar}
                      className="text-sm font-semibold text-falta"
                    >
                      {posCopy.vaciar}
                    </button>
                  </div>
                  <div className="max-h-[32vh] overflow-y-auto">
                    <TicketLista items={ticket.items} onCambiarCantidad={ticket.cambiarCantidad} />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2.5 border-t border-cuadre/10 p-3">
                {/* Medio de pago */}
                <div className="grid grid-cols-2 gap-2">
                  {medios.map((m) => {
                    const activo = medio === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMedio(m.id)}
                        className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold transition ${
                          activo
                            ? 'bg-cuadre text-white'
                            : 'bg-cuadre-50 text-cuadre-900/70 active:bg-cuadre-100'
                        }`}
                      >
                        <span aria-hidden>{m.emoji}</span>
                        {m.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-stretch gap-3">
                  <button
                    type="button"
                    onClick={() => setExpandido((v) => !v)}
                    className="flex flex-1 items-center gap-2 rounded-2xl px-3 py-1 text-left transition active:bg-cuadre-50"
                  >
                    <IconoChevron
                      width={18}
                      height={18}
                      className={`shrink-0 text-cuadre-900/40 transition-transform ${
                        expandido ? 'rotate-90' : '-rotate-90'
                      }`}
                    />
                    <span>
                      <span className="block text-xs font-medium text-cuadre-900/55">
                        {posCopy.productosLabel(ticket.cantidadTotal)} · {posCopy.verTicket}
                      </span>
                      <span className="num block text-2xl font-extrabold leading-tight text-cuadre-900">
                        {formatPesos(ticket.total)}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={cobrar}
                    className="btn-primario w-auto px-7 text-xl"
                  >
                    {posCopy.cobrar}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setFiarAbierto(true)}
                  className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold text-cuadre-900/60 transition active:bg-cuadre-50"
                >
                  <span aria-hidden>📓</span> {posCopy.fiar}
                </button>
              </div>
            </div>
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
