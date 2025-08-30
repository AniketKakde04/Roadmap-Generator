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

const projectSuggestionSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "A concise, catchy title for the suggested project." },
            description: { type: Type.STRING, description: "A short, compelling description of the project and why it's valuable for the user's portfolio." },
            reasoning: { type: Type.STRING, description: "A detailed explanation of why this project is a good fit for the user, referencing their skills and explaining how it addresses skill gaps relative to a target job if provided." },
        },
        required: ["title", "description", "reasoning"],
    },
};

export async function suggestProjectsFromResume(resumeText: string, jobTitle: string, jobDescription: string): Promise<ProjectSuggestion[]> {
    try {
        if (!resumeText.trim()) {
            throw new Error("Resume text cannot be empty.");
        }

        let prompt = `You are an expert career coach and senior hiring manager for a tech company. Your task is to analyze the provided resume text and suggest 3 unique and impactful projects the candidate could build to significantly strengthen their portfolio and fill any potential skill gaps.

For each project, provide:
1. A concise, catchy title.
2. A short, compelling description of the project.
3. A clear 'reasoning' explaining *why* this specific project is a great choice for the candidate. This reasoning should connect to their existing skills mentioned in the resume and explain what new, valuable skills they will gain.

The suggestions should be tailored to the candidate's existing skills and experience level.`;

        if (jobTitle.trim() || jobDescription.trim()) {
            prompt += `\n\nThe candidate is specifically targeting the following job. The project suggestions should be highly relevant to bridging any gaps between their resume and this job description.`;
            if (jobTitle.trim()) {
                prompt += `\n\nTarget Job Title: ${jobTitle}`;
            }
            if (jobDescription.trim()) {
                prompt += `\n\nJob Description:\n---\n${jobDescription}\n---`;
            }
        }
        
        prompt += `\n\nResume Text:\n---\n${resumeText}\n---\n\nGenerate 3 project suggestions based on this resume and target job. The output MUST be a valid JSON object matching the provided schema.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: projectSuggestionSchema,
            },
        });

        const jsonText = response.text.trim();
        const projectData: ProjectSuggestion[] = JSON.parse(jsonText);

        if (!Array.isArray(projectData) || projectData.length === 0) {
            throw new Error("Invalid project suggestions structure received from AI.");
        }

        return projectData;
    } catch (error) {
        console.error("Error suggesting projects:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get project suggestions from AI: ${error.message}`);
        }
        throw new Error("An unknown error occurred while suggesting projects.");
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
            config: {
                responseMimeType: "application/json",
                responseSchema: roadmapSchema,
            },
        });

        const jsonText = response.text.trim();
        const roadmapData: Roadmap = JSON.parse(jsonText);
        
        // Basic validation
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