import os
import time
import logging
from datetime import datetime
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from supabase import create_client, Client
from dotenv import load_dotenv

# 1. Configuración de Logs (Para saber qué pasó si falla en la madrugada)
logging.basicConfig(
    filename='scraper_log.log', 
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# 2. Cargar variables de entorno (busca .env en la carpeta actual)
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Validación simple
if not SUPABASE_URL or not SUPABASE_KEY:
    error_msg = "FATAL: No se encontraron las credenciales en .env"
    print(error_msg)
    logging.error(error_msg)
    exit()

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

BASE_URL = "https://friorefacciones.com/products.json"
PROVIDER_NAME = "Frio Refacciones"

# 3. Función para crear una sesión robusta (Reintentos automáticos)
def create_robust_session():
    session = requests.Session()
    retry = Retry(
        total=5,  # Número de reintentos totales
        backoff_factor=2,  # Espera: 2s, 4s, 8s, 16s...
        status_forcelist=[500, 502, 503, 504], # Reintentar solo en errores de servidor
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
            
            # Usamos session.get en lugar de requests.get para tener reintentos
            response = session.get(f"{BASE_URL}?page={page}&limit=250", timeout=30)
            
            # Si después de los reintentos sigue fallando (ej. 404), lanzará error aquí
            response.raise_for_status() 

            data = response.json()
            products = data.get('products', [])

            if not products:
                print("Fin de la paginación o sin productos.")
                break

            batch_data = []

            for product in products:
                for variant in product['variants']:
                    # Limpieza y preparación de datos
                    title_full = f"{product['title']} - {variant['title']}".replace(" - Default Title", "")
                    
                    item = {
                        "provider_name": PROVIDER_NAME,
                        "product_title": title_full,
                        "sku": variant.get('sku') or str(variant['id']),
                        "price": float(variant['price']),
                        "created_at": datetime.utcnow().isoformat(), # Asegurar fecha UTC
                        "metadata": {
                            "url": f"https://friorefacciones.com/products/{product['handle']}",
                            "vendor": product.get('vendor'),
                            "shopify_id": product['id'],
                            "variant_id": variant['id']
                        }
                    }
                    batch_data.append(item)

            if batch_data:
                # Insertar en Supabase
                data = supabase.table("market_prices_log").insert(batch_data).execute()
                # Nota: supabase-py v2 retorna un objeto, asumimos éxito si no hay excepción
                inserted_count = len(batch_data)
                total_inserted += inserted_count
                logging.info(f"Página {page}: Insertados {inserted_count} productos.")
            
            page += 1
            time.sleep(1) # Pequeña pausa de cortesía adicional

        except requests.exceptions.RequestException as e:
            err_msg = f"Error de Conexión/Red en página {page} tras reintentos: {e}"
            print(err_msg)
            logging.error(err_msg)
            # Aquí decidimos si rompemos el ciclo o intentamos saltar la página
            # Para integridad de datos, mejor romper el ciclo y revisar logs luego.
            break
            
        except Exception as e:
            err_msg = f"Error lógico/procesamiento en página {page}: {e}"
            print(err_msg)
            logging.error(err_msg)
            break

    msg_end = f"--- Finalizado. Total insertados: {total_inserted} ---"
    print(msg_end)
    logging.info(msg_end)

if __name__ == "__main__":
    fetch_and_store()