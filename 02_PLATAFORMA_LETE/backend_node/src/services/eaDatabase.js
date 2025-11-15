// src/services/eaDatabase.js
import mysql from 'mysql2/promise';

// No necesitamos dotenv.config() aquí, porque index.js ya lo carga por nosotros.

const pool = mysql.createPool({
  host: process.env.EA_DB_HOST || '127.0.0.1',
  user: process.env.EA_DB_USER,
  password: process.env.EA_DB_PASSWORD,
  database: process.env.EA_DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Pequeña función para probar la conexión
pool.getConnection()
    .then(connection => {
        console.log('✅ Conectado exitosamente a la BD de Easy!Appointments (MariaDB)');
        connection.release(); // ¡Importante! Liberar la conexión
    })
    .catch(err => {
        console.error('❌ Error al conectar con la BD de Easy!Appointments:', err.code || err.message);
    });

export default pool; // Usamos export default
