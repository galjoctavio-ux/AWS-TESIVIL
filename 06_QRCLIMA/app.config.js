export default {
    expo: {
        ...require('./app.json').expo,
        extra: {
            // Lee la clave de la variable de entorno, con fallback para desarrollo
            googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyBFmKunZlJbCawN4XBmz2M23sW456sDtVs',
            // EAS Project ID
            eas: {
                projectId: '6cb0e6b6-938f-438c-b718-4f6d48dcca49',
            },
        },
    },
};
