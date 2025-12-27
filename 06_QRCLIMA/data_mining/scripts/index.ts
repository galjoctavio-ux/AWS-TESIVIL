import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ------------------------------------------------------------------
// CONFIGURACIÓN & UTILS
// ------------------------------------------------------------------

const GROQ_KEYS = [
    Deno.env.get('GROQ_API_KEY_1'),
    Deno.env.get('GROQ_API_KEY_2'),
    Deno.env.get('GROQ_API_KEY_3'),
    Deno.env.get('GROQ_API_KEY_4'),
    Deno.env.get('GROQ_API_KEY_5'),
    Deno.env.get('GROQ_API_KEY_6'),
].filter(Boolean) as string[];

// PROMPT OPTIMIZADO (TOKEN ECONOMY)
const SYSTEM_PROMPT = `
ROLE: HVAC Data Expert. Output JSON only.
LANG: Spanish. NO VENDOR NAMES (e.g. "Aires Aurum").

CATEGORY LOGIC:

A. EQUIPMENT (Minisplit, Window, Portable):
   Formula: "[Product Type] [Brand] [Model] [Capacity] [Voltage] [Mode]"
   1. MODEL PRESERVATION (STRICT):
      - DO NOT MERGE distinct generations.
      - "Inverter X" -> "X", "Inverter X32" -> "X32".
      - "Life 12" -> "LIFE12", "Life 12+" -> "LIFE12PLUS".
      - "Magnum 22" -> "MAGNUM22", "Magnum 19" -> "MAGNUM19".
      - "Magnum 17" -> "MAGNUM17".
      - Remove "Minisplit", "Aire", "Inverter" (unless part of model name like Inverter X).
      - MODE DETECTION: 
        * IF title has "Calefaccion", "Heat Pump", "Frio/Calor", "F/C" -> Mode: "FC".
        * IF title says "Ideal para el calor" but misses "Calefaccion" -> Mode: "SF" (Solo Frio).

B. GAS REFRIGERANT (REF-GAS):
   Formula: "Gas Refrigerante [Gas Type] [Weight] [Brand]"
   1. TYPE: Remove hyphens/spaces. Force Upper. Add "R". (R-410A->R410A, 134a->R134A).
   2. WEIGHT (Strict): 25lb/11.3kg->"11K", 30lb/13.6kg->"13K", 1kg->"1K", 650gr->"065K".
   3. BRAND: Suva/Freon->CHEM, Genetron->GENE, Erka->ERKA.
   4. EXCL: Valvula/Filtro/Manguera (Unless title has "Gas con valvula").

C. COPPER PIPING (INS-COB):
   Formula: "Tubería Cobre [Type] [Diameter] [Length]"
   1. TYPE: Rigido/Tramo->RIG, Flex/Rollo->FLEX.
   2. DIM: INCHES ONLY. No mm. (13mm->1/2, 1 1/8->1-1/8).
   3. LEN: 6.1m/20->20FT, 15.2m/50->50FT, 1m->1M.

D. INSTALL KITS (INS-KIT):
   Formula: "Kit Instalación [Brand] [Dimensions] [Length] [Material]"
   1. DIMENSIONS (Tuple Code):
      - 1/4" + 1/2" -> Code: "1412"
      - 1/4" + 3/8" -> Code: "1438"
      - 1/4" + 5/8" -> Code: "1458"
      - 3/8" + 5/8" -> Code: "3858"
      - 3/8" + 3/4" -> Code: "3834"
   2. LEN: Default "4M". 3m->3M, 5m->5M.
   3. MAT: Explicit "Cobre"->COB. "Alucobre/Alu/Mixto" or Unspecified->MIX.
   4. EXCL: Doblador, Herramienta, Manometro.

E. CHEMICALS & OILS (CHE):
   Formula: "Químico [Sub-Cat] [Brand] [Type] [Volume]"
   1. SUB: Aceite/Oil->OIL, Limpiador/Foam/Acido->CLN, R141b/Agente->SOL.
   2. OIL TYPE: 
      - POE/Ultra/SW32 -> POE
      - Mineral/AB/3GS/150/300 -> MIN
      - PAG/Auto -> PAG
      - Vacuum -> VAC
   3. CLEANER TYPE (Priority):
      - "Acido", "Desincrustante" -> ACID
      - "Rosa", "Pink", "Alcalino" -> ALKA
      - "Foam", "Espuma", "Serpentin" (Universal) -> FOAM
      - "Brillantador" -> SHINE
   4. BRAND: Acemire->ACEM, Suniso->SUNI, Copeland->COPE, Texas->TEXA, Nu-Calgon->CALG.
   5. VOL: 3.78L/Gal->3.78L, 1L->1L, 19L/Cubeta->19L, Aerosol->AER.

F. OTHERS:
   Formula: "[Product Name] [Brand] [Key Spec]"

SKU CONSTRUCTION RULES (STRICT):
1. FORMAT: [CAT]-[SUB]-[BRAND]-[MODEL]-[VAR1][VAR2]-[VAR3]
   - NO hyphens inside variables.
2. CODES:
   - Minisplit->EQP-MIN, Portable->EQP-POR.
   - Gas->REF-GAS, Copper->INS-COB, Kit->INS-KIT.
3. SPECS NORMALIZATION:
   - Cap (EQP): 1T, 15T (1.5), 2T.
   - Volt: 110, 220.
   - Mode: SF, FC.
   - Dims (Kit): 1412, 1438.
   - Mat (Kit): COB, MIX.

OUTPUT SCHEMA:
{
  "is_valid_hvac": boolean,
  "standardized_name": "String",
  "sku_qrclima": "String",
  "brand_code": "String",
  "category_code": "String",
  "specs": {"cap":"1T", "volt":"110", "mode":"SF", "dims":"1412", "mat":"MIX"}
}
`.trim();

