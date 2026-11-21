-- Catálogo adaptado a los 15 productos de productos.csv.
-- PASO 2: ejecutar después de preparar-productos-delivery.sql (en otra ejecución)
-- o después de aplicar la migración con `npx prisma migrate deploy`.
-- Conserva IDs, nombres, descripciones, precios, disponibilidad y visibilidad.
-- No crea ni elimina productos y no modifica pedidos anteriores.
-- Puede ejecutarse varias veces: solo actualiza los tipos que cambien.
BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = '"TipoProducto"'::regtype AND enumlabel = 'BEBIDA'
  ) THEN
    RAISE EXCEPTION 'Falta BEBIDA en TipoProducto. Ejecuta primero preparar-productos-delivery.sql completo y después vuelve a ejecutar este archivo por separado.';
  END IF;
END;
$$;

CREATE TEMP TABLE catalogo_productos_csv (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo "TipoProducto" NOT NULL
) ON COMMIT DROP;

INSERT INTO catalogo_productos_csv (id, nombre, tipo) VALUES
  (1,  'Pollo',              'PLATO'),
  (2,  'Chuleta',            'PLATO'),
  (3,  'Churrasco',          'PLATO'),
  (4,  'Tira de Cerdo',      'PLATO'),
  (5,  'Filete de Pechuga',  'PLATO'),
  (6,  'Porción de Molleja', 'PLATO'),
  (7,  'Chorizo',            'PLATO'),
  (8,  'Cerveza',            'BEBIDA'),
  (9,  'Chicha Morada',      'BEBIDA'),
  (10, 'Gaseosa',            'BEBIDA'),
  (11, 'Jarra de Limonada',  'BEBIDA'),
  (12, 'Taper',              'TAPER'),
  (13, 'Papa Frita',         'PAPA_FRITA'),
  (14, 'Lomo de Cerdo',      'PLATO'),
  (15, 'Jarra de Maracuya',  'BEBIDA');

-- Comprobar ID y nombre antes de escribir para detectar otra base de datos
-- o productos renombrados desde la exportación.
DO $$
DECLARE
  productos_distintos TEXT;
BEGIN
  SELECT string_agg(format('%s: %s', c.id, c.nombre), ', ' ORDER BY c.id)
  INTO productos_distintos
  FROM catalogo_productos_csv c
  LEFT JOIN productos p ON p.id = c.id
  WHERE p.id IS NULL OR p.nombre IS DISTINCT FROM c.nombre;

  IF productos_distintos IS NOT NULL THEN
    RAISE EXCEPTION 'No coinciden con productos.csv los siguientes productos: %. No se aplicaron cambios.', productos_distintos;
  END IF;
END;
$$;

UPDATE productos p
SET tipo = c.tipo, "updatedAt" = CURRENT_TIMESTAMP
FROM catalogo_productos_csv c
WHERE p.id = c.id
  AND p.nombre = c.nombre
  AND p.tipo IS DISTINCT FROM c.tipo;

-- En el CSV, Papa Frita (ID 13) ya cuesta S/ 7.00 y Taper (ID 12) S/ 1.50.
-- El recargo de S/ 4.50 por papa frita en un plato se calcula en la aplicación.
-- Chorizo (ID 7) conserva PLATO y se puede seleccionar también como extra.
-- TAPER y PAPA_FRITA conservan sus tipos para los complementos del pedido;
-- también pueden seleccionarse como extras independientes.

SELECT p.id, p.nombre, p.tipo, p.precio, p.disponible, p.visible
FROM productos p
JOIN catalogo_productos_csv c ON c.id = p.id
ORDER BY p.id;

COMMIT;
