import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Avatar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useConfiguracion } from '../../hooks/useConfiguracion';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';

export default function ConfiguracionNegocio() {
  const { usuario } = useAuthStore();
  const isAdmin = usuario?.rol === 'ADMIN';
  const { configuracion, actualizar, actualizarLoading, isLoading } = useConfiguracion();
  const [nombre, setNombre] = useState('');
  const [logo, setLogo] = useState(null);
  const [previewLogo, setPreviewLogo] = useState('');
  const [listaProductosImagen, setListaProductosImagen] = useState(null);
  const [previewListaProductosImagen, setPreviewListaProductosImagen] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (configuracion) {
      setNombre(configuracion.nombreNegocio || '');
      setPreviewLogo(configuracion.logoUrl || '');
      setPreviewListaProductosImagen(configuracion.listaProductosUrl || '');
    }
  }, [configuracion]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('El logo no debe superar los 5MB');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Solo se permiten imágenes JPEG, PNG o WEBP');
        return;
      }
      setLogo(file);
      setPreviewLogo(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleListaProductosImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe superar los 5MB');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Solo se permiten imágenes JPEG, PNG o WEBP');
        return;
      }
      setListaProductosImagen(file);
      setPreviewListaProductosImagen(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('nombreNegocio', nombre);
    if (logo) {
      formData.append('logo', logo);
    }
    if (listaProductosImagen) {
      formData.append('listaProductosImagen', listaProductosImagen);
    }

    try {
      await actualizar(formData);
      setSuccess('Configuración actualizada exitosamente');
      setLogo(null);
      setListaProductosImagen(null);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Error al actualizar configuración');
      setTimeout(() => setError(''), 4000);
    }
  };

  if (!isAdmin) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            No tienes permisos para acceder a esta sección. Solo administradores.
          </Alert>
        </motion.div>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 600,
            fontSize: { xs: '1.5rem', md: '2rem' },
          }}
        >
          Configuración del Negocio
        </Typography>
        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}
            >
              <TextField
                label="Nombre del negocio"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                fullWidth
                disabled={!isAdmin || isLoading}
                slotProps={{
                  input: {
                    sx: { borderRadius: 2 },
                  },
                }}
              />

              <Box>
                <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                  Logo del negocio
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    flexWrap: 'wrap',
                  }}
                >
                  {previewLogo && (
                    <Avatar
                      src={previewLogo}
                      sx={{ width: 80, height: 80, borderRadius: 2 }}
                      variant="rounded"
                    />
                  )}
                  <Button
                    variant="outlined"
                    component="label"
                    disabled={!isAdmin || isLoading}
                    sx={{ borderRadius: 2 }}
                  >
                    {logo ? 'Cambiar logo' : 'Seleccionar logo'}
                    <input
                      type="file"
                      hidden
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleLogoChange}
                      disabled={!isAdmin || isLoading}
                    />
                  </Button>
                  {logo && (
                    <Button
                      variant="text"
                      color="error"
                      onClick={() => {
                        setLogo(null);
                        setPreviewLogo(configuracion?.logoUrl || '');
                      }}
                    >
                      Quitar
                    </Button>
                  )}
                </Box>
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  Formatos permitidos: JPEG, PNG, WEBP. Tamaño máximo: 5MB
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                  Imagen de lista de productos
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    flexWrap: 'wrap',
                  }}
                >
                  {previewListaProductosImagen && (
                    <Avatar
                      src={previewListaProductosImagen}
                      sx={{ width: 80, height: 80, borderRadius: 2 }}
                      variant="rounded"
                    />
                  )}
                  <Button
                    variant="outlined"
                    component="label"
                    disabled={!isAdmin || isLoading}
                    sx={{ borderRadius: 2 }}
                  >
                    {listaProductosImagen ? 'Cambiar imagen' : 'Seleccionar imagen'}
                    <input
                      type="file"
                      hidden
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleListaProductosImagenChange}
                      disabled={!isAdmin || isLoading}
                    />
                  </Button>
                  {listaProductosImagen && (
                    <Button
                      variant="text"
                      color="error"
                      onClick={() => {
                        setListaProductosImagen(null);
                        setPreviewListaProductosImagen(configuracion?.listaProductosUrl || '');
                      }}
                    >
                      Quitar
                    </Button>
                  )}
                </Box>
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  Esta imagen se usa en Productos para el botón "Lista imagen". Formatos: JPEG, PNG, WEBP. Máx: 5MB
                </Typography>
              </Box>

              <Button
                type="submit"
                variant="contained"
                disabled={!isAdmin || isLoading || actualizarLoading}
                sx={{
                  alignSelf: 'flex-start',
                  background: 'linear-gradient(135deg, #8B0000 0%, #a52a2a 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #a52a2a 0%, #8B0000 100%)',
                    boxShadow: '0 4px 16px rgba(139, 0, 0, 0.4)',
                  },
                  borderRadius: 2,
                  px: 4,
                }}
              >
                {actualizarLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Guardar configuración'
                )}
              </Button>
            </Box>
          </form>
        </Paper>
      </motion.div>
    </Container>
  );
}