import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../index.css'; // Asegura que cargue estilos base si los hay

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      // Redirección manejada por contexto, pero si falla:
    } catch (err) {
      setIsSubmitting(false);
      if (err.response && err.response.status === 401) {
        setError('Credenciales inválidas.');
      } else {
        setError(err.message || 'Error de conexión.');
      }
    }
  };

  return (
    <div className="admin-login-wrapper">
      {/* Estilos locales para encapsular el diseño de esta página */}
      <style>{`
        .admin-login-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .login-card {
          background: rgba(255, 255, 255, 0.95);
          padding: 3rem;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          width: 100%;
          max-width: 400px;
          transition: transform 0.2s;
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .login-header h2 {
          color: #1e293b;
          margin: 0;
          font-size: 1.8rem;
          font-weight: 700;
        }
        
        .login-header p {
          color: #64748b;
          margin-top: 0.5rem;
          font-size: 0.9rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #334155;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .error-alert {
          background-color: #fee2e2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          padding: 0.75rem;
          border-radius: 8px;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .submit-btn {
          width: 100%;
          padding: 0.875rem;
          background-color: #0f172a;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
        }

        .submit-btn:hover:not(:disabled) {
          background-color: #334155;
        }

        .submit-btn:disabled {
          background-color: #94a3b8;
          cursor: not-allowed;
        }

        /* Spinner CSS */
        .spinner {
          border: 3px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top: 3px solid #ffffff;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div className="login-card">
        <div className="login-header">
          <h2>Panel Admin</h2>
          <p>Plataforma de Control</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Correo Institucional</label>
            <input 
              type="email" 
              id="email" 
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@lete.com"
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
            />
          </div>
          
          {error && <div className="error-alert">{error}</div>}
          
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="spinner"></div>
                <span>Validando...</span>
              </>
            ) : (
              'Ingresar al Sistema'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;