/**
 * Constantes del sistema para evitar strings mágicos
 */

// Tipos de producto
export const TIPOS_PRODUCTO = {
  PLATO: 'PLATO',
  TAPER: 'TAPER',
  PAPA_FRITA: 'PAPA_FRITA',
} as const;

// Estados de pedido
export const ESTADOS_PEDIDO = {
  ABIERTO: 'ABIERTO',
  PAGADO: 'PAGADO',
  CANCELADO: 'CANCELADO',
} as const;

// Roles de usuario
export const ROLES = {
  ADMIN: 'ADMIN',
  EMPLEADO: 'EMPLEADO',
} as const;

// Tipos de nota
export const TIPOS_NOTA = {
  OBSERVACION: 'OBSERVACION',
  ADICIONAL: 'ADICIONAL',
} as const;

// Métodos de pago
export const METODOS_PAGO = {
  EFECTIVO: 'EFECTIVO',
  TARJETA: 'TARJETA',
  TRANSFERENCIA: 'TRANSFERENCIA',
  OTRO: 'OTRO',
} as const;

// Opciones para dropdowns
export const OPCIONES_TIPOS_PRODUCTO = [
  { value: 'PLATO', label: 'Plato' },
  { value: 'TAPER', label: 'Taper' },
  { value: 'PAPA_FRITA', label: 'Papa Frita' },
];

export const OPCIONES_ESTADOS_PEDIDO = [
  { value: 'ABIERTO', label: 'Abierto' },
  { value: 'PAGADO', label: 'Pagado' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

export const OPCIONES_ROLES = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'EMPLEADO', label: 'Empleado' },
];

export const OPCIONES_METODOS_PAGO = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TARJETA', label: 'Tarjeta' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'OTRO', label: 'Otro' },
];

// Mensajes de error comunes
export const MENSAJES_ERROR = {
  NO_AUTORIZADO: 'No autorizado. Inicie sesión para continuar.',
  SIN_PERMISOS: 'No tiene permisos para realizar esta acción.',
  RECURSO_NO_ENCONTRADO: 'Recurso no encontrado.',
  ERROR_VALIDACION: 'Error de validación. Revise los datos ingresados.',
  ERROR_SERVIDOR: 'Error interno del servidor. Intente más tarde.',
} as const;

// Expresiones regulares comunes
export const REGEX = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  TELEFONO: /^[0-9]{9}$/,
  SOLO_NUMEROS: /^[0-9]+$/,
} as const;