import React, { useState } from 'react';
import { BriefcaseIcon } from '@heroicons/react/24/outline';

import ThemeToggle from '../src/components/ThemeToggle';

type View = 'home' | 'dashboard' | 'roadmapGenerator' | 'resume' | 'profile' | 'portfolio' | 'resumeBuilder' | 'aptitude' | 'mockInterview' | 'sharedPortfolio' | 'resources' | 'projects';

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

    const handleNav = (view: View) => {
        onNavigate(view);
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand Logo */}
                    <div className="flex-shrink-0 flex items-center mr-4"> {/* Added mr-4 to prevent overlap */}
                        <button onClick={() => handleNav(isLoggedIn ? 'dashboard' : 'home')} className="flex items-center space-x-2 group">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm group-hover:scale-105 transition-transform">
                                <BriefcaseIcon className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-text-primary text-xl font-bold tracking-tight whitespace-nowrap">BuildMyPortfolio</span>
                        </button>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center justify-center flex-grow space-x-4"> {/* Added flex-grow and justify-center to center nav items */}
                        {isLoggedIn && (
                            <ul className="flex items-center space-x-6">
                                <li>
                                    <button onClick={() => handleNav('dashboard')} className={`text-sm font-medium transition-colors ${currentView === 'dashboard' ? 'text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
                                        Dashboard
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => handleNav('roadmapGenerator')} className={`text-sm font-medium transition-colors ${currentView === 'roadmapGenerator' ? 'text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
                                        Roadmap
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => handleNav('resumeBuilder')} className={`text-sm font-medium transition-colors ${currentView === 'resumeBuilder' ? 'text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
                                        Resume
                                    </button>
                                </li>
                            </ul>
                        )}
                    </div>

                    {/* Right Side Actions */}
                    <div className="hidden md:flex items-center space-x-4 flex-shrink-0"> {/* Added flex-shrink-0 */}
                        <ThemeToggle />



                        {isLoggedIn ? (
                            <div className="relative flex items-center">
                                <button onClick={() => handleNav('profile')} className="w-8 h-8 rounded-full bg-background-accent flex items-center justify-center text-primary ring-2 ring-transparent hover:ring-primary transition-all" title="Profile">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                <button
                                    onClick={onSignOut}
                                    className="ml-4 text-text-secondary hover:text-error text-sm font-medium transition-colors"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={onSignInClick}
                                    className="text-text-secondary hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={onSignUpClick}
                                    className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                >
                                    Get Started
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-background-hover focus:outline-none"
                        >
                            <span className="sr-only">Open main menu</span>
                            {!isMobileMenuOpen ? (
                                <svg className="block h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                            ) : (
                                <svg className="block h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-background border-t border-border">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {isLoggedIn ? (
                            <>
                                <button onClick={() => handleNav('dashboard')} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:text-text-primary hover:bg-background-hover">Dashboard</button>
                                <button onClick={() => handleNav('roadmapGenerator')} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:text-text-primary hover:bg-background-hover">Roadmap Generator</button>

                                <button onClick={() => handleNav('resume')} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:text-text-primary hover:bg-background-hover">Resume Analyzer</button>
                                <button onClick={() => handleNav('resumeBuilder')} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:text-text-primary hover:bg-background-hover">Resume Builder</button>

                                <button onClick={() => handleNav('resources')} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:text-text-primary hover:bg-background-hover">Resources</button>
                                <button onClick={() => handleNav('projects')} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:text-text-primary hover:bg-background-hover">Projects</button>
                                <button onClick={() => handleNav('aptitude')} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:text-text-primary hover:bg-background-hover">Aptitude Prep</button>

                                {/* Disabled Links */}
                                <div className="px-3 py-2 flex items-center justify-between text-base font-medium text-text-secondary/50 cursor-not-allowed">
                                    <span>Mock Interview</span>
                                    <span className="text-xs bg-background-accent px-2 py-0.5 rounded-full">Soon</span>
                                </div>

                                <button onClick={() => handleNav('profile')} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:text-text-primary hover:bg-background-hover">Profile</button>
                                <button onClick={() => { onSignOut(); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-error hover:bg-background-hover">Sign Out</button>
                            </>
                        ) : (
                            <>
                                <button onClick={onSignInClick} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:text-text-primary hover:bg-background-hover">Sign In</button>
                                <button onClick={onSignUpClick} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-background-hover">Get Started</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};
export default Navbar;