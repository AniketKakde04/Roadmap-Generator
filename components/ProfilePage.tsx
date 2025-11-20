import React, { useState, useEffect } from 'react';
import { SavedRoadmap, ResumeData } from '../types';
import CourseView from './CourseView';
import { RoadmapEditor } from './RoadmapEditor';
import ResumePreview from './ResumePreview';
import PortfolioPreview from './PortfolioPreview';
import EditProfileModal from './EditProfileModal';
import { getResume, upsertResume } from '../services/resumeService';
import Loader from './Loader';
import { supabase } from '../services/supabase';
import { 
    UserIcon, 
    MapIcon, 
    DocumentTextIcon, 
    GlobeAltIcon, 
    PencilSquareIcon, 
    TrashIcon, 
    CheckBadgeIcon,
    BriefcaseIcon,
    EnvelopeIcon,
    PhoneIcon,
    LinkIcon
} from '@heroicons/react/24/outline';

interface ProfilePageProps {
    userName: string;
    savedRoadmaps: SavedRoadmap[];
    onProgressToggle: (roadmapId: string, stepIndex: number) => void;
    onDeleteRoadmap: (roadmapId: string) => void;
    onUpdateRoadmap: (updatedRoadmap: SavedRoadmap) => void;
    onNavigate: (view: 'home' | 'resume' | 'profile' | 'resumeBuilder') => void;
}

// Helper component moved outside to prevent re-renders
const StatsCard = ({ icon, label, value, colorClass }: { icon: JSX.Element, label: string, value: string | number, colorClass: string }) => (
    <div className="bg-background border border-border p-4 rounded-xl shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow">
        <div className={`p-3 rounded-full ${colorClass} bg-opacity-10 text-current`}>
            {icon}
        </div>
        <div>
            <p className="text-text-secondary text-xs uppercase font-semibold tracking-wider">{label}</p>
            <p className="text-xl font-bold text-text-primary">{value}</p>
        </div>
    </div>
);

