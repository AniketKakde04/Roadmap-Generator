import React, { useState, useEffect } from 'react';
import { ResumeData } from '../types';
import { 
    FiGithub, FiLinkedin, FiMail, FiPhone, FiDownload, 
    FiExternalLink, FiMapPin, FiCalendar, FiAward, 
    FiCheckCircle, FiMenu, FiX 
} from 'react-icons/fi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PortfolioPreviewProps {
    data: ResumeData;
    readOnly?: boolean;
}

const PortfolioPreview: React.FC<PortfolioPreviewProps> = ({ data, readOnly = false }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Handle scroll for navbar styling
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleDownloadPDF = () => {
        const input = document.getElementById('portfolio-content');
        if (input) {
            const originalStyle = input.style.cssText;
            input.style.width = '100%';
            input.style.maxWidth = 'none';
            
            const nav = document.getElementById('portfolio-nav');
            if (nav) nav.style.display = 'none';

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
                
                if (nav) nav.style.display = 'flex';
                input.style.cssText = originalStyle;
            });
        }
    };

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setMobileMenuOpen(false);
        }
    };

    const NavLink = ({ to, label }: { to: string, label: string }) => (
        <button 
            onClick={() => scrollToSection(to)}
            className="text-sm font-medium text-slate-600 hover:text-primary transition-colors px-4 py-2"
        >
            {label}
        </button>
    );

    return (
        <div className="bg-white min-h-screen font-sans text-slate-800 selection:bg-primary/20 relative">
            
            {/* --- FLOATING ACTION BUTTON (PDF) --- */}
            {!readOnly && (
                 <button 
                    onClick={handleDownloadPDF}
                    className="fixed bottom-8 right-8 bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:bg-primary transition-all z-50 hover:scale-110 active:scale-95 group"
                    title="Download as PDF"
                >
                    <FiDownload className="w-6 h-6 group-hover:animate-bounce" />
                </button>
            )}

            {/* --- NAVBAR --- */}
            <nav 
                id="portfolio-nav"
                className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'}`}
            >
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <div className="text-xl font-bold text-slate-900 tracking-tight truncate max-w-[200px]">
                        {data.full_name.split(' ')[0]}<span className="text-primary">.</span>
                    </div>
                    
                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-1">
                        <NavLink to="home" label="Home" />
                        <NavLink to="about" label="About" />
                        <NavLink to="projects" label="Projects" />
                        <NavLink to="experience" label="Experience" />
                        <NavLink to="contact" label="Contact" />
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600">
                            {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-slate-100 absolute w-full left-0 shadow-lg top-full">
                        <div className="flex flex-col p-4 space-y-2">
                            <NavLink to="home" label="Home" />
                            <NavLink to="about" label="About" />
                            <NavLink to="projects" label="Projects" />
                            <NavLink to="experience" label="Experience" />
                            <NavLink to="contact" label="Contact" />
                        </div>
                    </div>
                )}
            </nav>

            {/* --- MAIN CONTENT CONTAINER --- */}
            <div id="portfolio-content">
                
                {/* --- HERO SECTION --- */}
                {/* Adjusted padding-top to reduce gap between navbar and content */}
                <section id="home" className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-6 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-6 relative">
                                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-white border-4 border-white shadow-xl flex items-center justify-center overflow-hidden z-10 relative">
                                    <span className="text-4xl md:text-5xl font-bold text-slate-900">{data.full_name.charAt(0)}</span>
                                </div>
                                <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary/20 rounded-full blur-2xl"></div>
                                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-secondary/20 rounded-full blur-2xl"></div>
                            </div>
                            
                            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-3">
                                {data.full_name}
                            </h1>
                            <p className="text-lg md:text-2xl text-slate-500 font-medium mb-8 max-w-2xl">
                                {data.job_title}
                            </p>
                            
                            <div className="flex gap-4">
                                <button onClick={() => scrollToSection('projects')} className="px-6 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm md:text-base">
                                    View Work
                                </button>
                                <button onClick={() => scrollToSection('contact')} className="px-6 py-3 bg-white text-slate-900 border border-slate-200 rounded-full font-semibold hover:bg-slate-50 transition-colors text-sm md:text-base">
                                    Contact Me
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Decorative blobs */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none">
                        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
                    </div>
                </section>

                {/* --- ABOUT & SKILLS SECTION --- */}
                <section id="about" className="py-16 px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">About Me</h2>
                        </div>
                        
                        <div className="bg-slate-50 rounded-3xl p-8 md:p-12 mb-12">
                            <p className="text-lg text-slate-600 leading-relaxed text-center md:text-left">
                                {data.summary}
                            </p>
                        </div>

                        {/* Skills Grid */}
                        <div className="space-y-8">
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-slate-900 mb-6">Technical Proficiency</h3>
                            </div>
                            <div className="flex flex-wrap justify-center gap-3">
                                {data.skills.map((skill, index) => (
                                    <div 
                                        key={index} 
                                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-700 font-medium hover:border-primary/50 hover:shadow-md transition-all cursor-default text-sm"
                                    >
                                        {skill.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- PROJECTS SECTION (Grid Layout) --- */}
                {data.projects.length > 0 && (
                    <section id="projects" className="py-16 px-6 bg-slate-50">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex flex-col md:flex-row justify-between items-end mb-12 px-2">
                                <div>
                                    <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Portfolio</h2>
                                    <h3 className="text-3xl font-bold text-slate-900">Featured Projects</h3>
                                </div>
                                <a href={data.github_url} target="_blank" rel="noreferrer" className="hidden md:flex items-center text-slate-500 hover:text-primary transition-colors mt-4 md:mt-0">
                                    View GitHub <FiExternalLink className="ml-2" />
                                </a>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {data.projects.map((project, index) => (
                                    <div key={index} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-100 flex flex-col h-full">
                                        <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center group-hover:from-primary/5 group-hover:to-secondary/5 transition-colors relative overflow-hidden">
                                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-400 via-slate-100 to-transparent"></div>
                                            <h4 className="text-4xl font-bold text-slate-300/50 group-hover:text-primary/20 transition-colors">{project.name.substring(0, 2)}</h4>
                                        </div>
                                        <div className="p-6 flex-grow flex flex-col">
                                            <h4 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors">{project.name}</h4>
                                            <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">
                                                {project.description}
                                            </p>
                                            <div className="pt-4 border-t border-slate-100 flex items-center text-sm font-semibold text-primary">
                                                View Details <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* --- EXPERIENCE & EDUCATION (Split Layout) --- */}
                <section id="experience" className="py-16 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                            
                            {/* EXPERIENCE COLUMN */}
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-10 flex items-center">
                                    <span className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-4">
                                        <FiCalendar className="w-5 h-5" />
                                    </span>
                                    Experience
                                </h3>
                                <div className="space-y-12 border-l-2 border-slate-100 ml-5 pl-10 relative">
                                    {data.experience.map((exp, index) => (
                                        <div key={index} className="relative">
                                            <span className="absolute -left-[49px] top-1 w-4 h-4 rounded-full border-2 border-white bg-blue-500 ring-4 ring-blue-50"></span>
                                            <div className="mb-2">
                                                <h4 className="text-lg font-bold text-slate-900">{exp.title}</h4>
                                                <div className="flex flex-wrap gap-2 items-center text-sm mt-1">
                                                    <span className="font-semibold text-blue-600">{exp.company}</span>
                                                    <span className="text-slate-300">•</span>
                                                    <span className="text-slate-500">{exp.startDate} - {exp.endDate}</span>
                                                </div>
                                            </div>
                                            <p className="text-slate-600 leading-relaxed text-sm">
                                                {exp.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* EDUCATION & CERTS COLUMN */}
                            <div className="space-y-16">
                                {/* Education */}
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-10 flex items-center">
                                        <span className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-4">
                                            <FiAward className="w-5 h-5" />
                                        </span>
                                        Education
                                    </h3>
                                    <div className="space-y-6">
                                        {data.education.map((edu, index) => (
                                            <div key={index} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                                <h4 className="text-lg font-bold text-slate-900">{edu.university}</h4>
                                                <p className="text-slate-700 font-medium">{edu.degree}</p>
                                                <p className="text-sm text-slate-500 mt-2">{edu.startDate} - {edu.endDate}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Certifications */}
                                {data.certifications && data.certifications.length > 0 && (
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center">
                                            <span className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mr-4">
                                                <FiCheckCircle className="w-5 h-5" />
                                            </span>
                                            Certifications
                                        </h3>
                                        <div className="grid gap-4">
                                            {data.certifications.map((cert, index) => (
                                                <div key={index} className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                    <div className="flex-grow">
                                                        <h4 className="font-bold text-slate-900 text-sm">{cert.name}</h4>
                                                        <p className="text-xs text-slate-500">{cert.issuer}</p>
                                                    </div>
                                                    <span className="text-xs font-medium bg-white px-2 py-1 rounded border border-slate-200 text-slate-400">{cert.date}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- ACHIEVEMENTS SECTION --- */}
                {data.achievements && data.achievements.length > 0 && (
                    <section className="py-16 px-6 bg-slate-900 text-white">
                        <div className="max-w-4xl mx-auto text-center">
                            <h2 className="text-3xl font-bold mb-12">Honors & Achievements</h2>
                            <div className="grid gap-6">
                                {data.achievements.map((ach, index) => (
                                    <div key={index} className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm flex items-start text-left hover:bg-white/10 transition-colors">
                                        <FiAward className="w-6 h-6 text-yellow-400 mr-4 flex-shrink-0 mt-1" />
                                        <p className="text-slate-200 text-lg">{ach.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* --- FOOTER / CONTACT --- */}
                <footer id="contact" className="py-16 px-6 bg-white border-t border-slate-100">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <h2 className="text-3xl font-bold text-slate-900">Let's work together.</h2>
                        <p className="text-slate-500 text-lg max-w-lg mx-auto">
                            I'm currently looking for new opportunities. Feel free to reach out if you have a project or just want to say hi.
                        </p>
                        
                        <div className="flex flex-wrap justify-center gap-4">
                            {data.email && (
                                <a href={`mailto:${data.email}`} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full font-medium hover:bg-primary transition-colors">
                                    <FiMail /> {data.email}
                                </a>
                            )}
                            {data.linkedin_url && (
                                <a href={data.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-900 rounded-full font-medium hover:bg-slate-200 transition-colors">
                                    <FiLinkedin /> LinkedIn
                                </a>
                            )}
                        </div>

                        <div className="pt-12 flex flex-col items-center gap-4 text-slate-400 text-sm">
                            <div className="flex gap-6">
                                {data.github_url && <a href={data.github_url} className="hover:text-slate-900 transition-colors"><FiGithub className="w-5 h-5" /></a>}
                                {data.phone && <a href={`tel:${data.phone}`} className="hover:text-slate-900 transition-colors"><FiPhone className="w-5 h-5" /></a>}
                            </div>
                            <p>© {new Date().getFullYear()} {data.full_name}. All rights reserved.</p>
                            <p className="opacity-50 text-xs">Built with EduPath</p>
                        </div>
                    </div>
                </footer>

            </div>
        </div>
    );
};

export default PortfolioPreview;