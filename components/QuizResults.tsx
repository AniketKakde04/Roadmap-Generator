import React from 'react';
import { AptitudeQuestion } from '../types';

interface QuizResultsProps {
    questions: AptitudeQuestion[];
    userAnswers: Record<string, number>; 
    onBack: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({ questions, userAnswers, onBack }) => {
    let score = 0;
    questions.forEach(q => {
        if (userAnswers[q.id] === q.correct_answer_index) {
            score++;
        }
    });

    const percentage = Math.round((score / questions.length) * 100);

    return (
        <div className="w-full max-w-3xl mx-auto py-8 animate-fadeIn">
            <button onClick={onBack} className="mb-6 text-sm font-semibold text-primary hover:text-secondary flex items-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Back to topics
            </button>

            <header className="text-center mb-8 p-8 bg-background-secondary border border-border rounded-xl shadow-md">
                <h1 className="text-3xl font-bold text-text-primary">Quiz Complete!</h1>
                <p className="text-lg text-text-secondary mt-2">You scored:</p>
                <div className="text-6xl font-extrabold text-primary my-4 drop-shadow-sm">
                    {score} <span className="text-3xl text-text-secondary font-normal">/ {questions.length}</span>
                </div>
                <p className={`text-2xl font-bold ${percentage >= 70 ? 'text-success' : 'text-warning'}`}>
                    {percentage}% 
                    <span className="text-base font-normal text-text-secondary ml-2">
                        {percentage >= 70 ? 'Great Job!' : 'Keep Practicing!'}
                    </span>
                </p>
            </header>

            <div>
                <h2 className="text-2xl font-bold text-text-primary mb-6">Review Your Answers</h2>
                <div className="space-y-6">
                    {questions.map((question, index) => {
                        const userAnswerIndex = userAnswers[question.id];
                        const isCorrect = userAnswerIndex === question.correct_answer_index;

                        return (
                            <div key={question.id} className="bg-background border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <p className="text-lg text-text-primary mb-4 font-medium">
                                    <span className="text-text-secondary mr-2">{index + 1}.</span> {question.question_text}
                                </p>
                                <div className="space-y-3 pl-4 border-l-2 border-border">
                                    <p className="text-sm">
                                        <span className="font-semibold text-text-secondary">Your Answer: </span>
                                        <span className={`font-medium ${isCorrect ? 'text-success' : 'text-error'}`}>
                                            {question.options[userAnswerIndex] ?? 'Not Answered'}
                                        </span>
                                    </p>
                                    {!isCorrect && (
                                        <p className="text-sm">
                                            <span className="font-semibold text-text-secondary">Correct Answer: </span>
                                            <span className="text-success font-medium">
                                                {question.options[question.correct_answer_index]}
                                            </span>
                                        </p>
                                    )}
                                    <div className="mt-3 pt-3 border-t border-border">
                                        <p className="text-sm text-text-secondary">
                                            <span className="font-semibold block mb-1 text-primary">Explanation: </span>
                                            {question.explanation}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default QuizResults;