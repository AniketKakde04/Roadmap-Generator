import { GoogleGenAI, Type } from "@google/genai";
import { Roadmap, ProjectSuggestion, AnalysisReport, ChatMessage, InterviewFeedback, AptitudeQuestion, GeneratedAptitudeQuestion } from '../types';
import { base64ToArrayBuffer, pcmToWav } from './audioUtils';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

if (!API_KEY) {
    console.warn("GEMINI_API_KEY is not set in environment variables");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- NEW: Text content extracted from 'Master Formula Sheets.pdf' ---
// This is used as the context for the AI to generate study guides.

let PDF_TEXT_CONTENT = '';
try {
    const dataPath = path.join(__dirname, '../data/aptitude_book.txt');
    if (fs.existsSync(dataPath)) {
        console.log('Loading Aptitude Book content...');
        PDF_TEXT_CONTENT = fs.readFileSync(dataPath, 'utf-8');
        // Truncate if too huge to prevent OOM or context limits (optional, Flash matches 1M tokens)
        // PDF_TEXT_CONTENT = PDF_TEXT_CONTENT.substring(0, 1000000); 
    } else {
        console.warn('Aptitude Book content file not found. Study guides will be empty.');
    }
} catch (err) {
    console.error('Failed to load Aptitude Book content:', err);
}

// --- (Existing Schemas: resourceSchema, stepSchema, roadmapSchema, analysisReportSchema) ... ---
// (Copy them from your existing file)
const resourceSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING }, url: { type: Type.STRING },
        type: { type: Type.STRING, enum: ['video', 'article', 'documentation', 'course', 'tool', 'other'] },
    }, required: ["title", "url", "type"],
};
const stepSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING }, description: { type: Type.STRING },
        // resources removed
    }, required: ["title", "description"],
};
const roadmapSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING }, description: { type: Type.STRING },
        steps: { type: Type.ARRAY, items: stepSchema },
    }, required: ["title", "description", "steps"],
};
const analysisReportSchema = {
    type: Type.OBJECT,
    properties: {
        matchScore: { type: Type.NUMBER },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
        feedback: { type: Type.ARRAY, items: { type: Type.STRING } },
        projectSuggestions: {
            type: Type.ARRAY, items: {
                type: Type.OBJECT,
                properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, reasoning: { type: Type.STRING } },
                required: ["title", "description", "reasoning"],
            }
        },
    }, required: ["matchScore", "strengths", "gaps", "feedback", "projectSuggestions"],
};

// --- NEW: Schema for the Study Guide ---
const studyGuideSchema = {
    type: Type.OBJECT,
    properties: {
        study_guide_markdown: {
            type: Type.STRING,
            description: "A string containing the extracted formulas and theory formatted as simple Markdown. Use headings, bullet points, and bold text for clarity."
        }
    },
    required: ["study_guide_markdown"]
};

const interviewFeedbackSchema = {
    type: Type.OBJECT,
    properties: {
        overall_feedback: {
            type: Type.STRING,
            description: "A brief, 2-3 sentence overall summary of the candidate's performance."
        },
        strengths: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 2-3 key strengths the candidate demonstrated."
        },
        areas_for_improvement: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 2-3 specific, actionable areas for improvement."
        }
    },
    required: ["overall_feedback", "strengths", "areas_for_improvement"],
};

const aptitudeQuizSchema = {
    type: Type.OBJECT,
    properties: {
        new_questions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question_text: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correct_answer_index: { type: Type.NUMBER },
                    explanation: { type: Type.STRING }
                },
                required: ["question_text", "options", "correct_answer_index", "explanation"]
            }
        }
    },
    required: ["new_questions"]
};

