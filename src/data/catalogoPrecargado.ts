// Catálogo precargado de kiosco/almacén argentino, dividido por categorías.
// Sirve para cargar el catálogo en segundos: el comerciante elige de la lista
// y ajusta precios. Los precios son de referencia (editables).

export interface ItemCatalogo {
  nombre: string;
  precio: number;
  emoji: string;
}

export interface CategoriaCatalogo {
  nombre: string;
  emoji: string;
  productos: ItemCatalogo[];
}

export const catalogoPrecargado: CategoriaCatalogo[] = [
  {
    nombre: 'Bebidas',
    emoji: '🥤',
    productos: [
      { nombre: 'Coca-Cola 1.5L', precio: 2500, emoji: '🥤' },
      { nombre: 'Coca-Cola 500ml', precio: 1500, emoji: '🥤' },
      { nombre: 'Sprite 1.5L', precio: 2300, emoji: '🥤' },
      { nombre: 'Fanta 1.5L', precio: 2300, emoji: '🥤' },
      { nombre: 'Agua mineral 500ml', precio: 1000, emoji: '💧' },
      { nombre: 'Agua saborizada 1.5L', precio: 1800, emoji: '💧' },
      { nombre: 'Manaos 2.25L', precio: 1500, emoji: '🥤' },
      { nombre: 'Cerveza Quilmes 1L', precio: 2500, emoji: '🍺' },
      { nombre: 'Speed energizante', precio: 2200, emoji: '🧃' },
      { nombre: 'Jugo Cepita 1L', precio: 1800, emoji: '🧃' },
    ],
  },
  {
    nombre: 'Cigarrillos',
    emoji: '🚬',
    productos: [
      { nombre: 'Marlboro Box', precio: 3500, emoji: '🚬' },
      { nombre: 'Marlboro Red', precio: 3500, emoji: '🚬' },
      { nombre: 'Philip Morris', precio: 3200, emoji: '🚬' },
      { nombre: 'Camel', precio: 3300, emoji: '🚬' },
      { nombre: 'Lucky Strike', precio: 3300, emoji: '🚬' },
      { nombre: 'Chesterfield', precio: 3100, emoji: '🚬' },
    ],
  },
  {
    nombre: 'Golosinas',
    emoji: '🍫',
    productos: [
      { nombre: 'Alfajor Jorgito', precio: 1200, emoji: '🍫' },
      { nombre: 'Alfajor Guaymallén', precio: 900, emoji: '🍫' },
      { nombre: 'Alfajor Block', precio: 1400, emoji: '🍫' },
      { nombre: 'Rhodesia', precio: 1300, emoji: '🍫' },
      { nombre: 'Bon o Bon', precio: 700, emoji: '🍬' },
      { nombre: 'Tita', precio: 1100, emoji: '🍫' },
      { nombre: 'Chocolate Milka', precio: 2800, emoji: '🍫' },
      { nombre: 'Rocklets', precio: 1600, emoji: '🍬' },
      { nombre: 'Chupetín', precio: 400, emoji: '🍭' },
      { nombre: 'Caramelo Sugus', precio: 250, emoji: '🍬' },
      { nombre: 'Chicle Beldent', precio: 600, emoji: '🍬' },
    ],
  },
  {
    nombre: 'Galletitas',
    emoji: '🍪',
    productos: [
      { nombre: 'Oreo', precio: 1600, emoji: '🍪' },
      { nombre: 'Criollitas', precio: 1100, emoji: '🍪' },
      { nombre: 'Pepitos', precio: 1700, emoji: '🍪' },
      { nombre: 'Sonrisas', precio: 1400, emoji: '🍪' },
      { nombre: 'Don Satur', precio: 1300, emoji: '🍪' },
      { nombre: 'Express', precio: 1300, emoji: '🍪' },
      { nombre: 'Chocolinas', precio: 1700, emoji: '🍪' },
      { nombre: 'Surtido Bagley', precio: 2000, emoji: '🍪' },
    ],
  },
  {
    nombre: 'Snacks',
    emoji: '🥨',
    productos: [
      { nombre: 'Papas Lays', precio: 2800, emoji: '🥔' },
      { nombre: 'Papas Pehuamar', precio: 2300, emoji: '🥔' },
      { nombre: 'Doritos', precio: 2900, emoji: '🌮' },
      { nombre: 'Palitos salados', precio: 1500, emoji: '🥨' },
      { nombre: 'Maní salado', precio: 1300, emoji: '🥜' },
      { nombre: 'Chizitos', precio: 2000, emoji: '🧀' },
    ],
  },
  {
    nombre: 'Almacén',
    emoji: '🧉',
    productos: [
      { nombre: 'Yerba Playadito 1kg', precio: 4800, emoji: '🧉' },
      { nombre: 'Yerba Rosamonte 1kg', precio: 5200, emoji: '🧉' },
      { nombre: 'Azúcar Ledesma 1kg', precio: 1600, emoji: '🧂' },
      { nombre: 'Fideos Matarazzo', precio: 1800, emoji: '🍝' },
      { nombre: 'Arroz Gallo 1kg', precio: 2000, emoji: '🍚' },
      { nombre: 'Aceite Natura 900ml', precio: 3800, emoji: '🫒' },
      { nombre: 'Sal Celusal', precio: 900, emoji: '🧂' },
      { nombre: 'Harina 0000 1kg', precio: 1300, emoji: '🌾' },
      { nombre: 'Puré de tomate', precio: 1200, emoji: '🥫' },
    ],
  },
  {
    nombre: 'Lácteos',
    emoji: '🥛',
    productos: [
      { nombre: 'Leche La Serenísima 1L', precio: 1600, emoji: '🥛' },
      { nombre: 'Yogur bebible', precio: 1900, emoji: '🥤' },
      { nombre: 'Manteca 200g', precio: 2200, emoji: '🧈' },
      { nombre: 'Dulce de leche 400g', precio: 2600, emoji: '🍯' },
      { nombre: 'Queso cremoso (kg)', precio: 9000, emoji: '🧀' },
    ],
  },
  {
    nombre: 'Limpieza',
    emoji: '🧹',
    productos: [
      { nombre: 'Lavandina 1L', precio: 1200, emoji: '🧴' },
      { nombre: 'Detergente 750ml', precio: 1600, emoji: '🧴' },
      { nombre: 'Jabón en polvo 800g', precio: 3000, emoji: '🧼' },
      { nombre: 'Papel higiénico x4', precio: 2800, emoji: '🧻' },
      { nombre: 'Rollo de cocina', precio: 1900, emoji: '🧻' },
      { nombre: 'Jabón blanco', precio: 800, emoji: '🧼' },
    ],
  },
  {
    nombre: 'Kiosco',
    emoji: '🪙',
    productos: [
      { nombre: 'Encendedor', precio: 1500, emoji: '🔥' },
      { nombre: 'Pilas AA x2', precio: 2200, emoji: '🔋' },
      { nombre: 'Curitas', precio: 1500, emoji: '🩹' },
      { nombre: 'Analgésico (blíster)', precio: 2000, emoji: '💊' },
      { nombre: 'Cargador USB', precio: 5000, emoji: '🔌' },
      { nombre: 'Auriculares', precio: 4000, emoji: '🎧' },
    ],
  },
];
