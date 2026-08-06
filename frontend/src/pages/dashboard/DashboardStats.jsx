import { Grid } from '@mui/material';
import { KpiCard } from './KpiCard';
import { formatCurrency } from '../../utils/formateador';

export const DashboardStats = ({ stats, loading = false }) => {
  const cards = [
    {
      title: 'Productos',
      value: stats.totalProductos || 0,
      icon: '🍖',
      color: '#1976d2',
    },
    {
      title: 'Total Pedidos',
      value: stats.totalPedidos || 0,
      icon: '📋',
      color: '#2e7d32',
    },
    {
      title: 'Pedidos Hoy',
      value: stats.pedidosHoy || 0,
      icon: '🛒',
      color: '#ed6c02',
    },
    {
      title: 'Ingreso Hoy',
      value: formatCurrency(stats.ingresoHoy || 0),
      icon: '💰',
      color: '#d32f2f',
    },
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <KpiCard
            title={card.title}
            value={card.value}
            icon={<span style={{ fontSize: 40 }}>{card.icon}</span>}
            color={card.color}
            loading={loading}
          />
        </Grid>
      ))}
    </Grid>
  );
};