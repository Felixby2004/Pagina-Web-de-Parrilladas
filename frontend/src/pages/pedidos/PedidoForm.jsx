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
  FormControlLabel,
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
import { formatCurrency, getDateInTimeZoneISO } from '../../utils/formateador';
import { z } from 'zod';
import SelectorExtra from '../../components/pedidos/SelectorExtra';
import { subtotalDetalle, TIPOS_PRODUCTO_LABEL, RECARGO_PAPA_FRITA } from '../../utils/preciosPedido';

const detalleSchema = z.object({
  productoId: z.number().min(1, 'Seleccione un producto'),
  cantidad: z.number().int('Use cantidades enteras').min(1, 'Cantidad mínima 1'),
  usaTaper: z.boolean().default(false),
  usaPapaFrita: z.boolean().default(false),
});

const notaSchema = z.discriminatedUnion('tipo', [
  z.object({ tipo: z.literal('OBSERVACION'), texto: z.string().max(500).optional() }),
  z.object({
    tipo: z.literal('ADICIONAL'),
    cantidad: z.number().int('Use cantidades enteras').positive('Ingrese una cantidad mayor a cero'),
    descripcion: z.string().trim().min(1, 'Ingrese la descripción del extra').max(200),
    precio: z.number().finite().positive('Ingrese un precio mayor a cero').multipleOf(0.01, 'Use como máximo dos decimales'),
  }),
]);

const pedidoSchema = z.object({
  costoDelivery: z.number().finite().min(0, 'El delivery no puede ser negativo').max(99999999.99).multipleOf(0.01, 'Use como máximo dos decimales').nullable(),
  nombreCliente: z.string().optional(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Seleccione una fecha'),
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
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(pedidoSchema),
    defaultValues: {
      nombreCliente: '',
      costoDelivery: null,
      fecha: getDateInTimeZoneISO(),
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
  const costoDelivery = watch('costoDelivery');

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
      costoDelivery: pedidoEdit.costoDelivery == null ? null : Number(pedidoEdit.costoDelivery),
      fecha: getDateInTimeZoneISO(pedidoEdit.fecha),
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
      totalDetalles += subtotalDetalle(detalle, producto, taperYPapa?.taper);
    });

    let totalNotas = 0;
    (notasWatch || []).forEach((nota) => {
      if (nota?.tipo === 'ADICIONAL' && nota.cantidad && nota.precio) {
        totalNotas += Number(nota.cantidad) * Number(nota.precio);
      }
    });

    return Math.round((totalDetalles + totalNotas + Number(costoDelivery || 0)) * 100) / 100;
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
        costoDelivery: data.costoDelivery,
        fecha: data.fecha,
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
              <Grid item xs={12} md={isEdit ? 5 : 6}>
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
              <Grid item xs={12} md={isEdit ? 4 : 6}>
                <Controller
                  name="fecha"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Fecha del Pedido"
                      type="date"
                      fullWidth
                      error={!!errors.fecha}
                      helperText={errors.fecha?.message}
                      disabled={isLocked}
                      InputLabelProps={{ shrink: true }}
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

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6">Delivery</Typography>
            <FormControlLabel label="Incluir delivery" control={
              <Switch checked={costoDelivery !== null} disabled={isLocked}
                onChange={e => setValue('costoDelivery', e.target.checked ? 0 : null, { shouldValidate: true })} />
            } />
            {costoDelivery !== null && (
              <TextField label="Precio del delivery (S/)" type="number" value={Number.isNaN(costoDelivery) ? '' : costoDelivery}
                onChange={e => setValue('costoDelivery', e.target.value === '' ? NaN : Number(e.target.value), { shouldValidate: true })}
                disabled={isLocked} error={!!errors.costoDelivery} helperText={errors.costoDelivery?.message}
                slotProps={{ htmlInput: { min: 0, max: 99999999.99, step: 0.01 } }} />
            )}
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
                    <TableCell align="center">Papa frita (+{formatCurrency(RECARGO_PAPA_FRITA)})</TableCell>
                    <TableCell align="right">Precio Unit.</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                    <TableCell align="center"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detalles.map((field, index) => {
                    const producto = productos.find(p => p.id === detallesWatch?.[index]?.productoId);
                    const subtotal = subtotalDetalle(detallesWatch?.[index] || {}, producto, taperYPapa?.taper);

                    return (
                      <TableRow key={field.id}>
                        <TableCell>
                          <FormControl fullWidth size="small">
                            <InputLabel>Producto</InputLabel>
                            <Select
                              label="Producto"
                              value={detallesWatch?.[index]?.productoId || ''}
                              onChange={(e) => {
                                setValue(`detalles.${index}.productoId`, Number(e.target.value));
                                setValue(`detalles.${index}.usaTaper`, false);
                                setValue(`detalles.${index}.usaPapaFrita`, false);
                              }}
                              error={!!errors.detalles?.[index]?.productoId}
                              disabled={isLocked}
                            >
                              {productos.filter(p => p.disponible || p.id === detallesWatch?.[index]?.productoId).map((p) => (
                                <MenuItem key={p.id} value={p.id}>{p.nombre} — {TIPOS_PRODUCTO_LABEL[p.tipo]}</MenuItem>
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
                            disabled={isLocked || producto?.tipo !== 'PLATO' || !taperYPapa?.taper}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Switch
                            checked={detallesWatch?.[index]?.usaPapaFrita || false}
                            onChange={(e) => setValue(`detalles.${index}.usaPapaFrita`, e.target.checked)}
                            size="small"
                            disabled={isLocked || producto?.tipo !== 'PLATO'}
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
            Extras y observaciones
          </Typography>

          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="body2">Agregue porciones de papa frita, taper, chorizo u otros productos adicionales.</Typography>
            <SelectorExtra productos={productos} disabled={isLocked} onAdd={({ producto, cantidad }) =>
              appendNota({ tipo: 'ADICIONAL', descripcion: producto.nombre, precio: Number(producto.precio), cantidad })} />
            {notas.map((field, index) => (
              <Box key={field.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Tipo</InputLabel>
                      <Select
                        label="Tipo"
                        value={notasWatch?.[index]?.tipo || 'OBSERVACION'}
                        disabled={isLocked}
                        onChange={(e) => setValue(`notas.${index}`, e.target.value === 'OBSERVACION' ? { tipo: 'OBSERVACION', texto: '' } : { tipo: 'ADICIONAL', cantidad: 1, descripcion: '', precio: 0 })}
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
                        disabled={isLocked}
                        error={!!errors.notas?.[index]?.texto}
                        helperText={errors.notas?.[index]?.texto?.message}
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
                          disabled={isLocked}
                          error={!!errors.notas?.[index]?.cantidad}
                          helperText={errors.notas?.[index]?.cantidad?.message}
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
                          disabled={isLocked}
                          error={!!errors.notas?.[index]?.descripcion}
                          helperText={errors.notas?.[index]?.descripcion?.message}
                          size="small"
                          fullWidth
                          value={notasWatch?.[index]?.descripcion || ''}
                          onChange={(e) => setValue(`notas.${index}.descripcion`, e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          label="Precio"
                          disabled={isLocked}
                          error={!!errors.notas?.[index]?.precio}
                          helperText={errors.notas?.[index]?.precio?.message}
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
