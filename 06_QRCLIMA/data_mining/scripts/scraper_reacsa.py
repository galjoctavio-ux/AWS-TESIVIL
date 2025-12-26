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
    print("❌ Error: Credenciales no encontradas en .env")
    exit(1)

# Cliente de Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def create_robust_session():
    """Crea una sesión HTTP resistente a fallos y bloqueos."""
    session = requests.Session()
    retry = Retry(
        total=5,
        backoff_factor=2,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["HEAD", "GET", "OPTIONS"]
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    
    # Headers para parecer un navegador real
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json"
    })
    return session

def fetch_and_store():
    session = create_robust_session()
    page = 1
    total_inserted = 0
    
    print(f"🚀 Iniciando Scraper Inteligente para {PROVIDER_NAME}...")
    logging.info(f"Iniciando scrapeo de {PROVIDER_NAME}")

    while True:
        try:
            print(f"📄 Procesando página {page}...")
            response = session.get(f"{BASE_URL}?page={page}&limit=250", timeout=20)
            
            if response.status_code != 200:
                logging.error(f"Error {response.status_code} en pág {page}")
                break

            data = response.json()
            products = data.get('products', [])

            if not products:
                print("✅ No hay más productos. Finalizando.")
                break

            batch_data = []

            for product in products:
                # Extraer datos base
                p_id = product.get('id')
                p_title = product.get('title', '').strip()
                p_vendor = product.get('vendor', '')
                p_type = product.get('product_type', '')
                p_tags = product.get('tags', [])
                p_handle = product.get('handle', '')

                # Iterar sobre variantes (cada variante es un producto con precio distinto)
                for variant in product.get('variants', []):
                    try:
                        price = float(variant.get('price', 0))
                        
                        # FILTRO: Ignorar precios cero o errores obvios
                        if price <= 1.0: 
                            continue

                        # Construcción de título compuesto si la variante tiene nombre relevante
                        variant_title = variant.get('title', '')
                        title_full = p_title
                        if variant_title and variant_title.lower() != 'default title':
                            title_full = f"{p_title} - {variant_title}"

                        # SKU: Prioridad al SKU del proveedor, si no, usar ID
                        sku_val = variant.get('sku')
                        if not sku_val:
                            sku_val = f"R-{variant.get('id')}"

                        # --- OBJETO PARA EL NUEVO SCHEMA DB ---
                        item = {
                            "provider_name": PROVIDER_NAME,
                            "sku_provider": str(sku_val).strip(),  # Columna nueva
                            "raw_title": title_full[:500],         # Columna nueva (truncado por seguridad)
                            "price": price,
                            "currency": "MXN",
                            "status": "pending",                   # La clave para activar la IA
                            "metadata": {                          # JSON limpio
                                "url": f"https://reacsa.mx/products/{p_handle}",
                                "vendor": p_vendor,
                                "tags": p_tags,
                                "original_id": p_id
                            }
                            # Nota: 'created_at' lo pone la DB automáticamente
                        }
                        batch_data.append(item)
                    except Exception as e_var:
                        logging.warning(f"Error procesando variante {variant.get('id')}: {e_var}")

            # Insertar en Supabase por lotes
            if batch_data:
                try:
                    # Usamos upsert implícito o insert simple
                    # Como es un log de precios históricos, 'insert' está bien.
                    data_result = supabase.table("market_prices_log").insert(batch_data).execute()
                    
                    count = len(batch_data)
                    total_inserted += count
                    print(f"   💾 Guardados {count} registros de pág {page}")
                except Exception as e_db:
                    logging.error(f"Error insertando lote página {page}: {e_db}")
                    print(f"   ❌ Error al guardar en BD: {e_db}")

            page += 1
            # Pausa amigable para no saturar al servidor de Reacsa
            time.sleep(random.uniform(1.0, 2.0)) 

        except Exception as e:
            logging.error(f"Error crítico en loop principal pág {page}: {e}")
            print(f"❌ Error crítico: {e}")
            break

    print(f"\n--- 🏁 Finalizado {PROVIDER_NAME}. Total insertados: {total_inserted} ---")

if __name__ == "__main__":
    fetch_and_store()