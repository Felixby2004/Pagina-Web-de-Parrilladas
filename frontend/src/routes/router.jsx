import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';

// Páginas de autenticación
import Login from '../pages/auth/Login';
import Registro from '../pages/auth/Registro';
import Verificar from '../pages/auth/Verificar';
import Recuperar from '../pages/auth/Recuperar';
import CambiarPassword from '../pages/auth/CambiarPassword';

// Páginas principales
import Dashboard from '../pages/dashboard/Dashboard';
import ProductosList from '../pages/productos/ProductosList';
import ProductoForm from '../pages/productos/ProductoForm';
import ProductoDetail from '../pages/productos/ProductoDetail';
import PedidosList from '../pages/pedidos/PedidosList';
import PedidoForm from '../pages/pedidos/PedidoForm';
import PedidoDetail from '../pages/pedidos/PedidoDetail';
import ReporteDiario from '../pages/reportes/ReporteDiario';
import ReporteIngresos from '../pages/reportes/ReporteIngresos';
import ConfiguracionNegocio from '../pages/configuracion/ConfiguracionNegocio';
import Perfil from '../pages/perfil/Perfil';

export const router = createBrowserRouter([
  // Rutas públicas
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/registro',
    element: <Registro />,
  },
  {
    path: '/verificar',
    element: <Verificar />,
  },
  {
    path: '/recuperar',
    element: <Recuperar />,
  },
  {
    path: '/cambiar-password',
    element: <CambiarPassword />,
  },
  // Rutas protegidas
  {
    path: '/',
    element: <PrivateRoute><MainLayout /></PrivateRoute>,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'productos',
        element: <ProductosList />,
      },
      {
        path: 'productos/nuevo',
        element: <ProductoForm />,
      },
      {
        path: 'productos/:id',
        element: <ProductoDetail />,
      },
      {
        path: 'productos/:id/editar',
        element: <ProductoForm />,
      },
      {
        path: 'productos/:id/eliminar',
        element: <ProductoForm />,
      },
      {
        path: 'pedidos',
        element: <PedidosList />,
      },
      {
        path: 'pedidos/nuevo',
        element: <PedidoForm />,
      },
      {
        path: 'pedidos/:id',
        element: <PedidoDetail />,
      },
      {
        path: 'pedidos/:id/editar',
        element: <PedidoForm />,
      },
      {
        path: 'reporte-diario',
        element: <ReporteDiario />,
      },
      {
        path: 'reporte-ingresos',
        element: <ReporteIngresos />,
      },
      {
        path: 'configuracion',
        element: <ConfiguracionNegocio />,
      },
      {
        path: 'perfil',
        element: <Perfil />,
      },
    ],
  },
  // 404
  {
    path: '*',
    element: <h1>404 - Página no encontrada</h1>,
  },
]);