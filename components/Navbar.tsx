import React, { useState } from 'react';
import GitHubIcon from './icons/GitHubIcon'; // Assuming you have this icon for the brand

type View = 'home' | 'roadmapGenerator' | 'resume' | 'profile' | 'resumeBuilder' | 'aptitude' | 'mockInterview';

interface NavbarProps {
    currentView: View;
    onNavigate: (view: View) => void;
    isLoggedIn: boolean;
    onSignInClick: () => void;
    onSignUpClick: () => void;
    onSignOut: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
    currentView, onNavigate, isLoggedIn, onSignInClick, onSignUpClick, onSignOut 
}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const NavLink: React.FC<{ view: View; children: React.ReactNode }> = ({ view, children }) => {
        const isActive = currentView === view;
        return (
            <li>
                <button
                    onClick={() => {
                        onNavigate(view);
                        setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                        isActive
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    } md:w-auto md:text-center`}
                >
                    {children}
                </button>
            </li>
        );
    };

    return (
        <nav className="bg-slate-800/90 backdrop-blur-md shadow-md border-b border-slate-700/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand Logo and Name */}
                    <div className="flex-shrink-0 flex items-center">
                        <button onClick={() => onNavigate('home')} className="flex items-center space-x-2">
                             <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
                            <span className="text-white text-xl font-bold tracking-tight">AI-CoPilot</span>
                        </button>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:block">
                        <ul className="ml-10 flex items-center space-x-4">
                            <NavLink view="home">Home</NavLink>
                            <NavLink view="roadmapGenerator">Roadmap Generator</NavLink>
                            <NavLink view="resume">Resume Analyzer</NavLink>
                            {isLoggedIn && (
                                <>
                                    <NavLink view="resumeBuilder">Resume Builder</NavLink>
                                    <NavLink view="aptitude">Aptitude Prep</NavLink>
                                    {/* --- NEW: Mock Interview Link --- */}
                                    <NavLink view="mockInterview">Mock Interview</NavLink> 
                                    <NavLink view="profile">My Profile</NavLink>
                                </>
                            )}
                        </ul>
                    </div>

                    {/* Auth Buttons (Desktop) */}
                    <div className="hidden md:flex items-center space-x-3">
                        {isLoggedIn ? (
                            <button
                                onClick={onSignOut}
                                className="text-slate-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Sign Out
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={onSignInClick}
                                    className="text-slate-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={onSignUpClick}
                                    className="bg-sky-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-sky-500"
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                         <a href="https://github.com/aniketkakde04/Roadmap-Generator" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white">
                            <GitHubIcon className="w-6 h-6" />
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            type="button"
                            className="bg-slate-800 inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white"
                            aria-controls="mobile-menu"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {!isMobileMenuOpen ? (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`} id="mobile-menu">
                <ul className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    <NavLink view="home">Home</NavLink>
                    <NavLink view="roadmapGenerator">Roadmap Generator</NavLink>
                    <NavLink view="resume">Resume Analyzer</NavLink>
                    {isLoggedIn && (
                        <>
                            <NavLink view="resumeBuilder">Resume Builder</NavLink>
                            <NavLink view="aptitude">Aptitude Prep</NavLink>
                            {/* --- NEW: Mock Interview Link (Mobile) --- */}
                            <NavLink view="mockInterview">Mock Interview</NavLink>
                            <NavLink view="profile">My Profile</NavLink>
                        </>
                    )}
                </ul>
                <div className="pt-4 pb-3 border-t border-slate-700">
                    <div className="px-5 flex items-center space-x-4">
                        {isLoggedIn ? (
                            <button
                                onClick={() => {
                                    onSignOut();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="w-full text-left block text-slate-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-base font-medium"
                            >
                                Sign Out
                            </button>
                        ) : (
                            <div className="flex flex-col w-full space-y-2">
                                <button
                                    onClick={() => {
                                        onSignInClick();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full text-left block text-slate-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-base font-medium"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => {
                                        onSignUpClick();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full text-left bg-sky-600 text-white px-3 py-2 rounded-md text-base font-medium hover:bg-sky-500"
                                >
                                    Sign Up
                                </button>
                            </div>
                        )}
                         <a href="https://github.com/aniketkakde04/Roadmap-Generator" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white flex-shrink-0">
                            <GitHubIcon className="w-6 h-6" />
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;