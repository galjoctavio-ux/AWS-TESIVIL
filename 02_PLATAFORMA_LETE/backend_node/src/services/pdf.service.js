import puppeteer from 'puppeteer';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// ---------------------------------------------------------
// 1. GENERACIÓN DE DIAGNÓSTICO CON IA (GEMINI 2.5 FLASH)
// ---------------------------------------------------------
const generarDiagnosticoIA = async (datosRevision) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return "IA no configurada en el sistema.";

  // Modelo actualizado
  const model = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Preparamos el contexto para la IA
  const datosParaIA = {
    servicio: datosRevision.mediciones?.tipo_servicio,
    hallazgos_criticos: {
      sello_cfe: datosRevision.mediciones?.sello_cfe,
      tornillos_flojos: datosRevision.mediciones?.tornillos_flojos,
      capacidad_correcta: datosRevision.mediciones?.capacidad_vs_calibre,
    },
    fugas: datosRevision.mediciones?.corriente_fuga_f1,
    consumo_estimado: datosRevision.consumo_total_estimado + " kWh/bimestre",
    top_3_consumidores: datosRevision.equipos?.slice(0, 3).map(e => e.nombre_equipo),
    recomendaciones: datosRevision.recomendaciones_tecnico
  };

  const prompt = `
    Eres un ingeniero experto de la empresa 'Luz en tu Espacio'.
    Analiza estos datos: ${JSON.stringify(datosParaIA)}.
    Escribe un 'Diagnóstico Ejecutivo' para el cliente.
    Requisitos:
    1. Máximo 60 palabras.
    2. Menciona si el consumo estimado es alto o normal.
    3. Menciona el equipo que más gasta.
    4. Sé profesional, empático y claro.
    5. Si hay fugas o riesgos, advierte amablemente.
    Responde solo con el texto del párrafo.
  `;

  try {
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 400 }
    });

    if (response.data && response.data.candidates && response.data.candidates[0].content) {
      return response.data.candidates[0].content.parts[0].text.trim();
    }
    return 'Diagnóstico técnico completado. Por favor revise los detalles numéricos a continuación.';
  } catch (error) {
    console.warn('Error al conectar con Gemini:', error.message);
    return 'Revisión técnica realizada. Se anexan mediciones y observaciones del técnico.';
  }
};

