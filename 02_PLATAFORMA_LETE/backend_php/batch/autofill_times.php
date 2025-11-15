<?php
// Script para ejecutar desde Cron (ej. php /home/galj_octavio/backend_coti/batch/autofill_times.php)

declare(strict_types=1);

// Cargar dependencias
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../src/Services/GeminiService.php'; // Reutilizamos tu servicio

class BatchAutoFill {
    private PDO $db;
    private GeminiService $gemini;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->gemini = new GeminiService();
    }

    public function run(): void {
        echo "--- Iniciando Batch de Tiempos IA ---\n";

        // 1. Buscar todos los materiales sin tiempo asignado
        $stmt = $this->db->query("SELECT id, nombre FROM recursos WHERE tiempo_instalacion_min = 0 AND estatus = 'APROBADO' AND activo = 1");
        $materiales = $stmt->fetchAll();

        if (empty($materiales)) {
            echo "No hay materiales nuevos que procesar. Saliendo.\n";
            return;
        }

        echo "Se encontraron " . count($materiales) . " materiales para procesar...\n";

        // 2. Iterar sobre cada uno
        foreach ($materiales as $material) {
            $id = $material['id'];
            $nombre = $material['nombre'];

            try {
                // 3. Preguntar a la IA
                echo "Procesando: '$nombre' (ID: $id)...\n";
                $prompt = "Eres un electricista experto. ¿Cuál es el tiempo de instalación promedio en MINUTOS para una unidad de este material?
Material: \"" . $nombre . "\"
Responde únicamente con el número entero de minutos. Si no estás seguro, responde '0'.
Ejemplo de respuesta: 15";
                
                // Usamos una función 'llamarGemini' (que adaptaremos de tu servicio)
                $respuestaTexto = $this->llamarGemini($prompt);

                // 4. Limpiar y validar la respuesta (debe ser un número)
                $minutos = intval(preg_replace('/[^0-9]/', '', $respuestaTexto)); // Limpia cualquier texto extra

                if ($minutos > 0) {
                    // 5. Guardar en la BD
                    $updateStmt = $this->db->prepare("UPDATE recursos SET tiempo_instalacion_min = ? WHERE id = ?");
                    $updateStmt->execute([$minutos, $id]);
                    echo "   -> ÉXITO: '$nombre' actualizado a $minutos minutos.\n";
                } else {
                    echo "   -> OMITIDO: La IA no dio un tiempo válido (Respuesta: $respuestaTexto).\n";
                }

            } catch (Exception $e) {
                echo "   -> ERROR procesando ID $id: " . $e->getMessage() . "\n";
            }
            
            sleep(30); // Pausa de 2 segundos para no saturar la API de Gemini
        }
        echo "--- Batch completado ---\n";
    }

    /**
     * Adaptación de tu función 'sugerirMaterialesFaltantes' para un prompt genérico
     */
    private function llamarGemini(string $prompt): string {
        $data = [
            'contents' => [['parts' => [['text' => $prompt]]]],
            'generationConfig' => [
                'temperature' => 0.2, // Queremos respuestas directas, no creativas
                'maxOutputTokens' => 2048, // Solo necesitamos un número
            ],
            // --- ¡ESTE ERA EL BLOQUE FALTANTE! ---
            'safetySettings' => [
                ['category' => 'HARM_CATEGORY_HARASSMENT', 'threshold' => 'BLOCK_NONE'],
                ['category' => 'HARM_CATEGORY_HATE_SPEECH', 'threshold' => 'BLOCK_NONE'],
                ['category' => 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'threshold' => 'BLOCK_NONE'],
                ['category' => 'HARM_CATEGORY_DANGEROUS_CONTENT', 'threshold' => 'BLOCK_NONE'],
            ]
            // (Settings de seguridad omitidos por brevedad, tu servicio ya los tiene)
        ];

        // Usar la URL y API Key de tu GeminiService
        // (Nota: Tendríamos que hacer públicas la $apiKey y $apiUrl o re-instanciarlas aquí)
        // Para este script, es más fácil re-implementar el cURL básico.
        
        $apiKey = 'AIzaSyCgkr08EEaYfolg8H9AIrep3y_vn3V0Kz8'; // Tu API Key
        $apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' . $apiKey;

        $ch = curl_init($apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            throw new \Exception("Error de Gemini API (HTTP $httpCode): " . $response);
        }

        $responseData = json_decode($response, true);
        return $responseData['candidates'][0]['content']['parts'][0]['text'] ?? '0';
    }
}

// --- Ejecutar el script ---
$batch = new BatchAutoFill();
$batch->run();

?>