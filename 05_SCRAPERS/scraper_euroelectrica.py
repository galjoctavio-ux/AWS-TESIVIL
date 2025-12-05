import requests
from bs4 import BeautifulSoup
import json
import mysql.connector
import time
import random
from datetime import datetime

# --- CONFIGURACIÓN ---
DB_CONFIG = {
    'user': 'lete_scraper',
    'password': 'Lete2025',
    'host': 'localhost',
    'database': 'coti_lete'
}

PROVEEDOR_ID = 9 
LIMIT_PRODUCTOS_PRUEBA = 0 

urls_categorias = [
    "https://euroelectrica.com.mx/categoria-producto/conductores-electricos/",
    "https://euroelectrica.com.mx/categoria-producto/tuberia-y-canalizacion/",
    "https://euroelectrica.com.mx/categoria-producto/iluminacion/",
    "https://euroelectrica.com.mx/categoria-producto/distribucion-y-control/",
    "https://euroelectrica.com.mx/categoria-producto/herramientas/",
    "https://euroelectrica.com.mx/categoria-producto/material-e-instalacion/"
]

def obtener_conexion():
    return mysql.connector.connect(**DB_CONFIG)

def calcular_tiempo_espera():
    """Define la velocidad según la hora del servidor"""
    hora_actual = datetime.now().hour
    
    # MODO MADRUGADA (De 00:00 a 06:59 AM)
    if 0 <= hora_actual < 7:
        espera = random.randint(12, 25) # Rápido: entre 12 y 25 segundos
        modo = "🌙 NOCTURNO"
    # MODO DÍA (De 07:00 a 23:59 PM)
    else:
        espera = 60 + random.randint(5, 60) # Lento: entre 65 y 120 segundos
        modo = "☀️ DIURNO"
        
    return espera, modo

def obtener_info_bd(url):
    """Devuelve el precio guardado si la URL existe, o None si es nueva"""
    conn = None
    try:
        conn = obtener_conexion()
        cursor = conn.cursor(dictionary=True) # Devuelve dict para leer fácil
        sql = "SELECT id, precio_detectado FROM scraping_staging WHERE url_producto = %s AND proveedor_id = %s LIMIT 1"
        cursor.execute(sql, (url, PROVEEDOR_ID))
        resultado = cursor.fetchone()
        return resultado
    except mysql.connector.Error as err:
        print(f"      ❌ Error DB Check: {err}")
        return None
    finally:
        if conn:
            cursor.close()
            conn.close()

def actualizar_producto(id_registro, nuevo_precio, cambio_precio):
    """Actualiza un producto existente"""
    conn = obtener_conexion()
    cursor = conn.cursor()
    try:
        if cambio_precio:
            # Si el precio cambió, actualizamos precio y fecha
            sql = """
            UPDATE scraping_staging 
            SET precio_detectado = %s, fecha_captura = NOW(), estatus = 'PENDIENTE'
            WHERE id = %s
            """
            cursor.execute(sql, (nuevo_precio, id_registro))
            print(f"      🔄 PRECIO ACTUALIZADO: ${nuevo_precio}")
        else:
            # Si el precio es igual, solo tocamos la fecha (Heartbeat) para saber que sigue vivo
            sql = "UPDATE scraping_staging SET fecha_captura = NOW() WHERE id = %s"
            cursor.execute(sql, (id_registro,))
            print(f"      ok (Sin cambios)")
            
        conn.commit()
    except mysql.connector.Error as err:
        print(f"      ❌ Error Update: {err}")
    finally:
        cursor.close()
        conn.close()

def guardar_nuevo_staging(datos):
    conn = obtener_conexion()
    cursor = conn.cursor()
    sql = """
    INSERT INTO scraping_staging 
    (proveedor_id, sku_detectado, descripcion_detectada, marca_detectada, precio_detectado, url_producto, estatus)
    VALUES (%s, %s, %s, %s, %s, %s, 'PENDIENTE')
    """
    val = (PROVEEDOR_ID, datos['sku'], datos['nombre'], datos['marca'], datos['precio'], datos['url'])
    try:
        cursor.execute(sql, val)
        conn.commit()
        print(f"      ✅ NUEVO: {datos['sku']} | ${datos['precio']}")
    except mysql.connector.Error as err:
        print(f"      ❌ Error Insert: {err}")
    finally:
        cursor.close()
        conn.close()

