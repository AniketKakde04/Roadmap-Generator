import React, { useState, useCallback, useEffect } from 'react';
import { generateRoadmap, generatePersonalizedRoadmap } from './services/geminiService';
import { Roadmap as RoadmapType, SavedRoadmap, User, ResumeData } from './types';
import Loader from './components/Loader';
import Roadmap from './components/Roadmap';
import Navbar from './components/Navbar';
import VerticalNavbar from './components/VerticalNavbar';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import ProfilePage from './components/ProfilePage';
import ResumeBuilderPage from './components/ResumeBuilderPage';
import HomePage from './components/HomePage';
import AptitudeDashboard from './components/AptitudeDashboard';
import MockInterviewPage from './components/MockInterviewPage';
import PortfolioPreview from './components/PortfolioPreview';
import OnboardingTour, { TourStep } from './components/OnboardingTour'; // Import Tour
import { getSession, onAuthStateChange, signOutUser } from './services/authService';
import { getSavedRoadmaps, saveRoadmap, deleteRoadmap, updateRoadmapProgress, updateRoadmap } from './services/roadmapService';
import { getResume } from './services/resumeService';
import * as pdfjsLib from 'pdfjs-dist';
import ArrowUpTrayIcon from './components/icons/ArrowUpTrayIcon';

// Configure the worker for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@^4.5.136/build/pdf.worker.mjs`;

type View = 'home' | 'dashboard' | 'roadmapGenerator' | 'resume' | 'profile' | 'resumeBuilder' | 'aptitude' | 'mockInterview' | 'sharedPortfolio';

