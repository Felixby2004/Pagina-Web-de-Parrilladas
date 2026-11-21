import { useState } from 'react';
import { Box, TextField, MenuItem, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { formatCurrency } from '../../utils/formateador';

export default function SelectorExtra({ productos, onAdd, disabled = false }) {
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const producto = productos.find(p => p.id === Number(productoId));
  const valido = producto && Number.isInteger(cantidad) && cantidad > 0 && cantidad <= 10000;

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', my: 2 }}>
      <TextField select label="Producto extra" value={productoId}
        onChange={e => setProductoId(Number(e.target.value))} disabled={disabled}
        sx={{ minWidth: 250, flex: 1 }} size="small">
        {productos.filter(p => p.disponible).map(p => (
          <MenuItem key={p.id} value={p.id}>{p.nombre} — {formatCurrency(p.precio)}</MenuItem>
        ))}
      </TextField>
      <TextField type="number" label="Cantidad" value={cantidad} size="small"
        onChange={e => setCantidad(Number(e.target.value))} disabled={disabled}
        slotProps={{ htmlInput: { min: 1, max: 10000, step: 1 } }} sx={{ width: 100 }} />
      <Button startIcon={<Add />} variant="outlined" disabled={disabled || !valido}
        onClick={() => { onAdd({ producto, cantidad }); setProductoId(''); setCantidad(1); }}>
        Agregar extra
      </Button>
    </Box>
  );
}
