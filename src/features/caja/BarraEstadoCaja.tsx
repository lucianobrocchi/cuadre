import { useLiveQuery } from 'dexie-react-hooks';
import { resumenDeCaja } from '../../db/cajas';
import type { CajaSesion } from '../../db/types';
import { formatHora } from '../../lib/fecha';
import { formatPesos } from '../../lib/format';
import { cajaCopy as t } from './caja.copy';

interface Props {
  caja: CajaSesion;
  onClick?: () => void;
}

/** Chip de estado de la caja, siempre visible arriba del POS. */
export function BarraEstadoCaja({ caja, onClick }: Props) {
  const resumen = useLiveQuery(() => resumenDeCaja(caja), [caja.uuid]);
  const enCaja = resumen?.esperado ?? caja.montoInicial;

  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-3 flex w-full items-center justify-between rounded-2xl bg-cuadra/10 px-4 py-2.5 text-left"
    >
      <span className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cuadra/60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cuadra" />
        </span>
        <span className="text-sm font-bold text-cuadra">{t.cajaAbierta}</span>
        <span className="num hidden text-xs text-cuadre-900/45 min-[400px]:inline">
          · {t.desde(formatHora(caja.abiertaEn))}
        </span>
      </span>
      <span className="text-sm text-cuadre-900/60">
        {t.enCaja}:{' '}
        <span className="num font-bold text-cuadre-900">{formatPesos(enCaja)}</span>
      </span>
    </button>
  );
}
