import glob
import json
import csv
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.dirname(BASE_DIR) # Adjust if needed, looks like script is in data_mining/scripts so BASE is data_mining
# Wait, BASE_DIR in io_manager was os.path.dirname(os.path.dirname(...))
# script is in c:\TESIVIL\AWS-TESIVIL\AWS-TESIVIL\06_QRCLIMA\data_mining\scripts\repair_master.py
# so __file__ = ...\scripts\repair_master.py
# dirname = ...\scripts
# dirname(dirname) = ...\data_mining = BASE_DIR

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = BASE_DIR # JSONs are in data_mining/ directly?
# Let's check listing.
# batch1 is in data_mining/batch1_decisions.json?
# Previous io_manager says: 
# MASTER_FILE = os.path.join(OUTPUT_DIR, 'master_products.csv')
# BASE_DIR is 'data_mining' usually.

OUTPUT_DIR = os.path.join(BASE_DIR, 'output')
MASTER_FILE = os.path.join(OUTPUT_DIR, 'master_products.csv')

MASTER_COLUMNS = [
    'sku', 'nombre_estandarizado', 'grupo_general', 'grupo_especializado',
    'marca', 'modelo', 'descripcion_tecnica', 'capacidad', 'voltaje',
    'refrigerante', 'tipo_operacion', 'unidad', 'observaciones_equivalencia'
]

def repair():
    all_products = {}
    
    # JSONs are in BASE_DIR (data_mining root) based on previous usage
    # JSONs are in BASE_DIR
    files = []
    # 1. Decisions files: batch*_decisions.json
    files += glob.glob(os.path.join(BASE_DIR, 'batch*_decisions.json'))
    # 2. Fix Orphan files: fix_orphan*.json AND batch_fix_orphans.json
    files += glob.glob(os.path.join(BASE_DIR, '*orphan*.json'))
    
    # Exclude anything that isn't a decision file if needed, but *orphan* and batch*_decisions seems safe.
    # Exclude temp_batch.json explicitly just in case (though it doesn't match above)
    
    
    for fpath in files:
        with open(fpath, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
                products = data.get('new_products', [])
                for p in products:
                    sku = p.get('sku')
                    if sku:
                        # Normalize SKU keys to handle both formats
                        normalized = {}
                        
                        # 1. SKU
                        normalized['sku'] = sku
                        
                        # 2. Nombre Estandarizado (Critical)
                        normalized['nombre_estandarizado'] = p.get('nombre_estandarizado') or p.get('name')
                        
                        # 3. Grupo General
                        if p.get('grupo_general'):
                            normalized['grupo_general'] = p.get('grupo_general')
                        else:
                            # Deduce from SKU (first 2 chars)
                            normalized['grupo_general'] = sku.split('-')[0] if '-' in sku else 'XX'
                            
                        # 4. Grupo Especializado
                        normalized['grupo_especializado'] = p.get('grupo_especializado') or p.get('category')
                        
                        # 5. Marca
                        normalized['marca'] = p.get('marca') or p.get('brand')
                        
                        # 6. Modelo
                        # Use 'specs' as fallback for modelo if short, else keep empty
                        normalized['modelo'] = p.get('modelo')
                        specs = p.get('specs')
                        if not normalized['modelo'] and specs and len(specs) < 30:
                             normalized['modelo'] = specs
                             
                        # 7. Descripcion Tecnica
                        normalized['descripcion_tecnica'] = p.get('descripcion_tecnica') or specs
                        
                        # 8. Others
                        normalized['capacidad'] = p.get('capacidad')
                        normalized['voltaje'] = p.get('voltaje')
                        normalized['refrigerante'] = p.get('refrigerante')
                        normalized['tipo_operacion'] = p.get('tipo_operacion')
                        normalized['unidad'] = p.get('unidad') or 'Pieza'
                        normalized['observaciones_equivalencia'] = p.get('observaciones_equivalencia')
                        
                        all_products[sku] = normalized
            except Exception as e:
                print(f"Error reading {fpath}: {e}")

    print(f"Consolidated {len(all_products)} unique products.")
    
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    with open(MASTER_FILE, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=MASTER_COLUMNS)
        writer.writeheader()
        
        for sku in sorted(all_products.keys()):
            # Ensure we only write known columns
            row_data = all_products[sku]
            clean_row = {k: row_data.get(k) for k in MASTER_COLUMNS}
            writer.writerow(clean_row)
            
    print(f"Successfully repaired {MASTER_FILE}")

if __name__ == "__main__":
    repair()
