import os
import logging
import time
from datetime import datetime
from pathlib import Path
import requests
from supabase import create_client, Client
from dotenv import load_dotenv

# --- CONFIGURACIÓN ---
PROVIDER_NAME = "Plomería Universal"
LOG_FILE = 'scraper_plomeria_universal.log'
# URL del producto con .json al final para obtener todas las variantes
PRODUCT_JSON_URL = "https://plomeriauniversal.mx/products/tubo-cobre-flexible.json"

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
    print(f"--- Iniciando Scraper {PROVIDER_NAME} (Variantes Shopify) ---")
    all_extracted_data = []
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }

    try:
        response = requests.get(PRODUCT_JSON_URL, headers=headers, timeout=20)
        if response.status_code != 200:
            print(f"❌ Error al acceder al JSON: {response.status_code}")
            return

        data = response.json()
        product = data.get('product', {})
        base_title = product.get('title', 'Tubo Cobre Flexible')
        variants = product.get('variants', [])

        print(f"   🎯 Detectadas {len(variants)} variantes (precios).")

        for v in variants:
            sku = v.get('sku') or "N/A"
            price = float(v.get('price', 0))
            # Combinamos el nombre base con la medida (ej. Tubo Cobre Flexible - 1/4)
            variant_title = f"{base_title} - {v.get('title')}"
            
            if price > 0:
                all_extracted_data.append({
                    "provider_name": PROVIDER_NAME,
                    "product_title": variant_title,
                    "sku": str(sku),
                    "price": price,
                    "currency": "MXN",
                    "normalized_product_id": get_normalized_id(sku),
                    "metadata": {
                        "url": f"https://plomeriauniversal.mx/products/tubo-cobre-flexible?variant={v.get('id')}",
                        "variant_id": v.get('id'),
                        "inventory_quantity": v.get('inventory_quantity')
                    }
                })

    except Exception as e:
        print(f"❌ Error crítico: {e}")

    # Inserción en Supabase
    if all_extracted_data:
        print(f"📤 Enviando {len(all_extracted_data)} variantes a Supabase...")
        try:
            supabase.table("market_prices_log").insert(all_extracted_data).execute()
            print("✅ Variantes actualizadas correctamente.")
        except Exception as e:
            print(f"❌ Error Supabase: {e}")
    else:
        print("Empty: No se extrajeron datos.")

if __name__ == "__main__":
    run_scraper()