const ProfilePage: React.FC<ProfilePageProps> = ({ userName, savedRoadmaps, onProgressToggle, onDeleteRoadmap, onUpdateRoadmap, onNavigate }) => {
    const [selectedRoadmap, setSelectedRoadmap] = useState<SavedRoadmap | null>(null);
    const [editMode, setEditMode] = useState(false);
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

    const handleCopyLink = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const url = `${window.location.origin}?view=sharedPortfolio&userId=${user.id}`;
        
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
            
            <div className="w-full max-w-6xl mx-auto py-8 px-4 md:px-8 animate-fadeIn space-y-8">
                
                {/* --- 1. HERO PROFILE HEADER --- */}
                <div className="relative bg-background-secondary border border-border rounded-2xl overflow-hidden shadow-sm">
                    {/* Decorative Background */}
                    <div className="absolute top-0 w-full h-32 bg-gradient-to-r from-primary/80 to-secondary/80"></div>
                    
                    <div className="relative px-8 pt-16 pb-8">
                        {loadingResume ? <div className="py-12 flex justify-center"><Loader /></div> : (
                            <div className="flex flex-col md:flex-row items-end md:items-center gap-6">
                                {/* Avatar */}
                                <div className="w-32 h-32 rounded-full bg-white p-1 shadow-xl -mt-12 flex-shrink-0">
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-4xl font-bold text-primary border-4 border-white">
                                        {resumeData?.full_name ? resumeData.full_name.charAt(0) : <UserIcon className="w-12 h-12 text-slate-400"/>}
                                    </div>
                                </div>

                                {/* User Details */}
                                <div className="flex-grow pb-2 text-center md:text-left">
                                    <h1 className="text-3xl font-extrabold text-text-primary">
                                        {resumeData?.full_name || userName}
                                    </h1>
                                    <p className="text-primary font-medium text-lg">{resumeData?.job_title || 'Job Title Not Set'}</p>
                                    
                                    <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 text-sm text-text-secondary">
                                        {resumeData?.email && (
                                            <span className="flex items-center gap-1.5 bg-background px-3 py-1 rounded-full border border-border shadow-sm">
                                                <EnvelopeIcon className="w-4 h-4" /> {resumeData.email}
                                            </span>
                                        )}
                                        {resumeData?.phone && (
                                            <span className="flex items-center gap-1.5 bg-background px-3 py-1 rounded-full border border-border shadow-sm">
                                                <PhoneIcon className="w-4 h-4" /> {resumeData.phone}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Edit Action - Explicitly type="button" and stop propagation */}
                                <button 
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setIsEditModalOpen(true);
                                    }}
                                    className="bg-white border border-border text-text-primary hover:border-primary hover:text-primary font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-all shadow-sm mb-2 cursor-pointer z-10"
                                >
                                    <PencilSquareIcon className="w-5 h-5" />
                                    <span>Edit Profile</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- 2. QUICK STATS --- */}
                {!loadingResume && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatsCard 
                            label="Active Roadmaps" 
                            value={savedRoadmaps.length} 
                            icon={<MapIcon className="w-6 h-6" />}
                            colorClass="bg-blue-500 text-blue-500"
                        />
                        <StatsCard 
                            label="Skills Mastered" 
                            value={resumeData?.skills.length || 0} 
                            icon={<CheckBadgeIcon className="w-6 h-6" />}
                            colorClass="bg-green-500 text-green-500"
                        />
                        <StatsCard 
                            label="Experience Yrs" 
                            value={resumeData?.experience.length ? `${resumeData.experience.length}+` : '0'} 
                            icon={<BriefcaseIcon className="w-6 h-6" />}
                            colorClass="bg-purple-500 text-purple-500"
                        />
                    </div>
                )}

                {/* --- 3. CONTENT TABS --- */}
                <div>
                    <div className="flex border-b border-border mb-6 overflow-x-auto">
                        {[
                            { id: 'roadmaps', label: 'My Roadmaps', icon: MapIcon },
                            { id: 'resume', label: 'My Resume', icon: DocumentTextIcon },
                            { id: 'portfolio', label: 'My Portfolio', icon: GlobeAltIcon },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 py-3 px-6 border-b-2 font-medium transition-all whitespace-nowrap ${
                                    activeTab === tab.id 
                                        ? 'border-primary text-primary bg-primary/5' 
                                        : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-background-hover'
                                }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* --- TAB CONTENT --- */}
                    <div className="min-h-[400px]">
                        
                        {/* A. ROADMAPS */}
                        {activeTab === 'roadmaps' && (
                            <div className="animate-fadeIn">
                                {savedRoadmaps.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {savedRoadmaps.map((roadmap) => {
                                            const completedSteps = roadmap.completedSteps || [];
                                            const progressPercent = roadmap.steps.length > 0 ? Math.round((completedSteps.length / roadmap.steps.length) * 100) : 0;
                                            
                                            return (
                                                <div 
                                                    key={roadmap.id} 
                                                    onClick={() => setSelectedRoadmap(roadmap)}
                                                    className="group bg-background-secondary border border-border rounded-xl p-5 cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
                                                >
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    
                                                    <div className="flex justify-between items-start mb-3">
                                                        <h3 className="font-bold text-lg text-text-primary group-hover:text-primary transition-colors line-clamp-1" title={roadmap.title}>
                                                            {roadmap.title}
                                                        </h3>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); onDeleteRoadmap(roadmap.id); }}
                                                            className="text-text-secondary hover:text-error p-1.5 rounded-full hover:bg-error/10 transition-colors"
                                                            title="Delete Roadmap"
                                                        >
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                    
                                                    <p className="text-text-secondary text-sm line-clamp-2 mb-4 flex-grow">
                                                        {roadmap.description}
                                                    </p>
                                                    
                                                    <div className="mt-auto">
                                                        <div className="flex justify-between text-xs font-semibold mb-1">
                                                            <span className="text-primary">{progressPercent}% Complete</span>
                                                            <span className="text-text-secondary">{completedSteps.length}/{roadmap.steps.length} Steps</span>
                                                        </div>
                                                        <div className="w-full bg-background-accent rounded-full h-2 overflow-hidden">
                                                            <div 
                                                                className="bg-primary h-full rounded-full transition-all duration-500 ease-out" 
                                                                style={{ width: `${progressPercent}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-border rounded-xl bg-background-secondary/50">
                                        <MapIcon className="w-12 h-12 text-text-secondary/50 mb-3" />
                                        <p className="text-text-secondary font-medium">You haven't saved any roadmaps yet.</p>
                                        <button onClick={() => onNavigate('home')} className="mt-4 text-primary hover:underline font-semibold">
                                            Generate your first roadmap &rarr;
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* B. RESUME */}
                        {activeTab === 'resume' && (
                            <div className="animate-fadeIn">
                                {resumeData ? (
                                    <div className="flex flex-col lg:flex-row gap-8">
                                        <div className="lg:w-1/3 space-y-4">
                                            <div className="bg-background-secondary border border-border rounded-xl p-6 shadow-sm">
                                                <h3 className="font-bold text-lg text-text-primary mb-2">Resume Status</h3>
                                                <div className="flex items-center gap-2 text-success font-medium mb-4">
                                                    <CheckBadgeIcon className="w-5 h-5" />
                                                    <span>Ready for Export</span>
                                                </div>
                                                <button 
                                                    onClick={() => onNavigate('resumeBuilder')}
                                                    className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-lg hover:bg-secondary transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                                                >
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                    Open Resume Builder
                                                </button>
                                            </div>
                                        </div>
                                        <div className="lg:w-2/3 bg-white border border-border rounded-xl p-4 shadow-inner h-[600px] overflow-y-auto">
                                             {/* Using scale to fit better */}
                                            <div className="transform origin-top scale-[0.85] w-[115%]">
                                                <ResumePreview resumeData={resumeData} />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-16 border-2 border-dashed border-border rounded-xl bg-background-secondary/50">
                                        <DocumentTextIcon className="w-12 h-12 text-text-secondary/50 mb-3 mx-auto" />
                                        <p className="text-text-secondary font-medium mb-4">You haven't created a resume yet.</p>
                                        <button 
                                            onClick={() => onNavigate('resumeBuilder')} 
                                            className="bg-primary text-white font-semibold py-2 px-6 rounded-lg hover:bg-secondary transition-all shadow-md"
                                        >
                                            Create Your Resume
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* C. PORTFOLIO */}
                        {activeTab === 'portfolio' && (
                            <div className="animate-fadeIn">
                                {resumeData && resumeData.full_name ? (
                                    <div className="space-y-6">
                                        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-white rounded-full shadow-sm text-primary hidden sm:block">
                                                    <GlobeAltIcon className="w-8 h-8" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-text-primary">Your Portfolio is Live</h3>
                                                    <p className="text-sm text-text-secondary mt-1">Share your professional journey with the world.</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={handleCopyLink}
                                                className="flex items-center gap-2 bg-white border border-border text-text-primary font-semibold py-2.5 px-5 rounded-lg hover:bg-background-hover hover:border-primary transition-all shadow-sm group"
                                            >
                                                {copySuccess ? (
                                                    <span className="text-success flex items-center gap-2"><CheckBadgeIcon className="w-5 h-5"/> Copied!</span>
                                                ) : (
                                                    <>
                                                        <LinkIcon className="w-5 h-5 text-text-secondary group-hover:text-primary" />
                                                        <span>Copy Public Link</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <div className="border border-border rounded-xl overflow-hidden shadow-lg">
                                            <div className="bg-slate-100 border-b border-slate-200 p-3 flex items-center gap-2">
                                                <div className="flex gap-1.5">
                                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                                </div>
                                                <div className="flex-grow text-center">
                                                    <div className="bg-white text-xs text-slate-500 py-1 px-4 rounded-md inline-block border border-slate-200 w-1/2 truncate shadow-sm">
                                                        edupath.ai/{userName || 'portfolio'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="h-[600px] overflow-y-auto bg-white relative">
                                                <div className="absolute inset-0 transform origin-top">
                                                    <PortfolioPreview data={resumeData} readOnly />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-16 border-2 border-dashed border-border rounded-xl bg-background-secondary/50">
                                        <GlobeAltIcon className="w-12 h-12 text-text-secondary/50 mb-3 mx-auto" />
                                        <p className="text-text-secondary font-medium mb-4">Complete your resume first to generate a portfolio.</p>
                                        <button 
                                            onClick={() => onNavigate('resumeBuilder')} 
                                            className="bg-primary text-white font-semibold py-2 px-6 rounded-lg hover:bg-secondary transition-all shadow-md"
                                        >
                                            Go to Resume Builder
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProfilePage;