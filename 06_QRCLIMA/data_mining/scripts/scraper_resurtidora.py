import os
import logging
import time
import random
from pathlib import Path
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from supabase import create_client, Client
from dotenv import load_dotenv

# --- CONFIGURACIÓN ---
PROVIDER_NAME = "Resurtidora"
LOG_FILE = 'scraper_resurtidora.log'

# TUS URLs EXACTAS (No las cambiamos)
COLLECTIONS = [
    "https://tienda.resurtidora.mx/collections/equipos-aire-acondicionado-minisplits/products.json",
    "https://tienda.resurtidora.mx/collections/aire-acondicionado-portatil-y-purificadores-de-aire/products.json"
]

# 1. Configuración de Logs
logging.basicConfig(
    filename=LOG_FILE, 
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# 2. Credenciales
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Credenciales no encontradas en .env")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def create_robust_session():
    session = requests.Session()
    retry = Retry(
        total=5,
        backoff_factor=2,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET"]
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })
    return session

def process_collection(session, collection_url):
    """Procesa una colección completa manejando su propia paginación"""
    all_data = []
    page = 1
    # Extrae el nombre de la categoría de la URL para metadata
    collection_name = collection_url.split('/')[-2] 
    
    print(f"--> Analizando colección: {collection_name}")

    while True:
        try:
            # Shopify permite hasta 250 por página en el endpoint .json
            url = f"{collection_url}?page={page}&limit=250"
            response = session.get(url, timeout=20)
            
            if response.status_code != 200:
                print(f"   ⚠️ Fin o Error {response.status_code}")
                break

            data = response.json()
            products = data.get('products', [])

            if not products:
                break

            for p in products:
                p_handle = p.get('handle', '')
                p_vendor = p.get('vendor', '')
                p_tags = p.get('tags', [])
                p_type = p.get('product_type', 'N/A')
                
                # Imagen principal (si existe) para guardar en metadata
                image_url = p['images'][0]['src'] if p.get('images') else None

                for variant in p.get('variants', []):
                    price = float(variant.get('price', 0))
                    
                    if price <= 1.0: continue

                    # Construir título compuesto
                    title_full = p.get('title')
                    if len(p.get('variants', [])) > 1 and variant.get('title') != 'Default Title':
                        title_full = f"{title_full} - {variant.get('title')}"

                    # SKU
                    sku = variant.get('sku')
                    if not sku: 
                        sku = f"RES-{variant['id']}"

                    # --- ESTRUCTURA NUEVA ---
                    item = {
                        "provider_name": PROVIDER_NAME,
                        "sku_provider": str(sku).strip(),    # Nombre nuevo
                        "raw_title": title_full[:500],       # Nombre nuevo
                        "price": price,
                        "currency": "MXN",
                        "status": "pending",                 # SEÑAL PARA IA
                        "metadata": {
                            "url": f"https://tienda.resurtidora.mx/products/{p_handle}",
                            "product_type": p_type,
                            "tags": p_tags,
                            "image": image_url,
                            "collection_source": collection_name,
                            "variant_id": variant['id']
                        }
                    }
                    all_data.append(item)
            
            print(f"    ✅ Pág {page} procesada ({len(all_data)} acumulados).")
            page += 1
            time.sleep(random.uniform(1.0, 2.0))

        except Exception as e:
            print(f"❌ Error en {collection_name}: {e}")
            break
            
    return all_data

def run_scraper():
    print(f"--- 🚀 Iniciando Scraper Resurtidora (Shopify Mode) ---")
    total_extracted = 0
    session = create_robust_session()

    for url in COLLECTIONS:
        collection_data = process_collection(session, url)
        
        if collection_data:
            try:
                # Inserción por lotes
                supabase.table("log_scraper_prices").insert(collection_data).execute()
                count = len(collection_data)
                total_extracted += count
                print(f"   💾 Guardados {count} productos de {url.split('/')[-2]}")
            except Exception as e:
                print(f"   ❌ Error al insertar en Supabase: {e}")

    print(f"--- 🏁 Finalizado. Total Resurtidora: {total_extracted} registros ---")

if __name__ == "__main__":
    run_scraper()