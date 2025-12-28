import csv
import sys
from pathlib import Path

def audit_data(master_path, price_log_path):
    print(f"Starting audit...")
    print(f"Master file: {master_path}")
    print(f"Price Log file: {price_log_path}")
    
    # 1. Check Master Products for Duplicates
    master_skus = set()
    duplicate_skus = []
    
    try:
        with open(master_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                sku = row.get('sku')
                if not sku:
                    continue
                if sku in master_skus:
                    duplicate_skus.append(sku)
                master_skus.add(sku)
    except FileNotFoundError:
        print(f"Error: Master products file not found at {master_path}")
        return

    print(f"\n--- Master Products Analysis ---")
    print(f"Total Unique SKUs: {len(master_skus)}")
    if duplicate_skus:
        print(f"FAILED: Found {len(duplicate_skus)} duplicate SKUs in master_products.csv:")
        for d in duplicate_skus[:10]: # Show first 10
            print(f"  - {d}")
        if len(duplicate_skus) > 10:
            print(f"  ... and {len(duplicate_skus) - 10} more.")
    else:
        print("PASSED: No duplicate SKUs found.")

    # 2. Check Price Log for Orphans and Anomalies
    orphaned_rows = []
    price_anomalies = []
    total_price_rows = 0
    
    try:
        with open(price_log_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for i, row in enumerate(reader, 1):
                total_price_rows += 1
                sku = row.get('sku')
                price_str = row.get('precio')
                
                # Check Orphan
                if sku not in master_skus:
                    orphaned_rows.append({'line': i, 'sku': sku})
                
                # Check Price Anomaly
                try:
                    price = float(price_str) if price_str else 0.0
                    if price < 100 or price is None:
                         price_anomalies.append({'line': i, 'sku': sku, 'price': price})
                except ValueError:
                    price_anomalies.append({'line': i, 'sku': sku, 'price': price_str})

    except FileNotFoundError:
        print(f"Error: Price log file not found at {price_log_path}")
        return

    print(f"\n--- Price Log Analysis ---")
    print(f"Total Price Rows: {total_price_rows}")
    
    # Report Orphans
    if orphaned_rows:
        print(f"FAILED: Found {len(orphaned_rows)} orphaned entries (SKU not in master):")
        for o in orphaned_rows[:10]:
            print(f"  - Line {o['line']}: SKU {o['sku']}")
        if len(orphaned_rows) > 10:
            print(f"  ... and {len(orphaned_rows) - 10} more.")
    else:
        print("PASSED: Integrity Check - No orphaned SKUs.")
        
    # Report Price Anomalies
    if price_anomalies:
        print(f"WARNING: Found {len(price_anomalies)} price anomalies (Price < 100 or Invalid):")
        for a in price_anomalies[:10]:
            print(f"  - Line {a['line']}: SKU {a['sku']} = {a['price']}")
        if len(price_anomalies) > 10:
            print(f"  ... and {len(price_anomalies) - 10} more.")
    else:
        print("PASSED: Price Consistency - No obvious anomalies found.")

    # Final Summary
    print("\n--- Final Audit Result ---")
    if not duplicate_skus and not orphaned_rows:
        print("El dataset está limpio y listo para ingestión")
    else:
        print("El dataset CONTIENE ERRORES que deben corregirse antes de la ingestión.")

if __name__ == "__main__":
    base_path = Path("c:/TESIVIL/AWS-TESIVIL/AWS-TESIVIL/06_QRCLIMA/data_mining/output")
    audit_data(base_path / "master_products.csv", base_path / "price_log.csv")
