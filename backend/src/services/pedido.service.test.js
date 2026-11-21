import test, { mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const crear = mock.fn(async ({ data }) => data);
const actualizar = mock.fn(async ({ data }) => data);
const obtener = mock.fn(async () => ({ estado: 'ABIERTO', costoDelivery: 5.75 }));
const productos = new Map([
  [1, { id: 1, nombre: 'Pollo', tipo: 'PLATO', precio: 15, disponible: true }],
  [2, { id: 2, nombre: 'Porción de papa frita', tipo: 'PAPA_FRITA', precio: 7, disponible: true }],
  [3, { id: 3, nombre: 'Chorizo', tipo: 'PLATO', precio: 6, disponible: true }],
  [4, { id: 4, nombre: 'Agotado', tipo: 'EXTRA', precio: 2, disponible: false }],
]);

mock.module('../config/db.js', { defaultExport: {
  pedido: { create: crear, update: actualizar, findUnique: obtener },
} });
mock.module('./producto.service.js', { namedExports: {
  obtenerProductoPorIdService: async id => {
    if (!productos.has(id)) throw { statusCode: 404, message: 'Producto no encontrado' };
    return productos.get(id);
  },
  obtenerTaperYPapaService: async () => ({ taper: { precio: 1 }, papaFrita: productos.get(2) }),
} });

const { crearPedidoService, actualizarPedidoService, agregarExtrasService } = await import('./pedido.service.js');

beforeEach(() => {
  crear.mock.resetCalls();
  actualizar.mock.resetCalls();
  actualizar.mock.mockImplementation(async ({ data }) => data);
});

test('crea pedido completo con delivery y extras en una sola escritura', async () => {
  const data = await crearPedidoService({ fecha: '2026-11-21', costoDelivery: 5.75,
    detalles: [{ productoId: 1, cantidad: 2, usaPapaFrita: true }],
    notas: [{ tipo: 'ADICIONAL', descripcion: 'Chorizo', cantidad: 2, precio: 6 }],
  }, 9);
  assert.equal(data.total, 56.75);
  assert.equal(data.costoDelivery, 5.75);
  assert.equal(data.usuarioId, 9);
  assert.equal(data.notas.create[0].subtotal, 12);
  assert.equal(crear.mock.callCount(), 1);
  assert.equal(actualizar.mock.callCount(), 0);
});

test('permite conservar, modificar o quitar delivery al editar', async () => {
  for (const [costoDelivery, esperado] of [[undefined, 5.75], [7.25, 7.25], [null, null], [0, 0]]) {
    const data = await actualizarPedidoService(1, { costoDelivery, detalles: [{ productoId: 1, cantidad: 1 }] });
    assert.equal(data.costoDelivery, esperado);
    assert.equal(data.total, 15 + Number(esperado));
  }
});

test('extras posteriores conservan delivery y precios originales e incrementan total atómicamente', async () => {
  await agregarExtrasService(1, [{ productoId: 2, cantidad: 2 }, { productoId: 3, cantidad: 1 }]);
  const { data, where } = actualizar.mock.calls[0].arguments[0];
  assert.deepEqual(data.total, { increment: 20 });
  assert.equal(data.estado, 'ABIERTO');
  assert.deepEqual(where.estado.in, ['ABIERTO', 'PAGADO']);
  assert.equal('detalles' in data, false);
  assert.equal('costoDelivery' in data, false);
  assert.equal(data.notas.create.length, 2);
  assert.equal(data.notas.create[0].precio, 7);
});

test('pedido cancelado o inexistente devuelve conflicto sin permitir extras', async () => {
  actualizar.mock.mockImplementation(async () => { throw { code: 'P2025' }; });
  await assert.rejects(agregarExtrasService(1, [{ productoId: 2, cantidad: 1 }]), error => error.statusCode === 409);
});

test('productos no disponibles o inexistentes no generan una escritura parcial', async () => {
  for (const id of [4, 999]) {
    await assert.rejects(agregarExtrasService(1, [{ productoId: 2, cantidad: 1 }, { productoId: id, cantidad: 1 }]));
  }
  assert.equal(actualizar.mock.callCount(), 0);
});
