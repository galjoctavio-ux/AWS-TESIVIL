import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'QRclima - Historial de Equipo',
    description: 'QRclima: Bitácora y Cálculos - Consulta el historial de mantenimiento de tu aire acondicionado',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es">
            <body>{children}</body>
        </html>
    )
}
