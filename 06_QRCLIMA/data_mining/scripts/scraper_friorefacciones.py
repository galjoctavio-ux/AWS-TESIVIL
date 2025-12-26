import os
import time
import logging
import random
from pathlib import Path
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from supabase import create_client, Client
from dotenv import load_dotenv

# --- CONFIGURACIÓN ---
BASE_URL = "https://friorefacciones.com/products.json"
PROVIDER_NAME = "Frio Refacciones"
LOG_FILE = 'scraper_friorefacciones.log'

# 1. Configuración de Logs
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
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    })
    return session

def fetch_and_store():
    session = create_robust_session()
    page = 1
    total_inserted = 0
    
    print(f"🚀 Iniciando Scraper {PROVIDER_NAME}...")

    while True:
        try:
            print(f"📄 Procesando página {page}...")
            response = session.get(f"{BASE_URL}?page={page}&limit=250", timeout=20)
            
            if response.status_code != 200:
                print(f"⚠️ Fin o Error {response.status_code}")
                break

            data = response.json()
            products = data.get('products', [])

            if not products:
                print("✅ No hay más productos. Finalizando.")
                break

            batch_data = []

            for product in products:
                p_id = product.get('id')
                p_title = product.get('title', '').strip()
                p_vendor = product.get('vendor', '')
                p_type = product.get('product_type', '')
                p_tags = product.get('tags', [])
                p_handle = product.get('handle', '')

                # Iterar variantes (precios distintos para mismo producto)
                for variant in product.get('variants', []):
                    try:
                        price = float(variant.get('price', 0))
                        
                        if price <= 1.0: continue

                        # Construir título completo (Producto + Variante)
                        # Ej: "Cinta Aluminio" + "2 pulgadas"
                        variant_title = variant.get('title', '')
                        title_full = p_title
                        if variant_title and variant_title.lower() != 'default title':
                            title_full = f"{p_title} - {variant_title}"

                        # SKU: Prioridad al del proveedor, si no, ID interno
                        sku_val = variant.get('sku')
                        if not sku_val:
                            sku_val = f"FR-{variant.get('id')}"

                        item = {
                            "provider_name": PROVIDER_NAME,
                            "sku_provider": str(sku_val).strip(), # Columna NUEVA
                            "raw_title": title_full[:500],        # Columna NUEVA
                            "price": price,
                            "currency": "MXN",
                            "status": "pending",                  # <--- SEÑAL PARA IA
                            "metadata": {
                                "url": f"https://friorefacciones.com/products/{p_handle}",
                                "vendor": p_vendor,
                                "type": p_type,
                                "tags": p_tags,
                                "variant_id": variant['id']
                            }
                        }
                        batch_data.append(item)

                    except Exception as e_var:
                        logging.warning(f"Error variante {variant.get('id')}: {e_var}")

            if batch_data:
                try:
                    supabase.table("market_prices_log").insert(batch_data).execute()
                    total_inserted += len(batch_data)
                    print(f"   💾 Guardados {len(batch_data)} registros.")
                except Exception as e_db:
                    print(f"   ❌ Error DB: {e_db}")

            page += 1
            time.sleep(random.uniform(1.0, 2.0))

        except Exception as e:
            print(f"❌ Error crítico: {e}")
            break

    print(f"\n🏁 {PROVIDER_NAME} Finalizado. Total: {total_inserted}")

if __name__ == "__main__":
    fetch_and_store()