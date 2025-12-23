/** @type {import('next').NextConfig} */
const nextConfig = {
    // Optimizaciones de producción
    reactStrictMode: true,

    // Permitir imágenes de Firebase Storage
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'firebasestorage.googleapis.com',
            },
        ],
    },
}

module.exports = nextConfig