export async function suggestProjectsFromResume(resumeText: string, jobTitle: string, jobDescription: string): Promise<AnalysisReport> {
    try {
        if (!resumeText.trim()) { throw new Error("Resume text cannot be empty."); }

        let prompt = `You are an expert career coach and senior hiring manager for a top tech company. Your task is to conduct a detailed analysis comparing the provided resume against the target job description.

Your analysis must include the following five parts:
1.  **Match Score:** Calculate a percentage score representing how well the resume aligns with the job requirements.
2.  **Strengths:** Identify the key skills from the resume that are a strong match for the job.
3.  **Gaps:** Identify the most critical skills required by the job that are missing from the resume.
4.  **Resume Feedback:** Provide 2-3 bullet points of actionable advice to improve the resume's language, structure, or impact.
5.  **Project Suggestions:** Based *only* on the identified "Gaps," suggest 3 unique and impactful projects the candidate could build to gain the missing skills. For each project, explain the reasoning clearly.

The output MUST be a valid JSON object matching the provided schema.`;

        if (jobTitle.trim() || jobDescription.trim()) {
            prompt += `\n\nThe candidate is specifically targeting the following job.`;
            if (jobTitle.trim()) {
                prompt += `\n\nTarget Job Title: ${jobTitle}`;
            }
            if (jobDescription.trim()) {
                prompt += `\n\nJob Description:\n---\n${jobDescription}\n---`;
            }
        }

        prompt += `\n\nResume Text:\n---\n${resumeText}\n---\n\nPlease generate the full analysis report now.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: analysisReportSchema },
        });
        const jsonText = (response.text || "").trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating analysis report:", error);
        if (error instanceof Error) { throw new Error(`Failed to get analysis from AI: ${error.message}`); }
        throw new Error("An unknown error occurred while analyzing the resume.");
    }
}

import { checkRoadmapLimit, incrementRoadmapUsage } from './usageService';

export async function generateRoadmap(topic: string, level: string, timeline: string, userId: string): Promise<Roadmap> {
    // TOGGLE: Set to true to use N8N, false to use Gemini directly
    const USE_N8N = false;

    // Check Usage Limit (Only if we have a userId)
    if (userId) {
        const canGenerate = await checkRoadmapLimit(userId);
        if (!canGenerate) {
            throw new Error("Daily limit reached. You can only generate 1 roadmap per day.");
        }
    }

    let result: Roadmap;
    if (USE_N8N) {
        result = await generateRoadmapViaN8N(topic, level, timeline);
    } else {
        result = await generateRoadmapViaGemini(topic, level, timeline);
    }

    // Increment Usage if successful
    if (userId) {
        await incrementRoadmapUsage(userId);
    }

    return result;
}

async function generateRoadmapViaGemini(topic: string, level: string, timeline: string): Promise<Roadmap> {
    try {
        console.log(`Generating Roadmap via Gemini for topic: ${topic}`);

        const prompt = `You are an expert curriculum designer and career coach.
Your task is to create a comprehensive, step-by-step learning roadmap for the following topic:

**Topic:** ${topic}
**Difficulty Level:** ${level}
**Target Timeline:** ${timeline || 'Flexible'}

Requirements:
1.  **Structure:** Break down the learning path into logical steps (e.g., "Foundations", "Core Concepts", "Advanced Topics").
2.  **Clarity:** Be specific about what to learn in each step.
3.  **Goal:** The user should be job-ready or proficient by the end of this roadmap.

The output MUST be a valid JSON object matching the provided \`roadmapSchema\`.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: roadmapSchema,
            },
        });

        const jsonText = (response.text || "").trim();
        const roadmapData: Roadmap = JSON.parse(jsonText);

        if (!roadmapData.title || !Array.isArray(roadmapData.steps)) {
            throw new Error("Invalid roadmap structure received from AI.");
        }

        // Ensure title reflects the topic
        roadmapData.title = roadmapData.title || `Roadmap for ${topic}`;

        // Polyfill resources to satisfy the type definition
        roadmapData.steps = roadmapData.steps.map(step => ({
            ...step,
            resources: []
        }));

        return roadmapData;

    } catch (error) {
        console.error("Error generating roadmap via Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate roadmap: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the roadmap.");
    }
}

async function generateRoadmapViaN8N(topic: string, level: string, timeline: string): Promise<Roadmap> {
    try {
        // Check if the webhook URL is configured
        if (!N8N_WEBHOOK_URL) {
            throw new Error("N8N_WEBHOOK_URL is not defined in environment variables.");
        }

        console.log(`Calling N8N Workflow for topic: ${topic}`);

        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                topic,
                level,
                timeline
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("N8N Error Response:", errorText);
            throw new Error(`N8N Workflow failed with status: ${response.status} - ${errorText}`);
        }
        const text = await response.text(); // Get raw text first
        console.log("Raw N8N Response:", text); // Log it to see what's happening

        if (!text) {
            throw new Error("N8N returned an empty response. Check the 'Respond to Webhook' node.");
        }

        let data = JSON.parse(text); // Now parse it safely

        // Handle case where n8n returns { "output": "```json ... ```" } or { "text": "..." }
        if (data.output && typeof data.output === 'string') {
            const cleanedOutput = data.output.replace(/```json/g, '').replace(/```/g, '').trim();
            try {
                data = JSON.parse(cleanedOutput);
            } catch (e) {
                console.warn("Failed to parse inner output JSON", e);
            }
        } else if (data.text && typeof data.text === 'string') {
            const cleanedText = data.text.replace(/```json/g, '').replace(/```/g, '').trim();
            try {
                data = JSON.parse(cleanedText);
            } catch (e) {
                console.warn("Failed to parse inner text JSON", e);
            }
        }

        // Ensure the response from N8N matches the Roadmap type
        // The N8N workflow usually returns the JSON object in the body or a specific property
        // Adjust 'data' below if your N8N workflow returns { "roadmap": { ... } }
        const roadmapData: Roadmap = data;

        // Ensure steps is an array
        if (!roadmapData.steps || !Array.isArray(roadmapData.steps)) {
            // Try to find steps in data
            if (data.roadmap && data.roadmap.steps) {
                return data.roadmap;
            }
            // Fallback or error
            console.warn("Roadmap data missing steps array", data);
        }

        return roadmapData;

    } catch (error) {
        console.error("Error generating roadmap via N8N:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate roadmap: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the roadmap.");
    }
}

export const generateAIReply = async (prompt: string): Promise<string[]> => {
    try {
        const suggestionSchema = {
            type: Type.OBJECT,
            properties: { suggestions: { type: Type.ARRAY, items: { type: Type.STRING } } },
            required: ["suggestions"]
        };
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", contents: `${prompt} Please provide three distinct options.`,
            config: { responseMimeType: "application/json", responseSchema: suggestionSchema },
        });
        const jsonText = (response.text || "").trim();
        return JSON.parse(jsonText).suggestions;
    } catch (error) {
        console.error("Error generating AI reply:", error);
        if (error instanceof Error) { throw new Error(`Failed to get AI reply: ${error.message}`); }
        throw new Error("An unknown error occurred while generating AI reply.");
    }
};

// --- UPDATED FUNCTION ---
export const generateAptitudeQuestions = async (
    referenceQuestions: AptitudeQuestion[],
    topicName: string,
    topicCategory: string, // <-- NEW PARAMETER
    count: number
): Promise<GeneratedAptitudeQuestion[]> => {
    try {
        const referenceText = referenceQuestions.map(q =>
            `Q: ${q.question_text}\nOptions: ${q.options.join(', ')}\nAnswer: ${q.options[q.correct_answer_index]}`
        ).join('\n\n');

        // --- NEW, STRONGER PROMPT ---
        const prompt = `You are an expert in creating aptitude test questions for job placement exams.
Your task is to generate ${count} new, unique questions for the topic: "${topicName}".

The category for this topic is: "${topicCategory}".

IMPORTANT:
- If the category is 'Quantitative', the question MUST be a math problem (e.g., percentages, time/work, algebra).
- If the category is 'Logical', the question MUST be a logical reasoning puzzle (e.g., series, blood relations, directions).
- If the category is 'Verbal', the question MUST test vocabulary, grammar, or reading comprehension.
- **ABSOLUTELY NO general knowledge trivia** (e.g., "What is the capital of France?").

These questions should be similar in style, difficulty, and format to the following examples:

--- EXAMPLES ---
${referenceText || "No examples available. Please generate standard " + topicCategory + " aptitude questions for the topic."}
--- END EXAMPLES ---

Please generate ${count} new questions now. Ensure the options are plausible and there is only one correct answer.
The output MUST be a valid JSON object matching the provided schema.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: aptitudeQuizSchema,
            },
        });

        const jsonText = (response.text || "").trim();
        const quizData: { new_questions: GeneratedAptitudeQuestion[] } = JSON.parse(jsonText);

        if (!quizData.new_questions || quizData.new_questions.length === 0) {
            throw new Error("AI failed to generate new questions.");
        }

        return quizData.new_questions;

    } catch (error) {
        console.error("Error generating aptitude questions:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get questions from AI: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating questions.");
    }
};


