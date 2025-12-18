import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { collection, addDoc, getDocs, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { generateUniqueToken, getQrWebUrl } from './equipment-service';

// ============================================
// TESIVIL QR LABELS SERVICE
// PDF generation for "Hoja de Vida" labels
// 20 labels per sheet, 1 generation per day
// ============================================

const QR_BASE_URL = 'https://qr.tesivil.com/a/';

export interface QRLabelToken {
    token: string;
    url: string;
}

export interface PDFDownloadRecord {
    id: string;
    technicianId: string;
    generatedAt: any;
    tokens: string[];
    downloadCount: number;
    pdfUri?: string;
}

// ============================================
// DAILY LIMIT CHECK (1 PDF per technician per day)
// ============================================

/**
 * Checks if technician can generate a new PDF today.
 * Returns true if no PDF generated today, false otherwise.
 */
export const canGeneratePDFToday = async (technicianId: string): Promise<boolean> => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const q = query(
            collection(db, 'qr_pdf_downloads'),
            where('technicianId', '==', technicianId),
            orderBy('generatedAt', 'desc'),
            limit(1)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return true; // No downloads ever, can generate
        }

        const lastDownload = snapshot.docs[0].data();
        const lastDate = lastDownload.generatedAt?.toDate?.() || new Date(0);

        return lastDate < today; // Can generate if last was before today
    } catch (e) {
        console.error('Error checking PDF generation limit:', e);
        return true; // Allow on error (be lenient)
    }
};

/**
 * Gets all previous PDF downloads for a technician
 */
export const getPreviousDownloads = async (technicianId: string): Promise<PDFDownloadRecord[]> => {
    try {
        const q = query(
            collection(db, 'qr_pdf_downloads'),
            where('technicianId', '==', technicianId),
            orderBy('generatedAt', 'desc'),
            limit(50)
        );

        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as PDFDownloadRecord[];
    } catch (e) {
        console.error('Error fetching previous downloads:', e);
        return [];
    }
};

// ============================================
// TOKEN BATCH GENERATION
// ============================================

/**
 * Generates a batch of 20 unique tokens for QR labels
 */
export const generateTokenBatch = async (count: number = 20): Promise<QRLabelToken[]> => {
    const tokens: QRLabelToken[] = [];

    for (let i = 0; i < count; i++) {
        const token = await generateUniqueToken();
        tokens.push({
            token,
            url: getQrWebUrl(token),
        });
    }

    return tokens;
};

// ============================================
// PDF HTML GENERATION
// ============================================

/**
 * Generates the HTML for the QR labels PDF.
 * Design: "Mini-Banner" format per TESIVIL specs
 * - Franja Superior: "HOJA DE VIDA DEL EQUIPO"
 * - Centro: QR + Iconografía
 * - Pie: "Powered by Tesivil"
 */
const generateLabelsHTML = (tokens: QRLabelToken[]): string => {
    const labelsPerRow = 4;
    const labelsPerColumn = 5;

    // Generate QR image using a free QR API (Google Charts)
    const getQRImageUrl = (url: string) => {
        return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}&format=png&margin=5`;
    };

    const labelHTML = tokens.map((t, index) => {
        const qrImageUrl = getQRImageUrl(t.url);

        return `
            <div class="label">
                <div class="label-header">HOJA DE VIDA DEL EQUIPO</div>
                <div class="label-body">
                    <div class="qr-section">
                        <img src="${qrImageUrl}" alt="QR ${t.token}" class="qr-code" />
                        <div class="token">${t.token.toUpperCase()}</div>
                    </div>
                    <div class="info-section">
                        <div class="icon-row">
                            <span class="icon">📅</span>
                            <span class="icon-label">Historial</span>
                        </div>
                        <div class="icon-row">
                            <span class="icon">🛠️</span>
                            <span class="icon-label">Mantenimiento</span>
                        </div>
                        <div class="icon-row">
                            <span class="icon">📱</span>
                            <span class="icon-label">Contacto</span>
                        </div>
                        <div class="cta">Escanea para ver historial</div>
                    </div>
                </div>
                <div class="label-footer">
                    <span class="powered">Powered by <strong>Tesivil</strong></span>
                    <span class="slogan">Tecnología para expertos</span>
                </div>
            </div>
        `;
    }).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Etiquetas QR - TESIVIL</title>
        <style>
            @page {
                size: A4;
                margin: 8mm;
            }
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                font-size: 7pt;
                color: #333;
                background: white;
            }
            .page {
                display: grid;
                grid-template-columns: repeat(${labelsPerRow}, 1fr);
                grid-template-rows: repeat(${labelsPerColumn}, 1fr);
                gap: 3mm;
                height: 100vh;
                padding: 2mm;
            }
            .label {
                border: 1px dashed #ccc;
                border-radius: 3mm;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                background: #fff;
            }
            .label-header {
                background: linear-gradient(135deg, #6366F1, #8B5CF6);
                color: white;
                font-size: 6pt;
                font-weight: bold;
                text-align: center;
                padding: 2mm 1mm;
                letter-spacing: 0.5px;
            }
            .label-body {
                flex: 1;
                display: flex;
                flex-direction: row;
                padding: 2mm;
                gap: 2mm;
            }
            .qr-section {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            .qr-code {
                width: 22mm;
                height: 22mm;
                border: 1px solid #E5E7EB;
                border-radius: 2mm;
            }
            .token {
                font-family: monospace;
                font-size: 7pt;
                font-weight: bold;
                color: #6366F1;
                margin-top: 1mm;
                letter-spacing: 1px;
            }
            .info-section {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 1mm;
            }
            .icon-row {
                display: flex;
                align-items: center;
                gap: 1mm;
            }
            .icon {
                font-size: 8pt;
            }
            .icon-label {
                font-size: 6pt;
                color: #666;
            }
            .cta {
                font-size: 5pt;
                color: #6366F1;
                font-weight: bold;
                margin-top: 1mm;
                background: #EEF2FF;
                padding: 1mm;
                border-radius: 1mm;
                text-align: center;
            }
            .label-footer {
                background: #F8FAFC;
                border-top: 1px solid #E5E7EB;
                padding: 1.5mm;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .powered {
                font-size: 5pt;
                color: #666;
            }
            .slogan {
                font-size: 5pt;
                color: #9CA3AF;
                font-style: italic;
            }
            
            /* Cut guides */
            .label {
                position: relative;
            }
            .label::before,
            .label::after {
                content: '';
                position: absolute;
                border: 0 dashed #ddd;
            }
            
            /* Print optimization */
            @media print {
                body {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .label {
                    page-break-inside: avoid;
                }
            }
        </style>
    </head>
    <body>
        <div class="page">
            ${labelHTML}
        </div>
    </body>
    </html>
    `;
};

