import { z } from 'zod';

export const productoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(150),
  descripcion: z.string().max(500).optional().nullable(),
  precio: z.number().positive('El precio debe ser mayor a 0').transform(val => Number(val.toFixed(2))),
  tipo: z.enum(['PLATO', 'TAPER', 'PAPA_FRITA'], {
    errorMap: () => ({ message: 'Tipo inválido' })
  }),
  disponible: z.boolean().default(true),
});

export const productoIdSchema = z.object({
  id: z.coerce.number().int().positive('ID inválido'), // ✅ Acepta string o número
});

export const productoQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().default(10).optional(),
  search: z.string().optional().default(''),
  tipo: z.enum(['PLATO', 'TAPER', 'PAPA_FRITA']).optional(),
  sort: z.enum(['nombre', 'precio', 'tipo']).default('nombre').optional(),
  order: z.enum(['asc', 'desc']).default('asc').optional(),
});