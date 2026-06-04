import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Cliente, MedioPago } from '../../db/types';
import {
  agregarCliente,
  borrarCliente,
  editarCliente,
  listarClientes,
} from '../../db/clientes';
import { listarCuentas, movimientosDeCliente, registrarCargo, registrarPago } from '../../db/fiados';
import { Header } from '../../components/Header';
import { Pantalla } from '../../components/Pantalla';
import { Sheet } from '../../components/Sheet';
import { InputPlata } from '../../components/InputPlata';
import { IconoChevron, IconoMas } from '../../components/Iconos';
import { formatFecha } from '../../lib/fecha';
import { formatPesos } from '../../lib/format';
import { medios } from '../../lib/medios';
import { resumenFiados, saldoDeMovimientos, type ClienteConSaldo } from '../../lib/fiados';
import { fiadosCopy as t } from './fiados.copy';

export function Fiados({ onAtras }: { onAtras: () => void }) {
  const clientes = useLiveQuery(() => listarClientes(), [], []);
  const cuentas = useLiveQuery(() => listarCuentas(), [], []);
  const resumen = useMemo(() => resumenFiados(clientes, cuentas), [clientes, cuentas]);

  const [detalle, setDetalle] = useState<Cliente | null>(null);
  const [nuevo, setNuevo] = useState(false);

  return (
    <>
      <Header titulo={t.headerTitulo} subtitulo={t.headerSubtitulo} onAtras={onAtras} />
      <Pantalla>
        {/* En la calle */}
        <div className="rounded-3xl bg-cuadre px-6 py-6 text-white shadow-card">
          <p className="font-medium text-white/70">{t.enLaCalle}</p>
          <p className="num mt-1 text-5xl font-extrabold leading-none">
            {formatPesos(resumen.totalEnLaCalle)}
          </p>
          <p className="mt-2 text-sm text-white/70">
            {resumen.deudores > 0 ? t.enLaCalleSub(resumen.deudores) : t.todoCobrado}
          </p>
        </div>

        <button type="button" onClick={() => setNuevo(true)} className="btn-secundario mt-4">
          <IconoMas width={20} height={20} /> {t.nuevoCliente}
        </button>

        {clientes.length === 0 ? (
          <div className="mt-12 flex flex-col items-center text-center">
            <span className="text-5xl" aria-hidden>
              📓
            </span>
            <h2 className="mt-4 text-xl font-bold text-cuadre-900">{t.vacioTitulo}</h2>
            <p className="mt-1 text-cuadre-900/60">{t.vacioSub}</p>
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {resumen.lista.map((cs) => (
              <FilaCliente key={cs.cliente.uuid} cs={cs} onClick={() => setDetalle(cs.cliente)} />
            ))}
          </ul>
        )}
      </Pantalla>

      <Sheet abierto={detalle !== null} onCerrar={() => setDetalle(null)} titulo={detalle?.nombre ?? ''}>
        {detalle && <ClienteDetalle cliente={detalle} onCerrar={() => setDetalle(null)} />}
      </Sheet>

      <Sheet abierto={nuevo} onCerrar={() => setNuevo(false)} titulo={t.nuevoCliente}>
        <ClienteForm onListo={() => setNuevo(false)} />
      </Sheet>
    </>
  );
}

function FilaCliente({ cs, onClick }: { cs: ClienteConSaldo; onClick: () => void }) {
  const { cliente, saldo } = cs;
  const debe = saldo > 0;
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="card flex w-full items-center gap-3 p-3 text-left transition active:scale-[0.99]"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cuadre-50 text-lg font-bold text-cuadre">
          {cliente.nombre.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-cuadre-900">{cliente.nombre}</span>
          <span className={`text-sm ${debe ? 'text-sobra' : saldo < 0 ? 'text-cuadra' : 'text-cuadre-900/40'}`}>
            {debe ? t.debe : saldo < 0 ? t.aFavor : t.alDia}
          </span>
        </span>
        <span className={`num shrink-0 font-extrabold ${debe ? 'text-sobra' : 'text-cuadre-900/40'}`}>
          {debe ? formatPesos(saldo) : saldo < 0 ? formatPesos(-saldo) : formatPesos(0)}
        </span>
        <IconoChevron width={20} height={20} className="shrink-0 text-cuadre-900/25" />
      </button>
    </li>
  );
}

