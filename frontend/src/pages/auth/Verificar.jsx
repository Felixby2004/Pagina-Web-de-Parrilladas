import { useState, useEffect } from 'react';
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
import { verificarSchema } from '../../validators';

export default function Verificar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verificar, reenviarVerificacion, isLoading, error, clearError } = useAuthStore();
  const [reenvioExitoso, setReenvioExitoso] = useState(false);
  const correo = location.state?.correo || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(verificarSchema),
    defaultValues: { correo },
  });

  const onSubmit = async (data) => {
    const result = await verificar(data.correo, data.codigo);
    if (result.success) {
      navigate('/login', { state: { mensaje: 'Cuenta verificada exitosamente' } });
    }
  };

  const handleReenviar = async () => {
    const result = await reenviarVerificacion(correo);
    if (result.success) {
      setReenvioExitoso(true);
      setTimeout(() => setReenvioExitoso(false), 5000);
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Verificar Cuenta
        </Typography>
        <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 2 }}>
          Ingresa el código de 6 dígitos que enviamos a tu correo
        </Typography>
        {error && (
          <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {reenvioExitoso && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Se ha reenviado un nuevo código a tu correo
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
            label="Código de verificación"
            placeholder=". . . . . ."
            {...register('codigo')}
            error={!!errors.codigo}
            helperText={errors.codigo?.message}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 1 }}
            disabled={isLoading}
          >
            {isLoading ? 'Verificando...' : 'Verificar'}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            sx={{ mt: 1, mb: 2 }}
            onClick={handleReenviar}
            disabled={isLoading}
          >
            Reenviar código
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