// Helper: Espera asíncrona
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper: Fetch con Rotación de Keys y Retry Exponencial
async function fetchWithDynamicKey(url: string, body: any, keys: string[], retries = 3) {
    let lastError: any;

    for (let i = 0; i <= retries; i++) { // Notar el <= para hacer el intento inicial + retries
        // 1. ROTACIÓN: Elegimos una key fresca en CADA intento del bucle
        const currentKey = keys[Math.floor(Math.random() * keys.length)];

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${currentKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            // Si no es 429, regresamos la respuesta (sea éxito 200 o error de lógica 400/500)
            if (res.status !== 429) {
                return res;
            }

            // Si es 429, lanzamos error para caer en el catch y reintentar
            throw new Error(`Rate Limit en Key ...${currentKey.slice(-4)}`);

        } catch (err: any) {
            lastError = err;
            // Si llegamos al límite de intentos, paramos
            if (i === retries) break;

            // Backoff Exponencial: 2s, 4s, 8s...
            const waitTime = 2000 * Math.pow(2, i);
            console.warn(`⚠️ Intento ${i + 1}/${retries} falló (${err.message}). Cambiando Key y reintentando en ${waitTime}ms...`);
            await sleep(waitTime);
        }
    }

    throw new Error(`Groq falló tras ${retries} reintentos con rotación. Último error: ${lastError.message}`);
}

const cleanJson = (text: string) => text.replace(/```json/g, '').replace(/```/g, '').trim();

// Validación de Lógica de Negocio (Anti-Alucinación)
const validateResult = (rawTitle: string, result: any, providerName: string) => {
    const rawLower = rawTitle.toLowerCase()
        // Normalizamos tildes para evitar falsos negativos (frío vs frio)
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const providerLower = providerName.toLowerCase();

    // 1. Anti-Alucinación Frio/Calor (Lógica Mejorada)
    // Buscamos patrones explícitos de "Modo Calefacción", no solo la palabra "calor".
    const hasHeatingIntent = /frio[\s\/-]*calor|calefaccion|heat\s*pump|heating|f\/c/.test(rawLower);

    // Si el título dice explícitamente "Frio/Calor" o "Calefacción", pero el SKU termina en SF (Solo Frío)
    if (hasHeatingIntent && result.sku_qrclima.endsWith("-SF")) {
        // Excepción: A veces dice "No tiene calefacción" (Raro, pero posible)
        if (!rawLower.includes("no tiene") && !rawLower.includes("sin calefaccion")) {
            throw new Error(`Mismatch: Título implica Calefacción ('${rawTitle.substring(0, 20)}...') pero SKU es SF.`);
        }
    }

    // 2. Anti-Alucinación de Marca (Contexto de Proveedor)
    if (providerLower.includes("mirage") && result.brand_code !== "MIRA") {
        // Aceptamos excepciones si es claramente otra marca, pero advertimos
        if (result.brand_code === "GENE") throw new Error("Mismatch: Proveedor es Mirage pero marca detectada GENE.");
    }

    return true;
};

// ------------------------------------------------------------------
// SERVER PRINCIPAL
// ------------------------------------------------------------------

