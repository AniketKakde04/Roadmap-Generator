import React, { useState, useEffect } from 'react';
import { SavedRoadmap, ResumeData } from '../types';
import CourseView from './CourseView';
import {RoadmapEditor} from './RoadmapEditor';
import ResumePreview from './ResumePreview';
import EditProfileModal from './EditProfileModal';
import { getResume, upsertResume } from '../services/resumeService';
import Loader from './Loader';
import { supabase } from '../services/supabase';

interface ProfilePageProps {
    userName: string;
    savedRoadmaps: SavedRoadmap[];
    onProgressToggle: (roadmapId: string, stepIndex: number) => void;
    onDeleteRoadmap: (roadmapId: string) => void;
    onUpdateRoadmap: (updatedRoadmap: SavedRoadmap) => void;
    onNavigate: (view: 'home' | 'resume' | 'profile' | 'resumeBuilder') => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userName, savedRoadmaps, onProgressToggle, onDeleteRoadmap, onUpdateRoadmap, onNavigate }) => {
    const [selectedRoadmap, setSelectedRoadmap] = useState<SavedRoadmap | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [activeTab, setActiveTab] = useState<'roadmaps' | 'resume'>('roadmaps');
    
    const [resumeData, setResumeData] = useState<ResumeData | null>(null);
    const [loadingResume, setLoadingResume] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        const fetchResumeData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const data = await getResume(user.id);
                    if (data) setResumeData(data);
                }
            } catch (error) {
                console.error("Failed to fetch resume data for profile:", error);
            } finally {
                setLoadingResume(false);
            }
        };
        fetchResumeData();
    }, []);

    useEffect(() => {
        if (selectedRoadmap) {
            const updatedVersion = savedRoadmaps.find(r => r.id === selectedRoadmap.id);
            if (updatedVersion) {
                setSelectedRoadmap(updatedVersion);
            } else {
                setSelectedRoadmap(null);
                setEditMode(false);
            }
        }
    }, [savedRoadmaps, selectedRoadmap]);

    const handleProfileSave = async (updatedData: Partial<ResumeData>) => {
        try {
            const currentData = resumeData || {};
            const dataToSave = { ...currentData, ...updatedData } as ResumeData;
            const saved = await upsertResume(dataToSave);
            setResumeData(saved);
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Failed to save profile:", error);
            alert("Could not save profile changes. Please try again.");
        }
    };

    if (editMode && selectedRoadmap) {
        return <RoadmapEditor
            roadmap={selectedRoadmap}
            onSave={(updatedRoadmap) => {
                onUpdateRoadmap(updatedRoadmap);
                setEditMode(false);
            }}
            onCancel={() => setEditMode(false)}
        />
    }

    if (selectedRoadmap) {
        return <CourseView
            roadmap={selectedRoadmap}
            onBack={() => setSelectedRoadmap(null)}
            onEdit={() => setEditMode(true)}
            onProgressToggle={onProgressToggle}
        />
    }
    
    return (
        <>
            {isEditModalOpen && resumeData && (
                <EditProfileModal 
                    initialData={resumeData}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleProfileSave}
                />
            )}
            <div className="w-full max-w-5xl mx-auto py-8">
                {/* --- NEW PROFILE HEADER --- */}
                <header className="mb-8 p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                    {loadingResume ? <Loader /> : (
                        <div className="flex flex-col sm:flex-row items-start gap-6">
                            <div className="flex-grow">
                                <h1 className="text-3xl font-bold text-white">{resumeData?.full_name || userName}</h1>
                                <p className="text-sky-400 mt-1">{resumeData?.job_title || 'No job title set'}</p>
                                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-slate-400">
                                    <span className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                                        {resumeData?.email || 'No email set'}
                                    </span>
                                    <span className="flex items-center gap-2">
                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                                        {resumeData?.phone || 'No phone set'}
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setIsEditModalOpen(true)} className="flex-shrink-0 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-md text-sm">
                                Edit Profile
                            </button>
                        </div>
                    )}
                </header>

                {/* --- NEW TABBED CONTENT --- */}
                <div>
                    <div className="border-b border-slate-700 mb-6">
                        <nav className="flex space-x-4">
                            <button onClick={() => setActiveTab('roadmaps')} className={`py-2 px-4 font-semibold ${activeTab === 'roadmaps' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-400 hover:text-white'}`}>
                                My Roadmaps
                            </button>
                             <button onClick={() => setActiveTab('resume')} className={`py-2 px-4 font-semibold ${activeTab === 'resume' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-400 hover:text-white'}`}>
                                My Resume
                            </button>
                        </nav>
                    </div>

                    {activeTab === 'roadmaps' && (
                        <div>
                             {savedRoadmaps.length > 0 ? (
                                <div className="space-y-4">
                                    {savedRoadmaps.map((roadmap, index) => {
                                        const completedSteps = roadmap.completedSteps || [];
                                        const progressPercent = roadmap.steps.length > 0 ? Math.round((completedSteps.length / roadmap.steps.length) * 100) : 0;
                                        return (
                                            <div key={roadmap.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 transition-all duration-300 group">
                                                <div className="flex justify-between items-start">
                                                    <button onClick={() => setSelectedRoadmap(roadmap)} className="text-left flex-grow pr-4">
                                                        <h3 className="text-lg font-bold text-slate-100 group-hover:text-sky-400 transition-colors">{roadmap.title}</h3>
                                                        <p className="text-xs text-slate-500 mt-1">Saved on: {new Date(roadmap.savedAt).toLocaleDateString()}</p>
                                                    </button>
                                                </div>
                                                <div className="mt-4">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-sm font-medium text-sky-400">Progress</span>
                                                        <span className="text-sm font-medium text-slate-300">{progressPercent}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                                                        <div className="bg-sky-500 h-2.5 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-16 border-2 border-dashed border-slate-700 rounded-xl">
                                    <p className="text-slate-400">You haven't saved any roadmaps yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'resume' && (
                        <div className="animate-fadeIn">
                           {resumeData ? (
                                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                                    <h3 className="font-semibold text-lg text-white mb-4">Your Resume</h3>
                                    <div className="p-4 bg-white rounded-md max-h-[500px] overflow-y-auto">
                                        <ResumePreview resumeData={resumeData} />
                                    </div>
                                     <button onClick={() => onNavigate('resumeBuilder')} className="mt-4 w-full bg-sky-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-sky-500">
                                        Edit in Builder
                                    </button>
                                </div>
                           ) : (
                                <div className="text-center py-16 border-2 border-dashed border-slate-700 rounded-xl">
                                    <p className="text-slate-400">You haven't created a resume yet.</p>
                                    <button onClick={() => onNavigate('resumeBuilder')} className="mt-4 bg-sky-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-sky-500">
                                        Create Your Resume
                                    </button>
                                </div>
                           )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ProfilePage;

