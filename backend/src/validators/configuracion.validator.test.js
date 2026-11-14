import test from 'node:test';
import assert from 'node:assert/strict';
import { listaProductosCanvaUrlSchema } from './configuracion.validator.js';

test('acepta enlaces cortos oficiales de Canva', () => {
  const enlace = 'https://canva.link/menu-parrilladas';
  assert.equal(listaProductosCanvaUrlSchema.parse(` ${enlace} `), enlace);
});

test('rechaza imitaciones de canva.link y exige HTTPS', () => {
  for (const enlace of [
    'https://canva.link.ejemplo.com/menu',
    'https://canva.link@ejemplo.com/menu',
    'http://canva.link/menu',
  ]) {
    assert.equal(listaProductosCanvaUrlSchema.safeParse(enlace).success, false, enlace);
  }
});
