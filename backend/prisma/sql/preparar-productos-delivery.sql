-- PASO 1: ejecutar este archivo completo en PostgreSQL/Neon.
-- Después ejecutar actualizar-productos.sql como una ejecución separada.
-- ROLLBACK limpia la transacción fallida del intento anterior.
ROLLBACK;

BEGIN;
ALTER TYPE "TipoProducto" ADD VALUE IF NOT EXISTS 'BEBIDA';
ALTER TYPE "TipoProducto" ADD VALUE IF NOT EXISTS 'EXTRA';
ALTER TABLE "pedidos" ADD COLUMN IF NOT EXISTS "costoDelivery" DECIMAL(10,2);
COMMIT;

-- Los valores nuevos del enum deben estar confirmados antes de usarlos.
-- Este archivo se puede repetir y conserva todos los datos existentes.
