import os
import logging
import time
import random
from datetime import datetime
from pathlib import Path
import requests
from supabase import create_client, Client
from dotenv import load_dotenv

# --- CONFIGURACIÓN ---
PROVIDER_NAME = "Resurtidora"
LOG_FILE = 'scraper_resurtidora.log'

# Lista de colecciones a scrapear (formato .json)
COLLECTIONS = [
    "https://tienda.resurtidora.mx/collections/equipos-aire-acondicionado-minisplits/products.json",
    "https://tienda.resurtidora.mx/collections/aire-acondicionado-portatil-y-purificadores-de-aire/products.json"
]

logging.basicConfig(
    filename=LOG_FILE, 
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# 1. CARGA DE CREDENCIALES
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

def get_normalized_id(sku):
    """Busca el ID en el catálogo maestro usando el SKU"""
    if not sku or sku == "N/A": return None
    try:
        res = supabase.table("product_catalog").select("id").eq("sku_master", sku).maybe_single().execute()
        return res.data['id'] if res.data else None
    except:
        return None

def process_collection(session, collection_url):
    """Procesa una colección completa manejando su propia paginación"""
    all_data = []
    page = 1
    collection_name = collection_url.split('/')[-2] # Extrae el nombre de la categoría de la URL
    
    print(f"--> Analizando colección: {collection_name}")

    while True:
        try:
            # Shopify permite hasta 250 por página en el endpoint .json
            response = session.get(f"{collection_url}?page={page}&limit=250", timeout=20)
            if response.status_code != 200:
                break

            data = response.json()
            products = data.get('products', [])

            if not products:
                break

            for p in products:
                # Captura de pistas para el agrupador
                p_type = p.get('product_type', 'N/A')
                p_tags = p.get('tags', [])
                
                for variant in p.get('variants', []):
                    sku = variant.get('sku') or f"RES-{variant['id']}"
                    price = float(variant.get('price', 0))
                    title = p.get('title')

                    if len(p['variants']) > 1:
                        title = f"{title} - {variant.get('title')}"

                    if price > 0:
                        all_data.append({
                            "provider_name": PROVIDER_NAME,
                            "product_title": title,
                            "sku": str(sku),
                            "price": price,
                            "currency": "MXN",
                            "normalized_product_id": get_normalized_id(sku),
                            "created_at": datetime.now().astimezone().isoformat(), # FECHA NORMALIZADA
                            "metadata": {
                                "url": f"https://tienda.resurtidora.mx/products/{p.get('handle')}",
                                "product_type": p_type,
                                "tags": p_tags,
                                "image": p['images'][0]['src'] if p.get('images') else None,
                                "collection_source": collection_name
                            }
                        })
            
            print(f"    ✅ Pág {page} de {collection_name} lista.")
            page += 1
            time.sleep(random.uniform(0.5, 1.0))

        except Exception as e:
            print(f"❌ Error en {collection_name}: {e}")
            break
            
    return all_data

def run_scraper():
    print(f"--- 🚀 Iniciando Scraper Multi-Colección: {PROVIDER_NAME} ---")
    total_extracted = 0
    
    with requests.Session() as session:
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })

        for url in COLLECTIONS:
            collection_data = process_collection(session, url)
            
            if collection_data:
                # Inserción por cada colección para no saturar memoria
                try:
                    supabase.table("market_prices_log").insert(collection_data).execute()
                    total_extracted += len(collection_data)
                    print(f"📤 {len(collection_data)} productos de esta colección enviados a Supabase.")
                except Exception as e:
                    print(f"❌ Error al insertar lote: {e}")

    print(f"--- 🏁 Finalizado. Total Resurtidora: {total_extracted} registros ---")

if __name__ == "__main__":
    run_scraper()
