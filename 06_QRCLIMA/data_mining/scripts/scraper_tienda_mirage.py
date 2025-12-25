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
# Aseguramos que la URL termine en diagonal para evitar redirecciones
BASE_URL = "https://www.tiendamirage.mx/11-aire-acondicionado"

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
    page = 1
    
    session = requests.Session()
    # Headers más completos para imitar un navegador real
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-MX,es;q=0.9',
        'Connection': 'keep-alive',
    })

    while True:
        # PrestaShop acepta ?page=X o ?p=X. Probaremos con page.
        current_url = f"{BASE_URL}?page={page}"
        print(f"Escaneando: {current_url}")
        
        try:
            response = session.get(current_url, timeout=30)
            if response.status_code != 200:
                print(f"❌ Error de servidor: {response.status_code}")
                break
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # --- NUEVOS SELECTORES ---
            # PrestaShop 1.7+ usa estas clases
            products = soup.find_all('article', class_='product-miniature') or \
                       soup.select('.product-miniature') or \
                       soup.select('.js-product-miniature')

            if not products:
                print("⚠️ No se encontraron productos con los selectores actuales.")
                # Debug: Guardar un pedazo del HTML para revisar si estamos bloqueados
                with open("debug_mirage.html", "w") as f:
                    f.write(response.text[:2000])
                print("   Se guardó 'debug_mirage.html' para inspección.")
                break

            print(f"   🎯 Detectados {len(products)} productos.")

            for p in products:
                try:
                    # Título y Link
                    title_tag = p.select_one('.product-title a') or p.select_one('h2.h3.product-title a')
                    title = title_tag.get_text(strip=True)
                    link = title_tag['href']

                    # Precio
                    price_tag = p.select_one('.price') or p.select_one('[itemprop="price"]')
                    if price_tag:
                        price_raw = price_tag.get_text(strip=True)
                        # Limpieza profunda: quitar $, comas, espacios y letras
                        price_str = "".join(c for c in price_raw if c.isdigit() or c == '.')
                        price = float(price_str)
                    else:
                        price = 0.0

                    # SKU / Referencia
                    # En Tienda Mirage, el SKU suele venir en un atributo de datos
                    sku = p.get('data-id-product') or "N/A"
                    
                    if price > 0:
                        all_extracted_data.append({
                            "provider_name": PROVIDER_NAME,
                            "product_title": title,
                            "sku": str(sku),
                            "price": price,
                            "currency": "MXN",
                            "normalized_product_id": get_normalized_id(sku),
                            "metadata": {"url": link, "page": page}
                        })
                except Exception as e:
                    continue

            # Paginación: Buscar el link de "Siguiente"
            next_page_link = soup.select_one('a.next.js-search-link') or \
                             soup.select_one('a[rel="next"]')
            
            if next_page_link and next_page_link.get('href') and 'page=' in next_page_link['href']:
                page += 1
                time.sleep(random.uniform(2, 5))
            else:
                print("🏁 No se detectó botón de siguiente página. Fin.")
                break

        except Exception as e:
            print(f"❌ Error crítico: {e}")
            break

    # Guardar resultados
    if all_extracted_data:
        print(f"📤 Enviando {len(all_extracted_data)} registros a Supabase...")
        try:
            supabase.table("market_prices_log").insert(all_extracted_data).execute()
            print("✅ Datos guardados.")
        except Exception as e:
            print(f"❌ Error Supabase: {e}")

if __name__ == "__main__":
    run_scraper()
