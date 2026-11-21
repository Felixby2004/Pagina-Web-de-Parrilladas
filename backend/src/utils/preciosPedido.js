export const RECARGO_PAPA_FRITA = 4.5;
export const redondearDinero = (valor) => Math.round((Number(valor) + Number.EPSILON) * 100) / 100;

export function calcularDetalle(detalle, producto, taper) {
  const { productoId, cantidad } = detalle;
  const usaTaper = Boolean(detalle.usaTaper);
  const usaPapaFrita = Boolean(detalle.usaPapaFrita);
  if ((usaTaper || usaPapaFrita) && producto.tipo !== 'PLATO') {
    throw { statusCode: 400, message: 'Solo los platos pueden llevar taper o papa frita como complemento' };
  }
  if (usaTaper && !taper) {
    throw { statusCode: 400, message: 'No hay taper disponible' };
  }
  const precioUnitario = Number(producto.precio);
  const precioConComplementos = precioUnitario + (usaTaper ? Number(taper.precio) : 0)
    + (usaPapaFrita ? RECARGO_PAPA_FRITA : 0);
  return { productoId, cantidad, precioUnitario, usaTaper, usaPapaFrita,
    subtotal: redondearDinero(cantidad * precioConComplementos) };
}

export function calcularTotalPedido(detalles, notas = [], costoDelivery = null) {
  const centimos = (valor) => Math.round(Number(valor || 0) * 100);
  return (detalles.reduce((sum, d) => sum + centimos(d.subtotal), 0)
    + notas.filter(n => n.tipo === 'ADICIONAL').reduce((sum, n) => sum + centimos(n.subtotal), 0)
    + centimos(costoDelivery)) / 100;
}
