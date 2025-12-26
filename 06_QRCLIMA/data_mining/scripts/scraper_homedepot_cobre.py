import os
import logging
import time
import random
import json
from datetime import datetime
from pathlib import Path
import cloudscraper
from bs4 import BeautifulSoup
from supabase import create_client, Client
from dotenv import load_dotenv

# --- CONFIGURACIÓN ---
PROVIDER_NAME = "Home Depot"
LOG_FILE = 'scraper_homedepot.log'

# Las 3 URLs de cobre que quieres monitorear
URLS_COBRE = [
    "https://www.homedepot.com.mx/p/cluxer-tuberia-de-cobre-flexible-3-8-5mts-cluxer-134885",
    "https://www.homedepot.com.mx/p/cluxer-tuberia-de-cobre-flexible-1-2-pulgada-5-m-cxtcf5-1-2-134880",
    "https://www.homedepot.com.mx/p/coflex-tubo-de-cobre-flexible-de-3-8-de-pulgada-x-2-m-bronce-iusa-625300"
]

logging.basicConfig(filename=LOG_FILE, level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
load_dotenv()

supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

def run_scraper():
    print(f"--- 🌀 Iniciando Scraper: {PROVIDER_NAME} (Targeted Cobre) ---")
    
    # Cloudscraper ayuda a saltar el reto inicial de Akamai/Cloudflare
    scraper = cloudscraper.create_scraper(
        browser={'browser': 'chrome', 'platform': 'windows', 'mobile': False}
    )
    
    all_data = []

    for url in URLS_COBRE:
        try:
            print(f"🔍 Extrayendo: {url.split('/')[-1][:30]}...")
            response = scraper.get(url, timeout=30)
            
            if response.status_code != 200:
                print(f"    ⚠️ Error {response.status_code}. Home Depot bloqueó la petición.")
                continue

            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Home Depot guarda casi todo en un JSON-LD o en un script de estado
            # Intentamos extraer del JSON-LD que es más estable
            script_data = soup.find('script', type='application/ld+json')
            if not script_data:
                continue
                
            json_info = json.loads(script_data.string)
            
            # Si el JSON-LD es una lista, buscamos el objeto Product
            if isinstance(json_info, list):
                product_info = next((item for item in json_info if item.get('@type') == 'Product'), {})
            else:
                product_info = json_info

            title = product_info.get('name', 'Tubo de Cobre')
            sku = product_info.get('sku') or product_info.get('mpn') or "HD-GEN"
            
            # El precio suele estar en la sección 'offers'
            price = 0.0
            offers = product_info.get('offers', {})
            if isinstance(offers, dict):
                price = float(offers.get('price', 0))
            elif isinstance(offers, list):
                price = float(offers[0].get('price', 0))

            if price > 0:
                all_data.append({
                    "provider_name": PROVIDER_NAME,
                    "product_title": title,
                    "sku": str(sku),
                    "price": price,
                    "currency": "MXN",
                    "created_at": datetime.now().astimezone().isoformat(),
                    "metadata": {
                        "url": url,
                        "brand": product_info.get('brand', {}).get('name', 'Genérico'),
                        "manual_category_hint": "Cobre",
                        "product_type": "Tubería Flexible",
                        "source": "Targeted Scan"
                    }
                })
                print(f"    ✅ Capturado: ${price}")

            # Pausa larga para evitar baneo de IP (Home Depot es sensible)
            time.sleep(random.uniform(5, 10))

        except Exception as e:
            print(f"    ❌ Error: {e}")

    # Inserción
    if all_data:
        print(f"📤 Enviando {len(all_data)} precios de Home Depot a Supabase...")
        try:
            supabase.table("market_prices_log").insert(all_data).execute()
            print("✅ ¡Listo!")
        except Exception as e:
            print(f"❌ Error Supabase: {e}")

if __name__ == "__main__":
    run_scraper()
