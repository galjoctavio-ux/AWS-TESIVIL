import os
import time
import logging
from datetime import datetime
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from supabase import create_client, Client
from dotenv import load_dotenv
from filtros import es_accesorio_valido

# --- CONFIGURACIÓN ESPECÍFICA DE ESTE PROVEEDOR ---
BASE_URL = "https://reacsa.mx/products.json"
PROVIDER_NAME = "Reacsa"
LOG_FILE = 'scraper_reacsa.log'
# --------------------------------------------------

# 1. Configuración de Logs
logging.basicConfig(
    filename=LOG_FILE, 
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# 2. Cargar variables de entorno
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    error_msg = "FATAL: No se encontraron las credenciales en .env"
    print(error_msg)
    logging.error(error_msg)
    exit()

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def create_robust_session():
    session = requests.Session()
    retry = Retry(
        total=5,
        backoff_factor=2,
        status_forcelist=[500, 502, 503, 504],
        allowed_methods=["GET"]
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    return session

def fetch_and_store():
    session = create_robust_session()
    page = 1
    total_inserted = 0
    
    msg_start = f"--- Iniciando Scraper {PROVIDER_NAME}: {datetime.now()} ---"
    print(msg_start)
    logging.info(msg_start)

    while True:
        try:
            print(f"Consultando página JSON {page}...")
            
            # Timeout de 30s para evitar bloqueos
            response = session.get(f"{BASE_URL}?page={page}&limit=250", timeout=30)
            response.raise_for_status() 

            data = response.json()
            products = data.get('products', [])

            if not products:
                print("Fin de la paginación o sin productos.")
                break

            batch_data = []

            for product in products:
                for variant in product['variants']:
                    
                    # Título compuesto: Producto + Variante (si aplica)
                    variant_title = variant['title'] if variant['title'] != "Default Title" else ""
                    title_full = f"{product['title']} {variant_title}".strip()
                    
                    if not es_accesorio_valido(title_full):
                        continue

                    item = {
                        "provider_name": PROVIDER_NAME,
                        "product_title": title_full,
                        "sku": variant.get('sku') or str(variant['id']),
                        "price": float(variant['price']),
                        # CORRECCIÓN DE FECHA APLICADA AQUÍ:
                        "created_at": datetime.now().astimezone().isoformat(),
                        "metadata": {
                            "url": f"https://reacsa.mx/products/{product['handle']}",
                            "vendor": product.get('vendor'),
                            "shopify_id": product['id'],
                            "variant_id": variant['id']
                        }
                    }
                    batch_data.append(item)

            if batch_data:
                # Insertar en Supabase
                supabase.table("market_prices_log").insert(batch_data).execute()
                inserted_count = len(batch_data)
                total_inserted += inserted_count
                logging.info(f"Página {page}: Insertados {inserted_count} productos.")
            
            page += 1
            time.sleep(1) # Pausa de cortesía

        except requests.exceptions.RequestException as e:
            err_msg = f"Error de Red en página {page}: {e}"
            print(err_msg)
            logging.error(err_msg)
            break
            
        except Exception as e:
            err_msg = f"Error General en página {page}: {e}"
            print(err_msg)
            logging.error(err_msg)
            break

    msg_end = f"--- Finalizado {PROVIDER_NAME}. Total insertados: {total_inserted} ---"
    print(msg_end)
    logging.info(msg_end)

if __name__ == "__main__":
    fetch_and_store()