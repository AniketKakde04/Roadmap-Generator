import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
    suggestProjectsFromResume,
    generateRoadmap,
    generateAIReply,
    generateAptitudeQuestions,
    generateStudyGuide,
    generatePersonalizedRoadmap,
    startInterview,
    continueInterview,
    getInterviewFeedback,
    getAIAudio
} from './services/geminiService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for large resume texts

// Health check
app.get('/', (req: Request, res: Response) => {
    res.send('AI Roadmap Generator API is running');
});

// --- API Routes ---

app.post('/api/analyze-resume', async (req: Request, res: Response) => {
    try {
        const { resumeText, jobTitle, jobDescription } = req.body;
        const result = await suggestProjectsFromResume(resumeText, jobTitle, jobDescription);
        res.json(result);
    } catch (error) {
        console.error("Error in /api/analyze-resume:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
    }
});

app.post('/api/roadmap', async (req: Request, res: Response) => {
    try {
        const { topic, level, timeline, userId } = req.body;
        const result = await generateRoadmap(topic, level, timeline, userId);
        res.json(result);
    } catch (error) {
        console.error("Error in /api/roadmap:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
    }
});

app.post('/api/ai-reply', async (req: Request, res: Response) => {
    try {
        const { prompt } = req.body;
        const result = await generateAIReply(prompt);
        res.json({ suggestions: result });
    } catch (error) {
        console.error("Error in /api/ai-reply:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
    }
});

app.post('/api/aptitude-questions', async (req: Request, res: Response) => {
    try {
        const { referenceQuestions, topicName, topicCategory, count } = req.body;
        const result = await generateAptitudeQuestions(referenceQuestions, topicName, topicCategory, count);
        res.json({ new_questions: result });
    } catch (error) {
        console.error("Error in /api/aptitude-questions:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
    }
});

app.post('/api/study-guide', async (req: Request, res: Response) => {
    try {
        const { topicName } = req.body;
        const result = await generateStudyGuide(topicName);
        res.json({ study_guide_markdown: result });
    } catch (error) {
        console.error("Error in /api/study-guide:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
    }
});

app.post('/api/personalized-roadmap', async (req: Request, res: Response) => {
    try {
        const { resumeText, jobTitle, jobDescription, timeline } = req.body;
        const result = await generatePersonalizedRoadmap(resumeText, jobTitle, jobDescription, timeline);
        res.json(result);
    } catch (error) {
        console.error("Error in /api/personalized-roadmap:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
    }
});

app.post('/api/interview/start', async (req: Request, res: Response) => {
    try {
        const { resumeText, jobTitle, jobDescription } = req.body;
        const result = await startInterview(resumeText, jobTitle, jobDescription);
        res.send(result); // Returns string
    } catch (error) {
        console.error("Error in /api/interview/start:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
    }
});

app.post('/api/interview/continue', async (req: Request, res: Response) => {
    try {
        const { conversationHistory, resumeText, jobTitle } = req.body;
        const result = await continueInterview(conversationHistory, resumeText, jobTitle);
        res.send(result); // Returns string
    } catch (error) {
        console.error("Error in /api/interview/continue:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
    }
});

app.post('/api/interview/feedback', async (req: Request, res: Response) => {
    try {
        const { conversationHistory, jobTitle } = req.body;
        const result = await getInterviewFeedback(conversationHistory, jobTitle);
        res.json(result);
    } catch (error) {
        console.error("Error in /api/interview/feedback:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
    }
});

app.post('/api/tts', async (req: Request, res: Response) => {
    try {
        const { textToSpeak } = req.body;
        const result = await getAIAudio(textToSpeak);
        res.json({ audioUrl: result }); // Returns base64 string as audioUrl (client needs to handle this)
    } catch (error) {
        console.error("Error in /api/tts:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// Restart trigger
