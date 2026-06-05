// Helpers de fecha para acotar consultas "del día".

/** Timestamp del comienzo del día (00:00:00.000) para una fecha dada. */
export function inicioDelDia(ts: number = Date.now()): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Timestamp del final del día (23:59:59.999) para una fecha dada. */
export function finDelDia(ts: number = Date.now()): number {
  const d = new Date(ts);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

const MS_DIA = 24 * 60 * 60 * 1000;

export { MS_DIA };

/** Rango [desde, hasta] que cubre los últimos `dias` días, incluyendo hoy. */
export function rangoUltimosDias(dias: number): [number, number] {
  return [inicioDelDia(Date.now() - (dias - 1) * MS_DIA), finDelDia()];
}

const FMT_FECHA = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const FMT_HORA = new Intl.DateTimeFormat('es-AR', {
  hour: '2-digit',
  minute: '2-digit',
});

const FMT_FECHA_LARGA = new Intl.DateTimeFormat('es-AR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

/** "02/06/2026" */
export function formatFecha(ts: number): string {
  return FMT_FECHA.format(ts);
}

/** "14:35" */
export function formatHora(ts: number): string {
  return FMT_HORA.format(ts);
}

/** "martes 2 de junio" (con mayúscula inicial) */
export function formatFechaLarga(ts: number = Date.now()): string {
  const txt = FMT_FECHA_LARGA.format(ts);
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}

/** "Hoy", "Ayer" o, si es más viejo, "Martes 2 de junio". */
export function formatDiaRelativo(ts: number): string {
  const hoy = inicioDelDia();
  const dia = inicioDelDia(ts);
  if (dia === hoy) return 'Hoy';
  if (dia === hoy - MS_DIA) return 'Ayer';
  return formatFechaLarga(ts);
}
