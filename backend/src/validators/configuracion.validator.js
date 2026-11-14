import { z } from 'zod';

const dominiosCanva = ['canva.com', 'canva.site', 'canva.link'];

export const listaProductosCanvaUrlSchema = z.string().trim().max(2048).transform((value, ctx) => {
  if (value === '') return null;

  const url = URL.canParse(value) ? new URL(value) : null;
  if (url?.protocol === 'https:' &&
    !url.username && !url.password &&
    dominiosCanva.some((domain) =>
      url.hostname === domain || url.hostname.endsWith(`.${domain}`)
    )) {
    return url.href;
  }

  ctx.addIssue({ code: 'custom', message: 'Ingresa un enlace de Canva con https://, por ejemplo https://canva.link/…' });
  return z.NEVER;
});

export const configuracionSchema = z.object({
  nombreNegocio: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(200),
});

export const configuracionIdSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});
