import { supabase } from './supabase';
import { AptitudeTopic, AptitudeQuestion, GeneratedAptitudeQuestion } from '../types';
// --- REMOVED: import for generateAptitudeQuestions ---
import { generateStudyGuide } from './geminiService'; 

/**
 * Fetches all aptitude topics from the database.
 */
export const getAptitudeTopics = async (): Promise<AptitudeTopic[]> => {
    const { data, error } = await supabase
        .from('aptitude_topics')
        .select('id, name, category, study_guide') 
        .order('name', { ascending: true });
    
    if (error) {
        console.error("Error fetching aptitude topics:", error);
        throw error;
    }
    return data || [];
};

// --- REMOVED: The saveGeneratedQuestions function is no longer needed ---

/**
 * Fetches quiz questions.
 * * --- UPDATED ---
 * This function no longer generates questions. It now simply fetches
 * the required number of random questions directly from the database
 * using the 'get_random_questions' RPC.
 */
export const getQuizQuestions = async (
    topic: AptitudeTopic, 
    totalCount: number
): Promise<AptitudeQuestion[]> => {
    
    // 1. Fetch all quiz questions directly from the DB
    // (Make sure you created 'get_random_questions' in your Supabase SQL Editor)
    const { data, error } = await supabase.rpc('get_random_questions', {
        topic_uuid: topic.id,
        num: totalCount // Ask for the full amount (e.g., 10)
    });

    if (error) {
        console.error("Error fetching random questions via RPC:", error);
        throw error;
    }

    if (!data || data.length === 0) {
        console.warn("No questions found for this topic in the database.");
        return [];
    }

    // 2. Return the questions from the database
    return data;
};


// --- (The getStudyGuideForTopic function remains exactly the same) ---
export const getStudyGuideForTopic = async (topic: AptitudeTopic): Promise<string> => {
    if (topic.study_guide) {
        console.log("Found cached study guide in DB.");
        return topic.study_guide;
    }
    console.log(`No study guide found for "${topic.name}". Generating one with AI...`);
    try {
        const studyGuideText = await generateStudyGuide(topic.name);
        const { error } = await supabase
            .from('aptitude_topics')
            .update({ study_guide: studyGuideText })
            .eq('id', topic.id);
        if (error) {
            console.error("Failed to cache study guide to DB:", error);
        } else {
            console.log(`Successfully cached study guide for "${topic.name}".`);
        }
        return studyGuideText;
    } catch (aiError) {
        console.error("Failed to generate study guide from AI:", aiError);
        return "Error loading study guide. Please try again.";
    }
};