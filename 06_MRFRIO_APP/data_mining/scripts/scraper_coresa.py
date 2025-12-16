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
from filtros import es_minisplit_coresa

# --- CONFIGURACIÓN ESPECÍFICA ---
PROVIDER_NAME = "Grupo Coresa"
LOG_FILE = 'scraper_coresa.log'

# URLs Principales extraídas de su menú de navegación
URLS_CATEGORIAS = [
    "https://www.grupocoresa.com/equipos-de-aire-acondicionado",
    "https://www.grupocoresa.com/accesorios-y-refacciones",
    "https://www.grupocoresa.com/equipos-de-refrigeracion",
    "https://www.grupocoresa.com/equipos-de-ventilacion",
    "https://www.grupocoresa.com/equipos-de-linea-blanca",
    "https://www.grupocoresa.com/herramientas-y-accesorios-para-instalaciones",
    "https://www.grupocoresa.com/industria-y-construccion"
]

# SELECTORES MAGENTO 2 (Confirmados con tu HTML)
SELECTOR_PRODUCTO = 'li.product-item'
SELECTOR_TITULO = 'a.product-item-link'
SELECTOR_PRECIO = '.price-box .price' 
SELECTOR_PAGINACION_NEXT = 'a.action.next'

# --------------------------------

logging.basicConfig(
    filename=LOG_FILE, 
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s'
)

load_dotenv()

# Validación de entorno
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Faltan credenciales en .env")
    exit()

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def create_robust_session():
    session = requests.Session()
    retry = Retry(
        total=4, 
        backoff_factor=2, 
        status_forcelist=[500, 502, 503, 504],
        allowed_methods=["GET"]
    )
    session.mount("https://", HTTPAdapter(max_retries=retry))
    # User-Agent real de Chrome para evitar bloqueos simples
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-MX,es;q=0.9,en-US;q=0.8,en;q=0.7'
    })
    return session

def clean_price(price_str):
    """Convierte '$11,073.82' a 11073.82"""
    if not price_str: return 0.0
    # Eliminar $, MXN, comas y espacios
    clean = price_str.replace('$', '').replace(',', '').replace('MXN', '').strip()
    try:
        return float(clean)
    except ValueError:
        return 0.0

def process_category(session, category_url):
    page = 1
    items_count = 0
    current_url = category_url
    
    print(f"--> Iniciando categoría: {category_url}")

    while True:
        try:
            print(f"    Escaneando Pag {page}...")
            response = session.get(current_url, timeout=30)
            
            if response.status_code == 404:
                print("    Error 404 - Fin de categoría.")
                break
                
            soup = BeautifulSoup(response.text, 'html.parser')
            products = soup.select(SELECTOR_PRODUCTO)
            
            if not products:
                print("    No se encontraron productos. Fin o Bloqueo.")
                # Si es página 1 y no hay productos, es sospechoso (posible cambio de diseño)
                if page == 1:
                    logging.warning(f"Pagina 1 vacía en {category_url}")
                break

            batch_data = []
            for p in products:
                try:
                    # 1. Título y Link
                    tag_titulo = p.select_one(SELECTOR_TITULO)
                    if not tag_titulo: continue # Si no tiene título, saltamos
                    
                    title = tag_titulo.get_text(strip=True)
                    if not es_minisplit_coresa(title):
                        continue
                    link = tag_titulo.get('href', category_url)

                    # 2. Precio
                    # Magento a veces muestra "Precio especial" y "Precio antiguo".
                    # El selector .price-box .price suele agarrar el primero visible.
                    tag_precio = p.select_one(SELECTOR_PRECIO)
                    price_raw = tag_precio.get_text(strip=True) if tag_precio else "0"
                    price = clean_price(price_raw)

                    # 3. SKU (A veces Magento lo pone en un atributo data-product-sku en el form)
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
                                "category_source": category_url
                            }
                        })
                except Exception as e:
                    continue

            # Insertar lote en Supabase
            if batch_data:
                supabase.table("market_prices_log").insert(batch_data).execute()
                items_count += len(batch_data)
                print(f"    Insertados {len(batch_data)} productos.")
            
            # --- PAGINACIÓN ---
            # Buscamos el botón "Siguiente" en el HTML actual
            next_btn = soup.select_one(SELECTOR_PAGINACION_NEXT)
            if next_btn and next_btn.get('href'):
                current_url = next_btn['href'] # Magento da la URL completa, usamos esa
                page += 1
                # Pausa aleatoria para parecer humano (Coresa es más estricto que Shopify)
                time.sleep(random.uniform(2, 5)) 
            else:
                print("    No hay botón 'Siguiente'. Fin de categoría.")
                break

        except Exception as e:
            logging.error(f"Error crítico en {current_url}: {e}")
            print(f"Error: {e}")
            break
            
    return items_count

def run_scraper():
    session = create_robust_session()
    total_products = 0
    
    msg = f"--- Iniciando Scraper Coresa: {datetime.now()} ---"
    print(msg)
    logging.info(msg)

    for cat in URLS_CATEGORIAS:
        total_products += process_category(session, cat)

    msg_end = f"--- Finalizado Coresa. Total recolectado: {total_products} ---"
    print(msg_end)
    logging.info(msg_end)

if __name__ == "__main__":
    run_scraper()