// ============================================
// PDF GENERATION AND SHARING
// ============================================

interface GeneratePDFResult {
    success: boolean;
    tokens: string[];
    downloadId?: string;
    error?: string;
}

/**
 * Generates a PDF with 20 QR labels and saves the download record.
 * Enforces 1 PDF per day limit.
 */
export const generateQRLabelsPDF = async (technicianId: string): Promise<GeneratePDFResult> => {
    try {
        // Check daily limit
        const canGenerate = await canGeneratePDFToday(technicianId);
        if (!canGenerate) {
            return {
                success: false,
                tokens: [],
                error: 'Ya generaste tu hoja de etiquetas hoy. Intenta mañana.',
            };
        }

        // Generate 20 unique tokens
        console.log('Generating 20 unique tokens...');
        const tokenBatch = await generateTokenBatch(20);
        const tokens = tokenBatch.map(t => t.token);

        // Generate PDF HTML
        console.log('Generating PDF HTML...');
        const html = generateLabelsHTML(tokenBatch);

        // Create PDF
        console.log('Creating PDF file...');
        const { uri } = await Print.printToFileAsync({
            html,
            base64: false,
        });

        console.log('PDF generated at:', uri);

        // Save download record to Firestore
        const downloadRef = await addDoc(collection(db, 'qr_pdf_downloads'), {
            technicianId,
            generatedAt: serverTimestamp(),
            tokens,
            downloadCount: 1,
        });

        console.log('Download record saved:', downloadRef.id);

        // Share the PDF
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
                mimeType: 'application/pdf',
                dialogTitle: 'Guardar Etiquetas QR',
                UTI: 'com.adobe.pdf',
            });
        }

        return {
            success: true,
            tokens,
            downloadId: downloadRef.id,
        };

    } catch (e: any) {
        console.error('Error generating QR labels PDF:', e);
        return {
            success: false,
            tokens: [],
            error: e.message || 'Error al generar el PDF',
        };
    }
};

/**
 * Gets time remaining until next PDF can be generated
 */
export const getTimeUntilNextGeneration = async (technicianId: string): Promise<{
    canGenerate: boolean;
    hoursRemaining: number;
    minutesRemaining: number;
}> => {
    try {
        const q = query(
            collection(db, 'qr_pdf_downloads'),
            where('technicianId', '==', technicianId),
            orderBy('generatedAt', 'desc'),
            limit(1)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { canGenerate: true, hoursRemaining: 0, minutesRemaining: 0 };
        }

        const lastDownload = snapshot.docs[0].data();
        const lastDate = lastDownload.generatedAt?.toDate?.() || new Date(0);

        const tomorrow = new Date(lastDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const now = new Date();

        if (now >= tomorrow) {
            return { canGenerate: true, hoursRemaining: 0, minutesRemaining: 0 };
        }

        const diff = tomorrow.getTime() - now.getTime();
        const hoursRemaining = Math.floor(diff / (1000 * 60 * 60));
        const minutesRemaining = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return { canGenerate: false, hoursRemaining, minutesRemaining };
    } catch (e) {
        console.error('Error calculating next generation time:', e);
        return { canGenerate: true, hoursRemaining: 0, minutesRemaining: 0 };
    }
};
