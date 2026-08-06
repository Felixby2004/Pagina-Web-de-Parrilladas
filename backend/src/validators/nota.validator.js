import { z } from 'zod';

export const notaIdSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

export const actualizarNotaSchema = z.object({
  texto: z.string().max(500).optional(),
  cantidad: z.number().int().positive().optional(),
  descripcion: z.string().max(200).optional(),
  precio: z.number().positive().optional(),
});