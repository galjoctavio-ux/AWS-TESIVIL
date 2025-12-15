import json
import os

# --- CONFIGURACIÓN DE RUTAS ---
PATH_ERRORES = os.path.join('..', 'raw_inputs', 'data_errores.json')
PATH_EQUIPOS = os.path.join('..', 'raw_inputs', 'data_equipos.json')
PATH_OUTPUT_DIR = os.path.join('..', 'output')
PATH_OUTPUT_FILE = os.path.join(PATH_OUTPUT_DIR, 'DB_MASTER_MR_FRIO.json')

def main():
    # 1. Cargar archivos
    try:
        with open(PATH_ERRORES, 'r', encoding='utf-8') as f:
            errores_raw = json.load(f)
        with open(PATH_EQUIPOS, 'r', encoding='utf-8') as f:
            equipos_raw = json.load(f)
    except FileNotFoundError as e:
        print(f"❌ Error: {e}")
        print("Asegúrate de que los archivos JSON estén en la carpeta 'raw_inputs'")
        return

    db_final = []
    print(f"⚙️  Procesando {len(equipos_raw)} modelos...")

    # 2. Unificar datos
    for key_modelo, datos_equipo in equipos_raw.items():
        
        # Normalizar nombre (quitar guiones bajos, mayúsculas)
        nombre_humano = key_modelo.replace("_", " ").upper()
        
        modelo_nuevo = {
            "id_referencia": key_modelo,
            "nombre_comercial": nombre_humano,
            "tipo": datos_equipo.get("tipo", "Aire Residencial"),
            # Guardamos la referencia al archivo local que bajamos con el otro script
            "imagen_local": f"/images/equipos/{datos_equipo.get('imagen', 'default.png')}",
            "logo_local": f"/images/logos/{datos_equipo.get('logo', 'default.png')}",
            # Guardamos la URL original por si acaso
            "meta_original": {
                "imagen_raw": datos_equipo.get("imagen"),
                "logo_raw": datos_equipo.get("logo"),
                "visible": datos_equipo.get("visible")
            },
            "lista_errores": []
        }

        # Vincular con sus errores
        if key_modelo in errores_raw:
            lista_errores = errores_raw[key_modelo]
            
            # Caso 1: Los errores vienen como Objeto (Clave: Valor)
            if isinstance(lista_errores, dict):
                for codigo, detalle in lista_errores.items():
                    modelo_nuevo["lista_errores"].append({
                        "codigo": codigo,
                        "descripcion": detalle.get("descrip", "").strip(),
                        "solucion": detalle.get("solucion", "").strip()
                    })
            
            # Caso 2: Los errores vienen como Lista (Array) - Caso 'mpt_indoor'
            elif isinstance(lista_errores, list):
                for i, detalle in enumerate(lista_errores):
                    if detalle: # Filtrar nulos
                        # Si no hay código explícito, creamos uno genérico
                        cod_temp = f"F_{i}" 
                        modelo_nuevo["lista_errores"].append({
                            "codigo": cod_temp,
                            "descripcion": detalle.get("descrip", "").strip(),
                            "solucion": detalle.get("solucion", "").strip()
                        })

        db_final.append(modelo_nuevo)

    # 3. Crear carpeta de salida si no existe
    os.makedirs(PATH_OUTPUT_DIR, exist_ok=True)

    # 4. Guardar JSON Maestro
    with open(PATH_OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(db_final, f, ensure_ascii=False, indent=4)

    print(f"\n✅ ¡Éxito! Base de datos maestra generada en:")
    print(f"   -> {os.path.abspath(PATH_OUTPUT_FILE)}")
    print(f"   -> Total de modelos procesados: {len(db_final)}")

if __name__ == "__main__":
    main()