import { useState } from 'react';
import { abrirCaja } from '../../db/cajas';
import { Sheet } from '../../components/Sheet';
import { InputPlata } from '../../components/InputPlata';
import { cajaCopy as t } from './caja.copy';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  /** Fondo por defecto (config), precargado pero editable. */
  fondoSugerido: number;
  onAbierta?: () => void;
}

export function AbrirCajaSheet({ abierto, onCerrar, fondoSugerido, onAbierta }: Props) {
  const [monto, setMonto] = useState<number | null>(null);
  const montoVal = monto ?? fondoSugerido;

  async function abrir() {
    await abrirCaja(montoVal);
    setMonto(null);
    onAbierta?.();
    onCerrar();
  }

  return (
    <Sheet abierto={abierto} onCerrar={onCerrar} titulo={t.abrirTitulo}>
      <div className="flex flex-col gap-5">
        <div>
          <label htmlFor="abrir-monto" className="block text-lg font-bold text-cuadre-900">
            {t.abrirMontoLabel}
          </label>
          <p className="mb-3 text-sm text-cuadre-900/55">{t.abrirMontoHint}</p>
          <InputPlata
            id="abrir-monto"
            valor={montoVal}
            onCambiar={setMonto}
            placeholder="0"
            autoFocus
          />
        </div>
        <button type="button" onClick={abrir} className="btn-primario">
          {t.abrirBoton}
        </button>
      </div>
    </Sheet>
  );
}
