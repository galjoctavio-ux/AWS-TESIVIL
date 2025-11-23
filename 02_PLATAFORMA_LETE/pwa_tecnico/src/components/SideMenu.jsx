import React from 'react';
import { urlBase64ToUint8Array } from '../utils/pushHelper';
import apiService from '../apiService';

const backdropStyles = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 999,
  transition: 'opacity 0.3s ease-in-out',
};

const menuStyles = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '280px',
  height: '100%',
  backgroundColor: 'white',
  zIndex: 1000,
  transform: 'translateX(-100%)',
  transition: 'transform 0.3s ease-in-out',
  padding: '20px',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
};

const activeMenuStyles = {
  transform: 'translateX(0)',
};

const activeBackdropStyles = {
  opacity: 1,
};

const inactiveBackdropStyles = {
  opacity: 0,
  pointerEvents: 'none',
};

const headerStyles = {
  paddingBottom: '20px',
  borderBottom: '1px solid #f1f5f9',
  marginBottom: '20px',
};

const userNameStyles = {
  fontSize: '1.2rem',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: 0,
};

const menuItemsContainerStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  marginBottom: 'auto', // Esto empuja el botón de salir hacia abajo
};

const menuOptionStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  width: '100%',
  padding: '12px',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  color: '#334155',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'background-color 0.2s',
};

// Estilo hover simulado (en JS puro con styles es difícil el hover, pero esto es base)
// Si usas CSS o Tailwind sería className="hover:bg-gray-100"

const logoutButtonStyles = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#f1f5f9',
  border: 'none',
  borderRadius: '6px',
  fontSize: '1rem',
  fontWeight: '600',
  color: '#ef4444', // Rojo suave para salir
  cursor: 'pointer',
  marginTop: '20px',
};

const SideMenu = ({ isOpen, onClose, user, logout, onOpenAvailability }) => {

  const handleSubscribe = async () => {
    if (!('serviceWorker' in navigator)) return;

    // Tu llave PÚBLICA (La que empieza con BPEC0...)
    const publicVapidKey = 'BPEC0_c6aUq8Bx67_55xzk9l9q1HCzwE4hwuKshnlTOrdRqUZbjkCFNBg7NWDo--bvKynoC8qkmjVHe30uj_UE4';

    try {
      const register = await navigator.serviceWorker.ready;
      const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });

      // Enviar al backend
      await apiService.post('/agenda/subscribe', { subscription });
      alert('¡Notificaciones activadas!');
    } catch (error) {
      console.error(error);
      alert('Error al activar notificaciones. Asegúrate de dar permiso.');
    }
  };

  return (
    <>
      <div
        style={{
          ...backdropStyles,
          ...(isOpen ? activeBackdropStyles : inactiveBackdropStyles),
        }}
        onClick={onClose}
      />
      <div
        style={{
          ...menuStyles,
          ...(isOpen ? activeMenuStyles : {}),
        }}
      >
        {/* 1. Header con el nombre */}
        <div style={headerStyles}>
          <p style={userNameStyles}>Hola, {user?.nombre || 'Técnico'}</p>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Panel de control</p>
        </div>

        {/* 2. Lista de Opciones del Menú */}
        <div style={menuItemsContainerStyles}>

          {/* Botón: Registrar Disponibilidad */}
          <button
            style={menuOptionStyles}
            onClick={onOpenAvailability}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <span style={{ fontSize: '1.2rem' }}>📅</span>
            <div>
              <span style={{ display: 'block', fontWeight: '500' }}>Mi Disponibilidad</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Bloquear días libres</span>
            </div>
          </button>

          {/* Botón: Mi Firma */}
          <button
            style={menuOptionStyles}
            onClick={() => {
              onClose();
              window.location.href = '/firma'; // Navegación simple por ahora, idealmente usar useNavigate
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <span style={{ fontSize: '1.2rem' }}>✍️</span>
            <div>
              <span style={{ display: 'block', fontWeight: '500' }}>Mi Firma</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Configurar firma digital</span>
            </div>
          </button>

          {/* NUEVO BOTÓN: NOTIFICACIONES */}
          <button
            style={menuOptionStyles}
            onClick={handleSubscribe}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <span style={{ fontSize: '1.2rem' }}>🔔</span>
            <div>
              <span style={{ display: 'block', fontWeight: '500' }}>Activar Notificaciones</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Recibe alertas de citas</span>
            </div>
          </button>

        </div>

        {/* 3. Footer con Logout */}
        <button style={logoutButtonStyles} onClick={logout}>
          Cerrar Sesión
        </button>
      </div>
    </>
  );
};

export default SideMenu;