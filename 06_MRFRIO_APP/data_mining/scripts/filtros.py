import re

# 1. REGLAS PARA CORESA (Solo Minisplits)
def es_minisplit_coresa(titulo):
    t = titulo.upper()
    # Debe decir MINISPLIT. No debe ser refacción, ni control, ni base.
    if "MINISPLIT" in t and not any(x in t for x in ["BASE", "CONTROL", "TARJETA", "MOTOR", "SENSOR"]):
        return True
    return False

# 2. REGLAS PARA REACSA Y FRIO REFACCIONES (Solo Accesorios)
# Palabras clave que SI queremos
KEYWORDS_ACCESORIOS = [
    "CINTA", "MOMIA", "ALUMINIO", # Cintas
    "BASE", "SOPORTE", "MENSULA", "AMORTIGUA", # Soportes
    "BOMBA", "CONDENSAD", # Bombas
    "CAPACITOR", # Capacitores
    "CONTROL REMOTO", # Controles
    "GAS", "REFRIGERANTE", "R22", "R-22", "R410", "R-410", "R134", "R-134", "R32", "R-32", "141B", # Gases y Limpiadores
    "KIT", "TUBERIA", "INSTALACI", # Kits
    "ROLLO", "FLEXIBLE", "COBRE", # Tuberias (Flexible/Rollo)
    "SOLDADURA", "PLATA", # Soldadura
    "ARMAFLEX", "AISLANTE", # Aislantes
    "FLUSHING", "LIMPIADOR", # Limpieza
    "TUERCA" # Tuercas
]

# Palabras que NO queremos en accesorios (Para evitar aires acondicionados)
EXCLUDE_ACCESORIOS = [
    "MINISPLIT", "EVAPORADORA", "CONDENSADORA", "PISO TECHO", "FAN COIL", "PAQUETE", "VENTANA"
]

def es_accesorio_valido(titulo):
    t = titulo.upper()
    
    # 1. Primero: Si es un equipo de Aire Acondicionado, LO DESCARTAMOS
    for bad in EXCLUDE_ACCESORIOS:
        if bad in t:
            return False
            
    # 2. Segundo: Debe tener al menos una palabra de la lista de accesorios
    for good in KEYWORDS_ACCESORIOS:
        if good in t:
            return True
            
    return False