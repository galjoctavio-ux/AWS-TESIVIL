import os
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
# URL semilla para empezar (ej: listado general o categorías)
START_URL = f"{BASE_URL}/productos/"

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
    """Extrae datos de una página de detalle de producto."""
    try:
        response = session.get(url, timeout=15)
        if response.status_code != 200:
            return None
        
        soup = BeautifulSoup(response.text, 'html.parser')

        # 1. Título (Ajusta el selector según el sitio real)
        title_tag = soup.select_one('h1') or soup.select_one('.product_title')
        if not title_tag: 
            return None
        raw_title = title_tag.get_text(strip=True)

        # 2. Precio
        price_tag = soup.select_one('.price') or soup.select_one('.current-price') or soup.select_one('span.money')
        if not price_tag:
            return None
        
        price_text = price_tag.get_text(strip=True).replace('$', '').replace(',', '').replace('MXN', '')
        try:
            price = float(price_text)
        except ValueError:
            return None # Si no hay precio numérico, no nos sirve

        # 3. SKU (Búsqueda inteligente)
        # Intenta buscar selectores comunes de SKU, si falla, usa el slug de la URL
        sku_provider = None
        sku_tag = soup.select_one('.sku') or soup.select_one('span[itemprop="sku"]')
        if sku_tag:
            sku_provider = sku_tag.get_text(strip=True)
        else:
            # Fallback: Usar el slug de la URL como ID único
            sku_provider = url.split('/')[-1].split('?')[0]

        # 4. Construir objeto para Supabase
        return {
            "provider_name": PROVIDER_NAME,
            "sku_provider": sku_provider[:100], # Limitar largo
            "raw_title": raw_title[:500],
            "price": price,
            "currency": "MXN",
            "status": "pending", # <--- ESTO ACTIVA LA IA
            "metadata": {
                "url": url,
                "scraped_at": time.time()
            }
        }

    except Exception as e:
        logging.error(f"Error scrapeando {url}: {e}")
        return None

def fetch_and_store():
    session = create_robust_session()
    print(f"🚀 Iniciando Scraper {PROVIDER_NAME}...")
    
    page = 1
    total_inserted = 0
    
    # NUEVO: Variable para guardar los links de la página anterior
    previous_page_links = []

    while True:
        list_url = f"{START_URL}?page={page}"
        print(f"📄 Escaneando listado: {list_url}")
        
        try:
            response = session.get(list_url, timeout=20)
            # Algunos sitios redirigen a la home cuando la paginación acaba
            if response.status_code != 200 or response.url == BASE_URL:
                print("   ⛔ Fin de paginación (Status code o Redirección).")
                break
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # --- DETECCIÓN DE PÁGINA VACÍA POR TEXTO (OPCIONAL PERO ÚTIL) ---
            body_text = soup.get_text().lower()
            if "no se encontraron productos" in body_text or "no products found" in body_text:
                print("   ⛔ Texto de 'No resultados' encontrado.")
                break

            product_links = []
            for a in soup.find_all('a', href=True):
                href = a['href']
                if '/productos/' in href and href.count('/') > 2: 
                    full_link = href if href.startswith('http') else f"{BASE_URL}{href}"
                    # Limpieza básica para evitar duplicados por query params (ej: ?v=123)
                    clean_link = full_link.split('?')[0]
                    if clean_link not in product_links:
                        product_links.append(clean_link)

            # Ordenamos para asegurar que la comparación de listas sea exacta
            product_links.sort()

            if not product_links:
                print("⚠️ No se encontraron productos en esta página. Terminando.")
                break

            # --- CORRECCIÓN PRINCIPAL: DETECCIÓN DE BUCLE ---
            # Si los enlaces de esta página son IGUALES a los de la anterior, estamos en bucle
            if product_links == previous_page_links:
                print("   🔄 Bucle detectado: La página actual tiene los mismos productos que la anterior.")
                print("   ⛔ Deteniendo scraper para evitar duplicados infinitos.")
                break
            
            # Actualizamos el registro de la página anterior
            previous_page_links = product_links

            print(f"   Encontrados {len(product_links)} enlaces únicos. Procesando...")

            batch_data = []
            for link in product_links:
                # Pequeña optimización: no volver a scrapear si ya lo procesaste en el loop anterior
                # (Aunque el check de arriba ya previene esto, es doble seguridad)
                data = scrape_product_detail(session, link)
                if data:
                    batch_data.append(data)
                time.sleep(random.uniform(0.5, 1.0)) 

            if batch_data:
                try:
                    # Usamos upsert o insert. Si el SKU ya existe, esto podría duplicar filas
                    # dependiendo de tu esquema en Supabase.
                    # Idealmente en el futuro usar upsert basado en SKU + Provider
                    supabase.table("market_prices_log").insert(batch_data).execute()
                    count = len(batch_data)
                    total_inserted += count
                    print(f"   💾 Guardados {count} productos nuevos.")
                except Exception as e:
                    print(f"   ❌ Error al guardar en DB: {e}")

            page += 1
            # Reduje el límite de seguridad a 40 ya que vimos que muere antes
            if page > 40: 
                print("   🛡️ Límite de seguridad de páginas alcanzado.")
                break

        except Exception as e:
            print(f"❌ Error general en página {page}: {e}")
            break

    print(f"\n🏁 {PROVIDER_NAME} Finalizado. Total: {total_inserted}")

if __name__ == "__main__":
    fetch_and_store()