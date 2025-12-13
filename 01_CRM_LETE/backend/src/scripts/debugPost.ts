import axios from 'axios';

const CONFIG = {
    url: 'http://172.17.0.1:8080',
    apikey: 'B6D711FCDE4D4FD5936544120E713976',
    instance: 'LuzEnTuEspacio'
};

const debug = async () => {
    console.log("🕵️ DEBUG POST EVOLUTION");
    try {
        console.log(`Intentando POST a ${CONFIG.url}/chat/findChats/${CONFIG.instance}...`);

        const res = await axios.post(
            `${CONFIG.url}/chat/findChats/${CONFIG.instance}`,
            { where: {} }, // Body vacío estándar
            { headers: { 'apikey': CONFIG.apikey } }
        );

        console.log("✅ ÉXITO:", res.data);
    } catch (error: any) {
        console.error("❌ FALLÓ POST:");
        if (error.response) {
            console.error("   Status:", error.response.status);
            console.error("   Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("   Error:", error.message);
        }
    }
};

debug();