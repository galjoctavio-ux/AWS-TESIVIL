import axios from 'axios';

const CONFIG = {
    url: 'http://172.17.0.1:8080',
    apikey: 'B6D711FCDE4D4FD5936544120E713976'
};

const diagnostico = async () => {
    console.log("🕵️ DIAGNÓSTICO DE EVOLUTION API");
    console.log("--------------------------------");

    try {
        // 1. Intentar listar las instancias
        console.log(`📡 Conectando a ${CONFIG.url}...`);

        // Probamos el endpoint estándar para ver instancias
        const response = await axios.get(`${CONFIG.url}/instance/fetchInstances`, {
            headers: { 'apikey': CONFIG.apikey }
        });

        console.log("✅ Conexión Exitosa.");

        const instancias = response.data;
        if (Array.isArray(instancias)) {
            console.log(`📦 Instancias encontradas: ${instancias.length}`);
            instancias.forEach(ins => {
                console.log(`   👉 Nombre Real: "${ins.name}" | Estado: ${ins.status || 'Desconocido'}`);
            });
        } else {
            console.log("⚠️ La respuesta no es un array:", instancias);
        }

    } catch (error) {
        console.error("❌ Error de conexión:", (error as any).message);
        if ((error as any).response) {
            console.error("   Detalle servidor:", (error as any).response.data);
            console.error("   Status:", (error as any).response.status);
        }
    }
};

diagnostico();