import React, { useState } from 'react';
import { SavedRoadmap, Resource } from '../types';

// Helper to get YouTube ID (reused for embedding videos)
const getYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// --- Reusable Resource Components ---
const ResourceItem: React.FC<{ resource: Resource }> = ({ resource }) => (
    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="block bg-slate-800/50 border border-slate-700/50 p-4 rounded-lg hover:border-sky-500/50 hover:bg-slate-800 transition-all">
        <p className="font-semibold text-slate-200">{resource.title}</p>
        <p className="text-xs text-sky-400 mt-1 truncate capitalize">{resource.type}</p>
    </a>
);

const VideoItem: React.FC<{ resource: Resource }> = ({ resource }) => {
    const videoId = getYouTubeId(resource.url);
    if (!videoId) return <ResourceItem resource={resource} />; // Fallback for non-YouTube video links

    return (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden shadow-lg">
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
                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-slate-200 hover:text-sky-400 transition-colors line-clamp-2">
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
    const activeStep = roadmap.steps[activeStepIndex];

    const progressPercent = roadmap.steps.length > 0 ? Math.round((roadmap.completedSteps.length / roadmap.steps.length) * 100) : 0;

    return (
        <div className="w-full max-w-7xl mx-auto py-8 animate-fadeIn">
            {/* Header */}
            <header className="mb-8">
                <button onClick={onBack} className="mb-6 text-sm font-semibold text-sky-400 hover:text-sky-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                    Back to Profile
                </button>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-100">{roadmap.title}</h1>
                        <p className="text-slate-400 mt-2 max-w-3xl">{roadmap.description}</p>
                    </div>
                     <button onClick={onEdit} className="flex-shrink-0 bg-slate-700 text-slate-200 font-semibold py-2 px-4 rounded-md hover:bg-slate-600 transition-colors flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                        Edit
                    </button>
                </div>
                <div className="mt-4">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-sky-400">Progress</span>
                        <span className="text-sm font-medium text-slate-300">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                        <div className="bg-sky-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex flex-col md:flex-row gap-8">
                {/* Left Sidebar: Curriculum */}
                <aside className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 sticky top-24">
                        <h3 className="font-bold text-lg text-slate-200 mb-4 px-2">Roadmap Steps</h3>
                        <nav className="space-y-1">
                            {roadmap.steps.map((step, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveStepIndex(index)}
                                    className={`w-full text-left flex items-start p-3 rounded-lg transition-colors ${activeStepIndex === index ? 'bg-sky-500/20 text-sky-300' : 'hover:bg-slate-700/50 text-slate-300'}`}
                                >
                                    <input 
                                        type="checkbox"
                                        checked={roadmap.completedSteps.includes(index)}
                                        onChange={() => onProgressToggle(roadmap.id, index)}
                                        onClick={(e) => e.stopPropagation()} // Prevent button click when checkbox is clicked
                                        className="mt-1 h-5 w-5 rounded bg-slate-700 border-slate-600 text-sky-500 focus:ring-sky-600 focus:ring-2 cursor-pointer flex-shrink-0"
                                    />
                                    <div className="ml-4">
                                        <p className="font-semibold">{step.title}</p>
                                        <p className="text-xs text-slate-400">Step {index + 1}</p>
                                    </div>
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Right Panel: Content */}
                <main className="w-full md:w-2/3 lg:w-3/4">
                    {activeStep ? (
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                            <h2 className="text-2xl font-bold text-slate-100 mb-2">{activeStep.title}</h2>
                            <p className="text-slate-400 mb-6">{activeStep.description}</p>
                            
                            <h4 className="text-lg font-semibold text-slate-200 mb-4 border-t border-slate-700 pt-4">Resources for this step:</h4>
                            
                            <div className="space-y-4">
                                {activeStep.resources.map((resource, index) => 
                                    resource.type === 'video' ? <VideoItem key={index} resource={resource} /> : <ResourceItem key={index} resource={resource} />
                                )}
                                {activeStep.resources.length === 0 && (
                                    <p className="text-slate-500 italic">No resources listed for this step.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                         <div className="flex items-center justify-center h-64 bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-xl">
                            <p className="text-slate-500">Select a step from the left to view its details.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CourseView;
