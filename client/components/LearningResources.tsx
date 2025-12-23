import React from 'react';
import PlayCircleIcon from './icons/PlayCircleIcon';
import WrenchScrewdriverIcon from './icons/WrenchScrewdriverIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import LinkIcon from './icons/LinkIcon';

const LearningResources: React.FC = () => {
    return (
        <div className="w-full max-w-6xl mx-auto py-10 animate-fadeIn px-4 md:px-8">
            <header className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-4">
                    Learning Resources
                </h1>
                <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                    Curated collection of videos, AI tools, and platforms to accelerate your learning journey.
                </p>
            </header>

            <div className="space-y-12 pb-12">
                {/* --- Section 1: Video Playlist --- */}
                <section className="bg-background-secondary border border-border rounded-3xl p-6 md:p-8 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-xl text-red-600 dark:text-red-400">
                            <PlayCircleIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-text-primary">Perfect Guide for Engineering Students</h2>
                            <p className="text-text-secondary text-sm">Essential quantitative aptitude topics for placements and interviews.</p>
                        </div>
                    </div>

                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-border bg-black">
                        <iframe
                            className="absolute top-0 left-0 w-full h-full"
                            src="https://www.youtube.com/embed/videoseries?list=PLyAb1KN5Zkf_SPcL_lI5DfO1YhZqaBvcZ"
                            title="Quantitative Aptitude Playlist"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        ></iframe>
                    </div>
                </section>

                {/* --- Section 2: AI Tools --- */}
                <section>
                    <div className="flex items-center space-x-3 mb-6 px-2">
                        <WrenchScrewdriverIcon className="w-6 h-6 text-accent" />
                        <h2 className="text-2xl font-bold text-text-primary">AI Learning Assistants</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ResourceCard
                            title="ChatGPT"
                            description="Excellent for explaining concepts, solving problems step-by-step, and generating practice questions."
                            url="https://chat.openai.com/"
                            icon="🤖"
                        />
                        <ResourceCard
                            title="Google Gemini"
                            description="Powerful multi-modal AI that can help with coding, math, and logical reasoning problems."
                            url="https://gemini.google.com/"
                            icon="✨"
                        />
                        <ResourceCard
                            title="Perplexity AI"
                            description="Real-time web search combined with AI. Great for finding latest study resources and fact-checking."
                            url="https://www.perplexity.ai/"
                            icon="🔍"
                        />
                    </div>
                </section>

                {/* --- Section 3: Learning Platforms --- */}
                <section>
                    <div className="flex items-center space-x-3 mb-6 px-2">
                        <BookOpenIcon className="w-6 h-6 text-primary" />
                        <h2 className="text-2xl font-bold text-text-primary">Learning Platforms</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ResourceCard
                            title="IndiaBIX"
                            description="The go-to platform for aptitude questions, logical reasoning, and interview preparation."
                            url="https://www.indiabix.com/"
                            icon="📚"
                        />
                        <ResourceCard
                            title="GeeksforGeeks"
                            description="Vast collection of computer science resources, algorithms, and placement preparation tracks."
                            url="https://www.geeksforgeeks.org/"
                            icon="🟩"
                        />
                        <ResourceCard
                            title="Coursera"
                            description="Professional certificates and courses from top universities to boost your resume."
                            url="https://www.coursera.org/"
                            icon="🎓"
                        />
                    </div>
                </section>
            </div>
        </div>
    );
};

const ResourceCard: React.FC<{ title: string, description: string, url: string, icon: string }> = ({ title, description, url, icon }) => (
    <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-background-secondary border border-border rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg group h-full flex flex-col"
    >
        <div className="flex items-center justify-between mb-4">
            <span className="text-4xl bg-background p-2 rounded-xl border border-border">{icon}</span>
            <LinkIcon className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" />
        </div>
        <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-sm text-text-secondary leading-relaxed flex-1">{description}</p>
    </a>
)

export default LearningResources;
