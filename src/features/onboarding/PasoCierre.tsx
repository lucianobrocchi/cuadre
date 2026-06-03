import { useState } from 'react';
import type { EstadoCierre } from '../../db/types';
import { estadoDeCierre } from '../../lib/cierre';
import { formatPesos } from '../../lib/format';
import { InputPlata } from '../../components/InputPlata';
import { ResultadoCierre } from '../../components/ResultadoCierre';
import { OnboardingLayout } from './OnboardingLayout';
import { onboardingCopy } from './onboarding.copy';

interface Props {
  vendido: number;
  onTerminar: () => void;
  onAtras: () => void;
}

export function PasoCierre({ vendido, onTerminar, onAtras }: Props) {
  const c = onboardingCopy.cierre;
  const [contado, setContado] = useState(0);
  const [estado, setEstado] = useState<EstadoCierre | null>(null);
  const [diferencia, setDiferencia] = useState(0);

  function confirmar() {
    // Cierre simplificado: solo lo vendido vs lo contado. Sin fondo ni egresos.
    const dif = contado - vendido;
    setDiferencia(dif);
    setEstado(estadoDeCierre(dif));
  }

  // ---- Resultado ----
  if (estado) {
    const monto = Math.abs(diferencia);
    const copy =
      estado === 'cuadra'
        ? c.resultadoCuadra
        : estado === 'falta'
          ? c.resultadoFalta(monto)
          : c.resultadoSobra(monto);

    return (
      <OnboardingLayout
        paso={4}
        footer={
          <button type="button" className="btn-primario" onClick={onTerminar}>
            {c.button}
          </button>
        }
      >
        <ResultadoCierre estado={estado} titulo={copy.titulo} detalle={copy.detalle} />
        <div className="mt-7 text-center">
          <h2 className="text-2xl font-extrabold text-cuadre-900">{c.cierreFinalTitle}</h2>
          <p className="mt-2 text-cuadre-900/60">{c.cierreFinalSubtitle}</p>
        </div>
      </OnboardingLayout>
    );
  }

  // ---- Conteo ----
  return (
    <OnboardingLayout
      paso={4}
      onAtras={onAtras}
      footer={
        <button
          type="button"
          className="btn-primario"
          disabled={contado <= 0}
          onClick={confirmar}
        >
          {c.confirmarButton}
        </button>
      }
    >
      <h1 className="text-2xl font-extrabold leading-tight text-cuadre-900">{c.title}</h1>
      <p className="mt-2 leading-relaxed text-cuadre-900/60">{c.subtitle}</p>

      <div className="mt-6 rounded-3xl bg-cuadre px-6 py-6 text-white shadow-card">
        <p className="font-medium text-white/70">{c.vendidoLabel}</p>
        <p className="num mt-1 text-5xl font-extrabold leading-none">{formatPesos(vendido)}</p>
      </div>

      <div className="mt-6">
        <label htmlFor="onb-contado" className="block text-lg font-bold text-cuadre-900">
          {c.inputLabel}
        </label>
        <div className="mt-3">
          <InputPlata
            id="onb-contado"
            valor={contado}
            onCambiar={setContado}
            placeholder={c.inputPlaceholder}
            autoFocus
          />
        </div>
      </div>
    </OnboardingLayout>
  );
}
