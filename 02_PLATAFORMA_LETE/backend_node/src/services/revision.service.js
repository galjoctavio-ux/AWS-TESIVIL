import { supabaseAdmin } from './supabaseClient.js';
import { Buffer } from 'buffer';
import {
  calcularConsumoEquipos,
  detectarFugas,
  verificarSolar,
  generarDiagnosticosAutomaticos
} from './calculos.service.js';
import { enviarReportePorEmail } from './email.service.js';
import { generarPDF } from './pdf.service.js'; // Importamos el generador local (Puppeteer)

export const processRevision = async (payload, tecnicoAuth) => {
  const { revisionData, equiposData, firmaBase64 } = payload;

  if (!revisionData || !equiposData) {
    throw new Error('Faltan "revisionData" o "equiposData" en la solicitud.');
  }

  console.log(`[RevisionService] Procesando revisión. Caso ID: ${revisionData.caso_id || 'N/A'}`);

  // ---------------------------------------------------------
  // 0. OBTENER DATOS DEL PERFIL DEL INGENIERO
  // ---------------------------------------------------------
  let nombreIngeniero = 'Ingeniero Especialista';
  let firmaIngenieroUrl = null;

  try {
    // Intentamos buscar en la tabla 'profiles' usando el ID del usuario autenticado
    const { data: perfil, error: perfilError } = await supabaseAdmin
      .from('profiles')
      .select('nombre, firma_url')
      .eq('user_id', tecnicoAuth.id) // O eq('ea_user_id', ...) si usas ese ID
      .maybeSingle();

    if (!perfilError && perfil) {
      nombreIngeniero = perfil.nombre || tecnicoAuth.user_metadata?.full_name;
      firmaIngenieroUrl = perfil.firma_url;
    } else {
      console.warn('No se halló perfil en tabla, usando metadatos de Auth.');
      nombreIngeniero = tecnicoAuth.user_metadata?.full_name || tecnicoAuth.email;
    }
  } catch (e) {
    console.error('Error recuperando perfil ingeniero:', e.message);
    nombreIngeniero = tecnicoAuth.email || 'Técnico';
  }

  // ---------------------------------------------------------
  // 1. SANITIZACIÓN Y NORMALIZACIÓN DE DATOS
  // ---------------------------------------------------------
  const datosDeTrabajo = { ...revisionData };

  // Asegurar números
  datosDeTrabajo.caso_id = Number(datosDeTrabajo.caso_id);

  // Variables eléctricas críticas
  const iFase1 = parseFloat(datosDeTrabajo.corriente_red_f1) || 0;
  const iNeutro = parseFloat(datosDeTrabajo.corriente_red_n) || 0;
  const iFugaPinza = parseFloat(datosDeTrabajo.corriente_fuga_f1) || 0;
  const voltaje = parseFloat(datosDeTrabajo.voltaje_medido) || 127;

  // Lógica de "Se puede apagar todo"
  const sePuedeApagar = datosDeTrabajo.se_puede_apagar_todo === true || datosDeTrabajo.se_puede_apagar_todo === 'true';

  // --- CÁLCULO INTELIGENTE DE FUGA ---
  // Sobreescribimos el valor de fuga basándonos en la lógica de ingeniería
  if (sePuedeApagar) {
    // Si se apagó todo, cualquier consumo en Fase 1 es FUGA FANTASMA
    datosDeTrabajo.corriente_fuga_f1 = iFase1;
  } else {
    // Si no se pudo apagar, comparamos Neutro vs Fase
    // Si el Neutro trae más corriente que la fase (con tolerancia de 0.5A), hay fuga/retorno
    if (iNeutro > (iFase1 + 0.5)) {
      datosDeTrabajo.corriente_fuga_f1 = iNeutro - iFase1;
    } else {
      // Si no hay desbalance crítico, usamos lo que midió la pinza de fuga (si se usó)
      datosDeTrabajo.corriente_fuga_f1 = iFugaPinza;
    }
  }

  // Limpiar array de equipos y calcular consumos
  const equiposSanitizados = equiposData.map(eq => ({
    nombre_equipo: eq.nombre_equipo,
    nombre_personalizado: eq.nombre_personalizado || '',
    estado_equipo: eq.estado_equipo,
    unidad_tiempo: eq.unidad_tiempo || 'Horas/Día',
    tiempo_uso: parseFloat(eq.horas_uso || eq.tiempo_uso) || 0,
    amperaje_medido: parseFloat(eq.amperaje_medido) || 0,
    cantidad: parseFloat(eq.cantidad) || 1
  }));

  // Calculamos consumo estimado
  let equiposCalculados = calcularConsumoEquipos(equiposSanitizados, voltaje);

  // Ordenamos por consumo (Mayor a Menor) para el reporte
  equiposCalculados.sort((a, b) => (b.kwh_bimestre_calculado || 0) - (a.kwh_bimestre_calculado || 0));

  // Total Bimestral
  const totalKwhBimestre = equiposCalculados.reduce((acc, curr) => acc + (curr.kwh_bimestre_calculado || 0), 0);

  // Generamos diagnósticos automáticos (Textos de ayuda)
  const diagnosticosAuto = generarDiagnosticosAutomaticos(datosDeTrabajo, equiposCalculados);

  // ---------------------------------------------------------
  // 2. GUARDADO EN BASE DE DATOS (Supabase)
  // ---------------------------------------------------------

  // Preparamos objeto para insertar en 'revisiones'
  const datosParaInsertar = { ...datosDeTrabajo };

  // Borramos campos temporales que no existen en la tabla
  delete datosParaInsertar.voltaje_fn;
  delete datosParaInsertar.fuga_total;
  delete datosParaInsertar.amperaje_medido;
  delete datosParaInsertar.antiguedad_paneles;
  delete datosParaInsertar.equiposData; // Por si acaso

  // Agregamos metadatos del sistema
  datosParaInsertar.tecnico_id = tecnicoAuth.id;
  datosParaInsertar.diagnosticos_automaticos = diagnosticosAuto;
  datosParaInsertar.fecha_revision = new Date().toISOString();

  // INSERTAR REVISIÓN
  const { data: revData, error: revError } = await supabaseAdmin
    .from('revisiones')
    .insert(datosParaInsertar)
    .select()
    .single();

  if (revError) throw new Error(`Error insertando revisión: ${revError.message}`);

  const newRevisionId = revData.id;

  // INSERTAR EQUIPOS REVISADOS
  if (equiposCalculados.length > 0) {
    const equiposInsert = equiposCalculados.map(eq => ({
      revision_id: newRevisionId,
      nombre_equipo: eq.nombre_equipo,
      nombre_personalizado: eq.nombre_personalizado,
      amperaje_medido: eq.amperaje_medido,
      tiempo_uso: eq.tiempo_uso,
      unidad_tiempo: eq.unidad_tiempo,
      estado_equipo: eq.estado_equipo,
      kwh_bimestre_calculado: eq.kwh_bimestre_calculado
    }));

    const { error: eqErr } = await supabaseAdmin.from('equipos_revisados').insert(equiposInsert);
    if (eqErr) console.error('Error insertando equipos:', eqErr.message);
  }

  // ACTUALIZAR CASO (Estado Completado) Y OBTENER CLIENTE (Relacional)
  // Nota: Usamos la sintaxis relacional cliente:clientes(...) para sacar el nombre
  const { data: casoUpdated, error: casoError } = await supabaseAdmin
    .from('casos')
    .update({ status: 'completado' })
    .eq('id', datosDeTrabajo.caso_id)
    .select('id, cliente:clientes(nombre_completo, direccion_principal)')
    .single();

  if (casoError) console.warn('No se pudo actualizar el caso:', casoError.message);

  // ---------------------------------------------------------
  // 3. PROCESAMIENTO DE FIRMA CLIENTE (Subida a Storage)
  // ---------------------------------------------------------
  let firmaClienteUrl = null;

  if (firmaBase64) {
    try {
      const matches = firmaBase64.match(/^data:(.+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const contentType = matches[1];
        const bufferData = Buffer.from(matches[2], 'base64');
        const filePath = `firmas/revision-cliente-${newRevisionId}.png`;

        const { error: upErr } = await supabaseAdmin.storage
          .from('reportes')
          .upload(filePath, bufferData, { contentType, upsert: true });

        if (!upErr) {
          const { data: urlData } = supabaseAdmin.storage.from('reportes').getPublicUrl(filePath);
          firmaClienteUrl = urlData.publicUrl;

          // Guardamos la URL en la revisión
          await supabaseAdmin
            .from('revisiones')
            .update({ firma_url: firmaClienteUrl })
            .eq('id', newRevisionId);
        }
      }
    } catch (errFirma) {
      console.error('Error procesando firma:', errFirma);
    }
  }

  // ---------------------------------------------------------
  // 4. GENERACIÓN DE PDF (Node.js + Puppeteer)
  // ---------------------------------------------------------
  let pdfUrl = null;

  // Preparamos el objeto de datos para el PDF Service
  const datosParaPdf = {
    header: {
      id: newRevisionId,
      fecha_revision: revData.fecha_revision,
      // Extraemos datos del cliente de la relación (paso anterior)
      cliente_nombre: casoUpdated?.cliente?.nombre_completo || 'Cliente',
      cliente_direccion: casoUpdated?.cliente?.direccion_principal || 'Dirección no registrada',
      cliente_email: revData.cliente_email || '',
      tecnico_nombre: nombreIngeniero,
      firma_ingeniero_url: firmaIngenieroUrl
    },
    mediciones: {
      // Pasamos todos los datos eléctricos ya calculados
      ...datosDeTrabajo,
      // Aseguramos que pasamos la fuga calculada inteligentemente
      corriente_fuga_f1: datosDeTrabajo.corriente_fuga_f1
    },
    equipos: equiposCalculados, // Ya llevan el kwh calculado
    consumo_total_estimado: totalKwhBimestre,
    causas_alto_consumo: revData.diagnosticos_automaticos || [],
    recomendaciones_tecnico: revData.recomendaciones_tecnico || '',
    firma_cliente_url: firmaClienteUrl
  };

  try {
    console.log('Generando PDF localmente...');

    // Llamada al servicio local (pdf.service.js)
    const pdfBuffer = await generarPDF(datosParaPdf);

    if (pdfBuffer) {
      // Subir PDF a Supabase Storage
      const pdfPath = `reportes/reporte-${newRevisionId}.pdf`;

      const { error: upPdfErr } = await supabaseAdmin.storage
        .from('reportes')
        .upload(pdfPath, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (upPdfErr) {
        console.error('Error subiendo PDF a Storage:', upPdfErr.message);
      } else {
        const { data: urlData } = supabaseAdmin.storage.from('reportes').getPublicUrl(pdfPath);
        pdfUrl = urlData.publicUrl;
        console.log('PDF generado y subido:', pdfUrl);

        // Guardamos la URL final en la BD
        await supabaseAdmin
          .from('revisiones')
          .update({ pdf_url: pdfUrl })
          .eq('id', newRevisionId);
      }
    }
  } catch (pdfError) {
    console.error('Error en proceso de PDF:', pdfError);
    // No lanzamos error fatal, permitimos que termine el proceso de guardado
  }

  // ---------------------------------------------------------
  // 5. ENVÍO DE CORREO
  // ---------------------------------------------------------
  if (pdfUrl && revData.cliente_email) {
    try {
      console.log(`Enviando email a ${revData.cliente_email}...`);
      await enviarReportePorEmail(
        revData.cliente_email,
        casoUpdated?.cliente?.nombre_completo || 'Cliente Estimado',
        pdfUrl,
        revData.diagnosticos_automaticos
      );
    } catch (mailErr) {
      console.error('Error enviando correo:', mailErr.message);
    }
  }

  // Retorno final al controlador
  return {
    success: true,
    message: 'Revisión guardada exitosamente.',
    revision_id: newRevisionId,
    pdf_url: pdfUrl
  };
};