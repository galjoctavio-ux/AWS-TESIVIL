import csv
import io
import sys

# Increase CSV field size limit to handle large descriptions
print("Script starting...")
csv.field_size_limit(1000000)

INPUT_LOG_FILE = r'c:\TESIVIL\AWS-TESIVIL\AWS-TESIVIL\06_QRCLIMA\data_mining\data\log_scraper_prices_rows.csv'
INPUT_STD_FILE = r'c:\TESIVIL\AWS-TESIVIL\AWS-TESIVIL\06_QRCLIMA\data_mining\data\catalogo_hvac_estandarizado.csv'
OUTPUT_FILE = r'c:\TESIVIL\AWS-TESIVIL\AWS-TESIVIL\06_QRCLIMA\data_mining\data\catalogo_hvac_final.csv'

KNOWN_PROVIDERS = [
    "Aires Aurum",
    "Frio Refacciones",
    "Grupo Coresa",
    "Plomería Universal",
    "Reacsa",
    "Resurtidora",
    "Tienda Mirage"
]

def load_id_map(log_file):
    print("Loading ID map from log file (Standard Lib)...")
    id_map = {}
    try:
        with open(log_file, 'r', encoding='utf-8', errors='replace') as f:
            reader = csv.reader(f)
            headers = next(reader, None) # Skip header
            
            # Simple header map, assuming order or finding index
            # Default headers: id,created_at,provider_name,sku_provider,...
            # We need indexes for: id, provider_name, sku_provider
            
            idx_id = -1
            idx_provider = -1
            idx_sku = -1
            
            if headers:
                for i, h in enumerate(headers):
                    h_clean = h.strip()
                    if h_clean == 'id': idx_id = i
                    elif h_clean == 'provider_name': idx_provider = i
                    elif h_clean == 'sku_provider': idx_sku = i
            
            if idx_id == -1 or idx_provider == -1 or idx_sku == -1:
                print("Error: Required columns not found in LOG CSV")
                return {}

            for row in reader:
                if not row: continue
                # safety check length
                if len(row) <= max(idx_id, idx_provider, idx_sku): continue
                
                row_id = row[idx_id].strip()
                provider = row[idx_provider].strip()
                sku = row[idx_sku].strip()
                
                key = (provider, sku)
                if key not in id_map:
                    id_map[key] = []
                id_map[key].append(row_id)
            
        print(f"Loaded {len(id_map)} unique (Provider, SKU) keys.")
        return id_map
    except Exception as e:
        print(f"Error loading log file: {e}")
        return {}

