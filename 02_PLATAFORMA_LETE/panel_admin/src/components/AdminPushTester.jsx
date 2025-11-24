import React, { useState } from 'react';
import apiService from '../apiService.js';

const AdminPushTester = () => {
    const [techId, setTechId] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendTest = async () => {
        if (!techId) return alert("Ingresa el ID del técnico");

        setLoading(true);
        try {
            const response = await apiService.post('/agenda/admin-test-notification', {
                targetUserId: techId,
                message: "¡Hola! Esta es una prueba de conexión desde el Panel Administrativo."
            });

            if (response.data.success) {
                alert(response.data.message);
            } else {
                alert("Advertencia: " + response.data.message);
            }
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Error de conexión';
            alert(`Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', marginTop: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📡</span> Probador de Notificaciones
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: '#4b5563', marginBottom: '5px' }}>
                        ID del Técnico (Easy!Appointments ID)
                    </label>
                    <input
                        type="number"
                        placeholder="Ej. 15"
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                        value={techId}
                        onChange={(e) => setTechId(e.target.value)}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px' }}>
                        Ingresa el ID numérico para probar su dispositivo.
                    </p>
                </div>

                <button
                    onClick={handleSendTest}
                    disabled={loading}
                    className="main-button"
                    style={{ width: '100%', background: loading ? '#9ca3af' : '#7c3aed', borderColor: 'transparent' }}
                >
                    {loading ? 'Enviando...' : 'Enviar Ping de Prueba'}
                </button>
            </div>
        </div>
    );
};

export default AdminPushTester;