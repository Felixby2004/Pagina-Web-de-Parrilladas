import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { AuthLayout } from '../layouts/AuthLayout';
import { MainLayout } from '../layouts/MainLayout';

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

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas (sin layout) */}
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/verificar" element={<Verificar />} />
      <Route path="/recuperar" element={<Recuperar />} />
      <Route path="/cambiar-password" element={<CambiarPassword />} />

      {/* Rutas protegidas (con layout principal) */}
      <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="productos" element={<ProductosList />} />
        <Route path="productos/nuevo" element={<ProductoForm />} />
        <Route path="productos/:id" element={<ProductoDetail />} />
        <Route path="productos/:id/editar" element={<ProductoForm />} />
        <Route path="productos/:id/eliminar" element={<Navigate to="/productos" />} />
        <Route path="pedidos" element={<PedidosList />} />
        <Route path="pedidos/nuevo" element={<PedidoForm />} />
        <Route path="pedidos/:id" element={<PedidoDetail />} />
        <Route path="pedidos/:id/editar" element={<PedidoForm />} />
        <Route path="reporte-diario" element={<ReporteDiario />} />
        <Route path="reporte-ingresos" element={<ReporteIngresos />} />
        <Route path="configuracion" element={<ConfiguracionNegocio />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>

      {/* Ruta 404 */}
      <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
    </Routes>
  );
};
