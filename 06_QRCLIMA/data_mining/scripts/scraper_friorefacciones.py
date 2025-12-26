import os
import time
import logging
import random
from datetime import datetime
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from supabase import create_client, Client
from dotenv import load_dotenv

# 1. Configuración de Logs
logging.basicConfig(
    filename='scraper_friorefacciones.log', 
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s'
)

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    exit("Error: Credenciales no encontradas.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

BASE_URL = "https://friorefacciones.com/products.json"
PROVIDER_NAME = "Frio Refacciones"

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

    print(f"--- 🚀 Iniciando Scraper TOTAL {PROVIDER_NAME} ---")

    while True:
        try:
            # Shopify permite hasta 250 productos por página
            response = session.get(f"{BASE_URL}?page={page}&limit=250", timeout=30)
            response.raise_for_status() 

            data = response.json()
            products = data.get('products', [])

            if not products:
                print("🏁 Fin de la paginación.")
                break

            batch_data = []

            for product in products:
                # Extraemos el tipo y etiquetas para facilitar el mapeo posterior
                p_type = product.get('product_type', 'Sin Tipo')
                p_tags = product.get('tags', [])
                p_vendor = product.get('vendor', 'N/A')

                for variant in product['variants']:
                    title_full = f"{product['title']} - {variant['title']}".replace(" - Default Title", "")
                    
                    # --- ELIMINAMOS EL FILTRO LIMITANTE ---
                    # Ahora capturamos TODO. La limpieza se hará en la etapa de análisis.
                    
                    price = float(variant['price'])
                    
                    if price > 0:
                        item = {
                            "provider_name": PROVIDER_NAME,
                            "product_title": title_full,
                            "sku": variant.get('sku') or f"V{variant['id']}",
                            "price": price,
                            "created_at": datetime.now().astimezone().isoformat(),
                            "metadata": {
                                "url": f"https://friorefacciones.com/products/{product['handle']}",
                                "vendor": p_vendor,
                                "product_type": p_type, # <--- ÚTIL PARA CATEGORIZAR
                                "tags": p_tags,         # <--- ÚTIL PARA CATEGORIZAR
                                "variant_id": variant['id']
                            }
                        }
                        batch_data.append(item)

            if batch_data:
                supabase.table("market_prices_log").insert(batch_data).execute()
                total_inserted += len(batch_data)
                print(f"✅ Página {page}: Procesados {len(batch_data)} ítems.")

            page += 1
            time.sleep(random.uniform(0.5, 1.5)) 

        except Exception as e:
            print(f"❌ Error en página {page}: {e}")
            break

    print(f"--- Finalizado. Total en base de datos: {total_inserted} ---")

if __name__ == "__main__":
    fetch_and_store()
