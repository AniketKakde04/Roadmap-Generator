import React from 'react';
import {
    MapIcon,
    DocumentTextIcon,
    AcademicCapIcon,
    ChatBubbleLeftRightIcon,
    CheckIcon,
    ArrowRightIcon,
    SparklesIcon,
    StarIcon
} from '@heroicons/react/24/outline';

// --- Visual Components for the Cards ---

const RoadmapVisual = () => (
    <div className="w-full h-full flex items-center justify-center p-6">
        <div className="w-full max-w-xs bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">1</div>
                <div className="h-2 bg-white/20 rounded-full flex-1"></div>
            </div>
            <div className="space-y-2">
                <div className="h-2 w-3/4 bg-white/40 rounded-full"></div>
                <div className="h-2 w-1/2 bg-white/20 rounded-full"></div>
            </div>
            <div className="mt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">2</div>
                <div className="h-2 bg-white/20 rounded-full flex-1"></div>
            </div>
        </div>
    </div>
);

const ResumeVisual = () => (
    <div className="w-full h-full flex items-center justify-center p-6 relative">
        {/* Background Doc */}
        <div className="absolute w-48 h-64 bg-white/5 rounded-lg border border-white/10 transform -rotate-6 scale-90"></div>
        {/* Main Doc */}
        <div className="relative w-48 h-64 bg-white rounded-lg shadow-2xl p-4 flex flex-col gap-3 transform transition-transform group-hover:rotate-0 group-hover:scale-105 duration-500">
            <div className="w-12 h-12 bg-purple-100 rounded-full mb-2 self-center"></div>
            <div className="w-full h-2 bg-slate-200 rounded"></div>
            <div className="w-2/3 h-2 bg-slate-200 rounded"></div>
            <div className="mt-4 space-y-2">
                <div className="w-full h-1 bg-slate-100 rounded"></div>
                <div className="w-full h-1 bg-slate-100 rounded"></div>
                <div className="w-full h-1 bg-slate-100 rounded"></div>
            </div>
            {/* ATS Score Badge */}
            <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-bounce">
                98% Match
            </div>
        </div>
    </div>
);

