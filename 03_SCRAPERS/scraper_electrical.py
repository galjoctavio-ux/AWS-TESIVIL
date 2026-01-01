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

PROVEEDOR_ID = 14
LIMIT_PRODUCTOS_PRUEBA = 0 

# User-Agents para evitar bloqueos por peticiones repetitivas
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0'
]

# --- FUNCIONES BASE DE DATOS ---

def obtener_conexion():
    return mysql.connector.connect(**DB_CONFIG)

def obtener_info_bd(url):
    conn = None
    try:
        conn = obtener_conexion()
        cursor = conn.cursor(dictionary=True)
        # Índice recomendado en BD: CREATE INDEX idx_url_prov ON scraping_staging(url_producto, proveedor_id);
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

# --- HERRAMIENTAS DE SCRAPING ---

def get_headers():
    return {'User-Agent': random.choice(USER_AGENTS)}

def calcular_tiempo_espera():
    """Tiempos optimizados: Rápido pero humano."""
    hora_actual = datetime.now().hour
    if 0 <= hora_actual < 6: # Madrugada
        espera = random.uniform(1.5, 3.5)
        modo = "🌙 NOCHE"
    else: # Día
        espera = random.uniform(4.0, 8.0)
        modo = "☀️ DÍA"
    return espera, modo

def descubrir_categorias():
    """
    Escanea la home buscando enlaces con el patrón '/XX-categoria' típico de PrestaShop.
    """
    url_home = "https://electrical.com.mx/"
    print(f"🕵️‍♀️ ESCANEANDO CATEGORÍAS EN: {url_home} ...")
    
    try:
        res = requests.get(url_home, headers=get_headers(), timeout=20)
        soup = BeautifulSoup(res.text, 'html.parser')
        enlaces = set()
        
        # En PrestaShop, las categorías suelen tener un ID numérico al principio: "/10-control", "/13-iluminacion"
        # Buscamos en el menú principal (id usually 'top-menu' or classes like 'category')
        tags_a = soup.find_all('a', href=True)
        
        for a in tags_a:
            href = a['href']
            # Normalizar URL
            if not href.startswith('http'):
                full_url = "https://electrical.com.mx" + href.lstrip('/')
            else:
                full_url = href
            
            # Patrón regex: busca "/numero-texto" (ej: /10-control)
            # Evita /content, /login, /cart
            if re.search(r'electrical\.com\.mx/\d+-[a-zA-Z0-9-]+', full_url):
                enlaces.add(full_url)
        
        lista = list(enlaces)
        print(f"✅ Se descubrieron {len(lista)} categorías automáticamente.")
        return lista
    except Exception as e:
        print(f"🔥 Error autodescubrimiento: {e}")
        return []

def extraer_datos_hibrido(soup, url):
    """
    Estrategia doble: 
    1. Intenta leer JSON-LD (Estructurado, más confiable).
    2. Si falla, lee HTML (Visual, fallback).
    """
    datos = {
        'sku': 'SIN_SKU', 'nombre': 'Desconocido', 
        'marca': 'GENERICA', 'precio': 0.0, 'url': url
    }
    
    # --- ESTRATEGIA 1: JSON-LD ---
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
                    
                    brand = item.get('brand')
                    if isinstance(brand, dict): datos['marca'] = brand.get('name', 'GENERICA')
                    elif isinstance(brand, str): datos['marca'] = brand
                    
                    offers = item.get('offers', {})
                    if isinstance(offers, list): offers = offers[0]
                    try:
                        datos['precio'] = float(offers.get('price', 0))
                    except: pass
                    
                    if datos['precio'] > 0:
                        json_found = True
                    break
        except: continue
        if json_found: break

    if json_found:
        return datos

    # --- ESTRATEGIA 2: HTML FALLBACK (Si falló el JSON) ---
    # print("      ⚠️ JSON no encontrado, usando HTML fallback...")
    try:
        # Título (h1 standard)
        h1 = soup.find('h1', itemprop='name') or soup.find('h1')
        if h1: datos['nombre'] = h1.get_text(strip=True)
        
        # Precio (propiedad itemprop="price" o clase .current-price)
        precio_tag = soup.select_one('[itemprop="price"]') or soup.select_one('.current-price span')
        if precio_tag:
            # Limpieza: quitar "$" y "," y atributos content
            texto_precio = precio_tag.get('content') or precio_tag.get_text()
            datos['precio'] = float(re.sub(r'[^\d.]', '', texto_precio))
            
        # SKU (Reference)
        sku_tag = soup.select_one('[itemprop="sku"]') or soup.select_one('.product-reference span')
        if sku_tag:
            datos['sku'] = sku_tag.get_text(strip=True)
            
        # Marca (A veces está en los breadcrumbs o en detalles)
        # Intentamos buscar en breadcrumbs
        pass # La lógica de marca por defecto GENERICA suele bastar si no hay JSON
        
    except Exception as e:
        print(f"      ❌ Error parseando HTML: {e}")

    return datos

