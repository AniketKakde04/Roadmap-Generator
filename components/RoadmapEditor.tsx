import React, { useState } from 'react';
import { SavedRoadmap, Step, Resource } from '../types';
import XMarkIcon from './icons/XMarkIcon';

interface RoadmapEditorProps {
    roadmap: SavedRoadmap;
    onSave: (updatedRoadmap: SavedRoadmap) => void;
    onCancel: () => void;
}

export const RoadmapEditor: React.FC<RoadmapEditorProps> = ({ roadmap, onSave, onCancel }) => {
    const [editedRoadmap, setEditedRoadmap] = useState<SavedRoadmap>(roadmap);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditedRoadmap({ ...editedRoadmap, title: e.target.value });
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditedRoadmap({ ...editedRoadmap, description: e.target.value });
    };

    const handleStepChange = (stepIndex: number, field: keyof Step, value: any) => {
        const newSteps = [...editedRoadmap.steps];
        newSteps[stepIndex] = { ...newSteps[stepIndex], [field]: value };
        setEditedRoadmap({ ...editedRoadmap, steps: newSteps });
    };

    const handleResourceChange = (stepIndex: number, resourceIndex: number, field: keyof Resource, value: string) => {
        const newSteps = [...editedRoadmap.steps];
        const newResources = [...newSteps[stepIndex].resources];
        newResources[resourceIndex] = { ...newResources[resourceIndex], [field]: value };
        newSteps[stepIndex] = { ...newSteps[stepIndex], resources: newResources };
        setEditedRoadmap({ ...editedRoadmap, steps: newSteps });
    };

    const addStep = () => {
        const newStep: Step = { title: 'New Step', description: '', resources: [] };
        setEditedRoadmap({ ...editedRoadmap, steps: [...editedRoadmap.steps, newStep] });
    };

    const removeStep = (stepIndex: number) => {
        const newSteps = editedRoadmap.steps.filter((_, i) => i !== stepIndex);
        setEditedRoadmap({ ...editedRoadmap, steps: newSteps });
    };

    const addResource = (stepIndex: number) => {
        const newResource: Resource = { title: 'New Resource', url: '', type: 'article' };
        const newSteps = [...editedRoadmap.steps];
        newSteps[stepIndex].resources.push(newResource);
        setEditedRoadmap({ ...editedRoadmap, steps: newSteps });
    };

    const removeResource = (stepIndex: number, resourceIndex: number) => {
        const newSteps = [...editedRoadmap.steps];
        const newResources = newSteps[stepIndex].resources.filter((_, i) => i !== resourceIndex);
        newSteps[stepIndex] = { ...newSteps[stepIndex], resources: newResources };
        setEditedRoadmap({ ...editedRoadmap, steps: newSteps });
    };

    return (
        <div className="w-full max-w-5xl mx-auto py-8 bg-slate-900 p-8 rounded-xl border border-slate-700">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-sky-400">Edit Roadmap</h2>
                <div className="space-x-4">
                    <button onClick={onCancel} className="px-4 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors">
                        Cancel
                    </button>
                    <button onClick={() => onSave(editedRoadmap)} className="px-4 py-2 rounded-md text-sm font-medium bg-sky-600 text-white hover:bg-sky-500 transition-colors">
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label htmlFor="roadmap-title" className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                    <input
                        id="roadmap-title"
                        type="text"
                        value={editedRoadmap.title}
                        onChange={handleTitleChange}
                        className="w-full bg-slate-800 border border-slate-600 rounded-md p-2 text-white"
                    />
                </div>
                <div>
                    <label htmlFor="roadmap-description" className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                    <textarea
                        id="roadmap-description"
                        rows={3}
                        value={editedRoadmap.description}
                        onChange={handleDescriptionChange}
                        className="w-full bg-slate-800 border border-slate-600 rounded-md p-2 text-white"
                    />
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-700 pb-2">Steps</h3>
                    {editedRoadmap.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="text-md font-bold text-slate-100">Step {stepIndex + 1}</h4>
                                <button onClick={() => removeStep(stepIndex)} className="text-red-400 hover:text-red-300">
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Step Title</label>
                                <input type="text" value={step.title} onChange={(e) => handleStepChange(stepIndex, 'title', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-white"/>
                            </div>
                             <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Step Description</label>
                                <textarea value={step.description} onChange={(e) => handleStepChange(stepIndex, 'description', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-white" rows={2}/>
                            </div>
                            
                            <div className="space-y-2">
                                <h5 className="text-sm font-semibold text-slate-300">Resources</h5>
                                {step.resources.map((resource, resourceIndex) => (
                                    <div key={resourceIndex} className="flex items-center space-x-2 p-2 bg-slate-700/50 rounded-md">
                                        <input type="text" placeholder="Title" value={resource.title} onChange={e => handleResourceChange(stepIndex, resourceIndex, 'title', e.target.value)} className="flex-1 bg-slate-600 border border-slate-500 rounded p-1 text-xs text-white"/>
                                        <input type="text" placeholder="URL" value={resource.url} onChange={e => handleResourceChange(stepIndex, resourceIndex, 'url', e.target.value)} className="flex-1 bg-slate-600 border border-slate-500 rounded p-1 text-xs text-white"/>
                                        <select value={resource.type} onChange={e => handleResourceChange(stepIndex, resourceIndex, 'type', e.target.value)} className="bg-slate-600 border border-slate-500 rounded p-1 text-xs text-white">
                                            <option value="article">Article</option>
                                            <option value="video">Video</option>
                                            <option value="documentation">Docs</option>
                                            <option value="tool">Tool</option>
                                            <option value="course">Course</option>
                                            <option value="other">Other</option>
                                        </select>
                                        <button onClick={() => removeResource(stepIndex, resourceIndex)} className="text-red-400 hover:text-red-300 p-1">
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button onClick={() => addResource(stepIndex)} className="text-xs text-sky-400 hover:text-sky-300">+ Add Resource</button>
                            </div>
                        </div>
                    ))}
                    <button onClick={addStep} className="w-full text-sm p-2 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:bg-slate-800 hover:border-slate-500 transition-colors">
                        + Add a New Step
                    </button>
                </div>
            </div>
        </div>
    );
};
