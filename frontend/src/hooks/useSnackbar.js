import { useUiStore } from '../store/uiStore';

export const useSnackbar = () => {
  const { showSnackbar } = useUiStore();
  return { showSnackbar };
};