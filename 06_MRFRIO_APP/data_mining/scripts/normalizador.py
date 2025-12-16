import os
import re
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

def clean_text(text):
    # Elimina caracteres raros y estandariza espacios
    text = text.upper().replace("´", '"').replace("''", '"')
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def identify_category(title):
    t = title.upper()
    if "MINISPLIT" in t: return "AC"
    if "GAS" in t or re.search(r'\bR-?\d{2,}', t): return "GAS"
    if "CINTA" in t: return "CINTA"
    if "CAPACITOR" in t: return "CAPACITOR"
    if "BOMBA" in t and ("CONDENSAD" in t or "ASPEN" in t or "ORANGE" in t or "PC-" in t): return "BOMBA"
    if "SOLDADURA" in t or ("VARILLA" in t and "PLATA" in t): return "SOLDADURA"
    if "COBRE" in t and ("ROLLO" in t or "FLEX" in t): return "COBRE"
    if "KIT" in t and "INSTAL" in t: return "KIT"
    if ("BASE" in t or "SOPORTE" in t or "MENSULA" in t) and "TV" not in t: return "SOPORTE"
    if "ARMAFLEX" in t or "AISLANTE" in t or "K-FLEX" in t: return "AISLANTE"
    if "FLUSH" in t or "LIMPIADOR" in t: return "LIMPIEZA"
    if "TUERCA" in t: return "TUERCA"
    return "OTRO"

# --- UTILIDADES DE EXTRACCIÓN ---

def extract_fraction(text):
    # Busca patrones como "1-1/8", "1 1/8", "1/2", "3/4", "5/8"
    match = re.search(r'(\d+[\s-]\d+/\d+|\d+/\d+)', text)
    if match:
        return match.group(1).replace(" ", "-") # Estandarizar a 1-1/8
    return "VARIO"

def extract_brand(text, common_brands):
    for brand in common_brands:
        if brand in text:
            return brand
    return "GENERICO"

# --- NORMALIZADORES ESPECIFICOS ---

def norm_ac(title):
    brand = extract_brand(title, ["MIRAGE", "YORK", "CARRIER", "LG", "MIDEA", "TRANE"])
    
    cap = "UNKNOWN"
    if re.search(r'1\.?0?\s*(T|TR|TON)', title) or "12000" in title: cap = "1T"
    elif re.search(r'1\.5\s*(T|TR|TON)', title) or "18000" in title: cap = "1.5T"
    elif re.search(r'2\.?0?\s*(T|TR|TON)', title) or "24000" in title: cap = "2T"
    elif re.search(r'3\.?0?\s*(T|TR|TON)', title) or "36000" in title: cap = "3T"
    
    volt = "220V" 
    if "110" in title or "115" in title: volt = "110V"
    
    tech = "STD"
    if "INVERTER" in title: tech = "INVERTER"
    
    if cap == "UNKNOWN": return None
    return f"AC-{brand}-{cap}-{volt}-{tech}"

def norm_gas(title):
    # Detectar R410A, R-22, 141B, etc.
    match = re.search(r'(R-?\s?\d{2,4}[A-Z]?|141\s?B)', title)
    tipo = match.group(1).replace("-","").replace(" ","") if match else "GENERICO"
    
    # Peso
    peso = "UNIT"
    kg_match = re.search(r'(\d+\.?\d*)\s*(KG|KIL)', title)
    gr_match = re.search(r'(\d+)\s*(GR|GRAM)', title)
    
    if kg_match: peso = f"{kg_match.group(1)}KG"
    elif gr_match: peso = f"{gr_match.group(1)}GR"
    
    return f"GAS-{tipo}-{peso}"

def norm_bomba(title):
    brand = extract_brand(title, ["ASPEN", "AVALY", "BARRETO", "DIVERSITECH", "LITTLE GIANT", "SAUERMANN"])
    
    modelo = "STD"
    if "MINI" in title and "ORANGE" in title: modelo = "MINI-ORANGE"
    elif "MAXI" in title and "ORANGE" in title: modelo = "MAXI-ORANGE"
    elif "MINI" in title and "LIME" in title: modelo = "MINI-LIME"
    elif "TANK" in title or "TANQUE" in title: modelo = "TANQUE"
    elif "PC-" in title: modelo = "PC-SERIES"
    
    volt = "UV" # Univolt por defecto
    if "110" in title and "220" not in title: volt = "110V"
    elif "220" in title and "110" not in title: volt = "220V"
    
    return f"BOMBA-{brand}-{modelo}-{volt}"

