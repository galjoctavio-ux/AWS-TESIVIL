import os
import pandas as pd
import numpy as np
from supabase import create_client, Client
import math
from getpass import getpass

def clean_data(df):
    # Convert entire dataframe to object dtype to allow mixed types (None + numbers)
    df = df.astype(object)
    # Replace Infinity first (as it's a number)
    df = df.replace([np.inf, -np.inf], None)
    # Replace NaNs (which can be float('nan') or np.nan) with None
    df = df.where(pd.notnull(df), None)
    
    # Sanitize raw_id: strict Integer check
    if 'raw_id' in df.columns:
        def clean_id(x):
            try:
                # If it's a UUID string (long), fail immediately to avoid scientific notation parsing risks
                s = str(x)
                if len(s) > 20 and '-' in s:
                    return None
                    
                # Try float convert first to handle "1148.0"
                val = float(x)
                if math.isnan(val) or math.isinf(val):
                     return None
                return int(val)
            except (ValueError, TypeError):
                return None
        df['raw_id'] = df['raw_id'].apply(clean_id)
        
    return df

def upload_batch(supabase: Client, table_name: str, data: list):
    try:
        # Enforce integer type for raw_id in the dictionary, bypassing pandas float casting issues
        if table_name == "price_history":
            for record in data:
                rid = record.get('raw_id')
                if rid is not None:
                    try:
                        record['raw_id'] = int(float(rid))
                    except (ValueError, TypeError):
                        record['raw_id'] = None

        if data:
            print(f"DEBUG: First record in batch for {table_name}: {data[0]}")
        response = supabase.table(table_name).upsert(data).execute()
        # In newer supabase-py, response might be different, but execute() usually raises on error or returns data
        return True
    except Exception as e:
        print(f"Error uploading batch to {table_name}: {e}")
        return False

def main():
    print("--- Supabase Data Ingestion ---")
    
    # Credentials
    url = os.environ.get("SUPABASE_URL")
    if not url:
        url = input("Enter Supabase URL: ").strip()
    
    key = os.environ.get("SUPABASE_KEY")
    if not key:
        key = getpass("Enter Supabase Service Role Key: ").strip()

    if not url or not key:
        print("Error: Missing credentials.")
        return

    try:
        supabase: Client = create_client(url, key)
    except Exception as e:
        print(f"Error creating Supabase client: {e}")
        return

    # Paths
    base_dir = "data_mining/output"
    master_path = os.path.join(base_dir, "master_products.csv")
    price_path = os.path.join(base_dir, "price_log.csv")

    batch_size = 1000

    # 1. Upload Master Products
    if os.path.exists(master_path):
        print(f"\nReading {master_path}...")
        df_master = pd.read_csv(master_path)
        df_master = clean_data(df_master)
        records = df_master.to_dict(orient='records')
        
        total_records = len(records)
        print(f"Uploading {total_records} records to 'master_products'...")
        
        for i in range(0, total_records, batch_size):
            batch = records[i:i + batch_size]
            print(f"  Uploading batch {i} to {i + len(batch)}...")
            success = upload_batch(supabase, "master_products", batch)
            if not success:
                print("ABORTING: Critical error uploading master products.")
                return
        print("Success: master_products uploaded.")
    else:
        print(f"Error: {master_path} not found.")
        return

    # 2. Upload Price History
    if os.path.exists(price_path):
        print(f"\nReading {price_path}...")
        df_prices = pd.read_csv(price_path)
        df_prices = clean_data(df_prices)
        records = df_prices.to_dict(orient='records')
        
        total_records = len(records)
        print(f"Uploading {total_records} records to 'price_history'...")
        
        for i in range(0, total_records, batch_size):
            batch = records[i:i + batch_size]
            print(f"  Uploading batch {i} to {i + len(batch)}...")
            success = upload_batch(supabase, "price_history", batch)
            if not success:
               print("ABORTING: Error uploading price history.")
               return
        print("Success: price_history uploaded.")
    else:
        print(f"Error: {price_path} not found.")

    print("\n--- Ingestion Complete ---")

if __name__ == "__main__":
    main()
