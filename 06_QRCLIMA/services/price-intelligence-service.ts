import { supabasePrice, MarketTrend, BestOffer, ArbitrageDeal, CatalogProItem, ProductSearchResult, ProductPrice, PriceHistoryPoint, EssentialProduct, CatalogProduct, supabase } from './supabase-client';

/**
 * Service for Price Intelligence PRO feature
 * Provides access to market data from Supabase (Price Intelligence DB)
 */

// ============================================
// Pilar 1: Radar de Tendencias (v_tendencias_mercado)
// ============================================

/**
 * Get today's market trends for all categories
 * Shows percentage variation for each specialized group
 */
export const getMarketTrends = async (): Promise<MarketTrend[]> => {
    console.log('📊 [getMarketTrends] Fetching from v_tendencias_mercado...');
    try {
        const { data, error } = await supabasePrice
            .from('v_tendencias_mercado')
            .select('*')
            .order('variacion_porcentual', { ascending: true }); // Shows most decreased first

        if (error) {
            console.error('❌ [getMarketTrends] Supabase error:', error);
            throw error;
        }

        console.log('📊 [getMarketTrends] Received:', data?.length || 0, 'trends');
        return data || [];
    } catch (error) {
        console.error('❌ [getMarketTrends] Exception:', error);
        return [];
    }
};

// ============================================
// Pilar 2: Buscador de Precios (v_mejores_ofertas)
// ============================================

/**
 * Search for best offers with flexible text matching
 * @param searchTerm - Search term (matches nombre_estandarizado, marca, modelo)
 * @param limit - Max results (default 50)
 */
export const searchBestOffers = async (searchTerm: string, limit: number = 50): Promise<BestOffer[]> => {
    console.log('🔎 [searchBestOffers] Searching:', searchTerm);
    try {
        if (!searchTerm || searchTerm.length < 2) {
            return [];
        }

        const { data, error } = await supabasePrice
            .from('v_mejores_ofertas')
            .select('*')
            .or(`nombre_estandarizado.ilike.%${searchTerm}%,marca.ilike.%${searchTerm}%,modelo.ilike.%${searchTerm}%`)
            .order('mejor_precio', { ascending: true })
            .limit(limit);

        if (error) {
            console.error('❌ [searchBestOffers] Supabase error:', error);
            throw error;
        }

        console.log('🔎 [searchBestOffers] Found:', data?.length || 0, 'results');
        return data || [];
    } catch (error) {
        console.error('❌ [searchBestOffers] Exception:', error);
        return [];
    }
};

// ============================================
// Pilar 3: Sección de Gangas (v_gangas_detectadas)
// ============================================

/**
 * Get products with significant discounts (10%+ below historical average)
 * Limited to top 20 opportunities
 */
export const getArbitrageDeals = async (): Promise<ArbitrageDeal[]> => {
    console.log('🔥 [getArbitrageDeals] Fetching from v_gangas_detectadas...');
    try {
        const { data, error } = await supabasePrice
            .from('v_gangas_detectadas')
            .select('*')
            .order('porcentaje_descuento', { ascending: false })
            .limit(20);

        if (error) {
            console.error('❌ [getArbitrageDeals] Supabase error:', error);
            throw error;
        }

        console.log('🔥 [getArbitrageDeals] Received:', data?.length || 0, 'deals');
        return data || [];
    } catch (error) {
        console.error('❌ [getArbitrageDeals] Exception:', error);
        return [];
    }
};

// ============================================
// Cotizador PRO: Catalog Recommendations (v_catalogo_tecnicos_pro)
// ============================================

/**
 * Get recommended products for PRO technicians
 */
export const getCatalogProRecommendations = async (): Promise<CatalogProItem[]> => {
    console.log('💡 [getCatalogProRecommendations] Fetching from v_catalogo_tecnicos_pro...');
    try {
        const { data, error } = await supabasePrice
            .from('v_catalogo_tecnicos_pro')
            .select('*');

        if (error) {
            console.error('❌ [getCatalogProRecommendations] Supabase error:', error);
            throw error;
        }

        console.log('💡 [getCatalogProRecommendations] Received:', data?.length || 0, 'items');
        return data || [];
    } catch (error) {
        console.error('❌ [getCatalogProRecommendations] Exception:', error);
        return [];
    }
};

// ============================================
// Utility Functions
// ============================================

/**
 * Get trend display info based on percentage variation
 */
export const getTrendDisplay = (variacion: number) => {
    if (variacion < 0) {
        return {
            icon: 'trending-down',
            color: '#22C55E',
            label: `▼ ${Math.abs(variacion).toFixed(1)}%`,
            bgColor: 'bg-green-100'
        };
    } else if (variacion > 0) {
        return {
            icon: 'trending-up',
            color: '#EF4444',
            label: `▲ ${variacion.toFixed(1)}%`,
            bgColor: 'bg-red-100'
        };
    } else {
        return {
            icon: 'remove',
            color: '#6B7280',
            label: '= 0%',
            bgColor: 'bg-gray-100'
        };
    }
};

