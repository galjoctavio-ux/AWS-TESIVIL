import requests
from bs4 import BeautifulSoup
import json
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

PROVEEDOR_ID = 12
LIMIT_PRODUCTOS_PRUEBA = 0 

# URL Semilla: Desde aquí descubriremos todo lo demás
URL_BASE = "https://www.elektron.com.mx/"

def obtener_conexion():
    return mysql.connector.connect(**DB_CONFIG)

def calcular_tiempo_espera():
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

def descubrir_categorias():
    """Entra a la home y busca enlaces del mega-menú para no fallar con URLs viejas"""
    print(f"🕵️  Descubriendo categorías en {URL_BASE}...")
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'}
    try:
        res = requests.get(URL_BASE, headers=headers, timeout=20)
        soup = BeautifulSoup(res.text, 'html.parser')
        
        # En Magento, el menú suele estar en nav.navigation o ul.ui-menu
        # Buscamos enlaces que parezcan categorías principales
        enlaces = set()
        
        # Estrategia 1: Buscar en el menú de navegación principal
        nav_links = soup.select('nav.navigation a')
        for a in nav_links:
            href = a.get('href')
            # Filtros de calidad para asegurar que es una categoría de producto
            if href and href.startswith(URL_BASE) and not 'blog' in href and not 'contacto' in href:
                # Evitar sub-items muy profundos o irrelevantes (opcional)
                if href.count('/') < 6: 
                    enlaces.add(href)
        
        # Estrategia 2 (Fallback): Si no encuentra en nav, buscar palabras clave en todo el body
        if len(enlaces) < 3:
            keywords = ['conductores', 'iluminacion', 'control', 'placas', 'herramientas', 'tuberia', 'media-tension']
            all_links = soup.find_all('a', href=True)
            for a in all_links:
                href = a['href']
                for k in keywords:
                    if k in href and href.startswith('http'):
                        enlaces.add(href)

        lista_final = list(enlaces)
        print(f"✅ Se descubrieron {len(lista_final)} categorías automáticas.")
        return lista_final

    except Exception as e:
        print(f"⚠️  Error descubriendo categorías: {e}")
        # Si falla, usamos una lista de respaldo manual (Backup)
        return [
            "https://www.elektron.com.mx/conductores",
            "https://www.elektron.com.mx/residencial/iluminacion-interior",
            "https://www.elektron.com.mx/industrial/control-y-automatizacion", # Posible cambio de URL
            "https://www.elektron.com.mx/herramientas",
            "https://www.elektron.com.mx/tuberia-y-poliductos"
        ]

def extraer_meta_tags(soup, url):
    try:
        precio_meta = soup.find("meta", property="product:price:amount")
        if not precio_meta:
            precio_span = soup.select_one('.price-final_price .price')
            if precio_span:
                precio_txt = precio_span.get_text().replace('$', '').replace(',', '')
                precio = float(precio_txt)
            else:
                return None 
        else:
            precio = float(precio_meta["content"])

        nombre_meta = soup.find("meta", property="og:title")
        nombre = nombre_meta["content"] if nombre_meta else "Sin Nombre"

        sku = "SIN_SKU"
        sku_div = soup.select_one('.product.attribute.sku .value')
        if sku_div:
            sku = sku_div.get_text(strip=True)
        else:
            input_sku = soup.select_one('input[name="product"]')
            if input_sku: sku = "ID_" + input_sku['value']

        marca = "GENERICA"
        th_marca = soup.find('th', string=re.compile('Fabricante|Marca', re.IGNORECASE))
        if th_marca:
            td_marca = th_marca.find_next_sibling('td')
            if td_marca: marca = td_marca.get_text(strip=True)
        
        if marca == "GENERICA":
            posibles = ["BTICINO", "SCHNEIDER", "CONDUMEX", "VIAKON", "IUSA", "ABB", "PHILLIPS", "ROYER", "ARGOS", "3M", "KLEIN TOOLS", "TRUPER"]
            nombre_upper = nombre.upper()
            for m in posibles:
                if m in nombre_upper:
                    marca = m
                    break

        return {'sku': sku, 'nombre': nombre, 'marca': marca, 'precio': precio, 'url': url}

    except Exception as e:
        print(f"      ⚠️ Error parseando: {e}")
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
        datos = extraer_meta_tags(soup, url)

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
            print(f"      ⚠️ Datos incompletos en {url}")
            return False
    except Exception as e:
        print(f"      🔥 Error: {e}")
        return False

def barrer_paginacion(url_base):
    pagina = 1
    total_procesados = 0
    print(f"\n🚀 Barrido Elektron: {url_base}")

    while True:
        # Algunos sitios Magento usan ?p=X, otros /p/X
        # Probamos la forma más estándar primero
        url_actual = f"{url_base}?p={pagina}" if pagina > 1 else url_base
            
        print(f"\n--- 📄 Pag {pagina} ---")
        
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'}
        try:
            res = requests.get(url_actual, headers=headers, timeout=15)
            if res.status_code == 404:
                print("🏁 Fin paginación (404).")
                break
            
            soup = BeautifulSoup(res.text, 'html.parser')
            
            # Selector Robusto: Busca cualquier link que parezca producto (tenga .html y precio cerca)
            # Ojo: Elektron mezcla productos y categorías en los listados
            enlaces = []
            
            # Buscamos elementos de producto específicamente
            product_items = soup.select('.product-item-info')
            
            for item in product_items:
                link_tag = item.select_one('a.product-item-link')
                if link_tag:
                    href = link_tag.get('href')
                    if href: enlaces.append(href)

            urls_productos = list(set(enlaces))

            if not urls_productos:
                print("🏁 No se encontraron productos. Fin.")
                break
            
            print(f"   🎯 {len(urls_productos)} items detectados.")
            
            for link in urls_productos:
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
        # 1. Descubrir categorías dinámicamente cada vez que inicia el ciclo
        cats = descubrir_categorias()
        
        # 2. Barrer cada una
        for cat in cats:
            barrer_paginacion(cat)
            
        print("\n✅ CICLO ELEKTRON TERMINADO. Durmiendo 30 min...")
        time.sleep(1800)
