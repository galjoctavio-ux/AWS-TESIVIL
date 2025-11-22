import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { PlusCircle } from 'lucide-react';

const CAUSAS_ALTO_CONSUMO = [
  "Fugas de corriente en la instalación eléctrica.",
  "Uso excesivo de electrodomésticos de alto consumo.",
  "Equipos en mal estado que consumen más de lo normal.",
  "Malas prácticas, como dejar luces y aparatos encendidos innecesariamente.",
  "Fallas en otras instalaciones.",
];

const RECOMENDACIONES_SUGERIDAS = [
  "Cambiar refrigerador por uno inverter",
  "Balancear cargas en el centro de carga",
  "Apretar conexiones en el centro de carga",
  "Instalar varilla a tierra física",
  "Revisar cableado interno por fugas",
  "Reemplazar focos por tecnología LED",
  "Mantenimiento a Aire Acondicionado"
];

const Step6_Resumen = ({ formData, updateFormData }) => {
  const sigCanvas = useRef(null);

  const handleCausasChange = (e) => {
    const { value, checked } = e.target;
    const currentCausas = formData.causas_alto_consumo || [];
    let newCausas;
    if (checked) {
      newCausas = [...currentCausas, value];
    } else {
      newCausas = currentCausas.filter((causa) => causa !== value);
    }
    updateFormData({ causas_alto_consumo: newCausas });
  };

  const handleRecomendacionesChange = (e) => {
    updateFormData({ recomendaciones_tecnico: e.target.value });
  };

  const addRecomendacion = (texto) => {
    const currentText = formData.recomendaciones_tecnico || '';
    // Añade salto de línea si ya hay texto, o empieza limpio
    const separator = currentText.length > 0 ? '\n- ' : '- ';
    const newText = currentText + separator + texto;
    updateFormData({ recomendaciones_tecnico: newText });
  };

  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      updateFormData({ firmaBase64: null });
    }
  };

  const handleSignatureEnd = () => {
    if (sigCanvas.current) {
      const signature = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      updateFormData({ firmaBase64: signature });
    }
  };

  return (
    <div className="space-y-8 animate-slide-in">
      <div>
        <label className="text-lg font-bold text-gray-800">Causas de Alto Consumo</label>
        <div className="mt-3 space-y-3">
          {CAUSAS_ALTO_CONSUMO.map((causa) => (
            <label key={causa} className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                value={causa}
                checked={(formData.causas_alto_consumo || []).includes(causa)}
                onChange={handleCausasChange}
                className="h-6 w-6 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-4 text-md text-gray-700">{causa}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="recomendaciones_tecnico" className="text-lg font-bold text-gray-800">Recomendaciones Finales</label>

        {/* Chips de Sugerencias */}
        <div className="flex flex-wrap gap-2 mt-2 mb-3">
          {RECOMENDACIONES_SUGERIDAS.map((sugerencia, index) => (
            <button
              key={index}
              type="button"
              onClick={() => addRecomendacion(sugerencia)}
              className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-100 border border-blue-200 transition-colors"
            >
              <PlusCircle size={14} />
              {sugerencia}
            </button>
          ))}
        </div>

        <textarea
          id="recomendaciones_tecnico"
          rows="5"
          className="w-full p-3 bg-white rounded-lg shadow-sm border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          placeholder="Selecciona sugerencias arriba o escribe aquí..."
          value={formData.recomendaciones_tecnico || ''}
          onChange={handleRecomendacionesChange}
        />
      </div>

      <div>
        <label className="text-lg font-bold text-gray-800">Firma del Cliente</label>
        <div className="mt-3 relative w-full h-48 bg-white border-2 border-dashed border-gray-300 rounded-lg touch-none">
          <SignatureCanvas
            ref={sigCanvas}
            penColor='black'
            canvasProps={{ className: 'w-full h-full' }}
            onEnd={handleSignatureEnd}
          />
        </div>
        <div className="text-right mt-2">
          <button
            type="button"
            onClick={clearSignature}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            Borrar Firma
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step6_Resumen;