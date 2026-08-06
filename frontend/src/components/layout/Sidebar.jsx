import { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Box,
  Toolbar,
  Typography,
  Avatar,
} from '@mui/material';
import {
  Dashboard,
  RestaurantMenu,
  Receipt,
  BarChart,
  Settings,
  Person,
  Logout,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useConfiguracion } from '../../hooks/useConfiguracion';

const drawerWidth = 240;

export const Sidebar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);
  const navigate = useNavigate();
  const { usuario, logout } = useAuthStore();
  const { configuracion } = useConfiguracion();

  const isAdmin = usuario?.rol === 'ADMIN';

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Productos', icon: <RestaurantMenu />, path: '/productos' },
    { text: 'Pedidos', icon: <Receipt />, path: '/pedidos' },
    { text: 'Reportes', icon: <BarChart />, path: '/reporte-diario' },
  ];

  // Solo agregamos Configuración si es ADMIN
  if (isAdmin) {
    menuItems.push({ text: 'Configuración', icon: <Settings />, path: '/configuracion' });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? open : true}
      onClose={toggleDrawer}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: '#2c2c2c', // color oscuro
          color: '#fff',
        },
      }}
    >
      <Toolbar sx={{ justifyContent: 'center', gap: 1 }}>
        {configuracion?.logoUrl && (
          <Avatar src={configuracion.logoUrl} sx={{ width: 32, height: 32 }} />
        )}
        <Typography variant="h6" noWrap component="div" sx={{ color: '#fff' }}>
          {configuracion?.nombreNegocio || 'Parrilladas'}
        </Typography>
      </Toolbar>
      <Divider sx={{ bgcolor: '#555' }} />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton component={Link} to={item.path} sx={{ color: '#fff' }}>
              <ListItemIcon sx={{ color: '#fff' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider sx={{ bgcolor: '#555' }} />
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/perfil" sx={{ color: '#fff' }}>
            <ListItemIcon sx={{ color: '#fff' }}><Person /></ListItemIcon>
            <ListItemText primary="Perfil" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ color: '#fff' }}>
            <ListItemIcon sx={{ color: '#fff' }}><Logout /></ListItemIcon>
            <ListItemText primary="Cerrar sesión" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};