import React from 'react';

// Reusable Feature Card Component
const FeatureCard = ({ icon, title, description }: { icon: JSX.Element, title: string, description: string }) => (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 transform hover:-translate-y-2 transition-transform duration-300">
        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-sky-600/30 text-sky-400 mb-4">
            {icon}
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm">{description}</p>
    </div>
);

// Main HomePage Component
const HomePage: React.FC<{ onSignUpClick: () => void, onNavigate: (view: string) => void, isLoggedIn: boolean }> = ({ onSignUpClick, onNavigate, isLoggedIn }) => {
    // Icons for feature cards
    const RoadmapIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 3l6-3m0 0l-6-3m6 3v10" /></svg>;
    const ResumeIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    const AptitudeIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;

    return (
        <div className="w-full max-w-5xl mx-auto py-12 px-4 animate-fadeIn">
            {/* --- Hero Section --- */}
            <section className="text-center py-20">
                <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">
                    Your AI-Powered Career Co-Pilot
                </h1>
                <p className="mt-6 text-lg max-w-2xl mx-auto text-slate-400">
                    From crafting the perfect resume to generating personalized learning roadmaps, our platform provides the tools you need to launch your dream career.
                </p>
                <div className="mt-8">
                    {isLoggedIn ? (
                         <button 
                            onClick={() => onNavigate('profile')}
                            className="bg-sky-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-sky-500 transition-all duration-300 transform hover:scale-105"
                        >
                            Go to Your Dashboard
                        </button>
                    ) : (
                        <button 
                            onClick={onSignUpClick}
                            className="bg-sky-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-sky-500 transition-all duration-300 transform hover:scale-105"
                        >
                            Get Started for Free
                        </button>
                    )}
                </div>
            </section>

            {/* --- Feature Showcase --- */}
            <section id="features" className="py-20">
                <h2 className="text-3xl font-bold text-center text-white mb-12">
                    A Full Suite of Career Tools
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard 
                        icon={RoadmapIcon}
                        title="AI Roadmap Generator"
                        description="Tell us your goal, and our AI will instantly create a detailed, step-by-step learning plan with curated resources."
                    />
                    <FeatureCard 
                        icon={ResumeIcon}
                        title="Resume Builder & Analyzer"
                        description="Build a professional resume from scratch with AI assistance, or upload yours for a detailed analysis against your target job."
                    />
                    <FeatureCard 
                        icon={AptitudeIcon}
                        title="Aptitude Preparation"
                        description="Prepare for placement tests with AI-generated courses and quizzes to sharpen your skills and identify weak spots. (Coming Soon)"
                    />
                </div>
            </section>
        </div>
    );
};

export default HomePage;

