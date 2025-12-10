// src/App.jsx
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { getTecnicos, getCitas } from './api';
import AgendaGrid from './components/AgendaGrid';
import './App.css';

function App() {
  const [tecnicos, setTecnicos] = useState([]);
  const [citas, setCitas] = useState([]);
  const [fecha, setFecha] = useState(dayjs().format('YYYY-MM-DD'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Extraer token de la URL (?token=...)
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');

  // 1. Cargar Técnicos al inicio
  useEffect(() => {
    if (!token) {
      setError('Acceso denegado: Falta el token de seguridad.');
      setLoading(false);
      return;
    }

    const loadTecnicos = async () => {
      try {
        const data = await getTecnicos(token);
        setTecnicos(data);
      } catch (err) {
        setError('Error cargando técnicos.');
      }
    };
    loadTecnicos();
  }, [token]);

  // 2. Cargar Citas cada vez que cambia la fecha o ya tenemos técnicos
  useEffect(() => {
    if (!token || tecnicos.length === 0) return;

    const loadCitas = async () => {
      setLoading(true);
      try {
        const data = await getCitas(fecha, token);
        setCitas(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadCitas();
  }, [fecha, tecnicos, token]);

  // Manejadores de cambio de fecha
  const cambiarDia = (dias) => {
    setFecha(dayjs(fecha).add(dias, 'day').format('YYYY-MM-DD'));
  };

  if (error) return <div className="error-screen">{error}</div>;

  return (
    <div className="app-container">
      {/* Barra Superior de Control */}
      <header className="control-bar">
        <h3>Luz en tu Espacio</h3>
        <div className="date-controls">
          <button onClick={() => cambiarDia(-1)}>◀</button>
          <input 
            type="date" 
            value={fecha} 
            onChange={(e) => setFecha(e.target.value)} 
          />
          <button onClick={() => cambiarDia(1)}>▶</button>
          <button onClick={() => setFecha(dayjs().format('YYYY-MM-DD'))} className="today-btn">
            Hoy
          </button>
        </div>
      </header>

      {/* Área del Calendario */}
      <div className="grid-wrapper">
        {loading && <div className="loading-overlay">Cargando...</div>}
        
        {tecnicos.length > 0 && (
          <AgendaGrid 
            tecnicos={tecnicos} 
            citas={citas} 
          />
        )}
      </div>
    </div>
  );
}

export default App;