// --- (generateStudyGuide function remains exactly the same) ---
export const generateStudyGuide = async (topicName: string): Promise<string> => {
    try {
        const prompt = `You are an expert tutor. Your task is to extract all relevant formulas, definitions, and key concepts for a specific topic from the provided master formula sheet text.
Topic to extract: "${topicName}"

Master Formula Sheet Text:
---
${PDF_TEXT_CONTENT}
---

Extract *only* the formulas and key concepts for "${topicName}".
Format the output as simple, clean Markdown. Use headings, bullet points, and bold text for clarity.
If the topic is not found in the text, return a simple message: "No specific study guide found for this topic."`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: studyGuideSchema,
            },
        });

        const jsonText = (response.text || "").trim();
        const parsedResponse = JSON.parse(jsonText);

        return parsedResponse.study_guide_markdown || "Could not generate study guide.";

    } catch (error) {
        console.error("Error generating study guide:", error);
        if (error instanceof Error) {
            return `Error generating study guide: ${error.message}`;
        }
        return "An unknown error occurred while generating the study guide.";
    }
};

export async function generatePersonalizedRoadmap(
    resumeText: string,
    jobTitle: string,
    jobDescription: string,
    timeline: string
): Promise<Roadmap> {
    try {
        if (!resumeText.trim() || !jobTitle.trim() || !jobDescription.trim()) {
            throw new Error("Resume, Job Title, and Job Description are all required.");
        }

        const prompt = `You are an expert career coach and senior technical recruiter.
Your task is to create a personalized, step-by-step learning roadmap for a user trying to get a new job.

1.  **Analyze** the provided RESUME against the JOB DESCRIPTION.
2.  **Identify** the key skill and experience GAPS.
3.  **Generate** a comprehensive, step-by-step roadmap to fill exactly those gaps.
4.  The roadmap should be realistically achievable within the user's TIMELINE.
5.  Each step must include a clear description.

The output MUST be a valid JSON object matching the \`roadmapSchema\`.

---
**User's Timeline:**
${timeline}

**Target Job Title:**
${jobTitle}

**Target Job Description:**
${jobDescription}

**User's Resume Text:**
${resumeText}
---

Please generate the personalized roadmap now.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            // tools: [{ "google_search": {} }], // Enable Google Search for finding resources
            config: {
                responseMimeType: "application/json",
                responseSchema: roadmapSchema, // Re-use the existing roadmap schema
            },
        });

        const jsonText = (response.text || "").trim();
        const roadmapData: Roadmap = JSON.parse(jsonText);

        if (!roadmapData.title || !Array.isArray(roadmapData.steps)) {
            throw new Error("Invalid roadmap structure received from AI.");
        }

        // Prepend the Job Title to the roadmap title
        roadmapData.title = `Your Personalized Roadmap to become a ${jobTitle}`;

        // Polyfill resources
        roadmapData.steps = roadmapData.steps.map(step => ({
            ...step,
            resources: []
        }));

        return roadmapData;
    } catch (error) {
        console.error("Error generating personalized roadmap:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate personalized roadmap from AI: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the roadmap.");
    }
}
export const startInterview = async (resumeText: string, jobTitle: string, jobDescription: string): Promise<string> => {
    try {
        const prompt = `You are 'Alex', an expert hiring manager and career coach. You are about to start a mock interview for a "${jobTitle}" position.
The candidate's resume is:
---
${resumeText}
---
${jobDescription ? `The job description is:\n---\n${jobDescription}\n---` : ''}

Your task is to start the interview *now*.
Introduce yourself briefly and ask your first warm-up question (e.g., "Tell me about yourself" or "Walk me through your resume").
Respond with *only* your greeting and the first question. Do not add any other text or pleasantries.`;

        // --- SYNTAX FIX ---
        // Your package version expects an object with 'model' and 'contents'
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {}
        });
        // --- END FIX ---

        return (response.text || "").trim();

    } catch (error) {
        console.error("Error starting interview:", error);
        throw new Error("Failed to start the interview. Please try again.");
    }
};

/**
 * Continues the interview conversation.
 */
export const continueInterview = async (
    conversationHistory: ChatMessage[],
    resumeText: string,
    jobTitle: string
): Promise<string> => {
    try {
        // --- SYNTAX FIX ---
        // We will manually build a single prompt string, which is more reliable
        // with your version of the AI library.

        let prompt = `You are 'Alex', an expert hiring manager for a "${jobTitle}" role, and you are continuing a mock interview.
The user's resume is:
---
${resumeText}
---
Below is the conversation history so far. Your task is to:
1.  Briefly acknowledge their last answer (e.g., "Got it, thanks for sharing.").
2.  Ask the *next* logical question. Ask a good mix of behavioral (STAR method) and technical questions based on their resume and the job title.
3.  You will ask **5 questions in total**.
4.  After you ask your 5th and final question and the user answers it, your *only* response must be: "That's all the questions I have. I'm now compiling your feedback. Please wait a moment."
5.  Do not add any other text to that final response. Just that exact sentence.
6.  Until then, just ask your next question.

**Conversation History:**
`;

        // Manually build the history string
        conversationHistory.forEach(msg => {
            if (msg.role === 'user') {
                prompt += `Candidate: ${msg.text}\n`;
            } else {
                prompt += `Alex (Interviewer): ${msg.text}\n`;
            }
        });

        prompt += "\nAlex (Interviewer):"; // Prompt the AI for its next line

        // --- END FIX ---

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {}// Send the single, combined prompt
        });

        return (response.text || "").trim();

    } catch (error) {
        console.error("Error continuing interview:", error);
        throw new Error("The AI interviewer is having trouble. Please try again.");
    }
};

/**
 * Generates a final feedback report for the interview.
 * --- THIS FUNCTION IS NOW FIXED ---
 */
export const getInterviewFeedback = async (
    conversationHistory: ChatMessage[],
    jobTitle: string
): Promise<InterviewFeedback> => {
    try {
        // --- SYNTAX FIX ---
        // We will manually build a single prompt string

        let prompt = `You are an expert interview coach. Analyze this interview transcript for a "${jobTitle}" role.
The user's responses are the 'Candidate' role.
Your task is to provide a final, constructive feedback report.
Please analyze the user's answers and provide:
1.  **overall_feedback**: A brief, 2-3 sentence summary of their performance.
2.  **strengths**: A list of 2-3 key strengths they demonstrated.
3.  **areas_for_improvement**: A list of 2-3 specific, actionable areas for improvement.

The output MUST be a valid JSON object matching the provided schema.

**Interview Transcript:**
`;

        // Manually build the history string
        conversationHistory.forEach(msg => {
            if (msg.role === 'user') {
                prompt += `Candidate: ${msg.text}\n`;
            } else {
                prompt += `Alex (Interviewer): ${msg.text}\n`;
            }
        });

        // --- END FIX ---

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: interviewFeedbackSchema,
            },
        });

        const jsonText = (response.text || "").trim();

        return JSON.parse(jsonText) as InterviewFeedback;

    } catch (error) {
        console.error("Error getting interview feedback:", error);
        throw new Error("Failed to generate feedback. Please try again.");
    }
};

export const getAIAudio = async (textToSpeak: string): Promise<string> => {
    try {
        const payload = {
            contents: [{
                parts: [{ text: textToSpeak }]
            }],
            generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: {
                        // We can choose a voice. 'Kore' is a good, professional male voice.
                        prebuiltVoiceConfig: { voiceName: "Kore" }
                    }
                }
            },
            model: "gemini-2.5-flash-preview-tts"
        };

        const apiKey = API_KEY;// Leave as-is, will be handled by the environment
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            throw new Error(`TTS API failed with status: ${apiResponse.status}`);
        }

        const result = await apiResponse.json();
        const part = result?.candidates?.[0]?.content?.parts?.[0];
        const audioData = part?.inlineData?.data; // base64 audio
        const mimeType = part?.inlineData?.mimeType; // "audio/L16;rate=24000"

        if (audioData && mimeType && mimeType.startsWith("audio/L16")) {
            // Return base64 audio data directly to client, or convert to WAV buffer
            // Since we moved pcmToWav to server, we can convert here and return base64 WAV

            // Extract sample rate from mimeType
            const sampleRate = parseInt(mimeType.match(/rate=(\d+)/)?.[1] || "24000", 10);

            // Convert base64 PCM to WAV Buffer
            const pcmData = base64ToArrayBuffer(audioData);
            const pcm16 = new Int16Array(pcmData);
            const wavBuffer = pcmToWav(pcm16, sampleRate);

            // Return as base64 string of the WAV file
            return wavBuffer.toString('base64');
        } else {
            throw new Error("Invalid audio data received from TTS API.");
        }

    } catch (error) {
        console.error("Error generating AI audio:", error);
        throw new Error("Failed to generate AI voice. Please try again.");
    }
};
