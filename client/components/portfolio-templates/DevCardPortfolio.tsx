import React, { useState, useEffect } from 'react';
import { ResumeData } from '../../types';
import {
    FiGithub, FiLinkedin, FiMail, FiPhone, FiDownload,
    FiExternalLink, FiMenu, FiX, FiArrowUpRight,
    FiBriefcase, FiBookOpen, FiAward, FiStar
} from 'react-icons/fi';
import { printResume } from '../../utils/printResume';

interface DevCardPortfolioProps {
    data: ResumeData;
    readOnly?: boolean;
}

const DevCardPortfolio: React.FC<DevCardPortfolioProps> = ({ data, readOnly = false }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleDownloadPDF = () => printResume(data);

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        setMobileMenuOpen(false);
    };

    const navItems = [
        { id: 'home', label: 'Home' },
        { id: 'experience', label: 'Experience' },
        { id: 'projects', label: 'Projects' },
        { id: 'skills', label: 'Skills' },
        { id: 'contact', label: 'Contact' },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-gray-200 selection:bg-cyan-500/30 selection:text-cyan-100 relative overflow-hidden" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>

            {/* Background glow effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[800px] h-[600px] bg-cyan-500/[0.04] rounded-full blur-[150px]" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[500px] bg-blue-600/[0.03] rounded-full blur-[150px]" />
                <div className="absolute inset-0 opacity-[0.015]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(56,189,248,0.4) 1px, transparent 0)`,
                    backgroundSize: '32px 32px'
                }} />
            </div>

            {/* Download FAB */}
            {!readOnly && (
                <button
                    onClick={handleDownloadPDF}
                    className="fixed bottom-8 right-8 bg-cyan-500 text-[#0a0a0f] p-4 rounded-2xl shadow-2xl shadow-cyan-500/30 hover:bg-cyan-400 hover:shadow-cyan-400/40 transition-all z-50 hover:scale-110 active:scale-95 group"
                    title="Download as PDF"
                >
                    <FiDownload className="w-6 h-6 group-hover:animate-bounce" />
                </button>
            )}

            {/* Floating Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${isScrolled ? 'bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.06] shadow-2xl shadow-black/50' : 'bg-transparent'}`}>
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <button onClick={() => scrollToSection('home')} className="text-xl font-bold text-white tracking-tight">
                        {data.full_name.split(' ')[0]}
                        <span className="text-cyan-400">_</span>
                    </button>

                    <div className="hidden md:flex items-center gap-1 bg-white/[0.04] backdrop-blur-sm rounded-xl p-1 border border-white/[0.06]">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className="text-[13px] font-medium text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-white/[0.06] transition-all"
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-400 hover:text-white">
                        {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden bg-[#0f0f18]/95 backdrop-blur-xl border-t border-white/[0.06] p-4 space-y-1">
                        {navItems.map(item => (
                            <button key={item.id} onClick={() => scrollToSection(item.id)} className="block w-full text-left text-sm text-gray-400 hover:text-white px-4 py-3 rounded-xl hover:bg-white/[0.05] transition-all">
                                {item.label}
                            </button>
                        ))}
                    </div>
                )}
            </nav>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-6 relative z-10">

                {/* Hero */}
                <section id="home" className="min-h-screen flex flex-col justify-center pt-20 pb-16">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/[0.08] border border-cyan-500/20 rounded-full">
                                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                                <span className="text-cyan-400 text-sm font-medium">Available for new projects</span>
                            </div>

                            <div className="space-y-4">
                                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-[1.05] tracking-tight">
                                    {data.full_name}
                                </h1>
                                <p className="text-xl sm:text-2xl text-cyan-400 font-semibold">
                                    {data.job_title || 'Software Developer'}
                                </p>
                            </div>

                            <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
                                {data.summary}
                            </p>

                            <div className="flex flex-wrap gap-3">
                                <button onClick={() => scrollToSection('projects')} className="group px-7 py-3.5 bg-cyan-500 text-[#0a0a0f] font-bold rounded-xl hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2">
                                    View Projects <FiArrowUpRight className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </button>
                                <button onClick={handleDownloadPDF} className="px-7 py-3.5 bg-white/[0.05] text-white font-bold rounded-xl border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all backdrop-blur-sm flex items-center gap-2">
                                    <FiDownload /> Resume
                                </button>
                            </div>

                            <div className="flex gap-3 pt-2">
                                {data.linkedin_url && (
                                    <a href={data.linkedin_url} target="_blank" rel="noreferrer" className="group p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-gray-500 hover:text-[#0A66C2] hover:border-[#0A66C2]/30 hover:bg-[#0A66C2]/5 transition-all">
                                        <FiLinkedin className="w-5 h-5" />
                                    </a>
                                )}
                                {data.github_url && (
                                    <a href={data.github_url} target="_blank" rel="noreferrer" className="group p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-gray-500 hover:text-white hover:border-white/20 hover:bg-white/[0.06] transition-all">
                                        <FiGithub className="w-5 h-5" />
                                    </a>
                                )}
                                {data.email && (
                                    <a href={`mailto:${data.email}`} className="group p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-gray-500 hover:text-cyan-400 hover:border-cyan-400/30 hover:bg-cyan-400/5 transition-all">
                                        <FiMail className="w-5 h-5" />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Stats card */}
                        <div className="hidden lg:block">
                            <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8 w-72 backdrop-blur-sm space-y-6">
                                <div className="text-center">
                                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-cyan-500/20">
                                        {data.full_name.charAt(0)}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Projects', value: data.projects.length },
                                        { label: 'Skills', value: data.skills.length },
                                        { label: 'Experience', value: data.experience.length },
                                    ].map((stat, i) => (
                                        <div key={i} className="flex justify-between items-center py-2 border-b border-white/[0.04]">
                                            <span className="text-gray-500 text-sm">{stat.label}</span>
                                            <span className="text-cyan-400 font-bold text-lg">{stat.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Experience */}
                {data.experience.length > 0 && (
                    <section id="experience" className="py-24">
                        <div className="flex items-center gap-4 mb-14">
                            <div className="p-3 bg-cyan-500/10 rounded-xl">
                                <FiBriefcase className="text-cyan-400 w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-white">Experience</h2>
                                <p className="text-gray-500 text-sm mt-1">Where I've worked</p>
                            </div>
                            <div className="flex-grow h-px bg-gradient-to-r from-white/[0.06] to-transparent ml-4" />
                        </div>

                        <div className="space-y-4">
                            {data.experience.map((exp, index) => (
                                <div key={index} className="group relative bg-white/[0.02] border border-white/[0.05] hover:border-cyan-500/20 rounded-2xl p-7 transition-all duration-300 hover:bg-white/[0.03] hover:shadow-xl hover:shadow-cyan-500/[0.03]">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500/50 to-transparent rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">{exp.title}</h3>
                                            <p className="text-cyan-400/70 font-medium mt-1">{exp.company}</p>
                                        </div>
                                        <span className="text-sm text-gray-500 bg-white/[0.03] px-4 py-1.5 rounded-lg border border-white/[0.04] mt-3 sm:mt-0 whitespace-nowrap">{exp.startDate} — {exp.endDate}</span>
                                    </div>
                                    <p className="text-gray-400 leading-relaxed text-[15px] whitespace-pre-line">{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {data.projects.length > 0 && (
                    <section id="projects" className="py-24">
                        <div className="flex items-center gap-4 mb-14">
                            <div className="p-3 bg-cyan-500/10 rounded-xl">
                                <FiStar className="text-cyan-400 w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-white">Projects</h2>
                                <p className="text-gray-500 text-sm mt-1">Things I've built</p>
                            </div>
                            <div className="flex-grow h-px bg-gradient-to-r from-white/[0.06] to-transparent ml-4" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {data.projects.map((proj, index) => (
                                <div key={index} className="group relative bg-white/[0.02] border border-white/[0.05] hover:border-cyan-500/20 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/[0.03] flex flex-col">
                                    {/* Project header with gradient */}
                                    <div className="h-44 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 via-blue-600/5 to-transparent group-hover:from-cyan-600/20 group-hover:via-blue-600/10 transition-all duration-500" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="relative">
                                                <div className="text-7xl font-black text-white/[0.04] group-hover:text-cyan-400/[0.08] transition-all duration-500 select-none tracking-tighter uppercase">
                                                    {proj.name.substring(0, 3)}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Top bar dots */}
                                        <div className="absolute top-4 left-5 flex gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                                        </div>
                                    </div>

                                    <div className="p-7 flex-grow flex flex-col">
                                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">{proj.name}</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed mb-5 flex-grow">{proj.description}</p>
                                        {proj.link ? (
                                            <a href={proj.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group/link">
                                                <FiExternalLink className="w-4 h-4" /> View Live
                                                <FiArrowUpRight className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                            </a>
                                        ) : data.github_url ? (
                                            <a href={data.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-cyan-400 transition-colors">
                                                <FiGithub className="w-4 h-4" /> Source Code
                                            </a>
                                        ) : null}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills & Education */}
                <section id="skills" className="py-24">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Skills */}
                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2.5 bg-cyan-500/10 rounded-lg">
                                    <FiStar className="text-cyan-400 w-4 h-4" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Tech Stack</h2>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {data.skills.map((skill, index) => (
                                    <span key={index} className="px-4 py-2 bg-white/[0.03] border border-white/[0.06] text-gray-300 text-sm font-medium rounded-xl hover:border-cyan-500/30 hover:text-cyan-300 hover:bg-cyan-500/[0.05] transition-all cursor-default">
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Education */}
                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2.5 bg-cyan-500/10 rounded-lg">
                                    <FiBookOpen className="text-cyan-400 w-4 h-4" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Education</h2>
                            </div>
                            <div className="space-y-5">
                                {data.education.map((edu, index) => (
                                    <div key={index} className="relative pl-5 border-l-2 border-white/[0.06] hover:border-cyan-500/40 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-white text-[15px]">{edu.university}</h3>
                                            <span className="text-xs text-gray-600 ml-2 whitespace-nowrap">{edu.startDate} - {edu.endDate}</span>
                                        </div>
                                        <p className="text-cyan-400/70 text-sm">{edu.degree}</p>
                                    </div>
                                ))}
                                {data.certifications && data.certifications.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-white/[0.05]">
                                        <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-4">
                                            <FiAward className="text-cyan-400" /> Certifications
                                        </h3>
                                        {data.certifications.map((cert, index) => (
                                            <div key={index} className="flex items-start gap-3 text-sm text-gray-400 mb-3">
                                                <span className="text-cyan-500 mt-0.5">▸</span>
                                                <span><strong className="text-gray-300">{cert.name}</strong> <span className="text-gray-600">•</span> {cert.issuer}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact */}
                <footer id="contact" className="py-24 text-center">
                    <div className="max-w-xl mx-auto">
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-10 sm:p-14 space-y-6 backdrop-blur-sm">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/[0.08] border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-medium">
                                <FiMail className="w-4 h-4" /> Let's connect
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-white">Get in touch</h2>
                            <p className="text-gray-500 leading-relaxed">
                                Interested in working together? I'm always open to discussing new projects and creative ideas.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                                {data.email && (
                                    <a href={`mailto:${data.email}`} className="w-full sm:w-auto px-8 py-4 bg-cyan-500 text-[#0a0a0f] font-bold rounded-xl hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2">
                                        <FiMail /> Send Email
                                    </a>
                                )}
                                {data.phone && (
                                    <a href={`tel:${data.phone}`} className="w-full sm:w-auto px-8 py-4 bg-white/[0.05] text-white font-bold rounded-xl border border-white/[0.08] hover:bg-white/[0.08] transition-all flex items-center justify-center gap-2">
                                        <FiPhone /> {data.phone}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 text-gray-600 text-sm">
                        <p>© {new Date().getFullYear()} {data.full_name} · Built with BuildMyPortfolio</p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default DevCardPortfolio;
