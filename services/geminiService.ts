import { GoogleGenAI, Type } from "@google/genai";
import { Roadmap, ProjectSuggestion } from '../types';

const BROWSER_API_KEY = process.env.API_KEY;
if (!BROWSER_API_KEY) {
    throw new Error("API_KEY is not set in environment variables");
}

const ai = new GoogleGenAI({ apiKey: BROWSER_API_KEY });

const resourceSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "The title of the resource." },
        url: { type: Type.STRING, description: "The full URL to the resource." },
        type: {
            type: Type.STRING,
            enum: ['video', 'article', 'documentation', 'course', 'tool', 'other'],
            description: "The type of the resource."
        },
    },
    required: ["title", "url", "type"],
};

const stepSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A concise title for this step of the roadmap." },
        description: { type: Type.STRING, description: "A detailed, beginner-friendly explanation of what to learn or do in this step." },
        resources: {
            type: Type.ARRAY,
            items: resourceSchema,
            description: "A list of high-quality, free-to-access online resources for this step.",
        },
    },
    required: ["title", "description", "resources"],
};

const roadmapSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A creative and engaging title for the entire roadmap." },
        description: { type: Type.STRING, description: "A brief, encouraging overview of the learning journey." },
        steps: {
            type: Type.ARRAY,
            items: stepSchema,
            description: "The sequence of steps that make up the roadmap.",
        },
    },
    required: ["title", "description", "steps"],
};



const analysisReportSchema = {
    type: Type.OBJECT,
    properties: {
        matchScore: { 
            type: Type.NUMBER,
            description: "A percentage score (0-100) representing how well the resume matches the job description."
        },
        strengths: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of key skills found in the resume that are also required by the job."
        },
        gaps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of crucial skills required by the job that are missing from the resume."
        },
        feedback: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "2-3 bullet points of direct, actionable feedback on the resume's writing and structure."
        },
        projectSuggestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    reasoning: { type: Type.STRING, description: "A clear explanation of how this project helps fill the identified skill gaps." },
                },
                required: ["title", "description", "reasoning"],
            },
        },
    },
    required: ["matchScore", "strengths", "gaps", "feedback", "projectSuggestions"],
};


// --- THIS FUNCTION IS NOW COMPLETELY OVERHAULED ---
export async function suggestProjectsFromResume(resumeText: string, jobTitle: string, jobDescription: string): Promise<AnalysisReport> {
    try {
        if (!resumeText.trim()) {
            throw new Error("Resume text cannot be empty.");
        }

        // The new prompt instructs the AI to perform a comprehensive analysis.
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
            model: "gemini-2.0-flash", // Using a more powerful model for better analysis
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisReportSchema,
            },
        });

        const jsonText = response.text.trim();
        const analysisData: AnalysisReport = JSON.parse(jsonText);

        // Basic validation
        if (!analysisData.matchScore || !Array.isArray(analysisData.strengths)) {
            throw new Error("Invalid analysis report structure received from AI.");
        }

        return analysisData;
    } catch (error) {
        console.error("Error generating analysis report:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get analysis from AI: ${error.message}`);
        }
        throw new Error("An unknown error occurred while analyzing the resume.");
    }
}



export async function generateRoadmap(topic: string, level: string, timeline: string): Promise<Roadmap> {
    try {
        let prompt = `You are an expert educator and curriculum designer. Your task is to generate a comprehensive, step-by-step learning roadmap for the given topic. The roadmap should be logical, starting from fundamentals and progressing to advanced concepts. For each step, provide a clear title, a concise description of what to learn, and a curated list of at least 3 high-quality, free-to-access online resources.

The user's goal is to learn about or build: "${topic}".`;

        if (level) {
            prompt += `\n\nThe user's self-assessed expertise level is "${level}". Please tailor the starting point and complexity of the roadmap to be appropriate for this level. For a beginner, start with the absolute basics. For an intermediate learner, assume some foundational knowledge. For a professional, focus on advanced topics, specializations, or alternative technologies.`;
        }

        if (timeline.trim()) {
            prompt += `\n\nThe user aims to complete this roadmap within a timeframe of "${timeline}". While this is a guideline, please try to structure the number and intensity of the steps to be realistically achievable within this period.`;
        }

        prompt += `\n\nEnsure all URLs are valid and directly lead to the resource. The output MUST be a valid JSON object matching the provided schema.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
            tools: [{ "google_search": {} }],
            config: {
                responseMimeType: "application/json",
                responseSchema: roadmapSchema,
            },
        });

        const jsonText = response.text.trim();
        const roadmapData: Roadmap = JSON.parse(jsonText);
        
        if (!roadmapData.title || !Array.isArray(roadmapData.steps) || roadmapData.steps.length === 0) {
            throw new Error("Invalid roadmap structure received from AI.");
        }

        return roadmapData;
    } catch (error) {
        console.error("Error generating roadmap:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate roadmap from AI: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the roadmap.");
    }
}

// --- THIS IS THE CORRECT, SINGLE FUNCTION FOR AI ASSIST ---
export const generateAIReply = async (prompt: string): Promise<string[]> => {
    try {
        const suggestionSchema = {
            type: Type.OBJECT,
            properties: {
                suggestions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "An array of 3 distinct text suggestions based on the prompt."
                }
            },
            required: ["suggestions"]
        };

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: `${prompt} Please provide three distinct options.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: suggestionSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);

        if (parsedResponse.suggestions && Array.isArray(parsedResponse.suggestions)) {
            return parsedResponse.suggestions;
        }

        throw new Error("Invalid response structure from AI.");

    } catch (error) {
        console.error("Error generating AI reply:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get AI reply: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating AI reply.");
    }
};

