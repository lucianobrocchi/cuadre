import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { resumenDeCaja } from '../../db/cajas';
import type { CajaSesion } from '../../db/types';
import { formatFechaLarga, formatHora } from '../../lib/fecha';
import { formatPesos } from '../../lib/format';
import { Header } from '../../components/Header';
import { Pantalla } from '../../components/Pantalla';
import { IconoChevron } from '../../components/Iconos';
import { Resumen } from '../resumen/Resumen';
import { AbrirCajaSheet } from './AbrirCaja';
import { CerrarCaja } from './CerrarCaja';
import { Movimientos } from './Movimientos';
import { useCajaActiva } from './useCajaActiva';
import { cajaCopy as t } from './caja.copy';

type Vista = 'inicio' | 'cerrar' | 'movimientos' | 'resumen';

export function Caja({ fondoInicial }: { fondoInicial: number }) {
  const caja = useCajaActiva();
  const [vista, setVista] = useState<Vista>('inicio');
  const [cajaCerrando, setCajaCerrando] = useState<CajaSesion | null>(null);

  const volver = () => {
    setVista('inicio');
    setCajaCerrando(null);
  };

  if (vista === 'cerrar' && cajaCerrando) {
    return <CerrarCaja caja={cajaCerrando} onAtras={volver} onCerrada={volver} />;
  }
  if (vista === 'movimientos' && caja) {
    return <Movimientos caja={caja} onAtras={volver} />;
  }
  if (vista === 'resumen') {
    return <Resumen onAtras={volver} />;
  }

  return (
    <CajaInicio
      caja={caja}
      fondoInicial={fondoInicial}
      onCerrar={() => {
        if (caja) {
          setCajaCerrando(caja);
          setVista('cerrar');
        }
      }}
      onMovimientos={() => setVista('movimientos')}
      onResumen={() => setVista('resumen')}
    />
  );
}

interface InicioProps {
  caja: CajaSesion | null | undefined;
  fondoInicial: number;
  onCerrar: () => void;
  onMovimientos: () => void;
  onResumen: () => void;
}

function CajaInicio({ caja, fondoInicial, onCerrar, onMovimientos, onResumen }: InicioProps) {
  const [sheetAbrir, setSheetAbrir] = useState(false);

  return (
    <>
      <Header titulo="Caja" subtitulo={formatFechaLarga()} />
      <Pantalla>
        {caja ? (
          <>
            <EstadoCaja caja={caja} />

            <button
              type="button"
              onClick={onCerrar}
              className="mt-3 flex w-full items-center gap-4 rounded-3xl bg-cuadre p-5 text-left text-white shadow-card transition active:scale-[0.99]"
            >
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl"
                aria-hidden
              >
                🧮
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xl font-bold">{t.cerrarTitulo}</span>
                <span className="block text-sm text-white/70">{t.cerrarSub}</span>
              </span>
              <IconoChevron width={24} height={24} className="shrink-0 text-white/60" />
            </button>

            <div className="mt-3 flex flex-col gap-3">
              <CardAccion
                emoji="💸"
                titulo={t.movimientosTitulo}
                detalle={t.movimientosSub}
                onClick={onMovimientos}
              />
              <CardAccion
                emoji="📊"
                titulo={t.resumenTitulo}
                detalle={t.resumenSub}
                onClick={onResumen}
              />
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setSheetAbrir(true)}
              className="flex w-full items-center gap-4 rounded-3xl bg-cuadre p-5 text-left text-white shadow-card transition active:scale-[0.99]"
            >
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl"
                aria-hidden
              >
                🔓
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xl font-bold">{t.hubAbrirTitulo}</span>
                <span className="block text-sm text-white/70">{t.hubAbrirSub}</span>
              </span>
              <IconoChevron width={24} height={24} className="shrink-0 text-white/60" />
            </button>

            <div className="mt-3">
              <CardAccion
                emoji="📊"
                titulo={t.resumenTitulo}
                detalle={t.resumenSub}
                onClick={onResumen}
              />
            </div>
          </>
        )}
      </Pantalla>

      <AbrirCajaSheet
        abierto={sheetAbrir}
        onCerrar={() => setSheetAbrir(false)}
        fondoSugerido={fondoInicial}
      />
    </>
  );
}

function EstadoCaja({ caja }: { caja: CajaSesion }) {
  const resumen = useLiveQuery(() => resumenDeCaja(caja), [caja.uuid]);
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cuadra/60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cuadra" />
        </span>
        <span className="font-bold text-cuadra">{t.cajaAbierta}</span>
        <span className="num text-sm text-cuadre-900/45">
          · {t.desde(formatHora(caja.abiertaEn))}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-sm text-cuadre-900/55">{t.inicialLabel}</p>
          <p className="num text-xl font-extrabold text-cuadre-900">
            {formatPesos(caja.montoInicial)}
          </p>
        </div>
        <div>
          <p className="text-sm text-cuadre-900/55">{t.enCaja}</p>
          <p className="num text-xl font-extrabold text-cuadre-900">
            {formatPesos(resumen?.esperado ?? caja.montoInicial)}
          </p>
        </div>
      </div>
    </div>
  );
}

function CardAccion({
  emoji,
  titulo,
  detalle,
  onClick,
}: {
  emoji: string;
  titulo: string;
  detalle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="card flex w-full items-center gap-4 p-4 text-left transition active:scale-[0.99]"
    >
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cuadre-50 text-2xl"
        aria-hidden
      >
        {emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-cuadre-900">{titulo}</span>
        <span className="block text-sm text-cuadre-900/55">{detalle}</span>
      </span>
      <IconoChevron width={20} height={20} className="shrink-0 text-cuadre-900/25" />
    </button>
  );
}
