import prisma from '../config/db.js';

export const obtenerConfiguracion = async () => {
  // Buscar la primera configuración (solo debe haber una)
  const config = await prisma.configuracion.findFirst();
  return config;
};

export const crearConfiguracion = async (data) => {
  return prisma.configuracion.create({ data });
};

export const actualizarConfiguracion = async (data) => {
  const existing = await obtenerConfiguracion();
  if (existing) {
    return prisma.configuracion.update({
      where: { id: existing.id },
      data,
    });
  }
  return crearConfiguracion(data);
};