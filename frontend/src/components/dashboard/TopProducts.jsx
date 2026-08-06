import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box } from '@mui/material';
import { formatCurrency } from '../../utils/formateador';

export const TopProducts = ({ products, loading = false }) => {
  if (loading) {
    return <Typography>Cargando productos...</Typography>;
  }

  if (!products || products.length === 0) {
    return <Typography color="textSecondary">No hay productos vendidos</Typography>;
  }

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Producto</TableCell>
            <TableCell align="right">Cantidad</TableCell>
            <TableCell align="right">Ingreso</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.slice(0, 5).map((item) => (
            <TableRow key={item.productoId} hover>
              <TableCell>{item.nombre}</TableCell>
              <TableCell align="right">{item.cantidad}</TableCell>
              <TableCell align="right">{formatCurrency(item.ingreso)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};