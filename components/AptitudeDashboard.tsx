import React, { useState, useEffect } from 'react';
import { AptitudeTopic } from '@/types'; // Corrected path
import { getAptitudeTopics } from '@/services/aptitudeService'; // Corrected path
import Loader from '@/components/Loader'; // Corrected path
import QuizInterface from '@/components/QuizInterface'; // Corrected path

const AptitudeDashboard: React.FC = () => {
    const [topics, setTopics] = useState<AptitudeTopic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<AptitudeTopic | null>(null);

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const data = await getAptitudeTopics();
                setTopics(data);
            } catch (err) {
                setError("Failed to load aptitude topics. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchTopics();
    }, []);

    // If a topic is selected, show the quiz interface
    if (selectedTopic) {
        return <QuizInterface topic={selectedTopic} onBack={() => setSelectedTopic(null)} />;
    }

    // Main dashboard view
    return (
        <div className="w-full max-w-5xl mx-auto py-8 animate-fadeIn">
            <header className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-indigo-400 mb-2">
                    Aptitude Preparation
                </h1>
                <p className="mt-4 text-lg text-slate-400">
                    Sharpen your skills with practice quizzes. Select a topic to begin.
                </p>
            </header>

            {isLoading && <Loader />}
            {error && <p className="text-red-400 text-center">{error}</p>}
            
            {!isLoading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topics.map(topic => (
                        <button
                            key={topic.id}
                            onClick={() => setSelectedTopic(topic)}
                            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-left hover:bg-slate-700 hover:border-sky-500/50 transition-all duration-300 transform hover:-translate-y-1 group"
                        >
                            <h3 className="text-lg font-bold text-slate-100 group-hover:text-sky-400 transition-colors">
                                {topic.name}
                            </h3>
                            <p className="text-sm text-slate-400 mt-2">{topic.category}</p>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AptitudeDashboard;

