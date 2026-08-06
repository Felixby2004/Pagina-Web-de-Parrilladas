import { Snackbar as MuiSnackbar, Alert } from '@mui/material';
import { useUiStore } from '../../store/uiStore';

export const Snackbar = () => {
  const { snackbar, hideSnackbar } = useUiStore();
  const { open, message, severity } = snackbar;

  return (
    <MuiSnackbar
      open={open}
      autoHideDuration={6000}
      onClose={hideSnackbar}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={hideSnackbar} severity={severity} variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </MuiSnackbar>
  );
};