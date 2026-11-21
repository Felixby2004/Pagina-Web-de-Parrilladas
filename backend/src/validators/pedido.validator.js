import { z } from 'zod';

const estadoPedidoSchema = z.enum(['ABIERTO', 'PAGADO', 'CANCELADO']);

export const detallePedidoSchema = z.object({
  productoId: z.number().int().positive(),
  cantidad: z.number().int().positive(),
  usaTaper: z.boolean().default(false),
  usaPapaFrita: z.boolean().default(false),
});

export const notaSchema = z.object({
  tipo: z.enum(['OBSERVACION', 'ADICIONAL']),
  texto: z.string().max(500).optional(),
  cantidad: z.number().int().positive().optional(),
  descripcion: z.string().max(200).optional(),
  precio: z.number().positive().optional(),
}).refine(data => {
  if (data.tipo === 'OBSERVACION') {
    return data.texto && !data.cantidad && !data.descripcion && !data.precio;
  }
  if (data.tipo === 'ADICIONAL') {
    return data.cantidad && data.descripcion && data.precio && !data.texto;
  }
  return false;
}, { message: 'Datos inválidos para el tipo de nota' });

export const pedidoSchema = z.object({
  costoDelivery: z.number().finite().min(0).max(99999999.99).multipleOf(0.01).nullable().optional(),
  nombreCliente: z.string().max(150).optional().nullable(),
  fecha: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener el formato YYYY-MM-DD')
    .refine((value) => {
      const [year, month, day] = value.split('-').map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));
      return date.getUTCFullYear() === year
        && date.getUTCMonth() === month - 1
        && date.getUTCDate() === day;
    }, 'La fecha no es válida')
    .optional(),
  estado: estadoPedidoSchema.optional(),
  detalles: z.array(detallePedidoSchema).min(1, 'Debe agregar al menos un producto'),
  notas: z.array(notaSchema).optional().default([]),
});

export const extrasPedidoSchema = z.object({
  extras: z.array(z.object({
    productoId: z.number().int().positive(),
    cantidad: z.number().int().positive().max(10000),
  })).min(1, 'Agregue al menos un extra').max(100),
});

export const pedidoIdSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

export const estadosPedidosSchema = z.object({
  cambios: z.array(z.object({
    id: z.number().int().positive().max(2147483647),
    estado: estadoPedidoSchema,
  })).nonempty().refine(
    (cambios) => new Set(cambios.map(({ id }) => id)).size === cambios.length,
    'Cada pedido debe aparecer una sola vez',
  ),
});

export const pedidoQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).default('1').transform(Number),
  limit: z.string().regex(/^\d+$/).default('10').transform(Number),
  fechaInicio: z.string().datetime().optional(),
  fechaFin: z.string().datetime().optional(),
  estado: estadoPedidoSchema.optional(),
  search: z.string().optional().default(''),
});
