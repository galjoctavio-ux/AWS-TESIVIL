import mysql.connector
import csv
import os
from datetime import datetime

# --- CONFIGURACIÓN ---
DB_CONFIG = {
    'user': 'lete_scraper',
    'password': 'Lete2025',
    'host': 'localhost',
    'database': 'coti_lete'
}

def exportar_todo():
    print("🚀 Iniciando exportación a CSV...")
    
    # Nombre del archivo con fecha para no sobreescribir
    fecha_hoy = datetime.now().strftime("%Y-%m-%d_%H-%M")
    nombre_archivo = f"reporte_materiales_{fecha_hoy}.csv"
    
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Seleccionamos TODO de la tabla staging
        # Puedes filtrar con WHERE estatus_ia = 'PROCESADO' si solo quieres lo listo
        sql = "SELECT * FROM scraping_staging"
        cursor.execute(sql)
        
        # Obtener los nombres de las columnas dinámicamente
        columnas = [i[0] for i in cursor.description]
        datos = cursor.fetchall()
        
        print(f"📦 Se encontraron {len(datos)} registros.")
        print(f"📝 Escribiendo en: {nombre_archivo}...")
        
        # Escribir el CSV con codificación UTF-8 (para acentos)
        with open(nombre_archivo, mode='w', newline='', encoding='utf-8-sig') as file:
            writer = csv.writer(file)
            
            # 1. Escribir encabezados
            writer.writerow(columnas)
            
            # 2. Escribir datos
            writer.writerows(datos)
            
        print(f"✅ ¡Éxito! Archivo generado: {os.path.abspath(nombre_archivo)}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    exportar_todo()
