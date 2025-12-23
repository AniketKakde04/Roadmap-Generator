
import { supabase } from './supabaseService';

export const checkRoadmapLimit = async (userId: string): Promise<boolean> => {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('user_usage')
        .select('roadmap_count')
        .eq('user_id', userId)
        .eq('usage_date', today)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is 'Row not found'
        console.error('Error checking limit (bypassing):', error);
        return true; // Fail open: Allow generation if DB check fails
    }

    if (!data) {
        return true; // No usage record for today, limit not reached
    }

    return data.roadmap_count < 1; // Limit is 1 per day
};

export const incrementRoadmapUsage = async (userId: string): Promise<void> => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Upsert: Try to update, if not found, insert
        const { data, error } = await supabase
            .from('user_usage')
            .select('roadmap_count')
            .eq('user_id', userId)
            .eq('usage_date', today)
            .single();

        let currentCount = 0;
        if (data) {
            currentCount = data.roadmap_count;
        }

        const { error: upsertError } = await supabase
            .from('user_usage')
            .upsert({
                user_id: userId,
                usage_date: today,
                roadmap_count: currentCount + 1
            });

        if (upsertError) {
            console.error('Error incrementing usage:', upsertError);
        }
    } catch (e) {
        console.error('Failed to increment usage (non-fatal):', e);
    }
};
