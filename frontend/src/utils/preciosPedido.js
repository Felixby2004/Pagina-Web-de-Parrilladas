export const RECARGO_PAPA_FRITA = 4.5;
export const TIPOS_PRODUCTO_LABEL = {
  PLATO: 'Plato', BEBIDA: 'Bebida', EXTRA: 'Extra', TAPER: 'Extra: taper', PAPA_FRITA: 'Extra: porción de papa frita',
};

export function subtotalDetalle(detalle, producto, taper) {
  if (!producto) return 0;
  const precio = Number(producto.precio)
    + (producto.tipo === 'PLATO' && detalle.usaTaper ? Number(taper?.precio || 0) : 0)
    + (producto.tipo === 'PLATO' && detalle.usaPapaFrita ? RECARGO_PAPA_FRITA : 0);
  return Math.round(Number(detalle.cantidad || 0) * precio * 100) / 100;
}
