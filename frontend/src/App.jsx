import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './routes/PrivateRoute';
import { AuthLayout } from './layouts/AuthLayout';
import { MainLayout } from './layouts/MainLayout';

import Login from './pages/auth/Login';
import Registro from './pages/auth/Registro';
import Verificar from './pages/auth/Verificar';
import Recuperar from './pages/auth/Recuperar';
import CambiarPassword from './pages/auth/CambiarPassword';
import Dashboard from './pages/dashboard/Dashboard';
import ProductosList from './pages/productos/ProductosList';
import ProductoForm from './pages/productos/ProductoForm';
import ProductoDetail from './pages/productos/ProductoDetail';
import PedidosList from './pages/pedidos/PedidosList';
import PedidoForm from './pages/pedidos/PedidoForm';
import PedidoDetail from './pages/pedidos/PedidoDetail';
import ReporteDiario from './pages/reportes/ReporteDiario';
import ReporteIngresos from './pages/reportes/ReporteIngresos';
import ConfiguracionNegocio from './pages/configuracion/ConfiguracionNegocio';
import Perfil from './pages/perfil/Perfil';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/verificar" element={<Verificar />} />
        <Route path="/recuperar" element={<Recuperar />} />
        <Route path="/cambiar-password" element={<CambiarPassword />} />

        <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="productos" element={<ProductosList />} />
          <Route path="productos/nuevo" element={<ProductoForm />} />
          <Route path="productos/:id" element={<ProductoDetail />} />
          <Route path="productos/:id/editar" element={<ProductoForm />} />
          <Route path="pedidos" element={<PedidosList />} />
          <Route path="pedidos/nuevo" element={<PedidoForm />} />
          <Route path="pedidos/:id" element={<PedidoDetail />} />
          <Route path="pedidos/:id/editar" element={<PedidoForm />} />
          <Route path="reporte-diario" element={<ReporteDiario />} />
          <Route path="reporte-ingresos" element={<ReporteIngresos />} />
          <Route path="configuracion" element={<ConfiguracionNegocio />} />
          <Route path="perfil" element={<Perfil />} />
        </Route>

        <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
      </Routes>
    </Router>
  );
}

export default App;