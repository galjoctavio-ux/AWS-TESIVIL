
import csv
import shutil

input_file = r'c:\TESIVIL\AWS-TESIVIL\AWS-TESIVIL\06_QRCLIMA\data_mining\data\catalogo_hvac_estandarizado_2.csv'
output_file = r'c:\TESIVIL\AWS-TESIVIL\AWS-TESIVIL\06_QRCLIMA\data_mining\data\catalogo_hvac_estandarizado_fixed.csv'

def fix_csv():
    with open(input_file, 'r', encoding='utf-8', newline='') as infile, \
         open(output_file, 'w', encoding='utf-8', newline='') as outfile:
        
        reader = csv.reader(infile)
        writer = csv.writer(outfile)
        
        fixed_count = 0
        error_count = 0
        row_count = 0
        
        for row in reader:
            row_count += 1
            if not row:
                continue
                
            # Header check (assume first row is header)
            if row_count == 1:
                writer.writerow(row)
                continue
            
            # Correction logic
            if len(row) == 18 and row[17] == 'Pieza':
                # detailed check: fields 7-13 are likely mostly empty, or unexpected extra empty field at 13
                # Schema indices: 0-16 (17 fields).
                # Bad row indices: 0-17 (18 fields).
                # Expect 'proveedor_original' at index 13 in corrected row.
                # In bad row, 'proveedor_original' (e.g., 'Frio Refacciones') is at index 14.
                # So index 13 is likely the extra empty field.
                
                if row[13] == '':
                    # Remove the extra empty field at index 13
                    del row[13]
                    fixed_count += 1
                else:
                    # If index 13 is not empty, perform valid checks before modifying
                    print(f"Row {row_count}: detected 18 fields but index 13 is not empty. Review manually or verify logic. Content: {row}")
                    # We might want to search for WHERE the extra empty field is.
                    # Usually it's between description (6) and provider (14 now).
                    # Check if removing the *last* empty field in that range makes sense?
                    # For now, just skip or write as is to avoid data loss, but logging it.
            
            if len(row) != 17:
                print(f"Row {row_count}: still has {len(row)} fields. Content: {row}")
                error_count += 1
                
            writer.writerow(row)

        print(f"Finished processing {row_count} rows.")
        print(f"Fixed {fixed_count} rows.")
        print(f"Remaining errors: {error_count}")

if __name__ == '__main__':
    fix_csv()
