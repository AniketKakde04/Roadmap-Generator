import React from 'react';
import { MapIcon, DocumentTextIcon, AcademicCapIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const FeatureCard = ({ icon, title, description, delay }: { icon: JSX.Element, title: string, description: string, delay: string }) => (
    <div className="bg-background-secondary p-8 rounded-2xl border border-border hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5 group" style={{ animationDelay: delay }}>
        <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-primary/10 text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-text-primary mb-3">{title}</h3>
        <p className="text-text-secondary leading-relaxed">{description}</p>
    </div>
);

const HomePage: React.FC<{ onSignUpClick: () => void, onNavigate: (view: string) => void, isLoggedIn: boolean }> = ({ onSignUpClick, onNavigate, isLoggedIn }) => {
    return (
        <div className="w-full relative overflow-hidden bg-background">
            {/* Clean Background Decorations */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10"></div>

            <div className="max-w-6xl mx-auto px-6 py-20 md:py-32">
                {/* Hero Section */}
                <section className="text-center max-w-4xl mx-auto mb-24 animate-fadeInUp">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background-secondary border border-border text-primary text-sm font-medium mb-8 shadow-sm">
                        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                        AI-Powered Career Acceleration
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-text-primary tracking-tight mb-8 leading-tight">
                        Your Career Journey, <br />
                        <span className="text-primary">Autopilot Engaged.</span>
                    </h1>
                    <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
                        Generate personalized learning roadmaps, craft ATS-beating resumes, and practice mock interviews—all powered by advanced AI.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {isLoggedIn ? (
                             <button 
                                onClick={() => onNavigate('dashboard')}
                                className="px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-primary/20 transform hover:-translate-y-1"
                            >
                                Go to Dashboard &rarr;
                            </button>
                        ) : (
                            <button 
                                onClick={onSignUpClick}
                                className="px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-primary/20 transform hover:-translate-y-1"
                            >
                                Start Your Journey Free
                            </button>
                        )}
                    </div>
                </section>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeInUp">
                    <FeatureCard 
                        icon={<MapIcon className="w-7 h-7" />}
                        title="Roadmap Generator"
                        description="Dynamic learning paths tailored to your specific goal, timeline, and current skill level."
                        delay="100ms"
                    />
                    <FeatureCard 
                        icon={<DocumentTextIcon className="w-7 h-7" />}
                        title="Resume AI"
                        description="Instant analysis against job descriptions with actionable feedback and a powerful builder."
                        delay="200ms"
                    />
                    <FeatureCard 
                        icon={<ChatBubbleLeftRightIcon className="w-7 h-7" />}
                        title="Mock Interviews"
                        description="Practice with an AI hiring manager that speaks to you and gives real-time feedback."
                        delay="300ms"
                    />
                    <FeatureCard 
                        icon={<AcademicCapIcon className="w-7 h-7" />}
                        title="Aptitude Prep"
                        description="Master the basics with curated quizzes and study guides for placement exams."
                        delay="400ms"
                    />
                </div>
            </div>
        </div>
    );
};

export default HomePage;