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

PROVEEDOR_ID = 9 
LIMIT_PRODUCTOS_PRUEBA = 0 
URL_HOME = "https://euroelectrica.com.mx/"

# User-Agents Rotativos (Anti-Bloqueo)
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

# --- UTILS SCRAPING ---

def get_headers():
    return {'User-Agent': random.choice(USER_AGENTS)}

def calcular_tiempo_espera():
    """Tiempos optimizados para WooCommerce (soportan bien 4-5 segs)"""
    hora_actual = datetime.now().hour
    if 0 <= hora_actual < 6: # Madrugada
        espera = random.uniform(2.0, 4.0)
        modo = "🌙 NOCHE"
    else: # Día
        espera = random.uniform(4.0, 8.0)
        modo = "☀️ DÍA"
    return espera, modo

def descubrir_categorias():
    """
    Escanea la home buscando enlaces '/categoria-producto/' (Patrón default WooCommerce)
    """
    print(f"🕵️  Escaneando sitemap en: {URL_HOME} ...")
    try:
        res = requests.get(URL_HOME, headers=get_headers(), timeout=20)
        soup = BeautifulSoup(res.text, 'html.parser')
        enlaces = set()
        
        # WooCommerce suele poner las categorías en el menú o sidebar
        tags_a = soup.find_all('a', href=True)
        
        for a in tags_a:
            href = a['href']
            # Normalizar
            if not href.startswith('http'):
                full_url = "https://euroelectrica.com.mx" + href.lstrip('/')
            else:
                full_url = href
            
            # Filtro: Solo URLs de categorías de producto
            if '/categoria-producto/' in full_url:
                # Excluir paginaciones o filtros dentro de la URL
                if '/page/' not in full_url and '?' not in full_url:
                    enlaces.add(full_url)
        
        lista = list(enlaces)
        print(f"✅ Se descubrieron {len(lista)} categorías.")
        return lista
    except Exception as e:
        print(f"🔥 Error autodescubrimiento: {e}")
        return []

def extraer_datos_hibrido(soup, url):
    """
    Estrategia WooCommerce:
    1. JSON-LD (Casi siempre presente y limpio).
    2. HTML Classes (Standard WooCommerce: .product_title, .price, .sku).
    """
    datos = {'sku': 'SIN_SKU', 'nombre': 'Desconocido', 'marca': 'GENERICA', 'precio': 0.0, 'url': url}
    
    # --- 1. JSON-LD ---
    scripts = soup.find_all('script', type='application/ld+json')
    json_found = False
    
    for script in scripts:
        try:
            content = json.loads(script.string)
            if '@graph' in content: items = content['@graph']
            elif isinstance(content, list): items = content
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
                    offers = item.get('offers', {})
                    if isinstance(offers, list): offers = offers[0] # A veces hay varias ofertas
                    try:
                        datos['precio'] = float(offers.get('price', 0))
                    except: pass
                    
                    if datos['precio'] > 0: json_found = True
                    break
        except: continue
        if json_found: break

    # --- 2. HTML FALLBACK (Si JSON falla) ---
    if not json_found or datos['precio'] == 0:
        # print("      ⚠️ JSON falló, usando HTML fallback...")
        try:
            # Nombre
            h1 = soup.select_one('h1.product_title')
            if h1: datos['nombre'] = h1.get_text(strip=True)
            
            # Precio (WooCommerce usa .woocommerce-Price-amount)
            # Buscamos el precio actual (ins/bdi), ignorando el precio tachado (del)
            price_tag = soup.select_one('p.price ins .woocommerce-Price-amount bdi') 
            if not price_tag:
                 price_tag = soup.select_one('p.price .woocommerce-Price-amount bdi')
            
            if price_tag:
                txt = price_tag.get_text()
                datos['precio'] = float(re.sub(r'[^\d.]', '', txt))

            # SKU
            sku_tag = soup.select_one('.sku_wrapper .sku')
            if sku_tag: datos['sku'] = sku_tag.get_text(strip=True)
            
            # Marca (Inferencia si no está en JSON)
            if datos['marca'] == "GENERICA":
                if "|" in datos['nombre']:
                     datos['marca'] = datos['nombre'].split("|")[-1].strip()
        
        except Exception as e:
            print(f"      ❌ HTML Parse Error: {e}")

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
            print(f"      ⚠️ Precio 0 o incompleto: {url}")
            return False

    except Exception as e:
        print(f"      🔥 Error Request: {e}")
        return False

def barrer_paginacion(url_base):
    pagina = 1
    errores_consecutivos = 0
    print(f"\n🚀 CATEGORÍA: {url_base}")

    while True:
        # Paginación WordPress standard: /page/2/
        if pagina == 1:
            url_actual = url_base
        else:
            url_actual = f"{url_base.rstrip('/')}/page/{pagina}/"
            
        print(f"\n--- 📄 Pag {pagina} ---")
        
        try:
            res = requests.get(url_actual, headers=get_headers(), timeout=20)
            
            # Chequeos de fin
            if res.status_code == 404: 
                print("🏁 Fin (404).")
                break
            # WordPress redirige a la última página o home si te pasas
            if res.url != url_actual and pagina > 1:
                 # Verificación laxa por si añade slash al final
                 if res.url.rstrip('/') != url_actual.rstrip('/'):
                    print("🏁 Redirección (Fin).")
                    break

            soup = BeautifulSoup(res.text, 'html.parser')
            
            enlaces = set()
            # SELECTOR OPTIMIZADO: Buscar dentro del grid de productos de WooCommerce
            # Generalmente es ul.products o div.products
            # Buscamos enlaces directos al producto, evitando "Add to cart"
            
            # Estrategia 1: Grid WooCommerce standard
            grid_items = soup.select('.products .product a.woocommerce-LoopProduct-link')
            
            # Estrategia 2: Fallback genérico si el theme cambia clases
            if not grid_items:
                grid_items = soup.select('li.product a')
            
            for item in grid_items:
                href = item.get('href')
                if href and '/producto/' in href:
                    enlaces.add(href)
            
            # Estrategia 3: Último recurso (Scan global)
            if not enlaces:
                all_links = soup.find_all('a', href=True)
                for a in all_links:
                    if '/producto/' in a['href']:
                        enlaces.add(a['href'])

            urls_productos = list(enlaces)

            if not urls_productos:
                print("🏁 No se encontraron productos. Fin.")
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
            print(f"❌ Error paginación: {e}")
            errores_consecutivos += 1
            time.sleep(10)
            if errores_consecutivos > 3: break

# --- MAIN ---
if __name__ == "__main__":
    print("🤖 SCRAPER EUROELECTRICA V2 - LETE SYSTEMS")
    
    # 1. Auto-descubrimiento
    lista_descubierta = descubrir_categorias()
    
    if lista_descubierta:
        urls_categorias = lista_descubierta
    else:
        print("⚠️ Fallo auto-descubrimiento. Usando Backup.")
        urls_categorias = [
            "https://euroelectrica.com.mx/categoria-producto/conductores-electricos/",
            "https://euroelectrica.com.mx/categoria-producto/iluminacion/",
            "https://euroelectrica.com.mx/categoria-producto/distribucion-y-control/"
        ]

    while True:
        random.shuffle(urls_categorias)
        print(f"\n📋 Iniciando ciclo sobre {len(urls_categorias)} categorías...")
        
        for cat in urls_categorias:
            barrer_paginacion(cat)
            
        print("\n✅ CICLO TERMINADO. Durmiendo 45 min...")
        time.sleep(2700)