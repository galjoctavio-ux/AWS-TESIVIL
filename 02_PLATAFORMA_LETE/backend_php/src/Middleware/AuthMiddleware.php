<?php

namespace App\Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;

class AuthMiddleware {
    public static function handle() {
        // 1. BUSQUEDA AGRESIVA DEL HEADER (Apache a veces lo esconde)
        $authHeader = null;
        
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        } elseif (function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            // A veces llega como 'Authorization' y a veces como 'authorization'
            if (isset($headers['Authorization'])) {
                $authHeader = $headers['Authorization'];
            } elseif (isset($headers['authorization'])) {
                $authHeader = $headers['authorization'];
            }
        }

        // 2. Si después de todo eso no hay header, error.
        if (!$authHeader) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided (Header missing)']);
            exit();
        }

        // 3. Limpiar el prefijo "Bearer "
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $jwt = $matches[1];
        } else {
            $jwt = $authHeader; // Intento desesperado si no trae Bearer
        }

        if (!$jwt) {
            http_response_code(401);
            echo json_encode(['error' => 'Token format invalid']);
            exit();
        }

        // 4. Decodificar
        try {
            // Cargar secreto del entorno
            $secret = $_ENV['SUPABASE_JWT_SECRET'] ?? getenv('SUPABASE_JWT_SECRET');
            
            if (empty($secret)) {
                throw new Exception("Server Error: JWT Secret not configured.");
            }

            // Decodificamos usando HS256 (Algoritmo estándar de Supabase)
            $decoded = JWT::decode($jwt, new Key($secret, 'HS256'));

            // Inyectar datos del usuario
            $GLOBALS['user'] = [
                'id' => $decoded->sub,
                'role' => $decoded->role ?? 'anon',
                'email' => $decoded->email ?? ''
            ];

        } catch (Exception $e) {
            http_response_code(401);
            // Devuelve el error exacto para que sepamos qué pasa
            echo json_encode(['error' => 'Invalid token: ' . $e->getMessage()]);
            exit();
        }
    }
}
