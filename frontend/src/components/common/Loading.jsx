import { CircularProgress, Box, Typography } from '@mui/material';

export const Loading = ({ size = 40, fullScreen = false, text = 'Cargando...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: fullScreen ? '100vh' : '200px',
        gap: 2,
      }}
    >
      <CircularProgress size={size} />
      {text && <Typography variant="body2" color="text.secondary">{text}</Typography>}
    </Box>
  );
};