import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MapeoPrecios from './pages/MapeoPrecios';
import GestionMateriales from './pages/GestionMateriales';
import CotizacionesList from './pages/CotizacionesList';
import ConfiguracionFinanciera from './pages/ConfiguracionFinanciera';
import EditarCotizacion from './pages/EditarCotizacion';
import ProtectedRoute from './components/ProtectedRoute';
import ConfiguracionPagos from './pages/ConfiguracionPagos';
import GestionFinanciera from './pages/GestionFinanciera';
// V1 y V2 eliminados
import CrmDashboardV3 from './pages/CrmDashboardV3';
import './App.css';
import './responsive.css';

function App() {
  return (
    <Routes>
      {/* Ruta Pública */}
      <Route path="/" element={<Login />} />

      {/* Rutas Protegidas */}
      <Route
        path="/dashboard"
        element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
      />
      <Route
        path="/costos"
        element={<ProtectedRoute><MapeoPrecios /></ProtectedRoute>}
      />
      <Route
        path="/materiales"
        element={
          <ProtectedRoute>
            <GestionMateriales />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cotizaciones"
        element={
          <ProtectedRoute>
            <CotizacionesList />
          </ProtectedRoute>
        }
      />
      <Route path="/finanzas-gestion" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><GestionFinanciera /></ProtectedRoute>} />

      {/* RUTA DE EDICIÓN MAESTRA */}
      <Route
        path="/cotizaciones/editar/:id"
        element={
          <ProtectedRoute>
            <EditarCotizacion />
          </ProtectedRoute>
        }
      />

      <Route
        path="/configuracion"
        element={<ProtectedRoute><ConfiguracionFinanciera /></ProtectedRoute>}
      />

      <Route
        path="/pagos-config"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <ConfiguracionPagos />
          </ProtectedRoute>
        }
      />

      {/* --- NUEVO CRM V3 (ÚNICO) --- */}
      <Route
        path="/crm-dashboard-v3"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <CrmDashboardV3 />
          </ProtectedRoute>
        }
      />

      {/* Ruta 404 */}
      <Route path="*" element={
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <h2>404 - Página no encontrada</h2>
          <Link to="/dashboard" style={{ color: '#007bff' }}>Volver al Dashboard</Link>
        </div>
      } />

    </Routes>
  );
}

export default App;