import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../apiService';
import './CierreCasoModal.css'; // Crearemos este CSS rápido abajo

function CierreCasoModal({ caso, onClose, onCaseClosed }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Estado del Formulario
    const [formData, setFormData] = useState({
        metodoPago: 'EFECTIVO', // Default
        montoCobrado: '',
        calificacionCliente: 5, // Estrellas (1-5)
        tipoCliente: 'AMABLE', // Semáforo CRM
        requiereCotizacion: false,
        notasCierre: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleClienteType = (tipo) => {
        setFormData(prev => ({ ...prev, tipoCliente: tipo }));
    };

    const handleSubmit = async () => {
        if (!formData.montoCobrado) {
            setError('Por favor indica cuánto cobraste (pon 0 si fue garantía).');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Llamamos al endpoint que creamos en el Backend Node
            await api.patch(`/casos/${caso.id}/cerrar`, {
                metodoPago: formData.metodoPago,
                montoCobrado: parseFloat(formData.montoCobrado),
                calificacionCliente: formData.calificacionCliente, // 1-5
                requiereCotizacion: formData.requiereCotizacion,
                notasCierre: formData.notasCierre,
                // Datos extra para el CRM (Semáforo)
                tipoClienteCRM: formData.tipoCliente
            });

            onCaseClosed(); // Refrescar lista
            onClose(); // Cerrar modal
        } catch (err) {
            console.error(err);
            setError('Error al cerrar el caso. Intenta de nuevo.');
            setLoading(false);
        }
    };

    // --- RENDERIZADO DEL WIZARD ---

    return createPortal(
        <div className="modal-overlay">
            <div className="modal-content wizard-container">
                {/* ... (Todo tu contenido del modal, header, steps, etc. igual que antes) ... */}

                <div className="wizard-header">
                    <h3>Cerrar Caso #{caso.id}</h3>
                    <span className="step-indicator">Paso {step} de 3</span>
                </div>

                {error && <p className="error-alert">{error}</p>}

                {/* Copia aquí tus Steps 1, 2 y 3 exactamente como los tenías */}
                {/* PASO 1: FINANZAS */}
                {step === 1 && (
                    <div className="wizard-step">
                        <h4>💰 Cobro y Finanzas</h4>
                        {/* ... inputs ... */}
                        <label>¿Cómo pagó el cliente?</label>
                        <div className="payment-toggle">
                            <button
                                className={formData.metodoPago === 'EFECTIVO' ? 'active' : ''}
                                onClick={() => setFormData({ ...formData, metodoPago: 'EFECTIVO' })}
                            >
                                💵 Efectivo
                            </button>
                            <button
                                className={formData.metodoPago === 'TRANSFERENCIA' ? 'active' : ''}
                                onClick={() => setFormData({ ...formData, metodoPago: 'TRANSFERENCIA' })}
                            >
                                📱 Transferencia
                            </button>
                        </div>

                        <label>Monto Total Cobrado ($)</label>
                        <input
                            type="number"
                            name="montoCobrado"
                            value={formData.montoCobrado}
                            onChange={handleChange}
                            placeholder="Ej: 400"
                            className="big-input"
                        />
                        <p className="hint">
                            {formData.metodoPago === 'EFECTIVO'
                                ? '⚠️ Este dinero se descontará de tu saldo.'
                                : '✅ Este dinero entra directo a la empresa.'}
                        </p>
                        <div className="wizard-actions">
                            <button className="btn-secondary" onClick={onClose}>Cancelar</button>
                            <button className="btn-primary" onClick={() => setStep(2)}>Siguiente ➡</button>
                        </div>
                    </div>
                )}

                {/* PASO 2: CRM */}
                {step === 2 && (
                    <div className="wizard-step">
                        <h4>🚦 Calificación del Cliente</h4>
                        {/* ... Botones semáforo ... */}
                        <div className="semaforo-grid">
                            <button
                                className={`semaforo-btn green ${formData.tipoCliente === 'AMABLE' ? 'selected' : ''}`}
                                onClick={() => handleClienteType('AMABLE')}
                            >
                                🟢<br />Amable / Normal
                            </button>
                            <button
                                className={`semaforo-btn orange ${formData.tipoCliente === 'EXIGENTE' ? 'selected' : ''}`}
                                onClick={() => handleClienteType('EXIGENTE')}
                            >
                                🟡<br />Exigente
                            </button>
                            <button
                                className={`semaforo-btn red ${formData.tipoCliente === 'TOXICO' ? 'selected' : ''}`}
                                onClick={() => handleClienteType('TOXICO')}
                            >
                                🔴<br />Conflictivo
                            </button>
                        </div>
                        <div className="wizard-actions">
                            <button className="btn-secondary" onClick={() => setStep(1)}>⬅ Atrás</button>
                            <button className="btn-primary" onClick={() => setStep(3)}>Siguiente ➡</button>
                        </div>
                    </div>
                )}

                {/* PASO 3: CIERRE */}
                {step === 3 && (
                    <div className="wizard-step">
                        {/* ... inputs finales ... */}
                        <h4>📝 Notas Finales</h4>

                        <div className="switch-container">
                            <label>¿Requiere Cotización Formal?</label>
                            <input
                                type="checkbox"
                                name="requiereCotizacion"
                                checked={formData.requiereCotizacion}
                                onChange={handleChange}
                            />
                        </div>

                        <label>Notas de Cierre (Opcional)</label>
                        <textarea
                            name="notasCierre"
                            value={formData.notasCierre}
                            onChange={handleChange}
                            placeholder="Ej: Se requiere cambiar cableado en próxima visita..."
                            rows={3}
                        />

                        <div className="wizard-actions">
                            <button className="btn-secondary" onClick={() => setStep(2)}>⬅ Atrás</button>
                            <button className="btn-success" onClick={handleSubmit} disabled={loading}>
                                {loading ? 'Cerrando...' : '✅ Finalizar Caso'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body // <--- 2. ESTO ASEGURA QUE SE RENDERICE EN EL BODY
    );
}

export default CierreCasoModal;