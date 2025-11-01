import React, { useState, useEffect } from 'react';
import { AptitudeTopic, AptitudeQuestion } from '../types'; // Corrected path
import { getQuizQuestions } from '../services/aptitudeService'; // Corrected path
import Loader from './Loader'; // Corrected path
import QuizResults from './QuizResults'; // Corrected path

interface QuizInterfaceProps {
    topic: AptitudeTopic;
    onBack: () => void;
}

const QUIZ_LENGTH = 5; // Let's start with 5 questions per quiz

const QuizInterface: React.FC<QuizInterfaceProps> = ({ topic, onBack }) => {
    const [questions, setQuestions] = useState<AptitudeQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({}); // { questionId: answerIndex }
    const [quizFinished, setQuizFinished] = useState(false);
    
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const data = await getQuizQuestions(topic.id, QUIZ_LENGTH);
                if (data.length === 0) {
                    setError("No questions found for this topic yet.");
                }
                setQuestions(data);
            } catch (err) {
                setError("Failed to load questions.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuestions();
    }, [topic.id]);

    if (isLoading) return <Loader />;
    if (error) return <p className="text-red-400 text-center">{error}</p>;
    if (questions.length === 0) return (
         <div className="text-center">
            <p className="text-slate-400">Could not find any questions for "{topic.name}".</p>
            <button onClick={onBack} className="mt-4 text-sm font-semibold text-sky-400 hover:text-sky-300">
                &larr; Back to topics
            </button>
        </div>
    );

    // Show results component when quiz is finished
    if (quizFinished) {
        return <QuizResults questions={questions} userAnswers={selectedAnswers} onBack={onBack} />;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.correct_answer_index;

    const handleOptionSelect = (index: number) => {
        if (showFeedback) return; // Don't allow changing answer after feedback
        setSelectedOption(index);
    };

    const handleCheckAnswer = () => {
        if (selectedOption === null) return;
        
        setSelectedAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: selectedOption
        }));
        setShowFeedback(true);
    };
    
    const handleNextQuestion = () => {
        setShowFeedback(false);
        setSelectedOption(null);
        
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Last question, finish the quiz
            setQuizFinished(true);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto py-8 animate-fadeIn">
            <button onClick={onBack} className="mb-6 text-sm font-semibold text-sky-400 hover:text-sky-300 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Back to topics
            </button>
            
            <h1 className="text-2xl font-bold text-slate-100 mb-2">Quiz: {topic.name}</h1>
            <p className="text-slate-400 mb-6">Question {currentQuestionIndex + 1} of {questions.length}</p>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                {/* Question Text */}
                <p className="text-lg text-slate-200 mb-6 min-h-[60px]">{currentQuestion.question_text}</p>
                
                {/* Options */}
                <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                        const isSelected = selectedOption === index;
                        let optionClass = "bg-slate-700/50 hover:bg-slate-700";
                        
                        if (showFeedback) {
                            if (index === currentQuestion.correct_answer_index) {
                                optionClass = "bg-green-500/30 border-green-500"; // Correct answer
                            } else if (isSelected && !isCorrect) {
                                optionClass = "bg-red-500/30 border-red-500"; // Incorrectly selected
                            } else {
                                optionClass = "bg-slate-700/50 opacity-60"; // Not selected
                            }
                        } else if (isSelected) {
                            optionClass = "bg-sky-600/50 border-sky-500"; // Currently selected
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleOptionSelect(index)}
                                disabled={showFeedback}
                                className={`w-full text-left p-4 rounded-lg border border-slate-600 transition-all ${optionClass} ${!showFeedback ? 'cursor-pointer' : 'cursor-default'}`}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
                
                {/* Feedback and Navigation */}
                <div className="mt-8">
                    {!showFeedback && (
                        <button
                            onClick={handleCheckAnswer}
                            disabled={selectedOption === null}
                            className="w-full bg-sky-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed"
                        >
                            Check Answer
                        </button>
                    )}
                    
                    {showFeedback && (
                        <div className="animate-fadeIn space-y-4">
                             <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                                <h3 className="text-lg font-bold">
                                    {isCorrect ? 'Correct!' : 'Incorrect'}
                                </h3>
                                <p className="text-slate-300 mt-2">{currentQuestion.explanation}</p>
                            </div>
                            <button
                                onClick={handleNextQuestion}
                                className="w-full bg-slate-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-slate-500"
                            >
                                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizInterface;

