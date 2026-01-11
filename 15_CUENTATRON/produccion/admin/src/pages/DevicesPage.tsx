/**
 * Devices Page
 * Device provisioning and management (UXUI-057)
 * 
 * INAMOVIBLE: voltage_cal, current_cal_1-5, power_cal columns
 */

import { useEffect, useState } from 'react';
import { supabase, Dispositivo, Plan } from '../lib/supabase';
import QRCode from 'qrcode';
import { Cpu, Plus, QrCode, X } from 'lucide-react';
import './DevicesPage.css';

interface NewDevice {
    device_id: string;
    plan_id: number;
    voltage_cal: string;
    current_cal_1: string;
    current_cal_2: string;
    current_cal_3: string;
    current_cal_4: string;
    current_cal_5: string;
    power_cal: string;
}

export default function DevicesPage() {
    const [devices, setDevices] = useState<Dispositivo[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [newDevice, setNewDevice] = useState<NewDevice>({
        device_id: '',
        plan_id: 0,
        voltage_cal: '1.0',
        current_cal_1: '1.0',
        current_cal_2: '1.0',
        current_cal_3: '1.0',
        current_cal_4: '1.0',
        current_cal_5: '1.0',
        power_cal: '1.0',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [devicesRes, plansRes] = await Promise.all([
                supabase.from('dispositivos').select('*').order('created_at', { ascending: false }),
                supabase.from('planes').select('*'),
            ]);

            setDevices(devicesRes.data || []);
            setPlans(plansRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get number of current cal fields based on plan
    const getCalFieldCount = (planId: number): number => {
        const plan = plans.find(p => p.id === planId);
        if (!plan) return 2;
        if (plan.bifasico && plan.con_paneles) return 5;
        if (plan.bifasico || plan.con_paneles) return 3;
        return 2;
    };

    // Handle device creation
    const handleCreateDevice = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newDevice.device_id || !newDevice.plan_id) {
            alert('Completa todos los campos requeridos');
            return;
        }

        try {
            const { error } = await supabase.from('dispositivos').insert({
                device_id: newDevice.device_id.toUpperCase(),
                plan_id: newDevice.plan_id,
                estado: 'sin_vincular',
                voltage_cal: parseFloat(newDevice.voltage_cal),
                current_cal_1: parseFloat(newDevice.current_cal_1),
                current_cal_2: parseFloat(newDevice.current_cal_2),
                current_cal_3: parseFloat(newDevice.current_cal_3) || null,
                current_cal_4: parseFloat(newDevice.current_cal_4) || null,
                current_cal_5: parseFloat(newDevice.current_cal_5) || null,
                power_cal: parseFloat(newDevice.power_cal),
            });

            if (error) throw error;

            // Generate QR code
            const qrData = await QRCode.toDataURL(newDevice.device_id.toUpperCase(), {
                width: 300,
                margin: 2,
                color: { dark: '#1a1a2e', light: '#ffffff' },
            });
            setQrCode(qrData);

            // Refresh list
            fetchData();
        } catch (error) {
            console.error('Error creating device:', error);
            alert('Error al crear dispositivo');
        }
    };

    // Reset modal
    const closeModal = () => {
        setShowModal(false);
        setQrCode(null);
        setNewDevice({
            device_id: '',
            plan_id: 0,
            voltage_cal: '1.0',
            current_cal_1: '1.0',
            current_cal_2: '1.0',
            current_cal_3: '1.0',
            current_cal_4: '1.0',
            current_cal_5: '1.0',
            power_cal: '1.0',
        });
    };

    const calFieldCount = getCalFieldCount(newDevice.plan_id);

    return (
        <div className="devices-page">
            <header className="page-header">
                <div>
                    <h1>Dispositivos</h1>
                    <p>Gestión y aprovisionamiento de dispositivos</p>
                </div>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={20} />
                    Aprovisionar
                </button>
            </header>

            {/* Devices Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Device ID</th>
                            <th>Plan</th>
                            <th>Estado</th>
                            <th>Usuario</th>
                            <th>Fecha Creación</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="loading-cell">Cargando...</td></tr>
                        ) : devices.length === 0 ? (
                            <tr><td colSpan={5} className="empty-cell">No hay dispositivos</td></tr>
                        ) : (
                            devices.map((device) => (
                                <tr key={device.device_id}>
                                    <td>
                                        <div className="device-id">
                                            <Cpu size={16} />
                                            {device.device_id}
                                        </div>
                                    </td>
                                    <td>{plans.find(p => p.id === device.plan_id)?.nombre_plan || '-'}</td>
                                    <td>
                                        <span className={`status-badge status-${device.estado}`}>
                                            {device.estado}
                                        </span>
                                    </td>
                                    <td>{device.usuario_id ? 'Vinculado' : 'Sin asignar'}</td>
                                    <td>{new Date(device.created_at).toLocaleDateString('es-MX')}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Provision Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>{qrCode ? 'Dispositivo Creado' : 'Aprovisionar Dispositivo'}</h2>
                            <button className="modal-close" onClick={closeModal}>
                                <X size={24} />
                            </button>
                        </div>

                        {qrCode ? (
                            <div className="qr-result">
                                <img src={qrCode} alt="QR Code" className="qr-image" />
                                <p className="qr-device-id">{newDevice.device_id.toUpperCase()}</p>
                                <button className="btn-primary" onClick={closeModal}>
                                    Cerrar
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleCreateDevice} className="provision-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Device ID (MAC) *</label>
                                        <input
                                            type="text"
                                            placeholder="CT-XXXXXX"
                                            value={newDevice.device_id}
                                            onChange={(e) => setNewDevice({ ...newDevice, device_id: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Plan *</label>
                                        <select
                                            value={newDevice.plan_id}
                                            onChange={(e) => setNewDevice({ ...newDevice, plan_id: parseInt(e.target.value) })}
                                            required
                                        >
                                            <option value={0}>Selecciona plan</option>
                                            {plans.map((plan) => (
                                                <option key={plan.id} value={plan.id}>{plan.nombre_plan}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <h3 className="section-title">Calibración ESP32 (INAMOVIBLE)</h3>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>voltage_cal</label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            value={newDevice.voltage_cal}
                                            onChange={(e) => setNewDevice({ ...newDevice, voltage_cal: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>power_cal</label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            value={newDevice.power_cal}
                                            onChange={(e) => setNewDevice({ ...newDevice, power_cal: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>current_cal_1</label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            value={newDevice.current_cal_1}
                                            onChange={(e) => setNewDevice({ ...newDevice, current_cal_1: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>current_cal_2</label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            value={newDevice.current_cal_2}
                                            onChange={(e) => setNewDevice({ ...newDevice, current_cal_2: e.target.value })}
                                        />
                                    </div>
                                    {calFieldCount >= 3 && (
                                        <div className="form-group">
                                            <label>current_cal_3</label>
                                            <input
                                                type="number"
                                                step="0.001"
                                                value={newDevice.current_cal_3}
                                                onChange={(e) => setNewDevice({ ...newDevice, current_cal_3: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </div>

                                {calFieldCount >= 4 && (
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>current_cal_4</label>
                                            <input
                                                type="number"
                                                step="0.001"
                                                value={newDevice.current_cal_4}
                                                onChange={(e) => setNewDevice({ ...newDevice, current_cal_4: e.target.value })}
                                            />
                                        </div>
                                        {calFieldCount >= 5 && (
                                            <div className="form-group">
                                                <label>current_cal_5</label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={newDevice.current_cal_5}
                                                    onChange={(e) => setNewDevice({ ...newDevice, current_cal_5: e.target.value })}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button type="submit" className="btn-primary btn-full">
                                    <QrCode size={20} />
                                    Crear y Generar QR
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