def extraer_json_ld(soup):
    scripts = soup.find_all('script', type='application/ld+json')
    for script in scripts:
        try:
            content = json.loads(script.string)
            if '@graph' in content: items = content['@graph']
            elif isinstance(content, list): items = content
            else: items = [content]

            for item in items:
                if item.get('@type') == 'Product': return item
        except: continue
    return None

def procesar_producto(url):
    # 1. TIEMPO DE ESPERA DINÁMICO
    tiempo, modo = calcular_tiempo_espera()
    
    # Consultamos BD antes de dormir para decidir, pero igual descargaremos para checar precio
    info_bd = obtener_info_bd(url)
    existe = info_bd is not None
    
    accion = "Revisando actualización" if existe else "Descargando nuevo"
    print(f"   [{modo}] {accion}... (Espere {tiempo}s)")
    time.sleep(tiempo)
    
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'}
    
    try:
        res = requests.get(url, headers=headers, timeout=20)
        if res.status_code != 200: return False

        soup = BeautifulSoup(res.text, 'html.parser')
        data = extraer_json_ld(soup)

        if data:
            nombre = data.get('name', 'Sin Nombre')
            marca = "GENERICA"
            if "|" in nombre: marca = nombre.split("|")[-1].strip()
            
            brand_json = data.get('brand')
            if isinstance(brand_json, dict) and brand_json.get('name'): marca = brand_json.get('name')
            elif isinstance(brand_json, str): marca = brand_json

            offers = data.get('offers', {})
            if isinstance(offers, list): offers = offers[0]
            precio_web = float(offers.get('price', 0.0))

            # --- LÓGICA DE ACTUALIZACIÓN ---
            if existe:
                id_reg = info_bd['id']
                precio_bd = float(info_bd['precio_detectado'])
                
                # Comparamos precios (con una tolerancia mínima de decimales)
                if abs(precio_web - precio_bd) > 0.01:
                    print(f"      💲 CAMBIO DETECTADO: BD=${precio_bd} -> Web=${precio_web}")
                    actualizar_producto(id_reg, precio_web, cambio_precio=True)
                else:
                    actualizar_producto(id_reg, precio_web, cambio_precio=False)
            else:
                # Es nuevo, insertar
                payload = {
                    'sku': data.get('sku', 'SIN_SKU'),
                    'nombre': nombre,
                    'marca': marca,
                    'precio': precio_web,
                    'url': url
                }
                guardar_nuevo_staging(payload)
            return True
        return False

    except Exception as e:
        print(f"      🔥 Error: {e}")
        return False

def barrer_paginacion(url_base):
    pagina = 1
    total_procesados = 0
    print(f"\n🚀 Barrido: {url_base}")

    while True:
        url_actual = url_base if pagina == 1 else f"{url_base.rstrip('/')}/page/{pagina}/"
        print(f"\n--- 📄 Pag {pagina} ---")
        
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'}
        try:
            res = requests.get(url_actual, headers=headers, timeout=15)
            if res.status_code == 404:
                print("🏁 Fin paginación.")
                break
            if res.status_code != 200: break

            soup = BeautifulSoup(res.text, 'html.parser')
            # Buscar enlaces únicos de producto
            urls_productos = {a['href'] for a in soup.find_all('a', href=True) if '/producto/' in a['href']}
            
            if not urls_productos: break
            print(f"   🎯 {len(urls_productos)} items.")
            
            for link in urls_productos:
                if LIMIT_PRODUCTOS_PRUEBA > 0 and total_procesados >= LIMIT_PRODUCTOS_PRUEBA: return
                procesar_producto(link)
                total_procesados += 1
            
            pagina += 1 
            
        except Exception as e:
            print(f"❌ Error paginación: {e}")
            time.sleep(60) # Espera de seguridad ante error de red
            break

if __name__ == "__main__":
    # Bucle infinito para que cuando acabe todas las categorías, 
    # espere un rato y vuelva a empezar (Monitoreo Perpetuo)
    while True:
        for cat in urls_categorias:
            barrer_paginacion(cat)
        
        print("\n✅ CICLO COMPLETO FINALIZADO. Durmiendo 30 min antes de reiniciar...")
        time.sleep(1800) # 30 minutos de descanso entre vueltas completas
