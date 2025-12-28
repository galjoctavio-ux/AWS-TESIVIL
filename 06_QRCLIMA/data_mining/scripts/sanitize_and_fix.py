
import csv

input_file = r'c:\TESIVIL\AWS-TESIVIL\AWS-TESIVIL\06_QRCLIMA\data_mining\data\catalogo_hvac_estandarizado_2.csv'
sanitized_file = r'c:\TESIVIL\AWS-TESIVIL\AWS-TESIVIL\06_QRCLIMA\data_mining\data\catalogo_hvac_sanitized.csv'
final_output = r'c:\TESIVIL\AWS-TESIVIL\AWS-TESIVIL\06_QRCLIMA\data_mining\data\catalogo_hvac_estandarizado_final_fixed.csv'

KNOWN_PROVIDERS = [
    'Reacsa',
    'Grupo Coresa',
    'Tienda Mirage',
    'Aires Aurum',
    'Plomería Universal',
    'Frio Refacciones',
    'Refacciones Neumáticas', # Add others if seen
]

def is_provider(value):
    if not value: return False
    val = value.strip()
    return val in KNOWN_PROVIDERS or val == 'Plomeria Universal'

def sanitize_and_fix():
    print("Step 1: Sanitizing quotes...")
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Replace double quotes with two single quotes globally
        # This breaks quoted fields containing commas, but fixes random inches symbols.
        # Given the error profile, unescaped inches are the dominant issue.
        new_content = content.replace('"', "''")
        
        with open(sanitized_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Sanitization complete.")
        
    except Exception as e:
        print(f"Error during sanitization: {e}")
        return

    print("Step 2: Fixing field counts...")
    try:
        with open(sanitized_file, 'r', encoding='utf-8', newline='') as infile, \
             open(final_output, 'w', encoding='utf-8', newline='') as outfile:
            
            reader = csv.reader(infile)
            writer = csv.writer(outfile)
            
            fixed_count = 0
            error_count = 0
            row_count = 0
            
            for row in reader:
                row_count += 1
                if not row:
                    continue
                
                # Header check
                if row_count == 1:
                    writer.writerow(row)
                    continue
                
                if len(row) == 17:
                    writer.writerow(row)
                    continue

                # Locate Provider Index
                p_index = -1
                for i, field in enumerate(row):
                    if is_provider(field):
                        p_index = i
                        break
                
                if p_index == -1:
                    # Fallback: Check if we can identify based on 'Pieza' at end
                    if row[-1] == 'Pieza':
                        # Assuming Prov is at -4 (13 in 17 field row)
                        # -4: Prov, -3: SKU, -2: Price, -1: Unit
                        # row[len-4] might be provider?
                        possible_prov = row[len(row)-4]
                        if possible_prov: # Assume it's a provider if not empty
                             p_index = len(row)-4
                
                if p_index != -1:
                    diff = p_index - 13
                    
                    if diff > 0:
                        # Too many fields before provider (e.g. 18, 19, 20 fields)
                        # Strategy: 
                        # 1. Remove empty fields in attribute block (indices 7 to p_index-1)
                        # 2. If still diff > 0, merge Description fields (6, 7...)
                        
                        # First, remove empties in the range [7, p_index)
                        i = p_index - 1
                        while i >= 7 and diff > 0:
                            if row[i] == '':
                                del row[i]
                                diff -= 1
                                p_index -= 1 # Shifted
                            i -= 1
                        
                        # If still need to shrink, merge description parts starting at 6
                        while diff > 0:
                            # Merge 6 and 7
                            row[6] = row[6] + ", " + row[7]
                            del row[7]
                            diff -= 1
                            p_index -= 1
                            
                        fixed_count += 1
                        
                    elif diff < 0:
                        # Missing fields (e.g. 16 fields). p_index < 13
                        # Insert empty fields before p
                        needed = abs(diff)
                        for _ in range(needed):
                            row.insert(p_index, '')
                        fixed_count += 1
                        
                    # Verify
                    if len(row) != 17:
                        print(f"Row {row_count}: Fix attempted but length is {len(row)}. Content: {row}")
                        error_count += 1
                    
                    writer.writerow(row)
                    
                else:
                    print(f"Row {row_count}: Could not identify provider. Length {len(row)}. Content: {row}")
                    writer.writerow(row) # Write as is
                    error_count += 1

            print(f"Finished processing {row_count} rows.")
            print(f"Fixed rows: {fixed_count}")
            print(f"Remaining errors: {error_count}")
            
    except Exception as e:
        print(f"Error during fixing: {e}")

if __name__ == '__main__':
    sanitize_and_fix()
