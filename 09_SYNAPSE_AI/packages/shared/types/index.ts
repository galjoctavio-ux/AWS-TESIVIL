// ═══════════════════════════════════════════════════════════════
// SYNAPSE_AI - Shared Types
// Common TypeScript interfaces used across the monorepo
// ═══════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────
// USER & AUTH
// ───────────────────────────────────────────────────────────────

export type UserRole = 'user' | 'developer' | 'partner' | 'admin';

export interface Profile {
    id: string;
    email: string | null;
    alias: string | null;
    photo_url: string | null;
    is_premium: boolean;
    premium_until: string | null;
    role: UserRole;
    created_at: string;
    updated_at: string;
}

// ───────────────────────────────────────────────────────────────
// MODULE 1: ENGINE (Prompt Generator)
// ───────────────────────────────────────────────────────────────

export type StyleId =
    | 'fotorealismo'
    | 'arquitectura'
    | 'minimalismo'
    | 'anime'
    | '3d_pixar'
    | 'cyberpunk'
    | 'oleo'
    | 'arte_digital';

export type LightingId =
    | 'natural'
    | 'studio'
    | 'golden'
    | 'dramatic'
    | 'soft'
    | 'high_contrast'
    | 'neon';

export type LensId =
    | 'wide'
    | 'macro'
    | 'bokeh'
    | 'drone';

export type TechniqueId =
    | 'fine_lines'
    | 'vibrant'
    | 'cel_shading'
    | 'global_light'
    | 'soft_texture'
    | 'glow'
    | 'paint_effect'
    | 'texture';

export type AspectRatio = '1:1' | '16:9' | '9:16';

export type TargetEngine = 'midjourney' | 'dalle3' | 'stable';

export interface PromptConfig {
    style: StyleId;
    lighting: LightingId;
    lensOrTechnique: LensId | TechniqueId;
    aspectRatio: AspectRatio;
    targetEngine: TargetEngine;
}

export interface PromptHistory {
    id: string;
    user_id: string;
    input_raw: string;
    input_enriched: string | null;
    config_json: PromptConfig;
    prompt_final: string;
    negative_prompt: string | null;
    tokens_used: number;
    created_at: string;
}

// ───────────────────────────────────────────────────────────────
// MODULE 2: PULSE (Rankings)
// ───────────────────────────────────────────────────────────────

export type ModelCategory = 'pro' | 'flash';

export type PricingType = 'free_web' | 'subscription' | 'api';

export interface AIModel {
    id: string;
    name: string;
    brand: string;
    version: string | null;
    category: ModelCategory;
    pricing_type: PricingType[];
    pricing_input_1m: number | null;
    pricing_output_1m: number | null;
    context_window: number | null;
    logo_url: string | null;
    website_url: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface AIStats {
    model_id: string;
    benchmark_score: number | null;
    community_score: number | null;
    avg_speed: number | null;
    avg_precision: number | null;
    avg_hallucination: number | null;
    reviews_count: number;
    tokens_per_second: number | null;
}

export interface AIBenchmark {
    id: string;
    model_id: string;
    category: 'coding' | 'logic' | 'creative' | 'vision';
    source: string;
    score: number;
    ranking_position: number | null;
    updated_at: string;
}

export interface AIReview {
    id: string;
    model_id: string;
    user_id: string;
    stars_speed: number;
    stars_precision: number;
    stars_hallucination: number;
    comment: string | null;
    use_case_tag: string | null;
    is_helpful_count: number;
    created_at: string;
}

// Enriched model with stats
export interface AIModelWithStats extends AIModel {
    stats: AIStats | null;
    benchmarks?: AIBenchmark[];
}

// ───────────────────────────────────────────────────────────────
// MODULE 3: FEED (News)
// ───────────────────────────────────────────────────────────────

export interface NewsSummary {
    bullets: string[];
    why_it_matters: string;
}

export interface NewsArticle {
    id: string;
    title: string;
    summary_json: NewsSummary;
    topic_id: string;
    source_name: string;
    url_original: string;
    image_url: string | null;
    importance: number;
    published_at: string | null;
    created_at: string;
}

export interface NewsComment {
    id: string;
    article_id: string;
    user_id: string;
    content: string;
    created_at: string;
    // Joined
    user?: Pick<Profile, 'alias' | 'photo_url'>;
}

// ───────────────────────────────────────────────────────────────
// MODULE 4: SHOWCASE (Projects)
// ───────────────────────────────────────────────────────────────

export type ActionType = 'visit' | 'download' | 'inspiration';

export type ToolTag =
    | 'antigravity'
    | 'cursor'
    | 'bolt'
    | 'v0'
    | 'chatgpt'
    | 'claude'
    | 'windsurf'
    | 'replit'
    | 'devin'
    | 'other';

export interface Project {
    id: string;
    user_id: string;
    title: string;
    description: string;
    tools_array: ToolTag[];
    image_urls: string[];
    action_type: ActionType;
    project_url: string | null;
    views_count: number;
    upvotes_count: number;
    is_hidden: boolean;
    is_trending: boolean;
    is_featured_until: string | null;
    report_count: number;
    created_at: string;
    updated_at: string;
    // Joined
    user?: Pick<Profile, 'alias' | 'photo_url'>;
}

export type CommentType =
    | 'pregunta_tecnica'
    | 'felicitacion'
    | 'feedback'
    | 'neutral';

export interface ProjectComment {
    id: string;
    project_id: string;
    user_id: string;
    content: string;
    comment_type: CommentType | null;
    is_moderated: boolean;
    created_at: string;
    // Joined
    user?: Pick<Profile, 'alias' | 'photo_url'>;
}

// ───────────────────────────────────────────────────────────────
// ANALYTICS
// ───────────────────────────────────────────────────────────────

export type EventType =
    | 'prompt_generated'
    | 'model_viewed'
    | 'model_clicked'
    | 'news_viewed'
    | 'project_viewed'
    | 'project_clicked'
    | 'ad_impression'
    | 'ad_clicked'
    | 'review_created'
    | 'upvote';

export interface AnalyticsEvent {
    event_type: EventType;
    target_id?: string;
    metadata?: Record<string, any>;
}

export interface AppAnalytics {
    id: string;
    event_type: EventType;
    target_id: string | null;
    user_id: string | null;
    metadata: Record<string, any> | null;
    created_at: string;
}

// ───────────────────────────────────────────────────────────────
// API RESPONSES
// ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

export interface ApiError {
    error: string;
    code: string;
    details?: any;
}
