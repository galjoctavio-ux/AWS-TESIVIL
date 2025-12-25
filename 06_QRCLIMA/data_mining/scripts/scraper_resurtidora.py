import os
import logging
import time
from datetime import datetime
from pathlib import Path
import requests
from supabase import create_client, Client
from dotenv import load_dotenv

# --- CONFIGURACIÓN ---
PROVIDER_NAME = "Resurtidora"
LOG_FILE = 'scraper_resurtidora.log'
# Endpoint JSON de Shopify (la forma más segura y rápida)
BASE_COLLECTION_URL = "https://tienda.resurtidora.mx/collections/equipos-aire-acondicionado-minisplits/products.json"

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
    """Busca el ID en el catálogo maestro usando el SKU"""
    if not sku or sku == "N/A": return None
    try:
        res = supabase.table("product_catalog").select("id").eq("sku_master", sku).maybe_single().execute()
        return res.data['id'] if res.data else None
    except Exception as e:
        return None

def run_scraper():
    print(f"--- Iniciando Scraper {PROVIDER_NAME} (Shopify Mode) ---")
    all_extracted_data = []
    page = 1
    
    with requests.Session() as session:
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })

        while True:
            print(f"Consultando página JSON {page}...")
            try:
                # Shopify permite paginación con el parámetro ?page=X
                response = session.get(f"{BASE_COLLECTION_URL}?page={page}&limit=250", timeout=20)
                
                if response.status_code != 200:
                    print(f"❌ Error {response.status_code} al consultar API.")
                    break
                
                data = response.json()
                products = data.get('products', [])

                if not products:
                    print("🏁 No hay más productos.")
                    break

                for p in products:
                    # Un producto de Shopify puede tener varias "variantes" (capacidades, voltajes)
                    for variant in p.get('variants', []):
                        sku = variant.get('sku') or "N/A"
                        price = float(variant.get('price', 0))
                        title = p.get('title')
                        
                        # Si hay más de una variante, añadimos el nombre de la variante al título
                        if len(p['variants']) > 1:
                            title = f"{title} - {variant.get('title')}"

                        if price > 0:
                            all_extracted_data.append({
                                "provider_name": PROVIDER_NAME,
                                "product_title": title,
                                "sku": str(sku),
                                "price": price,
                                "currency": "MXN",
                                "normalized_product_id": get_normalized_id(sku),
                                "metadata": {
                                    "url": f"https://tienda.resurtidora.mx/products/{p.get('handle')}",
                                    "shopify_id": p.get('id'),
                                    "image": p['images'][0]['src'] if p.get('images') else None
                                }
                            })
                
                page += 1
                time.sleep(1) # Breve pausa por cortesía

            except Exception as e:
                print(f"❌ Error crítico: {e}")
                break

    # 2. INSERCIÓN EN SUPABASE
    if all_extracted_data:
        print(f"📤 Enviando {len(all_extracted_data)} registros de Resurtidora a Supabase...")
        try:
            # Insertamos en lotes para no saturar la API
            supabase.table("market_prices_log").insert(all_extracted_data).execute()
            print(f"✅ ¡Éxito! {len(all_extracted_data)} productos actualizados.")
        except Exception as e:
            print(f"❌ Error Supabase: {e}")
    else:
        print("No se encontraron datos para insertar.")

if __name__ == "__main__":
    run_scraper()
