<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';

class ConfigController {
    private PDO $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    // 1. LISTAR TODAS LAS VARIABLES FINANCIERAS
    public function listarConfiguracion(): void {
        try {
            $stmt = $this->db->query("SELECT * FROM configuracion ORDER BY clave ASC");
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['status' => 'success', 'data' => $data]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    // 2. GUARDAR CAMBIOS (Recibe un array de clave => valor)
    public function actualizarConfiguracion(): void {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (empty($input['config']) || !is_array($input['config'])) {
            http_response_code(400); 
            echo json_encode(['error' => 'Datos inválidos']);
            return;
        }

        try {
            $this->db->beginTransaction();
            
            $sql = "UPDATE configuracion SET valor = ? WHERE clave = ?";
            $stmt = $this->db->prepare($sql);

            foreach ($input['config'] as $clave => $valor) {
                // Validamos que sea número para evitar errores
                $stmt->execute([floatval($valor), $clave]);
            }

            $this->db->commit();
            echo json_encode(['status' => 'success', 'message' => 'Parámetros actualizados correctamente']);

        } catch (Exception $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
?>