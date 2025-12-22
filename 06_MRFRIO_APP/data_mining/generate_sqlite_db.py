"""
Script para generar qrclima.db desde seed_full_database.sql
Adapta la sintaxis PostgreSQL a SQLite
"""
import sqlite3
import re
import os

# Paths
script_dir = os.path.dirname(os.path.abspath(__file__))
sql_file = os.path.join(script_dir, 'output', 'seed_full_database.sql')
db_file = os.path.join(script_dir, '..', 'assets', 'database', 'qrclima.db')

# Create tables (SQLite compatible)
create_tables_sql = """
CREATE TABLE IF NOT EXISTS air_conditioner_models (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    reference_id TEXT,
    image_url TEXT,
    logo_url TEXT,
    type TEXT,
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS error_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_id INTEGER NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    solution TEXT,
    created_at TEXT,
    FOREIGN KEY (model_id) REFERENCES air_conditioner_models(id)
);

CREATE INDEX IF NOT EXISTS idx_error_code ON error_codes(code);
"""

def adapt_sql_to_sqlite(sql_content):
    """Convert PostgreSQL syntax to SQLite"""
    # Remove BEGIN; and COMMIT;
    sql_content = sql_content.replace('BEGIN;', '').replace('COMMIT;', '')
    
    # Replace NOW() with CURRENT_TIMESTAMP
    sql_content = sql_content.replace("NOW()", "'2024-01-01'")
    
    # Replace ON CONFLICT (id) DO NOTHING with OR IGNORE
    sql_content = re.sub(r"ON CONFLICT \([^)]+\) DO NOTHING", "OR IGNORE", sql_content)
    
    return sql_content

def main():
    print(f"Reading SQL from: {sql_file}")
    
    # Read seed SQL
    with open(sql_file, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    # Adapt to SQLite
    sql_content = adapt_sql_to_sqlite(sql_content)
    
    # Remove existing DB
    if os.path.exists(db_file):
        os.remove(db_file)
        print(f"Removed existing database: {db_file}")
    
    # Create new DB
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    
    # Create tables
    print("Creating tables...")
    cursor.executescript(create_tables_sql)
    
    # Execute inserts
    print("Inserting data...")
    try:
        cursor.executescript(sql_content)
    except sqlite3.Error as e:
        print(f"Error during insert: {e}")
        # Try line by line
        lines = sql_content.split('\n')
        for i, line in enumerate(lines):
            line = line.strip()
            if line.startswith('INSERT'):
                try:
                    cursor.execute(line)
                except sqlite3.Error as e2:
                    if i < 10:  # Only show first errors
                        print(f"  Line {i}: {e2}")
    
    conn.commit()
    
    # Verify
    cursor.execute("SELECT COUNT(*) FROM air_conditioner_models")
    models_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM error_codes")
    errors_count = cursor.fetchone()[0]
    
    print(f"\nDatabase created: {db_file}")
    print(f"  Models: {models_count}")
    print(f"  Error Codes: {errors_count}")
    
    # Sample query
    cursor.execute("SELECT code, description FROM error_codes WHERE code LIKE '%E1%' LIMIT 3")
    samples = cursor.fetchall()
    print("\nSample E1 errors:")
    for code, desc in samples:
        print(f"  {code}: {desc[:50]}...")
    
    conn.close()

if __name__ == "__main__":
    main()
