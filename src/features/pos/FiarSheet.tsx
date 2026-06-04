import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { agregarCliente, listarClientes } from '../../db/clientes';
import { listarCuentas } from '../../db/fiados';
import { Sheet } from '../../components/Sheet';
import { formatPesos } from '../../lib/format';
import { resumenFiados } from '../../lib/fiados';
import { posCopy as t } from './pos.copy';

interface Props {
  abierto: boolean;
  total: number;
  onCerrar: () => void;
  onFiar: (clienteUuid: string) => void;
}

export function FiarSheet({ abierto, total, onCerrar, onFiar }: Props) {
  const clientes = useLiveQuery(() => listarClientes(), [], []);
  const cuentas = useLiveQuery(() => listarCuentas(), [], []);
  const [busqueda, setBusqueda] = useState('');

  const resumen = useMemo(() => resumenFiados(clientes, cuentas), [clientes, cuentas]);
  const filtro = busqueda.trim().toLowerCase();
  const visibles = filtro
    ? resumen.lista.filter((c) => c.cliente.nombre.toLowerCase().includes(filtro))
    : resumen.lista;
  const hayExacto = resumen.lista.some(
    (c) => c.cliente.nombre.toLowerCase() === filtro,
  );

  async function crearYFiar() {
    const nombre = busqueda.trim();
    if (!nombre) return;
    const cliente = await agregarCliente(nombre);
    setBusqueda('');
    onFiar(cliente.uuid);
  }

  function elegir(uuid: string) {
    setBusqueda('');
    onFiar(uuid);
  }

  return (
    <Sheet abierto={abierto} onCerrar={onCerrar} titulo={t.fiarTitulo}>
      <p className="-mt-1 mb-3 text-sm text-cuadre-900/55">{t.fiarSub(formatPesos(total))}</p>

      <input
        type="text"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder={t.fiarBuscar}
        autoComplete="off"
        className="mb-3 w-full rounded-2xl border-2 border-cuadre/15 px-4 py-3 font-semibold text-cuadre-900 outline-none focus:border-cuadre"
      />

      {filtro && !hayExacto && (
        <button type="button" onClick={crearYFiar} className="btn-primario mb-3">
          + {t.fiarCrear(busqueda.trim())}
        </button>
      )}

      {clientes.length === 0 && !filtro ? (
        <p className="py-6 text-center text-sm text-cuadre-900/50">{t.fiarSinClientes}</p>
      ) : (
        <ul className="flex max-h-[42vh] flex-col gap-1 overflow-y-auto">
          {visibles.map(({ cliente, saldo }) => (
            <li key={cliente.uuid}>
              <button
                type="button"
                onClick={() => elegir(cliente.uuid)}
                className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition active:bg-cuadre-50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cuadre-50 text-lg font-bold text-cuadre">
                  {cliente.nombre.charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-cuadre-900">{cliente.nombre}</span>
                  <span className={`text-sm ${saldo > 0 ? 'text-sobra' : 'text-cuadre-900/40'}`}>
                    {saldo > 0 ? t.fiarDebe(formatPesos(saldo)) : t.fiarAlDia}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}
