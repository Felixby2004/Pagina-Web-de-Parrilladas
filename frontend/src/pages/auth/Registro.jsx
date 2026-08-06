import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
import { registroSchema } from '../../validators';
import { PasswordInput } from '../../components/common/PasswordInput';

export default function Registro() {
  const navigate = useNavigate();
  const { registrar, isLoading, error, clearError } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registroSchema),
  });

  const onSubmit = async (data) => {
    const result = await registrar(data);
    if (result.success) {
      navigate('/verificar', { state: { correo: data.correo } });
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 2, borderRadius: 2 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom sx={{ fontWeight: 600 }}>
          Registro
        </Typography>
        {error && (
          <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Nombre"
            autoFocus
            {...register('nombre')}
            error={!!errors.nombre}
            helperText={errors.nombre?.message}
          />
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
          <PasswordInput
            label="Contraseña"
            name="contraseña"
            register={register}
            error={errors.contraseña}
            helperText={errors.contraseña?.message}
            required
            margin="normal"
          />
          <PasswordInput
            label="Confirmar contraseña"
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
            disabled={isLoading}
          >
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </Button>
          <Box sx={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" variant="body2">
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}