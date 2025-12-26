import os
import json
import logging
import random
import time
from pathlib import Path
import requests
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from supabase import create_client, Client
from dotenv import load_dotenv

# --- CONFIGURACIÓN ---
PROVIDER_NAME = "Aires Aurum"
LOG_FILE = 'scraper_aires_aurum.log'
BASE_URL = "https://airesaurum.com.mx"
START_URL = "https://airesaurum.com.mx/aires-acondicionados/"

# Selectores específicos de TiendaNube (Aires Aurum)
SELECTOR_ITEM_LINK = 'a.js-item-link' 
SELECTOR_PAGINACION_NEXT = 'a.js-pagination-next'

# 1. Configuración de Logs
logging.basicConfig(
    filename=LOG_FILE, 
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# 2. Carga de credenciales
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
        status_forcelist=[429, 500, 502, 503, 504]
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    })
    return session

def scrape_product_detail(session, url):
    """Extrae datos usando JSON-LD (Lógica de la versión antigua, adaptada al esquema nuevo)."""
    try:
        response = session.get(url, timeout=15)
        if response.status_code != 200:
            return None
        
        soup = BeautifulSoup(response.text, 'html.parser')

        # Buscamos el Schema JSON-LD de tipo Product
        scripts = soup.find_all('script', type='application/ld+json')
        target_data = None
        
        for script in scripts:
            try:
                data = json.loads(script.string)
                # A veces es una lista, a veces un dict
                if isinstance(data, list):
                    # Buscar el dict que sea Product dentro de la lista
                    data = next((item for item in data if item.get('@type') == 'Product'), None)
                
                if data and data.get('@type') == 'Product':
                    target_data = data
                    break
            except:
                continue
        
        if not target_data:
            logging.warning(f"No JSON-LD found for {url}")
            return None

        # Extracción de datos limpia
        raw_title = target_data.get('name')
        # Tiendanube a veces pone el SKU en 'sku' o 'mpn'
        sku_provider = target_data.get('sku') or target_data.get('mpn') or "N/A"
        
        price = 0.0
        currency = "MXN"
        
        if 'offers' in target_data:
            offers = target_data['offers']
            # offers puede ser lista o dict
            if isinstance(offers, list):
                offers = offers[0] # Tomar la primera oferta
            
            price = float(offers.get('price', 0))
            currency = offers.get('priceCurrency', 'MXN')

        if price == 0:
            return None

        # Construir objeto para Supabase (Esquema del script nuevo)
        return {
            "provider_name": PROVIDER_NAME,
            "sku_provider": str(sku_provider)[:100],
            "raw_title": raw_title[:500],
            "price": price,
            "currency": currency,
            "status": "pending", 
            "metadata": {
                "url": url,
                "brand": target_data.get('brand', {}).get('name', 'N/A'),
                "scraped_at": time.time()
            }
        }

    except Exception as e:
        logging.error(f"Error scrapeando {url}: {e}")
        return None

def fetch_and_store():
    session = create_robust_session()
    print(f"🚀 Iniciando Scraper {PROVIDER_NAME} (Modo TiendaNube)...")
    
    current_url = START_URL
    total_inserted = 0
    page_num = 1

    while current_url:
        print(f"📄 Escaneando página {page_num}: {current_url}")
        
        try:
            response = session.get(current_url, timeout=20)
            if response.status_code != 200:
                print("   ⛔ Error de conexión o fin.")
                break
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 1. Obtener links usando el selector específico de TiendaNube
            product_links = []
            link_elements = soup.select(SELECTOR_ITEM_LINK)
            
            for a in link_elements:
                if a.has_attr('href'):
                    href = a['href']
                    full_link = href if href.startswith('http') else f"{BASE_URL}{href}"
                    # Limpiar query params
                    clean_link = full_link.split('?')[0]
                    if clean_link not in product_links:
                        product_links.append(clean_link)

            if not product_links:
                print("⚠️ No se encontraron productos en esta página. Terminando.")
                break

            print(f"   Encontrados {len(product_links)} enlaces. Procesando...")

            # 2. Procesar detalles
            batch_data = []
            for link in product_links:
                data = scrape_product_detail(session, link)
                if data:
                    batch_data.append(data)
                time.sleep(random.uniform(0.5, 1.5)) # Respetar servidor

            # 3. Guardar en BD
            if batch_data:
                try:
                    supabase.table("market_prices_log").insert(batch_data).execute()
                    count = len(batch_data)
                    total_inserted += count
                    print(f"   💾 Guardados {count} productos nuevos.")
                except Exception as e:
                    print(f"   ❌ Error al guardar en DB: {e}")

            # 4. Obtener siguiente página (Lógica 'Next Button')
            next_btn = soup.select_one(SELECTOR_PAGINACION_NEXT)
            if next_btn and next_btn.has_attr('href'):
                current_url = next_btn['href']
                if not current_url.startswith('http'):
                    current_url = f"{BASE_URL}{current_url}"
                page_num += 1
            else:
                print("   ✅ No hay más páginas (botón 'Siguiente' no encontrado).")
                current_url = None

        except Exception as e:
            print(f"❌ Error general: {e}")
            break

    print(f"\n🏁 {PROVIDER_NAME} Finalizado. Total insertados: {total_inserted}")

if __name__ == "__main__":
    fetch_and_store()