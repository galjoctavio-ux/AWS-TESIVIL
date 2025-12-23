import re

# --- CONFIGURACIÓN DE FILTRADO ---

# 1. LISTA NEGRA: Si tiene CUALQUIERA de estas palabras, se descarta inmediatamente.
# Esto elimina falsos positivos como "Manifold para R410A" o "Bomba de Vacio".
BLACKLIST = [
    "VACIO", "VACÍO", "MANIFOLD", "MANGUERA", "RECUPERADORA", "DETECTOR", 
    "ACEITE", "VALVULA", "VÁLVULA", "EXPANSION", "SOLENOIDE", "BOLA", 
    "FILTRO DESHIDRATADOR", "QUEMADOR", "MOTOR", "ASPA", "TURBINA", 
    "TARJETA", "SENSOR", "TERMOSTATO", "CAPILARES", "COMPRESOR",
    "CONTACTORES", "RELEVADOR", "TRANSFORMADOR", "PROTECTOR", "FUSIBLE"
]

# Excepciones a la regla negra (cosas que podrían parecer malas pero son buenas)
# Ejemplo: "Valvula" es mala, pero si pediste valvulas de servicio especificas, aquí se ajusta.
# En tu caso, pediste "bombas de condensado", así que "bomba" está en whitelist condicional.

def es_minisplit_coresa(titulo):
    t = titulo.upper()
    # Debe ser explícitamente un equipo
    if "MINISPLIT" not in t: return False
    
    # Filtro extra para Coresa: Evitar refacciones que digan "Para Minisplit"
    if any(bad in t for bad in ["BASE", "CONTROL", "KIT", "TUBERIA", "SOPORTE"]):
        return False
        
    return True

def es_accesorio_valido(titulo):
    t = titulo.upper()
    
    # 1. REGLA DE ORO: No Aire Acondicionado en los scrapers de accesorios
    if any(x in t for x in ["MINISPLIT", "EVAPORADORA", "CONDENSADORA", "PAQUETE", "FAN COIL"]):
        return False

    # 2. FILTRO DE LISTA NEGRA (Elimina herramientas y refacciones internas)
    # Excepción: Bombas (porque "Bomba" suele ser "Bomba de vacio" que es mala, 
    # pero "Bomba de condensado" es buena).
    if "BOMBA" not in t: # Si NO es bomba, aplicamos blacklist general
        if any(bad in t for bad in BLACKLIST):
            return False
    else:
        # Si ES bomba, debe ser EXCLUSIVAMENTE de condensado
        if "CONDENSAD" not in t: # Si dice bomba pero no condensado (ej. Bomba Vacio) -> Fuera
            return False

    # 3. LISTA BLANCA ESTRICTA (Solo lo que pediste)
    
    # Cintas
    if "CINTA" in t and ("MOMIA" in t or "ALUMINIO" in t): return True
    
    # Bases / Soportes (Sin confundir con soportes de motor internos)
    if ("BASE" in t or "SOPORTE" in t or "MENSULA" in t) and "MOTOR" not in t: return True
    if "AMORTIGUADOR" in t and "CONDENSADORA" in t: return True
    
    # Bombas (Ya filtrado arriba, aquí confirmamos)
    if "BOMBA" in t and "CONDENSAD" in t: return True
    
    # Capacitores
    if "CAPACITOR" in t and ("UF" in t or "MFD" in t): return True
    
    # Control Remoto
    if "CONTROL" in t and "REMOTO" in t: return True
    
    # Gases (Debe decir GAS o REFRIGERANTE explícitamente para evitar "Manifold R410")
    if ("GAS" in t or "REFRIGERANTE" in t or "BOYA" in t or "LATA" in t):
        # Y debe tener el tipo de gas
        if re.search(r'R-?\s*(32|410|22|134|141)', t): return True
        if "141B" in t: return True
    
    # Kits
    if "KIT" in t and ("INSTALA" in t or "TUBERIA" in t): return True
    
    # Tubería Cobre (Solo flexibles/rollos)
    if "COBRE" in t and ("ROLLO" in t or "FLEXIBLE" in t): return True
    
    # Soldadura
    if "SOLDADURA" in t: return True
    if "VARILLA" in t and "PLATA" in t: return True
    
    # Aislantes
    if "ARMAFLEX" in t or "AISLANTE" in t or "K-FLEX" in t: return True
    
    # Limpieza
    if "FLUSH" in t or "LIMPIADOR" in t: return True
    
    # Tuercas
    if "TUERCA" in t and "LATON" in t: return True # "Laton" ayuda a filtrar tuercas comunes

    return False