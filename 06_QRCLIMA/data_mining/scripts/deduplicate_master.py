import csv
import shutil
from pathlib import Path

def deduplicate_master(file_path):
    print(f"Deduplicating {file_path}...")
    temp_path = file_path.with_suffix('.tmp')
    
    seen_skus = set()
    duplicates_count = 0
    
    try:
        with open(file_path, 'r', encoding='utf-8', newline='') as infile, \
             open(temp_path, 'w', encoding='utf-8', newline='') as outfile:
            
            reader = csv.DictReader(infile)
            fieldnames = reader.fieldnames
            writer = csv.DictWriter(outfile, fieldnames=fieldnames)
            writer.writeheader()
            
            for row in reader:
                sku = row.get('sku')
                if sku and sku in seen_skus:
                    duplicates_count += 1
                    continue # Skip duplicate
                
                if sku:
                    seen_skus.add(sku)
                writer.writerow(row)
                
        # Replace original
        shutil.move(temp_path, file_path)
        print(f"Removed {duplicates_count} duplicates. Total unique SKUs: {len(seen_skus)}")
        
    except Exception as e:
        print(f"Error: {e}")
        if temp_path.exists():
            os.remove(temp_path)

if __name__ == "__main__":
    path = Path("c:/TESIVIL/AWS-TESIVIL/AWS-TESIVIL/06_QRCLIMA/data_mining/output/master_products.csv")
    deduplicate_master(path)
