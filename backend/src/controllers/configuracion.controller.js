import {
  obtenerConfiguracionService,
  actualizarConfiguracionService,
} from '../services/configuracion.service.js';
import cloudinary from '../config/cloudinary.js';

export const obtenerConfiguracion = async (req, res, next) => {
  try {
    const config = await obtenerConfiguracionService();
    res.json(config);
  } catch (error) {
    next(error);
  }
};

export const actualizarConfiguracion = async (req, res, next) => {
  try {
    const { nombreNegocio } = req.body;
    const logoFile = req.files?.logo?.[0] || null;
    const listaProductosFile = req.files?.listaProductosImagen?.[0] || null;

    const subirImagen = async (file, options) => {
      if (!file) return null;
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(options, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }).end(file.buffer);
      });
      return result.secure_url;
    };

    const logoUrl = await subirImagen(logoFile, {
      folder: 'parrilladas',
      allowed_formats: ['jpg', 'png', 'webp'],
      transformation: [{ width: 200, height: 200, crop: 'limit' }],
    });

    const listaProductosUrl = await subirImagen(listaProductosFile, {
      folder: 'parrilladas',
      allowed_formats: ['jpg', 'png', 'webp'],
      transformation: [{ width: 1200, crop: 'limit' }],
    });

    const data = { nombreNegocio };
    if (logoUrl) {
      data.logoUrl = logoUrl;
    }
    if (listaProductosUrl) {
      data.listaProductosUrl = listaProductosUrl;
    }

    const configuracion = await actualizarConfiguracionService(data);
    res.json({ mensaje: 'Configuración actualizada', configuracion });
  } catch (error) {
    next(error);
  }
};

export const obtenerListaProductosImagen = async (req, res, next) => {
  try {
    const config = await obtenerConfiguracionService();
    const rawUrl = config?.listaProductosUrl;

    if (!rawUrl) {
      res.status(404).json({ error: 'No hay una imagen de lista configurada' });
      return;
    }

    const url = String(rawUrl).replace(/`/g, '').trim();
    const fetchUrl = url.includes('/image/upload/') && !url.includes('/image/upload/f_png/')
      ? url.replace('/image/upload/', '/image/upload/f_png/')
      : url;

    const response = await fetch(fetchUrl);
    if (!response.ok) {
      res.status(502).json({ error: 'No se pudo descargar la imagen' });
      return;
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    const arrayBuffer = await response.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-store');
    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    next(error);
  }
};
