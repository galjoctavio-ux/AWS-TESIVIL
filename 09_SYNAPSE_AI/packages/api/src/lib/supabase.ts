import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization to allow dotenv to load first
let supabaseAdminInstance: SupabaseClient | null = null;
let supabaseInstance: SupabaseClient | null = null;

// Admin client (server-side only, bypasses RLS)
export const supabaseAdmin = {
    get client(): SupabaseClient {
        if (!supabaseAdminInstance) {
            const url = process.env.SUPABASE_URL || '';
            const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
            if (!url || !key) {
                console.warn('⚠️ Supabase credentials not set');
            }
            supabaseAdminInstance = createClient(url, key, {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            });
        }
        return supabaseAdminInstance;
    },
    from(table: string) {
        return this.client.from(table);
    },
    rpc(fn: string, params?: Record<string, any>) {
        return this.client.rpc(fn, params);
    },
};

// Public client (respects RLS)
export function getSupabase(): SupabaseClient {
    if (!supabaseInstance) {
        const url = process.env.SUPABASE_URL || '';
        const key = process.env.SUPABASE_ANON_KEY || '';
        supabaseInstance = createClient(url, key);
    }
    return supabaseInstance;
}

export const supabase = { get: getSupabase };

// Type definitions for database tables
export interface Profile {
    id: string;
    email: string | null;
    alias: string | null;
    photo_url: string | null;
    is_premium: boolean;
    premium_until: string | null;
    role: 'user' | 'developer' | 'partner' | 'admin';
    created_at: string;
    updated_at: string;
}

export interface PromptHistory {
    id: string;
    user_id: string;
    raw_input: string;
    enriched_input: string | null;
    style: string;
    params: Record<string, any>;
    output_prompt: string;
    output_negative_prompt: string | null;
    target_engine: string;
    execution_time_ms: number | null;
    created_at: string;
}

export interface AIModel {
    id: string;
    slug: string;
    name: string;
    provider_id: string;
    category: string;
    description: string | null;
    pricing_input: number;
    pricing_output: number;
    context_length: number | null;
    score_overall: number;
    score_reasoning: number | null;
    score_coding: number | null;
    score_creative: number | null;
    score_speed: number | null;
    review_count: number;
    avg_user_rating: number | null;
    trend: 'up' | 'down' | 'stable';
    is_new: boolean;
    is_featured: boolean;
    icon_url: string | null;
    changelog: any[] | null;
    synced_at: string;
    created_at: string;
    updated_at: string;
}

export interface NewsArticle {
    id: string;
    source_name: string;
    source_url: string;
    original_title: string;
    original_url: string;
    processed_title: string | null;
    bullets: string[] | null;
    why_it_matters: string | null;
    topic_id: string | null;
    importance: number;
    read_count: number;
    comment_count: number;
    is_breaking: boolean;
    is_featured: boolean;
    published_at: string | null;
    processed_at: string | null;
    created_at: string;
}

export interface Project {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    repo_url: string | null;
    demo_url: string | null;
    tools_used: string[];
    images: string[];
    view_count: number;
    upvote_count: number;
    comment_count: number;
    report_count: number;
    is_featured: boolean;
    is_featured_until: string | null;
    is_hidden: boolean;
    moderation_status: 'pending' | 'approved' | 'rejected';
    moderation_reason: string | null;
    created_at: string;
    updated_at: string;
}

export default getSupabase;
