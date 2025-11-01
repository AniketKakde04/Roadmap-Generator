import React, { useState, useCallback, useEffect } from 'react';
import { generateRoadmap } from './services/geminiService';
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
import AptitudeDashboard from './components/AptitudeDashboard'; // --- IMPORT NEW COMPONENT ---


const App: React.FC = () => {
    const [view, setView] = useState<'home' | 'roadmapGenerator' | 'resume' | 'profile' | 'resumeBuilder'>('home');
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
            setView('roadmapGenerator');
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
        setView('profile'); // Go to profile after successful sign-in/up
    };
    
    const handleSignOut = async () => {
        await signOutUser();
        setView('home');
    };

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
            case 'roadmapGenerator':
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
                                            Topic
                                        </label>
                                        <input
                                            id="topic"
                                            type="text"
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleGenerateRoadmap()}
                                            placeholder="e.g., 'Learn React Native' or 'Master System Design'"
                                            className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-md py-3 px-4"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="level" className="block text-sm font-medium text-slate-300 mb-2">Level</label>
                                            <select
                                                id="level"
                                                value={level}
                                                onChange={(e) => setLevel(e.target.value as 'Beginner' | 'Intermediate' | 'Professional')}
                                                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-md py-3 px-4"
                                                disabled={isLoading}
                                            >
                                                <option>Beginner</option>
                                                <option>Intermediate</option>
                                                <option>Professional</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="timeline" className="block text-sm font-medium text-slate-300 mb-2">Timeline</label>
                                            <input
                                                id="timeline"
                                                type="text"
                                                value={timeline}
                                                onChange={(e) => setTimeline(e.target.value)}
                                                placeholder="e.g., '3 months'"
                                                className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-md py-3 px-4"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleGenerateRoadmap}
                                        disabled={isLoading || !topic.trim()}
                                        className="w-full bg-sky-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-sky-500"
                                    >
                                        {isLoading ? 'Generating...' : 'Generate Roadmap'}
                                    </button>
                                </div>
                                {error && <p className="text-red-400 mt-3 text-center">{error}</p>}
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

