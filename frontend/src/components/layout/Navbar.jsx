import { useState } from 'react';
import { Close } from '@mui/icons-material';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
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

export const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { usuario, logout } = useAuthStore();
  const { configuracion } = useConfiguracion();

  const isAdmin = usuario?.rol === 'ADMIN';

  const menuItems = [
    { text: 'Dashboard', path: '/dashboard', icon: <Dashboard />, roles: ['ADMIN', 'EMPLEADO'] },
    { text: 'Productos', path: '/productos', icon: <RestaurantMenu />, roles: ['ADMIN', 'EMPLEADO'] },
    { text: 'Pedidos', path: '/pedidos', icon: <Receipt />, roles: ['ADMIN', 'EMPLEADO'] },
    { text: 'Reportes', path: '/reporte-diario', icon: <BarChart />, roles: ['ADMIN', 'EMPLEADO'] },
    { text: 'Configuración', path: '/configuracion', icon: <Settings />, roles: ['ADMIN'] },
  ];

  const filteredItems = menuItems.filter(
    (item) => item.roles.includes(usuario?.rol || '')
  );

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) return;
    setDrawerOpen(open);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawerContent = (
    <Box
      sx={{
        width: 280,
        height: '100%',
        bgcolor: '#1a1a1a',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}
      role="presentation"
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          p: 1,
          borderBottom: '1px solid #333',
        }}
      >
        <IconButton
          onClick={toggleDrawer(false)}
          sx={{ color: '#fff' }}
        >
          <Close />
        </IconButton>
      </Box>

      <List sx={{ flex: 1 }}>
        {filteredItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              onClick={toggleDrawer(false)}
              sx={{
                '&:hover': {
                  bgcolor: '#8B0000',
                },
                py: 1.5,
              }}
            >
              <ListItemIcon sx={{ color: '#fff', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  '& .MuiTypography-root': {
                    fontWeight: 500,
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}

        <Divider sx={{ my: 1, bgcolor: '#333' }} />

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/perfil"
            onClick={toggleDrawer(false)}
            sx={{
              '&:hover': { bgcolor: '#8B0000' },
              py: 1.5,
            }}
          >
            <ListItemIcon sx={{ color: '#fff', minWidth: 40 }}>
              <Person />
            </ListItemIcon>
            <ListItemText primary="Perfil" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              '&:hover': { bgcolor: '#8B0000' },
              py: 1.5,
            }}
          >
            <ListItemIcon sx={{ color: '#fff', minWidth: 40 }}>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Cerrar sesión" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar
      position="fixed"
      sx={{
        bgcolor: '#8B0000',
        borderRadius: '0 0 0 0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 1 }}>
          {configuracion?.logoUrl && (
            <Box
              sx={{
                width: 45,
                height: 45,
                borderRadius: '50%',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fff',
              }}
            >
              <img
                src={configuracion.logoUrl}
                alt="Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </Box>
          )}
          <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
            {configuracion?.nombreNegocio || 'Parrilladas'}
          </Typography>
        </Box>

        {isMobile ? (
          <>
            <IconButton color="inherit" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={toggleDrawer(false)}
              slotProps={{
                paper: {
                  sx: {
                    borderRadius: 0,
                  },
                },
              }}
            >
              {drawerContent}
            </Drawer>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {filteredItems.map((item) => (
              <Button
                key={item.text}
                color="inherit"
                component={Link}
                to={item.path}
                sx={{ fontWeight: 500 }}
              >
                {item.text}
              </Button>
            ))}
            <Button color="inherit" component={Link} to="/perfil" sx={{ fontWeight: 500 }}>
              Perfil
            </Button>
            <Button color="inherit" onClick={handleLogout} sx={{ fontWeight: 500 }}>
              Cerrar sesión
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};