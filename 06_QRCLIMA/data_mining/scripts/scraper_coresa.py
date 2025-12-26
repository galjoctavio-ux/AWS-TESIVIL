import os
import time
import logging
import random
from datetime import datetime
import requests
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from supabase import create_client, Client
from dotenv import load_dotenv

# --- CONFIGURACIÓN OPTIMIZADA ---
PROVIDER_NAME = "Grupo Coresa"
LOG_FILE = 'scraper_coresa_full.log'

# Agregamos las categorías que alimentan tus 11 grupos. 
# Agregamos '?product_list_limit=64' para cargar más productos por página y ahorrar tiempo.
URLS_CATEGORIAS = [
    "https://www.grupocoresa.com/equipos-de-aire-acondicionado?product_list_limit=64",
    "https://www.grupocoresa.com/tuberias-y-aislamientos/tuberias-de-cobre?product_list_limit=64",
    "https://www.grupocoresa.com/refrigerantes-y-quimicos?product_list_limit=64",
    "https://www.grupocoresa.com/herramientas?product_list_limit=64"
]

SELECTOR_PRODUCTO = 'li.product-item'
SELECTOR_TITULO = 'a.product-item-link'
SELECTOR_PRECIO = '.price-box .price' 
SELECTOR_PAGINACION_NEXT = 'a.action.next'

logging.basicConfig(filename=LOG_FILE, level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
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

def clean_price(price_str):
    if not price_str: return 0.0
    clean = price_str.replace('$', '').replace(',', '').replace('MXN', '').strip()
    try:
        return float(clean)
    except:
        return 0.0

def process_category(session, category_url):
    page = 1
    items_count = 0
    current_url = category_url

    print(f"--> Iniciando: {category_url.split('com/')[1].split('?')[0]}")

    while True:
        try:
            print(f"    Página {page}...")
            response = session.get(current_url, timeout=30)
            soup = BeautifulSoup(response.text, 'html.parser')
            products = soup.select(SELECTOR_PRODUCTO)

            if not products:
                break

            batch_data = []
            for p in products:
                try:
                    tag_titulo = p.select_one(SELECTOR_TITULO)
                    if not tag_titulo: continue

                    title = tag_titulo.get_text(strip=True)
                    link = tag_titulo.get('href', '')
                    
                    tag_precio = p.select_one(SELECTOR_PRECIO)
                    price = clean_price(tag_precio.get_text(strip=True)) if tag_precio else 0.0

                    sku = "N/A"
                    form_tocart = p.select_one('form[data-product-sku]')
                    if form_tocart:
                        sku = form_tocart.get('data-product-sku')

                    if price > 0:
                        batch_data.append({
                            "provider_name": PROVIDER_NAME,
                            "product_title": title,
                            "sku": sku,
                            "price": price,
                            "created_at": datetime.now().astimezone().isoformat(),
                            "metadata": {
                                "url": link,
                                "category_slug": category_url.split('com/')[1].split('?')[0]
                            }
                        })
                except: continue

            if batch_data:
                supabase.table("market_prices_log").insert(batch_data).execute()
                items_count += len(batch_data)

            # Paginación
            next_btn = soup.select_one(SELECTOR_PAGINACION_NEXT)
            if next_btn and next_btn.get('href'):
                current_url = next_btn['href']
                if "product_list_limit=64" not in current_url:
                    current_url += "&product_list_limit=64"
                page += 1
                time.sleep(random.uniform(2, 4))
            else:
                break

        except Exception as e:
            print(f"Error: {e}")
            break

    return items_count

def run_scraper():
    session = create_robust_session()
    total = 0
    print(f"--- ⚡ Iniciando Barrido Optimizado Coresa ---")
    for cat in URLS_CATEGORIAS:
        total += process_category(session, cat)
    print(f"--- ✅ Finalizado. Total Coresa: {total} ---")

if __name__ == "__main__":
    run_scraper()
