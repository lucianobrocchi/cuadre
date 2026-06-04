import type { MedioPago } from '../db/types';

interface MedioInfo {
  id: MedioPago;
  label: string;
  emoji: string;
}

// Medios que se eligen con el toggle del POS. "transferencia" cubre
// transferencia/QR/billetera. El fiado tiene su propio flujo (elegir cliente).
export const medios: MedioInfo[] = [
  { id: 'efectivo', label: 'Efectivo', emoji: '💵' },
  { id: 'transferencia', label: 'Transferencia', emoji: '📱' },
];

const TODOS: Record<MedioPago, MedioInfo> = {
  efectivo: { id: 'efectivo', label: 'Efectivo', emoji: '💵' },
  transferencia: { id: 'transferencia', label: 'Transferencia', emoji: '📱' },
  fiado: { id: 'fiado', label: 'Fiado', emoji: '📓' },
};

export function etiquetaMedio(id: MedioPago): { label: string; emoji: string } {
  return TODOS[id] ?? TODOS.efectivo;
}
