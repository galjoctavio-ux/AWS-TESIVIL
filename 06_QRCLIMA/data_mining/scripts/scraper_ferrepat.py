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
PROVIDER_NAME = "Ferrepat"
LOG_FILE = 'scraper_ferrepat.log'
# URL de la búsqueda específica
SEARCH_URL = "https://www.ferrepat.com/tienda?search=tubo%20cobre%20flexible"

logging.basicConfig(filename=LOG_FILE, level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
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
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
    })

    try:
        response = session.get(SEARCH_URL, timeout=30)
        if response.status_code != 200:
            print(f"❌ Error de acceso: {response.status_code}")
            return

        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Selectores específicos para la cuadrícula de Ferrepat
        # Buscamos los contenedores de productos
        products = soup.select('.item-info') or soup.select('.product-item')

        print(f"   🎯 Detectados {len(products)} productos en los resultados.")

        for p in products:
            try:
                # 1. Título
                title_tag = p.select_one('.item-name a') or p.select_one('.name a')
                title = title_tag.get_text(strip=True)
                link = "https://www.ferrepat.com" + title_tag['href'] if title_tag else ""

                # 2. Precio
                # Ferrepat a veces tiene precio de oferta y precio de lista
                price_tag = p.select_one('.item-price') or p.select_one('.price')
                if price_tag:
                    price_raw = price_tag.get_text(strip=True)
                    # Limpiamos todo lo que no sea número o punto (ej. quita "$", "MXN", "IVA")
                    price_str = "".join(c for c in price_raw if c.isdigit() or c == '.')
                    price = float(price_str)
                else:
                    price = 0.0

                # 3. SKU (En Ferrepat suele estar visible como 'Código' o 'SKU')
                sku_tag = p.select_one('.item-sku') or p.select_one('.sku')
                sku = sku_tag.get_text(strip=True).replace('Código:', '').strip() if sku_tag else "N/A"

                if price > 0:
                    all_extracted_data.append({
                        "provider_name": PROVIDER_NAME,
                        "product_title": title,
                        "sku": sku,
                        "price": price,
                        "currency": "MXN",
                        "normalized_product_id": get_normalized_id(sku),
                        "metadata": {
                            "url": link,
                            "raw_price": price_raw
                        }
                    })
            except Exception as e:
                continue

    except Exception as e:
        print(f"❌ Error crítico: {e}")

    # Inserción en Supabase
    if all_extracted_data:
        print(f"📤 Enviando {len(all_extracted_data)} productos a Supabase...")
        try:
            supabase.table("market_prices_log").insert(all_extracted_data).execute()
            print("✅ Datos de Ferrepat actualizados.")
        except Exception as e:
            print(f"❌ Error Supabase: {e}")
    else:
        print("Empty: No se encontraron productos con precio.")

if __name__ == "__main__":
    run_scraper()