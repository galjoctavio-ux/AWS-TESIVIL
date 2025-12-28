import pandas as pd
import sys

def inspect():
    path = "data_mining/output/master_products.csv"
    try:
        df = pd.read_csv(path)
        print(f"Total rows: {len(df)}")
        
        # Check for null or empty nombre_estandarizado
        invalid = df[df['nombre_estandarizado'].isnull() | (df['nombre_estandarizado'].str.strip() == '')]
        
        if not invalid.empty:
            print(f"Found {len(invalid)} invalid rows:")
            print(invalid)
            # Print indices (add 2 to match line number in file: 1 for 0-index, 1 for header)
            print("Line numbers (approx):", [i + 2 for i in invalid.index])
        else:
            print("No invalid rows found based on 'nombre_estandarizado' check.")
            
        # Check for the specific problematic row "GA-003"
        ga_003 = df[df['sku'] == 'GA-003']
        if not ga_003.empty:
            print("\nFound GA-003:")
            print(ga_003)

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect()
