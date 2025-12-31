// =========================================================================
// == ARCHIVO DE SECRETOS - NO COMPARTIR NI SUBIR A GITHUB
// =========================================================================
// --> Este archivo se usa para mantener las claves seguras y fuera del código principal.
// --> ¡IMPORTANTE! Asegúrate de añadir "secrets.h" a tu archivo .gitignore.

#pragma once

// --- Contraseña para la Interfaz Web de Diagnóstico ---
// Usuario y contraseña para acceder a la página web local del ESP32 (ej. 192.168.1.100)
#define HTTP_USER "admin"
#define HTTP_PASS "" // <-- ¡Cambia esta contraseña por una más segura!

// --- Contraseña para Actualizaciones OTA Locales (desde Arduino IDE) ---
#define OTA_PASSWORD "" // <-- Contraseña para subir firmware por WiFi desde el IDE

// =========================================================================
// --- CONFIGURACIÓN DE SERVICIOS EN LA NUBE ---
// =========================================================================

// --- Supabase (para estado de suscripción y comandos remotos) ---
#define SUPABASE_ANON_KEY "" // Tu Supabase Anon Key
// Ahora (versión corregida):
#define SUPABASE_URL "https://.supabase.co"

// --- InfluxDB (para guardar las mediciones de energía) ---
#define INFLUXDB_TOKEN ""
// - org: Tu organización en InfluxDB
// - bucket: El bucket (base de datos) donde se guardarán los datos
// - precision: Precisión del timestamp que enviamos ('s' para segundos)
#define INFLUXDB_URL "https://us-east-1-1.aws.cloud2.influxda"
#define INFLUXDB_MEASUREMENT "" // Nombre de la "tabla" en InfluxDB

// --- MQTT Broker (Mosquitto en tu VM) ---
// Usuario y contraseña que configuraste en tu servidor Mosquitto
#define MQTT_USER ""
#define MQTT_PASSWORD ""

// --- URLs para Actualización Remota (OTA por HTTP) ---
// Archivo de texto plano que contiene solo el número de la última versión (ej. "10.1")
#define FIRMWARE_VERSION_URL "http://"
// URL directa al archivo binario compilado del firmware.
#define FIRMWARE_BIN_URL "http://"

