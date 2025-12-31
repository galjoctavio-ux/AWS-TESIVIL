import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { ServiceData } from './services-service';
import { ClientData } from './clients-service';
import { UserProfile, isUserPro } from './user-service';
import { QuoteData, QuoteItem, formatCurrency, calculateLineTotal } from './quotes-service';

// PDF Template Version - FMT-OPE-01 v1.0
const PDF_TEMPLATE_VERSION = 'FMT-OPE-01 v1.0';

interface ReportData {
    service: ServiceData & { id: string };
    client: ClientData & { id: string };
    technicianProfile?: UserProfile;
    warrantyText?: string;
    forcePremium?: boolean;  // Force premium features (for users who purchased PDF credits)
}

/**
 * Generates an executive summary based on service type
 */
const getExecutiveSummary = (type: string, equipment: any, diagnosis: any): string => {
    const brand = equipment?.brand || 'el equipo';
    const model = equipment?.model || '';
    const equipmentName = `${brand} ${model}`.trim();

    switch (type) {
        case 'Instalación':
            return `Se realizó la instalación completa del equipo ${equipmentName}, dejándolo en correcto funcionamiento conforme a especificaciones del fabricante.`;
        case 'Mantenimiento':
            return `Se realizó mantenimiento preventivo al equipo ${equipmentName}, verificando y optimizando su funcionamiento.`;
        case 'Reparación':
            const issue = diagnosis?.description || 'las fallas reportadas';
            return `Se diagnosticó y reparó el equipo ${equipmentName}, resolviendo ${issue}.`;
        case 'Reinstalación':
            return `Se reubicó el equipo ${equipmentName} en nueva ubicación, verificando su correcto funcionamiento.`;
        default:
            return `Servicio técnico realizado al equipo ${equipmentName}.`;
    }
};

/**
 * Generates a professional PDF report for a service and opens the share dialog.
 * Supports PRO branding (custom logo, colors) vs FREE (QRclima branding + CTA)
 * Version: FMT-OPE-01 v1.0
 */
