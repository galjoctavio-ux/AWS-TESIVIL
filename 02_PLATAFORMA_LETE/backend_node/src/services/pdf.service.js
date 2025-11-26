import puppeteer from 'puppeteer';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// ---------------------------------------------------------
// 1. CONFIGURACIÓN Y ESTILOS
// ---------------------------------------------------------
const checkIcon = `<svg style="width:14px;vertical-align:middle;margin-right:4px;" viewBox="0 0 24 24" fill="none" stroke="#2b8a3e" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
  
  body { font-family: 'Inter', sans-serif; padding: 40px; color: #1f2937; margin: 0; background: #fff; font-size: 11px; line-height: 1.5; }
  
  /* HEADER */
  .header-container { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 25px; }
  .brand-section h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #000; text-transform: uppercase; }
  .brand-section .subtitle { font-size: 9px; color: #6b7280; letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; }
  
  .client-card { text-align: right; }
  .client-name { font-size: 14px; font-weight: 700; color: #111827; }
  .client-address { font-size: 10px; color: #6b7280; max-width: 250px; margin-left: auto; }
  
  /* TITLE BLOCK */
  .report-title { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 25px; }
  .main-title { font-size: 24px; font-weight: 900; line-height: 1; color: #111; }
  .main-title span { display: block; font-size: 10px; font-weight: 500; color: #ef4444; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 5px; }
  
  .meta-grid { display: grid; grid-template-columns: auto auto auto; gap: 15px; text-align: right; }
  .meta-item strong { display: block; font-size: 8px; text-transform: uppercase; color: #9ca3af; }
  .meta-item div { font-weight: 600; font-size: 11px; }

  /* SECTION HEADERS */
  .section-title { 
    font-size: 10px; font-weight: 700; text-transform: uppercase; color: #4b5563; 
    border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin: 20px 0 10px 0; 
    display: flex; justify-content: space-between; align-items: center;
  }

  /* HALLAZGOS TABLE (Estilo PHP replicado) */
  .hallazgos-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  
  .info-table { width: 100%; border-collapse: collapse; font-size: 10px; }
  .info-table td { padding: 6px 8px; border-bottom: 1px solid #f3f4f6; }
  .info-table .lbl { font-weight: 600; color: #6b7280; width: 60%; }
  .info-table .val { font-weight: 700; color: #111; }
  
  /* Validaciones visuales */
  .val-bueno { color: #059669 !important; } /* Verde */
  .val-malo { color: #dc2626 !important; }  /* Rojo */
  .val-warn { color: #d97706 !important; }  /* Naranja */

  /* KPI CARDS */
  .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
  .kpi-card { padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb; background: #f9fafb; }
  .kpi-label { font-size: 8px; text-transform: uppercase; color: #6b7280; font-weight: 600; margin-bottom: 4px; }
  .kpi-value { font-size: 18px; font-weight: 800; color: #111; }
  .kpi-unit { font-size: 9px; font-weight: 500; color: #6b7280; margin-left: 2px; }
  .kpi-card.warning { background: #fef2f2; border-color: #fee2e2; }
  .kpi-card.warning .kpi-value { color: #dc2626; }

  /* EQUIPOS TABLE */
  table.main-table { width: 100%; border-collapse: collapse; font-size: 10px; }
  table.main-table th { text-align: left; padding: 8px; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-size: 8px; text-transform: uppercase; font-weight: 600; }
  table.main-table td { padding: 8px; border-bottom: 1px solid #f3f4f6; color: #374151; }
  
  .status-badge { padding: 2px 6px; border-radius: 10px; font-size: 8px; font-weight: 700; display: inline-block; text-transform: uppercase; }
  .status-good { background: #d1fae5; color: #065f46; }
  .status-bad { background: #fee2e2; color: #991b1b; }
  .status-warn { background: #fef3c7; color: #92400e; }

  /* AI BOX */
  .ai-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
  .ai-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .ai-title { font-weight: 700; color: #0f172a; font-size: 10px; text-transform: uppercase; }
  .ai-badge { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; font-size: 8px; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
  .ai-content { font-size: 10px; color: #334155; text-align: justify; font-style: italic; }

  /* FIRMAS */
  .footer-signatures { display: flex; justify-content: space-between; margin-top: 40px; page-break-inside: avoid; }
  .sig-box { width: 45%; border-top: 1px solid #d1d5db; padding-top: 8px; text-align: center; }
  .sig-img { height: 45px; object-fit: contain; display: block; margin: 0 auto 5px auto; }
  .sig-placeholder { height: 45px; }

  /* PROMO */
  .promo-box { margin-top: 25px; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 12px; display: flex; gap: 15px; background: #f8fafc; page-break-inside: avoid; }
  .promo-price { background: #0f172a; color: white; padding: 10px; border-radius: 6px; text-align: center; min-width: 80px; display: flex; flex-direction: column; justify-content: center; }
`;

