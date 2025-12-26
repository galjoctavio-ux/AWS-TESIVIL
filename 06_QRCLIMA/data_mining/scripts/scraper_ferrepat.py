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
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-MX,es;q=0.9'
    })

    try:
        response = session.get(SEARCH_URL, timeout=30)
        if response.status_code != 200:
            print(f"❌ Error de acceso: {response.status_code}")
            return

        soup = BeautifulSoup(response.text, 'html.parser')
        
        # --- NUEVA LÓGICA DE SELECTORES (Ferrepat 2025) ---
        # Intentamos varios contenedores posibles de productos
        products = soup.select('.item') or \
                   soup.select('.product-item') or \
                   soup.select('.product-thumbnail') or \
                   soup.select('.item-info')

        print(f"   🎯 Detectados {len(products)} productos potenciales.")

        if len(products) == 0:
            print("   ⚠️ No se detectaron productos. Verificando si hay bloqueos...")
            # Si detecta 0, guardamos una muestra del HTML para que puedas revisarlo
            with open("debug_ferrepat.html", "w") as f:
                f.write(response.text[:5000])
            print("   ✅ Archivo 'debug_ferrepat.html' generado para diagnóstico.")
            return

        for p in products:
            try:
                # 1. Título
                # Buscamos el link que contiene el nombre del producto
                title_tag = p.select_one('a.item-name') or p.select_one('.name a') or p.select_one('h2 a')
                if not title_tag: continue
                
                title = title_tag.get_text(strip=True)
                href = title_tag.get('href', '')
                link = href if href.startswith('http') else "https://www.ferrepat.com" + href

                # 2. Precio
                # Ferrepat suele usar '.item-price' o '.price'
                price_tag = p.select_one('.item-price') or p.select_one('.price') or p.select_one('.actual-price')
                if price_tag:
                    price_raw = price_tag.get_text(strip=True)
                    # Extraer solo números y punto
                    price_str = "".join(c for c in price_raw if c.isdigit() or c == '.')
                    price = float(price_str) if price_str else 0.0
                else:
                    price = 0.0

                # 3. SKU
                # A veces el SKU está en un data-attribute o en un texto pequeño
                sku_tag = p.select_one('.item-sku') or p.select_one('.sku') or p.select_one('.code')
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
                        "metadata": {"url": link}
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
            print("✅ Datos de Ferrepat actualizados correctamente.")
        except Exception as e:
            print(f"❌ Error Supabase: {e}")
    else:
        print("Empty: No se extrajeron datos con precio.")

if __name__ == "__main__":
    run_scraper()