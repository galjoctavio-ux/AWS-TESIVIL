import { supabaseAdmin } from './supabaseClient.js';
import { Buffer } from 'buffer';
import {
  calcularConsumoEquipos,
  detectarFugas,
  verificarSolar,
  generarDiagnosticosAutomaticos
} from './calculos.service.js';
import { enviarReportePorEmail } from './email.service.js';
import { generarPDF } from './pdf.service.js';

export const processRevision = async (payload, tecnicoAuth) => {
  const { revisionData, equiposData, firmaBase64 } = payload;

  if (pdfBuffer) {
    const pdfPath = `reportes/reporte-${newRevisionId}.pdf`;
    const { error: upPdfErr } = await supabaseAdmin.storage.from('reportes').upload(pdfPath, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true
    });

    if (upPdfErr) throw upPdfErr;

    const { data: urlData } = supabaseAdmin.storage.from('reportes').getPublicUrl(pdfPath);
    pdfUrl = urlData.publicUrl;

    console.log('PDF generado y subido exitosamente:', pdfUrl);
    // Guardamos la URL del PDF generado
    await supabaseAdmin.from('revisiones').update({ pdf_url: pdfUrl }).eq('id', newRevisionId);
  }
} catch (pdfError) {
  console.error('Error crítico generando PDF:', pdfError.message);
  // No lanzamos error para no deshacer la transacción de la BD, pero el PDF faltará.
}

// ---------------------------------------------------------
// 6. ENVÍO DE CORREO
// ---------------------------------------------------------
if (pdfUrl && revisionResult.cliente_email) {
  console.log(`Enviando reporte por correo a: ${revisionResult.cliente_email}`);
  await enviarReportePorEmail(
    revisionResult.cliente_email,
    casoData?.cliente_nombre || 'Cliente',
    pdfUrl,
    revisionResult.causas_alto_consumo
  );
}

return {
  message: 'Revisión completada exitosamente.',
  revision_id: newRevisionId,
  pdf_url: pdfUrl
};

  } catch (error) {
  console.error('[RevisionService] Error Fatal:', error.message);
  throw error;
}
};