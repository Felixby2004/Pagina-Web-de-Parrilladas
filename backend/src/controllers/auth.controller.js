import { 
  registrarUsuario,
  verificarCodigo,
  reenviarCodigoVerificacion,
  login,
  solicitarRecuperacion,
  cambiarPasswordConRecuperacion,
  cambiarPasswordPerfil
} from '../services/auth.service.js';

export const registro = async (req, res, next) => {
  try {
    const resultado = await registrarUsuario(req.body);
    res.status(201).json(resultado);
  } catch (error) {
    next(error);
  }
};

export const verificar = async (req, res, next) => {
  try {
    const { correo, codigo } = req.body;
    const resultado = await verificarCodigo(correo, codigo);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
};

export const reenviarVerificacion = async (req, res, next) => {
  try {
    const { correo } = req.body;
    const resultado = await reenviarCodigoVerificacion(correo);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
};

export const iniciarSesion = async (req, res, next) => {
  try {
    const { correo, contraseña } = req.body;
    const resultado = await login(correo, contraseña);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
};

export const solicitarRecuperacionController = async (req, res, next) => {
  try {
    const { correo } = req.body;
    const resultado = await solicitarRecuperacion(correo);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
};

export const cambiarPasswordRecuperacion = async (req, res, next) => {
  try {
    const { correo, codigo, nuevaContraseña } = req.body;
    const resultado = await cambiarPasswordConRecuperacion(correo, codigo, nuevaContraseña);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
};

export const cambiarPasswordPerfilController = async (req, res, next) => {
  try {
    const { id } = req.usuario;
    const { contraseñaActual, nuevaContraseña } = req.body;
    const resultado = await cambiarPasswordPerfil(id, contraseñaActual, nuevaContraseña);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
};

export const obtenerPerfil = async (req, res, next) => {
  try {
    const { id, nombre, correo, rol } = req.usuario;
    res.json({ id, nombre, correo, rol });
  } catch (error) {
    next(error);
  }
};