import test from 'node:test';
import assert from 'node:assert/strict';
import { pedidoSchema, extrasPedidoSchema } from './pedido.validator.js';

const pedido = { detalles: [{ productoId: 1, cantidad: 1 }] };
test('delivery es opcional, gratis o un importe positivo con dos decimales', () => {
  for (const costoDelivery of [undefined, null, 0, 4.5, 7.25]) {
    assert.equal(pedidoSchema.safeParse({ ...pedido, costoDelivery }).success, true);
  }
  for (const costoDelivery of [-1, 1.234, Infinity, '5.50', 100000000]) {
    assert.equal(pedidoSchema.safeParse({ ...pedido, costoDelivery }).success, false);
  }
});

test('extras exigen productos y cantidades enteras positivas; no aceptan precio del cliente', () => {
  const valido = extrasPedidoSchema.parse({ extras: [{ productoId: 4, cantidad: 2, precio: 0.01 }] });
  assert.deepEqual(valido.extras, [{ productoId: 4, cantidad: 2 }]);
  for (const extras of [[], [{ productoId: 1, cantidad: 0 }], [{ productoId: 1, cantidad: 1.5 }], [{ productoId: -1, cantidad: 1 }]]) {
    assert.equal(extrasPedidoSchema.safeParse({ extras }).success, false);
  }
});
