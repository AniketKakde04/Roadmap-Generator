import React, { useState, useEffect } from 'react';
import { AptitudeTopic } from '../types';
import { getAptitudeTopics } from '../services/aptitudeService';
import Loader from './Loader';
import QuizInterface from './QuizInterface';
import BookOpenIcon from './icons/BookOpenIcon';
import LightBulbIcon from './icons/LightBulbIcon';

const AptitudeDashboard: React.FC = () => {
    const [topics, setTopics] = useState<AptitudeTopic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<AptitudeTopic | null>(null);
    const [dashboardTab, setDashboardTab] = useState<'notes' | 'quiz'>('notes');

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

    // If a topic is selected, open the notes interface (QuizInterface)
    if (selectedTopic) {
        return (
            <QuizInterface
                topic={selectedTopic}
                onBack={() => setSelectedTopic(null)}
            />
        );
    }

    // Main dashboard view
    return (
        <div className="w-full max-w-6xl mx-auto py-10 animate-fadeIn px-4 md:px-8">
            <header className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-4">
                    Aptitude Preparation
                </h1>
                <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                    Master quantitative aptitude and logical reasoning with our comprehensive study materials.
                </p>
            </header>

            {/* Dashboard Tabs */}
            <div className="flex justify-center mb-10">
                <div className="flex bg-background-secondary p-1.5 rounded-2xl border border-border shadow-sm">
                    <button
                        onClick={() => setDashboardTab('notes')}
                        className={`flex items-center px-8 py-3 rounded-xl text-base font-bold transition-all duration-300 ${dashboardTab === 'notes'
                            ? 'bg-background text-primary shadow-md transform scale-105'
                            : 'text-text-secondary hover:text-text-primary hover:bg-background/50'
                            }`}
                    >
                        <BookOpenIcon className={`w-5 h-5 mr-2 ${dashboardTab === 'notes' ? 'text-primary' : 'text-text-secondary group-hover:text-text-primary'}`} />
                        Notes
                    </button>
                    <button
                        disabled={true}
                        className={`flex items-center px-8 py-3 rounded-xl text-base font-bold transition-all duration-300 opacity-50 cursor-not-allowed text-text-secondary`}
                        title="Coming Soon"
                    >
                        <LightBulbIcon className="w-5 h-5 mr-2" />
                        Quiz (Soon)
                    </button>
                </div>
            </div>

            {isLoading && <Loader />}
            {error && <p className="text-error text-center bg-error/10 p-4 rounded-xl border border-error/20">{error}</p>}

            {!isLoading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topics.map(topic => (
                        <button
                            key={topic.id}
                            onClick={() => setSelectedTopic(topic)}
                            className="bg-background-secondary border border-border rounded-2xl p-6 text-left hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 group shadow-sm hover:shadow-lg flex flex-col h-full"
                        >
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors mb-2">
                                    {topic.name}
                                </h3>
                                <p className="text-sm text-text-secondary font-medium bg-background px-3 py-1 rounded-full w-fit mb-4 border border-border">
                                    {topic.category}
                                </p>
                            </div>

                            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                                <span className={`text-sm font-bold px-3 py-1.5 rounded-lg transition-colors bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white`}>
                                    View Notes
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