const App: React.FC = () => {
    // Initialize view based on URL to prevent flicker
    const [view, setView] = useState<View>(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('view') === 'sharedPortfolio' ? 'sharedPortfolio' : 'home';
    });

    const [roadmap, setRoadmap] = useState<RoadmapType | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [autoGenerate, setAutoGenerate] = useState(false);

    // State for Generation
    const [topic, setTopic] = useState<string>('');
    const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Professional'>('Beginner');
    const [generationMode, setGenerationMode] = useState<'topic' | 'job'>('topic');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [resumeText, setResumeText] = useState<string>('');
    const [jobTitle, setJobTitle] = useState<string>('');
    const [jobDescription, setJobDescription] = useState<string>('');
    const [isParsing, setIsParsing] = useState<boolean>(false);
    const [timeline, setTimeline] = useState<string>('3 Months');

    // Auth & Data State
    const [user, setUser] = useState<User | null>(null);
    const [modalView, setModalView] = useState<'signIn' | 'signUp' | null>(null);
    const [savedRoadmaps, setSavedRoadmaps] = useState<SavedRoadmap[]>([]);

    // Public Portfolio Data
    const [publicResumeData, setPublicResumeData] = useState<ResumeData | null>(null);

    // --- TOUR STATE ---
    const [showTour, setShowTour] = useState(false);

    // Define Tour Steps
    const tourSteps: TourStep[] = [
        {
            targetId: 'tour-welcome-header',
            title: 'Welcome to EduPath!',
            content: 'This is your dashboard. From here, you can access all the AI-powered tools to boost your career.',
            position: 'center'
        },
        {
            targetId: 'nav-roadmap',
            title: 'AI Roadmap Generator',
            content: 'Generate personalized learning paths for any tech stack or job role tailored to your timeline.',
            position: 'right'
        },
        {
            targetId: 'nav-builder',
            title: 'Resume Builder',
            content: 'Build a professional, ATS-friendly resume from scratch using our templates.',
            position: 'right'
        },
        {
            targetId: 'nav-interview',
            title: 'Mock Interviews',
            content: 'Practice speaking with an AI interviewer and get real-time feedback on your answers.',
            position: 'right'
        },
        {
            targetId: 'nav-profile',
            title: 'Your Profile',
            content: 'Access your saved roadmaps, resume data, and your shareable portfolio link here.',
            position: 'right'
        }
    ];

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const publicView = params.get('view');
        const sharedUserId = params.get('userId');

        if (publicView === 'sharedPortfolio' && sharedUserId) {
            setView('sharedPortfolio');
            getResume(sharedUserId).then(data => {
                if (data) setPublicResumeData(data);
            });
        }

        const checkUser = async () => {
            const session = await getSession();
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (publicView !== 'sharedPortfolio') {
                if (currentUser) {
                    setView(v => v === 'home' ? 'dashboard' : v);

                    // Check for Onboarding Tour
                    const hasSeenTour = localStorage.getItem('onboarding_complete');
                    if (!hasSeenTour) {
                        // Small delay to ensure UI is rendered
                        setTimeout(() => setShowTour(true), 1000);
                    }
                } else {
                    setView('home');
                }
            } else if (currentUser && !sharedUserId) {
                const data = await getResume(currentUser.id);
                if (data) setPublicResumeData(data);
            }
        };
        checkUser();

        const { data: authListener } = onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            const currentParams = new URLSearchParams(window.location.search);
            if (currentParams.get('view') !== 'sharedPortfolio') {
                if (currentUser) {
                    setView(v => v === 'home' ? 'dashboard' : v);
                } else {
                    setView('home');
                }
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

    const handleTourComplete = () => {
        localStorage.setItem('onboarding_complete', 'true');
        setShowTour(false);
    };

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
                        const pageText = textContent.items.map((item: any) => ('str' in item ? item.str : '')).join(' ');
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

    const handleGenerateRoadmap = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setRoadmap(null);

        try {
            let result: RoadmapType;
            if (generationMode === 'topic') {
                if (!topic.trim()) {
                    throw new Error('Please enter a topic to generate a roadmap.');
                }
                result = await generateRoadmap(topic, level, timeline);
            } else {
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
    }, [generationMode, topic, level, timeline, resumeText, jobTitle, jobDescription]);

    useEffect(() => {
        if (autoGenerate && topic) {
            setView('roadmapGenerator');
            setGenerationMode('topic');
            handleGenerateRoadmap();
            setAutoGenerate(false);
        }
    }, [autoGenerate, topic, handleGenerateRoadmap]);

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
        setView('dashboard');
        // Trigger tour for new sign ups immediately
        const hasSeenTour = localStorage.getItem('onboarding_complete');
        if (!hasSeenTour) {
            setTimeout(() => setShowTour(true), 500);
        }
    };

    const handleSignOut = async () => {
        await signOutUser();
        setView('home');
    };

    const renderContent = () => {
        const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

        // --- PUBLIC PORTFOLIO VIEW LOGIC ---
        if (view === 'sharedPortfolio') {
            if (!publicResumeData) return <div className="w-full min-h-screen flex items-center justify-center bg-white"><Loader /></div>;
            return (
                <div className="w-full min-h-screen bg-white relative">
                    <PortfolioPreview data={publicResumeData} readOnly={true} />
                    <a
                        href="/"
                        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-white/90 backdrop-blur border border-slate-200 px-3 py-1.5 rounded-full shadow-sm hover:shadow-md transition-all group no-underline"
                        title="Create your own portfolio with EduPath"
                    >
                        <div className="w-5 h-5 bg-primary rounded flex items-center justify-center text-[9px] text-white font-bold">AI</div>
                        <span className="text-xs font-medium text-slate-500 group-hover:text-primary transition-colors">Made with EduPath</span>
                    </a>
                </div>
            );
        }

        if (!user && view !== 'home') {
            return <HomePage onSignUpClick={() => setModalView('signUp')} onNavigate={setView as any} isLoggedIn={false} />;
        }

        switch (view) {
            case 'home':
                return <HomePage onSignUpClick={() => setModalView('signUp')} onNavigate={setView as any} isLoggedIn={!!user} />;

            case 'dashboard':
                return <Dashboard userName={userName} onNavigate={setView as any} stats={{ roadmaps: savedRoadmaps.length }} />;

            case 'resume':
                return <ResumeAnalyzer onProjectSelect={handleProjectSelect} />;

            case 'profile':
                return <ProfilePage
                    userName={userName}
                    savedRoadmaps={savedRoadmaps}
                    onProgressToggle={handleProgressToggle}
                    onDeleteRoadmap={handleDeleteRoadmap}
                    onUpdateRoadmap={handleUpdateRoadmap}
                    onNavigate={setView as any}
                />;
            case 'resumeBuilder':
                return <ResumeBuilderPage />;
            case 'aptitude':
                return <AptitudeDashboard />;
            case 'mockInterview':
                return <MockInterviewPage />;

            case 'roadmapGenerator':
            default:
                const isCurrentRoadmapSaved = !!(roadmap && savedRoadmaps.some(r => r.title === roadmap.title && r.description === roadmap.description));
                const canGenerate = generationMode === 'topic'
                    ? !isLoading && topic.trim()
                    : !isLoading && !isParsing && resumeFile && jobTitle.trim() && jobDescription.trim();

                return (
                    <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
                        <header className="w-full text-center pt-8 md:pt-12">
                            <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                                AI Roadmap Generator
                            </h1>
                            <p className="mt-4 text-lg text-text-secondary">
                                Chart your course. Generate a plan by topic or a personalized plan for your dream job.
                            </p>
                        </header>

                        <main className="w-full flex-grow flex flex-col items-center">
                            <div className="w-full max-w-3xl p-6 bg-background-secondary/80 backdrop-blur-md rounded-xl shadow-xl border border-border mt-8">

                                <div className="flex mb-6 p-1 bg-background-accent rounded-lg">
                                    <button
                                        onClick={() => setGenerationMode('topic')}
                                        className={`w-1/2 py-2.5 rounded-md font-semibold transition-colors ${generationMode === 'topic' ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:bg-background-hover'}`}
                                    >
                                        Generate by Topic
                                    </button>
                                    <button
                                        onClick={() => setGenerationMode('job')}
                                        className={`w-1/2 py-2.5 rounded-md font-semibold transition-colors ${generationMode === 'job' ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:bg-background-hover'}`}
                                    >
                                        Generate for Job Role
                                    </button>
                                </div>

                                <div className="space-y-5">
                                    {generationMode === 'topic' && (
                                        <div className="space-y-4 animate-fadeIn">
                                            <div>
                                                <label htmlFor="topic" className="block text-sm font-medium text-text-primary mb-2">
                                                    Topic
                                                </label>
                                                <input
                                                    id="topic" type="text" value={topic}
                                                    onChange={(e) => setTopic(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleGenerateRoadmap()}
                                                    placeholder="e.g., 'Learn React Native' or 'Master System Design'"
                                                    className="w-full bg-background border border-border text-text-primary rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                                                    disabled={isLoading}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="level" className="block text-sm font-medium text-text-primary mb-2">Level</label>
                                                <select
                                                    id="level" value={level}
                                                    onChange={(e) => setLevel(e.target.value as 'Beginner' | 'Intermediate' | 'Professional')}
                                                    className="w-full bg-background border border-border text-text-primary rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                                                    disabled={isLoading}
                                                >
                                                    <option>Beginner</option>
                                                    <option>Intermediate</option>
                                                    <option>Professional</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {generationMode === 'job' && (
                                        <div className="space-y-4 animate-fadeIn">
                                            <div>
                                                <label htmlFor="resume-upload" className="block text-sm font-medium text-text-primary mb-2">
                                                    1. Upload Your Resume (PDF)
                                                </label>
                                                <label
                                                    htmlFor="resume-upload"
                                                    className="relative cursor-pointer flex justify-center w-full rounded-lg border-2 border-dashed border-border px-6 py-8 hover:border-primary transition-colors bg-background hover:bg-background-hover"
                                                >
                                                    <div className="text-center">
                                                        <ArrowUpTrayIcon className="mx-auto h-10 w-10 text-primary/70" />
                                                        <span className="mt-2 block text-sm font-semibold text-primary">
                                                            {resumeFile ? resumeFile.name : "Click to upload PDF"}
                                                        </span>
                                                        <span className="block text-xs text-text-secondary mt-1">{isParsing ? 'Parsing PDF...' : 'Max size 5MB'}</span>
                                                        <input id="resume-upload" name="resume-upload" type="file" className="sr-only" accept=".pdf" onChange={handleFileChange} disabled={isLoading || isParsing} />
                                                    </div>
                                                </label>
                                            </div>

                                            <div>
                                                <label htmlFor="job-title" className="block text-sm font-medium text-text-primary mb-2">
                                                    2. Target Job Title
                                                </label>
                                                <input
                                                    id="job-title" type="text" value={jobTitle}
                                                    onChange={(e) => setJobTitle(e.target.value)}
                                                    placeholder="e.g., 'Senior Frontend Developer'"
                                                    className="w-full bg-background border border-border text-text-primary placeholder-text-secondary rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary outline-none"
                                                    disabled={isLoading}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="job-description" className="block text-sm font-medium text-text-primary mb-2">
                                                    3. Job Description
                                                </label>
                                                <textarea
                                                    id="job-description" rows={6} value={jobDescription}
                                                    onChange={(e) => setJobDescription(e.target.value)}
                                                    placeholder="Paste the full job description here..."
                                                    className="w-full bg-background border border-border text-text-primary placeholder-text-secondary rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary outline-none"
                                                    disabled={isLoading}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label htmlFor="timeline" className="block text-sm font-medium text-text-primary mb-2">
                                            {generationMode === 'topic' ? 'Preferred Timeline (Optional)' : '4. Prep Timeline'}
                                        </label>
                                        <input
                                            id="timeline" type="text" value={timeline}
                                            onChange={(e) => setTimeline(e.target.value)}
                                            placeholder="e.g., '3 Months'"
                                            className="w-full bg-background border border-border text-text-primary placeholder-text-secondary rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary outline-none"
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <button
                                        onClick={handleGenerateRoadmap}
                                        disabled={!canGenerate}
                                        className="w-full bg-primary text-white font-bold py-4 px-6 rounded-lg hover:bg-primary/90 disabled:bg-background-accent disabled:text-text-secondary disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 mt-4"
                                    >
                                        {isLoading ? 'Generating...' : (generationMode === 'topic' ? 'Generate Roadmap' : 'Generate Personalized Plan')}
                                    </button>
                                </div>
                                {error && <p className="text-error mt-4 text-center bg-error/10 p-3 rounded-lg border border-error/20">{error}</p>}
                            </div>

                            <div className="w-full mt-10">
                                {isLoading && <Loader />}
                                {roadmap && (
                                    <div>
                                        {user && (
                                            <div className="text-center mb-6">
                                                <button
                                                    onClick={handleSaveRoadmap}
                                                    disabled={isCurrentRoadmapSaved}
                                                    className={`bg-success text-white font-semibold py-2 px-6 rounded-full hover:bg-opacity-90 disabled:bg-background-accent disabled:text-success shadow-lg transition-all ${isCurrentRoadmapSaved ? 'cursor-default' : ''}`}
                                                >
                                                    {isCurrentRoadmapSaved ? '✓ Saved' : 'Save Roadmap'}
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
        <div className="min-h-screen bg-background text-text-primary font-sans transition-colors duration-300 selection:bg-primary/30">
            {/* Render Tour if conditions met */}
            {showTour && (
                <OnboardingTour
                    steps={tourSteps}
                    onComplete={handleTourComplete}
                    onSkip={handleTourComplete}
                />
            )}

            {view === 'sharedPortfolio' ? (
                renderContent()
            ) : user ? (
                <div className="flex h-screen overflow-hidden flex-col md:flex-row">
                    {/* Desktop Sidebar */}
                    <div className="hidden md:block h-full">
                        <VerticalNavbar
                            currentView={view}
                            onNavigate={(v) => setView(v as View)}
                            isLoggedIn={true}
                            onSignInClick={() => { }}
                            onSignUpClick={() => { }}
                            onSignOut={handleSignOut}
                        />
                    </div>

                    {/* Mobile Top Navbar */}
                    <div className="md:hidden">
                        <Navbar
                            currentView={view}
                            onNavigate={(v) => setView(v as View)}
                            isLoggedIn={true}
                            onSignInClick={() => { }}
                            onSignUpClick={() => { }}
                            onSignOut={handleSignOut}
                        />
                    </div>

                    <main className="flex-1 overflow-y-auto bg-background relative scrollbar-hide">
                        <div className="p-4 md:p-8 max-w-[1600px] mx-auto pb-20 md:pb-8">
                            {renderContent()}
                        </div>
                    </main>
                </div>
            ) : (
                <div className="flex flex-col min-h-screen bg-background">
                    <Navbar
                        currentView={view}
                        onNavigate={(v) => setView(v as View)}
                        isLoggedIn={false}
                        onSignInClick={() => setModalView('signIn')}
                        onSignUpClick={() => setModalView('signUp')}
                        onSignOut={() => { }}
                    />
                    <div className="flex-grow">
                        <div className="flex flex-col items-center">
                            <div key={view} className="w-full animate-fadeIn">
                                {renderContent()}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {modalView && (
                <AuthModal
                    initialView={modalView}
                    onClose={() => setModalView(null)}
                    onAuthSuccess={handleAuthSuccess}
                />
            )}
        </div>
    );
};

export default App;