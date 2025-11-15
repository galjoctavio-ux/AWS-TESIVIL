<?php
declare(strict_types=1);

require_once __DIR__ . '/../Services/CalculosService.php';
require_once __DIR__ . '/../Services/ResendService.php';
require_once __DIR__ . '/../Services/GeminiService.php'; // ¡Nuevo invitado!

class CotizacionController {
    private CalculosService $calculosService;
    private GeminiService $geminiService; // ¡Nueva propiedad!

    public function __construct() {
        $this->calculosService = new CalculosService();
        $this->geminiService = new GeminiService(); // Inicializamos
    }

    // 1. PREVISUALIZAR (Sin guardar)
    public function crearCotizacion(): void {
        $inputJSON = file_get_contents('php://input');
        $input = json_decode($inputJSON, true);

        if (!isset($input['items']) || !isset($input['mano_de_obra'])) {
            http_response_code(400); 
            echo json_encode(['error' => 'Faltan datos: items o mano_de_obra']);
            return;
        }

        try {
            $resultado = $this->calculosService->calcularCotizacion(
                $input['items'], 
                $input['mano_de_obra']
            );

            header('Content-Type: application/json');
            echo json_encode([
                'status' => 'success',
                'data' => $resultado
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    // 2. GUARDAR Y ENVIAR (¡AQUÍ ESTÁ LA MAGIA NUEVA!)
    public function guardarCotizacion(): void {
        $inputJSON = file_get_contents('php://input');
        $input = json_decode($inputJSON, true);

        if (!isset($input['items']) || !isset($input['mano_de_obra']) || !isset($input['tecnico_id']) || empty($input['cliente_email'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Faltan datos obligatorios']);
            return;
        }
        
        if(empty($input['mano_de_obra'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Debe agregar mano de obra']);
            return;
        }

        try {
            // A. Cálculo Matemático
            $resultado = $this->calculosService->calcularCotizacion(
                $input['items'],
                $input['mano_de_obra']
            );
            $totales = $resultado['totales'];

            // B. Estimación IA (El Auditor Silencioso)
            // Preparamos una lista simplificada para no gastar tantos tokens ni confundir a la IA
            $itemsSimples = array_map(function($item) {
                return ['nombre' => $item['nombre'], 'cantidad' => $item['cantidad']];
            }, $resultado['desglose_items']); // Usamos los items ya procesados que traen el nombre correcto

            $estimacionIA = 0.0;
            try {
                // Le pasamos los items y las horas totales calculadas
                $estimacionIA = $this->geminiService->estimarCostoProyecto(
                    $itemsSimples, 
                    floatval($totales['horas_totales_calculadas'])
                );
            } catch (Exception $e) {
                error_log("Warning: La auditoría de IA falló, pero continuamos. " . $e->getMessage());
            }

            // C. El Filtro de Seguridad (Reglas de Negocio + IA)
            $reglas = $this->calculosService->validarReglasFinancieras($totales);
            
            $estado = 'ENVIADA';
            $razonDetencion = null;

            // C.1: Revisamos Reglas "Duras" (Configuración)
            if (!$reglas['aprobado']) {
                $estado = 'PENDIENTE_AUTORIZACION';
                $razonDetencion = "REGLAS NEGOCIO: " . $reglas['razones'];
            }
            // C.2: Revisamos Reglas "Inteligentes" (Comparativa IA)
            // Si la IA estima más de $0 (funcionó) Y el precio del técnico es menor al 60% de la IA
            elseif ($estimacionIA > 0 && $totales['total_venta'] < ($estimacionIA * 0.60)) {
                $estado = 'PENDIENTE_AUTORIZACION';
                $diferencia = $estimacionIA - $totales['total_venta'];
                $razonDetencion = "ALERTA IA: Precio muy bajo. Riesgo de pérdida. (IA: $" . number_format($estimacionIA, 2) . " vs Técnico: $" . number_format($totales['total_venta'], 2) . ")";
            }

            // D. Guardado en Base de Datos
            $clienteData = [
                'nombre' => $input['cliente_nombre'] ?? 'Cliente',
                'direccion' => $input['cliente_direccion'] ?? '',
                'email' => $input['cliente_email']
            ];
            $tecnicoNombre = $input['tecnico_nombre'] ?? 'Técnico';

            $uuid = $this->calculosService->guardarCotizacion(
                $resultado, 
                $input['tecnico_id'], 
                $tecnicoNombre,
                $clienteData,
                $estado,           // <-- Pasamos el estado decidido
                $razonDetencion,   // <-- Pasamos la razón (si la hay)
                $estimacionIA      // <-- Guardamos qué dijo la IA para que el admin compare
            );

            // E. Acciones Post-Guardado (Correos)
            $mensajeRespuesta = "";
            
            if ($estado === 'ENVIADA') {
                // Flujo Normal: Se envía al cliente
                $resendService = new ResendService();
                $resendService->enviarCotizacion($uuid, $input['cliente_email'], $clienteData['nombre']);
                $mensajeRespuesta = 'Cotización enviada correctamente al cliente.';
            } else {
                // Flujo Detenido: NO se envía al cliente.
                // TODO: Aquí podrías agregar un envío de correo al ADMIN avisando que hay una pendiente.
                $mensajeRespuesta = '🛑 Cotización DETENIDA para revisión administrativa. Razón: ' . $razonDetencion;
            }

            echo json_encode([
                'status' => 'success',
                'message' => $mensajeRespuesta,
                'estado_final' => $estado, // Para que el Frontend sepa qué icono mostrar
                'uuid' => $uuid,
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error: ' . $e->getMessage()]);
        }
    }

    // --- MANTENEMOS TUS MÉTODOS AUXILIARES INTACTOS ---

    public function listarRecursos(): void {
        try {
            $recursos = $this->calculosService->obtenerRecursosActivos();
            header('Content-Type: application/json');
            echo json_encode(['status' => 'success', 'data' => $recursos]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function nuevoRecurso(): void {
        $input = json_decode(file_get_contents('php://input'), true);
        $precio = isset($input['costo']) ? floatval($input['costo']) : (isset($input['precio']) ? floatval($input['precio']) : 0.0);

        if (empty($input['nombre']) || empty($input['unidad'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Nombre y Unidad son obligatorios']);
            return;
        }

        try {
            $estatus = $input['estatus'] ?? 'PENDIENTE_TECNICO';
            $nuevoRecurso = $this->calculosService->crearNuevoRecurso($input['nombre'], $input['unidad'], $precio, $estatus);
            header('Content-Type: application/json');
            echo json_encode(['status' => 'success', 'data' => $nuevoRecurso]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function listarInventarioAdmin(): void {
        try {
            $recursos = $this->calculosService->obtenerInventarioTotal();
            header('Content-Type: application/json');
            echo json_encode(['status' => 'success', 'data' => $recursos]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function aprobarRecurso(): void {
        $input = json_decode(file_get_contents('php://input'), true);
        if (empty($input['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Falta ID']); return;
        }
        try {
            $this->calculosService->aprobarRecurso((int)$input['id']);
            echo json_encode(['status' => 'success', 'message' => 'Aprobado']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function editarRecurso(): void {
        $input = json_decode(file_get_contents('php://input'), true);
        if (empty($input['id']) || empty($input['nombre']) || !isset($input['precio']) || !isset($input['tiempo'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Datos incompletos']); return;
        }
        try {
            $this->calculosService->actualizarRecurso((int)$input['id'], $input['nombre'], floatval($input['precio']), (int)$input['tiempo']);
            echo json_encode(['status' => 'success', 'message' => 'Actualizado']);
        } catch (Exception $e) { /* ... */ }
    }

    public function eliminarRecurso(): void {
        $input = json_decode(file_get_contents('php://input'), true);
        if (empty($input['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Falta ID']); return;
        }
        try {
            $this->calculosService->eliminarRecurso((int)$input['id']);
            echo json_encode(['status' => 'success', 'message' => 'Eliminado']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function listarCotizacionesAdmin(): void {
        try {
            $cotizaciones = $this->calculosService->obtenerListadoCotizaciones();
            header('Content-Type: application/json');
            echo json_encode(['status' => 'success', 'data' => $cotizaciones]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function exportarMaterialesTxt(): void {
        if (empty($_GET['id'])) {
            http_response_code(400); echo "Error: Falta ID."; return;
        }
        try {
            $texto = $this->calculosService->obtenerListaMaterialesExportar((int)$_GET['id']);
            header('Content-Type: text/plain; charset=utf-8');
            echo $texto;
        } catch (Exception $e) {
            http_response_code(500); echo "Error: " . $e->getMessage();
        }
    }
    // 11. ADMIN: AUTORIZAR COTIZACIÓN
    public function autorizarCotizacion(): void {
        $input = json_decode(file_get_contents('php://input'), true);
        if (empty($input['id'])) {
             http_response_code(400); echo json_encode(['error' => 'Falta ID']); return;
        }

        try {
            // 1. Cambiar estado a ENVIADA
            $this->calculosService->actualizarEstadoCotizacion((int)$input['id'], 'ENVIADA');
            
            // 2. Disparar el envío del correo (Resend)
            $datos = $this->calculosService->obtenerDatosEnvio((int)$input['id']);
            if ($datos) {
                $resend = new ResendService();
                $resend->enviarCotizacion($datos['uuid'], $datos['cliente_email'], $datos['cliente_nombre']);
            }

            echo json_encode(['status' => 'success', 'message' => 'Cotización autorizada y enviada al cliente.']);
        } catch (Exception $e) {
            http_response_code(500); echo json_encode(['error' => 'Error interno: ' . $e->getMessage()]);
        }
    }

    // 12. ADMIN: RECHAZAR COTIZACIÓN
    public function rechazarCotizacion(): void {
        $input = json_decode(file_get_contents('php://input'), true);
        if (empty($input['id'])) {
             http_response_code(400); echo json_encode(['error' => 'Falta ID']); return;
        }

        try {
            // Simplemente marcamos como RECHAZADA (No se envía correo)
            $this->calculosService->actualizarEstadoCotizacion((int)$input['id'], 'RECHAZADA');
            echo json_encode(['status' => 'success', 'message' => 'Cotización marcada como rechazada.']);
        } catch (Exception $e) {
            http_response_code(500); echo json_encode(['error' => $e->getMessage()]);
        }
    }
    // 13. ADMIN: FINALIZAR PROYECTO (Cierre Financiero)
    public function finalizarProyecto(): void {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (empty($input['id']) || !isset($input['gasto_material']) || !isset($input['gasto_mo'])) {
             http_response_code(400); 
             echo json_encode(['error' => 'Faltan datos: id, gasto_material o gasto_mo']); 
             return;
        }

        try {
            $this->calculosService->finalizarProyecto(
                (int)$input['id'], 
                floatval($input['gasto_material']), 
                floatval($input['gasto_mo'])
            );
            echo json_encode(['status' => 'success', 'message' => 'Proyecto cerrado y utilidad calculada.']);
        } catch (Exception $e) {
            http_response_code(500); 
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
    // 14. ADMIN: CLONAR COTIZACIÓN
    public function clonarCotizacion(): void {
        $input = json_decode(file_get_contents('php://input'), true);
        if (empty($input['id'])) {
             http_response_code(400); echo json_encode(['error' => 'Falta ID']); return;
        }

        try {
            $res = $this->calculosService->clonarCotizacion((int)$input['id']);
            echo json_encode(['status' => 'success', 'data' => $res]);
        } catch (Exception $e) {
            http_response_code(500); echo json_encode(['error' => $e->getMessage()]);
        }
    }
    // 15. ADMIN: REENVIAR CORREO MANUALMENTE
    public function reenviarCorreo(): void {
        $input = json_decode(file_get_contents('php://input'), true);
        if (empty($input['id'])) {
             http_response_code(400); echo json_encode(['error' => 'Falta ID']); return;
        }

        try {
            $datos = $this->calculosService->obtenerDatosEnvio((int)$input['id']);
            
            if ($datos) {
                $resend = new ResendService();
                $resend->enviarCotizacion($datos['uuid'], $datos['cliente_email'], $datos['cliente_nombre']);
                echo json_encode(['status' => 'success', 'message' => 'Correo reenviado exitosamente a ' . $datos['cliente_email']]);
            } else {
                http_response_code(404); echo json_encode(['error' => 'Cotización no encontrada.']);
            }
        } catch (Exception $e) {
            http_response_code(500); echo json_encode(['error' => 'Error al enviar: ' . $e->getMessage()]);
        }
    }
    // 16. EDITAR/ACTUALIZAR COTIZACIÓN EXISTENTE
    public function actualizarCotizacion(): void {
        $input = json_decode(file_get_contents('php://input'), true);

        if (empty($input['id']) || !isset($input['items']) || !isset($input['mano_de_obra'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Faltan datos para actualizar']);
            return;
        }

        try {
            $this->calculosService->actualizarContenidoCotizacion(
                (int)$input['id'],
                $input['items'],
                $input['mano_de_obra'],
                $input['cliente_email'],
                $input['cliente_nombre'] ?? 'Cliente'
            );

            // Opcional: Reenviar correo automáticamente al editar
            $resend = new ResendService();
            // Necesitamos el UUID para el link del PDF
            $datos = $this->calculosService->obtenerCotizacionPorUuid(''); // Truco: necesitamos una funcion buscarPorID
            // Por simplicidad, en la respuesta mandamos "OK" y el frontend avisa.
            
            echo json_encode(['status' => 'success', 'message' => 'Cotización actualizada correctamente.']);

        } catch (Exception $e) {
            http_response_code(500); echo json_encode(['error' => $e->getMessage()]);
        }
    }
    
   
    // 18. ADMIN: OBTENER DETALLE PARA EDICIÓN
    public function obtenerDetalleEdicion(): void {
        if (empty($_GET['id'])) { 
            http_response_code(400); echo json_encode(['error' => 'Falta ID']); return; 
        }

        try {
            $datos = $this->calculosService->obtenerDetalleCotizacionPorId((int)$_GET['id']);
            if ($datos) {
                echo json_encode(['status' => 'success', 'data' => $datos]);
            } else {
                http_response_code(404); echo json_encode(['error' => 'No encontrada']);
            }
        } catch (Exception $e) {
            http_response_code(500); echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
?>