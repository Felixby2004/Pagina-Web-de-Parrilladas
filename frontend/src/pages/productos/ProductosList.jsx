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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  InputAdornment,
  IconButton,
  Chip,
  Box,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Refresh,
  ContentCopy,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useProductos } from '../../hooks/useProductos';
import { useConfiguracion } from '../../hooks/useConfiguracion';
import { useSnackbar } from '../../hooks/useSnackbar';
import { formatCurrency } from '../../utils/formateador';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Loading } from '../../components/common/Loading';
import { configuracionService } from '../../services/configuracion.service.js';

const tipos = ['PLATO', 'TAPER', 'PAPA_FRITA'];

export default function ProductosList() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [tipo, setTipo] = useState('');
  const [sort, setSort] = useState('nombre');
  const [order, setOrder] = useState('asc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [copyingListaImagen, setCopyingListaImagen] = useState(false);

  const { productos, paginacion, isLoading, eliminar, eliminarLoading } = useProductos({
    page: page + 1,
    limit: rowsPerPage,
    search,
    tipo,
    sort,
    order,
  });

  const { configuracion } = useConfiguracion();

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCopyListaImagen = async () => {
    const url = configuracion?.listaProductosUrl;
    if (!url) {
      showSnackbar('No hay una imagen de lista configurada en Configuración del negocio', 'warning');
      return;
    }

    setCopyingListaImagen(true);
    try {
      const blob = await configuracionService.obtenerListaProductosImagen();

      if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
        throw new Error('ClipboardItem no disponible');
      }

      await navigator.clipboard.write([
        new ClipboardItem({
          ['image/png']: blob,
        }),
      ]);
      showSnackbar('Imagen copiada al portapapeles', 'success');
    } catch {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(url);
          showSnackbar('No se pudo copiar como imagen. Se copió el enlace.', 'warning');
          return;
        }
      } catch {
        // noop
      }
      window.open(url, '_blank', 'noopener,noreferrer');
      showSnackbar('No se pudo copiar. Se abrió la imagen en otra pestaña.', 'info');
    } finally {
      setCopyingListaImagen(false);
    }
  };

  const handleDelete = () => {
    if (selectedProducto) {
      eliminar(selectedProducto.id);
      setDeleteDialogOpen(false);
      setSelectedProducto(null);
    }
  };

  const getTipoColor = (tipo) => {
    const colors = {
      PLATO: 'primary',
      TAPER: 'secondary',
      PAPA_FRITA: 'warning',
    };
    return colors[tipo] || 'default';
  };

  const handleClearFilters = () => {
    setSearch('');
    setTipo('');
    setSort('nombre');
    setOrder('asc');
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
          gutterBottom
          sx={{
            fontWeight: 600,
            fontSize: { xs: '1.5rem', md: '2rem' },
          }}
        >
          Productos
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<ContentCopy />}
            onClick={handleCopyListaImagen}
            disabled={copyingListaImagen}
            sx={{ whiteSpace: 'nowrap' }}
          >
            {copyingListaImagen ? 'Copiando...' : 'Lista imagen'}
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/productos/nuevo')}
            sx={{
              whiteSpace: 'nowrap',
              background: 'linear-gradient(135deg, #8B0000 0%, #a52a2a 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #a52a2a 0%, #8B0000 100%)',
              },
            }}
          >
            Nuevo Producto
          </Button>
        </Box>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: { xs: 2, md: 2.5 }, mb: 3, borderRadius: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'minmax(220px, 2fr) repeat(3, minmax(140px, 1fr)) auto',
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
            <InputLabel>Tipo</InputLabel>
            <Select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              label="Tipo"
            >
              <MenuItem value="">Todos</MenuItem>
              {tipos.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>Ordenar por</InputLabel>
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              label="Ordenar por"
            >
              <MenuItem value="nombre">Nombre</MenuItem>
              <MenuItem value="precio">Precio</MenuItem>
              <MenuItem value="tipo">Tipo</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>Orden</InputLabel>
            <Select
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              label="Orden"
            >
              <MenuItem value="asc">Asc</MenuItem>
              <MenuItem value="desc">Desc</MenuItem>
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

      {/* Tabla */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell align="right">Precio</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1" color="textSecondary" sx={{ py: 4 }}>
                    No hay productos registrados
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              productos.map((producto) => (
                <TableRow key={producto.id} hover>
                  <TableCell>{producto.nombre}</TableCell>
                  <TableCell>{producto.descripcion || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={producto.tipo}
                      color={getTipoColor(producto.tipo)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">{formatCurrency(producto.precio)}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/productos/${producto.id}/editar`, { state: { producto } })}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setSelectedProducto(producto);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
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

      {/* Diálogo de confirmación de eliminación */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que deseas eliminar el producto "${selectedProducto?.nombre}"? Esta acción no se puede deshacer.`}
        loading={eliminarLoading}
      />
    </Container>
  );
}