type Modo = 'ver' | 'pago' | 'cargo' | 'editar';

function ClienteDetalle({ cliente, onCerrar }: { cliente: Cliente; onCerrar: () => void }) {
  const movs = useLiveQuery(() => movimientosDeCliente(cliente.uuid), [cliente.uuid], []);
  const saldo = saldoDeMovimientos(movs);
  const [modo, setModo] = useState<Modo>('ver');

  if (modo === 'pago') {
    return <PagoForm cliente={cliente} saldo={saldo} onListo={() => setModo('ver')} />;
  }
  if (modo === 'cargo') {
    return <CargoForm cliente={cliente} onListo={() => setModo('ver')} />;
  }
  if (modo === 'editar') {
    return <ClienteForm cliente={cliente} onListo={() => setModo('ver')} onBorrado={onCerrar} />;
  }

  const debe = saldo > 0;
  return (
    <div>
      <div className={`rounded-2xl p-4 ${debe ? 'bg-sobra/10' : 'bg-cuadra/10'}`}>
        <p className="text-sm font-semibold text-cuadre-900/55">{t.saldoLabel}</p>
        <p className={`num text-3xl font-extrabold ${debe ? 'text-sobra' : 'text-cuadra'}`}>
          {debe ? formatPesos(saldo) : saldo < 0 ? `−${formatPesos(-saldo)}` : formatPesos(0)}
        </p>
        {cliente.telefono && <p className="mt-1 text-sm text-cuadre-900/50">📞 {cliente.telefono}</p>}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setModo('pago')} className="btn-primario">
          {t.cobrarBtn}
        </button>
        <button type="button" onClick={() => setModo('cargo')} className="btn-secundario">
          {t.fiarBtn}
        </button>
      </div>

      {/* Historial */}
      <ul className="mt-4 flex flex-col gap-1">
        {movs.length === 0 && (
          <li className="py-4 text-center text-sm text-cuadre-900/45">{t.sinMovimientos}</li>
        )}
        {movs.map((m) => {
          const esCargo = m.tipo === 'cargo';
          return (
            <li key={m.id} className="flex items-center justify-between gap-2 border-b border-cuadre/5 py-2">
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-cuadre-900">
                  {esCargo ? (m.ventaId ? t.movVenta : t.movCargo) : t.movPago}
                  {m.nota ? ` · ${m.nota}` : ''}
                </span>
                <span className="num block text-xs text-cuadre-900/45">{formatFecha(m.fecha)}</span>
              </span>
              <span className={`num shrink-0 font-bold ${esCargo ? 'text-sobra' : 'text-cuadra'}`}>
                {esCargo ? '+' : '−'}
                {formatPesos(m.monto)}
              </span>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={() => setModo('editar')}
        className="mt-3 w-full py-2 text-center text-sm font-semibold text-cuadre-900/55"
      >
        {t.editarBtn}
      </button>
    </div>
  );
}

function PagoForm({
  cliente,
  saldo,
  onListo,
}: {
  cliente: Cliente;
  saldo: number;
  onListo: () => void;
}) {
  const [monto, setMonto] = useState(saldo > 0 ? saldo : 0);
  const [medio, setMedio] = useState<MedioPago>('efectivo');

  async function guardar() {
    if (monto <= 0) return;
    await registrarPago({
      clienteUuid: cliente.uuid,
      monto,
      medioPago: medio,
      nombreCliente: cliente.nombre,
    });
    onListo();
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-bold text-cuadre-900">{t.pagoTitulo}</h3>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="pago-monto" className="font-semibold text-cuadre-900">
            {t.pagoMonto}
          </label>
          {saldo > 0 && (
            <button
              type="button"
              onClick={() => setMonto(saldo)}
              className="text-sm font-semibold text-cuadre"
            >
              {t.pagoTodo} ({formatPesos(saldo)})
            </button>
          )}
        </div>
        <InputPlata id="pago-monto" valor={monto} onCambiar={setMonto} placeholder="0" autoFocus />
      </div>

      <div>
        <span className="mb-2 block font-semibold text-cuadre-900">{t.pagoMedio}</span>
        <div className="grid grid-cols-2 gap-2">
          {medios.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMedio(m.id)}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition ${
                medio === m.id ? 'bg-cuadre text-white' : 'bg-cuadre-50 text-cuadre-900/70'
              }`}
            >
              <span aria-hidden>{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>
        {medio === 'efectivo' && (
          <p className="mt-1.5 text-xs text-cuadre-900/45">{t.pagoEfectivoNota}</p>
        )}
      </div>

      <button type="button" onClick={guardar} disabled={monto <= 0} className="btn-primario">
        {t.pagoGuardar}
      </button>
    </div>
  );
}

function CargoForm({ cliente, onListo }: { cliente: Cliente; onListo: () => void }) {
  const [monto, setMonto] = useState(0);
  const [nota, setNota] = useState('');

  async function guardar() {
    if (monto <= 0) return;
    await registrarCargo({ clienteUuid: cliente.uuid, monto, nota });
    onListo();
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-bold text-cuadre-900">{t.cargoTitulo}</h3>
      <div>
        <label htmlFor="cargo-monto" className="mb-2 block font-semibold text-cuadre-900">
          {t.cargoMonto}
        </label>
        <InputPlata id="cargo-monto" valor={monto} onCambiar={setMonto} placeholder="0" autoFocus />
      </div>
      <div>
        <label htmlFor="cargo-nota" className="mb-2 block font-semibold text-cuadre-900">
          {t.cargoNota}
        </label>
        <input
          id="cargo-nota"
          type="text"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder={t.cargoNotaPh}
          autoComplete="off"
          className="w-full rounded-2xl border-2 border-cuadre/15 px-4 py-3 text-cuadre-900 outline-none focus:border-cuadre"
        />
      </div>
      <button type="button" onClick={guardar} disabled={monto <= 0} className="btn-primario">
        {t.cargoGuardar}
      </button>
    </div>
  );
}

function ClienteForm({
  cliente,
  onListo,
  onBorrado,
}: {
  cliente?: Cliente;
  onListo: () => void;
  onBorrado?: () => void;
}) {
  const [nombre, setNombre] = useState(cliente?.nombre ?? '');
  const [telefono, setTelefono] = useState(cliente?.telefono ?? '');

  async function guardar() {
    if (!nombre.trim()) return;
    if (cliente?.id != null) {
      await editarCliente(cliente.id, { nombre: nombre.trim(), telefono: telefono.trim() || undefined });
    } else {
      await agregarCliente(nombre, telefono);
    }
    onListo();
  }

  async function borrar() {
    if (cliente?.id == null) return;
    if (!window.confirm(t.borrarConfirm(cliente.nombre))) return;
    await borrarCliente(cliente.uuid, cliente.id);
    onBorrado?.();
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor="cli-nombre" className="mb-2 block font-semibold text-cuadre-900">
          {t.nombreLabel}
        </label>
        <input
          id="cli-nombre"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder={t.nombrePh}
          autoComplete="off"
          autoFocus
          className="w-full rounded-2xl border-2 border-cuadre/15 px-4 py-3 text-xl font-semibold text-cuadre-900 outline-none focus:border-cuadre"
        />
      </div>
      <div>
        <label htmlFor="cli-tel" className="mb-2 block font-semibold text-cuadre-900">
          {t.telefonoLabel}
        </label>
        <input
          id="cli-tel"
          type="tel"
          inputMode="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder={t.telefonoPh}
          autoComplete="off"
          className="w-full rounded-2xl border-2 border-cuadre/15 px-4 py-3 text-cuadre-900 outline-none focus:border-cuadre"
        />
      </div>
      <button type="button" onClick={guardar} disabled={!nombre.trim()} className="btn-primario">
        {t.guardarCliente}
      </button>
      {cliente && onBorrado && (
        <button
          type="button"
          onClick={borrar}
          className="-mt-1 py-2 text-center font-semibold text-falta transition active:opacity-70"
        >
          {t.borrarBtn}
        </button>
      )}
    </div>
  );
}
