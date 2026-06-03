import { formatNumero, parsePesos } from '../lib/format';

interface Props {
  valor: number;
  onCambiar: (n: number) => void;
  placeholder?: string;
  autoFocus?: boolean;
  id?: string;
}

/**
 * Input de plata: muestra "$" fijo, teclado numérico y separa miles solo.
 * Controlado por un número entero de pesos (0 = vacío).
 */
export function InputPlata({ valor, onCambiar, placeholder, autoFocus, id }: Props) {
  const display = valor > 0 ? formatNumero(valor) : '';

  return (
    <div className="relative flex items-center">
      <span className="pointer-events-none absolute left-4 text-2xl font-semibold text-cuadre-900/40">
        $
      </span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        autoFocus={autoFocus}
        value={display}
        onChange={(e) => onCambiar(parsePesos(e.target.value))}
        placeholder={placeholder}
        className="input-grande num pl-9"
      />
    </div>
  );
}
