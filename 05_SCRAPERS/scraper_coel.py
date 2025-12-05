import requests
from bs4 import BeautifulSoup
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

PROVEEDOR_ID = 13
LIMIT_PRODUCTOS_PRUEBA = 0  # 0 = Sin límite (Producción)

# Lista de agentes para rotar y parecer usuarios distintos
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
]

# --- FUNCIONES DE BASE DE DATOS ---

def obtener_conexion():
    return mysql.connector.connect(**DB_CONFIG)

def obtener_info_bd(url):
    conn = None
    try:
        conn = obtener_conexion()
        cursor = conn.cursor(dictionary=True)
        # IMPORTANTE: Asegúrate de tener un índice en 'url_producto' para velocidad
        sql = "SELECT id, precio_detectado FROM scraping_staging WHERE url_producto = %s AND proveedor_id = %s LIMIT 1"
        cursor.execute(sql, (url, PROVEEDOR_ID))
        return cursor.fetchone()
    except mysql.connector.Error as err:
        print(f"      ⚠️ DB Error (Select): {err}")
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
    except mysql.connector.Error as err:
        print(f"      ❌ DB Error (Update): {err}")
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
        print(f"      ❌ DB Error (Insert): {err}")
    finally:
        conn.close()

# --- HERRAMIENTAS DE SCRAPING ---

def get_headers():
    return {'User-Agent': random.choice(USER_AGENTS)}

def calcular_tiempo_espera():
    """Tiempos optimizados para velocidad sin bloqueo"""
    hora_actual = datetime.now().hour
    if 0 <= hora_actual < 6: # Madrugada
        espera = random.uniform(1.0, 3.0)
        modo = "🌙 NOCHE"
    else: # Día
        espera = random.uniform(3.5, 7.5)
        modo = "☀️ DÍA"
    return espera, modo

def limpiar_precio(texto):
    if not texto: return 0.0
    limpio = re.sub(r'[^\d.]', '', texto)
    try:
        return float(limpio)
    except:
        return 0.0

def descubrir_categorias():
    """Entra al Home y busca enlaces de categorías dinámicamente"""
    url_home = "https://www.coelpuebla.com.mx/"
    print(f"🕵️‍♀️ ESCANEANDO SITEMAP EN: {url_home} ...")
    
    try:
        res = requests.get(url_home, headers=get_headers(), timeout=20)
        if res.status_code != 200:
            print("❌ No se pudo entrar al Home.")
            return []
            
        soup = BeautifulSoup(res.text, 'html.parser')
        enlaces = set()
        
        # Busca enlaces que contengan '/categorias/'
        tags_a = soup.select('a[href*="/categorias/"]')
        
        for a in tags_a:
            href = a.get('href')
            if href:
                if not href.startswith('http'):
                    full_url = "https://www.coelpuebla.com.mx" + href.lstrip('/')
                else:
                    full_url = href
                
                # Filtrar enlaces basura o duplicados con fragmentos (#)
                if '/categorias/' in full_url and '#' not in full_url:
                    enlaces.add(full_url)
        
        lista = list(enlaces)
        print(f"✅ Se descubrieron {len(lista)} categorías automáticamente.")
        return lista

    except Exception as e:
        print(f"🔥 Error en autodescubrimiento: {e}")
        return []

def extraer_datos_html(soup, url):
    try:
        # 1. NOMBRE
        nombre_tag = soup.select_one('h1.mayus')
        if not nombre_tag: nombre_tag = soup.select_one('.product-info-main h1')
        nombre = nombre_tag.get_text(strip=True).replace("Productos: ", "") if nombre_tag else "SIN NOMBRE"

        # 2. SKU (Múltiples selectores por si cambia el diseño)
        sku = "SIN_SKU"
        selectores_sku = ['.name p.big strong', '.sku_wrapper .sku', '.product-info-main .sku']
        for sel in selectores_sku:
            t = soup.select_one(sel)
            if t:
                sku = t.get_text(strip=True)
                break

        # 3. PRECIO
        precio = 0.0
        selectores_precio = ['.price.big strong', '.product-info-main .price', '.special-price .price']
        for sel in selectores_precio:
            p_tag = soup.select_one(sel)
            if p_tag:
                precio = limpiar_precio(p_tag.get_text())
                if precio > 0: break

        # 4. MARCA (Inferencia simple)
        marca = "GENERICA"
        posibles_marcas = ["SCHNEIDER", "CONDUMEX", "BTICINO", "SQUARE D", "ARGOS", "VIAKON", "IUSA", "3M", "BURNDY", "PHILLIPS", "KLEIN TOOLS"]
        nombre_upper = nombre.upper()
        for m in posibles_marcas:
            if m in nombre_upper:
                marca = m
                break

        return {'sku': sku, 'nombre': nombre, 'marca': marca, 'precio': precio, 'url': url}
    except Exception as e:
        print(f"      ⚠️ Parse Error: {e}")
        return None

