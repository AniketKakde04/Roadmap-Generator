
import React, { useState, useCallback } from 'react';
import { generateRoadmap } from './services/geminiService';
import { Roadmap as RoadmapType } from './types';
import Loader from './components/Loader';
import Roadmap from './components/Roadmap';

const App: React.FC = () => {
    const [topic, setTopic] = useState<string>('');
    const [roadmap, setRoadmap] = useState<RoadmapType | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateRoadmap = useCallback(async () => {
        if (!topic.trim()) {
            setError('Please enter a topic to generate a roadmap.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setRoadmap(null);

        try {
            const result = await generateRoadmap(topic);
            setRoadmap(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [topic]);

    const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTopic(e.target.value);
        if (error) setError(null);
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleGenerateRoadmap();
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col items-center p-4 selection:bg-sky-500 selection:text-white">
            <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
                <header className="w-full text-center py-8 md:py-12">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">
                        AI Roadmap Generator
                    </h1>
                    <p className="mt-4 text-lg text-slate-400">
                        Enter anything you want to learn or build, and let AI chart your course.
                    </p>
                </header>

                <main className="w-full flex-grow flex flex-col items-center">
                    <div className="w-full max-w-2xl p-4 sticky top-4 z-10 bg-slate-900/50 backdrop-blur-md rounded-xl">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                value={topic}
                                onChange={handleTopicChange}
                                onKeyPress={handleKeyPress}
                                placeholder="e.g., 'Learn React Native' or 'Build a SaaS product'"
                                className="flex-grow bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-md py-3 px-4 focus:ring-2 focus:ring-sky-500 focus:outline-none transition duration-200"
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleGenerateRoadmap}
                                disabled={isLoading || !topic.trim()}
                                className="bg-sky-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
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
                        {error && <p className="text-red-400 mt-3 text-center">{error}</p>}
                    </div>

                    <div className="w-full mt-8">
                        {isLoading && <Loader />}
                        {roadmap && <Roadmap roadmap={roadmap} />}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;
