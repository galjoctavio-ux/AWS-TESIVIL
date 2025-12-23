const Database = require('better-sqlite3');
const fs = require('fs-extra');
const path = require('path');

const SQL_FILE = path.join(__dirname, '../../data_mining/output/seed_full_database.sql');
const OUTPUT_DB = path.join(__dirname, 'qrclima.db');
const FINAL_PATH = path.join(__dirname, '../../assets/database/qrclima.db');

async function build() {
    console.log('--- Iniciando construcción de BD ---');

    // 1. Limpieza previa
    if (fs.existsSync(OUTPUT_DB)) {
        fs.unlinkSync(OUTPUT_DB);
    }
    await fs.ensureDir(path.dirname(FINAL_PATH));

    // 2. Crear BD
    const db = new Database(OUTPUT_DB);

    // 3. Crear Schema
    console.log('Creando schema...');
    db.exec(`
    CREATE TABLE IF NOT EXISTS air_conditioner_models (
      id INTEGER PRIMARY KEY,
      name TEXT,
      reference_id TEXT,
      image_url TEXT,
      logo_url TEXT,
      type TEXT,
      created_at TEXT
    );
    
    CREATE TABLE IF NOT EXISTS error_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      model_id INTEGER,
      code TEXT,
      description TEXT,
      solution TEXT,
      created_at TEXT,
      FOREIGN KEY(model_id) REFERENCES air_conditioner_models(id)
    );
  `);

    // 4. Leer y sanitizar SQL
    console.log('Leyendo SQL...');
    let sqlContent = fs.readFileSync(SQL_FILE, 'utf-8');

    console.log('Sanitizando SQL...');
    // Reemplazos para compatibilidad SQLite
    sqlContent = sqlContent
        .replace(/NOW\(\)/gi, "datetime('now', 'localtime')") // MySQL/PG -> SQLite time
        .replace(/BEGIN;/gi, '') // Manejado manualmente si se desea, o ignorado
        .replace(/COMMIT;/gi, ''); // Ignorado

    // 5. Ejecutar Inserciones
    console.log('Insertando datos...');
    const insertTransaction = db.transaction((sql) => {
        db.exec(sql);
    });

    try {
        insertTransaction(sqlContent);
        console.log('Datos insertados correctamente.');
    } catch (error) {
        console.error('Error al insertar datos:', error);
        process.exit(1);
    }

    // 6. Cerrar y Mover
    db.close();

    console.log('Moviendo a assets...');
    fs.moveSync(OUTPUT_DB, FINAL_PATH, { overwrite: true });

    console.log(`Base de datos generada exitosamente en assets/database/qrclima.db`);
}

build().catch(console.error);
