<?php
declare(strict_types=1);

class Database {
    // Configuración de la Base de Datos
    private string $host = 'localhost';
    private string $db_name = 'coti_lete'; // La BD que creamos en el paso 1
    private string $username = 'admin_coti';     // Tu usuario de BD (cámbialo si es otro)
    private string $password = 'mirimon18'; // <--- ¡PON TU PASSWORD AQUÍ!
    public ?PDO $conn = null;

    public function getConnection(): ?PDO {
        $this->conn = null;

        try {
            // Data Source Name (DSN)
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4";
            
            // Opciones para modo estricto y manejo de errores profesional
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];

            $this->conn = new PDO($dsn, $this->username, $this->password, $options);

        } catch(PDOException $exception) {
            // En producción esto debería ir a un log, no a la pantalla
            echo "Error de conexión: " . $exception->getMessage();
        }

        return $this->conn;
    }
}
?>
