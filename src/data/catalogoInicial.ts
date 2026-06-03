// Catálogo rápido de kiosco argentino para el onboarding.
// Los precios son una referencia editable: el kiosquero los ajusta a los suyos.

export interface ItemCatalogo {
  nombre: string;
  precio: number;
  emoji: string;
}

export const catalogoInicial: ItemCatalogo[] = [
  { nombre: 'Gaseosa', precio: 1500, emoji: '🥤' },
  { nombre: 'Agua', precio: 1000, emoji: '💧' },
  { nombre: 'Cigarrillos', precio: 3000, emoji: '🚬' },
  { nombre: 'Alfajor', precio: 1200, emoji: '🍫' },
  { nombre: 'Chicle', precio: 600, emoji: '🍬' },
  { nombre: 'Caramelo', precio: 200, emoji: '🍭' },
  { nombre: 'Galletitas', precio: 1300, emoji: '🍪' },
  { nombre: 'Golosina', precio: 900, emoji: '🍩' },
];

/** Emojis sugeridos para elegir al crear un producto propio. */
export const emojisSugeridos = [
  '🥤', '💧', '🚬', '🍫', '🍬', '🍭', '🍪', '🍩',
  '☕', '🧉', '🍺', '🧃', '🍦', '🍟', '🥐', '🍞',
  '🧀', '🥪', '🌭', '🍕', '🔋', '📱', '🧴', '🧻',
  '✏️', '📰', '🎟️', '💊', '🛒', '🪙',
];
