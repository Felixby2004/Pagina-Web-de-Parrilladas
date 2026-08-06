import multer from 'multer';
import path from 'path';

// Configuración de almacenamiento en memoria (para Cloudinary)
const storage = multer.memoryStorage();

// Filtro de archivos (solo imágenes)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo imágenes (JPEG, PNG, WEBP, GIF)'), false);
  }
};

// Configuración de multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Middleware para subida de logo del negocio
export const uploadLogo = upload.single('logo');

export const uploadConfiguracionImagenes = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'listaProductosImagen', maxCount: 1 },
]);
