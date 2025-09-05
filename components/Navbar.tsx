import React from 'react';
import GitHubIcon from './icons/GitHubIcon';

interface NavbarProps {
    currentView: string; // Changed to string to be more flexible
    onNavigate: (view: 'home' | 'roadmapGenerator' | 'resume' | 'profile' | 'resumeBuilder') => void;
    isLoggedIn: boolean;
    onSignInClick: () => void;
    onSignUpClick: () => void;
    onSignOut: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, isLoggedIn, onSignInClick, onSignUpClick, onSignOut }) => {
    const navLinkClasses = (view: string) =>
        `px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            currentView === view
            ? 'bg-slate-700 text-sky-400'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`;

    return (
        <nav className="bg-slate-900/70 backdrop-blur-md sticky top-0 z-20 border-b border-slate-800">
            <div className="w-full max-w-5xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <button onClick={() => onNavigate(isLoggedIn ? 'profile' : 'home')} className="flex items-center space-x-2 text-slate-100 hover:text-sky-400 transition-colors" aria-label="Go to Home page">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span className="font-bold text-xl">
                            Placement Prep
                        </span>
                    </button>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            {isLoggedIn && (
                                <button onClick={() => onNavigate('home')} className={navLinkClasses('home')}>
                                    Home
                                </button>
                            )}
                             <button onClick={() => onNavigate('roadmapGenerator')} className={navLinkClasses('roadmapGenerator')}>
                                Roadmap Generator
                            </button>
                            <button onClick={() => onNavigate('resume')} className={navLinkClasses('resume')}>
                                Resume Analyzer
                            </button>
                             <button onClick={() => onNavigate('resumeBuilder')} className={navLinkClasses('resumeBuilder')}>
                                Resume Builder
                            </button>
                        </div>

                        <div className="w-px h-6 bg-slate-700"></div>

                        {isLoggedIn ? (
                            <div className="flex items-center space-x-2">
                                <button onClick={() => onNavigate('profile')} className={navLinkClasses('profile')}>
                                    My Profile
                                </button>
                                <button onClick={onSignOut} className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <button onClick={onSignInClick} className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                                    Sign In
                                </button>
                                <button onClick={onSignUpClick} className="px-3 py-2 rounded-md text-sm font-medium bg-sky-600 text-white hover:bg-sky-500 transition-colors">
                                    Sign Up
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

