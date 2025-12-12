import * as Print from 'expo-print';
import { QuoteItem } from '../context/QuoteStateContext';

type QuoteData = {
    items: QuoteItem[];
    totalMaterialCost: number;
    totalLaborCost: number;
};

export const generateQuotePdf = async (data: QuoteData): Promise<string> => {
    const { items, totalMaterialCost, totalLaborCost } = data;
    const total = totalMaterialCost + totalLaborCost;

    const itemsHtml = items.map(item => `
        <tr>
            <td>${item.name}</td>
            <td style="text-align: center">${item.quantity}</td>
            <td style="text-align: right">$${(item.unitPrice / 100).toFixed(2)}</td>
            <td style="text-align: right">$${(item.laborCost / 100).toFixed(2)}</td>
            <td style="text-align: right">$${((item.unitPrice + item.laborCost) * item.quantity / 100).toFixed(2)}</td>
        </tr>
    `).join('');

    const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #333; }
            .header { margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f8f9fa; color: #333; font-weight: bold; text-align: left; padding: 10px; border-bottom: 2px solid #ddd; }
            td { padding: 10px; border-bottom: 1px solid #eee; }
            .totals { margin-top: 30px; text-align: right; }
            .totals .row { margin-bottom: 5px; font-size: 16px; }
            .totals .grand-total { font-size: 20px; font-weight: bold; color: #007bff; margin-top: 10px; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <div class="header">
            <h1>Cotización de Servicio Eléctrico</h1>
            <p>Fecha: ${new Date().toLocaleDateString()}</p>
            <p>TESIVIL - Estimación Profesional</p>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Concepto</th>
                    <th style="text-align: center">Cant</th>
                    <th style="text-align: right">P. Unit</th>
                    <th style="text-align: right">M. Obra</th>
                    <th style="text-align: right">Total</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>

        <div class="totals">
            <div class="row">Total Materiales: $${(totalMaterialCost / 100).toFixed(2)}</div>
            <div class="row">Total Mano de Obra: $${(totalLaborCost / 100).toFixed(2)}</div>
            <div class="row grand-total">Gran Total: $${(total / 100).toFixed(2)}</div>
        </div>

        <div class="footer">
            <p>Este presupuesto tiene una vigencia de 15 días.</p>
            <p>Generado con TESIVIL App</p>
        </div>
      </body>
    </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    return uri;
};
