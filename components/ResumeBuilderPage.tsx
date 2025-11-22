import React, { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getResume, upsertResume } from '../services/resumeService';
import { generateAIReply } from '../services/geminiService';
import { ResumeData, EducationEntry, ExperienceEntry, ProjectEntry, SkillEntry, AchievementEntry, CertificationEntry } from '../types';
import ResumePreview from './ResumePreview';
import Loader from './Loader';
import { supabase } from '../services/supabase';
import AccordionSection from './AccordionSection';
import { FiLayout, FiColumns, FiMinimize2, FiZap, FiDownload, FiSave } from 'react-icons/fi';
import { createRoot } from 'react-dom/client';

const initialResumeState: ResumeData = {
    full_name: '', job_title: '', email: '', phone: '', linkedin_url: '', github_url: '',
    summary: '', education: [], experience: [], projects: [], skills: [],
    achievements: [], certifications: []
};

// --- PRINT UTILITY FUNCTION ---
const printResume = (resumeData: ResumeData) => {
    // 1. Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    // 2. Get the iframe's document
    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    // 3. Write the HTML content
    // We need to inject the styles and the ResumePreview component into this new document.
    // Since ResumePreview is a React component, we need to render it into the iframe's body.
    
    doc.open();
    doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${resumeData.full_name || 'Resume'}</title>
            <style>
                /* RESET & BASE STYLES */
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
                
                body {
                    font-family: 'Inter', sans-serif;
                    margin: 0;
                    padding: 0;
                    background: white;
                    color: #1f2937; /* text-gray-800 */
                }

                /* TAILWIND-LIKE UTILITIES (Simplified for Print) */
                .text-center { text-align: center; }
                .font-bold { font-weight: 700; }
                .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
                .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
                .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
                .text-xs { font-size: 0.75rem; line-height: 1rem; }
                .mb-2 { margin-bottom: 0.5rem; }
                .mb-6 { margin-bottom: 1.5rem; }
                .p-8 { padding: 2rem; }
                .flex { display: flex; }
                .justify-center { justify-content: center; }
                .gap-4 { gap: 1rem; }
                .border-b-2 { border-bottom-width: 2px; }
                .border-gray-200 { border-color: #e5e7eb; }
                .text-sky-700 { color: #0369a1; }
                .text-purple-700 { color: #7e22ce; }
                .bg-gray-50 { background-color: #f9fafb; }
                .list-disc { list-style-type: disc; }
                .pl-5 { padding-left: 1.25rem; }
                .w-full { width: 100%; }
                .h-full { height: 100%; }

                /* PRINT SPECIFIC OVERRIDES */
                @media print {
                    @page {
                        margin: 0;
                        size: auto;
                    }
                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            </style>
            <!-- Inject Tailwind CSS CDN for full compatibility if needed, though inline styles are safer for speed -->
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body>
            <div id="print-root"></div>
        </body>
        </html>
    `);
    doc.close();

    // 4. Render the React Component into the iframe
    // We wait for the iframe to load (scripts/styles) before printing
    iframe.onload = () => {
        const printRoot = doc.getElementById('print-root');
        if (printRoot) {
            const root = createRoot(printRoot);
            // We wrap it in a div that mimics the 'preview' container style to ensure 1:1 look
            root.render(
                <div className="w-full h-full bg-white text-gray-800">
                    <ResumePreview resumeData={resumeData} />
                </div>
            );

            // Small delay to allow React to render the DOM, then print
            setTimeout(() => {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
                
                // Cleanup after print dialog closes (or immediately, browser handles the queue)
                // Ideally we wait, but removing immediately is fine in most modern browsers
                // setTimeout(() => document.body.removeChild(iframe), 1000);
            }, 500);
        }
    };
};


const AIAssistModal = ({ suggestions, onClose, onInsert, loading }: { suggestions: string[], onClose: () => void, onInsert: (text: string) => void, loading: boolean }) => {
    const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
    
    useEffect(() => {
        if(suggestions.length > 0) {
            setSelectedSuggestion(suggestions[0]);
        }
    }, [suggestions]);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-background border border-border rounded-2xl shadow-xl w-full max-w-2xl p-6 relative flex flex-col max-h-[90vh]">
                 <h3 className="text-lg font-bold text-primary mb-4 flex-shrink-0">AI Suggestions</h3>
                 <div className="flex-grow overflow-y-auto">
                    {loading ? <Loader /> : (
                        <div className="space-y-3">
                            {suggestions.map((suggestion, index) => (
                                <div 
                                    key={index}
                                    onClick={() => setSelectedSuggestion(suggestion)}
                                    className={`p-4 rounded-md cursor-pointer transition-all border ${selectedSuggestion === suggestion ? 'bg-primary/10 border-primary ring-1 ring-primary' : 'bg-background-secondary border-border hover:bg-background-hover'}`}
                                >
                                    <p className="text-text-primary whitespace-pre-wrap">{suggestion}</p>
                                </div>
                            ))}
                        </div>
                    )}
                 </div>
                 <div className="flex justify-end gap-4 mt-6 flex-shrink-0">
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">Cancel</button>
                    <button 
                        onClick={() => selectedSuggestion && onInsert(selectedSuggestion)} 
                        disabled={loading || !selectedSuggestion} 
                        className="bg-primary text-white font-semibold py-2 px-5 rounded-md hover:bg-secondary disabled:bg-background-accent disabled:text-text-secondary"
                    >
                        Insert Selected
                    </button>
                </div>
            </div>
        </div>
    );
};


const ResumeBuilderPage: React.FC = () => {
    const [resumeData, setResumeData] = useState<ResumeData>(initialResumeState);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
    const [aiTarget, setAiTarget] = useState<{ section: 'summary' | 'experience', index?: number } | null>(null);


    useEffect(() => {
        const fetchResume = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser(); 
                if (user) {
                    const data = await getResume(user.id);
                    if (data) setResumeData(data);
                    else setResumeData(initialResumeState);
                } else {
                    setResumeData(initialResumeState);
                }
            } catch (error) { 
                console.error("Failed to fetch resume:", error); 
                setResumeData(initialResumeState);
            } 
            finally { setLoading(false); }
        };
        fetchResume();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setResumeData(prev => ({ ...prev, [name]: value }));
    };
    
    type EducationKeys = keyof EducationEntry;
    type ExperienceKeys = keyof ExperienceEntry;
    type ProjectKeys = keyof ProjectEntry;
    type SkillKeys = keyof SkillEntry;
    type AchievementKeys = keyof AchievementEntry;
    type CertificationKeys = keyof CertificationEntry;

    const handleArrayChange = (
        section: 'education' | 'experience' | 'projects' | 'skills' | 'achievements' | 'certifications',
        index: number,
        field: EducationKeys | ExperienceKeys | ProjectKeys | SkillKeys | AchievementKeys | CertificationKeys,
        value: string
    ) => {
        setResumeData(prev => {
            const newSection = [...(prev[section] as any[])];
            newSection[index] = { ...newSection[index], [field]: value };
            return { ...prev, [section]: newSection };
        });
    };
    
    const addArrayItem = (section: 'education' | 'experience' | 'projects' | 'skills' | 'achievements' | 'certifications') => {
        let newItem: any;
        switch(section) {
            case 'education': newItem = { id: uuidv4(), university: '', degree: '', startDate: '', endDate: '' }; break;
            case 'experience': newItem = { id: uuidv4(), title: '', company: '', startDate: '', endDate: '', description: '' }; break;
            case 'projects': newItem = { id: uuidv4(), name: '', description: '' }; break;
            case 'skills': newItem = { id: uuidv4(), name: '' }; break;
            case 'achievements': newItem = { id: uuidv4(), description: '' }; break;
            case 'certifications': newItem = { id: uuidv4(), name: '', issuer: '', date: '' }; break;
            default: return;
        }
        setResumeData(prev => ({ ...prev, [section]: [...(prev[section] as any[]), newItem] }));
    };
    
    const removeArrayItem = (section: keyof ResumeData, id: string) => {
        setResumeData(prev => ({ ...prev, [section]: (prev[section] as any[]).filter(item => item.id !== id) }));
    };
    
    const handleSave = useCallback(async () => {
        setSaving(true);
        try {
            const updatedResume = await upsertResume(resumeData);
            setResumeData(updatedResume);
             // Replaced alert with console for better UX flow (add toast later)
             console.log('Resume saved successfully!');
        } catch (error) {
             console.error('Error saving resume. Please try again.');
        } finally {
            setSaving(false);
        }
    }, [resumeData]);
    
    // --- IMPROVED EXPORT HANDLER ---
    const handleExportPDF = () => {
        // Calls the dedicated print utility function
        printResume(resumeData);
    };

    const handleAIAssist = async (section: 'summary' | 'experience', index?: number) => {
        setAiTarget({ section, index });
        setIsAIModalOpen(true);
        setAiLoading(true);
        setAiSuggestions([]);
        
        let prompt = '';
        if (section === 'summary') {
            prompt = `Based on the following resume details, write a professional and compelling 2-3 sentence summary. Details: Job Title - "${resumeData.job_title}", Key Skills - "${resumeData.skills.map(s => s.name).join(', ')}".`;
        } else if (section === 'experience' && index !== undefined) {
            const exp = resumeData.experience[index];
            prompt = `Write 3-4 professional resume bullet points describing the responsibilities and achievements for a "${exp.title}" at "${exp.company}". Use the STAR method (Situation, Task, Action, Result) and focus on action verbs and quantifiable results where possible.`;
        }

        try {
            const aiResponse = await generateAIReply(prompt);
            setAiSuggestions(aiResponse);
        } catch (error) {
             setAiSuggestions(['Sorry, the AI assistant failed to generate a response. Please try again.']);
        } finally {
            setAiLoading(false);
        }
    };

    const handleInsertAISuggestion = (text: string) => {
        if (!aiTarget) return;
        if (aiTarget.section === 'summary') {
            setResumeData(prev => ({ ...prev, summary: text }));
        } else if (aiTarget.section === 'experience' && aiTarget.index !== undefined) {
            handleArrayChange('experience', aiTarget.index, 'description', text);
        }
        setIsAIModalOpen(false);
    };


    if (loading) return <Loader />;

    return (
        <>
            {isAIModalOpen && (
                <AIAssistModal 
                    suggestions={aiSuggestions}
                    onClose={() => setIsAIModalOpen(false)}
                    onInsert={handleInsertAISuggestion}
                    loading={aiLoading}
                />
            )}

            <div className="flex flex-col lg:flex-row gap-8 p-4 md:p-8 h-[calc(100vh-64px)]">
                {/* Left Side: Form Controls */}
                <div className="w-full lg:w-1/2 xl:w-2/5 flex-shrink-0 h-full flex flex-col">
                    <div className="bg-background-secondary p-4 rounded-xl border border-border h-full flex flex-col shadow-sm">
                        <div className="flex justify-between items-center mb-4 p-2 border-b border-border">
                            <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                                <FiLayout className="w-6 h-6" />
                                Editor
                            </h2>
                            <div className="flex gap-2">
                                <button onClick={handleSave} disabled={saving} className="bg-primary text-white font-semibold py-2 px-4 rounded-md hover:bg-secondary disabled:bg-background-accent disabled:text-text-secondary flex items-center gap-2 transition-all">
                                    <FiSave className="w-4 h-4" />
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button onClick={handleExportPDF} className="bg-success text-white font-semibold py-2 px-4 rounded-md hover:bg-opacity-90 flex items-center gap-2 transition-all shadow-sm hover:shadow-md">
                                    <FiDownload className="w-4 h-4" />
                                    Export PDF
                                </button>
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                            <AccordionSection title="Personal Details" isOpenDefault={true}>
                                <div className="space-y-3 p-2">
                                    <input name="full_name" value={resumeData.full_name} onChange={handleInputChange} placeholder="Full Name" className="w-full bg-background border border-border text-text-primary p-2 rounded-md focus:ring-2 focus:ring-primary outline-none" />
                                    <input name="job_title" value={resumeData.job_title} onChange={handleInputChange} placeholder="Job Title" className="w-full bg-background border border-border text-text-primary p-2 rounded-md focus:ring-2 focus:ring-primary outline-none" />
                                    <div className="flex gap-2">
                                        <input name="email" value={resumeData.email} onChange={handleInputChange} placeholder="Email" className="w-full bg-background border border-border text-text-primary p-2 rounded-md focus:ring-2 focus:ring-primary outline-none" />
                                        <input name="phone" value={resumeData.phone} onChange={handleInputChange} placeholder="Phone" className="w-full bg-background border border-border text-text-primary p-2 rounded-md focus:ring-2 focus:ring-primary outline-none" />
                                    </div>
                                    <div className="flex gap-2">
                                        <input name="linkedin_url" value={resumeData.linkedin_url} onChange={handleInputChange} placeholder="LinkedIn URL" className="w-full bg-background border border-border text-text-primary p-2 rounded-md focus:ring-2 focus:ring-primary outline-none" />
                                        <input name="github_url" value={resumeData.github_url} onChange={handleInputChange} placeholder="GitHub URL" className="w-full bg-background border border-border text-text-primary p-2 rounded-md focus:ring-2 focus:ring-primary outline-none" />
                                    </div>
                                </div>
                            </AccordionSection>
                             <AccordionSection title="Summary">
                                <div className="space-y-2 p-2">
                                    <div className="flex justify-end items-center">
                                        <button onClick={() => handleAIAssist('summary')} disabled={aiLoading} className="text-xs bg-primary/10 text-primary py-1 px-3 rounded-full hover:bg-primary hover:text-white transition-colors disabled:opacity-50 flex items-center gap-1">
                                            <FiZap className="w-3 h-3" />
                                            {aiLoading ? 'Generating...' : 'AI Assist'}
                                        </button>
                                    </div>
                                    <textarea name="summary" value={resumeData.summary} onChange={handleInputChange} rows={4} placeholder="Professional summary..." className="w-full bg-background border border-border text-text-primary p-2 rounded-md focus:ring-2 focus:ring-primary outline-none resize-none" />
                                </div>
                            </AccordionSection>
                            <AccordionSection title="Experience">
                                 <div className="space-y-4 p-2">
                                    {resumeData.experience.map((exp, index) => (
                                        <div key={exp.id} className="p-3 bg-background border border-border rounded-lg space-y-3 shadow-sm relative group">
                                            <div className="flex gap-2">
                                                <input value={exp.title} onChange={e => handleArrayChange('experience', index, 'title', e.target.value)} placeholder="Job Title" className="flex-1 bg-background-accent border-transparent p-2 rounded-md text-text-primary focus:bg-background focus:border-primary focus:ring-1 outline-none transition-all"/>
                                                <input value={exp.company} onChange={e => handleArrayChange('experience', index, 'company', e.target.value)} placeholder="Company" className="flex-1 bg-background-accent border-transparent p-2 rounded-md text-text-primary focus:bg-background focus:border-primary focus:ring-1 outline-none transition-all"/>
                                            </div>
                                            <div className="flex gap-2">
                                                <input value={exp.startDate} onChange={e => handleArrayChange('experience', index, 'startDate', e.target.value)} placeholder="Start Date" className="w-1/2 bg-background-accent border-transparent p-2 rounded-md text-text-primary focus:bg-background focus:border-primary focus:ring-1 outline-none transition-all"/>
                                                <input value={exp.endDate} onChange={e => handleArrayChange('experience', index, 'endDate', e.target.value)} placeholder="End Date" className="w-1/2 bg-background-accent border-transparent p-2 rounded-md text-text-primary focus:bg-background focus:border-primary focus:ring-1 outline-none transition-all"/>
                                            </div>
                                             <div className="relative">
                                                <textarea value={exp.description} onChange={e => handleArrayChange('experience', index, 'description', e.target.value)} rows={3} placeholder="Describe your role..." className="w-full bg-background-accent border-transparent p-2 rounded-md text-text-primary focus:bg-background focus:border-primary focus:ring-1 outline-none transition-all resize-none pr-8"/>
                                                <button onClick={() => handleAIAssist('experience', index)} disabled={aiLoading} title="AI Assist" className="absolute top-2 right-2 text-primary/70 hover:text-primary p-1 rounded-full hover:bg-primary/10 transition-colors">
                                                    <FiZap className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <button onClick={() => removeArrayItem('experience', exp.id)} className="text-xs text-error hover:text-red-600 font-medium mt-1">Remove Entry</button>
                                        </div>
                                    ))}
                                    <button onClick={() => addArrayItem('experience')} className="w-full py-2 border-2 border-dashed border-border text-text-secondary hover:text-primary hover:border-primary rounded-lg transition-colors text-sm font-medium">+ Add Experience</button>
                                </div>
                            </AccordionSection>
                             {/* ... Other sections (Projects, Education, Skills etc) follow same pattern ... */}
                             {/* Simplified for brevity, but you should keep all sections from your original file */}
                             <AccordionSection title="Projects">
                                <div className="space-y-4 p-2">
                                    {resumeData.projects.map((proj, index) => (
                                        <div key={proj.id} className="p-3 bg-background border border-border rounded-lg space-y-3 shadow-sm">
                                            <input value={proj.name} onChange={e => handleArrayChange('projects', index, 'name', e.target.value)} placeholder="Project Name" className="w-full bg-background-accent border-transparent p-2 rounded-md text-text-primary focus:bg-background focus:border-primary focus:ring-1 outline-none transition-all"/>
                                            <textarea value={proj.description} onChange={e => handleArrayChange('projects', index, 'description', e.target.value)} rows={3} placeholder="Project description..." className="w-full bg-background-accent border-transparent p-2 rounded-md text-text-primary focus:bg-background focus:border-primary focus:ring-1 outline-none transition-all resize-none"/>
                                            <button onClick={() => removeArrayItem('projects', proj.id)} className="text-xs text-error hover:text-red-600 font-medium">Remove</button>
                                        </div>
                                    ))}
                                    <button onClick={() => addArrayItem('projects')} className="w-full py-2 border-2 border-dashed border-border text-text-secondary hover:text-primary hover:border-primary rounded-lg transition-colors text-sm font-medium">+ Add Project</button>
                                </div>
                            </AccordionSection>
                             <AccordionSection title="Education">
                                 <div className="space-y-4 p-2">
                                    {resumeData.education.map((edu, index) => (
                                        <div key={edu.id} className="p-3 bg-background border border-border rounded-lg space-y-3 shadow-sm">
                                            <input value={edu.university} onChange={e => handleArrayChange('education', index, 'university', e.target.value)} placeholder="University/School Name" className="w-full bg-background-accent border-transparent p-2 rounded-md text-text-primary focus:bg-background focus:border-primary focus:ring-1 outline-none transition-all"/>
                                            <input value={edu.degree} onChange={e => handleArrayChange('education', index, 'degree', e.target.value)} placeholder="Degree" className="w-full bg-background-accent border-transparent p-2 rounded-md text-text-primary focus:bg-background focus:border-primary focus:ring-1 outline-none transition-all"/>
                                            <div className="flex gap-2">
                                                <input value={edu.startDate} onChange={e => handleArrayChange('education', index, 'startDate', e.target.value)} placeholder="Start Date" className="w-1/2 bg-background-accent border-transparent p-2 rounded-md text-text-primary focus:bg-background focus:border-primary focus:ring-1 outline-none transition-all"/>
                                                <input value={edu.endDate} onChange={e => handleArrayChange('education', index, 'endDate', e.target.value)} placeholder="End Date" className="w-1/2 bg-background-accent border-transparent p-2 rounded-md text-text-primary focus:bg-background focus:border-primary focus:ring-1 outline-none transition-all"/>
                                            </div>
                                            <button onClick={() => removeArrayItem('education', edu.id)} className="text-xs text-error hover:text-red-600 font-medium">Remove</button>
                                        </div>
                                    ))}
                                    <button onClick={() => addArrayItem('education')} className="w-full py-2 border-2 border-dashed border-border text-text-secondary hover:text-primary hover:border-primary rounded-lg transition-colors text-sm font-medium">+ Add Education</button>
                                </div>
                            </AccordionSection>
                             <AccordionSection title="Skills">
                                <div className="space-y-3 p-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        {resumeData.skills.map((skill, index) => (
                                            <div key={skill.id} className="flex items-center gap-1 bg-background-accent p-1 pl-2 rounded-md group">
                                                <input value={skill.name} onChange={e => handleArrayChange('skills', index, 'name', e.target.value)} placeholder="Skill" className="w-full bg-transparent border-none text-sm text-text-primary focus:ring-0 p-0 outline-none"/>
                                                <button onClick={() => removeArrayItem('skills', skill.id)} className="text-text-secondary hover:text-error p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => addArrayItem('skills')} className="w-full py-2 border-2 border-dashed border-border text-text-secondary hover:text-primary hover:border-primary rounded-lg transition-colors text-sm font-medium">+ Add Skill</button>
                                </div>
                            </AccordionSection>
                            
                             <AccordionSection title="Certifications">
                                <div className="space-y-4 p-2">
                                    {resumeData.certifications.map((cert, index) => (
                                        <div key={cert.id} className="p-3 bg-background border border-border rounded-lg space-y-3 shadow-sm">
                                            <input value={cert.name} onChange={e => handleArrayChange('certifications', index, 'name', e.target.value)} placeholder="Certification Name" className="w-full bg-background-accent border-transparent p-2 rounded-md text-text-primary focus:bg-background focus:border-primary focus:ring-1 outline-none transition-all"/>
                                            <div className="flex gap-2">
                                                <input value={cert.issuer} onChange={e => handleArrayChange('certifications', index, 'issuer', e.target.value)} placeholder="Issuer" className="w-2/3 bg-background-accent border-transparent p-2 rounded-md text-text-primary focus:bg-background focus:border-primary focus:ring-1 outline-none transition-all"/>
                                                <input value={cert.date} onChange={e => handleArrayChange('certifications', index, 'date', e.target.value)} placeholder="Date" className="w-1/3 bg-background-accent border-transparent p-2 rounded-md text-text-primary focus:bg-background focus:border-primary focus:ring-1 outline-none transition-all"/>
                                            </div>
                                            <button onClick={() => removeArrayItem('certifications', cert.id)} className="text-xs text-error hover:text-red-600 font-medium">Remove</button>
                                        </div>
                                    ))}
                                    <button onClick={() => addArrayItem('certifications')} className="w-full py-2 border-2 border-dashed border-border text-text-secondary hover:text-primary hover:border-primary rounded-lg transition-colors text-sm font-medium">+ Add Certification</button>
                                </div>
                            </AccordionSection>

                             <AccordionSection title="Achievements">
                                <div className="space-y-4 p-2">
                                    {resumeData.achievements.map((ach, index) => (
                                        <div key={ach.id} className="p-3 bg-background border border-border rounded-lg space-y-3 shadow-sm">
                                            <textarea value={ach.description} onChange={e => handleArrayChange('achievements', index, 'description', e.target.value)} rows={2} placeholder="e.g., '1st Place at XYZ Hackathon'" className="w-full bg-background-accent border-transparent p-2 rounded-md text-text-primary focus:bg-background focus:border-primary focus:ring-1 outline-none transition-all resize-none"/>
                                            <button onClick={() => removeArrayItem('achievements', ach.id)} className="text-xs text-error hover:text-red-600 font-medium">Remove</button>
                                        </div>
                                    ))}
                                    <button onClick={() => addArrayItem('achievements')} className="w-full py-2 border-2 border-dashed border-border text-text-secondary hover:text-primary hover:border-primary rounded-lg transition-colors text-sm font-medium">+ Add Achievement</button>
                                </div>
                            </AccordionSection>
                        </div>
                    </div>
                </div>

                {/* Right Side: Preview */}
                <div className="w-full lg:w-1/2 xl:w-3/5 overflow-y-auto flex flex-col">
                    <div className="flex items-center justify-between mb-4 p-2 bg-background-secondary border border-border rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                            <FiColumns className="w-5 h-5" />
                            Live Preview
                        </h3>
                        <div className="flex gap-1 bg-background p-1 rounded-md border border-border">
                            {[
                                { id: 1, name: 'Modern', icon: <FiLayout className="w-4 h-4" />, type: 'single-column' },
                                { id: 2, name: 'Split', icon: <FiColumns className="w-4 h-4" />, type: 'two-column' },
                                { id: 3, name: 'Minimal', icon: <FiMinimize2 className="w-4 h-4" />, type: 'minimalist' },
                                { id: 4, name: 'Bold', icon: <FiZap className="w-4 h-4" />, type: 'creative' }
                            ].map(template => (
                                <button
                                    key={template.id}
                                    onClick={() => setResumeData(prev => ({
                                        ...prev,
                                        templateType: template.type as any
                                    }))}
                                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                        (resumeData as any).templateType === template.type || 
                                        (!(resumeData as any).templateType && template.type === 'single-column')
                                            ? 'bg-primary text-white shadow-sm' 
                                            : 'text-text-secondary hover:bg-background-hover hover:text-text-primary'
                                    }`}
                                >
                                    {template.icon}
                                    <span className="hidden sm:inline">{template.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Preview Container with Aspect Ratio Lock */}
                    <div className="flex-1 bg-background-secondary/50 rounded-xl border border-border p-4 overflow-y-auto flex justify-center">
                        {/* The preview itself is styled to look like a sheet of paper */}
                        <div className="w-[210mm] min-h-[297mm] bg-white shadow-2xl transform scale-[0.45] sm:scale-[0.6] md:scale-[0.7] lg:scale-[0.8] origin-top transition-transform duration-300 ease-out">
                            <ResumePreview resumeData={resumeData} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ResumeBuilderPage;