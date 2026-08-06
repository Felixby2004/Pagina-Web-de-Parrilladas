import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Typography, Box } from '@mui/material';
import { formatCurrency, formatDate } from '../../utils/formateador';

export const RecentOrders = ({ orders, loading = false }) => {
  if (loading) {
    return <Typography>Cargando pedidos...</Typography>;
  }

  if (!orders || orders.length === 0) {
    return <Typography color="textSecondary">No hay pedidos recientes</Typography>;
  }

  const getEstadoColor = (estado) => {
    const colors = { ABIERTO: 'warning', PAGADO: 'success', CANCELADO: 'error' };
    return colors[estado] || 'default';
  };

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Cliente</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.slice(0, 5).map((pedido) => (
            <TableRow key={pedido.id} hover>
              <TableCell>{pedido.nombreCliente || 'Anónimo'}</TableCell>
              <TableCell>{formatDate(pedido.fecha)}</TableCell>
              <TableCell>
                <Chip
                  label={pedido.estado}
                  color={getEstadoColor(pedido.estado)}
                  size="small"
                />
              </TableCell>
              <TableCell align="right">{formatCurrency(pedido.total)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};