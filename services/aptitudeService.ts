import { supabase } from './supabase';
import { AptitudeTopic, AptitudeQuestion, GeneratedAptitudeQuestion } from '../types';
import { generateAptitudeQuestions, generateStudyGuide } from './geminiService'; // Import both AI functions

/**
 * Fetches all aptitude topics from the database.
 */
export const getAptitudeTopics = async (): Promise<AptitudeTopic[]> => {
    const { data, error } = await supabase
        .from('aptitude_topics')
        // Updated to select the new 'study_guide' column
        .select('id, name, category, study_guide') 
        .order('name', { ascending: true });
    
    if (error) {
        console.error("Error fetching aptitude topics:", error);
        throw error;
    }
    return data || [];
};

/**
 * Saves newly generated AI questions to the database.
 */
const saveGeneratedQuestions = async (
    newQuestions: GeneratedAptitudeQuestion[], 
    topicId: string
): Promise<AptitudeQuestion[]> => {
    
    const questionsToInsert = newQuestions.map(q => ({
        topic_id: topicId,
        question_text: q.question_text,
        options: q.options,
        correct_answer_index: q.correct_answer_index,
        explanation: q.explanation,
        is_ai_generated: true 
    }));

    const { data, error } = await supabase
        .from('aptitude_questions')
        .insert(questionsToInsert)
        .select(); 

    if (error) {
        console.error("Error saving generated questions:", error);
        return []; 
    }
    
    return data || [];
};

/**
 * Fetches quiz questions, now with AI generation logic.
 */
export const getQuizQuestions = async (
    topic: AptitudeTopic, 
    totalCount: number
): Promise<AptitudeQuestion[]> => {
    
    const referenceCount = 2; 
    const generateCount = totalCount - referenceCount; 

    // 1. Fetch reference questions from the DB
    const { data: referenceQuestions, error: rpcError } = await supabase.rpc('get_random_questions', {
        topic_uuid: topic.id,
        num: referenceCount
    });

    if (rpcError) {
        console.error("Error fetching random questions via RPC:", rpcError);
        throw rpcError;
    }

    if (!referenceQuestions || referenceQuestions.length === 0) {
        console.warn("No reference questions found for this topic.");
    }

    try {
        // 2. Generate new questions using AI
        // --- UPDATED THIS LINE ---
        const newQuestions = await generateAptitudeQuestions(
            referenceQuestions || [], 
            topic.name,
            topic.category, // <-- NOW PASSING THE CATEGORY
            generateCount
        );

        // 3. Save new questions to DB (in the background)
        saveGeneratedQuestions(newQuestions, topic.id)
            .then(saved => {
                console.log(`Successfully saved ${saved.length} new AI questions in the background.`);
            })
            .catch(err => {
                console.error("Failed to save new questions in background:", err);
            });

        // 4. Format new questions for the UI and return the combined list
        const newQuestionsForQuiz: AptitudeQuestion[] = newQuestions.map((q, i) => ({
            ...q,
            id: `ai-gen-${i}`, // Temporary ID for React key
            topic_id: topic.id,
            is_ai_generated: true,
            source_tag: 'AI Generated',
            difficulty: 0,
            created_at: new Date().toISOString() 
        }));
        
        return [...(referenceQuestions || []), ...newQuestionsForQuiz];

    } catch (aiError) {
        console.error("AI question generation failed:", aiError);
        return referenceQuestions || [];
    }
};


// --- (getStudyGuideForTopic function remains exactly the same) ---
/**
 * Fetches the study guide for a topic.
 * If the guide doesn't exist in the DB, it generates it with AI,
 * saves it to the DB, and then returns it.
 */
export const getStudyGuideForTopic = async (topic: AptitudeTopic): Promise<string> => {
    // 1. If study guide already exists in the object, return it.
    if (topic.study_guide) {
        console.log("Found cached study guide in DB.");
        return topic.study_guide;
    }

    // 2. If not, generate it using the AI service.
    console.log(`No study guide found for "${topic.name}". Generating one with AI...`);
    try {
        const studyGuideText = await generateStudyGuide(topic.name);

        // 3. Save the newly generated guide back to the database
        const { error } = await supabase
            .from('aptitude_topics')
            .update({ study_guide: studyGuideText })
            .eq('id', topic.id);

        if (error) {
            // Log the error but don't stop the user from seeing the guide
            console.error("Failed to cache study guide to DB:", error);
        } else {
            console.log(`Successfully cached study guide for "${topic.name}".`);
        }

        // 4. Return the new text
        return studyGuideText;

    } catch (aiError) {
        console.error("Failed to generate study guide from AI:", aiError);
        return "Error loading study guide. Please try again.";
    }
};