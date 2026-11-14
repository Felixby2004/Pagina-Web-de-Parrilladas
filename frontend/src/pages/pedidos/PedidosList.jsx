import { useState } from 'react';
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
  Checkbox,
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
import { ESTADOS_PEDIDO } from '../../utils/constants';

const estados = Object.values(ESTADOS_PEDIDO);

export default function PedidosList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [seleccion, setSeleccion] = useState(() => new Map());

  const {
    pedidos,
    paginacion,
    isLoading,
    eliminar,
    eliminarLoading,
    actualizarEstados,
    actualizarEstadosLoading,
  } = usePedidos({
    page: page + 1,
    limit: rowsPerPage,
    search,
    estado,
  });

  const seleccionadosEnPagina = pedidos.filter(({ id }) => seleccion.has(id)).length;
  const todaLaPaginaSeleccionada = pedidos.length > 0 && seleccionadosEnPagina === pedidos.length;
  const cambios = [...seleccion]
    .filter(([, estado]) => estado !== null)
    .map(([id, estado]) => ({ id, estado }));

  const cambiarSeleccion = (ids, seleccionados) => {
    setSeleccion((anterior) => {
      const siguiente = new Map(anterior);
      ids.forEach((id) => {
        if (!seleccionados) siguiente.delete(id);
        else if (!siguiente.has(id)) siguiente.set(id, null);
      });
      return siguiente;
    });
  };

  const aplicarEstado = (nuevoEstado) => {
    setSeleccion((anterior) => new Map([...anterior.keys()].map((id) => [id, nuevoEstado])));
  };

  const guardarEstados = async () => {
    try {
      await actualizarEstados(cambios);
      setSeleccion(new Map());
      setPage(0);
    } catch {
      // El aviso de error se muestra desde usePedidos y los cambios quedan disponibles.
    }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = () => {
    if (selectedPedido) {
      const { id } = selectedPedido;
      eliminar(id, { onSuccess: () => cambiarSeleccion([id], false) });
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
    setPage(0);
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
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
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
            <InputLabel id="filtro-estado-label">Estado</InputLabel>
            <Select
              labelId="filtro-estado-label"
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value);
                setPage(0);
              }}
              label="Estado"
            >
              <MenuItem value="">Todos</MenuItem>
              {estados.map((e) => (
                <MenuItem key={e} value={e}>{getEstadoLabel(e)}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton
            aria-label="Limpiar filtros"
            onClick={handleClearFilters}
            color="primary"
            sx={{ alignSelf: 'center', justifySelf: { xs: 'start', lg: 'center' } }}
          >
            <Refresh />
          </IconButton>
        </Box>
      </Paper>

      {seleccion.size > 0 && (
        <Paper sx={{ p: 2, mb: 2, borderRadius: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography aria-live="polite">
            {seleccion.size === 1 ? '1 pedido seleccionado' : `${seleccion.size} pedidos seleccionados`}
          </Typography>
          <FormControl size="small" sx={{ minWidth: 190 }}>
            <InputLabel id="estado-seleccion-label">Estado de la selección</InputLabel>
            <Select
              labelId="estado-seleccion-label"
              label="Estado de la selección"
              value=""
              disabled={actualizarEstadosLoading}
              onChange={(e) => aplicarEstado(e.target.value)}
            >
              {estados.map((e) => (
                <MenuItem key={e} value={e}>{getEstadoLabel(e)}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            disabled={cambios.length === 0 || actualizarEstadosLoading}
            onClick={guardarEstados}
          >
            {actualizarEstadosLoading ? 'Guardando…' : `Guardar estados (${cambios.length})`}
          </Button>
          <Button disabled={actualizarEstadosLoading} onClick={() => setSeleccion(new Map())}>
            Limpiar selección
          </Button>
        </Paper>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={todaLaPaginaSeleccionada}
                  indeterminate={seleccionadosEnPagina > 0 && !todaLaPaginaSeleccionada}
                  disabled={!pedidos.length || actualizarEstadosLoading}
                  onChange={(_, checked) => cambiarSeleccion(pedidos.map(({ id }) => id), checked)}
                  slotProps={{ input: { 'aria-label': 'Seleccionar todos los pedidos de esta página' } }}
                />
              </TableCell>
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
                  {isLoading ? <Loading size={28} /> : (
                    <Typography variant="body1" color="textSecondary" sx={{ py: 4 }}>
                      No hay pedidos registrados
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              pedidos.map((pedido) => (
                <TableRow key={pedido.id} hover selected={seleccion.has(pedido.id)}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={seleccion.has(pedido.id)}
                      disabled={actualizarEstadosLoading}
                      onChange={(_, checked) => cambiarSeleccion([pedido.id], checked)}
                      slotProps={{ input: { 'aria-label': `Seleccionar pedido #${pedido.id}` } }}
                    />
                  </TableCell>
                  <TableCell>#{pedido.id}</TableCell>
                  <TableCell>{pedido.nombreCliente || 'Anónimo'}</TableCell>
                  <TableCell>{formatDate(pedido.fecha)}</TableCell>
                  <TableCell>
                    {seleccion.has(pedido.id) ? (
                      <Select
                        size="small"
                        value={seleccion.get(pedido.id) ?? pedido.estado}
                        disabled={actualizarEstadosLoading}
                        inputProps={{ 'aria-label': `Estado del pedido #${pedido.id}` }}
                        onChange={(e) => setSeleccion((anterior) =>
                          new Map(anterior).set(pedido.id, e.target.value === pedido.estado ? null : e.target.value)
                        )}
                      >
                        {estados.map((e) => (
                          <MenuItem key={e} value={e}>{getEstadoLabel(e)}</MenuItem>
                        ))}
                      </Select>
                    ) : (
                      <Chip
                        label={getEstadoLabel(pedido.estado)}
                        color={getEstadoColor(pedido.estado)}
                        size="small"
                      />
                    )}
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
                          disabled={actualizarEstadosLoading}
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
          page={paginacion.totalPages ? Math.min(page, paginacion.totalPages - 1) : 0}
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
