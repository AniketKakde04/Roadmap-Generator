import React from 'react';
import { ResumeData } from '../types';
// --- NEW: Import icons ---
import { Mail, Phone, Linkedin, Github, Globe, MapPin } from 'lucide-react';

interface ResumePreviewProps {
    resumeData: ResumeData;
}

// --- PRESERVED: Original Header/Title for 'single-column', 'minimalist', 'creative' ---
const HeaderSection = ({ resumeData, templateType }: { resumeData: ResumeData, templateType?: string }) => {
    if (templateType === 'minimalist') {
        return (
            <div className="text-center mb-4">
                <h1 className="text-3xl font-light tracking-wider">{resumeData.full_name || 'Your Name'}</h1>
                <div className="w-20 h-0.5 bg-gray-400 mx-auto my-3"></div>
                <p className="text-gray-600">{resumeData.job_title || 'Target Job Title'}</p>

                <div className="flex justify-center space-x-4 mt-3 text-sm text-gray-500">
                    {resumeData.email && <span>{resumeData.email}</span>}
                    {resumeData.phone && <span>• {resumeData.phone}</span>}
                </div>
            </div>
        );
    }

    if (templateType === 'creative') {
        return (
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-500 text-white p-5 rounded-t-lg mb-4">
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold mb-2">{resumeData.full_name || 'Your Name'}</h1>
                    <p className="text-xl text-purple-100">{resumeData.job_title || 'Target Job Title'}</p>

                    <div className="flex flex-wrap gap-4 mt-4 text-sm">
                        {resumeData.email && <span className="bg-white/20 px-3 py-1 rounded-full">{resumeData.email}</span>}
                        {resumeData.phone && <span className="bg-white/20 px-3 py-1 rounded-full">{resumeData.phone}</span>}
                    </div>
                </div>
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-white/10 rounded-full"></div>
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full"></div>
            </div>
        );
    }

    // Default template (professional / 'single-column')
    return (
        <div className="text-center border-b-2 border-gray-200 pb-2 mb-4">
            <h1 className="text-4xl font-bold tracking-tight">{resumeData.full_name || 'Your Name'}</h1>
            <p className="text-xl text-sky-700 font-semibold">{resumeData.job_title || 'Target Job Title'}</p>
            <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-600">
                {resumeData.email && <span>{resumeData.email}</span>}
                {resumeData.phone && <><span>•</span><span>{resumeData.phone}</span></>}
                {resumeData.linkedin_url && <><span>•</span><a href={resumeData.linkedin_url} className="text-sky-700 hover:underline">LinkedIn</a></>}
            </div>
        </div>
    );
};

// This code is UNCHANGED and still used for your other templates.
const SectionTitle = ({ children, templateType }: { children: React.ReactNode, templateType?: string }) => {
    if (templateType === 'minimalist') {
        return (
            <h2 className="text-lg font-light tracking-wider border-b border-gray-300 pb-1 mb-3">
                {children}
            </h2>
        );
    }

    if (templateType === 'creative') {
        return (
            <h2 className="text-xl font-bold text-purple-700 mb-3 flex items-center">
                <span className="w-2 h-6 bg-purple-600 mr-2"></span>
                {children}
            </h2>
        );
    }

    // Default style ('single-column')
    return (
        <h2 className="text-lg font-bold uppercase tracking-wider text-sky-800 border-b-2 border-gray-200 pb-1 mb-2">
            {children}
        </h2>
    );
};


// --- NEW: Helper Components for the 'two-column' template ---

// Title for the dark sidebar
const SidebarSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-3">
        <h2 className="text-base font-bold uppercase tracking-wider text-sky-300 border-b-2 border-sky-300 pb-1 mb-2">
            {title}
        </h2>
        {children}
    </div>
);

// Title for the white main content area
const MainSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-3">
        <h2 className="text-lg font-bold uppercase tracking-wider text-sky-800 border-b-2 border-gray-300 pb-1 mb-2">
            {title}
        </h2>
        {children}
    </div>
);

