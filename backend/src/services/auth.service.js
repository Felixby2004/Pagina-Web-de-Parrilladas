import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { generarCodigo, obtenerExpiracion } from '../utils/codigo.js';
import { 
  crearUsuario, 
  buscarPorCorreo, 
  buscarPorId,
  actualizarUsuario,
  actualizarPorCorreo,
  guardarCodigoVerificacion,
  guardarCodigoRecuperacion,
  marcarVerificado,
  limpiarCodigosRecuperacion
} from '../repositories/usuario.repository.js';
import { enviarCorreoVerificacion, enviarCorreoRecuperacion } from '../config/email.js';

// ========== REGISTRO ==========
export const registrarUsuario = async (datos) => {
  const { nombre, correo, contraseña } = datos;

  // Verificar si el correo ya existe
  const existe = await buscarPorCorreo(correo);
  if (existe) {
    throw { statusCode: 409, message: 'El correo electrónico ya está registrado' };
  }

  // Hashear contraseña
  const hash = await bcrypt.hash(contraseña, 10);

  // Generar código de verificación (6 dígitos)
  const codigo = generarCodigo();
  const expiracion = obtenerExpiracion(15);

  // Crear usuario en BD
  const usuario = await crearUsuario({
    nombre,
    correo,
    contraseña: hash,
    codigoVerificacion: codigo,
    expiracionVerificacion: expiracion,
    verificado: false,
  });

  // Enviar correo de verificación
  await enviarCorreoVerificacion(correo, codigo);

  return {
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    mensaje: 'Usuario registrado. Se ha enviado un código de verificación a tu correo.'
  };
};

// ========== VERIFICACIÓN ==========
export const verificarCodigo = async (correo, codigo) => {
  const usuario = await buscarPorCorreo(correo);
  if (!usuario) {
    throw { statusCode: 404, message: 'Usuario no encontrado' };
  }

  if (usuario.verificado) {
    throw { statusCode: 400, message: 'La cuenta ya está verificada' };
  }

  if (usuario.codigoVerificacion !== codigo) {
    throw { statusCode: 400, message: 'Código de verificación incorrecto' };
  }

  if (usuario.expiracionVerificacion < new Date()) {
    throw { statusCode: 400, message: 'El código de verificación ha expirado. Solicita uno nuevo.' };
  }

  // Marcar como verificado
  await marcarVerificado(usuario.id);

  return { mensaje: 'Cuenta verificada exitosamente. Ya puedes iniciar sesión.' };
};

// ========== REENVIAR CÓDIGO ==========
export const reenviarCodigoVerificacion = async (correo) => {
  const usuario = await buscarPorCorreo(correo);
  if (!usuario) {
    throw { statusCode: 404, message: 'Usuario no encontrado' };
  }

  if (usuario.verificado) {
    throw { statusCode: 400, message: 'La cuenta ya está verificada' };
  }

  const codigo = generarCodigo();
  const expiracion = obtenerExpiracion(15);

  await guardarCodigoVerificacion(usuario.id, codigo, expiracion);
  await enviarCorreoVerificacion(correo, codigo);

  return { mensaje: 'Se ha reenviado un nuevo código de verificación a tu correo.' };
};

// ========== LOGIN ==========
export const login = async (correo, contraseña) => {
  const usuario = await buscarPorCorreo(correo);
  if (!usuario) {
    throw { statusCode: 401, message: 'Credenciales incorrectas' };
  }

  if (!usuario.verificado) {
    throw { statusCode: 401, message: 'Debes verificar tu cuenta antes de iniciar sesión' };
  }

  const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);
  if (!contraseñaValida) {
    throw { statusCode: 401, message: 'Credenciales incorrectas' };
  }

  // Generar JWT
  const token = jwt.sign(
    { id: usuario.id, correo: usuario.correo, rol: usuario.rol },
    env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  return {
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
    }
  };
};

// ========== RECUPERACIÓN DE CONTRASEÑA ==========
// Paso 1: Solicitar código
export const solicitarRecuperacion = async (correo) => {
  const usuario = await buscarPorCorreo(correo);
  if (!usuario) {
    throw { statusCode: 404, message: 'Usuario no encontrado' };
  }

  const codigo = generarCodigo();
  const expiracion = obtenerExpiracion(15);

  await guardarCodigoRecuperacion(usuario.id, codigo, expiracion);
  await enviarCorreoRecuperacion(correo, codigo);

  return { mensaje: 'Se ha enviado un código de recuperación a tu correo.' };
};

// Paso 2: Validar código y cambiar contraseña
export const cambiarPasswordConRecuperacion = async (correo, codigo, nuevaContraseña) => {
  const usuario = await buscarPorCorreo(correo);
  if (!usuario) {
    throw { statusCode: 404, message: 'Usuario no encontrado' };
  }

  if (usuario.codigoRecuperacion !== codigo) {
    throw { statusCode: 400, message: 'Código de recuperación incorrecto' };
  }

  if (usuario.expiracionRecuperacion < new Date()) {
    throw { statusCode: 400, message: 'El código de recuperación ha expirado. Solicita uno nuevo.' };
  }

  const hash = await bcrypt.hash(nuevaContraseña, 10);

  await actualizarUsuario(usuario.id, {
    contraseña: hash,
  });

  await limpiarCodigosRecuperacion(usuario.id);

  return { mensaje: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.' };
};

// ========== CAMBIAR CONTRASEÑA DESDE PERFIL ==========
export const cambiarPasswordPerfil = async (usuarioId, contraseñaActual, nuevaContraseña) => {
  const usuario = await buscarPorId(usuarioId);
  if (!usuario) {
    throw { statusCode: 404, message: 'Usuario no encontrado' };
  }

  const contraseñaValida = await bcrypt.compare(contraseñaActual, usuario.contraseña);
  if (!contraseñaValida) {
    throw { statusCode: 401, message: 'La contraseña actual es incorrecta' };
  }

  const hash = await bcrypt.hash(nuevaContraseña, 10);
  await actualizarUsuario(usuarioId, { contraseña: hash });

  return { mensaje: 'Contraseña actualizada exitosamente.' };
};