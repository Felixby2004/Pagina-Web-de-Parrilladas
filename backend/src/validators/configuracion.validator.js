import { z } from 'zod';

export const configuracionSchema = z.object({
  nombreNegocio: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(200),
});

export const configuracionIdSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});