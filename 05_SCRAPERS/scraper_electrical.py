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

PROVEEDOR_ID = 14
LIMIT_PRODUCTOS_PRUEBA = 0 

# LISTA ACTUALIZADA (Basada en tu menú)
urls_categorias = [
    "https://electrical.com.mx/10-control",
    "https://electrical.com.mx/11-conductores-electricos", 
    "https://electrical.com.mx/12-apagadores-y-contactos",
    "https://electrical.com.mx/13-iluminacion",
    "https://electrical.com.mx/14-tuberia-y-canalizacion",
    "https://electrical.com.mx/15-insumos-electricos",
    "https://electrical.com.mx/16-iluminacionpromociones"
]

def obtener_conexion():
    return mysql.connector.connect(**DB_CONFIG)

def calcular_tiempo_espera():
    """Modo Zen: 15-25s en madrugada, 60-100s en día"""
    hora_actual = datetime.now().hour
    if 0 <= hora_actual < 7:
        espera = random.randint(15, 25)
        modo = "🌙 NOCTURNO"
    else:
        espera = 60 + random.randint(10, 50)
        modo = "☀️ DIURNO"
    return espera, modo

def obtener_info_bd(url):
    conn = None
    try:
        conn = obtener_conexion()
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT id, precio_detectado FROM scraping_staging WHERE url_producto = %s AND proveedor_id = %s LIMIT 1"
        cursor.execute(sql, (url, PROVEEDOR_ID))
        return cursor.fetchone()
    except mysql.connector.Error:
        return None
    finally:
        if conn: conn.close()

def actualizar_producto(id_registro, nuevo_precio, cambio_precio):
    conn = obtener_conexion()
    cursor = conn.cursor()
    try:
        if cambio_precio:
            sql = "UPDATE scraping_staging SET precio_detectado = %s, fecha_captura = NOW(), estatus = 'PENDIENTE' WHERE id = %s"
            cursor.execute(sql, (nuevo_precio, id_registro))
            print(f"      🔄 PRECIO ACTUALIZADO: ${nuevo_precio}")
        else:
            sql = "UPDATE scraping_staging SET fecha_captura = NOW() WHERE id = %s"
            cursor.execute(sql, (id_registro,))
            print(f"      ok (Sin cambios)")
        conn.commit()
    finally:
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
    tiempo, modo = calcular_tiempo_espera()
    info_bd = obtener_info_bd(url)
    existe = info_bd is not None
    
    accion = "Revisando" if existe else "Nuevo"
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
            sku = data.get('sku', 'SIN_SKU')
            
            marca = "GENERICA"
            brand = data.get('brand')
            if isinstance(brand, dict): marca = brand.get('name', 'GENERICA')
            elif isinstance(brand, str): marca = brand

            offers = data.get('offers', {})
            if isinstance(offers, list): offers = offers[0]
            
            precio_raw = offers.get('price', 0)
            try:
                precio_web = float(precio_raw)
            except:
                precio_web = 0.0

            if existe:
                id_reg = info_bd['id']
                precio_bd = float(info_bd['precio_detectado'])
                if abs(precio_web - precio_bd) > 0.01:
                    print(f"      💲 CAMBIO: BD=${precio_bd} -> Web=${precio_web}")
                    actualizar_producto(id_reg, precio_web, True)
                else:
                    actualizar_producto(id_reg, precio_web, False)
            else:
                payload = {
                    'sku': sku,
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
    print(f"\n🚀 Barrido Electrical: {url_base}")

    while True:
        # Paginación estándar de PrestaShop ?page=X
        if pagina == 1:
            url_actual = url_base
        else:
            url_actual = f"{url_base}?page={pagina}"
            
        print(f"\n--- 📄 Pag {pagina} ---")
        
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'}
        try:
            res = requests.get(url_actual, headers=headers, timeout=15)
            # Redirección a home o 404 significa fin
            if res.status_code == 404 or res.url == "https://electrical.com.mx/":
                print("🏁 Fin paginación.")
                break
            
            soup = BeautifulSoup(res.text, 'html.parser')
            
            enlaces = []
            all_links = soup.find_all('a', href=True)
            for a in all_links:
                href = a['href']
                # Filtro específico para evitar enlaces basura
                if '.html' in href and ('/pedido' not in href) and ('/mi-cuenta' not in href):
                    # Validar si parece producto (generalmente tiene un ID numérico al inicio del slug)
                    enlaces.append(href)

            urls_productos = list(set(enlaces))
            
            # Filtro adicional de calidad (longitud mínima de URL)
            urls_limpias = [u for u in urls_productos if len(u) > 25] 

            if not urls_limpias:
                print("🏁 No se encontraron productos. Fin.")
                break
                
            print(f"   🎯 {len(urls_limpias)} items detectados.")
            
            for link in urls_limpias:
                if LIMIT_PRODUCTOS_PRUEBA > 0 and total_procesados >= LIMIT_PRODUCTOS_PRUEBA: return
                procesar_producto(link)
                total_procesados += 1
            
            pagina += 1 
            
        except Exception as e:
            print(f"❌ Error paginación: {e}")
            time.sleep(60)
            break

if __name__ == "__main__":
    while True:
        for cat in urls_categorias:
            barrer_paginacion(cat)
        print("\n✅ CICLO ELECTRICAL TERMINADO. Durmiendo 30 min...")
        time.sleep(1800)

