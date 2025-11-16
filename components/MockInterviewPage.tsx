import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import ArrowUpTrayIcon from './icons/ArrowUpTrayIcon';
import MicrophoneIcon from './icons/MicrophoneIcon';
import StopIcon from './icons/StopIcon';
import UserIcon from './icons/UserIcon';
import AIAgentIcon from './icons/AIAgentIcon';
import Loader from './Loader';
// Import our new types and AI functions
import { ChatMessage, InterviewFeedback } from '../types';
import { 
    startInterview, 
    continueInterview, 
    getInterviewFeedback, 
    getAIAudio 
} from '../services/geminiService';
// --- NEW: Import feedback icons ---
import HandThumbUpIcon from './icons/HandThumbUpIcon';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';
import ArrowPathIcon from './icons/ArrowPathIcon';


// Configure the worker for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@^4.5.136/build/pdf.worker.mjs`;

type InterviewStage = 'setup' | 'interviewing' | 'feedback';

// --- Speech Recognition Setup ---
// @ts-ignore (to support webkitSpeechRecognition)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition: SpeechRecognition | null = null;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
}

const MockInterviewPage: React.FC = () => {
    const [stage, setStage] = useState<InterviewStage>('setup');
    
    // --- Setup State ---
    const [jobTitle, setJobTitle] = useState<string>('');
    const [jobDescription, setJobDescription] = useState<string>('');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [resumeText, setResumeText] = useState<string>('');
    
    // --- Loading & Error State ---
    const [isParsing, setIsParsing] = useState<boolean>(false);
    const [isStarting, setIsStarting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    // --- Interview State (Phase 3) ---
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isAILoading, setIsAILoading] = useState<boolean>(false);
    const [isUserListening, setIsUserListening] = useState<boolean>(false);
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // --- Feedback State (Phase 4) ---
    const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);

    // --- Audio Cleanup Effect ---
    useEffect(() => {
        // This cleans up the audio object URL to prevent memory leaks
        return () => {
            if (currentAudio) {
                currentAudio.pause();
                URL.revokeObjectURL(currentAudio.src);
            }
        };
    }, [currentAudio]);

    // --- Scroll to bottom of chat ---
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    // --- PDF Parsing Logic (Unchanged) ---
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            if (file.type !== 'application/pdf') {
                setError('Please upload a PDF file.');
                setResumeFile(null);
                setResumeText('');
            } else {
                setResumeFile(file);
                setError(null);
                setIsParsing(true);
                try {
                    const arrayBuffer = await file.arrayBuffer();
                    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                    let fullText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map(item => 'str' in item ? item.str : '').join(' ');
                        fullText += pageText + '\n';
                    }
                    if (!fullText.trim()) {
                        throw new Error("Could not extract text from PDF.");
                    }
                    setResumeText(fullText);
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to parse PDF.');
                    setResumeText('');
                    setResumeFile(null);
                } finally {
                    setIsParsing(false);
                }
            }
        }
    };
    
    // --- Plays the AI's audio response ---
    const playAIAudio = async (text: string) => {
        if (currentAudio) {
            currentAudio.pause();
            URL.revokeObjectURL(currentAudio.src);
        }
        
        try {
            const audioUrl = await getAIAudio(text);
            const audio = new Audio(audioUrl);
            setCurrentAudio(audio);
            audio.play();
            
            audio.onended = () => {
                setIsAILoading(false); // AI is done speaking
                // Check if this was the end-of-interview message
                if (text.includes("compiling your feedback")) {
                    handleGetFeedback();
                }
            };
        } catch (err) {
            setError("Failed to play AI audio.");
            setIsAILoading(false);
        }
    };

    // --- Main function to process the user's spoken response ---
    const handleUserResponse = async (userText: string) => {
        setIsAILoading(true);
        const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', text: userText }];
        setChatHistory(newHistory);

        try {
            // Get the AI's next question
            const aiResponseText = await continueInterview(newHistory, resumeText, jobTitle);
            
            // Add AI response to chat and play audio
            setChatHistory(prev => [...prev, { role: 'model', text: aiResponseText }]);
            await playAIAudio(aiResponseText);
            
        } catch (err) {
            setError(err instanceof Error ? err.message : "AI failed to respond.");
            setIsAILoading(false);
        }
    };

    // --- Speech Recognition Handlers ---
    const startListening = () => {
        if (!recognition || isAILoading || isUserListening) return;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            handleUserResponse(transcript); // Send final transcript to AI
        };
        
        recognition.onstart = () => {
            setIsUserListening(true);
        };
        
        recognition.onend = () => {
            setIsUserListening(false);
        };
        
        recognition.onerror = (event) => {
            setError(`Speech recognition error: ${event.error}`);
            setIsUserListening(false);
        };
        
        recognition.start();
    };

    const stopListening = () => {
        if (!recognition || !isUserListening) return;
        recognition.stop();
        setIsUserListening(false);
    };

    // --- Handle Interview Start (UPDATED) ---
    const handleStartInterview = async () => {
        if (!resumeText) {
            setError("Please upload your resume first.");
            return;
        }
         if (!jobTitle) {
            setError("Please enter a job title.");
            return;
        }
        
        setError(null);
        setIsStarting(true);

        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            if (!recognition) {
                throw new Error("Speech recognition is not supported by your browser.");
            }

            // 1. Get the first question from the AI
            const firstQuestion = await startInterview(resumeText, jobTitle, jobDescription);
            
            // 2. Add to chat history
            setChatHistory([{ role: 'model', text: firstQuestion }]);
            
            // 3. Move to interviewing stage
            setStage('interviewing');
            setIsAILoading(true); // AI will speak first
            
            // 4. Play the first question's audio
            await playAIAudio(firstQuestion);

        } catch (err) {
            if (err instanceof DOMException && err.name === "NotAllowedError") {
                setError("Microphone permission is required to start the interview.");
            } else {
                setError(err instanceof Error ? err.message : "Failed to start interview.");
            }
        } finally {
            setIsStarting(false);
        }
    };
    
    // --- Handle Getting Feedback (Phase 4) ---
    const handleGetFeedback = async () => {
        setIsAILoading(true); // Show loader while feedback is generated
        setError(null);
        
        try {
            const feedbackReport = await getInterviewFeedback(chatHistory, jobTitle);
            setFeedback(feedbackReport);
            setStage('feedback'); // Move to the final stage
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate feedback.");
        } finally {
            setIsAILoading(false);
        }
    };

    // --- NEW: Handle Manual End ---
    const handleManualEnd = () => {
        // Stop any audio that is playing
        if (currentAudio) {
            currentAudio.pause();
            URL.revokeObjectURL(currentAudio.src);
            setCurrentAudio(null);
        }
        // Stop any recording
        if (recognition && isUserListening) {
            recognition.stop();
            setIsUserListening(false);
        }
        
        // Set AI loading to false, as we are about to call getFeedback which sets it to true
        setIsAILoading(false);
        
        // Go directly to the feedback stage
        handleGetFeedback();
    };
    
    // --- Restart Interview ---
    const handleRestart = () => {
        setChatHistory([]);
        setFeedback(null);
        setError(null);
        setJobTitle('');
        setJobDescription('');
        setResumeFile(null);
        setResumeText('');
        setStage('setup');
    };

    // --- Render Logic ---
    const renderContent = () => {
        if (isStarting) {
            return <Loader />;
        }
        
        switch (stage) {
            case 'setup':
                // (This code is unchanged from Phase 1)
                const canStart = !isParsing && resumeFile && jobTitle.trim();
                return (
                    <div className="w-full max-w-2xl mx-auto p-8 bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-lg animate-fadeIn">
                        <div className="flex items-center mb-6">
                            <MicrophoneIcon className="w-8 h-8 text-sky-400 mr-3" />
                            <h1 className="text-3xl font-bold text-white">AI Mock Interview</h1>
                        </div>
                        <p className="text-slate-400 mb-6">
                            Get ready for your next interview. Upload your resume, tell us the job role, and have a real-time conversational interview with our AI hiring manager.
                        </p>
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="resume-upload" className="block text-sm font-medium text-slate-300 mb-2">
                                   1. Upload Your Resume (PDF)
                                </label>
                                <label
                                    htmlFor="resume-upload"
                                    className={`relative cursor-pointer flex justify-center w-full rounded-lg border-2 border-dashed ${error ? 'border-red-500' : 'border-slate-600'} px-6 py-10 hover:border-sky-500 transition-colors`}
                                >
                                    <div className="text-center">
                                        <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-slate-500" />
                                        <span className="mt-2 block text-sm font-semibold text-sky-400">
                                            {resumeFile ? resumeFile.name : "Click to upload a file"}
                                        </span>
                                        <span className="block text-xs text-slate-500">{isParsing ? 'Parsing PDF...' : '(PDF only)'}</span>
                                        <input id="resume-upload" name="resume-upload" type="file" className="sr-only" accept=".pdf" onChange={handleFileChange} disabled={isParsing} />
                                    </div>
                                </label>
                            </div>
                            <div>
                                <label htmlFor="job-title" className="block text-sm font-medium text-slate-300 mb-2">
                                    2. Job Title You're Interviewing For
                                </label>
                                <input
                                    id="job-title" type="text" value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    placeholder="e.g., 'Senior Frontend Developer'"
                                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-md py-3 px-4"
                                />
                            </div>
                            <div>
                                <label htmlFor="job-description" className="block text-sm font-medium text-slate-300 mb-2">
                                    3. Job Description (Optional, for better questions)
                                </label>
                                <textarea
                                    id="job-description" rows={5} value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="Paste the full job description here..."
                                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-md py-3 px-4"
                                />
                            </div>
                            {error && <p className="text-red-400 text-center">{error}</p>}
                            <button
                                onClick={handleStartInterview}
                                disabled={!canStart}
                                className="w-full bg-sky-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-sky-500 transition-all shadow-lg shadow-sky-600/30 disabled:bg-slate-600 disabled:shadow-none disabled:cursor-not-allowed"
                            >
                                Start Interview
                            </button>
                        </div>
                    </div>
                );
            
            case 'interviewing':
                // (This code is unchanged from Phase 3)
                let statusText = "Click the mic to speak";
                if (isAILoading) statusText = "AI is thinking...";
                if (isUserListening) statusText = "Listening...";

                return (
                    <div className="w-full max-w-3xl mx-auto p-4 md:p-8 bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-lg animate-fadeIn flex flex-col h-[calc(100vh-12rem)]">
                        <h2 className="text-2xl font-bold text-center text-white mb-4">Interview for {jobTitle}</h2>
                        
                        {/* Chat History */}
                        <div ref={chatContainerRef} className="flex-grow overflow-y-auto space-y-6 p-4">
                            {chatHistory.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                                    {msg.role === 'model' && (
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center mr-3">
                                            <AIAgentIcon className="w-6 h-6 text-white" />
                                        </div>
                                    )}
                                    <div className={`p-4 rounded-xl max-w-lg ${msg.role === 'user' ? 'bg-slate-700 text-slate-200' : 'bg-slate-600 text-slate-100'}`}>
                                        <p>{msg.text}</p>
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center ml-3">
                                            <UserIcon className="w-6 h-6 text-white" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isAILoading && chatHistory.length > 0 && !feedback && (
                                <div className="flex justify-start">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center mr-3">
                                        <AIAgentIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="p-4 rounded-xl max-w-lg bg-slate-600 text-slate-100">
                                        <Loader /> {/* Show loader in a chat bubble */}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="flex-shrink-0 pt-4 border-t border-slate-700">
                            {/* --- NEW BUTTON --- */}
                            <div className="text-center mb-2">
                                <button 
                                    onClick={handleManualEnd}
                                    disabled={isAILoading || isUserListening}
                                    className="text-xs text-slate-400 hover:text-red-400 disabled:text-slate-600 disabled:cursor-not-allowed"
                                >
                                    End Interview & Get Feedback
                                </button>
                            </div>
                            {/* --- END NEW BUTTON --- */}
                            <p className="text-center text-slate-400 text-sm mb-4 h-5">
                                {statusText}
                            </p>
                            <div className="flex justify-center items-center">
                                {!isUserListening ? (
                                    <button
                                        onClick={startListening}
                                        disabled={isAILoading || !recognition}
                                        className="w-20 h-20 bg-sky-600 rounded-full flex items-center justify-center shadow-lg transition-all hover:bg-sky-500 disabled:bg-slate-600"
                                    >
                                        <MicrophoneIcon className="w-8 h-8 text-white" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={stopListening}
                                        className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-all hover:bg-red-500 animate-pulse"
                                    >
                                        <StopIcon className="w-8 h-8 text-white" />
                                    </button>
                                )}
                            </div>
                            {error && <p className="text-red-400 text-center mt-4">{error}</p>}
                        </div>
                    </div>
                );

            case 'feedback':
                 // --- This is the new UI for Phase 4 ---
                if (isAILoading || !feedback) {
                    return (
                        <div className="w-full max-w-2xl mx-auto p-8 bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-lg animate-fadeIn flex flex-col items-center">
                            <h2 className="text-2xl font-bold text-white mb-4">Analyzing your interview...</h2>
                            <p className="text-slate-400 mb-6">Your AI coach is compiling your feedback report.</p>
                            <Loader />
                        </div>
                    );
                }

                return (
                    <div className="w-full max-w-3xl mx-auto p-8 bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-lg animate-fadeIn">
                        <h1 className="text-3xl font-bold text-white mb-4">Interview Feedback Report</h1>
                        <p className="text-slate-400 mb-6">Here's the analysis of your performance for the "{jobTitle}" role.</p>

                        <div className="space-y-6">
                            {/* Overall Feedback */}
                            <div>
                                <h2 className="text-xl font-semibold text-sky-400 mb-3">Overall Feedback</h2>
                                <div className="p-4 bg-slate-700/50 rounded-lg">
                                    <p className="text-slate-300 leading-relaxed">{feedback.overall_feedback}</p>
                                </div>
                            </div>
                            
                            {/* Strengths */}
                            <div>
                                <h2 className="text-xl font-semibold text-green-400 mb-3">Strengths</h2>
                                <ul className="space-y-2">
                                    {feedback.strengths.map((strength, index) => (
                                        <li key={index} className="flex items-start p-3 bg-slate-700/50 rounded-lg">
                                            <HandThumbUpIcon className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-1" />
                                            <span className="text-slate-300">{strength}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Areas for Improvement */}
                            <div>
                                <h2 className="text-xl font-semibold text-yellow-400 mb-3">Areas for Improvement</h2>
                                <ul className="space-y-2">
                                    {feedback.areas_for_improvement.map((area, index) => (
                                        <li key={index} className="flex items-start p-3 bg-slate-700/50 rounded-lg">
                                            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0 mt-1" />
                                            <span className="text-slate-300">{area}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {error && <p className="text-red-400 text-center mt-6">{error}</p>}
                        
                        <button
                            onClick={handleRestart}
                            className="w-full bg-sky-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-sky-500 transition-all shadow-lg shadow-sky-600/30 mt-8 flex items-center justify-center"
                        >
                            <ArrowPathIcon className="w-5 h-5 mr-2" />
                            Start a New Interview
                        </button>
                    </div>
                );
        }
    };
    
    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
            {renderContent()}
        </div>
    );
};

export default MockInterviewPage;