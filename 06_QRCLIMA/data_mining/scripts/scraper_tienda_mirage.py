import os
import time
import logging
import random
from pathlib import Path
import requests
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from supabase import create_client, Client
from dotenv import load_dotenv

# --- CONFIGURACIÓN ---
PROVIDER_NAME = "Tienda Mirage"
LOG_FILE = 'scraper_tienda_mirage.log'

# TUS CATEGORÍAS ORIGINALES (PrestaShop)
CATEGORIES = [
    {"name": "Aire Acondicionado", "url": "https://www.tiendamirage.mx/11-aire-acondicionado"},
   # {"name": "Refacciones", "url": "https://www.tiendamirage.mx/10-refacciones"}
]

# 1. Logging
logging.basicConfig(
    filename=LOG_FILE, 
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# 2. Credenciales
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

def process_category(session, category_info):
    base_url = category_info["url"]
    cat_name = category_info["name"]
    print(f"📂 Escaneando: {cat_name}...")
    
    total_items = 0
    page = 1
    
    while True:
        url = f"{base_url}?page={page}"
        print(f"   📄 Procesando pág {page}...")
        
        try:
            response = session.get(url, timeout=30)
            if response.status_code != 200:
                print(f"      Fin o Error {response.status_code}")
                break
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Selectores PrestaShop (Detectados de tu archivo original)
            products = soup.select('.product-miniature') or soup.select('.js-product-miniature')
            
            if not products:
                print("      No se encontraron más productos.")
                break
            
            batch_data = []

            for p in products:
                try:
                    # 1. Título y Enlace
                    title_tag = p.select_one('.product-title a') or p.select_one('h2.h3.product-title a')
                    if not title_tag: continue
                    
                    raw_title = title_tag.get_text(strip=True)
                    link = title_tag['href']
                    
                    # 2. Precio (Limpieza robusta)
                    price_tag = p.select_one('.price') or p.select_one('[itemprop="price"]')
                    if not price_tag: continue
                    
                    # Limpieza: "$ 1,234.56" -> 1234.56
                    price_text = price_tag.get_text(strip=True)
                    price = float("".join(c for c in price_text if c.isdigit() or c == '.'))
                    
                    if price <= 1.0: continue

                    # 3. SKU / ID Interno
                    # En PrestaShop, el ID suele estar en 'data-id-product'
                    sku_val = p.get('data-id-product')
                    if not sku_val:
                        # Fallback: slug de la URL
                        sku_val = link.split('/')[-1].replace('.html', '')
                    
                    sku_provider = f"MIR-{sku_val}" # Prefijo para evitar colisiones

                    # 4. Objeto Nuevo (Compatible con IA)
                    item = {
                        "provider_name": PROVIDER_NAME,
                        "sku_provider": sku_provider[:100],
                        "raw_title": raw_title[:500],
                        "price": price,
                        "currency": "MXN",
                        "status": "pending",  # <--- SEÑAL PARA IA
                        "metadata": {
                            "url": link,
                            "category_original": cat_name,
                            "internal_id": sku_val
                        }
                    }
                    batch_data.append(item)

                except Exception as e:
                    continue

            # Insertar lote
            if batch_data:
                try:
                    supabase.table("market_prices_log").insert(batch_data).execute()
                    total_items += len(batch_data)
                    print(f"      💾 Guardados {len(batch_data)} ítems.")
                except Exception as e:
                    logging.error(f"Error DB: {e}")
            
            # Paginación (Botón 'Siguiente')
            next_btn = soup.select_one('a.next')
            if not next_btn or 'disabled' in next_btn.get('class', []):
                break
            
            page += 1
            time.sleep(random.uniform(1.5, 3.0))

        except Exception as e:
            logging.error(f"Error en pág {page}: {e}")
            break
            
    return total_items

def run_scraper():
    session = create_robust_session()
    total = 0
    print(f"🚀 Iniciando Scraper {PROVIDER_NAME}...")
    
    for cat in CATEGORIES:
        total += process_category(session, cat)
        
    print(f"\n🏁 Finalizado {PROVIDER_NAME}. Total insertados: {total}")

if __name__ == "__main__":
    run_scraper()