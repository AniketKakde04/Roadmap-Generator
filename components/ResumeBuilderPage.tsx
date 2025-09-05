import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { getResume, upsertResume } from '../services/resumeService';
import { generateAIReply } from '../services/geminiService';
import { ResumeData, EducationEntry, ExperienceEntry, ProjectEntry, SkillEntry } from '../types';
import ResumePreview from './ResumePreview';
import Loader from './Loader';
import { supabase } from '../services/supabase';
import AccordionSection from './AccordionSection'; // Import the new component

const initialResumeState: ResumeData = {
    full_name: '', job_title: '', email: '', phone: '', linkedin_url: '', github_url: '',
    summary: '', education: [], experience: [], projects: [], skills: []
};

// --- THIS IS THE IMPROVED AI ASSIST MODAL ---
// It now displays multiple, selectable options.
const AIAssistModal = ({ suggestions, onClose, onInsert, loading }: { suggestions: string[], onClose: () => void, onInsert: (text: string) => void, loading: boolean }) => {
    const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
    
    useEffect(() => {
        if(suggestions.length > 0) {
            setSelectedSuggestion(suggestions[0]);
        }
    }, [suggestions]);

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-slate-800 border border-slate-700/50 rounded-2xl shadow-xl w-full max-w-2xl p-6 relative flex flex-col max-h-[90vh]">
                 <h3 className="text-lg font-bold text-sky-400 mb-4 flex-shrink-0">AI Suggestions</h3>
                 <div className="flex-grow overflow-y-auto">
                    {loading ? <Loader /> : (
                        <div className="space-y-3">
                            {suggestions.map((suggestion, index) => (
                                <div 
                                    key={index}
                                    onClick={() => setSelectedSuggestion(suggestion)}
                                    className={`p-4 rounded-md cursor-pointer transition-all ${selectedSuggestion === suggestion ? 'bg-sky-600/50 ring-2 ring-sky-500' : 'bg-slate-700/50 hover:bg-slate-700'}`}
                                >
                                    <p className="text-slate-300 whitespace-pre-wrap">{suggestion}</p>
                                </div>
                            ))}
                        </div>
                    )}
                 </div>
                 <div className="flex justify-end gap-4 mt-6 flex-shrink-0">
                    <button onClick={onClose} className="text-slate-400 hover:text-white">Cancel</button>
                    <button 
                        onClick={() => selectedSuggestion && onInsert(selectedSuggestion)} 
                        disabled={loading || !selectedSuggestion} 
                        className="bg-sky-600 text-white font-semibold py-2 px-5 rounded-md hover:bg-sky-500 disabled:bg-slate-600"
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
    const [exporting, setExporting] = useState(false);
    
    // Updated state for the new AI Assist Modal
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
                }
            } catch (error) { console.error("Failed to fetch resume:", error); } 
            finally { setLoading(false); }
        };
        fetchResume();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setResumeData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleArrayChange = <T extends { id: string }>(section: 'education' | 'experience' | 'projects' | 'skills', index: number, field: keyof T, value: string) => {
        setResumeData(prev => {
            const newSection = [...(prev[section] as T[])];
            newSection[index] = { ...newSection[index], [field]: value };
            return { ...prev, [section]: newSection };
        });
    };
    
    const addArrayItem = (section: 'education' | 'experience' | 'projects' | 'skills') => {
        let newItem: any;
        switch(section) {
            case 'education': newItem = { id: uuidv4(), university: '', degree: '', startDate: '', endDate: '' }; break;
            case 'experience': newItem = { id: uuidv4(), title: '', company: '', startDate: '', endDate: '', description: '' }; break;
            case 'projects': newItem = { id: uuidv4(), name: '', description: '' }; break;
            case 'skills': newItem = { id: uuidv4(), name: '' }; break;
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
             alert('Resume saved successfully!');
        } catch (error) {
             alert('Error saving resume. Please try again.');
        } finally {
            setSaving(false);
        }
    }, [resumeData]);
    
    const handleExportPDF = () => {
        setExporting(true);
        const input = document.getElementById('pdf-export-preview');
        if (input) {
            html2canvas(input, { scale: 2, useCORS: true, logging: false })
            .then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`${resumeData.full_name || 'resume'}.pdf`);
            }).catch(err => {
                alert("Sorry, something went wrong while exporting the PDF.");
            }).finally(() => {
                setExporting(false);
            });
        }
    };

    const handleAIAssist = async (section: 'summary' | 'experience', index?: number) => {
        setAiTarget({ section, index });
        setIsAIModalOpen(true);
        setAiLoading(true);
        setAiSuggestions([]); // Clear old suggestions
        
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
            <div className="absolute -left-[2000px] top-0 w-[210mm] h-[297mm]">
                 <div id="pdf-export-preview"><ResumePreview resumeData={resumeData} /></div>
            </div>

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
                <div className="w-full lg:w-1/2 xl:w-2/5 flex-shrink-0">
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4 p-2">
                            <h2 className="text-2xl font-bold">Resume Editor</h2>
                            <div className="flex gap-2">
                                <button onClick={handleSave} disabled={saving} className="bg-sky-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-sky-500 disabled:bg-slate-600">
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button onClick={handleExportPDF} disabled={exporting} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-500 disabled:bg-slate-600">
                                    {exporting ? '...' : 'Export PDF'}
                                </button>
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto">
                            <AccordionSection title="Personal Details" isOpenDefault={true}>
                                <div className="space-y-3 p-2">
                                    <input name="full_name" value={resumeData.full_name} onChange={handleInputChange} placeholder="Full Name" className="w-full bg-slate-700 p-2 rounded-md" />
                                    <input name="job_title" value={resumeData.job_title} onChange={handleInputChange} placeholder="Job Title (e.g., Full Stack Developer)" className="w-full bg-slate-700 p-2 rounded-md" />
                                    <input name="email" value={resumeData.email} onChange={handleInputChange} placeholder="Email" className="w-full bg-slate-700 p-2 rounded-md" />
                                    <input name="phone" value={resumeData.phone} onChange={handleInputChange} placeholder="Phone" className="w-full bg-slate-700 p-2 rounded-md" />
                                    <input name="linkedin_url" value={resumeData.linkedin_url} onChange={handleInputChange} placeholder="LinkedIn URL" className="w-full bg-slate-700 p-2 rounded-md" />
                                    <input name="github_url" value={resumeData.github_url} onChange={handleInputChange} placeholder="GitHub URL" className="w-full bg-slate-700 p-2 rounded-md" />
                                </div>
                            </AccordionSection>
                             <AccordionSection title="Summary">
                                <div className="space-y-2 p-2">
                                    <div className="flex justify-end items-center">
                                        <button onClick={() => handleAIAssist('summary')} disabled={aiLoading} className="text-xs bg-sky-700 py-1 px-2 rounded-md hover:bg-sky-600 disabled:bg-slate-600">
                                            {aiLoading ? 'Generating...' : 'AI Assist'}
                                        </button>
                                    </div>
                                    <textarea name="summary" value={resumeData.summary} onChange={handleInputChange} rows={6} placeholder="Professional summary..." className="w-full bg-slate-700 p-2 rounded-md" />
                                </div>
                            </AccordionSection>
                            <AccordionSection title="Experience">
                                 <div className="space-y-4 p-2">
                                    {resumeData.experience.map((exp, index) => (
                                        <div key={exp.id} className="p-3 bg-slate-700/50 rounded-lg space-y-3">
                                            <input value={exp.title} onChange={e => handleArrayChange('experience', index, 'title', e.target.value)} placeholder="Job Title" className="w-full bg-slate-600 p-2 rounded-md"/>
                                            <input value={exp.company} onChange={e => handleArrayChange('experience', index, 'company', e.target.value)} placeholder="Company" className="w-full bg-slate-600 p-2 rounded-md"/>
                                            <div className="flex gap-2">
                                                <input value={exp.startDate} onChange={e => handleArrayChange('experience', index, 'startDate', e.target.value)} placeholder="Start Date" className="w-full bg-slate-600 p-2 rounded-md"/>
                                                <input value={exp.endDate} onChange={e => handleArrayChange('experience', index, 'endDate', e.target.value)} placeholder="End Date" className="w-full bg-slate-600 p-2 rounded-md"/>
                                            </div>
                                             <div className="flex items-start">
                                                <textarea value={exp.description} onChange={e => handleArrayChange('experience', index, 'description', e.target.value)} rows={5} placeholder="Describe your role and achievements..." className="w-full bg-slate-600 p-2 rounded-md"/>
                                                <button onClick={() => handleAIAssist('experience', index)} disabled={aiLoading} title="AI Assist" className="text-xs bg-sky-700 h-8 ml-2 py-1 px-2 rounded-md hover:bg-sky-600 disabled:bg-slate-600 flex-shrink-0">
                                                    {aiLoading ? '...' : 'AI ✨'}
                                                </button>
                                            </div>
                                            <button onClick={() => removeArrayItem('experience', exp.id)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                                        </div>
                                    ))}
                                    <button onClick={() => addArrayItem('experience')} className="text-sm text-sky-400 hover:text-sky-300">+ Add Experience</button>
                                </div>
                            </AccordionSection>
                             <AccordionSection title="Projects">
                                <div className="space-y-4 p-2">
                                    {resumeData.projects.map((proj, index) => (
                                        <div key={proj.id} className="p-3 bg-slate-700/50 rounded-lg space-y-3">
                                            <input value={proj.name} onChange={e => handleArrayChange('projects', index, 'name', e.target.value)} placeholder="Project Name" className="w-full bg-slate-600 p-2 rounded-md"/>
                                            <textarea value={proj.description} onChange={e => handleArrayChange('projects', index, 'description', e.target.value)} rows={4} placeholder="Project description..." className="w-full bg-slate-600 p-2 rounded-md"/>
                                            <button onClick={() => removeArrayItem('projects', proj.id)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                                        </div>
                                    ))}
                                    <button onClick={() => addArrayItem('projects')} className="text-sm text-sky-400 hover:text-sky-300">+ Add Project</button>
                                </div>
                            </AccordionSection>
                             <AccordionSection title="Education">
                                 <div className="space-y-4 p-2">
                                    {resumeData.education.map((edu, index) => (
                                        <div key={edu.id} className="p-3 bg-slate-700/50 rounded-lg space-y-3">
                                            <input value={edu.university} onChange={e => handleArrayChange('education', index, 'university', e.target.value)} placeholder="University/School Name" className="w-full bg-slate-600 p-2 rounded-md"/>
                                            <input value={edu.degree} onChange={e => handleArrayChange('education', index, 'degree', e.target.value)} placeholder="Degree (e.g., Bachelor of Technology)" className="w-full bg-slate-600 p-2 rounded-md"/>
                                            <div className="flex gap-2">
                                                <input value={edu.startDate} onChange={e => handleArrayChange('education', index, 'startDate', e.target.value)} placeholder="Start Date" className="w-full bg-slate-600 p-2 rounded-md"/>
                                                <input value={edu.endDate} onChange={e => handleArrayChange('education', index, 'endDate', e.target.value)} placeholder="End Date" className="w-full bg-slate-600 p-2 rounded-md"/>
                                            </div>
                                            <button onClick={() => removeArrayItem('education', edu.id)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                                        </div>
                                    ))}
                                    <button onClick={() => addArrayItem('education')} className="text-sm text-sky-400 hover:text-sky-300">+ Add Education</button>
                                </div>
                            </AccordionSection>
                             <AccordionSection title="Skills">
                                <div className="space-y-3 p-2">
                                     <p className="text-xs text-slate-400">Add your skills one by one.</p>
                                    {resumeData.skills.map((skill, index) => (
                                        <div key={skill.id} className="flex items-center gap-2">
                                            <input value={skill.name} onChange={e => handleArrayChange('skills', index, 'name', e.target.value)} placeholder="Skill (e.g., React, Python)" className="w-full bg-slate-600 p-2 rounded-md"/>
                                            <button onClick={() => removeArrayItem('skills', skill.id)} className="text-red-400 hover:text-red-300 p-2 rounded-full bg-slate-700">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                    <button onClick={() => addArrayItem('skills')} className="text-sm text-sky-400 hover:text-sky-300">+ Add Skill</button>
                                </div>
                            </AccordionSection>
                        </div>
                    </div>
                </div>

                {/* Right Side: Preview */}
                <div className="w-full lg:w-1/2 xl:w-3/5 overflow-y-auto">
                    <ResumePreview resumeData={resumeData} />
                </div>
            </div>
        </>
    );
};

export default ResumeBuilderPage;

