import os
import time
import logging
import random
from datetime import datetime
from pathlib import Path
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from supabase import create_client, Client
from dotenv import load_dotenv

# --- CONFIGURACIÓN ---
BASE_URL = "https://reacsa.mx/products.json"
PROVIDER_NAME = "Reacsa"
LOG_FILE = 'scraper_reacsa.log'

# 1. Configuración de Logs
logging.basicConfig(
    filename=LOG_FILE, 
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# 2. Carga de credenciales y conexión
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    exit("❌ Error: Credenciales no encontradas en .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def create_robust_session():
    session = requests.Session()
    retry = Retry(
        total=5,
        backoff_factor=2,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET"]
    )
    session.mount("https://", HTTPAdapter(max_retries=retry))
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })
    return session

def fetch_and_store():
    session = create_robust_session()
    page = 1
    total_inserted = 0

    print(f"--- 🚀 Iniciando Barrido TOTAL en {PROVIDER_NAME} ---")

    while True:
        try:
            print(f"Consultando página JSON {page}...")
            response = session.get(f"{BASE_URL}?page={page}&limit=250", timeout=30)
            response.raise_for_status() 

            data = response.json()
            products = data.get('products', [])

            if not products:
                print("🏁 Fin de la paginación.")
                break

            batch_data = []

            for product in products:
                # Capturamos metadatos de clasificación
                p_type = product.get('product_type', 'N/A')
                p_tags = product.get('tags', [])
                p_vendor = product.get('vendor', 'N/A')

                for variant in product['variants']:
                    variant_title = variant['title'] if variant['title'] != "Default Title" else ""
                    title_full = f"{product['title']} {variant_title}".strip()

                    # --- FILTRO REMOVIDO ---
                    # Ahora aceptamos todo el catálogo para análisis de tendencias.
                    
                    price = float(variant['price'])

                    if price > 0:
                        item = {
                            "provider_name": PROVIDER_NAME,
                            "product_title": title_full,
                            "sku": variant.get('sku') or f"R{variant['id']}",
                            "price": price,
                            "created_at": datetime.now().astimezone().isoformat(),
                            "metadata": {
                                "url": f"https://reacsa.mx/products/{product['handle']}",
                                "vendor": p_vendor,
                                "product_type": p_type,
                                "tags": p_tags,
                                "variant_id": variant['id']
                            }
                        }
                        batch_data.append(item)

            if batch_data:
                supabase.table("market_prices_log").insert(batch_data).execute()
                total_inserted += len(batch_data)
                print(f"✅ Página {page}: {len(batch_data)} ítems procesados.")

            page += 1
            # Pausa aleatoria para evitar detección de comportamiento bot
            time.sleep(random.uniform(0.7, 1.5)) 

        except Exception as e:
            print(f"❌ Error crítico en página {page}: {e}")
            break

    print(f"--- 🏁 Finalizado. Total {PROVIDER_NAME}: {total_inserted} registros ---")

if __name__ == "__main__":
    fetch_and_store()
