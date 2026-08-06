// Middleware para validar con Zod
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const target =
        source === 'query'
          ? req.query
          : source === 'params'
            ? req.params
            : req.body;
      const data = schema.parse(target);

      if (source === 'query') {
        Object.assign(req.query, data);
      } else if (source === 'params') {
        Object.assign(req.params, data);
      } else {
        req.body = data;
      }

      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: 'Error de validación',
          detalles: error.errors.map(e => ({
            campo: e.path.join('.'),
            mensaje: e.message,
          })),
        });
      }
      next(error);
    }
  };
};