// ---------------------------------------------------------
// 2. IA GENERATIVA (GEMINI REAL)
// ---------------------------------------------------------
const generarDiagnosticoIA = async (datos) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return "IA no configurada (Falta API Key).";

  // Preparamos los datos igual que en tu PHP para que la IA entienda el contexto
  const datosParaIA = {
    servicio: datos.mediciones?.tipo_servicio || 'Desconocido',
    hallazgos: {
      sello_cfe: datos.mediciones?.sello_cfe,
      tornillos_flojos: datos.mediciones?.tornillos_flojos,
      capacidad_ok: datos.mediciones?.capacidad_vs_calibre
    },
    fugas: {
      fuga_detectada_amp: datos.mediciones?.corriente_fuga_f1 || 0
    },
    equipos_criticos: datos.equipos?.filter(e => e.estado_equipo === 'Malo').length || 0,
    causas_reportadas: datos.causas_alto_consumo || []
  };

  const prompt = `Analiza los siguientes datos JSON de una revisión eléctrica: ${JSON.stringify(datosParaIA)}. Redacta un párrafo de 'Diagnóstico Ejecutivo' profesional, breve (max 60 palabras) y tranquilizador para el cliente. Menciona si hay riesgos críticos (fugas o tornillos flojos). Concluye positivamente. Texto plano.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 500 }
    });

    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Diagnóstico técnico completado.";
  } catch (error) {
    console.error("Error Gemini:", error.message);
    return "El análisis automatizado no está disponible en este momento. Por favor revise los hallazgos manuales.";
  }
};

// ---------------------------------------------------------
// 3. RENDERIZADO HTML
// ---------------------------------------------------------
const getHtmlReporte = (datos, textoIA) => {
  const { header, mediciones, equipos, consumo_total_estimado, recomendaciones_tecnico, causas_alto_consumo } = datos;

  // Helpers para clases CSS según valores (Lógica del PHP portada)
  const clsSello = mediciones.sello_cfe ? 'val-bueno' : 'val-malo';
  const txtSello = mediciones.sello_cfe ? 'Sí (Correcto)' : 'No (Irregular)';

  const clsTornillos = mediciones.tornillos_flojos ? 'val-malo' : 'val-bueno';
  const txtTornillos = mediciones.tornillos_flojos ? 'Sí (Riesgo Calentamiento)' : 'No';

  const clsCapacidad = mediciones.capacidad_vs_calibre ? 'val-bueno' : 'val-malo';
  const txtCapacidad = mediciones.capacidad_vs_calibre ? 'Correcto' : 'Incorrecto (Riesgo)';

  // Tabla de Equipos
  const equiposRows = equipos.map(eq => {
    let badgeClass = 'status-good';
    if (eq.estado_equipo?.match(/malo/i)) badgeClass = 'status-bad';
    if (eq.estado_equipo?.match(/regular/i)) badgeClass = 'status-warn';

    return `
      <tr>
        <td style="font-weight:600;">${eq.nombre_equipo}</td>
        <td>${eq.ubicacion || '-'}</td>
        <td>${eq.amperaje} A</td>
        <td><strong>${eq.kwh_bimestre?.toFixed(1) || 0}</strong> kWh</td>
        <td><span class="status-badge ${badgeClass}">${eq.estado_equipo || 'N/A'}</span></td>
      </tr>
    `;
  }).join('');

  const causasList = causas_alto_consumo?.map(c => `<li>${c}</li>`).join('') || '<li>No se reportaron anomalías específicas.</li>';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>${styles}</style>
    </head>
    <body>

      <div class="header-container">
        <div class="brand-section">
          <h1>Luz en tu Espacio</h1>
          <div class="subtitle">Ingeniería & Eficiencia Energética</div>
        </div>
        <div class="client-card">
          <div class="client-name">${header.cliente_nombre || 'Cliente'}</div>
          <div class="client-address">${header.cliente_direccion || ''}</div>
          <div style="font-size:9px; color:#9ca3af;">${header.cliente_email || ''}</div>
        </div>
      </div>

      <div class="report-title">
        <div class="main-title">
          <span>REPORTE DE DIAGNÓSTICO</span>
          POR ALTO CONSUMO
        </div>
        <div class="meta-grid">
          <div class="meta-item"><strong>Folio</strong><div>#${header.id}</div></div>
          <div class="meta-item"><strong>Fecha</strong><div>${new Date(header.fecha_revision).toLocaleDateString()}</div></div>
          <div class="meta-item"><strong>Técnico</strong><div>${header.tecnico_nombre?.split(' ')[0] || 'Ingeniero'}</div></div>
        </div>
      </div>

      <div class="ai-box">
        <div class="ai-header">
          <span class="ai-title">Diagnóstico Ejecutivo</span>
          <span class="ai-badge">Gemini AI</span>
        </div>
        <div class="ai-content">
          ${textoIA}
        </div>
      </div>

      <div class="hallazgos-grid">
        
        <div>
          <div class="section-title">Hallazgos de Instalación</div>
          <table class="info-table">
            <tr><td class="lbl">Tipo Servicio</td><td class="val">${mediciones.tipo_servicio || 'Monofásico'}</td></tr>
            <tr><td class="lbl">Sello CFE</td><td class="val ${clsSello}">${txtSello}</td></tr>
            <tr><td class="lbl">Tornillos Flojos</td><td class="val ${clsTornillos}">${txtTornillos}</td></tr>
            <tr><td class="lbl">Capacidad Interruptor</td><td class="val ${clsCapacidad}">${txtCapacidad}</td></tr>
            <tr><td class="lbl">Edad Instalación</td><td class="val" style="font-weight:400;">${mediciones.edad_instalacion || '-'}</td></tr>
            <tr><td class="lbl">Observaciones</td><td class="val" style="font-weight:400; font-size:9px;">${mediciones.observaciones_cc || 'Ninguna'}</td></tr>
          </table>
        </div>

        <div>
           <div class="section-title">Panel de Mediciones</div>
           <div class="kpi-grid" style="grid-template-columns: 1fr 1fr;">
              <div class="kpi-card">
                <div class="kpi-label">Voltaje (F-N)</div>
                <span class="kpi-value">${mediciones.voltaje_medido}</span><span class="kpi-unit">V</span>
              </div>
              <div class="kpi-card ${mediciones.corriente_fuga_f1 > 0.5 ? 'warning' : ''}">
                <div class="kpi-label">Fuga Detectada</div>
                <span class="kpi-value">${mediciones.corriente_fuga_f1}</span><span class="kpi-unit">A</span>
              </div>
           </div>
           
           <table class="info-table">
             <tr><td class="lbl">Corriente F1</td><td class="val">${mediciones.corriente_red_f1} A</td></tr>
             ${mediciones.corriente_red_f2 > 0 ? `<tr><td class="lbl">Corriente F2</td><td class="val">${mediciones.corriente_red_f2} A</td></tr>` : ''}
             ${mediciones.corriente_red_f3 > 0 ? `<tr><td class="lbl">Corriente F3</td><td class="val">${mediciones.corriente_red_f3} A</td></tr>` : ''}
             <tr><td class="lbl">Consumo Est.</td><td class="val">${consumo_total_estimado?.toFixed(1)} kWh</td></tr>
           </table>
        </div>

      </div>

      <div class="section-title" style="margin-top:30px;">Desglose de Equipos</div>
      <table class="main-table">
        <thead>
          <tr>
            <th width="35%">Equipo</th>
            <th width="25%">Ubicación</th>
            <th width="15%">Amp.</th>
            <th width="15%">Consumo</th>
            <th width="10%">Estado</th>
          </tr>
        </thead>
        <tbody>
          ${equiposRows || '<tr><td colspan="5" style="text-align:center">Sin equipos</td></tr>'}
        </tbody>
      </table>

      <div class="section-title">Conclusiones Técnicas</div>
      <div style="background:#fff; border:1px solid #f3f4f6; padding:10px; border-radius:6px;">
        <strong style="font-size:10px; color:#111;">Causas Detectadas:</strong>
        <ul style="margin:5px 0 15px 0; padding-left:20px; font-size:10px;">${causasList}</ul>
        
        <strong style="font-size:10px; color:#111;">Recomendaciones:</strong>
        <p style="margin:5px 0 0 0; font-size:10px; white-space:pre-wrap;">${recomendaciones_tecnico || 'Sin recomendaciones adicionales.'}</p>
      </div>

      <div class="footer-signatures">
        <div class="sig-box">
           ${header.firma_ingeniero_url
      ? `<img src="${header.firma_ingeniero_url}" class="sig-img" />`
      : `<div class="sig-placeholder"></div>`
    }
           <div style="font-weight:700; font-size:10px;">${header.tecnico_nombre}</div>
           <div style="font-size:8px; color:#6b7280;">Ingeniero Responsable</div>
        </div>
        <div class="sig-box">
           ${datos.firma_cliente_url
      ? `<img src="${datos.firma_cliente_url}" class="sig-img" />`
      : `<div class="sig-placeholder"></div>`
    }
           <div style="font-weight:700; font-size:10px;">Firma del Cliente</div>
           <div style="font-size:8px; color:#6b7280;">Conformidad de Servicio</div>
        </div>
      </div>

      <div class="promo-box">
        <div style="flex:1;">
          <div style="font-weight:800; font-size:12px; margin-bottom:4px;">¿Tu recibo no baja? Encuentra el "Consumo Fantasma"</div>
          <div style="font-size:9px; color:#555;">El servicio <strong>Cuentatrón</strong> vigila tu instalación 24/7. Detectamos fugas ocultas y calculamos pérdidas en dinero.</div>
        </div>
        <div class="promo-price">
          <span style="font-size:16px; font-weight:800;">$999</span>
          <span style="font-size:8px;">MXN</span>
        </div>
      </div>

    </body>
    </html>
  `;
};

// ---------------------------------------------------------
// 4. FUNCIÓN PRINCIPAL
// ---------------------------------------------------------
export const generarPDF = async (datos) => {
  try {
    console.log('[PDF Service] Solicitando análisis a Gemini...');

    // 1. Obtener Análisis Real
    const textoIA = await generarDiagnosticoIA(datos);

    // 2. Generar HTML
    const html = getHtmlReporte(datos, textoIA);

    // 3. Renderizar PDF
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: 'new'
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
    });

    await browser.close();
    return pdfBuffer;

  } catch (error) {
    console.error("Error generando PDF:", error);
    return null;
  }
};