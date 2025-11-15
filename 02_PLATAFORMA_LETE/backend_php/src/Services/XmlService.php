<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';

class XmlService {
    private PDO $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function procesarXml(string $xmlContent): array {
        libxml_use_internal_errors(true);
        $xml = simplexml_load_string($xmlContent);
        if ($xml === false) throw new Exception("El archivo no es un XML válido.");

        $ns = $xml->getNamespaces(true);
        $xml->registerXPathNamespace('cfdi', $ns['cfdi']);
        
        // 1. OBTENER LA FECHA REAL DE LA FACTURA (¡NUEVO!)
        $comprobante = $xml->xpath('//cfdi:Comprobante')[0];
        $fechaComprobante = (string)$comprobante['Fecha']; // Ej: "2025-11-13T12:00:00"

        $emisor = $xml->xpath('//cfdi:Emisor')[0];
        $rfc = (string)$emisor['Rfc'];
        $razonSocial = (string)$emisor['Nombre'];

        if (empty($rfc)) throw new Exception("Sin RFC emisor");

        $proveedorId = $this->obtenerOcrearProveedor($rfc, $razonSocial);
        $conceptos = $xml->xpath('//cfdi:Conceptos/cfdi:Concepto');
        $resumen = [
            'proveedor' => $razonSocial,
            'items_procesados' => 0,
            'nuevos_auto_creados' => 0,
            'precios_actualizados' => 0,
            'items_ignorados_viejos' => 0 // ¡NUEVO!
        ];

        foreach ($conceptos as $concepto) {
            $sku = (string)$concepto['NoIdentificacion'];
            $descripcion = (string)$concepto['Descripcion'];
            $precioUnitario = floatval($concepto['ValorUnitario']);
            if (empty($sku)) $sku = 'GEN-' . substr(md5($descripcion), 0, 8);

            // 2. PASAR LA FECHA A LA LÓGICA (¡NUEVO!)
            $accion = $this->actualizarMaterialProveedor($proveedorId, $sku, $descripcion, $precioUnitario, $fechaComprobante);
            
            // 3. ACTUALIZAR RESUMEN (¡NUEVO!)
            $resumen['items_procesados']++;
            if ($accion === 'NUEVO_AUTO_CREADO') $resumen['nuevos_auto_creados']++;
            if ($accion === 'ACTUALIZADO') $resumen['precios_actualizados']++;
            if ($accion === 'SKIPPED_OLD') $resumen['items_ignorados_viejos']++;
        }
        return $resumen;
    }

    private function obtenerOcrearProveedor(string $rfc, string $razonSocial): int {
        $stmt = $this->db->prepare("SELECT id FROM proveedores WHERE rfc = ? LIMIT 1");
        $stmt->execute([$rfc]);
        $row = $stmt->fetch();
        if ($row) return intval($row['id']);
        $stmtInsert = $this->db->prepare("INSERT INTO proveedores (rfc, razon_social) VALUES (?, ?)");
        $stmtInsert->execute([$rfc, $razonSocial]);
        return intval($this->db->lastInsertId());
    }

    // 4. LÓGICA DE FECHA ACTUALIZADA (¡NUEVO!)
    private function actualizarMaterialProveedor(int $proveedorId, string $sku, string $desc, float $precio, string $fechaComprobante): string {
        $sql = "SELECT id, recurso_id, fecha_ultimo_xml FROM materiales_proveedores 
                WHERE proveedor_id = ? AND sku_proveedor = ? LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$proveedorId, $sku]);
        $row = $stmt->fetch();
        
        $fechaNueva = new DateTime($fechaComprobante);

        if ($row) {
            // A. YA EXISTE: Comparar fechas
            $fechaGuardada = new DateTime($row['fecha_ultimo_xml']);
            
            if ($fechaNueva <= $fechaGuardada) {
                return 'SKIPPED_OLD'; // La factura que subiste es más vieja, se ignora
            }

            // Es más nueva, actualizamos
            $mapeoId = $row['id'];
            $recursoId = $row['recurso_id'];
            $updateMap = "UPDATE materiales_proveedores SET ultimo_precio_registrado = ?, descripcion_proveedor = ?, fecha_ultimo_xml = ? WHERE id = ?";
            $this->db->prepare($updateMap)->execute([$precio, $desc, $fechaComprobante, $mapeoId]);
            
            if ($recursoId) {
                $this->actualizarPrecioRecursoPrincipal($recursoId, $precio, $fechaComprobante);
            }
            return 'ACTUALIZADO';
        } else {
            // B. ES NUEVO: Auto-crear
            $nuevoRecursoId = $this->crearNuevoRecurso($desc, 'pza', 'MATERIAL');
            $this->actualizarPrecioRecursoPrincipal($nuevoRecursoId, $precio, $fechaComprobante);
            $insert = "INSERT INTO materiales_proveedores (proveedor_id, sku_proveedor, descripcion_proveedor, ultimo_precio_registrado, fecha_ultimo_xml, recurso_id) VALUES (?, ?, ?, ?, ?, ?)";
            $this->db->prepare($insert)->execute([$proveedorId, $sku, $desc, $precio, $fechaComprobante, $nuevoRecursoId]);
            return 'NUEVO_AUTO_CREADO';
        }
    }

    private function crearNuevoRecurso(string $nombre, string $unidad, string $tipo): int {
        $sql = "INSERT INTO recursos (nombre, unidad, tipo, precio_costo_base) VALUES (?, ?, ?, 0.00)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$nombre, $unidad, $tipo]);
        return intval($this->db->lastInsertId());
    }

    // 5. ACTUALIZAR PRECIO CON FECHA (¡NUEVO!)
    private function actualizarPrecioRecursoPrincipal(int $recursoId, float $nuevoPrecio, string $fechaComprobante): void {
        $sql = "UPDATE recursos SET precio_costo_base = ?, fecha_actualizacion_costo = ? WHERE id = ?";
        $this->db->prepare($sql)->execute([$nuevoPrecio, $fechaComprobante, $recursoId]);
    }

    // Funciones de Admin (no se modifican)
    public function obtenerPendientes(): array {
        // ... (código igual)
        $sql = "SELECT mp.id, p.razon_social, mp.sku_proveedor, mp.descripcion_proveedor, mp.ultimo_precio_registrado, mp.fecha_ultimo_xml 
                FROM materiales_proveedores mp
                JOIN proveedores p ON mp.proveedor_id = p.id
                WHERE mp.recurso_id IS NULL
                ORDER BY mp.fecha_ultimo_xml DESC";
        return $this->db->query($sql)->fetchAll();
    }
    public function vincularRecurso(int $idMapeo, int $idRecursoInterno): void {
        // ... (código igual)
        $sql = "UPDATE materiales_proveedores SET recurso_id = ? WHERE id = ?";
        $this->db->prepare($sql)->execute([$idRecursoInterno, $idMapeo]);
    }
}
?>