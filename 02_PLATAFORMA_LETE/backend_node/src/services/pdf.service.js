import puppeteer from 'puppeteer';

const logoBase64 = 'data:image/png;base64,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';

const getHtmlPlantilla = () => {
    return `
    <style>
      body {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        margin: 0;
        padding: 0;
        color: #333;
        background-color: #f8f8f8;
      }
      .container {
        max-width: 800px;
        margin: 20px auto;
        padding: 20px;
        background-color: #fff;
        border: 1px solid #ddd;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      .header {
        background-color: #10213f;
        color: white;
        padding: 20px;
        text-align: center;
      }
      .header img {
        max-width: 200px;
        margin-bottom: 10px;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
      }
      .section {
        margin-top: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
      }
      .section h2 {
        color: #10213f;
        border-bottom: 2px solid #10213f;
        padding-bottom: 5px;
      }
      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
      }
      .info-item p {
        margin: 5px 0;
      }
      .info-item strong {
        display: inline-block;
        width: 150px;
      }
      .diagnostico-peligro {
        color: red;
        font-weight: bold;
      }
      .top-consumers ol {
        padding-left: 20px;
      }
      .top-consumers li {
        margin-bottom: 5px;
      }
      .signature-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-top: 50px;
        padding-top: 20px;
        border-top: 1px solid #eee;
      }
      .signature {
        text-align: center;
      }
      .signature img {
        max-width: 250px;
        height: 125px; /* Altura fija */
        object-fit: contain; /* Ajustar imagen sin deformar */
        border-bottom: 1px solid #000;
        padding-bottom: 5px;
        margin-bottom: 5px;
      }
      .signature p {
        margin: 0;
        font-style: italic;
      }
    </style>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://www.tesivil.com/logo_LETE.png" alt="Luz en tu Espacio" />
          <h1>Reporte de Diagnóstico Eléctrico</h1>
        </div>
        <div class="section">
          <h2>Información del Cliente</h2>
          <div class="info-grid">
            <div class="info-item">
              <p><strong>Cliente:</strong> {{cliente_nombre}}</p>
              <p><strong>Email:</strong> {{cliente_email}}</p>
            </div>
            <div class="info-item">
              <p><strong>Dirección:</strong> {{cliente_direccion}}</p>
              <p><strong>Fecha de Revisión:</strong> {{fecha_revision}}</p>
            </div>
          </div>
          <p><strong>Ingeniero:</strong> {{tecnico_nombre}}</p>
        </div>
        <div class="section">
          <h2>Diagnóstico General</h2>
          <ul>
            {{diagnosticos_lista}}
          </ul>
        </div>
        <div class="section top-consumers">
          <h2>🏆 Top 5 Consumidores (kWh/Bimestre)</h2>
          <ol>
            {{top_5_consumidores}}
          </ol>
        </div>
        <div class="section">
          <h2>Hallazgos de Instalación</h2>
          <p><strong>Tipo de Servicio:</strong> {{tipo_servicio}}</p>
          <p><strong>Edad de Instalación:</strong> {{edad_instalacion}}</p>
          <p><strong>Observaciones C.C.:</strong> {{observaciones_cc}}</p>
        </div>
        <div class="section">
          <h2>Nuestro Proceso de Revisión</h2>
          <ul>
            <li><strong>Análisis del medidor:</strong> Verificamos la medición para comparar con su recibo de luz.</li>
            <li><strong>Inspección del centro de carga:</strong> Revisamos la instalación y ajustamos conexiones para mayor seguridad.</li>
            <li><strong>Medición del consumo real:</strong> Evaluamos el gasto de los electrodomésticos más importantes en tiempo real.</li>
            <li><strong>Prueba de fugas de corriente:</strong> Verificamos la cantidad de energía que ingresa a su domicilio y la comparamos con la que retorna al sistema.</li>
            <li><strong>Evaluación del uso de los equipos:</strong> Identificamos qué electrodomésticos generan mayor gasto.</li>
          </ul>
        </div>
        <div class="section">
          <h2>Causas de su Alto Consumo</h2>
          <ul>
            {{causas_alto_consumo}}
          </ul>
        </div>
        <div class="signature-container">
          <div class="signature">
            <img src="{{firma_cliente_url}}" alt="Firma del Cliente" />
            <p>Firma del Cliente</p>
          </div>
          <div class="signature">
            <img src="{{firma_tecnico_url}}" alt="Firma del Ingeniero" />
            <p>Firma del Ingeniero</p>
          </div>
        </div>
      </div>
    </body>
  `;
};

export const generarPDF = async (datos) => {
  console.log('Iniciando generación de PDF...');

  let html = getHtmlPlantilla();

  html = html.replace('{{cliente_nombre}}', datos.cliente_nombre || 'N/A');
  html = html.replace('{{cliente_email}}', datos.cliente_email || 'N/A');
  html = html.replace('{{cliente_direccion}}', datos.cliente_direccion || 'N/A');
  html = html.replace('{{fecha_revision}}', new Date(datos.fecha_revision).toLocaleDateString('es-MX'));
  html = html.replace('{{tecnico_nombre}}', datos.tecnico_nombre || 'N/A');
  html = html.replace('{{tipo_servicio}}', datos.revision.tipo_servicio || 'N/A');
  html = html.replace('{{edad_instalacion}}', datos.revision.edad_instalacion || 'N/A');
  html = html.replace('{{observaciones_cc}}', datos.revision.observaciones_cc || 'N/A');
  html = html.replace('{{firma_cliente_url}}', datos.firma_cliente_url || '');
  html = html.replace('{{firma_tecnico_url}}', datos.firma_tecnico_url || '');


  let listaHtml = '';
  if (datos.revision.diagnosticos_automaticos && datos.revision.diagnosticos_automaticos.length > 0) {
    datos.revision.diagnosticos_automaticos.forEach(diag => {
      const clase = diag.startsWith('¡PELIGRO!') ? 'class="diagnostico-peligro"' : '';
      listaHtml += `<li ${clase}>${diag}</li>`;
    });
  } else {
    listaHtml = '<li>Sin diagnósticos automáticos.</li>';
  }
  html = html.replace('{{diagnosticos_lista}}', listaHtml);

  let top5Html = '';
  if (datos.equipos && datos.equipos.length > 0) {
    const top5 = [...datos.equipos]
      .sort((a, b) => b.kwh_bimestre_calculado - a.kwh_bimestre_calculado)
      .slice(0, 5);

    top5.forEach(eq => {
      const ubicacion = eq.nombre_personalizado ? `(${eq.nombre_personalizado})` : '';
      top5Html += `<li>${eq.nombre_equipo} ${ubicacion} - ${eq.kwh_bimestre_calculado.toFixed(2)} kWh/bimestre</li>`;
    });
  } else {
    top5Html = '<li>No se registraron equipos.</li>';
  }
  html = html.replace('{{top_5_consumidores}}', top5Html);

  let causasHtml = '';
  if (datos.revision.causas_alto_consumo && datos.revision.causas_alto_consumo.length > 0) {
    datos.revision.causas_alto_consumo.forEach(causa => {
      causasHtml += `<li>${causa}</li>`;
    });
  } else {
    causasHtml = '<li>No se especificaron causas.</li>';
  }
  html = html.replace('{{causas_alto_consumo}}', causasHtml);

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: 'domcontentloaded' });

  const pdfBuffer = await page.pdf({
    format: 'Letter',
    printBackground: true,
    margin: {
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px'
    }
  });

  await browser.close();
  console.log('PDF generado exitosamente.');
  return pdfBuffer;
};
