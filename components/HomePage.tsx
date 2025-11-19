import React from 'react';
import { MapIcon, DocumentTextIcon, AcademicCapIcon, ChatBubbleLeftRightIcon, CheckIcon } from '@heroicons/react/24/outline';

// --- Feature Section Component ---
const FeatureSection = ({ 
    title, 
    description, 
    icon, 
    imageSrc, 
    isReversed,
    delay 
}: { 
    title: string, 
    description: string, 
    icon: JSX.Element, 
    imageSrc: string, // Placeholder for now, could be a screenshot
    isReversed?: boolean,
    delay: string
}) => (
    <div className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 py-20 animate-fadeInUp`} style={{ animationDelay: delay }}>
        <div className="flex-1 space-y-6">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
                {icon}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary">{title}</h2>
            <p className="text-lg text-text-secondary leading-relaxed">{description}</p>
            <ul className="space-y-3">
                {['AI-Powered Analysis', 'Instant Feedback', 'Personalized Results'].map((item, i) => (
                    <li key={i} className="flex items-center text-text-secondary">
                        <CheckIcon className="w-5 h-5 text-success mr-3" />
                        {item}
                    </li>
                ))}
            </ul>
        </div>
        <div className="flex-1 w-full">
            {/* Mockup / Visual Placeholder */}
            <div className="aspect-video bg-background-secondary border border-border rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden relative group">
                 <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
                 <div className="text-center p-8">
                    <div className="w-20 h-20 bg-white rounded-full shadow-lg mx-auto flex items-center justify-center mb-4 text-primary">
                        {icon}
                    </div>
                    <p className="font-semibold text-text-secondary">Interactive Preview</p>
                 </div>
            </div>
        </div>
    </div>
);

// --- Pricing Card Component ---
const PricingCard = ({ 
    title, 
    price, 
    features, 
    isPopular, 
    onAction 
}: { 
    title: string, 
    price: string, 
    features: string[], 
    isPopular?: boolean,
    onAction: () => void
}) => (
    <div className={`relative p-8 rounded-2xl border ${isPopular ? 'border-primary bg-primary/5 shadow-xl' : 'border-border bg-background shadow-sm'} flex flex-col transition-all hover:-translate-y-1 hover:shadow-lg`}>
        {isPopular && (
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
            </span>
        )}
        <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
        <div className="mb-6">
            <span className="text-4xl font-extrabold text-text-primary">{price}</span>
            {price !== 'Free' && <span className="text-text-secondary font-medium">/month</span>}
        </div>
        <ul className="space-y-4 mb-8 flex-1">
            {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                    <CheckIcon className="w-5 h-5 text-success mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-text-secondary text-sm">{feature}</span>
                </li>
            ))}
        </ul>
        <button 
            onClick={onAction}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                isPopular 
                    ? 'bg-primary text-white hover:bg-secondary shadow-lg shadow-primary/25' 
                    : 'bg-background-secondary text-text-primary hover:bg-background-accent border border-border'
            }`}
        >
            {isPopular ? 'Get Pro Now' : 'Get Started'}
        </button>
    </div>
);

