
import React, { useState, useCallback, useEffect } from 'react';
import { generateRoadmap } from './services/geminiService';
import { Roadmap as RoadmapType, SavedRoadmap } from './types';
import Loader from './components/Loader';
import Roadmap from './components/Roadmap';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import ProfilePage from './components/ProfilePage';

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

    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [user, setUser] = useState<{ name: string } | null>(null);
    const [modalView, setModalView] = useState<'signIn' | 'signUp' | null>(null);
    const [savedRoadmaps, setSavedRoadmaps] = useState<SavedRoadmap[]>([]);
    
    // Load saved roadmaps from local storage on login
    useEffect(() => {
        if (isLoggedIn && user) {
            try {
                const storedData = localStorage.getItem(`roadmaps_${user.name}`);
                if (storedData) {
                    setSavedRoadmaps(JSON.parse(storedData));
                }
            } catch (e) {
                console.error("Failed to parse saved roadmaps from localStorage", e);
                setSavedRoadmaps([]);
            }
        } else {
            // Clear saved roadmaps on logout
            setSavedRoadmaps([]);
        }
    }, [isLoggedIn, user]);

    // Function to save roadmaps to state and local storage
    const updateSavedRoadmaps = (newRoadmaps: SavedRoadmap[]) => {
        setSavedRoadmaps(newRoadmaps);
        if (user) {
            localStorage.setItem(`roadmaps_${user.name}`, JSON.stringify(newRoadmaps));
        }
    };

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
    
    const handleSaveRoadmap = () => {
        if (!roadmap || !user) return;

        const isAlreadySaved = savedRoadmaps.some(r => r.title === roadmap.title && r.description === roadmap.description);
        if (isAlreadySaved) {
            return; // Already saved, button should be disabled
        }

        const newSavedRoadmap: SavedRoadmap = {
            ...roadmap,
            id: new Date().toISOString(),
            savedAt: new Date().toISOString(),
            completedSteps: [],
        };
        updateSavedRoadmaps([...savedRoadmaps, newSavedRoadmap]);
    };

    const handleDeleteRoadmap = (roadmapId: string) => {
        const newRoadmaps = savedRoadmaps.filter(r => r.id !== roadmapId);
        updateSavedRoadmaps(newRoadmaps);
    };

    const handleProgressToggle = (roadmapId: string, stepIndex: number) => {
        const newRoadmaps = savedRoadmaps.map(r => {
            if (r.id === roadmapId) {
                const completedSteps = r.completedSteps.includes(stepIndex)
                    ? r.completedSteps.filter(i => i !== stepIndex)
                    : [...r.completedSteps, stepIndex];
                return { ...r, completedSteps };
            }
            return r;
        });
        updateSavedRoadmaps(newRoadmaps);
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

    const handleSignIn = (name: string) => {
        setUser({ name });
        setIsLoggedIn(true);
        setModalView(null);
    };
    
    const handleSignUp = (name: string) => {
        setUser({ name });
        setIsLoggedIn(true);
        setModalView(null);
    };
    
    const handleSignOut = () => {
        setUser(null);
        setIsLoggedIn(false);
        setView('home'); // Go to home on sign out
    };

    const renderContent = () => {
        switch (view) {
            case 'examples':
                return <ExamplesPage onSelectExample={handleSelectExample} />;
            case 'resume':
                return <ResumeAnalyzer onProjectSelect={handleProjectSelect} />;
            case 'profile':
                 return user ? (
                    <ProfilePage 
                        userName={user.name} 
                        savedRoadmaps={savedRoadmaps} 
                        onProgressToggle={handleProgressToggle}
                        onDeleteRoadmap={handleDeleteRoadmap}
                    />
                 ) : null;
            case 'home':
            default:
                const isCurrentRoadmapSaved = roadmap && savedRoadmaps.some(r => r.title === roadmap.title && r.description === roadmap.description);
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
                                                    disabled={!!isCurrentRoadmapSaved}
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

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-sky-500 selection:text-white">
            <Navbar 
                currentView={view} 
                onNavigate={setView}
                isLoggedIn={isLoggedIn}
                userName={user?.name}
                onSignInClick={() => setModalView('signIn')}
                onSignUpClick={() => setModalView('signUp')}
                onSignOut={handleSignOut}
            />
            {modalView && (
                <AuthModal
                    initialView={modalView}
                    onClose={() => setModalView(null)}
                    onSignInSuccess={handleSignIn}
                    onSignUpSuccess={handleSignUp}
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
