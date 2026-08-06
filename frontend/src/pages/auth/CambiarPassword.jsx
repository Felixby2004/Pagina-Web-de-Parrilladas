import { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  Alert,
  Paper,
} from '@mui/material';
import { useAuthStore } from '../../store/authStore';
import { cambiarPasswordSchema } from '../../validators';
import { PasswordInput } from '../../components/common/PasswordInput';

export default function CambiarPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cambiarPasswordRecuperacion, isLoading, error, clearError } = useAuthStore();
  const [exito, setExito] = useState(false);
  const correo = location.state?.correo || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(cambiarPasswordSchema),
    defaultValues: { correo },
  });

  const onSubmit = async (data) => {
    const result = await cambiarPasswordRecuperacion(
      data.correo,
      data.codigo,
      data.nuevaContraseña
    );
    if (result.success) {
      setExito(true);
      setTimeout(() => {
        navigate('/login', { state: { mensaje: 'Contraseña actualizada exitosamente' } });
      }, 2000);
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Cambiar Contraseña
        </Typography>
        <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 2 }}>
          Ingresa el código que recibiste en tu correo y tu nueva contraseña
        </Typography>
        {error && (
          <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {exito && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Contraseña actualizada correctamente. Redirigiendo...
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Correo electrónico"
            autoComplete="email"
            {...register('correo')}
            error={!!errors.correo}
            helperText={errors.correo?.message}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Código de recuperación"
            placeholder="123456"
            {...register('codigo')}
            error={!!errors.codigo}
            helperText={errors.codigo?.message}
          />

          <PasswordInput
            label="Nueva contraseña"
            name="nuevaContraseña"
            register={register}
            error={errors.nuevaContraseña}
            helperText={errors.nuevaContraseña?.message}
            required
            margin="normal"
          />

          <PasswordInput
            label="Confirmar nueva contraseña"
            name="confirmarContraseña"
            register={register}
            error={errors.confirmarContraseña}
            helperText={errors.confirmarContraseña?.message}
            required
            margin="normal"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading || exito}
          >
            {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
          </Button>
          <Box sx={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Volver al inicio de sesión
            </Link>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}