/**
 * Formatea un número como moneda en soles (PEN)
 */
export const formatearMoneda = (valor) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(valor);
};

/**
 * Formatea una fecha en formato largo (ej. "15 de enero de 2024, 14:30")
 */
export const formatearFecha = (fecha) => {
  if (!fecha) return '-';
  return new Date(fecha).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Lima',
  });
};

/**
 * Formatea una fecha en formato corto (ej. "15/01/2024")
 */
export const formatearFechaCorta = (fecha) => {
  if (!fecha) return '-';
  return new Date(fecha).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'America/Lima',
  });
};

/**
 * Formatea una fecha solo para mostrar (ej. "15 de enero de 2024")
 */
export const formatearFechaLarga = (fecha) => {
  if (!fecha) return '-';
  return new Date(fecha).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Lima',
  });
};

/**
 * Trunca un texto a una longitud máxima
 */
export const truncarTexto = (texto, longitud = 50) => {
  if (!texto) return '';
  return texto.length > longitud ? texto.substring(0, longitud) + '...' : texto;
};

/**
 * Formatea un número con separadores de miles
 */
export const formatearNumero = (numero) => {
  return new Intl.NumberFormat('es-PE').format(numero);
};