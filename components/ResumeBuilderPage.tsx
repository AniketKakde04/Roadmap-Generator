import React, { useState, useEffect, useCallback } from 'react';
import { getResumeForUser, createInitialResume, updateResume } from '../services/resumeService';
import { generateAISummary, generateAIExperience } from '../services/geminiService';
import { ResumeData, EducationEntry, ExperienceEntry, ProjectEntry, SkillEntry } from '../types';
import ResumePreview from './ResumePreview';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Helper to generate unique IDs for new entries
const generateId = () => new Date().getTime().toString();

const ResumeBuilderPage: React.FC = () => {
    const [resumeData, setResumeData] = useState<ResumeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState<string>('personal');
    const [aiLoading, setAILoading] = useState(false);

    useEffect(() => {
        const loadResume = async () => {
            setLoading(true);
            try {
                let userResume = await getResumeForUser();
                if (!userResume) {
                    userResume = await createInitialResume();
                }
                setResumeData(userResume);
            } catch (error) {
                console.error("Failed to load resume:", error);
            } finally {
                setLoading(false);
            }
        };
        loadResume();
    }, []);
    
    const handleFieldChange = (field: keyof ResumeData, value: any) => {
        setResumeData(prev => (prev ? { ...prev, [field]: value } : null));
    };

    const handleSectionEntryChange = <T extends { id: string }>(section: keyof ResumeData, index: number, field: keyof T, value: any) => {
        setResumeData(prev => {
            if (!prev) return null;
            const sectionData = prev[section] as T[];
            const updatedSection = [...sectionData];
            updatedSection[index] = { ...updatedSection[index], [field]: value };
            return { ...prev, [section]: updatedSection };
        });
    };
    
    const addSectionEntry = (section: 'education' | 'experience' | 'projects' | 'skills') => {
        const newEntry: any = { id: generateId() };
        setResumeData(prev => prev ? { ...prev, [section]: [...(prev[section] as any[]), newEntry] } : null);
    };

    const removeSectionEntry = (section: keyof ResumeData, index: number) => {
        setResumeData(prev => {
            if (!prev) return null;
            const sectionData = prev[section] as any[];
            return { ...prev, [section]: sectionData.filter((_, i) => i !== index) };
        });
    };

    const handleSave = useCallback(async () => {
        if (!resumeData) return;
        setSaving(true);
        try {
            await updateResume(resumeData);
        } catch (error) {
            console.error("Failed to save resume:", error);
        } finally {
            setSaving(false);
        }
    }, [resumeData]);
    
    // Auto-save feature
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSave();
        }, 2000); // Save 2 seconds after the last change
        return () => clearTimeout(timer);
    }, [resumeData, handleSave]);
    
    const handleDownloadPdf = () => {
        const input = document.getElementById('resume-preview-content');
        if (input) {
            html2canvas(input, { scale: 2 }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`${resumeData?.fullName || 'resume'}.pdf`);
            });
        }
    };

    const handleAIAssist = async (type: 'summary' | 'experience', index?: number) => {
        if (!resumeData) return;
        setAILoading(true);
        try {
            if (type === 'summary') {
                const newSummary = await generateAISummary(resumeData.summary);
                handleFieldChange('summary', newSummary);
            }
            if (type === 'experience' && index !== undefined) {
                const exp = resumeData.experience[index];
                const newExpSummary = await generateAIExperience(exp.title, exp.company, exp.summary);
                handleSectionEntryChange('experience', index, 'summary', newExpSummary);
            }
        } catch (error) {
            console.error("AI Assist failed:", error);
        } finally {
            setAILoading(false);
        }
    };


    if (loading) return <div className="text-center p-10 text-xl font-semibold text-sky-300">Loading Resume Builder...</div>;

    return (
        <div className="w-full max-w-7xl mx-auto py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Panel: Forms */}
            <div className="lg:col-span-1 bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 h-fit">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Resume Builder</h2>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-400">{saving ? 'Saving...' : 'Auto-saved'}</span>
                         <button onClick={handleDownloadPdf} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-500 transition-colors">
                            Download
                        </button>
                    </div>
                </div>
                 {/* Accordion for sections */}
                <div className="space-y-2">
                    {/* Personal Details */}
                    <div className="bg-slate-700/50 rounded-lg">
                        <button onClick={() => setActiveSection(activeSection === 'personal' ? '' : 'personal')} className="w-full text-left p-4 font-semibold text-lg flex justify-between items-center">
                            Personal Details <span>{activeSection === 'personal' ? '-' : '+'}</span>
                        </button>
                        {activeSection === 'personal' && (
                            <div className="p-4 pt-0 space-y-3">
                                <input type="text" placeholder="Full Name" value={resumeData?.fullName || ''} onChange={(e) => handleFieldChange('fullName', e.target.value)} className="w-full bg-slate-800 p-2 rounded border border-slate-600 focus:ring-sky-500 focus:ring-2 focus:outline-none"/>
                                <input type="email" placeholder="Email" value={resumeData?.email || ''} onChange={(e) => handleFieldChange('email', e.target.value)} className="w-full bg-slate-800 p-2 rounded border border-slate-600 focus:ring-sky-500 focus:ring-2 focus:outline-none"/>
                                <input type="tel" placeholder="Phone" value={resumeData?.phone || ''} onChange={(e) => handleFieldChange('phone', e.target.value)} className="w-full bg-slate-800 p-2 rounded border border-slate-600 focus:ring-sky-500 focus:ring-2 focus:outline-none"/>
                                <input type="url" placeholder="LinkedIn URL" value={resumeData?.linkedin_url || ''} onChange={(e) => handleFieldChange('linkedin_url', e.target.value)} className="w-full bg-slate-800 p-2 rounded border border-slate-600 focus:ring-sky-500 focus:ring-2 focus:outline-none"/>
                                <input type="url" placeholder="GitHub URL" value={resumeData?.github_url || ''} onChange={(e) => handleFieldChange('github_url', e.target.value)} className="w-full bg-slate-800 p-2 rounded border border-slate-600 focus:ring-sky-500 focus:ring-2 focus:outline-none"/>
                            </div>
                        )}
                    </div>
                    {/* Summary */}
                    <div className="bg-slate-700/50 rounded-lg">
                         <button onClick={() => setActiveSection(activeSection === 'summary' ? '' : 'summary')} className="w-full text-left p-4 font-semibold text-lg flex justify-between items-center">
                            Professional Summary <span>{activeSection === 'summary' ? '-' : '+'}</span>
                        </button>
                        {activeSection === 'summary' && (
                             <div className="p-4 pt-0 space-y-2">
                                <textarea placeholder="A brief summary about you..." value={resumeData?.summary || ''} onChange={(e) => handleFieldChange('summary', e.target.value)} className="w-full bg-slate-800 p-2 rounded h-32 border border-slate-600 focus:ring-sky-500 focus:ring-2 focus:outline-none"/>
                                <button onClick={() => handleAIAssist('summary')} disabled={aiLoading} className="bg-sky-700 text-white font-semibold py-1 px-3 text-sm rounded-md hover:bg-sky-600 disabled:bg-slate-600">
                                    {aiLoading ? 'Generating...' : 'AI Assist'}
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* Experience */}
                    <div className="bg-slate-700/50 rounded-lg">
                         <button onClick={() => setActiveSection(activeSection === 'experience' ? '' : 'experience')} className="w-full text-left p-4 font-semibold text-lg flex justify-between items-center">
                            Work Experience <span>{activeSection === 'experience' ? '-' : '+'}</span>
                        </button>
                        {activeSection === 'experience' && resumeData?.experience && (
                             <div className="p-4 pt-0 space-y-4">
                                {resumeData.experience.map((exp, index) => (
                                    <div key={exp.id} className="p-3 bg-slate-800 rounded-md border border-slate-600 space-y-2">
                                        <input type="text" placeholder="Job Title" value={exp.title || ''} onChange={(e) => handleSectionEntryChange('experience', index, 'title', e.target.value)} className="w-full bg-slate-700 p-2 rounded" />
                                        <input type="text" placeholder="Company" value={exp.company || ''} onChange={(e) => handleSectionEntryChange('experience', index, 'company', e.target.value)} className="w-full bg-slate-700 p-2 rounded" />
                                        <div className="flex space-x-2">
                                            <input type="text" placeholder="City" value={exp.city || ''} onChange={(e) => handleSectionEntryChange('experience', index, 'city', e.target.value)} className="w-full bg-slate-700 p-2 rounded" />
                                            <input type="text" placeholder="State" value={exp.state || ''} onChange={(e) => handleSectionEntryChange('experience', index, 'state', e.target.value)} className="w-full bg-slate-700 p-2 rounded" />
                                        </div>
                                         <div className="flex space-x-2">
                                            <input type="text" placeholder="Start Date" value={exp.startDate || ''} onChange={(e) => handleSectionEntryChange('experience', index, 'startDate', e.target.value)} className="w-full bg-slate-700 p-2 rounded" />
                                            <input type="text" placeholder="End Date" value={exp.endDate || ''} onChange={(e) => handleSectionEntryChange('experience', index, 'endDate', e.target.value)} className="w-full bg-slate-700 p-2 rounded" />
                                        </div>
                                        <textarea placeholder="Key responsibilities and achievements..." value={exp.summary || ''} onChange={(e) => handleSectionEntryChange('experience', index, 'summary', e.target.value)} className="w-full bg-slate-700 p-2 rounded h-28" />
                                        <div className="flex justify-between items-center">
                                             <button onClick={() => handleAIAssist('experience', index)} disabled={aiLoading} className="bg-sky-700 text-white font-semibold py-1 px-3 text-sm rounded-md hover:bg-sky-600 disabled:bg-slate-600">
                                                {aiLoading ? '...' : 'AI Assist'}
                                            </button>
                                            <button onClick={() => removeSectionEntry('experience', index)} className="text-red-400 text-sm hover:text-red-300">Remove</button>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => addSectionEntry('experience')} className="bg-slate-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-slate-500">Add Experience</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Panel: Preview */}
            <div className="lg:col-span-1 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <div id="resume-preview-content" className="h-[29.7cm] w-[21cm] mx-auto scale-[0.8] origin-top">
                     <ResumePreview resumeData={resumeData} />
                </div>
            </div>
        </div>
    );
};

export default ResumeBuilderPage;

