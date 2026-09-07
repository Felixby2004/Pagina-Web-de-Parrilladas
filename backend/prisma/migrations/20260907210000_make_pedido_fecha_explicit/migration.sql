-- Make the requested order date an explicit application value.
ALTER TABLE "pedidos" ALTER COLUMN "fecha" DROP DEFAULT;
