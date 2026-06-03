import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { cerrarCaja, resumenDeCaja } from '../../db/cajas';
import type { CajaSesion, EstadoCierre } from '../../db/types';
import { formatPesos } from '../../lib/format';
import { Header } from '../../components/Header';
import { Pantalla } from '../../components/Pantalla';
import { InputPlata } from '../../components/InputPlata';
import { ResultadoCierre } from '../../components/ResultadoCierre';
import { cajaCopy as t } from './caja.copy';

interface Props {
  caja: CajaSesion;
  onAtras: () => void;
  onCerrada: () => void;
}

interface Resultado {
  estado: EstadoCierre;
  esperado: number;
  diferencia: number;
  contado: number;
}

export function CerrarCaja({ caja, onAtras, onCerrada }: Props) {
  const resumen = useLiveQuery(() => resumenDeCaja(caja), [caja.uuid]);
  const [contado, setContado] = useState(0);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  async function confirmar() {
    const cerrada = await cerrarCaja(caja, contado);
    setResultado({
      estado: cerrada.estadoCuadre ?? 'cuadra',
      esperado: cerrada.esperadoEfectivo ?? 0,
      diferencia: cerrada.diferencia ?? 0,
      contado,
    });
  }

  // ---- Resultado ----
  if (resultado) {
    const monto = formatPesos(Math.abs(resultado.diferencia));
    const copy =
      resultado.estado === 'cuadra'
        ? t.resultado.cuadra
        : resultado.estado === 'falta'
          ? t.resultado.falta(monto)
          : t.resultado.sobra(monto);

    return (
      <>
        <Header titulo={t.cerrarTitulo} />
        <Pantalla>
          <ResultadoCierre estado={resultado.estado} titulo={copy.titulo} detalle={copy.detalle}>
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-cuadre-900/60">{t.detalleEsperado}</span>
                <span className="num font-bold text-cuadre-900">
                  {formatPesos(resultado.esperado)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-cuadre/10 px-4 py-3">
                <span className="text-cuadre-900/60">{t.detalleContado}</span>
                <span className="num font-bold text-cuadre-900">
                  {formatPesos(resultado.contado)}
                </span>
              </div>
            </div>
            <button type="button" onClick={onCerrada} className="btn-primario mt-4">
              {t.listo}
            </button>
          </ResultadoCierre>
        </Pantalla>
      </>
    );
  }

  // ---- Conteo ----
  const esperado = resumen?.esperado ?? caja.montoInicial;
  const transferencia = resumen?.ventasTransferencia ?? 0;

  return (
    <>
      <Header titulo={t.cerrarTitulo} subtitulo={t.cerrarHeaderSub} onAtras={onAtras} />
      <Pantalla>
        <div className="card p-5">
          <h2 className="text-lg font-bold text-cuadre-900">{t.resumenSesionTitulo}</h2>

          <dl className="mt-3 divide-y divide-cuadre/10">
            <Fila label={t.inicialLabel} valor={formatPesos(caja.montoInicial)} />
            <Fila
              label={t.ventasEfectivoLabel}
              valor={`+${formatPesos(resumen?.ventasEfectivo ?? 0)}`}
            />
            <Fila label={t.ingresosLabel} valor={`+${formatPesos(resumen?.ingresos ?? 0)}`} />
            <Fila label={t.egresosLabel} valor={`−${formatPesos(resumen?.egresos ?? 0)}`} />
          </dl>

          <div className="mt-3 flex items-center justify-between rounded-2xl bg-cuadre px-4 py-4 text-white">
            <div>
              <p className="font-semibold">{t.esperadoLabel}</p>
              <p className="text-xs text-white/60">{t.esperadoHint}</p>
            </div>
            <p className="num text-2xl font-extrabold">{formatPesos(esperado)}</p>
          </div>
        </div>

        {transferencia > 0 && (
          <p className="mt-3 rounded-2xl bg-cuadre-50 px-4 py-3 text-sm text-cuadre-900/70">
            {t.transferenciaNota(formatPesos(transferencia))}
          </p>
        )}

        <div className="mt-4">
          <label htmlFor="cerrar-contado" className="block text-lg font-bold text-cuadre-900">
            {t.contadoLabel}
          </label>
          <p className="mb-3 text-sm text-cuadre-900/55">{t.contadoHint}</p>
          <InputPlata
            id="cerrar-contado"
            valor={contado}
            onCambiar={setContado}
            placeholder={t.contadoPlaceholder}
          />
        </div>

        <button
          type="button"
          onClick={confirmar}
          disabled={contado <= 0}
          className="btn-primario mt-4"
        >
          {t.verSiCuadra}
        </button>
      </Pantalla>
    </>
  );
}

function Fila({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <dt className="text-cuadre-900/65">{label}</dt>
      <dd className="num font-bold text-cuadre-900">{valor}</dd>
    </div>
  );
}
