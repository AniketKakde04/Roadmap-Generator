import React from 'react';
import { 
  Github, 
  Linkedin, 
  Mail, 
  ExternalLink, 
  Code2, 
  User, 
  Terminal,
  Cpu,
  Globe
} from 'lucide-react';
import { Profile, Project } from '../../types';

interface CyberpunkThemeProps {
  profile: Profile | null;
  projects: Project[];
}

/**
 * CyberpunkTheme Component
 * A high-tech, futuristic portfolio template with neon accents and glassmorphism.
 */
const CyberpunkTheme: React.FC<CyberpunkThemeProps> = ({ profile, projects = [] }) => {
  const neonPrimary = "text-cyan-400";
  const neonSecondary = "text-fuchsia-500";
  const borderPrimary = "border-cyan-500/50";
  const bgGlass = "bg-slate-900/80 backdrop-blur-xl";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-mono selection:bg-fuchsia-500/30 selection:text-fuchsia-200">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Header / Hero */}
      <header className="relative pt-20 pb-16 px-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="relative group">
            <div className={`absolute -inset-1 bg-gradient-to-r from-cyan-500 to-fuchsia-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200`}></div>
            <div className={`relative w-48 h-48 rounded-2xl overflow-hidden border-2 ${borderPrimary} bg-slate-800`}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={64} className={neonPrimary} />
                </div>
              )}
            </div>
          </div>

          <div className="text-center md:text-left space-y-4">
            <div className="inline-block px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-bold tracking-widest uppercase">
              System Status: Active
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-fuchsia-500">
              {profile?.full_name || "Agent Name"}
            </h1>
            <p className={`text-xl md:text-2xl font-medium ${neonPrimary} tracking-tight`}>
              {profile?.headline || "System Architect & Full Stack Operative"}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
              {profile?.github_url && (
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-lg border border-slate-700 hover:${borderPrimary} hover:bg-slate-800 transition-all`}>
                  <Github size={24} />
                </a>
              )}
              {profile?.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-lg border border-slate-700 hover:${borderPrimary} hover:bg-slate-800 transition-all`}>
                  <Linkedin size={24} />
                </a>
              )}
              {profile?.email && (
                <a href={`mailto:${profile?.email}`} className={`p-2 rounded-lg border border-slate-700 hover:${borderPrimary} hover:bg-slate-800 transition-all`}>
                  <Mail size={24} />
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-6 space-y-24 pb-24">
        
        {/* About Section */}
        <section id="about" className={`${bgGlass} border ${borderPrimary} rounded-3xl p-8 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Terminal size={120} />
          </div>
          <div className="flex items-center gap-3 mb-6">
            <Cpu className={neonPrimary} />
            <h2 className="text-2xl font-bold uppercase tracking-widest text-white">Core Information</h2>
          </div>
          <div className="max-w-none">
            <p className="text-slate-300 leading-relaxed text-lg italic border-l-4 border-fuchsia-500 pl-6">
              {profile?.bio || "Decrypting database records... bio information currently restricted."}
            </p>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects">
          <div className="flex items-center gap-3 mb-10">
            <Code2 className={neonSecondary} />
            <h2 className="text-2xl font-bold uppercase tracking-widest text-white">Deployment History</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.length > 0 ? (
              projects.map((project) => (
                <div key={project.id} className={`group relative bg-slate-900 border border-slate-800 hover:${borderPrimary} rounded-2xl overflow-hidden transition-all duration-300`}>
                  <div className="h-48 bg-slate-800 relative overflow-hidden">
                    {project.image_url ? (
                      <img src={project.image_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                        <Terminal size={48} className="text-slate-700" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-60"></div>
                  </div>
                  <div className="p-6">
                    <h3 className={`text-xl font-bold mb-2 group-hover:${neonPrimary} transition-colors text-white`}>{project.title}</h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.tech_stack?.map((tech, i) => (
                        <span key={i} className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-slate-700 text-slate-400">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-4">
                      {project.github_url && (
                        <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white flex items-center gap-1 text-sm transition-colors">
                          <Github size={16} /> Source
                        </a>
                      )}
                      {project.live_url && (
                        <a href={project.live_url} target="_blank" rel="noopener noreferrer" className={`${neonPrimary} hover:text-cyan-300 flex items-center gap-1 text-sm font-bold transition-colors`}>
                          <ExternalLink size={16} /> Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                <p className="text-slate-500">No projects currently deployed to the public network.</p>
              </div>
            )}
          </div>
        </section>

        {/* Contact / Terminal Footer */}
        <section id="contact" className="text-center space-y-8">
          <div className="inline-block px-4 py-2 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-lg text-fuchsia-400 font-bold animate-pulse">
            ESTABLISH CONNECTION
          </div>
          <h2 className="text-4xl font-bold text-white">Ready for the next mission?</h2>
          <div className="flex justify-center gap-8">
            <a 
              href={`mailto:${profile?.email}`}
              className={`group flex items-center gap-3 px-8 py-4 bg-transparent border-2 ${borderPrimary} rounded-xl hover:bg-cyan-500/10 transition-all`}
            >
              <Terminal size={20} className={neonPrimary} />
              <span className="font-bold tracking-widest uppercase text-white">Send Ping</span>
            </a>
          </div>
        </section>
      </main>

      {/* Footer System Info */}
      <footer className="border-t border-slate-900 bg-slate-950/50 py-12 px-6 text-center text-slate-600 text-xs">
        <div className="flex justify-center gap-4 mb-4">
          <span className="flex items-center gap-1"><Globe size={12}/> Global Network</span>
          <span className="flex items-center gap-1"><Cpu size={12}/> Local Processing</span>
        </div>
        <p>&copy; {new Date().getFullYear()} ARCHIVE_V2.5 // ALL RIGHTS RESERVED BY {profile?.full_name?.toUpperCase() || "AGENT"}</p>
      </footer>
    </div>
  );
};

export default CyberpunkTheme;