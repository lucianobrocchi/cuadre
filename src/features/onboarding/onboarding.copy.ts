export const onboardingCopy = {
  // Paso 1 — Bienvenida
  welcome: {
    title: "En 5 minutos hacés tu primer cierre de caja",
    subtitle: "Sin cuaderno y sin calculadora. Vamos paso a paso.",
    inputLabel: "¿Cómo se llama tu kiosco?",
    inputPlaceholder: "Ej: Kiosco La Esquina",
    button: "Empezar",
  },

  // Paso 2 — Productos
  productos: {
    title: "Cargá lo que más vendés",
    subtitle: "Con 5 productos alcanza para arrancar. Después agregás el resto.",
    catalogoLabel: "Elegí de la lista rápida",
    catalogoHint: "Tocá los que vendés por categoría. Ponés el costo si querés ver tu ganancia (opcional).",
    propiosLabel: "O cargá los tuyos",
    propiosHint: "Nombre y precio, nada más.",
    precioLbl: "Precio",
    costoLbl: "Costo",
    button: "Listo, seguir",
  },

  // Paso 3 — Venta de práctica
  venta: {
    title: "Entró un cliente. Tocá lo que se llevó.",
    subtitle: "La cuenta se hace sola. Probá tranquilo, no se rompe nada.",
    ticketVacio: "Tocá un producto para empezar",
    totalLabel: "Total",
    cobrarButton: "Cobrar",
    ventaHechaTitle: "¡Listo! Venta registrada.",
    ventaHechaSubtitle: "Así de rápido vas a cobrar todos los días.",
    button: "Seguir al cierre",
  },

  // Paso 4 — El primer cierre (el momento clave)
  cierre: {
    title: "Ahora cerrá la caja",
    subtitle: "Esto es lo que vendiste en efectivo hoy. Contá la plata de tu caja y fijate si cuadra.",
    vendidoLabel: "Vendiste en efectivo",
    inputLabel: "¿Cuánta plata tenés en la caja?",
    inputPlaceholder: "Contá y poné el total",
    confirmarButton: "Ver si cuadra",
    resultadoCuadra: {
      titulo: "¡Cuadra!",
      detalle: "La plata de tu caja coincide justo con lo que vendiste.",
    },
    resultadoFalta: (monto: number) => ({
      titulo: `Te faltan $${monto}`,
      detalle: "Puede ser un vuelto mal dado o una venta sin registrar. Mañana lo vas a poder revisar fácil.",
    }),
    resultadoSobra: (monto: number) => ({
      titulo: `Te sobran $${monto}`,
      detalle: "Quizás cobraste algo que no anotaste. Igual, ahora ya lo sabés.",
    }),
    cierreFinalTitle: "Listo, hiciste tu primer cierre.",
    cierreFinalSubtitle: "Así de fácil, todos los días. Y en la pestaña Ganancia vas a ver cuánto te deja cada cosa.",
    button: "Empezar a usar Cuadre",
  },
};
