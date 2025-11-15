import React, { useState, useEffect } from 'react';
import { AptitudeTopic, AptitudeQuestion } from '../types';
import { getQuizQuestions, getStudyGuideForTopic } from '../services/aptitudeService'; 
import Loader from './Loader';
import QuizResults from './QuizResults';
import ReactMarkdown from 'react-markdown';
// --- Import icons we'll use ---
import BookOpenIcon from './icons/BookOpenIcon';
import XMarkIcon from './icons/XMarkIcon';

// --- Inline SVG for a Checkmark icon ---
const CheckIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

interface QuizInterfaceProps {
    topic: AptitudeTopic;
    onBack: () => void;
}

const QUIZ_LENGTH = 10;

const QuizInterface: React.FC<QuizInterfaceProps> = ({ topic, onBack }) => {
    // --- Quiz State ---
    const [questions, setQuestions] = useState<AptitudeQuestion[]>([]);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
    const [quizFinished, setQuizFinished] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    
    // --- NEW: Study Guide State ---
    const [studyGuide, setStudyGuide] = useState<string | null>(null);
    const [isLoadingStudyGuide, setIsLoadingStudyGuide] = useState(true);

    // --- Effect for fetching Questions ---
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const data = await getQuizQuestions(topic, QUIZ_LENGTH);
                if (data.length === 0) {
                    setError("No questions found for this topic yet.");
                }
                setQuestions(data.filter(q => q));
            } catch (err) {
                setError("Failed to load questions.");
            } finally {
                setIsLoadingQuestions(false);
            }
        };
        fetchQuestions();
    }, [topic]);

    // --- NEW: Effect for fetching Study Guide ---
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

    // --- Loading & Error States ---
    if (isLoadingQuestions) return <Loader />;
    if (error) return <p className="text-red-400 text-center">{error}</p>;
    if (quizFinished) {
        return <QuizResults questions={questions} userAnswers={selectedAnswers} onBack={onBack} />;
    }
    if (questions.length === 0) {
        return (
             <div className="text-center">
                <p className="text-slate-400">Could not load questions for "{topic.name}".</p>
                <button onClick={onBack} className="mt-4 text-sm font-semibold text-sky-400 hover:text-sky-300">
                    &larr; Back to topics
                </button>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) {
        setQuizFinished(true);
        return <QuizResults questions={questions} userAnswers={selectedAnswers} onBack={onBack} />;
    }

    const isCorrect = selectedOption === currentQuestion.correct_answer_index;
    
    // --- NEW: Progress bar calculation ---
    const progressPercent = ((currentQuestionIndex) / questions.length) * 100;

    // --- Event Handlers (No changes) ---
    const handleOptionSelect = (index: number) => {
        if (showFeedback) return;
        setSelectedOption(index);
    };

    const handleCheckAnswer = () => {
        if (selectedOption === null) return;
        setSelectedAnswers(prev => ({ ...prev, [currentQuestion.id]: selectedOption }));
        setShowFeedback(true);
    };
    
    const handleNextQuestion = () => {
        setShowFeedback(false);
        setSelectedOption(null);
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setQuizFinished(true);
        }
    };

    // --- UPDATED: Render Logic with 50/50 Layout ---
    return (
        <div className="w-full max-w-7xl mx-auto py-8 animate-fadeIn grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* --- LEFT COLUMN (Study Guide) --- */}
            <aside className="lg:col-span-1 lg:sticky lg:top-24 h-fit">
                <div className="bg-slate-800 shadow-lg border border-slate-700/50 rounded-xl overflow-hidden">
                    <div className="p-5 bg-slate-800/50 border-b border-slate-700/50 flex items-center space-x-3">
                        <BookOpenIcon className="w-6 h-6 text-sky-400" />
                        <h2 className="text-xl font-bold text-slate-100">Study Guide: {topic.name}</h2>
                    </div>
                    {/* UPDATED: Taller max-height */}
                    <div className="p-5 max-h-[calc(100vh-16rem)] overflow-y-auto">
                        {isLoadingStudyGuide ? (
                            <p className="text-slate-400 italic">Loading formulas...</p>
                        ) : (
                            <div 
                                // UPDATED: Changed prose-sm to prose for larger text
                                className="prose prose-invert text-slate-300 
                                           prose-headings:text-slate-100 prose-strong:text-slate-100
                                           prose-ul:list-disc prose-li:my-1
                                           prose-code:text-amber-400"
                            >
                                <ReactMarkdown>
                                    {studyGuide || "No study guide available for this topic."}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* --- RIGHT COLUMN (Quiz Interface) --- */}
            {/* UPDATED: Changed lg:col-span-2 to lg:col-span-1 */}
            <main className="lg:col-span-1">
                <button onClick={onBack} className="mb-4 text-sm font-semibold text-sky-400 hover:text-sky-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                    Back to topics
                </button>
                
                {/* --- (Progress Bar remains the same) --- */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <h1 className="text-2xl font-bold text-slate-100">Quiz: {topic.name}</h1>
                        <p className="text-slate-400 font-medium">Question {currentQuestionIndex + 1} of {questions.length}</p>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5 shadow-inner">
                        <div 
                            className="bg-sky-500 h-2.5 rounded-full shadow-lg transition-all duration-300 ease-out" 
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                </div>

                {/* --- (Quiz Box remains the same) --- */}
                <div className="bg-slate-800 shadow-2xl border border-slate-700/50 rounded-xl p-6 md:p-8">
                    <p className="text-xl font-semibold text-slate-100 mb-8 min-h-[60px]">{currentQuestion.question_text}</p>
                    
                    <div className="space-y-4">
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = selectedOption === index;
                            const isCorrectAnswer = index === currentQuestion.correct_answer_index;

                            // Determine styles
                            let optionClass = "bg-slate-700/50 border-slate-700 hover:bg-slate-700 hover:border-sky-500";
                            let letterClass = "bg-slate-600 group-hover:bg-sky-500 group-hover:text-white";

                            if (showFeedback) {
                                if (isCorrectAnswer) {
                                    optionClass = "bg-green-500/20 border-green-500";
                                    letterClass = "bg-green-500 text-white";
                                } else if (isSelected && !isCorrectAnswer) {
                                    optionClass = "bg-red-500/20 border-red-500";
                                    letterClass = "bg-red-500 text-white";
                                } else {
                                    optionClass = "bg-slate-700/30 border-slate-700 opacity-60";
                                    letterClass = "bg-slate-600 opacity-60";
                                }
                            } else if (isSelected) {
                                optionClass = "bg-sky-500/20 border-sky-500";
                                letterClass = "bg-sky-500 text-white";
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleOptionSelect(index)}
                                    disabled={showFeedback}
                                    className={`group w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center space-x-4 ${optionClass} ${!showFeedback ? 'cursor-pointer' : 'cursor-default'}`}
                                >
                                    <span 
                                        className={`flex-shrink-0 w-8 h-8 rounded-full font-bold text-sm flex items-center justify-center transition-all duration-200 ${letterClass}`}
                                    >
                                        {String.fromCharCode(65 + index)}
                                    </span>
                                    <span className="text-slate-200 font-medium">{option}</span>
                                </button>
                            );
                        })}
                    </div>
                    
                    <div className="mt-8">
                        {!showFeedback && (
                            <button
                                onClick={handleCheckAnswer}
                                disabled={selectedOption === null}
                                className="w-full bg-sky-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-sky-500 transition-all shadow-lg shadow-sky-600/30 disabled:bg-slate-600 disabled:shadow-none disabled:cursor-not-allowed"
                            >
                                Check Answer
                            </button>
                        )}
                        
                        {showFeedback && (
                            <div className="animate-fadeIn space-y-6">
                                <div className={`p-5 rounded-lg ${isCorrect ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'}`}>
                                    <div className="flex items-center space-x-3">
                                        {isCorrect ? <CheckIcon className="w-6 h-6 text-green-400" /> : <XMarkIcon className="w-6 h-6 text-red-400" />}
                                        <h3 className="text-xl font-bold">
                                            {isCorrect ? 'Correct!' : 'Incorrect'}
                                        </h3>
                                    </div>
                                    <p className="text-slate-300 mt-3 pl-9">{currentQuestion.explanation}</p>
                                </div>
                                <button
                                    onClick={handleNextQuestion}
                                    className="w-full bg-slate-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-slate-500 transition-all"
                                >
                                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default QuizInterface;