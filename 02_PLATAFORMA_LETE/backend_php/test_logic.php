<?php
require_once 'src/Services/CalculosService.php';

echo "--- SIMULADOR DE COTIZACIÓN (COTI-LETE) ---\n";

$servicio = new CalculosService();

// Simulamos que el Técnico pide:
// 100 metros de Cable (ID 1)
// Y dice que tardará 8 horas
$listaMateriales = [
    ['id_recurso' => 1, 'cantidad' => 100] 
];
$horas = 8.0;

echo "📝 Calculando cotización para 100m de cable y 8 horas de trabajo...\n";

try {
    $resultado = $servicio->calcularCotizacion($listaMateriales, $horas);
    
    $t = $resultado['totales'];
    
    echo "\n--- RESULTADOS FINALES ---\n";
    echo "💰 Costo Materiales (CD): $" . number_format($t['materiales_cd'], 2) . "\n";
    echo "👷 Costo Mano Obra (CD):  $" . number_format($t['mano_obra_cd'], 2) . "\n";
    echo "🛠️  Herramienta/Vehículo: $" . number_format($t['herramienta'] + $t['vehiculo'], 2) . "\n";
    echo "--------------------------\n";
    echo "💵 Subtotal (con Utilidad): $" . number_format($t['subtotal'], 2) . "\n";
    echo "🏛️  IVA:                     $" . number_format($t['iva'], 2) . "\n";
    echo "✅ PRECIO VENTA FINAL:      $" . number_format($t['total_venta'], 2) . "\n";

    echo "\n--- AUDITORÍA (Detalle Item 1) ---\n";
    $item = $resultado['desglose_items'][0];
    echo "Material: " . $item['nombre'] . "\n";
    echo "Precio Base: $" . $item['precio_base'] . "\n";
    echo "Colchón Aplicado: " . $item['colchon_pct'] . "% (Por antigüedad)\n";
    echo "Desperdicio: " . $item['desperdicio_pct'] . "%\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