// --- Journey Card Component ---
const JourneyCard = ({
    step,
    title,
    subtitle,
    description,
    icon,
    colorClass,
    visual,
    isLast
}: {
    step: string,
    title: string,
    subtitle: string,
    description: string,
    icon: JSX.Element,
    colorClass: string,
    visual: JSX.Element,
    isLast?: boolean
}) => (
    <div className="relative flex gap-8 md:gap-12 group">
        {/* Timeline Connector (Desktop) */}
        <div className="hidden md:flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full ${colorClass} flex items-center justify-center text-white font-bold text-xl shadow-lg z-10 ring-4 ring-background transition-transform group-hover:scale-110`}>
                {step}
            </div>
            {!isLast && (
                <div className="w-1 flex-1 bg-gradient-to-b from-border to-transparent my-2 rounded-full group-hover:from-primary/50 transition-colors"></div>
            )}
        </div>

        {/* Content Card */}
        <div className="flex-1 pb-16">
            {/* Mobile Step Indicator */}
            <div className="md:hidden flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                    {step}
                </div>
                <span className={`text-sm font-bold uppercase tracking-wider ${colorClass.replace('bg-', 'text-')}`}>{subtitle}</span>
            </div>

            <div className="bg-background-secondary/50 backdrop-blur-sm border border-border hover:border-primary/30 rounded-3xl p-6 md:p-8 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 grid md:grid-cols-2 gap-8 overflow-hidden relative">
                <div className="flex flex-col justify-center z-10">
                    <div className="hidden md:block mb-2">
                        <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white dark:bg-white/10 ${colorClass.replace('bg-', 'text-')}`}>
                            {subtitle}
                        </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">{title}</h3>
                    <p className="text-text-secondary text-lg leading-relaxed mb-6">
                        {description}
                    </p>
                    <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                        <div className={`p-2 rounded-lg bg-white dark:bg-white/5 shadow-sm ${colorClass.replace('bg-', 'text-')}`}>
                            {icon}
                        </div>
                        <span>Try this feature</span>
                        <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>

                {/* Visual Side with Gradient Background */}
                <div className={`relative rounded-2xl overflow-hidden min-h-[200px] flex items-center justify-center ${colorClass} bg-opacity-10`}>
                    <div className={`absolute inset-0 ${colorClass} opacity-10`}></div>
                    {/* Decorative Blob */}
                    <div className={`absolute -top-10 -right-10 w-32 h-32 ${colorClass} rounded-full blur-3xl opacity-40`}></div>
                    <div className={`absolute -bottom-10 -left-10 w-32 h-32 ${colorClass} rounded-full blur-3xl opacity-40`}></div>

                    {visual}
                </div>
            </div>
        </div>
    </div>
);

// --- Pricing Card Component ---
const PricingCard = ({
    title,
    price,
    period,
    features,
    isPopular,
    onAction,
    colorClass
}: {
    title: string,
    price: string,
    period?: string,
    features: string[],
    isPopular?: boolean,
    onAction: () => void,
    colorClass: string
}) => (
    <div className={`relative flex flex-col p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${isPopular
        ? 'bg-background border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20'
        : 'bg-background-secondary/50 backdrop-blur-sm border-border'
        }`}>
        {isPopular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-primary to-accent text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                    Most Popular
                </span>
            </div>
        )}
        <div className="mb-6">
            <h3 className={`text-lg font-bold uppercase tracking-wider mb-2 ${colorClass}`}>{title}</h3>
            <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-text-primary">{price}</span>
                {period && <span className="text-text-secondary font-medium text-lg">/{period}</span>}
            </div>
        </div>
        <ul className="space-y-4 mb-8 flex-1">
            {features.map((feat, i) => (
                <li key={i} className="flex items-start gap-3 text-text-secondary">
                    <div className={`mt-0.5 p-0.5 rounded-full ${isPopular ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                        <CheckIcon className="w-4 h-4" />
                    </div>
                    <span className="text-sm leading-relaxed">{feat}</span>
                </li>
            ))}
        </ul>
        <button
            onClick={onAction}
            className={`w-full py-3.5 rounded-xl font-bold transition-all ${isPopular
                ? 'bg-primary text-white hover:bg-secondary shadow-lg shadow-primary/25 btn-shine'
                : 'bg-white dark:bg-white/5 text-text-primary border border-border hover:border-primary/50'
                }`}
        >
            {isPopular ? 'Get Pro Access' : 'Start for Free'}
        </button>
    </div>
);

