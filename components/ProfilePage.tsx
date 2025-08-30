import React, { useState, useEffect } from 'react';
import { SavedRoadmap } from '../types';
import ResourceLink from './ResourceLink';
import {RoadmapEditor} from './RoadmapEditor'; // Assuming you have this from the edit feature
import ResourceHub from './ResourceHub';

// Define the types for the props
interface ProfilePageProps {
    userName: string;
    savedRoadmaps: SavedRoadmap[];
    onProgressToggle: (roadmapId: string, stepIndex: number) => void;
    onDeleteRoadmap: (roadmapId: string) => void;
    onUpdateRoadmap: (updatedRoadmap: SavedRoadmap) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userName, savedRoadmaps, onProgressToggle, onDeleteRoadmap, onUpdateRoadmap }) => {
    const [selectedRoadmap, setSelectedRoadmap] = useState<SavedRoadmap | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    // NEW: State to manage which tab is active in the detailed view
    const [activeTab, setActiveTab] = useState<'roadmap' | 'resources'>('roadmap');

    // Effect to reset the view when the selected roadmap changes
    useEffect(() => {
        if (selectedRoadmap) {
            setIsEditing(false);
            setActiveTab('roadmap'); // Default to the roadmap tab when a new one is selected
        }
    }, [selectedRoadmap]);
    
    const currentSelectedRoadmap = selectedRoadmap ? savedRoadmaps.find(r => r.id === selectedRoadmap.id) || null : null;

    // Handle saving the edited roadmap
    const handleSaveEdit = (editedRoadmap: SavedRoadmap) => {
        onUpdateRoadmap(editedRoadmap);
        setIsEditing(false); // Exit edit mode after saving
    };
    
    // If we are in the detailed/edit view for a roadmap
    if (currentSelectedRoadmap) {
        if (isEditing) {
            return (
                <RoadmapEditor 
                    roadmap={currentSelectedRoadmap}
                    onSave={handleSaveEdit}
                    onCancel={() => setIsEditing(false)}
                />
            );
        }

        const completedSteps = currentSelectedRoadmap.completedSteps || [];
        const progressPercent = currentSelectedRoadmap.steps.length > 0 ? Math.round((completedSteps.length / currentSelectedRoadmap.steps.length) * 100) : 0;
        
        return (
            <div className="w-full max-w-5xl mx-auto py-8">
                {/* Back and Edit Buttons */}
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => setSelectedRoadmap(null)} className="text-sm font-semibold text-sky-400 hover:text-sky-300 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                        Back to Profile
                    </button>
                    <button onClick={() => setIsEditing(true)} className="text-sm font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 px-4 rounded-lg flex items-center">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                         </svg>
                        Edit Roadmap
                    </button>
                </div>

                {/* Header Section */}
                <div className="text-left mb-8 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                    <h1 className="text-3xl font-bold text-slate-100">{currentSelectedRoadmap.title}</h1>
                    <p className="text-slate-400 mt-2">{currentSelectedRoadmap.description}</p>
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

                {/* NEW: Tab Navigation */}
                <div className="border-b border-slate-700 mb-6">
                    <nav className="flex space-x-4" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('roadmap')}
                            className={`${
                                activeTab === 'roadmap'
                                ? 'border-sky-400 text-sky-400'
                                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            Roadmap
                        </button>
                        <button
                            onClick={() => setActiveTab('resources')}
                            className={`${
                                activeTab === 'resources'
                                ? 'border-sky-400 text-sky-400'
                                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            Resource Hub
                        </button>
                    </nav>
                </div>
                
                {/* NEW: Conditional Content Based on Active Tab */}
                <div>
                    {activeTab === 'roadmap' && (
                        <div className="space-y-4">
                            {currentSelectedRoadmap.steps.map((step, index) => (
                                <div key={index} className={`bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 transition-all duration-300 ${completedSteps.includes(index) ? 'opacity-60' : ''}`}>
                                   <div className="flex items-start space-x-4">
                                        <input 
                                            type="checkbox"
                                            id={`step-${currentSelectedRoadmap.id}-${index}`}
                                            checked={completedSteps.includes(index)}
                                            onChange={() => onProgressToggle(currentSelectedRoadmap.id, index)}
                                            className="mt-1.5 h-5 w-5 rounded bg-slate-700 border-slate-600 text-sky-500 focus:ring-sky-600 focus:ring-2 cursor-pointer flex-shrink-0"
                                       />
                                       <label htmlFor={`step-${currentSelectedRoadmap.id}-${index}`} className="flex-1 cursor-pointer">
                                            <h3 className={`font-bold text-slate-100 ${completedSteps.includes(index) ? 'line-through' : ''}`}>{index+1}. {step.title}</h3>
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
                    )}
                    {activeTab === 'resources' && (
                    <ResourceHub roadmap={currentSelectedRoadmap} />

                    )}
                </div>
            </div>
        );
    }
    
    // --- The rest of the component (the main profile list view) remains the same ---
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
                         const completedSteps = roadmap.completedSteps || [];
                        const progressPercent = roadmap.steps.length > 0 ? Math.round((completedSteps.length / roadmap.steps.length) * 100) : 0;
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

