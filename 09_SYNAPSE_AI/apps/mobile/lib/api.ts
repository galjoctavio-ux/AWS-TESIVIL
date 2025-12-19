import { API_URL } from '@/constants/config';
import { getSession } from './supabase';

interface FetchOptions extends RequestInit {
    requiresAuth?: boolean;
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    details?: any;
}

/**
 * Wrapper around fetch for API calls
 * Automatically adds auth headers and base URL
 */
export async function apiFetch<T = any>(
    endpoint: string,
    options: FetchOptions = {}
): Promise<ApiResponse<T>> {
    const { requiresAuth = false, ...fetchOptions } = options;

    // Build headers
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
    };

    // Add auth header if required
    if (requiresAuth) {
        const session = await getSession();
        if (session?.user?.id) {
            (headers as Record<string, string>)['x-user-id'] = session.user.id;
        } else {
            return {
                success: false,
                error: 'Authentication required',
            };
        }
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...fetchOptions,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || `Request failed with status ${response.status}`,
                details: data.details,
            };
        }

        return data;
    } catch (error: any) {
        console.error('API Fetch error:', error);
        return {
            success: false,
            error: error.message || 'Network error',
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// ENGINE API
// ═══════════════════════════════════════════════════════════════

export async function refinePrompt(rawInput: string) {
    return apiFetch<{ original: string; enriched: string; executionTimeMs: number }>(
        '/api/prompts/refine',
        {
            method: 'POST',
            body: JSON.stringify({ rawInput }),
        }
    );
}

export async function generatePrompt(config: {
    description: string;
    style: string;
    lighting?: string;
    aspectRatio?: string;
    targetEngine?: string;
}) {
    return apiFetch<{ prompt: string; negativePrompt: string }>(
        '/api/prompts/generate',
        {
            method: 'POST',
            body: JSON.stringify(config),
        }
    );
}

export async function savePrompt(data: {
    rawInput: string;
    enrichedInput?: string;
    style: string;
    params: Record<string, any>;
    outputPrompt: string;
    outputNegativePrompt?: string;
    targetEngine: string;
}) {
    return apiFetch('/api/prompts/save', {
        method: 'POST',
        body: JSON.stringify(data),
        requiresAuth: true,
    });
}

export async function getPromptHistory(limit = 5) {
    return apiFetch<any[]>(`/api/prompts/history?limit=${limit}`, {
        requiresAuth: true,
    });
}

// ═══════════════════════════════════════════════════════════════
// FEED API
// ═══════════════════════════════════════════════════════════════

export async function getNews(options: { limit?: number; offset?: number; topic?: string } = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.set('limit', String(options.limit));
    if (options.offset) params.set('offset', String(options.offset));
    if (options.topic) params.set('topic', options.topic);

    return apiFetch<any[]>(`/api/news?${params.toString()}`);
}

export async function getNewsArticle(id: string) {
    return apiFetch<any>(`/api/news/${id}`);
}

// ═══════════════════════════════════════════════════════════════
// PULSE API
// ═══════════════════════════════════════════════════════════════

export async function getModels(options: {
    category?: string;
    limit?: number;
    offset?: number;
    sort?: string;
} = {}) {
    const params = new URLSearchParams();
    if (options.category) params.set('category', options.category);
    if (options.limit) params.set('limit', String(options.limit));
    if (options.offset) params.set('offset', String(options.offset));
    if (options.sort) params.set('sort', options.sort);

    return apiFetch<any[]>(`/api/models?${params.toString()}`);
}

export async function getTopModels() {
    return apiFetch<any[]>('/api/models/top');
}

export async function getModel(id: string) {
    return apiFetch<any>(`/api/models/${id}`);
}

export async function submitReview(modelId: string, review: {
    creativity: number;
    speed: number;
    accuracy: number;
    tag?: string;
    comment?: string;
}) {
    return apiFetch(`/api/models/${modelId}/reviews`, {
        method: 'POST',
        body: JSON.stringify(review),
        requiresAuth: true,
    });
}

// ═══════════════════════════════════════════════════════════════
// SHOWCASE API
// ═══════════════════════════════════════════════════════════════

export async function getProjects(options: {
    limit?: number;
    offset?: number;
    sort?: string;
    tool?: string;
} = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.set('limit', String(options.limit));
    if (options.offset) params.set('offset', String(options.offset));
    if (options.sort) params.set('sort', options.sort);
    if (options.tool) params.set('tool', options.tool);

    return apiFetch<any[]>(`/api/projects?${params.toString()}`);
}

export async function getProject(id: string) {
    return apiFetch<any>(`/api/projects/${id}`);
}

export async function createProject(data: {
    title: string;
    description?: string;
    repoUrl?: string;
    demoUrl?: string;
    toolsUsed?: string[];
    images?: string[];
}) {
    return apiFetch('/api/projects', {
        method: 'POST',
        body: JSON.stringify(data),
        requiresAuth: true,
    });
}

export async function voteProject(projectId: string) {
    return apiFetch(`/api/projects/${projectId}/vote`, {
        method: 'POST',
        requiresAuth: true,
    });
}
