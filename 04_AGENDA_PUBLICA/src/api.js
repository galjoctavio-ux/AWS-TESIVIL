// src/api.js
import dayjs from 'dayjs';

// ⚠️ IMPORTANTE: Aquí debes poner la IP PÚBLICA o Dominio de tu VM de Google Cloud (donde está el backend).
// Ejemplo: 'http://34.12.123.45:3000/api/global-agenda'
// Si tienes HTTPS configurado, úsalo.
export const BACKEND_URL = 'http://34.53.115.235:3010/api/global-agenda';

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
