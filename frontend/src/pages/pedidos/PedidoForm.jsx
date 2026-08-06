import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Grid,
} from '@mui/material';
import { Add, Delete, Save } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { usePedidos } from '../../hooks/usePedidos';
import { useProductos } from '../../hooks/useProductos';
import { pedidoService } from '../../services/pedido.service';
import { formatCurrency } from '../../utils/formateador';
import { z } from 'zod';

const detalleSchema = z.object({
  productoId: z.number().min(1, 'Seleccione un producto'),
  cantidad: z.number().min(1, 'Cantidad mínima 1'),
  usaTaper: z.boolean().default(false),
  usaPapaFrita: z.boolean().default(false),
});

const notaSchema = z.object({
  tipo: z.enum(['OBSERVACION', 'ADICIONAL']),
  texto: z.string().optional(),
  cantidad: z.number().optional(),
  descripcion: z.string().optional(),
  precio: z.number().optional(),
});

const pedidoSchema = z.object({
  nombreCliente: z.string().optional(),
  estado: z.enum(['ABIERTO', 'PAGADO', 'CANCELADO']).default('ABIERTO'),
  detalles: z.array(detalleSchema).min(1, 'Agregue al menos un producto'),
  notas: z.array(notaSchema).optional(),
});

export default function PedidoForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { crearAsync, crearLoading, actualizarAsync, actualizarLoading } = usePedidos();
  const { productos } = useProductos({ limit: 1000 });
  const { taperYPapa } = useProductos({});
  const [error, setError] = useState('');

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(pedidoSchema),
    defaultValues: {
      nombreCliente: '',
      estado: 'ABIERTO',
      detalles: [{ productoId: '', cantidad: 1, usaTaper: false, usaPapaFrita: false }],
      notas: [],
    },
  });

  const { fields: detalles, append: appendDetalle, remove: removeDetalle } = useFieldArray({
    control,
    name: 'detalles',
  });

  const { fields: notas, append: appendNota, remove: removeNota } = useFieldArray({
    control,
    name: 'notas',
  });

  const detallesWatch = watch('detalles');
  const notasWatch = watch('notas');
  const estadoWatch = watch('estado');

  const { data: pedidoEdit, isLoading: pedidoLoading } = useQuery({
    queryKey: ['pedido', id],
    queryFn: () => pedidoService.obtener(id),
    enabled: isEdit,
  });

  const isLocked = isEdit && pedidoEdit && (pedidoEdit.estado === 'PAGADO' || pedidoEdit.estado === 'CANCELADO');

  useEffect(() => {
    if (!isEdit || !pedidoEdit) return;

    reset({
      nombreCliente: pedidoEdit.nombreCliente || '',
      estado: pedidoEdit.estado || 'ABIERTO',
      detalles: (pedidoEdit.detalles || []).map((d) => ({
        productoId: d.productoId,
        cantidad: d.cantidad,
        usaTaper: Boolean(d.usaTaper),
        usaPapaFrita: Boolean(d.usaPapaFrita),
      })),
      notas: (pedidoEdit.notas || []).map((n) => {
        if (n.tipo === 'OBSERVACION') {
          return { tipo: 'OBSERVACION', texto: n.texto || '' };
        }
        return {
          tipo: 'ADICIONAL',
          cantidad: n.cantidad || 1,
          descripcion: n.descripcion || '',
          precio: Number(n.precio || 0),
        };
      }),
    });
  }, [isEdit, pedidoEdit, reset]);

  const calcularTotal = () => {
    let totalDetalles = 0;
    (detallesWatch || []).forEach((detalle) => {
      if (!detalle?.productoId) return;
      const producto = productos.find((p) => p.id === detalle.productoId);
      if (!producto) return;
      const cantidad = Number(detalle.cantidad || 0);
      const precioProducto = Number(producto.precio);
      let subtotal = cantidad * precioProducto;

      if (detalle.usaTaper && taperYPapa?.taper) {
        subtotal += cantidad * Number(taperYPapa.taper.precio);
      }
      if (detalle.usaPapaFrita && taperYPapa?.papaFrita) {
        subtotal += cantidad * Number(taperYPapa.papaFrita.precio);
      }
      totalDetalles += subtotal;
    });

    let totalNotas = 0;
    (notasWatch || []).forEach((nota) => {
      if (nota?.tipo === 'ADICIONAL' && nota.cantidad && nota.precio) {
        totalNotas += Number(nota.cantidad) * Number(nota.precio);
      }
    });

    return totalDetalles + totalNotas;
  };

  const total = calcularTotal();

  const onSubmit = async (data) => {
    setError('');
    try {
      const notasFiltradas = data.notas?.filter(n => 
        n.tipo === 'OBSERVACION' ? n.texto : (n.cantidad && n.descripcion && n.precio)
      ) || [];

      const pedidoData = {
        nombreCliente: data.nombreCliente || null,
        estado: data.estado || 'ABIERTO',
        detalles: data.detalles.map(d => ({
          productoId: Number(d.productoId),
          cantidad: Number(d.cantidad),
          usaTaper: d.usaTaper || false,
          usaPapaFrita: d.usaPapaFrita || false,
        })),
        notas: notasFiltradas.map(n => {
          if (n.tipo === 'OBSERVACION') {
            return { tipo: 'OBSERVACION', texto: n.texto };
          }
          return {
            tipo: 'ADICIONAL',
            cantidad: Number(n.cantidad),
            descripcion: n.descripcion,
            precio: Number(n.precio),
          };
        }),
      };

      if (isEdit) {
        await actualizarAsync({ id, data: pedidoData });
      } else {
        await crearAsync(pedidoData);
      }
      navigate('/pedidos');
    } catch (err) {
      setError(err.response?.data?.error || (isEdit ? 'Error al actualizar pedido' : 'Error al crear pedido'));
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {isEdit ? 'Editar Pedido' : 'Nuevo Pedido'}
      </Typography>

      {isLocked && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Este pedido está cerrado ({pedidoEdit?.estado}). No se puede editar ni eliminar.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {pedidoLoading && isEdit ? (
        <Typography>Cargando...</Typography>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3} sx={{ alignItems: 'center' }}>
              <Grid item xs={12} md={isEdit ? 6 : 8}>
                <Controller
                  name="nombreCliente"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nombre del Cliente"
                      fullWidth
                      disabled={isLocked}
                    />
                  )}
                />
              </Grid>
              {isEdit && (
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Estado</InputLabel>
                    <Select
                      label="Estado"
                      value={estadoWatch}
                      onChange={(e) => setValue('estado', e.target.value)}
                      disabled={isLocked}
                    >
                      <MenuItem value="ABIERTO">Abierto</MenuItem>
                      <MenuItem value="PAGADO">Pagado</MenuItem>
                      <MenuItem value="CANCELADO">Cancelado</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </Paper>

          <Typography variant="h6" gutterBottom>
            Detalle del Pedido
          </Typography>

          <Paper sx={{ p: 3, mb: 3 }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="center">Cantidad</TableCell>
                    <TableCell align="center">Taper</TableCell>
                    <TableCell align="center">Papa Frita</TableCell>
                    <TableCell align="right">Precio Unit.</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                    <TableCell align="center"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detalles.map((field, index) => {
                    const producto = productos.find(p => p.id === detallesWatch?.[index]?.productoId);
                    const cantidad = Number(detallesWatch?.[index]?.cantidad || 0);
                    let subtotal = 0;
                    if (producto) {
                      const precioProducto = Number(producto.precio);
                      subtotal = cantidad * precioProducto;
                      if (detallesWatch?.[index]?.usaTaper && taperYPapa?.taper) {
                        subtotal += cantidad * Number(taperYPapa.taper.precio);
                      }
                      if (detallesWatch?.[index]?.usaPapaFrita && taperYPapa?.papaFrita) {
                        subtotal += cantidad * Number(taperYPapa.papaFrita.precio);
                      }
                    }

                    return (
                      <TableRow key={field.id}>
                        <TableCell>
                          <FormControl fullWidth size="small">
                            <InputLabel>Producto</InputLabel>
                            <Select
                              label="Producto"
                              value={detallesWatch?.[index]?.productoId || ''}
                              onChange={(e) => setValue(`detalles.${index}.productoId`, Number(e.target.value))}
                              error={!!errors.detalles?.[index]?.productoId}
                              disabled={isLocked}
                            >
                              {productos.filter(p => p.tipo === 'PLATO').map((p) => (
                                <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            type="number"
                            size="small"
                            sx={{ width: 80 }}
                            value={detallesWatch?.[index]?.cantidad || 1}
                            onChange={(e) => setValue(`detalles.${index}.cantidad`, Number(e.target.value))}
                            slotProps={{ htmlInput: { min: 1 } }}
                            error={!!errors.detalles?.[index]?.cantidad}
                            disabled={isLocked}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Switch
                            checked={detallesWatch?.[index]?.usaTaper || false}
                            onChange={(e) => setValue(`detalles.${index}.usaTaper`, e.target.checked)}
                            size="small"
                            disabled={isLocked}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Switch
                            checked={detallesWatch?.[index]?.usaPapaFrita || false}
                            onChange={(e) => setValue(`detalles.${index}.usaPapaFrita`, e.target.checked)}
                            size="small"
                            disabled={isLocked}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {producto ? formatCurrency(producto.precio) : '-'}
                        </TableCell>
                        <TableCell align="right">
                          {subtotal > 0 ? formatCurrency(subtotal) : '-'}
                        </TableCell>
                        <TableCell align="center">
                          {!isLocked && (
                            <IconButton size="small" color="error" onClick={() => removeDetalle(index)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => appendDetalle({ productoId: '', cantidad: 1, usaTaper: false, usaPapaFrita: false })}
              sx={{ mt: 2 }}
              disabled={isLocked}
            >
              Agregar Producto
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Typography variant="h6">
                Total Pedido: {formatCurrency(total)}
              </Typography>
            </Box>
          </Paper>

          <Typography variant="h6" gutterBottom>
            Notas
          </Typography>

          <Paper sx={{ p: 3, mb: 2 }}>
            {notas.map((field, index) => (
              <Box key={field.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Tipo</InputLabel>
                      <Select
                        label="Tipo"
                        value={notasWatch?.[index]?.tipo || 'OBSERVACION'}
                        onChange={(e) => setValue(`notas.${index}.tipo`, e.target.value)}
                      >
                        <MenuItem value="OBSERVACION">Observación</MenuItem>
                        <MenuItem value="ADICIONAL">Producto adicional</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {notasWatch?.[index]?.tipo === 'OBSERVACION' ? (
                    <Grid item xs={12} md={9}>
                      <TextField
                        label="Observación"
                        fullWidth
                        size="small"
                        value={notasWatch?.[index]?.texto || ''}
                        onChange={(e) => setValue(`notas.${index}.texto`, e.target.value)}
                      />
                    </Grid>
                  ) : (
                    <>
                      <Grid item xs={12} md={3}>
                        <TextField
                          label="Cantidad"
                          type="number"
                          size="small"
                          fullWidth
                          value={notasWatch?.[index]?.cantidad || ''}
                          onChange={(e) => setValue(`notas.${index}.cantidad`, Number(e.target.value))}
                          slotProps={{ htmlInput: { min: 1 } }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="Descripción"
                          size="small"
                          fullWidth
                          value={notasWatch?.[index]?.descripcion || ''}
                          onChange={(e) => setValue(`notas.${index}.descripcion`, e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          label="Precio"
                          type="number"
                          size="small"
                          fullWidth
                          value={notasWatch?.[index]?.precio || ''}
                          onChange={(e) => setValue(`notas.${index}.precio`, Number(e.target.value))}
                          slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                        />
                      </Grid>
                    </>
                  )}
                  <Grid item xs={12} md={1}>
                    {!isLocked && (
                      <IconButton size="small" color="error" onClick={() => removeNota(index)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </Grid>
                </Grid>
              </Box>
            ))}

            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => appendNota({ tipo: 'OBSERVACION', texto: '' })}
              sx={{ mt: 1 }}
              disabled={isLocked}
            >
              Agregar Nota
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Typography variant="h6">
                Total General: {formatCurrency(total)}
              </Typography>
            </Box>
          </Paper>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/pedidos')}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={crearLoading || actualizarLoading || isLocked}
              startIcon={<Save />}
              sx={{
                background: 'linear-gradient(135deg, #8B0000 0%, #a52a2a 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #a52a2a 0%, #8B0000 100%)',
                },
              }}
            >
              {crearLoading || actualizarLoading ? 'Guardando...' : 'Guardar Pedido'}
            </Button>
          </Box>
        </form>
      )}
    </Container>
  );
}