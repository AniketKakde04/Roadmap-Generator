
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
        console.error('Error checking limit:', error);
        throw new Error('Failed to check usage limit');
    }

    if (!data) {
        return true; // No usage record for today, limit not reached
    }

    return data.roadmap_count < 1; // Limit is 1 per day
};

export const incrementRoadmapUsage = async (userId: string): Promise<void> => {
    const today = new Date().toISOString().split('T')[0];

    // Upsert: Try to update, if not found, insert
    // We first try to select to see if it exists to handle the counter increment correctly
    // or we can just use upsert with a count logic if supabase supports it easily, 
    // but standard upsert overwrites. 
    // Best approach for atomic increment:
    // 1. Get current count (default 0)
    // 2. Upsert (count + 1)

    // Simpler approach compatible with the schema we just made:
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
};
