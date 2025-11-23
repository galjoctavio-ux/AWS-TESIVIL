import puppeteer from 'puppeteer';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// ---------------------------------------------------------
// 1. FUNCIONES AUXILIARES (Simulación de IA y Iconos)
// ---------------------------------------------------------

// Placeholder para la IA (para que no falle la llamada en generarPDF)
const generarDiagnosticoIA = async (datos) => {
  return "Análisis base: El consumo reportado coincide con la carga instalada, aunque se detectan oportunidades de ahorro en iluminación y equipos antiguos.";
};

const iconCheck = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="green" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
const iconShield = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;

// ---------------------------------------------------------
// 2. GENERADOR DE PLANTILLA HTML
// ---------------------------------------------------------
const getHtmlPlantilla = (datos, diagnosticoIA) => {
  // A. Generar filas de la tabla de equipos
  const equiposHtml = datos.equipos?.map((eq, index) => `
    <tr style="background-color: ${index % 2 === 0 ? '#fff' : '#f8f9fa'};">
        <td style="padding: 6px; font-size: 10px; border-bottom: 1px solid #eee;">
            <strong>${eq.nombre_equipo}</strong>
            ${eq.nombre_equipo === 'Aire Acondicionado' ? '<br><span style="color:#f59f00; font-size:9px;">⚡ Alto Consumo</span>' : ''}
        </td>
        <td style="padding: 6px; font-size: 10px; border-bottom: 1px solid #eee;">${eq.ubicacion || 'General'}</td>
        <td style="padding: 6px; font-size: 10px; border-bottom: 1px solid #eee; text-align: center;">${eq.amperaje} A</td>
        <td style="padding: 6px; font-size: 10px; border-bottom: 1px solid #eee; text-align: center;"><strong>${eq.kwh_bimestre?.toFixed(1) || 0}</strong></td>
        <td style="padding: 6px; font-size: 10px; border-bottom: 1px solid #eee; text-align: center;">
            <span style="background: ${eq.estado_equipo === 'falla' ? '#ffe3e3' : '#d3f9d8'}; color: ${eq.estado_equipo === 'falla' ? '#c92a2a' : '#2b8a3e'}; padding: 2px 6px; border-radius: 4px; font-size: 9px;">
                ${eq.estado_equipo?.toUpperCase()}
            </span>
        </td>
    </tr>
  `).join('') || '<tr><td colspan="5" style="text-align:center; padding:10px;">No se registraron equipos</td></tr>';

  // B. Generar lista de causas
  const causasHtml = datos.causas_alto_consumo?.map(causa =>
    `<li>${causa}</li>`
  ).join('') || '<li>No se detectaron anomalías evidentes.</li>';

  // C. Retornar el HTML Completo
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; line-height: 1.4; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #228be6; padding-bottom: 10px; }
        .logo-text { font-size: 24px; font-weight: bold; color: #1c7ed6; }
        .meta-info { font-size: 10px; text-align: right; color: #666; }
        h1 { font-size: 18px; color: #111; margin-bottom: 5px; }
        h2 { font-size: 14px; color: #444; margin-top: 20px; border-bottom: 1px solid #dee2e6; padding-bottom: 5px; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { font-size: 10px; text-align: left; background: #e7f5ff; padding: 8px; color: #1864ab; }
        
        .promo-container { margin-top: 25px; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .promo-head { background: linear-gradient(90deg, #2b8a3e 0%, #2f9e44 100%); color: white; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: bold; }
        .promo-body { display: flex; padding: 15px; gap: 15px; }
        .promo-text { flex: 2; font-size: 11px; color: #495057; }
        .promo-cta { flex: 1; background: #fff5f5; border: 1px dashed #ffc9c9; padding: 10px; border-radius: 6px; text-align: center; }
        .feature-list { list-style: none; padding: 0; margin-top: 8px; }
        .feature-list li { display: flex; align-items: center; gap: 5px; margin-bottom: 4px; font-size: 10px; }
        .btn-promo { background: #d32f2f; color: white; text-decoration: none; padding: 6px 12px; border-radius: 4px; font-size: 10px; font-weight: bold; display: inline-block; }
        
        .signatures { margin-top: 40px; display: flex; justify-content: space-between; page-break-inside: avoid; }
        .sig-block { width: 45%; text-align: center; }
        .sig-line { border-top: 1px solid #ccc; padding-top: 5px; font-size: 11px; }
        .sig-img { height: 60px; object-fit: contain; margin-bottom: -10px; }
        .sig-placeholder { height: 50px; background: #f8f9fa; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #adb5bd; margin-bottom: 5px; }
      </style>
    </head>
    <body>

      <div class="header">
        <div>
            <div class="logo-text">TESIVIL</div>
            <div style="font-size:10px;">Tecnología y Soluciones de Ingeniería Civil y Eléctrica</div>
        </div>
        <div class="meta-info">
            <strong>Folio:</strong> #${datos.header?.id || '000'}<br>
            <strong>Fecha:</strong> ${new Date(datos.header?.fecha_revision).toLocaleDateString()}<br>
            <strong>Cliente:</strong> ${datos.header?.cliente_nombre}
        </div>
      </div>

      <h1>Reporte de Revisión Eléctrica</h1>
      <div style="font-size: 11px; margin-bottom: 15px;">
        <strong>Dirección:</strong> ${datos.header?.cliente_direccion || 'No registrada'}
      </div>

      <div style="display: flex; gap: 10px; margin-bottom: 20px;">
        <div style="flex: 1; background: #f8f9fa; padding: 10px; border-radius: 6px;">
            <div style="font-size: 9px; color: #666; text-transform: uppercase;">Consumo Estimado</div>
            <div style="font-size: 24px; font-weight: bold; color: #d6336c;">${datos.consumo_total_estimado?.toFixed(1) || 0} <span style="font-size:12px;">kWh/bimestre</span></div>
        </div>
        <div style="flex: 1; background: #e7f5ff; padding: 10px; border-radius: 6px;">
            <div style="font-size: 9px; color: #666; text-transform: uppercase;">Voltaje Medido</div>
            <div style="font-size: 24px; font-weight: bold; color: #1971c2;">${datos.mediciones?.voltaje_medido || 0} <span style="font-size:12px;">V</span></div>
        </div>
      </div>

      <h2>Desglose de Equipos Revisados</h2>
      <table>
        <thead>
            <tr>
                <th>Equipo</th> <th>Ubicación</th> <th align="center">Amp.</th> <th align="center">kWh/Bimestre</th> <th align="center">Estado</th>
            </tr>
        </thead>
        <tbody>${equiposHtml}</tbody>
      </table>
      <div style="font-size: 9px; color: #666; margin-top: 2px;">* Cálculo estimado basado en amperaje medido y horas de uso reportadas.</div>

      <div class="section-header" style="font-weight:bold; margin-top:20px; font-size:14px;">Conclusiones del Ingeniero</div>
      <div style="padding: 10px;">
        <strong>Causas Detectadas:</strong>
        <ul style="margin-top: 5px; font-size: 11px;">${causasHtml}</ul>
        
        <strong>Recomendaciones Técnicas:</strong>
        <p style="background: #f1f3f5; padding: 10px; border-left: 4px solid #ced4da; margin-top: 5px; white-space: pre-line; font-size: 11px;">
            ${datos.recomendaciones_tecnico || 'Sin recomendaciones específicas.'}
        </p>
      </div>

      <div class="promo-container">
         <div class="promo-head">
            <span>📉 ¿Tu recibo no baja? Encuentra el "Consumo Fantasma"</span>
            <span style="font-size:10px; background:black; padding:3px 6px; border-radius:4px;">SERVICIO PREMIUM</span>
         </div>
         <div class="promo-body">
            <div class="promo-text">
                Una revisión visual no ve problemas intermitentes. <strong>El servicio Cuentatrón</strong> instala equipos de ingeniería para vigilar tu casa 24/7.
                <ul class="feature-list">
                    <li>${iconCheck} Detectamos fugas ocultas a tierra.</li>
                    <li>${iconCheck} Gráficas de consumo real Día vs Noche.</li>
                    <li>${iconCheck} Calculamos pérdidas en dinero.</li>
                </ul>
            </div>
            <div class="promo-cta">
                <div style="color:#d32f2f; font-weight:bold; font-size:16px;">$999 MXN</div>
                <div style="font-size:9px; margin-bottom:8px;">(50% Anticipo - 50% Resultado)</div>
                <a href="https://www.tesivil.com/cuentatron/diagnostico" class="btn-promo">QUIERO MI DIAGNÓSTICO</a>
                <div style="font-size:9px; margin-top:6px; color:#666; display:flex; align-items:center; justify-content:center; gap:2px;">${iconShield} Garantía de Reembolso</div>
            </div>
         </div>
      </div>

      <div class="signatures">
        <div class="sig-block">
            ${datos.header?.firma_ingeniero_url
      ? `<img src="${datos.header.firma_ingeniero_url}" class="sig-img">`
      : `<div class="sig-placeholder">Sin firma digital</div>`
    }
            <div class="sig-line"><strong>${datos.header?.tecnico_nombre || 'Ingeniero'}</strong><br><span style="font-size:10px; color:#666;">Ingeniero Responsable (Cédula TESIVIL)</span></div>
        </div>

        <div class="sig-block">
             ${datos.firma_cliente_url
      ? `<img src="${datos.firma_cliente_url}" class="sig-img">`
      : `<div class="sig-placeholder">Firma pendiente</div>`
    }
            <div class="sig-line"><strong>Firma del Cliente</strong><br><span style="font-size:10px; color:#666;">Conformidad de Visita Técnica</span></div>
        </div>
      </div>

    </body>
    </html>
  `;
};

// ---------------------------------------------------------
// 3. FUNCIÓN PRINCIPAL
// ---------------------------------------------------------
export const generarPDF = async (datos) => {
  console.log('[PDF Service] Generando reporte profesional...');

  const diagnosticoIA = await generarDiagnosticoIA(datos);
  const html = getHtmlPlantilla(datos, diagnosticoIA);

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