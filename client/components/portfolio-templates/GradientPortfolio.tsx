import React, { useState, useEffect } from 'react';
import { ResumeData } from '../../types';
import {
    FiGithub, FiLinkedin, FiMail, FiPhone, FiDownload,
    FiExternalLink, FiArrowRight, FiMenu, FiX,
    FiBriefcase, FiCheckCircle, FiAward
} from 'react-icons/fi';
import { printResume } from '../../utils/printResume';

interface GradientPortfolioProps {
    data: ResumeData;
    readOnly?: boolean;
}

const GradientPortfolio: React.FC<GradientPortfolioProps> = ({ data, readOnly = false }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('home');

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
            const sections = ['home', 'experience', 'projects', 'skills', 'contact'];
            for (const section of sections) {
                const el = document.getElementById(section);
                if (el) {
                    const rect = el.getBoundingClientRect();
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
        <div className="min-h-screen bg-gray-950 text-white selection:bg-purple-500/30 relative overflow-hidden" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

            {/* Fixed gradient orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px]" />
                <div className="absolute top-[40%] right-[-15%] w-[500px] h-[500px] bg-pink-600/15 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] left-[30%] w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[150px]" />
            </div>

            {/* FAB */}
            {!readOnly && (
                <button
                    onClick={handleDownloadPDF}
                    className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-600 to-pink-500 text-white p-4 rounded-2xl shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all z-50 hover:scale-110 active:scale-95 group"
                    title="Download as PDF"
                >
                    <FiDownload className="w-6 h-6 group-hover:animate-bounce" />
                </button>
            )}

            {/* Glassmorphism Navbar */}
            <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 w-[95%] max-w-5xl rounded-2xl ${isScrolled ? 'bg-gray-900/70 backdrop-blur-xl shadow-xl shadow-purple-500/5 border border-white/10 py-2 px-6' : 'bg-transparent py-4 px-2'}`}>
                <div className="flex justify-between items-center">
                    <button onClick={() => scrollToSection('home')} className="font-bold text-xl text-white">
                        {data.full_name.split(' ')[0]}<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">.</span>
                    </button>

                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className={`text-sm font-medium px-4 py-2 rounded-xl transition-all ${activeSection === item.id
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-400">
                        {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden mt-3 bg-gray-900/90 backdrop-blur-xl rounded-xl border border-white/10 p-3 space-y-1">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className={`block w-full text-left text-sm px-4 py-3 rounded-lg transition-all ${activeSection === item.id ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-12">

                {/* Hero */}
                <section id="home" className="min-h-screen flex flex-col justify-center items-center text-center pt-24 pb-12">
                    <div className="max-w-4xl space-y-8">
                        {/* Gradient pill */}
                        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" />
                            <span className="text-sm text-gray-300">{data.job_title || 'Creative Professional'}</span>
                        </div>

                        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[1.05] tracking-tight">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-pink-200">
                                {data.full_name}
                            </span>
                        </h1>

                        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            {data.summary}
                        </p>

                        <div className="flex flex-wrap gap-4 justify-center pt-4">
                            <button onClick={() => scrollToSection('projects')} className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl font-semibold hover:shadow-xl hover:shadow-purple-500/25 transition-all flex items-center gap-2">
                                Explore My Work <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button onClick={handleDownloadPDF} className="px-8 py-4 bg-white/5 backdrop-blur text-white border border-white/10 rounded-2xl font-semibold hover:bg-white/10 transition-all flex items-center gap-2">
                                <FiDownload /> Download CV
                            </button>
                            <button onClick={() => scrollToSection('contact')} className="px-8 py-4 bg-transparent text-purple-400 border border-purple-500/30 rounded-2xl font-semibold hover:bg-purple-500/10 transition-all">
                                Say Hello
                            </button>
                        </div>

                        {/* Social */}
                        <div className="flex gap-3 justify-center pt-4">
                            {data.linkedin_url && (
                                <a href={data.linkedin_url} target="_blank" rel="noreferrer" className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-500 hover:text-blue-400 hover:border-blue-400/30 hover:bg-blue-400/5 transition-all backdrop-blur">
                                    <FiLinkedin className="w-5 h-5" />
                                </a>
                            )}
                            {data.github_url && (
                                <a href={data.github_url} target="_blank" rel="noreferrer" className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-500 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all backdrop-blur">
                                    <FiGithub className="w-5 h-5" />
                                </a>
                            )}
                            {data.email && (
                                <a href={`mailto:${data.email}`} className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-500 hover:text-purple-400 hover:border-purple-400/30 hover:bg-purple-400/5 transition-all backdrop-blur">
                                    <FiMail className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>
                </section>

                {/* Experience */}
                {data.experience.length > 0 && (
                    <section id="experience" className="py-24">
                        <div className="text-center mb-16">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-sm font-bold uppercase tracking-[0.2em]">Career Path</span>
                            <h2 className="text-4xl font-bold text-white mt-3">Experience</h2>
                        </div>

                        <div className="space-y-6 max-w-4xl mx-auto">
                            {data.experience.map((exp, index) => (
                                <div key={index} className="group bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-500/30 rounded-2xl p-6 sm:p-8 transition-all hover:shadow-lg hover:shadow-purple-500/5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                                        <h3 className="text-xl font-bold text-white">{exp.title}</h3>
                                        <span className="text-sm text-purple-400 font-semibold bg-purple-500/10 px-4 py-1 rounded-full mt-2 sm:mt-0">{exp.startDate} — {exp.endDate}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400 mb-4 text-sm font-medium">
                                        <FiBriefcase className="text-pink-400" />
                                        {exp.company}
                                    </div>
                                    <p className="text-gray-400 leading-relaxed text-sm whitespace-pre-line">{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {data.projects.length > 0 && (
                    <section id="projects" className="py-24">
                        <div className="text-center mb-16">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-sm font-bold uppercase tracking-[0.2em]">Creative Works</span>
                            <h2 className="text-4xl font-bold text-white mt-3">Featured Projects</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {data.projects.map((proj, index) => (
                                <div key={index} className="group bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-500/30 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:translate-y-[-4px] flex flex-col">
                                    {/* Gradient header */}
                                    <div className="h-48 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 via-pink-500/20 to-orange-400/10 group-hover:from-purple-600/50 group-hover:via-pink-500/30 group-hover:to-orange-400/20 transition-all duration-500" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-7xl font-black text-white/5 group-hover:text-white/10 transition-colors select-none uppercase tracking-tighter">
                                                {proj.name.substring(0, 2)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6 sm:p-8 flex-grow flex flex-col">
                                        <h3 className="text-xl font-bold text-white mb-3">{proj.name}</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">{proj.description}</p>
                                        {proj.link ? (
                                            <a href={proj.link} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-300 hover:to-pink-300 transition-colors">
                                                View Project <FiArrowRight className="ml-2 text-purple-400" />
                                            </a>
                                        ) : (
                                            <a href={data.github_url} className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-purple-400 transition-colors">
                                                View Details <FiArrowRight className="ml-2" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills & Education */}
                <section id="skills" className="py-24">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 sm:p-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Skills */}
                            <div>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-sm font-bold uppercase tracking-[0.2em]">Toolkit</span>
                                <h2 className="text-2xl font-bold text-white mt-2 mb-8">Skills</h2>
                                <div className="flex flex-wrap gap-2">
                                    {data.skills.map((skill, index) => (
                                        <span key={index} className="px-5 py-2.5 bg-white/5 border border-white/10 text-gray-300 font-medium rounded-full text-sm hover:border-purple-500/30 hover:text-purple-300 hover:bg-purple-500/5 transition-all cursor-default">
                                            {skill.name}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Education */}
                            <div>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-sm font-bold uppercase tracking-[0.2em]">Learning</span>
                                <h2 className="text-2xl font-bold text-white mt-2 mb-8">Education</h2>
                                <div className="space-y-6">
                                    {data.education.map((edu, index) => (
                                        <div key={index} className="bg-white/5 border border-white/5 rounded-xl p-5">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-bold text-white">{edu.university}</h3>
                                                <span className="text-xs text-gray-500 font-medium ml-2 whitespace-nowrap">{edu.startDate} - {edu.endDate}</span>
                                            </div>
                                            <p className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-medium text-sm">{edu.degree}</p>
                                        </div>
                                    ))}
                                    {data.certifications && data.certifications.length > 0 && (
                                        <div className="mt-6 pt-6 border-t border-white/5">
                                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                                <FiAward className="text-pink-400" /> Certifications
                                            </h3>
                                            {data.certifications.map((cert, index) => (
                                                <div key={index} className="flex items-center gap-3 text-sm text-gray-400 mb-2">
                                                    <FiCheckCircle className="text-emerald-400 shrink-0" />
                                                    <span><strong className="text-gray-300">{cert.name}</strong> • {cert.issuer}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact */}
                <footer id="contact" className="py-24 text-center">
                    <div className="max-w-2xl mx-auto space-y-8">
                        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium">
                            <FiMail className="w-4 h-4" /> Open to Opportunities
                        </div>
                        <h2 className="text-4xl sm:text-5xl font-bold">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
                                Let's build something amazing.
                            </span>
                        </h2>
                        <p className="text-gray-400 text-lg">
                            Got a project in mind? Want to collaborate? Or just want to say hello? Feel free to reach out!
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {data.email && (
                                <a href={`mailto:${data.email}`} className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-purple-500/25 transition-all w-full sm:w-auto">
                                    Send a Message ✨
                                </a>
                            )}
                            {data.phone && (
                                <a href={`tel:${data.phone}`} className="px-8 py-4 bg-white/5 backdrop-blur border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all w-full sm:w-auto flex items-center justify-center gap-2">
                                    <FiPhone /> {data.phone}
                                </a>
                            )}
                        </div>

                        <div className="flex gap-3 justify-center">
                            {data.linkedin_url && (
                                <a href={data.linkedin_url} target="_blank" rel="noreferrer" className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-500 hover:text-blue-400 hover:border-blue-400/30 transition-all">
                                    <FiLinkedin className="w-5 h-5" />
                                </a>
                            )}
                            {data.github_url && (
                                <a href={data.github_url} target="_blank" rel="noreferrer" className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-500 hover:text-white hover:border-white/20 transition-all">
                                    <FiGithub className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="mt-20 pt-8 border-t border-white/5 text-gray-600 text-sm">
                        <p>© {new Date().getFullYear()} {data.full_name}. Built with BuildMyPortfolio.</p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default GradientPortfolio;
