import os
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
BASE_URL = "https://www.tiendamirage.mx/11-aire-acondicionado"

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
    print("❌ FATAL: No se encontraron las credenciales en .env")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_normalized_id(sku):
    if not sku or sku == "N/A": return None
    try:
        res = supabase.table("product_catalog").select("id").eq("sku_master", sku).maybe_single().execute()
        return res.data['id'] if res.data else None
    except: return None

def run_scraper():
    print(f"--- Iniciando Scraper {PROVIDER_NAME} ---")
    all_extracted_data = []
    page = 1
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })

    while True:
        url_con_pagina = f"{BASE_URL}?page={page}"
        print(f"Escaneando: {url_con_pagina}")
        
        try:
            response = session.get(url_con_pagina, timeout=20)
            if response.status_code != 200: break
            
            soup = BeautifulSoup(response.text, 'html.parser')
            # En PrestaShop los productos suelen estar en artículos con clase 'product-miniature'
            products = soup.select('article.product-miniature')

            if not products:
                print("🏁 Fin de productos o página vacía.")
                break

            for p in products:
                # 1. Título
                title_tag = p.select_one('.product-title a')
                title = title_tag.get_text(strip=True) if title_tag else "N/A"
                link = title_tag['href'] if title_tag else ""

                # 2. Precio (Buscamos la clase 'price')
                price_tag = p.select_one('.price')
                price_raw = price_tag.get_text(strip=True) if price_tag else "0"
                # Limpiar precio: "$10,500.00" -> 10500.00
                price = float(price_raw.replace('$', '').replace(',', '').strip())

                # 3. SKU (En Tienda Mirage suele estar en data-id-product o una referencia interna)
                # Intentamos sacar la referencia que es más parecida al SKU master
                sku = p.get('data-id-product', 'N/A')
                
                if price > 0:
                    all_extracted_data.append({
                        "provider_name": PROVIDER_NAME,
                        "product_title": title,
                        "sku": str(sku), # Nota: Podrías necesitar mapear esto si tus SKUs son distintos
                        "price": price,
                        "currency": "MXN",
                        "normalized_product_id": get_normalized_id(sku),
                        "metadata": {
                            "url": link,
                            "source_page": page
                        }
                    })

            # Verificar si existe el botón "Siguiente"
            next_button = soup.select_one('a.next')
            if not next_button or 'disabled' in next_button.get('class', []):
                break
            
            page += 1
            time.sleep(random.uniform(2, 4)) # PrestaShop es más sensible a ráfagas

        except Exception as e:
            print(f"❌ Error: {e}")
            break

    # 2. INSERCIÓN
    if all_extracted_data:
        print(f"📤 Insertando {len(all_extracted_data)} registros en Supabase...")
        try:
            supabase.table("market_prices_log").insert(all_extracted_data).execute()
            print("✅ Hecho.")
        except Exception as e:
            print(f"❌ Error Supabase: {e}")

if __name__ == "__main__":
    run_scraper()
