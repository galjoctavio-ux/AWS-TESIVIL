/**
 * Update Hot Scores Job
 * 
 * Periodically recalculates hot_score for all projects to ensure
 * the time-decay algorithm keeps the rankings fresh.
 * 
 * This is necessary because hot_score depends on time elapsed,
 * so even without new votes, scores need to decay over time.
 */

import { supabaseAdmin } from '../lib/supabase';

export async function updateHotScores(): Promise<number> {
    console.log('🔥 [HOT-SCORES] Starting hot score update...');

    try {
        // Call the RPC function that updates all hot scores
        const { error } = await supabaseAdmin.rpc('update_all_hot_scores');

        if (error) {
            console.error('❌ [HOT-SCORES] RPC error:', error.message);
            throw error;
        }

        // Get count of updated projects for logging
        const { count } = await supabaseAdmin
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('is_hidden', false);

        console.log(`✅ [HOT-SCORES] Updated ${count || 0} projects`);
        return count || 0;

    } catch (error: any) {
        console.error('❌ [HOT-SCORES] Failed:', error?.message || error);
        throw error;
    }
}
