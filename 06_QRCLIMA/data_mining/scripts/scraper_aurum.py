import os
import json
import logging
import random
import time
from datetime import datetime
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
URL_PRODUCTOS = f"{BASE_URL}/productos/"

logging.basicConfig(
    filename=LOG_FILE, 
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# 1. CARGA ROBUSTA DE CREDENCIALES
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ FATAL: No se encontraron las credenciales en .env")
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
    session.mount("https://", HTTPAdapter(max_retries=retry))
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
    })
    return session

def get_normalized_id(sku):
    """Busca el ID en el catálogo maestro usando el SKU"""
    if not sku or sku == "N/A": return None
    try:
        res = supabase.table("product_catalog").select("id").eq("sku_master", sku).maybe_single().execute()
        return res.data['id'] if res.data else None
    except Exception as e:
        logging.error(f"Error consultando catálogo para SKU {sku}: {e}")
        return None

def scrape_product_detail(session, url):
    """Extrae datos desde el bloque JSON-LD del producto"""
    try:
        response = session.get(url, timeout=20)
        if response.status_code != 200: return None
        
        soup = BeautifulSoup(response.text, 'html.parser')
        scripts = soup.find_all('script', type='application/ld+json')
        
        for script in scripts:
            try:
                data = json.loads(script.string)
                # El JSON-LD puede ser un objeto directo o una lista
                if isinstance(data, list): data = data[0]
                
                if data.get('@type') == 'Product' or 'Product' in str(data.get('@type')):
                    sku = data.get('sku') or data.get('mpn') or "N/A"
                    price = 0.0
                    
                    if 'offers' in data:
                        offers = data['offers']
                        if isinstance(offers, list): offers = offers[0]
                        price = float(offers.get('price', 0))
                    
                    return {
                        "provider_name": PROVIDER_NAME,
                        "product_title": data.get('name'),
                        "sku": str(sku),
                        "price": price,
                        "currency": "MXN",
                        "normalized_product_id": get_normalized_id(sku),
                        "metadata": {
                            "url": url,
                            "brand": data.get('brand', {}).get('name', 'N/A') if isinstance(data.get('brand'), dict) else "N/A"
                        }
                    }
            except Exception: continue
    except Exception as e:
        logging.error(f"Error en detalle de {url}: {e}")
    return None

def run_scraper():
    session = create_robust_session()
    current_url = URL_PRODUCTOS
    all_extracted_data = []
    
    print(f"--- Iniciando Scraper {PROVIDER_NAME} ---")

    while current_url:
        print(f"Escaneando lista: {current_url}")
        try:
            res = session.get(current_url, timeout=20)
            soup = BeautifulSoup(res.text, 'html.parser')
            
            # Selectores flexibles para Tiendanube
            items = soup.select('a.js-item-link') or \
                    soup.select('.item-link') or \
                    soup.select('a[href*="/productos/"]')

            links = []
            for a in items:
                href = a.get('href')
                if href:
                    full_url = href if href.startswith('http') else BASE_URL + href
                    if "/productos/" in full_url and full_url.rstrip('/') != URL_PRODUCTOS.rstrip('/'):
                        links.append(full_url)

            links = list(dict.fromkeys(links))
            print(f"  🔍 Detectados {len(links)} productos en esta página.")

            if not links:
                print("  ⚠️ No se encontraron productos. Fin del proceso.")
                break

            for link in links:
                print(f"    > Procesando: {link.split('/')[-2]}")
                product_data = scrape_product_detail(session, link)
                if product_data and product_data['price'] > 0:
                    all_extracted_data.append(product_data)
                time.sleep(random.uniform(1, 2))

            # Manejo de paginación
            next_page = soup.select_one('a.js-pagination-next') or \
                        soup.select_one('a[rel="next"]')
            
            if next_page and next_page.get('href'):
                next_href = next_page['href']
                current_url = next_href if next_href.startswith('http') else BASE_URL + next_href
            else:
                print("  🏁 Fin de la paginación.")
                current_url = None

        except Exception as e:
            print(f"❌ Error en lista: {e}")
            break

    # 3. INSERCIÓN EN SUPABASE
    if all_extracted_data:
        print(f"📤 Enviando {len(all_extracted_data)} registros a Supabase...")
        try:
            supabase.table("market_prices_log").insert(all_extracted_data).execute()
            print("✅ ¡Éxito! Datos guardados correctamente.")
        except Exception as e:
            print(f"❌ Error al guardar en Supabase: {e}")
            logging.error(f"Error Supabase: {e}")
    else:
        print("Empty: No se recolectaron datos válidos.")

if __name__ == "__main__":
    run_scraper()
