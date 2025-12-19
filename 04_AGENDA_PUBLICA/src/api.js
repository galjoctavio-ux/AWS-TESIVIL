// src/api.js
import dayjs from 'dayjs';

// URL base de tu API
export const BACKEND_URL = 'http://34.53.115.235:3010/api/global-agenda';

// 1. Obtener Técnicos
export const getTecnicos = async (token) => {
  try {
    const res = await fetch(`${BACKEND_URL}/tecnicos?token=${token}`);
    if (!res.ok) throw new Error('Error fetching tecnicos');
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

// 2. Obtener Citas
export const getCitas = async (fecha, token) => {
  try {
    // Aseguramos formato YYYY-MM-DD
    const fechaStr = dayjs(fecha).format('YYYY-MM-DD');
    const res = await fetch(`${BACKEND_URL}/citas?fecha=${fechaStr}&token=${token}`);
    if (!res.ok) throw new Error('Error fetching citas');
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

// 3. (NUEVO) Actualizar Ubicación de Cita
// Esta función conecta con el botón "Guardar" de tu modal de emergencia
export const updateCitaLocation = async (idCita, nuevaDireccion, token) => {
  try {
    // Nota: Usamos PUT y pasamos el token en la URL como en tus otras funciones
    const res = await fetch(`${BACKEND_URL}/citas/${idCita}/location?token=${token}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ direccion: nuevaDireccion }),
    });

    if (!res.ok) {
      // Intentamos leer el mensaje de error del backend, si existe
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al actualizar la ubicación');
    }

    return await res.json();
  } catch (error) {
    console.error("Error en updateCitaLocation:", error);
    throw error; // Lanzamos el error para que el App.jsx muestre el alert
  }
};

// 4. (NUEVO) Eliminar Cita (Hard Delete)
export const deleteCita = async (idCita, token) => {
  try {
    const res = await fetch(`${BACKEND_URL}/citas/${idCita}?token=${token}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al eliminar la cita');
    }

    return await res.json();
  } catch (error) {
    console.error("Error en deleteCita:", error);
    throw error;
  }
};