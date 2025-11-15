import { Router } from 'express';
import { requireAuth, isAdmin } from '../middleware/auth.middleware.js';
// --- MODIFICADO: Importar nuevo controlador ---
import { 
  getTecnicos, 
  createTecnico, 
  deleteTecnico,
  getEaIdFromSupabaseId // <-- AÑADIDO
} from '../controllers/usuarios.controller.js';

const router = Router();

// --- NUEVA RUTA: Para encontrar el ID de E!A ---
// La usamos en el formulario de agendar
router.get(
  '/find-ea-id/:supabase_id', // Recibe el UUID de Supabase
  requireAuth,
  isAdmin,
  getEaIdFromSupabaseId
);

// --- Rutas existentes ---
router.use(requireAuth, isAdmin);
router.get('/tecnicos', getTecnicos);
router.post('/', createTecnico);
router.delete('/tecnicos/:id', deleteTecnico);

export default router;