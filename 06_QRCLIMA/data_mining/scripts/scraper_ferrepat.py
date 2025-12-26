import os
import logging
import random
import time
from datetime import datetime
from pathlib import Path
from playwright.sync_api import sync_playwright # <--- NUEVA LIBRERÍA
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
    print(f"--- Iniciando Scraper {PROVIDER_NAME} (Playwright Mode) ---")
    all_extracted_data = []

    with sync_playwright() as p:
        # Lanzamos el navegador (headless=True para que no abra ventana en la VM)
        browser = p.chromium.launch(headless=True)
        # Creamos un contexto que imita a un usuario real
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()

        print(f"🔗 Navegando a: {SEARCH_URL}")
        try:
            # Vamos a la página y esperamos a que el internet se estabilice
            page.goto(SEARCH_URL, wait_until="networkidle", timeout=60000)
            
            # Esperamos específicamente a que aparezca un producto (selector de Ferrepat)
            # Si después de 15 seg no aparece, el script fallará con gracia
            page.wait_for_selector('.item', timeout=15000)
            
            # Obtenemos el HTML ya renderizado por el navegador
            html = page.content()
            soup = BeautifulSoup(html, 'html.parser')
            
            products = soup.select('.item') or soup.select('.product-list-item')
            print(f"   🎯 Detectados {len(products)} productos renderizados.")

            for p_html in products:
                try:
                    title_tag = p_html.select_one('.item-name') or p_html.select_one('h2')
                    title = title_tag.get_text(strip=True) if title_tag else "N/A"

                    price_tag = p_html.select_one('.item-price') or p_html.select_one('.price')
                    if price_tag:
                        price_raw = price_tag.get_text(strip=True)
                        price_str = "".join(c for c in price_raw if c.isdigit() or c == '.')
                        price = float(price_str) if price_str else 0.0
                    else:
                        price = 0.0

                    sku_tag = p_html.select_one('.item-sku') or p_html.select_one('.sku')
                    sku = sku_tag.get_text(strip=True).replace('Código:', '').strip() if sku_tag else "N/A"

                    if price > 0:
                        all_extracted_data.append({
                            "provider_name": PROVIDER_NAME,
                            "product_title": title,
                            "sku": sku,
                            "price": price,
                            "currency": "MXN",
                            "normalized_product_id": get_normalized_id(sku),
                            "metadata": {"url": SEARCH_URL, "scraped_at": datetime.now().isoformat()}
                        })
                except Exception:
                    continue

        except Exception as e:
            print(f"❌ Error durante la navegación: {e}")
            # Si falla, tomamos una "foto" de lo que ve el navegador para depurar
            page.screenshot(path="error_ferrepat.png")
            print("📸 Captura de pantalla 'error_ferrepat.png' guardada.")
        
        browser.close()

    # Inserción en Supabase
    if all_extracted_data:
        print(f"📤 Enviando {len(all_extracted_data)} productos a Supabase...")
        try:
            supabase.table("market_prices_log").insert(all_extracted_data).execute()
            print("✅ Datos de Ferrepat actualizados con éxito.")
        except Exception as e:
            print(f"❌ Error Supabase: {e}")
    else:
        print("Empty: No se extrajeron datos.")

if __name__ == "__main__":
    run_scraper()