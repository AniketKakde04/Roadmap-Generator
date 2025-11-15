import React, { useState, useCallback, useEffect } from 'react';
// --- UPDATED: Import new AI function ---
import { generateRoadmap, generatePersonalizedRoadmap } from './services/geminiService';
import { Roadmap as RoadmapType, SavedRoadmap, User, ResumeData, AnalysisReport } from './types';
import Loader from './components/Loader';
import Roadmap from './components/Roadmap';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import ProfilePage from './components/ProfilePage';
import ResumeBuilderPage from './components/ResumeBuilderPage';
import HomePage from './components/HomePage';
import { getSession, onAuthStateChange, signOutUser } from './services/authService';
import { getSavedRoadmaps, saveRoadmap, deleteRoadmap, updateRoadmapProgress, updateRoadmap } from './services/roadmapService';
import AptitudeDashboard from './components/AptitudeDashboard'; 
// --- NEW: Import for PDF parsing ---
import * as pdfjsLib from 'pdfjs-dist';
import ArrowUpTrayIcon from './components/icons/ArrowUpTrayIcon';

// Configure the worker for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@^4.5.136/build/pdf.worker.mjs`;


const App: React.FC = () => {
    const [view, setView] = useState<'home' | 'roadmapGenerator' | 'resume' | 'profile' | 'resumeBuilder' | 'aptitude'>('home');
    const [roadmap, setRoadmap] = useState<RoadmapType | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [autoGenerate, setAutoGenerate] = useState(false);

    // --- State for "Generate by Topic" mode ---
    const [topic, setTopic] = useState<string>('');
    const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Professional'>('Beginner');
    
    // --- NEW: State for "Generate by Job Role" mode ---
    const [generationMode, setGenerationMode] = useState<'topic' | 'job'>('topic');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [resumeText, setResumeText] = useState<string>('');
    const [jobTitle, setJobTitle] = useState<string>('');
    const [jobDescription, setJobDescription] = useState<string>('');
    const [isParsing, setIsParsing] = useState<boolean>(false);

    // --- State for Timeline (shared by both modes) ---
    const [timeline, setTimeline] = useState<string>('3 Months'); // Default timeline

    // --- Auth and Saved Roadmap State (unchanged) ---
    const [user, setUser] = useState<User | null>(null);
    const [modalView, setModalView] = useState<'signIn' | 'signUp' | null>(null);
    const [savedRoadmaps, setSavedRoadmaps] = useState<SavedRoadmap[]>([]);
    
    // ... (useEffect for auth and saved roadmaps remains unchanged) ...
    useEffect(() => {
        const checkUser = async () => {
            const session = await getSession();
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (!currentUser) {
                setView('home');
            }
        };
        checkUser();

        const { data: authListener } = onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
             if (!currentUser) {
                setView('home');
            }
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (user) {
            getSavedRoadmaps().then(setSavedRoadmaps).catch(console.error);
        } else {
            setSavedRoadmaps([]);
        }
    }, [user]);

    // --- NEW: PDF Parsing Logic (from ResumeAnalyzer) ---
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

    // --- UPDATED: Main roadmap generation logic ---
    const handleGenerateRoadmap = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setRoadmap(null);
        
        try {
            let result: RoadmapType;
            if (generationMode === 'topic') {
                // --- Mode 1: Generate by Topic ---
                if (!topic.trim()) {
                    throw new Error('Please enter a topic to generate a roadmap.');
                }
                result = await generateRoadmap(topic, level, timeline);
            } else {
                // --- Mode 2: Generate by Job Role ---
                if (!resumeText.trim() || !jobTitle.trim() || !jobDescription.trim()) {
                    throw new Error('Please provide a Resume, Job Title, and Job Description.');
                }
                result = await generatePersonalizedRoadmap(resumeText, jobTitle, jobDescription, timeline);
            }
            setRoadmap(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [generationMode, topic, level, timeline, resumeText, jobTitle, jobDescription]); // Updated dependencies
    
    // ... (useEffect for autoGenerate remains unchanged) ...
    useEffect(() => {
        if (autoGenerate && topic) {
            setView('roadmapGenerator');
            setGenerationMode('topic'); // Ensure we're in the right mode
            handleGenerateRoadmap();
            setAutoGenerate(false);
        }
    }, [autoGenerate, topic, handleGenerateRoadmap]);
    
    // ... (All other handlers: handleSaveRoadmap, handleUpdateRoadmap, handleDeleteRoadmap, handleProgressToggle, etc. remain unchanged) ...
    const handleSaveRoadmap = async () => {
        if (!roadmap || !user) return;
        try {
            const newSavedRoadmap = await saveRoadmap(roadmap);
            setSavedRoadmaps(prev => [...prev, newSavedRoadmap]);
        } catch (e: any) {
            setError("Failed to save roadmap. Please try again.");
            console.error(e.message);
        }
    };

    const handleUpdateRoadmap = async (updatedRoadmap: SavedRoadmap) => {
       const originalRoadmaps = [...savedRoadmaps];
       const updatedList = originalRoadmaps.map(r => r.id === updatedRoadmap.id ? updatedRoadmap : r);
       setSavedRoadmaps(updatedList);
       try {
           await updateRoadmap(updatedRoadmap);
       } catch (e: any) {
           setError("Failed to save changes.");
           setSavedRoadmaps(originalRoadmaps);
       }
    };

    const handleDeleteRoadmap = async (roadmapId: string) => {
       const originalRoadmaps = [...savedRoadmaps];
       setSavedRoadmaps(prev => prev.filter(r => r.id !== roadmapId));
       try {
           await deleteRoadmap(roadmapId);
       } catch (e: any) {
           setError("Failed to delete roadmap.");
           setSavedRoadmaps(originalRoadmaps);
       }
    };

    const handleProgressToggle = async (roadmapId: string, stepIndex: number) => {
        const originalRoadmaps = [...savedRoadmaps];
        const roadmapToUpdate = originalRoadmaps.find(r => r.id === roadmapId);
        if (!roadmapToUpdate) return;
        const newCompletedSteps = roadmapToUpdate.completedSteps.includes(stepIndex)
            ? roadmapToUpdate.completedSteps.filter(i => i !== stepIndex)
            : [...roadmapToUpdate.completedSteps, stepIndex];
        const updatedRoadmaps = originalRoadmaps.map(r => 
            r.id === roadmapId ? { ...r, completedSteps: newCompletedSteps } : r
        );
        setSavedRoadmaps(updatedRoadmaps);
        try {
            await updateRoadmapProgress(roadmapId, newCompletedSteps);
        } catch (e: any) {
            setError("Failed to update progress.");
            setSavedRoadmaps(originalRoadmaps);
        }
    };
    
    const handleProjectSelect = (projectTitle: string) => {
        setTopic(projectTitle);
        setAutoGenerate(true);
    };

    const handleAuthSuccess = () => {
        setModalView(null);
        setView('profile');
    };
    
    const handleSignOut = async () => {
        await signOutUser();
        setView('home');
    };
    
    // --- UPDATED: renderContent function ---
    const renderContent = () => {
        const isLoggedIn = !!user;
        const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0];
        
        switch (view) {
            case 'home':
                return <HomePage onSignUpClick={() => setModalView('signUp')} onNavigate={setView} isLoggedIn={isLoggedIn} />;
            case 'resume':
                return <ResumeAnalyzer onProjectSelect={handleProjectSelect} />;
            case 'profile':
                 return isLoggedIn ? <ProfilePage 
                        userName={userName} 
                        savedRoadmaps={savedRoadmaps} 
                        onProgressToggle={handleProgressToggle}
                        onDeleteRoadmap={handleDeleteRoadmap}
                        onUpdateRoadmap={handleUpdateRoadmap}
                        onNavigate={setView}
                    /> : <HomePage onSignUpClick={() => setModalView('signUp')} onNavigate={setView} isLoggedIn={isLoggedIn} />;
            case 'resumeBuilder':
                return isLoggedIn ? <ResumeBuilderPage /> : <HomePage onSignUpClick={() => setModalView('signUp')} onNavigate={setView} isLoggedIn={isLoggedIn} />;
            case 'aptitude':
                return isLoggedIn ? <AptitudeDashboard /> : <HomePage onSignUpClick={() => setModalView('signUp')} onNavigate={setView} isLoggedIn={isLoggedIn} />;
            
            // --- UPDATED: This entire view is new ---
            case 'roadmapGenerator':
            default:
                const isCurrentRoadmapSaved = !!(roadmap && savedRoadmaps.some(r => r.title === roadmap.title && r.description === roadmap.description));
                const canGenerate = generationMode === 'topic' 
                    ? !isLoading && topic.trim()
                    : !isLoading && !isParsing && resumeFile && jobTitle.trim() && jobDescription.trim();

                return (
                    <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
                         <header className="w-full text-center pt-8 md:pt-12">
                            <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">
                                AI Roadmap Generator
                            </h1>
                            <p className="mt-4 text-lg text-slate-400">
                                Chart your course. Generate a plan by topic or a personalized plan for your dream job.
                            </p>
                        </header>

                        <main className="w-full flex-grow flex flex-col items-center">
                            <div className="w-full max-w-3xl p-4 bg-slate-900/50 backdrop-blur-md rounded-xl shadow-lg border border-slate-700/50 mt-8">
                                
                                {/* --- NEW: Tabbed Interface --- */}
                                <div className="flex mb-4 p-1 bg-slate-800 rounded-lg">
                                    <button
                                        onClick={() => setGenerationMode('topic')}
                                        className={`w-1/2 py-2.5 rounded-md font-semibold transition-colors ${generationMode === 'topic' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
                                    >
                                        Generate by Topic
                                    </button>
                                    <button
                                        onClick={() => setGenerationMode('job')}
                                        className={`w-1/2 py-2.5 rounded-md font-semibold transition-colors ${generationMode === 'job' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
                                    >
                                        Generate for Job Role
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* --- Mode 1: Generate by Topic (Existing) --- */}
                                    {generationMode === 'topic' && (
                                        <div className="space-y-4 animate-fadeIn">
                                            <div>
                                                <label htmlFor="topic" className="block text-sm font-medium text-slate-300 mb-2">
                                                    Topic
                                                </label>
                                                <input
                                                    id="topic" type="text" value={topic}
                                                    onChange={(e) => setTopic(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleGenerateRoadmap()}
                                                    placeholder="e.g., 'Learn React Native' or 'Master System Design'"
                                                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-md py-3 px-4"
                                                    disabled={isLoading}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="level" className="block text-sm font-medium text-slate-300 mb-2">Level</label>
                                                <select
                                                    id="level" value={level}
                                                    onChange={(e) => setLevel(e.target.value as 'Beginner' | 'Intermediate' | 'Professional')}
                                                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-md py-3 px-4"
                                                    disabled={isLoading}
                                                >
                                                    <option>Beginner</option>
                                                    <option>Intermediate</option>
                                                    <option>Professional</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {/* --- Mode 2: Generate by Job Role (New) --- */}
                                    {generationMode === 'job' && (
                                        <div className="space-y-4 animate-fadeIn">
                                            <div>
                                                <label htmlFor="resume-upload" className="block text-sm font-medium text-slate-300 mb-2">
                                                   1. Upload Your Resume (PDF)
                                                </label>
                                                <label
                                                    htmlFor="resume-upload"
                                                    className="relative cursor-pointer flex justify-center w-full rounded-lg border border-dashed border-slate-600 px-6 py-6 hover:border-sky-500 transition-colors"
                                                >
                                                    <div className="text-center">
                                                        <ArrowUpTrayIcon className="mx-auto h-10 w-10 text-slate-500" />
                                                        <span className="mt-2 block text-sm font-semibold text-sky-400">
                                                            {resumeFile ? resumeFile.name : "Click to upload a file"}
                                                        </span>
                                                        <span className="block text-xs text-slate-500">{isParsing ? 'Parsing PDF...' : '(PDF only)'}</span>
                                                        <input id="resume-upload" name="resume-upload" type="file" className="sr-only" accept=".pdf" onChange={handleFileChange} disabled={isLoading || isParsing} />
                                                    </div>
                                                </label>
                                            </div>
                                            
                                            <div>
                                                <label htmlFor="job-title" className="block text-sm font-medium text-slate-300 mb-2">
                                                    2. Target Job Title
                                                </label>
                                                <input
                                                    id="job-title" type="text" value={jobTitle}
                                                    onChange={(e) => setJobTitle(e.target.value)}
                                                    placeholder="e.g., 'Senior Frontend Developer'"
                                                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-md py-3 px-4"
                                                    disabled={isLoading}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="job-description" className="block text-sm font-medium text-slate-300 mb-2">
                                                    3. Job Description
                                                </label>
                                                <textarea
                                                    id="job-description" rows={6} value={jobDescription}
                                                    onChange={(e) => setJobDescription(e.target.value)}
                                                    placeholder="Paste the full job description here..."
                                                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-md py-3 px-4"
                                                    disabled={isLoading}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* --- Shared Timeline Input --- */}
                                     <div>
                                        <label htmlFor="timeline" className="block text-sm font-medium text-slate-300 mb-2">
                                            {generationMode === 'topic' ? 'Preferred Timeline (Optional)' : '4. Prep Timeline'}
                                        </label>
                                        <input
                                            id="timeline" type="text" value={timeline}
                                            onChange={(e) => setTimeline(e.target.value)}
                                            placeholder="e.g., '3 Months'"
                                            className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-md py-3 px-4"
                                            disabled={isLoading}
                                        />
                                    </div>

                                    {/* --- Shared Generate Button --- */}
                                    <button
                                        onClick={handleGenerateRoadmap}
                                        disabled={!canGenerate}
                                        className="w-full bg-sky-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? 'Generating...' : (generationMode === 'topic' ? 'Generate Topic Roadmap' : 'Generate Personalized Prep Plan')}
                                    </button>
                                </div>
                                {error && <p className="text-red-400 mt-3 text-center">{error}</p>}
                            </div>

                            {/* --- Shared Output Area (Unchanged) --- */}
                            <div className="w-full mt-8">
                                {isLoading && <Loader />}
                                {roadmap && (
                                     <div>
                                        {isLoggedIn && (
                                            <div className="text-center mb-6">
                                                <button 
                                                    onClick={handleSaveRoadmap}
                                                    disabled={isCurrentRoadmapSaved}
                                                    className="bg-green-600 text-white font-semibold py-2 px-5 rounded-md hover:bg-green-500 disabled:bg-slate-600"
                                                >
                                                     {isCurrentRoadmapSaved ? 'Saved' : 'Save Roadmap'}
                                                </button>
                                            </div>
                                        )}
                                        <Roadmap roadmap={roadmap} />
                                    </div>
                                )}
                            </div>
                        </main>
                    </div>
                );
        }
    };
    
    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans">
            <Navbar 
                currentView={view} 
                onNavigate={setView}
                isLoggedIn={!!user}
                onSignInClick={() => setModalView('signIn')}
                onSignUpClick={() => setModalView('signUp')}
                onSignOut={handleSignOut}
            />
            {modalView && (
                <AuthModal
                    initialView={modalView}
                    onClose={() => setModalView(null)}
                    onAuthSuccess={handleAuthSuccess}
                />
            )}
            <div className="flex flex-col items-center p-4">
               <div key={view} className="w-full animate-fadeIn">
                 {renderContent()}
               </div>
            </div>
        </div>
    );
};

export default App;