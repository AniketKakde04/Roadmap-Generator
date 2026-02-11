import React, { useState, useEffect } from 'react';
import { ResumeData } from '../../types';
import {
    FiGithub, FiLinkedin, FiMail, FiPhone, FiDownload,
    FiExternalLink, FiArrowUpRight, FiMenu, FiX,
    FiBriefcase, FiAward, FiBookOpen, FiCode, FiLayers
} from 'react-icons/fi';
import { printResume } from '../../utils/printResume';

interface CleanPortfolioProps {
    data: ResumeData;
    readOnly?: boolean;
}

const CleanPortfolio: React.FC<CleanPortfolioProps> = ({ data, readOnly = false }) => {
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
        { id: 'about', label: 'About' },
        { id: 'experience', label: 'Experience' },
        { id: 'projects', label: 'Portfolio' },
        { id: 'skills', label: 'Skills' },
        { id: 'contact', label: 'Contact' },
    ];

    const purple = '#8A2BE2';

    return (
        <div className="min-h-screen bg-white text-gray-800 selection:bg-purple-200 selection:text-purple-900 relative overflow-hidden" style={{ fontFamily: "'Inter', 'Poppins', system-ui, sans-serif" }}>

            {/* Lavender gradient mesh background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-[#E8D5F5]/40 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-15%] left-[-5%] w-[600px] h-[600px] bg-[#D5E0F5]/30 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] left-[30%] w-[500px] h-[500px] bg-[#F0E0FF]/25 rounded-full blur-[150px]" />
            </div>

            {/* Download FAB */}
            {!readOnly && (
                <button
                    onClick={handleDownloadPDF}
                    className="fixed bottom-8 right-8 text-white p-4 rounded-full shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-110 active:scale-95 transition-all z-50 group"
                    style={{ backgroundColor: purple }}
                    title="Download as PDF"
                >
                    <FiDownload className="w-6 h-6 group-hover:animate-bounce" />
                </button>
            )}

            {/* Fixed Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    {/* Brand */}
                    <button onClick={() => scrollToSection('home')} className="text-xl font-bold tracking-tight text-gray-900">
                        {data.full_name.split(' ')[0]}
                        <span style={{ color: purple }}>.</span>
                    </button>

                    {/* Center links */}
                    <div className="hidden md:flex items-center gap-7">
                        {navItems.filter(i => i.id !== 'contact').map(item => (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className="text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Contact button */}
                    <button
                        onClick={() => scrollToSection('contact')}
                        className="hidden md:block text-[13px] font-semibold text-white px-5 py-2.5 rounded-full transition-all shadow-md shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-105"
                        style={{ backgroundColor: purple }}
                    >
                        Contact
                    </button>

                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-500">
                        {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 p-4 space-y-1 shadow-lg">
                        {navItems.map(item => (
                            <button key={item.id} onClick={() => scrollToSection(item.id)} className="block w-full text-left text-sm text-gray-500 hover:text-gray-900 px-4 py-3 rounded-xl hover:bg-purple-50 transition-all">
                                {item.label}
                            </button>
                        ))}
                    </div>
                )}
            </nav>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-6 relative z-10">

                {/* Hero Section — Split layout */}
                <section id="home" className="min-h-screen flex items-center pt-20 pb-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
                        {/* Left Column */}
                        <div className="space-y-7">
                            <p className="text-sm font-medium tracking-wide" style={{ color: purple }}>
                                Hello, I'm
                            </p>
                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 leading-[1.05] tracking-tight">
                                {data.full_name}
                            </h1>
                            <p className="text-lg text-gray-500 leading-relaxed max-w-md">
                                {data.summary || `A passionate ${data.job_title || 'developer'} crafting thoughtful digital experiences.`}
                            </p>
                            <div className="flex flex-wrap gap-4 pt-2">
                                <button
                                    onClick={() => scrollToSection('contact')}
                                    className="group px-8 py-3.5 text-white font-semibold rounded-full transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 flex items-center gap-2 text-sm"
                                    style={{ backgroundColor: purple }}
                                >
                                    Say Hello! <FiArrowUpRight className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </button>
                                <button
                                    onClick={handleDownloadPDF}
                                    className="px-8 py-3.5 text-gray-600 font-semibold rounded-full border border-gray-200 hover:border-purple-300 hover:text-purple-600 transition-all flex items-center gap-2 text-sm"
                                >
                                    <FiDownload /> Resume
                                </button>
                            </div>
                            <div className="flex gap-3 pt-2">
                                {data.linkedin_url && (
                                    <a href={data.linkedin_url} target="_blank" rel="noreferrer" className="p-2.5 text-gray-400 hover:text-[#0A66C2] transition-colors">
                                        <FiLinkedin className="w-5 h-5" />
                                    </a>
                                )}
                                {data.github_url && (
                                    <a href={data.github_url} target="_blank" rel="noreferrer" className="p-2.5 text-gray-400 hover:text-gray-900 transition-colors">
                                        <FiGithub className="w-5 h-5" />
                                    </a>
                                )}
                                {data.email && (
                                    <a href={`mailto:${data.email}`} className="p-2.5 text-gray-400 hover:text-purple-600 transition-colors">
                                        <FiMail className="w-5 h-5" />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Right Column — Decorative card */}
                        <div className="hidden lg:flex justify-center">
                            <div className="relative">
                                {/* Floating decorative blobs */}
                                <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full blur-2xl" style={{ backgroundColor: `${purple}15` }} />
                                <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full blur-3xl" style={{ backgroundColor: `${purple}10` }} />

                                {/* Main card */}
                                <div className="relative bg-white border border-gray-100 rounded-3xl shadow-xl shadow-purple-500/[0.06] p-8 w-80 space-y-6">
                                    {/* Avatar */}
                                    <div className="flex justify-center">
                                        <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-purple-500/20" style={{ background: `linear-gradient(135deg, ${purple}, #B06EF0)` }}>
                                            {data.full_name.charAt(0)}
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="font-bold text-gray-900 text-lg">{data.full_name}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{data.job_title || 'Developer'}</p>
                                    </div>

                                    {/* Stats grid */}
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { icon: <FiCode className="w-4 h-4" />, count: data.projects.length, label: 'Projects' },
                                            { icon: <FiBriefcase className="w-4 h-4" />, count: data.experience.length, label: 'Roles' },
                                            { icon: <FiLayers className="w-4 h-4" />, count: data.skills.length, label: 'Skills' },
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-purple-50/60 rounded-xl p-3 text-center">
                                                <div className="flex justify-center mb-1.5" style={{ color: purple }}>{stat.icon}</div>
                                                <div className="text-xl font-bold text-gray-900">{stat.count}</div>
                                                <div className="text-[11px] text-gray-500 font-medium">{stat.label}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Quick contact */}
                                    <button onClick={() => scrollToSection('contact')} className="w-full py-3 text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02]" style={{ backgroundColor: purple }}>
                                        Get in Touch
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* About */}
                <section id="about" className="py-24">
                    <div className="max-w-3xl mx-auto text-center">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: purple }}>About Me</p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                            {data.job_title || 'Developer'} & Problem Solver
                        </h2>
                        <p className="text-gray-500 text-lg leading-relaxed">
                            {data.summary}
                        </p>
                    </div>
                </section>

                {/* Experience */}
                {data.experience.length > 0 && (
                    <section id="experience" className="py-24">
                        <div className="text-center mb-16">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: purple }}>Career Path</p>
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Work Experience</h2>
                        </div>

                        <div className="max-w-3xl mx-auto space-y-0">
                            {data.experience.map((exp, index) => (
                                <div key={index} className="group relative pl-8 pb-10 last:pb-0 border-l-2 border-gray-100 hover:border-purple-200 transition-colors">
                                    {/* Timeline dot */}
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-[3px] border-white bg-gray-200 group-hover:bg-purple-500 transition-colors shadow-sm" />

                                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-purple-100 transition-all">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{exp.title}</h3>
                                                <p className="text-sm font-medium mt-0.5" style={{ color: purple }}>{exp.company}</p>
                                            </div>
                                            <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg whitespace-nowrap font-medium">{exp.startDate} — {exp.endDate}</span>
                                        </div>
                                        <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-line">{exp.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects / Portfolio */}
                {data.projects.length > 0 && (
                    <section id="projects" className="py-24">
                        <div className="text-center mb-16">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: purple }}>Portfolio</p>
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Featured Projects</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data.projects.map((proj, index) => (
                                <div key={index} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-purple-500/[0.06] hover:border-purple-100 transition-all duration-300 flex flex-col">
                                    {/* Project header */}
                                    <div className="h-44 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${purple}08, ${purple}15)` }}>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-8xl font-black select-none" style={{ color: `${purple}08` }}>
                                                {proj.name.charAt(0)}
                                            </span>
                                        </div>
                                        {/* Subtle corner accent */}
                                        <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-30" style={{ background: `linear-gradient(135deg, transparent, ${purple}20)` }} />
                                    </div>
                                    <div className="p-7 flex-grow flex flex-col">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">{proj.name}</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed mb-5 flex-grow">{proj.description}</p>
                                        {proj.link ? (
                                            <a href={proj.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all" style={{ color: purple }}>
                                                View Project <FiArrowUpRight className="w-4 h-4" />
                                            </a>
                                        ) : data.github_url ? (
                                            <a href={data.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-purple-600 transition-colors">
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
                    <div className="text-center mb-16">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: purple }}>Expertise</p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Skills & Education</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Skills */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 rounded-xl text-white" style={{ backgroundColor: purple }}>
                                    <FiLayers className="w-4 h-4" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Tech Stack</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {data.skills.map((skill, index) => (
                                    <span key={index} className="px-4 py-2 bg-purple-50/60 text-gray-700 text-sm font-medium rounded-full border border-purple-100/50 hover:bg-purple-100 hover:text-purple-700 transition-colors cursor-default">
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Education */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 rounded-xl text-white" style={{ backgroundColor: purple }}>
                                    <FiBookOpen className="w-4 h-4" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Education</h3>
                            </div>
                            <div className="space-y-5">
                                {data.education.map((edu, index) => (
                                    <div key={index} className="pl-5 border-l-2 border-purple-100">
                                        <h4 className="font-semibold text-gray-900 text-[15px]">{edu.university}</h4>
                                        <p className="text-sm mt-0.5" style={{ color: purple }}>{edu.degree}</p>
                                        <p className="text-xs text-gray-400 mt-1">{edu.startDate} – {edu.endDate}</p>
                                    </div>
                                ))}
                                {data.certifications && data.certifications.length > 0 && (
                                    <div className="mt-6 pt-5 border-t border-gray-100">
                                        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                                            <FiAward style={{ color: purple }} /> Certifications
                                        </h4>
                                        {data.certifications.map((cert, index) => (
                                            <div key={index} className="flex items-start gap-2 text-sm text-gray-500 mb-2">
                                                <span style={{ color: purple }} className="mt-0.5">•</span>
                                                <span><strong className="font-medium text-gray-700">{cert.name}</strong> — {cert.issuer}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact */}
                <footer id="contact" className="py-24">
                    <div className="relative rounded-3xl overflow-hidden p-10 sm:p-16 text-center text-white" style={{ background: `linear-gradient(135deg, ${purple}, #6B21A8)` }}>
                        {/* Subtle mesh on CTA */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
                        </div>

                        <div className="relative z-10">
                            <p className="text-sm font-medium text-white/70 uppercase tracking-[0.2em] mb-3">Get in Touch</p>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                                Let's Work Together
                            </h2>
                            <p className="text-white/70 text-lg mt-4 max-w-md mx-auto">
                                Have a project in mind? I'd love to hear from you. Let's create something amazing together.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
                                {data.email && (
                                    <a href={`mailto:${data.email}`} className="w-full sm:w-auto px-8 py-4 bg-white text-purple-700 font-bold rounded-full hover:bg-gray-50 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2 text-sm">
                                        <FiMail /> Say Hello!
                                    </a>
                                )}
                                {data.phone && (
                                    <a href={`tel:${data.phone}`} className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white font-bold rounded-full border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-2 text-sm backdrop-blur-sm">
                                        <FiPhone /> {data.phone}
                                    </a>
                                )}
                            </div>

                            <div className="flex gap-3 justify-center mt-8">
                                {data.linkedin_url && (
                                    <a href={data.linkedin_url} target="_blank" rel="noreferrer" className="p-3 border border-white/20 rounded-full text-white/60 hover:text-white hover:border-white/40 transition-all">
                                        <FiLinkedin className="w-5 h-5" />
                                    </a>
                                )}
                                {data.github_url && (
                                    <a href={data.github_url} target="_blank" rel="noreferrer" className="p-3 border border-white/20 rounded-full text-white/60 hover:text-white hover:border-white/40 transition-all">
                                        <FiGithub className="w-5 h-5" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 text-center text-gray-400 text-sm">
                        <p>© {new Date().getFullYear()} {data.full_name} · Built with BuildMyPortfolio</p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default CleanPortfolio;
