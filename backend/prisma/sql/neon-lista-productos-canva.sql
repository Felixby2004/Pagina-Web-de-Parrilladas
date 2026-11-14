-- Ejecutar en el SQL Editor de Neon en la rama y base que usa el backend de producción.
ALTER TABLE "public"."configuracion"
  ADD COLUMN IF NOT EXISTS "listaProductosCanvaUrl" TEXT;
