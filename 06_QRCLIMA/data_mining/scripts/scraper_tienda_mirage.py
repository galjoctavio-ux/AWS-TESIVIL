import os
import json
import logging
import time
import random
from datetime import datetime
from pathlib import Path
import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client
from dotenv import load_dotenv

# --- CONFIGURACIÓN ---
PROVIDER_NAME = "Tienda Mirage"
LOG_FILE = 'scraper_tienda_mirage.log'

# Lista de categorías para el análisis de grupos
CATEGORIES = [
    {"name": "Aire Acondicionado", "url": "https://www.tiendamirage.mx/11-aire-acondicionado"},
    {"name": "Refacciones", "url": "https://www.tiendamirage.mx/10-refacciones"}
]

# 1. Configuración de Logs
logging.basicConfig(
    filename=LOG_FILE, 
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# 2. Carga de credenciales
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

def get_normalized_id(sku):
    if not sku or sku == "N/A": return None
    try:
        res = supabase.table("product_catalog").select("id").eq("sku_master", sku).maybe_single().execute()
        return res.data['id'] if res.data else None
    except: return None

def process_category(session, category_info):
    """Procesa una categoría completa de PrestaShop con paginación"""
    category_data = []
    page = 1
    base_cat_url = category_info["url"]
    cat_name = category_info["name"]

    print(f"--> Analizando Categoría: {cat_name}")

    while True:
        current_url = f"{base_cat_url}?page={page}"
        try:
            response = session.get(current_url, timeout=30)
            if response.status_code != 200: break

            soup = BeautifulSoup(response.text, 'html.parser')
            products = soup.select('.product-miniature') or soup.select('.js-product-miniature')

            if not products:
                break

            for p in products:
                try:
                    # Título y Link
                    title_tag = p.select_one('.product-title a') or p.select_one('h2.h3.product-title a')
                    title = title_tag.get_text(strip=True)
                    link = title_tag['href']

                    # Precio con limpieza estándar
                    price_tag = p.select_one('.price') or p.select_one('[itemprop="price"]')
                    price_raw = price_tag.get_text(strip=True) if price_tag else "0"
                    price = float("".join(c for c in price_raw if c.isdigit() or c == '.')) if price_raw != "0" else 0.0

                    # SKU (ID interno de PrestaShop como referencia inicial)
                    sku = p.get('data-id-product') or "N/A"

                    if price > 0:
                        category_data.append({
                            "provider_name": PROVIDER_NAME,
                            "product_title": title,
                            "sku": str(sku),
                            "price": price,
                            "currency": "MXN",
                            "normalized_product_id": get_normalized_id(sku),
                            "created_at": datetime.now().astimezone().isoformat(), # FECHA NORMALIZADA
                            "metadata": {
                                "url": link,
                                "category_hint": cat_name, # Pista para el mapeador (Equipos vs Refacciones)
                                "internal_id": sku,
                                "page_found": page
                            }
                        })
                except Exception: continue

            print(f"    ✅ Pág {page}: {len(products)} productos detectados.")

            # Verificación de paginación
            next_button = soup.select_one('a.next')
            if not next_button or 'disabled' in next_button.get('class', []):
                break
            
            page += 1
            time.sleep(random.uniform(2, 4)) # PrestaShop requiere pausas para evitar bloqueos

        except Exception as e:
            print(f"    ❌ Error en página {page}: {e}")
            break
    
    return category_data

def run_scraper():
    print(f"--- 🌀 Iniciando Scraper Normalizado: {PROVIDER_NAME} ---")
    total_inserted = 0
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'es-MX,es;q=0.9'
    })

    for cat_info in CATEGORIES:
        data = process_category(session, cat_info)
        if data:
            try:
                supabase.table("market_prices_log").insert(data).execute()
                total_inserted += len(data)
                print(f"📤 {len(data)} registros de '{cat_info['name']}' enviados a Supabase.")
            except Exception as e:
                print(f"❌ Error al insertar lote: {e}")

    print(f"--- 🏁 Finalizado. Total Tienda Mirage: {total_inserted} registros ---")

if __name__ == "__main__":
    run_scraper()
