import { z } from 'zod';

export const listaProductosCanvaUrlSchema = z.string().trim().max(2048).transform((value, ctx) => {
  if (value === '') return null;

  const url = URL.canParse(value) ? new URL(value) : null;
  if (url?.protocol === 'https:' &&
    !url.username && !url.password &&
    ['canva.com', 'canva.site'].some((domain) =>
      url.hostname === domain || url.hostname.endsWith(`.${domain}`)
    )) {
    return url.href;
  }

  ctx.addIssue({ code: 'custom', message: 'Ingresa un enlace válido de Canva (https://)' });
  return z.NEVER;
});

export const configuracionSchema = z.object({
  nombreNegocio: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(200),
});

export const configuracionIdSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});
