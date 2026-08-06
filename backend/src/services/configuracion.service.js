import {
  obtenerConfiguracion,
  actualizarConfiguracion,
} from '../repositories/configuracion.repository.js';

export const obtenerConfiguracionService = async () => {
  return obtenerConfiguracion();
};

export const actualizarConfiguracionService = async (data) => {
  return actualizarConfiguracion(data);
};