def norm_aislante(title):
    # Armaflex busca 2 medidas: Diametro y Espesor (Pared)
    # Ej: 1/2 X 3/8 -> Diametro 1/2, Pared 3/8
    
    # Buscamos patron: fraccion X fraccion
    match = re.search(r'(\d+[\s-]?\d*/\d+)\s*[X"]\s*(\d+[\s-]?\d*/\d+)', title)
    if match:
        diam = match.group(1).replace(" ", "-")
        pared = match.group(2).replace(" ", "-")
        return f"AISLANTE-D{diam}-P{pared}"
    
    # Si solo encuentra una
    medida = extract_fraction(title)
    return f"AISLANTE-{medida}"

def norm_soporte(title):
    tipo = "MURO"
    if "PISO" in title: tipo = "PISO"
    elif "TECHO" in title: tipo = "TECHO"
    
    capacidad = "STD"
    load = re.search(r'(\d+)\s*KG', title)
    if load: capacidad = f"{load.group(1)}KG"
    
    # Intentar sacar medida largo
    largo = "VARIO"
    dim = re.search(r'(\d{2,3})\s*[X-]', title) # Ej: 450 X ...
    if dim: largo = f"{dim.group(1)}MM"
    
    return f"SOPORTE-{tipo}-{largo}-{capacidad}"

def norm_soldadura(title):
    percent = "0"
    match = re.search(r'(\d+)\s?%', title)
    if match: percent = match.group(1)
    elif "PLATA" in title and "0" not in title: percent = "PLATA" # Asumimos generico si dice plata
    
    return f"SOLDADURA-{percent}%-PLATA"

def norm_capacitor(title):
    match = re.search(r'(\d+(\.\d+)?)\s*(UF|MFD)', title)
    cap = match.group(1) if match else "VARIO"
    return f"CAPACITOR-{cap}UF"

def norm_cobre(title):
    medida = extract_fraction(title)
    return f"COBRE-FLEX-{medida}"

def get_master_sku(title_raw):
    title = clean_text(title_raw)
    cat = identify_category(title)
    
    if cat == "AC": return norm_ac(title)
    if cat == "GAS": return norm_gas(title)
    if cat == "BOMBA": return norm_bomba(title)
    if cat == "AISLANTE": return norm_aislante(title)
    if cat == "SOPORTE": return norm_soporte(title)
    if cat == "SOLDADURA": return norm_soldadura(title)
    if cat == "CAPACITOR": return norm_capacitor(title)
    if cat == "COBRE": return norm_cobre(title)
    if cat == "CINTA": 
        tipo = "MOMIA" if "MOMIA" in title else "ALUMINIO"
        return f"CINTA-{tipo}"
    if cat == "KIT": return "KIT-INSTALACION-STD"
    
    return None

def run_normalization():
    print("--- Iniciando Normalización 2.0 ---")
    
    # Procesar lotes grandes
    page = 0
    page_size = 1000
    
    while True:
        response = supabase.table("market_prices_log")\
            .select("id, product_title")\
            .is_("normalized_product_id", "null")\
            .range(page * page_size, (page + 1) * page_size)\
            .execute()
        
        items = response.data
        if not items:
            break

        print(f"Procesando lote {page+1} ({len(items)} items)...")
        
        updates = []
        
        for item in items:
            master_sku = get_master_sku(item['product_title'])
            
            if master_sku:
                # Lógica simplificada: Upsert en Catalogo -> Update en Log
                # 1. Asegurar catalogo
                try:
                    display = master_sku.replace("-", " ")
                    brand = master_sku.split("-")[1] if "-" in master_sku else "GENERICO"
                    
                    # Intentamos insertar (si existe fallará, lo cual es esperado y barato)
                    # OJO: Supabase no devuelve ID en on_conflict='ignore' a veces, mejor select primero
                    
                    cat_query = supabase.table("product_catalog").select("id").eq("sku_master", master_sku).execute()
                    cat_id = None
                    
                    if cat_query.data:
                        cat_id = cat_query.data[0]['id']
                    else:
                        new_prod = supabase.table("product_catalog").insert({
                            "sku_master": master_sku,
                            "display_name": display,
                            "brand": brand
                        }).execute()
                        if new_prod.data:
                            cat_id = new_prod.data[0]['id']
                    
                    if cat_id:
                        # Actualizamos el registro original
                        supabase.table("market_prices_log").update({"normalized_product_id": cat_id}).eq("id", item['id']).execute()
                        
                except Exception as e:
                    print(f"Error en {master_sku}: {e}")
                    continue
        
        page += 1

    print("--- Normalización completada ---")

if __name__ == "__main__":
    run_normalization()