def procesar_producto(url):
    tiempo, modo = calcular_tiempo_espera()
    info_bd = obtener_info_bd(url)
    existe = info_bd is not None
    
    print(f"   [{modo} {tiempo:.1f}s] {'Revisando' if existe else 'Nuevo'} -> {url[-35:]}...")
    time.sleep(tiempo)
    
    try:
        res = requests.get(url, headers=get_headers(), timeout=15)
        if res.status_code != 200: 
            print(f"      ⚠️ Status {res.status_code}")
            return False

        soup = BeautifulSoup(res.text, 'html.parser')
        datos = extraer_datos_html(soup, url)

        if datos and datos['precio'] > 0:
            if existe:
                id_reg = info_bd['id']
                precio_bd = float(info_bd['precio_detectado'])
                # Detectar cambio > 1 peso
                if abs(datos['precio'] - precio_bd) > 1.0:
                    actualizar_producto(id_reg, datos['precio'], True)
                else:
                    actualizar_producto(id_reg, datos['precio'], False)
            else:
                guardar_nuevo_staging(datos)
            return True
        else:
            print(f"      ⚠️ Datos vacíos o Precio 0")
            return False

    except Exception as e:
        print(f"      🔥 Request Error: {e}")
        return False

def barrer_paginacion(url_base):
    pagina = 1
    errores_consecutivos = 0
    print(f"\n🚀 CATEGORÍA: {url_base}")

    while True:
        url_actual = f"{url_base}?p={pagina}"
        print(f"\n--- 📄 Pag {pagina} ---")
        
        try:
            res = requests.get(url_actual, headers=get_headers(), timeout=20)
            
            # Chequeos de fin de paginación
            if res.status_code == 404:
                print("🏁 Error 404 (Fin).")
                break
            # Redirección a la home o misma página suele indicar fin
            if res.url != url_actual and pagina > 1:
                print("🏁 Redirección detectada (Fin).")
                break
            
            if res.status_code != 200:
                print(f"⚠️ Error servidor {res.status_code}. Reintentando...")
                errores_consecutivos += 1
                if errores_consecutivos > 3: break
                time.sleep(10)
                continue

            soup = BeautifulSoup(res.text, 'html.parser')
            
            # Recolección de enlaces
            enlaces = []
            items = soup.select('.producto .img a') 
            if not items: items = soup.select('.products-list .product-item-photo') # Fallback lista
            if not items: items = soup.select('a[href*="/producto/"]') # Fallback general

            for item in items:
                href = item.get('href')
                if href:
                    if not href.startswith('http'):
                        href = "https://www.coelpuebla.com.mx" + href.lstrip('/')
                    if '/productos/' in href or '/producto/' in href: 
                         enlaces.append(href)

            urls_productos = list(set(enlaces))

            if not urls_productos:
                print("🏁 No se encontraron productos (Fin).")
                break
                
            print(f"   🎯 {len(urls_productos)} items detectados.")
            errores_consecutivos = 0
            
            for link in urls_productos:
                if LIMIT_PRODUCTOS_PRUEBA > 0 and LIMIT_PRODUCTOS_PRUEBA < 100: pass 
                procesar_producto(link)
            
            pagina += 1
            
        except Exception as e:
            print(f"❌ Error crítico paginación: {e}")
            errores_consecutivos += 1
            time.sleep(10)
            if errores_consecutivos > 3: break

# --- BLOQUE PRINCIPAL ---
if __name__ == "__main__":
    print("🤖 SCRAPER COEL V3 - LETE SYSTEMS")
    
    # 1. Intentar descubrir categorías dinámicamente
    lista_descubierta = descubrir_categorias()
    
    if lista_descubierta:
        urls_categorias = lista_descubierta
    else:
        print("⚠️ Fallo auto-descubrimiento. Usando lista manual.")
        urls_categorias = [
            "https://www.coelpuebla.com.mx/categorias/21/cables",
            "https://www.coelpuebla.com.mx/categorias/31/tuberia",
            "https://www.coelpuebla.com.mx/categorias/2/interruptores",
            "https://www.coelpuebla.com.mx/categorias/4/centros-de-carga",
            "https://www.coelpuebla.com.mx/categorias/14/iluminacion-interior"
        ]

    while True:
        random.shuffle(urls_categorias) # Mezclar para no seguir patrón robot
        print(f"\n📋 Iniciando ciclo sobre {len(urls_categorias)} categorías...")
        
        for cat in urls_categorias:
            barrer_paginacion(cat)
            
        print("\n✅ CICLO COMPLETO TERMINADO. Durmiendo 45 min...")
        time.sleep(2700)