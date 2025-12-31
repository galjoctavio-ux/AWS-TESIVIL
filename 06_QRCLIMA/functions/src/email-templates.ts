/**
 * QRClima Email Templates
 * Templates HTML profesionales para emails transaccionales
 */

export function getVerificationEmailTemplate(code: string, userName?: string): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifica tu email - QRClima</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f4f8;">
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #f0f4f8;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); padding: 32px 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                QRClima
                            </h1>
                            <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                                Gestión Inteligente de Aires Acondicionados
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 22px; font-weight: 600; text-align: center;">
                                ¡Bienvenido${userName ? `, ${userName}` : ''}! 👋
                            </h2>
                            
                            <p style="margin: 0 0 24px; color: #64748b; font-size: 15px; line-height: 1.6; text-align: center;">
                                Gracias por registrarte en QRClima. Para completar tu registro, ingresa el siguiente código de verificación en la app:
                            </p>
                            
                            <!-- Verification Code Box -->
                            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px dashed #cbd5e1; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px;">
                                <p style="margin: 0 0 8px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                                    Tu código de verificación
                                </p>
                                <p style="margin: 0; color: #2563EB; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                    ${code}
                                </p>
                            </div>
                            
                            <p style="margin: 0 0 8px; color: #94a3b8; font-size: 13px; text-align: center;">
                                ⏱️ Este código expira en <strong>15 minutos</strong>
                            </p>
                            
                            <p style="margin: 0; color: #94a3b8; font-size: 13px; text-align: center;">
                                Si no solicitaste este código, puedes ignorar este email.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Divider -->
                    <tr>
                        <td style="padding: 0 40px;">
                            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0;">
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; text-align: center;">
                            <p style="margin: 0 0 8px; color: #94a3b8; font-size: 12px;">
                                © ${new Date().getFullYear()} QRClima by TESIVIL
                            </p>
                            <p style="margin: 0; color: #cbd5e1; font-size: 11px;">
                                Este es un email automático, por favor no respondas.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}

export function getPasswordResetEmailTemplate(code: string, userName?: string): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar contraseña - QRClima</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f4f8;">
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #f0f4f8;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); padding: 32px 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                QRClima
                            </h1>
                            <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                                Gestión Inteligente de Aires Acondicionados
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <div style="text-align: center; margin-bottom: 24px;">
                                <span style="font-size: 48px;">🔐</span>
                            </div>
                            
                            <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 22px; font-weight: 600; text-align: center;">
                                Recuperar Contraseña
                            </h2>
                            
                            <p style="margin: 0 0 24px; color: #64748b; font-size: 15px; line-height: 1.6; text-align: center;">
                                ${userName ? `Hola ${userName}, r` : 'R'}ecibimos una solicitud para restablecer tu contraseña. Usa el siguiente código:
                            </p>
                            
                            <!-- Verification Code Box -->
                            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px;">
                                <p style="margin: 0 0 8px; color: #92400e; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                                    Código de recuperación
                                </p>
                                <p style="margin: 0; color: #b45309; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                    ${code}
                                </p>
                            </div>
                            
                            <p style="margin: 0 0 8px; color: #94a3b8; font-size: 13px; text-align: center;">
                                ⏱️ Este código expira en <strong>15 minutos</strong>
                            </p>
                            
                            <p style="margin: 0; color: #ef4444; font-size: 13px; text-align: center; font-weight: 500;">
                                ⚠️ Si no solicitaste este cambio, tu cuenta podría estar en riesgo.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Divider -->
                    <tr>
                        <td style="padding: 0 40px;">
                            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0;">
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; text-align: center;">
                            <p style="margin: 0 0 8px; color: #94a3b8; font-size: 12px;">
                                © ${new Date().getFullYear()} QRClima by TESIVIL
                            </p>
                            <p style="margin: 0; color: #cbd5e1; font-size: 11px;">
                                Este es un email automático, por favor no respondas.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}

// ============================================
// Template: Confirmación de Compra
// ============================================
export interface OrderConfirmationData {
    orderId: string;
    productName: string;
    amount: number;
    paymentMethod: 'stripe' | 'tokens';
    tokensAmount?: number;
    shippingAddress?: string;
    userName?: string;
}

