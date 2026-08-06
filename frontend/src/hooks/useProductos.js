import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productoService } from '../services/producto.service';
import { useSnackbar } from './useSnackbar';

export const useProductos = (params = {}) => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const queryParams = {};
  if (params.page) queryParams.page = params.page;
  if (params.limit) queryParams.limit = params.limit;
  if (params.search && params.search.trim() !== '') queryParams.search = params.search.trim();
  if (params.tipo && params.tipo !== '') queryParams.tipo = params.tipo;
  if (params.sort) queryParams.sort = params.sort;
  if (params.order) queryParams.order = params.order;

  const keyStr = JSON.stringify(queryParams);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['productos', keyStr],
    queryFn: () => productoService.listar(queryParams),
    staleTime: 5 * 60 * 1000,
  });

  // ✅ Crear
  const crearMutation = useMutation({
    mutationFn: productoService.crear,
    onSuccess: () => {
      showSnackbar('Producto creado exitosamente', 'success');
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
    onError: (error) => {
      showSnackbar(error.response?.data?.error || 'Error al crear producto', 'error');
    },
  });

  // ✅ Actualizar
  const actualizarMutation = useMutation({
    mutationFn: ({ id, data }) => productoService.actualizar(id, data),
    onSuccess: () => {
      showSnackbar('Producto actualizado exitosamente', 'success');
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
    onError: (error) => {
      showSnackbar(error.response?.data?.error || 'Error al actualizar producto', 'error');
    },
  });

  // ✅ Eliminar (cambia visible a false)
  const eliminarMutation = useMutation({
    mutationFn: productoService.eliminar,
    onSuccess: () => {
      showSnackbar('Producto eliminado exitosamente', 'success');
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
    onError: (error) => {
      showSnackbar(error.response?.data?.error || 'Error al eliminar producto', 'error');
    },
  });

  // ✅ Obtener un producto por ID
  const obtenerProducto = async (id) => {
    const response = await productoService.obtener(id);
    return response;
  };

  const taperYPapaQuery = useQuery({
    queryKey: ['productos', 'taper-papa'],
    queryFn: productoService.obtenerTaperYPapa,
    staleTime: 10 * 60 * 1000,
  });

  return {
    productos: data?.data || [],
    paginacion: data?.paginacion || {},
    isLoading,
    error,
    refetch,
    taperYPapa: taperYPapaQuery.data || { taper: null, papaFrita: null },
    loadingTaperPapa: taperYPapaQuery.isLoading,
    // Mutaciones
    crear: crearMutation.mutate,
    crearAsync: crearMutation.mutateAsync,
    crearLoading: crearMutation.isPending,
    actualizar: actualizarMutation.mutate,
    actualizarAsync: actualizarMutation.mutateAsync,
    actualizarLoading: actualizarMutation.isPending,
    eliminar: eliminarMutation.mutate,
    eliminarAsync: eliminarMutation.mutateAsync,
    eliminarLoading: eliminarMutation.isPending,
    obtener: obtenerProducto, // ✅ Agregamos obtener
  };
};
