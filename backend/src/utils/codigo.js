// Genera un código aleatorio de 6 dígitos
export const generarCodigo = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Calcula la fecha de expiración (15 minutos desde ahora)
export const obtenerExpiracion = (minutos = 15) => {
  return new Date(Date.now() + minutos * 60 * 1000);
};