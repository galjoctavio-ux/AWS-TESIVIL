/**
 * Utilidades de formateo de fechas
 * Para QRClima App
 */

/**
 * Convierte un timestamp de Firebase a una cadena de tiempo relativo legible
 * Ejemplo: "Hace 5 minutos", "Hace 2 horas", "Hace 3 días"
 * 
 * @param timestamp - Puede ser un Timestamp de Firebase, Date, número (ms), o null/undefined
 * @returns Cadena formateada en español con el tiempo transcurrido
 */
export function formatTimeAgo(timestamp: any): string {
    if (!timestamp) {
        return 'Hace un momento';
    }

    let date: Date;

    // Handle Firebase Timestamp object
    if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
    }
    // Handle Firebase Timestamp with seconds field
    else if (timestamp?.seconds) {
        date = new Date(timestamp.seconds * 1000);
    }
    // Handle Date object
    else if (timestamp instanceof Date) {
        date = timestamp;
    }
    // Handle number (milliseconds or seconds)
    else if (typeof timestamp === 'number') {
        // If the number is too small to be milliseconds (before year 2000 in ms), assume seconds
        date = timestamp < 10000000000 ? new Date(timestamp * 1000) : new Date(timestamp);
    }
    // Handle string
    else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
    }
    else {
        return 'Hace un momento';
    }

    // Check for invalid date
    if (isNaN(date.getTime())) {
        return 'Hace un momento';
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    // Handle future dates
    if (diffMs < 0) {
        return 'Ahora mismo';
    }

    // Less than a minute
    if (diffSeconds < 60) {
        return 'Hace un momento';
    }

    // Less than an hour
    if (diffMinutes < 60) {
        return diffMinutes === 1 ? 'Hace 1 minuto' : `Hace ${diffMinutes} minutos`;
    }

    // Less than a day
    if (diffHours < 24) {
        return diffHours === 1 ? 'Hace 1 hora' : `Hace ${diffHours} horas`;
    }

    // Less than a week
    if (diffDays < 7) {
        return diffDays === 1 ? 'Hace 1 día' : `Hace ${diffDays} días`;
    }

    // Less than a month
    if (diffWeeks < 4) {
        return diffWeeks === 1 ? 'Hace 1 semana' : `Hace ${diffWeeks} semanas`;
    }

    // Less than a year
    if (diffMonths < 12) {
        return diffMonths === 1 ? 'Hace 1 mes' : `Hace ${diffMonths} meses`;
    }

    // Years
    return diffYears === 1 ? 'Hace 1 año' : `Hace ${diffYears} años`;
}

/**
 * Formatea una fecha como cadena corta
 * Ejemplo: "24 dic 2025"
 */
export function formatShortDate(timestamp: any): string {
    if (!timestamp) return '';

    let date: Date;

    if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
    } else if (timestamp?.seconds) {
        date = new Date(timestamp.seconds * 1000);
    } else if (timestamp instanceof Date) {
        date = timestamp;
    } else if (typeof timestamp === 'number') {
        date = timestamp < 10000000000 ? new Date(timestamp * 1000) : new Date(timestamp);
    } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
    } else {
        return '';
    }

    if (isNaN(date.getTime())) return '';

    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}
