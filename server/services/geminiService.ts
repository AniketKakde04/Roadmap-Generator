import { GoogleGenAI, Type } from "@google/genai";
import { Roadmap, ProjectSuggestion, AnalysisReport, ChatMessage, InterviewFeedback, AptitudeQuestion, GeneratedAptitudeQuestion } from '../types';
import { base64ToArrayBuffer, pcmToWav } from './audioUtils';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

if (!API_KEY) {
    console.warn("GEMINI_API_KEY is not set in environment variables");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- NEW: Text content extracted from 'Master Formula Sheets.pdf' ---
// This is used as the context for the AI to generate study guides.
const PDF_TEXT_CONTENT = `
CHAPTER WISE FORMULAS

Chapter 1: Number System - Important Formulas
1. Divisibility Rules:
   - Div by 2: last digit even
   - Div by 3: sum of digits divisible by 3
   - Div by 4: last 2 digits divisible by 4
   - Div by 5: ends in 0 or 5
   - Div by 6: divisible by 2 and 3
   - Div by 8: last 3 digits divisible by 8
   - Div by 9: sum of digits divisible by 9
   - Div by 10: ends in 0
   - Div by 11: alt. sum of digits divisible by 11
2. HCF & LCM:
   - Product of two numbers = HCF x LCM
   - LCM of fractions = LCM of numerators / HCF of denominators
   - HCF of fractions = HCF of numerators / LCM of denominators
3. Number Types:
   - Prime = divisible by only 1 and itself
   - Composite = more than 2 factors

Chapter 2: Percentages - Important Formulas
1. Percentage = (Part/Whole) x 100
2. x increased by y% = x * (1 + y/100)
3. x decreased by y% = x * (1 - y/100)
4. Successive change: Net % = x + y + (xy/100)
5. Population change:
   - After n years = P * (1 ± R/100)^n
6. % Change = [(New - Old) / Old] * 100
7. If A is R% more than B, B is less than A by [R / (100+R)] * 100 %

Chapter 3: Profit and Loss - Important Formulas
1. Profit = S.P. - C.P.
2. Loss = C.P. - S.P.
3. Profit % = (Profit / C.P.) * 100
4. Loss % = (Loss / C.P.) * 100
5. S.P. = C.P. * (1 + Profit%/100)
6. S.P. = C.P. * (1 - Loss%/100)
7. Discount = M.P. - S.P. (M.P. = Marked Price)
8. Dishonest Dealer: Profit % = (Error / (True Value - Error)) * 100

Chapter 4: Simple & Compound Interest
1. Simple Interest (S.I.) = (P * R * T) / 100
2. Amount (Simple) = P + S.I.
3. Compound Interest (C.I.) = P * (1 + R/100)^T - P
4. Amount (Compound) = P * (1 + R/100)^T
5. Compounded Half-yearly: Amount = P * (1 + (R/2)/100)^(2*T)
6. Compounded Quarterly: Amount = P * (1 + (R/4)/100)^(4*T)
7. Difference b/w C.I. & S.I. for 2 years = P * (R/100)^2

Chapter 5: Ratio and Proportion
1. Ratio A:B = A/B
2. Proportion a:b :: c:d => a*d = b*c
3. Compounded Ratio = (a/b) * (c/d) * (e/f)
4. Duplicate ratio = a^2 : b^2
5. Triplicate ratio = a^3 : b^3
6. Mean proportional (b/w a and c) = sqrt(a*c)

Chapter 6: Time and Work
1. (Work from) 1 day = 1 / (Total days to complete)
2. If A takes 'x' days, B takes 'y' days, (A+B) together = (x*y) / (x+y) days
3. M1*D1*H1 / W1 = M2*D2*H2 / W2 (M=Men, D=Days, H=Hours, W=Work)
4. Efficiency is inversely proportional to Time taken.

Chapter 7: Time, Speed and Distance
1. Speed = Distance / Time
2. 1 km/hr = 5/18 m/s
3. 1 m/s = 18/5 km/hr
4. Average Speed = Total Distance / Total Time
5. Avg. speed (equal distances) = (2*x*y) / (x+y)
6. Relative speed (same direction) = s1 - s2
7. Relative speed (opposite direction) = s1 + s2
8. Train crossing pole: Distance = length of train
9. Train crossing platform: Distance = length of train + length of platform

Chapter 8: Boats and Streams
1. Downstream speed (v) = u + s (u=boat speed, s=stream speed)
2. Upstream speed (u) = u - s
3. Speed of boat (u) = (v + u) / 2
4. Speed of stream (s) = (v - u) / 2

Chapter 9: Permutation & Combination
1. Factorial n! = n * (n-1) * ... * 1
2. Permutation (Arrangement): nPr = n! / (n-r)!
3. Combination (Selection): nCr = n! / (r! * (n-r)!)
4. Circular permutation = (n-1)!
5. nCr = nC(n-r)

Chapter 10: Probability
1. P(E) = (Number of favorable outcomes) / (Total number of outcomes)
2. 0 <= P(E) <= 1
3. P(Not E) = 1 - P(E)
4. P(A or B) = P(A) + P(B) - P(A and B)
5. Mutually Exclusive P(A or B) = P(A) + P(B)
6. Independent Events P(A and B) = P(A) * P(B)
7. Odds in favor = Favorable / Unfavorable
8. Odds against = Unfavorable / Favorable

Chapter 11: Averages
1. Average = (Sum of observations) / (Number of observations)
2. Sum = Average * Number

Chapter 12: Problems on Ages
1. Use linear equations (e.g., Let age be x)
2. 'n' years ago: Age = x - n
3. 'n' years hence: Age = x + n
4. Ratio logic: e.g., 5:6 => 5x and 6x

Chapter 13: Clocks
1. Angle b/w hands = |30*H - (11/2)*M|
2. Hands coincide (0 deg) = 22 times in 24 hrs
3. Hands opposite (180 deg) = 22 times in 24 hrs
4. Hands perpendicular (90 deg) = 44 times in 24 hrs

Chapter 14: Calendars
1. Odd days = (Total days) % 7
2. Leap year: Divisible by 4 (or 400 for centuries)
3. Non-leap year = 1 odd day
4. Leap year = 2 odd days
5. Day codes: Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6

Chapter 15: Direction Sense
1. Pythagoras theorem: (a^2 + b^2) = c^2
2. Shortest distance = sqrt(x^2 + y^2)
3. Always keep track of N, S, E, W
4. Angle turns: Left turn = 90 deg anticlockwise, Right turn = 90 deg clockwise
5. Opposite directions = 180 deg, perpendicular = 90 deg

Chapter 16: Coding & Decoding
1. Letter shifting (e.g., A+1=B)
2. Reverse position: Z=1, A=26
3. Pattern-based substitution
4. Word-letter mapping
5. Symbol/numeric code interpretation

Chapter 17: Blood Relations
1. Tree diagram helps
2. Gender clues (e.g., "his", "her")
3. Direct and indirect relation types
4. Chain logic: A is B's son's...
5. Shortcut terms: Brother's/Sister's husband = Brother-in-law

Chapter 18: Data Arrangements
1. Linear/seating arrangements
2. Circle arrangements (clockwise/anticlockwise)
3. Use condition-first statements
4. Elimination technique
5. Always draw table/diagrams

Chapter 19: Statement & Assumption
1. Assumption is what must be true for statement
2. General assumptions > specific ones
3. Avoid extreme/biased language
4. Common trap: confusing assumption with inference
5. Focus on underlying beliefs, not facts

Chapter 20: Series & Progressions
1. Arithmetic Progression (AP):
   - a_n = a + (n-1)d
   - Sum = (n/2) * [2a + (n-1)d]
2. Geometric Progression (GP):
   - a_n = a * r^(n-1)
   - Sum = a * (1 - r^n) / (1 - r)
   - Sum (infinite) = a / (1 - r) [if |r| < 1]
`;

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
        resources: { type: Type.ARRAY, items: resourceSchema },
    }, required: ["title", "description", "resources"],
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

export async function generateRoadmap(topic: string, level: string, timeline: string): Promise<Roadmap> {
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
5.  Each step must include a clear description and a list of high-quality, free online resources (articles, videos, docs).

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
