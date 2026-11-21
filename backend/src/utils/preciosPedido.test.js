import test from 'node:test';
import assert from 'node:assert/strict';
import { calcularDetalle, calcularTotalPedido } from './preciosPedido.js';
import { subtotalDetalle } from '../../../frontend/src/utils/preciosPedido.js';

test('papa frita del plato suma 4.50 por unidad, independiente de la porción de 7', () => {
  const plato = calcularDetalle({ productoId: 1, cantidad: 2, usaPapaFrita: true }, { tipo: 'PLATO', precio: 15 });
  const porcion = calcularDetalle({ productoId: 2, cantidad: 1 }, { tipo: 'PAPA_FRITA', precio: 7 });
  assert.equal(plato.subtotal, 39);
  assert.equal(porcion.subtotal, 7);
  assert.equal(calcularTotalPedido([plato, porcion]), 46);
});

test('delivery se cobra una sola vez y se suma a platos y adicionales', () => {
  const detalle = calcularDetalle({ productoId: 1, cantidad: 3, usaTaper: true, usaPapaFrita: true },
    { tipo: 'PLATO', precio: 12 }, { precio: 1 });
  const notas = [{ tipo: 'ADICIONAL', subtotal: 14 }, { tipo: 'OBSERVACION' }];
  assert.equal(calcularTotalPedido([detalle], notas, 5.75), 72.25);
  assert.equal(calcularTotalPedido([detalle], notas, null), 66.5);
  assert.equal(calcularTotalPedido([detalle], notas, 0), 66.5);
});

test('bebidas y extras no admiten complementos del plato', () => {
  for (const tipo of ['BEBIDA', 'EXTRA', 'TAPER', 'PAPA_FRITA']) {
    for (const complemento of ['usaPapaFrita', 'usaTaper']) {
      assert.throws(() => calcularDetalle({ cantidad: 1, [complemento]: true }, { tipo, precio: 7 }, { precio: 1 }));
    }
  }
  assert.throws(() => calcularDetalle({ cantidad: 1, usaTaper: true }, { tipo: 'PLATO', precio: 15 }));
});

test('las sumas monetarias no acumulan residuos de punto flotante', () => {
  assert.equal(calcularTotalPedido([{ subtotal: 0.1 }, { subtotal: 0.2 }], [], 0.1), 0.4);
});

test('la vista previa y el servidor calculan los mismos subtotales', () => {
  for (const cantidad of [1, 2, 5]) {
    for (const usaTaper of [false, true]) {
      for (const usaPapaFrita of [false, true]) {
        const detalle = { productoId: 1, cantidad, usaTaper, usaPapaFrita };
        const producto = { tipo: 'PLATO', precio: '14.90' };
        const taper = { precio: '0.50' };
        assert.equal(subtotalDetalle(detalle, producto, taper), calcularDetalle(detalle, producto, taper).subtotal);
      }
    }
  }
});
