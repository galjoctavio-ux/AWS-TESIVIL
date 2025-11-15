<?php
// Incluimos la clase de conexión
require_once 'config/database.php';

echo "--- INICIANDO PRUEBA DE CONEXIÓN ---\n";

$database = new Database();
$db = $database->getConnection();

if ($db) {
    echo "✅ Conexión a MariaDB exitosa.\n";
    
    // Prueba de lectura: Leer el IVA de la tabla configuracion
    echo "🔍 Buscando configuración de IVA...\n";
    
    $query = "SELECT valor FROM configuracion WHERE clave = 'PCT_IVA' LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $row = $stmt->fetch();
    
    if ($row) {
        echo "✅ Lectura Exitosa. El IVA configurado es: " . $row['valor'] . "%\n";
    } else {
        echo "❌ Error: No se encontró el dato del IVA (¿Tabla vacía?).\n";
    }

} else {
    echo "❌ Falló la conexión.\n";
}
echo "--- FIN DE PRUEBA ---\n";
?>
