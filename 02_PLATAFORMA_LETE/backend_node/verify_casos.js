import { supabaseAdmin } from './src/services/supabaseClient.js';

console.log('🔍 Verificando casos en la base de datos...\n');

try {
    // 1. Obtener todos los casos
    const { data: casos, error } = await supabaseAdmin
        .from('casos')
        .select('id, cliente_nombre, cliente_direccion, cliente_telefono, status, fecha_creacion')
        .order('id', { ascending: false })
        .limit(10);

    if (error) {
        console.error('❌ Error al consultar casos:', error);
        process.exit(1);
    }

    console.log(`📊 Total de casos encontrados: ${casos.length}\n`);

    casos.forEach((caso, index) => {
        console.log(`\n--- Caso #${caso.id} ---`);
        console.log(`Cliente: ${caso.cliente_nombre}`);
        console.log(`Dirección: ${caso.cliente_direccion}`);
        console.log(`Teléfono: ${caso.cliente_telefono || '❌ NO TIENE TELÉFONO'}`);
        console.log(`Status: ${caso.status}`);
        console.log(`Fecha: ${caso.fecha_creacion}`);
    });

    // 2. Verificar la estructura de la tabla
    console.log('\n\n🔧 Verificando estructura de la tabla...');
    const { data: columns, error: structError } = await supabaseAdmin
        .rpc('get_table_columns', { table_name: 'casos' })
        .catch(() => null);

    // Si no existe la función RPC, intentamos hacer un select para ver qué columnas retorna
    console.log('\n📋 Columnas disponibles en el SELECT:');
    if (casos.length > 0) {
        console.log(Object.keys(casos[0]));
    }

    console.log('\n✅ Verificación completada');

} catch (err) {
    console.error('💥 Error inesperado:', err);
}

process.exit(0);
