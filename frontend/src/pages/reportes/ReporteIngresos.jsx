import { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { Search, BarChart as BarChartIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { reporteService } from '../../services/reporte.service';
import { getDateInTimeZoneISO } from '../../utils/formateador';
import { formatCurrency } from '../../utils/formateador';
import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ReporteIngresos() {
  const hoy = getDateInTimeZoneISO();
  const [fechaInicio, setFechaInicio] = useState(hoy);
  const [fechaFin, setFechaFin] = useState(hoy);
  const [buscar, setBuscar] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['reporte-ingresos', fechaInicio, fechaFin],
    queryFn: () => reporteService.ingresos(fechaInicio, fechaFin),
    enabled: buscar,
    staleTime: 5 * 60 * 1000,
  });

  const handleBuscar = () => {
    setBuscar(true);
    refetch();
  };

  // Preparar datos para la gráfica
  const chartData = {
    labels: data?.map(item => item.cliente) || [],
    datasets: [
      {
        label: 'Ingreso Total',
        data: data?.map(item => item.ingresoTotal) || [],
        backgroundColor: 'rgba(139, 0, 0, 0.6)',
        borderColor: '#8B0000',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Ingresos por Cliente',
      },
    },
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Reporte de Ingresos por Cliente
      </Typography>

      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4, borderRadius: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(3, minmax(0, 1fr))',
            },
            alignItems: 'end',
          }}
        >
          <TextField
            label="Fecha inicio"
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Fecha fin"
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <Button
            variant="contained"
            startIcon={<Search />}
            onClick={handleBuscar}
            disabled={isLoading}
            fullWidth
            sx={{
              background: 'linear-gradient(135deg, #8B0000 0%, #a52a2a 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #a52a2a 0%, #8B0000 100%)',
              },
              borderRadius: 2,
              px: 4,
              minHeight: 56,
            }}
          >
            Buscar
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          Error al cargar el reporte: {error.message}
        </Alert>
      )}

      {isLoading ? (
        <Typography>Cargando reporte...</Typography>
      ) : data && data.length > 0 ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 3, p: 2 }}>
              <Chart type="bar" data={chartData} options={options} />
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resumen
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Cliente</TableCell>
                        <TableCell align="right">Pedidos</TableCell>
                        <TableCell align="right">Ingreso</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.cliente}</TableCell>
                          <TableCell align="right">{item.cantidadPedidos}</TableCell>
                          <TableCell align="right">{formatCurrency(item.ingresoTotal)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={2} align="right">
                          <strong>Total</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>
                            {formatCurrency(data.reduce((sum, item) => sum + item.ingresoTotal, 0))}
                          </strong>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : buscar && (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          No hay datos para el rango de fechas seleccionado.
        </Alert>
      )}
    </Container>
  );
}