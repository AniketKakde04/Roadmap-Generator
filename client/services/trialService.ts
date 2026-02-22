import { supabase } from './supabase';

export const checkTrialUsed = async (userId: string, type: string): Promise<boolean> => {
    const { data, error } = await supabase
        .from('user_trials')
        .select('*')
        .eq('user_id', userId)
        .eq('trial_type', type)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is code for 'no rows found'
        console.error("Error checking trial usage:", error);
        return false;
    }

    return !!data;
};

export const recordTrialUsage = async (userId: string, type: string): Promise<void> => {
    const { error } = await supabase
        .from('user_trials')
        .insert([{ user_id: userId, trial_type: type }]);

    if (error) {
        console.error("Error recording trial usage:", error);
        throw error;
    }
};
