import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useProductos } from '../../hooks/useProductos';
import { productoService } from '../../services/producto.service';
import { productoSchema } from '../../validators';
import { Loading } from '../../components/common/Loading';

export default function ProductoForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEdit = !!id;
  const { crearAsync, actualizarAsync, crearLoading, actualizarLoading } = useProductos();
  const productoInicial = location.state?.producto;

  const productoQuery = useQuery({
    queryKey: ['producto', id],
    queryFn: () => productoService.obtener(id),
    enabled: isEdit && !!id,
    initialData: productoInicial,
    staleTime: 5 * 60 * 1000,
  });

  const producto = productoQuery.data;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      precio: '0.00',
      tipo: 'PLATO',
      disponible: true,
    },
  });

  const tipo = watch('tipo');

  // Cargar producto si es edición
  useEffect(() => {
    if (producto && isEdit) {
      reset({
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        precio: Number(producto.precio).toFixed(2),
        tipo: producto.tipo,
        disponible: producto.disponible,
      });
    }
  }, [producto, isEdit, reset]);

  const onSubmit = async (data) => {
    if (isEdit) await actualizarAsync({ id, data });
    else await crearAsync(data);
    navigate('/productos');
  };

  if (productoQuery.isLoading && isEdit) {
    return <Loading />;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
      </Typography>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Nombre"
              fullWidth
              {...register('nombre')}
              error={!!errors.nombre}
              helperText={errors.nombre?.message}
            />
            <TextField
              label="Descripción"
              fullWidth
              multiline
              rows={3}
              {...register('descripcion')}
              error={!!errors.descripcion}
              helperText={errors.descripcion?.message}
            />
            <TextField
              label="Precio"
              type="number"
              fullWidth
              slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              {...register('precio')}
              error={!!errors.precio}
              helperText={errors.precio?.message}
            />
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                label="Tipo"
                value={tipo}
                onChange={(e) => setValue('tipo', e.target.value)}
                error={!!errors.tipo}
              >
                <MenuItem value="PLATO">PLATO</MenuItem>
                <MenuItem value="TAPER">TAPER</MenuItem>
                <MenuItem value="PAPA_FRITA">PAPA FRITA</MenuItem>
              </Select>
              {errors.tipo && (
                <Typography variant="caption" color="error">
                  {errors.tipo.message}
                </Typography>
              )}
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={watch('disponible')}
                  onChange={(e) => setValue('disponible', e.target.checked)}
                />
              }
              label="Disponible"
            />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => navigate('/productos')}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={crearLoading || actualizarLoading}
                sx={{
                  background: 'linear-gradient(135deg, #8B0000 0%, #a52a2a 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #a52a2a 0%, #8B0000 100%)',
                  },
                }}
              >
                {crearLoading || actualizarLoading ? 'Guardando...' : 'Guardar'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}
