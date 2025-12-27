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

# URLs definitivas
URLS_CATEGORIAS = [
    "https://www.grupocoresa.com/equipos-de-aire-acondicionado",
    "https://www.grupocoresa.com/accesorios-y-refacciones/agentes-de-limpieza",
    "https://www.grupocoresa.com/accesorios-y-refacciones/gas-refrigerante",
    "https://www.grupocoresa.com/accesorios-y-refacciones/aislamiento-termico-flexible-para-tuberia",
    "https://www.grupocoresa.com/accesorios-y-refacciones/bombas",
    "https://www.grupocoresa.com/accesorios-y-refacciones/capacitores-transformadores-contactores",
    "https://www.grupocoresa.com/accesorios-y-refacciones/herramientas-y-accesorios-para-instalaciones"
]

# ✅ SELECTORES AJUSTADOS (Más robustos para Magento)
# Quitamos el "li" estricto y buscamos clases contenedoras comunes
SELECTOR_PRODUCTO = '.product-item, .product-item-info, .item.product' 
SELECTOR_TITULO = 'a.product-item-link'
SELECTOR_PRECIO = '.price-box .price, [data-price-type="finalPrice"] .price' 
SELECTOR_PAGINACION_NEXT = 'a.action.next'

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
    # Headers actualizados para parecer un navegador real moderno
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "es-MX,es;q=0.9,en-US;q=0.8,en;q=0.7",
        "Referer": "https://www.google.com/",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1"
    })
    return session

def process_category(session, category_url):
    category_name = category_url.split('/')[-1]
    print(f"📂 Procesando: {category_name}...")
    page = 1
    current_url = category_url
    items_count = 0

    while True:
        try:
            print(f"   📄 Pág {page}: {current_url}")
            response = session.get(current_url, timeout=30)
            
            if response.status_code != 200:
                logging.error(f"Error {response.status_code} en {current_url}")
                break
            
            soup = BeautifulSoup(response.text, 'html.parser')
            products = soup.select(SELECTOR_PRODUCTO)

            # --- DEBUGGING CRÍTICO ---
            if not products and page == 1:
                print("      ⚠️ No se encontraron productos. Guardando HTML de depuración...")
                debug_filename = f"debug_fail_{category_name}.html"
                with open(debug_filename, "w", encoding="utf-8") as f:
                    f.write(response.text)
                print(f"      🛑 Revisa el archivo {debug_filename} para ver qué respondió el servidor.")
                # Si falla la primera página, probablemente falle todo. Rompemos el ciclo.
                break
            # -------------------------

            if not products:
                print("      ⚠️ Fin de lista o estructura no reconocida.")
                break

            batch_data = []
            
            for p in products:
                try:
                    # 1. Título y Link
                    title_elem = p.select_one(SELECTOR_TITULO)
                    # Fallback si no encuentra el título con el selector estándar
                    if not title_elem: 
                        title_elem = p.select_one('a') 
                    
                    if not title_elem: continue
                    
                    raw_title = title_elem.get_text(strip=True)
                    link = title_elem.get('href')

                    # 2. Precio (Limpieza robusta)
                    price_elem = p.select_one(SELECTOR_PRECIO)
                    
                    if not price_elem: continue
                    
                    price_text = price_elem.get_text(strip=True)
                    price_clean = "".join(c for c in price_text if c.isdigit() or c == '.')
                    try:
                        price = float(price_clean)
                    except ValueError:
                        price = 0.0

                    if price <= 1.0: continue

                    # 3. SKU
                    sku_val = None
                    form_tocart = p.select_one('form[data-product-sku]')
                    if form_tocart:
                        sku_val = form_tocart.get('data-product-sku')
                    
                    if not sku_val:
                        input_sku = p.select_one('input[name="product"]')
                        if input_sku: sku_val = input_sku.get('value')

                    if not sku_val and link:
                        sku_val = link.split('/')[-1].replace('.html', '')

                    # Si aún así es nulo, generamos uno temporal basado en título (emergencia)
                    if not sku_val:
                         sku_val = f"UNK-{abs(hash(raw_title))}"

                    sku_provider = f"COR-{sku_val}" 

                    # 4. Construir objeto
                    batch_data.append({
                        "provider_name": PROVIDER_NAME,
                        "sku_provider": sku_provider[:100],
                        "raw_title": raw_title[:500],
                        "price": price,
                        "currency": "MXN",
                        "status": "pending", 
                        "metadata": {
                            "url": link,
                            "category_origin": category_name,
                            "scraped_at": time.time()
                        }
                    })
                except Exception as e:
                    continue

            # Insertar lote
            if batch_data:
                try:
                    # Usamos upsert o insert según prefieras, insert es estándar
                    supabase.table("log_scraper_prices").insert(batch_data).execute()
                    items_count += len(batch_data)
                    print(f"      💾 Guardados {len(batch_data)} productos.")
                except Exception as e:
                    logging.error(f"Error DB en pág {page}: {e}")
            else:
                 print("      ⚠️ Elementos HTML encontrados pero sin datos válidos.")

            # Paginación
            next_btn = soup.select_one(SELECTOR_PAGINACION_NEXT)
            if next_btn and next_btn.get('href'):
                current_url = next_btn['href']
                page += 1
                time.sleep(random.uniform(2.0, 4.0)) 
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