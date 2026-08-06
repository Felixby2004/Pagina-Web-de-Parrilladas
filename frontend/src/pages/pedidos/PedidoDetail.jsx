import { useParams, useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Chip,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { pedidoService } from '../../services/pedido.service';
import { formatCurrency, formatDate } from '../../utils/formateador';

import {
  PictureAsPdf,
  Image,
  Close,
  Download,
  ContentCopy,
} from '@mui/icons-material';
import { Edit, Delete } from '@mui/icons-material';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

import { configuracionService } from '../../services/configuracion.service';
import { NotaVenta } from '../../components/notas/NotaVenta';
import {
  generarPDF,
  generarImagen,
  copiarImagenAlPortapapeles,
} from '../../utils/pdfGenerator';
import { usePedidos } from '../../hooks/usePedidos';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export default function PedidoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notaRef = useRef();

  const [notaModalOpen, setNotaModalOpen] = useState(false);
  const [notaImagen, setNotaImagen] = useState(null);
  const [notaLoading, setNotaLoading] = useState(false);
  const [copiando, setCopiando] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data: pedido, isLoading, error } = useQuery({
    queryKey: ['pedido', id],
    queryFn: () => pedidoService.obtener(id),
  });

  const { data: configuracion } = useQuery({
    queryKey: ['configuracion'],
    queryFn: configuracionService.obtener,
    staleTime: 10 * 60 * 1000,
  });

  const { eliminar, eliminarLoading } = usePedidos();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (isLoading) return <Container sx={{ mt: 4 }}><Typography>Cargando...</Typography></Container>;
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">Error al cargar el pedido</Alert></Container>;
  if (!pedido) return <Container sx={{ mt: 4 }}><Alert severity="warning">Pedido no encontrado</Alert></Container>;

  const getEstadoColor = (estado) => {
    const colors = { ABIERTO: 'warning', PAGADO: 'success', CANCELADO: 'error' };
    return colors[estado] || 'default';
  };

  const getEstadoLabel = (estado) => {
    const labels = { ABIERTO: 'Abierto', PAGADO: 'Pagado', CANCELADO: 'Cancelado' };
    return labels[estado] || estado;
  };

  const detalles = pedido.detalles || [];
  const notas = pedido.notas || [];
  const notasObservaciones = notas.filter(n => n.tipo === 'OBSERVACION');
  const notasAdicionales = notas.filter(n => n.tipo === 'ADICIONAL');

  const handleGenerarPDF = async () => {
    if (!notaRef.current) return;
    setNotaLoading(true);
    try {
      await generarPDF(notaRef.current, `NotaVenta_${pedido.id}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setNotaLoading(false);
    }
  };

  const handleGenerarImagen = async () => {
    if (!notaRef.current) return;
    setNotaLoading(true);
    try {
      const imagen = await generarImagen(notaRef.current);
      if (imagen) {
        setNotaImagen(imagen);
        setNotaModalOpen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setNotaLoading(false);
    }
  };

  const handleCopiarImagen = async () => {
    if (!notaImagen) return;
    setCopiando(true);
    const ok = await copiarImagenAlPortapapeles(notaImagen);
    setCopiando(false);
    setSnackbar({
      open: true,
      severity: ok ? 'success' : 'error',
      message: ok
        ? 'La imagen se copió al portapapeles correctamente.'
        : 'No fue posible copiar la imagen al portapapeles.',
    });
  };

  const handleDescargarImagen = () => {
    if (!notaImagen) return;
    const link = document.createElement('a');
    link.href = notaImagen;
    link.download = `NotaVenta_${pedido.id}.png`;
    link.click();
  };

  const notaData = {
    ...pedido,
    detalles,
    notas,
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h4">Pedido #{pedido.id}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
            <Chip
              label={getEstadoLabel(pedido.estado)}
              color={getEstadoColor(pedido.estado)}
              size="medium"
            />
          </Box>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, my: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">Cliente</Typography>
                <Typography fontWeight={600}>{pedido.nombreCliente || 'Anónimo'}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarTodayOutlinedIcon color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">Fecha</Typography>
                <Typography fontWeight={600}>{formatDate(pedido.fecha)}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h6" gutterBottom>Detalles</Typography>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell align="center">Cantidad</TableCell>
              <TableCell align="center">Precio Unit.</TableCell>
              <TableCell align="center">Taper</TableCell>
              <TableCell align="center">Papa Frita</TableCell>
              <TableCell align="center">Subtotal</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {detalles.map((detalle) => (
              <TableRow key={detalle.id}>
                <TableCell>{detalle.producto?.nombre || 'Producto eliminado'}</TableCell>
                <TableCell align="center">{detalle.cantidad}</TableCell>
                <TableCell align="center">{formatCurrency(detalle.precioUnitario)}</TableCell>
                <TableCell align="center">
                  {detalle.usaTaper ? <CheckCircleIcon color="success" fontSize="small" /> : <CancelIcon color="disabled" fontSize="small" />}
                </TableCell>
                <TableCell align="center">
                  {detalle.usaPapaFrita ? <CheckCircleIcon color="success" fontSize="small" /> : <CancelIcon color="disabled" fontSize="small" />}
                </TableCell>
                <TableCell align="center">{formatCurrency(detalle.subtotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {notasAdicionales.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom>Productos adicionales</Typography>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">Cantidad</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell align="center">Precio</TableCell>
                  <TableCell align="center">Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notasAdicionales.map((nota) => (
                  <TableRow key={nota.id}>
                    <TableCell align="center">{nota.cantidad}</TableCell>
                    <TableCell>{nota.descripcion}</TableCell>
                    <TableCell align="center">{formatCurrency(nota.precio)}</TableCell>
                    <TableCell align="center">{formatCurrency(nota.subtotal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {notasObservaciones.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom>Observaciones</Typography>
          <Paper sx={{ p: 2, mb: 3, bgcolor: '#fafafa' }}>
            {notasObservaciones.map((nota) => (
              <Typography key={nota.id} variant="body2" sx={{ mb: 0.5 }}>• {nota.texto}</Typography>
            ))}
          </Paper>
        </>
      )}

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Total: {formatCurrency(pedido.total)}</Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
        <Button variant="outlined" onClick={() => navigate('/pedidos')}>Volver</Button>

        {(pedido.estado === 'ABIERTO' || pedido.estado === 'PAGADO') && (
          <>
            <Button
              variant="contained"
              color="error"
              startIcon={<PictureAsPdf />}
              onClick={handleGenerarPDF}
              disabled={notaLoading}
            >
              {notaLoading ? <CircularProgress size={22} color="inherit" /> : 'PDF'}
            </Button>
            <Button
              variant="contained"
              startIcon={<Image />}
              onClick={handleGenerarImagen}
              disabled={notaLoading}
            >
              {notaLoading ? <CircularProgress size={22} color="inherit" /> : 'Imagen'}
            </Button>
          </>
        )}
      </Box>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={async () => {
          try {
            await eliminar(pedido.id);
            navigate('/pedidos');
          } catch (err) {
            console.error('Error eliminando pedido', err);
          }
        }}
        title="Confirmar eliminación"
        message={`¿Estás seguro de eliminar el pedido #${pedido.id}?`}
        loading={eliminarLoading}
      />

      {/* Componente oculto para renderizar la nota de venta */}
      <Box sx={{ position: 'absolute', left: -9999, top: 0, opacity: 0, pointerEvents: 'none' }}>
        <NotaVenta ref={notaRef} pedido={notaData} configuracion={configuracion} />
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>

      {/* Modal para mostrar la imagen generada */}
      <Dialog
        open={notaModalOpen}
        onClose={() => setNotaModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Nota de Venta - Pedido #{pedido.id}
          <IconButton onClick={() => setNotaModalOpen(false)} sx={{ float: 'right' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', bgcolor: '#f5f5f5', overflow: 'auto' }}>
          {notaImagen && (
            <img
              src={notaImagen}
              alt="Nota de venta"
              style={{ maxWidth: '100%', height: 'auto', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2, p: 2 }}>
          <Button variant="outlined" startIcon={<Download />} onClick={handleDescargarImagen}>
            Descargar Imagen
          </Button>
          <Button
            variant="contained"
            startIcon={<ContentCopy />}
            onClick={handleCopiarImagen}
            disabled={copiando}
          >
            {copiando ? 'Copiando...' : 'Copiar Imagen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}