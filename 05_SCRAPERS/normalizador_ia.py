from google import genai
from google.genai.types import GenerateContentConfig, GoogleSearch, Tool
import mysql.connector
import json
import time
import os
from dotenv import load_dotenv  # <--- NUEVO IMPORT

# --- CARGAR VARIABLES DE ENTORNO ---
load_dotenv()  # Esto lee el archivo .env

# --- CONFIGURACIÓN ---
# Ahora si no encuentra la llave, lanzará un error o será None, pero ya no está escrita aquí
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

if not GEMINI_API_KEY:
    raise ValueError("❌ ERROR: No se encontró GEMINI_API_KEY en el archivo .env")

# Configuración de BD desde variables de entorno (Más seguro)
DB_CONFIG = {
    'user': os.getenv('DB_USER', 'lete_scraper'), # Mantiene default por si acaso
    'password': os.getenv('DB_PASS', 'Lete2025'),
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'coti_lete')
}

# --- CONFIGURACIÓN DE GEMINI ---
client = genai.Client(api_key=GEMINI_API_KEY)

# --- PROMPT MAESTRO ---
PROMPT_SYSTEM = """
Eres un experto Ingeniero Eléctrico. Tu tarea es normalizar datos de productos eléctricos.

OBJETIVO:
Analiza los datos crudos (JSON). Si falta información crítica (como amperaje, polos o material), USA LA BÚSQUEDA WEB para encontrar el SKU y obtener los datos reales del fabricante.

FORMATOS ESTRICTOS DE SALIDA (NORMALIZACIÓN):

1. PROTECCION: [Polos]P [Amperaje]A - [Nombre] [Montaje] / [Marca]
   (Ej: 1P 15A - Termomagnético Enchufable / SquareD)

2. CONDUCTORES: Cal [Calibre] - [Tipo] [Color] ([Presentación]) / [Marca]
   (Ej: Cal 12 - Cable THW-LS Rojo (Caja 100m) / Indiana)
   *Nota: Distingue Alambre (sólido) vs Cable (hilos) buscando el SKU.*

3. CANALIZACION: [Medida] - [Nombre] [Material] / [Marca]
   (Ej: 1/2" - Tubo Conduit Pared Delgada / Omega)

4. TABLEROS: [Espacios] Ventanas - [Tipo] [Instalación] / [Marca]
   (Ej: 2 Ventanas - Centro de Carga Sobreponer / SquareD)

5. ARTEFACTOS: [Función] - [Color] (Línea [Modelo]) / [Marca]
   (Ej: Contacto Duplex - Blanco (Línea Quinziño) / BTicino)

6. ILUMINACION: [Potencia]W - [Tecnología] [Base] [Temp. Color] / [Marca]
   (Ej: 9W - Foco LED A19 E27 Luz Día / Philips)

INSTRUCCIONES CRÍTICAS:
- Si el SKU existe pero faltan datos, BUSCA en Google: "[MARCA] [SKU] especificaciones"
- Verifica en sitios oficiales del fabricante o distribuidores confiables
- Si no encuentras el dato exacto después de buscar, márcalo como "INFO_PENDIENTE"

SALIDA REQUERIDA:
Devuelve SOLO un JSON (Lista de Objetos) con esta estructura:
[
  {
    "id": (Integer, preservar el original),
    "categoria": "TEXTO",
    "nombre_normalizado": "TEXTO FINAL",
    "atributos": { 
      "detalle": "valor",
      "fuente_datos": "ORIGINAL o URL si buscaste"
    },
    "grounding_usado": true/false
  }
]

NO agregues texto adicional fuera del JSON.
"""

def obtener_conexion():
    return mysql.connector.connect(**DB_CONFIG)

def obtener_lote_pendiente(limite=5):
    """Lotes pequeños para permitir búsquedas web"""
    conn = None
    try:
        conn = obtener_conexion()
        cursor = conn.cursor(dictionary=True)
        sql = """
            SELECT id, sku_detectado, descripcion_detectada, marca_detectada 
            FROM scraping_staging 
            WHERE estatus_ia = 'PENDIENTE' 
            LIMIT %s
        """
        cursor.execute(sql, (limite,))
        return cursor.fetchall()
    except Exception as e:
        print(f"❌ Error DB: {e}")
        return []
    finally:
        if conn:
            if 'cursor' in locals(): cursor.close()
            conn.close()

def guardar_resultados(resultados_json):
    conn = obtener_conexion()
    cursor = conn.cursor()
    contador = 0
    
    if isinstance(resultados_json, dict): 
        resultados_json = [resultados_json]
        
    for item in resultados_json:
        try:
            sql = """
                UPDATE scraping_staging 
                SET nombre_normalizado = %s,
                    categoria_detectada = %s,
                    atributos_json = %s,
                    estatus_ia = 'PROCESADO'
                WHERE id = %s
            """
            attrs = json.dumps(item.get('atributos', {}), ensure_ascii=False)
            
            val = (
                item.get('nombre_normalizado', 'ERROR IA'),
                item.get('categoria', 'OTRO'),
                attrs,
                item.get('id')
            )
            cursor.execute(sql, val)
            contador += 1
        except Exception as e:
            print(f"❌ Error guardando ID {item.get('id')}: {e}")
    
    conn.commit()
    cursor.close()
    conn.close()
    return contador

def procesar_lote():
    lote = obtener_lote_pendiente(limite=5)
    if not lote:
        print("zzz Sin pendientes...")
        return False

    print(f"⚡ Analizando {len(lote)} productos con Gemini 2.5 Flash + Google Search...")
    
    mensaje_completo = f"{PROMPT_SYSTEM}\n\nNormaliza estos productos:\n\n{json.dumps(lote, ensure_ascii=False, indent=2)}"
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=mensaje_completo,
            config=GenerateContentConfig(
                temperature=0.1,
                top_p=0.95,
                top_k=40,
                tools=[Tool(google_search=GoogleSearch())]
            )
        )
        
        txt = response.text.strip()
        
        if "```json" in txt:
            txt = txt.split("```json")[1].split("```")[0].strip()
        elif "```" in txt:
            txt = txt.split("```")[1].split("```")[0].strip()
        
        for i, char in enumerate(txt):
            if char in '[{':
                txt = txt[i:]
                break
        
        data = json.loads(txt)
        guardados = guardar_resultados(data)
        print(f"✅ Normalizados: {guardados}")
        
        if any(item.get('grounding_usado', False) for item in (data if isinstance(data, list) else [data])):
            print("🔍 Búsqueda web utilizada para complementar datos")
        
        return True

    except json.JSONDecodeError as e:
        print(f"🔥 Error parseando JSON: {e}")
        # print(f"Respuesta recibida: {txt[:500]}") # Descomentar para debug
        time.sleep(10)
        return False
    except Exception as e:
        print(f"🔥 Error Gemini: {e}")
        time.sleep(10)
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 MOTOR IA INICIADO")
    print("📦 Modelo: Gemini 2.5 Flash")
    print("🔑 API Key: Cargada desde .env")
    print("=" * 60)
    
    while True:
        try:
            if procesar_lote():
                print("⏳ Esperando 20s antes del próximo lote...")
                time.sleep(20)
            else:
                print("😴 Sin trabajo pendiente. Durmiendo 2 min...")
                time.sleep(120)
        except KeyboardInterrupt:
            print("\n👋 Deteniendo motor IA...")
            break
        except Exception as e:
            print(f"🔥 Error en ciclo principal: {e}")
            time.sleep(30)