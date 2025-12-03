import { Roadmap, ProjectSuggestion, AnalysisReport, ChatMessage, InterviewFeedback, AptitudeQuestion, GeneratedAptitudeQuestion } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function suggestProjectsFromResume(resumeText: string, jobTitle: string, jobDescription: string): Promise<AnalysisReport> {
    try {
        const response = await fetch(`${API_URL}/analyze-resume`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resumeText, jobTitle, jobDescription })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to analyze resume');
        }

        return await response.json();
    } catch (error) {
        console.error("Error analyzing resume:", error);
        throw error;
    }
}

export async function generateRoadmap(topic: string, level: string, timeline: string): Promise<Roadmap> {
    try {
        const response = await fetch(`${API_URL}/roadmap`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, level, timeline })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to generate roadmap');
        }

        return await response.json();
    } catch (error) {
        console.error("Error generating roadmap:", error);
        throw error;
    }
}

export const generateAIReply = async (prompt: string): Promise<string[]> => {
    try {
        const response = await fetch(`${API_URL}/ai-reply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to generate AI reply');
        }

        const data = await response.json();
        return data.suggestions;
    } catch (error) {
        console.error("Error generating AI reply:", error);
        throw error;
    }
};

export const generateAptitudeQuestions = async (
    referenceQuestions: AptitudeQuestion[],
    topicName: string,
    topicCategory: string,
    count: number
): Promise<GeneratedAptitudeQuestion[]> => {
    try {
        const response = await fetch(`${API_URL}/aptitude-questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ referenceQuestions, topicName, topicCategory, count })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to generate aptitude questions');
        }

        const data = await response.json();
        return data.new_questions;
    } catch (error) {
        console.error("Error generating aptitude questions:", error);
        throw error;
    }
};

export const generateStudyGuide = async (topicName: string): Promise<string> => {
    try {
        const response = await fetch(`${API_URL}/study-guide`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topicName })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to generate study guide');
        }

        const data = await response.json();
        return data.study_guide_markdown;
    } catch (error) {
        console.error("Error generating study guide:", error);
        return "Error generating study guide.";
    }
};

export async function generatePersonalizedRoadmap(
    resumeText: string,
    jobTitle: string,
    jobDescription: string,
    timeline: string
): Promise<Roadmap> {
    try {
        const response = await fetch(`${API_URL}/personalized-roadmap`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resumeText, jobTitle, jobDescription, timeline })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to generate personalized roadmap');
        }

        return await response.json();
    } catch (error) {
        console.error("Error generating personalized roadmap:", error);
        throw error;
    }
}

export const startInterview = async (resumeText: string, jobTitle: string, jobDescription: string): Promise<string> => {
    try {
        const response = await fetch(`${API_URL}/interview/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resumeText, jobTitle, jobDescription })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to start interview');
        }

        return await response.text();
    } catch (error) {
        console.error("Error starting interview:", error);
        throw error;
    }
};

export const continueInterview = async (
    conversationHistory: ChatMessage[],
    resumeText: string,
    jobTitle: string
): Promise<string> => {
    try {
        const response = await fetch(`${API_URL}/interview/continue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversationHistory, resumeText, jobTitle })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to continue interview');
        }

        return await response.text();
    } catch (error) {
        console.error("Error continuing interview:", error);
        throw error;
    }
};

export const getInterviewFeedback = async (
    conversationHistory: ChatMessage[],
    jobTitle: string
): Promise<InterviewFeedback> => {
    try {
        const response = await fetch(`${API_URL}/interview/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversationHistory, jobTitle })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get interview feedback');
        }

        return await response.json();
    } catch (error) {
        console.error("Error getting interview feedback:", error);
        throw error;
    }
};

export const getAIAudio = async (textToSpeak: string): Promise<string> => {
    try {
        const response = await fetch(`${API_URL}/tts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ textToSpeak })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get AI audio');
        }

        const data = await response.json();
        // The server returns base64 string of the WAV file
        // We need to convert it to a Blob URL for the client to play
        const base64 = data.audioUrl;

        // Convert base64 to Blob
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'audio/wav' });
        return URL.createObjectURL(blob);

    } catch (error) {
        console.error("Error getting AI audio:", error);
        throw error;
    }
};