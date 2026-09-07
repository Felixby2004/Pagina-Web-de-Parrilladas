import { z } from 'zod';

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
  estado: z.enum(['ABIERTO', 'PAGADO', 'CANCELADO']).optional(),
  detalles: z.array(detallePedidoSchema).min(1, 'Debe agregar al menos un producto'),
  notas: z.array(notaSchema).optional().default([]),
});

export const pedidoIdSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

export const pedidoQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).default('1').transform(Number),
  limit: z.string().regex(/^\d+$/).default('10').transform(Number),
  fechaInicio: z.string().datetime().optional(),
  fechaFin: z.string().datetime().optional(),
  estado: z.enum(['ABIERTO', 'PAGADO', 'CANCELADO']).optional(),
  search: z.string().optional().default(''),
});