def clean_row(row_values, header_length):
    """
    Heuristic to fix shifted rows.
    Target structure imply 'proveedor_original' is at a specific index (13).
    """
    
    # If row length matches and provider is in expected place, return as is
    if len(row_values) == header_length:
        if len(row_values) > 13 and row_values[13] in KNOWN_PROVIDERS:
            return row_values

    # Find the provider in the row
    provider_idx = -1
    found_provider = None
    
    for i, val in enumerate(row_values):
        if val in KNOWN_PROVIDERS:
            provider_idx = i
            found_provider = val
            break
            
    if provider_idx == -1:
        # Not found, pad/trim
        if len(row_values) < header_length:
            return row_values + [''] * (header_length - len(row_values))
        return row_values[:header_length]

    # Re-align based on provider being at index 13
    shift = provider_idx - 13
    
    new_row = [''] * header_length
    
    # 1. Place the Anchor (Provider) at 13
    new_row[13] = found_provider
    
    # 2. Place items AFTER provider (SKU, Price, Unit) -> indices 14, 15, 16
    after_count = 3
    source_after_start = provider_idx + 1
    target_after_start = 14
    
    for i in range(after_count):
        if source_after_start + i < len(row_values):
            if target_after_start + i < header_length:
                new_row[target_after_start + i] = row_values[source_after_start + i]
            
    # 3. Place items BEFORE provider (0 to 12)
    # Fill predictable start (0-6) - metadata + description start
    # Fill predictable end-of-prefix (7-12) - specs
    
    # Specs indices: 7,8,9,10,11,12 (6 fields)
    spec_indices = [7, 8, 9, 10, 11, 12]
    specs_count = len(spec_indices)
    
    # Check fields between 6 and provider_idx
    # Original structure: 0..5 (meta), 6 (desc), 7..12 (specs)
    
    # We copy 0-5 directly if present
    for i in range(min(6, provider_idx)):
        new_row[i] = row_values[i]
        
    # Now tricky part: Description (6) vs Specs (7-12)
    # We take the chunk before provider_idx.
    # The last 6 of that chunk are likely specs.
    # The rest is description.
    
    # indices available for desc+specs: 6 to provider_idx-1
    if provider_idx > 6:
        middle_chunk = row_values[6:provider_idx]
        
        if len(middle_chunk) >= specs_count:
            # Enough for specs
            specs = middle_chunk[-specs_count:]
            desc_parts = middle_chunk[:-specs_count]
            
            # Fill specs
            for k, spec_val in enumerate(specs):
                new_row[spec_indices[k]] = spec_val
                
            # Fill desc
            new_row[6] = " ".join(desc_parts)
        else:
            # Not enough for specs, put everything in description? 
            # Or fill specs from right? 
            # Let's fill what we have into specs from RIGHT to Match
            # e.g. if we have 4 items, assume they are SEER, Type, Refr, Volt??
            # Safer to put in description or leave blank?
            # Let's just put in Description to preserve data
            new_row[6] = " ".join(middle_chunk)
            
    return new_row

def process_catalog():
    print("Starting consolidation (No Pandas)...")
    id_map = load_id_map(INPUT_LOG_FILE)
    
    consolidated_rows = []
    header = []
    
    row_count = 0
    fixed_count = 0
    
    with open(INPUT_STD_FILE, 'r', encoding='utf-8', errors='replace') as f:
        reader = csv.reader(f)
        try:
            header = next(reader)
        except StopIteration:
            print("Std file is empty")
            return

        # Prepare new header
        new_header = header + ['ids_filas_originales']
        
        for row in reader:
            row_count += 1
            if not row: continue # Skip empty lines
            
            current_row = row
            
            # Check length/alignment
            # Target length is len(header) (orig header length)
            is_misaligned = False
            
            # Condition 1: Length mismatch
            if len(current_row) != len(header):
                is_misaligned = True
            # Condition 2: Provider index check (if length is sufficient)
            elif len(current_row) > 13 and current_row[13] not in KNOWN_PROVIDERS:
                is_misaligned = True
                
            if is_misaligned:
                fixed_row = clean_row(current_row, len(header))
                if fixed_row != current_row:
                    fixed_count += 1
                current_row = fixed_row
            
            # Now we have aligned row with length = len(header)
            # Provider should be at 13, SKU at 14
            
            provider = current_row[13].strip() if len(current_row) > 13 else ""
            sku_orig = current_row[14].strip() if len(current_row) > 14 else ""
            
            # Lookup IDs
            ids = id_map.get((provider, sku_orig), [])
            ids_str = "|".join(ids)
            
            # Append new column
            current_row.append(ids_str)
            
            # Sanitize: Remove commas and newlines from all fields to ensure clean CSV output without reliance on quoting
            final_row = [str(x).replace(',', ' ').replace('\n', ' ').strip() for x in current_row]
            
            consolidated_rows.append(final_row)

    print(f"Processed {row_count} rows.")
    print(f"Fixed alignment in {fixed_count} rows.")
    
    # Write output
    try:
        with open(OUTPUT_FILE, 'w', encoding='utf-8', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(new_header)
            writer.writerows(consolidated_rows)
        print(f"Successfully wrote {len(consolidated_rows)} rows to {OUTPUT_FILE}")
    except Exception as e:
        print(f"Error writing output: {e}")

if __name__ == "__main__":
    process_catalog()
