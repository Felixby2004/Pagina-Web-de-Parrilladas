import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Snackbar } from '../common/Snackbar';

export const Layout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default' }}>
          <Toolbar /> {/* Espacio para el navbar fijo */}
          <Outlet />
        </Box>
      </Box>
      <Snackbar />
    </Box>
  );
};