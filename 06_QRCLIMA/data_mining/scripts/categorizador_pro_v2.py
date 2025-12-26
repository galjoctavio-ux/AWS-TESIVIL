import os
import logging
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

logging.basicConfig(
    filename='categorizador.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

load_dotenv()
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

def classify_product(title, metadata, sku):
    t = str(title).lower()
    m = str(metadata).lower()
    s = str(sku).upper()
    full_text = f"{t} {m}"

    # --- 1. PRIORIDAD: HERRAMIENTAS (Grupo 5) ---
    tools_kw = ["manometro", "manifold", "bomba de vacio", "vacuometro", "cortatubo", "abocinador", 
                "multimetro", "pinza", "soplete", "bascula", "detector", "doblatubo", "herramienta",
                "navaja", "termometro", "termohigrometro", "llave", "boquilla", "voltamperimetro", "amperimetro"]
    if any(kw in full_text for kw in tools_kw):
        return 5

    # --- 2. AIRES ACONDICIONADOS (Grupos 1, 2 y 3) ---
    if "mirage" in t or "mirage" in m:
        if s.startswith(('SETCLC', 'SETCMC', 'SETCLJ', 'SETCVC', 'SETCWF')): return 2
        if s.startswith(('SETCLF', 'SETCHC', 'SETCMF', 'SETCLJ')): return 1
        if any(kw in full_text for kw in ["inverter", "v32", "magnum", "x32", "v-smart", "flux"]):
            return 2
        return 1

    other_brands = ["trane", "york", "carrier", "ge", "midea", "rheem", "mcquay", "lg", "samsung", "hisense", "prime", "daikin", "tcl", "lennox"]
    ac_indicators = ["minisplit", "aire acondicionado", "condensadora", "evaporadora", "frio calor", "solo frio", "tonelada", 
                     "portatil", "portable", "fan&coil", "fan coil", "paquete", "juego dividido", "cassette", "manejadora", "chiller"]
    if any(b in full_text for b in other_brands) or any(i in full_text for i in ac_indicators):
        # Evitar refacciones de marca (motores, tarjetas)
        if not any(kw in full_text for kw in ["capacitor", "motor", "tarjeta", "sensor", "compresor", "valvula"]):
            return 3

    # --- 3. KITS (Grupo 9) ---
    if "kit" in full_text and any(kw in full_text for kw in ["instalacion", "tuberia", "paquete"]):
        return 9

    # --- 4. COBRE (Grupo 4) ---
    if "cobre" in full_text and any(kw in full_text for kw in ["tubo", "tuberia", "flexible", "rigido", "tramo", "carrete"]):
        return 4

    # --- 5. GAS (Grupo 8) ---
    if any(kw in full_text for kw in ["gas", "refrigerante"]) and any(r in full_text for r in ["r410", "r22", "r134", "r404", "r32", "r600", "boya", "lata", "freon", "genetron", "suva"]):
        return 8

    # --- 6. QUIMICOS (Grupo 7) ---
    if any(kw in full_text for kw in ["cleaner", "limpiador", "foam", "quimico", "desincrustante", "aceite", "poliolester", "tinte", "dielectrico", "anticorrosivo"]):
        return 7

    # --- 7. REFACCIONES (Grupo 6) ---
    ref_kw = ["capacitor", "mfd", "microfaradio", "contactor", "transformador", "valvula", "expansion", 
              "compresor", "motor", "aspa", "turbina", "tarjeta", "sensor", "relay", "termostato", "filtro", 
              "presostato", "extractor", "ventilador", "niple", "tapon", "union", "conexion"]
    if any(kw in full_text for kw in ref_kw):
        return 6

    # --- 8. CONSUMIBLES (Grupo 10) ---
    consumibles_kw = ["cinta", "momia", "soldadura", "plata", "fundente", "map", "aislante", "armaflex", 
                      "aislatubo", "aislamiento", "thermasmart", "k-flex", "owens corning"]
    if any(kw in full_text for kw in consumibles_kw):
        return 10

    # --- 9. ACCESORIOS INSTALACION (Grupo 11) ---
    acc_kw = ["base", "soporte", "bomba condensado", "canaleta", "jaula", "rejilla", "funda", "aspen", "little giant"]
    if any(kw in full_text for kw in acc_kw):
        return 11

    return None

def run_categorizer():
    print(f"--- 🧠 Iniciando Categorización Final: {datetime.now()} ---")
    response = supabase.table("market_prices_log")\
        .select("id, product_title, metadata, sku")\
        .is_("group_id", "null")\
        .limit(1000).execute()
    
    products = response.data
    if not products:
        print("✅ Todo está al día.")
        return

    count = 0
    for p in products:
        gid = classify_product(p['product_title'], p['metadata'], p['sku'])
        if gid:
            supabase.table("market_prices_log").update({"group_id": gid}).eq("id", p['id']).execute()
            count += 1
            
    print(f"✅ Se categorizaron {count} de {len(products)} registros.")

if __name__ == "__main__":
    run_categorizer()
