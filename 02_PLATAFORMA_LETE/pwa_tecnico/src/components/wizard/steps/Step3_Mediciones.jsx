import React from 'react';
import InputCard from '../ui/InputCard';

const Step3_Mediciones = ({ formData, updateFormData }) => {
  const handleChange = (e) => {
    updateFormData({ [e.target.name]: e.target.value });
  };

  const { tipo_servicio } = formData;

  const showF2 = tipo_servicio?.includes('2F') || tipo_servicio?.includes('Trifásico');
  const showF3 = tipo_servicio?.includes('Trifásico');
  const showNeutro = tipo_servicio?.includes('Monofásico') || tipo_servicio?.includes('2F');
  const showPaneles = tipo_servicio?.includes('Paneles');

  return (
    <div className="space-y-6 animate-slide-in">

      {/* --- NUEVO: CONSUMO RECIBO --- */}
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm">
        <h3 className="font-bold text-blue-900 mb-2">Datos del Recibo</h3>
        <InputCard
          label="Consumo Último Recibo CFE"
          name="kwh_recibo_cfe"
          value={formData.kwh_recibo_cfe || ''}
          onChange={handleChange}
          type="number"
          unit="kWh"
          placeholder="Ej. 850"
        />
        <p className="text-xs text-blue-700 mt-2">
          <strong>Importante:</strong> Este dato es vital para calcular el "Consumo Fantasma" y la "Fuga no Identificada".
        </p>
      </div>

      <InputCard
        label="Voltaje (Fase-Neutro)"
        name="voltaje_medido" // Corregido para coincidir con formData
        value={formData.voltaje_medido || ''}
        onChange={handleChange}
        type="number"
        unit="V"
      />

      {/* Grupo: Corrientes de Red */}
      <div className="space-y-4 border border-gray-200 p-4 rounded-xl bg-gray-50">
        <h3 className="font-bold text-gray-700">⚡ Corrientes de Red</h3>
        <InputCard
          label="Corriente Red F1"
          name="corriente_red_f1"
          value={formData.corriente_red_f1 || ''}
          onChange={handleChange}
          type="number"
          unit="A"
        />
        {showF2 && (
          <InputCard
            label="Corriente Red F2"
            name="corriente_red_f2"
            value={formData.corriente_red_f2 || ''}
            onChange={handleChange}
            type="number"
            unit="A"
          />
        )}
        {showF3 && (
          <InputCard
            label="Corriente Red F3"
            name="corriente_red_f3"
            value={formData.corriente_red_f3 || ''}
            onChange={handleChange}
            type="number"
            unit="A"
          />
        )}
        {showNeutro && (
          <InputCard
            label="Corriente Red Neutro"
            name="corriente_red_n"
            value={formData.corriente_red_n || ''}
            onChange={handleChange}
            type="number"
            unit="A"
          />
        )}
      </div>

      {/* Grupo: Paneles Solares */}
      {showPaneles && (
        <div className="space-y-4 border border-green-200 p-4 rounded-xl bg-green-50 animate-fade-in">
          <h3 className="font-bold text-gray-700">☀️ Paneles Solares</h3>
          <InputCard
            label="Corriente Paneles F1"
            name="corriente_paneles_f1"
            value={formData.corriente_paneles_f1 || ''}
            onChange={handleChange}
            type="number"
            unit="A"
          />
          {showF2 && (
            <InputCard
              label="Corriente Paneles F2"
              name="corriente_paneles_f2"
              value={formData.corriente_paneles_f2 || ''}
              onChange={handleChange}
              type="number"
              unit="A"
            />
          )}
          {showF3 && (
            <InputCard
              label="Corriente Paneles F3"
              name="corriente_paneles_f3"
              value={formData.corriente_paneles_f3 || ''}
              onChange={handleChange}
              type="number"
              unit="A"
            />
          )}
          <InputCard
            label="Cantidad"
            name="cantidad_paneles"
            value={formData.cantidad_paneles || ''}
            onChange={handleChange}
            type="number"
            unit="pzas"
          />
          <InputCard
            label="Watts por Panel"
            name="watts_por_panel"
            value={formData.watts_por_panel || ''}
            onChange={handleChange}
            type="number"
            unit="W"
          />
          <InputCard
            label="Antigüedad"
            name="paneles_antiguedad_anos"
            value={formData.paneles_antiguedad_anos || ''}
            onChange={handleChange}
            type="number"
            unit="años"
          />
        </div>
      )}
    </div>
  );
};

export default Step3_Mediciones;