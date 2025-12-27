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

# ✅ CATEGORÍAS QUE PEDISTE
CATEGORIES = [
    {"name": "Aire Acondicionado", "url": "https://www.tiendamirage.mx/11-aire-acondicionado"},
    {"name": "Refacciones", "url": "https://www.tiendamirage.mx/10-refacciones"}
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
    # Headers mejorados para parecer un humano real y evitar bloqueos
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "es-MX,es;q=0.9,en-US;q=0.8,en;q=0.7",
        "Referer": "https://www.google.com/"
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
        print(f"   📄 Procesando pág {page}: {url}")
        
        try:
            response = session.get(url, timeout=30)
            if response.status_code != 200:
                print(f"      ⛔ Fin o Error {response.status_code}")
                break
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Selectores combinados (PrestaShop estándar + variaciones)
            products = soup.select('.product-miniature') or \
                       soup.select('.js-product-miniature') or \
                       soup.select('article.product-miniature')
            
            if not products:
                # Debug: Si es la página 1 y no hay productos, algo raro pasa
                if page == 1:
                    print("      ⚠️ Alerta: No se encontraron productos en la página 1. Posible cambio de diseño o bloqueo.")
                else:
                    print("      ✅ Fin de la paginación.")
                break
            
            batch_data = []

            for p in products:
                try:
                    # 1. Título y Enlace
                    title_tag = p.select_one('.product-title a') or \
                                p.select_one('h3.product-title a') or \
                                p.select_one('h2.product-title a')
                    
                    if not title_tag: continue
                    
                    raw_title = title_tag.get_text(strip=True)
                    link = title_tag['href']
                    
                    # 2. Precio (Limpieza robusta del script antiguo)
                    price_tag = p.select_one('.price') or \
                                p.select_one('[itemprop="price"]') or \
                                p.select_one('.product-price')
                                
                    if not price_tag: continue
                    
                    price_text = price_tag.get_text(strip=True)
                    # Extraer solo números y puntos
                    price_clean = "".join(c for c in price_text if c.isdigit() or c == '.')
                    try:
                        price = float(price_clean)
                    except:
                        price = 0.0
                    
                    if price <= 1.0: continue # Ignorar precios 0 o erróneos

                    # 3. SKU / ID Interno
                    sku_val = p.get('data-id-product')
                    if not sku_val:
                        # Fallback: intentar sacar el ID del input hidden si existe
                        input_id = p.select_one('input[name="id_product"]')
                        if input_id: sku_val = input_id['value']
                    
                    if not sku_val:
                         # Último recurso: URL slug
                        sku_val = link.split('/')[-1].replace('.html', '')[:20]
                    
                    sku_provider = f"MIR-{sku_val}"

                    # 4. Objeto Nuevo (Esquema log_scraper_prices)
                    item = {
                        "provider_name": PROVIDER_NAME,
                        "sku_provider": sku_provider[:100],
                        "raw_title": raw_title[:500],
                        "price": price,
                        "currency": "MXN",
                        "status": "pending", 
                        "metadata": {
                            "url": link,
                            "category_original": cat_name,
                            "internal_id": sku_val,
                            "scraped_at": time.time()
                        }
                    }
                    batch_data.append(item)

                except Exception as e:
                    continue

            # Insertar lote
            if batch_data:
                try:
                    supabase.table("log_scraper_prices").insert(batch_data).execute()
                    count = len(batch_data)
                    total_items += count
                    print(f"      💾 Guardados {count} productos.")
                except Exception as e:
                    logging.error(f"Error DB: {e}")
            else:
                print("      ⚠️ Se encontraron contenedores pero no se pudo extraer info válida.")

            # Paginación: Buscar botón "Siguiente"
            next_btn = soup.select_one('a.next') or soup.select_one('a.js-search-link.next')
            
            # Verificar si tiene clase disabled
            if not next_btn or 'disabled' in next_btn.get('class', []):
                print("      ✅ Última página alcanzada.")
                break
            
            page += 1
            # Pausa humana (PrestaShop es sensible a ráfagas)
            time.sleep(random.uniform(2.0, 4.0))

        except Exception as e:
            logging.error(f"Error crítico en pág {page}: {e}")
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