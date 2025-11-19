import React, { useState } from 'react';
import GitHubIcon from './icons/GitHubIcon';
import ThemeToggle from '../src/components/ThemeToggle';

type View = 'home' | 'dashboard' | 'roadmapGenerator' | 'resume' | 'profile' | 'resumeBuilder' | 'aptitude' | 'mockInterview';

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
                    className={`block w-full text-left px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                            ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
                            : 'text-text-secondary hover:bg-background-hover hover:text-primary'
                        } md:w-auto md:text-center`}
                >
                    {children}
                </button>
            </li>
        );
    };

    return (
        <nav className="glass sticky top-0 z-50 transition-colors duration-300 border-b border-border/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <button onClick={() => onNavigate(isLoggedIn ? 'dashboard' : 'home')} className="flex items-center space-x-3 group">
                            <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
                                <span className="text-lg">AI</span>
                            </div>
                            <span className="text-text-primary text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                                EduPath
                            </span>
                        </button>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center space-x-4">
                        <ul className="flex items-center space-x-2">
                            {!isLoggedIn && <NavLink view="home">Home</NavLink>}
                            {isLoggedIn && (
                                <>
                                    <NavLink view="dashboard">Dashboard</NavLink>
                                    <NavLink view="roadmapGenerator">Roadmap</NavLink>
                                    <NavLink view="resumeBuilder">Resume</NavLink>
                                </>
                            )}
                        </ul>
                    </div>

                    {/* Right Side Actions */}
                    <div className="hidden md:flex items-center space-x-5">
                        <ThemeToggle />

                        <div className="h-6 w-px bg-border/60 mx-2"></div>

                        <a href="https://github.com/aniketkakde04/Roadmap-Generator" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-primary transition-colors p-1 hover:bg-background-hover rounded-lg">
                            <GitHubIcon className="w-5 h-5" />
                        </a>

                        {/* Auth Buttons */}
                        {isLoggedIn ? (
                            <div className="relative flex items-center pl-2">
                                <button onClick={() => onNavigate('profile')} className="w-9 h-9 rounded-full bg-background-accent flex items-center justify-center text-primary ring-2 ring-transparent hover:ring-primary/50 transition-all shadow-sm">
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
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={onSignInClick}
                                    className="text-text-secondary hover:text-primary px-4 py-2 rounded-full text-sm font-medium transition-colors hover:bg-background-hover"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={onSignUpClick}
                                    className="bg-primary text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5"
                                >
                                    Get Started
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button (omitted for brevity, standard impl) */}
                </div>
            </div>
        </nav>
    );
};
export default Navbar;