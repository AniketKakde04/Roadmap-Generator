import React, { useState, useEffect } from 'react';
import { SavedRoadmap, ResumeData } from '../types';
import CourseView from './CourseView';
import {RoadmapEditor} from './RoadmapEditor';
import ResumePreview from './ResumePreview';
import PortfolioPreview from './PortfolioPreview'; // <-- Import new component
import EditProfileModal from './EditProfileModal';
import { getResume, upsertResume } from '../services/resumeService';
import Loader from './Loader';
import { supabase } from '../services/supabase';
import XMarkIcon from './icons/XMarkIcon';
import LinkIcon from './icons/LinkIcon'; // Assuming you have this or use Heroicons

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
    // Added 'portfolio' tab
    const [activeTab, setActiveTab] = useState<'roadmaps' | 'resume' | 'portfolio'>('roadmaps');
    
    const [resumeData, setResumeData] = useState<ResumeData | null>(null);
    const [loadingResume, setLoadingResume] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

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
        }
    };

    const handleDeleteClick = (roadmapId: string) => {
        onDeleteRoadmap(roadmapId);
    };

    const handleCopyLink = () => {
        // In a real app, this would be a public URL (e.g., /portfolio/username)
        // Here we simulate it
        const url = `${window.location.origin}?view=sharedPortfolio&user=${userName}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
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
            <div className="w-full max-w-5xl mx-auto py-8 animate-fadeIn">
                {/* --- PROFILE HEADER --- */}
                <header className="mb-8 p-6 bg-background-secondary border border-border rounded-xl shadow-sm">
                    {loadingResume ? <Loader /> : (
                        <div className="flex flex-col sm:flex-row items-start gap-6">
                            <div className="flex-grow">
                                <h1 className="text-3xl font-bold text-text-primary">{resumeData?.full_name || userName}</h1>
                                <p className="text-primary font-medium mt-1">{resumeData?.job_title || 'No job title set'}</p>
                                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-text-secondary">
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
                            <button onClick={() => setIsEditModalOpen(true)} className="flex-shrink-0 bg-background border border-border text-text-secondary hover:bg-background-hover hover:text-text-primary font-semibold py-2 px-4 rounded-md text-sm transition-colors shadow-sm">
                                Edit Profile
                            </button>
                        </div>
                    )}
                </header>

                {/* --- TABBED CONTENT --- */}
                <div>
                    <div className="border-b border-border mb-6">
                        <nav className="flex space-x-6">
                            <button onClick={() => setActiveTab('roadmaps')} className={`py-2 font-semibold transition-colors ${activeTab === 'roadmaps' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary hover:text-text-primary'}`}>
                                My Roadmaps
                            </button>
                             <button onClick={() => setActiveTab('resume')} className={`py-2 font-semibold transition-colors ${activeTab === 'resume' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary hover:text-text-primary'}`}>
                                My Resume
                            </button>
                            {/* NEW TAB */}
                             <button onClick={() => setActiveTab('portfolio')} className={`py-2 font-semibold transition-colors ${activeTab === 'portfolio' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary hover:text-text-primary'}`}>
                                My Portfolio
                            </button>
                        </nav>
                    </div>

                    {/* --- ROADMAPS TAB --- */}
                    {activeTab === 'roadmaps' && (
                        <div>
                             {savedRoadmaps.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {savedRoadmaps.map((roadmap, index) => {
                                        const completedSteps = roadmap.completedSteps || [];
                                        const progressPercent = roadmap.steps.length > 0 ? Math.round((completedSteps.length / roadmap.steps.length) * 100) : 0;
                                        return (
                                            <div key={roadmap.id} className="bg-background-secondary border border-border rounded-xl p-6 transition-all duration-300 group hover:shadow-md cursor-pointer" onClick={() => setSelectedRoadmap(roadmap)}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">{roadmap.title}</h3>
                                                        <p className="text-xs text-text-secondary mt-1">Saved on: {new Date(roadmap.savedAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(roadmap.id); }}
                                                        className="text-text-secondary hover:text-error transition-colors p-1 rounded-full hover:bg-error/10"
                                                    >
                                                        <XMarkIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-xs font-medium text-primary">Progress</span>
                                                        <span className="text-xs font-medium text-text-secondary">{progressPercent}%</span>
                                                    </div>
                                                    <div className="w-full bg-background-accent rounded-full h-2">
                                                        <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-16 border-2 border-dashed border-border rounded-xl bg-background">
                                    <p className="text-text-secondary">You haven't saved any roadmaps yet.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- RESUME TAB --- */}
                    {activeTab === 'resume' && (
                        <div className="animate-fadeIn">
                           {resumeData ? (
                                <div className="bg-background-secondary border border-border rounded-xl p-6 shadow-sm">
                                    <div className="flex justify-between items-center mb-4">
                                         <h3 className="font-semibold text-lg text-text-primary">Your Resume Preview</h3>
                                         <button onClick={() => onNavigate('resumeBuilder')} className="text-sm font-semibold text-primary hover:text-secondary">
                                            Edit in Builder &rarr;
                                        </button>
                                    </div>
                                    <div className="p-4 bg-white border border-border rounded-md max-h-[500px] overflow-y-auto shadow-inner">
                                        <ResumePreview resumeData={resumeData} />
                                    </div>
                                </div>
                           ) : (
                                <div className="text-center py-16 border-2 border-dashed border-border rounded-xl bg-background">
                                    <p className="text-text-secondary mb-4">You haven't created a resume yet.</p>
                                    <button onClick={() => onNavigate('resumeBuilder')} className="mt-2 bg-primary text-white font-semibold py-2 px-6 rounded-md hover:bg-secondary transition-all shadow-md">
                                        Create Your Resume
                                    </button>
                                </div>
                           )}
                        </div>
                    )}

                    {/* --- PORTFOLIO TAB (NEW) --- */}
                    {activeTab === 'portfolio' && (
                        <div className="animate-fadeIn">
                            {resumeData && resumeData.full_name ? (
                                <div className="space-y-6">
                                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-text-primary">Your Portfolio Website</h3>
                                            <p className="text-sm text-text-secondary mt-1">A public-facing website generated automatically from your resume.</p>
                                        </div>
                                        <button 
                                            onClick={handleCopyLink}
                                            className="flex items-center gap-2 bg-white border border-border text-text-primary font-semibold py-2 px-4 rounded-lg hover:bg-background-hover transition-all shadow-sm"
                                        >
                                            {copySuccess ? (
                                                <span className="text-success">Copied!</span>
                                            ) : (
                                                <>
                                                    <LinkIcon className="w-4 h-4" />
                                                    <span>Copy Public Link</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <div className="border border-border rounded-xl overflow-hidden shadow-sm">
                                        <div className="bg-background-secondary border-b border-border p-3 flex items-center gap-2">
                                            <div className="flex gap-1.5">
                                                <div className="w-3 h-3 rounded-full bg-error/60"></div>
                                                <div className="w-3 h-3 rounded-full bg-warning/60"></div>
                                                <div className="w-3 h-3 rounded-full bg-success/60"></div>
                                            </div>
                                            <div className="flex-grow text-center">
                                                <div className="bg-white text-xs text-text-secondary py-1 px-4 rounded-md inline-block border border-border w-1/2 truncate">
                                                    edupath.ai/{userName || 'portfolio'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="h-[600px] overflow-y-auto bg-white">
                                            {/* We scale it down slightly to look like a preview */}
                                            <div className="origin-top transform scale-90">
                                                <PortfolioPreview data={resumeData} readOnly />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-16 border-2 border-dashed border-border rounded-xl bg-background">
                                    <p className="text-text-secondary mb-4">Complete your resume first to generate a portfolio.</p>
                                    <button onClick={() => onNavigate('resumeBuilder')} className="mt-2 bg-primary text-white font-semibold py-2 px-6 rounded-md hover:bg-secondary transition-all shadow-md">
                                        Go to Resume Builder
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