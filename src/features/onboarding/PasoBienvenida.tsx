import { OnboardingLayout } from './OnboardingLayout';
import { onboardingCopy } from './onboarding.copy';

interface Props {
  nombre: string;
  onNombre: (v: string) => void;
  onContinuar: () => void;
}

export function PasoBienvenida({ nombre, onNombre, onContinuar }: Props) {
  const c = onboardingCopy.welcome;
  const valido = nombre.trim().length > 0;

  return (
    <OnboardingLayout
      paso={1}
      footer={
        <button type="button" className="btn-primario" disabled={!valido} onClick={onContinuar}>
          {c.button}
        </button>
      }
    >
      <div className="pt-2">
        <span className="text-5xl" aria-hidden>
          👋
        </span>
        <h1 className="mt-5 text-3xl font-extrabold leading-tight text-cuadre-900">{c.title}</h1>
        <p className="mt-3 text-lg leading-relaxed text-cuadre-900/60">{c.subtitle}</p>

        <div className="mt-8">
          <label htmlFor="kiosco" className="mb-2 block font-semibold text-cuadre-900">
            {c.inputLabel}
          </label>
          <input
            id="kiosco"
            type="text"
            value={nombre}
            onChange={(e) => onNombre(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && valido && onContinuar()}
            placeholder={c.inputPlaceholder}
            autoComplete="off"
            autoFocus
            className="input-grande text-xl"
          />
        </div>
      </div>
    </OnboardingLayout>
  );
}
