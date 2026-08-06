import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notaService } from '../services/nota.service';
import { useSnackbar } from './useSnackbar';

export const useNotas = (pedidoId) => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['notas', pedidoId],
    queryFn: () => notaService.listar(pedidoId),
    enabled: !!pedidoId,
    staleTime: 5 * 60 * 1000,
  });

  const crearMutation = useMutation({
    mutationFn: ({ pedidoId, data }) => notaService.crear(pedidoId, data),
    onSuccess: () => {
      showSnackbar('Nota creada exitosamente', 'success');
      queryClient.invalidateQueries({ queryKey: ['notas', pedidoId] });
    },
    onError: (error) => {
      showSnackbar(error.response?.data?.error || 'Error al crear nota', 'error');
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: notaService.eliminar,
    onSuccess: () => {
      showSnackbar('Nota eliminada exitosamente', 'success');
      queryClient.invalidateQueries({ queryKey: ['notas', pedidoId] });
    },
    onError: (error) => {
      showSnackbar(error.response?.data?.error || 'Error al eliminar nota', 'error');
    },
  });

  return {
    notas: data || [],
    isLoading,
    error,
    refetch,
    crear: crearMutation.mutate,
    crearLoading: crearMutation.isPending,
    eliminar: eliminarMutation.mutate,
    eliminarLoading: eliminarMutation.isPending,
  };
};