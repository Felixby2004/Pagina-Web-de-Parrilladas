import { z } from 'zod';

export const loginSchema = z.object({
  correo: z.string().email('Correo electrónico inválido'),
  contraseña: z.string().min(1, 'La contraseña es obligatoria'),
});

export const registroSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  correo: z.string().email('Correo electrónico inválido'),
  contraseña: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmarContraseña: z.string(),
}).refine(data => data.contraseña === data.confirmarContraseña, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmarContraseña'],
});

export const verificarSchema = z.object({
  correo: z.string().email('Correo electrónico inválido'),
  codigo: z.string().length(6, 'El código debe tener 6 dígitos'),
});

export const recuperarSchema = z.object({
  correo: z.string().email('Correo electrónico inválido'),
});

export const cambiarPasswordSchema = z.object({
  correo: z.string().email('Correo electrónico inválido'),
  codigo: z.string().length(6, 'El código debe tener 6 dígitos'),
  nuevaContraseña: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmarContraseña: z.string(),
}).refine(data => data.nuevaContraseña === data.confirmarContraseña, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmarContraseña'],
});

export const productoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().optional(),
  precio: z.preprocess((value) => {
    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? value : parsed;
    }
    return value;
  }, z.number().positive('El precio debe ser mayor a 0')),
  tipo: z.enum(['PLATO', 'TAPER', 'PAPA_FRITA']),
  disponible: z.boolean().default(true),
});
