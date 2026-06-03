import { IconoCaja } from '../../components/Iconos';
import { cajaCopy as t } from './caja.copy';

export function SinCaja({ onAbrir }: { onAbrir: () => void }) {
  return (
    <div className="mt-12 flex flex-col items-center px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cuadre-50 text-cuadre">
        <IconoCaja width={40} height={40} />
      </div>
      <h2 className="mt-5 text-2xl font-extrabold text-cuadre-900">{t.sinCajaTitulo}</h2>
      <p className="mt-2 max-w-xs text-cuadre-900/60">{t.sinCajaSub}</p>
      <button type="button" onClick={onAbrir} className="btn-primario mt-7 w-auto px-10">
        {t.abrirCta}
      </button>
    </div>
  );
}
