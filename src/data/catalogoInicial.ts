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

/** Catálogo curado por categorías para el onboarding (corto, para no abrumar). */
export interface CategoriaOnboarding {
  categoria: string;
  emoji: string;
  items: ItemCatalogo[];
}

export const catalogoOnboarding: CategoriaOnboarding[] = [
  {
    categoria: 'Bebidas',
    emoji: '🥤',
    items: [
      { nombre: 'Coca-Cola 1.5L', precio: 2500, emoji: '🥤' },
      { nombre: 'Coca-Cola 500ml', precio: 1500, emoji: '🥤' },
      { nombre: 'Agua mineral 500ml', precio: 1000, emoji: '💧' },
      { nombre: 'Jugo Cepita 1L', precio: 1800, emoji: '🧃' },
      { nombre: 'Cerveza Quilmes 1L', precio: 2500, emoji: '🍺' },
    ],
  },
  {
    categoria: 'Cigarrillos',
    emoji: '🚬',
    items: [
      { nombre: 'Marlboro Box', precio: 3200, emoji: '🚬' },
      { nombre: 'Philip Morris', precio: 3000, emoji: '🚬' },
      { nombre: 'Lucky Strike', precio: 3000, emoji: '🚬' },
    ],
  },
  {
    categoria: 'Golosinas',
    emoji: '🍫',
    items: [
      { nombre: 'Alfajor', precio: 1200, emoji: '🍫' },
      { nombre: 'Bon o Bon', precio: 700, emoji: '🍬' },
      { nombre: 'Chicle', precio: 600, emoji: '🍬' },
      { nombre: 'Chupetín', precio: 400, emoji: '🍭' },
    ],
  },
  {
    categoria: 'Galletitas',
    emoji: '🍪',
    items: [
      { nombre: 'Galletitas Oreo', precio: 1500, emoji: '🍪' },
      { nombre: 'Criollitas', precio: 1100, emoji: '🍪' },
      { nombre: 'Rhodesia', precio: 1300, emoji: '🍫' },
    ],
  },
  {
    categoria: 'Almacén',
    emoji: '🛒',
    items: [
      { nombre: 'Yerba 1kg', precio: 3500, emoji: '🧉' },
      { nombre: 'Azúcar 1kg', precio: 1500, emoji: '🛒' },
      { nombre: 'Fideos', precio: 1200, emoji: '🍝' },
      { nombre: 'Aceite 900ml', precio: 2800, emoji: '🛒' },
    ],
  },
];

/** Emojis sugeridos para elegir al crear un producto propio. */
export const emojisSugeridos = [
  '🥤', '💧', '🚬', '🍫', '🍬', '🍭', '🍪', '🍩',
  '☕', '🧉', '🍺', '🧃', '🍦', '🍟', '🥐', '🍞',
  '🧀', '🥪', '🌭', '🍕', '🔋', '📱', '🧴', '🧻',
  '✏️', '📰', '🎟️', '💊', '🛒', '🪙',
];
