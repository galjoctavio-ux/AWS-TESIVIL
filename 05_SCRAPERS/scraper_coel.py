import requests
from bs4 import BeautifulSoup
import mysql.connector
import time
import random
from datetime import datetime
import re

# --- CONFIGURACIÓN ---
DB_CONFIG = {
    'user': 'lete_scraper',
    'password': 'Lete2025',
    'host': 'localhost',
    'database': 'coti_lete'
}

# ID 13 = Coel Puebla Web (Según tu tabla proveedores)
PROVEEDOR_ID = 13
LIMIT_PRODUCTOS_PRUEBA = 0 

# Categorías principales de Coel
urls_categorias = [
    "https://www.coelpuebla.com.mx/categorias/21/cables",
    "https://www.coelpuebla.com.mx/categorias/31/tuberia",
    "https://www.coelpuebla.com.mx/categorias/2/interruptores",
    "https://www.coelpuebla.com.mx/categorias/4/centros-de-carga",
    "https://www.coelpuebla.com.mx/categorias/14/iluminacion-interior",
    "https://www.coelpuebla.com.mx/categorias/11/zapatas-y-terminales"
]

def obtener_conexion():
    return mysql.connector.connect(**DB_CONFIG)

def calcular_tiempo_espera():
    """Modo Zen: Lento de día, Rápido de madrugada"""
    hora_actual = datetime.now().hour
    if 0 <= hora_actual < 7:
        espera = random.randint(10, 20) # Madrugada
        modo = "🌙 NOCTURNO"
    else:
        espera = 60 + random.randint(5, 40) # Día
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

def limpiar_precio(texto):
    """Convierte '$ 1,234.56 MXN' a float 1234.56"""
    if not texto: return 0.0
    # Quitamos signo de pesos, comas, letras y espacios
    limpio = re.sub(r'[^\d.]', '', texto)
    try:
        return float(limpio)
    except:
        return 0.0

def extraer_datos_html(soup, url):
    """Extracción específica para Coel Puebla usando Selectores CSS"""
    try:
        # 1. NOMBRE
        # Buscamos h1 con clase 'mayus'
        nombre_tag = soup.select_one('h1.mayus')
        if not nombre_tag: return None
        # Limpiamos el prefijo "Productos: " que a veces ponen
        nombre = nombre_tag.get_text(strip=True).replace("Productos: ", "")

        # 2. SKU
        # Está dentro de <p class="big">SKU: <strong>...</strong></p>
        sku = "SIN_SKU"
        sku_tag = soup.select_one('.name p.big strong')
        # A veces el diseño cambia para móviles/desktop, buscamos alternativa
        if not sku_tag:
            sku_tag = soup.select_one('.sku_wrapper .sku') # Intento alternativo
        
        if sku_tag:
            sku = sku_tag.get_text(strip=True)

        # 3. PRECIO
        # <div class="price big ..."> ... <strong>$181.32</strong>
        precio = 0.0
        precio_tag = soup.select_one('.price.big strong')
        if precio_tag:
            precio = limpiar_precio(precio_tag.get_text())

        # 4. MARCA
        # Coel no siempre pone la marca explícita fácil.
        # Estrategia: Buscar en breadcrumbs o inferir del nombre
        marca = "GENERICA"
        # Intentar buscar en breadcrumbs si existen
        # Ojo: Coel pone la marca al final del nombre muchas veces (ej. "SCHNEIDER")
        posibles_marcas = ["SCHNEIDER", "CONDUMEX", "BTICINO", "SQUARE D", "ARGOS", "VIAKON", "IUSA", "3M", "BURNDY"]
        nombre_upper = nombre.upper()
        for m in posibles_marcas:
            if m in nombre_upper:
                marca = m
                break

        return {
            'sku': sku,
            'nombre': nombre,
            'marca': marca,
            'precio': precio,
            'url': url
        }
    except Exception as e:
        print(f"      ⚠️ Error parseando HTML: {e}")
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
        datos = extraer_datos_html(soup, url)

        if datos and datos['precio'] > 0:
            if existe:
                id_reg = info_bd['id']
                precio_bd = float(info_bd['precio_detectado'])
                if abs(datos['precio'] - precio_bd) > 0.01:
                    print(f"      💲 CAMBIO: BD=${precio_bd} -> Web=${datos['precio']}")
                    actualizar_producto(id_reg, datos['precio'], True)
                else:
                    actualizar_producto(id_reg, datos['precio'], False)
            else:
                guardar_nuevo_staging(datos)
            return True
        else:
            print(f"      ⚠️ Datos incompletos o precio 0 en {url}")
            return False

    except Exception as e:
        print(f"      🔥 Error: {e}")
        return False

def barrer_paginacion(url_base):
    pagina = 1
    total_procesados = 0
    print(f"\n🚀 Barrido Coel: {url_base}")

    while True:
        # Coel usa ?p=1, ?p=2 ...
        url_actual = f"{url_base}?p={pagina}"
        print(f"\n--- 📄 Pag {pagina} ---")
        
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'}
        try:
            res = requests.get(url_actual, headers=headers, timeout=15)
            if res.status_code == 404: break
            
            soup = BeautifulSoup(res.text, 'html.parser')
            
            # Buscamos enlaces de productos
            # En Coel suelen estar dentro de <div class="name"> <a href="...">
            enlaces = []
            # Selector especifico para la rejilla de productos de Coel
            items = soup.select('.producto .img a') 
            if not items:
                # Intento secundario si cambia el diseño
                items = soup.select('.name h4') # A veces el link no está en la imagen
                
            # Recolectar HREFs
            for item in items:
                href = item.get('href')
                # A veces viene relativo o absoluto, asegurar absoluto
                if href and not href.startswith('http'):
                    href = "https://www.coelpuebla.com.mx" + href
                
                # Evitar enlaces basura
                if href and '/productos/' in href or '/producto/' in href: 
                     enlaces.append(href)

            # Eliminar duplicados
            urls_productos = list(set(enlaces))

            if not urls_productos:
                print("🏁 No se encontraron productos. Fin de categoría.")
                break
                
            print(f"   🎯 {len(urls_productos)} items detectados.")
            
            for link in urls_productos:
                if LIMIT_PRODUCTOS_PRUEBA > 0 and total_procesados >= LIMIT_PRODUCTOS_PRUEBA: return
                procesar_producto(link)
                total_procesados += 1
            
            # Verificar si hay botón "Siguiente" o si la pagina estaba vacia para romper
            # Si encontramos productos, asumimos que puede haber más páginas
            pagina += 1 
            
        except Exception as e:
            print(f"❌ Error paginación: {e}")
            time.sleep(60)
            break

if __name__ == "__main__":
    while True:
        for cat in urls_categorias:
            barrer_paginacion(cat)
        print("\n✅ CICLO COEL TERMINADO. Durmiendo 30 min...")
        time.sleep(1800)
