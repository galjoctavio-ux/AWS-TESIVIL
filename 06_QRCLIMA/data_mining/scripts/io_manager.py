import csv
import argparse
import json
import os
import sys

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')
OUTPUT_DIR = os.path.join(BASE_DIR, 'output')

RAW_LOG_FILE = os.path.join(DATA_DIR, 'log_scraper_prices_rows.csv')
MASTER_FILE = os.path.join(OUTPUT_DIR, 'master_products.csv')
PRICE_LOG_FILE = os.path.join(OUTPUT_DIR, 'price_log.csv')

# Strict Columns
MASTER_COLUMNS = [
    'sku', 'nombre_estandarizado', 'grupo_general', 'grupo_especializado',
    'marca', 'modelo', 'descripcion_tecnica', 'capacidad', 'voltaje',
    'refrigerante', 'tipo_operacion', 'unidad', 'observaciones_equivalencia'
]

PRICE_LOG_COLUMNS = [
    'sku', 'precio', 'proveedor', 'sku_original', 'url', 'scraped_at', 'raw_id'
]

def ensure_directories():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

def read_mode(batch_size=50):
    ensure_directories()
    
    # 1. Load Context (Existing SKUs)
    context = {}
    if os.path.exists(MASTER_FILE):
        try:
            with open(MASTER_FILE, 'r', encoding='utf-8', newline='') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if row.get('nombre_estandarizado') and row.get('sku'):
                        context[row['nombre_estandarizado']] = row['sku']
        except Exception as e:
            print(f"Warning: Could not read master file: {e}", file=sys.stderr)

    # 2. Load History (Processed Raw IDs)
    processed_ids = set()
    if os.path.exists(PRICE_LOG_FILE):
        try:
            with open(PRICE_LOG_FILE, 'r', encoding='utf-8', newline='') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if row.get('raw_id'):
                        processed_ids.add(row['raw_id'])
        except Exception as e:
             print(f"Warning: Could not read price log file: {e}", file=sys.stderr)

    # 3. Read Raw Data & Filter
    if not os.path.exists(RAW_LOG_FILE):
        print(json.dumps({"error": "Raw log file not found."}))
        return

    try:
        new_batch = []
        with open(RAW_LOG_FILE, 'r', encoding='utf-8', newline='') as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                # Assuming 'id' is the column for raw_id
                r_id = row.get('id')
                if r_id and r_id not in processed_ids:
                    new_batch.append(row)
                    if len(new_batch) >= batch_size:
                        break
        
        # We don't easily know absolute remaining count without reading whole file, 
        # but that's fine for now.
        
        output = {
            "existing_context": context,
            "new_batch": new_batch,
            "batch_size": len(new_batch)
        }
        print(json.dumps(output, default=str)) 

    except Exception as e:
        print(json.dumps({"error": str(e)}))


def append_mode(json_input):
    ensure_directories()
    
    try:
        data = json.loads(json_input)
        
        new_products = data.get('new_products', [])
        price_observations = data.get('price_observations', [])
        
        # Append Master Products
        if new_products:
            exists = os.path.exists(MASTER_FILE)
            with open(MASTER_FILE, 'a', encoding='utf-8', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=MASTER_COLUMNS)
                if not exists:
                    writer.writeheader()
                
                for product in new_products:
                    # Filter keys to match strict columns
                    row = {k: product.get(k) for k in MASTER_COLUMNS}
                    writer.writerow(row)
            
            print(f"Appended {len(new_products)} new products to master_products.csv")

        # Append Price Log
        if price_observations:
            exists = os.path.exists(PRICE_LOG_FILE)
            with open(PRICE_LOG_FILE, 'a', encoding='utf-8', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=PRICE_LOG_COLUMNS)
                if not exists:
                    writer.writeheader()
                
                for obs in price_observations:
                    row = {k: obs.get(k) for k in PRICE_LOG_COLUMNS}
                    writer.writerow(row)

            print(f"Appended {len(price_observations)} observations to price_log.csv")
            
    except json.JSONDecodeError:
        print("Error: Invalid JSON input", file=sys.stderr)
    except Exception as e:
        print(f"Error appending data: {e}", file=sys.stderr)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="IO Manager for AI ETL Pipeline")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--read', action='store_true', help='Read next batch')
    group.add_argument('--append', type=str, help='Append JSON data (pass JSON string or filename)')
    parser.add_argument('--batch_size', type=int, default=50, help='Batch size for reading (default: 50)')
    
    args = parser.parse_args()
    
    if args.read:
        read_mode(batch_size=args.batch_size)
    elif args.append:
        # Check if argument is a file
        if os.path.isfile(args.append):
            with open(args.append, 'r', encoding='utf-8') as f:
                json_content = f.read()
        else:
            json_content = args.append
            
        append_mode(json_content)
