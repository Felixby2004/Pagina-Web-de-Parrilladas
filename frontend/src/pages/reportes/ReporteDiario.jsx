import { useState, useRef } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
} from '@mui/material';
import { Search, PictureAsPdf } from '@mui/icons-material';
import { reporteService } from '../../services/reporte.service';
import { generarPDF } from '../../utils/pdfGenerator';
import { ReporteDiarioPDF } from './ReporteDiarioPDF';
import { formatCurrency, getDateInTimeZoneISO } from '../../utils/formateador';

export default function ReporteDiario() {
  const [fecha, setFecha] = useState(getDateInTimeZoneISO());
  const [cargando, setCargando] = useState(false);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const pdfRef = useRef();

  const handleBuscar = async () => {
    if (!fecha) return;

    setCargando(true);
    setError(null);
    setData(null);

    try {
      const result = await reporteService.diario(fecha);
      if (!result || result.length === 0) {
        setError('No hay pedidos para la fecha seleccionada');
        setCargando(false);
        return;
      }
      setData(result);
    } catch (err) {
      console.error('Error al buscar:', err);
      setError('Error al obtener los pedidos');
    } finally {
      setCargando(false);
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

  const handleGenerarPDF = async () => {
    if (!data || data.length === 0) return;

    setGenerandoPDF(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      if (pdfRef.current) {
        await generarPDF(
          pdfRef.current,
          `ListaPedidos_${fecha}.pdf`
        );
      }
    } catch (err) {
      console.error('Error al generar PDF:', err);
      setError('Error al generar el PDF');
    } finally {
      setGenerandoPDF(false);
    }
  };

  const pedidosList = data
    ? data.flatMap(cliente =>
        cliente.pedidos.map(pedido => ({
          cliente: cliente.cliente,
          pedidoId: pedido.id,
          fecha: pedido.fecha,
          estado: pedido.estado,
          total: pedido.total,
        }))
      )
    : [];

  const fechaFormateada = fecha ? new Date(fecha).toLocaleDateString('es-PE') : '';

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Reporte de Pedidos por Fecha
      </Typography>

      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{
              alignItems: { xs: 'stretch', sm: 'center' },
            }}
          >
            <TextField
              label="Fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{
                minWidth: 220,
              }}
            />

            <Button
              variant="contained"
              startIcon={<Search />}
              onClick={handleBuscar}
              disabled={cargando}
              sx={{
                minWidth: 150,
                height: 56,
                borderRadius: 2,
                background:
                  'linear-gradient(135deg, #8B0000 0%, #a52a2a 100%)',
                '&:hover': {
                  background:
                    'linear-gradient(135deg, #a52a2a 0%, #8B0000 100%)',
                },
              }}
            >
              {cargando ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                'Buscar'
              )}
            </Button>

            {data && data.length > 0 && (
              <Button
                variant="contained"
                startIcon={<PictureAsPdf />}
                onClick={handleGenerarPDF}
                disabled={generandoPDF}
                sx={{
                  minWidth: 170,
                  height: 56,
                  borderRadius: 2,
                  background:
                    'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
                  '&:hover': {
                    background:
                      'linear-gradient(135deg, #b71c1c 0%, #d32f2f 100%)',
                  },
                }}
              >
                {generandoPDF ? (
                  <CircularProgress size={22} color="inherit" />
                ) : (
                  'Generar PDF'
                )}
              </Button>
            )}
          </Stack>
        </Stack>

        {error && (
          <Alert
            severity="info"
            sx={{
              mt: 3,
              borderRadius: 2,
            }}
          >
            {error}
          </Alert>
        )}
      </Paper>

      {/* Tabla de resultados */}
      {data && data.length > 0 && (
        <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><strong>Cliente</strong></TableCell>
                  <TableCell><strong>N° Pedido</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell align="right"><strong>Total</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pedidosList.map((item, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>{item.cliente}</TableCell>
                    <TableCell>#{item.pedidoId}</TableCell>
                    <TableCell>
                      <Chip
                        label={getEstadoLabel(item.estado)}
                        color={getEstadoColor(item.estado)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Componente oculto para el PDF */}
      <Box sx={{ position: 'absolute', left: -9999, top: 0, opacity: 0, pointerEvents: 'none' }}>
        {data && data.length > 0 && (
          <ReporteDiarioPDF
            ref={pdfRef}
            data={data}
            fecha={fecha}
          />
        )}
      </Box>
    </Container>
  );
}