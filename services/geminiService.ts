
import { GoogleGenAI, Type } from "@google/genai";
import { Roadmap } from '../types';

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

export async function generateRoadmap(topic: string): Promise<Roadmap> {
    try {
        const prompt = `You are an expert educator and curriculum designer. Your task is to generate a comprehensive, step-by-step learning roadmap for the given topic. The roadmap should be logical, starting from fundamentals and progressing to advanced concepts. For each step, provide a clear title, a concise description of what to learn, and a curated list of at least 3 high-quality, free-to-access online resources.

The topic is: "${topic}".

Ensure all URLs are valid and directly lead to the resource. The output MUST be a valid JSON object matching the provided schema.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
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
