import React, { useState, useCallback, useEffect } from 'react';
import { generateRoadmap } from './services/geminiService';
import { Roadmap as RoadmapType, SavedRoadmap, User } from './types';
import Loader from './components/Loader';
import Roadmap from './components/Roadmap';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import ProfilePage from './components/ProfilePage';
import { getSession, onAuthStateChange, signOutUser } from './services/authService';
import { getSavedRoadmaps, saveRoadmap, deleteRoadmap, updateRoadmapProgress, updateRoadmap } from './services/roadmapService'; // Import updateRoadmap

const exampleTopics = [
    { title: 'Learn Quantum Computing', description: 'From qubits to quantum algorithms, a path for beginners.' },
    { title: 'Build a Full-Stack Web App with Next.js', description: 'Create a modern, server-rendered React application.' },
    { title: 'Master Python for Data Science', description: 'A roadmap covering Pandas, NumPy, Matplotlib, and Scikit-learn.' },
    { title: 'Become a UI/UX Designer', description: 'Learn the principles of user-centered design and create beautiful interfaces.' },
    { title: 'Develop a Mobile Game with Unity', description: 'From C# basics to publishing your first game on app stores.' },
    { title: 'Contribute to an Open Source Project', description: 'A guide to using Git, finding a project, and making your first PR.' },
];

const ExamplesPage: React.FC<{ onSelectExample: (topic: string) => void }> = ({ onSelectExample }) => (
    <div className="w-full max-w-5xl mx-auto py-8">
        <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-indigo-400 mb-2">
                Example Roadmaps
            </h1>
            <p className="mt-4 text-lg text-slate-400">
                Click on any example to populate the form and generate a detailed learning plan.
            </p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exampleTopics.map(example => (
                <button
                    key={example.title}
                    onClick={() => onSelectExample(example.title)}
                    className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-left hover:bg-slate-800 hover:border-sky-500/50 transition-all duration-300 transform hover:-translate-y-1 group"
                    aria-label={`Select example: ${example.title}`}
                >
                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-sky-400 transition-colors">{example.title}</h3>
                    <p className="text-sm text-slate-400 mt-2">{example.description}</p>
                </button>
            ))}
        </div>
    </div>
);


