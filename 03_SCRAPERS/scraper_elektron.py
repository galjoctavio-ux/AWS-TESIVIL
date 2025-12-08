import requests
from bs4 import BeautifulSoup
import json
import mysql.connector
import time
import random
from datetime import datetime
import re

# --- CONFIGURACIÓN LETE SYSTEMS ---
DB_CONFIG = {
    'user': 'lete_scraper',
    'password': 'Lete2025',
    'host': 'localhost',
    'database': 'coti_lete'
}

PROVEEDOR_ID = 12
LIMIT_PRODUCTOS_PRUEBA = 0 
URL_BASE = "https://www.elektron.com.mx/"

# User-Agents Rotativos
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
]

# --- BASE DE DATOS ---

def obtener_conexion():
    return mysql.connector.connect(**DB_CONFIG)

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
            print(f"      🔄 UPDATE PRECIO: ${nuevo_precio}")
        else:
            sql = "UPDATE scraping_staging SET fecha_captura = NOW() WHERE id = %s"
            cursor.execute(sql, (id_registro,))
            print(f"      ok (Up-to-date)")
        conn.commit()
    finally:
        conn.close()

def guardar_nuevo_staging(datos):
    conn = obtener_conexion()
    cursor = conn.cursor()
    sql = """
    INSERT INTO scraping_staging 
    (proveedor_id, sku_detectado, descripcion_detectada, marca_detectada, precio_detectado, url_producto, estatus, fecha_captura)
    VALUES (%s, %s, %s, %s, %s, %s, 'PENDIENTE', NOW())
    """
    val = (PROVEEDOR_ID, datos['sku'], datos['nombre'], datos['marca'], datos['precio'], datos['url'])
    try:
        cursor.execute(sql, val)
        conn.commit()
        print(f"      ✅ INSERT: {datos['sku']} | ${datos['precio']}")
    except mysql.connector.Error as err:
        print(f"      ❌ DB Error: {err}")
    finally:
        conn.close()

# --- UTILS ---

def get_headers():
    return {'User-Agent': random.choice(USER_AGENTS)}

def calcular_tiempo_espera():
    """Tiempos optimizados para Magento (suelen ser sitios pesados, no bajar de 3s)"""
    hora_actual = datetime.now().hour
    if 0 <= hora_actual < 6: # Madrugada
        espera = random.uniform(2.0, 4.0)
        modo = "🌙 NOCHE"
    else: # Día
        espera = random.uniform(4.5, 9.0)
        modo = "☀️ DÍA"
    return espera, modo

def descubrir_categorias():
    """
    Escanea el Mega-Menú de Magento para encontrar categorías automáticamente.
    """
    print(f"🕵️  Analizando estructura del sitio: {URL_BASE}...")
    try:
        res = requests.get(URL_BASE, headers=get_headers(), timeout=20)
        soup = BeautifulSoup(res.text, 'html.parser')
        enlaces = set()
        
        # 1. Menú Principal (Standard Magento 2: nav.navigation)
        # Buscamos enlaces de nivel superior y subcategorías
        nav_links = soup.select('nav.navigation a.level-top') 
        if not nav_links:
            nav_links = soup.select('.navigation a') # Fallback

        for a in nav_links:
            href = a.get('href')
            if href and href.startswith('http') and 'elektron.com.mx' in href:
                # Filtros de exclusión
                if not any(x in href for x in ['blog', 'contact', 'customer', 'login', 'cart', 'checkout']):
                    enlaces.add(href)
        
        # 2. Si no encontró nada, buscar enlaces genéricos del body
        if len(enlaces) < 3:
            print("⚠️  Menú no detectado, escaneando body...")
            all_links = soup.find_all('a', href=True)
            keywords = ['cable', 'iluminacion', 'placas', 'herramienta', 'tuber', 'control']
            for a in all_links:
                href = a['href']
                for k in keywords:
                    if k in href and 'elektron.com.mx' in href:
                        enlaces.add(href)

        lista = list(enlaces)
        print(f"✅ Se descubrieron {len(lista)} categorías.")
        return lista

    except Exception as e:
        print(f"🔥 Error autodescubrimiento: {e}")
        return []

def extraer_datos_hibrido(soup, url):
    """
    Prioridad: JSON-LD > Meta Tags > HTML Visual
    """
    datos = {'sku': 'SIN_SKU', 'nombre': 'Desconocido', 'marca': 'GENERICA', 'precio': 0.0, 'url': url}
    
    # --- 1. ESTRATEGIA JSON-LD (Magento suele tener esto) ---
    scripts = soup.find_all('script', type='application/ld+json')
    json_found = False
    
    for script in scripts:
        try:
            content = json.loads(script.string)
            if isinstance(content, list): items = content
            else: items = [content]

            for item in items:
                if item.get('@type') == 'Product':
                    datos['nombre'] = item.get('name', datos['nombre'])
                    datos['sku'] = item.get('sku', datos['sku'])
                    
                    # Marca
                    brand = item.get('brand')
                    if isinstance(brand, dict): datos['marca'] = brand.get('name', 'GENERICA')
                    elif isinstance(brand, str): datos['marca'] = brand
                    
                    # Precio
                    offers = item.get('offers')
                    if isinstance(offers, dict):
                         datos['precio'] = float(offers.get('price', 0))
                    elif isinstance(offers, list):
                         datos['precio'] = float(offers[0].get('price', 0))
                    
                    if datos['precio'] > 0: json_found = True
                    break
        except: continue
        if json_found: break

    if json_found: return datos

    # --- 2. ESTRATEGIA META TAGS / HTML (Fallback) ---
    try:
        # Precio
        precio_meta = soup.find("meta", property="product:price:amount")
        if precio_meta:
            datos['precio'] = float(precio_meta["content"])
        else:
            # Selector visual Magento standard
            precio_span = soup.select_one('.price-final_price .price') or soup.select_one('.price-box .price')
            if precio_span:
                txt = precio_span.get_text().replace('$', '').replace(',', '').strip()
                try: datos['precio'] = float(txt)
                except: pass

        # Nombre
        nombre_meta = soup.find("meta", property="og:title")
        if nombre_meta: datos['nombre'] = nombre_meta["content"]
        else:
            h1 = soup.select_one('h1.page-title')
            if h1: datos['nombre'] = h1.get_text(strip=True)

        # SKU
        sku_div = soup.select_one('.product.attribute.sku .value')
        if sku_div: datos['sku'] = sku_div.get_text(strip=True)

        # Marca (Inferencia si no vino en JSON)
        if datos['marca'] == 'GENERICA':
            posibles = ["SCHNEIDER", "BTICINO", "CONDUMEX", "VIAKON", "IUSA", "ABB", "PHILLIPS", "3M", "KLEIN", "MILWAUKEE"]
            nombre_upper = datos['nombre'].upper()
            for m in posibles:
                if m in nombre_upper:
                    datos['marca'] = m
                    break

    except Exception as e:
        print(f"      ⚠️ Parse Error HTML: {e}")

    return datos

