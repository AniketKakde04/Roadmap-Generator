import React, { useState, useEffect } from 'react';
import { ResumeData } from '../types';
import {
    FiGithub, FiLinkedin, FiMail, FiPhone, FiDownload,
    FiExternalLink, FiMapPin, FiCalendar, FiAward,
    FiCheckCircle, FiMenu, FiX, FiArrowRight, FiBriefcase
} from 'react-icons/fi';
import { printResume } from '../utils/printResume';

interface PortfolioPreviewProps {
    data: ResumeData;
    readOnly?: boolean;
}

const PortfolioPreview: React.FC<PortfolioPreviewProps> = ({ data, readOnly = false }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');

    // Handle scroll for navbar and active section
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);

            // Determine active section
            const sections = ['home', 'experience', 'projects', 'skills', 'contact'];
            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= 100 && rect.bottom >= 100) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleDownloadPDF = () => {
        printResume(data);
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
            className={`text-sm font-medium transition-all px-4 py-2 rounded-full ${activeSection === to
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
        >
            {label}
        </button>
    );

    return (
        <div className="bg-slate-50 min-h-screen font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 relative">

            {/* --- FLOATING ACTION BUTTON (PDF) --- */}
            {!readOnly && (
                <button
                    id="download-fab"
                    onClick={handleDownloadPDF}
                    className="fixed bottom-8 right-8 bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-600 transition-all z-50 hover:scale-110 active:scale-95 group"
                    title="Download as PDF"
                >
                    <FiDownload className="w-6 h-6 group-hover:animate-bounce" />
                </button>
            )}

            {/* --- GLASS NAVBAR --- */}
            <nav
                id="portfolio-nav"
                className={`fixed top-4 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 w-[95%] rounded-full ${isScrolled
                    ? 'bg-white/80 backdrop-blur-xl shadow-lg border border-white/20 py-2 pl-6 pr-2'
                    : 'bg-transparent py-4 px-0'
                    }`}
            >
                <div className="flex justify-between items-center">
                    <div className={`font-bold tracking-tight text-xl ${isScrolled ? 'text-slate-900' : 'text-slate-900'} cursor-pointer`} onClick={() => scrollToSection('home')}>
                        {data.full_name.split(' ')[0]}<span className="text-indigo-600">.</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-1">
                        <NavLink to="home" label="Home" />
                        <NavLink to="experience" label="Experience" />
                        <NavLink to="projects" label="Projects" />
                        <NavLink to="skills" label="Skills" />
                        <NavLink to="contact" label="Contact" />
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden pr-4">
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600">
                            {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden p-2 flex flex-col gap-1 z-50">
                        <NavLink to="home" label="Home" />
                        <NavLink to="experience" label="Experience" />
                        <NavLink to="projects" label="Projects" />
                        <NavLink to="skills" label="Skills" />
                        <NavLink to="contact" label="Contact" />
                    </div>
                )}
            </nav>

            {/* --- MAIN CONTENT --- */}
            {/* --- MAIN CONTENT --- */}
            <div id="portfolio-content" className="w-full mx-auto px-4 sm:px-6 lg:px-12 overflow-hidden bg-slate-50">

                {/* --- 1. MODERN HERO SECTION --- */}
                <section id="home" className="min-h-screen flex flex-col justify-center items-center text-center pt-24 pb-12 relative">
                    <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-200/30 rounded-full blur-[100px] pointer-events-none" />

                    <div className="max-w-4xl z-10 mx-auto">
                        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-4">
                            {data.full_name}
                        </h1>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
                                {data.job_title || "Creative Professional"}
                            </span>
                        </h2>
                        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
                            {data.summary}
                        </p>

                        <div className="flex flex-wrap gap-4 justify-center">
                            <button onClick={() => scrollToSection('projects')} className="group px-8 py-4 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
                                View My Work <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button onClick={handleDownloadPDF} className="px-8 py-4 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                                <FiDownload /> Download Resume
                            </button>
                            <button onClick={() => scrollToSection('contact')} className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-semibold hover:border-slate-400 transition-all">
                                Get in Touch
                            </button>
                        </div>


                    </div>
                </section>

                {/* --- 2. EXPERIENCE TIMELINE --- */}
                {data.experience.length > 0 && (
                    <section id="experience" className="py-24 relative">
                        <div className="flex flex-col md:flex-row gap-12">
                            <div className="md:w-1/3 lg:w-1/4">
                                <h2 className="text-3xl font-bold text-slate-900 mb-6 md:sticky md:top-32">Experience.</h2>
                            </div>
                            <div className="md:w-2/3 lg:w-3/4 space-y-12">
                                {data.experience.map((exp, index) => (
                                    <div key={index} className="relative pl-8 border-l-2 border-indigo-100 group">
                                        <div className="absolute top-1.5 left-[-9px] w-4 h-4 bg-white border-4 border-indigo-500 rounded-full group-hover:scale-125 transition-transform" />
                                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex flex-wrap justify-between items-start mb-2">
                                                <h3 className="text-xl font-bold text-slate-900">{exp.title}</h3>
                                                <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{exp.startDate} - {exp.endDate}</span>
                                            </div>
                                            <div className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
                                                <FiBriefcase className="text-slate-400" />
                                                {exp.company}
                                            </div>
                                            <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">
                                                {exp.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* --- 3. PROJECT GRID --- */}
                {data.projects.length > 0 && (
                    <section id="projects" className="py-24">
                        <h2 className="text-3xl font-bold text-slate-900 mb-12">Featured Projects.</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {data.projects.map((proj, index) => (
                                <div key={index} className="group bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-300 h-full flex flex-col">
                                    <div className="h-64 bg-slate-100 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <h3 className="text-5xl font-black text-slate-900/5 group-hover:text-indigo-600/10 transition-colors uppercase tracking-tighter">
                                                {proj.name.substring(0, 2)}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="p-8 flex-grow flex flex-col">
                                        <h3 className="text-2xl font-bold text-slate-900 mb-3">{proj.name}</h3>
                                        <p className="text-slate-600 leading-relaxed mb-6 flex-grow">
                                            {proj.description}
                                        </p>
                                        <a href={data.github_url} className="inline-flex items-center text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                                            View Details <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* --- 4. SKILLS & EDUCATION --- */}
                <section id="skills" className="py-24 bg-slate-100 -mx-4 sm:-mx-6 lg:-mx-12 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
                    <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
                        {/* Skills */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-8">Skills.</h2>
                            <div className="flex flex-wrap gap-2">
                                {data.skills.map((skill, index) => (
                                    <span key={index} className="px-5 py-2.5 bg-white text-slate-700 font-medium rounded-xl border border-slate-200 shadow-sm hover:border-indigo-400 hover:text-indigo-600 transition-colors cursor-default">
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Education */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-8">Education.</h2>
                            <div className="space-y-6">
                                {data.education.map((edu, index) => (
                                    <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-slate-900">{edu.university}</h3>
                                            <span className="text-xs font-semibold bg-slate-100 px-2 py-1 rounded text-slate-600">{edu.startDate} - {edu.endDate}</span>
                                        </div>
                                        <p className="text-indigo-600 font-medium text-sm">{edu.degree}</p>
                                    </div>
                                ))}
                                {data.certifications && data.certifications.length > 0 && (
                                    <div className="mt-8">
                                        <h3 className="text-lg font-bold text-slate-900 mb-4">Certifications</h3>
                                        <div className="space-y-3">
                                            {data.certifications.map((cert, index) => (
                                                <div key={index} className="flex items-center gap-3 text-sm text-slate-600">
                                                    <FiCheckCircle className="text-emerald-500 shrink-0" />
                                                    <span>
                                                        <strong className="text-slate-800">{cert.name}</strong> • {cert.issuer}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- 5. CONTACT FOOTER --- */}
                <footer id="contact" className="py-24 text-center">
                    <div className="max-w-2xl mx-auto">
                        <div className="inline-block p-4 rounded-full bg-indigo-50 text-indigo-600 mb-6">
                            <FiMail className="w-6 h-6" />
                        </div>
                        <h2 className="text-4xl font-bold text-slate-900 mb-6">Let's build something together.</h2>
                        <p className="text-slate-600 mb-10 text-lg">
                            I'm currently looking for new opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!
                        </p>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                            {data.email && (
                                <a href={`mailto:${data.email}`} className="px-8 py-4 bg-slate-900 text-white rounded-full font-bold hover:bg-indigo-600 transition-colors shadow-lg w-full md:w-auto">
                                    Say Hello
                                </a>
                            )}
                            <div className="flex gap-4">
                                {data.linkedin_url && (
                                    <a href={data.linkedin_url} target="_blank" rel="noreferrer" className="p-4 bg-white border border-slate-200 rounded-full text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm hover:shadow-md">
                                        <FiLinkedin className="w-6 h-6" />
                                    </a>
                                )}
                                {data.github_url && (
                                    <a href={data.github_url} target="_blank" rel="noreferrer" className="p-4 bg-white border border-slate-200 rounded-full text-slate-600 hover:text-slate-900 hover:border-slate-400 transition-all shadow-sm hover:shadow-md">
                                        <FiGithub className="w-6 h-6" />
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="mt-20 pt-10 border-t border-slate-100 text-slate-400 text-sm">
                            <p>© {new Date().getFullYear()} {data.full_name}. Built with EduPathway.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default PortfolioPreview;