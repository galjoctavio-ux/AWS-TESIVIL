<?php
declare(strict_types=1);

require_once __DIR__ . '/../Services/GeminiService.php';

class AiController {
    private GeminiService $geminiService;

    public function __construct() {
        $this->geminiService = new GeminiService();
    }

    public function sugerirMateriales(): void {
        // Asegurar que siempre devolvemos JSON
        header('Content-Type: application/json; charset=UTF-8');
        
        try {
            $input = json_decode(file_get_contents('php://input'), true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'error' => 'JSON inválido: ' . json_last_error_msg()
                ]);
                return;
            }

            if (empty($input['materiales']) || !is_array($input['materiales'])) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'error' => 'Se requiere un array de "materiales"'
                ]);
                return;
            }

            $sugerencias = $this->geminiService->sugerirMaterialesFaltantes($input['materiales']);
            
            echo json_encode([
                'status' => 'success',
                'sugerencias' => $sugerencias
            ]);

        } catch (Exception $e) {
            error_log("Error en sugerirMateriales: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'error' => 'Error llamando a la IA: ' . $e->getMessage()
            ]);
        }
    }
}
?>