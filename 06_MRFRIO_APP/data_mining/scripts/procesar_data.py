import json
import os

# --- CONFIGURACIÓN ---
# Carpeta donde están los JSONs
BASE_INPUT_DIR = os.path.join('..', 'raw_inputs')
# Ruta de salida del SQL
OUTPUT_SQL = os.path.join('..', 'output', 'seed_full_database.sql')

# Lista de archivos a procesar (Orden de importación)
ARCHIVOS_A_PROCESAR = [
    'DB_MASTER_MR_FRIO.json',  # Mirage
    'data_carrier.json',       # Carrier
    'data_york.json',          # York
    'data_lg.json'             # LG (Nuevo!)
]

# Nombres de tablas en tu BD
TABLA_MODELOS = "air_conditioner_models"
TABLA_ERRORES = "error_codes"

def escapar_sql(texto):
    if not texto: return ""
    return str(texto).replace("'", "''").replace("\\", "\\\\").strip()

def main():
    print("🚀 Iniciando generación de SQL Maestro para Mr. Frío...")
    
    # Abrir archivo SQL para escritura
    with open(OUTPUT_SQL, 'w', encoding='utf-8') as f_sql:
        f_sql.write("-- SEEDER MAESTRO: MIRAGE + CARRIER + YORK --\n")
        f_sql.write("-- Generado automáticamente --\n\n")
        f_sql.write("BEGIN;\n")
        
        # Limpiar tablas antes de insertar (Opcional, quita el comentario si quieres borrar todo antes)
        # f_sql.write(f"TRUNCATE TABLE {TABLA_ERRORES}, {TABLA_MODELOS} RESTART IDENTITY CASCADE;\n\n")

        id_modelo_counter = 1 

        for archivo in ARCHIVOS_A_PROCESAR:
            ruta_completa = os.path.join(BASE_INPUT_DIR, archivo)
            
            if not os.path.exists(ruta_completa):
                print(f"⚠️  Advertencia: No encuentro {archivo}, saltando...")
                continue

            print(f"📂 Procesando: {archivo}...")
            
            try:
                with open(ruta_completa, 'r', encoding='utf-8') as f_json:
                    data = json.load(f_json)
                
                for modelo in data:
                    # 1. Datos del Modelo
                    # Nota: Mapeamos los campos del JSON a las columnas de tu BD
                    nombre = escapar_sql(modelo.get('nombre_comercial'))
                    ref = escapar_sql(modelo.get('id_referencia'))
                    
                    # Manejo flexible de claves de imagen (Mirage vs Carrier/York manual)
                    img = escapar_sql(modelo.get('imagen_local', ''))
                    if not img: img = escapar_sql(modelo.get('imagen_url', '')) # Fallback
                    
                    logo = escapar_sql(modelo.get('logo_local', ''))
                    if not logo: logo = escapar_sql(modelo.get('logo_url', '')) # Fallback

                    tipo = escapar_sql(modelo.get('tipo', 'Aire Residencial'))

                    # QUERY MODELO
                    sql_mod = (
                        f"INSERT INTO {TABLA_MODELOS} (id, name, reference_id, image_url, logo_url, type, created_at) "
                        f"VALUES ({id_modelo_counter}, '{nombre}', '{ref}', '{img}', '{logo}', '{tipo}', NOW()) "
                        f"ON CONFLICT (id) DO NOTHING;\n" # Evita errores si corres el script 2 veces
                    )
                    f_sql.write(sql_mod)

                    # 2. Datos de Errores
                    # Normalizamos la clave: Mirage usa 'errores', mi script Carrier usó 'errores', Mirage script anterior 'lista_errores'
                    lista_errores = modelo.get('errores') or modelo.get('lista_errores') or []

                    for error in lista_errores:
                        codigo = escapar_sql(error.get('codigo'))
                        desc = escapar_sql(error.get('descripcion'))
                        sol = escapar_sql(error.get('solucion'))

                        # QUERY ERROR
                        sql_err = (
                            f"INSERT INTO {TABLA_ERRORES} (model_id, code, description, solution, created_at) "
                            f"VALUES ({id_modelo_counter}, '{codigo}', '{desc}', '{sol}', NOW());\n"
                        )
                        f_sql.write(sql_err)
                    
                    id_modelo_counter += 1
                
                f_sql.write(f"\n-- Fin de {archivo} --\n\n")

            except Exception as e:
                print(f"❌ Error leyendo {archivo}: {e}")

        f_sql.write("COMMIT;\n")

    print(f"\n✅ ¡MISIÓN CUMPLIDA! SQL generado en:")
    print(f"   -> {os.path.abspath(OUTPUT_SQL)}")
    print(f"   -> Total de modelos procesados: {id_modelo_counter - 1}")

if __name__ == "__main__":
    main()