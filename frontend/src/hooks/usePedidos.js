import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pedidoService } from '../services/pedido.service';
import { useSnackbar } from './useSnackbar';

export const usePedidos = (params = {}) => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const queryParams = {};
  if (params.page) queryParams.page = params.page;
  if (params.limit) queryParams.limit = params.limit;
  if (params.search && params.search.trim() !== '') queryParams.search = params.search.trim();
  if (params.estado && params.estado !== '') queryParams.estado = params.estado;
  if (params.fechaInicio) queryParams.fechaInicio = params.fechaInicio;
  if (params.fechaFin) queryParams.fechaFin = params.fechaFin;

  const keyStr = JSON.stringify(queryParams);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['pedidos', keyStr],
    queryFn: () => pedidoService.listar(queryParams),
    staleTime: 5 * 60 * 1000,
  });

  const crearMutation = useMutation({
    mutationFn: pedidoService.crear,
    onSuccess: () => {
      showSnackbar('Pedido creado exitosamente', 'success');
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
    },
    onError: (error) => {
      showSnackbar(error.response?.data?.error || 'Error al crear pedido', 'error');
    },
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ id, data }) => pedidoService.actualizar(id, data),
    onSuccess: () => {
      showSnackbar('Pedido actualizado exitosamente', 'success');
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
    },
    onError: (error) => {
      showSnackbar(error.response?.data?.error || 'Error al actualizar pedido', 'error');
    },
  });

  const cerrarMutation = useMutation({
    mutationFn: pedidoService.cerrar,
    onSuccess: () => {
      showSnackbar('Pedido cerrado exitosamente', 'success');
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
    },
    onError: (error) => {
      showSnackbar(error.response?.data?.error || 'Error al cerrar pedido', 'error');
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: pedidoService.eliminar,
    onSuccess: () => {
      showSnackbar('Pedido eliminado exitosamente', 'success');
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
    },
    onError: (error) => {
      showSnackbar(error.response?.data?.error || 'Error al eliminar pedido', 'error');
    },
  });

  return {
    pedidos: Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [],
    paginacion: data?.paginacion || {},
    isLoading,
    error,
    refetch,
    crear: crearMutation.mutate,
    crearAsync: crearMutation.mutateAsync,
    crearLoading: crearMutation.isPending,
    actualizar: actualizarMutation.mutate,
    actualizarAsync: actualizarMutation.mutateAsync,
    actualizarLoading: actualizarMutation.isPending,
    cerrar: cerrarMutation.mutate,
    cerrarLoading: cerrarMutation.isPending,
    eliminar: eliminarMutation.mutate,
    eliminarAsync: eliminarMutation.mutateAsync,
    eliminarLoading: eliminarMutation.isPending,
  };
};
