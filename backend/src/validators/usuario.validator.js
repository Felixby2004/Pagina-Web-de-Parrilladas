import { z } from 'zod';

export const usuarioIdSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

export const actualizarUsuarioSchema = z.object({
  nombre: z.string().min(2).max(100).optional(),
  rol: z.enum(['ADMIN', 'EMPLEADO']).optional(),
  disponible: z.boolean().optional(),
});