Deno.serve(async (req) => {
    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // 1. Obtener lote pendiente (Batch Size: 5 para controlar Groq Limits)
        const { data: pendingRows, error } = await supabase
            .from('log_scraper_prices')
            .select('id, provider_name, sku_provider, raw_title, metadata')
            .eq('status', 'pending')
            .limit(5); // Mantén esto bajo mientras no tengas Tier pagado en Groq

        if (error) throw error;
        if (!pendingRows?.length) {
            return new Response(JSON.stringify({ message: "Cola vacía (Idle)" }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // 2. Procesamiento Concurrente
        const results = await Promise.all(pendingRows.map(async (row) => {
            try {
                // A. Verificar si ya existe mapeo (Cache hit)
                // Nota: Asumo que ya agregaste el UNIQUE constraint en BD como sugerí
                const { data: existingMap } = await supabase
                    .from('providers_map')
                    .select('normalized_product_id')
                    .eq('provider_name', row.provider_name)
                    .eq('provider_sku', row.sku_provider) // Si sku_provider es null, esto falla. Ojo aquí.
                    .maybeSingle();

                let finalId = existingMap?.normalized_product_id;

                // ... dentro del Promise.all ...
                if (!finalId) {
                    // Ya no seleccionamos key aquí.
                    // const selectedKey = ... (BORRAR ESTO)

                    const userContent = `Vendor: ${row.provider_name}\nProduct: ${row.raw_title}`;

                    // Llamamos a la nueva función pasando EL ARRAY COMPLETO de keys
                    const aiResp = await fetchWithDynamicKey(
                        'https://api.groq.com/openai/v1/chat/completions',
                        {
                            model: "llama-3.3-70b-versatile",
                            messages: [
                                { role: "system", content: SYSTEM_PROMPT },
                                { role: "user", content: userContent }
                            ],
                            temperature: 0, // Temperatura 0 para máxima precisión de nombres
                            response_format: { type: "json_object" }
                        },
                        GROQ_KEYS // <--- Pasamos todas las llaves para que rote
                    );

                    if (!aiResp.ok) {
                        const errText = await aiResp.text();
                        throw new Error(`Groq API Error ${aiResp.status}: ${errText}`);
                    }

                    const aiJson = await aiResp.json();
                    // ... resto del código igual ...
                    const content = JSON.parse(cleanJson(aiJson.choices[0].message.content));

                    if (content.is_valid_hvac) {
                        // C. Validación Estricta
                        validateResult(row.raw_title, content, row.provider_name);

                        // D. Upsert Catálogo
                        const { data: catalogItem, error: catError } = await supabase
                            .from('products')
                            .upsert({
                                sku_qrclima: content.sku_qrclima,
                                display_name: content.standardized_name,
                                brand: content.brand_code,
                                category: content.category_code,
                                specs_json: content.specs
                            }, { onConflict: 'sku_qrclima' })
                            .select('id')
                            .single();

                        if (catError) throw new Error(`DB Catalog Error: ${catError.message}`);
                        finalId = catalogItem.id;

                        // E. Guardar Mapa
                        // Solo guardamos mapa si tenemos sku_provider. Si es null, solo guardamos en log.
                        if (row.sku_provider) {
                            await supabase.from('providers_map').upsert({
                                provider_name: row.provider_name,
                                provider_sku: row.sku_provider,
                                provider_raw_title: row.raw_title,
                                normalized_product_id: finalId
                            }, { onConflict: 'provider_name, provider_sku' });
                        }
                    }
                }

                // F. Actualizar Log (Éxito)
                await supabase.from('log_scraper_prices').update({
                    status: 'processed',
                    normalized_product_id: finalId ?? null,
                    metadata: row.metadata ? { ...row.metadata, last_error: null } : null
                }).eq('id', row.id);

                return { id: row.id, status: 'ok', sku: finalId };

            } catch (err: any) {
                console.error(`Error Row ${row.id}:`, err.message);

                // G. Actualizar Log (Error)
                await supabase.from('log_scraper_prices').update({
                    status: 'error',
                    metadata: {
                        ...(typeof row.metadata === 'object' ? row.metadata : {}),
                        last_error: err.message
                    }
                }).eq('id', row.id);

                return { id: row.id, status: 'error', error: err.message };
            }
        }));

        return new Response(JSON.stringify({ processed: results.length, details: results }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err: any) {
        return new Response(JSON.stringify({ fatal_error: err.message }), { status: 500 });
    }
});
