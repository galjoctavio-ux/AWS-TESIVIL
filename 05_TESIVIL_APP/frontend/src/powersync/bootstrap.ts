import { db } from './db';

export const seedDatabase = async () => {
    // Check if materials exist
    const result = await db.getAll('SELECT count(*) as count FROM materials');
    const count = (result[0] as any)?.count || 0;

    if (count > 0) {
        console.log('Database already seeded.');
        return;
    }

    console.log('Seeding database...');

    // Insert "Critical 50" Sample Items
    // Prices in cents (Enteros)
    const materials = [
        { name: 'Cable THHW Cal 12', base_price: 1500, category: 'MATERIAL' }, // $15.00
        { name: 'Cable THHW Cal 10', base_price: 2200, category: 'MATERIAL' }, // $22.00
        { name: 'Contacto Duplex', base_price: 4500, category: 'MATERIAL' },   // $45.00
        { name: 'Apagador Sencillo', base_price: 3800, category: 'MATERIAL' }, // $38.00
        { name: 'Lámpara LED 9W', base_price: 8500, category: 'MATERIAL' },    // $85.00
        { name: 'Tubería PVC 1/2"', base_price: 1200, category: 'MATERIAL' },  // $12.00
        { name: 'Caja Chalupa', base_price: 800, category: 'MATERIAL' },       // $8.00
        { name: 'Centro de Carga 2P', base_price: 25000, category: 'MATERIAL' }, // $250.00
        { name: 'Interruptor 20A', base_price: 15000, category: 'MATERIAL' },  // $150.00
        { name: 'Cinta Aislante', base_price: 2500, category: 'MATERIAL' },    // $25.00
        { name: 'Mano de Obra (Hr)', base_price: 35000, category: 'SERVICE' }, // $350.00
    ];

    for (const m of materials) {
        await db.execute(
            `INSERT INTO materials (name, base_price, category_type, price_min_limit, price_max_limit, book_time_index, manual_override, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                m.name,
                m.base_price,
                m.category,
                Math.floor(m.base_price * 0.9),
                Math.floor(m.base_price * 1.1),
                15, // Default 15 mins book time
                0,  // False
                new Date().toISOString(),
                new Date().toISOString()
            ]
        );

    }

    // Insert Assemblies (Kits)
    // Kit Example: 1 Salida = 5m Cable 12 + 1 Chalupa + 1.5m Tubo + 10 mins Labor
    // Simplification: We will just mock insert them into 'materials' table for now with category='ASSEMBLY'
    // or properly into 'assemblies' table.
    // The Master Plan says "Materials" table is the main catalog. Assemblies are composed.
    // Let's insert into 'assemblies' table and definitions.

    // 1. Kit Salida Eléctrica
    await db.execute(
        `INSERT INTO assemblies (name, category, base_labor_minutes, created_at) VALUES (?, ?, ?, ?)`,
        ['Kit Salida Eléctrica', 'BASIC', 30, new Date().toISOString()]
    );
    // Needed to get ID, but standard sqlite doesn't return ID easily in one go with simple wrapper. 
    // We'll trust it's ID 1 for this seed or query it.
    const asmRes = await db.getAll("SELECT id FROM assemblies WHERE name='Kit Salida Eléctrica'");
    const asmId = (asmRes[0] as any)?.id;

    if (asmId) {
        // Find Material IDs to link
        // Cable 12 (id=1?), Chalupa (id=7?), Tubo (id=6?)
        // Fetch them to be safe
        const matRes = await db.getAll("SELECT id, name FROM materials WHERE name IN ('Cable THHW Cal 12', 'Caja Chalupa', 'Tubería PVC 1/2\"')");
        // Insert definitions
        for (const m of (matRes as any[])) {
            let qty = 1;
            if (m.name.includes('Cable')) qty = 5; // 5 meters
            if (m.name.includes('Tubería')) qty = 2; // 2 pieces (approx 1.5m?)

            await db.execute(
                `INSERT INTO assembly_definitions (assembly_id, material_id, quantity, is_main_component) VALUES (?, ?, ?, ?)`,
                [asmId, m.id, qty, 0]
            );
        }
    }

    console.log('Database seeded successfully (Materials + Assemblies).');
};
