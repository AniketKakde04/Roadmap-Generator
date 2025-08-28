
import React, { useState } from 'react';
import { SavedRoadmap } from '../types';
import ResourceLink from './ResourceLink';

interface ProfilePageProps {
    userName: string;
    savedRoadmaps: SavedRoadmap[];
    onProgressToggle: (roadmapId: string, stepIndex: number) => void;
    onDeleteRoadmap: (roadmapId: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userName, savedRoadmaps, onProgressToggle, onDeleteRoadmap }) => {
    const [selectedRoadmap, setSelectedRoadmap] = useState<SavedRoadmap | null>(null);

    if (selectedRoadmap) {
        const progressPercent = selectedRoadmap.steps.length > 0 ? Math.round((selectedRoadmap.completedSteps.length / selectedRoadmap.steps.length) * 100) : 0;

        return (
            <div className="w-full max-w-5xl mx-auto py-8">
                <button onClick={() => setSelectedRoadmap(null)} className="mb-6 text-sm font-semibold text-sky-400 hover:text-sky-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                    Back to Profile
                </button>
                <div className="text-left mb-8 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                    <h1 className="text-3xl font-bold text-slate-100">{selectedRoadmap.title}</h1>
                    <p className="text-slate-400 mt-2">{selectedRoadmap.description}</p>
                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-sky-400">Progress</span>
                            <span className="text-sm font-medium text-slate-300">{progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                            <div className="bg-sky-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {selectedRoadmap.steps.map((step, index) => (
                        <div key={index} className={`bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 transition-all duration-300 ${selectedRoadmap.completedSteps.includes(index) ? 'opacity-60' : ''}`}>
                           <div className="flex items-start space-x-4">
                                <input 
                                    type="checkbox"
                                    id={`step-${selectedRoadmap.id}-${index}`}
                                    checked={selectedRoadmap.completedSteps.includes(index)}
                                    onChange={() => onProgressToggle(selectedRoadmap.id, index)}
                                    className="mt-1.5 h-5 w-5 rounded bg-slate-700 border-slate-600 text-sky-500 focus:ring-sky-600 focus:ring-2 cursor-pointer flex-shrink-0"
                               />
                               <label htmlFor={`step-${selectedRoadmap.id}-${index}`} className="flex-1 cursor-pointer">
                                    <h3 className={`font-bold text-slate-100 ${selectedRoadmap.completedSteps.includes(index) ? 'line-through' : ''}`}>{index+1}. {step.title}</h3>
                                    <p className="text-sm text-slate-400 mt-1">{step.description}</p>
                               </label>
                           </div>
                            <div className="pl-9 mt-3">
                                <h4 className="text-sm font-semibold text-slate-200 mb-2 border-b border-slate-700 pb-1">Resources:</h4>
                                <div className="space-y-1">
                                    {step.resources.map((resource, i) => (
                                        <ResourceLink key={i} resource={resource} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    
    return (
        <div className="w-full max-w-5xl mx-auto py-8">
            <header className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-indigo-400 mb-2">
                    {userName}'s Profile
                </h1>
                <p className="mt-4 text-lg text-slate-400">
                    Your saved roadmaps and progress.
                </p>
            </header>
            
            {savedRoadmaps.length > 0 ? (
                <div className="space-y-4">
                    {savedRoadmaps.slice().reverse().map((roadmap, index) => {
                        const progressPercent = roadmap.steps.length > 0 ? Math.round((roadmap.completedSteps.length / roadmap.steps.length) * 100) : 0;
                        return (
                            <div 
                                key={roadmap.id} 
                                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 transition-all duration-300 group animate-fadeInUp"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex justify-between items-start">
                                    <button onClick={() => setSelectedRoadmap(roadmap)} className="text-left flex-grow pr-4">
                                        <h3 className="text-lg font-bold text-slate-100 group-hover:text-sky-400 transition-colors">{roadmap.title}</h3>
                                        <p className="text-xs text-slate-500 mt-1">Saved on: {new Date(roadmap.savedAt).toLocaleDateString()}</p>
                                    </button>
                                    <button 
                                        onClick={() => onDeleteRoadmap(roadmap.id)} 
                                        className="text-slate-500 hover:text-red-400 transition-colors p-1 flex-shrink-0"
                                        aria-label="Delete roadmap"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
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
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed border-slate-700 rounded-xl">
                    <p className="text-slate-400">You haven't saved any roadmaps yet.</p>
                    <p className="text-slate-500 text-sm mt-2">Generate a roadmap from the home page and save it to see it here.</p>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;