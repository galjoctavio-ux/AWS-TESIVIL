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
    const { data: perfil, error: perfilError } = await supabaseAdmin
      .from('profiles')
      .select('nombre, firma_url')
      .eq('user_id', tecnicoAuth.id)
      .maybeSingle();

    if (!perfilError && perfil) {
      nombreIngeniero = perfil.nombre || tecnicoAuth.user_metadata?.full_name;
      firmaIngenieroUrl = perfil.firma_url;
    } else {
      nombreIngeniero = tecnicoAuth.user_metadata?.full_name || tecnicoAuth.email;
    }
  } catch (e) {
    console.error('Error recuperando perfil ingeniero:', e.message);
    nombreIngeniero = tecnicoAuth.email || 'Técnico';
  }

  // ---------------------------------------------------------
  // 1. SANITIZACIÓN Y LÓGICA DE NEGOCIO (CEREBRO v2.0)
  // ---------------------------------------------------------
  const datosDeTrabajo = { ...revisionData };

  // A. Sanitización de Inputs Básicos
  datosDeTrabajo.caso_id = Number(datosDeTrabajo.caso_id);
  const iFase1 = parseFloat(datosDeTrabajo.corriente_red_f1) || 0;
  const iNeutro = parseFloat(datosDeTrabajo.corriente_red_n) || 0;
  const iFugaPinza = parseFloat(datosDeTrabajo.corriente_fuga_f1) || 0;
  const voltaje = parseFloat(datosDeTrabajo.voltaje_medido) || 127;
  const sePuedeApagar = datosDeTrabajo.se_puede_apagar_todo === true || datosDeTrabajo.se_puede_apagar_todo === 'true';

  // B. Sanitización de Inputs v2.0 (Financieros)
  const kwhRecibo = parseFloat(datosDeTrabajo.kwh_recibo_cfe) || 0;
  const tarifa = datosDeTrabajo.tarifa_cfe || '01';
  const condicionInfra = datosDeTrabajo.condicion_infraestructura || 'Regular';
  const midieronCargasMenores = datosDeTrabajo.se_midieron_cargas_menores === true || datosDeTrabajo.se_midieron_cargas_menores === 'true';

  // C. Cálculo Inteligente de Fuga Eléctrica (Física)
  if (sePuedeApagar) {
    // Si todo se apagó, lo que marque la fase es fuga pura
    datosDeTrabajo.corriente_fuga_f1 = iFase1;
  } else {
    // Si no se apagó, comparamos desbalance Neutro vs Fase (tolerancia 0.5A)
    if (iNeutro > (iFase1 + 0.5)) {
      datosDeTrabajo.corriente_fuga_f1 = iNeutro - iFase1;
    } else {
      datosDeTrabajo.corriente_fuga_f1 = iFugaPinza;
    }
  }

  // D. Procesamiento de Equipos
  const equiposSanitizados = equiposData.map(eq => ({
    nombre_equipo: eq.nombre_equipo,
    nombre_personalizado: eq.nombre_personalizado || '',
    estado_equipo: eq.estado_equipo,
    unidad_tiempo: eq.unidad_tiempo || 'Horas/Día',
    tiempo_uso: parseFloat(eq.horas_uso || eq.tiempo_uso) || 0,
    amperaje_medido: parseFloat(eq.amperaje_medido) || 0,
    cantidad: parseFloat(eq.cantidad) || 1
  }));

  // Calcular consumos individuales (función importada existente)
  let equiposCalculados = calcularConsumoEquipos(equiposSanitizados, voltaje);

  // Ordenar Pareto (Mayor consumo arriba)
  equiposCalculados.sort((a, b) => (b.kwh_bimestre_calculado || 0) - (a.kwh_bimestre_calculado || 0));

  // E. MATEMÁTICA DE LA "CAJA NEGRA" (Consumo vs Recibo)
  const totalKwhAuditado = equiposCalculados.reduce((acc, curr) => acc + (curr.kwh_bimestre_calculado || 0), 0);

  // Factor de Holgura: Si NO midieron cargas menores, sumamos 20%
  const factorHolgura = midieronCargasMenores ? 1.0 : 1.20;
  const totalAuditadoAjustado = totalKwhAuditado * factorHolgura;

  let kwhDesperdicio = 0;
  let porcentajeFuga = 0;
  let alertaFuga = false;

  if (kwhRecibo > 0) {
    kwhDesperdicio = kwhRecibo - totalAuditadoAjustado;

    // Si el desperdicio es negativo, significa que el cálculo excedió al recibo (error de medición o recibo viejo)
    // Lo ajustamos a 0 para no confundir al cliente
    if (kwhDesperdicio < 0) kwhDesperdicio = 0;

    porcentajeFuga = (kwhDesperdicio / kwhRecibo) * 100;

    // TRIGGER: Si el desperdicio es mayor al 15% del recibo, activamos alerta
    if (porcentajeFuga >= 15) alertaFuga = true;
  }

  // Generar textos automáticos (función importada existente)
  const diagnosticosAuto = generarDiagnosticosAutomaticos(datosDeTrabajo, equiposCalculados);


  // ---------------------------------------------------------
  // 2. GUARDADO EN BASE DE DATOS (Supabase)
  // ---------------------------------------------------------
  const datosParaInsertar = { ...datosDeTrabajo };

  // Limpieza de campos temporales
  delete datosParaInsertar.voltaje_fn;
  delete datosParaInsertar.fuga_total;
  delete datosParaInsertar.amperaje_medido;
  delete datosParaInsertar.antiguedad_paneles;
  delete datosParaInsertar.equiposData;

  // Asignar nuevos campos v2.0 a la BD
  datosParaInsertar.tecnico_id = tecnicoAuth.id;
  datosParaInsertar.diagnosticos_automaticos = diagnosticosAuto;
  datosParaInsertar.fecha_revision = new Date().toISOString();
  datosParaInsertar.tarifa_cfe = tarifa;
  datosParaInsertar.kwh_recibo_cfe = kwhRecibo;
  datosParaInsertar.condicion_infraestructura = condicionInfra;
  datosParaInsertar.se_midieron_cargas_menores = midieronCargasMenores;

  const { data: revData, error: revError } = await supabaseAdmin
    .from('revisiones')
    .insert(datosParaInsertar)
    .select()
    .single();

  if (revError) throw new Error(`Error insertando revisión: ${revError.message}`);

  const newRevisionId = revData.id;

  // Insertar equipos
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

  // Actualizar status del Caso y obtener datos del Cliente
  const { data: casoUpdated, error: casoError } = await supabaseAdmin
    .from('casos')
    .update({ status: 'completado' })
    .eq('id', datosDeTrabajo.caso_id)
    .select('id, cliente:clientes(nombre_completo, direccion_principal)')
    .single();

  if (casoError) console.warn('No se pudo actualizar el caso:', casoError.message);

  // ---------------------------------------------------------
  // 3. PROCESAMIENTO DE FIRMA CLIENTE
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
          await supabaseAdmin.from('revisiones').update({ firma_url: firmaClienteUrl }).eq('id', newRevisionId);
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

  // Objeto enriquecido para el generador PDF
  const datosParaPdf = {
    header: {
      id: newRevisionId,
      fecha_revision: revData.fecha_revision,
      cliente_nombre: casoUpdated?.cliente?.nombre_completo || 'Cliente',
      cliente_direccion: casoUpdated?.cliente?.direccion_principal || 'Dirección no registrada',
      cliente_email: revData.cliente_email || '',
      tecnico_nombre: nombreIngeniero,
      firma_ingeniero_url: firmaIngenieroUrl,
      // Nuevos datos Header
      tarifa: tarifa,
      condicion_infra: condicionInfra
    },
    mediciones: {
      ...datosDeTrabajo,
      corriente_fuga_f1: datosDeTrabajo.corriente_fuga_f1
    },
    // NUEVO: Objeto financiero para gráficas
    finanzas: {
      kwh_recibo: kwhRecibo,
      kwh_auditado: totalKwhAuditado,
      kwh_ajustado: totalAuditadoAjustado, // Incluye holgura
      kwh_desperdicio: kwhDesperdicio,
      porcentaje_desperdicio: porcentajeFuga,
      alerta_fuga: alertaFuga
    },
    equipos: equiposCalculados,
    consumo_total_estimado: totalAuditadoAjustado,
    causas_alto_consumo: revData.diagnosticos_automaticos || [],
    recomendaciones_tecnico: revData.recomendaciones_tecnico || '',
    firma_cliente_url: firmaClienteUrl
  };

  try {
    console.log('Generando PDF localmente...');
    const pdfBuffer = await generarPDF(datosParaPdf);

    if (pdfBuffer) {
      const pdfPath = `reportes/reporte-${newRevisionId}.pdf`;
      const { error: upPdfErr } = await supabaseAdmin.storage
        .from('reportes')
        .upload(pdfPath, pdfBuffer, { contentType: 'application/pdf', upsert: true });

      if (upPdfErr) {
        console.error('Error subiendo PDF:', upPdfErr.message);
      } else {
        const { data: urlData } = supabaseAdmin.storage.from('reportes').getPublicUrl(pdfPath);
        pdfUrl = urlData.publicUrl;
        console.log('PDF generado y subido:', pdfUrl);
        await supabaseAdmin.from('revisiones').update({ pdf_url: pdfUrl }).eq('id', newRevisionId);
      }
    }
  } catch (pdfError) {
    console.error('Error en proceso de PDF:', pdfError);
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

  return {
    success: true,
    message: 'Revisión guardada exitosamente.',
    revision_id: newRevisionId,
    pdf_url: pdfUrl
  };
};