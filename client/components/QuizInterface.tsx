import React, { useState, useEffect, useMemo } from 'react';
import { AptitudeTopic, AptitudeQuestion } from '../types';
import { getQuizQuestions, getStudyGuideForTopic } from '../services/aptitudeService';
import Loader from './Loader';
import QuizResults from './QuizResults';
import ReactMarkdown from 'react-markdown';
import BookOpenIcon from './icons/BookOpenIcon';
import XMarkIcon from './icons/XMarkIcon';
import { motion, AnimatePresence } from 'framer-motion';

const CheckIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

interface QuizInterfaceProps {
    topic: AptitudeTopic;
    onBack: () => void;
    defaultTab?: 'notes' | 'quiz';
}

const QUIZ_LENGTH = 10;

interface NoteCard {
    title: string;
    content: string;
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ topic, onBack }) => {
    // --- Notes State ---
    const [studyGuide, setStudyGuide] = useState<string | null>(null);
    const [isLoadingStudyGuide, setIsLoadingStudyGuide] = useState(true);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);

    // --- Fetch Study Guide ---
    useEffect(() => {
        const fetchStudyGuide = async () => {
            setIsLoadingStudyGuide(true);
            try {
                const guideText = await getStudyGuideForTopic(topic);
                setStudyGuide(guideText);
            } catch (err) {
                setStudyGuide("Failed to load study guide.");
            } finally {
                setIsLoadingStudyGuide(false);
            }
        };
        fetchStudyGuide();
    }, [topic]);

    // --- Parse Study Guide into Cards ---
    const noteCards: NoteCard[] = useMemo(() => {
        if (!studyGuide) return [];
        // Split by H2 headers (## )
        const rawSections = studyGuide.split(/\n(?=## )/g); // positive lookahead to keep delimiter

        return rawSections.map(section => {
            const lines = section.trim().split('\n');
            let title = "Introduction";
            let content = section;

            if (lines[0].startsWith('## ')) {
                title = lines[0].replace('## ', '').trim();
                content = lines.slice(1).join('\n').trim();
            } else if (lines[0].startsWith('# ')) {
                title = lines[0].replace('# ', '').trim();
                content = lines.slice(1).join('\n').trim();
            }

            return { title, content };
        }).filter(card => card.content.length > 0);
    }, [studyGuide]);


    // --- Handlers: Notes ---
    const handleNextCard = () => {
        if (currentCardIndex < noteCards.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
        }
    };

    const handlePrevCard = () => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(prev => prev - 1);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto py-8 animate-fadeIn px-4 md:px-8 min-h-screen flex flex-col">

            {/* --- Header --- */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <button onClick={onBack} className="text-sm font-semibold text-text-secondary hover:text-primary flex items-center transition-colors self-start md:self-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Back to Topics
                </button>
            </div>

            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent text-center mb-8">
                {topic.name}
            </h1>

            {/* --- NOTES CONTENT --- */}
            <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full">
                {isLoadingStudyGuide ? (
                    <div className="flex flex-col items-center">
                        <Loader />
                        <p className="mt-4 text-text-secondary animate-pulse">Loading study material...</p>
                    </div>
                ) : noteCards.length > 0 ? (
                    <div className="w-full">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentCardIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="bg-background border border-border rounded-2xl p-8 shadow-lg min-h-[400px] flex flex-col"
                            >
                                <div className="flex items-center space-x-3 mb-6 border-b border-border pb-4">
                                    <BookOpenIcon className="w-6 h-6 text-primary" />
                                    <h2 className="text-xl font-bold text-text-primary">{noteCards[currentCardIndex].title}</h2>
                                </div>

                                <div className="flex-1 overflow-y-auto px-2">
                                    <ReactMarkdown
                                        components={{
                                            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-primary mb-4" {...props} />,
                                            h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-text-primary mb-3 mt-6 border-b border-border pb-2" {...props} />,
                                            h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-text-primary mb-2 mt-4" {...props} />,
                                            p: ({ node, ...props }) => <p className="text-text-secondary mb-4 leading-relaxed" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-2 mb-4 text-text-secondary" {...props} />,
                                            ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-2 mb-4 text-text-secondary" {...props} />,
                                            li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                            strong: ({ node, ...props }) => <strong className="font-bold text-text-primary" {...props} />,
                                            blockquote: ({ node, ...props }) => (
                                                <div className="bg-accent/10 border-l-4 border-accent p-4 rounded-r-lg my-6 text-text-secondary italic">
                                                    {props.children}
                                                </div>
                                            ),
                                            code: ({ node, ...props }) => (
                                                <code className="bg-background-secondary px-1.5 py-0.5 rounded text-primary font-mono text-sm border border-border" {...props} />
                                            ),
                                        }}
                                    >
                                        {noteCards[currentCardIndex].content}
                                    </ReactMarkdown>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Controls */}
                        <div className="flex justify-between items-center mt-6">
                            <button
                                onClick={handlePrevCard}
                                disabled={currentCardIndex === 0}
                                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors
                                             disabled:opacity-30 disabled:cursor-not-allowed
                                             text-text-secondary hover:bg-background-secondary hover:text-text-primary border border-transparent hover:border-border"
                            >
                                &larr; Previous
                            </button>

                            <span className="text-sm font-medium text-text-secondary">
                                {currentCardIndex + 1} / {noteCards.length}
                            </span>

                            <button
                                onClick={handleNextCard}
                                disabled={currentCardIndex === noteCards.length - 1}
                                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors
                                             disabled:opacity-30 disabled:cursor-not-allowed
                                             text-text-secondary hover:bg-background-secondary hover:text-text-primary border border-transparent hover:border-border"
                            >
                                Next &rarr;
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-12 border border-dashed border-border rounded-xl">
                        <p className="text-text-secondary">No notes available for this topic.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizInterface;
