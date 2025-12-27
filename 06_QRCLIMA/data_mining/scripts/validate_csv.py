import csv

FILE = r'c:\TESIVIL\AWS-TESIVIL\AWS-TESIVIL\06_QRCLIMA\data_mining\data\catalogo_hvac_final.csv'

def validate():
    print(f"Validating {FILE}...")
    with open(FILE, 'r', encoding='utf-8', errors='replace') as f:
        reader = csv.reader(f)
        try:
            header = next(reader)
        except StopIteration:
            print("Empty file")
            return
            
        header_len = len(header)
        print(f"Header has {header_len} columns.")
        print(f"Header fields: {header}")
        
        errors = 0
        row_num = 1 # Header is 1
        
        for row in reader:
            row_num += 1
            if len(row) != header_len:
                errors += 1
                if errors < 20:
                    print(f"Row {row_num} mismatch: Found {len(row)} columns. (Expected {header_len})")
                    # Print context
                    print(f"Content: {row}")

        print(f"Total rows scanned: {row_num}")
        print(f"Total mismatch errors: {errors}")

if __name__ == "__main__":
    validate()
