import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
  IconButton,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import { Add, Visibility, Edit, Delete, Search, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePedidos } from '../../hooks/usePedidos';
import { formatCurrency, formatDate } from '../../utils/formateador';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Loading } from '../../components/common/Loading';

const estados = ['ABIERTO', 'PAGADO', 'CANCELADO'];

export default function PedidosList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);

  const { pedidos, paginacion, isLoading, eliminar, eliminarLoading } = usePedidos({
    page: page + 1,
    limit: rowsPerPage,
    search,
    estado,
  });

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = () => {
    if (selectedPedido) {
      eliminar(selectedPedido.id);
      setDeleteDialogOpen(false);
      setSelectedPedido(null);
    }
  };

  const getEstadoColor = (estado) => {
    const colors = {
      ABIERTO: 'warning',
      PAGADO: 'success',
      CANCELADO: 'error',
    };
    return colors[estado] || 'default';
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      ABIERTO: 'Abierto',
      PAGADO: 'Pagado',
      CANCELADO: 'Cancelado',
    };
    return labels[estado] || estado;
  };

  const handleClearFilters = () => {
    setSearch('');
    setEstado('');
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          alignItems: 'center',
          gap: 2,
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            fontSize: { xs: '1.5rem', md: '2rem' },
          }}
        >
          Pedidos
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/pedidos/nuevo')}
          sx={{
            whiteSpace: 'nowrap',
            background: 'linear-gradient(135deg, #8B0000 0%, #a52a2a 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #a52a2a 0%, #8B0000 100%)',
            },
          }}
        >
          Nuevo Pedido
        </Button>
      </Box>

      <Paper sx={{ p: { xs: 2, md: 2.5 }, mb: 3, borderRadius: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'minmax(220px, 2fr) 180px auto',
            },
            alignItems: 'end',
          }}
        >
          <TextField
            label="Buscar"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            fullWidth
          />
          <FormControl size="small" fullWidth>
            <InputLabel>Estado</InputLabel>
            <Select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              label="Estado"
            >
              <MenuItem value="">Todos</MenuItem>
              {estados.map((e) => (
                <MenuItem key={e} value={e}>{getEstadoLabel(e)}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton
            onClick={handleClearFilters}
            color="primary"
            sx={{ alignSelf: 'center', justifySelf: { xs: 'start', lg: 'center' } }}
          >
            <Refresh />
          </IconButton>
        </Box>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pedidos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body1" color="textSecondary" sx={{ py: 4 }}>
                    No hay pedidos registrados
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              pedidos.map((pedido) => (
                <TableRow key={pedido.id} hover>
                  <TableCell>#{pedido.id}</TableCell>
                  <TableCell>{pedido.nombreCliente || 'Anónimo'}</TableCell>
                  <TableCell>{formatDate(pedido.fecha)}</TableCell>
                  <TableCell>
                    <Chip
                      label={getEstadoLabel(pedido.estado)}
                      color={getEstadoColor(pedido.estado)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">{formatCurrency(pedido.total)}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/pedidos/${pedido.id}`)}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                    {pedido.estado === 'ABIERTO' && (
                      <>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/pedidos/${pedido.id}/editar`)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setSelectedPedido(pedido);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={paginacion.total || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </TableContainer>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que deseas eliminar el pedido de "${selectedPedido?.nombreCliente || 'Anónimo'}"?`}
        loading={eliminarLoading}
      />
    </Container>
  );
}