import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Container,
  Typography,
  Button,
  Box,
  Link,
  Alert,
  Paper,
  TextField,
} from '@mui/material';
import { useAuthStore } from '../../store/authStore';
import { loginSchema } from '../../validators';
import { PasswordInput } from '../../components/common/PasswordInput';
import CircularProgress from "@mui/material/CircularProgress";

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    const result = await login(data.correo, data.contraseña);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, borderRadius: 2 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom sx={{ fontWeight: 600 }}>
          Iniciar Sesión
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
            label="Correo electrónico"
            autoComplete="email"
            autoFocus
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
            autoComplete="current-password"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <CircularProgress
                  size={20}
                  color="inherit"
                  sx={{ mr: 1 }}
                />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
            <Link component={RouterLink} to="/registro" variant="body2">
              ¿No tienes cuenta? Regístrate
            </Link>
            <Link component={RouterLink} to="/recuperar" variant="body2">
              ¿Olvidaste tu contraseña?
            </Link>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}