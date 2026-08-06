import { useState } from 'react';
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
import { recuperarSchema } from '../../validators';

export default function Recuperar() {
  const navigate = useNavigate();
  const { solicitarRecuperacion, isLoading, error, clearError } = useAuthStore();
  const [exito, setExito] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(recuperarSchema),
  });

  const onSubmit = async (data) => {
    const result = await solicitarRecuperacion(data.correo);
    if (result.success) {
      setExito(true);
      setTimeout(() => {
        navigate('/cambiar-password', { state: { correo: data.correo } });
      }, 2000);
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Recuperar Contraseña
        </Typography>
        <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 2 }}>
          Ingresa tu correo y te enviaremos un código de recuperación
        </Typography>
        {error && (
          <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {exito && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Se ha enviado un código a tu correo. Redirigiendo...
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Correo electrónico"
            autoComplete="email"
            autoFocus
            {...register('correo')}
            error={!!errors.correo}
            helperText={errors.correo?.message}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading || exito}
          >
            {isLoading ? 'Enviando...' : 'Enviar código'}
          </Button>
          <Box sx={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Recordé mi contraseña, volver al inicio
            </Link>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}