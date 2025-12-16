import os
import re
import time
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

def clean_text(text):
    return text.upper().replace("-", " ").strip()

def identify_category(title):
    t = title.upper()
    if "MINISPLIT" in t: return "AC"
    if "GAS" in t or re.search(r'R-?\d+', t): return "GAS"
    if "CINTA" in t: return "CINTA"
    if "CAPACITOR" in t: return "CAPACITOR"
    if "BOMBA" in t: return "BOMBA"
    if "SOLDADURA" in t: return "SOLDADURA"
    if "COBRE" in t and ("ROLLO" in t or "KIT" not in t): return "COBRE"
    if "KIT" in t: return "KIT"
    if "BASE" in t or "SOPORTE" in t or "MENSULA" in t: return "SOPORTE"
    if "ARMAFLEX" in t or "AISLANTE" in t: return "AISLANTE"
    if "CONTROL" in t: return "CONTROL"
    if "TUERCA" in t: return "TUERCA"
    return "OTRO"

# --- LOGICA ESPECIFICA POR CATEGORIA ---

def norm_ac(title):
    # Logica Minisplit (Marca - Ton - Volt - Tech)
    brand = "GENERICO"
    if "MIRAGE" in title: brand = "MIRAGE"
    elif "YORK" in title: brand = "YORK"
    elif "CARRIER" in title: brand = "CARRIER"
    
    cap = "UNKNOWN"
    if re.search(r'1\.?0?\s*(T|TR|TON)', title) or "12000" in title: cap = "1T"
    elif re.search(r'1\.5\s*(T|TR|TON)', title) or "18000" in title: cap = "1.5T"
    elif re.search(r'2\.?0?\s*(T|TR|TON)', title) or "24000" in title: cap = "2T"
    elif re.search(r'3\.?0?\s*(T|TR|TON)', title) or "36000" in title: cap = "3T"

    volt = "220V" # Default mas comun
    if "110" in title or "115" in title: volt = "110V"

    tech = "STD"
    if "INVERTER" in title: tech = "INVERTER"
    
    if cap == "UNKNOWN": return None # No guardamos si no sabemos capacidad
    return f"AC-{brand}-{cap}-{volt}-{tech}"

def norm_gas(title):
    # Logica Gas (Tipo - Peso)
    gas_type = "R-DESC"
    # Detectar R410A, R-410A, R410, etc.
    match = re.search(r'R-?(\d{2,4}[A-Z]?)', title)
    if match: gas_type = "R" + match.group(1)
    elif "141B" in title: gas_type = "141B"

    weight = "1KG" # Default unitario
    # Buscar patrones de peso: 13.6 kg, 250 gr, 500g
    kg_match = re.search(r'(\d+\.?\d*)\s*(KG|KILO)', title)
    gr_match = re.search(r'(\d+)\s*(GR|GRAMO)', title)
    
    if kg_match: weight = f"{kg_match.group(1)}KG"
    elif gr_match: weight = f"{gr_match.group(1)}GR"
    
    return f"GAS-{gas_type}-{weight}"

def norm_cinta(title):
    tipo = "MOMIA"
    if "ALUMINIO" in title: tipo = "ALUMINIO"
    return f"CINTA-{tipo}"

def norm_capacitor(title):
    # Extraer microfaradios
    match = re.search(r'(\d+(\.\d+)?)\s*(UF|MFD|MICRO)', title)
    if match:
        capacidad = match.group(1)
        return f"CAPACITOR-{capacidad}UF"
    return "CAPACITOR-GENERICO"

def norm_cobre(title):
    # Extraer diametro: 1/4, 3/8, 1/2, 5/8, 3/4, 7/8
    match = re.search(r'(1/4|3/8|1/2|5/8|3/4|7/8|1-1/8)', title)
    diam = match.group(1) if match else "VARIO"
    largo = "ROLLO" # Asumimos rollo si paso el filtro
    return f"COBRE-{diam}-{largo}"

def norm_kit(title):
    largo = "3M" # Estandar
    if "4M" in title: largo = "4M"
    elif "5M" in title: largo = "5M"
    return f"KIT-INSTALACION-{largo}"

# --- CONTROLADOR PRINCIPAL ---

def get_master_sku(title_raw):
    title = clean_text(title_raw)
    cat = identify_category(title)
    
    if cat == "AC": return norm_ac(title)
    if cat == "GAS": return norm_gas(title)
    if cat == "CINTA": return norm_cinta(title)
    if cat == "CAPACITOR": return norm_capacitor(title)
    if cat == "COBRE": return norm_cobre(title)
    if cat == "KIT": return norm_kit(title)
    
    # Para lo demas, usamos un generico simple
    if cat != "OTRO":
        return f"{cat}-GENERICO"
    
    return None

def run_normalization():
    print("--- Iniciando Normalización ---")
    
    # Traer TODO lo que no tiene ID normalizado
    response = supabase.table("market_prices_log")\
        .select("id, product_title")\
        .is_("normalized_product_id", "null")\
        .limit(2000)\
        .execute()
    
    items = response.data
    if not items:
        print("Todo al día.")
        return

    print(f"Procesando {len(items)} registros...")

    for item in items:
        master_sku = get_master_sku(item['product_title'])

        if master_sku:
            # 1. Buscar o Crear en Catalogo
            # Nota: Para hacerlo mas rapido en produccion, esto se cachea en memoria, 
            # pero por ahora lo haremos simple (llamada por llamada)
            
            cat_res = supabase.table("product_catalog").select("id").eq("sku_master", master_sku).execute()
            
            catalog_id = None
            if cat_res.data:
                catalog_id = cat_res.data[0]['id']
            else:
                # Crear nuevo
                try:
                    display = master_sku.replace("-", " ") # Nombre simple
                    brand = master_sku.split("-")[1] if "-" in master_sku else "GENERICO"
                    
                    new_prod = {"sku_master": master_sku, "display_name": display, "brand": brand}
                    ins_res = supabase.table("product_catalog").insert(new_prod).execute()
                    if ins_res.data: catalog_id = ins_res.data[0]['id']
                except:
                    # Si falla por concurrencia, intentamos leer de nuevo
                     cat_res = supabase.table("product_catalog").select("id").eq("sku_master", master_sku).execute()
                     if cat_res.data: catalog_id = cat_res.data[0]['id']

            # 2. Actualizar Log
            if catalog_id:
                supabase.table("market_prices_log").update({"normalized_product_id": catalog_id}).eq("id", item['id']).execute()
                # print(f"OK: {item['product_title']} -> {master_sku}")
        else:
            # Si no se pudo clasificar, lo dejamos (o podrias marcarlo como ignorado)
            pass

    print("--- Finalizado ---")

if __name__ == "__main__":
    run_normalization()