import Link from 'next/link'

export default function Home() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex flex-col items-center justify-center p-8">
            <div className="text-center text-white">
                <h1 className="text-5xl font-bold mb-4">❄️ Mr. Frío</h1>
                <p className="text-xl text-blue-100 mb-8">
                    Bitácora Inteligente de Aire Acondicionado
                </p>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md">
                    <h2 className="text-2xl font-bold mb-4">¿Tienes un código QR?</h2>
                    <p className="text-blue-100 mb-6">
                        Escanea el código QR en tu equipo de aire acondicionado para ver su historial completo de mantenimiento.
                    </p>

                    <div className="bg-white rounded-xl p-6 text-gray-800">
                        <p className="text-sm text-gray-500 mb-2">URL de ejemplo:</p>
                        <code className="text-blue-600 font-mono">
                            mrfrio.app/qr/ABC123
                        </code>
                    </div>
                </div>

                <p className="mt-8 text-blue-200 text-sm">
                    ¿Eres técnico? <Link href="https://mrfrio.app" className="underline">Descarga la app</Link>
                </p>
            </div>
        </main>
    )
}