export function getOrderConfirmationEmailTemplate(data: OrderConfirmationData): string {
    const { orderId, productName, amount, paymentMethod, tokensAmount, shippingAddress, userName } = data;

    const paymentDisplay = paymentMethod === 'tokens'
        ? `🪙 ${tokensAmount} Tokens`
        : `$${amount.toLocaleString('es-MX')} MXN`;

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Pedido Confirmado! - QRClima</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f4f8;">
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #f0f4f8;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 32px 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                ✓ ¡Pedido Confirmado!
                            </h1>
                            <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                                QRClima Store
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <div style="text-align: center; margin-bottom: 24px;">
                                <span style="font-size: 56px;">🛍️</span>
                            </div>
                            
                            <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 22px; font-weight: 600; text-align: center;">
                                ¡Gracias por tu compra${userName ? `, ${userName}` : ''}!
                            </h2>
                            
                            <p style="margin: 0 0 24px; color: #64748b; font-size: 15px; line-height: 1.6; text-align: center;">
                                Hemos recibido tu pedido y ya estamos trabajando en él. Te notificaremos cuando esté en camino.
                            </p>
                            
                            <!-- Order Details Box -->
                            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 0 0 24px;">
                                <p style="margin: 0 0 4px; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">
                                    Número de Pedido
                                </p>
                                <p style="margin: 0 0 16px; color: #1e293b; font-size: 16px; font-weight: 600; font-family: 'Courier New', monospace;">
                                    #${orderId.slice(0, 12).toUpperCase()}
                                </p>
                                
                                <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 8px;">
                                    <table style="width: 100%;">
                                        <tr>
                                            <td style="color: #64748b; font-size: 14px; padding: 4px 0;">Producto:</td>
                                            <td style="color: #1e293b; font-size: 14px; font-weight: 500; text-align: right;">${productName}</td>
                                        </tr>
                                        <tr>
                                            <td style="color: #64748b; font-size: 14px; padding: 4px 0;">Total:</td>
                                            <td style="color: #10B981; font-size: 16px; font-weight: 700; text-align: right;">${paymentDisplay}</td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                            
                            ${shippingAddress ? `
                            <!-- Shipping Address -->
                            <div style="background-color: #fffbeb; border: 1px solid #fbbf24; border-radius: 12px; padding: 16px; margin: 0 0 24px;">
                                <p style="margin: 0 0 8px; color: #92400e; font-size: 12px; font-weight: 600;">
                                    📦 Dirección de Envío
                                </p>
                                <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.5;">
                                    ${shippingAddress}
                                </p>
                            </div>
                            ` : ''}
                            
                            <p style="margin: 0; color: #94a3b8; font-size: 13px; text-align: center;">
                                Tiempo estimado de preparación: <strong>1-3 días hábiles</strong>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Divider -->
                    <tr>
                        <td style="padding: 0 40px;">
                            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0;">
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; text-align: center;">
                            <p style="margin: 0 0 8px; color: #94a3b8; font-size: 12px;">
                                © ${new Date().getFullYear()} QRClima by TESIVIL
                            </p>
                            <p style="margin: 0; color: #cbd5e1; font-size: 11px;">
                                ¿Dudas? Escríbenos a qrclima@tesivil.com
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}

// ============================================
// Template: Pedido Enviado (con número de guía)
// ============================================
export interface OrderShippedData {
    orderId: string;
    productName: string;
    trackingNumber: string;
    trackingCarrier: string;
    userName?: string;
}

export function getOrderShippedEmailTemplate(data: OrderShippedData): string {
    const { orderId, productName, trackingNumber, trackingCarrier, userName } = data;

    // Carrier tracking URLs
    const carrierUrls: { [key: string]: string } = {
        'DHL': `https://www.dhl.com/mx-es/home/rastreo.html?tracking-id=${trackingNumber}`,
        'Estafeta': `https://rastreo3.estafeta.com/Seguimiento/EstafetaQ?type=R&referencia=${trackingNumber}`,
        'FedEx': `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
        'Correos de México': `https://www.correosdemexico.gob.mx/SSLServicios/SeguimientoEnvio/Seguimiento.aspx?guia=${trackingNumber}`,
        'Paquetexpress': `https://www.paquetexpress.com.mx/rastreo?numero=${trackingNumber}`,
    };

    const trackingUrl = carrierUrls[trackingCarrier] || '#';

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Tu pedido va en camino! - QRClima</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f4f8;">
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #f0f4f8;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); padding: 32px 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                📦 ¡Tu pedido va en camino!
                            </h1>
                            <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                                QRClima Store
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <div style="text-align: center; margin-bottom: 24px;">
                                <span style="font-size: 56px;">🚚</span>
                            </div>
                            
                            <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 22px; font-weight: 600; text-align: center;">
                                ¡Excelentes noticias${userName ? `, ${userName}` : ''}!
                            </h2>
                            
                            <p style="margin: 0 0 24px; color: #64748b; font-size: 15px; line-height: 1.6; text-align: center;">
                                Tu pedido ha sido enviado y pronto llegará a tu puerta. Puedes rastrearlo con los datos de guía.
                            </p>
                            
                            <!-- Tracking Box -->
                            <div style="background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); border: 2px solid #c4b5fd; border-radius: 12px; padding: 24px; margin: 0 0 24px; text-align: center;">
                                <p style="margin: 0 0 8px; color: #7c3aed; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                                    ${trackingCarrier}
                                </p>
                                <p style="margin: 0 0 16px; color: #5b21b6; font-size: 24px; font-weight: 700; letter-spacing: 2px; font-family: 'Courier New', monospace;">
                                    ${trackingNumber}
                                </p>
                                
                                <a href="${trackingUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                                    Rastrear Envío →
                                </a>
                            </div>
                            
                            <!-- Order Info -->
                            <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px;">
                                <table style="width: 100%;">
                                    <tr>
                                        <td style="color: #64748b; font-size: 13px; padding: 4px 0;">Pedido:</td>
                                        <td style="color: #1e293b; font-size: 13px; font-weight: 500; text-align: right;">
                                            #${orderId.slice(0, 12).toUpperCase()}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="color: #64748b; font-size: 13px; padding: 4px 0;">Producto:</td>
                                        <td style="color: #1e293b; font-size: 13px; font-weight: 500; text-align: right;">${productName}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <p style="margin: 24px 0 0; color: #94a3b8; font-size: 13px; text-align: center;">
                                Tiempo estimado de entrega: <strong>2-5 días hábiles</strong>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Divider -->
                    <tr>
                        <td style="padding: 0 40px;">
                            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0;">
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; text-align: center;">
                            <p style="margin: 0 0 8px; color: #94a3b8; font-size: 12px;">
                                © ${new Date().getFullYear()} QRClima by TESIVIL
                            </p>
                            <p style="margin: 0; color: #cbd5e1; font-size: 11px;">
                                ¿Problemas con tu envío? Escríbenos a qrclima@tesivil.com
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}
