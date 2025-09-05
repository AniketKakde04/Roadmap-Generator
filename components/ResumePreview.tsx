import React from 'react';
import { ResumeData } from '../types';

interface ResumePreviewProps {
  resumeData: ResumeData | null;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData }) => {
  if (!resumeData) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-400">
        <p>Your resume preview will appear here as you type...</p>
      </div>
    );
  }

  const { fullName, email, phone, linkedin_url, github_url, summary, education, experience, projects, skills } = resumeData;

  return (
    <div className="bg-white text-slate-800 p-8 rounded-lg shadow-lg h-full overflow-auto font-serif text-sm">
      {/* Header */}
      <header className="text-center mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold text-sky-800 tracking-wider">{fullName}</h1>
        <div className="flex justify-center items-center space-x-4 mt-2 text-xs text-slate-600">
          {email && <span>{email}</span>}
          {phone && <span>| {phone}</span>}
          {linkedin_url && <span>| <a href={linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sky-700 hover:underline">LinkedIn</a></span>}
          {github_url && <span>| <a href={github_url} target="_blank" rel="noopener noreferrer" className="text-sky-700 hover:underline">GitHub</a></span>}
        </div>
      </header>

      {/* Summary */}
      {summary && (
        <section className="mb-5">
          <h2 className="text-lg font-bold text-sky-800 border-b-2 border-sky-200 pb-1 mb-2 uppercase tracking-widest">Summary</h2>
          <p className="text-slate-700 leading-relaxed">{summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience?.length > 0 && (
        <section className="mb-5">
          <h2 className="text-lg font-bold text-sky-800 border-b-2 border-sky-200 pb-1 mb-2 uppercase tracking-widest">Experience</h2>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-4">
              <h3 className="font-bold">{exp.title}</h3>
              <div className="flex justify-between text-xs italic text-slate-600">
                <span>{exp.company} | {exp.city}, {exp.state}</span>
                <span>{exp.startDate} - {exp.endDate}</span>
              </div>
              <ul className="list-disc list-inside mt-1 text-slate-700 leading-relaxed">
                {exp.summary.split('\n').map((point, i) => point.trim() && <li key={i}>{point.trim()}</li>)}
              </ul>
            </div>
          ))}
        </section>
      )}
      
      {/* Projects */}
      {projects?.length > 0 && (
        <section className="mb-5">
          <h2 className="text-lg font-bold text-sky-800 border-b-2 border-sky-200 pb-1 mb-2 uppercase tracking-widest">Projects</h2>
          {projects.map((proj) => (
            <div key={proj.id} className="mb-3">
              <h3 className="font-bold">{proj.name}</h3>
              {proj.url && <a href={proj.url} className="text-xs text-sky-700 hover:underline" target="_blank" rel="noopener noreferrer">{proj.url}</a>}
              <p className="text-slate-700 mt-1">{proj.description}</p>
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {education?.length > 0 && (
        <section className="mb-5">
          <h2 className="text-lg font-bold text-sky-800 border-b-2 border-sky-200 pb-1 mb-2 uppercase tracking-widest">Education</h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-3">
              <h3 className="font-bold">{edu.university}</h3>
              <div className="flex justify-between text-xs italic text-slate-600">
                <span>{edu.degree}</span>
                <span>{edu.startDate} - {edu.endDate}</span>
              </div>
              <p className="text-slate-700 mt-1">{edu.description}</p>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {skills?.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-sky-800 border-b-2 border-sky-200 pb-1 mb-2 uppercase tracking-widest">Skills</h2>
          <p className="text-slate-700">
            {skills.map(skill => skill.name).join(', ')}
          </p>
        </section>
      )}
    </div>
  );
};

export default ResumePreview;

