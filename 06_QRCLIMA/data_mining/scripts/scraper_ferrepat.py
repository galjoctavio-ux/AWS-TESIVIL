import os
import logging
import time
import random
from datetime import datetime
from pathlib import Path
import cloudscraper  # <--- CAMBIO AQUÍ
from bs4 import BeautifulSoup
from supabase import create_client, Client
from dotenv import load_dotenv

# --- CONFIGURACIÓN ---
PROVIDER_NAME = "Ferrepat"
LOG_FILE = 'scraper_ferrepat.log'
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
    print(f"--- Iniciando Scraper {PROVIDER_NAME} (Cloudscraper Mode) ---")
    all_extracted_data = []
    
    # --- CAMBIO CLAVE AQUÍ ---
    # Creamos un scraper que imita un navegador real y salta protecciones
    scraper = cloudscraper.create_scraper(
        browser={
            'browser': 'chrome',
            'platform': 'windows',
            'mobile': False
        }
    )

    try:
        # Usamos el scraper en lugar de requests.Session()
        response = scraper.get(SEARCH_URL, timeout=30)
        
        if response.status_code != 200:
            print(f"❌ Error de acceso: {response.status_code}")
            return

        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Selectores actualizados para la estructura de Ferrepat
        # En Ferrepat los productos suelen estar en 'div.product-list-item' o '.item'
        products = soup.select('.item') or soup.select('.product-list-item') or soup.select('.product-thumbnail')

        print(f"   🎯 Detectados {len(products)} productos potenciales.")

        for p in products:
            try:
                # Título
                title_tag = p.select_one('.item-name') or p.select_one('.product-name') or p.select_one('h2')
                if not title_tag: continue
                title = title_tag.get_text(strip=True)

                # Precio
                price_tag = p.select_one('.item-price') or p.select_one('.price')
                if price_tag:
                    price_raw = price_tag.get_text(strip=True)
                    price_str = "".join(c for c in price_raw if c.isdigit() or c == '.')
                    price = float(price_str) if price_str else 0.0
                else:
                    price = 0.0

                # SKU
                sku_tag = p.select_one('.item-sku') or p.select_one('.sku')
                sku = "N/A"
                if sku_tag:
                    sku = sku_tag.get_text(strip=True).replace('Código:', '').replace('SKU:', '').strip()

                if price > 0:
                    all_extracted_data.append({
                        "provider_name": PROVIDER_NAME,
                        "product_title": title,
                        "sku": sku,
                        "price": price,
                        "currency": "MXN",
                        "normalized_product_id": get_normalized_id(sku),
                        "metadata": {"url": SEARCH_URL} # Ferrepat usa AJAX para links a veces
                    })
            except Exception:
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
        print("⚠️ No se extrajeron datos. El sitio sigue bloqueando la petición.")

if __name__ == "__main__":
    run_scraper()