// ---------------------------------------------------------
// 2. CONSTRUCCIÓN DEL HTML DEL REPORTE
// ---------------------------------------------------------
const getHtmlPlantilla = (datos, diagnosticoIA) => {
  // Helpers de formato
  const formatNum = (num) => parseFloat(num || 0).toFixed(1);
  const formatCurrency = (num) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num);
  const formatDate = (d) => {
    try { return new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }); }
    catch (e) { return d; }
  };

  // Clases CSS condicionales
  const valBueno = 'val-bueno';
  const valMalo = 'val-malo';

  // ---------------- TABLA DE EQUIPOS (Con kWh) ----------------
  let equiposHtml = '';
  if (datos.equipos && datos.equipos.length > 0) {
    datos.equipos.forEach(eq => {
      const estado = eq.estado_equipo || '';
      equiposHtml += `
            <tr class="equipo-estado-${estado}">
                <td>${eq.nombre_equipo}</td>
                <td>${eq.ubicacion || ''}</td>
                <td style="text-align:center;">${formatNum(eq.amperaje)} A</td>
                <td style="text-align:center;"><strong>${formatNum(eq.kwh_bimestre)}</strong></td>
                <td style="text-align:center;">${estado}</td>
            </tr>`;
    });
    // Fila de Total
    equiposHtml += `
        <tr class="total-row">
            <td colspan="3" style="text-align:right;">Consumo Bimestral Estimado (Carga Conectada):</td>
            <td style="text-align:center;">${formatNum(datos.consumo_total_estimado)} kWh</td>
            <td></td>
        </tr>
      `;
  } else {
    equiposHtml = '<tr><td colspan="5" style="text-align:center; padding:15px;">No se registraron equipos de consumo significativo.</td></tr>';
  }

  // ---------------- CAUSAS Y RECOMENDACIONES ----------------
  let causasHtml = (datos.causas_alto_consumo || [])
    .map(c => `<li>${c}</li>`)
    .join('');

  if (!causasHtml) causasHtml = '<li>No se detectaron causas críticas evidentes en esta visita rápida.</li>';

  // ---------------- PANELES SOLARES ----------------
  let solaresHtml = '';
  if (datos.mediciones?.cantidad_paneles > 0) {
    solaresHtml = `
        <div class="section-title">Sistema Fotovoltaico</div>
        <table class="data-table">
            <tr>
                <td><strong>Paneles Instalados:</strong> ${datos.mediciones.cantidad_paneles} pzas</td>
                <td><strong>Potencia:</strong> ${datos.mediciones.watts_por_panel} W c/u</td>
                <td><strong>Antigüedad:</strong> ${datos.mediciones.paneles_antiguedad_anos} años</td>
            </tr>
        </table>`;
  }

  // ---------------- HTML COMPLETO ----------------
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Reporte Técnico LETE</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
        
        @page { margin: 20px 40px; }
        
        body { font-family: 'Roboto', sans-serif; color: #333; font-size: 11px; line-height: 1.4; }
        
        /* Header */
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0056b3; padding-bottom: 10px; margin-bottom: 20px; }
        .logo { height: 55px; }
        .report-meta { text-align: right; color: #555; font-size: 10px; }
        .report-meta h1 { margin: 0; font-size: 16px; color: #0056b3; text-transform: uppercase; }
        
        /* Cajas Informativas */
        .info-grid { display: flex; gap: 15px; margin-bottom: 20px; }
        .info-box { flex: 1; background: #f8f9fa; border-left: 4px solid #0056b3; padding: 10px; border-radius: 4px; }
        .info-label { font-weight: bold; color: #0056b3; font-size: 9px; text-transform: uppercase; margin-bottom: 3px; }
        .info-val { font-size: 11px; }

        /* Títulos */
        .section-title { background: #0056b3; color: white; padding: 6px 12px; font-weight: bold; font-size: 12px; border-radius: 4px 4px 0 0; margin-top: 20px; }
        
        /* Tablas */
        table { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
        th { background: #e9ecef; color: #495057; padding: 8px; text-align: left; font-size: 10px; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #dee2e6; }
        td { padding: 8px; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
        
        /* Colores de Estado */
        .val-bueno { color: #28a745; font-weight: bold; }
        .val-malo { color: #dc3545; font-weight: bold; }
        .equipo-estado-Malo { background-color: #ffebee; }
        .equipo-estado-Regular { background-color: #fff3e0; }
        .total-row { background-color: #e3f2fd; font-weight: bold; border-top: 2px solid #90caf9; }

        /* IA Box */
        .ia-container { background: #f0f7ff; border: 1px solid #cce5ff; padding: 15px; border-radius: 6px; margin-bottom: 15px; position: relative; }
        .ia-badge { position: absolute; top: -10px; right: 15px; background: linear-gradient(45deg, #0056b3, #00a8ff); color: white; padding: 2px 8px; font-size: 9px; border-radius: 10px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .ia-text { font-style: italic; color: #444; text-align: justify; font-size: 12px; }

        /* SECCIÓN CUENTATRÓN (UPSELL) */
        .cuentatron-section {
            margin-top: 30px;
            border: 2px solid #FFC107; /* Amber border */
            border-radius: 8px;
            overflow: hidden;
            background-color: #fff;
            page-break-inside: avoid;
        }
        .ct-header {
            background: #212529;
            color: #FFC107;
            padding: 10px 15px;
            font-size: 14px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .ct-body {
            padding: 15px;
            display: flex;
            gap: 20px;
        }
        .ct-content { flex: 2; }
        .ct-cta-box { 
            flex: 1; 
            background: #fffbf0; 
            border: 1px dashed #FFC107; 
            border-radius: 8px; 
            padding: 15px; 
            text-align: center; 
            display: flex; 
            flex-direction: column; 
            justify-content: center; 
            align-items: center;
        }
        .ct-title { font-size: 13px; font-weight: bold; color: #d32f2f; margin-bottom: 5px; }
        .ct-text { font-size: 10px; color: #555; text-align: justify; margin-bottom: 10px; }
        .ct-list { font-size: 10px; color: #444; margin: 5px 0 10px 15px; padding: 0; }
        .ct-btn {
            background: #d32f2f;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 50px;
            font-weight: bold;
            font-size: 11px;
            display: inline-block;
            box-shadow: 0 3px 6px rgba(0,0,0,0.15);
            margin-bottom: 8px;
        }
        .ct-price { font-size: 16px; font-weight: bold; color: #212529; margin: 5px 0; }
        .ct-guarantee { font-size: 9px; color: #666; font-style: italic; margin-top: 5px; }

        /* Firmas */
        .signatures { margin-top: 30px; display: flex; justify-content: space-around; text-align: center; page-break-inside: avoid; }
        .sig-box { width: 200px; border-top: 1px solid #ccc; padding-top: 10px; }
        .sig-img { max-height: 60px; display: block; margin: 0 auto 5px auto; }
      </style>
    </head>
    <body>

      <div class="header">
        <img src="https://i.imgur.com/Q9bQ23T.png" class="logo" alt="LETE Logo">
        <div class="report-meta">
            <h1>Reporte de Diagnóstico</h1>
            <div>Folio: #${datos.header?.id}</div>
            <div>Fecha: ${formatDate(datos.header?.fecha_revision)}</div>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-box">
            <div class="info-label">Cliente</div>
            <div class="info-val"><strong>${datos.header?.cliente_nombre}</strong></div>
            <div class="info-val">${datos.header?.cliente_direccion}</div>
            <div class="info-val">${datos.header?.cliente_email}</div>
        </div>
        <div class="info-box">
            <div class="info-label">Técnico Asignado</div>
            <div class="info-val"><strong>${datos.header?.tecnico_nombre}</strong></div>
            <div class="info-val">Ingeniería Civil y Eléctrica</div>
        </div>
      </div>

      <div class="ia-container">
         <div class="ia-badge">Análisis Gemini AI</div>
         <div class="ia-text">"${diagnosticoIA}"</div>
      </div>

      <table style="margin-top: 10px;">
        <tr>
            <td width="50%" style="vertical-align: top; padding-right: 10px; border: none;">
                <div class="section-title" style="margin-top: 0;">Instalación Eléctrica</div>
                <table>
                    <tr><td>Servicio</td><td>${datos.mediciones?.tipo_servicio || 'N/A'}</td></tr>
                    <tr><td>Sello CFE</td><td class="${datos.mediciones?.sello_cfe ? valBueno : valMalo}">${datos.mediciones?.sello_cfe ? 'Presente' : 'Ausente'}</td></tr>
                    <tr><td>Conexiones C.C.</td><td class="${datos.mediciones?.tornillos_flojos ? valMalo : valBueno}">${datos.mediciones?.tornillos_flojos ? 'Flojas (Riesgo)' : 'Correctas'}</td></tr>
                    <tr><td>Protecciones</td><td class="${datos.mediciones?.capacidad_vs_calibre ? valBueno : valMalo}">${datos.mediciones?.capacidad_vs_calibre ? 'Adecuadas' : 'Inadecuadas'}</td></tr>
                </table>
            </td>
            <td width="50%" style="vertical-align: top; padding-left: 10px; border: none;">
                 <div class="section-title" style="margin-top: 0;">Mediciones Críticas</div>
                 <table>
                    <tr><td>Voltaje (F-N)</td><td><strong>${formatNum(datos.mediciones?.voltaje_medido)} V</strong></td></tr>
                    <tr><td>Consumo Instantáneo</td><td>${formatNum(datos.mediciones?.corriente_red_f1)} A</td></tr>
                    <tr><td>Fugas Detectadas</td><td class="${datos.mediciones?.corriente_fuga_f1 > 0.1 ? valMalo : valBueno}">${formatNum(datos.mediciones?.corriente_fuga_f1)} A</td></tr>
                    <tr><td>Fases Activas</td><td>${datos.mediciones?.tipo_servicio?.includes('Tri') ? '3' : (datos.mediciones?.tipo_servicio?.includes('2F') ? '2' : '1')}</td></tr>
                 </table>
            </td>
        </tr>
      </table>

      ${solaresHtml}

      <div class="section-title">Desglose de Consumo Estimado (Top Consumidores)</div>
      <table>
        <thead>
            <tr>
                <th width="30%">Equipo</th>
                <th width="25%">Ubicación</th>
                <th width="15%" style="text-align:center;">Amperaje</th>
                <th width="15%" style="text-align:center;">kWh/Bimestre</th>
                <th width="15%" style="text-align:center;">Estado</th>
            </tr>
        </thead>
        <tbody>
            ${equiposHtml}
        </tbody>
      </table>
      <div style="font-size: 9px; color: #666; margin-top: 2px;">* Cálculo estimado basado en amperaje medido y horas de uso reportadas.</div>

      <div class="section-title">Conclusiones del Ingeniero</div>
      <div style="padding: 10px; background: #fff;">
        <p><strong>Causas Probables del Alto Consumo:</strong></p>
        <ul style="margin-top: 0;">${causasHtml}</ul>
        
        <p><strong>Recomendaciones Técnicas:</strong></p>
        <div style="background-color: #f1f3f5; padding: 10px; border-radius: 4px; border-left: 3px solid #adb5bd; white-space: pre-line;">
            ${datos.recomendaciones_tecnico || 'Sin recomendaciones específicas.'}
        </div>
      </div>

      <div class="cuentatron-section">
         <div class="ct-header">
            <span>⚠️ ¿Tu recibo sigue siendo una pesadilla?</span>
            <span style="font-size:11px; background:#000; padding:2px 6px; border-radius:4px;">SERVICIO PREMIUM</span>
         </div>
         <div class="ct-body">
            <div class="ct-content">
                <div class="ct-title">Identifica y elimina el "consumo fantasma"</div>
                <div class="ct-text">
                    En 7 de cada 10 casos, la revisión visual resuelve el problema. Pero si tu recibo sigue alto, podrías tener fugas invisibles. Los problemas intermitentes (bombas que se pegan, ciclos erráticos de refrigeradores) no se ven en 1 hora.
                </div>
                <div class="ct-text">
                    <strong>El Monitoreo Especial de 7 Días (Cuentatrón):</strong> Instalamos un dispositivo de grado ingeniería que vigila tu consumo 24/7. Un Ingeniero (no un robot) analiza los datos.
                </div>
                <ul class="ct-list">
                    <li>✅ Detectamos fugas a tierra que no botan la pastilla.</li>
                    <li>✅ Gráficas de consumo Día vs. Noche.</li>
                    <li>✅ Análisis de Consumo "Fantasma" (en $ y kWh).</li>
                    <li>✅ <strong>Garantía:</strong> Si no encontramos anomalías, te regresamos tu anticipo.</li>
                </ul>
            </div>
            <div class="ct-cta-box">
                <div style="font-size:10px; font-weight:bold; text-transform:uppercase;">Inversión Total</div>
                <div class="ct-price">$999 MXN</div>
                <div style="font-size:9px; margin-bottom:10px;">(50% Anticipo / 50% al Final)</div>
                
                <a href="https://www.tesivil.com/cuentatron/diagnostico" class="ct-btn">
                    QUIERO MI DIAGNÓSTICO
                </a>
                <div class="ct-guarantee">🛡️ Garantía de Certeza</div>
            </div>
         </div>
      </div>

      <div class="signatures">
        <div class="sig-box">
            <div style="font-weight: bold; margin-bottom: 30px;">ING. OCTAVIO GALLEGOS</div> 
            <div style="font-size: 10px; color: #777;">Ingeniero Responsable</div>
        </div>
        <div class="sig-box">
            ${datos.firma_base64 ? `<img src="${datos.firma_base64}" class="sig-img">` : '<div style="height:60px;"></div>'}
            <div style="font-size: 10px; color: #777;">Firma de Conformidad del Cliente</div>
        </div>
      </div>

    </body>
    </html>
  `;
};

// ---------------------------------------------------------
// 3. FUNCIÓN PRINCIPAL DE GENERACIÓN
// ---------------------------------------------------------
export const generarPDF = async (datos) => {
  console.log('[PDF Service] Generando reporte profesional con Gemini 2.5...');

  // 1. Consultar IA
  const diagnosticoIA = await generarDiagnosticoIA(datos);

  // 2. Armar HTML
  const html = getHtmlPlantilla(datos, diagnosticoIA);

  // 3. Renderizar PDF con Puppeteer
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
  });

  await browser.close();
  return pdfBuffer;
};