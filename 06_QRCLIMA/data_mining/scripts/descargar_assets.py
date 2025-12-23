import os
import json
import requests
import time

# --- CONFIGURACIÓN ---
# Rutas relativas basadas en tu estructura de carpetas
INPUT_FILE = os.path.join('..', 'raw_inputs', 'data_equipos.json')
BASE_OUTPUT_DIR = os.path.join('..', 'downloaded_assets')

# URLs Base descubiertas en el S3 de Mirage (versión v2)
URL_BASE_IMG = "https://mirage-app-dev.s3-us-west-1.amazonaws.com/errCode/v2/equipos/"
URL_BASE_LOGO = "https://mirage-app-dev.s3-us-west-1.amazonaws.com/errCode/v2/logos/"

def descargar_archivo(url, carpeta_destino, nombre_archivo):
    if not nombre_archivo:
        return

    ruta_completa = os.path.join(carpeta_destino, nombre_archivo)
    
    # Si ya existe, no lo volvemos a descargar
    if os.path.exists(ruta_completa):
        print(f"⏩ Ya existe: {nombre_archivo}")
        return

    try:
        # Hacemos la petición
        r = requests.get(url + nombre_archivo, stream=True, timeout=10)
        
        if r.status_code == 200:
            with open(ruta_completa, 'wb') as f:
                for chunk in r.iter_content(1024):
                    f.write(chunk)
            print(f"✅ Descargado: {nombre_archivo}")
        else:
            print(f"❌ Error {r.status_code} al bajar: {nombre_archivo}")
            
    except Exception as e:
        print(f"⚠️ Excepción al bajar {nombre_archivo}: {e}")

def main():
    # 1. Crear carpetas de destino si no existen
    dir_equipos = os.path.join(BASE_OUTPUT_DIR, 'equipos')
    dir_logos = os.path.join(BASE_OUTPUT_DIR, 'logos')
    
    os.makedirs(dir_equipos, exist_ok=True)
    os.makedirs(dir_logos, exist_ok=True)

    # 2. Cargar el JSON de equipos
    print(f"📂 Leyendo archivo: {INPUT_FILE}")
    try:
        with open(INPUT_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("❌ Error: No encuentro 'data_equipos.json' en la carpeta 'raw_inputs'.")
        return

    print(f"🚀 Iniciando descarga de activos para {len(data)} modelos...\n")

    # 3. Iterar y descargar
    total = len(data)
    contador = 0

    for modelo, detalles in data.items():
        contador += 1
        print(f"[{contador}/{total}] Procesando: {modelo}...")

        # Descargar Imagen del Equipo
        img_name = detalles.get('imagen')
        descargar_archivo(URL_BASE_IMG, dir_equipos, img_name)

        # Descargar Logo del Equipo
        logo_name = detalles.get('logo')
        descargar_archivo(URL_BASE_LOGO, dir_logos, logo_name)
        
        # Pequeña pausa para ser amables con el servidor
        # time.sleep(0.1) 

    print("\n✨ ¡Proceso de descarga finalizado!")
    print(f"   Revisa la carpeta: {os.path.abspath(BASE_OUTPUT_DIR)}")

if __name__ == "__main__":
    main()