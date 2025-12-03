import React, { useState } from 'react';
import { SavedRoadmap, Resource } from '../types';
import GraphView from './GraphView';
import { 
    PlayCircleIcon, 
    BookOpenIcon, 
    WrenchScrewdriverIcon, 
    LinkIcon,
    ArrowLeftIcon,
    PencilSquareIcon,
    ListBulletIcon,
    Squares2X2Icon
} from '@heroicons/react/24/outline';

// Helper to get YouTube ID
const getYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// --- Reusable Resource Components ---
const ResourceItem: React.FC<{ resource: Resource }> = ({ resource }) => (
    <a 
        href={resource.url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="block bg-background border border-border p-4 rounded-lg hover:border-primary/50 hover:bg-background-hover transition-all group"
    >
        <div className="flex items-center justify-between">
            <p className="font-semibold text-text-primary group-hover:text-primary transition-colors">{resource.title}</p>
            <span className="text-xs text-text-secondary border border-border px-2 py-1 rounded capitalize group-hover:border-primary/30">{resource.type}</span>
        </div>
        <p className="text-xs text-text-secondary mt-1 truncate">{resource.url}</p>
    </a>
);

const VideoItem: React.FC<{ resource: Resource }> = ({ resource }) => {
    const videoId = getYouTubeId(resource.url);
    if (!videoId) return <ResourceItem resource={resource} />;

    return (
        <div className="bg-background border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-w-16 aspect-h-9 bg-black">
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={resource.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                ></iframe>
            </div>
             <div className="p-4">
                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-text-primary hover:text-primary transition-colors line-clamp-2">
                    {resource.title}
                </a>
            </div>
        </div>
    );
};

// --- Main Course View Component ---
interface CourseViewProps {
  roadmap: SavedRoadmap;
  onProgressToggle: (roadmapId: string, stepIndex: number) => void;
  onBack: () => void;
  onEdit: () => void;
}

const CourseView: React.FC<CourseViewProps> = ({ roadmap, onProgressToggle, onBack, onEdit }) => {
    const [activeStepIndex, setActiveStepIndex] = useState(0);
    const [view, setView] = useState<'list' | 'graph'>('list');
    const activeStep = roadmap.steps[activeStepIndex];

    const progressPercent = roadmap.steps.length > 0 ? Math.round((roadmap.completedSteps.length / roadmap.steps.length) * 100) : 0;
    
    return (
        <div className="w-full max-w-7xl mx-auto py-8 animate-fadeIn px-4">
            {/* Header */}
            <header className="mb-8">
                 <button onClick={onBack} className="mb-6 text-sm font-semibold text-primary hover:text-secondary flex items-center transition-colors">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Profile
                </button>
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary">{roadmap.title}</h1>
                        <p className="text-text-secondary mt-2 max-w-3xl">{roadmap.description}</p>
                    </div>
                     <button onClick={onEdit} className="flex-shrink-0 bg-background-secondary border border-border text-text-primary font-semibold py-2 px-4 rounded-lg hover:bg-background-hover hover:border-primary/50 transition-colors flex items-center shadow-sm">
                        <PencilSquareIcon className="w-5 h-5 mr-2" />
                        Edit Roadmap
                    </button>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-6 bg-background-secondary border border-border p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-primary">Progress</span>
                        <span className="text-sm font-bold text-text-primary">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-background-accent rounded-full h-3 overflow-hidden">
                        <div className="bg-primary h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                </div>
            </header>

            {/* View Toggle */}
            <div className="mb-6 flex justify-end">
                <div className="bg-background-secondary p-1 rounded-lg border border-border flex items-center">
                    <button
                        onClick={() => setView('list')}
                        className={`flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                            view === 'list' 
                                ? 'bg-primary text-white shadow-md' 
                                : 'text-text-secondary hover:text-text-primary hover:bg-background-hover'
                        }`}
                    >
                        <ListBulletIcon className="w-4 h-4 mr-2" />
                        List View
                    </button>
                    <button
                        onClick={() => setView('graph')}
                        className={`flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                            view === 'graph' 
                                ? 'bg-primary text-white shadow-md' 
                                : 'text-text-secondary hover:text-text-primary hover:bg-background-hover'
                        }`}
                    >
                        <Squares2X2Icon className="w-4 h-4 mr-2" />
                        Graph View
                    </button>
                </div>
            </div>

            {/* Main Layout */}
            {view === 'list' && (
                <div className="flex flex-col lg:flex-row gap-8 animate-fadeIn">
                    {/* Left Sidebar: Curriculum */}
                    <aside className="w-full lg:w-1/3 flex-shrink-0">
                        <div className="bg-background-secondary border border-border rounded-xl p-4 sticky top-24 shadow-sm h-[calc(100vh-150px)] flex flex-col">
                            <h3 className="font-bold text-lg text-text-primary mb-4 px-2 flex items-center gap-2">
                                <span className="bg-primary/10 text-primary p-1.5 rounded-md"><ListBulletIcon className="w-5 h-5"/></span>
                                Curriculum
                            </h3>
                            <nav className="space-y-1 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                                {roadmap.steps.map((step, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveStepIndex(index)}
                                        className={`w-full text-left flex items-start p-3 rounded-lg transition-all border ${
                                            activeStepIndex === index 
                                                ? 'bg-primary/5 border-primary/30 text-primary' 
                                                : 'border-transparent hover:bg-background-hover text-text-secondary hover:text-text-primary'
                                        }`}
                                    >
                                        <div 
                                            className="mt-0.5 mr-3 flex-shrink-0"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <input 
                                                type="checkbox"
                                                checked={roadmap.completedSteps.includes(index)}
                                                onChange={() => onProgressToggle(roadmap.id, index)}
                                                className="h-5 w-5 rounded border-border text-primary focus:ring-primary cursor-pointer transition-all"
                                            />
                                        </div>
                                        <div>
                                            <p className={`font-semibold text-sm ${activeStepIndex === index ? 'text-primary' : 'text-text-primary'}`}>
                                                {step.title}
                                            </p>
                                            <p className="text-xs text-text-secondary mt-0.5 opacity-80">Step {index + 1}</p>
                                        </div>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Right Panel: Content */}
                    <main className="w-full lg:w-2/3">
                        <div className="bg-background-secondary border border-border rounded-xl p-6 md:p-8 shadow-sm min-h-[500px]">
                            {activeStep ? (
                                <div className="animate-fadeIn">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                                            {activeStepIndex + 1}
                                        </span>
                                        <h2 className="text-2xl font-bold text-text-primary">{activeStep.title}</h2>
                                    </div>
                                    
                                    <div className="prose prose-slate dark:prose-invert max-w-none mb-8 text-text-secondary bg-background/50 p-6 rounded-xl border border-border/50">
                                        <p className="leading-relaxed whitespace-pre-wrap">{activeStep.description}</p>
                                    </div>
                                    
                                    <h4 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2 border-b border-border pb-2">
                                        <BookOpenIcon className="w-5 h-5 text-primary" />
                                        Learning Resources
                                    </h4>
                                    
                                    <div className="space-y-4">
                                        {activeStep.resources.map((resource, index) => 
                                            resource.type === 'video' 
                                                ? <VideoItem key={index} resource={resource} /> 
                                                : <ResourceItem key={index} resource={resource} />
                                        )}
                                        {activeStep.resources.length === 0 && (
                                            <div className="text-center py-10 bg-background border border-dashed border-border rounded-xl">
                                                <p className="text-text-secondary italic">No resources listed for this step.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                 <div className="flex flex-col items-center justify-center h-full text-center py-20">
                                    <ListBulletIcon className="w-16 h-16 text-border mb-4" />
                                    <p className="text-text-secondary text-lg">Select a step from the curriculum to start learning.</p>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            )}
            
            {view === 'graph' && (
                <div className="mt-4">
                    <GraphView roadmap={roadmap} />
                </div>
            )}
        </div>
    );
};

export default CourseView;