// The new template component
const TwoColumnTemplate: React.FC<{ data: ResumeData }> = ({ data }) => (
    <div className="flex w-full min-h-[297mm]">
        {/* --- LEFT SIDEBAR --- */}
        <aside className="w-1/3 bg-slate-900 text-white p-4">
            {/* --- CONTACT --- */}
            <SidebarSection title="Contact">
                <div className="space-y-3 text-sm">
                    {data.email && (
                        <div className="flex items-center group">
                            <Mail className="w-4 h-4 mr-3 text-sky-400 group-hover:text-sky-300 transition-colors" />
                            <span className="text-slate-200 group-hover:text-white transition-colors">{data.email}</span>
                        </div>
                    )}
                    {data.phone && (
                        <div className="flex items-center group">
                            <Phone className="w-4 h-4 mr-3 text-sky-400 group-hover:text-sky-300 transition-colors" />
                            <span className="text-slate-200 group-hover:text-white transition-colors">{data.phone}</span>
                        </div>
                    )}
                    {data.linkedin_url && (
                        <div className="flex items-center group">
                            <Linkedin className="w-4 h-4 mr-3 text-sky-400 group-hover:text-sky-300 transition-colors" />
                            <a href={data.linkedin_url} className="text-slate-200 hover:text-white hover:underline transition-colors">LinkedIn</a>
                        </div>
                    )}
                    {data.github_url && (
                        <div className="flex items-center group">
                            <Github className="w-4 h-4 mr-3 text-sky-400 group-hover:text-sky-300 transition-colors" />
                            <a href={data.github_url} className="text-slate-200 hover:text-white hover:underline transition-colors">GitHub</a>
                        </div>
                    )}
                </div>
            </SidebarSection>

            {/* --- SKILLS --- */}
            {data.skills.length > 0 && (
                <SidebarSection title="Skills">
                    <div className="flex flex-wrap gap-2">
                        {data.skills.filter(s => s.name.trim()).map((s, index) => (
                            <span key={index} className="bg-slate-800 text-sky-100 px-2 py-1 rounded text-xs border border-slate-700">
                                {s.name}
                            </span>
                        ))}
                    </div>
                </SidebarSection>
            )}

            {/* --- EDUCATION --- */}
            {data.education.length > 0 && (
                <SidebarSection title="Education">
                    {data.education.map(edu => (
                        <div key={edu.id} className="mb-4 last:mb-0">
                            <h3 className="text-sm font-bold text-white leading-tight">{edu.degree}</h3>
                            <p className="text-xs font-medium text-sky-200 mt-1">{edu.university}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{edu.startDate} - {edu.endDate}</p>
                        </div>
                    ))}
                </SidebarSection>
            )}
        </aside>

        {/* --- RIGHT MAIN CONTENT --- */}
        <main className="w-2/3 bg-white p-4">
            {/* --- HEADER --- */}
            <div className="mb-5">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">{data.full_name || 'Your Name'}</h1>
                <p className="text-xl font-semibold text-sky-800">{data.job_title || 'Target Job Title'}</p>
            </div>

            {/* --- SUMMARY --- */}
            {data.summary && (
                <MainSection title="Summary">
                    <p className="text-sm text-gray-700">{data.summary}</p>
                </MainSection>
            )}

            {/* --- EXPERIENCE --- */}
            {data.experience.length > 0 && (
                <MainSection title="Experience">
                    {data.experience.map(exp => (
                        <div key={exp.id} className="mb-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-md font-bold">{exp.title}</h3>
                                    <p className="text-sm font-semibold text-gray-800">{exp.company}</p>
                                </div>
                                <p className="text-xs font-medium text-gray-600 flex-shrink-0 pt-1">{exp.startDate} - {exp.endDate}</p>
                            </div>
                            <ul className="list-disc pl-5 mt-1 text-sm text-gray-700">
                                {exp.description.split('\n').map((line, i) => line.trim() && <li key={i}>{line.replace(/^- /, '')}</li>)}
                            </ul>
                        </div>
                    ))}
                </MainSection>
            )}

            {/* --- PROJECTS --- */}
            {data.projects.length > 0 && (
                <MainSection title="Projects">
                    {data.projects.map(proj => (
                        <div key={proj.id} className="mb-3">
                            <h3 className="text-md font-bold">{proj.name}</h3>
                            <ul className="list-disc pl-5 mt-1 text-sm text-gray-700">
                                {proj.description.split('\n').map((line, i) => line.trim() && <li key={i}>{line.replace(/^- /, '')}</li>)}
                            </ul>
                        </div>
                    ))}
                </MainSection>
            )}

            {/* --- CERTIFICATIONS --- */}
            {data.certifications.length > 0 && (
                <MainSection title="Certifications">
                    {data.certifications.map(cert => (
                        <div key={cert.id} className="mb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-md font-bold">{cert.name}</h3>
                                    <p className="text-sm font-semibold text-gray-800">{cert.issuer}</p>
                                </div>
                                <p className="text-xs font-medium text-gray-600 flex-shrink-0 pt-1">{cert.date}</p>
                            </div>
                        </div>
                    ))}
                </MainSection>
            )}

            {/* --- ACHIEVEMENTS --- */}
            {data.achievements.length > 0 && (
                <MainSection title="Achievements">
                    <ul className="list-disc pl-5 mt-1 text-sm text-gray-700">
                        {data.achievements.map(ach => (
                            <li key={ach.id} className="mb-1">{ach.description}</li>
                        ))}
                    </ul>
                </MainSection>
            )}

        </main>
    </div>
);