def procesar_producto(url):
    tiempo, modo = calcular_tiempo_espera()
    info_bd = obtener_info_bd(url)
    existe = info_bd is not None
    
    # print(f"   [{modo} {tiempo:.1f}s] ... {url[-30:]}")
    time.sleep(tiempo)
    
    try:
        res = requests.get(url, headers=get_headers(), timeout=20)
        if res.status_code != 200: return False

        soup = BeautifulSoup(res.text, 'html.parser')
        datos = extraer_datos_hibrido(soup, url)

        if datos['precio'] > 0:
            if existe:
                id_reg = info_bd['id']
                precio_bd = float(info_bd['precio_detectado'])
                if abs(datos['precio'] - precio_bd) > 1.0:
                    actualizar_producto(id_reg, datos['precio'], True)
                else:
                    actualizar_producto(id_reg, datos['precio'], False)
            else:
                guardar_nuevo_staging(datos)
            return True
        else:
            print(f"      ⚠️ Precio 0 o datos vacíos.")
            return False

    except Exception as e:
        print(f"      🔥 Error Request: {e}")
        return False

def barrer_paginacion(url_base):
    pagina = 1
    errores_consecutivos = 0
    print(f"\n🚀 CATEGORÍA: {url_base}")

    while True:
        # Magento usa ?p=X
        url_actual = f"{url_base}?p={pagina}" if pagina > 1 else url_base
        print(f"\n--- 📄 Pag {pagina} ---")
        
        try:
            res = requests.get(url_actual, headers=get_headers(), timeout=20)
            
            # --- DETECCIONES DE FIN DE MAGENTO ---
            # 1. Error 404
            if res.status_code == 404: 
                print("🏁 Fin (404).")
                break
            
            # 2. Redirección (Si pides pag 100 y te manda a la 1 o a la home)
            if res.url != url_actual and pagina > 1:
                # A veces Magento agrega parametros de session, comparar path base
                if res.url.split('?')[0] != url_actual.split('?')[0]:
                    print("🏁 Redirección detectada (Fin).")
                    break

            soup = BeautifulSoup(res.text, 'html.parser')
            
            # 3. Mensaje "No encontramos productos"
            mensaje_vacio = soup.select_one('.message.info.empty')
            if mensaje_vacio:
                print("🏁 Mensaje 'Sin productos' detectado.")
                break

            # Extracción de enlaces
            enlaces = []
            # Selector Magento 2 estándar para items de grilla
            items = soup.select('.product-item-info .product-item-link')
            
            for item in items:
                href = item.get('href')
                if href: enlaces.append(href)

            urls_productos = list(set(enlaces))

            if not urls_productos:
                print("🏁 No se detectaron productos en el listado.")
                break
            
            print(f"   🎯 {len(urls_productos)} items detectados.")
            
            count = 0
            for link in urls_productos:
                if LIMIT_PRODUCTOS_PRUEBA > 0 and LIMIT_PRODUCTOS_PRUEBA < 100: pass
                procesar_producto(link)
                count += 1
                print(f"      [Progreso: {count}/{len(urls_productos)}]", end='\r')
            
            pagina += 1
            errores_consecutivos = 0
            
        except Exception as e:
            print(f"❌ Error crítico paginación: {e}")
            errores_consecutivos += 1
            time.sleep(10)
            if errores_consecutivos > 3: break

# --- MAIN ---
if __name__ == "__main__":
    print("🤖 SCRAPER ELEKTRON V2 - LETE SYSTEMS")
    
    # 1. Descubrimiento
    lista_descubierta = descubrir_categorias()
    
    if not lista_descubierta:
        print("⚠️ Fallo auto-descubrimiento. Usando Backup.")
        lista_descubierta = [
            "https://www.elektron.com.mx/conductores",
            "https://www.elektron.com.mx/residencial/iluminacion-interior",
            "https://www.elektron.com.mx/industrial/control-y-automatizacion"
        ]

    while True:
        random.shuffle(lista_descubierta)
        print(f"\n📋 Iniciando ciclo sobre {len(lista_descubierta)} categorías...")
        
        for cat in lista_descubierta:
            barrer_paginacion(cat)
            
        print("\n✅ CICLO TERMINADO. Durmiendo 45 min...")
        time.sleep(2700)