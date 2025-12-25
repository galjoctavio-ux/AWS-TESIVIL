import os
import json
import logging
import random
import time
from datetime import datetime
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
URL_PRODUCTOS = f"{BASE_URL}/productos/"

# Selectores para la lista de productos (Tiendanube)
SELECTOR_ITEM_LINK = 'a.js-item-link' 
SELECTOR_PAGINACION_NEXT = 'a.js-pagination-next'

logging.basicConfig(
    filename=LOG_FILE, 
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s'
)

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def create_robust_session():
    session = requests.Session()
    retry = Retry(total=5, backoff_factor=3, status_forcelist=[429, 500, 502, 503, 504])
    session.mount("https://", HTTPAdapter(max_retries=retry))
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })
    return session

def get_normalized_id(sku):
    """Busca el ID en el catálogo maestro usando el SKU"""
    if not sku or sku == "N/A": return None
    try:
        res = supabase.table("product_catalog").select("id").eq("sku_master", sku).maybe_single().execute()
        return res.data['id'] if res.data else None
    except Exception:
        return None

def scrape_product_detail(session, url):
    """Entra a la página del producto y extrae el JSON-LD"""
    try:
        response = session.get(url, timeout=20)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Buscamos el Schema JSON-LD de tipo Product
        scripts = soup.find_all('script', type='application/ld+json')
        for script in scripts:
            try:
                data = json.loads(script.string)
                if data.get('@type') == 'Product' or data.get('@type') == ['Product']:
                    # Tiendanube a veces pone el SKU en 'sku' o 'mpn'
                    sku = data.get('sku') or data.get('mpn') or "N/A"
                    price = float(data['offers']['price']) if 'offers' in data else 0.0
                    
                    return {
                        "provider_name": PROVIDER_NAME,
                        "product_title": data.get('name'),
                        "sku": str(sku),
                        "price": price,
                        "currency": data['offers'].get('priceCurrency', 'MXN'),
                        "normalized_product_id": get_normalized_id(sku),
                        "metadata": {
                            "url": url,
                            "brand": data.get('brand', {}).get('name', 'N/A'),
                            "availability": data['offers'].get('availability')
                        }
                    }
            except: continue
    except Exception as e:
        logging.error(f"Error extrayendo detalle de {url}: {e}")
    return None

def run_scraper():
    session = create_robust_session()
    current_url = URL_PRODUCTOS
    all_extracted_data = []
    
    print(f"--- Iniciando Scraper {PROVIDER_NAME} ---")

    while current_url:
        print(f"Escaneando lista: {current_url}")
        res = session.get(current_url)
        soup = BeautifulSoup(res.text, 'html.parser')
        
        # Obtener todos los links de productos en la página actual
        links = [BASE_URL + a['href'] for a in soup.select(SELECTOR_ITEM_LINK) if a.has_attr('href')]
        # Eliminar duplicados manteniendo orden
        links = list(dict.fromkeys(links))

        for link in links:
            print(f"  > Procesando: {link.split('/')[-2]}")
            product_data = scrape_product_detail(session, link)
            if product_data and product_data['price'] > 0:
                all_extracted_data.append(product_data)
            time.sleep(random.uniform(1, 2)) # Respeto al servidor

        # Paginación
        next_page = soup.select_one(SELECTOR_PAGINACION_NEXT)
        current_url = BASE_URL + next_page['href'] if next_page and next_page.has_attr('href') else None

    # Insertar en Supabase
    if all_extracted_data:
        try:
            supabase.table("market_prices_log").insert(all_extracted_data).execute()
            print(f"✅ Éxito: {len(all_extracted_data)} registros insertados.")
        except Exception as e:
            print(f"❌ Error Supabase: {e}")
            logging.error(f"Error insertando en Supabase: {e}")

if __name__ == "__main__":
    run_scraper()
