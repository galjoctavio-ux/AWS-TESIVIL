// =============================================================================
// TESIVIL App Hub - Supabase Client
// =============================================================================

// Initialize Supabase client (nombre diferente para evitar conflicto con CDN global)
const supabaseClient = window.supabase.createClient(
    CONFIG.SUPABASE_URL,
    CONFIG.SUPABASE_ANON_KEY
);

// =============================================================================
// API Functions
// =============================================================================

const AppAPI = {
    /**
     * Obtiene todas las aplicaciones
     * @param {string} categoria - Filtrar por categoría (opcional)
     * @returns {Promise<Array>} Lista de aplicaciones
     */
    async getApps(categoria = null) {
        try {
            let query = supabaseClient
                .from('apps')
                .select('*')
                .order('created_at', { ascending: false });

            if (categoria && categoria !== 'all') {
                query = query.ilike('categoria', `%${categoria}%`);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching apps:', error);
            return [];
        }
    },

    /**
     * Obtiene una aplicación por su slug
     * @param {string} slug - Slug único de la aplicación
     * @returns {Promise<Object|null>} Datos de la aplicación
     */
    async getAppBySlug(slug) {
        try {
            const { data, error } = await supabaseClient
                .from('apps')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching app:', error);
            return null;
        }
    },

    /**
     * Obtiene una aplicación por su ID
     * @param {string} id - UUID de la aplicación
     * @returns {Promise<Object|null>} Datos de la aplicación
     */
    async getAppById(id) {
        try {
            const { data, error } = await supabaseClient
                .from('apps')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching app:', error);
            return null;
        }
    },

    /**
     * Construye la URL de descarga directa desde la VM
     * @param {string} filename - Nombre del archivo APK
     * @returns {string} URL de descarga directa
     */
    buildDownloadUrl(filename) {
        if (!filename) return null;
        return `${CONFIG.DOWNLOAD_BASE_URL}${filename}`;
    }
};
