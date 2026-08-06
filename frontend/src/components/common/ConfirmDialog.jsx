import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';

export const ConfirmDialog = ({ open, onClose, onConfirm, title, message, loading }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title || 'Confirmar'}</DialogTitle>
      <DialogContent>
        <Alert severity="warning">
          {message || '¿Estás seguro de realizar esta acción?'}
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={loading}>
          {loading ? 'Procesando...' : 'Confirmar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};