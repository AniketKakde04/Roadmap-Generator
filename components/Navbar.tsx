import React from 'react';
import GitHubIcon from './icons/GitHubIcon';

const Navbar: React.FC = () => {
    return (
        <nav className="bg-slate-900/70 backdrop-blur-md sticky top-0 z-20 border-b border-slate-800">
            <div className="w-full max-w-5xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <a href="/" className="flex items-center space-x-2 text-slate-100 hover:text-sky-400 transition-colors">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span className="font-bold text-xl">
                            AI Roadmap Gen
                        </span>
                    </a>
                    <div className="flex items-center">
                        <a 
                            href="https://github.com/google/generative-ai-docs/tree/main/site/en/gemini-api/docs/applications/roadmap_generator" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            aria-label="GitHub Repository"
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                           <GitHubIcon className="w-6 h-6" />
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
