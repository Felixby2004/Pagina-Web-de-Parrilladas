import { forwardRef } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider } from '@mui/material';
import { formatCurrency, formatDate } from '../../utils/formateador';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

export const NotaVenta = forwardRef(({ pedido, configuracion }, ref) => {
  const { nombreNegocio, logoUrl } = configuracion || {};

  const productos = pedido?.detalles?.map(d => ({
    nombre: d.producto?.nombre || 'Producto eliminado',
    cantidad: d.cantidad,
    precio: Number(d.precioUnitario),
    taper: d.usaTaper,
    papaFrita: d.usaPapaFrita,
    subtotal: Number(d.subtotal),
  })) || [];

  const notasAdicionales = pedido?.notas?.filter(n => n.tipo === 'ADICIONAL').map(n => ({
    nombre: n.descripcion || 'Adicional',
    cantidad: Number(n.cantidad || 0),
    precio: Number(n.precio || 0),
    taper: false,
    papaFrita: false,
    subtotal: Number(n.subtotal || 0),
  })) || [];

  const todosProductos = [...productos, ...notasAdicionales];
  const observaciones = pedido?.notas?.filter(n => n.tipo === 'OBSERVACION').map(n => n.texto) || [];

  return (
    <Box ref={ref} sx={{ p: 4, maxWidth: 800, mx: 'auto', bgcolor: '#fff', fontFamily: 'Arial, sans-serif' }}>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Logo"
              style={{ height: 60, objectFit: 'contain' }}
            />
          )}
          <Typography variant="h5" fontWeight="bold">
            {nombreNegocio || 'Mi Negocio'}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Datos del pedido */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="body2"><strong>N° Pedido:</strong> #{pedido.id}</Typography>
          <Typography variant="body2"><strong>Cliente:</strong> {pedido.nombreCliente || 'Anónimo'}</Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2"><strong>Fecha:</strong> {formatDate(pedido.fecha)}</Typography>
        </Box>
      </Box>

      {/* Tabla de productos */}
      <TableContainer sx={{ my: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell><strong>Cant</strong></TableCell>
              <TableCell><strong>Descripción</strong></TableCell>
              <TableCell align="center"><strong>Taper</strong></TableCell>
              <TableCell align="center"><strong>P. Frita</strong></TableCell>
              <TableCell align="right"><strong>Precio</strong></TableCell>
              <TableCell align="right"><strong>Subtotal</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {todosProductos.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{item.cantidad}</TableCell>
                <TableCell>{item.nombre}</TableCell>
                <TableCell align="center">
                  {item.taper ? (
                    <CheckCircleIcon color="success" sx={{ fontSize: 18, verticalAlign: 'middle' }} />
                  ) : (
                    <CancelIcon color="disabled" sx={{ fontSize: 18, verticalAlign: 'middle' }} />
                  )}
                </TableCell>
                <TableCell align="center">
                  {item.papaFrita ? (
                    <CheckCircleIcon color="success" sx={{ fontSize: 18, verticalAlign: 'middle' }} />
                  ) : (
                    <CancelIcon color="disabled" sx={{ fontSize: 18, verticalAlign: 'middle' }} />
                  )}
                </TableCell>
                <TableCell align="right">{formatCurrency(item.precio)}</TableCell>
                <TableCell align="right">{formatCurrency(item.subtotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Observaciones */}
      {observaciones.length > 0 && (
        <Box sx={{ my: 2 }}>
          <Typography variant="body2"><strong>Observaciones:</strong></Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {observaciones.map((obs, idx) => (
              <li key={idx}><Typography variant="body2">{obs}</Typography></li>
            ))}
          </ul>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Totales */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h6">
            Total: {formatCurrency(pedido.total)}
          </Typography>
        </Box>
      </Box>

      {/* Pie de página */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="caption" color="textSecondary">
          Gracias por su compra
        </Typography>
      </Box>
    </Box>
  );
});

NotaVenta.displayName = 'NotaVenta';