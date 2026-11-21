import test from 'node:test';
import assert from 'node:assert/strict';
import { productoSchema, productoQuerySchema } from './producto.validator.js';

test('admite crear y filtrar platos, bebidas y todos los tipos de extra', () => {
  for (const tipo of ['PLATO', 'BEBIDA', 'EXTRA', 'TAPER', 'PAPA_FRITA']) {
    assert.equal(productoSchema.safeParse({ nombre: 'Producto', precio: 7, tipo }).success, true);
    assert.equal(productoQuerySchema.safeParse({ tipo }).success, true);
  }
});
