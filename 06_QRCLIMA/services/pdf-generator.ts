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
    warrantyText?: string;
}

/**
 * Generates a professional PDF report for a service and opens the share dialog.
 */
export const generateServiceReport = async (data: ReportData): Promise<void> => {
    const { service, client, technicianProfile, warrantyText } = data;

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
            @page { margin: 0; }
            body {
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                color: #1F2937;
                line-height: 1.5;
                margin: 0;
                padding: 40px 50px;
                font-size: 11px;
            }
            .header-container {
                border-bottom: 2px solid #2563EB;
                padding-bottom: 20px;
                margin-bottom: 25px;
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
            }
            .brand-section h1 {
                color: #2563EB;
                font-size: 24px;
                margin: 0 0 5px 0;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .brand-section .subtitle {
                color: #6B7280;
                font-size: 14px;
                font-weight: 500;
            }
            .meta-info {
                text-align: right;
                font-size: 10px;
                color: #6B7280;
            }
            .meta-info .date {
                font-weight: bold;
                color: #374151;
                font-size: 12px;
                margin-top: 4px;
            }
            
            .two-columns {
                display: flex;
                justify-content: space-between;
                margin-bottom: 25px;
                gap: 20px;
            }
            .column {
                width: 48%;
            }
            
            .info-box {
                background: #F9FAFB;
                border: 1px solid #E5E7EB;
                border-radius: 8px;
                padding: 12px;
                height: 100%;
            }
            .box-title {
                color: #2563EB;
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-weight: bold;
                margin-bottom: 8px;
                padding-bottom: 4px;
                border-bottom: 1px solid #E5E7EB;
            }
            .info-row {
                margin-bottom: 4px;
                display: flex;
            }
            .info-label {
                color: #6B7280;
                font-size: 10px;
                width: 65px;
                flex-shrink: 0;
            }
            .info-value {
                color: #111827;
                font-weight: 500;
            }

            .section-title {
                background: #EFF6FF;
                color: #1E40AF;
                padding: 6px 10px;
                border-radius: 6px;
                font-weight: bold;
                font-size: 11px;
                margin-bottom: 10px;
                border-left: 3px solid #2563EB;
                margin-top: 15px;
            }

            .grid-container {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-bottom: 15px;
            }
            .grid-item {
                background: #F3F4F6;
                padding: 6px 10px;
                border-radius: 12px;
                font-size: 10px;
                color: #374151;
                border: 1px solid #E5E7EB;
            }

            .checklist-container {}
            .checklist-item {
                display: flex;
                align-items: center;
                margin-bottom: 4px;
                font-size: 10px;
            }
            .check-icon {
                color: #16A34A;
                margin-right: 6px;
                font-weight: bold;
                font-size: 12px;
            }

            .photos-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 10px;
            }
            .photo-item {
                width: 31%;
                height: 100px;
                border-radius: 4px;
                border: 1px solid #E5E7EB;
                object-fit: cover;
                background: #F3F4F6;
            }

            .warranty-box {
                background: #F5F3FF;
                border: 1px solid #DDD6FE;
                border-radius: 8px;
                padding: 12px;
                margin-top: 20px;
                page-break-inside: avoid;
            }
            .warranty-title {
                color: #5B21B6;
                font-weight: bold;
                margin-bottom: 4px;
                font-size: 10px;
                text-transform: uppercase;
            }
            .warranty-text {
                color: #4C1D95;
                font-size: 10px;
            }

            .signatures-container {
                display: flex;
                justify-content: space-between;
                margin-top: 40px;
                page-break-inside: avoid;
            }
            .signature-box {
                width: 45%;
                text-align: center;
            }
            .signature-image {
                height: 50px; 
                margin-bottom: 5px;
                object-fit: contain;
            }
            .signature-line {
                border-top: 1px solid #9CA3AF;
                padding-top: 6px;
                color: #4B5563;
                font-size: 10px;
                font-weight: 500;
            }
            
            .diagnosis-section {
                border: 1px solid #FECACA;
                background: #FEF2F2;
                border-radius: 8px;
                padding: 10px;
                margin-bottom: 15px;
            }

            .footer {
                position: fixed;
                bottom: 20px;
                left: 50px;
                right: 50px;
                text-align: center;
                color: #9CA3AF;
                font-size: 9px;
                border-top: 1px solid #E5E7EB;
                padding-top: 8px;
            }
        </style>
    </head>
    <body>
        <div class="header-container">
            <div class="brand-section">
                <h1>QRclima</h1>
                <div class="subtitle">Reporte de Servicio Técnico</div>
            </div>
            <div class="meta-info">
                <div>FOLIO DE SERVICIO</div>
                <div class="date">#${service.id.substring(0, 8).toUpperCase()}</div>
                <div style="margin-top: 4px;">Fecha: ${serviceDate}</div>
            </div>
        </div>

        <div class="two-columns">
            <div class="column">
                <div class="info-box">
                    <div class="box-title">Cliente</div>
                    <div class="info-row">
                        <span class="info-value" style="font-size: 12px;">${client.name}</span>
                    </div>
                    ${client.phone ? `
                    <div class="info-row">
                        <span class="info-label">Teléfono:</span>
                        <span class="info-value">${client.phone}</span>
                    </div>` : ''}
                    ${client.address ? `
                    <div class="info-row">
                        <span class="info-label">Dirección:</span>
                        <span class="info-value">${client.address}</span>
                    </div>` : ''}
                </div>
            </div>
            <div class="column">
                <div class="info-box">
                    <div class="box-title">Servicio y Equipo</div>
                    <div class="info-row">
                        <span class="info-label">Tipo:</span>
                        <span class="info-value">${service.type}</span>
                    </div>
                    ${service.equipment ? `
                    <div class="info-row">
                        <span class="info-label">Equipo:</span>
                        <span class="info-value">${service.equipment.type} ${service.equipment.brand}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Modelo:</span>
                        <span class="info-value">${service.equipment.model}</span>
                    </div>
                    ${service.equipment.capacityBTU ? `
                    <div class="info-row">
                        <span class="info-label">Capacidad:</span>
                        <span class="info-value">${service.equipment.capacityBTU} BTU</span>
                    </div>` : ''}
                    ` : ''}
                    <div class="info-row" style="margin-top: 4px;">
                        <span class="info-value" style="color: ${service.status === 'Terminado' ? '#166534' : '#92400E'}; font-weight: bold; font-size: 10px;">
                            ESTADO: ${service.status.toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        ${service.diagnosis ? `
        <div class="diagnosis-section">
            <div style="color: #991B1B; font-weight: bold; font-size: 11px; margin-bottom: 4px;">DIAGNÓSTICO TÉCNICO (${service.diagnosis.errorCode})</div>
            <div style="color: #7F1D1D;">${service.diagnosis.description}</div>
            ${service.diagnosis.cause ? `
                <div style="font-style: italic; margin-top: 4px; color: #991B1B; font-size: 10px;">
                    Causa: ${service.diagnosis.cause}
                </div>` : ''}
        </div>` : ''}

        <div class="two-columns">
            <div class="column">
                <div class="section-title">Trabajos Realizados</div>
                ${service.tasks && service.tasks.length > 0 ? `
                <div class="grid-container">
                    ${service.tasks.map(task => `<div class="grid-item">${task}</div>`).join('')}
                </div>` : '<div style="color: #9CA3AF; font-style: italic;">No especificados</div>'}
                
                ${service.notes ? `
                <div style="margin-top: 10px; font-size: 10px;">
                    <strong>Notas Adicionales:</strong><br>
                    ${service.notes}
                </div>` : ''}
            </div>
            
            <div class="column">
                <div class="section-title">Checklist de Calidad</div>
                ${service.checklist ? `
                <div class="checklist-container">
                    ${Object.entries(service.checklist)
                .filter(([_, value]) => value === true)
                .map(([key, _]) => `
                        <div class="checklist-item">
                            <span class="check-icon">✓</span> ${key}
                        </div>`).join('')}
                </div>` : '<div style="color: #9CA3AF; font-style: italic;">Sin checklist</div>'}
            </div>
        </div>

        ${service.photos && service.photos.length > 0 ? `
        <div class="section-title">Evidencia Fotográfica</div>
        <div class="photos-grid">
            ${service.photos.map(photo => `<img src="${photo}" class="photo-item" />`).join('')}
        </div>
        ` : ''}

        ${warrantyText ? `
        <div class="warranty-box">
            <div class="warranty-title">Garantía del Servicio</div>
            <div class="warranty-text">
                ${warrantyText}
            </div>
        </div>` : ''}

        <div class="signatures-container">
            <div class="signature-box">
                ${technicianProfile?.signature ?
            `<img src="${technicianProfile.signature}" class="signature-image" />` :
            '<div style="height: 50px;"></div>'}
                <div class="signature-line">
                    Firma del Técnico<br>
                    <span style="font-weight: normal; font-size: 9px;">${technicianProfile?.fullName || technicianProfile?.businessName || technicianProfile?.email || ''}</span>
                </div>
            </div>
            <div class="signature-box">
                ${service.clientSignature ?
            `<img src="${service.clientSignature}" class="signature-image" />` :
            '<div style="height: 50px;"></div>'}
                <div class="signature-line">Firma de Conformidad del Cliente</div>
            </div>
        </div>

        <div class="footer">
            Este documento es un comprobante de servicio digital generado por QRclima App.<br>
            Powered by TESIVIL
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

// ============================================
// COTIZADOR FREE PDF GENERATION
// ============================================

import { CotizadorQuote, CotizadorQuoteItem, formatCurrency as formatCotizadorCurrency } from './cotizador-service';

interface CotizadorPDFData {
    quote: CotizadorQuote & { id: string };
    client: ClientData & { id: string };
    technicianProfile?: UserProfile;
}

/**
 * Generates a professional PDF for the Free Cotizador module.
 * Includes watermark: "Elaborado con QRclima powered by TESIVIL"
 */
export const generateCotizadorPDF = async (data: CotizadorPDFData): Promise<void> => {
    const { quote, client, technicianProfile } = data;

    const currentDate = new Date().toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Generate folio
    const folio = `CF-${new Date().getFullYear()}${quote.id.substring(0, 5).toUpperCase()}`;

    // Separate items by type
    const moItems = quote.items.filter(item => item.type === 'MO');
    const mtItems = quote.items.filter(item => item.type === 'MT');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Cotización</title>
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
                position: relative;
            }
            .watermark {
                position: fixed;
                bottom: 20px;
                left: 0;
                right: 0;
                text-align: center;
                color: #CBD5E1;
                font-size: 10px;
                font-style: italic;
                letter-spacing: 1px;
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #10B981;
                padding-bottom: 15px;
                margin-bottom: 20px;
            }
            .header h1 {
                color: #10B981;
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
                background: #F0FDF4;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
                border-left: 4px solid #10B981;
            }
            .client-section h3 {
                color: #10B981;
                font-size: 12px;
                margin-bottom: 8px;
            }
            .section-title {
                font-size: 13px;
                font-weight: bold;
                margin-bottom: 10px;
                padding-bottom: 5px;
                border-bottom: 1px solid #E5E7EB;
            }
            .section-title.mo {
                color: #7C3AED;
            }
            .section-title.mt {
                color: #EA580C;
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
                font-size: 11px;
            }
            td {
                padding: 10px;
                border: 1px solid #E5E7EB;
            }
            .text-right {
                text-align: right;
            }
            .text-center {
                text-align: center;
            }
            .code-badge {
                display: inline-block;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 9px;
                font-weight: bold;
            }
            .code-mo {
                background: #EDE9FE;
                color: #7C3AED;
            }
            .code-mt {
                background: #FFEDD5;
                color: #EA580C;
            }
            .totals-section {
                background: #1F2937;
                color: white;
                padding: 20px;
                border-radius: 8px;
                margin-top: 20px;
            }
            .totals-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
            }
            .totals-row.final {
                border-top: 2px solid #4B5563;
                padding-top: 15px;
                margin-top: 10px;
                font-size: 18px;
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
                font-weight: bold;
            }
            .notes {
                background: #F3F4F6;
                padding: 12px;
                border-radius: 6px;
                margin-top: 15px;
                font-style: italic;
                color: #666;
            }
            .signatures-container {
                display: flex;
                justify-content: center;
                margin-top: 40px;
                page-break-inside: avoid;
            }
            .signature-box {
                width: 60%;
                text-align: center;
                border-top: 1px solid #9CA3AF;
                padding-top: 10px;
            }
            .signature-image {
                height: 60px;
                margin-bottom: 5px;
                object-fit: contain;
                display: block;
                margin-left: auto;
                margin-right: auto;
            }
            .technician-name {
                font-weight: bold;
                font-size: 12px;
                color: #374151;
            }
            .footer {
                margin-top: 30px;
                padding-top: 15px;
                border-top: 1px solid #E5E7EB;
                text-align: center;
                color: #666;
                font-size: 10px;
            }
        </style>
    </head>
    <body>
        <div class="watermark">Elaborado con QRclima powered by TESIVIL</div>

        <div class="header">
            <h1>❄️ QRclima</h1>
            <div class="subtitle">COTIZACIÓN</div>
            <div class="folio">Folio: ${folio} | Fecha: ${currentDate}</div>
        </div>

        <div class="client-section">
            <h3>📋 DATOS DEL CLIENTE</h3>
            <strong>${client.name}</strong><br>
            ${client.phone ? `📞 ${client.phone}<br>` : ''}
            ${client.address ? `📍 ${client.address}` : ''}
        </div>

        ${moItems.length > 0 ? `
        <div class="section-title mo">🔧 MANO DE OBRA</div>
        <table>
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Concepto</th>
                    <th class="text-center">Cantidad</th>
                    <th class="text-right">P. Unitario</th>
                    <th class="text-right">Importe</th>
                </tr>
            </thead>
            <tbody>
                ${moItems.map(item => `
                <tr>
                    <td><span class="code-badge code-mo">${item.code}</span></td>
                    <td>${item.description}</td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-right">${formatCotizadorCurrency(item.unitPrice)}</td>
                    <td class="text-right"><strong>${formatCotizadorCurrency(item.total)}</strong></td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        ` : ''}

        ${mtItems.length > 0 ? `
        <div class="section-title mt">📦 MATERIALES</div>
        <table>
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Concepto</th>
                    <th class="text-center">Cantidad</th>
                    <th class="text-right">P. Unitario</th>
                    <th class="text-right">Importe</th>
                </tr>
            </thead>
            <tbody>
                ${mtItems.map(item => `
                <tr>
                    <td><span class="code-badge code-mt">${item.code}</span></td>
                    <td>${item.description}</td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-right">${formatCotizadorCurrency(item.unitPrice)}</td>
                    <td class="text-right"><strong>${formatCotizadorCurrency(item.total)}</strong></td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        ` : ''}

        <div class="totals-section">
            <div class="totals-row final">
                <span class="label">TOTAL A PAGAR</span>
                <span class="value">${formatCotizadorCurrency(quote.total)}</span>
            </div>
            <div style="color: #9CA3AF; font-size: 10px; margin-top: 8px;">* Precios con IVA incluido</div>
        </div>

        ${quote.notes ? `
        <div class="notes">
            <strong>Notas:</strong> ${quote.notes}
        </div>
        ` : ''}

        <div class="signatures-container">
            <div class="signature-box">
                ${technicianProfile?.signature ?
            `<img src="${technicianProfile.signature}" class="signature-image" />` :
            '<div style="height: 60px;"></div>'}
                <div class="technician-name">
                    ${technicianProfile?.fullName || technicianProfile?.businessName || technicianProfile?.email || 'Técnico Certificado'}
                </div>
                <div style="font-size: 10px; color: #6B7280; margin-top: 2px;">Técnico Responsable</div>
            </div>
        </div>

        <div class="footer">
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

        console.log('Cotizador PDF generated at:', uri);

        // Check if sharing is available and share
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
                mimeType: 'application/pdf',
                dialogTitle: 'Compartir Cotización',
                UTI: 'com.adobe.pdf',
            });
        } else {
            throw new Error('Compartir no está disponible en este dispositivo');
        }
    } catch (error) {
        console.error('Error generating Cotizador PDF:', error);
        throw error;
    }
};
