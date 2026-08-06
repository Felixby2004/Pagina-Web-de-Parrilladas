import { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Alert,
  Grid,
} from '@mui/material';
import { useAuthStore } from '../../store/authStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PasswordInput } from '../../components/common/PasswordInput';

const passwordSchema = z.object({
  contraseñaActual: z.string().min(1, 'La contraseña actual es obligatoria'),
  nuevaContraseña: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
  confirmarContraseña: z.string(),
}).refine(data => data.nuevaContraseña === data.confirmarContraseña, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmarContraseña'],
});

export default function Perfil() {
  const { usuario, cambiarPasswordPerfil, isLoading } = useAuthStore();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    const result = await cambiarPasswordPerfil(
      data.contraseñaActual,
      data.nuevaContraseña
    );
    if (result.success) {
      setSuccess('Contraseña actualizada exitosamente');
      reset();
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error || 'Error al actualizar contraseña');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: 600,
          fontSize: { xs: '1.5rem', md: '2rem' },
        }}
      >
        Mi Perfil
      </Typography>

      <Paper sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Información de usuario
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Nombre"
              value={usuario?.nombre || ''}
              disabled
              fullWidth
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Correo electrónico"
              value={usuario?.correo || ''}
              disabled
              fullWidth
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Rol"
              value={usuario?.rol || ''}
              disabled
              fullWidth
              variant="outlined"
              size="small"
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Cambiar contraseña
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          El correo electrónico no puede ser modificado
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            <PasswordInput
              label="Contraseña actual"
              name="contraseñaActual"
              register={register}
              error={errors.contraseñaActual}
              helperText={errors.contraseñaActual?.message}
              required
            />
            <PasswordInput
              label="Nueva contraseña"
              name="nuevaContraseña"
              register={register}
              error={errors.nuevaContraseña}
              helperText={errors.nuevaContraseña?.message}
              required
            />
            <PasswordInput
              label="Confirmar nueva contraseña"
              name="confirmarContraseña"
              register={register}
              error={errors.confirmarContraseña}
              helperText={errors.confirmarContraseña?.message}
              required
            />
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{ alignSelf: 'flex-start' }}
            >
              {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}