/**
 * Get category icon based on category name
 */
export const getCategoryIcon = (categoria: string): string => {
    const lower = categoria.toLowerCase();
    if (lower.includes('gas') || lower.includes('refrigerante')) return 'snow';
    if (lower.includes('minisplit') || lower.includes('aire')) return 'snow';
    if (lower.includes('tuber') || lower.includes('cobre')) return 'construct';
    if (lower.includes('herramienta')) return 'hammer';
    return 'cube';
};

/**
 * Format price for display
 */
export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
};

// ============================================
// Legacy Functions (backward compatibility)
// ============================================

/**
 * @deprecated Use searchBestOffers instead
 */
export const searchProducts = async (searchTerm: string, limit: number = 10): Promise<ProductSearchResult[]> => {
    try {
        if (!searchTerm || searchTerm.length < 2) {
            return [];
        }

        const { data, error } = await supabase
            .from('products')
            .select('id, display_name, brand')
            .ilike('display_name', `%${searchTerm}%`)
            .limit(limit);

        if (error) {
            console.error('Error searching products:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('searchProducts error:', error);
        return [];
    }
};

/**
 * @deprecated
 */
export const getProductPrices = async (productUuid: string): Promise<ProductPrice[]> => {
    try {
        const { data, error } = await supabase
            .rpc('get_product_prices', { product_uuid: productUuid });

        if (error) {
            console.error('Error fetching product prices:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('getProductPrices error:', error);
        return [];
    }
};

/**
 * @deprecated
 */
export const getPriceHistory = async (
    categoryName: string,
    brand: string | null = null,
    days: number = 30
): Promise<PriceHistoryPoint[]> => {
    try {
        const { data, error } = await supabase
            .rpc('get_price_history_chart', {
                p_category_name: categoryName,
                p_brand: brand,
                p_days: days
            });

        if (error) {
            console.error('Error fetching price history:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('getPriceHistory error:', error);
        return [];
    }
};

/**
 * Get essential products for Cotizador PRO
 * Uses v_catalogo_tecnicos_pro view (products marked as es_esencial_pro=true)
 */
export const getEssentialProducts = async (): Promise<EssentialProduct[]> => {
    console.log('💡 [getEssentialProducts] Fetching from v_catalogo_tecnicos_pro...');
    try {
        const { data, error } = await supabasePrice
            .from('v_catalogo_tecnicos_pro')
            .select('*')
            .limit(20);

        if (error) {
            console.error('❌ [getEssentialProducts] Error:', error);
            throw error;
        }

        // Map to EssentialProduct format for backward compatibility
        const mapped: EssentialProduct[] = (data || []).map(item => ({
            display_name: item.nombre_estandarizado,
            mejor_precio: item.mejor_precio,
            en_tienda: item.proveedor,
            url_reference: item.url,
            category: item.grupo_especializado
        }));

        console.log('💡 [getEssentialProducts] Found:', mapped.length, 'items');
        return mapped;
    } catch (error) {
        console.error('getEssentialProducts error:', error);
        return [];
    }
};

/**
 * Search catalog products for Cotizador PRO
 * Uses v_mejores_ofertas view with flexible text matching
 */
export const searchCatalogProducts = async (searchTerm: string, limit: number = 15): Promise<CatalogProduct[]> => {
    console.log('🔎 [searchCatalogProducts] Searching:', searchTerm);
    try {
        if (!searchTerm || searchTerm.length < 2) {
            return [];
        }

        const { data, error } = await supabasePrice
            .from('v_mejores_ofertas')
            .select('*')
            .or(`nombre_estandarizado.ilike.%${searchTerm}%,marca.ilike.%${searchTerm}%`)
            .order('mejor_precio', { ascending: true })
            .limit(limit);

        if (error) {
            console.error('❌ [searchCatalogProducts] Error:', error);
            throw error;
        }

        // Map to CatalogProduct format for backward compatibility
        const mapped: CatalogProduct[] = (data || []).map(item => ({
            id: item.sku || item.nombre_estandarizado,
            display_name: item.nombre_estandarizado,
            brand: item.marca,
            mejor_precio: item.mejor_precio,
            en_tienda: item.proveedor,
            url_reference: item.url
        }));

        console.log('🔎 [searchCatalogProducts] Found:', mapped.length, 'results');
        return mapped;
    } catch (error) {
        console.error('searchCatalogProducts error:', error);
        return [];
    }
};

// Legal disclaimer for price suggestions
export const PRICE_DISCLAIMER =
    'Los precios mostrados son referenciales basados en monitoreo de proveedores públicos. ' +
    'QRclima/TESIVIL no garantiza exactitud, disponibilidad ni vigencia. ' +
    'El técnico es responsable del precio final cotizado a su cliente.';
