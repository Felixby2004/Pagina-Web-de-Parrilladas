import { z } from 'zod';

export const reporteFechaSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
});

export const reporteRangoSchema = z.object({
  fechaInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  fechaFin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
}).refine(data => new Date(data.fechaInicio) <= new Date(data.fechaFin), {
  message: 'La fecha de inicio debe ser anterior a la fecha de fin',
});