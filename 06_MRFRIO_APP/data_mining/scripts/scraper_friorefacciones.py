import requests
import os
import time
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

# Cargar variables de entorno (asegúrate de tener tu .env en la raíz del proyecto)
# O hardcodea las keys si es un script local seguro, pero .env es mejor.
load_dotenv(r"..\..\.env") 

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # Usa la Service Role para escribir sin restricciones

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Faltan credenciales de Supabase en el .env")
    exit()

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

BASE_URL = "https://friorefacciones.com/products.json"
PROVIDER_NAME = "Frio Refacciones"

def fetch_and_store():
    page = 1
    total_inserted = 0
    
    print(f"--- Iniciando Scraper {PROVIDER_NAME}: {datetime.now()} ---")

    while True:
        try:
            print(f"Consultando página JSON {page}...")
            response = requests.get(f"{BASE_URL}?page={page}&limit=250")
            
            if response.status_code != 200:
                print(f"Error {response.status_code}. Deteniendo.")
                break

            data = response.json()
            products = data.get('products', [])

            if not products:
                print("No hay más productos. Finalizado.")
                break

            batch_data = []

            for product in products:
                # Shopify organiza por "variantes" (ej. mismo modelo, diferente voltaje).
                # Iteramos variantes para tener precios exactos.
                for variant in product['variants']:
                    item = {
                        "provider_name": PROVIDER_NAME,
                        "product_title": f"{product['title']} - {variant['title']}".replace(" - Default Title", ""),
                        "sku": variant.get('sku') or str(variant['id']),
                        "price": float(variant['price']),
                        "metadata": {
                            "url": f"https://friorefacciones.com/products/{product['handle']}",
                            "vendor": product.get('vendor'),
                            "shopify_id": product['id']
                        }
                    }
                    batch_data.append(item)

            # Insertar en bloque a Supabase
            if batch_data:
                data = supabase.table("market_prices_log").insert(batch_data).execute()
                inserted_count = len(batch_data) # Supabase py devuelve objeto, asumimos éxito si no hay excepción
                total_inserted += inserted_count
                print(f"Página {page}: Insertados {inserted_count} registros.")

            page += 1
            time.sleep(1) # Respetar al servidor

        except Exception as e:
            print(f"Error crítico en página {page}: {e}")
            break

    print(f"--- Resumen: {total_inserted} precios actualizados en BD ---")

if __name__ == "__main__":
    fetch_and_store()