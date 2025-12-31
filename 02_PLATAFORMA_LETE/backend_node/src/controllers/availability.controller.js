import pool from '../services/eaDatabase.js';

export const createRecurringUnavailable = async (req, res) => {
    const {
        // id_users_provider, // <--- YA NO USAREMOS ESTE ID DIRECTAMENTE PORQUE ES UN UUID
        start_time,
        end_time,
        days_of_week,
        date_start,
        date_end,
        reason
    } = req.body;

    // 1. Obtener el email del usuario autenticado
    // Asumimos que tu auth.middleware llena req.user
    const userEmail = req.user ? req.user.email : null;

    if (!userEmail) {
        return res.status(401).json({ message: "No se pudo identificar el email del usuario." });
    }

    try {
        // ---------------------------------------------------------
        // PASO CRÍTICO: TRADUCCIÓN DE UUID A ID DE EASY!APPOINTMENTS
        // ---------------------------------------------------------
        const [users] = await pool.query(
            'SELECT id, first_name, last_name FROM ea_users WHERE email = ? LIMIT 1',
            [userEmail]
        );

        if (users.length === 0) {
            console.error(`Error: El usuario con email ${userEmail} no existe en la tabla ea_users.`);
            return res.status(404).json({
                message: "Tu usuario no está sincronizado con la Agenda (No se encontró tu email en ea_users)."
            });
        }

        const providerIdInt = users[0].id; // <--- AQUÍ TENEMOS EL ID NUMÉRICO (ej. 5)
        // ---------------------------------------------------------

        // Validaciones
        if (!days_of_week || days_of_week.length === 0) {
            return res.status(400).json({ message: "Debes seleccionar al menos un día." });
        }

        const start = new Date(date_start);
        const end = new Date(date_end);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 365) {
            return res.status(400).json({ message: "Por seguridad, el máximo permitido es 1 año." });
        }

        const inserts = [];
        let current = new Date(start);

        // Iteramos día por día
        while (current <= end) {
            const dayIndex = current.getDay(); // 0 = Domingo, 1 = Lunes...

            if (days_of_week.includes(dayIndex)) {
                const dateStr = current.toISOString().split('T')[0];
                const startDateTime = `${dateStr} ${start_time}:00`;
                const endDateTime = `${dateStr} ${end_time}:00`;

                inserts.push([
                    startDateTime,
                    endDateTime,
                    1,                 // is_unavailable (Bloqueo)
                    providerIdInt,     // <--- USAMOS EL ID ENTERO, NO EL UUID
                    reason || 'Tiempo personal',
                    new Date()         // book_datetime
                ]);
            }
            current.setDate(current.getDate() + 1);
        }

        if (inserts.length === 0) {
            return res.json({ message: "No se generaron bloqueos en el rango seleccionado." });
        }

        // Inserción Masiva
        const query = `
      INSERT INTO ea_appointments 
      (start_datetime, end_datetime, is_unavailable, id_users_provider, notes, book_datetime)
      VALUES ?
    `;

        const [result] = await pool.query(query, [inserts]);

        res.json({
            success: true,
            message: `Se han bloqueado ${result.affectedRows} espacios correctamente.`,
            blocks_created: result.affectedRows
        });

    } catch (error) {
        console.error("Error creando bloqueos:", error);
        res.status(500).json({ message: "Error interno al guardar disponibilidad: " + error.message });
    }
};