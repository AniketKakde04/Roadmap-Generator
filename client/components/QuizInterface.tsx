import React, { useState, useEffect } from 'react';
import { AptitudeTopic, AptitudeQuestion } from '../types';
import { getQuizQuestions, getStudyGuideForTopic } from '../services/aptitudeService'; 
import Loader from './Loader';
import QuizResults from './QuizResults';
import ReactMarkdown from 'react-markdown';
import BookOpenIcon from './icons/BookOpenIcon';
import XMarkIcon from './icons/XMarkIcon';

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
    const [questions, setQuestions] = useState<AptitudeQuestion[]>([]);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
    const [quizFinished, setQuizFinished] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    
    const [studyGuide, setStudyGuide] = useState<string | null>(null);
    const [isLoadingStudyGuide, setIsLoadingStudyGuide] = useState(true);

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

    if (isLoadingQuestions) return <Loader />;
    if (error) return <p className="text-error text-center">{error}</p>;
    if (quizFinished) {
        return <QuizResults questions={questions} userAnswers={selectedAnswers} onBack={onBack} />;
    }
    if (questions.length === 0) {
        return (
             <div className="text-center">
                <p className="text-text-secondary">Could not load questions for "{topic.name}".</p>
                <button onClick={onBack} className="mt-4 text-sm font-semibold text-primary hover:text-secondary">
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
    const progressPercent = ((currentQuestionIndex) / questions.length) * 100;

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

    return (
        <div className="w-full max-w-7xl mx-auto py-8 animate-fadeIn grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 md:px-8">
            
            {/* --- LEFT COLUMN (Study Guide) - 4 Cols (33%) --- */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24 h-fit order-2 lg:order-1">
                <div className="bg-background-secondary shadow-md border border-border rounded-xl overflow-hidden">
                    <div className="p-4 bg-background border-b border-border flex items-center space-x-3">
                        <BookOpenIcon className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-bold text-text-primary">Study Guide</h2>
                    </div>
                    <div className="p-5 max-h-[60vh] overflow-y-auto">
                        {isLoadingStudyGuide ? (
                            <p className="text-text-secondary italic text-sm">Loading...</p>
                        ) : (
                            <div 
                                className="prose prose-sm prose-slate text-text-secondary 
                                           prose-headings:text-text-primary prose-headings:font-bold
                                           prose-strong:text-text-primary
                                           prose-ul:list-disc prose-li:my-1
                                           prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:rounded"
                            >
                                <ReactMarkdown>
                                    {studyGuide || "No study guide available for this topic."}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* --- RIGHT COLUMN (Quiz Interface) - 8 Cols (66%) --- */}
            <main className="lg:col-span-8 order-1 lg:order-2">
                <div className="flex justify-between items-center mb-6">
                     <button onClick={onBack} className="text-sm font-semibold text-text-secondary hover:text-primary flex items-center transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Back
                    </button>
                    <span className="text-sm font-medium text-text-secondary bg-background-secondary px-3 py-1 rounded-full border border-border">
                        {topic.name}
                    </span>
                </div>
                
                {/* --- Progress Bar --- */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <h1 className="text-2xl font-bold text-text-primary">Question {currentQuestionIndex + 1} <span className="text-text-secondary text-lg font-normal">/ {questions.length}</span></h1>
                    </div>
                    <div className="w-full bg-background-accent rounded-full h-2 shadow-inner">
                        <div 
                            className="bg-primary h-2 rounded-full shadow-sm transition-all duration-300 ease-out" 
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                </div>

                {/* --- Quiz Box --- */}
                <div className="bg-background border border-border rounded-2xl p-6 md:p-10 shadow-lg">
                    <p className="text-xl md:text-2xl font-medium text-text-primary mb-8 leading-relaxed">
                        {currentQuestion.question_text}
                    </p>
                    
                    <div className="space-y-4">
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = selectedOption === index;
                            const isCorrectAnswer = index === currentQuestion.correct_answer_index;

                            let optionClass = "bg-background-secondary border-border hover:border-primary/50 hover:bg-background-hover cursor-pointer";
                            let letterClass = "bg-background-accent text-text-secondary group-hover:bg-primary group-hover:text-white";
                            let textClass = "text-text-primary";

                            if (showFeedback) {
                                if (isCorrectAnswer) {
                                    optionClass = "bg-success/10 border-success cursor-default";
                                    letterClass = "bg-success text-white";
                                    textClass = "text-success-dark font-medium";
                                } else if (isSelected && !isCorrectAnswer) {
                                    optionClass = "bg-error/10 border-error cursor-default";
                                    letterClass = "bg-error text-white";
                                    textClass = "text-error font-medium";
                                } else {
                                    optionClass = "bg-background-secondary/50 border-transparent opacity-50 cursor-default";
                                    letterClass = "bg-background-accent text-text-secondary opacity-50";
                                    textClass = "text-text-secondary opacity-50";
                                }
                            } else if (isSelected) {
                                optionClass = "bg-primary/5 border-primary shadow-md";
                                letterClass = "bg-primary text-white";
                                textClass = "text-primary font-medium";
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleOptionSelect(index)}
                                    disabled={showFeedback}
                                    className={`group w-full text-left p-4 md:p-5 rounded-xl border-2 transition-all duration-200 flex items-start md:items-center space-x-4 ${optionClass}`}
                                >
                                    <span 
                                        className={`flex-shrink-0 w-8 h-8 rounded-full font-bold text-sm flex items-center justify-center transition-all duration-200 mt-0.5 md:mt-0 ${letterClass}`}
                                    >
                                        {String.fromCharCode(65 + index)}
                                    </span>
                                    <span className={`text-base ${textClass}`}>{option}</span>
                                </button>
                            );
                        })}
                    </div>
                    
                    <div className="mt-10 pt-6 border-t border-border flex justify-end">
                        {!showFeedback ? (
                            <button
                                onClick={handleCheckAnswer}
                                disabled={selectedOption === null}
                                className="w-full md:w-auto bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-secondary transition-all shadow-lg shadow-primary/20 disabled:bg-background-accent disabled:text-text-secondary disabled:shadow-none disabled:cursor-not-allowed transform active:scale-95"
                            >
                                Check Answer
                            </button>
                        ) : (
                            <div className="w-full space-y-6 animate-fadeIn">
                                <div className={`p-5 rounded-xl border ${isCorrect ? 'bg-success/10 border-success' : 'bg-error/10 border-error'}`}>
                                    <div className="flex items-center space-x-3 mb-2">
                                        {isCorrect ? <CheckIcon className="w-6 h-6 text-success" /> : <XMarkIcon className="w-6 h-6 text-error" />}
                                        <h3 className={`text-lg font-bold ${isCorrect ? 'text-success' : 'text-error'}`}>
                                            {isCorrect ? 'Correct Answer!' : 'Incorrect Answer'}
                                        </h3>
                                    </div>
                                    <p className="text-text-secondary ml-9 leading-relaxed">{currentQuestion.explanation}</p>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleNextQuestion}
                                        className="w-full md:w-auto bg-text-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-text-secondary transition-all shadow-lg transform active:scale-95"
                                    >
                                        {currentQuestionIndex < questions.length - 1 ? 'Next Question →' : 'See Results'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default QuizInterface;