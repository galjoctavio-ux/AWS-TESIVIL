import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { ServiceData } from './services-service';
import { ClientData } from './clients-service';
import { UserProfile } from './user-service';
import { QuoteData, QuoteItem, formatCurrency, calculateLineTotal } from './quotes-service';

interface ReportData {
    service: ServiceData & { id: string };
    client: ClientData & { id: string };
    technicianProfile?: UserProfile;
}

/**
 * Generates a professional PDF report for a service and opens the share dialog.
 */
export const generateServiceReport = async (data: ReportData): Promise<void> => {
    const { service, client, technicianProfile } = data;

    const serviceDate = service.date?.toDate
        ? service.date.toDate().toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : new Date().toLocaleDateString('es-MX');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Reporte de Servicio</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                color: #333;
                line-height: 1.6;
                padding: 40px;
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #2563EB;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #2563EB;
                font-size: 28px;
                margin-bottom: 5px;
            }
            .header .subtitle {
                color: #666;
                font-size: 14px;
            }
            .technician-info {
                text-align: center;
                margin-bottom: 30px;
                padding: 15px;
                background: #F8FAFC;
                border-radius: 8px;
            }
            .section {
                margin-bottom: 25px;
            }
            .section-title {
                color: #2563EB;
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 12px;
                padding-bottom: 5px;
                border-bottom: 1px solid #E5E7EB;
            }
            .info-table {
                width: 100%;
                border-collapse: collapse;
            }
            .info-table td {
                padding: 10px 15px;
                border: 1px solid #E5E7EB;
            }
            .info-table .label {
                background: #F8FAFC;
                font-weight: bold;
                width: 35%;
                color: #374151;
            }
            .info-table .value {
                color: #1F2937;
            }
            .diagnosis-box {
                background: #FEF2F2;
                border: 1px solid #FECACA;
                border-left: 4px solid #EF4444;
                padding: 15px;
                border-radius: 8px;
            }
            .diagnosis-box .error-code {
                font-size: 20px;
                font-weight: bold;
                color: #DC2626;
                margin-bottom: 8px;
            }
            .diagnosis-box .description {
                color: #7F1D1D;
                margin-bottom: 5px;
            }
            .diagnosis-box .cause {
                font-style: italic;
                color: #991B1B;
                font-size: 13px;
            }
            .signature-section {
                margin-top: 60px;
                display: flex;
                justify-content: space-between;
            }
            .signature-box {
                width: 45%;
                text-align: center;
            }
            .signature-line {
                border-top: 1px solid #333;
                margin-top: 60px;
                padding-top: 10px;
                font-size: 12px;
                color: #666;
            }
            .footer {
                margin-top: 40px;
                text-align: center;
                color: #9CA3AF;
                font-size: 11px;
            }
            .status-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
            }
            .status-pending {
                background: #FEF3C7;
                color: #92400E;
            }
            .status-done {
                background: #D1FAE5;
                color: #065F46;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>❄️ QRclima</h1>
            <div class="subtitle">Reporte de Servicio Técnico</div>
        </div>

        <div class="technician-info">
            <strong>Técnico:</strong> ${technicianProfile?.email || 'Técnico Certificado'}
        </div>

        <div class="section">
            <div class="section-title">📋 Información del Servicio</div>
            <table class="info-table">
                <tr>
                    <td class="label">Tipo de Servicio</td>
                    <td class="value">${service.type}</td>
                </tr>
                <tr>
                    <td class="label">Estado</td>
                    <td class="value">
                        <span class="status-badge ${service.status === 'Terminado' ? 'status-done' : 'status-pending'}">
                            ${service.status}
                        </span>
                    </td>
                </tr>
                <tr>
                    <td class="label">Fecha</td>
                    <td class="value">${serviceDate}</td>
                </tr>
                ${service.notes ? `
                <tr>
                    <td class="label">Notas</td>
                    <td class="value">${service.notes}</td>
                </tr>
                ` : ''}
            </table>
        </div>

        <div class="section">
            <div class="section-title">👤 Datos del Cliente</div>
            <table class="info-table">
                <tr>
                    <td class="label">Nombre</td>
                    <td class="value">${client.name}</td>
                </tr>
                ${client.phone ? `
                <tr>
                    <td class="label">Teléfono</td>
                    <td class="value">${client.phone}</td>
                </tr>
                ` : ''}
                ${client.address ? `
                <tr>
                    <td class="label">Dirección</td>
                    <td class="value">${client.address}</td>
                </tr>
                ` : ''}
            </table>
        </div>

        ${service.diagnosis ? `
        <div class="section">
            <div class="section-title">🔧 Diagnóstico</div>
            <div class="diagnosis-box">
                <div class="error-code">Código: ${service.diagnosis.errorCode}</div>
                <div class="description">${service.diagnosis.description}</div>
                ${service.diagnosis.cause ? `<div class="cause">Causa probable: ${service.diagnosis.cause}</div>` : ''}
            </div>
        </div>
        ` : ''}

        <div class="signature-section">
            <div class="signature-box">
                <div class="signature-line">Firma del Técnico</div>
            </div>
            <div class="signature-box">
                <div class="signature-line">Firma del Cliente</div>
            </div>
        </div>

        <div class="footer">
            Documento generado el ${new Date().toLocaleDateString('es-MX')} por QRclima App
        </div>
    </body>
    </html>
    `;

    try {
        // Generate PDF file
        const { uri } = await Print.printToFileAsync({
            html,
            base64: false,
        });

        console.log('PDF generated at:', uri);

        // Check if sharing is available and share
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
                mimeType: 'application/pdf',
                dialogTitle: 'Compartir Reporte de Servicio',
                UTI: 'com.adobe.pdf',
            });
        } else {
            throw new Error('Compartir no está disponible en este dispositivo');
        }
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
};

interface QuotePDFData {
    quote: QuoteData & { id: string };
    client: ClientData & { id: string };
    technicianEmail?: string;
}

/**
 * Generates a professional PDF quote/budget and opens the share dialog.
 * Aligned with master_plan.md Route 3 (Repair/Corrective) PDF structure.
 */
export const generateQuotePDF = async (data: QuotePDFData): Promise<void> => {
    const { quote, client, technicianEmail } = data;

    const currentDate = new Date().toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Generate folio
    const folio = `QT-${new Date().getFullYear()}${quote.id.substring(0, 5).toUpperCase()}`;

    // Separate items by type
    const laborItems = quote.items.filter(item => item.type === 'Labor');
    const materialItems = quote.items.filter(item => item.type === 'Material');

    // Calculate validity date
    // Note: 'validity_days' is not in Quote interface, assuming 15 hardcoded if missing or add to interface
    const validityDate = new Date();
    validityDate.setDate(validityDate.getDate() + 15);
    const validityStr = validityDate.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Presupuesto</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                color: #333;
                line-height: 1.5;
                padding: 30px;
                font-size: 12px;
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #16A34A;
                padding-bottom: 15px;
                margin-bottom: 20px;
            }
            .header h1 {
                color: #16A34A;
                font-size: 24px;
                margin-bottom: 3px;
            }
            .header .subtitle {
                color: #666;
                font-size: 16px;
                font-weight: bold;
            }
            .header .folio {
                color: #999;
                font-size: 11px;
                margin-top: 5px;
            }
            .client-section {
                background: #F8FAFC;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
            }
            .client-section h3 {
                color: #16A34A;
                font-size: 12px;
                margin-bottom: 8px;
            }
            .section-title {
                color: #16A34A;
                font-size: 13px;
                font-weight: bold;
                margin-bottom: 10px;
                padding-bottom: 5px;
                border-bottom: 1px solid #E5E7EB;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            th {
                background: #F3F4F6;
                padding: 10px;
                text-align: left;
                font-weight: bold;
                border: 1px solid #E5E7EB;
            }
            td {
                padding: 10px;
                border: 1px solid #E5E7EB;
            }
            .text-right {
                text-align: right;
            }
            .totals-section {
                background: #1F2937;
                color: white;
                padding: 15px;
                border-radius: 8px;
                margin-top: 20px;
            }
            .totals-row {
                display: flex;
                justify-content: space-between;
                padding: 5px 0;
            }
            .totals-row.final {
                border-top: 1px solid #4B5563;
                padding-top: 10px;
                margin-top: 5px;
                font-size: 16px;
                font-weight: bold;
            }
            .totals-row .label {
                color: #9CA3AF;
            }
            .totals-row.final .label {
                color: white;
            }
            .totals-row .value {
                color: #10B981;
            }
            .footer {
                margin-top: 30px;
                padding-top: 15px;
                border-top: 1px solid #E5E7EB;
                text-align: center;
                color: #666;
                font-size: 10px;
            }
            .validity {
                background: #FEF3C7;
                color: #92400E;
                padding: 10px;
                border-radius: 6px;
                text-align: center;
                margin-top: 15px;
                font-weight: bold;
            }
            .notes {
                background: #F3F4F6;
                padding: 10px;
                border-radius: 6px;
                margin-top: 15px;
                font-style: italic;
                color: #666;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>❄️ QRclima</h1>
            <div class="subtitle">PRESUPUESTO</div>
            <div class="folio">Folio: ${folio} | Fecha: ${currentDate}</div>
        </div>

        <div class="client-section">
            <h3>📋 DATOS DEL CLIENTE</h3>
            <strong>${client.name}</strong><br>
            ${client.phone ? `📞 ${client.phone}<br>` : ''}
            ${client.address ? `📍 ${client.address}` : ''}
        </div>

        ${laborItems.length > 0 ? `
        <div class="section-title">🔧 SECCIÓN A: SERVICIOS / MANO DE OBRA</div>
        <table>
            <thead>
                <tr>
                    <th>Concepto</th>
                    <th class="text-right">Importe</th>
                </tr>
            </thead>
            <tbody>
                ${laborItems.map(item => `
                <tr>
                    <td>${item.description}</td>
                    <td class="text-right">${formatCurrency(calculateLineTotal(item))}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        ` : ''}

        ${materialItems.length > 0 ? `
        <div class="section-title">📦 SECCIÓN B: REFACCIONES Y MATERIALES</div>
        <table>
            <thead>
                <tr>
                    <th>Concepto</th>
                    <th class="text-right">Cantidad</th>
                    <th class="text-right">P. Unitario</th>
                    <th class="text-right">Importe</th>
                </tr>
            </thead>
            <tbody>
                ${materialItems.map(item => `
                <tr>
                    <td>${item.description}</td>
                    <td class="text-right">${item.quantity}</td>
                    <td class="text-right">${formatCurrency(item.unitCost)}</td>
                    <td class="text-right">${formatCurrency(calculateLineTotal(item))}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        ` : ''}

        <div class="totals-section">
            ${quote.requires_invoice ? `
            <div class="totals-row">
                <span class="label">Subtotal (Base)</span>
                <span class="value">${formatCurrency(quote.subtotal)}</span>
            </div>
            <div class="totals-row">
                <span class="label">IVA (16%)</span>
                <span class="value">${formatCurrency(quote.tax)}</span>
            </div>
            ` : ''}
            <div class="totals-row final">
                <span class="label">TOTAL A PAGAR</span>
                <span class="value">${formatCurrency(quote.total)}</span>
            </div>
            ${!quote.requires_invoice ? `<div style="color: #9CA3AF; font-size: 10px; margin-top: 5px;">* Precios con IVA incluido</div>` : ''}
        </div>

        <div class="validity">
            📅 Vigencia del presupuesto: ${quote.validity_days} días (hasta ${validityStr})
        </div>

        ${quote.notes ? `
        <div class="notes">
            <strong>Notas:</strong> ${quote.notes}
        </div>
        ` : ''}

        <div class="footer">
            Técnico: ${technicianEmail || 'Técnico Certificado'}<br>
            Documento generado el ${currentDate} por QRclima App
        </div>
    </body>
    </html>
    `;

    try {
        // Generate PDF file
        const { uri } = await Print.printToFileAsync({
            html,
            base64: false,
        });

        console.log('Quote PDF generated at:', uri);

        // Check if sharing is available and share
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
                mimeType: 'application/pdf',
                dialogTitle: 'Compartir Presupuesto',
                UTI: 'com.adobe.pdf',
            });
        } else {
            throw new Error('Compartir no está disponible en este dispositivo');
        }
    } catch (error) {
        console.error('Error generating Quote PDF:', error);
        throw error;
    }
};
