import puppeteer from 'puppeteer';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// ---------------------------------------------------------
      <table>
        <thead>
            <tr>
                <th>Equipo</th> <th>Ubicación</th> <th align="center">Amp.</th> <th align="center">kWh/Bimestre</th> <th align="center">Estado</th>
            </tr>
        </thead>
        <tbody>${equiposHtml}</tbody>
      </table>
      <div style="font-size: 9px; color: #666; margin-top: 2px;">* Cálculo estimado basado en amperaje medido y horas de uso reportadas.</div>

      <div class="section-header">Conclusiones del Ingeniero</div>
      <div style="padding: 10px;">
        <strong>Causas Detectadas:</strong>
        <ul style="margin-top: 5px;">${causasHtml}</ul>
        
        <strong>Recomendaciones Técnicas:</strong>
        <p style="background: #f1f3f5; padding: 10px; border-left: 4px solid #ced4da; margin-top: 5px; white-space: pre-line;">
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
            <div class="sig-line"><strong>${datos.header?.tecnico_nombre}</strong><br><span style="font-size:10px; color:#666;">Ingeniero Responsable (Cédula TESIVIL)</span></div>
        </div>

        <div class="sig-block">
             ${datos.firma_cliente_url
      ? `<img src="${datos.firma_cliente_url}" class="sig-img">`
      : `<div class="sig-placeholder">Firma pendiente</div>`
    }
            <div class="sig-line"><strong>Firma del Cliente</strong><br><span style="font-size:10px; color:#666;">Conformidad de Visita Técnica</span></div>
        </div>
      </div>

    </body >
    </html >
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