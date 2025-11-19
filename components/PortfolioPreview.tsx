import React from 'react';
import { ResumeData } from '../types';
import { FiGithub, FiLinkedin, FiMail, FiPhone, FiDownload, FiExternalLink, FiMapPin, FiCalendar, FiAward, FiCheckCircle } from 'react-icons/fi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PortfolioPreviewProps {
    data: ResumeData;
    readOnly?: boolean;
}

const PortfolioPreview: React.FC<PortfolioPreviewProps> = ({ data, readOnly = false }) => {
    
    const handleDownloadPDF = () => {
        const input = document.getElementById('portfolio-content');
        if (input) {
            const originalStyle = input.style.cssText;
            input.style.transform = 'none';
            input.style.boxShadow = 'none';
            
            html2canvas(input, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' })
            .then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                
                if (pdfHeight > pdf.internal.pageSize.getHeight()) {
                     pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                } else {
                     pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                }
                
                pdf.save(`${data.full_name || 'portfolio'}.pdf`);
                input.style.cssText = originalStyle;
            });
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen font-sans text-slate-900 selection:bg-primary/20">
            {!readOnly && (
                 <button 
                    onClick={handleDownloadPDF}
                    className="fixed bottom-8 right-8 bg-primary text-white p-4 rounded-full shadow-2xl hover:bg-secondary transition-all z-50 hover:scale-110 active:scale-95"
                    title="Download as PDF"
                >
                    <FiDownload className="w-6 h-6" />
                </button>
            )}

            <div id="portfolio-content" className="max-w-5xl mx-auto bg-white shadow-2xl my-8 md:my-16 md:rounded-3xl overflow-hidden border border-slate-100">
                
                {/* --- HERO HEADER --- */}
                <header className="relative bg-slate-900 text-white p-12 md:p-24 text-center overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary rounded-full blur-3xl opacity-20"></div>
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary rounded-full blur-3xl opacity-20"></div>

                    <div className="relative z-10">
                         <div className="w-36 h-36 mx-auto bg-gradient-to-br from-primary to-secondary p-1.5 rounded-full shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-500">
                            <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center text-5xl font-bold text-white border-4 border-slate-900">
                                {data.full_name.charAt(0)}
                            </div>
                         </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 leading-tight">{data.full_name}</h1>
                        <p className="text-xl md:text-3xl text-slate-300 font-light mb-10 tracking-wide">{data.job_title}</p>
                        
                        <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
                             {data.email && (
                                <a href={`mailto:${data.email}`} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-full transition-all backdrop-blur-md border border-white/5 hover:border-white/20">
                                    <FiMail className="w-4 h-4" /> {data.email}
                                </a>
                            )}
                            {data.phone && (
                                <span className="flex items-center gap-2 bg-white/10 px-5 py-2.5 rounded-full backdrop-blur-md border border-white/5 cursor-default">
                                    <FiPhone className="w-4 h-4" /> {data.phone}
                                </span>
                            )}
                            <span className="flex items-center gap-2 bg-white/10 px-5 py-2.5 rounded-full backdrop-blur-md border border-white/5 cursor-default">
                                <FiMapPin className="w-4 h-4" /> Open to Remote
                            </span>
                        </div>

                        <div className="flex justify-center gap-8 mt-10">
                            {data.linkedin_url && (
                                <a href={data.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white hover:scale-110 transition-all p-2">
                                    <FiLinkedin className="w-8 h-8" />
                                </a>
                            )}
                            {data.github_url && (
                                <a href={data.github_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white hover:scale-110 transition-all p-2">
                                    <FiGithub className="w-8 h-8" />
                                </a>
                            )}
                        </div>
                    </div>
                </header>

                <div className="p-8 md:p-20 space-y-20">
                    
                    {/* --- ABOUT SECTION --- */}
                    {data.summary && (
                        <section className="animate-fadeInUp max-w-3xl mx-auto text-center">
                            <h2 className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-6">About Me</h2>
                            <p className="text-xl md:text-2xl text-slate-700 leading-relaxed font-light">
                                "{data.summary}"
                            </p>
                        </section>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        
                        {/* --- LEFT COLUMN (Skills, Certs, Achievements) --- */}
                        <div className="lg:col-span-4 space-y-12">
                             {/* SKILLS */}
                            {data.skills.length > 0 && (
                                <section className="animate-fadeInUp" style={{ animationDelay: '100ms' }}>
                                    <h2 className="text-lg font-bold text-slate-900 border-l-4 border-primary pl-4 mb-6">Skills</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {data.skills.map((skill, index) => (
                                            <span 
                                                key={index} 
                                                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium border border-slate-200 hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-default"
                                            >
                                                {skill.name}
                                            </span>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* CERTIFICATIONS */}
                            {data.certifications && data.certifications.length > 0 && (
                                 <section className="animate-fadeInUp" style={{ animationDelay: '200ms' }}>
                                    <h2 className="text-lg font-bold text-slate-900 border-l-4 border-secondary pl-4 mb-6">Certifications</h2>
                                    <div className="space-y-4">
                                        {data.certifications.map((cert, index) => (
                                            <div key={index} className="group flex items-start p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                                <div className="mt-1 mr-3 flex-shrink-0 text-secondary">
                                                    <FiAward className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-slate-800 text-sm group-hover:text-secondary transition-colors leading-tight">{cert.name}</h4>
                                                    <p className="text-xs text-slate-500 mt-1">{cert.issuer} • {cert.date}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* ACHIEVEMENTS */}
                            {data.achievements && data.achievements.length > 0 && (
                                <section className="animate-fadeInUp" style={{ animationDelay: '250ms' }}>
                                    <h2 className="text-lg font-bold text-slate-900 border-l-4 border-yellow-500 pl-4 mb-6">Achievements</h2>
                                    <ul className="space-y-4">
                                        {data.achievements.map((ach, index) => (
                                            <li key={index} className="flex items-start text-sm text-slate-600">
                                                <FiCheckCircle className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                                                <span>{ach.description}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}
                        </div>

                        {/* --- RIGHT COLUMN (Experience, Projects, Education) --- */}
                        <div className="lg:col-span-8 space-y-20">
                            
                            {/* WORK EXPERIENCE */}
                            {data.experience.length > 0 && (
                                <section className="animate-fadeInUp" style={{ animationDelay: '300ms' }}>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-10 flex items-center gap-4">
                                        <span className="p-2 bg-primary/10 rounded-lg text-primary"><FiCalendar className="w-6 h-6" /></span>
                                        Experience
                                    </h2>
                                    <div className="space-y-12 border-l-2 border-slate-100 ml-3 pl-8 md:pl-12 relative">
                                        {data.experience.map((exp, index) => (
                                            <div key={index} className="relative group">
                                                {/* Timeline Dot */}
                                                <span className="absolute -left-[41px] md:-left-[57px] top-2 w-5 h-5 rounded-full border-4 border-white bg-slate-300 ring-1 ring-slate-200 group-hover:bg-primary group-hover:scale-125 transition-all duration-300"></span>
                                                
                                                <div className="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
                                                    <h3 className="text-xl font-bold text-slate-900">{exp.title}</h3>
                                                    <span className="text-sm font-semibold text-primary bg-primary/5 px-4 py-1 rounded-full mt-2 md:mt-0 w-fit border border-primary/10">
                                                        {exp.startDate} — {exp.endDate}
                                                    </span>
                                                </div>
                                                <p className="text-lg text-slate-500 font-medium mb-4">{exp.company}</p>
                                                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                                    {exp.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* PROJECTS */}
                            {data.projects.length > 0 && (
                                <section className="animate-fadeInUp" style={{ animationDelay: '400ms' }}>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-10 flex items-center gap-4">
                                        <span className="p-2 bg-secondary/10 rounded-lg text-secondary"><FiGithub className="w-6 h-6" /></span>
                                        Featured Projects
                                    </h2>
                                    <div className="grid grid-cols-1 gap-8">
                                        {data.projects.map((project, index) => (
                                            <div key={index} className="group bg-white border border-slate-100 p-8 rounded-3xl shadow-sm hover:shadow-2xl hover:border-secondary/20 transition-all duration-300 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary/5 to-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500"></div>
                                                
                                                <div className="relative z-10">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-secondary transition-colors">
                                                            {project.name}
                                                        </h3>
                                                        <FiExternalLink className="w-6 h-6 text-slate-300 group-hover:text-secondary transition-colors" />
                                                    </div>
                                                    <p className="text-slate-600 leading-relaxed">
                                                        {project.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                             {/* EDUCATION */}
                            {data.education.length > 0 && (
                                <section className="animate-fadeInUp" style={{ animationDelay: '500ms' }}>
                                     <h2 className="text-3xl font-bold text-slate-900 mb-10 flex items-center gap-4">
                                        <span className="p-2 bg-slate-100 rounded-lg text-slate-500"><FiMapPin className="w-6 h-6" /></span>
                                        Education
                                    </h2>
                                    <div className="grid gap-6">
                                        {data.education.map((edu, index) => (
                                            <div key={index} className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                                                <div>
                                                    <h4 className="text-lg font-bold text-slate-900">{edu.university}</h4>
                                                    <p className="text-slate-600 font-medium">{edu.degree}</p>
                                                </div>
                                                <div className="flex items-center gap-2 mt-3 md:mt-0 text-sm font-semibold text-slate-400 bg-white px-3 py-1 rounded-lg border border-slate-100 shadow-sm">
                                                    {edu.startDate} - {edu.endDate}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                        </div>
                    </div>
                </div>
                
                {/* --- FOOTER --- */}
                <footer className="bg-slate-900 text-slate-400 py-12 text-center border-t border-slate-800">
                    <div className="flex justify-center gap-8 mb-8">
                        {data.linkedin_url && <a href={data.linkedin_url} className="hover:text-white transition-colors"><FiLinkedin className="w-6 h-6" /></a>}
                        {data.github_url && <a href={data.github_url} className="hover:text-white transition-colors"><FiGithub className="w-6 h-6" /></a>}
                        {data.email && <a href={`mailto:${data.email}`} className="hover:text-white transition-colors"><FiMail className="w-6 h-6" /></a>}
                    </div>
                    <p className="text-sm">
                        © {new Date().getFullYear()} {data.full_name}. All rights reserved.
                    </p>
                    <p className="text-xs mt-2 opacity-30">
                        Designed with EduPath AI
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default PortfolioPreview;