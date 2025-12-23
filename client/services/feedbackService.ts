import { supabase } from './supabase';
import { Feedback } from '../types';

export const submitFeedback = async (feedback: Omit<Feedback, 'id' | 'created_at' | 'is_featured'> & { user_id?: string }) => {
    const { error } = await supabase
        .from('feedbacks')
        .insert([{
            ...feedback,
            is_featured: false // Default to false
        }]);

    if (error) {
        console.error("Error submitting feedback:", error);
        throw error;
    }
};

export const fetchFeaturedFeedbacks = async (): Promise<Feedback[]> => {
    const { data, error } = await supabase
        .from('feedbacks')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching feedbacks:", error);
        return [];
    }

    return data || [];
};
