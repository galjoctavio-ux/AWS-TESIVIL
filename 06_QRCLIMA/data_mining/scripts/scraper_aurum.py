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

# 1. CARGA DE CREDENCIALES
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    exit("❌ FATAL: No se encontraron las credenciales en .env")

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
    except Exception:
        return None

def scrape_product_detail(session, url):
    """Extrae datos profundos desde el JSON-LD del producto"""
    try:
        response = session.get(url, timeout=20)
        if response.status_code != 200: return None

        soup = BeautifulSoup(response.text, 'html.parser')
        scripts = soup.find_all('script', type='application/ld+json')

        for script in scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, list): data = data[0]

                if data.get('@type') == 'Product' or 'Product' in str(data.get('@type')):
                    sku = data.get('sku') or data.get('mpn') or "N/A"
                    price = 0.0

                    if 'offers' in data:
                        offers = data['offers']
                        if isinstance(offers, list): offers = offers[0]
                        price = float(offers.get('price', 0))

                    # Capturamos la marca y una descripción corta para el mapeador
                    brand_info = data.get('brand')
                    brand_name = brand_info.get('name', 'N/A') if isinstance(brand_info, dict) else str(brand_info)
                    
                    return {
                        "provider_name": PROVIDER_NAME,
                        "product_title": data.get('name'),
                        "sku": str(sku),
                        "price": price,
                        "currency": "MXN",
                        "normalized_product_id": get_normalized_id(sku),
                        "created_at": datetime.now().astimezone().isoformat(), # Normalización de fecha
                        "metadata": {
                            "url": url,
                            "brand": brand_name,
                            "category": "Equipos de Aire Acondicionado", # Categoría base fija para Aurum
                            "description_snippet": data.get('description', '')[:150] # Pistas para el mapeador
                        }
                    }
            except Exception: continue
    except Exception as e:
        logging.error(f"Error en detalle de {url}: {e}")
    return None

def run_scraper():
    session = create_robust_session()
    current_url = URL_PRODUCTOS
    total_scraped = 0

    print(f"--- 🌀 Iniciando Scraper Normalizado: {PROVIDER_NAME} ---")

    while current_url:
        print(f"Buscando productos en: {current_url}")
        try:
            res = session.get(current_url, timeout=20)
            soup = BeautifulSoup(res.text, 'html.parser')

            # Selectores de Tiendanube
            items = soup.select('a.js-item-link') or soup.select('.item-link')

            links = []
            for a in items:
                href = a.get('href')
                if href:
                    full_url = href if href.startswith('http') else BASE_URL + href
                    if "/productos/" in full_url and full_url.rstrip('/') != URL_PRODUCTOS.rstrip('/'):
                        links.append(full_url)

            links = list(dict.fromkeys(links)) # Eliminar duplicados

            batch_data = []
            for link in links:
                data = scrape_product_detail(session, link)
                if data and data['price'] > 0:
                    batch_data.append(data)
                time.sleep(random.uniform(1, 2)) # Cortesía

            if batch_data:
                supabase.table("market_prices_log").insert(batch_data).execute()
                total_scraped += len(batch_data)
                print(f"   ✅ Se guardaron {len(batch_data)} productos.")

            # Paginación
            next_page = soup.select_one('a.js-pagination-next') or soup.select_one('a[rel="next"]')
            if next_page and next_page.get('href'):
                next_href = next_page['href']
                current_url = next_href if next_href.startswith('http') else BASE_URL + next_href
            else:
                current_url = None

        except Exception as e:
            print(f"❌ Error: {e}")
            break

    print(f"--- 🏁 Finalizado. Total {PROVIDER_NAME}: {total_scraped} ---")

if __name__ == "__main__":
    run_scraper()
