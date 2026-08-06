import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Chip,
  Button,
  Divider,
  Alert,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { productoService } from '../../services/producto.service';
import { formatCurrency } from '../../utils/formateador';
import { Loading } from '../../components/common/Loading';
import { Edit } from '@mui/icons-material';

export default function ProductoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: producto, isLoading, error } = useQuery({
    queryKey: ['producto', id],
    queryFn: () => productoService.obtener(id),
  });

  if (isLoading) return <Loading />;
  if (error) return (
    <Container sx={{ mt: 4 }}>
      <Alert severity="error">Error al cargar el producto</Alert>
    </Container>
  );
  if (!producto) return (
    <Container sx={{ mt: 4 }}>
      <Alert severity="warning">Producto no encontrado</Alert>
    </Container>
  );

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            {producto.nombre}
          </Typography>
          <Chip
            label={producto.disponible ? 'Disponible' : 'No disponible'}
            color={producto.disponible ? 'success' : 'error'}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box display="flex" flexDirection="column" gap={2}>
          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              Descripción
            </Typography>
            <Typography variant="body1">
              {producto.descripcion || 'Sin descripción'}
            </Typography>
          </Box>

          <Box display="flex" gap={4} flexWrap="wrap">
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Precio
              </Typography>
              <Typography variant="h5" color="primary">
                {formatCurrency(producto.precio)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Tipo
              </Typography>
              <Chip label={producto.tipo} color="primary" variant="outlined" />
            </Box>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                ID
              </Typography>
              <Typography variant="body1">#{producto.id}</Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box display="flex" gap={2}>
          <Button variant="outlined" onClick={() => navigate('/productos')}>
            Volver
          </Button>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => navigate(`/productos/${producto.id}/editar`)}
            sx={{
              background: 'linear-gradient(135deg, #8B0000 0%, #a52a2a 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #a52a2a 0%, #8B0000 100%)',
              },
            }}
          >
            Editar
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}