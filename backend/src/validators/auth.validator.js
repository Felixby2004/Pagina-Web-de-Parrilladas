import { z } from 'zod';

// Esquema para registro
export const registroSchema = z.object({
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar los 100 caracteres'),
  correo: z.string()
    .email('Correo electrónico inválido')
    .max(150, 'El correo no puede superar los 150 caracteres'),
  contraseña: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede superar los 100 caracteres'),
  confirmarContraseña: z.string()
}).refine(data => data.contraseña === data.confirmarContraseña, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmarContraseña']
});

// Esquema para login
export const loginSchema = z.object({
  correo: z.string().email('Correo electrónico inválido'),
  contraseña: z.string().min(1, 'La contraseña es obligatoria'),
});

// Esquema para verificación de código
export const verificarSchema = z.object({
  correo: z.string().email('Correo electrónico inválido'),
  codigo: z.string().length(6, 'El código debe tener 6 dígitos'),
});

// Esquema para solicitar recuperación
export const recuperarSchema = z.object({
  correo: z.string().email('Correo electrónico inválido'),
});

// Esquema para cambiar contraseña (recuperación)
export const cambiarPasswordSchema = z.object({
  correo: z.string().email('Correo electrónico inválido'),
  codigo: z.string().length(6, 'El código debe tener 6 dígitos'),
  nuevaContraseña: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede superar los 100 caracteres'),
  confirmarContraseña: z.string()
}).refine(data => data.nuevaContraseña === data.confirmarContraseña, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmarContraseña']
});

// Esquema para cambiar contraseña desde perfil (requiere autenticación)
export const cambiarPasswordPerfilSchema = z.object({
  contraseñaActual: z.string().min(1, 'La contraseña actual es obligatoria'),
  nuevaContraseña: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede superar los 100 caracteres'),
  confirmarContraseña: z.string()
}).refine(data => data.nuevaContraseña === data.confirmarContraseña, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmarContraseña']
});