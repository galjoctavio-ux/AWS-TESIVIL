import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../apiService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Solo para la carga inicial (F5)
  const navigate = useNavigate();

  // Efecto de Arranque
  useEffect(() => {
    const checkSession = async () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        // Restaurar sesión
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
      setIsLoading(false); // La app ya cargó
    };

    checkSession();
  }, []);

  // Función de Login
  const login = async (email, password) => {
    // NOTA: Ya no usamos setIsLoading(true) aquí. 
    // Dejamos que el componente Login maneje su propio spinner.
    
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, session } = response.data;

      if (user && session && (user.rol === 'tecnico' || user.rol === 'admin')) {
        setUser(user);
        setToken(session.access_token);
        
        localStorage.setItem('authToken', session.access_token);
        localStorage.setItem('user', JSON.stringify(user));
        
        api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
        
        navigate('/'); 
        return true;
      } else {
        throw new Error('Acceso denegado. Se requiere cuenta de Técnico.');
      }
    } catch (error) {
      console.error('Error en el login:', error);
      throw error; // Re-lanzamos el error para que el formulario lo muestre
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  const value = { user, token, isLoading, login, logout };

  if (isLoading) {
    // Puedes poner aquí un spinner global bonito si quieres, pero solo para la carga inicial
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
