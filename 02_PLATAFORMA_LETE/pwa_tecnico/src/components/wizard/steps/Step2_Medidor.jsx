import React from 'react';
import BigToggle from '../ui/BigToggle';
import InputCard from '../ui/InputCard';
import SelectCard from '../ui/SelectCard';

const Step2_Medidor = ({ formData, updateFormData }) => {

  // Handler for standard input/select changes that pass an event object
  const handleChange = (e) => {
    updateFormData({ [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6 animate-slide-in">
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
