import React, { useState, useEffect, useCallback } from 'react';
import XMarkIcon from './icons/XMarkIcon';

interface AuthModalProps {
    initialView: 'signIn' | 'signUp';
    onClose: () => void;
    onSignInSuccess: (name: string) => void;
    onSignUpSuccess: (name: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ initialView, onClose, onSignInSuccess, onSignUpSuccess }) => {
    const [view, setView] = useState(initialView);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };
    
    const handleEscKey = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleEscKey);
        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [handleEscKey]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (view === 'signUp') {
            if (!name || !email || !password) {
                setError('Please fill in all fields.');
                return;
            }
            // Simulate successful signup
            onSignUpSuccess(name);
        } else {
            if (!email || !password) {
                setError('Please fill in all fields.');
                return;
            }
            // Simulate successful signin
            // In a real app, you'd find the user by email
            onSignInSuccess(email.split('@')[0]); // Use part of email as name for demo
        }
    };
    
    const switchView = (newView: 'signIn' | 'signUp') => {
        setView(newView);
        setError('');
        setName('');
        setEmail('');
        setPassword('');
    }

    return (
        <div 
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
            onClick={handleOverlayClick}
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-slate-800 border border-slate-700/50 rounded-2xl shadow-xl w-full max-w-md p-8 relative animate-fadeInUp">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 transition-colors"
                    aria-label="Close authentication modal"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>
                
                <h2 className="text-2xl font-bold text-center text-slate-100 mb-2">
                    {view === 'signIn' ? 'Welcome Back' : 'Create an Account'}
                </h2>
                <p className="text-center text-slate-400 mb-6">
                    {view === 'signIn' ? 'Sign in to continue.' : 'Get started on your learning journey.'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {view === 'signUp' && (
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your Name"
                                className="w-full bg-slate-700 border border-slate-600 text-slate-200 placeholder-slate-500 rounded-md py-2 px-3 focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full bg-slate-700 border border-slate-600 text-slate-200 placeholder-slate-500 rounded-md py-2 px-3 focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-700 border border-slate-600 text-slate-200 placeholder-slate-500 rounded-md py-2 px-3 focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    
                    <button
                        type="submit"
                        className="w-full bg-sky-600 text-white font-semibold py-2.5 px-6 rounded-md hover:bg-sky-500 disabled:bg-slate-600 transition-all duration-200"
                    >
                        {view === 'signIn' ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <p className="text-sm text-slate-400">
                        {view === 'signIn' ? "Don't have an account? " : "Already have an account? "}
                        <button onClick={() => switchView(view === 'signIn' ? 'signUp' : 'signIn')} className="font-medium text-sky-400 hover:text-sky-300">
                            {view === 'signIn' ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;