def procesar_producto(url):
    tiempo, modo = calcular_tiempo_espera()
    info_bd = obtener_info_bd(url)
    existe = info_bd is not None
    
    # print(f"   [{modo} {tiempo:.1f}s] {'Rev' if existe else 'New'} -> {url[-30:]}...")
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
                if abs(datos['precio'] - precio_bd) > 1.0: # Margen de 1 peso
                    actualizar_producto(id_reg, datos['precio'], True)
                else:
                    actualizar_producto(id_reg, datos['precio'], False)
            else:
                guardar_nuevo_staging(datos)
            return True
        else:
            print(f"      ⚠️ Precio 0 o datos vacíos: {url}")
            return False

    except Exception as e:
        print(f"      🔥 Error procesando: {e}")
        return False

def barrer_paginacion(url_base):
    pagina = 1
    errores_consecutivos = 0
    print(f"\n🚀 CATEGORÍA: {url_base}")

    while True:
        # PrestaShop paginación standard
        if pagina == 1: url_actual = url_base
        else: url_actual = f"{url_base}?page={pagina}"
            
        print(f"\n--- 📄 Pag {pagina} ---")
        
        try:
            res = requests.get(url_actual, headers=get_headers(), timeout=20)
            
            # Chequeos de fin
            if res.status_code == 404: break
            # Si redirige a home o a otra url rara
            if res.url == "https://electrical.com.mx/" and pagina > 1: break
            
            soup = BeautifulSoup(res.text, 'html.parser')
            
            # --- SELECTOR MEJORADO ---
            # Buscamos cajas de productos específicas de PrestaShop (.product-miniature)
            # Esto evita enlaces basura del footer/header
            enlaces = []
            cajas_producto = soup.select('article.product-miniature a.thumbnail') # Selector muy común en PS 1.7+
            
            if not cajas_producto:
                # Fallback: Selector genérico de productos en lista
                cajas_producto = soup.select('.products .product-title a')

            for a in cajas_producto:
                href = a.get('href')
                if href:
                   enlaces.append(href)

            urls_productos = list(set(enlaces))

            if not urls_productos:
                print("🏁 No se encontraron productos. Fin de categoría.")
                break
                
            print(f"   🎯 {len(urls_productos)} items detectados.")
            
            count_procesados = 0
            for link in urls_productos:
                if LIMIT_PRODUCTOS_PRUEBA > 0 and LIMIT_PRODUCTOS_PRUEBA < 100: pass
                procesar_producto(link)
                count_procesados += 1
                
                print(f"      [Progreso: {count_procesados}/{len(urls_productos)}]", end='\r')
            
            pagina += 1
            errores_consecutivos = 0
            
        except Exception as e:
            print(f"❌ Error crítico paginación: {e}")
            errores_consecutivos += 1
            time.sleep(10)
            if errores_consecutivos > 3: break

# --- MAIN ---
if __name__ == "__main__":
    print("🤖 SCRAPER ELECTRICAL V2 - LETE SYSTEMS")
    
    # 1. Auto-descubrimiento
    lista_descubierta = descubrir_categorias()
    
    if lista_descubierta:
        urls_categorias = lista_descubierta
    else:
        print("⚠️ Fallo auto-descubrimiento. Usando lista manual (Backup).")
        urls_categorias = [
            "https://electrical.com.mx/10-control",
            "https://electrical.com.mx/11-conductores-electricos", 
            "https://electrical.com.mx/12-apagadores-y-contactos",
            "https://electrical.com.mx/13-iluminacion"
        ]

    while True:
        random.shuffle(urls_categorias)
        print(f"\n📋 Iniciando ciclo sobre {len(urls_categorias)} categorías...")
        
        for cat in urls_categorias:
            barrer_paginacion(cat)
        
        print("\n✅ CICLO TERMINADO. Durmiendo 45 min...")
        time.sleep(2700)