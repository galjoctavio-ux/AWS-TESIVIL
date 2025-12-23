import os
import re
import logging
import json
from datetime import datetime
from collections import defaultdict
from supabase import create_client, Client
from dotenv import load_dotenv

# =============================
# 1. CONFIGURACIÓN Y LOGGING
# =============================

load_dotenv()
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

# Configuración de logs para monitorear el proceso
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# =============================
# 2. LIMPIEZA Y UTILIDADES BASE
# =============================

def clean_text(text):
    """Limpieza agresiva y estandarización (Fusión Claude/Gemini)"""
    if not text: return ""
    
    text = str(text).upper()
    replacements = {
        '´': "'", "''": '"', '“': '"', '”': '"', '’': "'",
        'Ã': 'A', '®': '', '™': '', '°': ''
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
        
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def normalize_fraction(text):
    """Convierte decimales y formatos raros a fracciones estándar (Lógica Claude)"""
    if not text: return "VARIO"
    
    # Mapa de decimales comunes a fracciones
    decimal_map = {
        '0.125': '1/8', '0.25': '1/4', '0.375': '3/8', '0.5': '1/2',
        '0.625': '5/8', '0.75': '3/4', '0.875': '7/8',
        '1.125': '1-1/8', '1.5': '1-1/2'
    }
    
    # Buscar decimales en el texto
    for dec, frac in decimal_map.items():
        if dec in text:
            return frac
            
    # Estandarizar "1 1/8" a "1-1/8"
    text = re.sub(r'(\d+)\s+(\d+/\d+)', r'\1-\2', text)
    return text

def extract_brand(text):
    """Extrae marca usando lista priorizada por longitud (Lógica DeepSeek)"""
    # Lista extendida y ordenada por longitud descendente para matching exacto
    brands = [
        "YELLOW JACKET", "DIVERSITECH", "LITTLE GIANT", "GC ALLIANCE", "USA PARTS", "USA TOOLS",
        "SUPER GENERAL", "QUIMOBASICOS", "CHEMOURS", "HONEYWELL", "EMBRACO", "COPELAND", 
        "PANASONIC", "FRIGIDAIRE", "WHIRLPOOL", "MITSUBISHI", "SAUERMANN", "DANFOSS", 
        "INSUL-THERM", "TECUMSEH", "CARRIER", "MIRAGE", "BARRETO", "UNWELD", "APPION", 
        "VALUE", "TRANE", "MIDEA", "YORK", "MABE", "GREE", "AVALY", "ASPEN", "K-FLEX", 
        "ARMSTRONG", "ERASA", "DSZH", "IUSA", "LG", "AUX"
    ]
    
    text_upper = clean_text(text)
    for brand in brands:
        # Regex con word boundary \b para evitar falsos positivos
        if re.search(r'\b' + re.escape(brand) + r'\b', text_upper):
            return brand
    return "GENERICO"

# =============================
# 3. MOTOR DE EXTRACCIÓN (DEEPSEEK ENHANCED)
# =============================

def extract_measurements(text):
    """
    Extrae un diccionario completo de medidas del texto.
    Fusión de la lógica de Deepseek con la limpieza de Claude.
    """
    text = clean_text(text)
    results = {}
    
    # 1. Dimensiones compuestas (Ej: 1/2 X 3/8)
    dim_pattern = r'(\d+[\s-]?\d*/\d+|\d+\.?\d*)\s*[Xx]\s*(\d+[\s-]?\d*/\d+|\d+\.?\d*)'
    dim_match = re.search(dim_pattern, text)
    if dim_match:
        results['diametro'] = normalize_fraction(dim_match.group(1))
        results['pared'] = normalize_fraction(dim_match.group(2))
    
    # 2. Fracciones simples si no hay dimensiones
    if 'diametro' not in results:
        frac_pattern = r'(\d+[\s-]?\d*/\d+)'
        frac_match = re.search(frac_pattern, text)
        if frac_match:
            results['fraccion'] = normalize_fraction(frac_match.group(1))

    # 3. Pesos (KG, GR, LB)
    weight_pattern = r'(\d+\.?\d*)\s*(KG|GR|G|LB|OZ)'
    weight_match = re.search(weight_pattern, text)
    if weight_match:
        unit = weight_match.group(2).replace('G','GR') if weight_match.group(2) == 'G' else weight_match.group(2)
        results['peso'] = f"{weight_match.group(1)}{unit}"

    # 4. Capacitores (UF, MFD) - Soporte Dual
    cap_pattern = r'(\d+(?:\.\d+)?)\s*(?:[+\-]\s*(\d+(?:\.\d+)?))?\s*(UF|MFD)'
    cap_match = re.search(cap_pattern, text)
    if cap_match:
        val1 = cap_match.group(1)
        val2 = cap_match.group(2)
        results['capacitancia'] = f"{val1}+{val2}UF" if val2 else f"{val1}UF"

    # 5. Potencia (HP)
    hp_pattern = r'(\d+/\d+|\d+\.?\d*)\s*HP'
    hp_match = re.search(hp_pattern, text)
    if hp_match:
        results['hp'] = hp_match.group(1).replace(" ", "") + "HP"

    return results

# =============================
# 4. CATEGORIZACIÓN
# =============================

def identify_category(title):
    t = clean_text(title)
    
    # Jerarquía estricta para evitar conflictos
    if "COMPRESOR" in t: return "COMPRESOR"
    if "MINISPLIT" in t or ("AIRE" in t and "ACOND" in t): return "AC"
    
    # Distinción de Bombas y Herramientas
    if "VACIO" in t or "VACUUM" in t: return "HERRAMIENTA_VACIO"
    if "MANIFOLD" in t or "MANOMETRO" in t or "CORTADOR" in t or "DOBLADOR" in t: return "HERRAMIENTA_MANUAL"
    if "BOMBA" in t: return "BOMBA" # Probablemente condensado o agua
    
    # Refrigerantes y Químicos
    if re.search(r'\bR-?\d{2,}', t) and not any(x in t for x in ["VALVULA", "MANOMETRO"]): return "GAS"
    if "LIMPIADOR" in t or "FOAM" in t or "ACID" in t: return "QUIMICO"
    if "ACEITE" in t: return "ACEITE"
    
    # Refacciones y Materiales
    if "CAPACITOR" in t: return "CAPACITOR"
    if "SOLDADURA" in t or ("VARILLA" in t and "PLATA" in t): return "SOLDADURA"
    if "COBRE" in t: return "COBRE"
    if "AISLANTE" in t or "ARMAFLEX" in t: return "AISLANTE"
    if "CINTA" in t: return "CINTA"
    if "SOPORTE" in t or "BASE" in t: return "SOPORTE"
    if "VALVULA" in t: return "VALVULA"
    if "CONTACTOR" in t: return "ELECTRICO"
    
    return "OTRO"

# =============================
# 5. NORMALIZADORES ESPECÍFICOS
# =============================

def norm_ac(title):
    """Normalizador avanzado de AC (Fusión Gemini + Deepseek)"""
    brand = extract_brand(title)
    
    # Capacidad (Detección inteligente Toneladas vs BTUs)
    cap = "VARIO"
    if re.search(r'1\.?0?\s*(T|TR|TON)', title) or "12000" in title: cap = "1T"
    elif re.search(r'1\.5\s*(T|TR|TON)', title) or "18000" in title: cap = "1.5T"
    elif re.search(r'2\.?0?\s*(T|TR|TON)', title) or "24000" in title: cap = "2T"
    elif re.search(r'3\.?0?\s*(T|TR|TON)', title) or "36000" in title: cap = "3T"
    
    # Voltaje
    volt = "220V" # Estándar en MX para minisplits grandes, default seguro
    if "110" in title or "115" in title or "127" in title: volt = "110V"
    
    # Tecnología y Modo
    tech = "INV" if "INVERTER" in title else "STD"
    mode = "HP" if any(x in title for x in ["CALEF", "FRIO/CALOR", "HEAT"]) else "CO" # HeatPump vs CoolingOnly
    
    # SEER
    seer = "STD"
    seer_match = re.search(r'(\d{2})\s*SEER', title)
    if seer_match: seer = f"{seer_match.group(1)}SEER"
    
    sku = f"AC-{brand}-{cap}-{volt}-{tech}-{mode}-{seer}"
    return sku, {"capacity": cap, "voltage": volt, "technology": tech}

def norm_gas(title):
    """Normalizador de Refrigerantes"""
    # Tipo de gas
    match = re.search(r'(R-?\s?\d{2,4}[A-Z]?|141\s?B|MO99|410|22)', title)
    tipo = match.group(1).replace("-","").replace(" ","") if match else "GENERICO"
    if tipo == "410": tipo = "R410A"
    if tipo == "22": tipo = "R22"

    medidas = extract_measurements(title)
    peso = medidas.get('peso', 'UNIT')
    
    # Detectar tipo de envase
    envase = "LATA"
    if "KG" in peso:
        val = float(re.search(r'\d+', peso).group())
        if val > 2: envase = "BOYA"
    
    sku = f"GAS-{tipo}-{envase}-{peso}"
    return sku, {"technology": tipo, "capacity": peso}

def norm_compressor(title):
    brand = extract_brand(title)
    medidas = extract_measurements(title)
    hp = medidas.get('hp', 'VARIO')
    
    # Gas compatible
    gas = "GENERICO"
    if "134" in title: gas = "R134A"
    elif "404" in title: gas = "R404A"
    elif "22" in title: gas = "R22"
    elif "600" in title: gas = "R600"
    
    volt = "110V" if any(x in title for x in ["110", "115", "127"]) else "220V"
    
    sku = f"COMP-{brand}-{hp}-{gas}-{volt}"
    return sku, {"capacity": hp, "voltage": volt, "technology": gas}

def norm_bomba(title):
    brand = extract_brand(title)
    subcat = "CONDENSADO"
    modelo = "STD"
    
    if "MINI" in title:
        modelo = "MINI-ORANGE" if "ORANGE" in title else "MINI"
    elif "TANK" in title or "TANQUE" in title:
        modelo = "TANK"
    elif "PC-" in title:
        modelo = "PC-SERIES"
        
    volt = "UV" # Univolt
    if "110" in title and "220" not in title: volt = "110V"
    elif "220" in title and "110" not in title: volt = "220V"
    
    sku = f"BOMBA-{subcat}-{brand}-{modelo}-{volt}"
    return sku, {"voltage": volt}

def norm_simple(title, prefix, use_measure=True):
    """Normalizador genérico para materiales simples"""
    medidas = extract_measurements(title)
    val = "VARIO"
    
    if prefix == "AISLANTE" and 'diametro' in medidas:
        val = f"D{medidas['diametro']}-P{medidas['pared']}"
    elif prefix == "CAPACITOR":
        val = medidas.get('capacitancia', 'VARIO')
    elif use_measure:
        val = medidas.get('fraccion') or medidas.get('medida', 'VARIO')
        
    sku = f"{prefix}-{val}"
    return sku, {"capacity": val if prefix == "CAPACITOR" else None}

def norm_tools(title, subcat):
    brand = extract_brand(title)
    spec = "STD"
    
    if subcat == "VACIO":
        match = re.search(r'(\d+\.?\d*)\s*CFM', title)
        if match: spec = f"{match.group(1)}CFM"
    elif subcat == "MANOMETRO":
        if "DIGITAL" in title: spec = "DIGITAL"
        elif "ANALOG" in title: spec = "ANALOG"
        if "MANGUERA" in title: spec += "-MANGUERAS"
        
    sku = f"HERRAMIENTA-{subcat}-{brand}-{spec}"
    return sku, {"brand": brand}

# =============================
# 6. ORQUESTADOR
# =============================

def get_master_sku(title_raw):
    title = clean_text(title_raw)
    cat = identify_category(title)
    
    result = None
    
    # Router de normalización
    if cat == "AC": result = norm_ac(title)
    elif cat == "GAS": result = norm_gas(title)
    elif cat == "COMPRESOR": result = norm_compressor(title)
    elif cat == "BOMBA": result = norm_bomba(title)
    elif cat == "HERRAMIENTA_VACIO": result = norm_tools(title, "VACIO")
    elif cat == "HERRAMIENTA_MANUAL": result = norm_tools(title, "MANOMETRO" if "MANOMETRO" in title else "MANUAL")
    
    # Normalizadores simples
    elif cat == "AISLANTE": result = norm_simple(title, "AISLANTE")
    elif cat == "CAPACITOR": result = norm_simple(title, "CAPACITOR")
    elif cat == "COBRE": result = norm_simple(title, "COBRE")
    elif cat == "SOPORTE": result = norm_simple(title, "SOPORTE")
    elif cat == "SOLDADURA":
        match = re.search(r'(\d+)\s?%', title)
        per = match.group(1) if match else "0"
        result = (f"SOLDADURA-{per}%-PLATA", {})
        
    elif cat == "CINTA":
        tipo = "MOMIA" if "MOMIA" in title else "ALUMINIO"
        result = (f"CINTA-{tipo}", {})

    # Post-Procesamiento del resultado
    if result:
        sku, details = result
        # Asegurar campos mínimos si no vinieron del normalizador
        if "brand" not in details:
            parts = sku.split("-")
            details["brand"] = parts[1] if len(parts) > 1 else "GENERICO"
        details["display_name"] = sku.replace("-", " ")
        return sku, details
        
    return None, None

# =============================
# 7. EJECUCIÓN (BATCH PROCESSING)
# =============================

def run_normalization():
    logger.info("=== INICIANDO NORMALIZACIÓN MAESTRA HVAC ===")
    
    # 1. Cargar catálogo existente en memoria (Caché) para evitar N+1 queries
    logger.info("📦 Cargando caché de productos...")
    try:
        catalog_resp = supabase.table("product_catalog").select("id, sku_master").execute()
        catalog_cache = {item['sku_master']: item['id'] for item in catalog_resp.data}
        logger.info(f"✓ Caché cargada: {len(catalog_cache)} productos existentes.")
    except Exception as e:
        logger.error(f"Error cargando caché: {e}")
        return

    # 2. Procesar Logs en lotes
    PAGE_SIZE = 500
    page = 0
    total_processed = 0
    new_products_buffer = {} # Buffer para evitar duplicados en el mismo lote
    
    while True:
        logger.info(f"📄 Procesando página {page + 1}...")
        
        # Obtener productos sin normalizar
        response = supabase.table("market_prices_log")\
            .select("id, product_title")\
            .is_("normalized_product_id", "null")\
            .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)\
            .execute()
            
        items = response.data
        if not items:
            break
            
        batch_updates = []
        
        for item in items:
            sku_master, details = get_master_sku(item['product_title'])
            
            if not sku_master:
                continue
                
            product_id = None
            
            # A. Existe en Caché Global
            if sku_master in catalog_cache:
                product_id = catalog_cache[sku_master]
            
            # B. Es nuevo (Agregar a buffer de inserción)
            elif sku_master in new_products_buffer:
                # Ya lo identificamos en este loop pero no lo hemos insertado a la BD
                pass 
            else:
                new_products_buffer[sku_master] = {
                    "sku_master": sku_master,
                    "display_name": details.get("display_name"),
                    "brand": details.get("brand"),
                    "capacity": details.get("capacity"),
                    "voltage": details.get("voltage"),
                    "technology": details.get("technology"),
                    "created_at": datetime.now().isoformat()
                }

            # Preparamos la actualización del log para cuando tengamos el ID
            if sku_master:
                batch_updates.append({
                    "log_id": item['id'],
                    "sku_master": sku_master
                })

        # 3. Inserción Masiva de Nuevos Productos
        if new_products_buffer:
            logger.info(f"➕ Insertando {len(new_products_buffer)} nuevos productos al catálogo...")
            insert_list = list(new_products_buffer.values())
            try:
                # Insertar y devolver los IDs generados
                res = supabase.table("product_catalog").insert(insert_list).execute()
                for prod in res.data:
                    catalog_cache[prod['sku_master']] = prod['id'] # Actualizar caché
                new_products_buffer.clear() # Limpiar buffer
            except Exception as e:
                logger.error(f"Error en inserción masiva: {e}")
        
        # 4. Actualización Masiva de Logs (Market Prices)
        # Como Supabase no soporta UPDATE FROM VALUES fácilmente en la API JS/Py, iteramos updates rápidos
        # O agrupamos por producto_id si fueran muchos, pero directo es aceptable aquí.
        if batch_updates:
            logger.info(f"📝 Actualizando referencias en {len(batch_updates)} registros...")
            count_updates = 0
            for update in batch_updates:
                sku = update["sku_master"]
                if sku in catalog_cache:
                    prod_id = catalog_cache[sku]
                    try:
                        supabase.table("market_prices_log").update({
                            "normalized_product_id": prod_id
                        }).eq("id", update["log_id"]).execute()
                        count_updates += 1
                    except Exception:
                        pass
            
            total_processed += count_updates
            logger.info(f"✓ {count_updates} actualizaciones exitosas en este lote.")

        page += 1

    logger.info(f"=== FIN DEL PROCESO. Total normalizados: {total_processed} ===")

# =============================
# 8. DIAGNÓSTICO
# =============================

def diagnose_sample():
    print("\n=== DIAGNÓSTICO RÁPIDO (Primeros 20 items) ===")
    res = supabase.table("market_prices_log").select("product_title").limit(20).execute()
    for row in res.data:
        t = row['product_title']
        sku, _ = get_master_sku(t)
        print(f"ORIGINAL: {t[:50]}...")
        print(f"SKU     : {sku if sku else '--- NO IDENTIFICADO ---'}")
        print("-" * 40)

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "diagnose":
        diagnose_sample()
    else:
        run_normalization()