import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// ============================================
// Original Supabase Client (existing functions)
// ============================================
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Original Supabase credentials not found.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// Price Intelligence Supabase Client (separate DB)
// ============================================
const priceUrl = Constants.expoConfig?.extra?.supabasePriceUrl || process.env.EXPO_PUBLIC_SUPABASE_PRICE_URL || '';
const priceAnonKey = Constants.expoConfig?.extra?.supabasePriceAnonKey || process.env.EXPO_PUBLIC_SUPABASE_PRICE_ANON_KEY || '';

// DEBUG: Log credential status
console.log('🔍 [Supabase Price Intel] URL:', priceUrl ? `✅ Found (${priceUrl.substring(0, 30)}...)` : '❌ MISSING');
console.log('🔍 [Supabase Price Intel] Key:', priceAnonKey ? `✅ Found (${priceAnonKey.substring(0, 20)}...)` : '❌ MISSING');

if (!priceUrl || !priceAnonKey) {
    console.warn('⚠️ Price Intelligence Supabase credentials not found. Radar de Precios will not work.');
}

export const supabasePrice = createClient(priceUrl, priceAnonKey);

// ============================================
// Type Definitions for Price Intelligence Views
// ============================================

/**
 * v_tendencias_mercado view - Market trends
 */
export interface MarketTrend {
    grupo_especializado: string;
    variacion_porcentual: number;
}

/**
 * v_mejores_ofertas view - Best offers for search
 */
export interface BestOffer {
    nombre_estandarizado: string;
    marca: string;
    modelo: string;
    mejor_precio: number;
    proveedor: string;
    url: string;
}

/**
 * v_gangas_detectadas view - Deals/Gangas
 */
export interface ArbitrageDeal {
    nombre_estandarizado: string;
    mejor_precio: number;
    promedio_historico: number;
    porcentaje_descuento: number;
    proveedor: string;
    url: string;
}

/**
 * v_catalogo_tecnicos_pro view - PRO catalog recommendations
 */
export interface CatalogProItem {
    nombre_estandarizado: string;
    marca: string;
    mejor_precio: number;
    proveedor: string;
    url: string;
}

// ============================================
// Legacy interfaces (for backward compatibility)
// ============================================

/**
 * products table - For autocomplete search
 */
export interface ProductSearchResult {
    id: string;
    display_name: string;
    brand: string;
}

/**
 * get_product_prices RPC result
 */
export interface ProductPrice {
    proveedor: string;
    precio: number;
    url: string;
}

/**
 * get_price_history_chart RPC result
 */
export interface PriceHistoryPoint {
    fecha: string;
    precio_promedio: number;
}

/**
 * app_feed_essentials view - Suggested products for Cotizador PRO
 */
export interface EssentialProduct {
    display_name: string;
    mejor_precio: number;
    en_tienda: string;
    url_reference?: string;
    category?: string;
}

/**
 * products table with prices - For catalog search in Cotizador PRO
 */
export interface CatalogProduct {
    id: string;
    display_name: string;
    brand: string;
    mejor_precio: number;
    en_tienda: string;
    url_reference?: string;
}
