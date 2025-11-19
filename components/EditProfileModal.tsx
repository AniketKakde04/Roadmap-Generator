import React, { useState, useEffect } from 'react';
import { AptitudeTopic } from '../types';
import { getAptitudeTopics } from '../services/aptitudeService';
import Loader from './Loader';
import QuizInterface from './QuizInterface';

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
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-2">
                    Aptitude Preparation
                </h1>
                <p className="mt-4 text-lg text-text-secondary">
                    Sharpen your skills with practice quizzes. Select a topic to begin.
                </p>
            </header>

            {isLoading && <Loader />}
            {error && <p className="text-error text-center bg-error/10 p-3 rounded-lg">{error}</p>}
            
            {!isLoading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topics.map(topic => (
                        <button
                            key={topic.id}
                            onClick={() => setSelectedTopic(topic)}
                            className="bg-background-secondary border border-border rounded-xl p-6 text-left hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 group shadow-sm hover:shadow-md"
                        >
                            <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">
                                {topic.name}
                            </h3>
                            <p className="text-sm text-text-secondary mt-2">{topic.category}</p>
                            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                                    Practice Now
                                </span>
                                <span className="text-text-secondary group-hover:translate-x-1 transition-transform">
                                    &rarr;
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AptitudeDashboard;