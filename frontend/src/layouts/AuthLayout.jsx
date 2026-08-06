import { Outlet } from 'react-router-dom';
import { Container, Box, Paper, Typography } from '@mui/material';

export const AuthLayout = () => {
  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Parrilladas
          </Typography>
          <Outlet />
        </Paper>
      </Box>
    </Container>
  );
};