import { useState, useEffect } from 'react';
import { Container, Box, Typography, Grid, Paper } from '@mui/material';
import { useAuthStore } from '../../store/authStore';
import { productoService } from '../../services/producto.service';
import { pedidoService } from '../../services/pedido.service';
import { DashboardStats } from '../../components/dashboard/DashboardStats';
import { RecentOrders } from '../../components/dashboard/RecentOrders';
import { TopProducts } from '../../components/dashboard/TopProducts';
import { SalesChart } from '../../components/dashboard/SalesChart';
import { getDateInTimeZoneISO } from '../../utils/formateador';
import { Loading } from '../../components/common/Loading';

export default function Dashboard() {
  const { usuario } = useAuthStore();
  const [stats, setStats] = useState({
    totalProductos: 0,
    totalPedidos: 0,
    pedidosHoy: 0,
    ingresoHoy: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const pedidosSinCancelados = (pedidos = []) => pedidos.filter(p => p.estado !== 'CANCELADO');

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        const [productos, pedidos] = await Promise.all([
          productoService.listar({ limit: 100 }),
          pedidoService.listar({ limit: 100 }),
        ]);

        const pedidosValidos = pedidosSinCancelados(pedidos.data || []);
        const hoy = getDateInTimeZoneISO();
        const pedidosHoy = pedidosValidos.filter(p => {
          const fechaStr = new Date(p.fecha).toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
          return fechaStr === hoy;
        });
        const ingresoHoy = pedidosHoy.reduce((sum, p) => sum + Number(p.total || 0), 0);

        setStats({
          totalProductos: productos.paginacion?.total || 0,
          totalPedidos: pedidos.paginacion?.total || 0,
          pedidosHoy: pedidosHoy.length,
          ingresoHoy,
        });

        // Pedidos recientes
        setRecentOrders(pedidos.data?.slice(0, 5) || []);

        // Datos para el gráfico (Semana actual: Lunes -> Domingo en hora de Perú)
        const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        const [year, month, day] = getDateInTimeZoneISO(new Date()).split('-').map(Number);
        const hoyLima = new Date(Date.UTC(year, month - 1, day));
        // Trabajar siempre con UTC evita que la semana cambie por la zona local del navegador.
        const diffToMonday = (hoyLima.getUTCDay() + 6) % 7;
        const monday = new Date(hoyLima);
        monday.setUTCDate(hoyLima.getUTCDate() - diffToMonday);

        const ingresos = dias.map((_, i) => {
          const fecha = new Date(monday);
          fecha.setUTCDate(monday.getUTCDate() + i);
          const fechaStr = fecha.toISOString().slice(0, 10);
          const pedidosDia = pedidosValidos.filter(p => {
            const f = new Date(p.fecha).toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
            return f === fechaStr;
          });
          return pedidosDia.reduce((sum, p) => sum + Number(p.total || 0), 0);
        });
        setChartData(ingresos);

        // Top productos (simulado desde pedidos)
        const productosMap = {};
        pedidosValidos.forEach(p => {
          p.detalles?.forEach(d => {
            const nombre = d.producto?.nombre || 'Producto';
            if (!productosMap[nombre]) {
              productosMap[nombre] = { productoId: d.productoId, nombre, cantidad: 0, ingreso: 0 };
            }
            productosMap[nombre].cantidad += d.cantidad;
            productosMap[nombre].ingreso += Number(d.subtotal || 0);
          });
        });
        const top = Object.values(productosMap).sort((a, b) => b.cantidad - a.cantidad);
        setTopProducts(top);

      } catch (error) {
        console.error('Error cargando dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDashboard();
  }, []);

  return (
    <Container maxWidth="xl">
      <Box mb={4}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 600,
            fontSize: { xs: '1.5rem', md: '2rem' },
          }}
        >
          Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Bienvenido, {usuario?.nombre || 'Usuario'}
        </Typography>
      </Box>

      {/* KPI Cards */}
      <DashboardStats stats={stats} loading={loading} />

      {/* Gráfico y Top Productos */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <SalesChart data={chartData} loading={loading} />
        </Grid>
      </Grid>
    </Container>
  );
}