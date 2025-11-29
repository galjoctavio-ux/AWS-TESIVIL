import React from 'react';
import BigToggle from '../ui/BigToggle';
import InputCard from '../ui/InputCard';
import SelectCard from '../ui/SelectCard';

const Step2_Medidor = ({ formData, updateFormData }) => {

  const handleChange = (e) => {
    updateFormData({ [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6 animate-slide-in">

      {/* --- NUEVO: SELECCIÓN DE TARIFA --- */}
      <SelectCard
        label="Tarifa CFE (Según Recibo)"
        name="tarifa_cfe"
        value={formData.tarifa_cfe || '01'}
        onChange={handleChange}
        options={['01', 'DAC', 'PDBT', '01A', '01B']}
      />

      {/* --- NUEVO: CONDICIÓN INFRAESTRUCTURA (CRITERIO CFE) --- */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Condición General (Criterio CFE)
        </label>
        <select
          name="condicion_infraestructura"
          value={formData.condicion_infraestructura || 'Regular'}
          onChange={handleChange}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="Bueno">🟢 BUENO (Cumple Norma)</option>
          <option value="Regular">🟡 REGULAR (Riesgo Latente)</option>
          <option value="Malo">🔴 MALO (Peligro / Fuera de Norma)</option>
        </select>

        {/* Ayuda visual condicionada */}
        <div className="mt-3 text-xs">
          {formData.condicion_infraestructura === 'Malo' && (
            <div className="p-2 bg-red-100 text-red-800 rounded border border-red-200">
              <strong>🚨 Criterio MALO:</strong> Cables {'>'} 30 años, óxido severo, flameos, intemperie sin protección o riesgo de incendio.
            </div>
          )}
          {formData.condicion_infraestructura === 'Regular' && (
            <div className="p-2 bg-amber-100 text-amber-800 rounded border border-amber-200">
              <strong>⚠️ Criterio REGULAR:</strong> Cables {'>'} 10 años, sobrecargas visibles o falta de mantenimiento.
            </div>
          )}
          {formData.condicion_infraestructura === 'Bueno' && (
            <div className="p-2 bg-green-100 text-green-800 rounded border border-green-200">
              <strong>✅ Criterio BUENO:</strong> Instalación reciente ({'<'} 10 años), materiales adecuados y protecciones correctas.
            </div>
          )}
        </div>
      </div>

      {/* --- CAMPOS ORIGINALES --- */}
      <SelectCard
        label="Tipo de Servicio"
        name="tipo_servicio"
        value={formData.tipo_servicio || ''}
        onChange={handleChange}
        options={[
          'Monofásico',
          '2F+Neutro',
          '2F+N con Paneles',
          'Trifásico',
          'Trifásico con Paneles'
        ]}
      />

      <BigToggle
        label="¿Cuenta con Sello CFE?"
        enabled={!!formData.sello_cfe}
        onChange={(val) => updateFormData({ sello_cfe: val })}
      />

      {!formData.sello_cfe && (
        <div className="animate-fade-in">
          <SelectCard
            label="Condición Base Medidor"
            name="condicion_base_medidor"
            value={formData.condicion_base_medidor || ''}
            onChange={handleChange}
            options={['Bueno', 'Regular', 'Malo']}
          />
        </div>
      )}

      <BigToggle
        label="¿Tornillos Flojos en Centro de Carga?"
        enabled={!!formData.tornillos_flojos}
        onChange={(val) => updateFormData({ tornillos_flojos: val })}
      />

      {formData.tornillos_flojos && (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mt-2">
          <p className="font-semibold">⚠️ ¡Atención! Aprieta los tornillos para asegurar una buena conexión y evitar fallas.</p>
        </div>
      )}

      <BigToggle
        label="¿Capacidad del Interruptor vs Calibre Correcto?"
        enabled={!!formData.capacidad_vs_calibre}
        onChange={(val) => updateFormData({ capacidad_vs_calibre: val })}
      />

      {!formData.capacidad_vs_calibre && (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mt-2">
          <p className="font-semibold">¡PELIGRO! El calibre del conductor no corresponde a la capacidad del interruptor. Riesgo de incendio.</p>
        </div>
      )}

      <InputCard
        label="Observaciones del Centro de Carga"
        name="observaciones_cc"
        value={formData.observaciones_cc || ''}
        onChange={handleChange}
        isTextarea={true}
        placeholder="Ej: Se sobrecalienta, huele a quemado, zumbido..."
      />
    </div>
  );
};

export default Step2_Medidor;