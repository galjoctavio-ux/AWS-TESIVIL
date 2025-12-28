import csv
import json
import os
import glob
from pathlib import Path

def generate_fix_batch(base_dir):
    master_path = base_dir / "output/master_products.csv"
    price_log_path = base_dir / "output/price_log.csv"
    json_pattern = base_dir / "batch*_decisions.json"
    
    # 1. Identify Orphans
    master_skus = set()
    with open(master_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get('sku'):
                master_skus.add(row['sku'])
                
    orphans = set()
    orphan_details = {} # SKU -> {url, sku_original, name_inference?}
    
    with open(price_log_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            sku = row.get('sku')
            if sku and sku not in master_skus:
                orphans.add(sku)
                # Store first occurrence details to help finding it
                if sku not in orphan_details:
                    orphan_details[sku] = row

    if not orphans:
        print("No orphans found.")
        return

    print(f"Found {len(orphans)} orphans. Searching for metadata in JSON batches...")

    # 2. Search Metadata in JSONs
    # We need to find the 'price_observations' entry for these SKUs to infer the product data
    # or hopefully find a 'new_products' entry that was skipped?
    
    found_metadata = {} # SKU -> metadata dict
    
    json_files = glob.glob(str(json_pattern))
    
    for jf in json_files:
        try:
            with open(jf, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
                # Check price_observations for the orphan SKUs
                for obs in data.get('price_observations', []):
                    sku = obs.get('sku')
                    if sku in orphans:
                        if sku not in found_metadata:
                            found_metadata[sku] = obs
                            
                # Also check new_products just in case it WAS defined but maybe I missed it? 
                # (If it was defined in a JSON but not in master, maybe io_manager failed to write it?)
                for prod in data.get('new_products', []):
                    sku = prod.get('sku')
                    if sku in orphans:
                        # Found a definition! We can use this directly.
                        print(f"Found existing definition for {sku} in {os.path.basename(jf)}")
                        found_metadata[sku]['definition'] = prod
                        
        except Exception as e:
            print(f"Error reading {jf}: {e}")

    # 3. Construct Fix Batch
    new_products = []
    
    for sku in orphans:
        meta = found_metadata.get(sku)
        
        if not meta:
            print(f"WARNING: Could not find metadata for orphan {sku}")
            continue
            
        # If we found a full definition, use it
        if 'definition' in meta:
            new_products.append(meta['definition'])
        else:
            # We have to infer definition from price observation data (URL, original SKU)
            # This is a fallback. We ideally want the AI to define it, but for now we create a placeholder
            # or try to extract info.
            # actually, for the purpose of this script, let's create a generic entry and I (the AI) will manually fill it
            # or better, try to derive basic info.
            
            # Extract basic info
            url = meta.get('url', '')
            original_sku = meta.get('sku_original', '')
            
            # Simple Inference Logic for Missing Definitions
            # GG-TTT-EEE-NNN
            parts = sku.split('-')
            gg = parts[0] if len(parts)>0 else "EQ"
            
            product_def = {
                "sku": sku,
                "nombre_estandarizado": f"Producto Recuperado {sku}", 
                "grupo_general": gg,
                "grupo_especializado": "Recuperado",
                "marca": "Generico",
                "modelo": original_sku,
                "descripcion_tecnica": f"Producto recuperado de {url}",
                "capacidad": "N/A",
                "voltaje": "N/A",
                "tipo_operacion": "N/A",
                "unidad": "Pieza"
            }
            new_products.append(product_def)

    output_payload = {
        "new_products": new_products,
        "price_observations": [] # No new prices, just fixing master
    }
    
    out_path = base_dir / "batch_fix_orphans.json"
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(output_payload, f, indent=4, ensure_ascii=False)
        
    print(f"Generated fix batch at {out_path} with {len(new_products)} products.")

if __name__ == "__main__":
    base_dir = Path("c:/TESIVIL/AWS-TESIVIL/AWS-TESIVIL/06_QRCLIMA/data_mining")
    generate_fix_batch(base_dir)
