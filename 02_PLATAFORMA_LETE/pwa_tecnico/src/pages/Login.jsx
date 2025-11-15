import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// --- ESTILOS MODERNOS (CSS-in-JS ligero) ---
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f3f4f6', // Un gris muy suave, más moderno
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    padding: '40px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    margin: 0,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box', // Importante para que el padding no rompa el ancho
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2563eb', // Azul profesional
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '10px',
  },
  errorMessage: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '14px',
    textAlign: 'center',
    border: '1px solid #fecaca',
  }
};

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isHovered, setIsHovered] = useState(false); // Estado para el efecto hover del botón
  
  // 1. Obtenemos la función 'login' del contexto
  const { login } = useAuth(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // 2. Solo llamamos a la función del contexto
      await login(email, password);
      // La redirección la maneja el contexto
      
    } catch (err) {
      // 3. Capturamos el error que nos lanza el contexto
      if (err.response && err.response.status === 401) {
        setError('Credenciales inválidas. Por favor, inténtelo de nuevo.');
      } else {
        // Muestra el error específico (ej. "Se requiere cuenta de Técnico")
        setError(err.message || 'Error de conexión. Inténtelo más tarde.');
      }
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Puedes agregar aquí un logo si tienes uno: <img src={logo} alt="Logo" style={{height: '40px', margin: '0 auto'}} /> */}
        <h2 style={styles.title}>App del Ingeniero</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>Correo Electrónico</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              style={styles.input}
              placeholder="ejemplo@empresa.com"
              // Pequeño truco para simular focus visual usando estilos en línea
              onFocus={(e) => e.target.style.borderColor = '#2563eb'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>Contraseña</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              style={styles.input}
              placeholder="••••••••"
              onFocus={(e) => e.target.style.borderColor = '#2563eb'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
          
          {error && <div style={styles.errorMessage}>{error}</div>}
          
          <button 
            type="submit" 
            style={{
                ...styles.button,
                backgroundColor: isHovered ? '#1d4ed8' : '#2563eb' // Efecto Hover manual
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;