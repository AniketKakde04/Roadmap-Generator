import React, { useState, useCallback, useEffect } from 'react';
import { generateRoadmap } from './services/geminiService';
import { Roadmap as RoadmapType, SavedRoadmap, User } from './types';
import Loader from './components/Loader';
import Roadmap from './components/Roadmap';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import ProfilePage from './components/ProfilePage';
import ResumeBuilderPage from './components/ResumeBuilderPage';
import { getSession, onAuthStateChange, signOutUser } from './services/authService';
// REMOVED 'setRoadmapPublicStatus' from this import
import { getSavedRoadmaps, saveRoadmap, deleteRoadmap, updateRoadmapProgress, updateRoadmap } from './services/roadmapService';


const App: React.FC = () => {
    // ... (state variables remain the same)
    const [view, setView] = useState<'home' | 'resume' | 'profile' | 'resumeBuilder'>('home');
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

        const { data: authListener } = onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
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
    
    // ... (handleGenerateRoadmap, handleSaveRoadmap, etc. remain the same)
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
    
    // REMOVED the handlePublishToggle function entirely

    const handleProjectSelect = (projectTitle: string) => {
        setTopic(projectTitle);
        setView('home');
        setAutoGenerate(true);
    };

    const handleAuthSuccess = () => {
        setModalView(null);
    };
    
    const handleSignOut = async () => {
        await signOutUser();
        setView('home');
    };

    const renderContent = () => {
        // ... (renderContent logic remains the same)
        const isLoggedIn = !!user;
        const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0];
        
        if (!isLoggedIn && (view === 'profile' || view === 'resumeBuilder')) {
            return (
                 <div className="text-center py-20 animate-fadeInUp">
                    <h2 className="text-2xl font-bold mb-4">Please sign in to continue</h2>
                    <p className="text-slate-400 mb-6">This feature requires an account.</p>
                    <button onClick={() => setModalView('signIn')} className="bg-sky-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-sky-500 transition-colors">
                        Sign In / Sign Up
                    </button>
                </div>
            )
        }


        switch (view) {
            case 'resume':
                return <ResumeAnalyzer onProjectSelect={handleProjectSelect} />;
            case 'profile':
                 return <ProfilePage 
                        userName={userName} 
                        savedRoadmaps={savedRoadmaps} 
                        onProgressToggle={handleProgressToggle}
                        onDeleteRoadmap={handleDeleteRoadmap}
                        onUpdateRoadmap={handleUpdateRoadmap}
                        // REMOVED the onPublishToggle prop
                    />;
            case 'resumeBuilder':
                return <ResumeBuilderPage />;
            case 'home':
            default:
                const isCurrentRoadmapSaved = !!(roadmap && savedRoadmaps.some(r => r.title === roadmap.title && r.description === roadmap.description));
                return (
                    <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
                         <header className="w-full text-center pt-8 md:pt-12">
                            <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">
                                Placement Preparation
                            </h1>
                            <p className="mt-4 text-lg text-slate-400">
                                Your AI-powered guide to career readiness.
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
                                            onChange={(e) => setTopic(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleGenerateRoadmap()}
                                            placeholder="e.g., 'Learn React Native' or 'Master System Design'"
                                            className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-md py-3 px-4 focus:ring-2 focus:ring-sky-500 focus:outline-none transition duration-200"
                                            disabled={isLoading}
                                            aria-required="true"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="level" className="block text-sm font-medium text-slate-300 mb-2">Your Level</label>
                                            <select
                                                id="level"
                                                value={level}
                                                onChange={(e) => setLevel(e.target.value as 'Beginner' | 'Intermediate' | 'Professional')}
                                                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-md py-3 px-4 focus:ring-2 focus:ring-sky-500 focus:outline-none transition duration-200"
                                                disabled={isLoading}
                                            >
                                                <option>Beginner</option>
                                                <option>Intermediate</option>
                                                <option>Professional</option>
                                            </select>
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
                                            className="w-full bg-sky-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200"
                                        >
                                            {isLoading ? 'Generating...' : 'Generate Roadmap'}
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
                                                    className="bg-green-600 text-white font-semibold py-2 px-5 rounded-md hover:bg-green-500 disabled:bg-slate-600"
                                                >
                                                     {isCurrentRoadmapSaved ? 'Saved' : 'Save Roadmap to Profile'}
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
                userName={user?.user_metadata?.full_name || user?.email?.split('@')[0]}
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

