import React from 'react';
import { Trash2, Plus, AlertTriangle } from 'lucide-react';
import InputCard from '../ui/InputCard';
import SelectCard from '../ui/SelectCard';

// Definimos los límites suaves basados en tus reglas.
const LIMITES_REFERENCIA = {
  'Refrigerador': 1.2,
  'Aire Acondicionado': 8.0,
  'Ventilador': 0.4,
  'Lavadora': 4.0,
  'Secadora': 12.0,
  'TV': 1.0,
  'Bomba de Agua': 6.0,
  'Iluminación': 3.0,
  'Microondas': 10.0,
  'Computadora': 4.0
};

const Step5_Equipos = ({ formData, updateFormData }) => {

  const equipos = formData.equiposData || [];

  const handleAddEquipo = () => {
    const newEquipo = {
      id: Date.now(),
      nombre_equipo: 'Refrigerador',
      nombre_personalizado: '',
      amperaje_medido: '',
      tiempo_uso: '',
      unidad_tiempo: 'Horas/Día',
      estado_equipo: 'Bueno'
    };
    updateFormData({ equiposData: [...equipos, newEquipo] });
  };

  const handleRemoveEquipo = (id) => {
    updateFormData({
      equiposData: equipos.filter(eq => eq.id !== id)
    });
  };

  const handleEquipoChange = (id, field, value) => {
    const updatedEquipos = equipos.map(eq =>
      eq.id === id ? { ...eq, [field]: value } : eq
    );
    updateFormData({ equiposData: updatedEquipos });
  };

  // Función para detectar anomalías
  const getAmperajeWarning = (equipo) => {
    const val = parseFloat(equipo.amperaje_medido);
    if (isNaN(val)) return null;

    const limite = LIMITES_REFERENCIA[equipo.nombre_equipo];

    if (limite && val > limite) {
      return `El consumo (${val}A) es inusualmente alto para un(a) ${equipo.nombre_equipo}. Verifica la medición.`;
    }
    return null;
  };

  const equipoOptions = [
    'Refrigerador', 'Aire Acondicionado', 'Bomba de Agua', 'Lavadora', 'Secadora',
    'Ventilador', 'Microondas', 'Iluminación', 'TV', 'Computadora', 'Otro'
  ];
  const estadoOptions = ['Bueno', 'Regular', 'Malo'];

  return (
    <div className="animate-slide-in">

      {/* --- NUEVO: VALIDACIÓN DE CARGAS MENORES (FACTOR HOLGURA) --- */}
      <div className="mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gray-700 w-3/4">
            ¿Se incluyeron cargas menores en el inventario?
            <span className="block font-normal text-gray-500 text-xs mt-1">
              (Cargadores, focos LED, módems, equipos en stand-by)
            </span>
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={!!formData.se_midieron_cargas_menores}
              onChange={(e) => updateFormData({ se_midieron_cargas_menores: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {/* Feedback visual de la lógica matemática */}
        <div className={`mt-3 text-xs p-2 rounded ${!formData.se_midieron_cargas_menores ? 'bg-yellow-50 text-yellow-800' : 'bg-green-50 text-green-800'}`}>
          {!formData.se_midieron_cargas_menores
            ? "ℹ️ El sistema agregará un +20% de consumo estimado para compensar lo no medido."
            : "ℹ️ Cálculo exacto: Se usará solo la suma de los equipos listados."
          }
        </div>
      </div>

      <div className="space-y-4">
        {equipos.map(equipo => {
          const warning = getAmperajeWarning(equipo);

          return (
            <div key={equipo.id} className="bg-white shadow-md rounded-xl p-4 relative animate-fade-in border border-gray-100">
              <button
                onClick={() => handleRemoveEquipo(equipo.id)}
                className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1 bg-red-50 rounded-full transition-colors"
                aria-label="Eliminar equipo"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <div className="space-y-4">
                <SelectCard
                  label="Nombre Equipo"
                  name="nombre_equipo"
                  value={equipo.nombre_equipo}
                  onChange={(e) => handleEquipoChange(equipo.id, 'nombre_equipo', e.target.value)}
                  options={equipoOptions}
                />

                <InputCard
                  label={equipo.nombre_equipo === 'Otro' ? "Nombre Personalizado" : "Ubicación / Detalle"}
                  name="nombre_personalizado"
                  value={equipo.nombre_personalizado}
                  onChange={(e) => handleEquipoChange(equipo.id, 'nombre_personalizado', e.target.value)}
                  placeholder="Ej. Sala, Cocina, Recámara principal"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <InputCard
                      label="Amperaje"
                      name="amperaje_medido"
                      value={equipo.amperaje_medido}
                      onChange={(e) => handleEquipoChange(equipo.id, 'amperaje_medido', e.target.value)}
                      unit="A"
                      type="number"
                    />
                    {warning && (
                      <div className="mt-2 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded-md border border-amber-200">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{warning}</span>
                      </div>
                    )}
                  </div>

                  {/* Layout de Tiempo + Frecuencia */}
                  <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200">
                    <label htmlFor={`tiempo_uso_${equipo.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Tiempo de Uso
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        id={`tiempo_uso_${equipo.id}`}
                        name="tiempo_uso"
                        value={equipo.tiempo_uso}
                        onChange={(e) => handleEquipoChange(equipo.id, 'tiempo_uso', e.target.value)}
                        type="number"
                        placeholder="0"
                        className="flex-1 min-w-0 w-full p-3 bg-gray-50 border-gray-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <select
                        name="unidad_tiempo"
                        value={equipo.unidad_tiempo}
                        onChange={(e) => handleEquipoChange(equipo.id, 'unidad_tiempo', e.target.value)}
                        className="w-32 p-3 bg-gray-50 border-gray-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      >
                        <option>Horas/Día</option>
                        <option>Horas/Semana</option>
                      </select>
                    </div>
                  </div>
                </div>

                <SelectCard
                  label="Estado"
                  name="estado_equipo"
                  value={equipo.estado_equipo}
                  onChange={(e) => handleEquipoChange(equipo.id, 'estado_equipo', e.target.value)}
                  options={estadoOptions}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <button
          onClick={handleAddEquipo}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Agregar Equipo
        </button>
      </div>
    </div>
  );
};

export default Step5_Equipos;