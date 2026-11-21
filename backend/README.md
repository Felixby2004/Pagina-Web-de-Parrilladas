# Actualización de pedidos y catálogo

Para actualizar directamente desde el editor SQL de PostgreSQL/Neon:

1. Ejecutar completo `prisma/sql/preparar-productos-delivery.sql`. Agrega BEBIDA, EXTRA y el campo opcional costoDelivery; también limpia la transacción fallida si se intentó actualizar el catálogo antes de preparar la estructura.
2. Cuando termine, ejecutar completo `prisma/sql/actualizar-productos.sql` en otra ejecución. Los valores nuevos del enum deben confirmarse antes de usarlos.

Como alternativa al primer paso, desde `backend` se pueden aplicar las migraciones. La migración admite que los campos y valores ya se hayan agregado con el script de preparación:

```powershell
npx prisma migrate deploy
npm run generate
```

Después ejecutar `prisma/sql/actualizar-productos.sql` en el editor SQL de PostgreSQL/Neon. El script está adaptado a los 15 productos de `productos.csv`: verifica que sus IDs y nombres coincidan y actualiza únicamente la clasificación. Conserva todos los precios, nombres, descripciones, disponibilidad y visibilidad; no crea productos ni modifica pedidos. Puede repetirse y muestra el catálogo final. Si falta un producto o un nombre cambió desde el CSV, la transacción se interrumpe sin aplicar cambios. Los productos fuera de esos 15 IDs quedan intactos.

- **Platos:** pollo, chuleta, churrasco, tira de cerdo, filete de pechuga, porción de molleja, lomo de cerdo y chorizo.
- **Bebidas:** Cerveza (8), Chicha Morada (9), Gaseosa (10), Jarra de Limonada (11) y Jarra de Maracuya (15).
- **Extras:** se conservan Taper (12) a S/ 1.50 y Papa Frita (13) a S/ 7.00 con sus tipos TAPER y PAPA_FRITA; se agrega EXTRA para otros productos. Cualquier producto del catálogo, incluido chorizo, puede pedirse como extra.
- **Papa frita en plato:** recargo de S/ 4.50 por unidad al activar el complemento. Una porción independiente usa su precio de catálogo de S/ 7.00.
- **Delivery:** opcional; admite cero (gratis) o un importe con hasta dos decimales. Se suma una vez al pedido y aparece en el detalle y la nota de venta.
- **Extras posteriores:** en el detalle del pedido, usar **Agregar extras**. Se guardan como adicionales con nombre y precio del momento y se suman al total sin recalcular productos anteriores. Un pedido pagado vuelve a ABIERTO para cobrar; los cancelados no admiten extras.

Los pedidos anteriores conservan sus importes y quedan sin delivery. La migración y el script se entregan para ejecutarlos contra la base de datos correspondiente; las pruebas locales no necesitan modificarla.

Validación local:

```powershell
npm test
```
