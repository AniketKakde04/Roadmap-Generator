import { supabase } from './supabase';
import { AptitudeTopic, AptitudeQuestion } from '../types';
import { generateStudyGuide } from './geminiService';
import { APTITUDE_DATA } from './aptitudeData';

const MOCKED_NUMBER_SYSTEM_ID = 'mock-number-system-id';

// Helper to convert JSON data to Markdown
const convertDataToMarkdown = (data: any): string => {
    let md = `# ${data.chapter_title}\n\n`;

    if (data.sections) {
        data.sections.forEach((section: any) => {
            md += `## ${section.heading}\n`;

            if (section.description) md += `${section.description}\n\n`;
            if (section.definition) md += `${section.definition}\n\n`;

            // Handle 'content' array (General terms, definitions, etc.)
            if (section.content) {
                section.content.forEach((item: any) => {
                    if (item.term) md += `- **${item.term}**: ${item.definition || item.rule || ''}\n`;
                    if (item.conversion_rule) md += `  > **Rule**: ${item.conversion_rule}\n`;
                    if (item.example) md += `  > **Example**: ${item.example}\n`;
                    if (item.examples) md += `  > **Examples**: ${item.examples.join(', ')}\n`;

                    if (item.formula) {
                        md += `- **${item.formula}**`;
                        if (item.note) md += `: ${item.note}`;
                        if (item.equation) md += `: ${item.equation}`;
                        if (item.steps) md += `: ${item.steps}`;
                        md += '\n';
                    }
                });
                md += '\n';
            }

            // Handle 'rules' (Divisibility tests, etc.)
            if (section.rules) {
                section.rules.forEach((item: any) => {
                    if (typeof item === 'string') {
                        md += `- ${item}\n`;
                    } else if (item.divisor) {
                        md += `- **${item.divisor}**: ${item.rule}\n`;
                    } else if (item.rule) { // Fallback
                        md += `- ${item.rule}\n`;
                    }
                });
                md += '\n';
            }

            // Handle 'formulas' / 'derived_formulas'
            const formulas = section.formulas || section.derived_formulas;
            if (formulas) {
                formulas.forEach((f: string) => md += `- ${f}\n`);
                md += '\n';
            }

            // Handle 'points'
            if (section.points) {
                section.points.forEach((p: string) => md += `- ${p}\n`);
                md += '\n';
            }

            // Handle 'operations'
            if (section.operations) {
                section.operations.forEach((op: any) => {
                    md += `- **${op.name}**: ${op.rule}\n`;
                });
                md += '\n';
            }

            // Handle 'methods'
            if (section.methods) {
                section.methods.forEach((m: any) => {
                    md += `- **${m.name}**: ${m.steps || m.method}\n`;
                });
                md += '\n';
            }
            if (section.method && typeof section.method === 'string') {
                md += `- **Method**: ${section.method}\n`;
            }

            // Handle 'sequence' (BODMAS) / 'order'
            if (section.sequence) {
                section.sequence.forEach((s: any) => md += `- **${s.letter}**: ${s.meaning}\n`);
                md += '\n';
            }
            if (section.order) {
                section.order.forEach((o: any) => md += `- **${o.name}** (${o.symbol})\n`);
                md += '\n';
            }

            // Handle 'translations'
            if (section.translations) {
                section.translations.forEach((t: any) => md += `- "${t.text}" → $${t.math}$\n`);
                md += '\n';
            }

            if (section.example) md += `> **Example**: ${section.example}\n\n`;
            if (section.formulas && !Array.isArray(section.formulas)) md += `${section.formulas}\n\n`; // rare edge case if string

            md += '\n';
        });
    }

    return md;
};

const NUMBER_SYSTEM_QUESTIONS: AptitudeQuestion[] = [
    {
        id: 'q1',
        topic_id: MOCKED_NUMBER_SYSTEM_ID,
        question_text: "What is the smallest prime number?",
        options: ["0", "1", "2", "3"],
        correct_answer_index: 2,
        explanation: "2 is the smallest prime number. 0 and 1 are not prime numbers.",
        is_ai_generated: false
    },
    {
        id: 'q2',
        topic_id: MOCKED_NUMBER_SYSTEM_ID,
        question_text: "Which of the following is an irrational number?",
        options: ["22/7", "3.14", "π", "0"],
        correct_answer_index: 2,
        explanation: "π (pi) is an irrational number. 22/7 and 3.14 are rational approximations.",
        is_ai_generated: false
    },
    {
        id: 'q3',
        topic_id: MOCKED_NUMBER_SYSTEM_ID,
        question_text: "A number is divisible by 3 if:",
        options: ["The last digit is divisible by 3", "The sum of its digits is divisible by 3", "The last two digits are divisible by 3", "It is an odd number"],
        correct_answer_index: 1,
        explanation: "A number is divisible by 3 if the sum of its digits is divisible by 3.",
        is_ai_generated: false
    },
    {
        id: 'q4',
        topic_id: MOCKED_NUMBER_SYSTEM_ID,
        question_text: "The sum of the first 5 prime numbers is:",
        options: ["11", "18", "26", "28"],
        correct_answer_index: 3,
        explanation: "The first 5 prime numbers are 2, 3, 5, 7, 11. Sum = 2 + 3 + 5 + 7 + 11 = 28.",
        is_ai_generated: false
    },
    {
        id: 'q5',
        topic_id: MOCKED_NUMBER_SYSTEM_ID,
        question_text: "Which of the following numbers is divisible by 11?",
        options: ["1331", "1212", "11111", "10101"],
        correct_answer_index: 0,
        explanation: "1331: Sum of odd place digits (1+3)=4. Sum of even place digits (3+1)=4. Difference = 4-4=0. Divisible by 11.",
        is_ai_generated: false
    }
];

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

    const topics = (data || []) as AptitudeTopic[];

    // Inject Topics from APTITUDE_DATA if they don't exist
    Object.entries(APTITUDE_DATA).forEach(([key, value]) => {
        const exists = topics.some(t => t.name.toLowerCase() === value.chapter_title.toLowerCase());
        if (!exists) {
            topics.push({
                id: `mock-${key}`,
                name: value.chapter_title,
                category: 'Quantitative', // Defaulting to Quantitative for now
                study_guide: convertDataToMarkdown(value)
            });
        }
    });

    // Filter out topics that don't have substantial study notes (preventing empty/placeholder topics)
    return topics.filter(t => t.study_guide && t.study_guide.trim().length > 50);
};

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

    // Return mocked questions for Number System
    if (topic.id.includes('number-system') || topic.name.toLowerCase() === 'number system') {
        const shuffled = [...NUMBER_SYSTEM_QUESTIONS].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, totalCount);
    }

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


export const getStudyGuideForTopic = async (topic: AptitudeTopic): Promise<string> => {
    // 1. Check if we have local JSON data for this topic
    // match by ID (mock-key) or loose name match
    const localDataKey = Object.keys(APTITUDE_DATA).find(key =>
        `mock-${key}` === topic.id ||
        APTITUDE_DATA[key as keyof typeof APTITUDE_DATA].chapter_title.toLowerCase() === topic.name.toLowerCase()
    );

    if (localDataKey) {
        return convertDataToMarkdown(APTITUDE_DATA[localDataKey as keyof typeof APTITUDE_DATA]);
    }

    // --- BYPASS CACHE to ensure we use the new Book Content ---
    // if (topic.study_guide) {
    //     console.log("Found cached study guide in DB.");
    //     return topic.study_guide;
    // }
    console.log(`Generating fresh study guide from book for "${topic.name}"...`);
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