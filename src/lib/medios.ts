import type { MedioPago } from '../db/types';

// Medios de pago disponibles. "transferencia" cubre transferencia/QR/billetera.
export const medios: { id: MedioPago; label: string; emoji: string }[] = [
  { id: 'efectivo', label: 'Efectivo', emoji: '💵' },
  { id: 'transferencia', label: 'Transferencia', emoji: '📱' },
];

export function etiquetaMedio(id: MedioPago): { label: string; emoji: string } {
  return medios.find((m) => m.id === id) ?? medios[0];
}