const HomePage: React.FC<{ onSignUpClick: () => void, onNavigate: (view: string) => void, isLoggedIn: boolean }> = ({ onSignUpClick, onNavigate, isLoggedIn }) => {
    
    const handleCTAClick = () => {
        if (isLoggedIn) {
            onNavigate('dashboard');
        } else {
            onSignUpClick();
        }
    };

    return (
        <div className="w-full relative overflow-hidden bg-background">
            {/* Hero Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10 opacity-60"></div>

            <div className="max-w-7xl mx-auto px-6 pb-20">
                
                {/* --- HERO SECTION --- */}
                <section className="text-center py-24 md:py-32 animate-fadeInUp">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background-secondary border border-border text-primary text-sm font-medium mb-8 shadow-sm">
                        <span className="flex h-2 w-2 rounded-full bg-success animate-pulse"></span>
                        v2.0 is Live: Now with Aptitude Prep!
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-text-primary tracking-tight mb-6 leading-tight">
                        Launch Your Career on <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Autopilot.</span>
                    </h1>
                    <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
                        The all-in-one platform for students. Generate roadmaps, perfect your resume, and ace your interviews with AI.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button 
                            onClick={handleCTAClick}
                            className="px-8 py-4 bg-primary hover:bg-secondary text-white rounded-xl font-bold text-lg transition-all shadow-xl shadow-primary/20 transform hover:-translate-y-1"
                        >
                            {isLoggedIn ? 'Go to Dashboard' : 'Start for Free'}
                        </button>
                        <a href="#pricing" className="px-8 py-4 bg-background hover:bg-background-secondary text-text-primary border border-border rounded-xl font-bold text-lg transition-all">
                            View Pricing
                        </a>
                    </div>
                </section>

                {/* --- FEATURE SECTIONS --- */}
                <div className="space-y-12">
                    <FeatureSection 
                        title="AI Roadmap Generator"
                        description="Don't know where to start? Tell us your goal (e.g., 'Become a Full Stack Dev in 3 months'), and our AI will generate a week-by-week learning plan tailored to your timeline and skill level."
                        icon={<MapIcon className="w-8 h-8" />}
                        imageSrc="/roadmap-preview.png"
                        delay="100ms"
                    />
                    
                    <FeatureSection 
                        title="Intelligent Resume Builder"
                        description="Stop guessing keywords. Upload your current resume and a target job description. Our AI analyzes the gap, scores your resume, and helps you rewrite bullet points to beat the ATS."
                        icon={<DocumentTextIcon className="w-8 h-8" />}
                        imageSrc="/resume-preview.png"
                        isReversed
                        delay="200ms"
                    />
                    
                    <FeatureSection 
                        title="Mock Interview Coach"
                        description="Practice makes perfect. Engage in realistic voice conversations with an AI hiring manager. Get real-time feedback on your answers, tone, and confidence."
                        icon={<ChatBubbleLeftRightIcon className="w-8 h-8" />}
                        imageSrc="/interview-preview.png"
                        delay="300ms"
                    />

                     <FeatureSection 
                        title="Aptitude & Logic Prep"
                        description="Crack the placement exams with our curated aptitude quizzes. Covering quantitative aptitude, logical reasoning, and verbal ability with detailed explanations."
                        icon={<AcademicCapIcon className="w-8 h-8" />}
                        imageSrc="/aptitude-preview.png"
                        isReversed
                        delay="400ms"
                    />
                </div>

                {/* --- PRICING SECTION --- */}
                <section id="pricing" className="py-24 border-t border-border mt-12">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">Simple, Student-Friendly Pricing</h2>
                        <p className="text-text-secondary max-w-xl mx-auto">Start for free, upgrade for unlimited power. Cancel anytime.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <PricingCard 
                            title="Free Tier"
                            price="Free"
                            features={[
                                '1 AI Roadmap per month',
                                'Basic Resume Analysis',
                                '5 Aptitude Quizzes',
                                'Community Support'
                            ]}
                            onAction={handleCTAClick}
                        />
                        <PricingCard 
                            title="Pro Student"
                            price="₹79"
                            isPopular
                            features={[
                                'Unlimited AI Roadmaps',
                                'Advanced Resume Tailoring',
                                'Unlimited Mock Interviews',
                                'Full Aptitude Question Bank',
                                'Priority Support'
                            ]}
                            onAction={handleCTAClick}
                        />
                    </div>
                </section>

                {/* Footer */}
                <footer className="text-center pt-12 border-t border-border text-text-secondary text-sm">
                    <p>© 2024 EduPath AI. Built for Students, by Students.</p>
                </footer>
            </div>
        </div>
    );
};

export default HomePage;