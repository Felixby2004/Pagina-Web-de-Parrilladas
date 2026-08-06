import { Grid } from '@mui/material';
import { KpiCard } from './KpiCard';
import { formatCurrency } from '../../utils/formateador';
import { RestaurantMenu, Receipt, Today, AttachMoney } from '@mui/icons-material';

export const DashboardStats = ({ stats, loading = false }) => {
  const cards = [
    {
      title: 'Productos',
      value: stats.totalProductos || 0,
      icon: <RestaurantMenu sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      bg: 'rgba(25, 118, 210, 0.08)',
    },
    {
      title: 'Total Pedidos',
      value: stats.totalPedidos || 0,
      icon: <Receipt sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      bg: 'rgba(46, 125, 50, 0.08)',
    },
    {
      title: 'Pedidos Hoy',
      value: stats.pedidosHoy || 0,
      icon: <Today sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      bg: 'rgba(237, 108, 2, 0.08)',
    },
    {
      title: 'Ingreso Hoy',
      value: formatCurrency(stats.ingresoHoy || 0),
      icon: <AttachMoney sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
      bg: 'rgba(211, 47, 47, 0.08)',
    },
  ];

  return (
    <Grid container spacing={2}>
      {cards.map((card, index) => (
        <Grid
          item
          key={index}
          xs={12}
          sm={6}
          md={6}
          lg={3}
          xl={3}
        >
          <KpiCard {...card} loading={loading} />
        </Grid>
      ))}
    </Grid>
  );
};