import OpenAI from 'openai';
import dotenv from 'dotenv';
import { ChatMessage, InterviewFeedback } from '../types';

dotenv.config();

// Initialize the client pointing to Sarvam's Base URL
const openai = new OpenAI({
    apiKey: process.env.SARVAM_API_KEY,
    baseURL: "https://api.sarvam.ai/v1",
});

/**
 * Generates audio using Sarvam's Bulbul TTS model.
 * Returns a Base64 string of the audio (WAV format).
 */
export const getAIAudio = async (textToSpeak: string): Promise<string> => {
    try {
        const response = await fetch("https://api.sarvam.ai/text-to-speech", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-subscription-key": process.env.SARVAM_API_KEY || "",
            },
            body: JSON.stringify({
                inputs: [textToSpeak],
                target_language_code: "en-IN", // Indian English
                speaker: "anushka",              // Options: meera, anushka, dhruv, avinash
                model: "bulbul:v2",
                pace: 1.0,
                speech_sample_rate: 16000,
                enable_preprocessing: true
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Sarvam TTS Error: ${err}`);
        }

        const data = await response.json();

        // Sarvam returns { audios: ["base64_string"] }
        if (data.audios && data.audios.length > 0) {
            return data.audios[0];
        }
        throw new Error("No audio data received from Sarvam.");

    } catch (error) {
        console.error("Sarvam TTS failed:", error);
        throw error;
    }
};

/**
 * Starts the interview by generating a greeting and the first question.
 */
export const startInterview = async (resumeText: string, jobTitle: string, jobDescription: string): Promise<string> => {
    try {
        const systemPrompt = `You are 'Alex', an expert hiring manager conducting a mock interview for a "${jobTitle}" role.
        
        Candidate's Resume Context:
        ${resumeText.substring(0, 4000)}... (truncated for context)

        Your Goal:
        1. Briefly introduce yourself.
        2. Ask the FIRST warm-up question (e.g., "Tell me about yourself").
        3. Keep it professional but conversational.
        4. Do NOT include any placeholders or markdown. Just the spoken text.`;

        const completion = await openai.chat.completions.create({
            model: "sarvam-m",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Start the interview now." }
            ],
            max_tokens: 150,
            temperature: 0.7,
        });

        return completion.choices[0].message.content || "Hello! I'm Alex. Let's start by having you tell me a bit about yourself.";
    } catch (error) {
        console.error("Error starting interview:", error);
        throw new Error("Failed to connect to AI interviewer.");
    }
};

/**
 * Continues the conversation based on history.
 */
export const continueInterview = async (conversationHistory: ChatMessage[], resumeText: string, jobTitle: string): Promise<string> => {
    try {
        // Convert existing chat history to OpenAI format
        const messages = conversationHistory.map(msg => ({
            role: msg.role === 'model' ? 'assistant' : 'user', // Map 'model' to 'assistant'
            content: msg.text
        }));

        // Fix: Sarvam/OpenAI API requires the first message after system to be from 'user'.
        // If our history starts with the AI's first question (assistant), we prepend a dummy user start message.
        if (messages.length > 0 && messages[0].role === 'assistant') {
            messages.unshift({
                role: 'user',
                content: "I am ready to start the interview."
            });
        }

        const systemPrompt = `You are 'Alex', the interviewer for a ${jobTitle} position.
        
        Candidate's Resume Context:
        ${resumeText.substring(0, 4000)}... (truncated for context)

        Instructions:
        1. Briefly acknowledge the candidate's last answer.
        2. Ask the NEXT logical question.
        3. Mix behavioral and technical questions based on the resume.
        4. CRITICAL: Ask ONLY ONE question at a time.
        5. Aim for a comprehensive interview (roughly 5-8 questions total).
        6. When you have gathered enough information, say EXACTLY: "That's all the questions I have. I'm now compiling your feedback report for you. Please wait just a moment."`;

        // Cast messages to any to avoid strict typing issues with the mapped roles
        const apiMessages: any[] = [
            { role: "system", content: systemPrompt },
            ...messages
        ];

        const completion = await openai.chat.completions.create({
            model: "sarvam-m",
            messages: apiMessages,
            max_tokens: 200,
            temperature: 0.7,
        });

        return completion.choices[0].message.content || "Could you elaborate on that?";

    } catch (error: any) {
        console.error("Error continuing interview:", error);
        if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
        } else if (error.message) {
            console.error("Error message:", error.message);
        }
        throw new Error(`AI interviewer was interrupted: ${error.message || 'Unknown error'}`);
    }
};

/**
 * Generates JSON feedback at the end of the interview.
 */
export const getInterviewFeedback = async (conversationHistory: ChatMessage[], jobTitle: string, resumeText: string): Promise<InterviewFeedback> => {
    try {
        // Consolidate transcript into a single block
        const transcript = conversationHistory.map(msg =>
            `${msg.role === 'model' ? 'Alex (Interviewer)' : 'Candidate'}: ${msg.text}`
        ).join('\n\n');

        const systemPrompt = `You are an expert Interview Coach. Analyze the following interview transcript for a ${jobTitle} role.
        
        Candidate's Resume Context:
        ${resumeText.substring(0, 4000)}... (truncated for context)

        Interview Transcript:
        """
        ${transcript}
        """

        Instructions:
        Provide detailed feedback using these EXACT section markers:
        
        OVERALL:
        [2-3 sentences summary of performance]
        
        STRENGTHS:
        - [Strength 1]
        - [Strength 2]
        - [Strength 3]
        
        IMPROVEMENTS:
        - [Area 1]
        - [Area 2]
        - [Area 3]
        
        If you prefer, you can return a valid JSON object with keys: overall_feedback, strengths, areas_for_improvement.
        
        CRITICAL: Do not include markdown like \`\`\`json. Just the raw text or JSON.`;

        const apiMessages: any[] = [
            { role: "system", content: systemPrompt },
            { role: "user", content: "Analyze this interview and provide my feedback report now." }
        ];

        console.log("Sending consolidated feedback prompt to Sarvam. Transcript length:", transcript.length);
        console.log("Full prompt payload size approx:", JSON.stringify(apiMessages).length);

        const completion = await openai.chat.completions.create({
            model: "sarvam-m",
            messages: apiMessages,
            temperature: 0.5,
        });

        const content = completion.choices[0].message.content || "";
        console.log("Sarvam raw feedback response:", content);

        if (!content.trim()) {
            throw new Error("Empty response from Sarvam AI.");
        }

        // --- STAGE 1: Try JSON Parsing ---
        const startIdx = content.indexOf('{');
        const endIdx = content.lastIndexOf('}');

        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            try {
                const jsonString = content.substring(startIdx, endIdx + 1);
                const parsed = JSON.parse(jsonString);
                return {
                    overall_feedback: parsed.overall_feedback || parsed.overall || "Analysis complete.",
                    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
                    areas_for_improvement: Array.isArray(parsed.areas_for_improvement) ? parsed.areas_for_improvement : (Array.isArray(parsed.areas) ? parsed.areas : [])
                };
            } catch (e) {
                console.log("JSON parse failed, falling back to text parsing...");
            }
        }

        // --- STAGE 2: Text-based Extraction (Markers) ---
        const sections: any = {
            overall_feedback: "",
            strengths: [],
            areas_for_improvement: []
        };

        const lines = content.split('\n');
        let currentSection = "";

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            const upperLine = trimmedLine.toUpperCase();
            if (upperLine.startsWith("OVERALL:")) {
                currentSection = "overall";
                sections.overall_feedback = trimmedLine.replace(/OVERALL:/i, "").trim();
            } else if (upperLine.startsWith("STRENGTHS:")) {
                currentSection = "strengths";
            } else if (upperLine.startsWith("IMPROVEMENTS:") || upperLine.startsWith("AREAS:")) {
                currentSection = "improvements";
            } else if (currentSection === "overall") {
                sections.overall_feedback += " " + trimmedLine;
            } else if (currentSection === "strengths" && (trimmedLine.startsWith("-") || trimmedLine.startsWith("*") || /^\d\./.test(trimmedLine))) {
                sections.strengths.push(trimmedLine.replace(/^[-*]|\d\./, "").trim());
            } else if (currentSection === "improvements" && (trimmedLine.startsWith("-") || trimmedLine.startsWith("*") || /^\d\./.test(trimmedLine))) {
                sections.areas_for_improvement.push(trimmedLine.replace(/^[-*]|\d\./, "").trim());
            }
        }

        // --- STAGE 3: Final Fallback ---
        if (!sections.overall_feedback && sections.strengths.length === 0 && sections.areas_for_improvement.length === 0) {
            return {
                overall_feedback: content.substring(0, 500), // Just take the beginning as feedback
                strengths: ["Review transcript for strengths"],
                areas_for_improvement: ["Review transcript for areas of improvement"]
            };
        }

        return {
            overall_feedback: sections.overall_feedback.trim() || "Thank you for completing the interview.",
            strengths: sections.strengths.length > 0 ? sections.strengths : ["Communication", "Professionalism"],
            areas_for_improvement: sections.areas_for_improvement.length > 0 ? sections.areas_for_improvement : ["Discuss specific examples", "Technical depth"]
        };

    } catch (error) {
        console.error("Error getting feedback from Sarvam:", error);
        return {
            overall_feedback: "We processed your interview, but technical difficulties occurred during report generation. Please review your performance based on the conversation.",
            strengths: ["Communication", "Engagement"],
            areas_for_improvement: ["Technical details", "Structured responses"]
        };
    }
};