export const generateServiceReport = async (data: ReportData): Promise<void> => {
    console.log('📄 [PDF] Starting generateServiceReport v1.0...');
    const { service, client, technicianProfile, warrantyText, forcePremium } = data;
    console.log('📄 [PDF] Data extracted:', { serviceId: service.id, clientName: client.name, hasTechProfile: !!technicianProfile, forcePremium });

    // Determine if user is PRO for branding (or forced premium via token purchase)
    const isPro = forcePremium || isUserPro(technicianProfile || null);
    const branding = technicianProfile?.branding;
    const primaryColor = isPro && branding?.primaryColor ? branding.primaryColor : '#2563EB';
    console.log('📄 [PDF] PRO status:', { isPro, forcePremium, primaryColor, hasBranding: !!branding });

    // Format date and time
    const serviceDateObj = service.date?.toDate ? service.date.toDate() : new Date(service.date || Date.now());
    const serviceDate = serviceDateObj.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const serviceTime = serviceDateObj.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit'
    });
    const generatedAt = new Date().toISOString();
    console.log('📄 [PDF] Service date:', serviceDate, 'Time:', serviceTime);

    // Determine warranty display
    const warrantyMonths = service.warrantyMonths ?? 0;
    const hasWarranty = warrantyMonths > 0;
    console.log('📄 [PDF] Warranty:', { warrantyMonths, hasWarranty });

    // Equipment info
    const equipment = service.equipment;
    const equipmentQrId = equipment?.qrId || null;
    const qrUrl = equipmentQrId ? `https://qr.tesivil.com/a/${equipmentQrId}` : null;
    const qrImageUrl = qrUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrUrl)}` : null;

    // Executive summary
    const executiveSummary = getExecutiveSummary(service.type, equipment, service.diagnosis);

    // Technician ID (first 6 chars)
    const technicianId = technicianProfile?.email?.substring(0, 6) || 'N/A';

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Reporte de Servicio Técnico</title>
        <style>
            @page { margin: 0; }
            * { box-sizing: border-box; }
            body {
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                color: #333333;
                line-height: 1.5;
                margin: 0;
                padding: 40px 50px;
                font-size: 11px;
            }
            
            /* Header */
            .header-container {
                background: linear-gradient(135deg, ${primaryColor}08 0%, ${primaryColor}15 100%);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 20px;
                border-bottom: 3px solid ${primaryColor};
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
            }
            .brand-section {
                display: flex;
                align-items: center;
            }
            .brand-logo {
                width: 50px;
                height: 50px;
                background: ${primaryColor};
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 15px;
                color: white;
                font-size: 24px;
                font-weight: bold;
            }
            .brand-logo img {
                height: 50px;
                max-width: 120px;
                object-fit: contain;
                border-radius: 8px;
            }
            .brand-title {
                color: ${primaryColor};
                font-size: 22px;
                margin: 0;
                letter-spacing: 0.5px;
                font-weight: bold;
            }
            .brand-subtitle {
                color: #6B7280;
                font-size: 12px;
                font-weight: 500;
            }
            
            /* Meta Info */
            .meta-info {
                text-align: right;
            }
            .folio-box {
                background: #F3F4F6;
                padding: 10px 15px;
                border-radius: 8px;
                margin-bottom: 8px;
            }
            .folio-label {
                color: #6B7280;
                font-size: 9px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .folio-value {
                font-family: 'Courier New', monospace;
                font-weight: bold;
                color: #111827;
                font-size: 14px;
            }
            .folio-date {
                color: #6B7280;
                font-size: 10px;
                margin-top: 4px;
            }
            .status-badge {
                display: inline-block;
                background: ${service.status === 'Terminado' ? '#D1FAE5' : '#FEF3C7'};
                color: ${service.status === 'Terminado' ? '#065F46' : '#92400E'};
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: bold;
            }
            .status-disclaimer {
                color: #9CA3AF;
                font-size: 8px;
                font-style: italic;
                margin-top: 4px;
            }
            .not-closed-warning {
                color: #DC2626;
                font-size: 8px;
                font-weight: bold;
                margin-top: 2px;
            }
            
            /* Traceability Badge */
            .traceability-badge {
                display: inline-block;
                background: #EEF2FF;
                color: #4338CA;
                padding: 3px 8px;
                border-radius: 4px;
                font-size: 9px;
                font-weight: 500;
                margin-top: 6px;
            }
            
            /* Two Columns */
            .two-columns {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
                gap: 20px;
            }
            .column { width: 48%; }
            
            /* Info Box */
            .info-box {
                background: #F9FAFB;
                border: 1px solid #E5E7EB;
                border-radius: 8px;
                padding: 12px;
                height: 100%;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }
            .box-title {
                color: ${primaryColor};
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-weight: bold;
                margin-bottom: 8px;
                padding-bottom: 4px;
                border-bottom: 1px solid #E5E7EB;
                display: flex;
                align-items: center;
            }
            .box-icon {
                margin-right: 6px;
            }
            .client-name {
                font-size: 14px;
                font-weight: 600;
                color: #111827;
                margin-bottom: 8px;
            }
            .info-row {
                display: flex;
                align-items: center;
                margin-bottom: 4px;
                color: #4B5563;
                font-size: 10px;
            }
            .info-icon {
                margin-right: 6px;
            }
            
            /* Executive Summary */
            .executive-summary {
                background: linear-gradient(135deg, ${primaryColor}10 0%, ${primaryColor}05 100%);
                border-left: 4px solid ${primaryColor};
                border-radius: 0 8px 8px 0;
                padding: 15px;
                margin-bottom: 20px;
            }
            .executive-summary-title {
                color: ${primaryColor};
                font-size: 11px;
                font-weight: bold;
                margin-bottom: 6px;
                text-transform: uppercase;
            }
            .executive-summary-text {
                color: #374151;
                font-size: 12px;
                line-height: 1.6;
            }
            
            /* Section Title */
            .section-title {
                background: ${primaryColor}15;
                color: ${primaryColor};
                padding: 6px 10px;
                border-radius: 6px;
                font-weight: bold;
                font-size: 11px;
                margin-bottom: 10px;
                border-left: 3px solid ${primaryColor};
                margin-top: 15px;
            }
            
            /* Diagnosis */
            .diagnosis-section {
                border: 1px solid #FECACA;
                background: #FEF2F2;
                border-radius: 8px;
                padding: 10px;
                margin-bottom: 15px;
            }
            .diagnosis-title {
                color: #991B1B;
                font-weight: bold;
                font-size: 11px;
                margin-bottom: 4px;
            }
            .diagnosis-text {
                color: #7F1D1D;
            }
            .diagnosis-cause {
                font-style: italic;
                margin-top: 4px;
                color: #991B1B;
                font-size: 10px;
            }
            
            /* Grid Items */
            .grid-container {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
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
            
            /* Checklist */
            .checklist-container {
                margin-bottom: 10px;
            }
            .checklist-item {
                display: flex;
                align-items: center;
                margin-bottom: 6px;
                font-size: 10px;
            }
            .check-icon {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 16px;
                height: 16px;
                background: ${primaryColor};
                color: white;
                border-radius: 50%;
                margin-right: 8px;
                font-size: 10px;
                font-weight: bold;
            }
            .checklist-compensation {
                background: #F3F4F6;
                padding: 10px;
                border-radius: 6px;
                font-size: 9px;
                color: #6B7280;
                font-style: italic;
                margin-top: 10px;
                border-left: 3px solid ${primaryColor};
            }
            
            /* Photos */
            .photos-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
                margin-top: 12px;
            }
            .photo-item {
                width: 31%;
                height: 120px;
                border-radius: 12px;
                border: 1px solid #E0E0E0;
                object-fit: contain;
                background: #F9F9F9;
            }
            .photos-legal {
                color: #9CA3AF;
                font-size: 8px;
                font-style: italic;
                margin-top: 8px;
            }
            
            /* Warranty */
            .warranty-box {
                background: ${hasWarranty ? '#ECFDF5' : '#F9FAFB'};
                border: 1px solid ${hasWarranty ? '#A7F3D0' : '#E5E7EB'};
                border-radius: 8px;
                padding: 15px;
                margin-top: 20px;
                page-break-inside: avoid;
            }
            .warranty-header {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
            }
            .warranty-icon {
                font-size: 24px;
                margin-right: 12px;
            }
            .warranty-title {
                color: ${hasWarranty ? '#065F46' : '#374151'};
                font-weight: bold;
                font-size: 13px;
            }
            .warranty-details {
                margin-left: 36px;
            }
            .warranty-row {
                margin-bottom: 4px;
                font-size: 10px;
            }
            .warranty-row strong {
                color: #374151;
            }
            .warranty-condition {
                background: ${hasWarranty ? '#D1FAE5' : '#F3F4F6'};
                padding: 8px;
                border-radius: 4px;
                margin-top: 10px;
                font-size: 9px;
                color: ${hasWarranty ? '#047857' : '#6B7280'};
            }
            
            /* QR Section */
            .qr-section {
                background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
                border: 2px solid #6366F1;
                border-radius: 12px;
                padding: 20px;
                margin-top: 20px;
                display: flex;
                align-items: center;
                page-break-inside: avoid;
            }
            .qr-image {
                width: 120px;
                height: 120px;
                background: white;
                border-radius: 8px;
                padding: 8px;
                margin-right: 20px;
            }
            .qr-content {
                flex: 1;
            }
            .qr-title {
                color: #4338CA;
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 8px;
            }
            .qr-description {
                color: #4B5563;
                font-size: 11px;
                margin-bottom: 10px;
            }
            .qr-note {
                background: white;
                padding: 10px;
                border-radius: 6px;
                color: #6B7280;
                font-size: 9px;
                font-style: italic;
            }
            .qr-missing {
                background: #FEF3C7;
                border-color: #F59E0B;
            }
            .qr-missing .qr-title {
                color: #92400E;
            }
            
            /* Signatures */
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
            .signature-name {
                font-weight: normal;
                font-size: 9px;
                color: #6B7280;
            }
            .signature-id {
                font-family: 'Courier New', monospace;
                font-size: 8px;
                color: #9CA3AF;
            }
            .conformity-text {
                font-size: 8px;
                color: #6B7280;
                font-style: italic;
                margin-top: 6px;
                text-align: center;
            }
            
            /* Footer */
            .footer {
                position: fixed;
                bottom: 20px;
                left: 50px;
                right: 50px;
                text-align: center;
                font-size: 9px;
                border-top: 1px solid #E5E7EB;
                padding-top: 10px;
            }
            .footer-legal {
                color: #6B7280;
                margin-bottom: 6px;
            }
            .footer-branding {
                color: #9CA3AF;
            }
            .footer-meta {
                font-family: 'Courier New', monospace;
                font-size: 7px;
                color: #D1D5DB;
                margin-top: 6px;
            }
            .pro-badge {
                display: inline-block;
                background: ${primaryColor};
                color: white;
                padding: 3px 8px;
                border-radius: 10px;
                font-size: 8px;
                font-weight: bold;
                margin-bottom: 6px;
            }
        </style>
    </head>
    <body>
        <!-- Professional Header -->
        <div class="header-container">
            <div class="brand-section">
                ${isPro && branding?.logoURL
            ? `<img src="${branding.logoURL}" style="height: 50px; max-width: 120px; object-fit: contain; margin-right: 15px; border-radius: 8px;" />`
            : `<div class="brand-logo">●</div>`
        }
                <div>
                    <h1 class="brand-title">${isPro && (technicianProfile?.businessName || technicianProfile?.fullName) ? (technicianProfile.businessName || technicianProfile.fullName) : 'QRclima'}</h1>
                    <div class="brand-subtitle">Reporte de Servicio Técnico</div>
                    ${!isPro && (technicianProfile?.businessName || technicianProfile?.fullName) ? `<div style="color: #9CA3AF; font-size: 10px; margin-top: 2px;">Técnico: ${technicianProfile?.fullName || technicianProfile?.businessName || ''}</div>` : ''}
                </div>
            </div>
            <div class="meta-info">
                <div class="folio-box">
                    <div class="folio-label">Folio de Servicio</div>
                    <div class="folio-value">#${service.id.substring(0, 8).toUpperCase()}</div>
                    <div class="folio-date">${serviceDate} • ${serviceTime}</div>
                </div>
                <div class="status-badge">${service.status.toUpperCase()}</div>
                <div class="status-disclaimer">Estado registrado al momento del cierre del servicio.</div>
                ${service.status !== 'Terminado' ? '<div class="not-closed-warning">Este documento no constituye cierre de servicio.</div>' : ''}
                ${equipmentQrId ? `<div class="traceability-badge">Equipo: ${equipmentQrId.substring(0, 8)}</div>` : ''}
            </div>
        </div>

        <!-- Executive Summary -->
        <div class="executive-summary">
            <div class="executive-summary-title">Resumen del Servicio</div>
            <div class="executive-summary-text">${executiveSummary}</div>
        </div>

        <!-- Client & Equipment Info -->
        <div class="two-columns">
            <div class="column">
                <div class="info-box">
                    <div class="box-title"><span class="box-icon">●</span> Cliente</div>
                    <div class="client-name">${client.name}</div>
                    ${client.phone ? `<div class="info-row"><span class="info-icon">☎</span> ${client.phone}</div>` : ''}
                    ${client.address ? `<div class="info-row"><span class="info-icon">◉</span> ${client.address}</div>` : ''}
                </div>
            </div>
            <div class="column">
                <div class="info-box">
                    <div class="box-title"><span class="box-icon">●</span> Equipo</div>
                    <div style="display: inline-block; background: ${primaryColor}15; color: ${primaryColor}; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; margin-bottom: 8px;">
                        ${service.type}
                    </div>
                    ${equipment ? `
                    <div style="font-size: 12px; font-weight: 600; color: #111827;">${equipment.brand} ${equipment.model}</div>
                    <div style="color: #6B7280; font-size: 10px;">${equipment.type}</div>
                    ${equipment.capacityBTU ? `<div style="display: inline-block; background: #F3F4F6; padding: 3px 8px; border-radius: 4px; font-size: 10px; color: #374151; margin-top: 6px;">${equipment.capacityBTU} BTU</div>` : ''}
                    ` : ''}
                    ${client.address ? `<div style="color: #9CA3AF; font-size: 9px; margin-top: 6px;">Ubicación: ${client.address}</div>` : ''}
                </div>
            </div>
        </div>

        <!-- Diagnosis (if repair) -->
        ${service.diagnosis ? `
        <div class="diagnosis-section">
            <div class="diagnosis-title">DIAGNÓSTICO TÉCNICO (${service.diagnosis.errorCode})</div>
            <div class="diagnosis-text">${service.diagnosis.description}</div>
            ${service.diagnosis.cause ? `<div class="diagnosis-cause">Causa: ${service.diagnosis.cause}</div>` : ''}
        </div>` : ''}

        <!-- Tasks & Checklist -->
        <div class="two-columns">
            <div class="column">
                <div class="section-title">Trabajos Realizados</div>
                ${service.tasks && service.tasks.length > 0 ? `
                <div class="grid-container">
                    ${service.tasks.map(task => `<div class="grid-item">${task}</div>`).join('')}
                </div>` : '<div style="color: #9CA3AF; font-style: italic;">No especificados</div>'}
                
                ${service.notes ? `
                <div style="background: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 0 8px 8px 0; padding: 12px 14px; margin-top: 12px;">
                    <div style="color: #92400E; font-weight: bold; font-size: 10px; margin-bottom: 6px;">Observaciones Técnicas</div>
                    <div style="color: #78350F; font-size: 10px; line-height: 1.4;">${service.notes}</div>
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
                </div>
                <div class="checklist-compensation">
                    Los valores técnicos detallados de operación, mediciones y parámetros del equipo se encuentran disponibles en el historial digital asociado al código QR de este reporte.
                </div>` : '<div style="color: #9CA3AF; font-style: italic;">Sin checklist</div>'}
            </div>
        </div>

        <!-- Photos -->
        ${service.photos && service.photos.length > 0 ? `
        <div class="section-title">Evidencia Fotográfica</div>
        <div class="photos-grid">
            ${service.photos.slice(0, 6).map(photo => `<img src="${photo}" class="photo-item" />`).join('')}
        </div>
        <div class="photos-legal">Las imágenes forman parte del registro técnico del servicio.</div>
        ` : ''}

        <!-- Warranty -->
        <div class="warranty-box">
            <div class="warranty-header">
                <div class="warranty-icon">${hasWarranty ? '◆' : '●'}</div>
                <div class="warranty-title">${hasWarranty ? `Garantía de Servicio: ${warrantyMonths} ${warrantyMonths === 1 ? 'Mes' : 'Meses'}` : 'Certificación de Entrega'}</div>
            </div>
            <div class="warranty-details">
                ${hasWarranty ? `
                <div class="warranty-row"><strong>Vigencia:</strong> ${warrantyMonths} meses desde ${serviceDate}</div>
                <div class="warranty-row"><strong>Cubre:</strong> Mano de obra realizada</div>
                <div class="warranty-row"><strong>No cubre:</strong> Partes eléctricas, fugas de gas refrigerante, daños por uso indebido</div>
                <div class="warranty-condition">La garantía es válida únicamente cuando el equipo no ha sido manipulado por terceros.</div>
                ` : `
                <div style="color: #6B7280; font-size: 10px;">Equipo operando correctamente. Entrega a satisfacción del cliente.</div>
                `}
            </div>
        </div>

        <!-- QR Section -->
        ${qrImageUrl ? `
        <div class="qr-section">
            <img src="${qrImageUrl}" class="qr-image" />
            <div class="qr-content">
                <div class="qr-title">Historial Digital del Equipo</div>
                <div class="qr-description">Escanee este código para consultar el historial técnico completo del equipo.</div>
                <div style="margin: 10px 0;">
                    <a href="${qrUrl}" target="_blank" style="color: #4338CA; font-size: 11px; text-decoration: underline; word-break: break-all;">
                        ${qrUrl}
                    </a>
                </div>
                <div class="qr-note">
                    Este código QR vincula el equipo con su bitácora digital permanente. 
                    El PDF es un comprobante; el QR es la fuente actualizada.
                </div>
            </div>
        </div>
        ` : `
        <div class="qr-section qr-missing">
            <div class="qr-content" style="text-align: center;">
                <div class="qr-title">Equipo sin QR Asociado</div>
                <div class="qr-description">Este equipo aún no tiene código QR vinculado a su historial digital.</div>
                <div style="margin-top: 10px; font-weight: bold; color: #92400E;">
                    Solicite al técnico la vinculación del equipo a su historial digital.
                </div>
            </div>
        </div>
        `}

        <!-- Signatures -->
        <div class="signatures-container">
            <div class="signature-box">
                ${technicianProfile?.signature ?
            `<img src="${technicianProfile.signature}" class="signature-image" />` :
            '<div style="height: 50px;"></div>'}
                <div class="signature-line">
                    Firma del Técnico<br/>
                    <span class="signature-name">${technicianProfile?.fullName || technicianProfile?.businessName || technicianProfile?.email || ''}</span>
                </div>
                <div class="signature-id">ID: ${technicianId.toUpperCase()}</div>
            </div>
            <div class="signature-box">
                ${service.clientSignature ?
            `<img src="${service.clientSignature}" class="signature-image" />` :
            '<div style="height: 50px;"></div>'}
                <div class="signature-line">Firma de Conformidad del Cliente</div>
                <div class="conformity-text">
                    Declaro haber recibido el servicio descrito y estar conforme con el estado del equipo al momento de la entrega.
                </div>
            </div>
        </div>

        ${!isPro ? `
        <!-- Promo Banner for FREE users -->
        <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); border-radius: 12px; padding: 20px; margin-top: 20px; text-align: center; color: white;">
            <div style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">◆ Bitácora Digital del Equipo</div>
            <div style="font-size: 11px; margin-bottom: 12px; line-height: 1.4;">Solicite a su técnico utilizar QRclima para acceder al historial completo de mantenimientos de su equipo.</div>
            <a href="https://qrclima.tesivil.com/" target="_blank" style="display: inline-block; background: white; color: #4F46E5; padding: 8px 20px; border-radius: 20px; font-weight: bold; font-size: 12px; text-decoration: none;">
                qrclima.tesivil.com
            </a>
        </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
            ${isPro ? `
                <span class="pro-badge">Técnico Verificado</span>
                <div class="footer-legal">
                    ${branding?.footerText || 'Este documento es un comprobante de servicio técnico generado digitalmente.'}
                </div>
            ` : `
                <div class="footer-legal">Este documento es un comprobante de servicio técnico generado digitalmente.</div>
                <div class="footer-branding">Powered by QRclima | TESIVIL</div>
            `}
            <div class="footer-meta">DocID: ${service.id} | Formato: ${PDF_TEMPLATE_VERSION}</div>
        </div>
    </body>
    </html>
        `;

    console.log('📄 [PDF] HTML template built, length:', html.length);

    try {
        // Generate PDF file
        console.log('📄 [PDF] Calling Print.printToFileAsync...');
        const { uri } = await Print.printToFileAsync({
            html,
            base64: false,
        });

        console.log('📄 [PDF] PDF generated at:', uri);

        // Check if sharing is available and share
        console.log('📄 [PDF] Checking if sharing is available...');
        if (await Sharing.isAvailableAsync()) {
            console.log('📄 [PDF] Sharing available, opening share dialog...');
            await Sharing.shareAsync(uri, {
                mimeType: 'application/pdf',
                dialogTitle: 'Compartir Reporte de Servicio',
                UTI: 'com.adobe.pdf',
            });
            console.log('📄 [PDF] Share dialog closed');
        } else {
            throw new Error('Compartir no está disponible en este dispositivo');
        }
    } catch (error) {
        console.error('📄 [PDF] Error generating PDF:', error);
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
    const folio = `QT - ${new Date().getFullYear()}${quote.id.substring(0, 5).toUpperCase()} `;

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
    < !DOCTYPE html >
        <html>
        <head>
        <meta charset="utf-8" >
            <title>Presupuesto </title>
            <style>
            * {
                margin: 0;
                padding: 0;
                box- sizing: border - box;
            }
            body {
    font - family: 'Helvetica Neue', Arial, sans - serif;
    color: #333;
    line - height: 1.5;
    padding: 30px;
    font - size: 12px;
}
            .header {
    text - align: center;
    border - bottom: 3px solid #16A34A;
    padding - bottom: 15px;
    margin - bottom: 20px;
}
            .header h1 {
    color: #16A34A;
    font - size: 24px;
    margin - bottom: 3px;
}
            .header.subtitle {
    color: #666;
    font - size: 16px;
    font - weight: bold;
}
            .header.folio {
    color: #999;
    font - size: 11px;
    margin - top: 5px;
}
            .client - section {
    background: #F8FAFC;
    padding: 15px;
    border - radius: 8px;
    margin - bottom: 20px;
}
            .client - section h3 {
    color: #16A34A;
    font - size: 12px;
    margin - bottom: 8px;
}
            .section - title {
    color: #16A34A;
    font - size: 13px;
    font - weight: bold;
    margin - bottom: 10px;
    padding - bottom: 5px;
    border - bottom: 1px solid #E5E7EB;
}
            table {
    width: 100 %;
    border - collapse: collapse;
    margin - bottom: 20px;
}
            th {
    background: #F3F4F6;
    padding: 10px;
    text - align: left;
    font - weight: bold;
    border: 1px solid #E5E7EB;
}
            td {
    padding: 10px;
    border: 1px solid #E5E7EB;
}
            .text - right {
    text - align: right;
}
            .totals - section {
    background: #1F2937;
    color: white;
    padding: 15px;
    border - radius: 8px;
    margin - top: 20px;
}
            .totals - row {
    display: flex;
    justify - content: space - between;
    padding: 5px 0;
}
            .totals - row.final {
    border - top: 1px solid #4B5563;
    padding - top: 10px;
    margin - top: 5px;
    font - size: 16px;
    font - weight: bold;
}
            .totals - row.label {
    color: #9CA3AF;
}
            .totals - row.final.label {
    color: white;
}
            .totals - row.value {
    color: #10B981;
}
            .footer {
    margin - top: 30px;
    padding - top: 15px;
    border - top: 1px solid #E5E7EB;
    text - align: center;
    color: #666;
    font - size: 10px;
}
            .validity {
    background: #FEF3C7;
    color: #92400E;
    padding: 10px;
    border - radius: 6px;
    text - align: center;
    margin - top: 15px;
    font - weight: bold;
}
            .notes {
    background: #F3F4F6;
    padding: 10px;
    border - radius: 6px;
    margin - top: 15px;
    font - style: italic;
    color: #666;
}
</style>
    </head>
    < body >
    <div class="header" >
        <h1>❄️ QRclima </h1>
            < div class="subtitle" > PRESUPUESTO </div>
                < div class="folio" > Folio: ${folio} | Fecha: ${currentDate} </div>
                    </div>

                    < div class="client-section" >
                        <h3>📋 DATOS DEL CLIENTE </h3>
                            < strong > ${client.name} </strong><br>
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
        ` : ''
        }

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
        ` : ''
        }

<div class="totals-section" >
    ${quote.requires_invoice ? `
            <div class="totals-row">
                <span class="label">Subtotal (Base)</span>
                <span class="value">${formatCurrency(quote.subtotal)}</span>
            </div>
            <div class="totals-row">
                <span class="label">IVA (16%)</span>
                <span class="value">${formatCurrency(quote.tax)}</span>
            </div>
            ` : ''
        }
<div class="totals-row final" >
    <span class="label" > TOTAL A PAGAR </span>
        < span class="value" > ${formatCurrency(quote.total)} </span>
            </div>
            ${!quote.requires_invoice ? `<div style="color: #9CA3AF; font-size: 10px; margin-top: 5px;">* Precios con IVA incluido</div>` : ''}
</div>

    < div class="validity" >
            📅 Vigencia del presupuesto: ${quote.validity_days} días(hasta ${validityStr})
    </div>

        ${quote.notes ? `
        <div class="notes">
            <strong>Notas:</strong> ${quote.notes}
        </div>
        ` : ''
        }

<div class="footer" >
    Técnico: ${technicianEmail || 'Técnico Certificado'} <br>
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
    const folio = `CF - ${new Date().getFullYear()}${quote.id.substring(0, 5).toUpperCase()} `;

    // Separate items by type
    const moItems = quote.items.filter(item => item.type === 'MO');
    const mtItems = quote.items.filter(item => item.type === 'MT');

    const html = `
    < !DOCTYPE html >
        <html>
        <head>
        <meta charset="utf-8" >
            <title>Cotización </title>
            <style>
            * {
                margin: 0;
                padding: 0;
                box- sizing: border - box;
            }
            body {
    font - family: 'Helvetica Neue', Arial, sans - serif;
    color: #333;
    line - height: 1.5;
    padding: 30px;
    font - size: 12px;
    position: relative;
}
            .watermark {
    position: fixed;
    bottom: 20px;
    left: 0;
    right: 0;
    text - align: center;
    color: #CBD5E1;
    font - size: 10px;
    font - style: italic;
    letter - spacing: 1px;
}
            .header {
    text - align: center;
    border - bottom: 3px solid #10B981;
    padding - bottom: 15px;
    margin - bottom: 20px;
}
            .header h1 {
    color: #10B981;
    font - size: 24px;
    margin - bottom: 3px;
}
            .header.subtitle {
    color: #666;
    font - size: 16px;
    font - weight: bold;
}
            .header.folio {
    color: #999;
    font - size: 11px;
    margin - top: 5px;
}
            .client - section {
    background: #F0FDF4;
    padding: 15px;
    border - radius: 8px;
    margin - bottom: 20px;
    border - left: 4px solid #10B981;
}
            .client - section h3 {
    color: #10B981;
    font - size: 12px;
    margin - bottom: 8px;
}
            .section - title {
    font - size: 13px;
    font - weight: bold;
    margin - bottom: 10px;
    padding - bottom: 5px;
    border - bottom: 1px solid #E5E7EB;
}
            .section - title.mo {
    color: #7C3AED;
}
            .section - title.mt {
    color: #EA580C;
}
            table {
    width: 100 %;
    border - collapse: collapse;
    margin - bottom: 20px;
}
            th {
    background: #F3F4F6;
    padding: 10px;
    text - align: left;
    font - weight: bold;
    border: 1px solid #E5E7EB;
    font - size: 11px;
}
            td {
    padding: 10px;
    border: 1px solid #E5E7EB;
}
            .text - right {
    text - align: right;
}
            .text - center {
    text - align: center;
}
            .code - badge {
    display: inline - block;
    padding: 2px 6px;
    border - radius: 4px;
    font - size: 9px;
    font - weight: bold;
}
            .code - mo {
    background: #EDE9FE;
    color: #7C3AED;
}
            .code - mt {
    background: #FFEDD5;
    color: #EA580C;
}
            .totals - section {
    background: #1F2937;
    color: white;
    padding: 20px;
    border - radius: 8px;
    margin - top: 20px;
}
            .totals - row {
    display: flex;
    justify - content: space - between;
    padding: 8px 0;
}
            .totals - row.final {
    border - top: 2px solid #4B5563;
    padding - top: 15px;
    margin - top: 10px;
    font - size: 18px;
    font - weight: bold;
}
            .totals - row.label {
    color: #9CA3AF;
}
            .totals - row.final.label {
    color: white;
}
            .totals - row.value {
    color: #10B981;
    font - weight: bold;
}
            .notes {
    background: #F3F4F6;
    padding: 12px;
    border - radius: 6px;
    margin - top: 15px;
    font - style: italic;
    color: #666;
}
            .signatures - container {
    display: flex;
    justify - content: center;
    margin - top: 40px;
    page -break-inside: avoid;
}
            .signature - box {
    width: 60 %;
    text - align: center;
    border - top: 1px solid #9CA3AF;
    padding - top: 10px;
}
            .signature - image {
    height: 60px;
    margin - bottom: 5px;
    object - fit: contain;
    display: block;
    margin - left: auto;
    margin - right: auto;
}
            .technician - name {
    font - weight: bold;
    font - size: 12px;
    color: #374151;
}
            .footer {
    margin - top: 30px;
    padding - top: 15px;
    border - top: 1px solid #E5E7EB;
    text - align: center;
    color: #666;
    font - size: 10px;
}
</style>
    </head>
    < body >
    <div class="watermark" > Elaborado con QRclima powered by TESIVIL </div>

        < div class="header" >
            <h1>❄️ QRclima </h1>
                < div class="subtitle" > COTIZACIÓN </div>
                    < div class="folio" > Folio: ${folio} | Fecha: ${currentDate} </div>
                        </div>

                        < div class="client-section" >
                            <h3>📋 DATOS DEL CLIENTE </h3>
                                < strong > ${client.name} </strong><br>
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
        ` : ''
        }

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
        ` : ''
        }

<div class="totals-section" >
    <div class="totals-row final" >
        <span class="label" > TOTAL A PAGAR </span>
            < span class="value" > ${formatCotizadorCurrency(quote.total)} </span>
                </div>
                < div style = "color: #9CA3AF; font-size: 10px; margin-top: 8px;" >* Precios con IVA incluido </div>
                    </div>

        ${quote.notes ? `
        <div class="notes">
            <strong>Notas:</strong> ${quote.notes}
        </div>
        ` : ''
        }

<div class="signatures-container" >
    <div class="signature-box" >
        ${technicianProfile?.signature ?
            `<img src="${technicianProfile.signature}" class="signature-image" />` :
            '<div style="height: 60px;"></div>'
        }
<div class="technician-name" >
    ${technicianProfile?.fullName || technicianProfile?.businessName || technicianProfile?.email || 'Técnico Certificado'}
</div>
    < div style = "font-size: 10px; color: #6B7280; margin-top: 2px;" > Técnico Responsable </div>
        </div>
        </div>

        < div class="footer" >
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