// --- RIGHT SIDEBAR TEMPLATE (Modern, Blue Accents) ---
const RightSidebarTemplate: React.FC<{ data: ResumeData }> = ({ data }) => (
    <div className="flex w-full min-h-[297mm] font-sans bg-white">
        {/* MAIN CONTENT (Left, 65%) */}
        <main className="w-[65%] p-6 pt-6">
            {/* HEADER */}
            <div className="mb-5">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-1">{data.full_name}</h1>
                <p className="text-xl font-bold text-sky-600 mb-4">{data.job_title}</p>

                <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-600">
                    {data.phone && (
                        <div className="flex items-center">
                            <Phone className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
                            {data.phone}
                        </div>
                    )}
                    {data.email && (
                        <div className="flex items-center">
                            <Mail className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
                            {data.email}
                        </div>
                    )}
                    {data.linkedin_url && (
                        <div className="flex items-center">
                            <Linkedin className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
                            <a href={data.linkedin_url} className="hover:underline">LinkedIn</a>
                        </div>
                    )}
                </div>
            </div>

            {/* SUMMARY */}
            {data.summary && (
                <div className="mb-8">
                    <h3 className="text-sm font-extrabold uppercase tracking-wide border-b-2 border-black pb-2 mb-3">Summary</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>
                </div>
            )}

            {/* EXPERIENCE */}
            {data.experience.length > 0 && (
                <div className="mb-5">
                    <h3 className="text-sm font-extrabold uppercase tracking-wide border-b-2 border-black pb-2 mb-3">Experience</h3>
                    {data.experience.map(exp => (
                        <div key={exp.id} className="mb-3 last:mb-0">
                            <h4 className="text-base font-bold text-gray-900">{exp.title}</h4>
                            <div className="flex justify-between text-sm font-semibold text-sky-600 mb-2">
                                <span>{exp.company}</span>
                                <span>{exp.startDate} - {exp.endDate}</span>
                            </div>
                            <ul className="list-disc pl-4 space-y-1 text-sm text-gray-700 marker:text-gray-400">
                                {exp.description.split('\n').map((line, i) => line.trim() && <li key={i}>{line.replace(/^- /, '')}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {/* EDUCATION */}
            {data.education.length > 0 && (
                <div className="mb-5">
                    <h3 className="text-sm font-extrabold uppercase tracking-wide border-b-2 border-black pb-2 mb-3">Education</h3>
                    {data.education.map(edu => (
                        <div key={edu.id} className="mb-3">
                            <h4 className="text-base font-bold text-gray-900">{edu.degree}</h4>
                            <div className="text-sm font-semibold text-sky-600">{edu.university}</div>
                            <div className="text-xs text-gray-500 mt-1">{edu.startDate} - {edu.endDate}</div>
                        </div>
                    ))}
                </div>
            )}
        </main>

        {/* SIDEBAR (Right, 35%) */}
        <aside className="w-[35%] bg-white p-4 pt-6 border-l border-gray-100">
            {/* PHOTO PLACEHOLDER (Circle with Initials) */}
            <div className="mb-8 flex justify-center">
                <div className="w-32 h-32 rounded-full bg-sky-500 flex items-center justify-center text-white text-4xl font-bold tracking-tighter shadow-lg">
                    {data.full_name ? data.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'ME'}
                </div>
            </div>

            {/* ACHIEVEMENTS */}
            {data.achievements.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-sm font-extrabold uppercase tracking-wide border-b-2 border-black pb-2 mb-4">Key Achievements</h3>
                    <ul className="space-y-3">
                        {data.achievements.map(ach => (
                            <li key={ach.id} className="text-sm text-gray-700 flex items-start">
                                <Globe className="w-4 h-4 text-sky-500 mr-2 flex-shrink-0 mt-0.5" />
                                <span>{ach.description}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* SKILLS */}
            {data.skills.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-sm font-extrabold uppercase tracking-wide border-b-2 border-black pb-2 mb-4">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {data.skills.filter(s => s.name.trim()).map((s, i) => (
                            <span key={i} className="text-sm font-bold text-gray-700 border-b-2 border-gray-200 pb-0.5 px-1">
                                {s.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* PROJECTS */}
            {data.projects.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-sm font-extrabold uppercase tracking-wide border-b-2 border-black pb-2 mb-4">Projects</h3>
                    {data.projects.map(proj => (
                        <div key={proj.id} className="mb-4 text-sm">
                            <div className="font-bold text-gray-900 border-l-4 border-gray-900 pl-2 mb-1">{proj.name}</div>
                            <p className="text-gray-600 pl-3 text-xs leading-relaxed">{proj.description}</p>
                        </div>
                    ))}
                </div>
            )}
        </aside>
    </div>
);


// --- MAIN PREVIEW COMPONENT ---
const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData }) => {
    // Ensure resumeData and its arrays are not null/undefined
    const data = {
        ...resumeData,
        experience: resumeData.experience || [],
        projects: resumeData.projects || [],
        education: resumeData.education || [],
        skills: resumeData.skills || [],
        achievements: resumeData.achievements || [],
        certifications: resumeData.certifications || [],
    };

    const templateType = (data as any).templateType || 'single-column';

    // --- NEW: Render the new template if selected ---


    if (templateType === 'right-sidebar') {
        return (
            <div id="resume-preview" className="w-full h-full bg-white text-gray-800 rounded-lg shadow-lg overflow-y-auto">
                <RightSidebarTemplate data={data} />
            </div>
        );
    }

    if (templateType === 'two-column') {
        return (
            <div
                id="resume-preview"
                className="w-full h-full bg-white text-gray-800 rounded-lg shadow-lg overflow-y-auto font-sans"
            >
                <TwoColumnTemplate data={data} />
            </div>
        );
    }

    // --- FALLBACK: Render other templates as before ---
    return (
        <div
            id="resume-preview"
            className={`w-full h-full p-6 bg-white text-gray-800 rounded-lg shadow-lg overflow-y-auto font-sans ${templateType === 'minimalist' ? 'bg-gray-50' : ''
                }`}
        >
            <HeaderSection resumeData={data} templateType={templateType} />

            {data.summary && (
                <div className="mb-4">
                    <SectionTitle templateType={templateType}>Summary</SectionTitle>
                    <p className="text-sm text-gray-700">{data.summary}</p>
                </div>
            )}

            {data.education.length > 0 && (
                <div className="mb-4">
                    <SectionTitle templateType={templateType}>Education</SectionTitle>
                    {data.education.map(edu => (
                        <div key={edu.id} className="mb-2">
                            {/* UPDATED: Grouped University/Degree vs Date */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-md font-bold">{edu.university}</h3>
                                    <p className="text-sm font-semibold text-gray-800">{edu.degree}</p>
                                </div>
                                <p className="text-xs font-medium text-gray-600 flex-shrink-0 pt-1">{edu.startDate} - {edu.endDate}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {data.skills.length > 0 && (
                <div className="mb-4">
                    <SectionTitle templateType={templateType}>Skills</SectionTitle>
                    {/* UPDATED: Changed ' • ' to ' | ' and added filter */}
                    <p className="text-sm text-gray-700 leading-relaxed">
                        {data.skills.filter(s => s.name.trim()).map(s => s.name).join(' | ')}
                    </p>
                </div>
            )}

            {data.experience.length > 0 && (
                <div className="mb-4">
                    <SectionTitle templateType={templateType}>Experience</SectionTitle>
                    {data.experience.map(exp => (
                        <div key={exp.id} className="mb-2">
                            {/* UPDATED: Grouped Title/Company vs Date */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-md font-bold">{exp.title}</h3>
                                    <p className="text-sm font-semibold text-gray-800">{exp.company}</p>
                                </div>
                                <p className="text-xs font-medium text-gray-600 flex-shrink-0 pt-1">{exp.startDate} - {exp.endDate}</p>
                            </div>
                            <ul className="list-disc pl-5 mt-1 text-sm text-gray-700">
                                {exp.description.split('\n').map((line, i) => line.trim() && <li key={i}>{line.replace(/^- /, '')}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {data.projects.length > 0 && (
                <div className="mb-4">
                    <SectionTitle templateType={templateType}>Projects</SectionTitle>
                    {data.projects.map(proj => (
                        <div key={proj.id} className="mb-2">
                            <h3 className="text-md font-bold">{proj.name}</h3>
                            <ul className="list-disc pl-5 mt-1 text-sm text-gray-700">
                                {proj.description.split('\n').map((line, i) => line.trim() && <li key={i}>{line.replace(/^- /, '')}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {data.certifications.length > 0 && (
                <div className="mb-6">
                    <SectionTitle templateType={templateType}>Certifications</SectionTitle>
                    {data.certifications.map(cert => (
                        <div key={cert.id} className="mb-3">
                            {/* UPDATED: Grouped Name/Issuer vs Date */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-md font-bold">{cert.name}</h3>
                                    <p className="text-sm font-semibold text-gray-800">{cert.issuer}</p>
                                </div>
                                <p className="text-xs font-medium text-gray-600 flex-shrink-0 pt-1">{cert.date}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {data.achievements.length > 0 && (
                <div className="mb-6">
                    <SectionTitle templateType={templateType}>Achievements</SectionTitle>
                    <ul className="list-disc pl-5 mt-1 text-sm text-gray-700">
                        {data.achievements.map(ach => (
                            <li key={ach.id} className="mb-1">{ach.description}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ResumePreview;