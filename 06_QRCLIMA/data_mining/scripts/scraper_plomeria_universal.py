import os
import logging
import time
from datetime import datetime
from pathlib import Path
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from supabase import create_client, Client
from dotenv import load_dotenv

# --- CONFIGURACIÓN ---
PROVIDER_NAME = "Plomería Universal"
LOG_FILE = 'scraper_plomeria_universal.log'
# URL ESPECÍFICA (Modo Francotirador: Solo variantes de Cobre)
PRODUCT_JSON_URL = "https://plomeriauniversal.mx/products/tubo-cobre-flexible.json"

# 1. Logging
logging.basicConfig(
    filename=LOG_FILE, 
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# 2. Credenciales
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Credenciales no encontradas en .env")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def create_robust_session():
    session = requests.Session()
    retry = Retry(
        total=5,
        backoff_factor=2,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET"]
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })
    return session

def run_scraper():
    session = create_robust_session()
    print(f"--- 🎯 Iniciando Scraper {PROVIDER_NAME} (Solo Cobre) ---")
    all_extracted_data = []

    try:
        response = session.get(PRODUCT_JSON_URL, timeout=20)
        
        if response.status_code != 200:
            print(f"❌ Error al acceder al JSON: {response.status_code}")
            return

        data = response.json()
        product = data.get('product', {})
        base_title = product.get('title', 'Tubo Cobre Flexible')
        variants = product.get('variants', [])
        
        # Datos generales para metadata
        p_handle = product.get('handle', '')
        p_vendor = product.get('vendor', '')

        print(f"   📦 Detectadas {len(variants)} variantes de precio.")

        for v in variants:
            sku = v.get('sku')
            if not sku: 
                sku = f"PLOM-COBRE-{v.get('id')}" # Fallback si no hay SKU
            
            price = float(v.get('price', 0))
            
            # Título compuesto: "Tubo Cobre Flexible - 1/2 pulgada"
            variant_title = f"{base_title} - {v.get('title')}"
            
            if price > 0:
                item = {
                    "provider_name": PROVIDER_NAME,
                    "sku_provider": str(sku).strip(),    # CORREGIDO: nombre nuevo
                    "raw_title": variant_title[:500],    # CORREGIDO: nombre nuevo
                    "price": price,
                    "currency": "MXN",
                    "status": "pending",                 # IMPORTANTE: Activa la IA
                    "metadata": {
                        "url": f"https://plomeriauniversal.mx/products/{p_handle}?variant={v.get('id')}",
                        "variant_id": v.get('id'),
                        "inventory_quantity": v.get('inventory_quantity'),
                        "vendor": p_vendor
                    }
                }
                all_extracted_data.append(item)

    except Exception as e:
        print(f"❌ Error crítico: {e}")
        logging.error(f"Error critico: {e}")

    # Inserción en Supabase
    if all_extracted_data:
        print(f"📤 Enviando {len(all_extracted_data)} variantes a la Nube...")
        try:
            supabase.table("log_scraper_prices").insert(all_extracted_data).execute()
            print("✅ Variantes actualizadas correctamente.")
        except Exception as e:
            print(f"❌ Error Supabase: {e}")
            logging.error(f"Error insertando: {e}")
    else:
        print("⚠️ No se extrajeron datos.")

if __name__ == "__main__":
    run_scraper()