// --- Testimonial "Tweet" ---
const TestimonialCard = ({ name, handle, text, avatarColor }: any) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold`}>
                {name.charAt(0)}
            </div>
            <div>
                <p className="font-bold text-text-primary text-sm">{name}</p>
                <p className="text-text-secondary text-xs">{handle}</p>
            </div>
            <div className="ml-auto text-primary">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
            </div>
        </div>
        <p className="text-text-secondary text-sm leading-relaxed">{text}</p>
    </div>
);

const HomePage: React.FC<{ onSignUpClick: () => void, onNavigate: (view: string) => void, isLoggedIn: boolean }> = ({ onSignUpClick, onNavigate, isLoggedIn }) => {
    const [stats, setStats] = React.useState({ users: 0, roadmaps: 0, resumes: 0 });

    React.useEffect(() => {
        // Dynamic import to avoid circular dependencies if any, though not strictly needed here
        import('../services/statsService').then(async (service) => {
            const data = await service.getPlatformStats();
            setStats(data);
        });
    }, []);

    const handleCTAClick = () => {
        if (isLoggedIn) {
            onNavigate('dashboard');
        } else {
            onSignUpClick();
        }
    };

    return (
        <div className="w-full relative overflow-hidden bg-background selection:bg-primary/30">

            {/* --- BACKGROUND EFFECTS --- */}
            <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -z-10 animate-blob" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* --- HERO SECTION --- */}
                <section className="pt-32 pb-16 md:pt-44 md:pb-24 text-center">
                    <div className="inline-flex flex-col md:flex-row items-center gap-4 md:gap-8 mb-8 animate-fadeInUp">
                        {/* Live Stats Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-border text-text-secondary text-sm font-medium shadow-sm cursor-default">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                            </span>
                            <span>{stats.roadmaps.toLocaleString()} Roadmaps Created</span>
                        </div>

                        {/* Extra Stats for Desktop */}
                        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-text-secondary">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                {stats.users.toLocaleString()} Students
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                {stats.resumes.toLocaleString()} Resumes
                            </div>
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-text-primary tracking-tight mb-8 leading-[1.1] animate-fadeInUp" style={{ animationDelay: '100ms' }}>
                        Your Career Journey, <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary animate-text-shimmer bg-[length:200%_100%]">
                            Gamified & Guided.
                        </span>
                    </h1>

                    <p className="text-xl text-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed animate-fadeInUp" style={{ animationDelay: '200ms' }}>
                        EduPath turns the chaos of career prep into a clear, level-by-level game plan. From your first roadmap to your final interview.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadeInUp" style={{ animationDelay: '300ms' }}>
                        <button
                            onClick={handleCTAClick}
                            className="btn-shine px-8 py-4 bg-primary hover:bg-secondary text-white rounded-xl font-bold text-lg transition-all shadow-xl shadow-primary/25 transform hover:-translate-y-1 w-full sm:w-auto flex items-center justify-center gap-2"
                        >
                            {isLoggedIn ? 'Go to Dashboard' : 'Start Your Journey'}
                            <ArrowRightIcon className="w-5 h-5" />
                        </button>
                        {!isLoggedIn && (
                            <button onClick={() => document.getElementById('journey')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 bg-transparent hover:bg-background-secondary text-text-primary border border-border rounded-xl font-bold text-lg transition-all w-full sm:w-auto">
                                How it Works
                            </button>
                        )}
                    </div>
                </section>

                {/* --- JOURNEY MAP --- */}
                <section id="journey" className="py-20 max-w-5xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-6">Level Up Your Career</h2>
                        <p className="text-lg text-text-secondary max-w-xl mx-auto">
                            Follow the path. Unlock new opportunities. Here is how EduPath guides you from "Lost" to "Hired".
                        </p>
                    </div>

                    <div className="relative">
                        {/* Connector Line (Background) */}
                        <div className="absolute left-6 md:left-[23px] top-0 bottom-0 w-0.5 bg-border -z-10"></div>

                        {/* STEP 1: PLAN */}
                        <JourneyCard
                            step="1"
                            subtitle="Discovery Phase"
                            title="Generate Your Roadmap"
                            description="Tell us your goal (e.g., 'Full Stack Dev'). We generate a personalized, week-by-week study plan with curated free resources. No more endless searching."
                            icon={<MapIcon className="w-5 h-5" />}
                            colorClass="bg-blue-500"
                            visual={<RoadmapVisual />}
                        />

                        {/* STEP 2: PREPARE */}
                        <JourneyCard
                            step="2"
                            subtitle="Skill Building"
                            title="Master Aptitude & Logic"
                            description="Crack the placement screening rounds. Practice quantitative and logical reasoning with our AI-generated quiz engine that adapts to you."
                            icon={<AcademicCapIcon className="w-5 h-5" />}
                            colorClass="bg-emerald-500"
                            visual={
                                <div className="text-center text-white">
                                    <div className="text-6xl font-bold mb-2">100+</div>
                                    <div className="text-sm opacity-90">Practice Questions</div>
                                </div>
                            }
                        />

                        {/* STEP 3: APPLY */}
                        <JourneyCard
                            step="3"
                            subtitle="Application"
                            title="Beat the ATS Resume Bot"
                            description="Upload your resume for deep analysis or use our intelligent Resume Builder to create a perfect, ATS-friendly resume from scratch."
                            icon={<DocumentTextIcon className="w-5 h-5" />}
                            colorClass="bg-purple-500"
                            visual={<ResumeVisual />}
                        />

                        {/* STEP 4: INTERVIEW */}
                        <JourneyCard
                            step="4"
                            subtitle="Final Boss"
                            title="Ace the Mock Interview"
                            description="Speak with our AI Hiring Manager. Answer technical and behavioral questions via voice, and get instant feedback on your confidence and delivery."
                            icon={<ChatBubbleLeftRightIcon className="w-5 h-5" />}
                            colorClass="bg-pink-500"
                            visual={
                                <div className="flex gap-2 items-center">
                                    <div className="w-2 h-8 bg-white rounded-full animate-pulse"></div>
                                    <div className="w-2 h-12 bg-white rounded-full animate-pulse delay-75"></div>
                                    <div className="w-2 h-6 bg-white rounded-full animate-pulse delay-150"></div>
                                    <div className="w-2 h-10 bg-white rounded-full animate-pulse delay-100"></div>
                                    <div className="w-2 h-4 bg-white rounded-full animate-pulse delay-200"></div>
                                </div>
                            }
                            isLast
                        />
                    </div>
                </section>

                {/* --- PRICING SECTION --- */}
                <section id="pricing" className="py-20 border-t border-border/50">
                    <div className="max-w-4xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6">Simple Student Pricing</h2>
                            <p className="text-lg text-text-secondary">Start for free. Upgrade when you're ready to get serious.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            {/* Free Plan */}
                            <PricingCard
                                title="Starter"
                                price="Free"
                                colorClass="text-text-primary"
                                features={[
                                    '1 AI Roadmap per month',
                                    'Basic Resume Analysis',
                                    '5 Aptitude Practice Quizzes',
                                    'Community Access'
                                ]}
                                onAction={handleCTAClick}
                            />

                            {/* Pro Plan */}
                            <PricingCard
                                title="Pro Student"
                                price="₹79"
                                period="month"
                                isPopular={true}
                                colorClass="text-primary"
                                features={[
                                    'Unlimited AI Roadmaps',
                                    'Deep Resume Analysis & Rewrites',
                                    'Unlimited AI Mock Interviews',
                                    'Full Aptitude Question Bank',
                                    'Priority Support'
                                ]}
                                onAction={handleCTAClick}
                            />
                        </div>
                    </div>
                </section>

                {/* --- STUDENT VIBES (Testimonials) --- */}
                <section className="py-20 border-t border-border/50">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full mb-4">
                            <StarIcon className="w-6 h-6 fill-current" />
                        </div>
                        <h2 className="text-3xl font-bold text-text-primary">Student Vibes</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <TestimonialCard
                            name="Rahul M."
                            handle="@rahul_codes"
                            text="The roadmap generator saved me weeks of confusion. I finally know exactly what to study for React Native!"
                            avatarColor="bg-red-500"
                        />
                        <TestimonialCard
                            name="Ananya S."
                            handle="@ananya_design"
                            text="I used the resume analyzer before applying to my dream internship. The match score feature is a game changer."
                            avatarColor="bg-blue-500"
                        />
                        <TestimonialCard
                            name="David K."
                            handle="@david_dev"
                            text="The mock interviewer actually gave me feedback on my speaking speed. Felt super realistic."
                            avatarColor="bg-green-500"
                        />
                    </div>
                </section>

                {/* --- SIMPLE FOOTER --- */}
                <footer className="py-12 border-t border-border text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">AI</div>
                        <span className="text-xl font-bold text-text-primary">EduPath</span>
                    </div>
                    <p className="text-text-secondary text-sm mb-6">Your personal AI career coach. Built for students, by students.</p>
                    <div className="flex justify-center gap-6 text-sm font-medium text-text-secondary">
                        <a href="#" className="hover:text-primary">Roadmap</a>
                        <a href="#" className="hover:text-primary">Resume</a>
                        <a href="#" className="hover:text-primary">Interview</a>
                        <a href="#" className="hover:text-primary">About</a>
                    </div>
                    <p className="text-xs text-text-secondary mt-8 opacity-50">&copy; {new Date().getFullYear()} EduPath AI. All rights reserved.</p>
                </footer>

            </div>
        </div>
    );
};

export default HomePage;