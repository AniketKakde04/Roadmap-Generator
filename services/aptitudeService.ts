import { supabase } from './supabase';
import { AptitudeTopic, AptitudeQuestion } from '../types';

/**
 * Fetches all aptitude topics from the database.
 */
export const getAptitudeTopics = async (): Promise<AptitudeTopic[]> => {
    const { data, error } = await supabase
        .from('aptitude_topics')
        .select('*')
        .order('name', { ascending: true });
    
    if (error) {
        console.error("Error fetching aptitude topics:", error);
        throw error;
    }
    return data || [];
};

/**
 * Fetches a specified number of random questions for a given topic.
 */
export const getQuizQuestions = async (topicId: string, count: number): Promise<AptitudeQuestion[]> => {
    // Note: Supabase/Postgres doesn't have a simple .limit() with .order('random()')
    // A common way is to use a database function, but for simplicity and smaller datasets,
    // we can fetch all and shuffle, or use a more advanced query.
    // Let's use a stored procedure for efficiency if this table gets big.
    // For now, let's fetch all and shuffle in JS (less efficient, but works for MVP)
    
    // --- SIMPLE METHOD (less efficient for large tables) ---
    const { data, error } = await supabase
        .from('aptitude_questions')
        .select('*')
        .eq('topic_id', topicId);
        
    if (error) {
        console.error("Error fetching questions for topic:", error);
        throw error;
    }

    if (!data) {
        return [];
    }

    // Shuffle the array and take the first 'count'
    const shuffled = data.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
    
    // --- ADVANCED METHOD (Requires SQL function) ---
    /*
    // Run this in Supabase SQL Editor once:
    // create function get_random_questions(topic_uuid uuid, num int)
    // returns setof aptitude_questions
    // language sql
    // as $$
    //     select *
    //     from aptitude_questions
    //     where topic_id = topic_uuid
    //     order by random()
    //     limit num;
    // $$;

    const { data, error } = await supabase.rpc('get_random_questions', {
        topic_uuid: topicId,
        num: count
    });

    if (error) {
        console.error("Error fetching random questions:", error);
        throw error;
    }
    return data || [];
    */
};

