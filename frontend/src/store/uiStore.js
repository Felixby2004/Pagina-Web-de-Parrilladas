import { create } from 'zustand';

export const useUiStore = create((set) => ({
  isLoading: false,
  snackbar: {
    open: false,
    message: '',
    severity: 'info',
  },
  showSnackbar: (message, severity = 'info') => {
    set({
      snackbar: {
        open: true,
        message,
        severity,
      },
    });
  },
  hideSnackbar: () => {
    set({
      snackbar: {
        open: false,
        message: '',
        severity: 'info',
      },
    });
  },
  setLoading: (loading) => set({ isLoading: loading }),
}));