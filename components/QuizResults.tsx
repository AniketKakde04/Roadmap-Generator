import React from 'react';
import { AptitudeQuestion } from '../types';

interface QuizResultsProps {
    questions: AptitudeQuestion[];
    userAnswers: Record<string, number>; // { questionId: answerIndex }
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
            <button onClick={onBack} className="mb-6 text-sm font-semibold text-sky-400 hover:text-sky-300 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Back to topics
            </button>

            <header className="text-center mb-8 p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                <h1 className="text-3xl font-bold text-white">Quiz Complete!</h1>
                <p className="text-lg text-slate-400 mt-2">You scored:</p>
                <div className="text-6xl font-extrabold text-sky-400 my-4">
                    {score} / {questions.length}
                </div>
                <p className="text-2xl font-bold text-white">({percentage}%)</p>
            </header>

            <div>
                <h2 className="text-2xl font-bold text-slate-100 mb-6">Review Your Answers</h2>
                <div className="space-y-6">
                    {questions.map((question, index) => {
                        const userAnswerIndex = userAnswers[question.id];
                        const isCorrect = userAnswerIndex === question.correct_answer_index;

                        return (
                            <div key={question.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                                <p className="text-md text-slate-300 mb-4">
                                    <span className="font-bold">Question {index + 1}:</span> {question.question_text}
                                </p>
                                <div className="space-y-2">
                                    <p className="text-sm">
                                        <span className="font-semibold text-slate-400">Your Answer: </span>
                                        <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>
                                            {question.options[userAnswerIndex] ?? 'Not Answered'}
                                        </span>
                                    </p>
                                    {!isCorrect && (
                                        <p className="text-sm">
                                            <span className="font-semibold text-slate-400">Correct Answer: </span>
                                            <span className="text-green-400">
                                                {question.options[question.correct_answer_index]}
                                            </span>
                                        </p>
                                    )}
                                    <p className="text-sm text-slate-400 pt-3 border-t border-slate-700/50">
                                        <span className="font-semibold">Explanation: </span>
                                        {question.explanation}
                                    </p>
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
