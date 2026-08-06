import { create } from 'zustand';

export const usePedidoStore = create((set) => ({
  pedidoActual: null,
  setPedidoActual: (pedido) => set({ pedidoActual: pedido }),
  limpiarPedido: () => set({ pedidoActual: null }),
}));