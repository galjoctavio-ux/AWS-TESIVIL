import os
import time
import logging
import random
from datetime import datetime
from pathlib import Path
import requests
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from supabase import create_client, Client
from dotenv import load_dotenv

# --- CONFIGURACIÓN ---
PROVIDER_NAME = "Grupo Coresa"
LOG_FILE = 'scraper_coresa.log'

# URLs de categorías a escanear
URLS_CATEGORIAS = [
    "https://www.grupocoresa.com/equipos-de-aire-acondicionado",
    "https://www.grupocoresa.com/accesorios-y-refacciones/agentes-de-limpieza",
    "https://www.grupocoresa.com/accesorios-y-refacciones/gas-refrigerante",
    "https://www.grupocoresa.com/accesorios-y-refacciones/aislamiento-termico-flexible-para-tuberia",
    "https://www.grupocoresa.com/accesorios-y-refacciones/bombas",
    "https://www.grupocoresa.com/accesorios-y-refacciones/capacitores-transformadores-contactores",
    "https://www.grupocoresa.com/accesorios-y-refacciones/herramientas-y-accesorios-para-instalaciones"
]

# Selectores (Ajustados a la estructura actual de Coresa)
SELECTOR_PRODUCTO = 'div.product-item'
SELECTOR_TITULO = 'h5.product-item-title a'
SELECTOR_PRECIO = 'span.product-item-price' # A veces cambia, validamos abajo
SELECTOR_PAGINACION_NEXT = 'li.page-item.next a'

# 1. Logging
logging.basicConfig(
    filename=LOG_FILE, 
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# 2. Credenciales y Supabase
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
    retry = Retry(total=5, backoff_factor=2, status_forcelist=[429, 500, 502, 503, 504])
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    })
    return session

def process_category(session, category_url):
    print(f"📂 Procesando categoría: {category_url.split('/')[-1]}...")
    page = 1
    current_url = category_url
    items_count = 0

    while True:
        try:
            response = session.get(current_url, timeout=20)
            if response.status_code != 200:
                logging.error(f"Error {response.status_code} en {current_url}")
                break
            
            soup = BeautifulSoup(response.text, 'html.parser')
            products = soup.select(SELECTOR_PRODUCTO)

            if not products:
                print("   ⚠️ No se encontraron productos (o fin de lista).")
                break

            batch_data = []
            
            for p in products:
                # Extraer Título y Link
                title_elem = p.select_one(SELECTOR_TITULO)
                if not title_elem: continue
                
                title = title_elem.get_text(strip=True)
                link_href = title_elem.get('href')
                link = link_href if link_href.startswith('http') else f"https://www.grupocoresa.com{link_href}"

                # Extraer Precio (Limpieza robusta)
                price_elem = p.select_one(SELECTOR_PRECIO)
                if not price_elem: continue
                
                price_str = price_elem.get_text(strip=True).replace('$', '').replace(',', '').replace('MXN', '')
                try:
                    price = float(price_str)
                except ValueError:
                    continue # Saltamos si no es un número válido

                # Extraer SKU (Lógica mejorada)
                # Coresa a veces no muestra SKU en el grid. Usamos el slug de la URL como fallback.
                sku = None
                sku_elem = p.select_one('.product-item-sku') # Selector hipotético común
                if sku_elem:
                    sku = sku_elem.get_text(strip=True)
                
                if not sku:
                    # Fallback: Usar la última parte de la URL como ID único
                    # Ejemplo: .../minisplit-mirage-x3 -> minisplit-mirage-x3
                    sku = link.split('/')[-1]

                # Construir objeto para Supabase
                batch_data.append({
                    "provider_name": PROVIDER_NAME,
                    "sku_provider": sku[:100],  # Columna NUEVA
                    "raw_title": title[:500],   # Columna NUEVA
                    "price": price,
                    "currency": "MXN",
                    "status": "pending",        # <--- LA SEÑAL PARA LA IA
                    "metadata": {
                        "url": link,
                        "category_origin": category_url.split('/')[-1]
                    }
                })

            # Insertar lote
            if batch_data:
                try:
                    supabase.table("market_prices_log").insert(batch_data).execute()
                    items_count += len(batch_data)
                    print(f"   💾 Pág {page}: Guardados {len(batch_data)} productos.")
                except Exception as e:
                    logging.error(f"Error DB en pág {page}: {e}")

            # Paginación
            next_btn = soup.select_one(SELECTOR_PAGINACION_NEXT)
            if next_btn and next_btn.get('href'):
                current_url = next_btn['href']
                page += 1
                time.sleep(random.uniform(1.5, 3.0)) # Pausa ética
            else:
                break

        except Exception as e:
            logging.error(f"Error crítico en loop: {e}")
            break

    return items_count

def run_scraper():
    session = create_robust_session()
    total = 0
    print(f"🚀 Iniciando Scraper {PROVIDER_NAME}...")
    
    for cat in URLS_CATEGORIAS:
        total += process_category(session, cat)
        
    print(f"\n🏁 Finalizado {PROVIDER_NAME}. Total insertados: {total}")

if __name__ == "__main__":
    run_scraper()