const App: React.FC = () => {
    const [view, setView] = useState<'home' | 'examples' | 'resume' | 'profile'>('home');
    const [topic, setTopic] = useState<string>('');
    const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Professional'>('Beginner');
    const [timeline, setTimeline] = useState<string>('');
    const [roadmap, setRoadmap] = useState<RoadmapType | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [autoGenerate, setAutoGenerate] = useState(false);

    const [user, setUser] = useState<User | null>(null);
    const [modalView, setModalView] = useState<'signIn' | 'signUp' | null>(null);
    const [savedRoadmaps, setSavedRoadmaps] = useState<SavedRoadmap[]>([]);
    
    useEffect(() => {
        const checkUser = async () => {
            const session = await getSession();
            setUser(session?.user ?? null);
        };
        checkUser();

        const subscription = onAuthStateChange((session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    useEffect(() => {
        const fetchRoadmaps = async () => {
            if (user) {
                try {
                    const roadmaps = await getSavedRoadmaps();
                    setSavedRoadmaps(roadmaps);
                } catch (e: any) {
                    console.error("Failed to fetch saved roadmaps:", e.message);
                    setError("Could not load your saved roadmaps.");
                }
            } else {
                setSavedRoadmaps([]);
            }
        };
        fetchRoadmaps();
    }, [user]);

    const handleGenerateRoadmap = useCallback(async () => {
        if (!topic.trim()) {
            setError('Please enter a topic to generate a roadmap.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setRoadmap(null);

        try {
            const result = await generateRoadmap(topic, level, timeline);
            setRoadmap(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [topic, level, timeline]);
    
    useEffect(() => {
        if (autoGenerate && topic) {
            handleGenerateRoadmap();
            setAutoGenerate(false);
        }
    }, [autoGenerate, topic, handleGenerateRoadmap]);
    
    const handleSaveRoadmap = async () => {
        if (!roadmap || !user) return;

        const isAlreadySaved = savedRoadmaps.some(r => r.title === roadmap.title && r.description === roadmap.description);
        if (isAlreadySaved) return;

        try {
            const newSavedRoadmap = await saveRoadmap(roadmap);
            setSavedRoadmaps(prev => [...prev, newSavedRoadmap]);
        } catch (e: any) {
            setError("Failed to save roadmap. Please try again.");
            console.error(e.message);
        }
    };

    const handleDeleteRoadmap = async (roadmapId: string) => {
        const originalRoadmaps = [...savedRoadmaps];
        setSavedRoadmaps(prev => prev.filter(r => r.id !== roadmapId));
        try {
            await deleteRoadmap(roadmapId);
        } catch (e: any) {
            setSavedRoadmaps(originalRoadmaps);
            setError("Failed to delete roadmap. Please try again.");
        }
    };

    const handleUpdateRoadmap = async (updatedRoadmap: SavedRoadmap) => {
        const originalRoadmaps = [...savedRoadmaps];
        // Optimistic update
        setSavedRoadmaps(prev => prev.map(r => r.id === updatedRoadmap.id ? updatedRoadmap : r));
        
        try {
            await updateRoadmap(updatedRoadmap);
        } catch (e: any) {
            setSavedRoadmaps(originalRoadmaps); // Revert on failure
            setError("Failed to save changes to the roadmap.");
        }
    };
    const handleProgressToggle = async (roadmapId: string, stepIndex: number) => {
        const originalRoadmaps = [...savedRoadmaps];
        const roadmapToUpdate = savedRoadmaps.find(r => r.id === roadmapId);
        if (!roadmapToUpdate) return;
        
        const currentCompleted = roadmapToUpdate.completedSteps || [];
        const newCompletedSteps = currentCompleted.includes(stepIndex)
            ? currentCompleted.filter(i => i !== stepIndex)
            : [...currentCompleted, stepIndex];

        // Optimistic UI update for real-time feedback
        setSavedRoadmaps(prev => prev.map(r => 
            r.id === roadmapId ? { ...r, completedSteps: newCompletedSteps } : r
        ));

        try {
            await updateRoadmapProgress(roadmapId, newCompletedSteps);
        } catch (e: any) {
            // Revert UI on failure
            setSavedRoadmaps(originalRoadmaps);
            setError("Failed to update progress. Please try again.");
        }
    };

    const handleSelectExample = (selectedTopic: string) => {
        setTopic(selectedTopic);
        setView('home');
    };

    const handleProjectSelect = (projectTitle: string) => {
        setTopic(projectTitle);
        setLevel('Beginner');
        setTimeline('');
        setView('home');
        setAutoGenerate(true);
    };

    const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTopic(e.target.value);
        if (error) setError(null);
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleGenerateRoadmap();
        }
    };

    const handleAuthSuccess = () => {
        setModalView(null);
    };
    
    const handleSignOut = async () => {
        await signOutUser();
        setView('home');
    };

    const renderContent = () => {
        const isLoggedIn = !!user;
        const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0];
        switch (view) {
            case 'examples':
                return <ExamplesPage onSelectExample={handleSelectExample} />;
            case 'resume':
                return <ResumeAnalyzer onProjectSelect={handleProjectSelect} />;
            case 'profile':
                 return user ? (
                    <ProfilePage 
                        userName={userName} 
                        savedRoadmaps={savedRoadmaps} 
                        onProgressToggle={handleProgressToggle}
                        onDeleteRoadmap={handleDeleteRoadmap}
                        onUpdateRoadmap={handleUpdateRoadmap} // Pass down the new handler

                        />
                 ) : null;
            case 'home':
            default:
                const isCurrentRoadmapSaved = !!(roadmap && savedRoadmaps.some(r => r.title === roadmap.title && r.description === roadmap.description));
                return (
                    <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
                        <header className="w-full text-center pt-8 md:pt-12">
                            <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">
                                AI Roadmap Generator
                            </h1>
                            <p className="mt-4 text-lg text-slate-400">
                                Enter anything you want to learn or build, and let AI chart your course.
                            </p>
                        </header>

                        <main className="w-full flex-grow flex flex-col items-center">
                            <div className="w-full max-w-2xl p-4 bg-slate-900/50 backdrop-blur-md rounded-xl shadow-lg border border-slate-700/50 mt-8">
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="topic" className="block text-sm font-medium text-slate-300 mb-2">
                                            What do you want to learn or build?
                                        </label>
                                        <input
                                            id="topic"
                                            type="text"
                                            value={topic}
                                            onChange={handleTopicChange}
                                            onKeyPress={handleKeyPress}
                                            placeholder="e.g., 'Learn React Native' or 'Build a SaaS product'"
                                            className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-md py-3 px-4 focus:ring-2 focus:ring-sky-500 focus:outline-none transition duration-200"
                                            disabled={isLoading}
                                            aria-required="true"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="level" className="block text-sm font-medium text-slate-300 mb-2">Your Level</label>
                                            <div className="relative">
                                                <select
                                                    id="level"
                                                    value={level}
                                                    onChange={(e) => setLevel(e.target.value as 'Beginner' | 'Intermediate' | 'Professional')}
                                                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-md py-3 px-4 focus:ring-2 focus:ring-sky-500 focus:outline-none transition duration-200 appearance-none"
                                                    disabled={isLoading}
                                                >
                                                    <option>Beginner</option>
                                                    <option>Intermediate</option>
                                                    <option>Professional</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="timeline" className="block text-sm font-medium text-slate-300 mb-2">Timeline (Optional)</label>
                                            <input
                                                id="timeline"
                                                type="text"
                                                value={timeline}
                                                onChange={(e) => setTimeline(e.target.value)}
                                                placeholder="e.g., '3 months'"
                                                className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-md py-3 px-4 focus:ring-2 focus:ring-sky-500 focus:outline-none transition duration-200"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <button
                                            onClick={handleGenerateRoadmap}
                                            disabled={isLoading || !topic.trim()}
                                            className="w-full bg-sky-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Generating...
                                                </>
                                            ) : 'Generate Roadmap'}
                                        </button>
                                    </div>
                                </div>
                                {error && <p className="text-red-400 mt-3 text-center" role="alert">{error}</p>}
                            </div>

                            <div className="w-full mt-8">
                                {isLoading && <Loader />}
                                {roadmap && (
                                     <div>
                                        {isLoggedIn && (
                                            <div className="text-center mb-6">
                                                <button 
                                                    onClick={handleSaveRoadmap}
                                                    disabled={isCurrentRoadmapSaved}
                                                    className="bg-green-600 text-white font-semibold py-2 px-5 rounded-md hover:bg-green-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                                                >
                                                    {isCurrentRoadmapSaved ? 'Roadmap Saved' : 'Save Roadmap to Profile'}
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
    
    const isLoggedIn = !!user;
    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0];

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-sky-500 selection:text-white">
            <Navbar 
                currentView={view} 
                onNavigate={setView}
                isLoggedIn={isLoggedIn}
                userName={userName}
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

